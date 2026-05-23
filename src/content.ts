import type { StaContent, StaData, StaUpdates } from "./types.js";

const STA_PATTERN =
  /^WZ\.STA\.v(?<version>\d+)\r?\n(?<wins>\d+) (?<losses>\d+) (?<totalKills>\d+) (?<totalScore>\d+) (?<gamesPlayed>\d+)(?:\r?\n(?:(?<privateKey>[^\r\n]+)(?:\r?\n)?)?)?$/;

export function createStaData(updates: StaUpdates = {}): StaData {
  return {
    version: updates.version ?? 3,
    wins: updates.wins ?? 0,
    losses: updates.losses ?? 0,
    totalKills: updates.totalKills ?? 0,
    totalScore: updates.totalScore ?? 0,
    gamesPlayed: updates.gamesPlayed ?? 0,
    privateKey: updates.privateKey ?? ""
  };
}

export function applyStaUpdates(staData: StaData, updates: StaUpdates): StaData {
  return {
    version: updates.version ?? staData.version,
    wins: updates.wins ?? staData.wins,
    losses: updates.losses ?? staData.losses,
    totalKills: updates.totalKills ?? staData.totalKills,
    totalScore: updates.totalScore ?? staData.totalScore,
    gamesPlayed: updates.gamesPlayed ?? staData.gamesPlayed,
    privateKey: updates.privateKey ?? staData.privateKey
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
