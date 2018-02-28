/**
 * 'markdown-it' instance with plugins
 * 
 * @var {markdownIt} $markdown
 */
var $markdown = require('markdown-it')()
    .use(require("markdown-it-abbr"))
    .use(require("markdown-it-deflist"))
    .use(require("markdown-it-emoji"))
    .use(require("markdown-it-footnote"))
    //.use(require("markdown-it-pandoc-renderer"))
    .use(require("markdown-it-sub"))
    .use(require("markdown-it-sup"))
    .use(require("markdown-it-table-of-contents"))
    .use(require("markdown-it-container"))
    .use(require("markdown-it-component"))
    .use(require("markdown-it-task-lists"))
    .use(require("markdown-it-fontawesome"))
    .use(require("markdown-it-prism"));

module.exports = $markdown;