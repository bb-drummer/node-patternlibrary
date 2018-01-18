/**
 * 
 */
;(function ($, window, document, patternlibrary, undefined) {
  'use strict';


  patternlibrary.libs.modal = {
    name : 'modal',

    version : '0.0.1',

    settings : {
      callback : function () {}
    },

    /*init : function (scope, method, options) {
      var self = this;
      // patternlibrary.inherit(this, 'modulename1 modulename2');

      this.bindings(method, options);
    },*/

    /**
     * open modal dialog
     * 
     * @param  mixed  data  the modal content
     * @param  string  updateWindowHref  URL to update browser history and location, -false/null- disables, default -false- 
     * @return patternlibrary.libs.modal
     */
    open : function (data, updateWindowHref) {
        if ((typeof $.fn.modal == 'undefined') && (typeof PLFoundation.Reveal == 'undefined')) {
            console.warn('Bootstrap Modal and/or PLFoundation Reveal plug-ins not found...');
            return;
        }
        var $modal = null;
        if (typeof PLFoundation != 'undefined') {
            if ( $('#'+patternlibrary.Config.modals.plfoundationElementClassname).size() == 0 ) {
                $('BODY').append('<div id="'+patternlibrary.Config.modals.plfoundationElementClassname+'" class="'+patternlibrary.Config.modals.plfoundationElementClassname+'" data-reveal></div>')
            }
            var revealOptions = { 
            	"animationIn"    : "scale-in-up",
            	"animationOut"   : "scale-out-down",
            	"overlay"        : true,
            	"closeOnClick"   : false,
            	"closeOnEcs"     : true,
            	"multipleOpened" : false,
            	"deepLink"       : false
            }
            var modalData = ''+data+'',
                m = new PLFoundation.Reveal($('#'+patternlibrary.Config.modals.plfoundationElementClassname), revealOptions)
            ;
            $('#'+patternlibrary.Config.modals.plfoundationElementClassname).html(data).plfoundation('open');
            $modal = $('.'+patternlibrary.Config.modals.plfoundationElementClassname);
            $modal.on('closed.zf.reveal', patternlibrary.Modal.close);
        } else {
            var $modalDefaults = {
                show: true
            };
            $(data).modal($modalDefaults);
            $modal = $('.'+patternlibrary.Config.modals.bootstrapElementClassname);
        }
        
        if (updateWindowHref) {
            patternlibrary.WindowHref.reset();
            document._old_href = window.location.href;
            window.history.pushState(
                {
                    "html" : null,
                    "pageTitle" : document.title
                },
                "",
                updateWindowHref
            );
        }
        
        return ($modal);
    },
    
    /**
     * close modal dialog
     * 
     * @return patternlibrary.libs.modal
     */
    close : function () {
        if ((typeof $.fn.modal == 'undefined') && (typeof PLFoundation.Reveal == 'undefined')) {
            console.warn('jQuery Modal and/or PLFoundation Reveal plug-ins not found...');
            return;
        }
        
        var $modal;
        // close/destroy modals
        if (typeof PLFoundation != 'undefined') {
            $modal = $('.'+patternlibrary.Config.modals.plfoundationElementClassname);
            if ($modal) {
                try {
                    $modal.hide();
                    $modal.plfoundation('close');
                    //$modal.plfoundation('destroy');
                    //$('.reveal-overlay').remove();
                	console.info('modal closed...');
                } catch (e) {
                	//console.warn('modal could not be closed... force removal...');
                }
            }
        } else {
            $modal = $('.'+patternlibrary.Config.modals.bootstrapElementClassname);
            if ($modal) {
                $modal.modal('hide');
            }
        }
        
        // clean up
        $('BODY').removeClass('is-reveal-open');
        $('.reveal, .reveal-wrapper, .modal, .modal-backdrop').remove();
        
        // (re)set document URL
        patternlibrary.WindowHref.reset();
        
        return (this);
    }

  };

  // code, private functions, etc here...

  patternlibrary.Modal = {
      open : patternlibrary.libs.modal.open,
      close : patternlibrary.libs.modal.close,
  };
  
})(jQuery, window, document, window.patternlibrary);


