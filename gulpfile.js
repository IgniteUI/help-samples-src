var gulp = require("gulp"),
	util = require("gulp-util"),
	localize = require("./build/localizeFiles.js"),
	updateResources = require("./build/updateResources.js"),
	createFiddleFiles = require("./build/createFiddleFiles.js");

var version = util.env.version; //should be passed as --version ${TRAVIS_BRANCH}

var dist = "./dist",
	copySrc = [
		"./css/**/*",
		"./js/**/*",
		"./data-files/**/*",
		"./data-files-ja/**/*"
	],
	config = require("./build/config.json");

	if (version) {
		config.patterns[0].replace = config.patterns[0].replace.replace("latest", "20" + version + "/latest");
	} else {
		version = "latest";
	}
	config.version = version;
	dist = dist + "/" + version;

gulp.task("process-files", function () {
	console.log("Building samples for: ", version);

	return gulp.src(["HTMLSamples/**/*.html"])
		.pipe(localize(config))
		.pipe(updateResources(config))
		.pipe(createFiddleFiles(config))
		.pipe(gulp.dest(dist));
});

gulp.task("build-samples", ["process-files"], function () {
	return gulp.src(copySrc, { base: "./" })
		.pipe(gulp.dest("./dist"));
});