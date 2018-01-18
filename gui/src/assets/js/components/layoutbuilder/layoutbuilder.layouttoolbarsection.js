/**
 * Layouttoolbarsection module.
 * @module plfoundation.layouttoolbarsection
 * 
 * @requires patternlibrary.Plugin
 * @requires foundation.Triggers
 */
class Layouttoolbarsection extends Plugin {

    /**
     * Setup a new instance of a layouttoolbarsection.
     * @class
     * @name Layouttoolbarsection
     * @param {jQuery} element - jQuery object to make into a layouttoolbarsection.
     *        Object should be of the layouttoolbarsection panel, rather than its anchor.
     * @param {Object} options - Overrides to the default plugin settings.
     */
	_setup(element, options) {
    	this.$element = element;
        this.options = $.extend({}, Layouttoolbarsection.defaults, this.$element.data(), options);
        this.className = 'layouttoolbarsection'; // ie9 back compat

        // Triggers init is idempotent, just need to make sure it is initialized
        PLFoundation.Triggers.init($);

        this._init();

        // (maybe, this line is not nessessary anymore...?!)
        //PLFoundation.registerPlugin(this, 'Layouttoolbarsection');
        
        if (patternlibrary.debug()) console.log('layouttoolbarsection initialized');
    }
	
	
    /**
     * Retrieve action items' container element
     * @function
     * @private
     */
	get _container() {
		return (this.$element.find(`> ${this.options.sectioncontainer.tag}`));
	}
	
	/**
     * Initializes the plugin by setting/checking options and attributes, adding helper variables, and saving the anchor.
     * @function
     * @private
     */
    _init() {
	    this._events();
    }
    
    _initItems() {
    	var $this = this;
        $.makeArray($(this.options.items).map((idx, item) => {
        	var $item;
        	switch (item.type){
	        	case 'separator' : {
	        		$item = $([
	        			`<${$this.options.itemcontainer.tag} class="menu-separator ${$this.options.itemcontainer.classnames.join(' ')}">`,
	        			     `<span>&nbsp;</span>`,
	        			`</${$this.options.itemcontainer.tag}>`
	        	    ].join(''));
	        		break;
	        	}
	        	case 'action' :
	        	default : {
	        		$item = $([
	        			`<${$this.options.itemcontainer.tag} class="${$this.options.itemcontainer.classnames.join(' ')}" ${$this.options.itemcontainer.attributes.join(' ')}>`,
	        			`</${$this.options.itemcontainer.tag}>`
	        		]
	        		.join(''))
	        		.append(
	        			Layouttoolbaraction.prototype.toElement(item)
	        		);
	        	}
        	}
        	if ($item && $item.find('> a:first-child')) {
        		$item.find('> a:first-child').data( 'patternlibraryPlugin', new Layouttoolbaraction ($item.find('> a:first-child'), item) );
        		this._container.append( $item );
        		
                if (patternlibrary.debug()) console.log('layouttoolbarsection item initialized: ', $item.children().first());
        		//$item.children().first().trigger('initialized');
        	}
        }));
    	
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
    	    .off('initialized.pl.layouttoolbarsection')
    	    .on('initialized.pl.layouttoolbarsection', (e) => {
    	    	if (patternlibrary.debug()) console.log('layouttoolbarsection init handler');
                e.stopPropagation();
                e.preventDefault();
            	$this._addFocusHandler();
    	    	$this._initItems.apply($this);
    	    });
    }

    _addClickHandler () {
    	var _this = this;
    	
    	var $fullscreenToggler = this.$element.find('[href="#switch_fullscreen"]');
	    $fullscreenToggler.off('click.pl.layouttoolbarsection').on('click.pl.layouttoolbarsection', (e) => {
	    	var $layoutbody = $('[data-layoutbody]');
	    	$layoutbody.data('patternlibraryPlugin').switchFullscreen();
            e.stopPropagation();
            e.preventDefault();
	        if (patternlibrary.debug()) console.log('layouttoolbarsection fullscreen switch click');
		});
	    
    }

    /**
     * Adds focus handlers for layouttoolbarsection.
     * @private
     */
    _addFocusHandler() {
        var _this = this;

    	var $builder = this._builder;
    	if (patternlibrary.debug()) console.log('layouttoolbarsection element focus handler builder:', $builder);
        if ($('[data-layoutbuilder]')) {
    	    $('[data-layoutbuilder]')
	            .off('focused.pl.layoutelement')
	            .on('focused.pl.layoutelement', '[data-layoutrow],[data-layoutcolumn]' , function(e){
	
	            	if (patternlibrary.debug()) console.log('layouttoolbarsection element focus handler:', this, e);
	        	    _this.$element.trigger('focuschange.pl.layouttoolbarsection');

	            	if (_this._builder instanceof Layoutbuilder) {
	                    _this._builder.switchToolbarsections.apply(_this, [e.currentTarget]);
	            	}
	            	
	                e.preventDefault();
	                e.stopPropagation();
	            });
    	    $('[data-layoutbuilder')
		        .off('unfocused.pl.layoutelement')
		        .on('unfocused.pl.layoutelement', '[data-layoutrow],[data-layoutcolumn]' , function(e){
		
		        	if (patternlibrary.debug()) console.log('layouttoolbarsection element focus handler:', this, e);
		    	    _this.$element.trigger('focuschange.pl.layouttoolbarsection');

	            	if (_this._toolbar instanceof Layouttoolbar) {
		                _this._toolbar.hideSections();
	            	}
	            	
		            e.preventDefault();
		            e.stopPropagation();
		        });
        }
    }
    
    
    /**
     * generate initial markup
     * @function
     * @private
     */
    get _markup() {
    	var html = [
    		`<div data-layouttoolbarsection rel="${this.options.name}">`,
		        `<${this.options.sectioncontainer.tag} class="${this.options.sectioncontainer.classnames.join(' ')}" ${this.options.sectioncontainer.attributes.join(' ')}>`,
    		        `<li class="${this.options.sectioncontainer.label.classnames.join(' ')}" role="menuitem">${ucfirst(this.options.name)}:</li>`,
    		        // items follow here...
    		    `</${this.options.sectioncontainer.tag}>`,
    		'</div>'
    	];
    	
    	return $(html.join(''));
    }
    
    /**
     * return initial markup elements
     * @function
     */
    toElement(sectionconfig) {
    	var currentOptions = (this.options);
        this.options = $.extend({}, Layouttoolbarsection.defaults, this.options, sectionconfig);
    	var $element = $(this.toString());
    	this.options = currentOptions;
    	return $element;
    }
    
    /**
     * Destroys the layouttoolbarsection.
     * @function
     */
    _destroy() {
        this.$element.find('*').off('.pl.layouttoolbarsection');
        this.$element.off('.pl.layouttoolbarsection');
        this.$element.remove();
    }
	
}

Layouttoolbarsection.defaults = {
	
	sectioncontainer : {
		tag       : 'ul',
		classnames: ['dropdown','menu'],
		attributes: ['data-dropdown-menu'],
        label     : {
    		classnames: ['menu-text']
        }
	},
	itemcontainer : {
		tag       : 'li',
		classnames: [],
		attributes: ['role="menuitem"']
	}
};

patternlibrary.plugin(Layouttoolbarsection, 'Layouttoolbarsection');

