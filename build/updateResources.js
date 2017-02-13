var path = require("path"),
	fs = require("fs"),
	cheerio = require("cheerio"),
	through = require("through2"),
	gutil = require("gulp-util"),
	File = gutil.File;

/**
 * Replace resource strings (src, href) and igLoader sources. Adds Japanese locale script for JA files.
 */
module.exports = function (options) {

	/**
	 * Replaces %%resource%% links based on configuration. Swaps to Japanese data-file if available for localized files.
	 */
	var replaceSrc = function ($, lang) {
		var attr = this.name === "script" ? "src" : "href",
			src = $(this).attr(attr),
			dataFile;

		for (var key in options.patterns) {
			if (src.indexOf(key) > -1) {
				src = src.replace(key, options.patterns[key]);
			}
		}
		if (lang === "ja" && src.indexOf("../data-files") !== -1) {
			// check if respective japanese files is available:
			dataFile = src.split("../data-files/").pop();
			if (fs.existsSync("./data-files-ja/" + dataFile)) {
				src = src.replace("/data-files/", "/data-files-ja/");
			}
		}
		$(this).attr(attr, src);
	};

	var processStream = function (file, encoding, next) {
		var contents, stream, $;

		contents = file.contents.toString(encoding);
		stream = this;

		// https://github.com/cheeriojs/cheerio#loading
		$ = file.cheerio = file.cheerio || cheerio.load(contents, { decodeEntities: false });

		if (file.lang == "ja") {
			$("head").append("<script src=\"%%ignite-ui%%/js/i18n/infragistics-ja.js\"></script>")
		}

		// script tags
		$("script").filter(function (i) {
			return $(this).attr("src");
		}).each(function (i) {
			replaceSrc.call(this, $, file.lang);
		});
		// loader in source
		$("script").filter(function (i) {
			return !$(this).attr("src");
		}).each(function (i) {
			var contents = $(this).html();
			if (contents.indexOf("ig.loader")) {
				contents = contents.replace(/%%ignite-ui%%/g, options.patterns["%%ignite-ui%%"]);
				$(this).html(contents);
			}
		});

		// links:
		$("link").filter(function (i) {
			return $(this).attr("href");
		}).each(function (i) {
			replaceSrc.call(this, $);
		});


		file.contents = new Buffer($.html(), encoding);

		stream.push(file);
		next();
	};

	return through.obj(processStream);
};