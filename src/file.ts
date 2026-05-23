import fs from "node:fs/promises";
import path from "node:path";
import { applyStaUpdates, createStaData, parseStaContent, stringifyStaData } from "./content.js";
import type { StaContent, StaData, StaPath, StaUpdates } from "./types.js";

export const STA_DIR = "multiplay/players";

export function getStaPath(wzDir: string, playerName: string): StaPath {
  return path.join(wzDir, STA_DIR, `${playerName}.sta2`);
}

export async function staFileExists(staPath: StaPath): Promise<boolean> {
  try {
    await fs.access(staPath);
    return true;
  } catch {
    return false;
  }
}

export async function readStaFile(staPath: StaPath): Promise<StaContent | null> {
  try {
    return await fs.readFile(staPath, "utf8");
  } catch {
    return null;
  }
}

export async function readStaData(staPath: StaPath): Promise<StaData | null> {
  const staContent = await readStaFile(staPath);
  return staContent === null ? null : parseStaContent(staContent);
}

export async function createStaFile(staPath: StaPath, updates: StaUpdates = {}): Promise<StaData> {
  const staData = createStaData(updates);

  await fs.mkdir(path.dirname(staPath), { recursive: true });
  await fs.writeFile(staPath, stringifyStaData(staData));

  return staData;
}

export async function updateStaFile(staPath: StaPath, updates: StaUpdates): Promise<StaData> {
  const existingStaContent = await readStaFile(staPath);

  if (existingStaContent === null) {
    return createStaFile(staPath, updates);
  }

  const staData = parseStaContent(existingStaContent);

  if (!staData) {
    throw new Error(`Unable to parse sta file: ${staPath}`);
  }

  const updatedStaData = applyStaUpdates(staData, updates);
  await fs.writeFile(staPath, stringifyStaData(updatedStaData));

  return updatedStaData;
}
