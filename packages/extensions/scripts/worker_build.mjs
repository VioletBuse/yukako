import * as esbuild from "esbuild";
import fs from "fs-extra";

await fs.rm("dist", { recursive: true, force: true });

const workers = [
  { out: "router", in: "workers/router/index.ts" },
  { out: "test", in: "workers/test/index.ts" }];
const modules = [
  { out: "entrypoint", in: "modules/entrypoint/index.ts" }
];
const extensions = [];

await esbuild.build({
  entryPoints: [...workers, ...modules, ...extensions],
  bundle: true,
  external: ["./_entrypoint.js"],
  format: "esm",
  minify: true,
  outdir: "dist"
});

const router = await fs.readFile("dist/router.js", "utf-8");
const test = await fs.readFile("dist/test.js", "utf-8");

const entrypoint = await fs.readFile("dist/entrypoint.js", "utf-8");

const final = `

// This file is auto-generated by the build script

// Path: packages/extensions/workers/router/index.ts
export const router = ${JSON.stringify(router)};

// Path: packages/extensions/workers/test/index.ts
export const test = ${JSON.stringify(test)};


// Path: packages/extensions/modules/entrypoint/index.ts
export const entrypoint = ${JSON.stringify(entrypoint)};
`;

await fs.writeFile("src/dist.ts", final);
await fs.rm("dist", { recursive: true, force: true });


