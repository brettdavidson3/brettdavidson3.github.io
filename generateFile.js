var fs = require('fs-extra');
var path = require('path');
var _ = require('lodash');
var Mustache = require('mustache');
var Showdown  = require('showdown'),
    Converter = new Showdown.Converter();

function generateFile(srcFileFullPath) {
	var srcFileParsedPath = path.parse(srcFileFullPath);

	if (srcFileParsedPath.ext === '.md') {
		generateHtmlFromMarkdown(srcFileFullPath, srcFileParsedPath);
	} else {
		copyFileToDestDirectory(srcFileFullPath, srcFileParsedPath);
	}	
}

function copyFileToDestDirectory(srcFileFullPath, srcFileParsedPath) {
	var destRelativePath = getDestRelativePath(srcFileParsedPath);
	var destFullPath = getDestFullPath(destRelativePath, srcFileParsedPath, srcFileParsedPath.ext);
	fs.ensureDirSync(path.parse(destFullPath).dir);
	fs.copySync(srcFileFullPath, destFullPath);
}

function generateHtmlFromMarkdown(srcFileFullPath, srcFileParsedPath) {
	var templateFullPath = path.resolve(__dirname, 'src/template/template.html');
	var destRelativePath = getDestRelativePath(srcFileParsedPath);
	var destFullPath = getDestFullPath(destRelativePath, srcFileParsedPath, '.html');
	var activeLinkName = getActiveLinkName(destRelativePath);
	
	var convertedMarkdown;

	var markdownContent = fs.readFileSync(srcFileFullPath, 'utf8')
	var convertedMarkdown = Converter.makeHtml(markdownContent);
	var templateContent = fs.readFileSync(templateFullPath, 'utf8');
	var generatedPage = Mustache.render(templateContent, {
		workSelected:  activeLinkName === 'work',
		playSelected:  activeLinkName === 'play',
		aboutSelected: activeLinkName === 'about',
		rootPath: getRootRelativePath(destRelativePath),
		content: convertedMarkdown
	});

	fs.ensureDirSync(path.parse(destFullPath).dir);
	fs.writeFileSync(destFullPath, generatedPage);
}

function getDestRelativePath(srcFileParsedPath) {
	var pagesRelativePath = path.resolve(__dirname, 'src/pages');
	return destRelativePath = path.relative(pagesRelativePath, srcFileParsedPath.dir);	
}

function getDestFullPath(destRelativePath, srcFileParsedPath, extension) {
	return path.resolve(
		__dirname, 
		destRelativePath,
		srcFileParsedPath.name + extension
	);
}

function getActiveLinkName(destRelativePath) {
	return destRelativePath.split('/')[0] || 'work';
}

function getRootRelativePath(destRelativePath) {
	if (!destRelativePath) {
		return '';
	}

	var tokens = destRelativePath.split('/');	
	return _.times(tokens.length, _.constant('../')).join('');
}

module.exports = generateFile;

if (!module.parent) {
	var markdownFullPath = path.resolve(__dirname, process.argv[2]);
	generateFile(markdownFullPath)
	console.log('file generated!');
}