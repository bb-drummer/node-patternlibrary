var extend        = require('deep-extend');
var curl          = require('curl');
var queryString   = require('query-string');
var fm            = require('front-matter');
var fs            = require('fs-extra');
var glob          = require('glob');
var path          = require('path');
var through       = require('through2');
var slash         = require('slash');
var jsonfile      = require('jsonfile');

/**
 * Patternlibrary object...
 * 
 * @package Patternlibrary
 * @namespace Patternlibrary
 * @author Björn Bartels <coding@bjoernbartels.earth>
 */
class Patternlibrary_BASEOBJECT {
    
    /**
     * Initializes an instance of Patternlibrary object...
     * @constructor
     * @param {object} options - Configuration options to use.
     * @param {Patternlibrary} patternlibrary - main patternlibrary object reference.
     */
    constructor ( options, patternlibrary ) {
        
        this.options = extend(this.defaults, options);
        this.$PL     = null;
        
        if (typeof patternlibrary == 'object') {
            this.$PL = patternlibrary;
        }
    }
    
    /**
     * bind Patternlibrary object
     * 
     * @param Patternlibrary the Patternlibrary
     * @return self
     */
    bind ( patternlibrary ) {
        if ( (typeof patternlibrary.patternlibrary_version == 'undefined') ) throw 'invalid patternlibrary object to bind';
        
        if (typeof patternlibrary == 'object') {
            this.$PL = patternlibrary;
        }
        
        return (this);
    }
    
    
}


Patternlibrary_BASEOBJECT.prototype.defaults = require('./../config/default.js');

module.exports = Patternlibrary_BASEOBJECT;