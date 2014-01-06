stdioify
========

stdioify is a dirty little hack for making applications that read from and write to files use stdin/stdout instead.

Example
-------

To make [traceur][https://github.com/google/traceur-compiler] read from stdin and output to stdout, run the following command

    cat test.js | stdioify --command traceur --out-arg="--out" --suffix=".js"

stdioify will then read input data from stdin, write it out to a temporary file, set up a temporary file for output, and run the following command:

    traceur --out <temp-out-file> <temp-in-file>

Finally, it will read the output file and write its data to stdout.

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