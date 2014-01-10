[![Build Status](https://travis-ci.org/arnemart/stdioify.png?branch=master)](https://travis-ci.org/arnemart/stdioify)

stdioify
========

stdioify is a dirty little hack for making applications that read from and write to files use stdin/stdout instead.

Installation
------------

    npm install stdioify [-g]

Example
-------

To make [traceur](https://github.com/google/traceur-compiler) read from stdin and output to stdout, run the following command

    cat test.js | stdioify --command traceur --out-arg="--out" --suffix=".js"

stdioify will then read input data from stdin, write it out to a temporary file, set up a temporary file for output, and run the following command:

    traceur --out <temp-out-file> <temp-in-file>

Finally, it will read the output file and write its data to stdout.

Use in code
-----------

stdioify can also be used as a library in node.js, of course.

    var stdioify = require('./stdioify');
    
    var js = 'class Greeter { sayHi() { console.log("Hi!"); } }\n' +
             'var greeter = new Greeter();\n' +
             'greeter.sayHi();';
    
    stdioify({
        command:   'traceur',
        'out-arg': '--out',
        suffix:    '.js'
    }).on('data', function(data) {
        console.log(data.toString());
    }).write(js);


Options
-------

- `--command`, `-c`: Path to executable to run [required]
- `--in-arg`,  `-i`: Argument for in-file passed to command (if left out, filename will simply be appended to argument list)
- `--out-arg`, `-o`: Argument for out-file passed to command (if left out, application is assumed to write to stdout already)
- `--suffix`,  `-s`: Suffix to use for temp files

Any arguments after `--` will be passed to the application as-is.

License
-------

WTFPL
