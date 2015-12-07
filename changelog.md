* new structure of project (prepare/parser/builder/wrapper)
* new parser(less stronger then earlier) based on htmlparser(https://github.com/tautologistics/node-htmlparser) (why is it important, question of performance)
* tests
* compile to text for project builder
* webpack
* special HTML entities like &#62; &#60; or &#8364;
* undefined as empty string in <%= & <%-
* Correctly compile newline, apostrophes and quotes
* Allow "&#10;", "&13;" etc. after evaluation
* Tolerate "<" and ">" in evaluation fragments
* debug mode
* x-tag library support