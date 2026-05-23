import fs from "node:fs/promises";
import path from "node:path";

export interface StaData {
  version: number;
  wins: number;
  losses: number;
  totalKills: number;
  totalScore: number;
  gamesPlayed: number;
  privateKey: string;
}

export interface Decoration {
  medal: Medal;
  star1: Star;
  star2: Star;
  star3: Star;
}

export type StaContent = string;
export type StaPath = string;

export const STA_DIR = "multiplay/players";

export const MEDAL = {
  BABY: -1,
  NONE: 0,
  LEVEL1: 1,
  LEVEL2: 2,
  LEVEL3: 3
} as const;

export type Medal = (typeof MEDAL)[keyof typeof MEDAL];

export const STAR = {
  NONE: 0,
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3
} as const;

export type Star = (typeof STAR)[keyof typeof STAR];

export const DECORATION = {
  NONE: { medal: MEDAL.NONE, star1: STAR.NONE, star2: STAR.NONE, star3: STAR.NONE },
  BRONZE_STARS: { medal: MEDAL.NONE, star1: STAR.BRONZE, star2: STAR.BRONZE, star3: STAR.BRONZE },
  SILVER_STARS: { medal: MEDAL.NONE, star1: STAR.SILVER, star2: STAR.SILVER, star3: STAR.SILVER },
  GOLD_STARS: { medal: MEDAL.NONE, star1: STAR.GOLD, star2: STAR.GOLD, star3: STAR.GOLD },
  NOOB: { medal: MEDAL.BABY, star1: STAR.NONE, star2: STAR.NONE, star3: STAR.NONE },
  SILVER: { medal: MEDAL.LEVEL1, star1: STAR.SILVER, star2: STAR.SILVER, star3: STAR.SILVER },
  BRONZE: { medal: MEDAL.LEVEL2, star1: STAR.BRONZE, star2: STAR.BRONZE, star3: STAR.BRONZE },
  HACKER: { medal: MEDAL.LEVEL3, star1: STAR.GOLD, star2: STAR.GOLD, star3: STAR.GOLD }
} as const satisfies Record<string, Decoration>;

export interface StaUpdates {
  wins?: number;
  losses?: number;
  totalKills?: number;
  totalScore?: number;
  gamesPlayed?: number;
  privateKey?: string;
}

const STA_PATTERN =
  /^WZ\.STA\.v(?<version>\d+)\r?\n(?<wins>\d+) (?<losses>\d+) (?<totalKills>\d+) (?<totalScore>\d+) (?<gamesPlayed>\d+)(?:\r?\n(?<privateKey>.*))?$/;

function randomValue<T extends number>(values: readonly T[]): T {
  return values[Math.floor(values.length * Math.random())] ?? values[0];
}

export function getRandomDecoration(): Decoration {
  return {
    medal: randomValue(Object.values(MEDAL)),
    star1: randomValue(Object.values(STAR)),
    star2: randomValue(Object.values(STAR)),
    star3: randomValue(Object.values(STAR))
  };
}

export function stringify(
  version = 3,
  wins = 0,
  losses = 0,
  totalKills = 0,
  totalScore = 0,
  gamesPlayed = 0,
  privateKey = ""
): StaContent {
  return `WZ.STA.v${version}\n${wins} ${losses} ${totalKills} ${totalScore} ${gamesPlayed}\n${privateKey}`;
}

export function stringifyStaData(staData: StaData): StaContent {
  return stringify(
    staData.version,
    staData.wins,
    staData.losses,
    staData.totalKills,
    staData.totalScore,
    staData.gamesPlayed,
    staData.privateKey
  );
}

export function getStaPath(wzDir: string, playerName: string): StaPath {
  return path.join(wzDir, STA_DIR, `${playerName}.sta2`);
}

export async function readStaFile(staPath: StaPath): Promise<StaContent | null> {
  try {
    return await fs.readFile(staPath, "utf8");
  } catch {
    return null;
  }
}

export function parseStaContent(staContent: StaContent): StaData | null {
  const match = STA_PATTERN.exec(staContent);

  if (!match?.groups) {
    return null;
  }

  return {
    version: Number.parseInt(match.groups.version, 10),
    wins: Number.parseInt(match.groups.wins, 10),
    losses: Number.parseInt(match.groups.losses, 10),
    totalKills: Number.parseInt(match.groups.totalKills, 10),
    totalScore: Number.parseInt(match.groups.totalScore, 10),
    gamesPlayed: Number.parseInt(match.groups.gamesPlayed, 10),
    privateKey: match.groups.privateKey ?? ""
  };
}

export async function writeStaFile(staPath: StaPath, updates: StaUpdates): Promise<void> {
  const staContent = await readStaFile(staPath);

  if (!staContent) {
    await fs.mkdir(path.dirname(staPath), { recursive: true });
    await fs.writeFile(staPath, stringify(3, updates.wins, updates.losses, updates.totalKills, updates.totalScore, updates.gamesPlayed, updates.privateKey));
    return;
  }

  const staData = parseStaContent(staContent);

  if (!staData) {
    throw new Error(`Unable to parse sta file: ${staPath}`);
  }

  const newStaData: StaData = {
    version: staData.version,
    wins: updates.wins ?? staData.wins,
    losses: updates.losses ?? staData.losses,
    totalKills: updates.totalKills ?? staData.totalKills,
    totalScore: updates.totalScore ?? staData.totalScore,
    gamesPlayed: updates.gamesPlayed ?? staData.gamesPlayed,
    privateKey: updates.privateKey ?? staData.privateKey
  };

  await fs.writeFile(staPath, stringifyStaData(newStaData));
}

export function fromDecorationObj(decoration: Decoration): Omit<StaData, "version" | "privateKey"> {
  return fromDecoration(decoration.medal, decoration.star1, decoration.star2, decoration.star3);
}

export function fromDecoration(medal: Medal, star1: Star, star2: Star, star3: Star): Omit<StaData, "version" | "privateKey"> {
  if (medal === MEDAL.BABY) {
    return {
      wins: 0,
      losses: 0,
      totalKills: 0,
      totalScore: 0,
      gamesPlayed: 0
    };
  }

  const result = {
    wins: 0,
    losses: 0,
    totalKills: 0,
    totalScore: 0,
    gamesPlayed: 0
  };

  if (star1 === STAR.GOLD) {
    result.totalKills = 601;
  } else if (star1 === STAR.SILVER) {
    result.totalKills = 301;
  } else if (star1 === STAR.BRONZE) {
    result.totalKills = 151;
  }

  if (star2 === STAR.GOLD) {
    result.gamesPlayed = 201;
  } else if (star2 === STAR.SILVER) {
    result.gamesPlayed = 101;
  } else if (star2 === STAR.BRONZE) {
    result.gamesPlayed = 51;
  } else {
    result.gamesPlayed = 5;
  }

  if (star3 === STAR.GOLD) {
    result.wins = 81;
  } else if (star3 === STAR.SILVER) {
    result.wins = 41;
  } else if (star3 === STAR.BRONZE) {
    result.wins = 11;
  }

  if (medal === MEDAL.LEVEL3) {
    result.wins = Math.max(result.wins, 24);
    result.losses = Math.floor(result.wins / 9);
  } else if (medal === MEDAL.LEVEL2) {
    result.wins = Math.max(result.wins, 12);
    result.losses = Math.floor(result.wins / 5);
  } else if (medal === MEDAL.LEVEL1) {
    result.wins = Math.max(result.wins, 6);
    result.losses = Math.floor(result.wins / 3);
  } else {
    result.losses = result.wins;
  }

  return result;
}

export function toDecoration(
  wins: number,
  losses: number,
  totalKills: number,
  _totalScore: number,
  gamesPlayed: number
): Decoration {
  const decoration: Decoration = {
    medal: MEDAL.NONE,
    star1: STAR.NONE,
    star2: STAR.NONE,
    star3: STAR.NONE
  };

  if (totalKills > 600) {
    decoration.star1 = STAR.GOLD;
  } else if (totalKills > 300) {
    decoration.star1 = STAR.SILVER;
  } else if (totalKills > 150) {
    decoration.star1 = STAR.BRONZE;
  }

  if (gamesPlayed > 200) {
    decoration.star2 = STAR.GOLD;
  } else if (gamesPlayed > 100) {
    decoration.star2 = STAR.SILVER;
  } else if (gamesPlayed > 50) {
    decoration.star2 = STAR.BRONZE;
  }

  if (wins > 80) {
    decoration.star3 = STAR.GOLD;
  } else if (wins > 40) {
    decoration.star3 = STAR.SILVER;
  } else if (wins > 10) {
    decoration.star3 = STAR.BRONZE;
  }

  if (gamesPlayed < 5) {
    decoration.medal = MEDAL.BABY;
  } else if (wins >= 24 && wins > 8 * losses) {
    decoration.medal = MEDAL.LEVEL3;
  } else if (wins >= 12 && wins > 4 * losses) {
    decoration.medal = MEDAL.LEVEL2;
  } else if (wins >= 6 && wins > 2 * losses) {
    decoration.medal = MEDAL.LEVEL1;
  }

  return decoration;
}
