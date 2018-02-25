
var fs          = require('fs');
var glob        = require('glob');
var globAll     = require('glob-all');
var marked      = require('marked');
var path        = require('path');
var extend      = require('util')._extend;
var format      = require('string-template');
var frontMatter = require('front-matter');
var escapeHTML  = require('escape-html');
var multiline   = require('multiline');

var HTML_EXAMPLE_TEMPLATE = multiline(function() {/*
<div class="docs-code" data-docs-code>
<pre>
<code class="{0}">
{1}
</code>
</pre>
</div>
*/}).replace(/(^(\s)*)/gm, '');

module.exports = function(value, config, cb, supercollider) {
    var data = getSourceExample (value, config);
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


function getSourceExample(value, config) {
    if (!fs.existsSync(value)) return false;
    var patternFile = fs.readFileSync(value).toString();
    var renderedPattern = config.$PL.getDocRenderer().renderPattern(patternFile, {});
    var renderedCode = config.$PL.getDocRenderer().highlightCode('html', renderedPattern);
    var output = format(HTML_EXAMPLE_TEMPLATE, ['html', renderedCode]);

    return {
        highlight : output,
        escaped   : escapeHTML(renderedPattern),
        raw       : renderedPattern
    };
}


function processTree(tree) {
    
    // do tree assignment stuff...

    return tree; //my_stuff;
}

