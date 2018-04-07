
var fs          = require('fs');
var glob        = require('glob');
var globAll     = require('glob-all');
var path        = require('path');
var extend      = require('util')._extend;
var format      = require('string-template');
var frontMatter = require('front-matter');
var escapeHTML  = require('escape-html');
var multiline   = require('multiline');
var highlightCode = require('../util/highlight-code');

var HTML_EXAMPLE_TEMPLATE = multiline(function() {/*
<div class="docs-code" data-patternlibrary-copycode>
<pre><code class="language-{0}">{1}</code></pre>
</div>
*/}).replace(/(^(\s)*)/gm, '');

module.exports = function(value, config, cb, pl) {
    var data = getSourceCode (value, config, pl);
    cb(null, processTree(data));
}

module.exports.config = {
    verbose: false
}

module.exports.search = function(items, link) {
    var results = [];
    // this => collider
    /* results.push({
        name: name,
        type: 'sass ' + type,
        description: description,
        link: link + hash
    }); */

    return results;
}


function getSourceCode(value, config, pl) {

    var sourceFile = frontMatter(fs.readFileSync(value).toString());
    var renderedCode = highlightCode('html', sourceFile.body);
    var output = format(HTML_EXAMPLE_TEMPLATE, ['html', renderedCode]);

    return {
        highlight : output,
        escaped   : escapeHTML(sourceFile.body),
        raw       : sourceFile.body
    };
}


function processTree(tree) {
    
    // do tree assignment stuff...

    return tree; //my_stuff;
}

