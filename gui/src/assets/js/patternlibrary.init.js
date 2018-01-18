/**
 * theme base setup (Zurb PLFoundation)
 * 
 * patternlibrary client (init-)script
 *   
 * @package     [patternlibrary]
 * @subpackage  patternlibrary client script
 * @author      Björn Bartels <coding@bjoernbartels.earth>
 * @link        https://gitlab.bjoernbartels.earth/js/patternlibrary
 * @license     http://www.apache.org/licenses/LICENSE-2.0 Apache License, Version 2.0
 * @copyright   copyright (c) 2016 Björn Bartels <coding@bjoernbartels.earth>
 */

if (!jQuery) {
    console.error('jQuery not found...');
    window.stop();
}

if (!$.fn.plfoundation) {
    console.error('PLFoundation not found...');
    window.stop();
}

(function ($, doc, win, patternlibrary) {
    
    var $doc = $(doc),
        $lang = patternlibrary.Config.lang
    ;
    patternlibrary.Config.debug = true;
    
	//window.ontouchmove = function() { return false; }
	//window.onorientationchange = function() { document.body.scrollTop = 0; }  
        
    //
    // init patternlibrary (frontent)
    //
    $doc.ready(function () {
    	
    	$(document)
    	    .plfoundation()
    	    .patternlibrary()
    	;
    	
    	//$doc.patternlibrary();
        
    });

})(jQuery, document, window, patternlibrary);