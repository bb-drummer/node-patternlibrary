var extend        = require('deep-extend');
var curl          = require('curl'); // 0.1.4
var queryString   = require('query-string'); // 4.3.4
var fm            = require('front-matter');
var fs            = require('fs-extra');
var glob          = require('glob');
var path          = require('path');
var through       = require('through2');
var slash         = require('slash');
var jsonfile      = require('jsonfile');
var yaml          = require('js-yaml');

/**
 * Patternlibrary configuration reader
 * 
 * @package Patternlibrary
 * @namespace Patternlibrary
 * @author Björn Bartels <me@bjoernbartels.earth>
 */
class Patternlibrary_Config {
	
	/**
	 * Initializes an instance of Patternlibrary configuration reader.
	 * @constructor
	 * @param {object} options - Configuration options to use.
	 */
	constructor ( options ) {
		
		if (typeof options == 'string') {
			options = this._loadFromFile(options);
		}
		
		if (typeof options == 'object') {
			this.options = extend(this.defaults, options);
		}
		
	}
	
	//const { COMPATIBILITY, PORT, UNCSS_OPTIONS, PATHS } = loadConfig();
	
	_loadFromFile ( file_name ) {
        let file = fs.stat(file_name);
        var opitons = {};
        
        if ( file.isFile() ) {
			console.log('loading config from file:', file_name);
			
			if ( /$.yml/.test(file_name) ) {
				options = this._loadYaml(file_name);
			} else if ( /$.json/.test(options) ) {
				options = this._loadJson(file_name);
			} else {
				console.log('cannot load config from file,, invalid extension:', file_name);
			}
			console.log('result: ', options);
        } else {
			console.log('cannot load config from file:', file_name);
        }

		return options;
	}

	_loadYaml ( yamlfile_name ) {
	    let ymlFile = fs.readFileSync(yamlfile_name, 'utf8');
	    return yaml.load(ymlFile);
	}


	_loadJson ( jsonfile_name ) {
	    return jsonfile.readFileSync(jsonfile_name);
	}

	get ( key ) {
		if (typeof this.options[key] != 'undefined') {
			return this.options[key];
		}
		return this.options;
	}
	
	set ( args ) {
		if (arguments.length == 1) {
			if (typeof args == 'object') {
				this.options = args;
			}
		}
		if (arguments.length == 3) {
			var key   = arguments[0];
			var value = arguments[1];
			var merge = arguments[2];
			if (typeof merge == 'boolean') {
				if (merge === true) {
					if (typeof this.options[key] != 'undefined') {
				        this.options[key] = this._merge(this.options[key], value);
					} else {
				        this.options[key] = value;
					}
				} else {
				    this.options = args;
				}
			}
		}
		if (arguments.length == 2) {
			var mixed = arguments[0];
			var value = arguments[1];

			if (typeof mixed == 'object') {
				if (typeof value == 'boolean') { // merge -> true 
                    if (value === true) {
						this.options = this._merge(this.options, mixed);
					} else {
					    this.options = mixed;
					}
				} else {
				    this.options = mixed;
				}
			}

			if (typeof mixed == 'string') {
				this.options[mixed] = value;
			}
		}
	}
	
	_merge ( args ) {
		return ( extend( arguments[0], arguments[1] ) );
	}
}

Patternlibrary_Config.prototype.defaults = require('./../config/default.js');

module.exports = Patternlibrary_Config;