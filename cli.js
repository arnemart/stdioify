#!/usr/bin/env node

var stdioify = require('./stdioify');
var argv = require('optimist')
    .usage('Usage: $0 --command="/path/to/command" --in-arg="[in-arg]" --out-arg="[out-arg]" --suffix=".js" [-- --any-extra-args]')
    .demand(['command'])
    .alias({
        'command': 'c',
        'in-arg': 'i',
        'out-arg': 'o',
        'suffix': 's'
    })
    .string(['command', 'in-arg', 'out-arg', 'suffix'])
    .describe({
        'command': 'Path to executable to run',
        'in-arg': 'Argument for in-file passed to command',
        'out-arg': 'Argument for out-file passed to command',
        'suffix': 'Suffix to use for temp files'
    })
    .argv;

process.stdin.on('data', function(data) {
    stdioify(data, argv, function(err, data) {
        if (err) {
            process.stderr.write(err);
            process.exit(1);
        }
        process.stdout.write(data);
    });
});
