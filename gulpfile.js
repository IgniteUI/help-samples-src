var gulp = require("gulp"),
	localize = require("./build/localizeFiles.js"),
	updateResources = require("./build/updateResources.js"),
	createFiddleFiles = require("./build/createFiddleFiles.js");

var argv = require('minimist')(process.argv.slice(2));
var version = argv.version; //should be passed as --version ${TRAVIS_BRANCH}

var dist = "./dist",
	copySrc = [
		"./css/**/*",
		"./js/**/*",
		"./images/**/*",
		"./data-files/**/*",
		"./data-files-ja/**/*"
	],
	config = require("./build/config.json");

	// Command line overrides:
	if (argv["ignite-ui"]) {
		// Optional override for the Ignite UI source location, can be passed as --ignite-ui "http://<ignite-ui root>"
		config.patterns["%%ignite-ui%%"] = argv["ignite-ui"];
	}
	if (version) {
		config.patterns["%%ignite-ui%%"] = config.patterns["%%ignite-ui%%"].replace("latest", "20" + version + "/latest");
	} else {
		version = "latest";
	}
	if (argv["live-url"]) {
		// Optional override for the live demo URL (without trailing slash). Warning: might be case-sensitive
		config.liveUrl = argv["live-url"].replace(/\/$/, "");
	}

	config.version = version.toString();
	dist = dist + "/" + version;

gulp.task("process-files", () => {
	console.log("Building samples for: ", version);
	console.log("Ignite UI source root: ", config.patterns["%%ignite-ui%%"]);
	console.log("Live URL base: ", config.liveUrl);

	return gulp.src(["HTMLSamples/**/*.html"])
		.pipe(localize(config))
		.pipe(updateResources(config))
		.pipe(createFiddleFiles(config))
		.pipe(gulp.dest(dist));
});

gulp.task("copy-static-files", () => {
	return gulp.src(copySrc, { base: "./" })
		.pipe(gulp.dest("./dist"));
});

gulp.task("build-samples", gulp.series("process-files", "copy-static-files"));