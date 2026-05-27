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

export interface StaErrorResult {
  error: Error;
}

export type StaPathResult = { staPath: StaPath; error?: never } | StaErrorResult;
export type StaFileExistsResult = { exists: boolean; error?: never } | StaErrorResult;
export type StaFileContentResult = { content: StaContent | null; error?: never } | StaErrorResult;
export type StaDataResult = (StaData & { data?: never; error?: never }) | StaErrorResult;
export type ReadStaDataResult = StaDataResult | { data: null; error?: never };

export interface StaUpdates {
  version?: number;
  wins?: number;
  losses?: number;
  totalKills?: number;
  totalScore?: number;
  gamesPlayed?: number;
  privateKey?: string;
}

export type UpdateStaFileResult = StaDataResult;

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
