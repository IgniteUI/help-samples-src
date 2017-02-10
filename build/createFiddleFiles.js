var path = require("path"),
	cheerio = require("cheerio"),
	through = require("through2"),
	gutil = require("gulp-util"),
	File = gutil.File;

module.exports = function(options) {

	var replaceSrc = function ($) {
		var attr = this.name === "script" ? "src" : "href",
			src = $(this).attr(attr);
		if (src && src.indexOf("../../../../") !== -1) {
			src = src.replace("../../../../", options.gitUrl + "/" + options.version + "/");
		}
		$(this).attr(attr, src);
	};
	var processStream = function(file, encoding, next){
		var contents, stream, $,
		basePath = path.dirname(file.path),
		relativePath = basePath.split("HTMLSamples").pop().replace(/\\/g, "/"),
		htmlFile, jsFile, cssFile,
		html = [], js = "", css = "", 
		embed = {
		   "embed": [{
				"label": "HTML",
				"path": path.posix.join(options.version, relativePath, "fiddle/demo.html") 
			}, {
				"label": "JS",
				"path": path.posix.join(options.version, relativePath, "fiddle/demo.js") 
			},{
				"type": "htmlpage",
				"label": "Result",
				"url": options.gitUrl + path.posix.join("/" + options.version, relativePath, "/index.html") 
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
		var links = $("link").filter(function (i) {
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
				contents: new Buffer(css)
			});
			stream.push(cssFile);
			embed.embed.splice(2, 0, {
				"label": "CSS",
				"path": path.posix.join(options.version, relativePath, "fiddle/demo.css")
			});
		}

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