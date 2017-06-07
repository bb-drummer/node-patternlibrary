var extend  = require('deep-extend');

/**
 * includes/renders a pattern into current position
 * (wraps Handlebars'/Panini's {{> ...}} helper)
 * 
 */
module.exports = function(options) {

    //console.log('arguments: ', arguments);
    
    var args = [];
    var patternContent = '';
    var patternData = {};
    var patternName = false;
    var result = '';
    
    if (arguments.length > 1) {
        for (var i = 0; i < arguments.length; i++) {
            if ( i != (arguments.length-1) ) {
                console.log('arg '+i+': ', arguments[i]);
                args.push(arguments[i])
            } else {
                options = arguments[arguments.length-1];
            }
        }
    }
    
    if (typeof options.hash.atom != 'undefined') {
        patternName = 'atom/'+options.hash.atom;
    }
    if (typeof options.hash.molecule != 'undefined') {
        patternName = 'molecule/'+options.hash.molecule;
    }
    if (typeof options.hash.organism != 'undefined') {
        patternName = 'organism/'+options.hash.organism;
    }
    if (typeof options.hash.template != 'undefined') {
        patternName = 'template/'+options.hash.template;
    }
    
    if (patternName) {
        args.push(patternName);
    }

    var $PL = options.data.root.Patternlibrary;
    var patterns = $PL.getPatterns();
    
    for (var i = 0; i < args.length; i++) {
        var thisPatternName = args[i];
        
        $PL.Panini.data.Patternlibrary = null;
        extend(patternData, $PL.Panini.data);
        $PL.Panini.data.Patternlibrary = $PL;
        
        if (typeof patterns[thisPatternName] != 'undefined') {
            patternContent = patterns[thisPatternName].body;
            $PL.patternUsage(thisPatternName, options.data.root);
        } else {
            throw ('Patternlibrary error: pattern "'+thisPatternName+'" not found');
            patternContent = '';
        }
        
        options.data.root.Patternlibrary = null ;
        extend(patternData, patterns[thisPatternName]);
        extend(patternData, options.data.root);
        extend(patternData, options.hash);
        
        $PL.updateDataFile();
        options.data.root.Patternlibrary = $PL ;

        var layoutTemplate = $PL.Handlebars.compile('{{> body}}' /*+ '\n'*/, {noEscape: true});
        var patternTemplate = $PL.Handlebars.compile(patternContent /*+ '\n'*/, {noEscape: true});
        
        $PL.Handlebars.registerPartial('body', patternTemplate);
        var rendered = layoutTemplate(patternData);
        
        result = ( new $PL.Panini.Handlebars.SafeString( rendered ) );
        
    }
    return (result);
    
}
