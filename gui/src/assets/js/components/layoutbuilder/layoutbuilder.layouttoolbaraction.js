/**
 * Layouttoolbaraction module.
 * @module patternlibrary.layouttoolbaraction
 * 
 * @requires patternlibrary.Plugin
 * @requires foundation.Triggers
 */
class Layouttoolbaraction extends Plugin {

    /**
     * Setup a new instance of a layouttoolbaraction.
     * @class
     * @name Layouttoolbaraction
     * @param {jQuery} element - jQuery object to make into a layouttoolbaraction.
     *        Object should be of the layouttoolbaraction panel, rather than its anchor.
     * @param {Object} options - Overrides to the default plugin settings.
     */
	_setup(element, options) {
		if (patternlibrary.debug()) console.log('layouttoolbaraction init:', options);
    	this.$element = element;
        this.options = $.extend({}, Layouttoolbaraction.defaults, this.$element.data(), options);
        this.className = 'layouttoolbaraction'; // ie9 back compat

        // Triggers init is idempotent, just need to make sure it is initialized
        PLFoundation.Triggers.init($);

        this._init();

        // (maybe, this line is not nessessary anymore...?!)
        //PLFoundation.registerPlugin(this, 'Layouttoolbaraction');
        
        if (patternlibrary.debug()) console.log('layouttoolbaraction initialized');
    }
	
	/**
     * Initializes the plugin by setting/checking options and attributes, adding helper variables, and saving the anchor.
     * @function
     * @private
     */
    _init() {
    	if (typeof this.options.type == 'undefined') {
        	throw (new LayoutbuilderException('no type given for toolbar action')).toString();
    	}
    	if ( (this.options.type == 'action') && (typeof this.options.action == 'undefined') ) {
        	throw (new LayoutbuilderException('no action-id given for toolbar action')).toString();
    	}
    	
	    this._events();
    }

    /**
     * Adds event listeners to the element utilizing the triggers utility library.
     * @function
     * @private
     */
    _events() {
    	this._addInitHandler();
    	if ( this.options.events && (typeof this.options.events.click == 'function') ) {
        	this._addClickHandler(this.options.events.click);
    	}
    }
    
    /**
     * Adds initialzation event listeners
     * @function
     * @private
     */
    _addInitHandler() {
    	var $this = this;
    	this.$element
    	    .off('initialized.pl.layouttoolbaraction')
    	    .on('initialized.pl.layouttoolbaraction', (e) => {
                e.stopPropagation();
                e.preventDefault();
    	    	//$this._initItems.apply($this);
    	    });
    }

    _addClickHandler (clickHandler) {
    	if ( clickHandler && (typeof clickHandler == 'function') ) {
    	    this.$element.off('click.pl.layouttoolbaraction').on('click.pl.layouttoolbaraction', clickHandler);
    	}
    }

    /**
     * generate initial markup
     * @function
     * @private
     */
    get _markup() {
    	var html = [
		    `<a class="button small" href="${this.options.action}" title="${this.options.label}" data-layouttoolbaraction>`,
		        `<i class="${this.options.icon}"></i>`,
		        `<span class="hide-for-small show-for-xxlarge"> ${this.options.label}</span>`,
		    '</a>'
    	];
    	
    	return $(html.join(''));
    }
    
    /**
     * return initial markup elements
     * @function
     */
    toElement(sectionconfig) {
    	var currentOptions = (this.options);
        this.options = $.extend({}, this.options, sectionconfig);
    	var $element = $(this.toString());
    	this.options = currentOptions;
    	return $element;
    }
    
    /**
     * Destroys the layouttoolbaraction.
     * @function
     */
    _destroy() {
        this.$element.find('*').off('.pl.layouttoolbaraction');
        this.$element.off('.pl.layouttoolbaraction');
        this.$element.remove();
    }
	
}

patternlibrary.plugin(Layouttoolbaraction, 'Layouttoolbaraction');

