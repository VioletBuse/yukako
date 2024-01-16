import { fileURLToPath } from "url";
import path from "path";
import fs from "fs-extra";
import * as util from "util";
import mime from "mime";


const watch = process.argv.includes("--watch") || process.argv.includes("-w");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dashboardDist = path.join(__dirname, "../../../apps/dashboard/dist");

const dashboardDistStat = fs.statSync(dashboardDist);
const isDirectory = dashboardDistStat.isDirectory();

if (!isDirectory) {
	console.log("Dashboard dist is not a directory");
	process.exit(1);
}

const readFilesRecursively = (dir) => {
	const files = fs.readdirSync(dir);
	const filesWithDir = files.map((file) => {
		const filePath = path.join(dir, file);
		const fileStat = fs.statSync(filePath);
		const isDirectory = fileStat.isDirectory();
		if (isDirectory) {
			return readFilesRecursively(filePath);
		} else {
			return filePath;
		}
	});
	return filesWithDir.flat();
};

const dashboardDistFiles = readFilesRecursively(dashboardDist);

const prunedFilePaths = dashboardDistFiles.map(_filepath => _filepath.replace(dashboardDist, ""));

let files = {};

for (const filePath of prunedFilePaths) {
	const contentBase64 = fs.readFileSync(path.join(dashboardDist, filePath)).toString("base64");
	const mimetype = mime.getType(filePath);

	files[filePath] = {
		base64: contentBase64,
		mimetype
	};
}

const outfileContents = `export const files: Record<string, {base64: string; mimetype: string;}> = ${JSON.stringify(files, null, 2)};`;
const outfilePath = path.join(__dirname, "../src/.artifacts/files.ts");

fs.ensureDirSync(path.dirname(outfilePath));
fs.writeFileSync(outfilePath, outfileContents);

// console.log(dashboardDist);
// console.log(util.inspect(files, { maxArrayLength: null }));
