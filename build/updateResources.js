var path = require("path"),
	cheerio = require("cheerio"),
	through = require("through2"),
	gutil = require("gulp-util"),
	File = gutil.File;

/**
 * Replace resource strings (src, href). Add optional Ja locale file
 */
module.exports = function (options) {

	var replaceSrc = function ($) {
		var attr = this.name === "script" ? "src" : "href",
			src = $(this).attr(attr);
		for (var i in options.patterns) {
			if (src.indexOf(options.patterns[i].match) > -1) {
				src = src.replace(options.patterns[i].match, options.patterns[i].replace);
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
			replaceSrc.call(this, $);
		});
		// loader in source
		$("script").filter(function (i) {
			return !$(this).attr("src");
		}).each(function (i) {
			var contents = $(this).html();
			if (contents.indexOf("ig.loader")) {
				contents = contents.replace(/%%ignite-ui%%/g, options.patterns[0].replace);
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