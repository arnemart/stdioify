#!/usr/bin/env node

var fs = require('fs');
var argv = require('optimist')
    .boolean('returnFilename')
    .demand('outFile')
    .argv;

var inFile = (argv.inFile ? argv.inFile : argv._[0]);
var inContent = fs.readFileSync(inFile).toString();

var outContent;

if (argv.returnFilename) {
    outContent = argv.outFile;
} else {
    outContent = inContent.toUpperCase();
}

if (argv.append) {
    outContent += argv.append;
}

fs.writeFileSync(argv.outFile, outContent);