/**
 * Layoutelement module.
 * @module plfoundation.layoutelement
 * 
 * @requires plfoundation.Plugin
 * @requires plfoundation.Keyboard
 * @requires plfoundation.MediaQuery
 */
class Layoutelement extends Plugin {

    /**
     * Setup a new instance of a layoutelement.
     * @class
     * @name Layoutelement
     * @param {jQuery} element - jQuery object to make into a layoutelement.
     *        Object should be of the layoutelement panel, rather than its anchor.
     * @param {Object} options - Overrides to the default plugin settings.
     */
	_setup(element, options) {
		if (patternlibrary.debug()) console.log('layoutelement init');
    	this.$element = element;
        this.options = $.extend({}, Layoutelement.defaults, this.$element.data(), options);
        this.className = 'layoutelement'; // ie9 back compat

        // Triggers init is idempotent, just need to make sure it is initialized
        PLFoundation.Triggers.init($);

        this._init();

        // (maybe, this line is not nessessary anymore...?!)
        //PLFoundation.registerPlugin(this, 'Layoutelement');
        
        if (patternlibrary.debug()) console.log('layoutelement initialized');
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
        this._addClickHandler();
        this._addFocusHandler();
    }

    /**
     * Adds click handlers for items within the tabs.
     * @function
     * @private
     */
    _addClickHandler() {
        var _this = this;

        this.$element
            .off('click.pl.layoutelement')
            .on('click.pl.layoutelement', function(e){

            	if (patternlibrary.debug()) console.log('layoutelement click handler');
        	    _this.$element.trigger('clicked');
        	    
                e.preventDefault();
                e.stopPropagation();
                
               _this.focus();
        });
    }

    /**
     * Adds click handlers for items within the tabs.
     * @function
     * @private
     */
    _addFocusHandler() {
        var _this = this;

        this.$element
            .off('focused.pl.layoutelement')
            .on('focused.pl.layoutelement', function(e){

            	if (patternlibrary.debug()) console.log('layoutelement focus event handler:', _this._dragtrigger, _this._elementtoolbar);
        	    
            	if (!(_this._dragtrigger instanceof Layoutelementdragtrigger)) {
            		_this._initDragtrigger();
            	}
            	if (!(_this._elementtoolbar instanceof Layoutelementtoolbar)) {
            		_this._initElementtoolbar();
            	}

            	if (_this._toolbar instanceof Layouttoolbar) {
            	    _this._toolbar.switchSection(_this.classname);
            	}
            	//_this.$element.trigger('focused');
        	    
                e.preventDefault();
                e.stopPropagation();
                
               //_this.focus();
        });

        this.$element
            .off('unfocused.pl.layoutelement')
            .on('unfocused.pl.layoutelement', function(e){

            	if (patternlibrary.debug()) console.log('layoutelement un-focus event handler:', _this._dragtrigger, _this._elementtoolbar);

            	if (_this._dragtrigger instanceof Layoutelementdragtrigger) {
            		_this._dragtrigger.destroy();
            	}
            	if (_this._elementtoolbar instanceof Layoutelementtoolbar) {
            		_this._elementtoolbar.destroy();
            	}

            	if (_this._toolbar instanceof Layouttoolbar) {
                	_this._toolbar.hideSections();
            	}
            	//_this.$element.trigger('unfocused');
        	    
                //e.preventDefault();
                //e.stopPropagation();
                
               //_this.focus();
        });
    }

    /**
     * Set focus class on current $element, removes from others
     * @function
     * @private
     */
    _focusLayoutelement() {
    	$('[data-layoutelementtoolbar],[data-layoutelementdragtrigger]').remove();
    	if (!this.$element.hasClass(this.options.focusClassname)) {
        	$('.'+this.options.focusClassname).removeClass(this.options.focusClassname);
        	this.$element.addClass(this.options.focusClassname);
        	if (patternlibrary.debug()) console.log('layoutelement focused:', this.uuid);
    	    this.$element.trigger('focused');
    	} else {
        	this.$element.removeClass(this.options.focusClassname);
        	if (patternlibrary.debug()) console.log('layoutelement un-focused:', this.uuid);
    	    this.$element.children().trigger('unfocused');
    	    this.$element.trigger('unfocused');
    	}
    	if (patternlibrary.debug()) console.log('layoutelement focus changed');
	    this.$element.trigger('focuschange');
    	return (this);
    }
  
    /**
     * Set focus on current $element
     * @function
     * @public
     */
    focus() {
    	return this._focusLayoutelement();
    }
  
    /**
     * Un-focus any layout element
     * @function
     * @public
     */
    unfocus() {
    	$('[data-layoutbody] .focused').each((idx, elem) => {
    		if ($(elem).data()) {
    			$(elem).data('patternlibraryPlugin').focus();
    		}
    	});
    }
  
    /**
     * Retrieve element's toolbar instance
     * @private
     */
    get _elementtoolbar() {
        if (patternlibrary.debug()) console.log('layoutelementtoolbar section element:', this.$element.find('> [data-layoutelementtoolbar]'));
    	return this.$element.find('> [data-layoutelementtoolbar]').data('patternlibraryPlugin');
    }
  
	/**
     * Initializes a single new toolbar sections
     * @function
     * @private
     */
    _initElementtoolbar(sectionconfig) {
        if (patternlibrary.debug()) console.log('layoutelementtoolbar initialize section element:', sectionconfig);
        
        this.$element.prepend(Layoutelementtoolbar.prototype.toElement());
        var $toolbarsection = this.$element.find('> [data-layoutelementtoolbar]');
        var $section = new Layoutelementtoolbar (
        	$toolbarsection,
        	sectionconfig
        );
        $toolbarsection.data('patternlibraryPlugin', $section);
        //$section.$element.children().first().patternlibrary();//plfoundation();//
        //$section.$element.trigger('initialized');
        
        if (patternlibrary.debug()) console.log('layoutelementtoolbar initialized: ', $section);
    }

    /**
     * Retrieve element's drag-trigger instance
     * @private
     */
    get _dragtrigger() {
    	if (patternlibrary.debug()) console.log('layoutelementdragtrigger section element:', this.$element.find('> [data-layoutelementdragtrigger]'));
    	return this.$element.find('> [data-layoutelementdragtrigger]').data('patternlibraryPlugin');
    }
    
	/**
     * Initializes a single new drag-trigger sections
     * @function
     * @private
     */
    _initDragtrigger(sectionconfig) {
        if (patternlibrary.debug()) console.log('layoutelementdragtrigger initialize section element:', sectionconfig);
        
        this.$element.prepend(Layoutelementdragtrigger.prototype.toElement());
        var $toolbarsection = this.$element.find('> [data-layoutelementdragtrigger]');
        var $section = new Layoutelementdragtrigger (
         	$toolbarsection,
        	sectionconfig
        );
        $toolbarsection.data('patternlibraryPlugin', $section);
        //$section.$element.children().first().patternlibrary();//plfoundation();//
        //$section.$element.trigger('initialized');
        
        if (patternlibrary.debug()) console.log('layoutelementdragtrigger initialized: ', $section);
    }

    /**
     * Destroys the layoutelement.
     * @function
     * @private
     */
    _destroy() {
        this.$element.find('*').off('.pl.layoutelement');
        this.$element.off('.pl.layoutelement');
        this.$element.remove();
    }

}

Layoutelement.defaults = {
	activeClassname : 'activated',
	focusClassname  : 'focused'
}

//PLFoundation.plugin(Layoutelement, 'Layoutelement');
patternlibrary.plugin(Layoutelement, 'Layoutelement');

