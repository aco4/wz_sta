export interface StaStats {
  wins: number;
  losses: number;
  totalKills: number;
  totalScore: number;
  gamesPlayed: number;
}

export interface StaData extends StaStats {
  version: number;
  privateKey: string;
}

export type StaContent = string;
export type StaPath = string;

export interface StaUpdates {
  version?: number;
  wins?: number;
  losses?: number;
  totalKills?: number;
  totalScore?: number;
  gamesPlayed?: number;
  privateKey?: string;
}

export interface Decoration {
  medal: Medal;
  star1: Star;
  star2: Star;
  star3: Star;
}

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
