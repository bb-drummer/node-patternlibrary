var Handlebars = require('handlebars');

/**
 * tries to generate an random unique ID string linke "uid-46ea-807b"
 *
 * usage:
 *   ```
 *   {{uniqueid}}       // -> generates "uid-a1b-2c3d"
 *   ...
 *   {{uniqueid}}       // -> generates "uid-9z8-y7x6"
 *   ```
 * or
 *   ```
 *   {{uniqueid "the_id"}}  // -> generates "uid-1a2-c3c4"
 *   ...
 *   {{uniqueid "the_id"}}  // -> remembers `the_id`: "uid-1a2-c3c4"
 *   
 *   
 * @param string name (optional)
 * @return string
 * 
 * @see https://jsfiddle.net/xg7tek9j/7/ 
 */

module.exports = function ( name ) {
	const PREFIX = 'uid-';
	
	if (typeof this.IDs == 'undefined') {
		this.IDs = {};
	}
	if (name) {
		if ( (typeof this.IDs[name] != 'undefined') ) {
			return new Handlebars.SafeString( this.IDs[name] );
		}
	}
	
    var d = new Date().getTime();
    var uid = (PREFIX+'xxx-yxxx').replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
	if (name) {
        this.IDs[name] = uid;
	}
	
    return new Handlebars.SafeString( uid );
    
}