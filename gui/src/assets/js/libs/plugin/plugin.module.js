
/**
 * Plugin module.
 * @module plfoundation.plugin
 */
class Plugin {

    /**
     * Create a new instance of a plugin.
     * @class
     * @name Plugin
     * @param {jQuery} element - jQuery object to apply the plugin to.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    constructor(element, options) {
	    this._setup(element, options);
	    var pluginName = getPluginName(this);
	    this.uuid = GetYoDigits(6, pluginName);

	    if(!this.$element.attr(`data-${pluginName}`)){ this.$element.attr(`data-${pluginName}`, this.uuid); }
	    if(!this.$element.data('zfPlugin')){ this.$element.data('zfPlugin', this); }
	    /**
	     * Fires when the plugin has initialized.
	     * @event Plugin#init
	     */
	    this.$element.trigger(`init.pl.${pluginName}`);
	}
    
    /**
     * Destroys the plugin.
     * @function
     */
    destroy() {
        this._destroy();
        var pluginName = getPluginName(this);
        this.$element.removeAttr(`data-${pluginName}`).removeData('zfPlugin')
            /**
             * Fires when the plugin has been destroyed.
             * @event Plugin#destroyed
             */
            .trigger(`destroyed.pl.${pluginName}`);
        for(var prop in this){
          this[prop] = null;//clean up script to prep for garbage collection.
        }
    }
    
    /**
     * Retrieve main layout-builder instance.
     * @function
     */
    get _builder () {
    	return $('[data-layoutbuilder]').first().data('patternlibraryPlugin');
    }

    /**
     * Retrieve main layout-builder toolbar instance.
     * @function
     */
    get _toolbar () {
    	return $('[data-layouttoolbar]').first().data('patternlibraryPlugin');
    }

    /**
     * Retrieve main layout-builder layout-body instance.
     * @function
     */
    get _body () {
    	return $('[data-layoutbody]').first().data('patternlibraryPlugin');
    }

    /**
     * Alias to retrieve main layout-builder layout-body instance.
     * @function
     * @see Plugin._body
     */
    get _layoutbody () {
    	return this._body;
    }

    /**
     * Hide the main plugin element.
     * @function
     */
    hide() {
    	this.$element.hide();
    }
    
    /**
     * Show the main plugin element.
     * @function
     */
    show() {
    	this.$element.show();
    }

    /**
     * generate initial markup
     * @function
     * @private
     */
    get _markup() {
    	var html = [
    		'<div>',
    		'</div>'
    	];
    	
    	return $(html.join(''));
    }
    
    /**
     * return initial markup
     * @function
     */
    toString() {
    	return (this._markup);
    }
    
    /**
     * return initial markup elements
     * @function
     */
    toElement() {
    	return $(this.toString());
    }
    
}
