import React, { useEffect, useMemo, useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, runTransaction, serverTimestamp, setDoc } from "firebase/firestore";

const DEFAULT_MANAGERS = ["Replacement Team 1", "Replacement Team 2", "Replacement Team 3", "Replacement Team 4"];
const ACCESS_ROLES = { TEAM: "team", ADMIN: "admin", SPECTATOR: "spectator" };
const ADMIN_CODE = "BOAT";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDMkJu3lXERqYCodV-ZPheRqDTB9HYOvkM",
  authDomain: "boat-dispersal-draft.firebaseapp.com",
  projectId: "boat-dispersal-draft",
  storageBucket: "boat-dispersal-draft.firebasestorage.app",
  messagingSenderId: "857774208277",
  appId: "1:857774208277:web:203c90873867804d24251c",
  measurementId: "G-Y37Q7YL8D6"
};
const FIREBASE_DRAFT_PATH = "draftRooms/the-boat-default";

function isFirebaseConfigured() {
  return FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.includes("PASTE_") && FIREBASE_CONFIG.projectId && !FIREBASE_CONFIG.projectId.includes("PASTE_");
}

let cachedFirestore = null;
function getDraftDocRef() {
  if (!isFirebaseConfigured()) return null;
  if (!cachedFirestore) {
    const app = initializeApp(FIREBASE_CONFIG);
    cachedFirestore = getFirestore(app);
  }
  return doc(cachedFirestore, FIREBASE_DRAFT_PATH);
}

function sanitizeRemoteState(state) {
  return {
    assets: Array.isArray(state.assets) ? state.assets : [],
    managers: Array.isArray(state.managers) ? state.managers : DEFAULT_MANAGERS,
    draftMode: state.draftMode || "snake",
    rounds: state.rounds || 35,
    picks: Array.isArray(state.picks) ? state.picks : [],
  };
}

const inputClass = "rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 disabled:opacity-50";
const smallInputClass = "rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 disabled:opacity-50";
const tableHeadClass = "sticky top-0 z-10 bg-slate-950 text-slate-300";

const SF_RANKINGS = {
  "Drake Maye": 2,
  "Brian Thomas Jr.": 32,
  "Marvin Harrison Jr.": 35,
  "Brock Purdy": 38,
  "Jordan Love": 40,
  "Kyren Williams": 42,
  "C.J. Stroud": 45,
  "Luther Burden": 46,
  "DeVonta Smith": 47,
  "Josh Jacobs": 48,
  "Kenneth Walker III": 50,
  "Brandon Aiyuk": 52,
  "Emeka Egbuka": 54,
  "2026 Rookie 1.01": 56,
  "2026 Rookie 1.02": 57,
  "D.J. Moore": 60,
  "D'Andre Swift": 62,
  "Jaylen Warren": 63,
  "George Kittle": 65,
  "2026 Rookie 1.04": 66,
  "Bryce Young": 68,
  "Travis Hunter": 70,
  "Rashee Rice": 72,
  "2026 Rookie 1.06": 74,
  "Tony Pollard": 78,
  "Zach Charbonnet": 80,
  "Stefon Diggs": 84,
  "Davante Adams": 86,
  "Deebo Samuel": 90,
  "Juwan Johnson": 96,
  "Pat Freiermuth": 102,
  "Jaylin Noel": 104,
  "Woody Marks": 108,
  "Bhayshul Tuten": 110,
  "Rhamondre Stevenson": 112,
  "Cooper Kupp": 115,
  "Jauan Jennings": 118,
  "Wan'Dale Robinson": 120,
  "Jakobi Meyers": 122,
  "Aaron Rodgers": 125,
  "Tyler Shough": 128,
  "Geno Smith": 130,
  "Kareem Hunt": 132,
  "Kenneth Gainwell": 134,
  "2026 Rookie 1.13": 136,
  "2026 Rookie 1.14": 138,
  "Michael Carter": 142,
  "Jordan Mason": 144,
  "Braelon Allen": 146,
  "Blake Corum": 148,
  "Keaton Mitchell": 150,
  "Brashard Smith": 152,
  "Chigoziem Okonkwo": 156,
  "Noah Fant": 160,
  "Taysom Hill": 162,
  "Joe Mixon": 165,
  "2026 Rookie 1.20": 166,
  "Shedeur Sanders": 170,
  "Jalen Milroe": 174,
  "Deshaun Watson": 178,
  "Mac Jones": 182,
  "Joe Flacco": 184,
  "Tyrod Taylor": 188,
  "Kenny Pickett": 190,
  "Jimmy Garoppolo": 194,
  "Malik Willis": 196,
  "Tanner McKee": 198,
  "Andy Dalton": 200,
  "2026 Rookie 2.03": 205,
  "2026 Rookie 2.04": 206,
  "2026 Rookie 2.06": 208,
  "Christian Kirk": 215,
  "Rashod Bateman": 218,
  "Demario Douglas": 220,
  "Savion Williams": 222,
  "Joshua Palmer": 224,
  "Tyler Lockett": 226,
  "Skyy Moore": 228,
  "KaVontae Turpin": 230,
  "Tyler Higbee": 235,
  "Tyler Conklin": 240,
  "Zach Ertz": 242,
  "Darren Waller": 245,
  "Elijah Arroyo": 248,
  "Terrance Ferguson": 250,
  "LeQuint Allen": 252,
  "Ray Davis": 254,
  "Chris Rodriguez": 256,
  "Miles Sanders": 258,
  "Alexander Mattison": 260,
  "Jaydon Blue": 262,
  "Jarquez Hunter": 264,
  "Jordan James": 266,
  "Jawhar Jordan": 268,
  "Phil Mafah": 270,
  "Raheim Sanders": 272,
  "2026 Rookie 2.19": 275,
  "2026 Rookie 2.20": 276,
  "2026 Rookie 3.01": 285,
  "2026 Rookie 3.04": 288,
  "2026 Rookie 3.06": 290,
  "2026 Rookie 3.16": 300,
  "2026 Rookie 4.02": 320,
  "2026 Rookie 4.04": 322,
  "2026 Rookie 4.06": 324,
  "2026 Rookie 4.14": 330,
  "2026 Rookie 4.19": 335,
  "A Division Slot": 350,
  "B Division Slot - Boston Bums": 351,
  "B Division Slot - Baby Billy's Bible Bonkers": 352,
  "B Division Slot - Girth Brooks": 353,
  "Cleveland Browns": 400,
  "Denver Broncos": 402,
  "Buffalo Bills": 404,
  "Kansas City Chiefs": 406,
  "Atlanta Falcons": 408,
  "San Francisco 49ers": 410,
};

const RAW_ASSETS = `name|type|position|team|sourceRoster|notes
Andy Dalton|Player|QB|PHI|Boston Bums|2025 pts: 12.52
Kenny Pickett|Player|QB|CAR|Boston Bums|2025 pts: 11.02
C.J. Stroud|Player|QB|HOU|Boston Bums|2025 pts: 245.34
Tyrod Taylor|Player|QB|NYJ|Boston Bums|Q · 2025 pts: 69.96
Bryce Young|Player|QB|CAR|Boston Bums|2025 pts: 259.94
Zach Charbonnet|Player|RB|SEA|Boston Bums|Q · 2025 pts: 181.40
Ray Davis|Player|RB|BUF|Boston Bums|2025 pts: 158.40
Kenneth Gainwell|Player|RB|TBB|Boston Bums|2025 pts: 284.60
Hassan Haskins|Player|RB|LAC|Boston Bums|2025 pts: 29.70
Tony Pollard|Player|RB|TEN|Boston Bums|2025 pts: 185.80
Miles Sanders|Player|RB|DAL|Boston Bums|Q · 2025 pts: 33.50
Kenneth Walker III|Player|RB|KCC|Boston Bums|2025 pts: 191.90
Kyren Williams|Player|RB|LAR|Boston Bums|2025 pts: 264.10
Davante Adams|Player|WR|LAR|Boston Bums|2025 pts: 222.90
Marvin Harrison Jr.|Player|WR|ARI|Boston Bums|Q · 2025 pts: 127.80
Tyreek Hill|Player|WR|FA|Boston Bums|Q · 2025 pts: 55.40
Jauan Jennings|Player|WR|SFO|Boston Bums|2025 pts: 173.30
Cooper Kupp|Player|WR|SEA|Boston Bums|2025 pts: 116.30
Jaylin Noel|Player|WR|HOU|Boston Bums|2025 pts: 181.80
Wan'Dale Robinson|Player|WR|TEN|Boston Bums|2025 pts: 222.00
Brian Thomas Jr.|Player|WR|JAC|Boston Bums|2025 pts: 138.80
Tyler Conklin|Player|TE|DET|Boston Bums|2025 pts: 20.80
Zach Ertz|Player|TE|WAS|Boston Bums|Q · 2025 pts: 155.40
Tyler Higbee|Player|TE|LAR|Boston Bums|2025 pts: 86.60
Taysom Hill|Player|TE|NOS|Boston Bums|Q · 2025 pts: 53.70
Buffalo Bills|Player|DEF|BUF|Boston Bums|2025 pts: 210.00
Denver Broncos|Player|DEF|DEN|Boston Bums|2025 pts: 262.00
Jimmy Garoppolo|Player|QB|LAR|Keyser Soze|2025 pts: -1.00
Drake Maye|Player|QB|NEP|Keyser Soze|2025 pts: 402.86
Aaron Rodgers|Player|QB|PIT|Keyser Soze|2025 pts: 271.78
Geno Smith|Player|QB|NYJ|Keyser Soze|2025 pts: 213.60
Deshaun Watson|Player|QB|CLE|Keyser Soze|2025 pts: -
Malik Willis|Player|QB|MIA|Keyser Soze|2025 pts: 55.68
Michael Carter|Player|RB|TEN|Keyser Soze|2025 pts: 101.70
Kareem Hunt|Player|RB|KCC|Keyser Soze|2025 pts: 145.40
Josh Jacobs|Player|RB|GBP|Keyser Soze|2025 pts: 237.10
Jordan Mason|Player|RB|MIN|Keyser Soze|2025 pts: 128.90
Alexander Mattison|Player|RB|MIA|Keyser Soze|Q · 2025 pts: -
Rhamondre Stevenson|Player|RB|NEP|Keyser Soze|2025 pts: 182.80
Rashod Bateman|Player|WR|BAL|Keyser Soze|Q · 2025 pts: 55.40
Stefon Diggs|Player|WR|FA|Keyser Soze|2025 pts: 210.30
Demario Douglas|Player|WR|NEP|Keyser Soze|2025 pts: 95.80
Jaylin Lane|Player|WR|WAS|Keyser Soze|Q · 2025 pts: 86.20
Tyler Lockett|Player|WR|LVR|Keyser Soze|2025 pts: 67.10
Jakobi Meyers|Player|WR|JAC|Keyser Soze|2025 pts: 175.80
D.J. Moore|Player|WR|BUF|Keyser Soze|2025 pts: 172.80
Skyy Moore|Player|WR|GBP|Keyser Soze|2025 pts: 134.60
KaVontae Turpin|Player|WR|DAL|Keyser Soze|2025 pts: 271.40
Savion Williams|Player|WR|GBP|Keyser Soze|Q · 2025 pts: 97.20
Noah Fant|Player|TE|NOS|Keyser Soze|2025 pts: 94.80
Juwan Johnson|Player|TE|NOS|Keyser Soze|2025 pts: 221.40
George Kittle|Player|TE|SFO|Keyser Soze|Q · 2025 pts: 197.00
Chigoziem Okonkwo|Player|TE|WAS|Keyser Soze|2025 pts: 154.00
Darren Waller|Player|TE|MIA|Keyser Soze|Q · 2025 pts: 106.70
Kansas City Chiefs|Player|DEF|KCC|Keyser Soze|2025 pts: 197.50
Joe Flacco|Player|QB|CIN|Baby Billy's Bible Bonkers|2025 pts: 179.26
Mac Jones|Player|QB|SFO|Baby Billy's Bible Bonkers|2025 pts: 156.64
Tanner McKee|Player|QB|PHI|Baby Billy's Bible Bonkers|2025 pts: 16.66
Jalen Milroe|Player|QB|SEA|Baby Billy's Bible Bonkers|2025 pts: -1.60
Brock Purdy|Player|QB|SFO|Baby Billy's Bible Bonkers|2025 pts: 207.08
Braelon Allen|Player|RB|NYJ|Baby Billy's Bible Bonkers|Q · 2025 pts: 25.30
LeQuint Allen|Player|RB|JAC|Baby Billy's Bible Bonkers|2025 pts: 86.50
Jaydon Blue|Player|RB|DAL|Baby Billy's Bible Bonkers|2025 pts: 27.60
Blake Corum|Player|RB|LAR|Baby Billy's Bible Bonkers|2025 pts: 154.80
Jarquez Hunter|Player|RB|LAR|Baby Billy's Bible Bonkers|2025 pts: 0.00
Jordan James|Player|RB|SFO|Baby Billy's Bible Bonkers|2025 pts: 0.00
Jawhar Jordan|Player|RB|HOU|Baby Billy's Bible Bonkers|2025 pts: 29.70
Phil Mafah|Player|RB|DAL|Baby Billy's Bible Bonkers|2025 pts: 10.90
Woody Marks|Player|RB|HOU|Baby Billy's Bible Bonkers|2025 pts: 145.10
Keaton Mitchell|Player|RB|LAC|Baby Billy's Bible Bonkers|2025 pts: 114.50
Chris Rodriguez|Player|RB|JAC|Baby Billy's Bible Bonkers|2025 pts: 92.00
Raheim Sanders|Player|RB|CLE|Baby Billy's Bible Bonkers|2025 pts: 20.30
Brashard Smith|Player|RB|KCC|Baby Billy's Bible Bonkers|2025 pts: 118.20
Bhayshul Tuten|Player|RB|JAC|Baby Billy's Bible Bonkers|2025 pts: 142.50
Luther Burden|Player|WR|CHI|Baby Billy's Bible Bonkers|2025 pts: 150.20
Emeka Egbuka|Player|WR|TBB|Baby Billy's Bible Bonkers|2025 pts: 195.70
Jaylin Noel|Player|WR|HOU|Baby Billy's Bible Bonkers|2025 pts: 181.80
Rashee Rice|Player|WR|KCC|Baby Billy's Bible Bonkers|2025 pts: 150.10
KaVontae Turpin|Player|WR|DAL|Baby Billy's Bible Bonkers|2025 pts: 271.40
Elijah Arroyo|Player|TE|SEA|Baby Billy's Bible Bonkers|2025 pts: 45.40
Terrance Ferguson|Player|TE|LAR|Baby Billy's Bible Bonkers|2025 pts: 60.60
Pat Freiermuth|Player|TE|PIT|Baby Billy's Bible Bonkers|2025 pts: 138.10
Taysom Hill|Player|TE|NOS|Baby Billy's Bible Bonkers|Q · 2025 pts: 53.70
Cleveland Browns|Player|DEF|CLE|Baby Billy's Bible Bonkers|2025 pts: 236.50
Jordan Love|Player|QB|GBP|Girth Brooks|2025 pts: 275.74
Shedeur Sanders|Player|QB|CLE|Girth Brooks|2025 pts: 100.40
Tyler Shough|Player|QB|NOS|Girth Brooks|2025 pts: 185.06
Joe Mixon|Player|RB|FA|Girth Brooks|Q · 2025 pts: -
D'Andre Swift|Player|RB|CHI|Girth Brooks|2025 pts: 228.60
Jaylen Warren|Player|RB|PIT|Girth Brooks|2025 pts: 237.60
Brandon Aiyuk|Player|WR|SFO|Girth Brooks|H · 2025 pts: -
Tutu Atwell|Player|WR|MIA|Girth Brooks|2025 pts: 31.20
Jimmy Horn|Player|WR|CAR|Girth Brooks|2025 pts: 28.70
Travis Hunter|Player|WR|JAC|Girth Brooks|Q · 2025 pts: 63.80
Christian Kirk|Player|WR|SFO|Girth Brooks|2025 pts: 57.90
Joshua Palmer|Player|WR|BUF|Girth Brooks|Q · 2025 pts: 52.30
Jalen Royals|Player|WR|KCC|Girth Brooks|2025 pts: 5.40
Curtis Samuel|Player|WR|FA|Girth Brooks|2025 pts: 43.40
Deebo Samuel|Player|WR|WAS|Girth Brooks|2025 pts: 233.40
DeVonta Smith|Player|WR|PHI|Girth Brooks|2025 pts: 201.80
JuJu Smith-Schuster|Player|WR|KCC|Girth Brooks|2025 pts: 73.50
LaJohntay Wester|Player|WR|BAL|Girth Brooks|2025 pts: 42.40
Johnny Wilson|Player|WR|PHI|Girth Brooks|Q · 2025 pts: -
Will Dissly|Player|TE|FA|Girth Brooks|Q · 2025 pts: 26.20
Tyler Higbee|Player|TE|LAR|Girth Brooks|2025 pts: 86.60
Johnny Mundt|Player|TE|PHI|Girth Brooks|2025 pts: 24.60
San Francisco 49ers|Player|DEF|SFO|Girth Brooks|2025 pts: 172.00
Atlanta Falcons|Player|DEF|ATL|Girth Brooks|2025 pts: 192.50
2026 Rookie 1.01|Pick|Draft Pick||Baby Billy's Bible Bonkers|Overall 1 · traded from Girth Brooks
2026 Rookie 1.02|Pick|Draft Pick||Baby Billy's Bible Bonkers|Overall 2
2026 Rookie 1.04|Pick|Draft Pick||Boston Bums|Overall 4
2026 Rookie 1.06|Pick|Draft Pick||Keyser Soze|Overall 6
2026 Rookie 1.13|Pick|Draft Pick||Baby Billy's Bible Bonkers|Overall 13 · traded from CTESPN
2026 Rookie 1.14|Pick|Draft Pick||Baby Billy's Bible Bonkers|Overall 14 · traded from Mr Sprinkles
2026 Rookie 1.20|Pick|Draft Pick||Girth Brooks|Overall 20 · traded from JR's Lobos
2026 Rookie 2.03|Pick|Draft Pick||Baby Billy's Bible Bonkers|Overall 27 · traded from RB Zero Dark 30
2026 Rookie 2.04|Pick|Draft Pick||Boston Bums|Overall 28
2026 Rookie 2.06|Pick|Draft Pick||Keyser Soze|Overall 30
2026 Rookie 2.19|Pick|Draft Pick||Baby Billy's Bible Bonkers|Overall 43 · traded from MBakke
2026 Rookie 2.20|Pick|Draft Pick||Girth Brooks|Overall 44 · traded from JR's Lobos
2026 Rookie 3.01|Pick|Draft Pick||Girth Brooks|Overall 49
2026 Rookie 3.04|Pick|Draft Pick||Boston Bums|Overall 52
2026 Rookie 3.06|Pick|Draft Pick||Keyser Soze|Overall 54
2026 Rookie 3.16|Pick|Draft Pick||Baby Billy's Bible Bonkers|Overall 64 · traded from Bay Harbor Butchers
2026 Rookie 4.02|Pick|Draft Pick||Baby Billy's Bible Bonkers|Overall 74
2026 Rookie 4.04|Pick|Draft Pick||Boston Bums|Overall 76
2026 Rookie 4.06|Pick|Draft Pick||Keyser Soze|Overall 78
2026 Rookie 4.14|Pick|Draft Pick||Baby Billy's Bible Bonkers|Overall 86 · traded from Mr Sprinkles
2026 Rookie 4.19|Pick|Draft Pick||Baby Billy's Bible Bonkers|Overall 91 · traded from MBakke
A Division Slot|Division|Division||Keyser Soze|Keyser Soze's original division slot
B Division Slot - Boston Bums|Division|Division||Boston Bums|Boston Bums' original division slot
B Division Slot - Baby Billy's Bible Bonkers|Division|Division||Baby Billy's original division slot
B Division Slot - Girth Brooks|Division|Division||Girth Brooks|Girth Brooks' original division slot`;

function makeId() {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function Icon({ children }) {
  return <span className="inline-flex h-5 w-5 items-center justify-center text-base leading-none">{children}</span>;
}

function Card({ className = "", children }) {
  return <div className={`border border-slate-700 bg-slate-900 text-slate-100 ${className}`}>{children}</div>;
}

function CardContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function Button({ className = "", variant = "default", size = "default", disabled = false, children, ...props }) {
  const variantClasses = variant === "outline" ? "border border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800" : "bg-cyan-500 text-slate-950 hover:bg-cyan-400";
  const sizeClasses = size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2";
  return (
    <button className={`inline-flex items-center justify-center font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses} ${sizeClasses} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  );
}

function parsePipeTable(text) {
  const [headerLine, ...lines] = text.trim().split("\n");
  const headers = headerLine.split("|");
  return lines.filter(Boolean).map((line) => {
    const values = line.split("|");
    const row = Object.fromEntries(headers.map((h, index) => [h, values[index] ?? ""]));
    return { id: makeId(), ...row };
  });
}

function csvEscape(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function getAssetColorKey(asset) {
  if (asset?.type === "Pick") return "PICK";
  if (asset?.type === "Division") return "DIVISION";
  return asset?.position || "OTHER";
}

function getAssetColorClasses(asset) {
  const colors = {
    QB: "bg-red-950/70 text-red-200 ring-red-700",
    RB: "bg-emerald-950/70 text-emerald-200 ring-emerald-700",
    WR: "bg-blue-950/70 text-blue-200 ring-blue-700",
    TE: "bg-purple-950/70 text-purple-200 ring-purple-700",
    DEF: "bg-slate-800 text-slate-200 ring-slate-600",
    PICK: "bg-amber-950/70 text-amber-200 ring-amber-700",
    DIVISION: "bg-fuchsia-950/70 text-fuchsia-200 ring-fuchsia-700",
    OTHER: "bg-zinc-800 text-zinc-200 ring-zinc-600",
  };
  return colors[getAssetColorKey(asset)] || colors.OTHER;
}

function AssetBadge({ asset, compact = false }) {
  const label = asset?.type === "Pick" ? "PICK" : asset?.type === "Division" ? "DIV" : asset?.position || asset?.type || "ASSET";
  return <span className={`inline-flex items-center rounded-full font-semibold ring-1 ${compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"} ${getAssetColorClasses(asset)}`}>{label}</span>;
}

function parseCsvLine(line) {
  const out = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      out.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  out.push(current.trim());
  return out;
}

function parseAssetsCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const obj = Object.fromEntries(headers.map((h, i) => [h, values[i] || ""]));
    return {
      id: makeId(),
      name: obj.name || obj.player || obj.asset || "Unnamed asset",
      type: obj.type || (obj.name?.match(/20\d\d|pick/i) ? "Pick" : "Player"),
      position: obj.position || obj.pos || "",
      team: obj.team || obj.nfl_team || "",
      sourceRoster: obj.sourceroster || obj.source_roster || obj.originalteam || obj.original_team || "",
      notes: obj.notes || obj.note || "",
    };
  });
}

function getSuperflexRank(asset) {
  return SF_RANKINGS[asset?.name] ?? 9999;
}

function sortRosterAssets(assets) {
  return [...assets].sort((a, b) => compareAssetsBySortMode(a, b, "sfRank"));
}

function takeBestPlayer(players, predicate) {
  const index = players.findIndex(predicate);
  if (index < 0) return null;
  const [player] = players.splice(index, 1);
  return player;
}

function buildLineupGroups(assets) {
  const players = sortRosterAssets(assets.filter((asset) => asset.type === "Player" && asset.position !== "DEF"));
  const defenses = sortRosterAssets(assets.filter((asset) => asset.type === "Player" && asset.position === "DEF"));
  const draftPicks = sortRosterAssets(assets.filter((asset) => asset.type === "Pick"));
  const divisions = sortRosterAssets(assets.filter((asset) => asset.type === "Division"));

  const starters = [
    { slot: "QB", asset: takeBestPlayer(players, (asset) => asset.position === "QB") },
    { slot: "RB", asset: takeBestPlayer(players, (asset) => asset.position === "RB") },
    { slot: "RB", asset: takeBestPlayer(players, (asset) => asset.position === "RB") },
    { slot: "WR", asset: takeBestPlayer(players, (asset) => asset.position === "WR") },
    { slot: "WR", asset: takeBestPlayer(players, (asset) => asset.position === "WR") },
    { slot: "TE", asset: takeBestPlayer(players, (asset) => asset.position === "TE") },
    { slot: "FLEX", asset: takeBestPlayer(players, (asset) => ["RB", "WR", "TE"].includes(asset.position)) },
    { slot: "FLEX", asset: takeBestPlayer(players, (asset) => ["RB", "WR", "TE"].includes(asset.position)) },
    { slot: "SUPERFLEX", asset: takeBestPlayer(players, (asset) => ["QB", "RB", "WR", "TE"].includes(asset.position)) },
    { slot: "DEF", asset: takeBestPlayer(defenses, () => true) },
  ];

  return {
    starters,
    bench: sortRosterAssets([...players, ...defenses]),
    draftPicks,
    divisions,
  };
}

function compareAssetsBySortMode(a, b, sortMode) {
  if (sortMode === "alpha") return a.name.localeCompare(b.name);
  const rankDiff = getSuperflexRank(a) - getSuperflexRank(b);
  return rankDiff !== 0 ? rankDiff : a.name.localeCompare(b.name);
}

function buildDraftSlots(managers, rounds, draftMode) {
  const slots = [];
  for (let r = 1; r <= Number(rounds || 0); r += 1) {
    const indexedManagers = managers.map((manager, managerIndex) => ({ manager, managerIndex }));
    const order = draftMode === "snake" && r % 2 === 0 ? [...indexedManagers].reverse() : indexedManagers;
    order.forEach(({ manager, managerIndex }, i) => {
      slots.push({
        round: r,
        pickInRound: draftMode === "snake" && r % 2 === 0 ? managers.length - i : i + 1,
        overall: slots.length + 1,
        manager,
        managerIndex,
      });
    });
  }
  return slots;
}

function buildDraftBoardRows(draftSlots, picks, managers) {
  const pickByOverall = new Map(picks.map((pick) => [pick.overall, pick]));
  const maxRound = draftSlots.reduce((max, slot) => Math.max(max, slot.round), 0);
  return Array.from({ length: maxRound }, (_, index) => {
    const round = index + 1;
    const slots = draftSlots.filter((slot) => slot.round === round);
    return {
      round,
      cells: managers.map((manager, managerIndex) => {
        const slot = slots.find((candidate) => candidate.managerIndex === managerIndex);
        return { manager, managerIndex, slot, pick: slot ? pickByOverall.get(slot.overall) : null };
      }),
    };
  });
}

function normalizeName(name) {
  return (name || "").toString().trim().toLowerCase();
}

function getCommittedManagerName(draftValue, fallbackValue) {
  return draftValue.trim() || fallbackValue;
}

function hasManagerDraftedPlayer(picks, manager, asset) {
  if (!manager || !asset || asset.type === "Pick" || asset.type === "Division") return false;
  return picks.some((p) => p.manager === manager && p.asset.type !== "Pick" && p.asset.type !== "Division" && p.asset.name === asset.name);
}

function hasManagerDraftedDivision(picks, manager, asset) {
  if (!manager || !asset || asset.type !== "Division") return false;
  return picks.some((p) => p.manager === manager && p.asset.type === "Division");
}

function isAssetBlockedForManager(picks, manager, asset) {
  return hasManagerDraftedPlayer(picks, manager, asset) || hasManagerDraftedDivision(picks, manager, asset);
}

function canUserDraftForCurrentSlot(access, currentSlot) {
  if (!access || !currentSlot) return false;
  if (access.role === ACCESS_ROLES.ADMIN) return true;
  if (access.role === ACCESS_ROLES.TEAM) {
    if (Number.isInteger(access.managerIndex) && Number.isInteger(currentSlot.managerIndex)) {
      return access.managerIndex === currentSlot.managerIndex;
    }
    return normalizeName(access.team) === normalizeName(currentSlot.manager);
  }
  return false;
}

function canUserEditSetup(access) {
  return access?.role === ACCESS_ROLES.ADMIN;
}

function getAccessLabel(access, managers = []) {
  if (!access) return "Not selected";
  if (access.role === ACCESS_ROLES.ADMIN) return "Admin";
  if (access.role === ACCESS_ROLES.SPECTATOR) return "Spectator";
  if (Number.isInteger(access.managerIndex) && managers[access.managerIndex]) return managers[access.managerIndex];
  return access.team || "Team user";
}

function runSelfTests() {
  const managers = ["A", "B", "C", "D"];
  console.assert(buildDraftSlots(managers, 2, "snake").map((s) => s.manager).join(",") === "A,B,C,D,D,C,B,A", "Snake order should reverse in round 2");
  console.assert(buildDraftSlots(managers, 2, "linear").map((s) => s.manager).join(",") === "A,B,C,D,A,B,C,D", "Linear order should repeat");
  console.assert(buildDraftSlots(managers, 1, "linear")[2].managerIndex === 2, "Draft slots should preserve manager indexes");
  console.assert(buildDraftBoardRows(buildDraftSlots(managers, 2, "snake"), [], managers)[1].cells[0].slot.managerIndex === 0, "Draft board should align snake rows by manager index");
  console.assert(hasManagerDraftedPlayer([{ manager: "A", asset: { name: "Taysom Hill", type: "Player" } }], "A", { name: "Taysom Hill", type: "Player" }) === true, "Same manager cannot draft duplicate player copy");
  console.assert(hasManagerDraftedPlayer([{ manager: "A", asset: { name: "Taysom Hill", type: "Player" } }], "B", { name: "Taysom Hill", type: "Player" }) === false, "Different manager can draft duplicate player copy");
  console.assert(hasManagerDraftedPlayer([{ manager: "A", asset: { name: "2026 Rookie 1.01", type: "Pick" } }], "A", { name: "2026 Rookie 1.01", type: "Pick" }) === false, "Pick assets should not be blocked by player duplicate rule");
  console.assert(hasManagerDraftedDivision([{ manager: "A", asset: { name: "A Division Slot", type: "Division" } }], "A", { name: "B Division Slot", type: "Division" }) === true, "Same manager cannot draft two division slots");
  console.assert(hasManagerDraftedDivision([{ manager: "A", asset: { name: "A Division Slot", type: "Division" } }], "B", { name: "B Division Slot", type: "Division" }) === false, "Different manager can draft an available division slot");
  console.assert(buildDraftBoardRows(buildDraftSlots(managers, 1, "linear"), [], managers).length === 1, "Draft board should have one row per round");
  console.assert(compareAssetsBySortMode({ name: "Drake Maye" }, { name: "Andy Dalton" }, "sfRank") < 0, "Superflex rank sort should put better ranked players first");
  console.assert(compareAssetsBySortMode({ name: "Andy Dalton" }, { name: "Bryce Young" }, "alpha") < 0, "Alphabetical sort should sort by name");
  console.assert(parsePipeTable("name|type|position|team|sourceRoster|notes\nA|Player|QB|X|Y|Z").length === 1, "Pipe table parser should parse one asset");
  console.assert(csvEscape('A,"B"') === '"A,""B"""', "CSV escaping should double internal quotes and wrap comma values");
  console.assert(canUserDraftForCurrentSlot({ role: ACCESS_ROLES.ADMIN }, { manager: "A" }) === true, "Admin should be able to draft for any team");
  console.assert(canUserDraftForCurrentSlot({ role: ACCESS_ROLES.TEAM, team: "A" }, { manager: "A" }) === true, "Team user should draft on their own turn");
  console.assert(canUserDraftForCurrentSlot({ role: ACCESS_ROLES.TEAM, team: "Old Name", managerIndex: 0 }, { manager: "New Name", managerIndex: 0 }) === true, "Team user should still draft after team rename when manager index matches");
  console.assert(canUserDraftForCurrentSlot({ role: ACCESS_ROLES.TEAM, team: "Old Name", managerIndex: 0 }, { manager: "Other Team", managerIndex: 1 }) === false, "Team user should not draft for a different manager index");
  console.assert(canUserDraftForCurrentSlot({ role: ACCESS_ROLES.TEAM, team: "B" }, { manager: "A" }) === false, "Team user should not draft for another team");
  console.assert(canUserDraftForCurrentSlot({ role: ACCESS_ROLES.SPECTATOR }, { manager: "A" }) === false, "Spectator should not be able to draft");
  console.assert(canUserEditSetup({ role: ACCESS_ROLES.ADMIN }) === true, "Admin should be able to edit setup");
  console.assert(canUserEditSetup({ role: ACCESS_ROLES.SPECTATOR }) === false, "Spectator should not be able to edit setup");
  console.assert(normalizeName(" Team 1 ") === "team 1", "Team name normalization should trim and lowercase");
  console.assert(getCommittedManagerName("  New Team  ", "Old Team") === "New Team", "Manager input should commit trimmed names");
  console.assert(getCommittedManagerName("   ", "Old Team") === "Old Team", "Manager input should keep old name if blank");
  console.assert(typeof isFirebaseConfigured() === "boolean", "Firebase configuration check should return a boolean");
  console.assert(sanitizeRemoteState({ managers: ["A"], picks: [] }).managers[0] === "A", "Remote state sanitizer should preserve managers");
  console.assert(sanitizeRemoteState({ filter: "QB", mainView: "board", selectedTeamIndex: 2 }).filter === undefined, "Remote state should not include personal UI state");
  const testLineup = buildLineupGroups([
    { name: "QB1", type: "Player", position: "QB" },
    { name: "RB1", type: "Player", position: "RB" },
    { name: "RB2", type: "Player", position: "RB" },
    { name: "WR1", type: "Player", position: "WR" },
    { name: "WR2", type: "Player", position: "WR" },
    { name: "TE1", type: "Player", position: "TE" },
    { name: "DEF1", type: "Player", position: "DEF" },
    { name: "2026 Rookie 1.01", type: "Pick", position: "Draft Pick" },
    { name: "A Division Slot", type: "Division", position: "Division" },
  ]);
  console.assert(testLineup.starters.length === 10, "Lineup should have 10 starter slots");
  console.assert(testLineup.draftPicks.length === 1 && testLineup.divisions.length === 1, "Lineup should split picks and divisions");
}

if (typeof console !== "undefined") runSelfTests();

export default function DynastyDispersalDraftTool() {
  const remoteDocRef = useMemo(() => getDraftDocRef(), []);
  const firebaseEnabled = Boolean(remoteDocRef);
  const remoteLoadedRef = useRef(false);
  const skipNextRemoteSaveRef = useRef(false);

  const [assets, setAssets] = useState(() => parsePipeTable(RAW_ASSETS));
  const [managers, setManagers] = useState(DEFAULT_MANAGERS);
  const [draftMode, setDraftMode] = useState("snake");
  const [rounds, setRounds] = useState(35);
  const [picks, setPicks] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [newAsset, setNewAsset] = useState({ name: "", type: "Player", position: "", team: "", sourceRoster: "", notes: "" });
  const [mainView, setMainView] = useState("pool");
  const [sortMode, setSortMode] = useState("sfRank");
  const [showSetupPanel, setShowSetupPanel] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [syncMessage, setSyncMessage] = useState(firebaseEnabled ? "Connecting to Firebase..." : "Firebase config missing");
  const [access, setAccess] = useState(null);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(0);
  const [adminCode, setAdminCode] = useState("");
  const [accessError, setAccessError] = useState("");
  const [activeRosterTab, setActiveRosterTab] = useState(0);

  const draftSlots = useMemo(() => buildDraftSlots(managers, rounds, draftMode), [managers, rounds, draftMode]);
  const currentSlot = draftSlots[picks.length];
  const userCanDraftCurrentPick = canUserDraftForCurrentSlot(access, currentSlot);
  const userCanEditSetup = canUserEditSetup(access);
  const draftedIds = useMemo(() => new Set(picks.map((p) => p.asset.id)), [picks]);
  const availableAssets = useMemo(() => assets.filter((asset) => !draftedIds.has(asset.id)), [assets, draftedIds]);
  const draftBoardRows = useMemo(() => buildDraftBoardRows(draftSlots, picks, managers), [draftSlots, picks, managers]);
  const filterOptions = ["All", "Player", "Pick", "Division", "QB", "RB", "WR", "TE", "DEF"];

  useEffect(() => {
    if (!remoteDocRef) return;
    const unsubscribe = onSnapshot(
      remoteDocRef,
      async (snapshot) => {
        if (!snapshot.exists()) {
          const initialState = sanitizeRemoteState({
            assets: parsePipeTable(RAW_ASSETS),
            managers: DEFAULT_MANAGERS,
            draftMode: "snake",
            rounds: 35,
            picks: [],
          });
          await setDoc(remoteDocRef, { ...initialState, updatedAt: serverTimestamp() }, { merge: true });
          remoteLoadedRef.current = true;
          setSyncMessage("Created Firebase draft room");
          return;
        }

        const data = sanitizeRemoteState(snapshot.data());
        skipNextRemoteSaveRef.current = true;
        setAssets(data.assets);
        setManagers(data.managers);
        setDraftMode(data.draftMode);
        setRounds(data.rounds);
        setPicks(data.picks);
        remoteLoadedRef.current = true;
        setSyncMessage("Live synced with Firebase");
      },
      (error) => {
        console.warn("Unable to subscribe to remote draft state", error);
        setSyncMessage("Firebase connection failed");
      }
    );
    return unsubscribe;
  }, [remoteDocRef]);

  useEffect(() => {
    if (!remoteDocRef || !remoteLoadedRef.current) return;
    if (skipNextRemoteSaveRef.current) {
      skipNextRemoteSaveRef.current = false;
      return;
    }

    const state = sanitizeRemoteState({ assets, managers, draftMode, rounds, picks });
    const timeout = window.setTimeout(async () => {
      try {
        await setDoc(remoteDocRef, { ...state, updatedAt: serverTimestamp() }, { merge: true });
        setSyncMessage("Live synced with Firebase");
      } catch (error) {
        console.warn("Unable to save remote draft state", error);
        setSyncMessage("Firebase save failed");
      }
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [assets, managers, draftMode, rounds, picks, remoteDocRef]);

  const filteredAssets = availableAssets.filter((asset) => {
    const matchesType = filter === "All" || asset.type === filter || asset.position === filter;
    const haystack = `${asset.name} ${asset.type} ${asset.position} ${asset.team} ${asset.sourceRoster} ${asset.notes}`.toLowerCase();
    return matchesType && haystack.includes(query.toLowerCase());
  });

  const sortedAssets = [...filteredAssets].sort((a, b) => compareAssetsBySortMode(a, b, sortMode));
  const rosterByManager = managers.map((manager, managerIndex) => ({ manager, managerIndex, assets: picks.filter((p) => p.managerIndex === managerIndex || p.manager === manager).map((p) => p.asset) }));

  useEffect(() => {
    if (access?.role === ACCESS_ROLES.TEAM && Number.isInteger(access.managerIndex)) {
      setActiveRosterTab(access.managerIndex);
    }
  }, [access]);

  async function draftAsset(asset) {
    if (!remoteDocRef) {
      setSyncMessage("Firebase config missing — cannot draft");
      return;
    }
    if (!currentSlot || !userCanDraftCurrentPick) return;
    if (isAssetBlockedForManager(picks, currentSlot.manager, asset)) return;

    try {
      await runTransaction(cachedFirestore, async (transaction) => {
        const snapshot = await transaction.get(remoteDocRef);
        const remoteData = snapshot.exists() ? sanitizeRemoteState(snapshot.data()) : sanitizeRemoteState({});
        const remotePicks = Array.isArray(remoteData.picks) ? remoteData.picks : [];
        const remoteSlots = buildDraftSlots(remoteData.managers, remoteData.rounds, remoteData.draftMode);
        const slot = remoteSlots[remotePicks.length];
        if (!slot) return;
        if (!canUserDraftForCurrentSlot(access, slot)) return;
        if (remotePicks.some((pick) => pick.asset?.id === asset.id)) return;
        if (isAssetBlockedForManager(remotePicks, slot.manager, asset)) return;

        transaction.set(remoteDocRef, {
          ...sanitizeRemoteState({ ...remoteData, picks: [...remotePicks, { ...slot, asset, timestamp: new Date().toISOString() }] }),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      });
      setSyncMessage("Pick saved to Firebase");
    } catch (error) {
      console.warn("Unable to draft asset remotely", error);
      setSyncMessage("Draft pick failed to save remotely");
    }
  }

  function enterAsTeam() {
    const safeManagerIndex = Math.min(Math.max(Number(selectedTeamIndex) || 0, 0), managers.length - 1);
    setShowSetupPanel(false);
    setAccess({ role: ACCESS_ROLES.TEAM, team: managers[safeManagerIndex], managerIndex: safeManagerIndex });
    setAccessError("");
  }

  function enterAsAdmin() {
    if (adminCode.trim().toUpperCase() !== ADMIN_CODE) {
      setAccessError("Incorrect admin code.");
      return;
    }
    setShowSetupPanel(true);
    setAccess({ role: ACCESS_ROLES.ADMIN });
    setAccessError("");
  }

  function enterAsSpectator() {
    setShowSetupPanel(false);
    setAccess({ role: ACCESS_ROLES.SPECTATOR });
    setAccessError("");
  }

  function switchAccess() {
    setAccess(null);
    setAdminCode("");
    setAccessError("");
  }

  function resetDraft() {
    setPicks([]);
  }

  function clearSavedDraft() {
    setPicks([]);
    setAssets(parsePipeTable(RAW_ASSETS));
    setManagers(DEFAULT_MANAGERS);
    setDraftMode("snake");
    setRounds(35);
    setFilter("All");
    setMainView("pool");
    setSortMode("sfRank");
    setShowSetupPanel(true);
    setSelectedTeamIndex(0);
  }

  function addAsset() {
    if (!newAsset.name.trim() || !userCanEditSetup) return;
    setAssets((prev) => [...prev, { ...newAsset, id: makeId(), name: newAsset.name.trim() }]);
    setNewAsset({ name: "", type: "Player", position: "", team: "", sourceRoster: "", notes: "" });
  }

  function exportCsv(filename, rows) {
    const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setExportMessage(`Downloaded ${filename}`);
    window.setTimeout(() => setExportMessage(""), 2500);
  }

  function exportResultsCsv() {
    exportCsv("dispersal-draft-results.csv", [
      ["Overall", "Round", "Pick", "Manager", "Asset", "Type", "Position", "NFL Team", "Source Roster", "Notes"],
      ...picks.map((p) => [p.overall, p.round, p.pickInRound, p.manager, p.asset.name, p.asset.type, p.asset.position, p.asset.team, p.asset.sourceRoster, p.asset.notes]),
    ]);
  }

  function exportAvailableCsv() {
    exportCsv("remaining-dispersal-assets.csv", [
      ["Name", "Type", "Position", "NFL Team", "Source Roster", "Notes"],
      ...availableAssets.map((a) => [a.name, a.type, a.position, a.team, a.sourceRoster, a.notes]),
    ]);
  }

  function handleCsvUpload(event) {
    if (!userCanEditSetup) return;
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseAssetsCsv(String(e.target?.result || ""));
      if (parsed.length) setAssets(parsed);
      setPicks([]);
    };
    reader.readAsText(file);
  }

  if (!firebaseEnabled) {
    return (
      <div className="min-h-screen bg-slate-950 p-4 text-slate-100">
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-3xl items-center justify-center">
          <Card className="w-full rounded-3xl shadow-lg shadow-black/20">
            <CardContent className="space-y-4 p-6 md:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-950/50 px-3 py-1 text-sm font-medium text-amber-200"><Icon>🔥</Icon> Firebase required</div>
              <h1 className="text-3xl font-bold tracking-tight">Paste your Firebase web config</h1>
              <p className="text-slate-300">This version is Firebase-only. Replace the PASTE_FIREBASE_* values at the top of the file, commit to GitHub, and Vercel will redeploy the live draft app.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!access) {
    return (
      <div className="min-h-screen bg-slate-950 p-4 text-slate-100">
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-3xl items-center justify-center">
          <Card className="w-full rounded-3xl shadow-lg shadow-black/20">
            <CardContent className="space-y-6 p-6 md:p-8">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-sm font-medium text-slate-300"><Icon>🚤</Icon> The BOAT</div>
                <h1 className="text-3xl font-bold tracking-tight">Who are you drafting as?</h1>
                <p className="mt-2 text-slate-300">Choose your replacement team, enter as admin, or spectate without making picks.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                  <div className="mb-3 font-semibold">Team user</div>
                  <select className={`mb-3 w-full ${inputClass}`} value={selectedTeamIndex} onChange={(e) => setSelectedTeamIndex(Number(e.target.value))}>
                    {managers.map((manager, index) => (
                      <option key={`${index}-${manager}`} value={index}>Team {index + 1}: {manager}</option>
                    ))}
                  </select>
                  <Button className="w-full rounded-xl" onClick={enterAsTeam}>Enter as team</Button>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                  <div className="mb-3 font-semibold">Admin</div>
                  <input className={`mb-3 w-full ${inputClass}`} placeholder="Admin code" type="password" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") enterAsAdmin(); }} />
                  <Button className="w-full rounded-xl" onClick={enterAsAdmin}>Enter as admin</Button>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                  <div className="mb-3 font-semibold">Spectator</div>
                  <p className="mb-3 text-sm text-slate-400">View the board and pool without making selections.</p>
                  <Button variant="outline" className="w-full rounded-xl" onClick={enterAsSpectator}>Spectate</Button>
                </div>
              </div>
              {accessError && <div className="rounded-2xl border border-red-800 bg-red-950/40 p-3 text-sm text-red-200">{accessError}</div>}
              <div className="text-xs text-slate-500">Firebase live sync is enabled for the shared draft room.</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-lg shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-sm font-medium text-slate-300"><Icon>🏆</Icon> The BOAT Dynasty dispersal draft board</div>
              <h1 className="text-3xl font-bold tracking-tight">The BOAT Dispersal Draft Tool</h1>
              <p className="mt-2 max-w-2xl text-slate-300">Draft players, rookie picks, and division slots. Duplicate player copies are allowed, but one replacement team cannot draft both copies or more than one division slot.</p>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <div className="flex flex-wrap items-center justify-end gap-2 text-sm">
                <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-slate-300">Mode: {getAccessLabel(access, managers)}</span>
                <span className="rounded-full border border-emerald-700 bg-emerald-950/40 px-3 py-1 text-emerald-200">Firebase live</span>
                <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-cyan-300">{syncMessage}</span>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={switchAccess}>Switch</Button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
                <Stat label="Assets" value={assets.length} />
                <Stat label="Available" value={availableAssets.length} />
                <Stat label="Drafted" value={picks.length} />
                <Stat label="Slots" value={draftSlots.length} />
              </div>
            </div>
          </div>
        </header>

        <div className={showSetupPanel ? "grid gap-4 lg:grid-cols-[360px_1fr]" : "grid gap-4 lg:grid-cols-1"}>
          {showSetupPanel && (
            <aside className="space-y-4">
              <SetupCard managers={managers} setManagers={setManagers} rounds={rounds} setRounds={setRounds} draftMode={draftMode} setDraftMode={setDraftMode} currentSlot={currentSlot} access={access} userCanDraftCurrentPick={userCanDraftCurrentPick} userCanEditSetup={userCanEditSetup} picks={picks} undoPick={() => setPicks((prev) => prev.slice(0, -1))} resetDraft={resetDraft} clearSavedDraft={clearSavedDraft} setShowSetupPanel={setShowSetupPanel} />
              <AssetsAdminCard userCanEditSetup={userCanEditSetup} newAsset={newAsset} setNewAsset={setNewAsset} addAsset={addAsset} handleCsvUpload={handleCsvUpload} setShowSetupPanel={setShowSetupPanel} />
            </aside>
          )}

          <main className="space-y-4">
            <MainViewHeader currentSlot={currentSlot} userCanDraftCurrentPick={userCanDraftCurrentPick} mainView={mainView} setMainView={setMainView} showSetupPanel={showSetupPanel} setShowSetupPanel={setShowSetupPanel} />
            {mainView === "board" ? (
              <DraftBoard managers={managers} rows={draftBoardRows} currentSlot={currentSlot} draftMode={draftMode} showSetupPanel={showSetupPanel} />
            ) : (
              <AvailablePool sortedAssets={sortedAssets} filteredAssets={filteredAssets} sortMode={sortMode} setSortMode={setSortMode} query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} filterOptions={filterOptions} currentSlot={currentSlot} picks={picks} userCanDraftCurrentPick={userCanDraftCurrentPick} draftAsset={draftAsset} showSetupPanel={showSetupPanel} />
            )}
            <div className="grid gap-4 xl:grid-cols-2">
              <DraftResults picks={picks} exportMessage={exportMessage} exportAvailableCsv={exportAvailableCsv} exportResultsCsv={exportResultsCsv} />
              <Rosters rosterByManager={rosterByManager} activeRosterTab={activeRosterTab} setActiveRosterTab={setActiveRosterTab} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-800 p-3">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

function SetupCard(props) {
  const { managers, setManagers, rounds, setRounds, draftMode, setDraftMode, currentSlot, access, userCanDraftCurrentPick, userCanEditSetup, picks, undoPick, resetDraft, clearSavedDraft, setShowSetupPanel } = props;
  return (
    <Card className="rounded-3xl shadow-lg shadow-black/20">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 font-semibold"><Icon>👥</Icon> Draft setup</div>
            {!userCanEditSetup && <div className="mt-1 text-xs text-amber-200">Read-only unless you enter as admin.</div>}
          </div>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowSetupPanel(false)}>Hide</Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Replacement teams</label>
          {managers.map((manager, idx) => (
            <ManagerNameInput key={idx} value={manager} disabled={!userCanEditSetup} onCommit={(nextName) => setManagers((prev) => prev.map((m, i) => (i === idx ? nextName : m)))} />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-sm font-medium">
            <span>Rounds</span>
            <input type="number" min="1" max="60" className={`w-full ${inputClass}`} value={rounds} disabled={!userCanEditSetup} onChange={(e) => setRounds(e.target.value)} />
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span>Draft style</span>
            <select className={`w-full ${inputClass}`} value={draftMode} disabled={!userCanEditSetup} onChange={(e) => setDraftMode(e.target.value)}>
              <option value="snake">Snake</option>
              <option value="linear">Linear</option>
            </select>
          </label>
        </div>

        <div className="rounded-2xl bg-emerald-950/50 p-4">
          <div className="text-sm font-medium text-emerald-300">On the clock</div>
          <div className="mt-1 text-xl font-bold text-emerald-100">{currentSlot ? currentSlot.manager : "Draft complete"}</div>
          <div className="text-sm text-emerald-400">{currentSlot ? `Pick ${currentSlot.overall} · Round ${currentSlot.round}.${currentSlot.pickInRound}` : "All draft slots are filled."}</div>
          {currentSlot && !userCanDraftCurrentPick && (
            <div className="mt-2 rounded-xl border border-amber-800 bg-amber-950/40 px-3 py-2 text-xs text-amber-200">
              You are in {getAccessLabel(access, managers)} mode. Only {currentSlot.manager} or an admin can make this pick.
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="rounded-xl" onClick={undoPick} disabled={!picks.length}><span className="mr-2">↩</span> Undo</Button>
          <Button variant="outline" className="rounded-xl" onClick={resetDraft} disabled={!userCanEditSetup}><span className="mr-2">↻</span> Reset draft</Button>
        </div>
        <Button variant="outline" className="w-full rounded-xl border-red-800 text-red-200 hover:bg-red-950/40" onClick={clearSavedDraft} disabled={!userCanEditSetup}>Clear draft + restore defaults</Button>
      </CardContent>
    </Card>
  );
}

function ManagerNameInput({ value, disabled, onCommit }) {
  const [draftValue, setDraftValue] = useState(value);
  useEffect(() => setDraftValue(value), [value]);

  function commit() {
    const nextName = getCommittedManagerName(draftValue, value);
    setDraftValue(nextName);
    if (nextName !== value) onCommit(nextName);
  }

  return (
    <input
      className={`w-full ${inputClass}`}
      value={draftValue}
      disabled={disabled}
      onChange={(e) => setDraftValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
    />
  );
}

function AssetsAdminCard({ userCanEditSetup, newAsset, setNewAsset, addAsset, handleCsvUpload, setShowSetupPanel }) {
  return (
    <Card className="rounded-3xl shadow-lg shadow-black/20">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 font-semibold"><Icon>⬆️</Icon> Assets</div>
            {!userCanEditSetup && <div className="mt-1 text-xs text-amber-200">Read-only unless you enter as admin.</div>}
          </div>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowSetupPanel(false)}>Hide</Button>
        </div>
        <p className="text-sm text-slate-300">Upload CSV with columns: name,type,position,team,sourceRoster,notes. This replaces the loaded pool.</p>
        <input type="file" accept=".csv" className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100" disabled={!userCanEditSetup} onChange={handleCsvUpload} />
        <div className="grid grid-cols-2 gap-2">
          <input className={smallInputClass} placeholder="Asset name" value={newAsset.name} disabled={!userCanEditSetup} onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} />
          <select className={smallInputClass} value={newAsset.type} disabled={!userCanEditSetup} onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}>
            <option>Player</option>
            <option>Pick</option>
            <option>Division</option>
          </select>
          <input className={smallInputClass} placeholder="Position" value={newAsset.position} disabled={!userCanEditSetup} onChange={(e) => setNewAsset({ ...newAsset, position: e.target.value })} />
          <input className={smallInputClass} placeholder="NFL team" value={newAsset.team} disabled={!userCanEditSetup} onChange={(e) => setNewAsset({ ...newAsset, team: e.target.value })} />
          <input className={smallInputClass} placeholder="Source roster" value={newAsset.sourceRoster} disabled={!userCanEditSetup} onChange={(e) => setNewAsset({ ...newAsset, sourceRoster: e.target.value })} />
          <input className={smallInputClass} placeholder="Notes" value={newAsset.notes} disabled={!userCanEditSetup} onChange={(e) => setNewAsset({ ...newAsset, notes: e.target.value })} />
        </div>
        <Button className="w-full rounded-xl" onClick={addAsset} disabled={!userCanEditSetup}>Add asset</Button>
      </CardContent>
    </Card>
  );
}

function MainViewHeader({ currentSlot, userCanDraftCurrentPick, mainView, setMainView, showSetupPanel, setShowSetupPanel }) {
  return (
    <Card className="rounded-3xl shadow-lg shadow-black/20">
      <CardContent className="p-3">
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-300">Main view</div>
            <div className="mt-1 inline-flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-700 bg-emerald-950/40 px-3 py-2 text-sm">
              <span className="font-semibold text-emerald-300">On the clock:</span>
              <span className="font-bold text-emerald-100">{currentSlot ? currentSlot.manager : "Draft complete"}</span>
              {currentSlot && <span className="text-emerald-400">Pick {currentSlot.overall} · R{currentSlot.round}.{currentSlot.pickInRound}</span>}
              {currentSlot && !userCanDraftCurrentPick && <span className="rounded-full bg-amber-950/60 px-2 py-0.5 text-xs font-medium text-amber-200">Locked for you</span>}
            </div>
          </div>
          {!showSetupPanel && <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowSetupPanel(true)}>Show setup</Button>}
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-950 p-1">
          <button className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${mainView === "pool" ? "bg-cyan-500 text-slate-950 shadow-lg shadow-black/20" : "text-slate-400 hover:bg-slate-700"}`} onClick={() => setMainView("pool")}>Available Pool</button>
          <button className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${mainView === "board" ? "bg-cyan-500 text-slate-950 shadow-lg shadow-black/20" : "text-slate-400 hover:bg-slate-700"}`} onClick={() => setMainView("board")}>Draft Board</button>
        </div>
      </CardContent>
    </Card>
  );
}

function DraftBoard({ managers, rows, currentSlot, draftMode, showSetupPanel }) {
  return (
    <Card className="rounded-3xl shadow-lg shadow-black/20">
      <CardContent className="p-5">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 font-semibold"><Icon>🧩</Icon> Draft board grid</div>
            <p className="mt-1 text-sm text-slate-400">Rounds are rows. Replacement teams are columns. Filled cells show completed picks.</p>
          </div>
          <div className="text-sm text-slate-400">{draftMode === "snake" ? "Snake order" : "Linear order"}</div>
        </div>
        <div className={showSetupPanel ? "max-h-[760px] overflow-auto rounded-2xl border border-slate-700" : "max-h-[820px] overflow-auto rounded-2xl border border-slate-700"}>
          <table className={showSetupPanel ? "w-full min-w-[900px] border-collapse text-left text-sm" : "w-full min-w-[1100px] border-collapse text-left text-sm"}>
            <thead className={tableHeadClass}>
              <tr>
                <th className="w-20 border-b border-slate-800 p-3">Round</th>
                {managers.map((manager, index) => <th key={`${index}-${manager}`} className="min-w-56 border-b border-slate-800 p-3">{manager}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.round} className="border-b border-slate-800 bg-slate-900 align-top">
                  <td className="sticky left-0 bg-slate-900 p-3 font-bold text-slate-200">R{row.round}</td>
                  {row.cells.map(({ manager, managerIndex, slot, pick }) => (
                    <td key={`${row.round}-${managerIndex}`} className={`p-2 ${currentSlot?.overall === slot?.overall ? "bg-emerald-950/50" : ""}`}>
                      {slot ? (
                        <div className={`min-h-24 rounded-2xl border border-slate-700 p-3 ${pick ? "bg-slate-950 shadow-lg shadow-black/20" : currentSlot?.overall === slot.overall ? "border-emerald-500 bg-emerald-950/50" : "bg-slate-800/70"}`}>
                          <div className="mb-2 flex items-center justify-between gap-2 text-xs text-slate-400">
                            <span>Pick {slot.overall}</span>
                            <span>R{slot.round}.{slot.pickInRound}</span>
                          </div>
                          {pick ? (
                            <div>
                              <div className="font-semibold leading-snug">{pick.asset.name}</div>
                              <div className="mt-2 flex items-center gap-2"><AssetBadge asset={pick.asset} compact /><span className="text-xs text-slate-400">{pick.asset.team}</span></div>
                            </div>
                          ) : (
                            <div className="text-sm text-slate-500">Upcoming pick</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-600">—</div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function AvailablePool(props) {
  const { sortedAssets, filteredAssets, sortMode, setSortMode, query, setQuery, filter, setFilter, filterOptions, currentSlot, picks, userCanDraftCurrentPick, draftAsset, showSetupPanel } = props;
  return (
    <Card className="rounded-3xl shadow-lg shadow-black/20">
      <CardContent className="p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 font-semibold"><Icon>🔎</Icon> Available pool</div>
          <div className="flex flex-wrap gap-2">
            <select className={inputClass} value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
              <option value="sfRank">Sort: SF Dynasty Rank</option>
              <option value="alpha">Sort: Alphabetical</option>
            </select>
            <input className={`w-full md:w-72 ${inputClass}`} placeholder="Search players, picks, teams..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <select className={inputClass} value={filter} onChange={(e) => setFilter(e.target.value)}>
              {filterOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
        <div className={showSetupPanel ? "max-h-[520px] overflow-auto rounded-2xl border border-slate-700" : "max-h-[760px] overflow-auto rounded-2xl border border-slate-700"}>
          <table className="w-full text-left text-sm">
            <thead className={tableHeadClass}>
              <tr><th className="p-3">Rank</th><th>Asset</th><th>Type</th><th>Pos</th><th>Team</th><th>Original / Owner</th><th></th></tr>
            </thead>
            <tbody>
              {sortedAssets.map((asset) => {
                const owned = currentSlot ? isAssetBlockedForManager(picks, currentSlot.manager, asset) : false;
                return (
                  <tr key={asset.id} className="border-t border-slate-800 bg-slate-900 hover:bg-slate-800">
                    <td className="p-3 text-sm font-semibold text-slate-400">{getSuperflexRank(asset) === 9999 ? "—" : getSuperflexRank(asset)}</td>
                    <td className="p-3"><div className="font-semibold">{asset.name}</div><div className="text-xs text-slate-400">{asset.notes}</div></td>
                    <td><AssetBadge asset={asset} /></td>
                    <td><span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${getAssetColorClasses(asset)}`}>{asset.position}</span></td>
                    <td>{asset.team}</td>
                    <td>{asset.sourceRoster}</td>
                    <td className="p-3 text-right"><Button size="sm" className="rounded-xl" onClick={() => draftAsset(asset)} disabled={!currentSlot || owned || !userCanDraftCurrentPick}>{owned ? (asset.type === "Division" ? "Division Owned" : "Owned") : !userCanDraftCurrentPick ? "Locked" : "Draft"}</Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!filteredAssets.length && <div className="p-8 text-center text-slate-400">No matching available assets.</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function DraftResults({ picks, exportMessage, exportAvailableCsv, exportResultsCsv }) {
  return (
    <Card className="rounded-3xl shadow-lg shadow-black/20">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 font-semibold"><Icon>📋</Icon> Draft results</div>
            {exportMessage && <div className="mt-1 text-xs text-cyan-300">{exportMessage}</div>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={exportAvailableCsv}><span className="mr-2">↓</span> Remaining</Button>
            <Button size="sm" className="rounded-xl" onClick={exportResultsCsv}><span className="mr-2">↓</span> Results</Button>
          </div>
        </div>
        <div className="max-h-[390px] overflow-auto rounded-2xl border border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className={tableHeadClass}><tr><th className="p-3">Pick</th><th>Manager</th><th>Asset</th></tr></thead>
            <tbody>
              {picks.map((p) => (
                <tr key={`${p.overall}-${p.asset.id}`} className="border-t border-slate-800 bg-slate-900">
                  <td className="p-3 font-medium">{p.overall}<div className="text-xs text-slate-400">R{p.round}.{p.pickInRound}</div></td>
                  <td>{p.manager}</td>
                  <td><div className="font-semibold">{p.asset.name}</div><div className="mt-1 flex items-center gap-2 text-xs text-slate-400"><AssetBadge asset={p.asset} compact /> <span>{p.asset.team}</span></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!picks.length && <div className="p-8 text-center text-slate-400">No picks yet.</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function Rosters({ rosterByManager, activeRosterTab, setActiveRosterTab }) {
  const activeRoster = rosterByManager[activeRosterTab] || rosterByManager[0];
  const groups = buildLineupGroups(activeRoster?.assets || []);

  return (
    <Card className="rounded-3xl shadow-lg shadow-black/20">
      <CardContent className="p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-semibold">New team rosters</div>
            <p className="mt-1 text-sm text-slate-400">Starter slots auto-fill by Superflex dynasty rank, with remaining players on the bench.</p>
          </div>
          <div className="text-sm text-slate-400">{activeRoster?.assets.length || 0} total assets</div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2 rounded-2xl bg-slate-950 p-2">
          {rosterByManager.map(({ manager, managerIndex, assets }) => (
            <button
              key={`${managerIndex}-${manager}`}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${activeRosterTab === managerIndex ? "bg-cyan-500 text-slate-950" : "text-slate-300 hover:bg-slate-800"}`}
              onClick={() => setActiveRosterTab(managerIndex)}
            >
              Team {managerIndex + 1}: {manager}
              <span className="ml-2 rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">{assets.length}</span>
            </button>
          ))}
        </div>

        {!activeRoster ? (
          <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6 text-center text-slate-400">No roster selected.</div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="font-semibold">{activeRoster.manager}</div>
                <div className="text-xs text-slate-400">1QB · 2RB · 2WR · 1TE · 2 FLEX · 1 SUPERFLEX · 1 DEF</div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {groups.starters.map((entry, index) => (
                  <LineupSlot key={`${entry.slot}-${index}`} slot={entry.slot} asset={entry.asset} />
                ))}
              </div>
            </div>

            <RosterSection title="Bench" count={groups.bench.length} emptyText="No bench players yet." assets={groups.bench} />
            <RosterSection title="Draft picks" count={groups.draftPicks.length} emptyText="No draft picks yet." assets={groups.draftPicks} />
            <RosterSection title="Division" count={groups.divisions.length} emptyText="No division slot yet." assets={groups.divisions} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LineupSlot({ slot, asset }) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-3">
      <div className="min-w-24 text-xs font-bold tracking-wide text-slate-400">{slot}</div>
      {asset ? (
        <div className="flex flex-1 items-center justify-between gap-3">
          <div>
            <div className="font-semibold leading-snug">{asset.name}</div>
            <div className="text-xs text-slate-400">{asset.team || asset.sourceRoster}</div>
          </div>
          <AssetBadge asset={asset} compact />
        </div>
      ) : (
        <div className="flex-1 text-sm text-slate-500">Empty</div>
      )}
    </div>
  );
}

function RosterSection({ title, count, emptyText, assets }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-slate-400">{count}</div>
      </div>
      {assets.length ? (
        <div className="grid gap-2 md:grid-cols-2">
          {assets.map((asset) => (
            <div key={asset.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-3">
              <div>
                <div className="font-semibold leading-snug">{asset.name}</div>
                <div className="text-xs text-slate-400">{asset.team || asset.sourceRoster || asset.notes}</div>
              </div>
              <AssetBadge asset={asset} compact />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-800 p-4 text-sm text-slate-500">{emptyText}</div>
      )}
    </div>
  );
}
