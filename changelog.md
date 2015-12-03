* new structure of project (prepare/parser/builder/wrapper)
* new parser(less stronger then earlier) based on htmlparser(https://github.com/tautologistics/node-htmlparser) (why is it important, question of performance)
* tests
* comments in itemplate functions
* compile to text for project builder
* webpack
* special HTML entities like &#62; &#60; or &#8364;
* undefined as empty string in <%= & <%-
* Correctly compile newline, apostrophes and quotes
* Allow "&lt;" and "&gt;" after evaluation
* Tolerate "<" and ">" in evalutation fragments
* debug mode

todo extended mode for attributes
/**
 * Based on https://github.com/tautologistics/node-htmlparser
 * and https://github.com/deanmao/node-htmlparser/commit/fdcdd0a3f421e7ca28aa10816b79e5d78b1cfba8
 */

ToDo:
reason: Why is it not 1th place in performance...