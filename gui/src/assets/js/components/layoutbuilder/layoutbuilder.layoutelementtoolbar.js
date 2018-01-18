/**
 * Layoutelementtoolbar module.
 * @module plfoundation.layoutelementtoolbar
 * 
 * @requires patternlibrary.Plugin
 * @requires foundation.Triggers
 */
class Layoutelementtoolbar extends Plugin {

    /**
     * Setup a new instance of a layoutelementtoolbar.
     * @class
     * @name Layoutelementtoolbar
     * @param {jQuery} element - jQuery object to make into a layoutelementtoolbar.
     *        Object should be of the layoutelementtoolbar panel, rather than its anchor.
     * @param {Object} options - Overrides to the default plugin settings.
     */
	_setup(element, options) {
		if (patternlibrary.debug()) console.log('layoutelementtoolbar init');
    	this.$element = element;
        this.options = $.extend({}, Layoutelementtoolbar.defaults, this.$element.data(), options);
        this.className = 'layoutelementtoolbar'; // ie9 back compat

        // Triggers init is idempotent, just need to make sure it is initialized
        PLFoundation.Triggers.init($);

        this._init();

        // (maybe, this line is not nessessary anymore...?!)
        //PLFoundation.registerPlugin(this, 'Layoutelementtoolbar');
        
        if (patternlibrary.debug()) console.log('layoutelementtoolbar initialized');
    }
	
	/**
     * Initializes the plugin by setting/checking options and attributes, adding helper variables, and saving the anchor.
     * @function
     * @private
     */
    _init() {
	    this._events();
	    this.hideSections();
	    if (this.$element) {
	    	this.$element.trigger('initialized.pl.layoutelementtoolbar');
	    }
    }

    /**
     * Adds event listeners to the element utilizing the triggers utility library.
     * @function
     * @private
     */
    _events() {
    	this._addInitHandler();
    }

    /**
     * Adds initialzation event listeners
     * @function
     * @private
     */
    _addInitHandler() {
    	var $this = this;
    	this.$element
    	    .off('initialized.pl.layoutelementtoolbar')
    	    .on('initialized.pl.layoutelementtoolbar', (e) => {
                e.stopPropagation();
                e.preventDefault();
    	    	$this._initSections.apply($this);
    	    });
    }

	/**
     * Initializes the toolbar sections given by config
     * @function
     * @private
     */
    _initSections() {
        if (patternlibrary.debug()) console.log('layoutelementtoolbar initialize section', this.options.sections);
    	var $this = this;
    	$(this.options.sections).each((idx, sectionconfig) => {
    		var $layoutelement = $this.$element.parent().data('patternlibraryPlugin');
    		if ( $layoutelement.classname == sectionconfig.name ) {
    			if (patternlibrary.debug()) console.log('layoutelementtoolbar init section', sectionconfig);
	    		if ( $this.$element.find('> [data-layouttoolbarsection]').length == 0 ) {
	    			$this._initSection(sectionconfig);
	    		}
    		}
    	})
    }

	/**
     * Initializes a single new toolbar sections
     * @function
     * @private
     */
    _initSection(sectionconfig) {
        if (patternlibrary.debug()) console.log('layoutelementtoolbar initialize section', sectionconfig);
        
        this.$element.prepend(Layouttoolbarsection.prototype.toElement(sectionconfig));
        var $section = new Layouttoolbarsection (
        	this.$element.find(`> [rel="${sectionconfig.name}"]`),
        	sectionconfig
        );
        $section.$element.children().first().plfoundation();//patternlibrary();
        $section.$element.trigger('initialized');
        
        if (patternlibrary.debug()) console.log('layoutelementtoolbar section initialized: ', $section);
    }

    /**
     * retrieve all toolbar sections
     * @function
     * @private
     */
    get _sections () {
    	return this.$element.find('[data-layouttoolbarsection]').map((idx, elem) => { 
    		return $(elem).data('patternlibraryPlugin')
        });
    }

    /**
     * retrieve a toolbar section by name
     * @function
     */
    section (name) {
    	var $section;
    	
        $(this._sections).each((idx, _section) => {
        	if (_section.$element && _section.$element.attr('rel') == name) {
        		$section = _section;
        	}
        });
        
        return ($section);
    }

    /**
     * retrieve builder's toolbar section
     * @function
     * @private
     */
    get _builderSection () {
    	var builderSection = null;
    	this._sections.each((idx, section) => {  
    		if (section.$element.attr('rel') == 'builder') {
    			builderSection = section;
    			return (false);
    		}
    	});
    	return builderSection;
    }

    /**
     * hide all toolbar sections
     * @function
     */
    hideSections () {
    	var sections = this._sections;
    	sections.each((idx, section) => { section.hide(); });
    	if (patternlibrary.debug()) console.log ('builder:', this._builderSection );
	    //this._builderSection.show();
    	sections.each((idx, section) => {
    		if (section.$element.attr('rel') == 'builder') {
    			section.show();
    		}
    	});
    }

    /**
     * switch toolbar sections according to focused element
     * @function
     */
    switchSection (name, reference) {
    	var sections = this._sections;
    	sections.each((idx, section) => {
    		var $section = $(section);

    		if (section.$element.attr('rel') != 'builder') {
	    		if (section.$element.attr('rel') == name) {
	    			section.show();
	    		} else {
	    			section.hide(); 
	    		}
    		}
    	});
    }

    /**
     * generate initial markup
     * @function
     * @private
     */
    get _markup() {
    	var html = [
    		'<div data-layoutelementtoolbar class="toolbar actions">',
    		'</div>'
    	];
    	
    	return $(html.join(''));
    }
    
    /**
     * Destroys the layoutelementtoolbar's sections.
     * @function
     * @private
     */
    _destroySections() {
    }
    
    /**
     * Destroys the layoutelementtoolbar.
     * @function
     * @private
     */
    _destroy() {
        this.$element.find('*').off('.pl.layoutelementtoolbar');
        this.$element.off('.pl.layoutelementtoolbar');
        this.$element.remove();
    }
	
}

Layoutelementtoolbar.defaults = {
	sections: [
		LayouttoolbarsectionLayoutrow,
		LayouttoolbarsectionLayoutcolumn,
		LayouttoolbarsectionPattern
	]
};

//PLFoundation.plugin(Layoutelementtoolbar, 'Layoutelementtoolbar');
patternlibrary.plugin(Layoutelementtoolbar, 'Layoutelementtoolbar');

if (typeof define == 'function') {
	// require/AMD module definition
	define([], (require, exports, module) => {
		return Layoutelementtoolbar;
	});
}