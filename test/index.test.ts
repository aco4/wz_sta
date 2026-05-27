import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import {
  DECORATION,
  DecorationManager,
  MEDAL,
  STAR,
  createStaFile,
  fromDecoration,
  fromDecorationObj,
  getStaPath,
  parseStaContent,
  readStaData,
  readStaFile,
  stringify,
  stringifyStaData,
  staFileExists,
  toDecoration,
  updateStaFile
} from "../src/index.js";

const tempDirs: string[] = [];

async function makeTempDir(): Promise<string> {
  const dir = join(tmpdir(), `wz_sta-${crypto.randomUUID()}`);
  tempDirs.push(dir);
  await mkdir(dir, { recursive: true });
  return dir;
}

function expectStaPath(result: ReturnType<typeof getStaPath>): string {
  expect(result.error).toBeUndefined();

  if (result.error) {
    throw result.error;
  }

  return result.staPath;
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

  it("parses content with a private key followed by one final line ending", () => {
    expect(parseStaContent("WZ.STA.v3\n1 2 3 4 5\nsecret\n")).toMatchObject({
      privateKey: "secret"
    });
    expect(parseStaContent("WZ.STA.v3\r\n1 2 3 4 5\r\nsecret\r\n")).toMatchObject({
      privateKey: "secret"
    });
  });

  it("parses content with trailing null terminators", () => {
    expect(parseStaContent("WZ.STA.v3\n1 2 3 4 5\nsecret\n\0")).toMatchObject({
      privateKey: "secret"
    });
    expect(parseStaContent("WZ.STA.v3\n1 2 3 4 5\nsecret\0")).toMatchObject({
      privateKey: "secret"
    });
    expect(parseStaContent("WZ.STA.v3\n1 2 3 4 5\0")).toMatchObject({
      privateKey: ""
    });
  });

  it("parses content with loose framing whitespace", () => {
    expect(parseStaContent("\uFEFF WZ.STA.v3 \r\n 1\t2  3   4\t 5 \r\n secret \r\n\r\n\0\0")).toEqual({
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

  it("ignores extra blank lines around the optional private key", () => {
    expect(parseStaContent("WZ.STA.v3\n1 2 3 4 5\nsecret\n\n")).toMatchObject({
      privateKey: "secret"
    });
    expect(parseStaContent("WZ.STA.v3\n1 2 3 4 5\n\n")).toMatchObject({
      privateKey: ""
    });
  });

  it("returns null for invalid content", () => {
    expect(parseStaContent("not sta")).toBeNull();
    expect(parseStaContent("WZ.STA.v3\n1 2 3 4\nsecret")).toBeNull();
    expect(parseStaContent("WZ.STA.v3\n1 2 3 4 5\nsecret\nextra")).toBeNull();
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
    expect(getStaPath("/wz", "Alice")).toEqual({ staPath: join("/wz", "multiplay/players", "Alice.sta2") });
  });

  it("returns an error result for invalid path inputs", () => {
    const result = getStaPath(null as unknown as string, "Alice");

    expect(result.error).toBeInstanceOf(Error);
  });

  it("returns content null for a missing sta file", async () => {
    const dir = await makeTempDir();
    const staPath = expectStaPath(getStaPath(dir, "Alice"));

    expect(await readStaFile(staPath)).toEqual({ content: null });
    expect(await readStaData(staPath)).toEqual({ data: null });
  });

  it("creates parent directories when updating a missing sta file", async () => {
    const dir = await makeTempDir();
    const staPath = expectStaPath(getStaPath(dir, "Alice"));

    const result = await updateStaFile(staPath, { wins: 3 });

    expect(result.error).toBeUndefined();
    expect(await readFile(staPath, "utf8")).toBe("WZ.STA.v3\n3 0 0 0 0\n");
  });

  it("checks existence and creates a new sta file", async () => {
    const dir = await makeTempDir();
    const staPath = expectStaPath(getStaPath(dir, "Alice"));

    expect(await staFileExists(staPath)).toEqual({ exists: false });

    const createResult = await createStaFile(staPath, { wins: 1, privateKey: "secret" });

    expect(createResult.error).toBeUndefined();
    expect(await staFileExists(staPath)).toEqual({ exists: true });
    expect(await readStaData(staPath)).toEqual({
      version: 3,
      wins: 1,
      losses: 0,
      totalKills: 0,
      totalScore: 0,
      gamesPlayed: 0,
      privateKey: "secret"
    });
  });

  it("updates only provided fields on an existing sta file", async () => {
    const dir = await makeTempDir();
    const staPath = expectStaPath(getStaPath(dir, "Alice"));
    await mkdir(join(dir, "multiplay/players"), { recursive: true });
    await writeFile(staPath, "WZ.STA.v3\n1 2 3 4 5\nsecret");

    const result = await updateStaFile(staPath, { wins: 9, privateKey: "new-secret" });

    expect(result.error).toBeUndefined();
    expect(await readFile(staPath, "utf8")).toBe("WZ.STA.v3\n9 2 3 4 5\nnew-secret");
  });

  it("updates only the private key on an existing sta file", async () => {
    const dir = await makeTempDir();
    const staPath = expectStaPath(getStaPath(dir, "Alice"));
    await mkdir(join(dir, "multiplay/players"), { recursive: true });
    await writeFile(staPath, "WZ.STA.v3\n1 2 3 4 5\nold-secret");

    const result = await updateStaFile(staPath, { privateKey: "new-secret" });

    expect(result.error).toBeUndefined();
    expect(await readFile(staPath, "utf8")).toBe("WZ.STA.v3\n1 2 3 4 5\nnew-secret");
  });

  it("includes non-secret content details when an existing sta file is unparsable", async () => {
    const dir = await makeTempDir();
    const staPath = expectStaPath(getStaPath(dir, "Alice"));
    await mkdir(join(dir, "multiplay/players"), { recursive: true });
    await writeFile(staPath, "WZ.STA.v3\n1 2\nsecret");

    const readResult = await readStaData(staPath);
    const result = await updateStaFile(staPath, { wins: 9 });

    expect(readResult.error?.message).toMatch(
      /Unable to parse sta file: .*details=\{"byteLength":20,"lineCount":3,.*"secondLine":"1 2",.*"privateKeyLineLength":6/
    );
    expect(result.error?.message).toMatch(
      /Unable to parse sta file: .*details=\{"byteLength":20,"lineCount":3,.*"secondLine":"1 2",.*"privateKeyLineLength":6/
    );
  });

  it("returns error results for filesystem failures", async () => {
    const invalidPath = "\0bad";

    expect((await staFileExists(invalidPath)).error).toBeInstanceOf(Error);
    expect((await readStaFile(invalidPath)).error).toBeInstanceOf(Error);
    expect((await createStaFile(invalidPath)).error).toBeInstanceOf(Error);
    expect((await updateStaFile(invalidPath, { wins: 1 })).error).toBeInstanceOf(Error);
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

  it("preserves package decoration enum values", () => {
    expect(STAR.BRONZE).toBe(1);
    expect(STAR.SILVER).toBe(2);
    expect(STAR.GOLD).toBe(3);
    expect(MEDAL.LEVEL1).toBe(1);
    expect(MEDAL.LEVEL2).toBe(2);
    expect(MEDAL.LEVEL3).toBe(3);
  });

  it("keeps star fields while marking players with fewer than five games as baby", () => {
    expect(toDecoration(81, 0, 601, 0, 4)).toEqual({
      medal: MEDAL.BABY,
      star1: STAR.GOLD,
      star2: STAR.NONE,
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

  it("obtains preset stats through the decoration manager", () => {
    const stats = DecorationManager.getPresetStats("HACKER");

    expect(DecorationManager.getDecorationForStats(stats)).toEqual(DecorationManager.getPreset("HACKER"));
  });
});
