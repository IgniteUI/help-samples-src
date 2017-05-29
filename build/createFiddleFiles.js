var path = require("path"),
	cheerio = require("cheerio"),
	through = require("through2"),
	gutil = require("gulp-util"),
	File = gutil.File;
/**
 * Extracts HTML, JS and optionally CSS into separate files in a fiddle folder
 * and generates an embed json config file
 */
module.exports = function(options) {

	var replaceSrc = function ($) {
		var attr = this.name === "script" ? "src" : "href",
			src = $(this).attr(attr);
		if (src && src.indexOf("../../../../") !== -1) {
			src = src.replace("../../../../", options.liveUrl + "/");
		}
		$(this).attr(attr, src);
	};

	/** 
	 * Extra simple unindent - supports mixed tabs and spaces, but only removes spaces equal to the tab size (def 4)
	 * @param {string} code The string of code to unindent
	 * @param {number} keep A number of indents to preserve (for adding extra code later)
	 * @returns {string} The formatted code
	 */
	var unindentTrim = function (code, keep) {
		var keep = keep || 0,
			lines = code.split(/\r\n|\n/), indent, indentRegx,
			tabSize = options.tabSize || 4,
			spacesRegx = new RegExp("^( {" + tabSize + "," + tabSize + "}|\\t)+");
		for (var i = 0; i < lines.length; i++) {
			if (lines[i]){
				if (!indentRegx) {
					if (!lines[i].trim()) {
						continue;
					}
					if (!spacesRegx.test(lines[i])) {
						//no indent on first line, do nothing
						break;
					} 
					// get tabs and spaces
					indent = spacesRegx.exec(lines[i])[0];
					// replace tabs with spaces
					indent = indent.replace(/\t/g, new Array(tabSize + 1).join( " " ));
					// get indent count
					indent = (indent.length / tabSize) - keep;
					if (indent <= 0) {
						break;
					}
					// and build RegExp (like spacesRegx, limited count tho)
					indentRegx = new RegExp("^( {" + tabSize + "," + tabSize + "}|\\t){" + indent +"}");

					lines[i] = lines[i].replace(indentRegx, "");
					// put a placeholder on the first line:
					lines[i] = "{start}" + lines[i];
					continue;
				}

				lines[i] = lines[i].replace(indentRegx, "");
			}
		}
		return lines.join("\r\n").trim().replace("{start}", "");
	};

	var processStream = function(file, encoding, next){
		var contents, stream, $,
		basePath = path.dirname(file.path),
		relativePath = basePath.split("HTMLSamples").pop().replace(/\\/g, "/"),
		originalPath = "HTMLSamples" + file.originalPath.split("HTMLSamples").pop().replace(/\\/g, "/"),
		htmlFile, jsFile, cssFile,
		html = [], js = "", css = "",
		resultStr = file.lang === "ja" ? options.strings.resultJA : options.strings.resultEN,
		embed = {
			//use original file path for source link
			"srcUrlPattern" : path.posix.join("/${owner}/${repo}-src/blob/", options.version, originalPath),
			"embed": [{
				"label": "JS",
				"path": path.posix.join(options.version, relativePath, "fiddle/demo.js") 
			},{
				"label": "HTML",
				"path": path.posix.join(options.version, relativePath, "fiddle/demo.html") 
			}, {
				"type": "htmlpage",
				"label": resultStr,
				"url": options.liveUrl + path.posix.join("/" + options.version, relativePath, "/index.html") 
			}]
		};
		
		contents = file.contents.toString(encoding);
		stream = this;
		
		// https://github.com/cheeriojs/cheerio#loading
		$ = file.cheerio = file.cheerio || cheerio.load(contents, { decodeEntities: false });
		
		// add script tags
		$("script").filter(function (i) {
			return $(this).attr("src") || 
			options.templateScriptTypes.indexOf($(this).attr("type")) !== -1;
		}).each(function (i) {
			replaceSrc.call(this, $);
			html.push($.html(this));
		});
		// add links:
		$("link").filter(function (i) {
			return $(this).attr("href");
		}).each(function (i) {
			replaceSrc.call(this, $);
			html.push($.html(this));
		});

		// body content
		$("body > *").filter(function (i) {
			return this.name !== "script" && this.name !== "style" && this.name !== "link";
		}).each(function (i) {
			html.push($.html(this));
		});


		htmlFile = new File({
			base: file.base,
			path: path.join(basePath, "fiddle", "demo.html"),
			contents: new Buffer(html.join("\r\n"))
		});

		// js
		$("script").filter(function (i) {
			return !$(this).attr("src") && 
			options.templateScriptTypes.indexOf($(this).attr("type")) === -1;
		}).each(function (i) {
			js += $(this).text();
		})
		if (!/^\s*\$\(function\s*\(\)\s*\{/.test(js)) {
			// no $(function(){ wrap:
			js = unindentTrim(js, 1);
			js = "$(function () {\r\n" + js + "\r\n});";
		} else {
			js = unindentTrim(js);
		}
		jsFile = new File({
			base: file.base,
			path: path.join(basePath, "fiddle", "demo.js"),
			contents: new Buffer(js)
		});

		// css
		$("style").each(function (i) {
			css += $(this).text();
		});
		if (css.length) {
			cssFile = new File({
				base: file.base,
				path: path.join(basePath, "fiddle", "demo.css"),
				contents: new Buffer(unindentTrim(css))
			});
			stream.push(cssFile);
			embed.embed.splice(2, 0, {
				"label": "CSS",
				"path": path.posix.join(options.version, relativePath, "fiddle/demo.css")
			});
		}

		// Settings (widget options, undefined won't get encoded)
		embed.height = $("body").attr("data-height");

		stream.push(htmlFile);
		stream.push(jsFile);
		stream.push(new File({
			base: file.base,
			path: path.join(basePath, ".gh-embed.json"),
			contents: new Buffer(JSON.stringify(embed, null, 4))
		}));

		stream.push(file);
		next();
	};
	
	return through.obj(processStream);
};