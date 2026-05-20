<script lang="ts">
  import type { CarClassId } from "../lib/types";
  import { carBody, carColor, type BodyShape } from "../lib/carVisuals";

  export let classId: CarClassId;
  /** Slightly smaller treatment when inlined in tight spaces. */
  export let compact = false;

  $: body = carBody(classId);
  $: color = carColor(classId);

  // wheel layout per body: [frontX, rearX, centreY, radius]
  const WHEELS: Record<BodyShape, [number, number, number, number]> = {
    hatch: [62, 168, 101, 20],
    sedan: [64, 178, 101, 20],
    suv: [64, 180, 103, 23],
    coupe: [60, 186, 103, 21],
    convertible: [60, 186, 103, 21],
    van: [60, 190, 105, 22]
  };
  $: [wf, wr, wy, wrad] = WHEELS[body];

  const GLASS = "#e7edf3";
</script>

<svg
  class:compact
  viewBox="0 0 240 132"
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  aria-label="{classId} car illustration"
>
  <ellipse cx="120" cy="125" rx="106" ry="7.5" fill="rgba(0,0,0,0.10)" />

  {#if body === "hatch"}
    <path
      d="M20 101 L20 82 C20 77 23 73 29 71 L60 60 C65 49 73 44 86 42 L150 42 C162 43 170 49 175 63 L189 76 C193 81 193 86 193 92 L193 101 L190 101 A24 24 0 0 0 142 101 L86 101 A24 24 0 0 0 38 101 Z"
      fill={color}
    />
    <path d="M77 59 L89 47 L132 47 L132 59 Z" fill={GLASS} />
    <path d="M138 47 L150 47 L162 60 L138 60 Z" fill={GLASS} />
    <rect x="186" y="74" width="9" height="9" rx="3" fill="#ff5a52" />
    <ellipse cx="24" cy="80" rx="6" ry="5" fill="#fff4cf" />
  {:else if body === "sedan"}
    <path
      d="M16 101 L16 83 C16 78 19 74 25 72 L64 60 C69 49 77 43 90 41 L150 41 C164 42 172 49 180 61 L218 70 C223 72 226 77 226 83 L226 101 L200 101 A24 24 0 0 0 152 101 L88 101 A24 24 0 0 0 40 101 Z"
      fill={color}
    />
    <path d="M80 58 L92 46 L116 46 L116 58 Z" fill={GLASS} />
    <path d="M122 46 L146 46 L158 58 L122 58 Z" fill={GLASS} />
    <rect x="218" y="72" width="9" height="9" rx="3" fill="#ff5a52" />
    <ellipse cx="21" cy="82" rx="6" ry="5" fill="#fff4cf" />
  {:else if body === "suv"}
    <path
      d="M18 103 L18 74 C18 68 22 64 30 62 L60 54 C64 43 72 37 86 35 L156 35 C170 36 179 43 185 56 L220 65 C226 67 230 72 230 79 L230 103 L204 103 A26 26 0 0 0 154 103 L90 103 A26 26 0 0 0 38 103 Z"
      fill={color}
    />
    <rect x="70" y="29" width="92" height="5" rx="2.5" fill={color} />
    <path d="M74 52 L86 40 L116 40 L116 52 Z" fill={GLASS} />
    <path d="M122 40 L152 40 L165 53 L122 53 Z" fill={GLASS} />
    <rect x="221" y="68" width="9" height="10" rx="3" fill="#ff5a52" />
    <ellipse cx="23" cy="72" rx="6" ry="5.5" fill="#fff4cf" />
  {:else if body === "coupe"}
    <path
      d="M14 102 L14 86 C14 80 18 76 26 74 L70 62 C80 49 95 43 114 42 C140 43 160 49 176 62 L212 72 C219 74 223 79 223 86 L223 102 L208 102 A25 25 0 0 0 160 102 L86 102 A25 25 0 0 0 38 102 Z"
      fill={color}
    />
    <path
      d="M84 60 C94 50 108 46 122 46 C142 47 158 52 168 61 Z"
      fill={GLASS}
    />
    <rect x="216" y="74" width="8" height="8" rx="3" fill="#ff5a52" />
    <ellipse cx="19" cy="84" rx="6" ry="5" fill="#fff4cf" />
  {:else if body === "convertible"}
    <path
      d="M14 102 L14 86 C14 80 18 76 26 74 L74 64 L204 64 C214 65 221 70 224 79 L226 86 L226 102 L208 102 A25 25 0 0 0 160 102 L86 102 A25 25 0 0 0 38 102 Z"
      fill={color}
    />
    <path d="M78 64 L92 47 L101 47 L98 64 Z" fill={GLASS} />
    <path
      d="M104 64 C104 58 110 55 122 55 L150 55 C160 55 165 59 165 64 Z"
      fill="rgba(0,0,0,0.22)"
    />
    <rect x="219" y="70" width="8" height="8" rx="3" fill="#ff5a52" />
    <ellipse cx="19" cy="84" rx="6" ry="5" fill="#fff4cf" />
  {:else}
    <!-- van -->
    <path
      d="M18 104 L18 56 C18 47 24 41 35 40 L46 40 L57 30 C60 27 64 26 69 26 L196 26 C209 26 219 34 223 47 L229 72 C231 78 231 84 231 90 L231 104 L210 104 A25 25 0 0 0 162 104 L86 104 A25 25 0 0 0 38 104 Z"
      fill={color}
    />
    <path d="M62 50 L72 33 L120 33 L120 50 Z" fill={GLASS} />
    <rect x="128" y="33" width="46" height="17" rx="2" fill={GLASS} />
    <rect x="222" y="74" width="9" height="11" rx="3" fill="#ff5a52" />
    <ellipse cx="22" cy="64" rx="6" ry="6" fill="#fff4cf" />
  {/if}

  <!-- wheels -->
  {#each [wf, wr] as cx}
    <circle {cx} cy={wy} r={wrad} fill="#27272c" />
    <circle {cx} cy={wy} r={wrad * 0.52} fill="#d3d7de" />
    <circle {cx} cy={wy} r={wrad * 0.17} fill="#9aa0ab" />
  {/each}
</svg>

<style>
  svg {
    display: block;
    width: 100%;
    height: auto;
  }
</style>
