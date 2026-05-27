import type { StaContent, StaData, StaUpdates } from "./types.js";

const STA_HEADER_PATTERN = /^WZ\.STA\.v(?<version>\d+)$/;
const INTEGER_PATTERN = /^\d+$/;

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
  const normalizedStaContent = staContent.replace(/^\uFEFF/, "").replace(/[\s\0]+$/u, "");
  const lines = normalizedStaContent.split(/\r\n|\n|\r/);
  const headerMatch = STA_HEADER_PATTERN.exec(lines[0]?.trim() ?? "");
  const stats = lines[1]?.trim().split(/\s+/) ?? [];
  const privateKeyLines = lines.slice(2).map((line) => line.trim()).filter((line) => line !== "");

  if (!headerMatch?.groups || stats.length !== 5 || !stats.every((value) => INTEGER_PATTERN.test(value)) || privateKeyLines.length > 1) {
    return null;
  }

  const [wins, losses, totalKills, totalScore, gamesPlayed] = stats;

  return {
    version: Number.parseInt(headerMatch.groups.version, 10),
    wins: Number.parseInt(wins, 10),
    losses: Number.parseInt(losses, 10),
    totalKills: Number.parseInt(totalKills, 10),
    totalScore: Number.parseInt(totalScore, 10),
    gamesPlayed: Number.parseInt(gamesPlayed, 10),
    privateKey: privateKeyLines[0] ?? ""
  };
}
