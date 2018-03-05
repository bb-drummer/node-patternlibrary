var handlebars = require('handlebars');
var requireDir = require('require-dir');
var path       = require('path');

requireDir(path.join(__dirname,'../handlebars'));

module.exports = handlebars;// .noConflict();
