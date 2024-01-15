import path from "path";
import fs from "fs-extra";
import * as esbuild from "esbuild";
import { fileURLToPath } from "url";
import chokidar from "chokidar";
import { build } from "esbuild";

const watch = process.argv.includes("--watch") || process.argv.includes("-w");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dist = path.join(__dirname, "..", "dist");
const src = path.join(__dirname, "..", "src");

const migrationsTarget = path.join(dist, "migrations");
const migrationsSource = path.join(__dirname, "../../..", "migrations");
const outFile = path.join(dist, "index.mjs");

const banner = "const require = (await import('node:module')).createRequire(import.meta.url);const __filename = (await import('node:url')).fileURLToPath(import.meta.url);const __dirname = (await import('node:path')).dirname(__filename);";

const copyMigrations = () => {
	console.log("Copying migrations...");
	fs.rmSync(migrationsTarget, { recursive: true, force: true });
	fs.copySync(migrationsSource, migrationsTarget);
};

const opts = {
	entryPoints: [path.join(src, "index.ts")],
	bundle: true,
	sourcemap: true,
	platform: "node",
	target: "node16",
	format: "esm",
	banner: { js: banner },
	outfile: outFile
};

if (!watch) {
	await copyMigrations();
	await esbuild.build(opts);
} else {
	const watcher = chokidar.watch(migrationsSource, {awaitWriteFinish: true, })

	watcher.on("add", copyMigrations);
	watcher.on("addDir", copyMigrations);
	watcher.on("change", copyMigrations);
	watcher.on("unlink", copyMigrations);
	watcher.on("unlinkDir", copyMigrations);

	await (await esbuild.context(opts)).watch();
}
