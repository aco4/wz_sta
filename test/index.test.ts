import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import {
  DECORATION,
  MEDAL,
  STAR,
  fromDecoration,
  fromDecorationObj,
  getStaPath,
  parseStaContent,
  stringify,
  stringifyStaData,
  toDecoration,
  writeStaFile
} from "../src/index.js";

const tempDirs: string[] = [];

async function makeTempDir(): Promise<string> {
  const dir = join(tmpdir(), `wz-sta-${crypto.randomUUID()}`);
  tempDirs.push(dir);
  await mkdir(dir, { recursive: true });
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("sta content", () => {
  it("stringifies default sta content", () => {
    expect(stringify()).toBe("WZ.STA.v3\n0 0 0 0 0\n");
  });

  it("parses sta content", () => {
    expect(parseStaContent("WZ.STA.v3\n1 2 3 4 5\nsecret")).toEqual({
      version: 3,
      wins: 1,
      losses: 2,
      totalKills: 3,
      totalScore: 4,
      gamesPlayed: 5,
      privateKey: "secret"
    });
  });

  it("parses content without a private key line", () => {
    expect(parseStaContent("WZ.STA.v3\n1 2 3 4 5")).toMatchObject({
      privateKey: ""
    });
  });

  it("returns null for invalid content", () => {
    expect(parseStaContent("not sta")).toBeNull();
  });

  it("stringifies parsed data", () => {
    expect(
      stringifyStaData({
        version: 3,
        wins: 1,
        losses: 2,
        totalKills: 3,
        totalScore: 4,
        gamesPlayed: 5,
        privateKey: "secret"
      })
    ).toBe("WZ.STA.v3\n1 2 3 4 5\nsecret");
  });
});

describe("sta paths and files", () => {
  it("builds the sta2 path under the Warzone 2100 players directory", () => {
    expect(getStaPath("/wz", "Alice")).toBe(join("/wz", "multiplay/players", "Alice.sta2"));
  });

  it("creates parent directories when writing a new sta file", async () => {
    const dir = await makeTempDir();
    const staPath = getStaPath(dir, "Alice");

    await writeStaFile(staPath, { wins: 3 });

    expect(await readFile(staPath, "utf8")).toBe("WZ.STA.v3\n3 0 0 0 0\n");
  });

  it("updates only provided fields on an existing sta file", async () => {
    const dir = await makeTempDir();
    const staPath = getStaPath(dir, "Alice");
    await mkdir(join(dir, "multiplay/players"), { recursive: true });
    await writeFile(staPath, "WZ.STA.v3\n1 2 3 4 5\nsecret");

    await writeStaFile(staPath, { wins: 9, privateKey: "new-secret" });

    expect(await readFile(staPath, "utf8")).toBe("WZ.STA.v3\n9 2 3 4 5\nnew-secret");
  });
});

describe("decorations", () => {
  it("maps raw stats to Warzone 2100 decoration thresholds", () => {
    expect(toDecoration(81, 0, 601, 0, 201)).toEqual({
      medal: MEDAL.LEVEL3,
      star1: STAR.GOLD,
      star2: STAR.GOLD,
      star3: STAR.GOLD
    });
  });

  it("maps baby medal to zero stats", () => {
    expect(fromDecoration(MEDAL.BABY, STAR.GOLD, STAR.GOLD, STAR.GOLD)).toEqual({
      wins: 0,
      losses: 0,
      totalKills: 0,
      totalScore: 0,
      gamesPlayed: 0
    });
  });

  it("maps named decoration presets to satisfying stats", () => {
    const stats = fromDecorationObj(DECORATION.HACKER);

    expect(toDecoration(stats.wins, stats.losses, stats.totalKills, stats.totalScore, stats.gamesPlayed)).toEqual(DECORATION.HACKER);
  });
});
