# wz_sta

TypeScript utilities for Warzone 2100 `.sta2` player stat files.

## Install

This package is configured for private GitHub Packages publishing. Before publishing, replace `aco4` in `package.json` and `.npmrc` with the GitHub user or organization that owns the package.

```sh
npm install @aco4/wz_sta
```

## Usage

### File handling

Use the file helpers to build `.sta2` paths, check for an existing player file, create a new one, read parsed data, and update only the fields you want to change.

```ts
import { createStaFile, getStaPath, readStaData, staFileExists, updateStaFile } from "@aco4/wz_sta";

const staPathResult = getStaPath("/path/to/warzone2100/config", "Player");

if (staPathResult.error) {
  console.error(staPathResult.error.message);
} else {
  const { staPath } = staPathResult;
  const existsResult = await staFileExists(staPath);

  if (existsResult.error) {
    console.error(existsResult.error.message);
  } else if (!existsResult.exists) {
    const createResult = await createStaFile(staPath);

    if (createResult.error) {
      console.error(createResult.error.message);
    }
  }

  const updateResult = await updateStaFile(staPath, {
    privateKey: "base64-private-key"
  });

  if (updateResult.error) {
    console.error(updateResult.error.message);
  } else {
    console.log(updateResult);
  }

  const dataResult = await readStaData(staPath);

  if (dataResult.error) {
    console.error(dataResult.error.message);
  } else if (dataResult.data === null) {
    console.log("No sta file found");
  } else {
    console.log(dataResult);
  }
}
```

### Decoration manager

Use the decoration manager to obtain stat values that produce a desired Warzone 2100 decoration output.

```ts
import { DecorationManager, updateStaFile } from "@aco4/wz_sta";

const hackerStats = DecorationManager.getPresetStats("HACKER");

const updateResult = await updateStaFile(staPath, {
  ...hackerStats,
  privateKey: "base64-private-key"
});

if (updateResult.error) {
  console.error(updateResult.error.message);
}

console.log(DecorationManager.getDecorationForStats(hackerStats));
```

## Development

```sh
npm install
npm test
npm run build
```

## Publishing To GitHub Packages

1. Replace `@aco4/wz_sta` with your actual GitHub scope in `package.json`.
2. Replace the scope in `.npmrc`.
3. Authenticate with a token that can publish packages:

```sh
npm login --scope=@aco4 --auth-type=legacy --registry=https://npm.pkg.github.com
```

4. Publish:

```sh
npm publish
```
