/**
 * Layoutbody module.
 * @module patternlibrary.layoutbody
 * 
 * @requires patternlibrary.Layoutelement
 * @requires patternlibrary.Plugin
 * @requires foundation.Triggers
 */
class Layoutbody extends Plugin {

    /**
     * Setup a new instance of a layoutbody.
     * @class
     * @name Layoutbody
     * @param {jQuery} element - jQuery object to make into a layoutbody.
     *        Object should be of the layoutbody panel, rather than its anchor.
     * @param {Object} options - Overrides to the default plugin settings.
     */
	_setup(element, options) {
		if (patternlibrary.debug()) console.log('layoutbody init');
    	this.$element = element;
        this.options = $.extend({}, Layoutbody.defaults, this.$element.data(), options);
        this.className = 'layoutbody'; // ie9 back compat

        // Triggers init is idempotent, just need to make sure it is initialized
        PLFoundation.Triggers.init($);

        this._init();

        // (maybe, this line is not nessessary anymore...?!)
        //PLFoundation.registerPlugin(this, 'Layoutbody');
        
        if (patternlibrary.debug()) console.log('layoutbody initialized');
    }
	
	/**
     * Initializes the plugin by setting/checking options and attributes, adding helper variables, and saving the anchor.
     * @function
     * @private
     */
    _init() {
	    this._events();
    }

    /**
     * Adds event listeners to the element utilizing the triggers utility library.
     * @function
     * @private
     */
    _events() {
    	this._addKeyHandler();
    	this._addClickHandler();
    	this._addFullscreenHandler();
    }
    
    _addFullscreenHandler () {
        var _this = this;

    	this.$element
	        .off('fullscreen.pl.layoutbody')
	        .on('fullscreen.pl.layoutbody', function(e){
	
	    	    _this.$element.trigger('fullscreen-switched.pl.layoutbody');
	    	    
	            if (!_this.$element.hasClass('fullscreen')) {
	            	_this.$element.addClass('fullscreen');
	            	_this.$element.trigger('click.pl.layoutbody');
		        } else {
		        	_this.$element.removeClass('fullscreen');
		        }

	            document.activeElement.blur();
                
	            if (patternlibrary.debug()) console.log('layoutbody switch fullscreen:', document.activeElement, e);
	            
                e.stopPropagation();
                e.preventDefault();
                
	    });
    }
    
    _addClickHandler () {
        var _this = this;

    	this.$element
	        .off('click.pl.layoutbody')
	        .on('click.pl.layoutbody', function(e){
	        	
	        	if (patternlibrary.debug()) console.log('layoutbody focused:', this, e);
	    	    _this.$element.trigger('focused.pl.layoutbody');
	    	    
                e.stopPropagation();
                e.preventDefault();

	    });
    }
    
    /**
     * Adds keyboard event handlers for items within the tabs.
     * @private
     */
    _addKeyHandler() {
        var _this = this;

        $(window)
            //.off('keydown.pl.layoutbody')
            .on('keydown.pl.layoutbody', function(e){

    	    this.id = GetYoDigits(6, 'Layoutbody');
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
	        PLFoundation.Keyboard.handleKey(e, 'Layoutbody', {
	        	switch: function() {
	                _this.switchFullscreen();
	                
	                e.stopPropagation();
	                e.preventDefault();
	            },
	            handled: function() {
	                e.stopPropagation();
	                e.preventDefault();
	            }
	        });

	        
        });

        // register keyboard keys mapping
        PLFoundation.Keyboard.register('Layoutbody', {
            'ESCAPE'     : 'switch',
            'CTRL_ALT_F' : 'switch',
            'ALT_CTRL_F' : 'switch'
        });
        
    }

    /**
     * Toggles layout-body's fullscreen display
     * @function
     * @private
     */
    switchFullscreen() {
        /*if (!this.$element.hasClass('fullscreen')) {
        	this.$element.addClass('fullscreen');
        } else {
        	this.$element.removeClass('fullscreen');
        }*/

    	if (patternlibrary.debug()) console.log('layoutbody switch fullscreen');
	    this.$element.trigger('fullscreen.pl.layoutbody');
    }
    
    /**
     * Destroys the layoutbody.
     * @function
     */
    _destroy() {
        this.$element.find('*').off('.pl.layoutbody');
        this.$element.off('.pl.layoutbody');
        this.$element.remove();
    }
		
}

//PLFoundation.plugin(Layoutbody, 'Layoutbody');
patternlibrary.plugin(Layoutbody, 'Layoutbody');

