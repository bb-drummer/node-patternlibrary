/**
 * 
 */
;(function ($, window, document, patternlibrary) {
  'use strict';


  patternlibrary.libs.windowhref = {
    name : 'windowhref',

    version : '0.0.1',

    settings : {
      callback : function () {}
    },

    init : function (scope, method, options) {
      var self = this;
      // patternlibrary.inherit(this, 'modulename1 modulename2');
    },

    /**
     * update window's href to URL and save old href
     * 
     * @param  string  url  URL to update to
     * @return patternlibrary.libs.windowhref
     */
    update : function ( url ) {
        if ( (url == '') || (url == window.location.href) ) { return; }
        
        document._old_href = window.location.href;
        window.history.pushState(
            {
                "html" : null,
                "pageTitle" : document.title
            },
            "",
            updateWindowHref
        );
        
        return (this);
    },
    
    /**
     * reset window's href to stored URL
     * 
     * @return patternlibrary.libs.windowhref
     */
    reset : function () {
        if (document._old_href) {
            window.history.pushState(
                {
                    "html":null,
                    "pageTitle":document.title
                },
                "",
                document._old_href
            );
            this.clear();
        }
        return (this);
    },
    
    /**
     * clear stored URL
     * 
     * @return patternlibrary.libs.windowhref
     */
    clearOldHref : function () {
        document._old_href = null;
        return (this);
    }

  };

  // code, private functions, etc here...

  patternlibrary.WindowHref = {
      update : patternlibrary.libs.windowhref.update,
      reset : patternlibrary.libs.windowhref.reset,
      clear : patternlibrary.libs.windowhref.clearOldHref
  };
  
})(jQuery, window, document, window.patternlibrary);


