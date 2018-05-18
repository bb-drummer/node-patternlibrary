var hljs          = require('../vendor/highlightjs');

/**
 * render a code snippet into highlighted code HTML
 * 
 * @param string language
 * @param string code
 * @return string
 */
function highlightCode ( language, code ) { 
    try {
        return  hljs.highlight( language, code ).value;
    } catch (err) {
        throw new Error('highlightCode Error: ', err);
    }        
} // highlightCode () {}
    

module.exports = highlightCode;