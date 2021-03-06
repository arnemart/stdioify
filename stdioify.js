var temp = require('temp');
var spawn = require('child_process').spawn;
var fs = require('fs');
var map = require('map-stream');

module.exports = stdioify;
module.exports.stream = stdioifyStream;

function stdioify(data, argv, callback) {
    if (!argv && !callback && Object.prototype.toString.call(data) === '[object Object]') {
        return stdioifyStream(data);
    }
    if (!argv.suffix) {
        argv.suffix = 'stdioify';
    }
    temp.track();
    getTempFiles(argv, function(err, inFile, outFile) {
        writeAndRun(data, inFile, outFile, argv, function(err, data) {
            if (err) {
                return callback(err);
            }
            callback(null, data);
        });
    });
}

function stdioifyStream(argv) {
    var strm = map(function(inData, callback) {
        stdioify(inData, argv, function(err, data) {
            if (err) {
                return callback(err);
            }
            callback(null, data);
        });
    });
    return strm;
}

function getTempFiles(argv, callback) {
    temp.open({suffix: argv.suffix}, function(err, inFile) {
        if (err) {
            return callback(err);
        }
        temp.open({suffix: argv.suffix}, function(err, outFile) {
            if (err) {
                return callback(err);
            }
            callback(null, inFile, outFile);
        });
    });
}

function writeAndRun(data, inFile, outFile, argv, callback) {
    fs.writeFile(inFile.path, data, function(err) {
        if (err) {
            return callback(err);
        }
        var args = [argv['out-arg'], outFile.path];
        if (argv['in-arg']) {
            args.push(argv['in-arg']);
        }
        args.push(inFile.path);
        if (argv._) {
            args = args.concat(argv._);
        }
        var cmd = spawn(argv.command, args, {
            cwd: process.cwd()
        });
        cmd.on('error', function(err) {
            return callback(err);
        });
        cmd.stderr.pipe(process.stderr);
        if (!argv['out-arg']) {
            cmd.stdout.pipe(process.stdout);
        }
        cmd.on('close', function(code) {
            if (code === 0 && argv['out-arg']) {
                readAndReturn(outFile, callback);
            } else if (!callback) {
                callback('Return code ' + code);
            }
        });
    });
}

function readAndReturn(outFile, callback) {
    fs.readFile(outFile.path, function(err, data) {
        if (err) {
            return callback(err);
        }
        callback(null, data);
    });
}