var fs = require('fs-extra');
var path = require('path');
var _ = require('lodash');
var Mustache = require('mustache');
var Showdown  = require('showdown'),
    Converter = new Showdown.Converter();

function generateFile(markdownFullPath) {
	var templateFullPath = path.resolve(__dirname, 'src/template/template.html');
	var markDownParsedPath = path.parse(markdownFullPath);
	var outputRelativePath = getOutputRelativePath(markDownParsedPath);
	var outputFullPath = getOutputFullPath(outputRelativePath, markDownParsedPath);
	var activeLinkName = getActiveLinkName(outputRelativePath);
	
	var convertedMarkdown;

	var markdownContent = fs.readFileSync(markdownFullPath, 'utf8')
	var convertedMarkdown = Converter.makeHtml(markdownContent);
	var templateContent = fs.readFileSync(templateFullPath, 'utf8');
	var generatedPage = Mustache.render(templateContent, {
		workSelected:  activeLinkName === 'work',
		playSelected:  activeLinkName === 'play',
		aboutSelected: activeLinkName === 'about',
		rootPath: getRootRelativePath(outputRelativePath),
		content: convertedMarkdown
	});

	fs.ensureDirSync(path.parse(outputFullPath).dir);
	fs.writeFileSync(outputFullPath, generatedPage);
};

function getOutputRelativePath(markDownParsedPath) {
	var pagesRelativePath = path.resolve(__dirname, 'src/pages');
	return outputRelativePath = path.relative(pagesRelativePath, markDownParsedPath.dir);	
}

function getOutputFullPath(outputRelativePath, markDownParsedPath) {
	return path.resolve(
		__dirname, 
		outputRelativePath,
		markDownParsedPath.name + '.html'
	);
}

function getActiveLinkName(outputRelativePath) {
	return outputRelativePath.split('/')[0] || 'work';
}

function getRootRelativePath(outputRelativePath) {
	if (!outputRelativePath) {
		return '';
	}

	var tokens = outputRelativePath.split('/');	
	return _.times(tokens.length, _.constant('../')).join('');
}

module.exports = generateFile;

if (!module.parent) {
	var markdownFullPath = path.resolve(__dirname, process.argv[2]);
	generateFile(markdownFullPath)
	console.log('file generated!');
}