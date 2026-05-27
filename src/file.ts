import fs from "node:fs/promises";
import path from "node:path";
import { applyStaUpdates, createStaData, parseStaContent, stringifyStaData } from "./content.js";
import type {
  ReadStaDataResult,
  StaContent,
  StaDataResult,
  StaFileContentResult,
  StaFileExistsResult,
  StaPath,
  StaPathResult,
  StaUpdates,
  UpdateStaFileResult
} from "./types.js";

export const STA_DIR = "multiplay/players";

function toErrorResult(error: unknown): { error: Error } {
  return { error: error instanceof Error ? error : new Error(String(error)) };
}

function getErrorCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error ? String(error.code) : undefined;
}

export function getStaPath(wzDir: string, playerName: string): StaPathResult {
  try {
    if (typeof wzDir !== "string" || typeof playerName !== "string") {
      return { error: new TypeError("wzDir and playerName must be strings") };
    }

    return { staPath: path.join(wzDir, STA_DIR, `${playerName}.sta2`) };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function staFileExists(staPath: StaPath): Promise<StaFileExistsResult> {
  try {
    await fs.access(staPath);
    return { exists: true };
  } catch (error) {
    if (getErrorCode(error) === "ENOENT") {
      return { exists: false };
    }

    return toErrorResult(error);
  }
}

export async function readStaFile(staPath: StaPath): Promise<StaFileContentResult> {
  try {
    return { content: await fs.readFile(staPath, "utf8") };
  } catch (error) {
    if (getErrorCode(error) === "ENOENT") {
      return { content: null };
    }

    return toErrorResult(error);
  }
}

export async function readStaData(staPath: StaPath): Promise<ReadStaDataResult> {
  const staFileResult = await readStaFile(staPath);

  if (staFileResult.error) {
    return staFileResult;
  }

  if (staFileResult.content === null) {
    return { data: null };
  }

  const staData = parseStaContent(staFileResult.content);

  if (!staData) {
    return { error: new Error(`Unable to parse sta file: ${staPath}; details=${describeStaContent(staFileResult.content)}`) };
  }

  return staData;
}

function describeStaContent(staContent: StaContent): string {
  const lines = staContent.split(/\r?\n/);
  const privateKeyLine = lines[2];
  const extraLines = lines.slice(3);

  return JSON.stringify({
    byteLength: Buffer.byteLength(staContent, "utf8"),
    lineCount: lines.length,
    hasCarriageReturn: staContent.includes("\r"),
    firstLine: lines[0] ?? "",
    secondLine: lines[1] ?? "",
    secondLineFieldCount: lines[1]?.split(" ").length ?? 0,
    privateKeyLineLength: privateKeyLine?.length ?? 0,
    extraLineCount: extraLines.length,
    extraLineLengths: extraLines.map((line) => line.length)
  });
}

export async function createStaFile(staPath: StaPath, updates: StaUpdates = {}): Promise<StaDataResult> {
  try {
    const staData = createStaData(updates);

    await fs.mkdir(path.dirname(staPath), { recursive: true });
    await fs.writeFile(staPath, stringifyStaData(staData));

    return staData;
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function updateStaFile(staPath: StaPath, updates: StaUpdates): Promise<UpdateStaFileResult> {
  try {
    const staFileResult = await readStaFile(staPath);

    if (staFileResult.error) {
      return staFileResult;
    }

    if (staFileResult.content === null) {
      return await createStaFile(staPath, updates);
    }

    const staData = parseStaContent(staFileResult.content);

    if (!staData) {
      return { error: new Error(`Unable to parse sta file: ${staPath}; details=${describeStaContent(staFileResult.content)}`) };
    }

    const updatedStaData = applyStaUpdates(staData, updates);
    await fs.writeFile(staPath, stringifyStaData(updatedStaData));

    return updatedStaData;
  } catch (error) {
    return toErrorResult(error);
  }
}
