var handlebars = require('handlebars');
var $markdown = require('../vendor/markdown-it');

function markdown(options) {

    return $markdown.render(options.fn(this));
}


/**
 * Handlebars block helper that converts Markdown to HTML.
 * The code blocks in the markdown are rendered with the syntax highlighting.
 * @param {object} options - Handlebars object.
 * @example
 * {{#markdown}}Welcome to [zombo.com](http://zombo.com){{/markdown}}
 * @returns The Markdown inside the helper, converted to HTML.
 */
handlebars.registerHelper('markdown', markdown);
module.exports = markdown;
