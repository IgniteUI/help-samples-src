var path = require("path"),
	through = require("through2"),
	gutil = require("gulp-util"),
	File = gutil.File;

/**
 * Localize contents of file (resources, localization strings) and push both versions back to stream
 */
module.exports = function(options) {

	var processStream = function(file, encoding, next){
		var contentsEN, contentsJA, $, jaFile, token,
			basePath = path.dirname(file.path),
			fileName = path.basename(file.path, path.extname(file.path)),
			enStrings, jaStrings,
			stream = this;
		contentsEN = contentsJA = file.contents.toString(encoding);
		
		enStrings = require(path.join(basePath, "strings-en.json"));
		jaStrings = require(path.join(basePath, "strings-ja.json"));
		// combine with shared strings
		Object.assign(enStrings, require(path.join(basePath, "../strings-en.json")));
		Object.assign(jaStrings, require(path.join(basePath, "../strings-ja.json")));

		for (key in enStrings) {
			token = new RegExp("\\$\\$\\(" + key + "\\)", "g");
			contentsEN = contentsEN.replace(token, enStrings[key]);
		}

		for (key in jaStrings) {
			token = new RegExp("\\$\\$\\(" + key + "\\)", "g");
			contentsJA = contentsJA.replace(token, jaStrings[key]);
		}
		
		// change out path, HTMLSamples must remain in path to keep relative correct for dest
		file.path = path.join(basePath.replace("HTMLSamples", "HTMLSamples" + path.sep + "EN"), fileName, "index.html");
		file.contents = new Buffer(contentsEN, encoding);
		file.lang = "en";

		// replace JA
		jaFile = new File({
			base: file.base,
			path: path.join(basePath.replace("HTMLSamples", "HTMLSamples" + path.sep + "JA"), fileName, "index.html"),
			contents: new Buffer(contentsJA)
		});
		jaFile.lang = "ja";

		stream.push(file);
		stream.push(jaFile);
		next();
	};
	
	return through.obj(processStream);
};