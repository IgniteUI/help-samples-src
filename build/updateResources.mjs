import cheerio from 'cheerio';
import { existsSync } from "fs";
import { obj } from "through2";

/**
 * Replace resource strings (src, href) and igLoader sources. Adds Japanese locale script for JA files.
 */
export default function (options) {

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
			if (existsSync("./data-files-ja/" + dataFile)) {
				src = src.replace("/data-files/", "/data-files-ja/");
			}
		}
		$(this).attr(attr, src);
	};

	var processStream = function (file, encoding, next) {
		var contents, stream, $, jsStart, $head;

		contents = file.contents.toString(encoding);
		stream = this;

		// https://github.com/cheeriojs/cheerio#loading
		$ = file.cheerio = file.cheerio || cheerio.load(contents, { decodeEntities: false });

		//set file language
		$("html").attr("lang", file.lang);
		if (file.lang == "ja") {
			// find the first script file /js/infragistics.(core|loader)
			jsStart = $("script[src*='%%ignite-ui%%/js/infragistics.']");
			if (!jsStart.length) {
				throw new Error("Couldn't find core or loader script.");
			}
			jsStart.eq(0).before("<script src=\"%%ignite-ui%%/js/i18n/infragistics-ja.js\"></script>");
			$head = $("head");
			$head.append("<script src=\"%%ignite-ui%%/js/modules/i18n/regional/infragistics.ui.regional-ja.js\"></script>");

			// ensure charset meta:
			if (!$head.find("meta[charset]").length) {
				$("<meta>", { charset: "utf-8"}).prependTo($head).attr("charset", "utf-8");
			}
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
			var contents = $(this).text();
			if (contents.indexOf("ig.loader") !== -1) {
				contents = contents.replace(/%%ignite-ui%%/g, options.patterns["%%ignite-ui%%"]);
				$(this).text(contents);
			}
		});

		// links:
		$("link").filter(function (i) {
			return $(this).attr("href");
		}).each(function (i) {
			replaceSrc.call(this, $);
		});


		file.contents = Buffer.from($.html(), encoding);

		stream.push(file);
		next();
	};

	return obj(processStream);
};
