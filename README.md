# wz-sta

TypeScript utilities for Warzone 2100 `.sta2` player stat files.

## Install

This package is configured for private GitHub Packages publishing. Before publishing, replace `aco4` in `package.json` and `.npmrc` with the GitHub user or organization that owns the package.

```sh
npm install @aco4/wz-sta
```

## Usage

### File handling

Use the file helpers to build `.sta2` paths, check for an existing player file, create a new one, read parsed data, and update only the fields you want to change.

```ts
import { createStaFile, getStaPath, readStaData, staFileExists, updateStaFile } from "@aco4/wz-sta";

const staPath = getStaPath("/path/to/warzone2100/config", "Player");

if (!(await staFileExists(staPath))) {
  await createStaFile(staPath);
}

await updateStaFile(staPath, {
  privateKey: "base64-private-key"
});

const data = await readStaData(staPath);
console.log(data);
```

### Decoration manager

Use the decoration manager to obtain stat values that produce a desired Warzone 2100 decoration output.

```ts
import { DecorationManager, updateStaFile } from "@aco4/wz-sta";

const hackerStats = DecorationManager.getPresetStats("HACKER");

await updateStaFile(staPath, {
  ...hackerStats,
  privateKey: "base64-private-key"
});

console.log(DecorationManager.getDecorationForStats(hackerStats));
```

## Development

```sh
npm install
npm test
npm run build
```

## Publishing To GitHub Packages

1. Replace `@aco4/wz-sta` with your actual GitHub scope in `package.json`.
2. Replace the scope in `.npmrc`.
3. Authenticate with a token that can publish packages:

```sh
npm login --scope=@aco4 --auth-type=legacy --registry=https://npm.pkg.github.com
```

4. Publish:

```sh
npm publish
```
