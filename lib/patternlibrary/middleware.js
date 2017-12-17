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

/**
 * Patternlibrary 'gulp-connect'/'gulp-browser-sync' middleware hook
 * 
 * @package Patternlibrary
 * @namespace Patternlibrary
 * @author Björn Bartels <me@bjoernbartels.earth>
 */
class Patternlibrary_Middleware {
    
    /**
     * Initializes an instance of Patternlibrary middleware hook.
     * @constructor
     * @param {object} options - Configuration options to use.
     * @param {Patternlibrary} patternlibrary - main patternlibrary object reference.
     */
    constructor ( options, patternlibrary ) {
        
        this.options = extend(this.defaults, options);
        
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
    
    getRoute ( httpRequest ) {
        return ( httpRequest._parsedUrl.pathname.toLowerCase().replace(this.options.basepath, '') )
    }
    
    getMethod ( httpRequest ) {
        return ( httpRequest.method.toLowerCase() )
    }
    
    getPatterns () {
        return this.$PL.data;
        
    }
    
    getTree () {
        return this.$PL.Supercollider.tree;
        
    }
    
    getSearch ( callback ) {
        var $PL        = this.$PL;
        var searchFile = $PL.options.dest+'search.json';
        $PL.Supercollider.buildSearch(searchFile, callback); 
    }
    
    getHook () {
        return ( this.hook.bind(this) );
    }
    
    /**
     * 'gulp-connect'/'gulp-browser-sync' middleware hook
     * 
     * @param Request httpRequest
     * @param Response httpResponse
     * @param function next
     */
    hook (httpRequest, httpResponse, next) {

        var $PL      = this.$PL,
            basePath = this.options.basepath, // '/pl',
            method   = this.getMethod(httpRequest),
            route    = this.getRoute(httpRequest)
        
        ;
        
        // allow cross-domain ajax/iframe access
        httpResponse.setHeader('Access-Control-Allow-Origin', '*');
        
        switch (method) {
        
            case 'delete' :
            case 'put' :
            case 'update' :
            case 'post' :
                
                switch (route) {
                    case "some_route" : 
                        // this is to come ... ;)
                        console.log('some route...:', route);
                    break; 
                    default:
                        // this is to come ... ;)
                        console.log('method: ',  httpRequest.method.toLowerCase());
                        console.log('request: ', httpRequest.url);
                        next();
                    break;
                }
                
            break;

            case 'get' :
            default :
                
                switch (route) {
                    case '/patterns.json' :
                    case '/patternlibrary.json' :
                        httpResponse.write( ''+JSON.stringify({
                            patterns: this.getPatterns(),
                            tree    : this.getTree()
                        })+'' );
                        httpResponse.end();
                    break;

                    case '/search' :
                    case '/search.json' :
                        var searchFile = $PL.options.dest+'search.json';
                        this.getSearch(function() {
                            jsonfile.readFile(searchFile, function(err, obj) {
                                httpResponse.write( ''+JSON.stringify(obj)+'' );
                                httpResponse.end();
                            });
                        });
                    break;
                    
                    case '/proxy' :
                    case '/emulate' :
                    case '/emulate.php' :
                        var query = queryString.parse(httpRequest._parsedUrl.search);
                        var EmulatorLinkScript = '<script type="text/javascript">'
                            +'document.domain=document.domain.replace(\'www.\',\'\');'
                            +'parent.document.getElementById(\'UrlTxt\').innerHTML=\'http://my-application.net/en/user/login\';'
                            +'function bye() {'
                                +'if(parent.EmulatorStarted == false){'
                                    +'window.parent.EmulatorUrlBye(this.location.href);'
                                +'}'
                            +'}'
                            +'window.onbeforeunload = bye;'
                        +'</script>';
                        var EmulatorNoContentScript = '<script type="text/javascript">'
                            +'document.domain=document.domain.replace(\'www.\',\'\');'
                            +'window.parent.EmulatorUrlKO();'
                        +'</script>';
                        
                        curl.get(query.url, {}, function(err, response, body) {
                            if (err) throw err;
                            if (body != '') {
                                body = String(body).replace('<head>','<head><base href="'+query.url+'">');
                                httpResponse.write(
                                    String(body).replace('</body>', EmulatorLinkScript+'</body>')
                                    +''
                                    +"\n"
                                );
                            } else {
                                httpResponse.write(
                                    String(body).replace('</body>', EmulatorLinkScript+'</body>')
                                    +''
                                    +"\n"
                                );
                            }
                            httpResponse.end();
                        });
                        
                    break;
                    
                    case '/userscreensize.php' :
                        httpResponse.write('url: '+JSON.stringify(httpRequest._parsedUrl, null, 4)+"\n" );
                        httpResponse.end();
                    break;
                    
                    
                    default:
                        // no route found... handle over to try to serve file...
                        //console.log('request: ', httpRequest.url);
                        next();
                    break;
                    
                } // switch (route)
            
            break;
            
        } // switch (method)
        
    }
    
}

Patternlibrary_Middleware.prototype.defaults = require('./../config/default.js');

module.exports = Patternlibrary_Middleware;