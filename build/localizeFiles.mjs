import { createRequire } from "module";
import { basename, dirname, extname, join, sep } from "path";
import { obj } from "through2";
import File from 'vinyl';

const require = createRequire(import.meta.url);

/**
 * Localize contents of file (resources, localization strings) and push both versions back to stream
 */
export default function(_options) {

	var processStream = function(file, encoding, next){
		var contentsEN, contentsJA, jaFile, token,
			basePath = dirname(file.path),
			fileName = basename(file.path, extname(file.path)),
			enStrings, jaStrings,
			stream = this;
		contentsEN = contentsJA = file.contents.toString(encoding);
		
		enStrings = require(join(basePath, "strings-en.json"));
		jaStrings = require(join(basePath, "strings-ja.json"));
		// combine with shared strings
		Object.assign(enStrings, require(join(basePath, "../strings-en.json")));
		Object.assign(jaStrings, require(join(basePath, "../strings-ja.json")));

		for (const key in enStrings) {
			token = new RegExp("\\$\\$\\(" + key + "\\)", "g");
			contentsEN = contentsEN.replace(token, enStrings[key]);
		}

		for (const key in jaStrings) {
			token = new RegExp("\\$\\$\\(" + key + "\\)", "g");
			contentsJA = contentsJA.replace(token, jaStrings[key]);
		}
		
		// save original path, because hystory stack won't be available for the newly created JA file:
		file.originalPath = file.history[0];
		// change out path, HTMLSamples must remain in path to keep relative correct for dest
		file.path = join(basePath.replace("HTMLSamples", "HTMLSamples" + sep + "EN"), fileName, "index.html");
		file.contents = Buffer.from(contentsEN, encoding);
		file.lang = "en";

		// replace JA
		jaFile = new File({
			base: file.base,
			path: join(basePath.replace("HTMLSamples", "HTMLSamples" + sep + "JA"), fileName, "index.html"),
			contents: Buffer.from(contentsJA)
		});
		jaFile.lang = "ja";
		jaFile.originalPath = file.originalPath;

		stream.push(file);
		stream.push(jaFile);
		next();
	};
	
	return obj(processStream);
};
