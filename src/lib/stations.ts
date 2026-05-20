import type { Station } from "./types";

// Curated Sixt station dataset (~150 stations).
// "premium" / "electric" are 0–1 weights feeding the availability heuristic.
// Sixt has no public availability API — these are educated estimates.

export const STATIONS: Station[] = [
  // ===== GERMANY — Airports =====
  { id: "fra-airport", name: "SIXT Frankfurt Airport", addr: "Hugo-Eckener-Ring, 60549 Frankfurt am Main", lat: 50.0379, lng: 8.5622, country: "DE", type: "airport", fleet: "XL", premium: 0.85, electric: 0.7, hours: "Daily 05:00–23:30" },
  { id: "muc-airport", name: "SIXT Munich Airport", addr: "Nordallee 25, 85356 München-Flughafen", lat: 48.3537, lng: 11.7860, country: "DE", type: "airport", fleet: "XL", premium: 0.9, electric: 0.75, hours: "Daily 05:00–24:00" },
  { id: "ber-airport", name: "SIXT Berlin Brandenburg Airport", addr: "Willy-Brandt-Platz, 12529 Schönefeld", lat: 52.3667, lng: 13.5033, country: "DE", type: "airport", fleet: "XL", premium: 0.85, electric: 0.75, hours: "Daily 06:00–23:00" },
  { id: "dus-airport", name: "SIXT Düsseldorf Airport", addr: "Flughafenstr. 120, 40474 Düsseldorf", lat: 51.2780, lng: 6.7570, country: "DE", type: "airport", fleet: "XL", premium: 0.85, electric: 0.7, hours: "Daily 06:00–23:00" },
  { id: "ham-airport", name: "SIXT Hamburg Airport", addr: "Flughafenstr. 1, 22335 Hamburg", lat: 53.6308, lng: 10.0062, country: "DE", type: "airport", fleet: "XL", premium: 0.85, electric: 0.7, hours: "Daily 06:00–23:00" },
  { id: "stuttgart-airport", name: "SIXT Stuttgart Airport", addr: "Flughafenstr. 30, 70629 Stuttgart", lat: 48.6907, lng: 9.2218, country: "DE", type: "airport", fleet: "XL", premium: 0.85, electric: 0.7, hours: "Daily 06:00–23:00" },
  { id: "cgn-airport", name: "SIXT Cologne/Bonn Airport", addr: "Kennedystr., 51147 Köln", lat: 50.8753, lng: 7.1372, country: "DE", type: "airport", fleet: "L", premium: 0.7, electric: 0.6, hours: "Daily 06:00–23:00" },
  { id: "nue-airport", name: "SIXT Nuremberg Airport", addr: "Flughafenstr. 100, 90411 Nürnberg", lat: 49.4934, lng: 11.0760, country: "DE", type: "airport", fleet: "L", premium: 0.7, electric: 0.55, hours: "Daily 06:00–23:00" },
  { id: "han-airport", name: "SIXT Hannover Airport", addr: "Flughafenstr. 4, 30855 Langenhagen", lat: 52.4611, lng: 9.6850, country: "DE", type: "airport", fleet: "L", premium: 0.65, electric: 0.55, hours: "Daily 06:00–23:00" },
  { id: "lej-airport", name: "SIXT Leipzig/Halle Airport", addr: "Terminalring 11, 04435 Schkeuditz", lat: 51.4324, lng: 12.2416, country: "DE", type: "airport", fleet: "M", premium: 0.55, electric: 0.45, hours: "Daily 06:00–22:00" },
  { id: "drs-airport", name: "SIXT Dresden Airport", addr: "Flughafenstr., 01109 Dresden", lat: 51.1280, lng: 13.7700, country: "DE", type: "airport", fleet: "M", premium: 0.5, electric: 0.4, hours: "Daily 06:00–22:00" },
  { id: "bre-airport", name: "SIXT Bremen Airport", addr: "Flughafenallee 20, 28199 Bremen", lat: 53.0475, lng: 8.7867, country: "DE", type: "airport", fleet: "M", premium: 0.5, electric: 0.45, hours: "Daily 06:00–22:00" },
  { id: "fmm-airport", name: "SIXT Memmingen Airport", addr: "Allgäuer Str. 2, 87766 Memmingerberg", lat: 47.9888, lng: 10.2395, country: "DE", type: "airport", fleet: "S", premium: 0.35, electric: 0.3, hours: "Daily 06:00–22:00" },

  // ===== GERMANY — Berlin =====
  { id: "berlin-mitte", name: "SIXT Berlin Mitte", addr: "Friedrichstr. 100, 10117 Berlin", lat: 52.5189, lng: 13.3884, country: "DE", type: "city", fleet: "L", premium: 0.75, electric: 0.7, hours: "Mon–Sun 07:00–21:00" },
  { id: "berlin-charlottenburg", name: "SIXT Berlin Charlottenburg", addr: "Leibnizstr. 95, 10625 Berlin", lat: 52.5076, lng: 13.3120, country: "DE", type: "city", fleet: "L", premium: 0.75, electric: 0.7, hours: "Mon–Sat 07:00–20:00" },
  { id: "berlin-prenzlauer", name: "SIXT Berlin Prenzlauer Berg", addr: "Storkower Str. 132, 10407 Berlin", lat: 52.5310, lng: 13.4582, country: "DE", type: "suburb", fleet: "M", premium: 0.5, electric: 0.55, hours: "Mon–Fri 07:00–18:00" },
  { id: "berlin-tempelhof", name: "SIXT Berlin Tempelhof", addr: "Tempelhofer Damm 1, 12101 Berlin", lat: 52.4732, lng: 13.3858, country: "DE", type: "suburb", fleet: "M", premium: 0.5, electric: 0.5, hours: "Mon–Fri 07:00–18:00" },
  { id: "berlin-hbf", name: "SIXT Berlin Hauptbahnhof", addr: "Europaplatz 1, 10557 Berlin", lat: 52.5251, lng: 13.3694, country: "DE", type: "train", fleet: "L", premium: 0.7, electric: 0.65, hours: "Daily 07:00–22:00" },

  // ===== GERMANY — Hamburg =====
  { id: "hamburg-city", name: "SIXT Hamburg City Hauptbahnhof", addr: "Kirchenallee 34-36, 20099 Hamburg", lat: 53.5538, lng: 10.0070, country: "DE", type: "train", fleet: "L", premium: 0.7, electric: 0.65, hours: "Daily 07:00–22:00" },
  { id: "hamburg-altona", name: "SIXT Hamburg Altona", addr: "Stresemannstr. 374, 22761 Hamburg", lat: 53.5675, lng: 9.9319, country: "DE", type: "city", fleet: "M", premium: 0.55, electric: 0.55, hours: "Mon–Fri 07:00–18:00" },
  { id: "hamburg-stellingen", name: "SIXT Hamburg Stellingen", addr: "Kieler Str. 333, 22525 Hamburg", lat: 53.5894, lng: 9.9268, country: "DE", type: "suburb", fleet: "M", premium: 0.5, electric: 0.45, hours: "Mon–Fri 07:30–18:00" },

  // ===== GERMANY — Munich =====
  { id: "munich-zentrale", name: "SIXT München Zentrale", addr: "Zugspitzstr. 1, 82049 Pullach", lat: 48.0588, lng: 11.5193, country: "DE", type: "city", fleet: "XL", premium: 0.9, electric: 0.8, hours: "Mon–Fri 07:00–19:00" },
  { id: "munich-hbf", name: "SIXT München Hauptbahnhof", addr: "Seidlstr. 30, 80335 München", lat: 48.1432, lng: 11.5587, country: "DE", type: "train", fleet: "L", premium: 0.75, electric: 0.7, hours: "Daily 07:00–22:00" },
  { id: "munich-schwabing", name: "SIXT München Schwabing", addr: "Schenkendorfstr. 6, 80807 München", lat: 48.1773, lng: 11.5870, country: "DE", type: "city", fleet: "L", premium: 0.7, electric: 0.65, hours: "Mon–Sat 07:00–19:00" },

  // ===== GERMANY — Frankfurt =====
  { id: "frankfurt-hbf", name: "SIXT Frankfurt Hauptbahnhof", addr: "Mannheimer Str. 17, 60329 Frankfurt", lat: 50.1067, lng: 8.6669, country: "DE", type: "train", fleet: "L", premium: 0.75, electric: 0.7, hours: "Daily 07:00–22:00" },
  { id: "frankfurt-messe", name: "SIXT Frankfurt Messe", addr: "Mainzer Landstr. 209, 60326 Frankfurt", lat: 50.1130, lng: 8.6483, country: "DE", type: "city", fleet: "L", premium: 0.75, electric: 0.7, hours: "Mon–Fri 07:00–19:00" },
  { id: "frankfurt-eschborn", name: "SIXT Eschborn", addr: "Mergenthalerallee 73, 65760 Eschborn", lat: 50.1370, lng: 8.5710, country: "DE", type: "suburb", fleet: "M", premium: 0.55, electric: 0.5, hours: "Mon–Fri 07:00–18:00" },

  // ===== GERMANY — Düsseldorf / Köln =====
  { id: "duesseldorf-hbf", name: "SIXT Düsseldorf Hauptbahnhof", addr: "Konrad-Adenauer-Platz 14, 40210 Düsseldorf", lat: 51.2202, lng: 6.7943, country: "DE", type: "train", fleet: "L", premium: 0.75, electric: 0.7, hours: "Daily 07:00–22:00" },
  { id: "duesseldorf-messe", name: "SIXT Düsseldorf Messe", addr: "Theodor-Heuss-Brücke, 40474 Düsseldorf", lat: 51.2620, lng: 6.7340, country: "DE", type: "city", fleet: "M", premium: 0.6, electric: 0.55, hours: "Mon–Fri 07:00–18:00" },
  { id: "koeln-hbf", name: "SIXT Köln Hauptbahnhof", addr: "Trankgasse 11, 50667 Köln", lat: 50.9425, lng: 6.9582, country: "DE", type: "train", fleet: "L", premium: 0.7, electric: 0.65, hours: "Daily 07:00–22:00" },
  { id: "koeln-deutz", name: "SIXT Köln Deutz", addr: "Deutz-Kalker Str. 95, 51103 Köln", lat: 50.9410, lng: 6.9759, country: "DE", type: "city", fleet: "M", premium: 0.55, electric: 0.55, hours: "Mon–Fri 07:00–18:00" },

  // ===== GERMANY — Stuttgart / Mannheim / Karlsruhe =====
  { id: "stuttgart-hbf", name: "SIXT Stuttgart Hauptbahnhof", addr: "Lautenschlagerstr. 14, 70173 Stuttgart", lat: 48.7838, lng: 9.1810, country: "DE", type: "train", fleet: "L", premium: 0.7, electric: 0.65, hours: "Daily 07:00–22:00" },
  { id: "stuttgart-vaihingen", name: "SIXT Stuttgart Vaihingen", addr: "Vaihinger Str. 49, 70567 Stuttgart", lat: 48.7311, lng: 9.1142, country: "DE", type: "suburb", fleet: "M", premium: 0.55, electric: 0.5, hours: "Mon–Fri 07:00–18:00" },
  { id: "mannheim", name: "SIXT Mannheim Hauptbahnhof", addr: "Tattersallstr. 19, 68165 Mannheim", lat: 49.4790, lng: 8.4720, country: "DE", type: "train", fleet: "M", premium: 0.55, electric: 0.5, hours: "Mon–Sat 07:00–19:00" },
  { id: "karlsruhe", name: "SIXT Karlsruhe Hauptbahnhof", addr: "Bahnhofplatz 6, 76137 Karlsruhe", lat: 48.9930, lng: 8.4030, country: "DE", type: "train", fleet: "M", premium: 0.55, electric: 0.5, hours: "Mon–Sat 07:00–19:00" },
  { id: "heidelberg", name: "SIXT Heidelberg", addr: "Czernyring 12, 69115 Heidelberg", lat: 49.4040, lng: 8.6750, country: "DE", type: "city", fleet: "M", premium: 0.5, electric: 0.5, hours: "Mon–Fri 07:00–18:00" },
  { id: "ulm", name: "SIXT Ulm", addr: "Friedrich-Ebert-Str. 5, 89073 Ulm", lat: 48.4000, lng: 9.9810, country: "DE", type: "city", fleet: "M", premium: 0.45, electric: 0.4, hours: "Mon–Fri 07:30–18:00" },

  // ===== GERMANY — North =====
  { id: "kiel", name: "SIXT Kiel", addr: "Theodor-Heuss-Ring 87, 24114 Kiel", lat: 54.3120, lng: 10.1320, country: "DE", type: "city", fleet: "M", premium: 0.45, electric: 0.4, hours: "Mon–Fri 07:30–18:00" },
  { id: "flensburg", name: "SIXT Flensburg", addr: "Lilienthalstr. 1, 24941 Flensburg", lat: 54.7710, lng: 9.4360, country: "DE", type: "city", fleet: "S", premium: 0.3, electric: 0.3, hours: "Mon–Fri 08:00–17:00" },
  { id: "husum", name: "SIXT Husum", addr: "Schleswiger Chaussee 96, 25813 Husum", lat: 54.4829, lng: 9.0822, country: "DE", type: "rural", fleet: "S", premium: 0.2, electric: 0.2, hours: "Mon–Fri 08:00–17:00" },
  { id: "buedelsdorf", name: "SIXT Büdelsdorf (Rendsburg)", addr: "Hollerstr. 78, 24782 Büdelsdorf", lat: 54.3155, lng: 9.6790, country: "DE", type: "rural", fleet: "S", premium: 0.2, electric: 0.25, hours: "Mon–Fri 08:00–17:00" },
  { id: "neumuenster", name: "SIXT Neumünster", addr: "Kieler Str. 31, 24534 Neumünster", lat: 54.0772, lng: 9.9831, country: "DE", type: "city", fleet: "M", premium: 0.35, electric: 0.3, hours: "Mon–Fri 07:30–18:00" },
  { id: "luebeck", name: "SIXT Lübeck", addr: "Hansestr. 7, 23558 Lübeck", lat: 53.8654, lng: 10.6726, country: "DE", type: "city", fleet: "M", premium: 0.45, electric: 0.4, hours: "Mon–Fri 07:30–18:00" },
  { id: "rostock", name: "SIXT Rostock", addr: "Tessiner Str. 8, 18055 Rostock", lat: 54.0825, lng: 12.1450, country: "DE", type: "city", fleet: "M", premium: 0.4, electric: 0.4, hours: "Mon–Fri 07:30–18:00" },
  { id: "schwerin", name: "SIXT Schwerin", addr: "Werkstr. 711, 19061 Schwerin", lat: 53.6020, lng: 11.4060, country: "DE", type: "city", fleet: "S", premium: 0.3, electric: 0.3, hours: "Mon–Fri 08:00–17:00" },
  { id: "bremen-city", name: "SIXT Bremen City", addr: "August-Bebel-Allee 1, 28329 Bremen", lat: 53.0710, lng: 8.8530, country: "DE", type: "city", fleet: "M", premium: 0.45, electric: 0.4, hours: "Mon–Fri 07:30–18:00" },
  { id: "oldenburg", name: "SIXT Oldenburg", addr: "Bremer Heerstr. 16, 26135 Oldenburg", lat: 53.1360, lng: 8.2400, country: "DE", type: "city", fleet: "S", premium: 0.35, electric: 0.3, hours: "Mon–Fri 08:00–17:00" },

  // ===== GERMANY — Ruhr area =====
  { id: "dortmund", name: "SIXT Dortmund Hauptbahnhof", addr: "Königswall 15, 44137 Dortmund", lat: 51.5180, lng: 7.4590, country: "DE", type: "train", fleet: "M", premium: 0.55, electric: 0.5, hours: "Mon–Sat 07:00–19:00" },
  { id: "essen", name: "SIXT Essen Hauptbahnhof", addr: "Hachestr. 56, 45127 Essen", lat: 51.4525, lng: 7.0167, country: "DE", type: "train", fleet: "M", premium: 0.55, electric: 0.5, hours: "Mon–Sat 07:00–19:00" },
  { id: "duisburg", name: "SIXT Duisburg", addr: "Mercatorstr. 7, 47051 Duisburg", lat: 51.4310, lng: 6.7720, country: "DE", type: "city", fleet: "M", premium: 0.5, electric: 0.45, hours: "Mon–Fri 07:30–18:00" },
  { id: "bochum", name: "SIXT Bochum", addr: "Universitätsstr. 60, 44789 Bochum", lat: 51.4760, lng: 7.2300, country: "DE", type: "city", fleet: "M", premium: 0.45, electric: 0.4, hours: "Mon–Fri 07:30–18:00" },

  // ===== GERMANY — Other =====
  { id: "hannover-hbf", name: "SIXT Hannover Hauptbahnhof", addr: "Joachimstr. 1, 30159 Hannover", lat: 52.3770, lng: 9.7410, country: "DE", type: "train", fleet: "L", premium: 0.65, electric: 0.6, hours: "Daily 07:00–22:00" },
  { id: "braunschweig", name: "SIXT Braunschweig", addr: "Hamburger Str. 269, 38114 Braunschweig", lat: 52.2820, lng: 10.5180, country: "DE", type: "city", fleet: "M", premium: 0.45, electric: 0.4, hours: "Mon–Fri 07:30–18:00" },
  { id: "goettingen", name: "SIXT Göttingen", addr: "Bahnhofsallee 1c, 37081 Göttingen", lat: 51.5350, lng: 9.9270, country: "DE", type: "train", fleet: "S", premium: 0.4, electric: 0.4, hours: "Mon–Fri 08:00–18:00" },
  { id: "kassel", name: "SIXT Kassel", addr: "Wilhelmshöher Allee 251, 34131 Kassel", lat: 51.3030, lng: 9.4540, country: "DE", type: "city", fleet: "M", premium: 0.4, electric: 0.4, hours: "Mon–Fri 07:30–18:00" },
  { id: "leipzig-city", name: "SIXT Leipzig City", addr: "Tröndlinring 8, 04105 Leipzig", lat: 51.3460, lng: 12.3700, country: "DE", type: "city", fleet: "L", premium: 0.6, electric: 0.55, hours: "Mon–Sat 07:00–19:00" },
  { id: "dresden-city", name: "SIXT Dresden Hauptbahnhof", addr: "Wiener Platz 4, 01069 Dresden", lat: 51.0410, lng: 13.7330, country: "DE", type: "train", fleet: "M", premium: 0.55, electric: 0.5, hours: "Mon–Sat 07:00–19:00" },
  { id: "erfurt", name: "SIXT Erfurt", addr: "Bahnhofstr. 17, 99084 Erfurt", lat: 50.9720, lng: 11.0380, country: "DE", type: "train", fleet: "M", premium: 0.45, electric: 0.4, hours: "Mon–Fri 07:30–18:00" },
  { id: "nuernberg-city", name: "SIXT Nürnberg City", addr: "Allersberger Str. 31, 90461 Nürnberg", lat: 49.4350, lng: 11.0930, country: "DE", type: "city", fleet: "M", premium: 0.55, electric: 0.5, hours: "Mon–Sat 07:00–19:00" },
  { id: "wuerzburg", name: "SIXT Würzburg", addr: "Stuttgarter Str. 19, 97082 Würzburg", lat: 49.7900, lng: 9.9180, country: "DE", type: "city", fleet: "M", premium: 0.45, electric: 0.4, hours: "Mon–Fri 07:30–18:00" },
  { id: "augsburg", name: "SIXT Augsburg", addr: "Eichleitnerstr. 30, 86167 Augsburg", lat: 48.3850, lng: 10.9450, country: "DE", type: "city", fleet: "M", premium: 0.5, electric: 0.45, hours: "Mon–Fri 07:30–18:00" },
  { id: "regensburg", name: "SIXT Regensburg", addr: "Friedenstr. 30, 93053 Regensburg", lat: 49.0050, lng: 12.1100, country: "DE", type: "city", fleet: "M", premium: 0.45, electric: 0.4, hours: "Mon–Fri 07:30–18:00" },
  { id: "ingolstadt", name: "SIXT Ingolstadt", addr: "Manchinger Str. 50, 85053 Ingolstadt", lat: 48.7430, lng: 11.4640, country: "DE", type: "city", fleet: "M", premium: 0.5, electric: 0.55, hours: "Mon–Fri 07:30–18:00" },
  { id: "freiburg", name: "SIXT Freiburg", addr: "St.-Georgener-Str. 1, 79111 Freiburg", lat: 47.9870, lng: 7.8210, country: "DE", type: "city", fleet: "M", premium: 0.5, electric: 0.5, hours: "Mon–Fri 07:30–18:00" },
  { id: "bonn", name: "SIXT Bonn", addr: "Adenauerallee 137, 53113 Bonn", lat: 50.7180, lng: 7.1180, country: "DE", type: "city", fleet: "M", premium: 0.55, electric: 0.5, hours: "Mon–Fri 07:30–18:00" },
  { id: "aachen", name: "SIXT Aachen", addr: "Krefelder Str. 195, 52070 Aachen", lat: 50.7900, lng: 6.1080, country: "DE", type: "city", fleet: "M", premium: 0.45, electric: 0.45, hours: "Mon–Fri 07:30–18:00" },
  { id: "muenster", name: "SIXT Münster", addr: "Albersloher Weg 24, 48155 Münster", lat: 51.9430, lng: 7.6420, country: "DE", type: "city", fleet: "M", premium: 0.45, electric: 0.4, hours: "Mon–Fri 07:30–18:00" },
  { id: "osnabrueck", name: "SIXT Osnabrück", addr: "Hannoversche Str. 78, 49084 Osnabrück", lat: 52.2680, lng: 8.0700, country: "DE", type: "city", fleet: "M", premium: 0.4, electric: 0.4, hours: "Mon–Fri 07:30–18:00" },
  { id: "bielefeld", name: "SIXT Bielefeld", addr: "Herforder Str. 73, 33602 Bielefeld", lat: 52.0290, lng: 8.5350, country: "DE", type: "city", fleet: "M", premium: 0.45, electric: 0.4, hours: "Mon–Fri 07:30–18:00" },
  { id: "magdeburg", name: "SIXT Magdeburg", addr: "Werner-Heisenberg-Str. 3, 39106 Magdeburg", lat: 52.1380, lng: 11.6100, country: "DE", type: "city", fleet: "M", premium: 0.4, electric: 0.4, hours: "Mon–Fri 07:30–18:00" },
  { id: "potsdam", name: "SIXT Potsdam", addr: "Großbeerenstr. 195, 14482 Potsdam", lat: 52.3870, lng: 13.1240, country: "DE", type: "city", fleet: "M", premium: 0.5, electric: 0.5, hours: "Mon–Fri 07:30–18:00" },
  { id: "wolfsburg", name: "SIXT Wolfsburg", addr: "Heinrich-Nordhoff-Str. 116, 38440 Wolfsburg", lat: 52.4260, lng: 10.7860, country: "DE", type: "city", fleet: "M", premium: 0.5, electric: 0.55, hours: "Mon–Fri 07:30–18:00" },
  { id: "saarbruecken", name: "SIXT Saarbrücken", addr: "Stuhlsatzenhausweg 70, 66123 Saarbrücken", lat: 49.2360, lng: 7.0090, country: "DE", type: "city", fleet: "M", premium: 0.45, electric: 0.4, hours: "Mon–Fri 07:30–18:00" },
  { id: "trier", name: "SIXT Trier", addr: "Loebstr. 14, 54292 Trier", lat: 49.7660, lng: 6.6500, country: "DE", type: "city", fleet: "S", premium: 0.4, electric: 0.35, hours: "Mon–Fri 08:00–17:00" },
  { id: "koblenz", name: "SIXT Koblenz", addr: "August-Thyssen-Str. 35, 56070 Koblenz", lat: 50.3690, lng: 7.5560, country: "DE", type: "city", fleet: "M", premium: 0.45, electric: 0.4, hours: "Mon–Fri 07:30–18:00" },
  { id: "mainz", name: "SIXT Mainz", addr: "Mombacher Str. 67, 55122 Mainz", lat: 50.0080, lng: 8.2520, country: "DE", type: "city", fleet: "M", premium: 0.5, electric: 0.45, hours: "Mon–Fri 07:30–18:00" },
  { id: "wiesbaden", name: "SIXT Wiesbaden", addr: "Mainzer Str. 75, 65189 Wiesbaden", lat: 50.0700, lng: 8.2400, country: "DE", type: "city", fleet: "M", premium: 0.5, electric: 0.45, hours: "Mon–Fri 07:30–18:00" },
  { id: "darmstadt", name: "SIXT Darmstadt", addr: "Pallaswiesenstr. 51, 64293 Darmstadt", lat: 49.8870, lng: 8.6360, country: "DE", type: "city", fleet: "M", premium: 0.45, electric: 0.4, hours: "Mon–Fri 07:30–18:00" },
  { id: "passau", name: "SIXT Passau", addr: "Spitalhofstr. 81, 94032 Passau", lat: 48.5810, lng: 13.4400, country: "DE", type: "city", fleet: "S", premium: 0.35, electric: 0.3, hours: "Mon–Fri 08:00–17:00" },
  { id: "garmisch", name: "SIXT Garmisch-Partenkirchen", addr: "Bahnhofstr. 51, 82467 Garmisch-Partenkirchen", lat: 47.4920, lng: 11.0980, country: "DE", type: "rural", fleet: "S", premium: 0.4, electric: 0.35, hours: "Mon–Fri 08:00–17:00" },
  { id: "rosenheim", name: "SIXT Rosenheim", addr: "Innstr. 80, 83022 Rosenheim", lat: 47.8580, lng: 12.1280, country: "DE", type: "city", fleet: "S", premium: 0.4, electric: 0.35, hours: "Mon–Fri 08:00–17:00" },
  { id: "loerrach", name: "SIXT Lörrach", addr: "Wiesentalstr. 35, 79539 Lörrach", lat: 47.6160, lng: 7.6740, country: "DE", type: "city", fleet: "S", premium: 0.35, electric: 0.35, hours: "Mon–Fri 08:00–17:00" },
  { id: "konstanz", name: "SIXT Konstanz", addr: "Reichenaustr. 31, 78467 Konstanz", lat: 47.6750, lng: 9.1670, country: "DE", type: "city", fleet: "S", premium: 0.4, electric: 0.35, hours: "Mon–Fri 08:00–17:00" },
  { id: "siegen", name: "SIXT Siegen", addr: "Eiserfelder Str. 320, 57080 Siegen", lat: 50.8540, lng: 8.0410, country: "DE", type: "city", fleet: "S", premium: 0.35, electric: 0.3, hours: "Mon–Fri 08:00–17:00" },
  { id: "paderborn", name: "SIXT Paderborn", addr: "Frankfurter Weg 86, 33106 Paderborn", lat: 51.7080, lng: 8.7150, country: "DE", type: "city", fleet: "S", premium: 0.35, electric: 0.3, hours: "Mon–Fri 08:00–17:00" },
  { id: "halle", name: "SIXT Halle (Saale)", addr: "Merseburger Str. 230, 06112 Halle", lat: 51.4630, lng: 11.9710, country: "DE", type: "city", fleet: "M", premium: 0.4, electric: 0.4, hours: "Mon–Fri 07:30–18:00" },
  { id: "chemnitz", name: "SIXT Chemnitz", addr: "Zwickauer Str. 167, 09116 Chemnitz", lat: 50.8200, lng: 12.8800, country: "DE", type: "city", fleet: "M", premium: 0.4, electric: 0.4, hours: "Mon–Fri 07:30–18:00" },

  // ===== AUSTRIA =====
  { id: "vienna-airport", name: "SIXT Vienna Airport", addr: "1300 Wien-Flughafen", lat: 48.1183, lng: 16.5697, country: "AT", type: "airport", fleet: "XL", premium: 0.85, electric: 0.7, hours: "Daily 06:00–23:00" },
  { id: "vienna-city", name: "SIXT Wien City", addr: "Operngasse 11, 1040 Wien", lat: 48.2010, lng: 16.3680, country: "AT", type: "city", fleet: "L", premium: 0.75, electric: 0.65, hours: "Mon–Sat 07:00–19:00" },
  { id: "salzburg-airport", name: "SIXT Salzburg Airport", addr: "Innsbrucker Bundesstr. 95, 5020 Salzburg", lat: 47.7950, lng: 13.0030, country: "AT", type: "airport", fleet: "L", premium: 0.7, electric: 0.6, hours: "Daily 06:00–23:00" },
  { id: "innsbruck-airport", name: "SIXT Innsbruck Airport", addr: "Fürstenweg 180, 6020 Innsbruck", lat: 47.2600, lng: 11.3460, country: "AT", type: "airport", fleet: "L", premium: 0.7, electric: 0.6, hours: "Daily 07:00–22:00" },
  { id: "graz-airport", name: "SIXT Graz Airport", addr: "Flughafenstr. 51, 8073 Feldkirchen", lat: 46.9920, lng: 15.4400, country: "AT", type: "airport", fleet: "M", premium: 0.55, electric: 0.5, hours: "Daily 06:00–22:00" },
  { id: "linz", name: "SIXT Linz", addr: "Wankmüllerhofstr. 56, 4020 Linz", lat: 48.2870, lng: 14.2910, country: "AT", type: "city", fleet: "M", premium: 0.5, electric: 0.45, hours: "Mon–Fri 07:30–18:00" },

  // ===== SWITZERLAND =====
  { id: "zurich-airport", name: "SIXT Zürich Airport", addr: "8058 Zürich-Flughafen", lat: 47.4515, lng: 8.5644, country: "CH", type: "airport", fleet: "XL", premium: 0.85, electric: 0.75, hours: "Daily 06:00–23:00" },
  { id: "geneva-airport", name: "SIXT Geneva Airport", addr: "Route de Pré-Bois 20, 1215 Genève", lat: 46.2380, lng: 6.1090, country: "CH", type: "airport", fleet: "XL", premium: 0.85, electric: 0.75, hours: "Daily 06:00–23:00" },
  { id: "basel-airport", name: "SIXT Basel EuroAirport", addr: "EuroAirport, 4030 Basel", lat: 47.5896, lng: 7.5299, country: "CH", type: "airport", fleet: "L", premium: 0.7, electric: 0.65, hours: "Daily 06:00–23:00" },
  { id: "zurich-city", name: "SIXT Zürich City", addr: "Lagerstr. 33, 8004 Zürich", lat: 47.3760, lng: 8.5320, country: "CH", type: "city", fleet: "L", premium: 0.75, electric: 0.7, hours: "Mon–Sat 07:00–19:00" },

  // ===== FRANCE =====
  { id: "paris-cdg", name: "SIXT Paris Charles de Gaulle", addr: "95711 Roissy-en-France", lat: 49.0097, lng: 2.5479, country: "FR", type: "airport", fleet: "XL", premium: 0.85, electric: 0.7, hours: "Daily 07:00–23:00" },
  { id: "paris-orly", name: "SIXT Paris Orly", addr: "94390 Orly", lat: 48.7250, lng: 2.3650, country: "FR", type: "airport", fleet: "L", premium: 0.75, electric: 0.65, hours: "Daily 07:00–23:00" },
  { id: "paris-gare-de-lyon", name: "SIXT Paris Gare de Lyon", addr: "193 Rue de Bercy, 75012 Paris", lat: 48.8440, lng: 2.3760, country: "FR", type: "train", fleet: "L", premium: 0.7, electric: 0.65, hours: "Daily 07:00–22:00" },
  { id: "lyon-airport", name: "SIXT Lyon Saint-Exupéry", addr: "69125 Colombier-Saugnieu", lat: 45.7256, lng: 5.0811, country: "FR", type: "airport", fleet: "L", premium: 0.7, electric: 0.6, hours: "Daily 06:00–23:00" },
  { id: "marseille-airport", name: "SIXT Marseille Provence", addr: "13700 Marignane", lat: 43.4393, lng: 5.2214, country: "FR", type: "airport", fleet: "L", premium: 0.7, electric: 0.6, hours: "Daily 06:00–23:00" },
  { id: "nice-airport", name: "SIXT Nice Côte d'Azur", addr: "06281 Nice", lat: 43.6584, lng: 7.2159, country: "FR", type: "airport", fleet: "L", premium: 0.85, electric: 0.7, hours: "Daily 06:00–23:00" },
  { id: "toulouse-airport", name: "SIXT Toulouse Blagnac", addr: "31700 Blagnac", lat: 43.6293, lng: 1.3638, country: "FR", type: "airport", fleet: "M", premium: 0.6, electric: 0.55, hours: "Daily 06:00–23:00" },
  { id: "bordeaux-airport", name: "SIXT Bordeaux Airport", addr: "33700 Mérignac", lat: 44.8285, lng: -0.7156, country: "FR", type: "airport", fleet: "M", premium: 0.6, electric: 0.55, hours: "Daily 06:00–22:00" },
  { id: "strasbourg", name: "SIXT Strasbourg", addr: "10 Place de la Gare, 67000 Strasbourg", lat: 48.5860, lng: 7.7340, country: "FR", type: "train", fleet: "M", premium: 0.55, electric: 0.5, hours: "Mon–Sat 07:00–19:00" },

  // ===== ITALY =====
  { id: "rome-fco", name: "SIXT Rome Fiumicino", addr: "Via dell'Aeroporto, 00054 Fiumicino", lat: 41.7999, lng: 12.2462, country: "IT", type: "airport", fleet: "XL", premium: 0.8, electric: 0.65, hours: "Daily 07:00–23:00" },
  { id: "rome-cia", name: "SIXT Rome Ciampino", addr: "Via Appia Nuova, 00040 Ciampino", lat: 41.8003, lng: 12.5950, country: "IT", type: "airport", fleet: "L", premium: 0.65, electric: 0.55, hours: "Daily 07:00–23:00" },
  { id: "milan-mxp", name: "SIXT Milan Malpensa", addr: "21010 Ferno", lat: 45.6306, lng: 8.7281, country: "IT", type: "airport", fleet: "XL", premium: 0.85, electric: 0.7, hours: "Daily 07:00–23:00" },
  { id: "milan-lin", name: "SIXT Milan Linate", addr: "20090 Segrate", lat: 45.4451, lng: 9.2767, country: "IT", type: "airport", fleet: "L", premium: 0.75, electric: 0.65, hours: "Daily 07:00–23:00" },
  { id: "milan-city", name: "SIXT Milan Centrale", addr: "Piazza Duca d'Aosta, 20124 Milano", lat: 45.4860, lng: 9.2050, country: "IT", type: "train", fleet: "L", premium: 0.7, electric: 0.65, hours: "Daily 07:00–22:00" },
  { id: "venice-airport", name: "SIXT Venice Marco Polo", addr: "30173 Tessera", lat: 45.5054, lng: 12.3519, country: "IT", type: "airport", fleet: "L", premium: 0.7, electric: 0.6, hours: "Daily 07:00–23:00" },
  { id: "naples-airport", name: "SIXT Naples Airport", addr: "Viale F. Ruffo di Calabria, 80144 Napoli", lat: 40.8860, lng: 14.2908, country: "IT", type: "airport", fleet: "L", premium: 0.65, electric: 0.5, hours: "Daily 07:00–23:00" },
  { id: "florence-airport", name: "SIXT Florence Airport", addr: "Via del Termine, 50127 Firenze", lat: 43.8100, lng: 11.2050, country: "IT", type: "airport", fleet: "M", premium: 0.65, electric: 0.55, hours: "Daily 07:00–22:00" },
  { id: "bologna-airport", name: "SIXT Bologna Airport", addr: "Via Triumvirato, 40132 Bologna", lat: 44.5354, lng: 11.2887, country: "IT", type: "airport", fleet: "M", premium: 0.65, electric: 0.55, hours: "Daily 07:00–23:00" },

  // ===== SPAIN =====
  { id: "madrid-airport", name: "SIXT Madrid Barajas", addr: "28042 Madrid", lat: 40.4983, lng: -3.5676, country: "ES", type: "airport", fleet: "XL", premium: 0.8, electric: 0.65, hours: "Daily 07:00–23:00" },
  { id: "barcelona-airport", name: "SIXT Barcelona El Prat", addr: "08820 El Prat de Llobregat", lat: 41.2974, lng: 2.0833, country: "ES", type: "airport", fleet: "XL", premium: 0.8, electric: 0.65, hours: "Daily 07:00–23:00" },
  { id: "palma-airport", name: "SIXT Palma de Mallorca", addr: "07611 Palma", lat: 39.5517, lng: 2.7388, country: "ES", type: "airport", fleet: "XL", premium: 0.75, electric: 0.6, hours: "Daily 07:00–23:00" },
  { id: "malaga-airport", name: "SIXT Málaga Airport", addr: "29004 Málaga", lat: 36.6749, lng: -4.4991, country: "ES", type: "airport", fleet: "L", premium: 0.7, electric: 0.55, hours: "Daily 07:00–23:00" },
  { id: "alicante-airport", name: "SIXT Alicante Airport", addr: "03195 Alicante", lat: 38.2822, lng: -0.5582, country: "ES", type: "airport", fleet: "L", premium: 0.65, electric: 0.5, hours: "Daily 07:00–23:00" },
  { id: "valencia-airport", name: "SIXT Valencia Airport", addr: "46940 Manises", lat: 39.4893, lng: -0.4816, country: "ES", type: "airport", fleet: "M", premium: 0.6, electric: 0.5, hours: "Daily 07:00–22:00" },
  { id: "seville-airport", name: "SIXT Seville Airport", addr: "41020 Sevilla", lat: 37.4189, lng: -5.8931, country: "ES", type: "airport", fleet: "M", premium: 0.6, electric: 0.5, hours: "Daily 07:00–22:00" },
  { id: "ibiza-airport", name: "SIXT Ibiza Airport", addr: "07817 Sant Josep", lat: 38.8729, lng: 1.3731, country: "ES", type: "airport", fleet: "L", premium: 0.7, electric: 0.55, hours: "Daily 07:00–23:00" },

  // ===== BENELUX =====
  { id: "ams-airport", name: "SIXT Amsterdam Schiphol", addr: "1118 Schiphol", lat: 52.3105, lng: 4.7683, country: "NL", type: "airport", fleet: "XL", premium: 0.85, electric: 0.8, hours: "Daily 06:00–23:00" },
  { id: "amsterdam-city", name: "SIXT Amsterdam City", addr: "Stadhouderskade 20, 1054 ES Amsterdam", lat: 52.3620, lng: 4.8800, country: "NL", type: "city", fleet: "L", premium: 0.75, electric: 0.8, hours: "Mon–Sat 07:00–19:00" },
  { id: "rotterdam", name: "SIXT Rotterdam", addr: "Stationsplein 45, 3013 AK Rotterdam", lat: 51.9230, lng: 4.4690, country: "NL", type: "train", fleet: "M", premium: 0.6, electric: 0.7, hours: "Mon–Sat 07:00–19:00" },
  { id: "brussels-airport", name: "SIXT Brussels Airport", addr: "1930 Zaventem", lat: 50.9010, lng: 4.4844, country: "BE", type: "airport", fleet: "L", premium: 0.75, electric: 0.65, hours: "Daily 06:00–23:00" },
  { id: "luxembourg", name: "SIXT Luxembourg Airport", addr: "2987 Luxembourg", lat: 49.6260, lng: 6.2110, country: "LU", type: "airport", fleet: "M", premium: 0.7, electric: 0.6, hours: "Daily 06:00–22:00" },

  // ===== UK =====
  { id: "lhr-airport", name: "SIXT London Heathrow", addr: "Northern Perimeter Rd, Hounslow", lat: 51.4700, lng: -0.4543, country: "GB", type: "airport", fleet: "XL", premium: 0.85, electric: 0.75, hours: "Daily 06:00–23:00" },
  { id: "lgw-airport", name: "SIXT London Gatwick", addr: "Horley RH6 0NP", lat: 51.1537, lng: -0.1821, country: "GB", type: "airport", fleet: "L", premium: 0.75, electric: 0.7, hours: "Daily 06:00–23:00" },
  { id: "stn-airport", name: "SIXT London Stansted", addr: "Stansted CM24 1QW", lat: 51.8860, lng: 0.2389, country: "GB", type: "airport", fleet: "M", premium: 0.6, electric: 0.55, hours: "Daily 06:00–23:00" },
  { id: "man-airport", name: "SIXT Manchester Airport", addr: "Manchester M90 1QX", lat: 53.3537, lng: -2.2750, country: "GB", type: "airport", fleet: "L", premium: 0.7, electric: 0.65, hours: "Daily 06:00–23:00" },
  { id: "edi-airport", name: "SIXT Edinburgh Airport", addr: "Edinburgh EH12 9DN", lat: 55.9500, lng: -3.3725, country: "GB", type: "airport", fleet: "M", premium: 0.65, electric: 0.6, hours: "Daily 06:00–22:00" },

  // ===== NORDICS =====
  { id: "cph-airport", name: "SIXT Copenhagen Airport", addr: "Lufthavnsboulevarden, 2770 Kastrup", lat: 55.6181, lng: 12.6561, country: "DK", type: "airport", fleet: "L", premium: 0.75, electric: 0.85, hours: "Daily 06:00–23:00" },
  { id: "arn-airport", name: "SIXT Stockholm Arlanda", addr: "190 45 Stockholm-Arlanda", lat: 59.6519, lng: 17.9186, country: "SE", type: "airport", fleet: "L", premium: 0.75, electric: 0.85, hours: "Daily 06:00–23:00" },
  { id: "osl-airport", name: "SIXT Oslo Gardermoen", addr: "2061 Gardermoen", lat: 60.1939, lng: 11.1004, country: "NO", type: "airport", fleet: "L", premium: 0.7, electric: 0.9, hours: "Daily 06:00–23:00" },
  { id: "hel-airport", name: "SIXT Helsinki Airport", addr: "01530 Vantaa", lat: 60.3172, lng: 24.9633, country: "FI", type: "airport", fleet: "M", premium: 0.6, electric: 0.75, hours: "Daily 06:00–23:00" },

  // ===== USA =====
  { id: "lax-airport", name: "SIXT Los Angeles LAX", addr: "9000 Airport Blvd, Los Angeles", lat: 33.9425, lng: -118.4081, country: "US", type: "airport", fleet: "XL", premium: 0.9, electric: 0.75, hours: "Daily 05:00–24:00" },
  { id: "jfk-airport", name: "SIXT New York JFK", addr: "Van Wyck Expy, Jamaica NY", lat: 40.6413, lng: -73.7781, country: "US", type: "airport", fleet: "L", premium: 0.75, electric: 0.6, hours: "Daily 06:00–24:00" },
  { id: "mia-airport", name: "SIXT Miami International", addr: "Miami FL 33122", lat: 25.7959, lng: -80.2870, country: "US", type: "airport", fleet: "XL", premium: 0.85, electric: 0.65, hours: "Daily 05:00–24:00" },
  { id: "sfo-airport", name: "SIXT San Francisco SFO", addr: "780 N McDonnell Rd, San Francisco", lat: 37.6213, lng: -122.3790, country: "US", type: "airport", fleet: "L", premium: 0.8, electric: 0.8, hours: "Daily 05:00–24:00" },
  { id: "las-airport", name: "SIXT Las Vegas Harry Reid", addr: "7135 Gilespie St, Las Vegas", lat: 36.0840, lng: -115.1537, country: "US", type: "airport", fleet: "L", premium: 0.8, electric: 0.6, hours: "Daily 05:00–24:00" },
  { id: "mco-airport", name: "SIXT Orlando International", addr: "9300 Jeff Fuqua Blvd, Orlando", lat: 28.4312, lng: -81.3081, country: "US", type: "airport", fleet: "L", premium: 0.7, electric: 0.55, hours: "Daily 05:00–24:00" },
  { id: "atl-airport", name: "SIXT Atlanta International", addr: "Atlanta GA 30320", lat: 33.6407, lng: -84.4277, country: "US", type: "airport", fleet: "L", premium: 0.7, electric: 0.55, hours: "Daily 05:00–24:00" },
  { id: "bos-airport", name: "SIXT Boston Logan", addr: "Boston MA 02128", lat: 42.3656, lng: -71.0096, country: "US", type: "airport", fleet: "M", premium: 0.7, electric: 0.6, hours: "Daily 06:00–24:00" },

  // ===== MIDDLE EAST =====
  { id: "dxb-airport", name: "SIXT Dubai International", addr: "Dubai DXB", lat: 25.2532, lng: 55.3657, country: "AE", type: "airport", fleet: "XL", premium: 0.95, electric: 0.6, hours: "Daily 24h" },
  { id: "tlv-airport", name: "SIXT Tel Aviv Ben Gurion", addr: "Lod 7015001", lat: 32.0114, lng: 34.8867, country: "IL", type: "airport", fleet: "L", premium: 0.7, electric: 0.6, hours: "Daily 06:00–23:00" }
];

export const STATION_BY_ID: Record<string, Station> =
  Object.fromEntries(STATIONS.map((s) => [s.id, s]));

export const COUNTRY_NAMES: Record<string, string> = {
  DE: "Germany", AT: "Austria", CH: "Switzerland", FR: "France",
  IT: "Italy", ES: "Spain", NL: "Netherlands", BE: "Belgium",
  LU: "Luxembourg", GB: "United Kingdom", DK: "Denmark", SE: "Sweden",
  NO: "Norway", FI: "Finland", US: "United States", AE: "UAE", IL: "Israel"
};
