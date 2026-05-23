# wz-sta

TypeScript utilities for Warzone 2100 `.sta2` player stat files.

## Install

This package is configured for private GitHub Packages publishing. Before publishing, replace `aco4` in `package.json` and `.npmrc` with the GitHub user or organization that owns the package.

```sh
npm install @aco4/wz-sta
```

## Usage

```ts
import {
  DECORATION,
  fromDecorationObj,
  getStaPath,
  readStaFile,
  toDecoration,
  writeStaFile
} from "@aco4/wz-sta";

const staPath = getStaPath("/path/to/warzone2100/config", "Player");

await writeStaFile(staPath, {
  ...fromDecorationObj(DECORATION.HACKER),
  privateKey: "optional-private-key"
});

const content = await readStaFile(staPath);
console.log(content);

console.log(toDecoration(81, 0, 601, 0, 201));
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
