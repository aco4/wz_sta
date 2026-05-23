import { MEDAL, STAR } from "./types.js";
import type { Decoration, Medal, Star, StaStats } from "./types.js";

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

export type DecorationPresetName = keyof typeof DECORATION;

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

export function fromDecorationObj(decoration: Decoration): StaStats {
  return fromDecoration(decoration.medal, decoration.star1, decoration.star2, decoration.star3);
}

export function fromDecoration(medal: Medal, star1: Star, star2: Star, star3: Star): StaStats {
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

// Mirrors https://github.com/Warzone2100/warzone2100/blob/40e2637345dd8ec149f3f7eb08465048eed870d0/src/titleui/widgets/lobbyplayerrow.cpp#L371
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

export class DecorationManager {
  static presets = DECORATION;

  static getPreset(name: DecorationPresetName): Decoration {
    return DECORATION[name];
  }

  static getPresetStats(name: DecorationPresetName): StaStats {
    return fromDecorationObj(DECORATION[name]);
  }

  static getStatsForDecoration(decoration: Decoration): StaStats {
    return fromDecorationObj(decoration);
  }

  static getDecorationForStats(stats: StaStats): Decoration {
    return toDecoration(stats.wins, stats.losses, stats.totalKills, stats.totalScore, stats.gamesPlayed);
  }

  static getRandomDecoration(): Decoration {
    return getRandomDecoration();
  }
}
