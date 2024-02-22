import { fileURLToPath } from "url";
import path from "path";
import * as esbuild from "esbuild";
import * as fs from "fs/promises";

const watch = process.argv.includes("--watch") || process.argv.includes("-w");

if (watch) {
	console.log("Watching for changes...");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dist = path.join(__dirname, "..", "dist");
const src = path.join(__dirname, "..", "src");

const banner = "const require = (await import('node:module')).createRequire(import.meta.url);const __filename = (await import('node:url')).fileURLToPath(import.meta.url);const __dirname = (await import('node:path')).dirname(__filename);";

// let files = [];
//
// const getFiles = async (dir) => {
// 	const contents = await fs.readdir(dir);
//
// 	for (const file of contents) {
// 		const filePath = path.join(dir, file);
// 		const stat = await fs.stat(filePath);
//
// 		if (stat.isDirectory()) {
// 			await getFiles(filePath);
// 		} else {
// 			files.push(filePath);
// 		}
// 	}
// };
//
// await getFiles(src);
// // console.log(files);
//
// const deleteBeforeBuildPlugin = {
// 	name: "delete-before-build",
// 	setup(build) {
// 		build.onStart(() => {
// 			fs.rm(dist, { recursive: true, force: true });
// 		});
// 	}
// };

const opts = {
	entryPoints: [path.join(src, "index.ts")],
	// plugins: [deleteBeforeBuildPlugin],
	bundle: true,
	sourcemap: true,
	platform: "node",
	target: "node16",
	format: "esm",
	banner: { js: banner },
	external: ["esbuild", "fsevents"],
	outdir: dist
};

if (!watch) {
	await esbuild.build(opts);
} else {
	await (await esbuild.context(opts)).watch();
}
