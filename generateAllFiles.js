var generateFile = require('./generateFile');
var recursive = require("recursive-readdir");
var _ = require('lodash');
var fs = require('fs-extra');

fs.removeSync(__dirname + '/about');
fs.removeSync(__dirname + '/work');
fs.removeSync(__dirname + '/play');

recursive(__dirname + '/src/pages', function (err, files) {
	if (err) {
		throw err;
	}

	_.each(files, function(file) {
		generateFile(file);
		process.stdout.write('.');
	});
	console.log('\nAll files generated!');
});