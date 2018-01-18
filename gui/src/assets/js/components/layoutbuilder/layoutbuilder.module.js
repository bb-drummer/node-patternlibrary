/**
 * Layoutbuilder module.
 * @module patternlibrary.layoutbuilder
 * 
 * @requires patternlibrary.Plugin
 * @requires foundation.Triggers
 * @requires foundation.Keyboard
 * @requires foundation.MediaQuery
 */
class Layoutbuilder extends Plugin {

    /**
     * Setup a new instance of a layoutbuilder.
     * @class
     * @name Layoutbuilder
     * @param {jQuery} element - jQuery object to make into a layoutbuilder.
     *        Object should be of the layoutbuilder panel, rather than its anchor.
     * @param {Object} options - Overrides to the default plugin settings.
     */
	_setup(element, options) {
		if (patternlibrary.debug()) console.log('layoutbuilder init');
    	this.$element = element;
        this.options = $.extend({}, Layoutbuilder.defaults, this.$element.data(), options);
        this.className = 'layoutbuilder'; // ie9 back compat

        // Triggers init is idempotent, just need to make sure it is initialized
        PLFoundation.Triggers.init($);

        this._init();

        // (maybe, this line is not nessessary anymore...?!)
        //PLFoundation.registerPlugin(this, 'Layoutbuilder');
        
        this.$element.children().first().focus();
        if (patternlibrary.debug()) console.log('layoutbuilder initialized');
    }
	
	/**
     * Initializes the plugin by setting/checking options and attributes, adding helper variables, and saving the anchor.
     * @function
     * @private
     */
    _init() {

    	this._checkDeepLink();
	    this._events();

	    this._initToolbar();
	    this._initDocumentbody();
	    
	    this.$element.trigger('initialized.pl.layoutbuilder');
	    
    }
    
    _initDocumentbody () {
    }
    
    _initToolbar () {
    	var $toolbar;
    	if ( this.$element.find('> [data-layouttoolbar]').length == 0 ) {
            if (patternlibrary.debug()) console.log('layoutbuilder generate toolbar');
    		this.$element.prepend(Layouttoolbar.prototype.toElement());
    		$toolbar = new Layouttoolbar (this.$element.find('> [data-layouttoolbar]').first());
    	} else {
    		$toolbar = this._toolbar;
    	}
        if (patternlibrary.debug()) console.log('layoutbuilder toolbar initialized: ', $toolbar);
    }
    
    /**
     * Adds event listeners to the element utilizing the triggers utility library.
     * @function
     * @private
     */
    _events() {
        this._addKeyHandler();
        this._addClickHandler();
        //this._addFocusHandler();

        $(window).on('changed.zf.mediaquery', this._setMqHandler.bind(this));
        
        $(window).on('resize.pl.layoutbuilder', () => { if (patternlibrary.debug()) console.log('layoutbuilder resize trigger test'); });

        if (this.options.deepLink) {
            $(window).on('popstate', this._checkDeepLink);
        }
    }

    /**
     * Adds click handlers for items within the tabs.
     * @private
     */
    _addClickHandler() {
    }

    /**
     * Adds click handlers for items within the tabs.
     * @private
     */
    _addFocusHandler() {
        var _this = this;

        this.$element
            .off('focused.pl.layoutelement,unfocused.pl.layoutelement')
            .on ('focused.pl.layoutelement,unfocused.pl.layoutelement', '[data-layoutrow],[data-layoutcolumn],[data-layoutpattern]' , function(e){

            	if (patternlibrary.debug()) console.log('layoutbuilder element focus handler:', this, e);
        	    _this.$element.trigger('focuschange.pl.layoutbuilder');
                
                _this.switchToolbarsections.apply(_this, [e.currentTarget]);
        	    
                e.preventDefault();
                e.stopPropagation();
        });
    }

    /**
     * Adds keyboard event handlers for items within the tabs.
     * @private
     */
    switchToolbarsections( focused_element ) {
    	var $focus = $(focused_element);

        if ($focus.data('patternlibraryPlugin') instanceof Layoutelement) {
            this._toolbar.switchSection($focus.data('patternlibraryPlugin').classname, $focus);
        }
    }

    /**
     * Adds keyboard event handlers for items within the tabs.
     * @private
     */
    _addKeyHandler() {
        var _this = this;

        this.$element.children().off('keydown.pl.layoutbuilder').on('keydown.pl.layoutbuilder', function(e){

    	    this.id = GetYoDigits(6, 'Layoutbuilder');
	    	/*
	    	 * ignore TAB key
	    	 *  
	    	 * const keyCodes = {
	    	 *   9 : 'TAB',
	    	 *   13: 'ENTER',
	    	 *   27: 'ESCAPE',
	    	 *   32: 'SPACE',
	    	 *   35: 'END',
	    	 *   36: 'HOME',
	    	 *   37: 'ARROW_LEFT',
	    	 *   38: 'ARROW_UP',
	    	 *   39: 'ARROW_RIGHT',
	    	 *   40: 'ARROW_DOWN'
	    	 * }
	     	 * 
	    	 */
	        if (e.which === 9) return;
	
	        var $element = $(this);
	
	        // handle keyboard event with keyboard util
	        PLFoundation.Keyboard.handleKey(e, 'Layoutbuilder', {
	            open: function(event) {
	            	if (patternlibrary.debug()) console.log('open event:', e)
	                _this.open($element);
	            },
	            close: function() {
	                _this.close($element);
	            },
	            handled: function() {
	                e.stopPropagation();
	                e.preventDefault();
	            }
	        });

	        
        });

        // register keyboard keys mapping
        PLFoundation.Keyboard.register('Layoutbuilder', {
            'ENTER'    : 'open',
            'ALT_SPACE': 'open',
            'ESCAPE'   : 'close'
        });
        
    }

    /**
     * Adds keyboard event handlers for items within the tabs.
     * @private
     */
    _setMqHandler(e) {
    	if (patternlibrary.debug()) console.log('layoutbuilder media query change');
        $(document).focus();
        document.activeElement.blur();
	    this.$element.trigger('resize.pl.layoutbuilder');
    }

    /**
     * Check for anchor/deep-link 
     * @private
     */
	_checkDeepLink() {
	    var anchor = window.location.hash;
	    
	    //need a hash and a relevant anchor
	    if(anchor.length) {
	    	// find the anchor/deeplink action
	        var $link = this.$element.find('[href$="'+anchor+'"]');
	        if ($link.length) {

	        	// ...and do your stuff
	        	
	            /**
	             * Fires when the zplugin has deeplinked at pageload
	             * @event Tabs#deeplink
	             */
	        	if (patternlibrary.debug()) console.log('layoutbuilder deep-link:', anchor);
	            this.$element.trigger('deeplink.pl.layoutbuilder', [$link, $(anchor)]);
	        }
	    }
	}
    
    /**
     * Destroys the layoutbuilder.
     * @function
     */
    _destroy() {
        this.$element.off('.pl.layoutbuilder').hide();
        this.$element.children().off('.pl.layoutbuilder');
        $(document.body).off('.pl.layoutbuilder');
        $(window).off('.pl.layoutbuilder');
    }


    /**
     * open...
     * @function
     * @access public
     */
    open() {
    	if (patternlibrary.debug()) console.log('layoutbuilder open');
	    this.$element.trigger('open.pl.layoutbuilder');
    }

    /**
     * close...
     * @function
     * @access public
     */
    close() {
    	if (patternlibrary.debug()) console.log('layoutbuilder close');
	    this.$element.trigger('close.pl.layoutbuilder');
    }

}

Layoutbuilder.defaults = {
	classColPrefix : "",
	classRow       : "row",
	classSizes     : "['small','medium','large','xlarge','xxlarge']",
	columnMax      : 12
}

var LayoutbuilderClickdummy = (e) => {
	var $this = $(e.currentTarget).data('patternlibraryPlugin');
    if (patternlibrary.debug()) console.log('layouttoolbaraction item clicked:', e, $this);
    e.stopPropagation();
    e.preventDefault();
}
//PLFoundation.plugin(Layoutbuilder, 'Layoutbuilder');
patternlibrary.plugin(Layoutbuilder, 'Layoutbuilder');

