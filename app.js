/* ============================================================
   Sixt Swap — navigation web app
   Vue 3 + Leaflet, no build step.
   ============================================================ */
(function () {
  "use strict";

  const { createApp, ref, reactive, computed, watch, onMounted, nextTick } = Vue;

  // ===== Constants =====
  const NOMINATIM = "https://nominatim.openstreetmap.org/search";
  const OSRM = "https://router.project-osrm.org/route/v1/driving";

  const CAR_CLASSES = [
    { id: "economy",     label: "Economy" },
    { id: "compact",     label: "Compact" },
    { id: "midsize",     label: "Mid-size" },
    { id: "suv",         label: "SUV" },
    { id: "premium",     label: "Premium" },
    { id: "luxury",      label: "Luxury" },
    { id: "sport",       label: "Sport / M-Series" },
    { id: "convertible", label: "Convertible" },
    { id: "electric",    label: "Electric" },
    { id: "van",         label: "Van" }
  ];

  // ===== Geo helpers =====
  function toRad(d) { return d * Math.PI / 180; }
  function haversineKm(a, b) {
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const la1 = toRad(a.lat), la2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  // Equirectangular point-to-segment distance in km. Good enough for <50km segments.
  function pointToSegmentKm(p, a, b) {
    const meanLat = ((a.lat + b.lat) / 2) * Math.PI / 180;
    const kmPerDegLat = 111.0;
    const kmPerDegLng = 111.0 * Math.cos(meanLat);
    const ax = a.lng * kmPerDegLng, ay = a.lat * kmPerDegLat;
    const bx = b.lng * kmPerDegLng, by = b.lat * kmPerDegLat;
    const px = p.lng * kmPerDegLng, py = p.lat * kmPerDegLat;
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) return { dist: Math.hypot(px - ax, py - ay), t: 0, segLen: 0 };
    let t = ((px - ax) * dx + (py - ay) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + t * dx, cy = ay + t * dy;
    return { dist: Math.hypot(px - cx, py - cy), t, segLen: Math.sqrt(len2) };
  }

  // ===== Availability heuristic =====
  function fleetBase(tier) {
    return { XL: 0.85, L: 0.70, M: 0.55, S: 0.38 }[tier] || 0.50;
  }
  function classFactor(station, carClass) {
    const base = fleetBase(station.fleet);
    const p = station.premium ?? 0.5;
    const e = station.electric ?? 0.4;
    switch (carClass) {
      case "economy":     return clamp(base + 0.15, 0, 0.98);
      case "compact":     return clamp(base + 0.10, 0, 0.95);
      case "midsize":     return base;
      case "suv":         return (base + p) / 2;
      case "premium":     return p;
      case "luxury":      return p * 0.88;
      case "sport":       return p * 0.78;
      case "convertible": return p * 0.72;
      case "electric":    return e;
      case "van":         return base * 0.85;
      default:            return base;
    }
  }
  function hoursMultiplier(station) {
    const now = new Date();
    const day = now.getDay();          // 0 Sun … 6 Sat
    const hour = now.getHours();
    const isSunday = day === 0;
    const isSaturday = day === 6;

    const h = station.hours || "";
    if (/24h|24\/7/i.test(h)) return 1.0;

    // Try to parse a closing hour like "08:00–17:00", "07:30–18:00"
    const match = h.match(/(\d{1,2}):?(\d{2})\s*[–\-]\s*(\d{1,2}):?(\d{2})/);
    let openHour = 7, closeHour = 19;
    if (match) {
      openHour = parseInt(match[1], 10);
      closeHour = parseInt(match[3], 10);
    }

    let mult = 1.0;
    if (/Mon[–\-]Fri/i.test(h) && (isSaturday || isSunday)) mult = 0.25;
    else if (/Mon[–\-]Sat/i.test(h) && isSunday) mult = 0.30;

    if (hour < openHour - 1 || hour >= closeHour) mult = Math.min(mult, 0.20);
    else if (hour < openHour || hour >= closeHour - 1) mult = Math.min(mult, 0.65);

    return mult;
  }
  function typeBoost(station) {
    if (station.type === "airport") return 0.08;
    if (station.type === "train") return 0.04;
    return 0;
  }
  function computeScore(station, carClass) {
    const factor = classFactor(station, carClass);
    const boost = typeBoost(station);
    const hours = hoursMultiplier(station);
    return clamp((factor + boost) * hours, 0, 0.98);
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // Estimated detour minutes given off-route distance and the swap process itself
  function estimateDetourMin(distFromRouteKm) {
    // Round-trip detour + counter time. Roads aren't straight (×1.4 fudge),
    // average detour speed 55 km/h, counter swap process ~15 min.
    const driveMin = (distFromRouteKm * 1.4 * 2) / 55 * 60;
    return Math.round(driveMin + 15);
  }

  // ===== App =====
  createApp({
    data() {
      return {
        // location state
        myPos: null,         // { lat, lng, heading?, accuracy? }
        myHeading: null,
        locating: false,
        watchId: null,

        // search
        query: "",
        suggestions: [],
        searchFocused: false,
        searchTimer: null,

        // route
        origin: null,        // { lat, lng } where we picked up the car
        originName: "Current location",
        dest: null,
        destName: "",
        route: null,         // { coordinates, distance, duration }

        // settings
        carClass: "premium",
        carClasses: CAR_CLASSES,

        // stations
        stationsOnRoute: [],
        selectedStation: null,

        // UI
        sheetState: "mid",   // 'collapsed' | 'mid' | 'full'
        navigating: false,
        loading: "",
        installPromptShown: false,

        // internal
        map: null,
        layers: {
          route: null,
          stations: [],
          me: null,
          dest: null,
          origin: null
        }
      };
    },

    mounted() {
      this.initMap();
      this.initLocation();
      this.restorePrefs();

      // collapse sheet when tapping map
      this.map.on("click", () => {
        if (this.searchFocused) this.searchFocused = false;
        if (this.selectedStation) this.selectedStation = null;
      });

      // Long-press on map to set destination
      let pressTimer = null;
      let pressStart = null;
      this.map.on("mousedown", (e) => {
        pressStart = e.latlng;
        pressTimer = setTimeout(() => {
          this.setDestination({ lat: e.latlng.lat, lng: e.latlng.lng }, "Dropped pin");
          pressTimer = null;
        }, 600);
      });
      this.map.on("mouseup", () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } });
      this.map.on("mousemove", () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } });

      // touch equivalents
      this.map.on("touchstart", (e) => {
        if (!e.latlng) return;
        pressTimer = setTimeout(() => {
          this.setDestination({ lat: e.latlng.lat, lng: e.latlng.lng }, "Dropped pin");
          pressTimer = null;
        }, 600);
      });
      this.map.on("touchend touchmove", () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } });

      // close suggestions on outside click
      document.addEventListener("click", (e) => {
        const tb = document.querySelector(".topbar");
        if (tb && !tb.contains(e.target)) this.searchFocused = false;
      });
    },

    watch: {
      carClass() {
        this.persistPrefs();
        if (this.route) this.recomputeStations();
      }
    },

    computed: {
      stationsAll() {
        return window.SIXT_STATIONS || [];
      }
    },

    methods: {
      /* ---------- map / location ---------- */
      initMap() {
        // Apple-Maps-ish tiles: CARTO Voyager (light, clean, with labels & roads)
        this.map = L.map("map", {
          zoomControl: false,
          attributionControl: true,
          tap: true
        }).setView([51.0, 10.0], 5); // central Europe

        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19
        }).addTo(this.map);

        L.control.zoom({ position: "bottomright" }).addTo(this.map);
      },

      initLocation() {
        if (!navigator.geolocation) return;
        // Try a quick fetch on load to center map; user must tap "locate" for tracking
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            this.myPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            this.origin = { ...this.myPos };
            this.originName = "Current location";
            this.drawMe();
            this.map.setView([this.myPos.lat, this.myPos.lng], 12, { animate: true });
          },
          () => { /* user denied or unavailable — silent */ },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
        );
      },

      centerOnMe() {
        if (!navigator.geolocation) {
          this.toast("Geolocation not available on this browser");
          return;
        }
        this.locating = true;
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            this.locating = false;
            this.myPos = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy
            };
            this.myHeading = pos.coords.heading;
            this.origin = { lat: this.myPos.lat, lng: this.myPos.lng };
            this.originName = "Current location";
            this.drawMe();
            this.map.setView([this.myPos.lat, this.myPos.lng], 14, { animate: true });
            if (this.dest) this.computeRoute();
          },
          (err) => {
            this.locating = false;
            this.toast("Could not get location: " + err.message);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      },

      drawMe() {
        if (!this.myPos) return;
        const html = `<div class="me-marker${this.myHeading != null ? ' heading' : ''}"
                           style="${this.myHeading != null ? 'transform: rotate(' + this.myHeading + 'deg);' : ''}"></div>`;
        const icon = L.divIcon({
          className: "me-icon-wrap",
          html,
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        });
        if (this.layers.me) this.layers.me.remove();
        this.layers.me = L.marker([this.myPos.lat, this.myPos.lng], { icon, zIndexOffset: 1000 }).addTo(this.map);
      },

      /* ---------- search ---------- */
      onQuery() {
        clearTimeout(this.searchTimer);
        const q = this.query.trim();
        if (q.length < 2) { this.suggestions = []; return; }
        this.searchTimer = setTimeout(() => this.geocode(q), 250);
      },
      clearQuery() {
        this.query = "";
        this.suggestions = [];
      },
      async geocode(q) {
        try {
          const params = new URLSearchParams({
            q, format: "json", addressdetails: "1", limit: "6"
          });
          // Bias toward user's location if known
          if (this.myPos) {
            const d = 1.0; // ~110km box
            params.set("viewbox",
              `${this.myPos.lng - d},${this.myPos.lat + d},${this.myPos.lng + d},${this.myPos.lat - d}`);
            params.set("bounded", "0");
          }
          const r = await fetch(`${NOMINATIM}?${params}`, {
            headers: { "Accept-Language": navigator.language || "en" }
          });
          if (!r.ok) throw new Error("geocode failed");
          const data = await r.json();
          this.suggestions = data.map(d => ({
            place_id: d.place_id,
            lat: parseFloat(d.lat),
            lng: parseFloat(d.lon),
            shortName: shortLabel(d),
            fullName: d.display_name
          }));
        } catch (e) {
          console.warn(e);
          this.suggestions = [];
        }
      },
      onEnter() {
        if (this.suggestions.length) this.pickSuggestion(this.suggestions[0]);
      },
      pickSuggestion(s) {
        this.query = s.shortName;
        this.suggestions = [];
        this.searchFocused = false;
        this.setDestination({ lat: s.lat, lng: s.lng }, s.shortName);
      },

      /* ---------- destination & route ---------- */
      setDestination(latlng, label) {
        this.dest = latlng;
        this.destName = label || "Destination";
        if (this.layers.dest) this.layers.dest.remove();
        this.layers.dest = L.marker([latlng.lat, latlng.lng], {
          icon: L.divIcon({
            className: "dest-icon-wrap",
            html: `<div style="width:28px;height:28px;background:var(--red);border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
            iconSize: [28, 28], iconAnchor: [14, 14]
          })
        }).addTo(this.map);

        if (!this.origin) {
          // No location yet — origin will be set when user locates
          this.toast("Tap the locate button to set your start");
          return;
        }
        this.computeRoute();
      },

      async computeRoute() {
        if (!this.origin || !this.dest) return;
        this.loading = "Calculating route…";
        try {
          const url = `${OSRM}/${this.origin.lng},${this.origin.lat};${this.dest.lng},${this.dest.lat}`
                    + `?overview=full&geometries=geojson&steps=false&alternatives=false`;
          const r = await fetch(url);
          if (!r.ok) throw new Error("Routing failed (" + r.status + ")");
          const data = await r.json();
          if (!data.routes || !data.routes.length) throw new Error("No route");
          const rt = data.routes[0];
          this.route = {
            coordinates: rt.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] })),
            distance: rt.distance,  // meters
            duration: rt.duration   // seconds
          };
          this.drawRoute();
          this.recomputeStations();
          this.fitRoute();
          this.sheetState = "mid";
        } catch (e) {
          this.toast("Could not compute route: " + e.message);
        } finally {
          this.loading = "";
        }
      },

      drawRoute() {
        if (this.layers.route) this.layers.route.remove();
        const latlngs = this.route.coordinates.map(c => [c.lat, c.lng]);
        this.layers.route = L.polyline(latlngs, {
          color: "#007aff",
          weight: 6,
          opacity: 0.85,
          lineCap: "round",
          lineJoin: "round"
        }).addTo(this.map);
      },

      fitRoute() {
        if (!this.route) return;
        const bounds = this.layers.route.getBounds().pad(0.18);
        this.map.fitBounds(bounds, { paddingBottomRight: [20, 340], paddingTopLeft: [20, 100] });
      },

      /* ---------- station filtering & scoring ---------- */
      recomputeStations() {
        // Clear existing station markers
        this.layers.stations.forEach(m => m.remove());
        this.layers.stations = [];
        this.stationsOnRoute = [];

        if (!this.route) return;
        const coords = this.route.coordinates;
        const routeKm = this.route.distance / 1000;
        // adaptive corridor: at least 2km, up to 8km wide for long routes
        const corridorKm = clamp(routeKm / 60, 2, 8);

        // Pre-compute cumulative distances along route segments
        const cumKm = [0];
        for (let i = 1; i < coords.length; i++) {
          cumKm.push(cumKm[i - 1] + haversineKm(coords[i - 1], coords[i]));
        }

        const results = [];
        for (const s of this.stationsAll) {
          let minDist = Infinity;
          let progressKm = 0;
          for (let i = 0; i < coords.length - 1; i++) {
            // quick reject: if station is more than ~50km from segment midpoint, skip
            // (avoids running pointToSegment on far-away stations)
            const seg = pointToSegmentKm(s, coords[i], coords[i + 1]);
            if (seg.dist < minDist) {
              minDist = seg.dist;
              progressKm = cumKm[i] + seg.t * seg.segLen;
            }
            if (minDist < 0.1) break;
          }
          if (minDist <= corridorKm) {
            const score = computeScore(s, this.carClass);
            results.push({
              ...s,
              fromRouteKm: minDist,
              distFromStartKm: progressKm,
              detourMin: estimateDetourMin(minDist),
              score
            });
          }
        }

        results.sort((a, b) => a.distFromStartKm - b.distFromStartKm);
        this.stationsOnRoute = results;
        this.drawStationMarkers();
      },

      drawStationMarkers() {
        for (const s of this.stationsOnRoute) {
          const cls = this.verdict(s.score);
          const label = Math.round(s.score * 100);
          const icon = L.divIcon({
            className: "station-icon-wrap",
            html: `<div class="station-pin ${cls}"><div class="lbl">${label}</div></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30]
          });
          const m = L.marker([s.lat, s.lng], { icon }).addTo(this.map);
          m.on("click", () => this.selectStation(s));
          this.layers.stations.push(m);
        }
      },

      selectStation(s) {
        this.selectedStation = s;
        this.sheetState = "collapsed";
        this.map.flyTo([s.lat, s.lng], 13, { duration: 0.6 });
      },

      async routeVia(s) {
        if (!this.origin || !this.dest) return;
        this.loading = "Re-routing via " + s.name + "…";
        try {
          const wp = `${this.origin.lng},${this.origin.lat};${s.lng},${s.lat};${this.dest.lng},${this.dest.lat}`;
          const url = `${OSRM}/${wp}?overview=full&geometries=geojson&steps=false`;
          const r = await fetch(url);
          if (!r.ok) throw new Error("Routing failed");
          const data = await r.json();
          const rt = data.routes[0];
          this.route = {
            coordinates: rt.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] })),
            distance: rt.distance,
            duration: rt.duration
          };
          this.drawRoute();
          this.recomputeStations();
          this.selectedStation = null;
          this.fitRoute();
          this.toast("Route now goes via " + s.name);
        } catch (e) {
          this.toast("Could not re-route: " + e.message);
        } finally {
          this.loading = "";
        }
      },

      openInMaps(s) {
        // Apple Maps deep-link works on iOS; falls back to https web view elsewhere
        const ua = navigator.userAgent;
        let url;
        if (/iPad|iPhone|iPod|Mac/.test(ua)) {
          url = `https://maps.apple.com/?daddr=${s.lat},${s.lng}&q=${encodeURIComponent(s.name)}`;
        } else {
          url = `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`;
        }
        window.open(url, "_blank");
      },

      /* ---------- navigation mode ---------- */
      startNavigation() {
        if (!this.route) return;
        this.navigating = true;
        this.sheetState = "collapsed";

        if (!navigator.geolocation) return;
        this.watchId = navigator.geolocation.watchPosition(
          (pos) => {
            this.myPos = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy
            };
            this.myHeading = pos.coords.heading;
            this.drawMe();
            this.map.panTo([this.myPos.lat, this.myPos.lng], { animate: true });
          },
          (err) => console.warn("watchPosition error:", err),
          { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
        );

        if (this.myPos) this.map.setView([this.myPos.lat, this.myPos.lng], 16);

        // keep screen awake (only works on iOS 16.4+ / Chrome / Edge)
        this.requestWakeLock();
      },
      stopNavigation() {
        this.navigating = false;
        this.sheetState = "mid";
        if (this.watchId != null) {
          navigator.geolocation.clearWatch(this.watchId);
          this.watchId = null;
        }
        this.releaseWakeLock();
      },
      async requestWakeLock() {
        try {
          if ("wakeLock" in navigator) {
            this._wakeLock = await navigator.wakeLock.request("screen");
          }
        } catch (e) { /* ignore */ }
      },
      releaseWakeLock() {
        if (this._wakeLock) { this._wakeLock.release(); this._wakeLock = null; }
      },

      /* ---------- UI helpers ---------- */
      verdict(score) {
        if (score >= 0.65) return "ok";
        if (score >= 0.35) return "mid";
        return "no";
      },
      verdictTitle(score) {
        if (score >= 0.65) return "Recommended — good odds";
        if (score >= 0.35) return "Possible — call ahead";
        return "Long shot — skip unless confirmed";
      },
      verdictText(s) {
        const pct = Math.round(s.score * 100);
        const carName = (this.carClasses.find(c => c.id === this.carClass) || {}).label || "this class";
        if (s.score >= 0.65) {
          return `~${pct}% chance of finding a ${carName} here based on fleet size and branch type. Worth the ${s.detourMin}-minute detour.`;
        }
        if (s.score >= 0.35) {
          return `~${pct}% chance — branch may not stock ${carName} regularly. Phone ahead before detouring ${s.detourMin} min.`;
        }
        return `~${pct}% chance — small or off-hours branch unlikely to have ${carName}. Skip unless you've confirmed.`;
      },
      formatKm(m) {
        if (m < 1000) return Math.round(m) + " m";
        if (m < 10000) return (m / 1000).toFixed(1) + " km";
        return Math.round(m / 1000) + " km";
      },
      formatDuration(sec) {
        const h = Math.floor(sec / 3600);
        const m = Math.round((sec % 3600) / 60);
        if (h) return `${h}h ${m}m`;
        return `${m} min`;
      },

      /* ---------- bottom sheet handle ---------- */
      cycleSheet() {
        if (this.sheetState === "collapsed") this.sheetState = "mid";
        else if (this.sheetState === "mid") this.sheetState = "full";
        else this.sheetState = "collapsed";
      },
      onHandleDown(e) {
        // Simple swipe detection
        const startY = e.clientY;
        const startState = this.sheetState;
        let moved = 0;
        const onMove = (ev) => { moved = ev.clientY - startY; };
        const onUp = () => {
          document.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerup", onUp);
          document.removeEventListener("pointercancel", onUp);
          if (Math.abs(moved) < 12) { this.cycleSheet(); return; }
          if (moved < -50) {
            // dragged up
            this.sheetState = startState === "collapsed" ? "mid" : "full";
          } else if (moved > 50) {
            this.sheetState = startState === "full" ? "mid" : "collapsed";
          }
        };
        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", onUp);
        document.addEventListener("pointercancel", onUp);
      },

      /* ---------- toast ---------- */
      toast(msg) {
        this.loading = msg;
        clearTimeout(this._toastT);
        this._toastT = setTimeout(() => { if (this.loading === msg) this.loading = ""; }, 2600);
      },

      /* ---------- prefs ---------- */
      persistPrefs() {
        try {
          localStorage.setItem("sixt-swap-prefs", JSON.stringify({ carClass: this.carClass }));
        } catch (e) { /* private mode */ }
      },
      restorePrefs() {
        try {
          const raw = localStorage.getItem("sixt-swap-prefs");
          if (raw) {
            const p = JSON.parse(raw);
            if (p.carClass) this.carClass = p.carClass;
          }
        } catch (e) { /* ignore */ }
      }
    }
  }).mount("#app");

  // ===== helpers =====
  function shortLabel(d) {
    const a = d.address || {};
    const name = d.namedetails?.name
              || a.attraction
              || a.tourism
              || a.amenity
              || a.shop
              || a.building
              || (d.display_name || "").split(",")[0];
    const city = a.city || a.town || a.village || a.municipality || a.county || "";
    return city && name && !name.includes(city) ? `${name}, ${city}` : (name || d.display_name);
  }
})();

// Register service worker for PWA offline-ish support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => { /* ignore */ });
  });
}
