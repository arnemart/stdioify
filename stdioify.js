#!/usr/bin/env node

var temp = require('temp');
var spawn = require('child_process').spawn;
var fs = require('fs');
var argv = require('optimist')
    .usage('Usage: $0 --command="/path/to/command" --in-arg="[in-arg]" --out-arg="[out-arg]" --suffix=".js" [-- --any-extra-args]')
    .demand(['command'])
    .alias({
        'command': 'c',
        'in-arg': 'i',
        'out-arg': 'o',
        'suffix': 's'
    })
    .default('suffix', '.stdioify')
    .describe({
        'command': 'Path to executable to run',
        'in-arg': 'Argument for in-file passed to command',
        'out-arg': 'Argument for out-file passed to command',
        'suffix': 'Suffix to use for temp files'
    })
    .argv;

temp.track();

getTempFiles(function(inFile, outFile) {
    process.stdin.on('data', function(data) {
        writeAndRun(data, inFile, outFile);
    });
});

function getTempFiles(callback) {
    temp.open({suffix: argv.suffix}, function(err, inFile) {
        if (err) {
            return error(err);
        }
        temp.open({suffix: argv.suffix}, function(err, outFile) {
            if (err) {
                return error(err);
            }
            callback(inFile, outFile);
        });
    });
}

function writeAndRun(data, inFile, outFile) {
    fs.writeFile(inFile.path, data, function(err) {
        if (err) {
            return error(err);
        }
        var args = [argv['out-arg'], outFile.path];
        if (argv['in-arg']) {
            args.push(argv['in-arg']);
        }
        args.push(inFile.path);
        args.concat(argv._);
        var cmd = spawn(argv.command, args, {
            cwd: process.cwd()
        });
        cmd.stderr.on('data', function(data) {
            process.stderr.write(data);
        });
        if (!argv['out-arg']) {
            cmd.stdout.pipe(process.stdout);
        }
        cmd.on('close', function(code) {
            if (code === 0 && argv['out-arg']) {
                readAndReturn(outFile);
            } else {
                process.exit(code);
            }
        });
    });
}

function readAndReturn(outFile) {
    fs.readFile(outFile.path, function(err, data) {
        if (err) {
            return error(err);
        }
        process.stdout.write(data);
    });
}

function error(err) {
    process.stderr.write(error);
    process.exit(1);
}