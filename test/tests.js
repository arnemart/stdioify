var b = require('buster');
var stdioify = require('../stdioify');
var exec = require('child_process').exec;

b.testCase('stdioify', {
    'works with callback': function(done) {
        var r = randomString();
        stdioify(r, {
            'command': 'test/testapp.js',
            'in-arg': '--inFile',
            'out-arg': '--outFile'
        }, function(err, data) {
            b.assert.equals(data.toString(), r.toUpperCase());
            done();
        });
    },
    'works with streams': function(done) {
        var r = randomString();
        stdioify({
            'command': 'test/testapp.js',
            'in-arg': '--inFile',
            'out-arg': '--outFile'
        }).on('data', function(data) {
            b.assert.equals(data.toString(), r.toUpperCase());
            done();
        }).write(r);
    },
    'works without "in-arg"': function(done) {
        var r = randomString();
        stdioify({
            'command': 'test/testapp.js',
            'out-arg': '--outFile'
        }).on('data', function(data) {
            b.assert.equals(data.toString(), r.toUpperCase());
            done();
        }).write(r);
    },
    'stream supports several writes': function(done) {
        var r = ['a','b','c'];
        var i = 0;
        var strm = stdioify({
            'command': 'test/testapp.js',
            'out-arg': '--outFile'
        }).on('data', function() {
            if (i++ === 2) {
                b.assert(true);
                done();
            }
        });
        r.forEach(strm.write.bind(strm));
    },
    'handles errors': function(done) {
        var onData = this.spy();
        stdioify({
            'command': 'idonotexist',
            'out-arg': '--outFile'
        }).on('data', onData)
          .on('error', function(data) {
            b.assert.equals(data.toString(), 'Error: spawn ENOENT');
            setTimeout(function() {
                b.refute.called(onData);
                done();
            }, 100);
        }).write('some data');
    },
    'works from command line': function(done) {
        var r = randomString();
        var process = exec('./cli.js --command="test/testapp.js" --in-arg="--inFile" --out-arg="--outFile"', {}, function(err, stdout) {
            b.assert.equals(stdout.toString(), r.toUpperCase());
            done();
        });
        process.stdin.end(r);
    },
    'includes extra arguments correctly': function(done) {
        var r = randomString();
        var process = exec('./cli.js --command="test/testapp.js" --in-arg="--inFile" --out-arg="--outFile" -- --append="aaaa"', {}, function(err, stdout) {
            b.assert.equals(stdout.toString(), r.toUpperCase() + 'aaaa');
            done();
        });
        process.stdin.end(r);
    },
    'suffixes temp files correctly': function(done) {
        var process = exec('./cli.js --command="test/testapp.js" --in-arg="--inFile" --out-arg="--outFile" --suffix=".js" -- --returnFilename', {}, function(err, stdout) {
            b.assert.match(stdout, /\.js$/);
            done();
        });
        process.stdin.end(' ');
    },
    'handles errors on command line': function(done) {
        var process = exec('./cli.js --command="idonotexist" --in-arg="--inFile" --out-arg="--outFile"', {}, function(err, stdout, stderr) {
            b.assert.equals(stdout, '');
            b.assert.equals(stderr, 'Error: spawn ENOENT');
            done();
        });
        process.stdin.end(' ');
    }
});

function randomString() {
    var str = '';
    var chars = Math.round(Math.random() * 100) + 100;
    while (chars--) {
        str += String.fromCharCode(Math.round(Math.random() * 25) + 97);
    }
    return str;
}
