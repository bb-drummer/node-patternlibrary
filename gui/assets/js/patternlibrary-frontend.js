'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/** @var  object  patternlibrary  global patternlibrary namespace */
if (!patternlibrary) {
    var patternlibrary = {};
}

/**
 * theme base setup (Zurb PLFoundation)
 * 
 * patternlibrary client (init-)script
 *     
 * @package     [patternlibrary]
 * @subpackage  theme base setup (Zurb PLFoundation)
 * @subpackage  patternlibrary client script
 * @author      Björn Bartels <coding@bjoernbartels.earth>
 * @link        https://gitlab.bjoernbartels.earth/js/patternlibrary
 * @license     http://www.apache.org/licenses/LICENSE-2.0 Apache License, Version 2.0
 * @copyright   copyright (c) 2016 Björn Bartels <coding@bjoernbartels.earth>
 */
!function ($) {
    "use strict";

    var patternlibrary_VERSION = '0.0.1';

    // Global [patternlibrary] object
    // This is attached to the window, or used as a module for AMD/Browserify
    var patternlibrary = {
        version: patternlibrary_VERSION,

        /**
         * Stores initialized plugins.
         */
        _plugins: {},

        /**
         * Stores generated unique ids for plugin instances
         */
        _uuids: [],

        /**
         * Returns a boolean for RTL support
         */
        debug: function debug() {
            return this.Config.debug || $('.pldebug').length > 0;
        },

        /**
         * Returns a boolean for RTL support
         */
        rtl: function rtl() {
            return $('html').attr('dir') === 'rtl';
        },

        /**
         * Defines a [patternlibrary] plugin, adding it to the `patternlibrary` namespace 
         * and the list of plugins to initialize when reflowing.
         * 
         * @param {Object} plugin - The constructor of the plugin.
         */
        plugin: function plugin(_plugin, name) {
            // Object key to use when adding to global patternlibrary object
            // Examples: patternlibrary.Object1, patternlibrary.Object2
            var className = name || functionName(_plugin);
            // Object key to use when storing the plugin, also used to create the
            // identifying data attribute for the plugin
            // Examples: data-objecttriggername1, data-objecttriggername2
            var attrName = hyphenate(className);

            // Add to the patternlibrary object and the plugins list (for reflowing)
            this._plugins[attrName] = this[className] = _plugin;
        },

        /**
         * @function
         * Populates the _uuids array with pointers to each individual plugin instance.
         * Adds the `patternlibraryPlugin` data-attribute to programmatically created plugins 
         * to allow use of $(selector).patternlibrary(method) calls.
         * Also fires the initialization event for each plugin, consolidating repeditive code.
         * 
         * @param {Object} plugin - an instance of a plugin, usually `this` in context.
         * @param {String} name - the name of the plugin, passed as a camelCased string.
         * @fires Plugin#init
         */
        registerPlugin: function registerPlugin(plugin, name) {
            var pluginName = name ? hyphenate(name) : functionName(plugin.constructor).toLowerCase();
            plugin.uuid = this.GetYoDigits(6, pluginName);

            if (!plugin.$element.attr('data-' + pluginName)) {
                plugin.$element.attr('data-' + pluginName, plugin.uuid);
            }
            if (!plugin.$element.data('patternlibraryPlugin')) {
                plugin.$element.data('patternlibraryPlugin', plugin);
            }
            /**
             * Fires when the plugin has initialized.
             * @event Plugin#init
             */
            plugin.$element.trigger('init.patternlibrary.' + pluginName);

            this._uuids.push(plugin.uuid);

            return;
        },

        /**
         * @function
         * Removes the plugins uuid from the _uuids array.
         * Removes the zfPlugin data attribute, as well as the data-plugin-name attribute.
         * Also fires the destroyed event for the plugin, consolidating repeditive code.
         * 
         * @param {Object} plugin - an instance of a plugin, usually `this` in context.
         * @fires Plugin#destroyed
         */
        unregisterPlugin: function unregisterPlugin(plugin) {
            var pluginName = hyphenate(functionName(plugin.$element.data('patternlibraryPlugin').constructor));

            this._uuids.splice(this._uuids.indexOf(plugin.uuid), 1);
            plugin.$element.removeAttr('data-' + pluginName).removeData('patternlibraryPlugin')
            /**
             * Fires when the plugin has been destroyed.
             * @event Plugin#destroyed
             */
            .trigger('destroyed.patternlibrary.' + pluginName);
            for (var prop in plugin) {
                plugin[prop] = null; //clean up script to prep for garbage collection.
            }
            return;
        },

        /**
         * @function
         * Causes one or more active plugins to re-initialize, resetting event listeners, 
         * recalculating positions, etc.
         * 
         * @param {String} plugins - optional string of an individual plugin key, 
         *                           attained by calling `$(element).data('pluginName')`, 
         *                           or string of a plugin class i.e. `'dropdown'`
         * @default If no argument is passed, reflow all currently active plugins.
         */
        reInit: function reInit(plugins) {
            var isJQ = plugins instanceof $;
            try {
                if (isJQ) {
                    plugins.each(function () {
                        $(this).data('patternlibraryPlugin')._init();
                    });
                } else {
                    var type = typeof plugins === 'undefined' ? 'undefined' : _typeof(plugins),
                        _this = this,
                        fns = {
                        'object': function object(plgs) {
                            plgs.forEach(function (p) {
                                $('[data-' + p + ']').patternlibrary('_init');
                            });
                        },
                        'string': function string() {
                            $('[data-' + plugins + ']').patternlibrary('_init');
                        },
                        'undefined': function undefined() {
                            this['object'](Object.keys(_this._plugins));
                        }
                    };
                    fns[type](plugins);
                }
            } catch (err) {
                console.error(err);
            } finally {
                return plugins;
            }
        },

        /**
         * returns a random base-36 uid with namespacing
         * @function
         * @param {Number} length - number of random base-36 digits desired. Increase 
         *                          for more random strings.
         * @param {String} namespace - name of plugin to be incorporated in uid, optional.
         * @default {String} '' - if no plugin name is provided, nothing is appended 
         *                        to the uid.
         * @returns {String} - unique id
         */
        GetYoDigits: function GetYoDigits(length, namespace) {
            length = length || 6;
            return Math.round(Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)).toString(36).slice(1) + (namespace ? '-' + namespace : '');
        },

        /**
         * Initialize plugins on any elements within `elem` (and `elem` itself) that 
         * aren't already initialized.
         * @param {Object} elem - jQuery object containing the element to check inside. 
         *                        Also checks the element itself, unless it's the `document` 
         *                        object.
         * @param {String|Array} plugins - A list of plugins to initialize. Leave this 
         *                                 out to initialize everything.
         */
        reflow: function reflow(elem, plugins) {

            // If plugins is undefined, just grab everything
            if (typeof plugins === 'undefined') {
                plugins = Object.keys(this._plugins);
            }
            // If plugins is a string, convert it to an array with one item
            else if (typeof plugins === 'string') {
                    plugins = [plugins];
                }

            var _this = this;

            // Iterate through each plugin
            $.each(plugins, function (i, name) {
                // Get the current plugin
                var plugin = _this._plugins[name];

                // Localize the search to all elements inside elem, as well as elem 
                // itself, unless elem === document
                var $elem = $(elem).find('[data-' + name + ']').addBack('[data-' + name + ']');

                // For each plugin found, initialize it
                $elem.each(function () {
                    var $el = $(this),
                        opts = {};
                    // Don't double-dip on plugins
                    if ($el.data('patternlibraryPlugin')) {
                        console.warn("Tried to initialize " + name + " on an element that " + "already has a [patternlibrary] plugin: ", $el);
                        return;
                    }

                    if ($el.attr('data-options')) {
                        var thing = $el.attr('data-options').split(';').forEach(function (e, i) {
                            var opt = e.split(':').map(function (el) {
                                return el.trim();
                            });
                            if (opt[0]) opts[opt[0]] = parseValue(opt[1]);
                        });
                    }
                    try {
                        $el.data('patternlibraryPlugin', new plugin($(this), opts));
                    } catch (er) {
                        console.error(er);
                    } finally {
                        return;
                    }
                });
            });
        },
        getFnName: functionName,
        transitionend: function transitionend($elem) {
            var transitions = {
                'transition': 'transitionend',
                'WebkitTransition': 'webkitTransitionEnd',
                'MozTransition': 'transitionend',
                'OTransition': 'otransitionend'
            };
            var elem = document.createElement('div'),
                end;

            for (var t in transitions) {
                if (typeof elem.style[t] !== 'undefined') {
                    end = transitions[t];
                }
            }
            if (end) {
                return end;
            } else {
                end = setTimeout(function () {
                    $elem.triggerHandler('transitionend', [$elem]);
                }, 1);
                return 'transitionend';
            }
        }
    };

    /**
     * library container/namespace
     */
    patternlibrary.libs = {};

    /**
     * utility container/namespace
     */
    patternlibrary.util = {
        /**
         * Function for applying a debounce effect to a function call.
         * @function
         * @param {Function} func - Function to be called at end of timeout.
         * @param {Number} delay - Time in ms to delay the call of `func`.
         * @returns function
         */
        throttle: function throttle(func, delay) {
            var timer = null;

            return function () {
                var context = this,
                    args = arguments;

                if (timer === null) {
                    timer = setTimeout(function () {
                        func.apply(context, args);
                        timer = null;
                    }, delay);
                }
            };
        }
    };

    // TODO: consider not making this a jQuery function
    // TODO: need way to reflow vs. re-initialize
    /**
     * The patternlibrary jQuery method.
     * @param {String|Array} method - An action to perform on the current jQuery object.
     */
    var siteapp = function siteapp(method) {
        var type = typeof method === 'undefined' ? 'undefined' : _typeof(method),
            $meta = $('meta.patternlibrary-mq'),
            $noJS = $('.no-js');

        if (!$meta.length) {
            $('<meta class="patternlibrary-mq">').appendTo(document.head);
        }
        if ($noJS.length) {
            $noJS.removeClass('no-js');
        }
        $('body').addClass(typeof PLFoundation == 'undefined' ? 'bootstrap' : 'plfoundation');

        if (type === 'undefined') {
            //needs to initialize the patternlibrary object, or an individual plugin.
            patternlibrary.MediaQuery._init();
            patternlibrary.reflow(this);
        } else if (type === 'string') {
            //an individual method to invoke on a plugin or group of plugins
            var args = Array.prototype.slice.call(arguments, 1);
            //collect all the arguments, if necessary
            var plugClass = this.data('patternlibrary-plugin');

            //determine the class of plugin
            if (plugClass !== undefined && plugClass[method] !== undefined) {
                //make sure both the class and method exist
                if (this.length === 1) {
                    //if there's only one, call it directly.
                    plugClass[method].apply(plugClass, args);
                } else {
                    this.each(function (i, el) {
                        //otherwise loop through the jQuery collection and invoke the 
                        // method on each
                        plugClass[method].apply($(el).data('patternlibrary-plugin'), args);
                    });
                }
            } else {
                //error for no class or no method
                throw new ReferenceError("We're sorry, '" + method + "' is not an available method for " + (plugClass ? functionName(plugClass) : 'this element') + '.');
            }
        } else {
            //error for invalid argument type
            throw new TypeError("We're sorry, '" + type + "' is not a valid parameter. " + "You must use a string representing the method you wish to invoke.");
        }
        return this;
    };

    window.patternlibrary = patternlibrary;
    $.fn.patternlibrary = siteapp;
}(jQuery);

// Polyfill for requestAnimationFrame
(function () {
    if (!Date.now || !window.Date.now) window.Date.now = Date.now = function () {
        return new Date().getTime();
    };

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        window.requestAnimationFrame = function (callback) {
            var now = Date.now();
            var nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function () {
                callback(lastTime = nextTime);
            }, nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }
    /**
     * Polyfill for performance.now, required by rAF
     */
    if (!window.performance || !window.performance.now) {
        window.performance = {
            start: Date.now(),
            now: function now() {
                return Date.now() - this.start;
            }
        };
    }
})();

if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5
            // internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be ' + 'bound is not callable');
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function fNOP() {},
            fBound = function fBound() {
            return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
        };

        if (this.prototype) {
            // native functions don't have a prototype
            fNOP.prototype = this.prototype;
        }
        fBound.prototype = new fNOP();

        return fBound;
    };
}

// Polyfill to get the name of a function in IE9
function functionName(fn) {
    if (Function.prototype.name === undefined) {
        var funcNameRegex = /function\s([^(]{1,})\(/;
        var results = funcNameRegex.exec(fn.toString());
        return results && results.length > 1 ? results[1].trim() : "";
    } else if (fn.prototype === undefined) {
        return fn.constructor.name;
    } else {
        return fn.prototype.constructor.name;
    }
}

function parseValue(str) {
    if (/true/.test(str)) return true;else if (/false/.test(str)) return false;else if (!isNaN(str * 1)) return parseFloat(str);
    return str;
}

// Convert PascalCase to kebab-case
// Thank you: http://stackoverflow.com/a/8955580
function hyphenate(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function getPluginName(obj) {
    if (typeof obj.constructor.name !== 'undefined') {
        return hyphenate(obj.constructor.name);
    } else {
        return hyphenate(obj.className);
    }
}

/**
 * returns a random base-36 uid with namespacing
 * @function
 * @param {Number} length - number of random base-36 digits desired. Increase for more random strings.
 * @param {String} namespace - name of plugin to be incorporated in uid, optional.
 * @default {String} '' - if no plugin name is provided, nothing is appended to the uid.
 * @returns {String} - unique id
 */
function GetYoDigits(length, namespace) {
    length = length || 6;
    return Math.round(Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)).toString(36).slice(1) + (namespace ? '-' + namespace : '');
}

function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
'use strict';

/** @var  object  patternlibrary.Config  patternlibrary global configuration container */
if (!patternlibrary.Config) {
    patternlibrary.Config = {

        // debug mode (console output) on/off
        debug: false,

        // detect UI framework
        renderer: typeof PLFoundation != 'undefined' ? 'plfoundation' : 'bootstrap',
        // detect language
        lang: $('HTML').attr('lang') || 'en',

        // XHR selectors
        xhrSelectors: {
            xhrButtons: "A.btn[href*='add'], A.btn[href*='edit'], A.btn[href*='details'], A.btn[href*='delete']",
            xhrCTAOpen: "A.btn-cta-xhr.cta-xhr-modal",
            xhrCTAClose: ".modal-content .btn-cta-xhr-close, .modal-content .alert, .modal-content .close, .modal-content .cta-xhr-modal-close, .reveal .cta-xhr-modal-close",
            xhrForms: ".modal-content .form-xhr"
        },

        // modal settings
        modals: {
            bootstrapElementClassname: 'modal',
            plfoundationElementClassname: 'reveal'
        },

        // dataTable plug-in settings
        dataTable: {
            langURLs: {
                'en': '//cdn.datatables.net/plug-ins/1.10.9/i18n/English.json',
                'de': '//cdn.datatables.net/plug-ins/1.10.9/i18n/German.json',
                'fr': '//cdn.datatables.net/plug-ins/1.10.9/i18n/French.json',
                'es': '//cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json',
                'it': '//cdn.datatables.net/plug-ins/1.10.9/i18n/Italian.json'
            },
            stateSave: true,
            stateDuration: 60 * 60 * 24 * 1 // sec * min * h * d
        }

    };
}
'use strict';

/**
 * This module sets up the search bar.
 */

!function () {

  var searchSource = {
    name: 'patternlibrary',

    // Only show 10 results at once
    limit: 10,

    // Function to fetch result list and then find a result;
    source: function source(query, sync, async) {
      query = query.toLowerCase();

      $.getJSON('/pl/search.json', function (data, status) {
        async(data.filter(function (elem, i, arr) {
          var name = elem.name.toLowerCase();
          var terms = [name, name.replace('-', '')].concat(elem.tags || []);
          for (var i in terms) {
            if (terms[i].indexOf(query) > -1) return true;
          }return false;
        }));
      });
    },

    // Name to use for the search result itself
    display: function display(item) {
      return item.name;
    },

    templates: {
      // HTML that renders if there are no results
      notFound: function notFound(query) {
        return '<div class="tt-empty">No results for "' + query.query + '".</div>';
      },
      // HTML that renders for each result in the list
      suggestion: function suggestion(item) {
        return '<div><span class="name">' + item.name + '<span class="meta">' + item.type + '</span></span> <span class="desc">' + item.description + '</span></div>';
      }
    }
  };

  $(document).ready(function () {

    // Search
    if (patternlibrary.debug()) console.log('search: ', $('[data-docs-search]'));

    $('[data-docs-search]').typeahead({ highlight: false }, searchSource);

    $('[data-docs-search]').bind('typeahead:select', function (e, sel) {
      var linkUrl = String(sel.link).replace('../patterns', '/pl/patterns').replace('/readme.html', '');

      window.location.href = linkUrl;
      //e.preventDefault(); e.stopPropagation(); return false;
    });

    // Auto-highlight unless it's a phone
    if (!navigator.userAgent.match(/(iP(hone|ad|od)|Android)/)) {
      $('[data-docs-search]').focus();
    }
  });
}();
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function ($, patternlibrary) {

  // Default set of media queries
  var defaultQueries = {
    'default': 'only screen',
    landscape: 'only screen and (orientation: landscape)',
    portrait: 'only screen and (orientation: portrait)',
    retina: 'only screen and (-webkit-min-device-pixel-ratio: 2),' + 'only screen and (min--moz-device-pixel-ratio: 2),' + 'only screen and (-o-min-device-pixel-ratio: 2/1),' + 'only screen and (min-device-pixel-ratio: 2),' + 'only screen and (min-resolution: 192dpi),' + 'only screen and (min-resolution: 2dppx)'
  };

  var MediaQuery = {
    queries: [],
    current: '',

    /**
     * Checks if the screen is at least as wide as a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to check.
     * @returns {Boolean} `true` if the breakpoint matches, `false` if it's smaller.
     */
    atLeast: function atLeast(size) {
      var query = this.get(size);

      if (query) {
        return window.matchMedia(query).matches;
      }

      return false;
    },

    /**
     * Gets the media query of a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to get.
     * @returns {String|null} - The media query of the breakpoint, or `null` if the breakpoint doesn't exist.
     */
    get: function get(size) {
      for (var i in this.queries) {
        var query = this.queries[i];
        if (size === query.name) return query.value;
      }

      return null;
    },

    /**
     * Initializes the media query helper, by extracting the breakpoint list from the CSS and activating the breakpoint watcher.
     * @function
     * @private
     */
    _init: function _init() {
      var self = this;
      var extractedStyles = $('.patternlibrary-mq').css('font-family');
      var namedQueries;

      namedQueries = parseStyleToObject(extractedStyles);

      for (var key in namedQueries) {
        self.queries.push({
          name: key,
          value: 'only screen and (min-width: ' + namedQueries[key] + ')'
        });
      }

      this.current = this._getCurrentSize();

      this._watcher();

      // Extend default queries
      // namedQueries = $.extend(defaultQueries, namedQueries);
    },

    /**
     * Gets the current breakpoint name by testing every breakpoint and returning the last one to match (the biggest one).
     * @function
     * @private
     * @returns {String} Name of the current breakpoint.
     */
    _getCurrentSize: function _getCurrentSize() {
      var matched;

      for (var i in this.queries) {
        var query = this.queries[i];

        if (window.matchMedia(query.value).matches) {
          matched = query;
        }
      }

      if ((typeof matched === 'undefined' ? 'undefined' : _typeof(matched)) === 'object') {
        return matched.name;
      } else {
        return matched;
      }
    },

    /**
     * Activates the breakpoint watcher, which fires an event on the window whenever the breakpoint changes.
     * @function
     * @private
     */
    _watcher: function _watcher() {
      var _this = this;

      $(window).on('resize.zf.mediaquery', function () {
        var newSize = _this._getCurrentSize();

        if (newSize !== _this.current) {
          // Broadcast the media query change on the window
          $(window).trigger('changed.zf.mediaquery', [newSize, _this.current]);

          // Change the current media query
          _this.current = newSize;
        }
      });
    }
  };

  patternlibrary.MediaQuery = MediaQuery;

  // matchMedia() polyfill - Test a CSS media type/query in JS.
  // Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license
  window.matchMedia || (window.matchMedia = function () {
    'use strict';

    // For browsers that support matchMedium api such as IE 9 and webkit

    var styleMedia = window.styleMedia || window.media;

    // For those that don't support matchMedium
    if (!styleMedia) {
      var style = document.createElement('style'),
          script = document.getElementsByTagName('script')[0],
          info = null;

      style.type = 'text/css';
      style.id = 'matchmediajs-test';

      script.parentNode.insertBefore(style, script);

      // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
      info = 'getComputedStyle' in window && window.getComputedStyle(style, null) || style.currentStyle;

      styleMedia = {
        matchMedium: function matchMedium(media) {
          var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

          // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
          if (style.styleSheet) {
            style.styleSheet.cssText = text;
          } else {
            style.textContent = text;
          }

          // Test if media query is true or false
          return info.width === '1px';
        }
      };
    }

    return function (media) {
      return {
        matches: styleMedia.matchMedium(media || 'all'),
        media: media || 'all'
      };
    };
  }());

  // Thank you: https://github.com/sindresorhus/query-string
  function parseStyleToObject(str) {
    var styleObject = {};

    if (typeof str !== 'string') {
      return styleObject;
    }

    str = str.trim().slice(1, -1); // browsers re-quote string style values

    if (!str) {
      return styleObject;
    }

    styleObject = str.split('&').reduce(function (ret, param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = parts[0];
      var val = parts[1];
      key = decodeURIComponent(key);

      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if (!ret.hasOwnProperty(key)) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }
      return ret;
    }, {});

    return styleObject;
  }
}(jQuery, patternlibrary);
'use strict';

/**
 * 
 */
;(function ($, window, document, patternlibrary, undefined) {
    'use strict';

    patternlibrary.libs.modal = {
        name: 'modal',

        version: '0.0.1',

        settings: {
            callback: function callback() {}
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
        open: function open(data, updateWindowHref) {
            if (typeof $.fn.modal == 'undefined' && typeof PLFoundation.Reveal == 'undefined') {
                console.warn('Bootstrap Modal and/or PLFoundation Reveal plug-ins not found...');
                return;
            }
            var $modal = null;
            if (typeof PLFoundation != 'undefined') {
                if ($('#' + patternlibrary.Config.modals.plfoundationElementClassname).size() == 0) {
                    $('BODY').append('<div id="' + patternlibrary.Config.modals.plfoundationElementClassname + '" class="' + patternlibrary.Config.modals.plfoundationElementClassname + '" data-reveal></div>');
                }
                var revealOptions = {
                    "animationIn": "scale-in-up",
                    "animationOut": "scale-out-down",
                    "overlay": true,
                    "closeOnClick": false,
                    "closeOnEcs": true,
                    "multipleOpened": false,
                    "deepLink": false
                };
                var modalData = '' + data + '',
                    m = new PLFoundation.Reveal($('#' + patternlibrary.Config.modals.plfoundationElementClassname), revealOptions);
                $('#' + patternlibrary.Config.modals.plfoundationElementClassname).html(data).plfoundation('open');
                $modal = $('.' + patternlibrary.Config.modals.plfoundationElementClassname);
                $modal.on('closed.zf.reveal', patternlibrary.Modal.close);
            } else {
                var $modalDefaults = {
                    show: true
                };
                $(data).modal($modalDefaults);
                $modal = $('.' + patternlibrary.Config.modals.bootstrapElementClassname);
            }

            if (updateWindowHref) {
                patternlibrary.WindowHref.reset();
                document._old_href = window.location.href;
                window.history.pushState({
                    "html": null,
                    "pageTitle": document.title
                }, "", updateWindowHref);
            }

            return $modal;
        },

        /**
         * close modal dialog
         * 
         * @return patternlibrary.libs.modal
         */
        close: function close() {
            if (typeof $.fn.modal == 'undefined' && typeof PLFoundation.Reveal == 'undefined') {
                console.warn('jQuery Modal and/or PLFoundation Reveal plug-ins not found...');
                return;
            }

            var $modal;
            // close/destroy modals
            if (typeof PLFoundation != 'undefined') {
                $modal = $('.' + patternlibrary.Config.modals.plfoundationElementClassname);
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
                $modal = $('.' + patternlibrary.Config.modals.bootstrapElementClassname);
                if ($modal) {
                    $modal.modal('hide');
                }
            }

            // clean up
            $('BODY').removeClass('is-reveal-open');
            $('.reveal, .reveal-wrapper, .modal, .modal-backdrop').remove();

            // (re)set document URL
            patternlibrary.WindowHref.reset();

            return this;
        }

    };

    // code, private functions, etc here...

    patternlibrary.Modal = {
        open: patternlibrary.libs.modal.open,
        close: patternlibrary.libs.modal.close
    };
})(jQuery, window, document, window.patternlibrary);
'use strict';

/**
 * 
 */
;(function ($, window, document, patternlibrary) {
    'use strict';

    patternlibrary.libs.windowhref = {
        name: 'windowhref',

        version: '0.0.1',

        settings: {
            callback: function callback() {}
        },

        init: function init(scope, method, options) {
            var self = this;
            // patternlibrary.inherit(this, 'modulename1 modulename2');
        },

        /**
         * update window's href to URL and save old href
         * 
         * @param  string  url  URL to update to
         * @return patternlibrary.libs.windowhref
         */
        update: function update(url) {
            if (url == '' || url == window.location.href) {
                return;
            }

            document._old_href = window.location.href;
            window.history.pushState({
                "html": null,
                "pageTitle": document.title
            }, "", updateWindowHref);

            return this;
        },

        /**
         * reset window's href to stored URL
         * 
         * @return patternlibrary.libs.windowhref
         */
        reset: function reset() {
            if (document._old_href) {
                window.history.pushState({
                    "html": null,
                    "pageTitle": document.title
                }, "", document._old_href);
                this.clear();
            }
            return this;
        },

        /**
         * clear stored URL
         * 
         * @return patternlibrary.libs.windowhref
         */
        clearOldHref: function clearOldHref() {
            document._old_href = null;
            return this;
        }

    };

    // code, private functions, etc here...

    patternlibrary.WindowHref = {
        update: patternlibrary.libs.windowhref.update,
        reset: patternlibrary.libs.windowhref.reset,
        clear: patternlibrary.libs.windowhref.clearOldHref
    };
})(jQuery, window, document, window.patternlibrary);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Plugin module.
 * @module plfoundation.plugin
 */
var Plugin = function () {

  /**
   * Create a new instance of a plugin.
   * @class
   * @name Plugin
   * @param {jQuery} element - jQuery object to apply the plugin to.
   * @param {Object} options - Overrides to the default plugin settings.
   */
  function Plugin(element, options) {
    _classCallCheck(this, Plugin);

    this._setup(element, options);
    var pluginName = getPluginName(this);
    this.uuid = GetYoDigits(6, pluginName);

    if (!this.$element.attr('data-' + pluginName)) {
      this.$element.attr('data-' + pluginName, this.uuid);
    }
    if (!this.$element.data('zfPlugin')) {
      this.$element.data('zfPlugin', this);
    }
    /**
     * Fires when the plugin has initialized.
     * @event Plugin#init
     */
    this.$element.trigger('init.pl.' + pluginName);
  }

  /**
   * Destroys the plugin.
   * @function
   */


  _createClass(Plugin, [{
    key: 'destroy',
    value: function destroy() {
      this._destroy();
      var pluginName = getPluginName(this);
      this.$element.removeAttr('data-' + pluginName).removeData('zfPlugin')
      /**
       * Fires when the plugin has been destroyed.
       * @event Plugin#destroyed
       */
      .trigger('destroyed.pl.' + pluginName);
      for (var prop in this) {
        this[prop] = null; //clean up script to prep for garbage collection.
      }
    }

    /**
     * Retrieve main layout-builder instance.
     * @function
     */

  }, {
    key: 'hide',


    /**
     * Hide the main plugin element.
     * @function
     */
    value: function hide() {
      this.$element.hide();
    }

    /**
     * Show the main plugin element.
     * @function
     */

  }, {
    key: 'show',
    value: function show() {
      this.$element.show();
    }

    /**
     * generate initial markup
     * @function
     * @private
     */

  }, {
    key: 'toString',


    /**
     * return initial markup
     * @function
     */
    value: function toString() {
      return this._markup;
    }

    /**
     * return initial markup elements
     * @function
     */

  }, {
    key: 'toElement',
    value: function toElement() {
      return $(this.toString());
    }
  }, {
    key: '_builder',
    get: function get() {
      return $('[data-layoutbuilder]').first().data('patternlibraryPlugin');
    }

    /**
     * Retrieve main layout-builder toolbar instance.
     * @function
     */

  }, {
    key: '_toolbar',
    get: function get() {
      return $('[data-layouttoolbar]').first().data('patternlibraryPlugin');
    }

    /**
     * Retrieve main layout-builder layout-body instance.
     * @function
     */

  }, {
    key: '_body',
    get: function get() {
      return $('[data-layoutbody]').first().data('patternlibraryPlugin');
    }

    /**
     * Alias to retrieve main layout-builder layout-body instance.
     * @function
     * @see Plugin._body
     */

  }, {
    key: '_layoutbody',
    get: function get() {
      return this._body;
    }
  }, {
    key: '_markup',
    get: function get() {
      var html = ['<div>', '</div>'];

      return $(html.join(''));
    }
  }]);

  return Plugin;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Layoutbuilder module.
 * @module patternlibrary.layoutbuilder
 * 
 * @requires patternlibrary.Plugin
 * @requires foundation.Triggers
 * @requires foundation.Keyboard
 * @requires foundation.MediaQuery
 */
var Layoutbuilder = function (_Plugin) {
    _inherits(Layoutbuilder, _Plugin);

    function Layoutbuilder() {
        _classCallCheck(this, Layoutbuilder);

        return _possibleConstructorReturn(this, (Layoutbuilder.__proto__ || Object.getPrototypeOf(Layoutbuilder)).apply(this, arguments));
    }

    _createClass(Layoutbuilder, [{
        key: '_setup',


        /**
         * Setup a new instance of a layoutbuilder.
         * @class
         * @name Layoutbuilder
         * @param {jQuery} element - jQuery object to make into a layoutbuilder.
         *        Object should be of the layoutbuilder panel, rather than its anchor.
         * @param {Object} options - Overrides to the default plugin settings.
         */
        value: function _setup(element, options) {
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

    }, {
        key: '_init',
        value: function _init() {

            this._checkDeepLink();
            this._events();

            this._initToolbar();
            this._initDocumentbody();

            this.$element.trigger('initialized.pl.layoutbuilder');
        }
    }, {
        key: '_initDocumentbody',
        value: function _initDocumentbody() {}
    }, {
        key: '_initToolbar',
        value: function _initToolbar() {
            var $toolbar;
            if (this.$element.find('> [data-layouttoolbar]').length == 0) {
                if (patternlibrary.debug()) console.log('layoutbuilder generate toolbar');
                this.$element.prepend(Layouttoolbar.prototype.toElement());
                $toolbar = new Layouttoolbar(this.$element.find('> [data-layouttoolbar]').first());
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

    }, {
        key: '_events',
        value: function _events() {
            this._addKeyHandler();
            this._addClickHandler();
            //this._addFocusHandler();

            $(window).on('changed.zf.mediaquery', this._setMqHandler.bind(this));

            $(window).on('resize.pl.layoutbuilder', function () {
                if (patternlibrary.debug()) console.log('layoutbuilder resize trigger test');
            });

            if (this.options.deepLink) {
                $(window).on('popstate', this._checkDeepLink);
            }
        }

        /**
         * Adds click handlers for items within the tabs.
         * @private
         */

    }, {
        key: '_addClickHandler',
        value: function _addClickHandler() {}

        /**
         * Adds click handlers for items within the tabs.
         * @private
         */

    }, {
        key: '_addFocusHandler',
        value: function _addFocusHandler() {
            var _this = this;

            this.$element.off('focused.pl.layoutelement,unfocused.pl.layoutelement').on('focused.pl.layoutelement,unfocused.pl.layoutelement', '[data-layoutrow],[data-layoutcolumn],[data-layoutpattern]', function (e) {

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

    }, {
        key: 'switchToolbarsections',
        value: function switchToolbarsections(focused_element) {
            var $focus = $(focused_element);

            if ($focus.data('patternlibraryPlugin') instanceof Layoutelement) {
                this._toolbar.switchSection($focus.data('patternlibraryPlugin').classname, $focus);
            }
        }

        /**
         * Adds keyboard event handlers for items within the tabs.
         * @private
         */

    }, {
        key: '_addKeyHandler',
        value: function _addKeyHandler() {
            var _this = this;

            this.$element.children().off('keydown.pl.layoutbuilder').on('keydown.pl.layoutbuilder', function (e) {

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
                    open: function open(event) {
                        if (patternlibrary.debug()) console.log('open event:', e);
                        _this.open($element);
                    },
                    close: function close() {
                        _this.close($element);
                    },
                    handled: function handled() {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                });
            });

            // register keyboard keys mapping
            PLFoundation.Keyboard.register('Layoutbuilder', {
                'ENTER': 'open',
                'ALT_SPACE': 'open',
                'ESCAPE': 'close'
            });
        }

        /**
         * Adds keyboard event handlers for items within the tabs.
         * @private
         */

    }, {
        key: '_setMqHandler',
        value: function _setMqHandler(e) {
            if (patternlibrary.debug()) console.log('layoutbuilder media query change');
            $(document).focus();
            document.activeElement.blur();
            this.$element.trigger('resize.pl.layoutbuilder');
        }

        /**
         * Check for anchor/deep-link 
         * @private
         */

    }, {
        key: '_checkDeepLink',
        value: function _checkDeepLink() {
            var anchor = window.location.hash;

            //need a hash and a relevant anchor
            if (anchor.length) {
                // find the anchor/deeplink action
                var $link = this.$element.find('[href$="' + anchor + '"]');
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

    }, {
        key: '_destroy',
        value: function _destroy() {
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

    }, {
        key: 'open',
        value: function open() {
            if (patternlibrary.debug()) console.log('layoutbuilder open');
            this.$element.trigger('open.pl.layoutbuilder');
        }

        /**
         * close...
         * @function
         * @access public
         */

    }, {
        key: 'close',
        value: function close() {
            if (patternlibrary.debug()) console.log('layoutbuilder close');
            this.$element.trigger('close.pl.layoutbuilder');
        }
    }]);

    return Layoutbuilder;
}(Plugin);

Layoutbuilder.defaults = {
    classColPrefix: "",
    classRow: "row",
    classSizes: "['small','medium','large','xlarge','xxlarge']",
    columnMax: 12
};

var LayoutbuilderClickdummy = function LayoutbuilderClickdummy(e) {
    var $this = $(e.currentTarget).data('patternlibraryPlugin');
    if (patternlibrary.debug()) console.log('layouttoolbaraction item clicked:', e, $this);
    e.stopPropagation();
    e.preventDefault();
};
//PLFoundation.plugin(Layoutbuilder, 'Layoutbuilder');
patternlibrary.plugin(Layoutbuilder, 'Layoutbuilder');
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Layoutbody module.
 * @module patternlibrary.layoutbody
 * 
 * @requires patternlibrary.Layoutelement
 * @requires patternlibrary.Plugin
 * @requires foundation.Triggers
 */
var Layoutbody = function (_Plugin) {
    _inherits(Layoutbody, _Plugin);

    function Layoutbody() {
        _classCallCheck(this, Layoutbody);

        return _possibleConstructorReturn(this, (Layoutbody.__proto__ || Object.getPrototypeOf(Layoutbody)).apply(this, arguments));
    }

    _createClass(Layoutbody, [{
        key: '_setup',


        /**
         * Setup a new instance of a layoutbody.
         * @class
         * @name Layoutbody
         * @param {jQuery} element - jQuery object to make into a layoutbody.
         *        Object should be of the layoutbody panel, rather than its anchor.
         * @param {Object} options - Overrides to the default plugin settings.
         */
        value: function _setup(element, options) {
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

    }, {
        key: '_init',
        value: function _init() {
            this._events();
        }

        /**
         * Adds event listeners to the element utilizing the triggers utility library.
         * @function
         * @private
         */

    }, {
        key: '_events',
        value: function _events() {
            this._addKeyHandler();
            this._addClickHandler();
            this._addFullscreenHandler();
        }
    }, {
        key: '_addFullscreenHandler',
        value: function _addFullscreenHandler() {
            var _this = this;

            this.$element.off('fullscreen.pl.layoutbody').on('fullscreen.pl.layoutbody', function (e) {

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
    }, {
        key: '_addClickHandler',
        value: function _addClickHandler() {
            var _this = this;

            this.$element.off('click.pl.layoutbody').on('click.pl.layoutbody', function (e) {

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

    }, {
        key: '_addKeyHandler',
        value: function _addKeyHandler() {
            var _this = this;

            $(window)
            //.off('keydown.pl.layoutbody')
            .on('keydown.pl.layoutbody', function (e) {

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
                    switch: function _switch() {
                        _this.switchFullscreen();

                        e.stopPropagation();
                        e.preventDefault();
                    },
                    handled: function handled() {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                });
            });

            // register keyboard keys mapping
            PLFoundation.Keyboard.register('Layoutbody', {
                'ESCAPE': 'switch',
                'CTRL_ALT_F': 'switch',
                'ALT_CTRL_F': 'switch'
            });
        }

        /**
         * Toggles layout-body's fullscreen display
         * @function
         * @private
         */

    }, {
        key: 'switchFullscreen',
        value: function switchFullscreen() {
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

    }, {
        key: '_destroy',
        value: function _destroy() {
            this.$element.find('*').off('.pl.layoutbody');
            this.$element.off('.pl.layoutbody');
            this.$element.remove();
        }
    }]);

    return Layoutbody;
}(Plugin);

//PLFoundation.plugin(Layoutbody, 'Layoutbody');


patternlibrary.plugin(Layoutbody, 'Layoutbody');
'use strict';

/**
 * LayouttoolbarsectionBuilder module.
 * 
 * @module patternlibrary.LayouttoolbarsectionBuilder
 * 
 * @requires patternlibrary.Layouttoolbarsection
 */
var LayouttoolbarsectionBuilder = {
	name: 'builder',
	items: [{
		type: 'action',
		label: 'load layout',
		action: '#load_layout',
		icon: 'fa fa-folder-open'
	}, {
		type: 'action',
		label: 'save layout',
		action: '#load_layout',
		icon: 'fa fa-save'
	}, { type: 'separator' }, {
		type: 'action',
		label: 'show source',
		action: '#show_source',
		icon: 'fa fa-code'
	}, { type: 'separator' }, {
		type: 'action',
		label: 'switch fullscreen',
		action: '#switch_fullscreen',
		icon: 'fa fa-tv',
		events: {
			click: function click(e) {
				//var $layoutbody = $('[data-layoutbody]');
				var $this = $(e.currentTarget).data('patternlibraryPlugin');
				if (patternlibrary.debug()) console.log('layouttoolbaraction fullscreen switch clicked:', e, $this);
				//$layoutbody.data('patternlibraryPlugin').switchFullscreen();
				$this._layoutbody.switchFullscreen();
				e.stopPropagation();
				e.preventDefault();
				if (patternlibrary.debug()) console.log('layouttoolbaraction fullscreen switch click');
			}
		}
	}, { type: 'separator' }, {
		type: 'action',
		label: 'edit settings',
		action: '#edit_settings',
		icon: 'fa fa-cogs'
	}]
};
'use strict';

/**
 * LayouttoolbarsectionLayoutcolumn module.
 * 
 * @module patternlibrary.LayouttoolbarsectionLayoutcolumn
 * 
 * @requires patternlibrary.Layouttoolbarsection
 */
var LayouttoolbarsectionLayoutcolumn = {
	name: 'layoutcolumn',
	items: [
	/*{
 	type  : 'action',
 	label : 'move element',
 	action: '#move_element',
 	icon  : 'fa fa-bars fa-rotate-90',
 	events: {
 	    click : LayoutbuilderClickdummy
 	}
 },
 {   type  : 'separator' },*/
	{
		type: 'action',
		label: 'add column',
		action: '#add_column',
		icon: 'fa fa-plus',
		events: {
			click: LayoutbuilderClickdummy
		}
	}, {
		type: 'action',
		label: 'remove row',
		action: '#remove_row',
		icon: 'fa fa-minus',
		events: {
			click: LayoutbuilderClickdummy
		}
	}, { type: 'separator' }, {
		type: 'action',
		label: 'add pattern',
		action: '#add_pattern',
		icon: 'fa fa-puzzle-piece',
		events: {
			click: LayoutbuilderClickdummy
		}
	}, { type: 'separator' }, {
		type: 'action',
		label: 'edit settings',
		action: '#edit_settings',
		icon: 'fa fa-cogs',
		events: {
			click: LayoutbuilderClickdummy
		}
	}]
};
'use strict';

/**
 * LayouttoolbarsectionLayoutrow module.
 * 
 * @module patternlibrary.LayouttoolbarsectionLayoutrow
 * 
 * @requires patternlibrary.Layouttoolbarsection
 */
var LayouttoolbarsectionLayoutrow = {
	name: 'layoutrow',
	items: [
	/*{
 	type  : 'action',
 	label : 'move element',
 	action: '#move_element',
 	icon  : 'fa fa-bars',
 	events: {
 	    click : LayoutbuilderClickdummy
 	}
 },
 {   type  : 'separator' },*/
	{
		type: 'action',
		label: 'add column',
		action: '#add_column',
		icon: 'fa fa-plus',
		events: {
			click: LayoutbuilderClickdummy
		}
	}, {
		type: 'action',
		label: 'remove row',
		action: '#remove_row',
		icon: 'fa fa-minus',
		events: {
			click: LayoutbuilderClickdummy
		}
	}, { type: 'separator' }, {
		type: 'action',
		label: 'edit settings',
		action: '#edit_settings',
		icon: 'fa fa-cogs',
		events: {
			click: LayoutbuilderClickdummy
		}
	}]
};
'use strict';

/**
 * LayouttoolbarsectionPattern module.
 * 
 * @module patternlibrary.LayouttoolbarsectionPattern
 * 
 * @requires patternlibrary.Layouttoolbarsection
 */
var LayouttoolbarsectionPattern = {
	name: 'pattern',
	items: [
	/*{
 	type  : 'action',
 	label : 'move element',
 	action: '#move_element',
 	icon  : 'fa fa-bars',
 	events: {
 	    click : LayoutbuilderClickdummy
 	}
 },
 {   type  : 'separator' },*/
	{
		type: 'action',
		label: 'view pattern doc',
		action: '#view_pattern_doc',
		icon: 'fa fa-info',
		events: {
			click: LayoutbuilderClickdummy
		}
	}, {
		type: 'action',
		label: 'edit pattern',
		action: '#edit_pattern',
		icon: 'fa fa-edit',
		events: {
			click: LayoutbuilderClickdummy
		}
	}, {
		type: 'action',
		label: 'remove pattern',
		action: '#remove_pattern',
		icon: 'fa fa-minus',
		events: {
			click: LayoutbuilderClickdummy
		}
	}, { type: 'separator' }, {
		type: 'action',
		label: 'pattern settings',
		action: '#pattern_settings',
		icon: 'fa fa-cogs',
		events: {
			click: LayoutbuilderClickdummy
		}
	}]
};
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Layouttoolbar module.
 * @module plfoundation.layouttoolbar
 * 
 * @requires patternlibrary.Plugin
 * @requires foundation.Triggers
 */
var Layouttoolbar = function (_Plugin) {
  _inherits(Layouttoolbar, _Plugin);

  function Layouttoolbar() {
    _classCallCheck(this, Layouttoolbar);

    return _possibleConstructorReturn(this, (Layouttoolbar.__proto__ || Object.getPrototypeOf(Layouttoolbar)).apply(this, arguments));
  }

  _createClass(Layouttoolbar, [{
    key: '_setup',


    /**
     * Setup a new instance of a layouttoolbar.
     * @class
     * @name Layouttoolbar
     * @param {jQuery} element - jQuery object to make into a layouttoolbar.
     *        Object should be of the layouttoolbar panel, rather than its anchor.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    value: function _setup(element, options) {
      if (patternlibrary.debug()) console.log('layouttoolbar init');
      this.$element = element;
      this.options = $.extend({}, Layouttoolbar.defaults, this.$element.data(), options);
      this.className = 'layouttoolbar'; // ie9 back compat

      // Triggers init is idempotent, just need to make sure it is initialized
      PLFoundation.Triggers.init($);

      this._init();

      // (maybe, this line is not nessessary anymore...?!)
      //PLFoundation.registerPlugin(this, 'Layouttoolbar');

      if (patternlibrary.debug()) console.log('layouttoolbar initialized');
    }

    /**
        * Initializes the plugin by setting/checking options and attributes, adding helper variables, and saving the anchor.
        * @function
        * @private
        */

  }, {
    key: '_init',
    value: function _init() {
      this._events();
      this.hideSections();
      if (this.$element) {
        this.$element.trigger('initialized.pl.layouttoolbar');
      }
    }

    /**
     * Adds event listeners to the element utilizing the triggers utility library.
     * @function
     * @private
     */

  }, {
    key: '_events',
    value: function _events() {
      this._addInitHandler();
    }

    /**
     * Adds initialzation event listeners
     * @function
     * @private
     */

  }, {
    key: '_addInitHandler',
    value: function _addInitHandler() {
      var $this = this;
      this.$element.off('initialized.pl.layouttoolbar').on('initialized.pl.layouttoolbar', function (e) {
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

  }, {
    key: '_initSections',
    value: function _initSections() {
      if (patternlibrary.debug()) console.log('layouttoolbar initialize section', this.options.sections);
      var $this = this;
      $(this.options.sections).each(function (idx, sectionconfig) {
        if (patternlibrary.debug()) console.log('layouttoolbar init section', sectionconfig);
        if ($this.$element.find('> [rel="' + sectionconfig.name + '"]').length == 0) {
          $this._initSection(sectionconfig);
        }
      });
    }

    /**
        * Initializes a single new toolbar sections
        * @function
        * @private
        */

  }, {
    key: '_initSection',
    value: function _initSection(sectionconfig) {
      if (patternlibrary.debug()) console.log('layouttoolbar initialize section', sectionconfig);

      this.$element.prepend(Layouttoolbarsection.prototype.toElement(sectionconfig));
      var $section = new Layouttoolbarsection(this.$element.find('> [rel="' + sectionconfig.name + '"]'), sectionconfig);
      //$section.$element.children().first().plfoundation();//patternlibrary();
      $section.$element.trigger('initialized');

      if (patternlibrary.debug()) console.log('layouttoolbar section initialized: ', $section);
    }

    /**
     * retrieve all toolbar sections
     * @function
     * @private
     */

  }, {
    key: 'section',


    /**
     * retrieve a toolbar section by name
     * @function
     */
    value: function section(name) {
      var $section;

      $(this._sections).each(function (idx, _section) {
        if (_section.$element && _section.$element.attr('rel') == name) {
          $section = _section;
        }
      });

      return $section;
    }

    /**
     * retrieve builder's toolbar section
     * @function
     * @private
     */

  }, {
    key: 'hideSections',


    /**
     * hide all toolbar sections
     * @function
     */
    value: function hideSections() {
      var sections = this._sections;
      sections.each(function (idx, section) {
        section.hide();
      });
      if (patternlibrary.debug()) console.log('builder:', this._builderSection);
      //this._builderSection.show();
      sections.each(function (idx, section) {
        if (section.$element.attr('rel') == 'builder') {
          section.show();
        }
      });
    }

    /**
     * switch toolbar sections according to focused element
     * @function
     */

  }, {
    key: 'switchSection',
    value: function switchSection(name, reference) {
      var sections = this._sections;
      sections.each(function (idx, section) {
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

  }, {
    key: '_destroySections',


    /**
     * Destroys the layouttoolbar's sections.
     * @function
     * @private
     */
    value: function _destroySections() {}

    /**
     * Destroys the layouttoolbar.
     * @function
     * @private
     */

  }, {
    key: '_destroy',
    value: function _destroy() {
      this.$element.find('*').off('.pl.layouttoolbar');
      this.$element.off('.pl.layouttoolbar');
      this.$element.remove();
    }
  }, {
    key: '_sections',
    get: function get() {
      return this.$element.find('[data-layouttoolbarsection]').map(function (idx, elem) {
        return $(elem).data('patternlibraryPlugin');
      });
    }
  }, {
    key: '_builderSection',
    get: function get() {
      var builderSection = null;
      this._sections.each(function (idx, section) {
        if (section.$element.attr('rel') == 'builder') {
          builderSection = section;
          return false;
        }
      });
      return builderSection;
    }
  }, {
    key: '_markup',
    get: function get() {
      var html = ['<div data-layouttoolbar class="toolbar">', '</div>'];

      return $(html.join(''));
    }
  }]);

  return Layouttoolbar;
}(Plugin);

Layouttoolbar.defaults = {
  sections: [LayouttoolbarsectionBuilder, LayouttoolbarsectionLayoutrow, LayouttoolbarsectionLayoutcolumn, LayouttoolbarsectionPattern]
};

//PLFoundation.plugin(Layouttoolbar, 'Layouttoolbar');
patternlibrary.plugin(Layouttoolbar, 'Layouttoolbar');

if (typeof define == 'function') {
  // require/AMD module definition
  define([], function (require, exports, module) {
    return Layouttoolbar;
  });
}
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Layoutelement module.
 * @module plfoundation.layoutelement
 * 
 * @requires plfoundation.Plugin
 * @requires plfoundation.Keyboard
 * @requires plfoundation.MediaQuery
 */
var Layoutelement = function (_Plugin) {
    _inherits(Layoutelement, _Plugin);

    function Layoutelement() {
        _classCallCheck(this, Layoutelement);

        return _possibleConstructorReturn(this, (Layoutelement.__proto__ || Object.getPrototypeOf(Layoutelement)).apply(this, arguments));
    }

    _createClass(Layoutelement, [{
        key: '_setup',


        /**
         * Setup a new instance of a layoutelement.
         * @class
         * @name Layoutelement
         * @param {jQuery} element - jQuery object to make into a layoutelement.
         *        Object should be of the layoutelement panel, rather than its anchor.
         * @param {Object} options - Overrides to the default plugin settings.
         */
        value: function _setup(element, options) {
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

    }, {
        key: '_init',
        value: function _init() {
            this._events();
        }

        /**
         * Adds event listeners to the element utilizing the triggers utility library.
         * @function
         * @private
         */

    }, {
        key: '_events',
        value: function _events() {
            this._addClickHandler();
            this._addFocusHandler();
        }

        /**
         * Adds click handlers for items within the tabs.
         * @function
         * @private
         */

    }, {
        key: '_addClickHandler',
        value: function _addClickHandler() {
            var _this = this;

            this.$element.off('click.pl.layoutelement').on('click.pl.layoutelement', function (e) {

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

    }, {
        key: '_addFocusHandler',
        value: function _addFocusHandler() {
            var _this = this;

            this.$element.off('focused.pl.layoutelement').on('focused.pl.layoutelement', function (e) {

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

            this.$element.off('unfocused.pl.layoutelement').on('unfocused.pl.layoutelement', function (e) {

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

    }, {
        key: '_focusLayoutelement',
        value: function _focusLayoutelement() {
            $('[data-layoutelementtoolbar],[data-layoutelementdragtrigger]').remove();
            if (!this.$element.hasClass(this.options.focusClassname)) {
                $('.' + this.options.focusClassname).removeClass(this.options.focusClassname);
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
            return this;
        }

        /**
         * Set focus on current $element
         * @function
         * @public
         */

    }, {
        key: 'focus',
        value: function focus() {
            return this._focusLayoutelement();
        }

        /**
         * Un-focus any layout element
         * @function
         * @public
         */

    }, {
        key: 'unfocus',
        value: function unfocus() {
            $('[data-layoutbody] .focused').each(function (idx, elem) {
                if ($(elem).data()) {
                    $(elem).data('patternlibraryPlugin').focus();
                }
            });
        }

        /**
         * Retrieve element's toolbar instance
         * @private
         */

    }, {
        key: '_initElementtoolbar',


        /**
            * Initializes a single new toolbar sections
            * @function
            * @private
            */
        value: function _initElementtoolbar(sectionconfig) {
            if (patternlibrary.debug()) console.log('layoutelementtoolbar initialize section element:', sectionconfig);

            this.$element.prepend(Layoutelementtoolbar.prototype.toElement());
            var $toolbarsection = this.$element.find('> [data-layoutelementtoolbar]');
            var $section = new Layoutelementtoolbar($toolbarsection, sectionconfig);
            $toolbarsection.data('patternlibraryPlugin', $section);
            //$section.$element.children().first().patternlibrary();//plfoundation();//
            //$section.$element.trigger('initialized');

            if (patternlibrary.debug()) console.log('layoutelementtoolbar initialized: ', $section);
        }

        /**
         * Retrieve element's drag-trigger instance
         * @private
         */

    }, {
        key: '_initDragtrigger',


        /**
            * Initializes a single new drag-trigger sections
            * @function
            * @private
            */
        value: function _initDragtrigger(sectionconfig) {
            if (patternlibrary.debug()) console.log('layoutelementdragtrigger initialize section element:', sectionconfig);

            this.$element.prepend(Layoutelementdragtrigger.prototype.toElement());
            var $toolbarsection = this.$element.find('> [data-layoutelementdragtrigger]');
            var $section = new Layoutelementdragtrigger($toolbarsection, sectionconfig);
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

    }, {
        key: '_destroy',
        value: function _destroy() {
            this.$element.find('*').off('.pl.layoutelement');
            this.$element.off('.pl.layoutelement');
            this.$element.remove();
        }
    }, {
        key: '_elementtoolbar',
        get: function get() {
            if (patternlibrary.debug()) console.log('layoutelementtoolbar section element:', this.$element.find('> [data-layoutelementtoolbar]'));
            return this.$element.find('> [data-layoutelementtoolbar]').data('patternlibraryPlugin');
        }
    }, {
        key: '_dragtrigger',
        get: function get() {
            if (patternlibrary.debug()) console.log('layoutelementdragtrigger section element:', this.$element.find('> [data-layoutelementdragtrigger]'));
            return this.$element.find('> [data-layoutelementdragtrigger]').data('patternlibraryPlugin');
        }
    }]);

    return Layoutelement;
}(Plugin);

Layoutelement.defaults = {
    activeClassname: 'activated',
    focusClassname: 'focused'

    //PLFoundation.plugin(Layoutelement, 'Layoutelement');
};patternlibrary.plugin(Layoutelement, 'Layoutelement');
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Layoutbuilder Exception object
 * 
 * @module LayoutbuilderException
 */
var LayoutbuilderException = function () {

  /**
   * Create a new instance of a LayoutbuilderException.
   * @class
   * @name LayoutbuilderException
   * @param {string} message - message of the exception decribing the occurence.
   * @param {number} code - optional message code, default = 0.
   */
  function LayoutbuilderException(message) {
    var code = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    _classCallCheck(this, LayoutbuilderException);

    this.name = "LayoutbuilderException";
    this.message = message;
  }

  /**
   * compose string output of LayoutbuilderException
   * 
   * @function
   * @return {string}
   */


  _createClass(LayoutbuilderException, [{
    key: "toString",
    value: function toString() {
      return this.name + ": " + this.message;
    }
  }]);

  return LayoutbuilderException;
}();

;
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Layoutcolumn module.
 * @module plfoundation.layoutcolumn
 * 
 * @requires plfoundation.Layoutelement
 */
var Layoutcolumn = function (_Layoutelement) {
  _inherits(Layoutcolumn, _Layoutelement);

  function Layoutcolumn() {
    _classCallCheck(this, Layoutcolumn);

    return _possibleConstructorReturn(this, (Layoutcolumn.__proto__ || Object.getPrototypeOf(Layoutcolumn)).apply(this, arguments));
  }

  _createClass(Layoutcolumn, [{
    key: 'classname',
    get: function get() {
      return 'layoutcolumn';
    }
  }]);

  return Layoutcolumn;
}(Layoutelement);

//PLFoundation.plugin(Layoutcolumn, 'Layoutcolumn');


patternlibrary.plugin(Layoutcolumn, 'Layoutcolumn');
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Layoutelementdragtrigger module.
 * @module plfoundation.layoutelementdragtrigger
 * 
 * @requires patternlibrary.Plugin
 * @requires foundation.Triggers
 */
var Layoutelementdragtrigger = function (_Plugin) {
  _inherits(Layoutelementdragtrigger, _Plugin);

  function Layoutelementdragtrigger() {
    _classCallCheck(this, Layoutelementdragtrigger);

    return _possibleConstructorReturn(this, (Layoutelementdragtrigger.__proto__ || Object.getPrototypeOf(Layoutelementdragtrigger)).apply(this, arguments));
  }

  _createClass(Layoutelementdragtrigger, [{
    key: '_setup',


    /**
     * Setup a new instance of a layoutelementdragtrigger.
     * @class
     * @name Layoutelementdragtrigger
     * @param {jQuery} element - jQuery object to make into a layoutelementdragtrigger.
     *        Object should be of the layoutelementdragtrigger panel, rather than its anchor.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    value: function _setup(element, options) {
      if (patternlibrary.debug()) console.log('layoutelementdragtrigger init');
      this.$element = element;
      this.options = $.extend({}, Layoutelementdragtrigger.defaults, this.$element.data(), options);
      this.className = 'layoutelementdragtrigger'; // ie9 back compat

      // Triggers init is idempotent, just need to make sure it is initialized
      PLFoundation.Triggers.init($);

      this._init();

      // (maybe, this line is not nessessary anymore...?!)
      //PLFoundation.registerPlugin(this, 'Layoutelementdragtrigger');

      if (patternlibrary.debug()) console.log('layoutelementdragtrigger initialized');
    }

    /**
        * Initializes the plugin by setting/checking options and attributes, adding helper variables, and saving the anchor.
        * @function
        * @private
        */

  }, {
    key: '_init',
    value: function _init() {
      this._events();
      this.hideSections();
      if (this.$element) {
        this.$element.trigger('initialized.pl.layoutelementdragtrigger');
      }
    }

    /**
     * Adds event listeners to the element utilizing the triggers utility library.
     * @function
     * @private
     */

  }, {
    key: '_events',
    value: function _events() {
      this._addInitHandler();
    }

    /**
     * Adds initialzation event listeners
     * @function
     * @private
     */

  }, {
    key: '_addInitHandler',
    value: function _addInitHandler() {
      var $this = this;
      this.$element.off('initialized.pl.layoutelementdragtrigger').on('initialized.pl.layoutelementdragtrigger', function (e) {
        $this._initSections.apply($this);
        e.stopPropagation();
        e.preventDefault();
      });
    }

    /**
        * Initializes the toolbar sections given by config
        * @function
        * @private
        */

  }, {
    key: '_initSections',
    value: function _initSections() {
      if (patternlibrary.debug()) console.log('layoutelementdragtrigger initialize section', this.options.sections);
      var $this = this;
      $(this.options.sections).each(function (idx, sectionconfig) {
        if (patternlibrary.debug()) console.log('layoutelementdragtrigger init section', sectionconfig);
        if ($this.$element.find('> [rel="' + sectionconfig.name + '"]').length == 0) {
          $this._initSection(sectionconfig);
        }
      });
    }

    /**
        * Initializes a single new toolbar sections
        * @function
        * @private
        */

  }, {
    key: '_initSection',
    value: function _initSection(sectionconfig) {
      if (patternlibrary.debug()) console.log('layoutelementdragtrigger initialize section', sectionconfig);

      this.$element.prepend(Layouttoolbarsection.prototype.toElement(sectionconfig));
      var $section = new Layouttoolbarsection(this.$element.find('> [rel="' + sectionconfig.name + '"]'), sectionconfig);
      $section.$element.children().first().plfoundation(); //patternlibrary();
      $section.$element.trigger('initialized');

      if (patternlibrary.debug()) console.log('layoutelementdragtrigger section initialized: ', $section);
    }

    /**
     * retrieve all toolbar sections
     * @function
     * @private
     */

  }, {
    key: 'section',


    /**
     * retrieve a toolbar section by name
     * @function
     */
    value: function section(name) {
      var $section;

      $(this._sections).each(function (idx, _section) {
        if (_section.$element && _section.$element.attr('rel') == name) {
          $section = _section;
        }
      });

      return $section;
    }

    /**
     * retrieve builder's toolbar section
     * @function
     * @private
     */

  }, {
    key: 'hideSections',


    /**
     * hide all toolbar sections
     * @function
     */
    value: function hideSections() {
      var sections = this._sections;
      sections.each(function (idx, section) {
        section.hide();
      });
      if (patternlibrary.debug()) console.log('builder:', this._builderSection);
      //this._builderSection.show();
      sections.each(function (idx, section) {
        if (section.$element.attr('rel') == 'builder') {
          section.show();
        }
      });
    }

    /**
     * switch toolbar sections according to focused element
     * @function
     */

  }, {
    key: 'switchSection',
    value: function switchSection(name, reference) {
      var sections = this._sections;
      sections.each(function (idx, section) {
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

  }, {
    key: '_destroySections',


    /**
     * Destroys the layoutelementdragtrigger's sections.
     * @function
     * @private
     */
    value: function _destroySections() {}

    /**
     * Destroys the layoutelementdragtrigger.
     * @function
     * @private
     */

  }, {
    key: '_destroy',
    value: function _destroy() {
      this.$element.find('*').off('.pl.layoutelementdragtrigger');
      this.$element.off('.pl.layoutelementdragtrigger');
      this.$element.remove();
    }
  }, {
    key: '_sections',
    get: function get() {
      return this.$element.find('[data-layouttoolbarsection]').map(function (idx, elem) {
        return $(elem).data('patternlibraryPlugin');
      });
    }
  }, {
    key: '_builderSection',
    get: function get() {
      var builderSection = null;
      this._sections.each(function (idx, section) {
        if (section.$element.attr('rel') == 'builder') {
          builderSection = section;
          return false;
        }
      });
      return builderSection;
    }
  }, {
    key: '_markup',
    get: function get() {
      var html = ['<div data-layoutelementdragtrigger class="toolbar actions">', '</div>'];

      return $(html.join(''));
    }
  }]);

  return Layoutelementdragtrigger;
}(Plugin);

Layoutelementdragtrigger.defaults = {
  sections: [{
    name: 'layoutelementdragtrigger',
    items: [{
      type: 'action',
      label: 'move element',
      icon: 'fa fa-arrows',
      action: '#move_element',
      events: {
        click: LayoutbuilderClickdummy
      }
    }]
  }]
};

//PLFoundation.plugin(Layoutelementdragtrigger, 'Layoutelementdragtrigger');
patternlibrary.plugin(Layoutelementdragtrigger, 'Layoutelementdragtrigger');

if (typeof define == 'function') {
  // require/AMD module definition
  define([], function (require, exports, module) {
    return Layoutelementdragtrigger;
  });
}
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Layoutelementtoolbar module.
 * @module plfoundation.layoutelementtoolbar
 * 
 * @requires patternlibrary.Plugin
 * @requires foundation.Triggers
 */
var Layoutelementtoolbar = function (_Plugin) {
  _inherits(Layoutelementtoolbar, _Plugin);

  function Layoutelementtoolbar() {
    _classCallCheck(this, Layoutelementtoolbar);

    return _possibleConstructorReturn(this, (Layoutelementtoolbar.__proto__ || Object.getPrototypeOf(Layoutelementtoolbar)).apply(this, arguments));
  }

  _createClass(Layoutelementtoolbar, [{
    key: '_setup',


    /**
     * Setup a new instance of a layoutelementtoolbar.
     * @class
     * @name Layoutelementtoolbar
     * @param {jQuery} element - jQuery object to make into a layoutelementtoolbar.
     *        Object should be of the layoutelementtoolbar panel, rather than its anchor.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    value: function _setup(element, options) {
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

  }, {
    key: '_init',
    value: function _init() {
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

  }, {
    key: '_events',
    value: function _events() {
      this._addInitHandler();
    }

    /**
     * Adds initialzation event listeners
     * @function
     * @private
     */

  }, {
    key: '_addInitHandler',
    value: function _addInitHandler() {
      var $this = this;
      this.$element.off('initialized.pl.layoutelementtoolbar').on('initialized.pl.layoutelementtoolbar', function (e) {
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

  }, {
    key: '_initSections',
    value: function _initSections() {
      if (patternlibrary.debug()) console.log('layoutelementtoolbar initialize section', this.options.sections);
      var $this = this;
      $(this.options.sections).each(function (idx, sectionconfig) {
        var $layoutelement = $this.$element.parent().data('patternlibraryPlugin');
        if ($layoutelement.classname == sectionconfig.name) {
          if (patternlibrary.debug()) console.log('layoutelementtoolbar init section', sectionconfig);
          if ($this.$element.find('> [data-layouttoolbarsection]').length == 0) {
            $this._initSection(sectionconfig);
          }
        }
      });
    }

    /**
        * Initializes a single new toolbar sections
        * @function
        * @private
        */

  }, {
    key: '_initSection',
    value: function _initSection(sectionconfig) {
      if (patternlibrary.debug()) console.log('layoutelementtoolbar initialize section', sectionconfig);

      this.$element.prepend(Layouttoolbarsection.prototype.toElement(sectionconfig));
      var $section = new Layouttoolbarsection(this.$element.find('> [rel="' + sectionconfig.name + '"]'), sectionconfig);
      $section.$element.children().first().plfoundation(); //patternlibrary();
      $section.$element.trigger('initialized');

      if (patternlibrary.debug()) console.log('layoutelementtoolbar section initialized: ', $section);
    }

    /**
     * retrieve all toolbar sections
     * @function
     * @private
     */

  }, {
    key: 'section',


    /**
     * retrieve a toolbar section by name
     * @function
     */
    value: function section(name) {
      var $section;

      $(this._sections).each(function (idx, _section) {
        if (_section.$element && _section.$element.attr('rel') == name) {
          $section = _section;
        }
      });

      return $section;
    }

    /**
     * retrieve builder's toolbar section
     * @function
     * @private
     */

  }, {
    key: 'hideSections',


    /**
     * hide all toolbar sections
     * @function
     */
    value: function hideSections() {
      var sections = this._sections;
      sections.each(function (idx, section) {
        section.hide();
      });
      if (patternlibrary.debug()) console.log('builder:', this._builderSection);
      //this._builderSection.show();
      sections.each(function (idx, section) {
        if (section.$element.attr('rel') == 'builder') {
          section.show();
        }
      });
    }

    /**
     * switch toolbar sections according to focused element
     * @function
     */

  }, {
    key: 'switchSection',
    value: function switchSection(name, reference) {
      var sections = this._sections;
      sections.each(function (idx, section) {
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

  }, {
    key: '_destroySections',


    /**
     * Destroys the layoutelementtoolbar's sections.
     * @function
     * @private
     */
    value: function _destroySections() {}

    /**
     * Destroys the layoutelementtoolbar.
     * @function
     * @private
     */

  }, {
    key: '_destroy',
    value: function _destroy() {
      this.$element.find('*').off('.pl.layoutelementtoolbar');
      this.$element.off('.pl.layoutelementtoolbar');
      this.$element.remove();
    }
  }, {
    key: '_sections',
    get: function get() {
      return this.$element.find('[data-layouttoolbarsection]').map(function (idx, elem) {
        return $(elem).data('patternlibraryPlugin');
      });
    }
  }, {
    key: '_builderSection',
    get: function get() {
      var builderSection = null;
      this._sections.each(function (idx, section) {
        if (section.$element.attr('rel') == 'builder') {
          builderSection = section;
          return false;
        }
      });
      return builderSection;
    }
  }, {
    key: '_markup',
    get: function get() {
      var html = ['<div data-layoutelementtoolbar class="toolbar actions">', '</div>'];

      return $(html.join(''));
    }
  }]);

  return Layoutelementtoolbar;
}(Plugin);

Layoutelementtoolbar.defaults = {
  sections: [LayouttoolbarsectionLayoutrow, LayouttoolbarsectionLayoutcolumn, LayouttoolbarsectionPattern]
};

//PLFoundation.plugin(Layoutelementtoolbar, 'Layoutelementtoolbar');
patternlibrary.plugin(Layoutelementtoolbar, 'Layoutelementtoolbar');

if (typeof define == 'function') {
  // require/AMD module definition
  define([], function (require, exports, module) {
    return Layoutelementtoolbar;
  });
}
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Layoutpattern module.
 * @module patternlibrary.layoutpattern
 * 
 * @requires patternlibrary.Layoutelement
 */
var Layoutpattern = function (_Layoutelement) {
  _inherits(Layoutpattern, _Layoutelement);

  function Layoutpattern() {
    _classCallCheck(this, Layoutpattern);

    return _possibleConstructorReturn(this, (Layoutpattern.__proto__ || Object.getPrototypeOf(Layoutpattern)).apply(this, arguments));
  }

  _createClass(Layoutpattern, [{
    key: 'classname',
    get: function get() {
      return 'layoutpattern';
    }
  }]);

  return Layoutpattern;
}(Layoutelement);

//PLFoundation.plugin(Layoutpattern, 'Layoutpattern');


patternlibrary.plugin(Layoutpattern, 'Layoutpattern');
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Layoutrow module.
 * @module plfoundation.layoutrow
 * 
 * @requires plfoundation.Layoutelement
 */
var Layoutrow = function (_Layoutelement) {
  _inherits(Layoutrow, _Layoutelement);

  function Layoutrow() {
    _classCallCheck(this, Layoutrow);

    return _possibleConstructorReturn(this, (Layoutrow.__proto__ || Object.getPrototypeOf(Layoutrow)).apply(this, arguments));
  }

  _createClass(Layoutrow, [{
    key: 'classname',
    get: function get() {
      return 'layoutrow';
    }
  }]);

  return Layoutrow;
}(Layoutelement);

//PLFoundation.plugin(Layoutrow, 'Layoutrow');


patternlibrary.plugin(Layoutrow, 'Layoutrow');
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Layouttoolbaraction module.
 * @module patternlibrary.layouttoolbaraction
 * 
 * @requires patternlibrary.Plugin
 * @requires foundation.Triggers
 */
var Layouttoolbaraction = function (_Plugin) {
  _inherits(Layouttoolbaraction, _Plugin);

  function Layouttoolbaraction() {
    _classCallCheck(this, Layouttoolbaraction);

    return _possibleConstructorReturn(this, (Layouttoolbaraction.__proto__ || Object.getPrototypeOf(Layouttoolbaraction)).apply(this, arguments));
  }

  _createClass(Layouttoolbaraction, [{
    key: '_setup',


    /**
     * Setup a new instance of a layouttoolbaraction.
     * @class
     * @name Layouttoolbaraction
     * @param {jQuery} element - jQuery object to make into a layouttoolbaraction.
     *        Object should be of the layouttoolbaraction panel, rather than its anchor.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    value: function _setup(element, options) {
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

  }, {
    key: '_init',
    value: function _init() {
      if (typeof this.options.type == 'undefined') {
        throw new LayoutbuilderException('no type given for toolbar action').toString();
      }
      if (this.options.type == 'action' && typeof this.options.action == 'undefined') {
        throw new LayoutbuilderException('no action-id given for toolbar action').toString();
      }

      this._events();
    }

    /**
     * Adds event listeners to the element utilizing the triggers utility library.
     * @function
     * @private
     */

  }, {
    key: '_events',
    value: function _events() {
      this._addInitHandler();
      if (this.options.events && typeof this.options.events.click == 'function') {
        this._addClickHandler(this.options.events.click);
      }
    }

    /**
     * Adds initialzation event listeners
     * @function
     * @private
     */

  }, {
    key: '_addInitHandler',
    value: function _addInitHandler() {
      var $this = this;
      this.$element.off('initialized.pl.layouttoolbaraction').on('initialized.pl.layouttoolbaraction', function (e) {
        e.stopPropagation();
        e.preventDefault();
        //$this._initItems.apply($this);
      });
    }
  }, {
    key: '_addClickHandler',
    value: function _addClickHandler(clickHandler) {
      if (clickHandler && typeof clickHandler == 'function') {
        this.$element.off('click.pl.layouttoolbaraction').on('click.pl.layouttoolbaraction', clickHandler);
      }
    }

    /**
     * generate initial markup
     * @function
     * @private
     */

  }, {
    key: 'toElement',


    /**
     * return initial markup elements
     * @function
     */
    value: function toElement(sectionconfig) {
      var currentOptions = this.options;
      this.options = $.extend({}, this.options, sectionconfig);
      var $element = $(this.toString());
      this.options = currentOptions;
      return $element;
    }

    /**
     * Destroys the layouttoolbaraction.
     * @function
     */

  }, {
    key: '_destroy',
    value: function _destroy() {
      this.$element.find('*').off('.pl.layouttoolbaraction');
      this.$element.off('.pl.layouttoolbaraction');
      this.$element.remove();
    }
  }, {
    key: '_markup',
    get: function get() {
      var html = ['<a class="button small" href="' + this.options.action + '" title="' + this.options.label + '" data-layouttoolbaraction>', '<i class="' + this.options.icon + '"></i>', '<span class="hide-for-small show-for-xxlarge"> ' + this.options.label + '</span>', '</a>'];

      return $(html.join(''));
    }
  }]);

  return Layouttoolbaraction;
}(Plugin);

patternlibrary.plugin(Layouttoolbaraction, 'Layouttoolbaraction');
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Layouttoolbarsection module.
 * @module plfoundation.layouttoolbarsection
 * 
 * @requires patternlibrary.Plugin
 * @requires foundation.Triggers
 */
var Layouttoolbarsection = function (_Plugin) {
  _inherits(Layouttoolbarsection, _Plugin);

  function Layouttoolbarsection() {
    _classCallCheck(this, Layouttoolbarsection);

    return _possibleConstructorReturn(this, (Layouttoolbarsection.__proto__ || Object.getPrototypeOf(Layouttoolbarsection)).apply(this, arguments));
  }

  _createClass(Layouttoolbarsection, [{
    key: '_setup',


    /**
     * Setup a new instance of a layouttoolbarsection.
     * @class
     * @name Layouttoolbarsection
     * @param {jQuery} element - jQuery object to make into a layouttoolbarsection.
     *        Object should be of the layouttoolbarsection panel, rather than its anchor.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    value: function _setup(element, options) {
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

  }, {
    key: '_init',


    /**
        * Initializes the plugin by setting/checking options and attributes, adding helper variables, and saving the anchor.
        * @function
        * @private
        */
    value: function _init() {
      this._events();
    }
  }, {
    key: '_initItems',
    value: function _initItems() {
      var _this3 = this;

      var $this = this;
      $.makeArray($(this.options.items).map(function (idx, item) {
        var $item;
        switch (item.type) {
          case 'separator':
            {
              $item = $(['<' + $this.options.itemcontainer.tag + ' class="menu-separator ' + $this.options.itemcontainer.classnames.join(' ') + '">', '<span>&nbsp;</span>', '</' + $this.options.itemcontainer.tag + '>'].join(''));
              break;
            }
          case 'action':
          default:
            {
              $item = $(['<' + $this.options.itemcontainer.tag + ' class="' + $this.options.itemcontainer.classnames.join(' ') + '" ' + $this.options.itemcontainer.attributes.join(' ') + '>', '</' + $this.options.itemcontainer.tag + '>'].join('')).append(Layouttoolbaraction.prototype.toElement(item));
            }
        }
        if ($item && $item.find('> a:first-child')) {
          $item.find('> a:first-child').data('patternlibraryPlugin', new Layouttoolbaraction($item.find('> a:first-child'), item));
          _this3._container.append($item);

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

  }, {
    key: '_events',
    value: function _events() {
      this._addInitHandler();
    }

    /**
     * Adds initialzation event listeners
     * @function
     * @private
     */

  }, {
    key: '_addInitHandler',
    value: function _addInitHandler() {
      var $this = this;
      this.$element.off('initialized.pl.layouttoolbarsection').on('initialized.pl.layouttoolbarsection', function (e) {
        if (patternlibrary.debug()) console.log('layouttoolbarsection init handler');
        e.stopPropagation();
        e.preventDefault();
        $this._addFocusHandler();
        $this._initItems.apply($this);
      });
    }
  }, {
    key: '_addClickHandler',
    value: function _addClickHandler() {
      var _this = this;

      var $fullscreenToggler = this.$element.find('[href="#switch_fullscreen"]');
      $fullscreenToggler.off('click.pl.layouttoolbarsection').on('click.pl.layouttoolbarsection', function (e) {
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

  }, {
    key: '_addFocusHandler',
    value: function _addFocusHandler() {
      var _this = this;

      var $builder = this._builder;
      if (patternlibrary.debug()) console.log('layouttoolbarsection element focus handler builder:', $builder);
      if ($('[data-layoutbuilder]')) {
        $('[data-layoutbuilder]').off('focused.pl.layoutelement').on('focused.pl.layoutelement', '[data-layoutrow],[data-layoutcolumn]', function (e) {

          if (patternlibrary.debug()) console.log('layouttoolbarsection element focus handler:', this, e);
          _this.$element.trigger('focuschange.pl.layouttoolbarsection');

          if (_this._builder instanceof Layoutbuilder) {
            _this._builder.switchToolbarsections.apply(_this, [e.currentTarget]);
          }

          e.preventDefault();
          e.stopPropagation();
        });
        $('[data-layoutbuilder').off('unfocused.pl.layoutelement').on('unfocused.pl.layoutelement', '[data-layoutrow],[data-layoutcolumn]', function (e) {

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

  }, {
    key: 'toElement',


    /**
     * return initial markup elements
     * @function
     */
    value: function toElement(sectionconfig) {
      var currentOptions = this.options;
      this.options = $.extend({}, Layouttoolbarsection.defaults, this.options, sectionconfig);
      var $element = $(this.toString());
      this.options = currentOptions;
      return $element;
    }

    /**
     * Destroys the layouttoolbarsection.
     * @function
     */

  }, {
    key: '_destroy',
    value: function _destroy() {
      this.$element.find('*').off('.pl.layouttoolbarsection');
      this.$element.off('.pl.layouttoolbarsection');
      this.$element.remove();
    }
  }, {
    key: '_container',
    get: function get() {
      return this.$element.find('> ' + this.options.sectioncontainer.tag);
    }
  }, {
    key: '_markup',
    get: function get() {
      var html = ['<div data-layouttoolbarsection rel="' + this.options.name + '">', '<' + this.options.sectioncontainer.tag + ' class="' + this.options.sectioncontainer.classnames.join(' ') + '" ' + this.options.sectioncontainer.attributes.join(' ') + '>', '<li class="' + this.options.sectioncontainer.label.classnames.join(' ') + '" role="menuitem">' + ucfirst(this.options.name) + ':</li>',
      // items follow here...
      '</' + this.options.sectioncontainer.tag + '>', '</div>'];

      return $(html.join(''));
    }
  }]);

  return Layouttoolbarsection;
}(Plugin);

Layouttoolbarsection.defaults = {

  sectioncontainer: {
    tag: 'ul',
    classnames: ['dropdown', 'menu'],
    attributes: ['data-dropdown-menu'],
    label: {
      classnames: ['menu-text']
    }
  },
  itemcontainer: {
    tag: 'li',
    classnames: [],
    attributes: ['role="menuitem"']
  }
};

patternlibrary.plugin(Layouttoolbarsection, 'Layouttoolbarsection');
'use strict';

/**
 * initialize modal XHR triggers and watch for modal XHR forms
 */
;(function ($, window, document, patternlibrary, undefined) {
    'use strict';

    if (typeof $.fn.modal == 'undefined' && typeof PLFoundation.Reveal == 'undefined') {
        console.warn('jQuery Modal and/or PLFoundation Reveal plug-ins not found...');
        return;
    }
    var $body = $(document),
        $ajaxButtons = patternlibrary.Config.xhrSelectors.xhrButtons,
        // "A.btn[href*='add'], A.btn[href*='edit'], A.btn[href*='details'], A.btn[href*='delete']",
    $ajaxCTAOpen = patternlibrary.Config.xhrSelectors.xhrCTAOpen,
        // "A.btn-cta-xhr.cta-xhr-modal",
    $ajaxCTAClose = patternlibrary.Config.xhrSelectors.xhrCTAClose,
        // ".modal-content .btn-cta-xhr-close, .modal-content .alert, .modal-content .close, .modal-content .cta-xhr-modal-close",
    $ajaxForms = patternlibrary.Config.xhrSelectors.xhrForms // ".modal-content .form-xhr"
    ;

    //
    // modal triggers
    //
    var handler_initXHRModalTrigger = function handler_initXHRModalTrigger(oEvent) {

        var $this = $(this),
            $btnUrl = $this.attr('href');

        $.ajax({
            headers: {
                'Accept': 'text/html',
                'X-layout': 'modal'
            },
            type: "GET",
            cache: false,
            url: $this.attr('href'),
            success: function success(data) {

                patternlibrary.Modal.open(data, $btnUrl);

                if (typeof $.fn.dataTable != 'undefiened') {
                    $('.datatable.crud').dataTable().api().ajax.reload(function (tabledata) {
                        // console.log( tabledata );
                    }, true);
                }
            }
        });

        oEvent.preventDefault();
        oEvent.stopPropagation();
        oEvent.stopImmediatePropagation();
        return false;
    };

    //
    // modal forms
    //
    var handler_initXHRModalForm = function handler_initXHRModalForm(oEvent) {
        var $form = $(this),
            formURL = $form.attr('action'),
            formData = $form.serializeArray();

        formData.push($form.find('input[name=del].btn').size() > 0 ? { name: 'del', value: 'delete' } : null);

        $.ajax({
            headers: {
                'Accept': 'text/html',
                'X-layout': 'modal'
            },
            type: "POST",
            cache: false,
            url: formURL,
            data: formData,
            success: function success(data) {

                patternlibrary.Modal.close();
                patternlibrary.Modal.open(data, formURL);

                if (typeof $.fn.dataTable != 'undefiened') {
                    $('.datatable.crud').dataTable().api().ajax.reload(function (tabledata) {
                        // console.log( tabledata );
                    }, true);
                }
            }
        });

        oEvent.preventDefault();
        oEvent.stopPropagation();
        oEvent.stopImmediatePropagation();
        return false;
    };

    //
    // modal close
    //
    var handler_closeModal = function handler_closeModal(oEvent) {
        try {
            patternlibrary.Modal.close();
        } catch (e) {}

        oEvent.preventDefault();
        oEvent.stopPropagation();
        oEvent.stopImmediatePropagation();
        return false;
    };

    //
    // watch DOM elements
    //
    $body.on('click.patternlibrary.xhrmodalopen', $ajaxCTAOpen, {}, handler_initXHRModalTrigger);
    $body.on('submit.patternlibrary.xhrmodalsubmit', $ajaxForms, {}, handler_initXHRModalForm);
    $body.on('click.patternlibrary.xhrmodalclose', $ajaxCTAClose, {}, handler_closeModal);

    $(document).ready(function () {
        $($ajaxCTAOpen).on('click.patternlibrary.xhrmodalopen', handler_initXHRModalTrigger);
        $($ajaxForms).on('submit.patternlibrary.xhrmodalsubmit', handler_initXHRModalForm);
        $($ajaxCTAClose).on('click.patternlibrary.xhrmodalclose', handler_closeModal);
    });
})(jQuery, window, document, window.patternlibrary);
'use strict';

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
        $lang = patternlibrary.Config.lang;
    patternlibrary.Config.debug = true;

    //window.ontouchmove = function() { return false; }
    //window.onorientationchange = function() { document.body.scrollTop = 0; }  

    //
    // init patternlibrary (frontent)
    //
    $doc.ready(function () {

        $(document).plfoundation().patternlibrary();

        //$doc.patternlibrary();
    });
})(jQuery, document, window, patternlibrary);
"use strict";

$(document).ready(function () {
    // ...
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhdHRlcm5saWJyYXJ5LmNvcmUuanMiLCJwYXR0ZXJubGlicmFyeS5jb25maWcuanMiLCJkb2NzLnNlYXJjaC5qcyIsIm1lZGlhUXVlcnkuanMiLCJtb2RhbC5qcyIsIndpbmRvd2hyZWYuanMiLCJwbHVnaW4vcGx1Z2luLm1vZHVsZS5qcyIsImxheW91dGJ1aWxkZXIubW9kdWxlLmpzIiwibGF5b3V0YnVpbGRlci5sYXlvdXRib2R5LmpzIiwibGF5b3V0YnVpbGRlci5sYXlvdXR0b29sYmFyc2VjdGlvbi5idWlsZGVyLmpzIiwibGF5b3V0YnVpbGRlci5sYXlvdXR0b29sYmFyc2VjdGlvbi5sYXlvdXRjb2x1bW4uanMiLCJsYXlvdXRidWlsZGVyLmxheW91dHRvb2xiYXJzZWN0aW9uLmxheW91dHJvdy5qcyIsImxheW91dGJ1aWxkZXIubGF5b3V0dG9vbGJhcnNlY3Rpb24ucGF0dGVybi5qcyIsImxheW91dGJ1aWxkZXIubGF5b3V0dG9vbGJhci5qcyIsImxheW91dGJ1aWxkZXIubGF5b3V0ZWxlbWVudC5qcyIsImxheW91dGJ1aWxkZXIuZXhjZXB0aW9uLmpzIiwibGF5b3V0YnVpbGRlci5sYXlvdXRjb2x1bW4uanMiLCJsYXlvdXRidWlsZGVyLmxheW91dGVsZW1lbnRkcmFndHJpZ2dlci5qcyIsImxheW91dGJ1aWxkZXIubGF5b3V0ZWxlbWVudHRvb2xiYXIuanMiLCJsYXlvdXRidWlsZGVyLmxheW91dHBhdHRlcm4uanMiLCJsYXlvdXRidWlsZGVyLmxheW91dHJvdy5qcyIsImxheW91dGJ1aWxkZXIubGF5b3V0dG9vbGJhcmFjdGlvbi5qcyIsImxheW91dGJ1aWxkZXIubGF5b3V0dG9vbGJhcnNlY3Rpb24uanMiLCJhcHBsaWNhdGlvbi1jdGEteGhyLW1vZGFscy5qcyIsInBhdHRlcm5saWJyYXJ5LmluaXQuanMiLCJhcHAuanMiXSwibmFtZXMiOlsicGF0dGVybmxpYnJhcnkiLCIkIiwicGF0dGVybmxpYnJhcnlfVkVSU0lPTiIsInZlcnNpb24iLCJfcGx1Z2lucyIsIl91dWlkcyIsImRlYnVnIiwiQ29uZmlnIiwibGVuZ3RoIiwicnRsIiwiYXR0ciIsInBsdWdpbiIsIm5hbWUiLCJjbGFzc05hbWUiLCJmdW5jdGlvbk5hbWUiLCJhdHRyTmFtZSIsImh5cGhlbmF0ZSIsInJlZ2lzdGVyUGx1Z2luIiwicGx1Z2luTmFtZSIsImNvbnN0cnVjdG9yIiwidG9Mb3dlckNhc2UiLCJ1dWlkIiwiR2V0WW9EaWdpdHMiLCIkZWxlbWVudCIsImRhdGEiLCJ0cmlnZ2VyIiwicHVzaCIsInVucmVnaXN0ZXJQbHVnaW4iLCJzcGxpY2UiLCJpbmRleE9mIiwicmVtb3ZlQXR0ciIsInJlbW92ZURhdGEiLCJwcm9wIiwicmVJbml0IiwicGx1Z2lucyIsImlzSlEiLCJlYWNoIiwiX2luaXQiLCJ0eXBlIiwiX3RoaXMiLCJmbnMiLCJwbGdzIiwiZm9yRWFjaCIsInAiLCJPYmplY3QiLCJrZXlzIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwibmFtZXNwYWNlIiwiTWF0aCIsInJvdW5kIiwicG93IiwicmFuZG9tIiwidG9TdHJpbmciLCJzbGljZSIsInJlZmxvdyIsImVsZW0iLCJpIiwiJGVsZW0iLCJmaW5kIiwiYWRkQmFjayIsIiRlbCIsIm9wdHMiLCJ3YXJuIiwidGhpbmciLCJzcGxpdCIsImUiLCJvcHQiLCJtYXAiLCJlbCIsInRyaW0iLCJwYXJzZVZhbHVlIiwiZXIiLCJnZXRGbk5hbWUiLCJ0cmFuc2l0aW9uZW5kIiwidHJhbnNpdGlvbnMiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJlbmQiLCJ0Iiwic3R5bGUiLCJzZXRUaW1lb3V0IiwidHJpZ2dlckhhbmRsZXIiLCJsaWJzIiwidXRpbCIsInRocm90dGxlIiwiZnVuYyIsImRlbGF5IiwidGltZXIiLCJjb250ZXh0IiwiYXJncyIsImFyZ3VtZW50cyIsImFwcGx5Iiwic2l0ZWFwcCIsIm1ldGhvZCIsIiRtZXRhIiwiJG5vSlMiLCJhcHBlbmRUbyIsImhlYWQiLCJyZW1vdmVDbGFzcyIsImFkZENsYXNzIiwiUExGb3VuZGF0aW9uIiwiTWVkaWFRdWVyeSIsIkFycmF5IiwicHJvdG90eXBlIiwiY2FsbCIsInBsdWdDbGFzcyIsInVuZGVmaW5lZCIsIlJlZmVyZW5jZUVycm9yIiwiVHlwZUVycm9yIiwid2luZG93IiwiZm4iLCJqUXVlcnkiLCJEYXRlIiwibm93IiwiZ2V0VGltZSIsInZlbmRvcnMiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJ2cCIsImNhbmNlbEFuaW1hdGlvbkZyYW1lIiwidGVzdCIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsImxhc3RUaW1lIiwiY2FsbGJhY2siLCJuZXh0VGltZSIsIm1heCIsImNsZWFyVGltZW91dCIsInBlcmZvcm1hbmNlIiwic3RhcnQiLCJGdW5jdGlvbiIsImJpbmQiLCJvVGhpcyIsImFBcmdzIiwiZlRvQmluZCIsImZOT1AiLCJmQm91bmQiLCJjb25jYXQiLCJmdW5jTmFtZVJlZ2V4IiwicmVzdWx0cyIsImV4ZWMiLCJzdHIiLCJpc05hTiIsInBhcnNlRmxvYXQiLCJyZXBsYWNlIiwiZ2V0UGx1Z2luTmFtZSIsIm9iaiIsInVjZmlyc3QiLCJzdHJpbmciLCJjaGFyQXQiLCJ0b1VwcGVyQ2FzZSIsInJlbmRlcmVyIiwibGFuZyIsInhoclNlbGVjdG9ycyIsInhockJ1dHRvbnMiLCJ4aHJDVEFPcGVuIiwieGhyQ1RBQ2xvc2UiLCJ4aHJGb3JtcyIsIm1vZGFscyIsImJvb3RzdHJhcEVsZW1lbnRDbGFzc25hbWUiLCJwbGZvdW5kYXRpb25FbGVtZW50Q2xhc3NuYW1lIiwiZGF0YVRhYmxlIiwibGFuZ1VSTHMiLCJzdGF0ZVNhdmUiLCJzdGF0ZUR1cmF0aW9uIiwic2VhcmNoU291cmNlIiwibGltaXQiLCJzb3VyY2UiLCJxdWVyeSIsInN5bmMiLCJhc3luYyIsImdldEpTT04iLCJzdGF0dXMiLCJmaWx0ZXIiLCJhcnIiLCJ0ZXJtcyIsInRhZ3MiLCJkaXNwbGF5IiwiaXRlbSIsInRlbXBsYXRlcyIsIm5vdEZvdW5kIiwic3VnZ2VzdGlvbiIsImRlc2NyaXB0aW9uIiwicmVhZHkiLCJsb2ciLCJ0eXBlYWhlYWQiLCJoaWdobGlnaHQiLCJzZWwiLCJsaW5rVXJsIiwiU3RyaW5nIiwibGluayIsImxvY2F0aW9uIiwiaHJlZiIsIm1hdGNoIiwiZm9jdXMiLCJkZWZhdWx0UXVlcmllcyIsImxhbmRzY2FwZSIsInBvcnRyYWl0IiwicmV0aW5hIiwicXVlcmllcyIsImN1cnJlbnQiLCJhdExlYXN0Iiwic2l6ZSIsImdldCIsIm1hdGNoTWVkaWEiLCJtYXRjaGVzIiwidmFsdWUiLCJzZWxmIiwiZXh0cmFjdGVkU3R5bGVzIiwiY3NzIiwibmFtZWRRdWVyaWVzIiwicGFyc2VTdHlsZVRvT2JqZWN0Iiwia2V5IiwiX2dldEN1cnJlbnRTaXplIiwiX3dhdGNoZXIiLCJtYXRjaGVkIiwib24iLCJuZXdTaXplIiwic3R5bGVNZWRpYSIsIm1lZGlhIiwic2NyaXB0IiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJpbmZvIiwiaWQiLCJwYXJlbnROb2RlIiwiaW5zZXJ0QmVmb3JlIiwiZ2V0Q29tcHV0ZWRTdHlsZSIsImN1cnJlbnRTdHlsZSIsIm1hdGNoTWVkaXVtIiwidGV4dCIsInN0eWxlU2hlZXQiLCJjc3NUZXh0IiwidGV4dENvbnRlbnQiLCJ3aWR0aCIsInN0eWxlT2JqZWN0IiwicmVkdWNlIiwicmV0IiwicGFyYW0iLCJwYXJ0cyIsInZhbCIsImRlY29kZVVSSUNvbXBvbmVudCIsImhhc093blByb3BlcnR5IiwiaXNBcnJheSIsIm1vZGFsIiwic2V0dGluZ3MiLCJvcGVuIiwidXBkYXRlV2luZG93SHJlZiIsIlJldmVhbCIsIiRtb2RhbCIsImFwcGVuZCIsInJldmVhbE9wdGlvbnMiLCJtb2RhbERhdGEiLCJtIiwiaHRtbCIsInBsZm91bmRhdGlvbiIsIk1vZGFsIiwiY2xvc2UiLCIkbW9kYWxEZWZhdWx0cyIsInNob3ciLCJXaW5kb3dIcmVmIiwicmVzZXQiLCJfb2xkX2hyZWYiLCJoaXN0b3J5IiwicHVzaFN0YXRlIiwidGl0bGUiLCJoaWRlIiwicmVtb3ZlIiwid2luZG93aHJlZiIsImluaXQiLCJzY29wZSIsIm9wdGlvbnMiLCJ1cGRhdGUiLCJ1cmwiLCJjbGVhciIsImNsZWFyT2xkSHJlZiIsIlBsdWdpbiIsImVsZW1lbnQiLCJfc2V0dXAiLCJfZGVzdHJveSIsIl9tYXJrdXAiLCJmaXJzdCIsIl9ib2R5Iiwiam9pbiIsIkxheW91dGJ1aWxkZXIiLCJleHRlbmQiLCJkZWZhdWx0cyIsIlRyaWdnZXJzIiwiY2hpbGRyZW4iLCJfY2hlY2tEZWVwTGluayIsIl9ldmVudHMiLCJfaW5pdFRvb2xiYXIiLCJfaW5pdERvY3VtZW50Ym9keSIsIiR0b29sYmFyIiwicHJlcGVuZCIsIkxheW91dHRvb2xiYXIiLCJ0b0VsZW1lbnQiLCJfdG9vbGJhciIsIl9hZGRLZXlIYW5kbGVyIiwiX2FkZENsaWNrSGFuZGxlciIsIl9zZXRNcUhhbmRsZXIiLCJkZWVwTGluayIsIm9mZiIsInN3aXRjaFRvb2xiYXJzZWN0aW9ucyIsImN1cnJlbnRUYXJnZXQiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsImZvY3VzZWRfZWxlbWVudCIsIiRmb2N1cyIsIkxheW91dGVsZW1lbnQiLCJzd2l0Y2hTZWN0aW9uIiwiY2xhc3NuYW1lIiwid2hpY2giLCJLZXlib2FyZCIsImhhbmRsZUtleSIsImV2ZW50IiwiaGFuZGxlZCIsInJlZ2lzdGVyIiwiYWN0aXZlRWxlbWVudCIsImJsdXIiLCJhbmNob3IiLCJoYXNoIiwiJGxpbmsiLCJib2R5IiwiY2xhc3NDb2xQcmVmaXgiLCJjbGFzc1JvdyIsImNsYXNzU2l6ZXMiLCJjb2x1bW5NYXgiLCJMYXlvdXRidWlsZGVyQ2xpY2tkdW1teSIsIiR0aGlzIiwiTGF5b3V0Ym9keSIsIl9hZGRGdWxsc2NyZWVuSGFuZGxlciIsImhhc0NsYXNzIiwic3dpdGNoIiwic3dpdGNoRnVsbHNjcmVlbiIsIkxheW91dHRvb2xiYXJzZWN0aW9uQnVpbGRlciIsIml0ZW1zIiwibGFiZWwiLCJhY3Rpb24iLCJpY29uIiwiZXZlbnRzIiwiY2xpY2siLCJfbGF5b3V0Ym9keSIsIkxheW91dHRvb2xiYXJzZWN0aW9uTGF5b3V0Y29sdW1uIiwiTGF5b3V0dG9vbGJhcnNlY3Rpb25MYXlvdXRyb3ciLCJMYXlvdXR0b29sYmFyc2VjdGlvblBhdHRlcm4iLCJoaWRlU2VjdGlvbnMiLCJfYWRkSW5pdEhhbmRsZXIiLCJfaW5pdFNlY3Rpb25zIiwic2VjdGlvbnMiLCJpZHgiLCJzZWN0aW9uY29uZmlnIiwiX2luaXRTZWN0aW9uIiwiTGF5b3V0dG9vbGJhcnNlY3Rpb24iLCIkc2VjdGlvbiIsIl9zZWN0aW9ucyIsIl9zZWN0aW9uIiwic2VjdGlvbiIsIl9idWlsZGVyU2VjdGlvbiIsInJlZmVyZW5jZSIsImJ1aWxkZXJTZWN0aW9uIiwiZGVmaW5lIiwicmVxdWlyZSIsImV4cG9ydHMiLCJtb2R1bGUiLCJfYWRkRm9jdXNIYW5kbGVyIiwiX2RyYWd0cmlnZ2VyIiwiX2VsZW1lbnR0b29sYmFyIiwiTGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyIiwiX2luaXREcmFndHJpZ2dlciIsIkxheW91dGVsZW1lbnR0b29sYmFyIiwiX2luaXRFbGVtZW50dG9vbGJhciIsImRlc3Ryb3kiLCJmb2N1c0NsYXNzbmFtZSIsIl9mb2N1c0xheW91dGVsZW1lbnQiLCIkdG9vbGJhcnNlY3Rpb24iLCJhY3RpdmVDbGFzc25hbWUiLCJMYXlvdXRidWlsZGVyRXhjZXB0aW9uIiwibWVzc2FnZSIsImNvZGUiLCJMYXlvdXRjb2x1bW4iLCIkbGF5b3V0ZWxlbWVudCIsInBhcmVudCIsIkxheW91dHBhdHRlcm4iLCJMYXlvdXRyb3ciLCJMYXlvdXR0b29sYmFyYWN0aW9uIiwiY2xpY2tIYW5kbGVyIiwiY3VycmVudE9wdGlvbnMiLCJtYWtlQXJyYXkiLCIkaXRlbSIsIml0ZW1jb250YWluZXIiLCJ0YWciLCJjbGFzc25hbWVzIiwiYXR0cmlidXRlcyIsIl9jb250YWluZXIiLCJfaW5pdEl0ZW1zIiwiJGZ1bGxzY3JlZW5Ub2dnbGVyIiwiJGxheW91dGJvZHkiLCIkYnVpbGRlciIsIl9idWlsZGVyIiwic2VjdGlvbmNvbnRhaW5lciIsIiRib2R5IiwiJGFqYXhCdXR0b25zIiwiJGFqYXhDVEFPcGVuIiwiJGFqYXhDVEFDbG9zZSIsIiRhamF4Rm9ybXMiLCJoYW5kbGVyX2luaXRYSFJNb2RhbFRyaWdnZXIiLCJvRXZlbnQiLCIkYnRuVXJsIiwiYWpheCIsImhlYWRlcnMiLCJjYWNoZSIsInN1Y2Nlc3MiLCJhcGkiLCJyZWxvYWQiLCJ0YWJsZWRhdGEiLCJzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24iLCJoYW5kbGVyX2luaXRYSFJNb2RhbEZvcm0iLCIkZm9ybSIsImZvcm1VUkwiLCJmb3JtRGF0YSIsInNlcmlhbGl6ZUFycmF5IiwiaGFuZGxlcl9jbG9zZU1vZGFsIiwic3RvcCIsImRvYyIsIndpbiIsIiRkb2MiLCIkbGFuZyJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0EsSUFBSSxDQUFDQSxjQUFMLEVBQXFCO0FBQ2pCLFFBQUlBLGlCQUFpQixFQUFyQjtBQUNIOztBQUVEOzs7Ozs7Ozs7Ozs7O0FBYUEsQ0FBQyxVQUFTQyxDQUFULEVBQVk7QUFDYjs7QUFHSSxRQUFJQyx5QkFBeUIsT0FBN0I7O0FBRUE7QUFDQTtBQUNBLFFBQUlGLGlCQUFpQjtBQUNqQkcsaUJBQVNELHNCQURROztBQUdqQjs7O0FBR0FFLGtCQUFVLEVBTk87O0FBUWpCOzs7QUFHQUMsZ0JBQVEsRUFYUzs7QUFhakI7OztBQUdBQyxlQUFPLGlCQUFVO0FBQ2IsbUJBQU8sS0FBS0MsTUFBTCxDQUFZRCxLQUFaLElBQXNCTCxFQUFFLFVBQUYsRUFBY08sTUFBZCxHQUF1QixDQUFwRDtBQUNILFNBbEJnQjs7QUFvQmpCOzs7QUFHQUMsYUFBSyxlQUFVO0FBQ1gsbUJBQU9SLEVBQUUsTUFBRixFQUFVUyxJQUFWLENBQWUsS0FBZixNQUEwQixLQUFqQztBQUNILFNBekJnQjs7QUEyQmpCOzs7Ozs7QUFNQUMsZ0JBQVEsZ0JBQVNBLE9BQVQsRUFBaUJDLElBQWpCLEVBQXVCO0FBQzNCO0FBQ0E7QUFDQSxnQkFBSUMsWUFBYUQsUUFBUUUsYUFB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RUFBaUIzTCxFQUFqQixDQUFvQixvQ0FBcEIsRUFBMEQ2TSxrQkFBMUQ7QUFDSCxLQUpEO0FBTUgsQ0F2SEEsRUF1SEVyVCxNQXZIRixFQXVIVUYsTUF2SFYsRUF1SGtCbEMsUUF2SGxCLEVBdUg0QmtDLE9BQU8vRyxjQXZIbkM7OztBQ0hEOzs7Ozs7Ozs7Ozs7O0FBYUEsSUFBSSxDQUFDaUgsTUFBTCxFQUFhO0FBQ1RsRSxZQUFRQyxLQUFSLENBQWMscUJBQWQ7QUFDQStELFdBQU93VCxJQUFQO0FBQ0g7O0FBRUQsSUFBSSxDQUFDdGEsRUFBRStHLEVBQUYsQ0FBSytJLFlBQVYsRUFBd0I7QUFDcEJoTixZQUFRQyxLQUFSLENBQWMsMkJBQWQ7QUFDQStELFdBQU93VCxJQUFQO0FBQ0g7O0FBRUQsQ0FBQyxVQUFVdGEsQ0FBVixFQUFhdWEsR0FBYixFQUFrQkMsR0FBbEIsRUFBdUJ6YSxjQUF2QixFQUF1Qzs7QUFFcEMsUUFBSTBhLE9BQU96YSxFQUFFdWEsR0FBRixDQUFYO0FBQUEsUUFDSUcsUUFBUTNhLGVBQWVPLE1BQWYsQ0FBc0JrSixJQURsQztBQUdBekosbUJBQWVPLE1BQWYsQ0FBc0JELEtBQXRCLEdBQThCLElBQTlCOztBQUVIO0FBQ0E7O0FBRUc7QUFDQTtBQUNBO0FBQ0FvYSxTQUFLbFAsS0FBTCxDQUFXLFlBQVk7O0FBRXRCdkwsVUFBRTRFLFFBQUYsRUFDS2tMLFlBREwsR0FFSy9QLGNBRkw7O0FBS0E7QUFFQSxLQVREO0FBV0gsQ0F4QkQsRUF3QkdpSCxNQXhCSCxFQXdCV3BDLFFBeEJYLEVBd0JxQmtDLE1BeEJyQixFQXdCNkIvRyxjQXhCN0I7OztBQ3ZCQUMsRUFBRTRFLFFBQUYsRUFBWTJHLEtBQVosQ0FBa0IsWUFBWTtBQUMxQjtBQUNILENBRkQiLCJmaWxlIjoicGF0dGVybmxpYnJhcnktZnJvbnRlbmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQHZhciAgb2JqZWN0ICBwYXR0ZXJubGlicmFyeSAgZ2xvYmFsIHBhdHRlcm5saWJyYXJ5IG5hbWVzcGFjZSAqL1xuaWYgKCFwYXR0ZXJubGlicmFyeSkge1xuICAgIHZhciBwYXR0ZXJubGlicmFyeSA9IHt9O1xufVxuXG4vKipcbiAqIHRoZW1lIGJhc2Ugc2V0dXAgKFp1cmIgUExGb3VuZGF0aW9uKVxuICogXG4gKiBwYXR0ZXJubGlicmFyeSBjbGllbnQgKGluaXQtKXNjcmlwdFxuICogICAgIFxuICogQHBhY2thZ2UgICAgIFtwYXR0ZXJubGlicmFyeV1cbiAqIEBzdWJwYWNrYWdlICB0aGVtZSBiYXNlIHNldHVwIChadXJiIFBMRm91bmRhdGlvbilcbiAqIEBzdWJwYWNrYWdlICBwYXR0ZXJubGlicmFyeSBjbGllbnQgc2NyaXB0XG4gKiBAYXV0aG9yICAgICAgQmrDtnJuIEJhcnRlbHMgPGNvZGluZ0Biam9lcm5iYXJ0ZWxzLmVhcnRoPlxuICogQGxpbmsgICAgICAgIGh0dHBzOi8vZ2l0bGFiLmJqb2VybmJhcnRlbHMuZWFydGgvanMvcGF0dGVybmxpYnJhcnlcbiAqIEBsaWNlbnNlICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjAgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wXG4gKiBAY29weXJpZ2h0ICAgY29weXJpZ2h0IChjKSAyMDE2IEJqw7ZybiBCYXJ0ZWxzIDxjb2RpbmdAYmpvZXJuYmFydGVscy5lYXJ0aD5cbiAqL1xuIWZ1bmN0aW9uKCQpIHtcblwidXNlIHN0cmljdFwiO1xuXG4gICAgXG4gICAgdmFyIHBhdHRlcm5saWJyYXJ5X1ZFUlNJT04gPSAnMC4wLjEnO1xuICAgIFxuICAgIC8vIEdsb2JhbCBbcGF0dGVybmxpYnJhcnldIG9iamVjdFxuICAgIC8vIFRoaXMgaXMgYXR0YWNoZWQgdG8gdGhlIHdpbmRvdywgb3IgdXNlZCBhcyBhIG1vZHVsZSBmb3IgQU1EL0Jyb3dzZXJpZnlcbiAgICB2YXIgcGF0dGVybmxpYnJhcnkgPSB7XG4gICAgICAgIHZlcnNpb246IHBhdHRlcm5saWJyYXJ5X1ZFUlNJT04sXG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdG9yZXMgaW5pdGlhbGl6ZWQgcGx1Z2lucy5cbiAgICAgICAgICovXG4gICAgICAgIF9wbHVnaW5zOiB7fSxcbiAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0b3JlcyBnZW5lcmF0ZWQgdW5pcXVlIGlkcyBmb3IgcGx1Z2luIGluc3RhbmNlc1xuICAgICAgICAgKi9cbiAgICAgICAgX3V1aWRzOiBbXSxcbiAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgYSBib29sZWFuIGZvciBSVEwgc3VwcG9ydFxuICAgICAgICAgKi9cbiAgICAgICAgZGVidWc6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5Db25maWcuZGVidWcgfHwgKCQoJy5wbGRlYnVnJykubGVuZ3RoID4gMCk7XG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyBhIGJvb2xlYW4gZm9yIFJUTCBzdXBwb3J0XG4gICAgICAgICAqL1xuICAgICAgICBydGw6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4gJCgnaHRtbCcpLmF0dHIoJ2RpcicpID09PSAncnRsJztcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZWZpbmVzIGEgW3BhdHRlcm5saWJyYXJ5XSBwbHVnaW4sIGFkZGluZyBpdCB0byB0aGUgYHBhdHRlcm5saWJyYXJ5YCBuYW1lc3BhY2UgXG4gICAgICAgICAqIGFuZCB0aGUgbGlzdCBvZiBwbHVnaW5zIHRvIGluaXRpYWxpemUgd2hlbiByZWZsb3dpbmcuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gVGhlIGNvbnN0cnVjdG9yIG9mIHRoZSBwbHVnaW4uXG4gICAgICAgICAqL1xuICAgICAgICBwbHVnaW46IGZ1bmN0aW9uKHBsdWdpbiwgbmFtZSkge1xuICAgICAgICAgICAgLy8gT2JqZWN0IGtleSB0byB1c2Ugd2hlbiBhZGRpbmcgdG8gZ2xvYmFsIHBhdHRlcm5saWJyYXJ5IG9iamVjdFxuICAgICAgICAgICAgLy8gRXhhbXBsZXM6IHBhdHRlcm5saWJyYXJ5Lk9iamVjdDEsIHBhdHRlcm5saWJyYXJ5Lk9iamVjdDJcbiAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSAobmFtZSB8fCBmdW5jdGlvbk5hbWUocGx1Z2luKSk7XG4gICAgICAgICAgICAvLyBPYmplY3Qga2V5IHRvIHVzZSB3aGVuIHN0b3JpbmcgdGhlIHBsdWdpbiwgYWxzbyB1c2VkIHRvIGNyZWF0ZSB0aGVcbiAgICAgICAgICAgIC8vIGlkZW50aWZ5aW5nIGRhdGEgYXR0cmlidXRlIGZvciB0aGUgcGx1Z2luXG4gICAgICAgICAgICAvLyBFeGFtcGxlczogZGF0YS1vYmplY3R0cmlnZ2VybmFtZTEsIGRhdGEtb2JqZWN0dHJpZ2dlcm5hbWUyXG4gICAgICAgICAgICB2YXIgYXR0ck5hbWUgICAgPSBoeXBoZW5hdGUoY2xhc3NOYW1lKTtcbiAgICBcbiAgICAgICAgICAgIC8vIEFkZCB0byB0aGUgcGF0dGVybmxpYnJhcnkgb2JqZWN0IGFuZCB0aGUgcGx1Z2lucyBsaXN0IChmb3IgcmVmbG93aW5nKVxuICAgICAgICAgICAgdGhpcy5fcGx1Z2luc1thdHRyTmFtZV0gPSB0aGlzW2NsYXNzTmFtZV0gPSBwbHVnaW47XG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgICAqIFBvcHVsYXRlcyB0aGUgX3V1aWRzIGFycmF5IHdpdGggcG9pbnRlcnMgdG8gZWFjaCBpbmRpdmlkdWFsIHBsdWdpbiBpbnN0YW5jZS5cbiAgICAgICAgICogQWRkcyB0aGUgYHBhdHRlcm5saWJyYXJ5UGx1Z2luYCBkYXRhLWF0dHJpYnV0ZSB0byBwcm9ncmFtbWF0aWNhbGx5IGNyZWF0ZWQgcGx1Z2lucyBcbiAgICAgICAgICogdG8gYWxsb3cgdXNlIG9mICQoc2VsZWN0b3IpLnBhdHRlcm5saWJyYXJ5KG1ldGhvZCkgY2FsbHMuXG4gICAgICAgICAqIEFsc28gZmlyZXMgdGhlIGluaXRpYWxpemF0aW9uIGV2ZW50IGZvciBlYWNoIHBsdWdpbiwgY29uc29saWRhdGluZyByZXBlZGl0aXZlIGNvZGUuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gYW4gaW5zdGFuY2Ugb2YgYSBwbHVnaW4sIHVzdWFsbHkgYHRoaXNgIGluIGNvbnRleHQuXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gdGhlIG5hbWUgb2YgdGhlIHBsdWdpbiwgcGFzc2VkIGFzIGEgY2FtZWxDYXNlZCBzdHJpbmcuXG4gICAgICAgICAqIEBmaXJlcyBQbHVnaW4jaW5pdFxuICAgICAgICAgKi9cbiAgICAgICAgcmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uKHBsdWdpbiwgbmFtZSl7XG4gICAgICAgICAgICB2YXIgcGx1Z2luTmFtZSA9IG5hbWUgPyBoeXBoZW5hdGUobmFtZSkgOiBmdW5jdGlvbk5hbWUocGx1Z2luLmNvbnN0cnVjdG9yKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgcGx1Z2luLnV1aWQgPSB0aGlzLkdldFlvRGlnaXRzKDYsIHBsdWdpbk5hbWUpO1xuICAgIFxuICAgICAgICAgICAgaWYoIXBsdWdpbi4kZWxlbWVudC5hdHRyKCdkYXRhLScgKyBwbHVnaW5OYW1lKSl7IHBsdWdpbi4kZWxlbWVudC5hdHRyKCdkYXRhLScgKyBwbHVnaW5OYW1lLCBwbHVnaW4udXVpZCk7IH1cbiAgICAgICAgICAgIGlmKCFwbHVnaW4uJGVsZW1lbnQuZGF0YSgncGF0dGVybmxpYnJhcnlQbHVnaW4nKSl7IHBsdWdpbi4kZWxlbWVudC5kYXRhKCdwYXR0ZXJubGlicmFyeVBsdWdpbicsIHBsdWdpbik7IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBpbml0aWFsaXplZC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEBldmVudCBQbHVnaW4jaW5pdFxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICBwbHVnaW4uJGVsZW1lbnQudHJpZ2dlcignaW5pdC5wYXR0ZXJubGlicmFyeS4nICsgcGx1Z2luTmFtZSk7XG4gICAgXG4gICAgICAgICAgICB0aGlzLl91dWlkcy5wdXNoKHBsdWdpbi51dWlkKTtcbiAgICBcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAgICogUmVtb3ZlcyB0aGUgcGx1Z2lucyB1dWlkIGZyb20gdGhlIF91dWlkcyBhcnJheS5cbiAgICAgICAgICogUmVtb3ZlcyB0aGUgemZQbHVnaW4gZGF0YSBhdHRyaWJ1dGUsIGFzIHdlbGwgYXMgdGhlIGRhdGEtcGx1Z2luLW5hbWUgYXR0cmlidXRlLlxuICAgICAgICAgKiBBbHNvIGZpcmVzIHRoZSBkZXN0cm95ZWQgZXZlbnQgZm9yIHRoZSBwbHVnaW4sIGNvbnNvbGlkYXRpbmcgcmVwZWRpdGl2ZSBjb2RlLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIGFuIGluc3RhbmNlIG9mIGEgcGx1Z2luLCB1c3VhbGx5IGB0aGlzYCBpbiBjb250ZXh0LlxuICAgICAgICAgKiBAZmlyZXMgUGx1Z2luI2Rlc3Ryb3llZFxuICAgICAgICAgKi9cbiAgICAgICAgdW5yZWdpc3RlclBsdWdpbjogZnVuY3Rpb24ocGx1Z2luKXtcbiAgICAgICAgICAgIHZhciBwbHVnaW5OYW1lID0gaHlwaGVuYXRlKGZ1bmN0aW9uTmFtZShwbHVnaW4uJGVsZW1lbnQuZGF0YSgncGF0dGVybmxpYnJhcnlQbHVnaW4nKS5jb25zdHJ1Y3RvcikpO1xuICAgIFxuICAgICAgICAgICAgdGhpcy5fdXVpZHMuc3BsaWNlKHRoaXMuX3V1aWRzLmluZGV4T2YocGx1Z2luLnV1aWQpLCAxKTtcbiAgICAgICAgICAgIHBsdWdpbi4kZWxlbWVudC5yZW1vdmVBdHRyKCdkYXRhLScgKyBwbHVnaW5OYW1lKS5yZW1vdmVEYXRhKCdwYXR0ZXJubGlicmFyeVBsdWdpbicpXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgYmVlbiBkZXN0cm95ZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgUGx1Z2luI2Rlc3Ryb3llZFxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAudHJpZ2dlcignZGVzdHJveWVkLnBhdHRlcm5saWJyYXJ5LicgKyBwbHVnaW5OYW1lKTtcbiAgICAgICAgICAgIGZvcih2YXIgcHJvcCBpbiBwbHVnaW4pe1xuICAgICAgICAgICAgICAgIHBsdWdpbltwcm9wXSA9IG51bGw7Ly9jbGVhbiB1cCBzY3JpcHQgdG8gcHJlcCBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9LFxuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgICAqIENhdXNlcyBvbmUgb3IgbW9yZSBhY3RpdmUgcGx1Z2lucyB0byByZS1pbml0aWFsaXplLCByZXNldHRpbmcgZXZlbnQgbGlzdGVuZXJzLCBcbiAgICAgICAgICogcmVjYWxjdWxhdGluZyBwb3NpdGlvbnMsIGV0Yy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwbHVnaW5zIC0gb3B0aW9uYWwgc3RyaW5nIG9mIGFuIGluZGl2aWR1YWwgcGx1Z2luIGtleSwgXG4gICAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0YWluZWQgYnkgY2FsbGluZyBgJChlbGVtZW50KS5kYXRhKCdwbHVnaW5OYW1lJylgLCBcbiAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBvciBzdHJpbmcgb2YgYSBwbHVnaW4gY2xhc3MgaS5lLiBgJ2Ryb3Bkb3duJ2BcbiAgICAgICAgICogQGRlZmF1bHQgSWYgbm8gYXJndW1lbnQgaXMgcGFzc2VkLCByZWZsb3cgYWxsIGN1cnJlbnRseSBhY3RpdmUgcGx1Z2lucy5cbiAgICAgICAgICovXG4gICAgICAgICByZUluaXQ6IGZ1bmN0aW9uKHBsdWdpbnMpe1xuICAgICAgICAgICAgIHZhciBpc0pRID0gcGx1Z2lucyBpbnN0YW5jZW9mICQ7XG4gICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgICBpZihpc0pRKXtcbiAgICAgICAgICAgICAgICAgICAgIHBsdWdpbnMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuZGF0YSgncGF0dGVybmxpYnJhcnlQbHVnaW4nKS5faW5pdCgpO1xuICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgcGx1Z2lucyxcbiAgICAgICAgICAgICAgICAgICAgIF90aGlzID0gdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgIGZucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnb2JqZWN0JzogZnVuY3Rpb24ocGxncyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsZ3MuZm9yRWFjaChmdW5jdGlvbihwKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJ1tkYXRhLScrIHAgKyddJykucGF0dGVybmxpYnJhcnkoJ19pbml0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ3N0cmluZyc6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJ1tkYXRhLScrIHBsdWdpbnMgKyddJykucGF0dGVybmxpYnJhcnkoJ19pbml0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAndW5kZWZpbmVkJzogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1snb2JqZWN0J10oT2JqZWN0LmtleXMoX3RoaXMuX3BsdWdpbnMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgZm5zW3R5cGVdKHBsdWdpbnMpO1xuICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfWNhdGNoKGVycil7XG4gICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICB9ZmluYWxseXtcbiAgICAgICAgICAgICAgICAgcmV0dXJuIHBsdWdpbnM7XG4gICAgICAgICAgICAgfVxuICAgICAgICAgfSxcbiAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIHJldHVybnMgYSByYW5kb20gYmFzZS0zNiB1aWQgd2l0aCBuYW1lc3BhY2luZ1xuICAgICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aCAtIG51bWJlciBvZiByYW5kb20gYmFzZS0zNiBkaWdpdHMgZGVzaXJlZC4gSW5jcmVhc2UgXG4gICAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgbW9yZSByYW5kb20gc3RyaW5ncy5cbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZSAtIG5hbWUgb2YgcGx1Z2luIHRvIGJlIGluY29ycG9yYXRlZCBpbiB1aWQsIG9wdGlvbmFsLlxuICAgICAgICAgKiBAZGVmYXVsdCB7U3RyaW5nfSAnJyAtIGlmIG5vIHBsdWdpbiBuYW1lIGlzIHByb3ZpZGVkLCBub3RoaW5nIGlzIGFwcGVuZGVkIFxuICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgIHRvIHRoZSB1aWQuXG4gICAgICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IC0gdW5pcXVlIGlkXG4gICAgICAgICAqL1xuICAgICAgICBHZXRZb0RpZ2l0czogZnVuY3Rpb24obGVuZ3RoLCBuYW1lc3BhY2Upe1xuICAgICAgICAgICAgbGVuZ3RoID0gbGVuZ3RoIHx8IDY7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChcbiAgICAgICAgICAgICAgICAgICAgKE1hdGgucG93KDM2LCBsZW5ndGggKyAxKSAtIE1hdGgucmFuZG9tKCkgKiBNYXRoLnBvdygzNiwgbGVuZ3RoKSlcbiAgICAgICAgICAgICkudG9TdHJpbmcoMzYpLnNsaWNlKDEpICsgKG5hbWVzcGFjZSA/ICctJyArIG5hbWVzcGFjZSA6ICcnKTtcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbml0aWFsaXplIHBsdWdpbnMgb24gYW55IGVsZW1lbnRzIHdpdGhpbiBgZWxlbWAgKGFuZCBgZWxlbWAgaXRzZWxmKSB0aGF0IFxuICAgICAgICAgKiBhcmVuJ3QgYWxyZWFkeSBpbml0aWFsaXplZC5cbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW0gLSBqUXVlcnkgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGVsZW1lbnQgdG8gY2hlY2sgaW5zaWRlLiBcbiAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICBBbHNvIGNoZWNrcyB0aGUgZWxlbWVudCBpdHNlbGYsIHVubGVzcyBpdCdzIHRoZSBgZG9jdW1lbnRgIFxuICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC5cbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IHBsdWdpbnMgLSBBIGxpc3Qgb2YgcGx1Z2lucyB0byBpbml0aWFsaXplLiBMZWF2ZSB0aGlzIFxuICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dCB0byBpbml0aWFsaXplIGV2ZXJ5dGhpbmcuXG4gICAgICAgICAqL1xuICAgICAgICByZWZsb3c6IGZ1bmN0aW9uKGVsZW0sIHBsdWdpbnMpIHtcbiAgICBcbiAgICAgICAgICAgIC8vIElmIHBsdWdpbnMgaXMgdW5kZWZpbmVkLCBqdXN0IGdyYWIgZXZlcnl0aGluZ1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwbHVnaW5zID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHBsdWdpbnMgPSBPYmplY3Qua2V5cyh0aGlzLl9wbHVnaW5zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIElmIHBsdWdpbnMgaXMgYSBzdHJpbmcsIGNvbnZlcnQgaXQgdG8gYW4gYXJyYXkgd2l0aCBvbmUgaXRlbVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHBsdWdpbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgcGx1Z2lucyA9IFtwbHVnaW5zXTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgXG4gICAgICAgICAgICAvLyBJdGVyYXRlIHRocm91Z2ggZWFjaCBwbHVnaW5cbiAgICAgICAgICAgICQuZWFjaChwbHVnaW5zLCBmdW5jdGlvbihpLCBuYW1lKSB7XG4gICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBjdXJyZW50IHBsdWdpblxuICAgICAgICAgICAgICAgIHZhciBwbHVnaW4gPSBfdGhpcy5fcGx1Z2luc1tuYW1lXTtcbiAgICBcbiAgICAgICAgICAgICAgICAvLyBMb2NhbGl6ZSB0aGUgc2VhcmNoIHRvIGFsbCBlbGVtZW50cyBpbnNpZGUgZWxlbSwgYXMgd2VsbCBhcyBlbGVtIFxuICAgICAgICAgICAgICAgIC8vIGl0c2VsZiwgdW5sZXNzIGVsZW0gPT09IGRvY3VtZW50XG4gICAgICAgICAgICAgICAgdmFyICRlbGVtID0gJChlbGVtKS5maW5kKCdbZGF0YS0nK25hbWUrJ10nKS5hZGRCYWNrKCdbZGF0YS0nK25hbWUrJ10nKTtcbiAgICBcbiAgICAgICAgICAgICAgICAvLyBGb3IgZWFjaCBwbHVnaW4gZm91bmQsIGluaXRpYWxpemUgaXRcbiAgICAgICAgICAgICAgICAkZWxlbS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgJGVsID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRzID0ge307XG4gICAgICAgICAgICAgICAgICAgIC8vIERvbid0IGRvdWJsZS1kaXAgb24gcGx1Z2luc1xuICAgICAgICAgICAgICAgICAgICBpZiAoJGVsLmRhdGEoJ3BhdHRlcm5saWJyYXJ5UGx1Z2luJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlRyaWVkIHRvIGluaXRpYWxpemUgXCIrbmFtZStcIiBvbiBhbiBlbGVtZW50IHRoYXQgXCIrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxyZWFkeSBoYXMgYSBbcGF0dGVybmxpYnJhcnldIHBsdWdpbjogXCIsICRlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYoJGVsLmF0dHIoJ2RhdGEtb3B0aW9ucycpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aGluZyA9ICRlbC5hdHRyKCdkYXRhLW9wdGlvbnMnKS5zcGxpdCgnOycpLmZvckVhY2goZnVuY3Rpb24oZSwgaSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9wdCA9IGUuc3BsaXQoJzonKS5tYXAoZnVuY3Rpb24oZWwpeyByZXR1cm4gZWwudHJpbSgpOyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihvcHRbMF0pIG9wdHNbb3B0WzBdXSA9IHBhcnNlVmFsdWUob3B0WzFdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbC5kYXRhKCdwYXR0ZXJubGlicmFyeVBsdWdpbicsIG5ldyBwbHVnaW4oJCh0aGlzKSwgb3B0cykpO1xuICAgICAgICAgICAgICAgICAgICB9Y2F0Y2goZXIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcik7XG4gICAgICAgICAgICAgICAgICAgIH1maW5hbGx5e1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0Rm5OYW1lOiBmdW5jdGlvbk5hbWUsXG4gICAgICAgIHRyYW5zaXRpb25lbmQ6IGZ1bmN0aW9uKCRlbGVtKXtcbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICAndHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICAgICAgICAgICAnV2Via2l0VHJhbnNpdGlvbic6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcbiAgICAgICAgICAgICAgICAnTW96VHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICAgICAgICAgICAnT1RyYW5zaXRpb24nOiAnb3RyYW5zaXRpb25lbmQnXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcbiAgICAgICAgICAgICAgICAgICAgZW5kO1xuICAgIFxuICAgICAgICAgICAgZm9yICh2YXIgdCBpbiB0cmFuc2l0aW9ucyl7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlbGVtLnN0eWxlW3RdICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IHRyYW5zaXRpb25zW3RdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGVuZCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVuZDtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGVuZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgJGVsZW0udHJpZ2dlckhhbmRsZXIoJ3RyYW5zaXRpb25lbmQnLCBbJGVsZW1dKTtcbiAgICAgICAgICAgICAgICB9LCAxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3RyYW5zaXRpb25lbmQnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBsaWJyYXJ5IGNvbnRhaW5lci9uYW1lc3BhY2VcbiAgICAgKi9cbiAgICBwYXR0ZXJubGlicmFyeS5saWJzID0ge1xuICAgIFxuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogdXRpbGl0eSBjb250YWluZXIvbmFtZXNwYWNlXG4gICAgICovXG4gICAgcGF0dGVybmxpYnJhcnkudXRpbCA9IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZ1bmN0aW9uIGZvciBhcHBseWluZyBhIGRlYm91bmNlIGVmZmVjdCB0byBhIGZ1bmN0aW9uIGNhbGwuXG4gICAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIC0gRnVuY3Rpb24gdG8gYmUgY2FsbGVkIGF0IGVuZCBvZiB0aW1lb3V0LlxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gZGVsYXkgLSBUaW1lIGluIG1zIHRvIGRlbGF5IHRoZSBjYWxsIG9mIGBmdW5jYC5cbiAgICAgICAgICogQHJldHVybnMgZnVuY3Rpb25cbiAgICAgICAgICovXG4gICAgICAgIHRocm90dGxlOiBmdW5jdGlvbiAoZnVuYywgZGVsYXkpIHtcbiAgICAgICAgICAgIHZhciB0aW1lciA9IG51bGw7XG4gICAgXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBjb250ZXh0ID0gdGhpcywgYXJncyA9IGFyZ3VtZW50cztcbiAgICBcbiAgICAgICAgICAgICAgICBpZiAodGltZXIgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lciA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH0sIGRlbGF5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfTtcbiAgICBcbiAgICAvLyBUT0RPOiBjb25zaWRlciBub3QgbWFraW5nIHRoaXMgYSBqUXVlcnkgZnVuY3Rpb25cbiAgICAvLyBUT0RPOiBuZWVkIHdheSB0byByZWZsb3cgdnMuIHJlLWluaXRpYWxpemVcbiAgICAvKipcbiAgICAgKiBUaGUgcGF0dGVybmxpYnJhcnkgalF1ZXJ5IG1ldGhvZC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gbWV0aG9kIC0gQW4gYWN0aW9uIHRvIHBlcmZvcm0gb24gdGhlIGN1cnJlbnQgalF1ZXJ5IG9iamVjdC5cbiAgICAgKi9cbiAgICB2YXIgc2l0ZWFwcCA9IGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgICB2YXIgdHlwZSAgPSB0eXBlb2YgbWV0aG9kLFxuICAgICAgICAgICAgJG1ldGEgPSAkKCdtZXRhLnBhdHRlcm5saWJyYXJ5LW1xJyksXG4gICAgICAgICAgICAkbm9KUyA9ICQoJy5uby1qcycpO1xuICAgIFxuICAgICAgICBpZighJG1ldGEubGVuZ3RoKXtcbiAgICAgICAgICAgICQoJzxtZXRhIGNsYXNzPVwicGF0dGVybmxpYnJhcnktbXFcIj4nKS5hcHBlbmRUbyhkb2N1bWVudC5oZWFkKTtcbiAgICAgICAgfVxuICAgICAgICBpZigkbm9KUy5sZW5ndGgpe1xuICAgICAgICAgICAgJG5vSlMucmVtb3ZlQ2xhc3MoJ25vLWpzJyk7XG4gICAgICAgIH1cbiAgICAgICAgJCgnYm9keScpLmFkZENsYXNzKFxuICAgICAgICAgICAgKHR5cGVvZiBQTEZvdW5kYXRpb24gPT0gJ3VuZGVmaW5lZCcpID8gJ2Jvb3RzdHJhcCcgOiAncGxmb3VuZGF0aW9uJ1xuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgaWYodHlwZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgLy9uZWVkcyB0byBpbml0aWFsaXplIHRoZSBwYXR0ZXJubGlicmFyeSBvYmplY3QsIG9yIGFuIGluZGl2aWR1YWwgcGx1Z2luLlxuICAgICAgICAgICAgcGF0dGVybmxpYnJhcnkuTWVkaWFRdWVyeS5faW5pdCgpO1xuICAgICAgICAgICAgcGF0dGVybmxpYnJhcnkucmVmbG93KHRoaXMpO1xuICAgICAgICB9ZWxzZSBpZih0eXBlID09PSAnc3RyaW5nJyl7XG4gICAgICAgICAgICAvL2FuIGluZGl2aWR1YWwgbWV0aG9kIHRvIGludm9rZSBvbiBhIHBsdWdpbiBvciBncm91cCBvZiBwbHVnaW5zXG4gICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgICAgICAvL2NvbGxlY3QgYWxsIHRoZSBhcmd1bWVudHMsIGlmIG5lY2Vzc2FyeVxuICAgICAgICAgICAgdmFyIHBsdWdDbGFzcyA9IHRoaXMuZGF0YSgncGF0dGVybmxpYnJhcnktcGx1Z2luJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vZGV0ZXJtaW5lIHRoZSBjbGFzcyBvZiBwbHVnaW5cbiAgICAgICAgICAgIGlmKHBsdWdDbGFzcyAhPT0gdW5kZWZpbmVkICYmIHBsdWdDbGFzc1ttZXRob2RdICE9PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgICAgIC8vbWFrZSBzdXJlIGJvdGggdGhlIGNsYXNzIGFuZCBtZXRob2QgZXhpc3RcbiAgICAgICAgICAgICAgICBpZih0aGlzLmxlbmd0aCA9PT0gMSl7XG4gICAgICAgICAgICAgICAgICAgIC8vaWYgdGhlcmUncyBvbmx5IG9uZSwgY2FsbCBpdCBkaXJlY3RseS5cbiAgICAgICAgICAgICAgICAgICAgcGx1Z0NsYXNzW21ldGhvZF0uYXBwbHkocGx1Z0NsYXNzLCBhcmdzKTtcbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGVsKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vb3RoZXJ3aXNlIGxvb3AgdGhyb3VnaCB0aGUgalF1ZXJ5IGNvbGxlY3Rpb24gYW5kIGludm9rZSB0aGUgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtZXRob2Qgb24gZWFjaFxuICAgICAgICAgICAgICAgICAgICAgICAgcGx1Z0NsYXNzW21ldGhvZF0uYXBwbHkoJChlbCkuZGF0YSgncGF0dGVybmxpYnJhcnktcGx1Z2luJyksIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ZWxzZXsvL2Vycm9yIGZvciBubyBjbGFzcyBvciBubyBtZXRob2RcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJXZSdyZSBzb3JyeSwgJ1wiICsgbWV0aG9kICsgXG4gICAgICAgICAgICAgICAgICAgIFwiJyBpcyBub3QgYW4gYXZhaWxhYmxlIG1ldGhvZCBmb3IgXCIgKyBcbiAgICAgICAgICAgICAgICAgICAgKHBsdWdDbGFzcyA/IGZ1bmN0aW9uTmFtZShwbHVnQ2xhc3MpIDogJ3RoaXMgZWxlbWVudCcpICsgJy4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfWVsc2V7Ly9lcnJvciBmb3IgaW52YWxpZCBhcmd1bWVudCB0eXBlXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiV2UncmUgc29ycnksICdcIiArIHR5cGUgKyBcIicgaXMgbm90IGEgdmFsaWQgcGFyYW1ldGVyLiBcIitcbiAgICAgICAgICAgICAgICBcIllvdSBtdXN0IHVzZSBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIG1ldGhvZCB5b3Ugd2lzaCB0byBpbnZva2UuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgd2luZG93LnBhdHRlcm5saWJyYXJ5ID0gcGF0dGVybmxpYnJhcnk7XG4gICAgJC5mbi5wYXR0ZXJubGlicmFyeSA9IHNpdGVhcHA7XG4gICAgXG5cblxufShqUXVlcnkpO1xuXG4vLyBQb2x5ZmlsbCBmb3IgcmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4oZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFEYXRlLm5vdyB8fCAhd2luZG93LkRhdGUubm93KVxuICAgICAgICB3aW5kb3cuRGF0ZS5ub3cgPSBEYXRlLm5vdyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7IH07XG5cbiAgICB2YXIgdmVuZG9ycyA9IFsnd2Via2l0JywgJ21veiddO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmVuZG9ycy5sZW5ndGggJiYgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsraSkge1xuICAgICAgICB2YXIgdnAgPSB2ZW5kb3JzW2ldO1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZwKydSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gKHdpbmRvd1t2cCsnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgd2luZG93W3ZwKydDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXSk7XG4gICAgfVxuICAgIGlmICgvaVAoYWR8aG9uZXxvZCkuKk9TIDYvLnRlc3Qod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpXG4gICAgICAgIHx8ICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8ICF3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgICAgdmFyIGxhc3RUaW1lID0gMDtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgdmFyIG5leHRUaW1lID0gTWF0aC5tYXgobGFzdFRpbWUgKyAxNiwgbm93KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpIHsgY2FsbGJhY2sobGFzdFRpbWUgPSBuZXh0VGltZSk7IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFRpbWUgLSBub3cpO1xuICAgICAgICB9O1xuICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBjbGVhclRpbWVvdXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBvbHlmaWxsIGZvciBwZXJmb3JtYW5jZS5ub3csIHJlcXVpcmVkIGJ5IHJBRlxuICAgICAqL1xuICAgIGlmKCF3aW5kb3cucGVyZm9ybWFuY2UgfHwgIXdpbmRvdy5wZXJmb3JtYW5jZS5ub3cpe1xuICAgICAgICB3aW5kb3cucGVyZm9ybWFuY2UgPSB7XG4gICAgICAgICAgICBzdGFydDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgIG5vdzogZnVuY3Rpb24oKXsgcmV0dXJuIERhdGUubm93KCkgLSB0aGlzLnN0YXJ0OyB9XG4gICAgICAgIH07XG4gICAgfVxufSkoKTtcblxuaWYgKCFGdW5jdGlvbi5wcm90b3R5cGUuYmluZCkge1xuICAgIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24ob1RoaXMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAvLyBjbG9zZXN0IHRoaW5nIHBvc3NpYmxlIHRvIHRoZSBFQ01BU2NyaXB0IDVcbiAgICAgICAgICAgIC8vIGludGVybmFsIElzQ2FsbGFibGUgZnVuY3Rpb25cbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Z1bmN0aW9uLnByb3RvdHlwZS5iaW5kIC0gd2hhdCBpcyB0cnlpbmcgdG8gYmUgJytcbiAgICAgICAgICAgICAgICAgICAgJ2JvdW5kIGlzIG5vdCBjYWxsYWJsZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGFBcmdzICAgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLFxuICAgICAgICAgICAgZlRvQmluZCA9IHRoaXMsXG4gICAgICAgICAgICBmTk9QICAgID0gZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgICAgIGZCb3VuZCAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZlRvQmluZC5hcHBseShcbiAgICAgICAgICAgICAgICAgICAgdGhpcyBpbnN0YW5jZW9mIGZOT1AgPyB0aGlzIDogb1RoaXMsXG4gICAgICAgICAgICAgICAgICAgIGFBcmdzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIGlmICh0aGlzLnByb3RvdHlwZSkge1xuICAgICAgICAgICAgLy8gbmF0aXZlIGZ1bmN0aW9ucyBkb24ndCBoYXZlIGEgcHJvdG90eXBlXG4gICAgICAgICAgICBmTk9QLnByb3RvdHlwZSA9IHRoaXMucHJvdG90eXBlO1xuICAgICAgICB9XG4gICAgICAgIGZCb3VuZC5wcm90b3R5cGUgPSBuZXcgZk5PUCgpO1xuXG4gICAgICAgIHJldHVybiBmQm91bmQ7XG4gICAgfTtcbn1cblxuLy8gUG9seWZpbGwgdG8gZ2V0IHRoZSBuYW1lIG9mIGEgZnVuY3Rpb24gaW4gSUU5XG5mdW5jdGlvbiBmdW5jdGlvbk5hbWUoZm4pIHtcbiAgICBpZiAoRnVuY3Rpb24ucHJvdG90eXBlLm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB2YXIgZnVuY05hbWVSZWdleCA9IC9mdW5jdGlvblxccyhbXihdezEsfSlcXCgvO1xuICAgICAgICB2YXIgcmVzdWx0cyA9IChmdW5jTmFtZVJlZ2V4KS5leGVjKChmbikudG9TdHJpbmcoKSk7XG4gICAgICAgIHJldHVybiAocmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCA+IDEpID8gcmVzdWx0c1sxXS50cmltKCkgOiBcIlwiO1xuICAgIH1cbiAgICBlbHNlIGlmIChmbi5wcm90b3R5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gZm4uY29uc3RydWN0b3IubmFtZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBmbi5wcm90b3R5cGUuY29uc3RydWN0b3IubmFtZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlVmFsdWUoc3RyKXtcbiAgICBpZigvdHJ1ZS8udGVzdChzdHIpKSByZXR1cm4gdHJ1ZTtcbiAgICBlbHNlIGlmKC9mYWxzZS8udGVzdChzdHIpKSByZXR1cm4gZmFsc2U7XG4gICAgZWxzZSBpZighaXNOYU4oc3RyICogMSkpIHJldHVybiBwYXJzZUZsb2F0KHN0cik7XG4gICAgcmV0dXJuIHN0cjtcbn1cblxuLy8gQ29udmVydCBQYXNjYWxDYXNlIHRvIGtlYmFiLWNhc2Vcbi8vIFRoYW5rIHlvdTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvODk1NTU4MFxuZnVuY3Rpb24gaHlwaGVuYXRlKHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxLSQyJykudG9Mb3dlckNhc2UoKTtcbn1cblxuZnVuY3Rpb24gZ2V0UGx1Z2luTmFtZShvYmopIHtcbiAgaWYodHlwZW9mKG9iai5jb25zdHJ1Y3Rvci5uYW1lKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gaHlwaGVuYXRlKG9iai5jb25zdHJ1Y3Rvci5uYW1lKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gaHlwaGVuYXRlKG9iai5jbGFzc05hbWUpO1xuICB9XG59XG5cbi8qKlxuICogcmV0dXJucyBhIHJhbmRvbSBiYXNlLTM2IHVpZCB3aXRoIG5hbWVzcGFjaW5nXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGggLSBudW1iZXIgb2YgcmFuZG9tIGJhc2UtMzYgZGlnaXRzIGRlc2lyZWQuIEluY3JlYXNlIGZvciBtb3JlIHJhbmRvbSBzdHJpbmdzLlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZSAtIG5hbWUgb2YgcGx1Z2luIHRvIGJlIGluY29ycG9yYXRlZCBpbiB1aWQsIG9wdGlvbmFsLlxuICogQGRlZmF1bHQge1N0cmluZ30gJycgLSBpZiBubyBwbHVnaW4gbmFtZSBpcyBwcm92aWRlZCwgbm90aGluZyBpcyBhcHBlbmRlZCB0byB0aGUgdWlkLlxuICogQHJldHVybnMge1N0cmluZ30gLSB1bmlxdWUgaWRcbiAqL1xuZnVuY3Rpb24gR2V0WW9EaWdpdHMobGVuZ3RoLCBuYW1lc3BhY2Upe1xuICBsZW5ndGggPSBsZW5ndGggfHwgNjtcbiAgcmV0dXJuIE1hdGgucm91bmQoKE1hdGgucG93KDM2LCBsZW5ndGggKyAxKSAtIE1hdGgucmFuZG9tKCkgKiBNYXRoLnBvdygzNiwgbGVuZ3RoKSkpLnRvU3RyaW5nKDM2KS5zbGljZSgxKSArIChuYW1lc3BhY2UgPyBgLSR7bmFtZXNwYWNlfWAgOiAnJyk7XG59XG5cbmZ1bmN0aW9uIHVjZmlyc3Qoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zbGljZSgxKTtcbn1cblxuIiwiLyoqIEB2YXIgIG9iamVjdCAgcGF0dGVybmxpYnJhcnkuQ29uZmlnICBwYXR0ZXJubGlicmFyeSBnbG9iYWwgY29uZmlndXJhdGlvbiBjb250YWluZXIgKi9cbmlmICghcGF0dGVybmxpYnJhcnkuQ29uZmlnKSB7XG4gICAgcGF0dGVybmxpYnJhcnkuQ29uZmlnID0ge1xuICAgIFx0XG4gICAgXHQvLyBkZWJ1ZyBtb2RlIChjb25zb2xlIG91dHB1dCkgb24vb2ZmXG4gICAgXHRkZWJ1ZzogZmFsc2UsXG4gICAgXHRcbiAgICAgICAgLy8gZGV0ZWN0IFVJIGZyYW1ld29ya1xuICAgICAgICByZW5kZXJlciA6ICgodHlwZW9mIFBMRm91bmRhdGlvbiAhPSAndW5kZWZpbmVkJykgPyAncGxmb3VuZGF0aW9uJyA6ICdib290c3RyYXAnKSxcbiAgICAgICAgLy8gZGV0ZWN0IGxhbmd1YWdlXG4gICAgICAgIGxhbmcgOiAkKCdIVE1MJykuYXR0cignbGFuZycpIHx8ICdlbicsXG4gICAgICAgIFxuICAgICAgICAvLyBYSFIgc2VsZWN0b3JzXG4gICAgICAgIHhoclNlbGVjdG9ycyA6IHtcbiAgICAgICAgICAgIHhockJ1dHRvbnMgIDogXCJBLmJ0bltocmVmKj0nYWRkJ10sIEEuYnRuW2hyZWYqPSdlZGl0J10sIEEuYnRuW2hyZWYqPSdkZXRhaWxzJ10sIEEuYnRuW2hyZWYqPSdkZWxldGUnXVwiLFxuICAgICAgICAgICAgeGhyQ1RBT3BlbiAgOiBcIkEuYnRuLWN0YS14aHIuY3RhLXhoci1tb2RhbFwiLFxuICAgICAgICAgICAgeGhyQ1RBQ2xvc2UgOiBcIi5tb2RhbC1jb250ZW50IC5idG4tY3RhLXhoci1jbG9zZSwgLm1vZGFsLWNvbnRlbnQgLmFsZXJ0LCAubW9kYWwtY29udGVudCAuY2xvc2UsIC5tb2RhbC1jb250ZW50IC5jdGEteGhyLW1vZGFsLWNsb3NlLCAucmV2ZWFsIC5jdGEteGhyLW1vZGFsLWNsb3NlXCIsXG4gICAgICAgICAgICB4aHJGb3JtcyAgICA6IFwiLm1vZGFsLWNvbnRlbnQgLmZvcm0teGhyXCJcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIC8vIG1vZGFsIHNldHRpbmdzXG4gICAgICAgIG1vZGFscyA6IHtcbiAgICAgICAgICAgIGJvb3RzdHJhcEVsZW1lbnRDbGFzc25hbWUgIDogJ21vZGFsJyxcbiAgICAgICAgICAgIHBsZm91bmRhdGlvbkVsZW1lbnRDbGFzc25hbWUgOiAncmV2ZWFsJ1xuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgLy8gZGF0YVRhYmxlIHBsdWctaW4gc2V0dGluZ3NcbiAgICAgICAgZGF0YVRhYmxlIDoge1xuICAgICAgICAgICAgbGFuZ1VSTHMgOiB7XG4gICAgICAgICAgICAgICAgJ2VuJyA6ICcvL2Nkbi5kYXRhdGFibGVzLm5ldC9wbHVnLWlucy8xLjEwLjkvaTE4bi9FbmdsaXNoLmpzb24nLFxuICAgICAgICAgICAgICAgICdkZScgOiAnLy9jZG4uZGF0YXRhYmxlcy5uZXQvcGx1Zy1pbnMvMS4xMC45L2kxOG4vR2VybWFuLmpzb24nLFxuICAgICAgICAgICAgICAgICdmcicgOiAnLy9jZG4uZGF0YXRhYmxlcy5uZXQvcGx1Zy1pbnMvMS4xMC45L2kxOG4vRnJlbmNoLmpzb24nLFxuICAgICAgICAgICAgICAgICdlcycgOiAnLy9jZG4uZGF0YXRhYmxlcy5uZXQvcGx1Zy1pbnMvMS4xMC45L2kxOG4vU3BhbmlzaC5qc29uJyxcbiAgICAgICAgICAgICAgICAnaXQnIDogJy8vY2RuLmRhdGF0YWJsZXMubmV0L3BsdWctaW5zLzEuMTAuOS9pMThuL0l0YWxpYW4uanNvbidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdGF0ZVNhdmUgOiB0cnVlLFxuICAgICAgICAgICAgc3RhdGVEdXJhdGlvbiA6IDYwICogNjAgKiAyNCAqIDEgIC8vIHNlYyAqIG1pbiAqIGggKiBkXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgIH07XG59XG4iLCIvKipcbiAqIFRoaXMgbW9kdWxlIHNldHMgdXAgdGhlIHNlYXJjaCBiYXIuXG4gKi9cblxuIWZ1bmN0aW9uKCkge1xuXG52YXIgc2VhcmNoU291cmNlID0ge1xuICBuYW1lIDogJ3BhdHRlcm5saWJyYXJ5JyxcblxuICAvLyBPbmx5IHNob3cgMTAgcmVzdWx0cyBhdCBvbmNlXG4gIGxpbWl0OiAxMCxcblxuICAvLyBGdW5jdGlvbiB0byBmZXRjaCByZXN1bHQgbGlzdCBhbmQgdGhlbiBmaW5kIGEgcmVzdWx0O1xuICBzb3VyY2U6IGZ1bmN0aW9uKHF1ZXJ5LCBzeW5jLCBhc3luYykge1xuICAgIHF1ZXJ5ID0gcXVlcnkudG9Mb3dlckNhc2UoKTtcblxuICAgICQuZ2V0SlNPTignL3BsL3NlYXJjaC5qc29uJywgZnVuY3Rpb24oZGF0YSwgc3RhdHVzKSB7XG4gICAgICBhc3luYyhkYXRhLmZpbHRlcihmdW5jdGlvbihlbGVtLCBpLCBhcnIpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBlbGVtLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgdmFyIHRlcm1zID0gW25hbWUsIG5hbWUucmVwbGFjZSgnLScsICcnKV0uY29uY2F0KGVsZW0udGFncyB8fCBbXSk7XG4gICAgICAgIGZvciAodmFyIGkgaW4gdGVybXMpIGlmICh0ZXJtc1tpXS5pbmRleE9mKHF1ZXJ5KSA+IC0xKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSkpO1xuICAgIH0pO1xuICB9LFxuXG4gIC8vIE5hbWUgdG8gdXNlIGZvciB0aGUgc2VhcmNoIHJlc3VsdCBpdHNlbGZcbiAgZGlzcGxheTogZnVuY3Rpb24oaXRlbSkge1xuICAgIHJldHVybiBpdGVtLm5hbWU7XG4gIH0sXG5cbiAgdGVtcGxhdGVzOiB7XG4gICAgLy8gSFRNTCB0aGF0IHJlbmRlcnMgaWYgdGhlcmUgYXJlIG5vIHJlc3VsdHNcbiAgICBub3RGb3VuZDogZnVuY3Rpb24ocXVlcnkpIHtcbiAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cInR0LWVtcHR5XCI+Tm8gcmVzdWx0cyBmb3IgXCInICsgcXVlcnkucXVlcnkgKyAnXCIuPC9kaXY+JztcbiAgICB9LFxuICAgIC8vIEhUTUwgdGhhdCByZW5kZXJzIGZvciBlYWNoIHJlc3VsdCBpbiB0aGUgbGlzdFxuICAgIHN1Z2dlc3Rpb246IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIHJldHVybiAnPGRpdj48c3BhbiBjbGFzcz1cIm5hbWVcIj4nICsgaXRlbS5uYW1lICsgJzxzcGFuIGNsYXNzPVwibWV0YVwiPicgKyBpdGVtLnR5cGUgKyAnPC9zcGFuPjwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJkZXNjXCI+JyArIGl0ZW0uZGVzY3JpcHRpb24gKyAnPC9zcGFuPjwvZGl2Pic7XG4gICAgfVxuICB9XG59XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcblx0XG5cdC8vIFNlYXJjaFxuXHRpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ3NlYXJjaDogJywgJCgnW2RhdGEtZG9jcy1zZWFyY2hdJykpO1xuXHRcblx0JCgnW2RhdGEtZG9jcy1zZWFyY2hdJylcblx0ICAudHlwZWFoZWFkKHsgaGlnaGxpZ2h0OiBmYWxzZSB9LCBzZWFyY2hTb3VyY2UpO1xuXHRcblx0JCgnW2RhdGEtZG9jcy1zZWFyY2hdJylcblx0ICAuYmluZCgndHlwZWFoZWFkOnNlbGVjdCcsIGZ1bmN0aW9uKGUsIHNlbCkge1xuXHQgICAgdmFyIGxpbmtVcmwgPSBTdHJpbmcoc2VsLmxpbmspXG5cdCAgICAgICAgICAgIC5yZXBsYWNlKCcuLi9wYXR0ZXJucycsICcvcGwvcGF0dGVybnMnKVxuXHQgICAgICAgICAgICAucmVwbGFjZSgnL3JlYWRtZS5odG1sJywgJycpO1xuXHQgICAgXG5cdCAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGxpbmtVcmw7XG5cdCAgICAvL2UucHJldmVudERlZmF1bHQoKTsgZS5zdG9wUHJvcGFnYXRpb24oKTsgcmV0dXJuIGZhbHNlO1xuXHQgIH0pO1xuXHRcblx0Ly8gQXV0by1oaWdobGlnaHQgdW5sZXNzIGl0J3MgYSBwaG9uZVxuXHRpZiAoIW5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goLyhpUChob25lfGFkfG9kKXxBbmRyb2lkKS8pKSB7XG5cdCAgJCgnW2RhdGEtZG9jcy1zZWFyY2hdJykuZm9jdXMoKTtcblx0fVxuXHRcbn0pO1xuXG59KCk7XG4iLCIhZnVuY3Rpb24oJCwgcGF0dGVybmxpYnJhcnkpIHtcblxuLy8gRGVmYXVsdCBzZXQgb2YgbWVkaWEgcXVlcmllc1xudmFyIGRlZmF1bHRRdWVyaWVzID0ge1xuICAnZGVmYXVsdCcgOiAnb25seSBzY3JlZW4nLFxuICBsYW5kc2NhcGUgOiAnb25seSBzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogbGFuZHNjYXBlKScsXG4gIHBvcnRyYWl0IDogJ29ubHkgc2NyZWVuIGFuZCAob3JpZW50YXRpb246IHBvcnRyYWl0KScsXG4gIHJldGluYSA6ICdvbmx5IHNjcmVlbiBhbmQgKC13ZWJraXQtbWluLWRldmljZS1waXhlbC1yYXRpbzogMiksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLS1tb3otZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kICgtby1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyLzEpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAxOTJkcGkpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAyZHBweCknXG59O1xuXG52YXIgTWVkaWFRdWVyeSA9IHtcbiAgcXVlcmllczogW10sXG4gIGN1cnJlbnQ6ICcnLFxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIHNjcmVlbiBpcyBhdCBsZWFzdCBhcyB3aWRlIGFzIGEgYnJlYWtwb2ludC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBjaGVjay5cbiAgICogQHJldHVybnMge0Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgYnJlYWtwb2ludCBtYXRjaGVzLCBgZmFsc2VgIGlmIGl0J3Mgc21hbGxlci5cbiAgICovXG4gIGF0TGVhc3Q6IGZ1bmN0aW9uKHNpemUpIHtcbiAgICB2YXIgcXVlcnkgPSB0aGlzLmdldChzaXplKTtcblxuICAgIGlmIChxdWVyeSkge1xuICAgICAgcmV0dXJuIHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5KS5tYXRjaGVzO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICAvKipcbiAgICogR2V0cyB0aGUgbWVkaWEgcXVlcnkgb2YgYSBicmVha3BvaW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGdldC5cbiAgICogQHJldHVybnMge1N0cmluZ3xudWxsfSAtIFRoZSBtZWRpYSBxdWVyeSBvZiB0aGUgYnJlYWtwb2ludCwgb3IgYG51bGxgIGlmIHRoZSBicmVha3BvaW50IGRvZXNuJ3QgZXhpc3QuXG4gICAqL1xuICBnZXQ6IGZ1bmN0aW9uKHNpemUpIHtcbiAgICBmb3IgKHZhciBpIGluIHRoaXMucXVlcmllcykge1xuICAgICAgdmFyIHF1ZXJ5ID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgaWYgKHNpemUgPT09IHF1ZXJ5Lm5hbWUpIHJldHVybiBxdWVyeS52YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfSxcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIG1lZGlhIHF1ZXJ5IGhlbHBlciwgYnkgZXh0cmFjdGluZyB0aGUgYnJlYWtwb2ludCBsaXN0IGZyb20gdGhlIENTUyBhbmQgYWN0aXZhdGluZyB0aGUgYnJlYWtwb2ludCB3YXRjaGVyLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGV4dHJhY3RlZFN0eWxlcyA9ICQoJy5wYXR0ZXJubGlicmFyeS1tcScpLmNzcygnZm9udC1mYW1pbHknKTtcbiAgICB2YXIgbmFtZWRRdWVyaWVzO1xuXG4gICAgbmFtZWRRdWVyaWVzID0gcGFyc2VTdHlsZVRvT2JqZWN0KGV4dHJhY3RlZFN0eWxlcyk7XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gbmFtZWRRdWVyaWVzKSB7XG4gICAgICBzZWxmLnF1ZXJpZXMucHVzaCh7XG4gICAgICAgIG5hbWU6IGtleSxcbiAgICAgICAgdmFsdWU6ICdvbmx5IHNjcmVlbiBhbmQgKG1pbi13aWR0aDogJyArIG5hbWVkUXVlcmllc1trZXldICsgJyknXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLl9nZXRDdXJyZW50U2l6ZSgpO1xuXG4gICAgdGhpcy5fd2F0Y2hlcigpO1xuXG4gICAgLy8gRXh0ZW5kIGRlZmF1bHQgcXVlcmllc1xuICAgIC8vIG5hbWVkUXVlcmllcyA9ICQuZXh0ZW5kKGRlZmF1bHRRdWVyaWVzLCBuYW1lZFF1ZXJpZXMpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBjdXJyZW50IGJyZWFrcG9pbnQgbmFtZSBieSB0ZXN0aW5nIGV2ZXJ5IGJyZWFrcG9pbnQgYW5kIHJldHVybmluZyB0aGUgbGFzdCBvbmUgdG8gbWF0Y2ggKHRoZSBiaWdnZXN0IG9uZSkuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSBOYW1lIG9mIHRoZSBjdXJyZW50IGJyZWFrcG9pbnQuXG4gICAqL1xuICBfZ2V0Q3VycmVudFNpemU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBtYXRjaGVkO1xuXG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLnF1ZXJpZXMpIHtcbiAgICAgIHZhciBxdWVyeSA9IHRoaXMucXVlcmllc1tpXTtcblxuICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5LnZhbHVlKS5tYXRjaGVzKSB7XG4gICAgICAgIG1hdGNoZWQgPSBxdWVyeTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZih0eXBlb2YgbWF0Y2hlZCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBtYXRjaGVkLm5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBtYXRjaGVkO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQWN0aXZhdGVzIHRoZSBicmVha3BvaW50IHdhdGNoZXIsIHdoaWNoIGZpcmVzIGFuIGV2ZW50IG9uIHRoZSB3aW5kb3cgd2hlbmV2ZXIgdGhlIGJyZWFrcG9pbnQgY2hhbmdlcy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfd2F0Y2hlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICQod2luZG93KS5vbigncmVzaXplLnpmLm1lZGlhcXVlcnknLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBuZXdTaXplID0gX3RoaXMuX2dldEN1cnJlbnRTaXplKCk7XG5cbiAgICAgIGlmIChuZXdTaXplICE9PSBfdGhpcy5jdXJyZW50KSB7XG4gICAgICAgIC8vIEJyb2FkY2FzdCB0aGUgbWVkaWEgcXVlcnkgY2hhbmdlIG9uIHRoZSB3aW5kb3dcbiAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIFtuZXdTaXplLCBfdGhpcy5jdXJyZW50XSk7XG5cbiAgICAgICAgLy8gQ2hhbmdlIHRoZSBjdXJyZW50IG1lZGlhIHF1ZXJ5XG4gICAgICAgIF90aGlzLmN1cnJlbnQgPSBuZXdTaXplO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuXG5wYXR0ZXJubGlicmFyeS5NZWRpYVF1ZXJ5ID0gTWVkaWFRdWVyeTtcblxuLy8gbWF0Y2hNZWRpYSgpIHBvbHlmaWxsIC0gVGVzdCBhIENTUyBtZWRpYSB0eXBlL3F1ZXJ5IGluIEpTLlxuLy8gQXV0aG9ycyAmIGNvcHlyaWdodCAoYykgMjAxMjogU2NvdHQgSmVobCwgUGF1bCBJcmlzaCwgTmljaG9sYXMgWmFrYXMsIERhdmlkIEtuaWdodC4gRHVhbCBNSVQvQlNEIGxpY2Vuc2VcbndpbmRvdy5tYXRjaE1lZGlhIHx8ICh3aW5kb3cubWF0Y2hNZWRpYSA9IGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gRm9yIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBtYXRjaE1lZGl1bSBhcGkgc3VjaCBhcyBJRSA5IGFuZCB3ZWJraXRcbiAgdmFyIHN0eWxlTWVkaWEgPSAod2luZG93LnN0eWxlTWVkaWEgfHwgd2luZG93Lm1lZGlhKTtcblxuICAvLyBGb3IgdGhvc2UgdGhhdCBkb24ndCBzdXBwb3J0IG1hdGNoTWVkaXVtXG4gIGlmICghc3R5bGVNZWRpYSkge1xuICAgIHZhciBzdHlsZSAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKSxcbiAgICBzY3JpcHQgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXSxcbiAgICBpbmZvICAgICAgICA9IG51bGw7XG5cbiAgICBzdHlsZS50eXBlICA9ICd0ZXh0L2Nzcyc7XG4gICAgc3R5bGUuaWQgICAgPSAnbWF0Y2htZWRpYWpzLXRlc3QnO1xuXG4gICAgc2NyaXB0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHN0eWxlLCBzY3JpcHQpO1xuXG4gICAgLy8gJ3N0eWxlLmN1cnJlbnRTdHlsZScgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnd2luZG93LmdldENvbXB1dGVkU3R5bGUnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICBpbmZvID0gKCdnZXRDb21wdXRlZFN0eWxlJyBpbiB3aW5kb3cpICYmIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHN0eWxlLCBudWxsKSB8fCBzdHlsZS5jdXJyZW50U3R5bGU7XG5cbiAgICBzdHlsZU1lZGlhID0ge1xuICAgICAgbWF0Y2hNZWRpdW06IGZ1bmN0aW9uKG1lZGlhKSB7XG4gICAgICAgIHZhciB0ZXh0ID0gJ0BtZWRpYSAnICsgbWVkaWEgKyAneyAjbWF0Y2htZWRpYWpzLXRlc3QgeyB3aWR0aDogMXB4OyB9IH0nO1xuXG4gICAgICAgIC8vICdzdHlsZS5zdHlsZVNoZWV0JyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICdzdHlsZS50ZXh0Q29udGVudCcgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xuICAgICAgICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgICAgICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3R5bGUudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGVzdCBpZiBtZWRpYSBxdWVyeSBpcyB0cnVlIG9yIGZhbHNlXG4gICAgICAgIHJldHVybiBpbmZvLndpZHRoID09PSAnMXB4JztcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG1lZGlhKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1hdGNoZXM6IHN0eWxlTWVkaWEubWF0Y2hNZWRpdW0obWVkaWEgfHwgJ2FsbCcpLFxuICAgICAgbWVkaWE6IG1lZGlhIHx8ICdhbGwnXG4gICAgfTtcbiAgfTtcbn0oKSk7XG5cbi8vIFRoYW5rIHlvdTogaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9xdWVyeS1zdHJpbmdcbmZ1bmN0aW9uIHBhcnNlU3R5bGVUb09iamVjdChzdHIpIHtcbiAgdmFyIHN0eWxlT2JqZWN0ID0ge307XG5cbiAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHN0eWxlT2JqZWN0O1xuICB9XG5cbiAgc3RyID0gc3RyLnRyaW0oKS5zbGljZSgxLCAtMSk7IC8vIGJyb3dzZXJzIHJlLXF1b3RlIHN0cmluZyBzdHlsZSB2YWx1ZXNcblxuICBpZiAoIXN0cikge1xuICAgIHJldHVybiBzdHlsZU9iamVjdDtcbiAgfVxuXG4gIHN0eWxlT2JqZWN0ID0gc3RyLnNwbGl0KCcmJykucmVkdWNlKGZ1bmN0aW9uKHJldCwgcGFyYW0pIHtcbiAgICB2YXIgcGFydHMgPSBwYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKS5zcGxpdCgnPScpO1xuICAgIHZhciBrZXkgPSBwYXJ0c1swXTtcbiAgICB2YXIgdmFsID0gcGFydHNbMV07XG4gICAga2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KGtleSk7XG5cbiAgICAvLyBtaXNzaW5nIGA9YCBzaG91bGQgYmUgYG51bGxgOlxuICAgIC8vIGh0dHA6Ly93My5vcmcvVFIvMjAxMi9XRC11cmwtMjAxMjA1MjQvI2NvbGxlY3QtdXJsLXBhcmFtZXRlcnNcbiAgICB2YWwgPSB2YWwgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBkZWNvZGVVUklDb21wb25lbnQodmFsKTtcblxuICAgIGlmICghcmV0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHJldFtrZXldID0gdmFsO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXRba2V5XSkpIHtcbiAgICAgIHJldFtrZXldLnB1c2godmFsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0W2tleV0gPSBbcmV0W2tleV0sIHZhbF07XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH0sIHt9KTtcblxuICByZXR1cm4gc3R5bGVPYmplY3Q7XG59XG5cbn0oalF1ZXJ5LCBwYXR0ZXJubGlicmFyeSk7XG4iLCIvKipcbiAqIFxuICovXG47KGZ1bmN0aW9uICgkLCB3aW5kb3csIGRvY3VtZW50LCBwYXR0ZXJubGlicmFyeSwgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuXG4gIHBhdHRlcm5saWJyYXJ5LmxpYnMubW9kYWwgPSB7XG4gICAgbmFtZSA6ICdtb2RhbCcsXG5cbiAgICB2ZXJzaW9uIDogJzAuMC4xJyxcblxuICAgIHNldHRpbmdzIDoge1xuICAgICAgY2FsbGJhY2sgOiBmdW5jdGlvbiAoKSB7fVxuICAgIH0sXG5cbiAgICAvKmluaXQgOiBmdW5jdGlvbiAoc2NvcGUsIG1ldGhvZCwgb3B0aW9ucykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgLy8gcGF0dGVybmxpYnJhcnkuaW5oZXJpdCh0aGlzLCAnbW9kdWxlbmFtZTEgbW9kdWxlbmFtZTInKTtcblxuICAgICAgdGhpcy5iaW5kaW5ncyhtZXRob2QsIG9wdGlvbnMpO1xuICAgIH0sKi9cblxuICAgIC8qKlxuICAgICAqIG9wZW4gbW9kYWwgZGlhbG9nXG4gICAgICogXG4gICAgICogQHBhcmFtICBtaXhlZCAgZGF0YSAgdGhlIG1vZGFsIGNvbnRlbnRcbiAgICAgKiBAcGFyYW0gIHN0cmluZyAgdXBkYXRlV2luZG93SHJlZiAgVVJMIHRvIHVwZGF0ZSBicm93c2VyIGhpc3RvcnkgYW5kIGxvY2F0aW9uLCAtZmFsc2UvbnVsbC0gZGlzYWJsZXMsIGRlZmF1bHQgLWZhbHNlLSBcbiAgICAgKiBAcmV0dXJuIHBhdHRlcm5saWJyYXJ5LmxpYnMubW9kYWxcbiAgICAgKi9cbiAgICBvcGVuIDogZnVuY3Rpb24gKGRhdGEsIHVwZGF0ZVdpbmRvd0hyZWYpIHtcbiAgICAgICAgaWYgKCh0eXBlb2YgJC5mbi5tb2RhbCA9PSAndW5kZWZpbmVkJykgJiYgKHR5cGVvZiBQTEZvdW5kYXRpb24uUmV2ZWFsID09ICd1bmRlZmluZWQnKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdCb290c3RyYXAgTW9kYWwgYW5kL29yIFBMRm91bmRhdGlvbiBSZXZlYWwgcGx1Zy1pbnMgbm90IGZvdW5kLi4uJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyICRtb2RhbCA9IG51bGw7XG4gICAgICAgIGlmICh0eXBlb2YgUExGb3VuZGF0aW9uICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBpZiAoICQoJyMnK3BhdHRlcm5saWJyYXJ5LkNvbmZpZy5tb2RhbHMucGxmb3VuZGF0aW9uRWxlbWVudENsYXNzbmFtZSkuc2l6ZSgpID09IDAgKSB7XG4gICAgICAgICAgICAgICAgJCgnQk9EWScpLmFwcGVuZCgnPGRpdiBpZD1cIicrcGF0dGVybmxpYnJhcnkuQ29uZmlnLm1vZGFscy5wbGZvdW5kYXRpb25FbGVtZW50Q2xhc3NuYW1lKydcIiBjbGFzcz1cIicrcGF0dGVybmxpYnJhcnkuQ29uZmlnLm1vZGFscy5wbGZvdW5kYXRpb25FbGVtZW50Q2xhc3NuYW1lKydcIiBkYXRhLXJldmVhbD48L2Rpdj4nKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHJldmVhbE9wdGlvbnMgPSB7IFxuICAgICAgICAgICAgXHRcImFuaW1hdGlvbkluXCIgICAgOiBcInNjYWxlLWluLXVwXCIsXG4gICAgICAgICAgICBcdFwiYW5pbWF0aW9uT3V0XCIgICA6IFwic2NhbGUtb3V0LWRvd25cIixcbiAgICAgICAgICAgIFx0XCJvdmVybGF5XCIgICAgICAgIDogdHJ1ZSxcbiAgICAgICAgICAgIFx0XCJjbG9zZU9uQ2xpY2tcIiAgIDogZmFsc2UsXG4gICAgICAgICAgICBcdFwiY2xvc2VPbkVjc1wiICAgICA6IHRydWUsXG4gICAgICAgICAgICBcdFwibXVsdGlwbGVPcGVuZWRcIiA6IGZhbHNlLFxuICAgICAgICAgICAgXHRcImRlZXBMaW5rXCIgICAgICAgOiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG1vZGFsRGF0YSA9ICcnK2RhdGErJycsXG4gICAgICAgICAgICAgICAgbSA9IG5ldyBQTEZvdW5kYXRpb24uUmV2ZWFsKCQoJyMnK3BhdHRlcm5saWJyYXJ5LkNvbmZpZy5tb2RhbHMucGxmb3VuZGF0aW9uRWxlbWVudENsYXNzbmFtZSksIHJldmVhbE9wdGlvbnMpXG4gICAgICAgICAgICA7XG4gICAgICAgICAgICAkKCcjJytwYXR0ZXJubGlicmFyeS5Db25maWcubW9kYWxzLnBsZm91bmRhdGlvbkVsZW1lbnRDbGFzc25hbWUpLmh0bWwoZGF0YSkucGxmb3VuZGF0aW9uKCdvcGVuJyk7XG4gICAgICAgICAgICAkbW9kYWwgPSAkKCcuJytwYXR0ZXJubGlicmFyeS5Db25maWcubW9kYWxzLnBsZm91bmRhdGlvbkVsZW1lbnRDbGFzc25hbWUpO1xuICAgICAgICAgICAgJG1vZGFsLm9uKCdjbG9zZWQuemYucmV2ZWFsJywgcGF0dGVybmxpYnJhcnkuTW9kYWwuY2xvc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyICRtb2RhbERlZmF1bHRzID0ge1xuICAgICAgICAgICAgICAgIHNob3c6IHRydWVcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAkKGRhdGEpLm1vZGFsKCRtb2RhbERlZmF1bHRzKTtcbiAgICAgICAgICAgICRtb2RhbCA9ICQoJy4nK3BhdHRlcm5saWJyYXJ5LkNvbmZpZy5tb2RhbHMuYm9vdHN0cmFwRWxlbWVudENsYXNzbmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICh1cGRhdGVXaW5kb3dIcmVmKSB7XG4gICAgICAgICAgICBwYXR0ZXJubGlicmFyeS5XaW5kb3dIcmVmLnJlc2V0KCk7XG4gICAgICAgICAgICBkb2N1bWVudC5fb2xkX2hyZWYgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZShcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIFwiaHRtbFwiIDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgXCJwYWdlVGl0bGVcIiA6IGRvY3VtZW50LnRpdGxlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcIlwiLFxuICAgICAgICAgICAgICAgIHVwZGF0ZVdpbmRvd0hyZWZcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiAoJG1vZGFsKTtcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIGNsb3NlIG1vZGFsIGRpYWxvZ1xuICAgICAqIFxuICAgICAqIEByZXR1cm4gcGF0dGVybmxpYnJhcnkubGlicy5tb2RhbFxuICAgICAqL1xuICAgIGNsb3NlIDogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoKHR5cGVvZiAkLmZuLm1vZGFsID09ICd1bmRlZmluZWQnKSAmJiAodHlwZW9mIFBMRm91bmRhdGlvbi5SZXZlYWwgPT0gJ3VuZGVmaW5lZCcpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ2pRdWVyeSBNb2RhbCBhbmQvb3IgUExGb3VuZGF0aW9uIFJldmVhbCBwbHVnLWlucyBub3QgZm91bmQuLi4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyICRtb2RhbDtcbiAgICAgICAgLy8gY2xvc2UvZGVzdHJveSBtb2RhbHNcbiAgICAgICAgaWYgKHR5cGVvZiBQTEZvdW5kYXRpb24gIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICRtb2RhbCA9ICQoJy4nK3BhdHRlcm5saWJyYXJ5LkNvbmZpZy5tb2RhbHMucGxmb3VuZGF0aW9uRWxlbWVudENsYXNzbmFtZSk7XG4gICAgICAgICAgICBpZiAoJG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgJG1vZGFsLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgJG1vZGFsLnBsZm91bmRhdGlvbignY2xvc2UnKTtcbiAgICAgICAgICAgICAgICAgICAgLy8kbW9kYWwucGxmb3VuZGF0aW9uKCdkZXN0cm95Jyk7XG4gICAgICAgICAgICAgICAgICAgIC8vJCgnLnJldmVhbC1vdmVybGF5JykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgXHRjb25zb2xlLmluZm8oJ21vZGFsIGNsb3NlZC4uLicpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBcdC8vY29uc29sZS53YXJuKCdtb2RhbCBjb3VsZCBub3QgYmUgY2xvc2VkLi4uIGZvcmNlIHJlbW92YWwuLi4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkbW9kYWwgPSAkKCcuJytwYXR0ZXJubGlicmFyeS5Db25maWcubW9kYWxzLmJvb3RzdHJhcEVsZW1lbnRDbGFzc25hbWUpO1xuICAgICAgICAgICAgaWYgKCRtb2RhbCkge1xuICAgICAgICAgICAgICAgICRtb2RhbC5tb2RhbCgnaGlkZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBjbGVhbiB1cFxuICAgICAgICAkKCdCT0RZJykucmVtb3ZlQ2xhc3MoJ2lzLXJldmVhbC1vcGVuJyk7XG4gICAgICAgICQoJy5yZXZlYWwsIC5yZXZlYWwtd3JhcHBlciwgLm1vZGFsLCAubW9kYWwtYmFja2Ryb3AnKS5yZW1vdmUoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIChyZSlzZXQgZG9jdW1lbnQgVVJMXG4gICAgICAgIHBhdHRlcm5saWJyYXJ5LldpbmRvd0hyZWYucmVzZXQoKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiAodGhpcyk7XG4gICAgfVxuXG4gIH07XG5cbiAgLy8gY29kZSwgcHJpdmF0ZSBmdW5jdGlvbnMsIGV0YyBoZXJlLi4uXG5cbiAgcGF0dGVybmxpYnJhcnkuTW9kYWwgPSB7XG4gICAgICBvcGVuIDogcGF0dGVybmxpYnJhcnkubGlicy5tb2RhbC5vcGVuLFxuICAgICAgY2xvc2UgOiBwYXR0ZXJubGlicmFyeS5saWJzLm1vZGFsLmNsb3NlLFxuICB9O1xuICBcbn0pKGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCwgd2luZG93LnBhdHRlcm5saWJyYXJ5KTtcblxuXG4iLCIvKipcbiAqIFxuICovXG47KGZ1bmN0aW9uICgkLCB3aW5kb3csIGRvY3VtZW50LCBwYXR0ZXJubGlicmFyeSkge1xuICAndXNlIHN0cmljdCc7XG5cblxuICBwYXR0ZXJubGlicmFyeS5saWJzLndpbmRvd2hyZWYgPSB7XG4gICAgbmFtZSA6ICd3aW5kb3docmVmJyxcblxuICAgIHZlcnNpb24gOiAnMC4wLjEnLFxuXG4gICAgc2V0dGluZ3MgOiB7XG4gICAgICBjYWxsYmFjayA6IGZ1bmN0aW9uICgpIHt9XG4gICAgfSxcblxuICAgIGluaXQgOiBmdW5jdGlvbiAoc2NvcGUsIG1ldGhvZCwgb3B0aW9ucykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgLy8gcGF0dGVybmxpYnJhcnkuaW5oZXJpdCh0aGlzLCAnbW9kdWxlbmFtZTEgbW9kdWxlbmFtZTInKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogdXBkYXRlIHdpbmRvdydzIGhyZWYgdG8gVVJMIGFuZCBzYXZlIG9sZCBocmVmXG4gICAgICogXG4gICAgICogQHBhcmFtICBzdHJpbmcgIHVybCAgVVJMIHRvIHVwZGF0ZSB0b1xuICAgICAqIEByZXR1cm4gcGF0dGVybmxpYnJhcnkubGlicy53aW5kb3docmVmXG4gICAgICovXG4gICAgdXBkYXRlIDogZnVuY3Rpb24gKCB1cmwgKSB7XG4gICAgICAgIGlmICggKHVybCA9PSAnJykgfHwgKHVybCA9PSB3aW5kb3cubG9jYXRpb24uaHJlZikgKSB7IHJldHVybjsgfVxuICAgICAgICBcbiAgICAgICAgZG9jdW1lbnQuX29sZF9ocmVmID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZShcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcImh0bWxcIiA6IG51bGwsXG4gICAgICAgICAgICAgICAgXCJwYWdlVGl0bGVcIiA6IGRvY3VtZW50LnRpdGxlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgIHVwZGF0ZVdpbmRvd0hyZWZcbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiAodGhpcyk7XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiByZXNldCB3aW5kb3cncyBocmVmIHRvIHN0b3JlZCBVUkxcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJuIHBhdHRlcm5saWJyYXJ5LmxpYnMud2luZG93aHJlZlxuICAgICAqL1xuICAgIHJlc2V0IDogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoZG9jdW1lbnQuX29sZF9ocmVmKSB7XG4gICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBcImh0bWxcIjpudWxsLFxuICAgICAgICAgICAgICAgICAgICBcInBhZ2VUaXRsZVwiOmRvY3VtZW50LnRpdGxlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcIlwiLFxuICAgICAgICAgICAgICAgIGRvY3VtZW50Ll9vbGRfaHJlZlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKHRoaXMpO1xuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICogY2xlYXIgc3RvcmVkIFVSTFxuICAgICAqIFxuICAgICAqIEByZXR1cm4gcGF0dGVybmxpYnJhcnkubGlicy53aW5kb3docmVmXG4gICAgICovXG4gICAgY2xlYXJPbGRIcmVmIDogZnVuY3Rpb24gKCkge1xuICAgICAgICBkb2N1bWVudC5fb2xkX2hyZWYgPSBudWxsO1xuICAgICAgICByZXR1cm4gKHRoaXMpO1xuICAgIH1cblxuICB9O1xuXG4gIC8vIGNvZGUsIHByaXZhdGUgZnVuY3Rpb25zLCBldGMgaGVyZS4uLlxuXG4gIHBhdHRlcm5saWJyYXJ5LldpbmRvd0hyZWYgPSB7XG4gICAgICB1cGRhdGUgOiBwYXR0ZXJubGlicmFyeS5saWJzLndpbmRvd2hyZWYudXBkYXRlLFxuICAgICAgcmVzZXQgOiBwYXR0ZXJubGlicmFyeS5saWJzLndpbmRvd2hyZWYucmVzZXQsXG4gICAgICBjbGVhciA6IHBhdHRlcm5saWJyYXJ5LmxpYnMud2luZG93aHJlZi5jbGVhck9sZEhyZWZcbiAgfTtcbiAgXG59KShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQsIHdpbmRvdy5wYXR0ZXJubGlicmFyeSk7XG5cblxuIiwiXG4vKipcbiAqIFBsdWdpbiBtb2R1bGUuXG4gKiBAbW9kdWxlIHBsZm91bmRhdGlvbi5wbHVnaW5cbiAqL1xuY2xhc3MgUGx1Z2luIHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBhIHBsdWdpbi5cbiAgICAgKiBAY2xhc3NcbiAgICAgKiBAbmFtZSBQbHVnaW5cbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gYXBwbHkgdGhlIHBsdWdpbiB0by5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuXHQgICAgdGhpcy5fc2V0dXAoZWxlbWVudCwgb3B0aW9ucyk7XG5cdCAgICB2YXIgcGx1Z2luTmFtZSA9IGdldFBsdWdpbk5hbWUodGhpcyk7XG5cdCAgICB0aGlzLnV1aWQgPSBHZXRZb0RpZ2l0cyg2LCBwbHVnaW5OYW1lKTtcblxuXHQgICAgaWYoIXRoaXMuJGVsZW1lbnQuYXR0cihgZGF0YS0ke3BsdWdpbk5hbWV9YCkpeyB0aGlzLiRlbGVtZW50LmF0dHIoYGRhdGEtJHtwbHVnaW5OYW1lfWAsIHRoaXMudXVpZCk7IH1cblx0ICAgIGlmKCF0aGlzLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJykpeyB0aGlzLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJywgdGhpcyk7IH1cblx0ICAgIC8qKlxuXHQgICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBpbml0aWFsaXplZC5cblx0ICAgICAqIEBldmVudCBQbHVnaW4jaW5pdFxuXHQgICAgICovXG5cdCAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoYGluaXQucGwuJHtwbHVnaW5OYW1lfWApO1xuXHR9XG4gICAgXG4gICAgLyoqXG4gICAgICogRGVzdHJveXMgdGhlIHBsdWdpbi5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cbiAgICBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLl9kZXN0cm95KCk7XG4gICAgICAgIHZhciBwbHVnaW5OYW1lID0gZ2V0UGx1Z2luTmFtZSh0aGlzKTtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVBdHRyKGBkYXRhLSR7cGx1Z2luTmFtZX1gKS5yZW1vdmVEYXRhKCd6ZlBsdWdpbicpXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgYmVlbiBkZXN0cm95ZWQuXG4gICAgICAgICAgICAgKiBAZXZlbnQgUGx1Z2luI2Rlc3Ryb3llZFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICAudHJpZ2dlcihgZGVzdHJveWVkLnBsLiR7cGx1Z2luTmFtZX1gKTtcbiAgICAgICAgZm9yKHZhciBwcm9wIGluIHRoaXMpe1xuICAgICAgICAgIHRoaXNbcHJvcF0gPSBudWxsOy8vY2xlYW4gdXAgc2NyaXB0IHRvIHByZXAgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZSBtYWluIGxheW91dC1idWlsZGVyIGluc3RhbmNlLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuICAgIGdldCBfYnVpbGRlciAoKSB7XG4gICAgXHRyZXR1cm4gJCgnW2RhdGEtbGF5b3V0YnVpbGRlcl0nKS5maXJzdCgpLmRhdGEoJ3BhdHRlcm5saWJyYXJ5UGx1Z2luJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0cmlldmUgbWFpbiBsYXlvdXQtYnVpbGRlciB0b29sYmFyIGluc3RhbmNlLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuICAgIGdldCBfdG9vbGJhciAoKSB7XG4gICAgXHRyZXR1cm4gJCgnW2RhdGEtbGF5b3V0dG9vbGJhcl0nKS5maXJzdCgpLmRhdGEoJ3BhdHRlcm5saWJyYXJ5UGx1Z2luJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0cmlldmUgbWFpbiBsYXlvdXQtYnVpbGRlciBsYXlvdXQtYm9keSBpbnN0YW5jZS5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cbiAgICBnZXQgX2JvZHkgKCkge1xuICAgIFx0cmV0dXJuICQoJ1tkYXRhLWxheW91dGJvZHldJykuZmlyc3QoKS5kYXRhKCdwYXR0ZXJubGlicmFyeVBsdWdpbicpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFsaWFzIHRvIHJldHJpZXZlIG1haW4gbGF5b3V0LWJ1aWxkZXIgbGF5b3V0LWJvZHkgaW5zdGFuY2UuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHNlZSBQbHVnaW4uX2JvZHlcbiAgICAgKi9cbiAgICBnZXQgX2xheW91dGJvZHkgKCkge1xuICAgIFx0cmV0dXJuIHRoaXMuX2JvZHk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGlkZSB0aGUgbWFpbiBwbHVnaW4gZWxlbWVudC5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cbiAgICBoaWRlKCkge1xuICAgIFx0dGhpcy4kZWxlbWVudC5oaWRlKCk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIFNob3cgdGhlIG1haW4gcGx1Z2luIGVsZW1lbnQuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICovXG4gICAgc2hvdygpIHtcbiAgICBcdHRoaXMuJGVsZW1lbnQuc2hvdygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGdlbmVyYXRlIGluaXRpYWwgbWFya3VwXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXQgX21hcmt1cCgpIHtcbiAgICBcdHZhciBodG1sID0gW1xuICAgIFx0XHQnPGRpdj4nLFxuICAgIFx0XHQnPC9kaXY+J1xuICAgIFx0XTtcbiAgICBcdFxuICAgIFx0cmV0dXJuICQoaHRtbC5qb2luKCcnKSk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIHJldHVybiBpbml0aWFsIG1hcmt1cFxuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuICAgIFx0cmV0dXJuICh0aGlzLl9tYXJrdXApO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiByZXR1cm4gaW5pdGlhbCBtYXJrdXAgZWxlbWVudHNcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cbiAgICB0b0VsZW1lbnQoKSB7XG4gICAgXHRyZXR1cm4gJCh0aGlzLnRvU3RyaW5nKCkpO1xuICAgIH1cbiAgICBcbn1cbiIsIi8qKlxuICogTGF5b3V0YnVpbGRlciBtb2R1bGUuXG4gKiBAbW9kdWxlIHBhdHRlcm5saWJyYXJ5LmxheW91dGJ1aWxkZXJcbiAqIFxuICogQHJlcXVpcmVzIHBhdHRlcm5saWJyYXJ5LlBsdWdpblxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24uVHJpZ2dlcnNcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLktleWJvYXJkXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi5NZWRpYVF1ZXJ5XG4gKi9cbmNsYXNzIExheW91dGJ1aWxkZXIgZXh0ZW5kcyBQbHVnaW4ge1xuXG4gICAgLyoqXG4gICAgICogU2V0dXAgYSBuZXcgaW5zdGFuY2Ugb2YgYSBsYXlvdXRidWlsZGVyLlxuICAgICAqIEBjbGFzc1xuICAgICAqIEBuYW1lIExheW91dGJ1aWxkZXJcbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGEgbGF5b3V0YnVpbGRlci5cbiAgICAgKiAgICAgICAgT2JqZWN0IHNob3VsZCBiZSBvZiB0aGUgbGF5b3V0YnVpbGRlciBwYW5lbCwgcmF0aGVyIHRoYW4gaXRzIGFuY2hvci5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAgICovXG5cdF9zZXR1cChlbGVtZW50LCBvcHRpb25zKSB7XG5cdFx0aWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRidWlsZGVyIGluaXQnKTtcbiAgICBcdHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgTGF5b3V0YnVpbGRlci5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICdsYXlvdXRidWlsZGVyJzsgLy8gaWU5IGJhY2sgY29tcGF0XG5cbiAgICAgICAgLy8gVHJpZ2dlcnMgaW5pdCBpcyBpZGVtcG90ZW50LCBqdXN0IG5lZWQgdG8gbWFrZSBzdXJlIGl0IGlzIGluaXRpYWxpemVkXG4gICAgICAgIFBMRm91bmRhdGlvbi5UcmlnZ2Vycy5pbml0KCQpO1xuXG4gICAgICAgIHRoaXMuX2luaXQoKTtcblxuICAgICAgICAvLyAobWF5YmUsIHRoaXMgbGluZSBpcyBub3QgbmVzc2Vzc2FyeSBhbnltb3JlLi4uPyEpXG4gICAgICAgIC8vUExGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdMYXlvdXRidWlsZGVyJyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKCkuZmlyc3QoKS5mb2N1cygpO1xuICAgICAgICBpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGJ1aWxkZXIgaW5pdGlhbGl6ZWQnKTtcbiAgICB9XG5cdFxuXHQvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgcGx1Z2luIGJ5IHNldHRpbmcvY2hlY2tpbmcgb3B0aW9ucyBhbmQgYXR0cmlidXRlcywgYWRkaW5nIGhlbHBlciB2YXJpYWJsZXMsIGFuZCBzYXZpbmcgdGhlIGFuY2hvci5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0KCkge1xuXG4gICAgXHR0aGlzLl9jaGVja0RlZXBMaW5rKCk7XG5cdCAgICB0aGlzLl9ldmVudHMoKTtcblxuXHQgICAgdGhpcy5faW5pdFRvb2xiYXIoKTtcblx0ICAgIHRoaXMuX2luaXREb2N1bWVudGJvZHkoKTtcblx0ICAgIFxuXHQgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdpbml0aWFsaXplZC5wbC5sYXlvdXRidWlsZGVyJyk7XG5cdCAgICBcbiAgICB9XG4gICAgXG4gICAgX2luaXREb2N1bWVudGJvZHkgKCkge1xuICAgIH1cbiAgICBcbiAgICBfaW5pdFRvb2xiYXIgKCkge1xuICAgIFx0dmFyICR0b29sYmFyO1xuICAgIFx0aWYgKCB0aGlzLiRlbGVtZW50LmZpbmQoJz4gW2RhdGEtbGF5b3V0dG9vbGJhcl0nKS5sZW5ndGggPT0gMCApIHtcbiAgICAgICAgICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0YnVpbGRlciBnZW5lcmF0ZSB0b29sYmFyJyk7XG4gICAgXHRcdHRoaXMuJGVsZW1lbnQucHJlcGVuZChMYXlvdXR0b29sYmFyLnByb3RvdHlwZS50b0VsZW1lbnQoKSk7XG4gICAgXHRcdCR0b29sYmFyID0gbmV3IExheW91dHRvb2xiYXIgKHRoaXMuJGVsZW1lbnQuZmluZCgnPiBbZGF0YS1sYXlvdXR0b29sYmFyXScpLmZpcnN0KCkpO1xuICAgIFx0fSBlbHNlIHtcbiAgICBcdFx0JHRvb2xiYXIgPSB0aGlzLl90b29sYmFyO1xuICAgIFx0fVxuICAgICAgICBpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGJ1aWxkZXIgdG9vbGJhciBpbml0aWFsaXplZDogJywgJHRvb2xiYXIpO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVycyB0byB0aGUgZWxlbWVudCB1dGlsaXppbmcgdGhlIHRyaWdnZXJzIHV0aWxpdHkgbGlicmFyeS5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9ldmVudHMoKSB7XG4gICAgICAgIHRoaXMuX2FkZEtleUhhbmRsZXIoKTtcbiAgICAgICAgdGhpcy5fYWRkQ2xpY2tIYW5kbGVyKCk7XG4gICAgICAgIC8vdGhpcy5fYWRkRm9jdXNIYW5kbGVyKCk7XG5cbiAgICAgICAgJCh3aW5kb3cpLm9uKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCB0aGlzLl9zZXRNcUhhbmRsZXIuYmluZCh0aGlzKSk7XG4gICAgICAgIFxuICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5wbC5sYXlvdXRidWlsZGVyJywgKCkgPT4geyBpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGJ1aWxkZXIgcmVzaXplIHRyaWdnZXIgdGVzdCcpOyB9KTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICAgICAgICAkKHdpbmRvdykub24oJ3BvcHN0YXRlJywgdGhpcy5fY2hlY2tEZWVwTGluayk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGNsaWNrIGhhbmRsZXJzIGZvciBpdGVtcyB3aXRoaW4gdGhlIHRhYnMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkQ2xpY2tIYW5kbGVyKCkge1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgY2xpY2sgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgdGFicy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRGb2N1c0hhbmRsZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy4kZWxlbWVudFxuICAgICAgICAgICAgLm9mZignZm9jdXNlZC5wbC5sYXlvdXRlbGVtZW50LHVuZm9jdXNlZC5wbC5sYXlvdXRlbGVtZW50JylcbiAgICAgICAgICAgIC5vbiAoJ2ZvY3VzZWQucGwubGF5b3V0ZWxlbWVudCx1bmZvY3VzZWQucGwubGF5b3V0ZWxlbWVudCcsICdbZGF0YS1sYXlvdXRyb3ddLFtkYXRhLWxheW91dGNvbHVtbl0sW2RhdGEtbGF5b3V0cGF0dGVybl0nICwgZnVuY3Rpb24oZSl7XG5cbiAgICAgICAgICAgIFx0aWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRidWlsZGVyIGVsZW1lbnQgZm9jdXMgaGFuZGxlcjonLCB0aGlzLCBlKTtcbiAgICAgICAgXHQgICAgX3RoaXMuJGVsZW1lbnQudHJpZ2dlcignZm9jdXNjaGFuZ2UucGwubGF5b3V0YnVpbGRlcicpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIF90aGlzLnN3aXRjaFRvb2xiYXJzZWN0aW9ucy5hcHBseShfdGhpcywgW2UuY3VycmVudFRhcmdldF0pO1xuICAgICAgICBcdCAgICBcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBrZXlib2FyZCBldmVudCBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSB0YWJzLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgc3dpdGNoVG9vbGJhcnNlY3Rpb25zKCBmb2N1c2VkX2VsZW1lbnQgKSB7XG4gICAgXHR2YXIgJGZvY3VzID0gJChmb2N1c2VkX2VsZW1lbnQpO1xuXG4gICAgICAgIGlmICgkZm9jdXMuZGF0YSgncGF0dGVybmxpYnJhcnlQbHVnaW4nKSBpbnN0YW5jZW9mIExheW91dGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuX3Rvb2xiYXIuc3dpdGNoU2VjdGlvbigkZm9jdXMuZGF0YSgncGF0dGVybmxpYnJhcnlQbHVnaW4nKS5jbGFzc25hbWUsICRmb2N1cyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGtleWJvYXJkIGV2ZW50IGhhbmRsZXJzIGZvciBpdGVtcyB3aXRoaW4gdGhlIHRhYnMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkS2V5SGFuZGxlcigpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKCkub2ZmKCdrZXlkb3duLnBsLmxheW91dGJ1aWxkZXInKS5vbigna2V5ZG93bi5wbC5sYXlvdXRidWlsZGVyJywgZnVuY3Rpb24oZSl7XG5cbiAgICBcdCAgICB0aGlzLmlkID0gR2V0WW9EaWdpdHMoNiwgJ0xheW91dGJ1aWxkZXInKTtcblx0ICAgIFx0Lypcblx0ICAgIFx0ICogaWdub3JlIFRBQiBrZXlcblx0ICAgIFx0ICogIFxuXHQgICAgXHQgKiBjb25zdCBrZXlDb2RlcyA9IHtcblx0ICAgIFx0ICogICA5IDogJ1RBQicsXG5cdCAgICBcdCAqICAgMTM6ICdFTlRFUicsXG5cdCAgICBcdCAqICAgMjc6ICdFU0NBUEUnLFxuXHQgICAgXHQgKiAgIDMyOiAnU1BBQ0UnLFxuXHQgICAgXHQgKiAgIDM1OiAnRU5EJyxcblx0ICAgIFx0ICogICAzNjogJ0hPTUUnLFxuXHQgICAgXHQgKiAgIDM3OiAnQVJST1dfTEVGVCcsXG5cdCAgICBcdCAqICAgMzg6ICdBUlJPV19VUCcsXG5cdCAgICBcdCAqICAgMzk6ICdBUlJPV19SSUdIVCcsXG5cdCAgICBcdCAqICAgNDA6ICdBUlJPV19ET1dOJ1xuXHQgICAgXHQgKiB9XG5cdCAgICAgXHQgKiBcblx0ICAgIFx0ICovXG5cdCAgICAgICAgaWYgKGUud2hpY2ggPT09IDkpIHJldHVybjtcblx0XG5cdCAgICAgICAgdmFyICRlbGVtZW50ID0gJCh0aGlzKTtcblx0XG5cdCAgICAgICAgLy8gaGFuZGxlIGtleWJvYXJkIGV2ZW50IHdpdGgga2V5Ym9hcmQgdXRpbFxuXHQgICAgICAgIFBMRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ0xheW91dGJ1aWxkZXInLCB7XG5cdCAgICAgICAgICAgIG9wZW46IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdCAgICAgICAgICAgIFx0aWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdvcGVuIGV2ZW50OicsIGUpXG5cdCAgICAgICAgICAgICAgICBfdGhpcy5vcGVuKCRlbGVtZW50KTtcblx0ICAgICAgICAgICAgfSxcblx0ICAgICAgICAgICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xuXHQgICAgICAgICAgICAgICAgX3RoaXMuY2xvc2UoJGVsZW1lbnQpO1xuXHQgICAgICAgICAgICB9LFxuXHQgICAgICAgICAgICBoYW5kbGVkOiBmdW5jdGlvbigpIHtcblx0ICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdCAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICB9KTtcblxuXHQgICAgICAgIFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyByZWdpc3RlciBrZXlib2FyZCBrZXlzIG1hcHBpbmdcbiAgICAgICAgUExGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdMYXlvdXRidWlsZGVyJywge1xuICAgICAgICAgICAgJ0VOVEVSJyAgICA6ICdvcGVuJyxcbiAgICAgICAgICAgICdBTFRfU1BBQ0UnOiAnb3BlbicsXG4gICAgICAgICAgICAnRVNDQVBFJyAgIDogJ2Nsb3NlJ1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBrZXlib2FyZCBldmVudCBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSB0YWJzLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldE1xSGFuZGxlcihlKSB7XG4gICAgXHRpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGJ1aWxkZXIgbWVkaWEgcXVlcnkgY2hhbmdlJyk7XG4gICAgICAgICQoZG9jdW1lbnQpLmZvY3VzKCk7XG4gICAgICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpO1xuXHQgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdyZXNpemUucGwubGF5b3V0YnVpbGRlcicpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGZvciBhbmNob3IvZGVlcC1saW5rIFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cdF9jaGVja0RlZXBMaW5rKCkge1xuXHQgICAgdmFyIGFuY2hvciA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuXHQgICAgXG5cdCAgICAvL25lZWQgYSBoYXNoIGFuZCBhIHJlbGV2YW50IGFuY2hvclxuXHQgICAgaWYoYW5jaG9yLmxlbmd0aCkge1xuXHQgICAgXHQvLyBmaW5kIHRoZSBhbmNob3IvZGVlcGxpbmsgYWN0aW9uXG5cdCAgICAgICAgdmFyICRsaW5rID0gdGhpcy4kZWxlbWVudC5maW5kKCdbaHJlZiQ9XCInK2FuY2hvcisnXCJdJyk7XG5cdCAgICAgICAgaWYgKCRsaW5rLmxlbmd0aCkge1xuXG5cdCAgICAgICAgXHQvLyAuLi5hbmQgZG8geW91ciBzdHVmZlxuXHQgICAgICAgIFx0XG5cdCAgICAgICAgICAgIC8qKlxuXHQgICAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSB6cGx1Z2luIGhhcyBkZWVwbGlua2VkIGF0IHBhZ2Vsb2FkXG5cdCAgICAgICAgICAgICAqIEBldmVudCBUYWJzI2RlZXBsaW5rXG5cdCAgICAgICAgICAgICAqL1xuXHQgICAgICAgIFx0aWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRidWlsZGVyIGRlZXAtbGluazonLCBhbmNob3IpO1xuXHQgICAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2RlZXBsaW5rLnBsLmxheW91dGJ1aWxkZXInLCBbJGxpbmssICQoYW5jaG9yKV0pO1xuXHQgICAgICAgIH1cblx0ICAgIH1cblx0fVxuICAgIFxuICAgIC8qKlxuICAgICAqIERlc3Ryb3lzIHRoZSBsYXlvdXRidWlsZGVyLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuICAgIF9kZXN0cm95KCkge1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZignLnBsLmxheW91dGJ1aWxkZXInKS5oaWRlKCk7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oKS5vZmYoJy5wbC5sYXlvdXRidWlsZGVyJyk7XG4gICAgICAgICQoZG9jdW1lbnQuYm9keSkub2ZmKCcucGwubGF5b3V0YnVpbGRlcicpO1xuICAgICAgICAkKHdpbmRvdykub2ZmKCcucGwubGF5b3V0YnVpbGRlcicpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogb3Blbi4uLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBhY2Nlc3MgcHVibGljXG4gICAgICovXG4gICAgb3BlbigpIHtcbiAgICBcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0YnVpbGRlciBvcGVuJyk7XG5cdCAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ29wZW4ucGwubGF5b3V0YnVpbGRlcicpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGNsb3NlLi4uXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQGFjY2VzcyBwdWJsaWNcbiAgICAgKi9cbiAgICBjbG9zZSgpIHtcbiAgICBcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0YnVpbGRlciBjbG9zZScpO1xuXHQgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdjbG9zZS5wbC5sYXlvdXRidWlsZGVyJyk7XG4gICAgfVxuXG59XG5cbkxheW91dGJ1aWxkZXIuZGVmYXVsdHMgPSB7XG5cdGNsYXNzQ29sUHJlZml4IDogXCJcIixcblx0Y2xhc3NSb3cgICAgICAgOiBcInJvd1wiLFxuXHRjbGFzc1NpemVzICAgICA6IFwiWydzbWFsbCcsJ21lZGl1bScsJ2xhcmdlJywneGxhcmdlJywneHhsYXJnZSddXCIsXG5cdGNvbHVtbk1heCAgICAgIDogMTJcbn1cblxudmFyIExheW91dGJ1aWxkZXJDbGlja2R1bW15ID0gKGUpID0+IHtcblx0dmFyICR0aGlzID0gJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ3BhdHRlcm5saWJyYXJ5UGx1Z2luJyk7XG4gICAgaWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXR0b29sYmFyYWN0aW9uIGl0ZW0gY2xpY2tlZDonLCBlLCAkdGhpcyk7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG59XG4vL1BMRm91bmRhdGlvbi5wbHVnaW4oTGF5b3V0YnVpbGRlciwgJ0xheW91dGJ1aWxkZXInKTtcbnBhdHRlcm5saWJyYXJ5LnBsdWdpbihMYXlvdXRidWlsZGVyLCAnTGF5b3V0YnVpbGRlcicpO1xuXG4iLCIvKipcbiAqIExheW91dGJvZHkgbW9kdWxlLlxuICogQG1vZHVsZSBwYXR0ZXJubGlicmFyeS5sYXlvdXRib2R5XG4gKiBcbiAqIEByZXF1aXJlcyBwYXR0ZXJubGlicmFyeS5MYXlvdXRlbGVtZW50XG4gKiBAcmVxdWlyZXMgcGF0dGVybmxpYnJhcnkuUGx1Z2luXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi5UcmlnZ2Vyc1xuICovXG5jbGFzcyBMYXlvdXRib2R5IGV4dGVuZHMgUGx1Z2luIHtcblxuICAgIC8qKlxuICAgICAqIFNldHVwIGEgbmV3IGluc3RhbmNlIG9mIGEgbGF5b3V0Ym9keS5cbiAgICAgKiBAY2xhc3NcbiAgICAgKiBAbmFtZSBMYXlvdXRib2R5XG4gICAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhIGxheW91dGJvZHkuXG4gICAgICogICAgICAgIE9iamVjdCBzaG91bGQgYmUgb2YgdGhlIGxheW91dGJvZHkgcGFuZWwsIHJhdGhlciB0aGFuIGl0cyBhbmNob3IuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgICAqL1xuXHRfc2V0dXAoZWxlbWVudCwgb3B0aW9ucykge1xuXHRcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0Ym9keSBpbml0Jyk7XG4gICAgXHR0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIExheW91dGJvZHkuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbGF5b3V0Ym9keSc7IC8vIGllOSBiYWNrIGNvbXBhdFxuXG4gICAgICAgIC8vIFRyaWdnZXJzIGluaXQgaXMgaWRlbXBvdGVudCwganVzdCBuZWVkIHRvIG1ha2Ugc3VyZSBpdCBpcyBpbml0aWFsaXplZFxuICAgICAgICBQTEZvdW5kYXRpb24uVHJpZ2dlcnMuaW5pdCgkKTtcblxuICAgICAgICB0aGlzLl9pbml0KCk7XG5cbiAgICAgICAgLy8gKG1heWJlLCB0aGlzIGxpbmUgaXMgbm90IG5lc3Nlc3NhcnkgYW55bW9yZS4uLj8hKVxuICAgICAgICAvL1BMRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnTGF5b3V0Ym9keScpO1xuICAgICAgICBcbiAgICAgICAgaWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRib2R5IGluaXRpYWxpemVkJyk7XG4gICAgfVxuXHRcblx0LyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIHBsdWdpbiBieSBzZXR0aW5nL2NoZWNraW5nIG9wdGlvbnMgYW5kIGF0dHJpYnV0ZXMsIGFkZGluZyBoZWxwZXIgdmFyaWFibGVzLCBhbmQgc2F2aW5nIHRoZSBhbmNob3IuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdCgpIHtcblx0ICAgIHRoaXMuX2V2ZW50cygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIHRoZSBlbGVtZW50IHV0aWxpemluZyB0aGUgdHJpZ2dlcnMgdXRpbGl0eSBsaWJyYXJ5LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2V2ZW50cygpIHtcbiAgICBcdHRoaXMuX2FkZEtleUhhbmRsZXIoKTtcbiAgICBcdHRoaXMuX2FkZENsaWNrSGFuZGxlcigpO1xuICAgIFx0dGhpcy5fYWRkRnVsbHNjcmVlbkhhbmRsZXIoKTtcbiAgICB9XG4gICAgXG4gICAgX2FkZEZ1bGxzY3JlZW5IYW5kbGVyICgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIFx0dGhpcy4kZWxlbWVudFxuXHQgICAgICAgIC5vZmYoJ2Z1bGxzY3JlZW4ucGwubGF5b3V0Ym9keScpXG5cdCAgICAgICAgLm9uKCdmdWxsc2NyZWVuLnBsLmxheW91dGJvZHknLCBmdW5jdGlvbihlKXtcblx0XG5cdCAgICBcdCAgICBfdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdmdWxsc2NyZWVuLXN3aXRjaGVkLnBsLmxheW91dGJvZHknKTtcblx0ICAgIFx0ICAgIFxuXHQgICAgICAgICAgICBpZiAoIV90aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdmdWxsc2NyZWVuJykpIHtcblx0ICAgICAgICAgICAgXHRfdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnZnVsbHNjcmVlbicpO1xuXHQgICAgICAgICAgICBcdF90aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2NsaWNrLnBsLmxheW91dGJvZHknKTtcblx0XHQgICAgICAgIH0gZWxzZSB7XG5cdFx0ICAgICAgICBcdF90aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKCdmdWxsc2NyZWVuJyk7XG5cdFx0ICAgICAgICB9XG5cblx0ICAgICAgICAgICAgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5ibHVyKCk7XG4gICAgICAgICAgICAgICAgXG5cdCAgICAgICAgICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0Ym9keSBzd2l0Y2ggZnVsbHNjcmVlbjonLCBkb2N1bWVudC5hY3RpdmVFbGVtZW50LCBlKTtcblx0ICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgXG5cdCAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgX2FkZENsaWNrSGFuZGxlciAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBcdHRoaXMuJGVsZW1lbnRcblx0ICAgICAgICAub2ZmKCdjbGljay5wbC5sYXlvdXRib2R5Jylcblx0ICAgICAgICAub24oJ2NsaWNrLnBsLmxheW91dGJvZHknLCBmdW5jdGlvbihlKXtcblx0ICAgICAgICBcdFxuXHQgICAgICAgIFx0aWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRib2R5IGZvY3VzZWQ6JywgdGhpcywgZSk7XG5cdCAgICBcdCAgICBfdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdmb2N1c2VkLnBsLmxheW91dGJvZHknKTtcblx0ICAgIFx0ICAgIFxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdCAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogQWRkcyBrZXlib2FyZCBldmVudCBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSB0YWJzLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZEtleUhhbmRsZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgJCh3aW5kb3cpXG4gICAgICAgICAgICAvLy5vZmYoJ2tleWRvd24ucGwubGF5b3V0Ym9keScpXG4gICAgICAgICAgICAub24oJ2tleWRvd24ucGwubGF5b3V0Ym9keScsIGZ1bmN0aW9uKGUpe1xuXG4gICAgXHQgICAgdGhpcy5pZCA9IEdldFlvRGlnaXRzKDYsICdMYXlvdXRib2R5Jyk7XG5cdCAgICBcdC8qXG5cdCAgICBcdCAqIGlnbm9yZSBUQUIga2V5XG5cdCAgICBcdCAqICBcblx0ICAgIFx0ICogY29uc3Qga2V5Q29kZXMgPSB7XG5cdCAgICBcdCAqICAgOSA6ICdUQUInLFxuXHQgICAgXHQgKiAgIDEzOiAnRU5URVInLFxuXHQgICAgXHQgKiAgIDI3OiAnRVNDQVBFJyxcblx0ICAgIFx0ICogICAzMjogJ1NQQUNFJyxcblx0ICAgIFx0ICogICAzNTogJ0VORCcsXG5cdCAgICBcdCAqICAgMzY6ICdIT01FJyxcblx0ICAgIFx0ICogICAzNzogJ0FSUk9XX0xFRlQnLFxuXHQgICAgXHQgKiAgIDM4OiAnQVJST1dfVVAnLFxuXHQgICAgXHQgKiAgIDM5OiAnQVJST1dfUklHSFQnLFxuXHQgICAgXHQgKiAgIDQwOiAnQVJST1dfRE9XTidcblx0ICAgIFx0ICogfVxuXHQgICAgIFx0ICogXG5cdCAgICBcdCAqL1xuXHQgICAgICAgIGlmIChlLndoaWNoID09PSA5KSByZXR1cm47XG5cdFxuXHQgICAgICAgIHZhciAkZWxlbWVudCA9ICQodGhpcyk7XG5cdFxuXHQgICAgICAgIC8vIGhhbmRsZSBrZXlib2FyZCBldmVudCB3aXRoIGtleWJvYXJkIHV0aWxcblx0ICAgICAgICBQTEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdMYXlvdXRib2R5Jywge1xuXHQgICAgICAgIFx0c3dpdGNoOiBmdW5jdGlvbigpIHtcblx0ICAgICAgICAgICAgICAgIF90aGlzLnN3aXRjaEZ1bGxzY3JlZW4oKTtcblx0ICAgICAgICAgICAgICAgIFxuXHQgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblx0ICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblx0ICAgICAgICAgICAgfSxcblx0ICAgICAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24oKSB7XG5cdCAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXHQgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgfSk7XG5cblx0ICAgICAgICBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gcmVnaXN0ZXIga2V5Ym9hcmQga2V5cyBtYXBwaW5nXG4gICAgICAgIFBMRm91bmRhdGlvbi5LZXlib2FyZC5yZWdpc3RlcignTGF5b3V0Ym9keScsIHtcbiAgICAgICAgICAgICdFU0NBUEUnICAgICA6ICdzd2l0Y2gnLFxuICAgICAgICAgICAgJ0NUUkxfQUxUX0YnIDogJ3N3aXRjaCcsXG4gICAgICAgICAgICAnQUxUX0NUUkxfRicgOiAnc3dpdGNoJ1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlcyBsYXlvdXQtYm9keSdzIGZ1bGxzY3JlZW4gZGlzcGxheVxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgc3dpdGNoRnVsbHNjcmVlbigpIHtcbiAgICAgICAgLyppZiAoIXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2Z1bGxzY3JlZW4nKSkge1xuICAgICAgICBcdHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2Z1bGxzY3JlZW4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgXHR0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKCdmdWxsc2NyZWVuJyk7XG4gICAgICAgIH0qL1xuXG4gICAgXHRpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGJvZHkgc3dpdGNoIGZ1bGxzY3JlZW4nKTtcblx0ICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignZnVsbHNjcmVlbi5wbC5sYXlvdXRib2R5Jyk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIERlc3Ryb3lzIHRoZSBsYXlvdXRib2R5LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuICAgIF9kZXN0cm95KCkge1xuICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoJyonKS5vZmYoJy5wbC5sYXlvdXRib2R5Jyk7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcucGwubGF5b3V0Ym9keScpO1xuICAgICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZSgpO1xuICAgIH1cblx0XHRcbn1cblxuLy9QTEZvdW5kYXRpb24ucGx1Z2luKExheW91dGJvZHksICdMYXlvdXRib2R5Jyk7XG5wYXR0ZXJubGlicmFyeS5wbHVnaW4oTGF5b3V0Ym9keSwgJ0xheW91dGJvZHknKTtcblxuIiwiLyoqXG4gKiBMYXlvdXR0b29sYmFyc2VjdGlvbkJ1aWxkZXIgbW9kdWxlLlxuICogXG4gKiBAbW9kdWxlIHBhdHRlcm5saWJyYXJ5LkxheW91dHRvb2xiYXJzZWN0aW9uQnVpbGRlclxuICogXG4gKiBAcmVxdWlyZXMgcGF0dGVybmxpYnJhcnkuTGF5b3V0dG9vbGJhcnNlY3Rpb25cbiAqL1xudmFyIExheW91dHRvb2xiYXJzZWN0aW9uQnVpbGRlciA9IHtcblx0bmFtZSAgOiAnYnVpbGRlcicsXG5cdGl0ZW1zIDogW1xuXHRcdHtcblx0XHRcdHR5cGUgIDogJ2FjdGlvbicsXG5cdFx0XHRsYWJlbCA6ICdsb2FkIGxheW91dCcsXG5cdFx0XHRhY3Rpb246ICcjbG9hZF9sYXlvdXQnLFxuXHRcdFx0aWNvbiAgOiAnZmEgZmEtZm9sZGVyLW9wZW4nXG5cdFx0fSxcblx0XHR7XG5cdFx0XHR0eXBlICA6ICdhY3Rpb24nLFxuXHRcdFx0bGFiZWwgOiAnc2F2ZSBsYXlvdXQnLFxuXHRcdFx0YWN0aW9uOiAnI2xvYWRfbGF5b3V0Jyxcblx0XHRcdGljb24gIDogJ2ZhIGZhLXNhdmUnXG5cdFx0fSxcblx0XHR7ICAgdHlwZSAgOiAnc2VwYXJhdG9yJyB9LFxuXHRcdHtcblx0XHRcdHR5cGUgIDogJ2FjdGlvbicsXG5cdFx0XHRsYWJlbCA6ICdzaG93IHNvdXJjZScsXG5cdFx0XHRhY3Rpb246ICcjc2hvd19zb3VyY2UnLFxuXHRcdFx0aWNvbiAgOiAnZmEgZmEtY29kZSdcblx0XHR9LFxuXHRcdHsgICB0eXBlICA6ICdzZXBhcmF0b3InIH0sXG5cdFx0e1xuXHRcdFx0dHlwZSAgOiAnYWN0aW9uJyxcblx0XHRcdGxhYmVsIDogJ3N3aXRjaCBmdWxsc2NyZWVuJyxcblx0XHRcdGFjdGlvbjogJyNzd2l0Y2hfZnVsbHNjcmVlbicsXG5cdFx0XHRpY29uICA6ICdmYSBmYS10dicsXG5cdFx0XHRldmVudHM6IHtcblx0XHRcdCAgICBjbGljayA6IChlKSA9PiB7XG5cdFx0XHQgICAgXHQvL3ZhciAkbGF5b3V0Ym9keSA9ICQoJ1tkYXRhLWxheW91dGJvZHldJyk7XG5cdFx0XHQgICAgXHR2YXIgJHRoaXMgPSAkKGUuY3VycmVudFRhcmdldCkuZGF0YSgncGF0dGVybmxpYnJhcnlQbHVnaW4nKTtcblx0XHRcdCAgICAgICAgaWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXR0b29sYmFyYWN0aW9uIGZ1bGxzY3JlZW4gc3dpdGNoIGNsaWNrZWQ6JywgZSwgJHRoaXMpO1xuXHRcdFx0ICAgIFx0Ly8kbGF5b3V0Ym9keS5kYXRhKCdwYXR0ZXJubGlicmFyeVBsdWdpbicpLnN3aXRjaEZ1bGxzY3JlZW4oKTtcblx0XHRcdCAgICBcdCR0aGlzLl9sYXlvdXRib2R5LnN3aXRjaEZ1bGxzY3JlZW4oKTtcblx0XHQgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdCAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdCAgICAgICAgaWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXR0b29sYmFyYWN0aW9uIGZ1bGxzY3JlZW4gc3dpdGNoIGNsaWNrJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdHsgICB0eXBlICA6ICdzZXBhcmF0b3InIH0sXG5cdFx0e1xuXHRcdFx0dHlwZSAgOiAnYWN0aW9uJyxcblx0XHRcdGxhYmVsIDogJ2VkaXQgc2V0dGluZ3MnLFxuXHRcdFx0YWN0aW9uOiAnI2VkaXRfc2V0dGluZ3MnLFxuXHRcdFx0aWNvbiAgOiAnZmEgZmEtY29ncydcblx0XHR9XG5cdF1cbn07XG4iLCIvKipcbiAqIExheW91dHRvb2xiYXJzZWN0aW9uTGF5b3V0Y29sdW1uIG1vZHVsZS5cbiAqIFxuICogQG1vZHVsZSBwYXR0ZXJubGlicmFyeS5MYXlvdXR0b29sYmFyc2VjdGlvbkxheW91dGNvbHVtblxuICogXG4gKiBAcmVxdWlyZXMgcGF0dGVybmxpYnJhcnkuTGF5b3V0dG9vbGJhcnNlY3Rpb25cbiAqL1xudmFyIExheW91dHRvb2xiYXJzZWN0aW9uTGF5b3V0Y29sdW1uID0ge1xuXHRuYW1lICA6ICdsYXlvdXRjb2x1bW4nLFxuXHRpdGVtcyA6IFtcblx0XHQvKntcblx0XHRcdHR5cGUgIDogJ2FjdGlvbicsXG5cdFx0XHRsYWJlbCA6ICdtb3ZlIGVsZW1lbnQnLFxuXHRcdFx0YWN0aW9uOiAnI21vdmVfZWxlbWVudCcsXG5cdFx0XHRpY29uICA6ICdmYSBmYS1iYXJzIGZhLXJvdGF0ZS05MCcsXG5cdFx0XHRldmVudHM6IHtcblx0XHRcdCAgICBjbGljayA6IExheW91dGJ1aWxkZXJDbGlja2R1bW15XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR7ICAgdHlwZSAgOiAnc2VwYXJhdG9yJyB9LCovXG5cdFx0e1xuXHRcdFx0dHlwZSAgOiAnYWN0aW9uJyxcblx0XHRcdGxhYmVsIDogJ2FkZCBjb2x1bW4nLFxuXHRcdFx0YWN0aW9uOiAnI2FkZF9jb2x1bW4nLFxuXHRcdFx0aWNvbiAgOiAnZmEgZmEtcGx1cycsXG5cdFx0XHRldmVudHM6IHtcblx0XHRcdCAgICBjbGljayA6IExheW91dGJ1aWxkZXJDbGlja2R1bW15XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR7XG5cdFx0XHR0eXBlICA6ICdhY3Rpb24nLFxuXHRcdFx0bGFiZWwgOiAncmVtb3ZlIHJvdycsXG5cdFx0XHRhY3Rpb246ICcjcmVtb3ZlX3JvdycsXG5cdFx0XHRpY29uICA6ICdmYSBmYS1taW51cycsXG5cdFx0XHRldmVudHM6IHtcblx0XHRcdCAgICBjbGljayA6IExheW91dGJ1aWxkZXJDbGlja2R1bW15XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR7ICAgdHlwZSAgOiAnc2VwYXJhdG9yJyB9LFxuXHRcdHtcblx0XHRcdHR5cGUgIDogJ2FjdGlvbicsXG5cdFx0XHRsYWJlbCA6ICdhZGQgcGF0dGVybicsXG5cdFx0XHRhY3Rpb246ICcjYWRkX3BhdHRlcm4nLFxuXHRcdFx0aWNvbiAgOiAnZmEgZmEtcHV6emxlLXBpZWNlJyxcblx0XHRcdGV2ZW50czoge1xuXHRcdFx0ICAgIGNsaWNrIDogTGF5b3V0YnVpbGRlckNsaWNrZHVtbXlcblx0XHRcdH1cblx0XHR9LFxuXHRcdHsgICB0eXBlICA6ICdzZXBhcmF0b3InIH0sXG5cdFx0e1xuXHRcdFx0dHlwZSAgOiAnYWN0aW9uJyxcblx0XHRcdGxhYmVsIDogJ2VkaXQgc2V0dGluZ3MnLFxuXHRcdFx0YWN0aW9uOiAnI2VkaXRfc2V0dGluZ3MnLFxuXHRcdFx0aWNvbiAgOiAnZmEgZmEtY29ncycsXG5cdFx0XHRldmVudHM6IHtcblx0XHRcdCAgICBjbGljayA6IExheW91dGJ1aWxkZXJDbGlja2R1bW15XG5cdFx0XHR9XG5cdFx0fVxuXHRdXG59O1xuIiwiLyoqXG4gKiBMYXlvdXR0b29sYmFyc2VjdGlvbkxheW91dHJvdyBtb2R1bGUuXG4gKiBcbiAqIEBtb2R1bGUgcGF0dGVybmxpYnJhcnkuTGF5b3V0dG9vbGJhcnNlY3Rpb25MYXlvdXRyb3dcbiAqIFxuICogQHJlcXVpcmVzIHBhdHRlcm5saWJyYXJ5LkxheW91dHRvb2xiYXJzZWN0aW9uXG4gKi9cbnZhciBMYXlvdXR0b29sYmFyc2VjdGlvbkxheW91dHJvdyA9IHtcblx0bmFtZSAgOiAnbGF5b3V0cm93Jyxcblx0aXRlbXMgOiBbXG5cdFx0Lyp7XG5cdFx0XHR0eXBlICA6ICdhY3Rpb24nLFxuXHRcdFx0bGFiZWwgOiAnbW92ZSBlbGVtZW50Jyxcblx0XHRcdGFjdGlvbjogJyNtb3ZlX2VsZW1lbnQnLFxuXHRcdFx0aWNvbiAgOiAnZmEgZmEtYmFycycsXG5cdFx0XHRldmVudHM6IHtcblx0XHRcdCAgICBjbGljayA6IExheW91dGJ1aWxkZXJDbGlja2R1bW15XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR7ICAgdHlwZSAgOiAnc2VwYXJhdG9yJyB9LCovXG5cdFx0e1xuXHRcdFx0dHlwZSAgOiAnYWN0aW9uJyxcblx0XHRcdGxhYmVsIDogJ2FkZCBjb2x1bW4nLFxuXHRcdFx0YWN0aW9uOiAnI2FkZF9jb2x1bW4nLFxuXHRcdFx0aWNvbiAgOiAnZmEgZmEtcGx1cycsXG5cdFx0XHRldmVudHM6IHtcblx0XHRcdCAgICBjbGljayA6IExheW91dGJ1aWxkZXJDbGlja2R1bW15XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR7XG5cdFx0XHR0eXBlICA6ICdhY3Rpb24nLFxuXHRcdFx0bGFiZWwgOiAncmVtb3ZlIHJvdycsXG5cdFx0XHRhY3Rpb246ICcjcmVtb3ZlX3JvdycsXG5cdFx0XHRpY29uICA6ICdmYSBmYS1taW51cycsXG5cdFx0XHRldmVudHM6IHtcblx0XHRcdCAgICBjbGljayA6IExheW91dGJ1aWxkZXJDbGlja2R1bW15XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR7ICAgdHlwZSAgOiAnc2VwYXJhdG9yJyB9LFxuXHRcdHtcblx0XHRcdHR5cGUgIDogJ2FjdGlvbicsXG5cdFx0XHRsYWJlbCA6ICdlZGl0IHNldHRpbmdzJyxcblx0XHRcdGFjdGlvbjogJyNlZGl0X3NldHRpbmdzJyxcblx0XHRcdGljb24gIDogJ2ZhIGZhLWNvZ3MnLFxuXHRcdFx0ZXZlbnRzOiB7XG5cdFx0XHQgICAgY2xpY2sgOiBMYXlvdXRidWlsZGVyQ2xpY2tkdW1teVxuXHRcdFx0fVxuXHRcdH1cblx0XVxufTtcblxuIiwiLyoqXG4gKiBMYXlvdXR0b29sYmFyc2VjdGlvblBhdHRlcm4gbW9kdWxlLlxuICogXG4gKiBAbW9kdWxlIHBhdHRlcm5saWJyYXJ5LkxheW91dHRvb2xiYXJzZWN0aW9uUGF0dGVyblxuICogXG4gKiBAcmVxdWlyZXMgcGF0dGVybmxpYnJhcnkuTGF5b3V0dG9vbGJhcnNlY3Rpb25cbiAqL1xudmFyIExheW91dHRvb2xiYXJzZWN0aW9uUGF0dGVybiA9IHtcblx0bmFtZSAgOiAncGF0dGVybicsXG5cdGl0ZW1zIDogW1xuXHRcdC8qe1xuXHRcdFx0dHlwZSAgOiAnYWN0aW9uJyxcblx0XHRcdGxhYmVsIDogJ21vdmUgZWxlbWVudCcsXG5cdFx0XHRhY3Rpb246ICcjbW92ZV9lbGVtZW50Jyxcblx0XHRcdGljb24gIDogJ2ZhIGZhLWJhcnMnLFxuXHRcdFx0ZXZlbnRzOiB7XG5cdFx0XHQgICAgY2xpY2sgOiBMYXlvdXRidWlsZGVyQ2xpY2tkdW1teVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0eyAgIHR5cGUgIDogJ3NlcGFyYXRvcicgfSwqL1xuXHRcdHtcblx0XHRcdHR5cGUgIDogJ2FjdGlvbicsXG5cdFx0XHRsYWJlbCA6ICd2aWV3IHBhdHRlcm4gZG9jJyxcblx0XHRcdGFjdGlvbjogJyN2aWV3X3BhdHRlcm5fZG9jJyxcblx0XHRcdGljb24gIDogJ2ZhIGZhLWluZm8nLFxuXHRcdFx0ZXZlbnRzOiB7XG5cdFx0XHQgICAgY2xpY2sgOiBMYXlvdXRidWlsZGVyQ2xpY2tkdW1teVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0dHlwZSAgOiAnYWN0aW9uJyxcblx0XHRcdGxhYmVsIDogJ2VkaXQgcGF0dGVybicsXG5cdFx0XHRhY3Rpb246ICcjZWRpdF9wYXR0ZXJuJyxcblx0XHRcdGljb24gIDogJ2ZhIGZhLWVkaXQnLFxuXHRcdFx0ZXZlbnRzOiB7XG5cdFx0XHQgICAgY2xpY2sgOiBMYXlvdXRidWlsZGVyQ2xpY2tkdW1teVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0dHlwZSAgOiAnYWN0aW9uJyxcblx0XHRcdGxhYmVsIDogJ3JlbW92ZSBwYXR0ZXJuJyxcblx0XHRcdGFjdGlvbjogJyNyZW1vdmVfcGF0dGVybicsXG5cdFx0XHRpY29uICA6ICdmYSBmYS1taW51cycsXG5cdFx0XHRldmVudHM6IHtcblx0XHRcdCAgICBjbGljayA6IExheW91dGJ1aWxkZXJDbGlja2R1bW15XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR7ICAgdHlwZSAgOiAnc2VwYXJhdG9yJyB9LFxuXHRcdHtcblx0XHRcdHR5cGUgIDogJ2FjdGlvbicsXG5cdFx0XHRsYWJlbCA6ICdwYXR0ZXJuIHNldHRpbmdzJyxcblx0XHRcdGFjdGlvbjogJyNwYXR0ZXJuX3NldHRpbmdzJyxcblx0XHRcdGljb24gIDogJ2ZhIGZhLWNvZ3MnLFxuXHRcdFx0ZXZlbnRzOiB7XG5cdFx0XHQgICAgY2xpY2sgOiBMYXlvdXRidWlsZGVyQ2xpY2tkdW1teVxuXHRcdFx0fVxuXHRcdH1cblx0XVxufTtcblxuIiwiLyoqXG4gKiBMYXlvdXR0b29sYmFyIG1vZHVsZS5cbiAqIEBtb2R1bGUgcGxmb3VuZGF0aW9uLmxheW91dHRvb2xiYXJcbiAqIFxuICogQHJlcXVpcmVzIHBhdHRlcm5saWJyYXJ5LlBsdWdpblxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24uVHJpZ2dlcnNcbiAqL1xuY2xhc3MgTGF5b3V0dG9vbGJhciBleHRlbmRzIFBsdWdpbiB7XG5cbiAgICAvKipcbiAgICAgKiBTZXR1cCBhIG5ldyBpbnN0YW5jZSBvZiBhIGxheW91dHRvb2xiYXIuXG4gICAgICogQGNsYXNzXG4gICAgICogQG5hbWUgTGF5b3V0dG9vbGJhclxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYSBsYXlvdXR0b29sYmFyLlxuICAgICAqICAgICAgICBPYmplY3Qgc2hvdWxkIGJlIG9mIHRoZSBsYXlvdXR0b29sYmFyIHBhbmVsLCByYXRoZXIgdGhhbiBpdHMgYW5jaG9yLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICAgKi9cblx0X3NldHVwKGVsZW1lbnQsIG9wdGlvbnMpIHtcblx0XHRpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dHRvb2xiYXIgaW5pdCcpO1xuICAgIFx0dGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBMYXlvdXR0b29sYmFyLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ2xheW91dHRvb2xiYXInOyAvLyBpZTkgYmFjayBjb21wYXRcblxuICAgICAgICAvLyBUcmlnZ2VycyBpbml0IGlzIGlkZW1wb3RlbnQsIGp1c3QgbmVlZCB0byBtYWtlIHN1cmUgaXQgaXMgaW5pdGlhbGl6ZWRcbiAgICAgICAgUExGb3VuZGF0aW9uLlRyaWdnZXJzLmluaXQoJCk7XG5cbiAgICAgICAgdGhpcy5faW5pdCgpO1xuXG4gICAgICAgIC8vIChtYXliZSwgdGhpcyBsaW5lIGlzIG5vdCBuZXNzZXNzYXJ5IGFueW1vcmUuLi4/ISlcbiAgICAgICAgLy9QTEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0xheW91dHRvb2xiYXInKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0dG9vbGJhciBpbml0aWFsaXplZCcpO1xuICAgIH1cblx0XG5cdC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBwbHVnaW4gYnkgc2V0dGluZy9jaGVja2luZyBvcHRpb25zIGFuZCBhdHRyaWJ1dGVzLCBhZGRpbmcgaGVscGVyIHZhcmlhYmxlcywgYW5kIHNhdmluZyB0aGUgYW5jaG9yLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXQoKSB7XG5cdCAgICB0aGlzLl9ldmVudHMoKTtcblx0ICAgIHRoaXMuaGlkZVNlY3Rpb25zKCk7XG5cdCAgICBpZiAodGhpcy4kZWxlbWVudCkge1xuXHQgICAgXHR0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2luaXRpYWxpemVkLnBsLmxheW91dHRvb2xiYXInKTtcblx0ICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVycyB0byB0aGUgZWxlbWVudCB1dGlsaXppbmcgdGhlIHRyaWdnZXJzIHV0aWxpdHkgbGlicmFyeS5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9ldmVudHMoKSB7XG4gICAgXHR0aGlzLl9hZGRJbml0SGFuZGxlcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgaW5pdGlhbHphdGlvbiBldmVudCBsaXN0ZW5lcnNcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRJbml0SGFuZGxlcigpIHtcbiAgICBcdHZhciAkdGhpcyA9IHRoaXM7XG4gICAgXHR0aGlzLiRlbGVtZW50XG4gICAgXHQgICAgLm9mZignaW5pdGlhbGl6ZWQucGwubGF5b3V0dG9vbGJhcicpXG4gICAgXHQgICAgLm9uKCdpbml0aWFsaXplZC5wbC5sYXlvdXR0b29sYmFyJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBcdCAgICBcdCR0aGlzLl9pbml0U2VjdGlvbnMuYXBwbHkoJHRoaXMpO1xuICAgIFx0ICAgIH0pO1xuICAgIH1cblxuXHQvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgdG9vbGJhciBzZWN0aW9ucyBnaXZlbiBieSBjb25maWdcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0U2VjdGlvbnMoKSB7XG4gICAgICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0dG9vbGJhciBpbml0aWFsaXplIHNlY3Rpb24nLCB0aGlzLm9wdGlvbnMuc2VjdGlvbnMpO1xuICAgIFx0dmFyICR0aGlzID0gdGhpcztcbiAgICBcdCQodGhpcy5vcHRpb25zLnNlY3Rpb25zKS5lYWNoKChpZHgsIHNlY3Rpb25jb25maWcpID0+IHtcbiAgICAgICAgICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0dG9vbGJhciBpbml0IHNlY3Rpb24nLCBzZWN0aW9uY29uZmlnKTtcbiAgICBcdFx0aWYgKCAkdGhpcy4kZWxlbWVudC5maW5kKGA+IFtyZWw9XCIke3NlY3Rpb25jb25maWcubmFtZX1cIl1gKS5sZW5ndGggPT0gMCApIHtcbiAgICBcdFx0XHQkdGhpcy5faW5pdFNlY3Rpb24oc2VjdGlvbmNvbmZpZyk7XG4gICAgXHRcdH1cbiAgICBcdH0pXG4gICAgfVxuXG5cdC8qKlxuICAgICAqIEluaXRpYWxpemVzIGEgc2luZ2xlIG5ldyB0b29sYmFyIHNlY3Rpb25zXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdFNlY3Rpb24oc2VjdGlvbmNvbmZpZykge1xuICAgICAgICBpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dHRvb2xiYXIgaW5pdGlhbGl6ZSBzZWN0aW9uJywgc2VjdGlvbmNvbmZpZyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLiRlbGVtZW50LnByZXBlbmQoTGF5b3V0dG9vbGJhcnNlY3Rpb24ucHJvdG90eXBlLnRvRWxlbWVudChzZWN0aW9uY29uZmlnKSk7XG4gICAgICAgIHZhciAkc2VjdGlvbiA9IG5ldyBMYXlvdXR0b29sYmFyc2VjdGlvbiAoXG4gICAgICAgIFx0dGhpcy4kZWxlbWVudC5maW5kKGA+IFtyZWw9XCIke3NlY3Rpb25jb25maWcubmFtZX1cIl1gKSxcbiAgICAgICAgXHRzZWN0aW9uY29uZmlnXG4gICAgICAgICk7XG4gICAgICAgIC8vJHNlY3Rpb24uJGVsZW1lbnQuY2hpbGRyZW4oKS5maXJzdCgpLnBsZm91bmRhdGlvbigpOy8vcGF0dGVybmxpYnJhcnkoKTtcbiAgICAgICAgJHNlY3Rpb24uJGVsZW1lbnQudHJpZ2dlcignaW5pdGlhbGl6ZWQnKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0dG9vbGJhciBzZWN0aW9uIGluaXRpYWxpemVkOiAnLCAkc2VjdGlvbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmV0cmlldmUgYWxsIHRvb2xiYXIgc2VjdGlvbnNcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdldCBfc2VjdGlvbnMgKCkge1xuICAgIFx0cmV0dXJuIHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtbGF5b3V0dG9vbGJhcnNlY3Rpb25dJykubWFwKChpZHgsIGVsZW0pID0+IHsgXG4gICAgXHRcdHJldHVybiAkKGVsZW0pLmRhdGEoJ3BhdHRlcm5saWJyYXJ5UGx1Z2luJylcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmV0cmlldmUgYSB0b29sYmFyIHNlY3Rpb24gYnkgbmFtZVxuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuICAgIHNlY3Rpb24gKG5hbWUpIHtcbiAgICBcdHZhciAkc2VjdGlvbjtcbiAgICBcdFxuICAgICAgICAkKHRoaXMuX3NlY3Rpb25zKS5lYWNoKChpZHgsIF9zZWN0aW9uKSA9PiB7XG4gICAgICAgIFx0aWYgKF9zZWN0aW9uLiRlbGVtZW50ICYmIF9zZWN0aW9uLiRlbGVtZW50LmF0dHIoJ3JlbCcpID09IG5hbWUpIHtcbiAgICAgICAgXHRcdCRzZWN0aW9uID0gX3NlY3Rpb247XG4gICAgICAgIFx0fVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiAoJHNlY3Rpb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHJpZXZlIGJ1aWxkZXIncyB0b29sYmFyIHNlY3Rpb25cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdldCBfYnVpbGRlclNlY3Rpb24gKCkge1xuICAgIFx0dmFyIGJ1aWxkZXJTZWN0aW9uID0gbnVsbDtcbiAgICBcdHRoaXMuX3NlY3Rpb25zLmVhY2goKGlkeCwgc2VjdGlvbikgPT4geyAgXG4gICAgXHRcdGlmIChzZWN0aW9uLiRlbGVtZW50LmF0dHIoJ3JlbCcpID09ICdidWlsZGVyJykge1xuICAgIFx0XHRcdGJ1aWxkZXJTZWN0aW9uID0gc2VjdGlvbjtcbiAgICBcdFx0XHRyZXR1cm4gKGZhbHNlKTtcbiAgICBcdFx0fVxuICAgIFx0fSk7XG4gICAgXHRyZXR1cm4gYnVpbGRlclNlY3Rpb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogaGlkZSBhbGwgdG9vbGJhciBzZWN0aW9uc1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuICAgIGhpZGVTZWN0aW9ucyAoKSB7XG4gICAgXHR2YXIgc2VjdGlvbnMgPSB0aGlzLl9zZWN0aW9ucztcbiAgICBcdHNlY3Rpb25zLmVhY2goKGlkeCwgc2VjdGlvbikgPT4geyBzZWN0aW9uLmhpZGUoKTsgfSk7XG4gICAgXHRpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2cgKCdidWlsZGVyOicsIHRoaXMuX2J1aWxkZXJTZWN0aW9uICk7XG5cdCAgICAvL3RoaXMuX2J1aWxkZXJTZWN0aW9uLnNob3coKTtcbiAgICBcdHNlY3Rpb25zLmVhY2goKGlkeCwgc2VjdGlvbikgPT4ge1xuICAgIFx0XHRpZiAoc2VjdGlvbi4kZWxlbWVudC5hdHRyKCdyZWwnKSA9PSAnYnVpbGRlcicpIHtcbiAgICBcdFx0XHRzZWN0aW9uLnNob3coKTtcbiAgICBcdFx0fVxuICAgIFx0fSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogc3dpdGNoIHRvb2xiYXIgc2VjdGlvbnMgYWNjb3JkaW5nIHRvIGZvY3VzZWQgZWxlbWVudFxuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuICAgIHN3aXRjaFNlY3Rpb24gKG5hbWUsIHJlZmVyZW5jZSkge1xuICAgIFx0dmFyIHNlY3Rpb25zID0gdGhpcy5fc2VjdGlvbnM7XG4gICAgXHRzZWN0aW9ucy5lYWNoKChpZHgsIHNlY3Rpb24pID0+IHtcbiAgICBcdFx0dmFyICRzZWN0aW9uID0gJChzZWN0aW9uKTtcblxuICAgIFx0XHRpZiAoc2VjdGlvbi4kZWxlbWVudC5hdHRyKCdyZWwnKSAhPSAnYnVpbGRlcicpIHtcblx0ICAgIFx0XHRpZiAoc2VjdGlvbi4kZWxlbWVudC5hdHRyKCdyZWwnKSA9PSBuYW1lKSB7XG5cdCAgICBcdFx0XHRzZWN0aW9uLnNob3coKTtcblx0ICAgIFx0XHR9IGVsc2Uge1xuXHQgICAgXHRcdFx0c2VjdGlvbi5oaWRlKCk7IFxuXHQgICAgXHRcdH1cbiAgICBcdFx0fVxuICAgIFx0fSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogZ2VuZXJhdGUgaW5pdGlhbCBtYXJrdXBcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdldCBfbWFya3VwKCkge1xuICAgIFx0dmFyIGh0bWwgPSBbXG4gICAgXHRcdCc8ZGl2IGRhdGEtbGF5b3V0dG9vbGJhciBjbGFzcz1cInRvb2xiYXJcIj4nLFxuICAgIFx0XHQnPC9kaXY+J1xuICAgIFx0XTtcbiAgICBcdFxuICAgIFx0cmV0dXJuICQoaHRtbC5qb2luKCcnKSk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIERlc3Ryb3lzIHRoZSBsYXlvdXR0b29sYmFyJ3Mgc2VjdGlvbnMuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZGVzdHJveVNlY3Rpb25zKCkge1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBEZXN0cm95cyB0aGUgbGF5b3V0dG9vbGJhci5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9kZXN0cm95KCkge1xuICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoJyonKS5vZmYoJy5wbC5sYXlvdXR0b29sYmFyJyk7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcucGwubGF5b3V0dG9vbGJhcicpO1xuICAgICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZSgpO1xuICAgIH1cblx0XG59XG5cbkxheW91dHRvb2xiYXIuZGVmYXVsdHMgPSB7XG5cdHNlY3Rpb25zOiBbXG5cdFx0TGF5b3V0dG9vbGJhcnNlY3Rpb25CdWlsZGVyLFxuXHRcdExheW91dHRvb2xiYXJzZWN0aW9uTGF5b3V0cm93LFxuXHRcdExheW91dHRvb2xiYXJzZWN0aW9uTGF5b3V0Y29sdW1uLFxuXHRcdExheW91dHRvb2xiYXJzZWN0aW9uUGF0dGVyblxuXHRdXG59O1xuXG4vL1BMRm91bmRhdGlvbi5wbHVnaW4oTGF5b3V0dG9vbGJhciwgJ0xheW91dHRvb2xiYXInKTtcbnBhdHRlcm5saWJyYXJ5LnBsdWdpbihMYXlvdXR0b29sYmFyLCAnTGF5b3V0dG9vbGJhcicpO1xuXG5pZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nKSB7XG5cdC8vIHJlcXVpcmUvQU1EIG1vZHVsZSBkZWZpbml0aW9uXG5cdGRlZmluZShbXSwgKHJlcXVpcmUsIGV4cG9ydHMsIG1vZHVsZSkgPT4ge1xuXHRcdHJldHVybiBMYXlvdXR0b29sYmFyO1xuXHR9KTtcbn0iLCIvKipcbiAqIExheW91dGVsZW1lbnQgbW9kdWxlLlxuICogQG1vZHVsZSBwbGZvdW5kYXRpb24ubGF5b3V0ZWxlbWVudFxuICogXG4gKiBAcmVxdWlyZXMgcGxmb3VuZGF0aW9uLlBsdWdpblxuICogQHJlcXVpcmVzIHBsZm91bmRhdGlvbi5LZXlib2FyZFxuICogQHJlcXVpcmVzIHBsZm91bmRhdGlvbi5NZWRpYVF1ZXJ5XG4gKi9cbmNsYXNzIExheW91dGVsZW1lbnQgZXh0ZW5kcyBQbHVnaW4ge1xuXG4gICAgLyoqXG4gICAgICogU2V0dXAgYSBuZXcgaW5zdGFuY2Ugb2YgYSBsYXlvdXRlbGVtZW50LlxuICAgICAqIEBjbGFzc1xuICAgICAqIEBuYW1lIExheW91dGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGEgbGF5b3V0ZWxlbWVudC5cbiAgICAgKiAgICAgICAgT2JqZWN0IHNob3VsZCBiZSBvZiB0aGUgbGF5b3V0ZWxlbWVudCBwYW5lbCwgcmF0aGVyIHRoYW4gaXRzIGFuY2hvci5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAgICovXG5cdF9zZXR1cChlbGVtZW50LCBvcHRpb25zKSB7XG5cdFx0aWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRlbGVtZW50IGluaXQnKTtcbiAgICBcdHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgTGF5b3V0ZWxlbWVudC5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICdsYXlvdXRlbGVtZW50JzsgLy8gaWU5IGJhY2sgY29tcGF0XG5cbiAgICAgICAgLy8gVHJpZ2dlcnMgaW5pdCBpcyBpZGVtcG90ZW50LCBqdXN0IG5lZWQgdG8gbWFrZSBzdXJlIGl0IGlzIGluaXRpYWxpemVkXG4gICAgICAgIFBMRm91bmRhdGlvbi5UcmlnZ2Vycy5pbml0KCQpO1xuXG4gICAgICAgIHRoaXMuX2luaXQoKTtcblxuICAgICAgICAvLyAobWF5YmUsIHRoaXMgbGluZSBpcyBub3QgbmVzc2Vzc2FyeSBhbnltb3JlLi4uPyEpXG4gICAgICAgIC8vUExGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdMYXlvdXRlbGVtZW50Jyk7XG4gICAgICAgIFxuICAgICAgICBpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGVsZW1lbnQgaW5pdGlhbGl6ZWQnKTtcbiAgICB9XG5cdFxuXHQvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgcGx1Z2luIGJ5IHNldHRpbmcvY2hlY2tpbmcgb3B0aW9ucyBhbmQgYXR0cmlidXRlcywgYWRkaW5nIGhlbHBlciB2YXJpYWJsZXMsIGFuZCBzYXZpbmcgdGhlIGFuY2hvci5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0KCkge1xuXHQgICAgdGhpcy5fZXZlbnRzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBldmVudCBsaXN0ZW5lcnMgdG8gdGhlIGVsZW1lbnQgdXRpbGl6aW5nIHRoZSB0cmlnZ2VycyB1dGlsaXR5IGxpYnJhcnkuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZXZlbnRzKCkge1xuICAgICAgICB0aGlzLl9hZGRDbGlja0hhbmRsZXIoKTtcbiAgICAgICAgdGhpcy5fYWRkRm9jdXNIYW5kbGVyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBjbGljayBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSB0YWJzLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZENsaWNrSGFuZGxlcigpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB0aGlzLiRlbGVtZW50XG4gICAgICAgICAgICAub2ZmKCdjbGljay5wbC5sYXlvdXRlbGVtZW50JylcbiAgICAgICAgICAgIC5vbignY2xpY2sucGwubGF5b3V0ZWxlbWVudCcsIGZ1bmN0aW9uKGUpe1xuXG4gICAgICAgICAgICBcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0ZWxlbWVudCBjbGljayBoYW5kbGVyJyk7XG4gICAgICAgIFx0ICAgIF90aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2NsaWNrZWQnKTtcbiAgICAgICAgXHQgICAgXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICBfdGhpcy5mb2N1cygpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGNsaWNrIGhhbmRsZXJzIGZvciBpdGVtcyB3aXRoaW4gdGhlIHRhYnMuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkRm9jdXNIYW5kbGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgICAgICAgIC5vZmYoJ2ZvY3VzZWQucGwubGF5b3V0ZWxlbWVudCcpXG4gICAgICAgICAgICAub24oJ2ZvY3VzZWQucGwubGF5b3V0ZWxlbWVudCcsIGZ1bmN0aW9uKGUpe1xuXG4gICAgICAgICAgICBcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0ZWxlbWVudCBmb2N1cyBldmVudCBoYW5kbGVyOicsIF90aGlzLl9kcmFndHJpZ2dlciwgX3RoaXMuX2VsZW1lbnR0b29sYmFyKTtcbiAgICAgICAgXHQgICAgXG4gICAgICAgICAgICBcdGlmICghKF90aGlzLl9kcmFndHJpZ2dlciBpbnN0YW5jZW9mIExheW91dGVsZW1lbnRkcmFndHJpZ2dlcikpIHtcbiAgICAgICAgICAgIFx0XHRfdGhpcy5faW5pdERyYWd0cmlnZ2VyKCk7XG4gICAgICAgICAgICBcdH1cbiAgICAgICAgICAgIFx0aWYgKCEoX3RoaXMuX2VsZW1lbnR0b29sYmFyIGluc3RhbmNlb2YgTGF5b3V0ZWxlbWVudHRvb2xiYXIpKSB7XG4gICAgICAgICAgICBcdFx0X3RoaXMuX2luaXRFbGVtZW50dG9vbGJhcigpO1xuICAgICAgICAgICAgXHR9XG5cbiAgICAgICAgICAgIFx0aWYgKF90aGlzLl90b29sYmFyIGluc3RhbmNlb2YgTGF5b3V0dG9vbGJhcikge1xuICAgICAgICAgICAgXHQgICAgX3RoaXMuX3Rvb2xiYXIuc3dpdGNoU2VjdGlvbihfdGhpcy5jbGFzc25hbWUpO1xuICAgICAgICAgICAgXHR9XG4gICAgICAgICAgICBcdC8vX3RoaXMuJGVsZW1lbnQudHJpZ2dlcignZm9jdXNlZCcpO1xuICAgICAgICBcdCAgICBcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgIC8vX3RoaXMuZm9jdXMoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy4kZWxlbWVudFxuICAgICAgICAgICAgLm9mZigndW5mb2N1c2VkLnBsLmxheW91dGVsZW1lbnQnKVxuICAgICAgICAgICAgLm9uKCd1bmZvY3VzZWQucGwubGF5b3V0ZWxlbWVudCcsIGZ1bmN0aW9uKGUpe1xuXG4gICAgICAgICAgICBcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0ZWxlbWVudCB1bi1mb2N1cyBldmVudCBoYW5kbGVyOicsIF90aGlzLl9kcmFndHJpZ2dlciwgX3RoaXMuX2VsZW1lbnR0b29sYmFyKTtcblxuICAgICAgICAgICAgXHRpZiAoX3RoaXMuX2RyYWd0cmlnZ2VyIGluc3RhbmNlb2YgTGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyKSB7XG4gICAgICAgICAgICBcdFx0X3RoaXMuX2RyYWd0cmlnZ2VyLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIFx0fVxuICAgICAgICAgICAgXHRpZiAoX3RoaXMuX2VsZW1lbnR0b29sYmFyIGluc3RhbmNlb2YgTGF5b3V0ZWxlbWVudHRvb2xiYXIpIHtcbiAgICAgICAgICAgIFx0XHRfdGhpcy5fZWxlbWVudHRvb2xiYXIuZGVzdHJveSgpO1xuICAgICAgICAgICAgXHR9XG5cbiAgICAgICAgICAgIFx0aWYgKF90aGlzLl90b29sYmFyIGluc3RhbmNlb2YgTGF5b3V0dG9vbGJhcikge1xuICAgICAgICAgICAgICAgIFx0X3RoaXMuX3Rvb2xiYXIuaGlkZVNlY3Rpb25zKCk7XG4gICAgICAgICAgICBcdH1cbiAgICAgICAgICAgIFx0Ly9fdGhpcy4kZWxlbWVudC50cmlnZ2VyKCd1bmZvY3VzZWQnKTtcbiAgICAgICAgXHQgICAgXG4gICAgICAgICAgICAgICAgLy9lLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgLy9lLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgLy9fdGhpcy5mb2N1cygpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgZm9jdXMgY2xhc3Mgb24gY3VycmVudCAkZWxlbWVudCwgcmVtb3ZlcyBmcm9tIG90aGVyc1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZvY3VzTGF5b3V0ZWxlbWVudCgpIHtcbiAgICBcdCQoJ1tkYXRhLWxheW91dGVsZW1lbnR0b29sYmFyXSxbZGF0YS1sYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXJdJykucmVtb3ZlKCk7XG4gICAgXHRpZiAoIXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3ModGhpcy5vcHRpb25zLmZvY3VzQ2xhc3NuYW1lKSkge1xuICAgICAgICBcdCQoJy4nK3RoaXMub3B0aW9ucy5mb2N1c0NsYXNzbmFtZSkucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmZvY3VzQ2xhc3NuYW1lKTtcbiAgICAgICAgXHR0aGlzLiRlbGVtZW50LmFkZENsYXNzKHRoaXMub3B0aW9ucy5mb2N1c0NsYXNzbmFtZSk7XG4gICAgICAgIFx0aWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRlbGVtZW50IGZvY3VzZWQ6JywgdGhpcy51dWlkKTtcbiAgICBcdCAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2ZvY3VzZWQnKTtcbiAgICBcdH0gZWxzZSB7XG4gICAgICAgIFx0dGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuZm9jdXNDbGFzc25hbWUpO1xuICAgICAgICBcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0ZWxlbWVudCB1bi1mb2N1c2VkOicsIHRoaXMudXVpZCk7XG4gICAgXHQgICAgdGhpcy4kZWxlbWVudC5jaGlsZHJlbigpLnRyaWdnZXIoJ3VuZm9jdXNlZCcpO1xuICAgIFx0ICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcigndW5mb2N1c2VkJyk7XG4gICAgXHR9XG4gICAgXHRpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGVsZW1lbnQgZm9jdXMgY2hhbmdlZCcpO1xuXHQgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdmb2N1c2NoYW5nZScpO1xuICAgIFx0cmV0dXJuICh0aGlzKTtcbiAgICB9XG4gIFxuICAgIC8qKlxuICAgICAqIFNldCBmb2N1cyBvbiBjdXJyZW50ICRlbGVtZW50XG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIGZvY3VzKCkge1xuICAgIFx0cmV0dXJuIHRoaXMuX2ZvY3VzTGF5b3V0ZWxlbWVudCgpO1xuICAgIH1cbiAgXG4gICAgLyoqXG4gICAgICogVW4tZm9jdXMgYW55IGxheW91dCBlbGVtZW50XG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIHVuZm9jdXMoKSB7XG4gICAgXHQkKCdbZGF0YS1sYXlvdXRib2R5XSAuZm9jdXNlZCcpLmVhY2goKGlkeCwgZWxlbSkgPT4ge1xuICAgIFx0XHRpZiAoJChlbGVtKS5kYXRhKCkpIHtcbiAgICBcdFx0XHQkKGVsZW0pLmRhdGEoJ3BhdHRlcm5saWJyYXJ5UGx1Z2luJykuZm9jdXMoKTtcbiAgICBcdFx0fVxuICAgIFx0fSk7XG4gICAgfVxuICBcbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZSBlbGVtZW50J3MgdG9vbGJhciBpbnN0YW5jZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2V0IF9lbGVtZW50dG9vbGJhcigpIHtcbiAgICAgICAgaWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRlbGVtZW50dG9vbGJhciBzZWN0aW9uIGVsZW1lbnQ6JywgdGhpcy4kZWxlbWVudC5maW5kKCc+IFtkYXRhLWxheW91dGVsZW1lbnR0b29sYmFyXScpKTtcbiAgICBcdHJldHVybiB0aGlzLiRlbGVtZW50LmZpbmQoJz4gW2RhdGEtbGF5b3V0ZWxlbWVudHRvb2xiYXJdJykuZGF0YSgncGF0dGVybmxpYnJhcnlQbHVnaW4nKTtcbiAgICB9XG4gIFxuXHQvKipcbiAgICAgKiBJbml0aWFsaXplcyBhIHNpbmdsZSBuZXcgdG9vbGJhciBzZWN0aW9uc1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXRFbGVtZW50dG9vbGJhcihzZWN0aW9uY29uZmlnKSB7XG4gICAgICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0ZWxlbWVudHRvb2xiYXIgaW5pdGlhbGl6ZSBzZWN0aW9uIGVsZW1lbnQ6Jywgc2VjdGlvbmNvbmZpZyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLiRlbGVtZW50LnByZXBlbmQoTGF5b3V0ZWxlbWVudHRvb2xiYXIucHJvdG90eXBlLnRvRWxlbWVudCgpKTtcbiAgICAgICAgdmFyICR0b29sYmFyc2VjdGlvbiA9IHRoaXMuJGVsZW1lbnQuZmluZCgnPiBbZGF0YS1sYXlvdXRlbGVtZW50dG9vbGJhcl0nKTtcbiAgICAgICAgdmFyICRzZWN0aW9uID0gbmV3IExheW91dGVsZW1lbnR0b29sYmFyIChcbiAgICAgICAgXHQkdG9vbGJhcnNlY3Rpb24sXG4gICAgICAgIFx0c2VjdGlvbmNvbmZpZ1xuICAgICAgICApO1xuICAgICAgICAkdG9vbGJhcnNlY3Rpb24uZGF0YSgncGF0dGVybmxpYnJhcnlQbHVnaW4nLCAkc2VjdGlvbik7XG4gICAgICAgIC8vJHNlY3Rpb24uJGVsZW1lbnQuY2hpbGRyZW4oKS5maXJzdCgpLnBhdHRlcm5saWJyYXJ5KCk7Ly9wbGZvdW5kYXRpb24oKTsvL1xuICAgICAgICAvLyRzZWN0aW9uLiRlbGVtZW50LnRyaWdnZXIoJ2luaXRpYWxpemVkJyk7XG4gICAgICAgIFxuICAgICAgICBpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGVsZW1lbnR0b29sYmFyIGluaXRpYWxpemVkOiAnLCAkc2VjdGlvbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0cmlldmUgZWxlbWVudCdzIGRyYWctdHJpZ2dlciBpbnN0YW5jZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2V0IF9kcmFndHJpZ2dlcigpIHtcbiAgICBcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyIHNlY3Rpb24gZWxlbWVudDonLCB0aGlzLiRlbGVtZW50LmZpbmQoJz4gW2RhdGEtbGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyXScpKTtcbiAgICBcdHJldHVybiB0aGlzLiRlbGVtZW50LmZpbmQoJz4gW2RhdGEtbGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyXScpLmRhdGEoJ3BhdHRlcm5saWJyYXJ5UGx1Z2luJyk7XG4gICAgfVxuICAgIFxuXHQvKipcbiAgICAgKiBJbml0aWFsaXplcyBhIHNpbmdsZSBuZXcgZHJhZy10cmlnZ2VyIHNlY3Rpb25zXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdERyYWd0cmlnZ2VyKHNlY3Rpb25jb25maWcpIHtcbiAgICAgICAgaWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXIgaW5pdGlhbGl6ZSBzZWN0aW9uIGVsZW1lbnQ6Jywgc2VjdGlvbmNvbmZpZyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLiRlbGVtZW50LnByZXBlbmQoTGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyLnByb3RvdHlwZS50b0VsZW1lbnQoKSk7XG4gICAgICAgIHZhciAkdG9vbGJhcnNlY3Rpb24gPSB0aGlzLiRlbGVtZW50LmZpbmQoJz4gW2RhdGEtbGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyXScpO1xuICAgICAgICB2YXIgJHNlY3Rpb24gPSBuZXcgTGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyIChcbiAgICAgICAgIFx0JHRvb2xiYXJzZWN0aW9uLFxuICAgICAgICBcdHNlY3Rpb25jb25maWdcbiAgICAgICAgKTtcbiAgICAgICAgJHRvb2xiYXJzZWN0aW9uLmRhdGEoJ3BhdHRlcm5saWJyYXJ5UGx1Z2luJywgJHNlY3Rpb24pO1xuICAgICAgICAvLyRzZWN0aW9uLiRlbGVtZW50LmNoaWxkcmVuKCkuZmlyc3QoKS5wYXR0ZXJubGlicmFyeSgpOy8vcGxmb3VuZGF0aW9uKCk7Ly9cbiAgICAgICAgLy8kc2VjdGlvbi4kZWxlbWVudC50cmlnZ2VyKCdpbml0aWFsaXplZCcpO1xuICAgICAgICBcbiAgICAgICAgaWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXIgaW5pdGlhbGl6ZWQ6ICcsICRzZWN0aW9uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXN0cm95cyB0aGUgbGF5b3V0ZWxlbWVudC5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9kZXN0cm95KCkge1xuICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoJyonKS5vZmYoJy5wbC5sYXlvdXRlbGVtZW50Jyk7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcucGwubGF5b3V0ZWxlbWVudCcpO1xuICAgICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZSgpO1xuICAgIH1cblxufVxuXG5MYXlvdXRlbGVtZW50LmRlZmF1bHRzID0ge1xuXHRhY3RpdmVDbGFzc25hbWUgOiAnYWN0aXZhdGVkJyxcblx0Zm9jdXNDbGFzc25hbWUgIDogJ2ZvY3VzZWQnXG59XG5cbi8vUExGb3VuZGF0aW9uLnBsdWdpbihMYXlvdXRlbGVtZW50LCAnTGF5b3V0ZWxlbWVudCcpO1xucGF0dGVybmxpYnJhcnkucGx1Z2luKExheW91dGVsZW1lbnQsICdMYXlvdXRlbGVtZW50Jyk7XG5cbiIsIi8qKlxuICogTGF5b3V0YnVpbGRlciBFeGNlcHRpb24gb2JqZWN0XG4gKiBcbiAqIEBtb2R1bGUgTGF5b3V0YnVpbGRlckV4Y2VwdGlvblxuICovXG5jbGFzcyBMYXlvdXRidWlsZGVyRXhjZXB0aW9uIHtcblx0XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIGEgTGF5b3V0YnVpbGRlckV4Y2VwdGlvbi5cbiAgICAgKiBAY2xhc3NcbiAgICAgKiBAbmFtZSBMYXlvdXRidWlsZGVyRXhjZXB0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSBtZXNzYWdlIG9mIHRoZSBleGNlcHRpb24gZGVjcmliaW5nIHRoZSBvY2N1cmVuY2UuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNvZGUgLSBvcHRpb25hbCBtZXNzYWdlIGNvZGUsIGRlZmF1bHQgPSAwLlxuICAgICAqL1xuXHRjb25zdHJ1Y3RvcihtZXNzYWdlLCBjb2RlID0gMCkge1xuXG5cdCAgICB0aGlzLm5hbWUgPSBcIkxheW91dGJ1aWxkZXJFeGNlcHRpb25cIjtcblx0ICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG5cdH1cblxuXHQvKipcblx0ICogY29tcG9zZSBzdHJpbmcgb3V0cHV0IG9mIExheW91dGJ1aWxkZXJFeGNlcHRpb25cblx0ICogXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcmV0dXJuIHtzdHJpbmd9XG5cdCAqL1xuICAgIHRvU3RyaW5nKCkgeyByZXR1cm4gdGhpcy5uYW1lICsgXCI6IFwiICsgdGhpcy5tZXNzYWdlOyB9XG4gICAgXG59OyIsIi8qKlxuICogTGF5b3V0Y29sdW1uIG1vZHVsZS5cbiAqIEBtb2R1bGUgcGxmb3VuZGF0aW9uLmxheW91dGNvbHVtblxuICogXG4gKiBAcmVxdWlyZXMgcGxmb3VuZGF0aW9uLkxheW91dGVsZW1lbnRcbiAqL1xuY2xhc3MgTGF5b3V0Y29sdW1uIGV4dGVuZHMgTGF5b3V0ZWxlbWVudCB7XG5cblx0Z2V0IGNsYXNzbmFtZSAoKSB7IHJldHVybiAnbGF5b3V0Y29sdW1uJzsgfVxuXHRcbn1cblxuLy9QTEZvdW5kYXRpb24ucGx1Z2luKExheW91dGNvbHVtbiwgJ0xheW91dGNvbHVtbicpO1xucGF0dGVybmxpYnJhcnkucGx1Z2luKExheW91dGNvbHVtbiwgJ0xheW91dGNvbHVtbicpO1xuXG4iLCIvKipcbiAqIExheW91dGVsZW1lbnRkcmFndHJpZ2dlciBtb2R1bGUuXG4gKiBAbW9kdWxlIHBsZm91bmRhdGlvbi5sYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXJcbiAqIFxuICogQHJlcXVpcmVzIHBhdHRlcm5saWJyYXJ5LlBsdWdpblxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24uVHJpZ2dlcnNcbiAqL1xuY2xhc3MgTGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyIGV4dGVuZHMgUGx1Z2luIHtcblxuICAgIC8qKlxuICAgICAqIFNldHVwIGEgbmV3IGluc3RhbmNlIG9mIGEgbGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyLlxuICAgICAqIEBjbGFzc1xuICAgICAqIEBuYW1lIExheW91dGVsZW1lbnRkcmFndHJpZ2dlclxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYSBsYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXIuXG4gICAgICogICAgICAgIE9iamVjdCBzaG91bGQgYmUgb2YgdGhlIGxheW91dGVsZW1lbnRkcmFndHJpZ2dlciBwYW5lbCwgcmF0aGVyIHRoYW4gaXRzIGFuY2hvci5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAgICovXG5cdF9zZXR1cChlbGVtZW50LCBvcHRpb25zKSB7XG5cdFx0aWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXIgaW5pdCcpO1xuICAgIFx0dGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBMYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXIuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyJzsgLy8gaWU5IGJhY2sgY29tcGF0XG5cbiAgICAgICAgLy8gVHJpZ2dlcnMgaW5pdCBpcyBpZGVtcG90ZW50LCBqdXN0IG5lZWQgdG8gbWFrZSBzdXJlIGl0IGlzIGluaXRpYWxpemVkXG4gICAgICAgIFBMRm91bmRhdGlvbi5UcmlnZ2Vycy5pbml0KCQpO1xuXG4gICAgICAgIHRoaXMuX2luaXQoKTtcblxuICAgICAgICAvLyAobWF5YmUsIHRoaXMgbGluZSBpcyBub3QgbmVzc2Vzc2FyeSBhbnltb3JlLi4uPyEpXG4gICAgICAgIC8vUExGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdMYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXInKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyIGluaXRpYWxpemVkJyk7XG4gICAgfVxuXHRcblx0LyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIHBsdWdpbiBieSBzZXR0aW5nL2NoZWNraW5nIG9wdGlvbnMgYW5kIGF0dHJpYnV0ZXMsIGFkZGluZyBoZWxwZXIgdmFyaWFibGVzLCBhbmQgc2F2aW5nIHRoZSBhbmNob3IuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdCgpIHtcblx0ICAgIHRoaXMuX2V2ZW50cygpO1xuXHQgICAgdGhpcy5oaWRlU2VjdGlvbnMoKTtcblx0ICAgIGlmICh0aGlzLiRlbGVtZW50KSB7XG5cdCAgICBcdHRoaXMuJGVsZW1lbnQudHJpZ2dlcignaW5pdGlhbGl6ZWQucGwubGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyJyk7XG5cdCAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBldmVudCBsaXN0ZW5lcnMgdG8gdGhlIGVsZW1lbnQgdXRpbGl6aW5nIHRoZSB0cmlnZ2VycyB1dGlsaXR5IGxpYnJhcnkuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZXZlbnRzKCkge1xuICAgIFx0dGhpcy5fYWRkSW5pdEhhbmRsZXIoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGluaXRpYWx6YXRpb24gZXZlbnQgbGlzdGVuZXJzXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkSW5pdEhhbmRsZXIoKSB7XG4gICAgXHR2YXIgJHRoaXMgPSB0aGlzO1xuICAgIFx0dGhpcy4kZWxlbWVudFxuICAgIFx0ICAgIC5vZmYoJ2luaXRpYWxpemVkLnBsLmxheW91dGVsZW1lbnRkcmFndHJpZ2dlcicpXG4gICAgXHQgICAgLm9uKCdpbml0aWFsaXplZC5wbC5sYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXInLCAoZSkgPT4ge1xuICAgIFx0ICAgIFx0JHRoaXMuX2luaXRTZWN0aW9ucy5hcHBseSgkdGhpcyk7XG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgXHQgICAgfSk7XG4gICAgfVxuXG5cdC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSB0b29sYmFyIHNlY3Rpb25zIGdpdmVuIGJ5IGNvbmZpZ1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXRTZWN0aW9ucygpIHtcbiAgICAgICAgaWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXIgaW5pdGlhbGl6ZSBzZWN0aW9uJywgdGhpcy5vcHRpb25zLnNlY3Rpb25zKTtcbiAgICBcdHZhciAkdGhpcyA9IHRoaXM7XG4gICAgXHQkKHRoaXMub3B0aW9ucy5zZWN0aW9ucykuZWFjaCgoaWR4LCBzZWN0aW9uY29uZmlnKSA9PiB7XG4gICAgICAgICAgICBpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGVsZW1lbnRkcmFndHJpZ2dlciBpbml0IHNlY3Rpb24nLCBzZWN0aW9uY29uZmlnKTtcbiAgICBcdFx0aWYgKCAkdGhpcy4kZWxlbWVudC5maW5kKGA+IFtyZWw9XCIke3NlY3Rpb25jb25maWcubmFtZX1cIl1gKS5sZW5ndGggPT0gMCApIHtcbiAgICBcdFx0XHQkdGhpcy5faW5pdFNlY3Rpb24oc2VjdGlvbmNvbmZpZyk7XG4gICAgXHRcdH1cbiAgICBcdH0pXG4gICAgfVxuXG5cdC8qKlxuICAgICAqIEluaXRpYWxpemVzIGEgc2luZ2xlIG5ldyB0b29sYmFyIHNlY3Rpb25zXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdFNlY3Rpb24oc2VjdGlvbmNvbmZpZykge1xuICAgICAgICBpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGVsZW1lbnRkcmFndHJpZ2dlciBpbml0aWFsaXplIHNlY3Rpb24nLCBzZWN0aW9uY29uZmlnKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuJGVsZW1lbnQucHJlcGVuZChMYXlvdXR0b29sYmFyc2VjdGlvbi5wcm90b3R5cGUudG9FbGVtZW50KHNlY3Rpb25jb25maWcpKTtcbiAgICAgICAgdmFyICRzZWN0aW9uID0gbmV3IExheW91dHRvb2xiYXJzZWN0aW9uIChcbiAgICAgICAgXHR0aGlzLiRlbGVtZW50LmZpbmQoYD4gW3JlbD1cIiR7c2VjdGlvbmNvbmZpZy5uYW1lfVwiXWApLFxuICAgICAgICBcdHNlY3Rpb25jb25maWdcbiAgICAgICAgKTtcbiAgICAgICAgJHNlY3Rpb24uJGVsZW1lbnQuY2hpbGRyZW4oKS5maXJzdCgpLnBsZm91bmRhdGlvbigpOy8vcGF0dGVybmxpYnJhcnkoKTtcbiAgICAgICAgJHNlY3Rpb24uJGVsZW1lbnQudHJpZ2dlcignaW5pdGlhbGl6ZWQnKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyIHNlY3Rpb24gaW5pdGlhbGl6ZWQ6ICcsICRzZWN0aW9uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZXRyaWV2ZSBhbGwgdG9vbGJhciBzZWN0aW9uc1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2V0IF9zZWN0aW9ucyAoKSB7XG4gICAgXHRyZXR1cm4gdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1sYXlvdXR0b29sYmFyc2VjdGlvbl0nKS5tYXAoKGlkeCwgZWxlbSkgPT4geyBcbiAgICBcdFx0cmV0dXJuICQoZWxlbSkuZGF0YSgncGF0dGVybmxpYnJhcnlQbHVnaW4nKVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZXRyaWV2ZSBhIHRvb2xiYXIgc2VjdGlvbiBieSBuYW1lXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICovXG4gICAgc2VjdGlvbiAobmFtZSkge1xuICAgIFx0dmFyICRzZWN0aW9uO1xuICAgIFx0XG4gICAgICAgICQodGhpcy5fc2VjdGlvbnMpLmVhY2goKGlkeCwgX3NlY3Rpb24pID0+IHtcbiAgICAgICAgXHRpZiAoX3NlY3Rpb24uJGVsZW1lbnQgJiYgX3NlY3Rpb24uJGVsZW1lbnQuYXR0cigncmVsJykgPT0gbmFtZSkge1xuICAgICAgICBcdFx0JHNlY3Rpb24gPSBfc2VjdGlvbjtcbiAgICAgICAgXHR9XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuICgkc2VjdGlvbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmV0cmlldmUgYnVpbGRlcidzIHRvb2xiYXIgc2VjdGlvblxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2V0IF9idWlsZGVyU2VjdGlvbiAoKSB7XG4gICAgXHR2YXIgYnVpbGRlclNlY3Rpb24gPSBudWxsO1xuICAgIFx0dGhpcy5fc2VjdGlvbnMuZWFjaCgoaWR4LCBzZWN0aW9uKSA9PiB7ICBcbiAgICBcdFx0aWYgKHNlY3Rpb24uJGVsZW1lbnQuYXR0cigncmVsJykgPT0gJ2J1aWxkZXInKSB7XG4gICAgXHRcdFx0YnVpbGRlclNlY3Rpb24gPSBzZWN0aW9uO1xuICAgIFx0XHRcdHJldHVybiAoZmFsc2UpO1xuICAgIFx0XHR9XG4gICAgXHR9KTtcbiAgICBcdHJldHVybiBidWlsZGVyU2VjdGlvbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBoaWRlIGFsbCB0b29sYmFyIHNlY3Rpb25zXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICovXG4gICAgaGlkZVNlY3Rpb25zICgpIHtcbiAgICBcdHZhciBzZWN0aW9ucyA9IHRoaXMuX3NlY3Rpb25zO1xuICAgIFx0c2VjdGlvbnMuZWFjaCgoaWR4LCBzZWN0aW9uKSA9PiB7IHNlY3Rpb24uaGlkZSgpOyB9KTtcbiAgICBcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZyAoJ2J1aWxkZXI6JywgdGhpcy5fYnVpbGRlclNlY3Rpb24gKTtcblx0ICAgIC8vdGhpcy5fYnVpbGRlclNlY3Rpb24uc2hvdygpO1xuICAgIFx0c2VjdGlvbnMuZWFjaCgoaWR4LCBzZWN0aW9uKSA9PiB7XG4gICAgXHRcdGlmIChzZWN0aW9uLiRlbGVtZW50LmF0dHIoJ3JlbCcpID09ICdidWlsZGVyJykge1xuICAgIFx0XHRcdHNlY3Rpb24uc2hvdygpO1xuICAgIFx0XHR9XG4gICAgXHR9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzd2l0Y2ggdG9vbGJhciBzZWN0aW9ucyBhY2NvcmRpbmcgdG8gZm9jdXNlZCBlbGVtZW50XG4gICAgICogQGZ1bmN0aW9uXG4gICAgICovXG4gICAgc3dpdGNoU2VjdGlvbiAobmFtZSwgcmVmZXJlbmNlKSB7XG4gICAgXHR2YXIgc2VjdGlvbnMgPSB0aGlzLl9zZWN0aW9ucztcbiAgICBcdHNlY3Rpb25zLmVhY2goKGlkeCwgc2VjdGlvbikgPT4ge1xuICAgIFx0XHR2YXIgJHNlY3Rpb24gPSAkKHNlY3Rpb24pO1xuXG4gICAgXHRcdGlmIChzZWN0aW9uLiRlbGVtZW50LmF0dHIoJ3JlbCcpICE9ICdidWlsZGVyJykge1xuXHQgICAgXHRcdGlmIChzZWN0aW9uLiRlbGVtZW50LmF0dHIoJ3JlbCcpID09IG5hbWUpIHtcblx0ICAgIFx0XHRcdHNlY3Rpb24uc2hvdygpO1xuXHQgICAgXHRcdH0gZWxzZSB7XG5cdCAgICBcdFx0XHRzZWN0aW9uLmhpZGUoKTsgXG5cdCAgICBcdFx0fVxuICAgIFx0XHR9XG4gICAgXHR9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBnZW5lcmF0ZSBpbml0aWFsIG1hcmt1cFxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2V0IF9tYXJrdXAoKSB7XG4gICAgXHR2YXIgaHRtbCA9IFtcbiAgICBcdFx0JzxkaXYgZGF0YS1sYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXIgY2xhc3M9XCJ0b29sYmFyIGFjdGlvbnNcIj4nLFxuICAgIFx0XHQnPC9kaXY+J1xuICAgIFx0XTtcbiAgICBcdFxuICAgIFx0cmV0dXJuICQoaHRtbC5qb2luKCcnKSk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIERlc3Ryb3lzIHRoZSBsYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXIncyBzZWN0aW9ucy5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9kZXN0cm95U2VjdGlvbnMoKSB7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIERlc3Ryb3lzIHRoZSBsYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXIuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCcqJykub2ZmKCcucGwubGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyJyk7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcucGwubGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyJyk7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlKCk7XG4gICAgfVxuXHRcbn1cblxuTGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyLmRlZmF1bHRzID0ge1xuXHRzZWN0aW9uczogW1xuXHRcdHtcblx0XHRcdG5hbWUgOiAnbGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyJyxcblx0XHRcdGl0ZW1zOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlICA6ICdhY3Rpb24nLFxuXHRcdFx0XHRcdGxhYmVsIDogJ21vdmUgZWxlbWVudCcsXG5cdFx0XHRcdFx0aWNvbiAgOiAnZmEgZmEtYXJyb3dzJyxcblx0XHRcdFx0XHRhY3Rpb246ICcjbW92ZV9lbGVtZW50Jyxcblx0XHRcdFx0XHRldmVudHM6IHtcblx0XHRcdFx0XHQgICAgY2xpY2sgOiBMYXlvdXRidWlsZGVyQ2xpY2tkdW1teVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH1cblx0XVxufTtcblxuLy9QTEZvdW5kYXRpb24ucGx1Z2luKExheW91dGVsZW1lbnRkcmFndHJpZ2dlciwgJ0xheW91dGVsZW1lbnRkcmFndHJpZ2dlcicpO1xucGF0dGVybmxpYnJhcnkucGx1Z2luKExheW91dGVsZW1lbnRkcmFndHJpZ2dlciwgJ0xheW91dGVsZW1lbnRkcmFndHJpZ2dlcicpO1xuXG5pZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nKSB7XG5cdC8vIHJlcXVpcmUvQU1EIG1vZHVsZSBkZWZpbml0aW9uXG5cdGRlZmluZShbXSwgKHJlcXVpcmUsIGV4cG9ydHMsIG1vZHVsZSkgPT4ge1xuXHRcdHJldHVybiBMYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXI7XG5cdH0pO1xufSIsIi8qKlxuICogTGF5b3V0ZWxlbWVudHRvb2xiYXIgbW9kdWxlLlxuICogQG1vZHVsZSBwbGZvdW5kYXRpb24ubGF5b3V0ZWxlbWVudHRvb2xiYXJcbiAqIFxuICogQHJlcXVpcmVzIHBhdHRlcm5saWJyYXJ5LlBsdWdpblxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24uVHJpZ2dlcnNcbiAqL1xuY2xhc3MgTGF5b3V0ZWxlbWVudHRvb2xiYXIgZXh0ZW5kcyBQbHVnaW4ge1xuXG4gICAgLyoqXG4gICAgICogU2V0dXAgYSBuZXcgaW5zdGFuY2Ugb2YgYSBsYXlvdXRlbGVtZW50dG9vbGJhci5cbiAgICAgKiBAY2xhc3NcbiAgICAgKiBAbmFtZSBMYXlvdXRlbGVtZW50dG9vbGJhclxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYSBsYXlvdXRlbGVtZW50dG9vbGJhci5cbiAgICAgKiAgICAgICAgT2JqZWN0IHNob3VsZCBiZSBvZiB0aGUgbGF5b3V0ZWxlbWVudHRvb2xiYXIgcGFuZWwsIHJhdGhlciB0aGFuIGl0cyBhbmNob3IuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgICAqL1xuXHRfc2V0dXAoZWxlbWVudCwgb3B0aW9ucykge1xuXHRcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0ZWxlbWVudHRvb2xiYXIgaW5pdCcpO1xuICAgIFx0dGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBMYXlvdXRlbGVtZW50dG9vbGJhci5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICdsYXlvdXRlbGVtZW50dG9vbGJhcic7IC8vIGllOSBiYWNrIGNvbXBhdFxuXG4gICAgICAgIC8vIFRyaWdnZXJzIGluaXQgaXMgaWRlbXBvdGVudCwganVzdCBuZWVkIHRvIG1ha2Ugc3VyZSBpdCBpcyBpbml0aWFsaXplZFxuICAgICAgICBQTEZvdW5kYXRpb24uVHJpZ2dlcnMuaW5pdCgkKTtcblxuICAgICAgICB0aGlzLl9pbml0KCk7XG5cbiAgICAgICAgLy8gKG1heWJlLCB0aGlzIGxpbmUgaXMgbm90IG5lc3Nlc3NhcnkgYW55bW9yZS4uLj8hKVxuICAgICAgICAvL1BMRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnTGF5b3V0ZWxlbWVudHRvb2xiYXInKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0ZWxlbWVudHRvb2xiYXIgaW5pdGlhbGl6ZWQnKTtcbiAgICB9XG5cdFxuXHQvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgcGx1Z2luIGJ5IHNldHRpbmcvY2hlY2tpbmcgb3B0aW9ucyBhbmQgYXR0cmlidXRlcywgYWRkaW5nIGhlbHBlciB2YXJpYWJsZXMsIGFuZCBzYXZpbmcgdGhlIGFuY2hvci5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0KCkge1xuXHQgICAgdGhpcy5fZXZlbnRzKCk7XG5cdCAgICB0aGlzLmhpZGVTZWN0aW9ucygpO1xuXHQgICAgaWYgKHRoaXMuJGVsZW1lbnQpIHtcblx0ICAgIFx0dGhpcy4kZWxlbWVudC50cmlnZ2VyKCdpbml0aWFsaXplZC5wbC5sYXlvdXRlbGVtZW50dG9vbGJhcicpO1xuXHQgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIHRoZSBlbGVtZW50IHV0aWxpemluZyB0aGUgdHJpZ2dlcnMgdXRpbGl0eSBsaWJyYXJ5LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2V2ZW50cygpIHtcbiAgICBcdHRoaXMuX2FkZEluaXRIYW5kbGVyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBpbml0aWFsemF0aW9uIGV2ZW50IGxpc3RlbmVyc1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZEluaXRIYW5kbGVyKCkge1xuICAgIFx0dmFyICR0aGlzID0gdGhpcztcbiAgICBcdHRoaXMuJGVsZW1lbnRcbiAgICBcdCAgICAub2ZmKCdpbml0aWFsaXplZC5wbC5sYXlvdXRlbGVtZW50dG9vbGJhcicpXG4gICAgXHQgICAgLm9uKCdpbml0aWFsaXplZC5wbC5sYXlvdXRlbGVtZW50dG9vbGJhcicsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgXHQgICAgXHQkdGhpcy5faW5pdFNlY3Rpb25zLmFwcGx5KCR0aGlzKTtcbiAgICBcdCAgICB9KTtcbiAgICB9XG5cblx0LyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIHRvb2xiYXIgc2VjdGlvbnMgZ2l2ZW4gYnkgY29uZmlnXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdFNlY3Rpb25zKCkge1xuICAgICAgICBpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGVsZW1lbnR0b29sYmFyIGluaXRpYWxpemUgc2VjdGlvbicsIHRoaXMub3B0aW9ucy5zZWN0aW9ucyk7XG4gICAgXHR2YXIgJHRoaXMgPSB0aGlzO1xuICAgIFx0JCh0aGlzLm9wdGlvbnMuc2VjdGlvbnMpLmVhY2goKGlkeCwgc2VjdGlvbmNvbmZpZykgPT4ge1xuICAgIFx0XHR2YXIgJGxheW91dGVsZW1lbnQgPSAkdGhpcy4kZWxlbWVudC5wYXJlbnQoKS5kYXRhKCdwYXR0ZXJubGlicmFyeVBsdWdpbicpO1xuICAgIFx0XHRpZiAoICRsYXlvdXRlbGVtZW50LmNsYXNzbmFtZSA9PSBzZWN0aW9uY29uZmlnLm5hbWUgKSB7XG4gICAgXHRcdFx0aWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRlbGVtZW50dG9vbGJhciBpbml0IHNlY3Rpb24nLCBzZWN0aW9uY29uZmlnKTtcblx0ICAgIFx0XHRpZiAoICR0aGlzLiRlbGVtZW50LmZpbmQoJz4gW2RhdGEtbGF5b3V0dG9vbGJhcnNlY3Rpb25dJykubGVuZ3RoID09IDAgKSB7XG5cdCAgICBcdFx0XHQkdGhpcy5faW5pdFNlY3Rpb24oc2VjdGlvbmNvbmZpZyk7XG5cdCAgICBcdFx0fVxuICAgIFx0XHR9XG4gICAgXHR9KVxuICAgIH1cblxuXHQvKipcbiAgICAgKiBJbml0aWFsaXplcyBhIHNpbmdsZSBuZXcgdG9vbGJhciBzZWN0aW9uc1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXRTZWN0aW9uKHNlY3Rpb25jb25maWcpIHtcbiAgICAgICAgaWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRlbGVtZW50dG9vbGJhciBpbml0aWFsaXplIHNlY3Rpb24nLCBzZWN0aW9uY29uZmlnKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuJGVsZW1lbnQucHJlcGVuZChMYXlvdXR0b29sYmFyc2VjdGlvbi5wcm90b3R5cGUudG9FbGVtZW50KHNlY3Rpb25jb25maWcpKTtcbiAgICAgICAgdmFyICRzZWN0aW9uID0gbmV3IExheW91dHRvb2xiYXJzZWN0aW9uIChcbiAgICAgICAgXHR0aGlzLiRlbGVtZW50LmZpbmQoYD4gW3JlbD1cIiR7c2VjdGlvbmNvbmZpZy5uYW1lfVwiXWApLFxuICAgICAgICBcdHNlY3Rpb25jb25maWdcbiAgICAgICAgKTtcbiAgICAgICAgJHNlY3Rpb24uJGVsZW1lbnQuY2hpbGRyZW4oKS5maXJzdCgpLnBsZm91bmRhdGlvbigpOy8vcGF0dGVybmxpYnJhcnkoKTtcbiAgICAgICAgJHNlY3Rpb24uJGVsZW1lbnQudHJpZ2dlcignaW5pdGlhbGl6ZWQnKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0ZWxlbWVudHRvb2xiYXIgc2VjdGlvbiBpbml0aWFsaXplZDogJywgJHNlY3Rpb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHJpZXZlIGFsbCB0b29sYmFyIHNlY3Rpb25zXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXQgX3NlY3Rpb25zICgpIHtcbiAgICBcdHJldHVybiB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLWxheW91dHRvb2xiYXJzZWN0aW9uXScpLm1hcCgoaWR4LCBlbGVtKSA9PiB7IFxuICAgIFx0XHRyZXR1cm4gJChlbGVtKS5kYXRhKCdwYXR0ZXJubGlicmFyeVBsdWdpbicpXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHJpZXZlIGEgdG9vbGJhciBzZWN0aW9uIGJ5IG5hbWVcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cbiAgICBzZWN0aW9uIChuYW1lKSB7XG4gICAgXHR2YXIgJHNlY3Rpb247XG4gICAgXHRcbiAgICAgICAgJCh0aGlzLl9zZWN0aW9ucykuZWFjaCgoaWR4LCBfc2VjdGlvbikgPT4ge1xuICAgICAgICBcdGlmIChfc2VjdGlvbi4kZWxlbWVudCAmJiBfc2VjdGlvbi4kZWxlbWVudC5hdHRyKCdyZWwnKSA9PSBuYW1lKSB7XG4gICAgICAgIFx0XHQkc2VjdGlvbiA9IF9zZWN0aW9uO1xuICAgICAgICBcdH1cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gKCRzZWN0aW9uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZXRyaWV2ZSBidWlsZGVyJ3MgdG9vbGJhciBzZWN0aW9uXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXQgX2J1aWxkZXJTZWN0aW9uICgpIHtcbiAgICBcdHZhciBidWlsZGVyU2VjdGlvbiA9IG51bGw7XG4gICAgXHR0aGlzLl9zZWN0aW9ucy5lYWNoKChpZHgsIHNlY3Rpb24pID0+IHsgIFxuICAgIFx0XHRpZiAoc2VjdGlvbi4kZWxlbWVudC5hdHRyKCdyZWwnKSA9PSAnYnVpbGRlcicpIHtcbiAgICBcdFx0XHRidWlsZGVyU2VjdGlvbiA9IHNlY3Rpb247XG4gICAgXHRcdFx0cmV0dXJuIChmYWxzZSk7XG4gICAgXHRcdH1cbiAgICBcdH0pO1xuICAgIFx0cmV0dXJuIGJ1aWxkZXJTZWN0aW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGhpZGUgYWxsIHRvb2xiYXIgc2VjdGlvbnNcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cbiAgICBoaWRlU2VjdGlvbnMgKCkge1xuICAgIFx0dmFyIHNlY3Rpb25zID0gdGhpcy5fc2VjdGlvbnM7XG4gICAgXHRzZWN0aW9ucy5lYWNoKChpZHgsIHNlY3Rpb24pID0+IHsgc2VjdGlvbi5oaWRlKCk7IH0pO1xuICAgIFx0aWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nICgnYnVpbGRlcjonLCB0aGlzLl9idWlsZGVyU2VjdGlvbiApO1xuXHQgICAgLy90aGlzLl9idWlsZGVyU2VjdGlvbi5zaG93KCk7XG4gICAgXHRzZWN0aW9ucy5lYWNoKChpZHgsIHNlY3Rpb24pID0+IHtcbiAgICBcdFx0aWYgKHNlY3Rpb24uJGVsZW1lbnQuYXR0cigncmVsJykgPT0gJ2J1aWxkZXInKSB7XG4gICAgXHRcdFx0c2VjdGlvbi5zaG93KCk7XG4gICAgXHRcdH1cbiAgICBcdH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHN3aXRjaCB0b29sYmFyIHNlY3Rpb25zIGFjY29yZGluZyB0byBmb2N1c2VkIGVsZW1lbnRcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cbiAgICBzd2l0Y2hTZWN0aW9uIChuYW1lLCByZWZlcmVuY2UpIHtcbiAgICBcdHZhciBzZWN0aW9ucyA9IHRoaXMuX3NlY3Rpb25zO1xuICAgIFx0c2VjdGlvbnMuZWFjaCgoaWR4LCBzZWN0aW9uKSA9PiB7XG4gICAgXHRcdHZhciAkc2VjdGlvbiA9ICQoc2VjdGlvbik7XG5cbiAgICBcdFx0aWYgKHNlY3Rpb24uJGVsZW1lbnQuYXR0cigncmVsJykgIT0gJ2J1aWxkZXInKSB7XG5cdCAgICBcdFx0aWYgKHNlY3Rpb24uJGVsZW1lbnQuYXR0cigncmVsJykgPT0gbmFtZSkge1xuXHQgICAgXHRcdFx0c2VjdGlvbi5zaG93KCk7XG5cdCAgICBcdFx0fSBlbHNlIHtcblx0ICAgIFx0XHRcdHNlY3Rpb24uaGlkZSgpOyBcblx0ICAgIFx0XHR9XG4gICAgXHRcdH1cbiAgICBcdH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGdlbmVyYXRlIGluaXRpYWwgbWFya3VwXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXQgX21hcmt1cCgpIHtcbiAgICBcdHZhciBodG1sID0gW1xuICAgIFx0XHQnPGRpdiBkYXRhLWxheW91dGVsZW1lbnR0b29sYmFyIGNsYXNzPVwidG9vbGJhciBhY3Rpb25zXCI+JyxcbiAgICBcdFx0JzwvZGl2PidcbiAgICBcdF07XG4gICAgXHRcbiAgICBcdHJldHVybiAkKGh0bWwuam9pbignJykpO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBEZXN0cm95cyB0aGUgbGF5b3V0ZWxlbWVudHRvb2xiYXIncyBzZWN0aW9ucy5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9kZXN0cm95U2VjdGlvbnMoKSB7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIERlc3Ryb3lzIHRoZSBsYXlvdXRlbGVtZW50dG9vbGJhci5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9kZXN0cm95KCkge1xuICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoJyonKS5vZmYoJy5wbC5sYXlvdXRlbGVtZW50dG9vbGJhcicpO1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZignLnBsLmxheW91dGVsZW1lbnR0b29sYmFyJyk7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlKCk7XG4gICAgfVxuXHRcbn1cblxuTGF5b3V0ZWxlbWVudHRvb2xiYXIuZGVmYXVsdHMgPSB7XG5cdHNlY3Rpb25zOiBbXG5cdFx0TGF5b3V0dG9vbGJhcnNlY3Rpb25MYXlvdXRyb3csXG5cdFx0TGF5b3V0dG9vbGJhcnNlY3Rpb25MYXlvdXRjb2x1bW4sXG5cdFx0TGF5b3V0dG9vbGJhcnNlY3Rpb25QYXR0ZXJuXG5cdF1cbn07XG5cbi8vUExGb3VuZGF0aW9uLnBsdWdpbihMYXlvdXRlbGVtZW50dG9vbGJhciwgJ0xheW91dGVsZW1lbnR0b29sYmFyJyk7XG5wYXR0ZXJubGlicmFyeS5wbHVnaW4oTGF5b3V0ZWxlbWVudHRvb2xiYXIsICdMYXlvdXRlbGVtZW50dG9vbGJhcicpO1xuXG5pZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nKSB7XG5cdC8vIHJlcXVpcmUvQU1EIG1vZHVsZSBkZWZpbml0aW9uXG5cdGRlZmluZShbXSwgKHJlcXVpcmUsIGV4cG9ydHMsIG1vZHVsZSkgPT4ge1xuXHRcdHJldHVybiBMYXlvdXRlbGVtZW50dG9vbGJhcjtcblx0fSk7XG59IiwiLyoqXG4gKiBMYXlvdXRwYXR0ZXJuIG1vZHVsZS5cbiAqIEBtb2R1bGUgcGF0dGVybmxpYnJhcnkubGF5b3V0cGF0dGVyblxuICogXG4gKiBAcmVxdWlyZXMgcGF0dGVybmxpYnJhcnkuTGF5b3V0ZWxlbWVudFxuICovXG5jbGFzcyBMYXlvdXRwYXR0ZXJuIGV4dGVuZHMgTGF5b3V0ZWxlbWVudCB7XG5cblx0Z2V0IGNsYXNzbmFtZSAoKSB7IHJldHVybiAnbGF5b3V0cGF0dGVybic7IH1cblx0XG59XG5cblxuLy9QTEZvdW5kYXRpb24ucGx1Z2luKExheW91dHBhdHRlcm4sICdMYXlvdXRwYXR0ZXJuJyk7XG5wYXR0ZXJubGlicmFyeS5wbHVnaW4oTGF5b3V0cGF0dGVybiwgJ0xheW91dHBhdHRlcm4nKTtcblxuIiwiLyoqXG4gKiBMYXlvdXRyb3cgbW9kdWxlLlxuICogQG1vZHVsZSBwbGZvdW5kYXRpb24ubGF5b3V0cm93XG4gKiBcbiAqIEByZXF1aXJlcyBwbGZvdW5kYXRpb24uTGF5b3V0ZWxlbWVudFxuICovXG5jbGFzcyBMYXlvdXRyb3cgZXh0ZW5kcyBMYXlvdXRlbGVtZW50IHtcblxuXHRnZXQgY2xhc3NuYW1lICgpIHsgcmV0dXJuICdsYXlvdXRyb3cnOyB9XG5cdFxufVxuXG5cbi8vUExGb3VuZGF0aW9uLnBsdWdpbihMYXlvdXRyb3csICdMYXlvdXRyb3cnKTtcbnBhdHRlcm5saWJyYXJ5LnBsdWdpbihMYXlvdXRyb3csICdMYXlvdXRyb3cnKTtcblxuIiwiLyoqXG4gKiBMYXlvdXR0b29sYmFyYWN0aW9uIG1vZHVsZS5cbiAqIEBtb2R1bGUgcGF0dGVybmxpYnJhcnkubGF5b3V0dG9vbGJhcmFjdGlvblxuICogXG4gKiBAcmVxdWlyZXMgcGF0dGVybmxpYnJhcnkuUGx1Z2luXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi5UcmlnZ2Vyc1xuICovXG5jbGFzcyBMYXlvdXR0b29sYmFyYWN0aW9uIGV4dGVuZHMgUGx1Z2luIHtcblxuICAgIC8qKlxuICAgICAqIFNldHVwIGEgbmV3IGluc3RhbmNlIG9mIGEgbGF5b3V0dG9vbGJhcmFjdGlvbi5cbiAgICAgKiBAY2xhc3NcbiAgICAgKiBAbmFtZSBMYXlvdXR0b29sYmFyYWN0aW9uXG4gICAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhIGxheW91dHRvb2xiYXJhY3Rpb24uXG4gICAgICogICAgICAgIE9iamVjdCBzaG91bGQgYmUgb2YgdGhlIGxheW91dHRvb2xiYXJhY3Rpb24gcGFuZWwsIHJhdGhlciB0aGFuIGl0cyBhbmNob3IuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgICAqL1xuXHRfc2V0dXAoZWxlbWVudCwgb3B0aW9ucykge1xuXHRcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0dG9vbGJhcmFjdGlvbiBpbml0OicsIG9wdGlvbnMpO1xuICAgIFx0dGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBMYXlvdXR0b29sYmFyYWN0aW9uLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ2xheW91dHRvb2xiYXJhY3Rpb24nOyAvLyBpZTkgYmFjayBjb21wYXRcblxuICAgICAgICAvLyBUcmlnZ2VycyBpbml0IGlzIGlkZW1wb3RlbnQsIGp1c3QgbmVlZCB0byBtYWtlIHN1cmUgaXQgaXMgaW5pdGlhbGl6ZWRcbiAgICAgICAgUExGb3VuZGF0aW9uLlRyaWdnZXJzLmluaXQoJCk7XG5cbiAgICAgICAgdGhpcy5faW5pdCgpO1xuXG4gICAgICAgIC8vIChtYXliZSwgdGhpcyBsaW5lIGlzIG5vdCBuZXNzZXNzYXJ5IGFueW1vcmUuLi4/ISlcbiAgICAgICAgLy9QTEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0xheW91dHRvb2xiYXJhY3Rpb24nKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0dG9vbGJhcmFjdGlvbiBpbml0aWFsaXplZCcpO1xuICAgIH1cblx0XG5cdC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBwbHVnaW4gYnkgc2V0dGluZy9jaGVja2luZyBvcHRpb25zIGFuZCBhdHRyaWJ1dGVzLCBhZGRpbmcgaGVscGVyIHZhcmlhYmxlcywgYW5kIHNhdmluZyB0aGUgYW5jaG9yLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXQoKSB7XG4gICAgXHRpZiAodHlwZW9mIHRoaXMub3B0aW9ucy50eXBlID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIFx0dGhyb3cgKG5ldyBMYXlvdXRidWlsZGVyRXhjZXB0aW9uKCdubyB0eXBlIGdpdmVuIGZvciB0b29sYmFyIGFjdGlvbicpKS50b1N0cmluZygpO1xuICAgIFx0fVxuICAgIFx0aWYgKCAodGhpcy5vcHRpb25zLnR5cGUgPT0gJ2FjdGlvbicpICYmICh0eXBlb2YgdGhpcy5vcHRpb25zLmFjdGlvbiA9PSAndW5kZWZpbmVkJykgKSB7XG4gICAgICAgIFx0dGhyb3cgKG5ldyBMYXlvdXRidWlsZGVyRXhjZXB0aW9uKCdubyBhY3Rpb24taWQgZ2l2ZW4gZm9yIHRvb2xiYXIgYWN0aW9uJykpLnRvU3RyaW5nKCk7XG4gICAgXHR9XG4gICAgXHRcblx0ICAgIHRoaXMuX2V2ZW50cygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIHRoZSBlbGVtZW50IHV0aWxpemluZyB0aGUgdHJpZ2dlcnMgdXRpbGl0eSBsaWJyYXJ5LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2V2ZW50cygpIHtcbiAgICBcdHRoaXMuX2FkZEluaXRIYW5kbGVyKCk7XG4gICAgXHRpZiAoIHRoaXMub3B0aW9ucy5ldmVudHMgJiYgKHR5cGVvZiB0aGlzLm9wdGlvbnMuZXZlbnRzLmNsaWNrID09ICdmdW5jdGlvbicpICkge1xuICAgICAgICBcdHRoaXMuX2FkZENsaWNrSGFuZGxlcih0aGlzLm9wdGlvbnMuZXZlbnRzLmNsaWNrKTtcbiAgICBcdH1cbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogQWRkcyBpbml0aWFsemF0aW9uIGV2ZW50IGxpc3RlbmVyc1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZEluaXRIYW5kbGVyKCkge1xuICAgIFx0dmFyICR0aGlzID0gdGhpcztcbiAgICBcdHRoaXMuJGVsZW1lbnRcbiAgICBcdCAgICAub2ZmKCdpbml0aWFsaXplZC5wbC5sYXlvdXR0b29sYmFyYWN0aW9uJylcbiAgICBcdCAgICAub24oJ2luaXRpYWxpemVkLnBsLmxheW91dHRvb2xiYXJhY3Rpb24nLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIFx0ICAgIFx0Ly8kdGhpcy5faW5pdEl0ZW1zLmFwcGx5KCR0aGlzKTtcbiAgICBcdCAgICB9KTtcbiAgICB9XG5cbiAgICBfYWRkQ2xpY2tIYW5kbGVyIChjbGlja0hhbmRsZXIpIHtcbiAgICBcdGlmICggY2xpY2tIYW5kbGVyICYmICh0eXBlb2YgY2xpY2tIYW5kbGVyID09ICdmdW5jdGlvbicpICkge1xuICAgIFx0ICAgIHRoaXMuJGVsZW1lbnQub2ZmKCdjbGljay5wbC5sYXlvdXR0b29sYmFyYWN0aW9uJykub24oJ2NsaWNrLnBsLmxheW91dHRvb2xiYXJhY3Rpb24nLCBjbGlja0hhbmRsZXIpO1xuICAgIFx0fVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGdlbmVyYXRlIGluaXRpYWwgbWFya3VwXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXQgX21hcmt1cCgpIHtcbiAgICBcdHZhciBodG1sID0gW1xuXHRcdCAgICBgPGEgY2xhc3M9XCJidXR0b24gc21hbGxcIiBocmVmPVwiJHt0aGlzLm9wdGlvbnMuYWN0aW9ufVwiIHRpdGxlPVwiJHt0aGlzLm9wdGlvbnMubGFiZWx9XCIgZGF0YS1sYXlvdXR0b29sYmFyYWN0aW9uPmAsXG5cdFx0ICAgICAgICBgPGkgY2xhc3M9XCIke3RoaXMub3B0aW9ucy5pY29ufVwiPjwvaT5gLFxuXHRcdCAgICAgICAgYDxzcGFuIGNsYXNzPVwiaGlkZS1mb3Itc21hbGwgc2hvdy1mb3IteHhsYXJnZVwiPiAke3RoaXMub3B0aW9ucy5sYWJlbH08L3NwYW4+YCxcblx0XHQgICAgJzwvYT4nXG4gICAgXHRdO1xuICAgIFx0XG4gICAgXHRyZXR1cm4gJChodG1sLmpvaW4oJycpKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogcmV0dXJuIGluaXRpYWwgbWFya3VwIGVsZW1lbnRzXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICovXG4gICAgdG9FbGVtZW50KHNlY3Rpb25jb25maWcpIHtcbiAgICBcdHZhciBjdXJyZW50T3B0aW9ucyA9ICh0aGlzLm9wdGlvbnMpO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCBzZWN0aW9uY29uZmlnKTtcbiAgICBcdHZhciAkZWxlbWVudCA9ICQodGhpcy50b1N0cmluZygpKTtcbiAgICBcdHRoaXMub3B0aW9ucyA9IGN1cnJlbnRPcHRpb25zO1xuICAgIFx0cmV0dXJuICRlbGVtZW50O1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBEZXN0cm95cyB0aGUgbGF5b3V0dG9vbGJhcmFjdGlvbi5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cbiAgICBfZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCcqJykub2ZmKCcucGwubGF5b3V0dG9vbGJhcmFjdGlvbicpO1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZignLnBsLmxheW91dHRvb2xiYXJhY3Rpb24nKTtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmUoKTtcbiAgICB9XG5cdFxufVxuXG5wYXR0ZXJubGlicmFyeS5wbHVnaW4oTGF5b3V0dG9vbGJhcmFjdGlvbiwgJ0xheW91dHRvb2xiYXJhY3Rpb24nKTtcblxuIiwiLyoqXG4gKiBMYXlvdXR0b29sYmFyc2VjdGlvbiBtb2R1bGUuXG4gKiBAbW9kdWxlIHBsZm91bmRhdGlvbi5sYXlvdXR0b29sYmFyc2VjdGlvblxuICogXG4gKiBAcmVxdWlyZXMgcGF0dGVybmxpYnJhcnkuUGx1Z2luXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi5UcmlnZ2Vyc1xuICovXG5jbGFzcyBMYXlvdXR0b29sYmFyc2VjdGlvbiBleHRlbmRzIFBsdWdpbiB7XG5cbiAgICAvKipcbiAgICAgKiBTZXR1cCBhIG5ldyBpbnN0YW5jZSBvZiBhIGxheW91dHRvb2xiYXJzZWN0aW9uLlxuICAgICAqIEBjbGFzc1xuICAgICAqIEBuYW1lIExheW91dHRvb2xiYXJzZWN0aW9uXG4gICAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhIGxheW91dHRvb2xiYXJzZWN0aW9uLlxuICAgICAqICAgICAgICBPYmplY3Qgc2hvdWxkIGJlIG9mIHRoZSBsYXlvdXR0b29sYmFyc2VjdGlvbiBwYW5lbCwgcmF0aGVyIHRoYW4gaXRzIGFuY2hvci5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAgICovXG5cdF9zZXR1cChlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgXHR0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIExheW91dHRvb2xiYXJzZWN0aW9uLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ2xheW91dHRvb2xiYXJzZWN0aW9uJzsgLy8gaWU5IGJhY2sgY29tcGF0XG5cbiAgICAgICAgLy8gVHJpZ2dlcnMgaW5pdCBpcyBpZGVtcG90ZW50LCBqdXN0IG5lZWQgdG8gbWFrZSBzdXJlIGl0IGlzIGluaXRpYWxpemVkXG4gICAgICAgIFBMRm91bmRhdGlvbi5UcmlnZ2Vycy5pbml0KCQpO1xuXG4gICAgICAgIHRoaXMuX2luaXQoKTtcblxuICAgICAgICAvLyAobWF5YmUsIHRoaXMgbGluZSBpcyBub3QgbmVzc2Vzc2FyeSBhbnltb3JlLi4uPyEpXG4gICAgICAgIC8vUExGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdMYXlvdXR0b29sYmFyc2VjdGlvbicpO1xuICAgICAgICBcbiAgICAgICAgaWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXR0b29sYmFyc2VjdGlvbiBpbml0aWFsaXplZCcpO1xuICAgIH1cblx0XG5cdFxuICAgIC8qKlxuICAgICAqIFJldHJpZXZlIGFjdGlvbiBpdGVtcycgY29udGFpbmVyIGVsZW1lbnRcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXHRnZXQgX2NvbnRhaW5lcigpIHtcblx0XHRyZXR1cm4gKHRoaXMuJGVsZW1lbnQuZmluZChgPiAke3RoaXMub3B0aW9ucy5zZWN0aW9uY29udGFpbmVyLnRhZ31gKSk7XG5cdH1cblx0XG5cdC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBwbHVnaW4gYnkgc2V0dGluZy9jaGVja2luZyBvcHRpb25zIGFuZCBhdHRyaWJ1dGVzLCBhZGRpbmcgaGVscGVyIHZhcmlhYmxlcywgYW5kIHNhdmluZyB0aGUgYW5jaG9yLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXQoKSB7XG5cdCAgICB0aGlzLl9ldmVudHMoKTtcbiAgICB9XG4gICAgXG4gICAgX2luaXRJdGVtcygpIHtcbiAgICBcdHZhciAkdGhpcyA9IHRoaXM7XG4gICAgICAgICQubWFrZUFycmF5KCQodGhpcy5vcHRpb25zLml0ZW1zKS5tYXAoKGlkeCwgaXRlbSkgPT4ge1xuICAgICAgICBcdHZhciAkaXRlbTtcbiAgICAgICAgXHRzd2l0Y2ggKGl0ZW0udHlwZSl7XG5cdCAgICAgICAgXHRjYXNlICdzZXBhcmF0b3InIDoge1xuXHQgICAgICAgIFx0XHQkaXRlbSA9ICQoW1xuXHQgICAgICAgIFx0XHRcdGA8JHskdGhpcy5vcHRpb25zLml0ZW1jb250YWluZXIudGFnfSBjbGFzcz1cIm1lbnUtc2VwYXJhdG9yICR7JHRoaXMub3B0aW9ucy5pdGVtY29udGFpbmVyLmNsYXNzbmFtZXMuam9pbignICcpfVwiPmAsXG5cdCAgICAgICAgXHRcdFx0ICAgICBgPHNwYW4+Jm5ic3A7PC9zcGFuPmAsXG5cdCAgICAgICAgXHRcdFx0YDwvJHskdGhpcy5vcHRpb25zLml0ZW1jb250YWluZXIudGFnfT5gXG5cdCAgICAgICAgXHQgICAgXS5qb2luKCcnKSk7XG5cdCAgICAgICAgXHRcdGJyZWFrO1xuXHQgICAgICAgIFx0fVxuXHQgICAgICAgIFx0Y2FzZSAnYWN0aW9uJyA6XG5cdCAgICAgICAgXHRkZWZhdWx0IDoge1xuXHQgICAgICAgIFx0XHQkaXRlbSA9ICQoW1xuXHQgICAgICAgIFx0XHRcdGA8JHskdGhpcy5vcHRpb25zLml0ZW1jb250YWluZXIudGFnfSBjbGFzcz1cIiR7JHRoaXMub3B0aW9ucy5pdGVtY29udGFpbmVyLmNsYXNzbmFtZXMuam9pbignICcpfVwiICR7JHRoaXMub3B0aW9ucy5pdGVtY29udGFpbmVyLmF0dHJpYnV0ZXMuam9pbignICcpfT5gLFxuXHQgICAgICAgIFx0XHRcdGA8LyR7JHRoaXMub3B0aW9ucy5pdGVtY29udGFpbmVyLnRhZ30+YFxuXHQgICAgICAgIFx0XHRdXG5cdCAgICAgICAgXHRcdC5qb2luKCcnKSlcblx0ICAgICAgICBcdFx0LmFwcGVuZChcblx0ICAgICAgICBcdFx0XHRMYXlvdXR0b29sYmFyYWN0aW9uLnByb3RvdHlwZS50b0VsZW1lbnQoaXRlbSlcblx0ICAgICAgICBcdFx0KTtcblx0ICAgICAgICBcdH1cbiAgICAgICAgXHR9XG4gICAgICAgIFx0aWYgKCRpdGVtICYmICRpdGVtLmZpbmQoJz4gYTpmaXJzdC1jaGlsZCcpKSB7XG4gICAgICAgIFx0XHQkaXRlbS5maW5kKCc+IGE6Zmlyc3QtY2hpbGQnKS5kYXRhKCAncGF0dGVybmxpYnJhcnlQbHVnaW4nLCBuZXcgTGF5b3V0dG9vbGJhcmFjdGlvbiAoJGl0ZW0uZmluZCgnPiBhOmZpcnN0LWNoaWxkJyksIGl0ZW0pICk7XG4gICAgICAgIFx0XHR0aGlzLl9jb250YWluZXIuYXBwZW5kKCAkaXRlbSApO1xuICAgICAgICBcdFx0XG4gICAgICAgICAgICAgICAgaWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXR0b29sYmFyc2VjdGlvbiBpdGVtIGluaXRpYWxpemVkOiAnLCAkaXRlbS5jaGlsZHJlbigpLmZpcnN0KCkpO1xuICAgICAgICBcdFx0Ly8kaXRlbS5jaGlsZHJlbigpLmZpcnN0KCkudHJpZ2dlcignaW5pdGlhbGl6ZWQnKTtcbiAgICAgICAgXHR9XG4gICAgICAgIH0pKTtcbiAgICBcdFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIHRoZSBlbGVtZW50IHV0aWxpemluZyB0aGUgdHJpZ2dlcnMgdXRpbGl0eSBsaWJyYXJ5LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2V2ZW50cygpIHtcbiAgICBcdHRoaXMuX2FkZEluaXRIYW5kbGVyKCk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIEFkZHMgaW5pdGlhbHphdGlvbiBldmVudCBsaXN0ZW5lcnNcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRJbml0SGFuZGxlcigpIHtcbiAgICBcdHZhciAkdGhpcyA9IHRoaXM7XG4gICAgXHR0aGlzLiRlbGVtZW50XG4gICAgXHQgICAgLm9mZignaW5pdGlhbGl6ZWQucGwubGF5b3V0dG9vbGJhcnNlY3Rpb24nKVxuICAgIFx0ICAgIC5vbignaW5pdGlhbGl6ZWQucGwubGF5b3V0dG9vbGJhcnNlY3Rpb24nLCAoZSkgPT4ge1xuICAgIFx0ICAgIFx0aWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXR0b29sYmFyc2VjdGlvbiBpbml0IGhhbmRsZXInKTtcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIFx0JHRoaXMuX2FkZEZvY3VzSGFuZGxlcigpO1xuICAgIFx0ICAgIFx0JHRoaXMuX2luaXRJdGVtcy5hcHBseSgkdGhpcyk7XG4gICAgXHQgICAgfSk7XG4gICAgfVxuXG4gICAgX2FkZENsaWNrSGFuZGxlciAoKSB7XG4gICAgXHR2YXIgX3RoaXMgPSB0aGlzO1xuICAgIFx0XG4gICAgXHR2YXIgJGZ1bGxzY3JlZW5Ub2dnbGVyID0gdGhpcy4kZWxlbWVudC5maW5kKCdbaHJlZj1cIiNzd2l0Y2hfZnVsbHNjcmVlblwiXScpO1xuXHQgICAgJGZ1bGxzY3JlZW5Ub2dnbGVyLm9mZignY2xpY2sucGwubGF5b3V0dG9vbGJhcnNlY3Rpb24nKS5vbignY2xpY2sucGwubGF5b3V0dG9vbGJhcnNlY3Rpb24nLCAoZSkgPT4ge1xuXHQgICAgXHR2YXIgJGxheW91dGJvZHkgPSAkKCdbZGF0YS1sYXlvdXRib2R5XScpO1xuXHQgICAgXHQkbGF5b3V0Ym9keS5kYXRhKCdwYXR0ZXJubGlicmFyeVBsdWdpbicpLnN3aXRjaEZ1bGxzY3JlZW4oKTtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cdCAgICAgICAgaWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXR0b29sYmFyc2VjdGlvbiBmdWxsc2NyZWVuIHN3aXRjaCBjbGljaycpO1xuXHRcdH0pO1xuXHQgICAgXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBmb2N1cyBoYW5kbGVycyBmb3IgbGF5b3V0dG9vbGJhcnNlY3Rpb24uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkRm9jdXNIYW5kbGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgXHR2YXIgJGJ1aWxkZXIgPSB0aGlzLl9idWlsZGVyO1xuICAgIFx0aWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXR0b29sYmFyc2VjdGlvbiBlbGVtZW50IGZvY3VzIGhhbmRsZXIgYnVpbGRlcjonLCAkYnVpbGRlcik7XG4gICAgICAgIGlmICgkKCdbZGF0YS1sYXlvdXRidWlsZGVyXScpKSB7XG4gICAgXHQgICAgJCgnW2RhdGEtbGF5b3V0YnVpbGRlcl0nKVxuXHQgICAgICAgICAgICAub2ZmKCdmb2N1c2VkLnBsLmxheW91dGVsZW1lbnQnKVxuXHQgICAgICAgICAgICAub24oJ2ZvY3VzZWQucGwubGF5b3V0ZWxlbWVudCcsICdbZGF0YS1sYXlvdXRyb3ddLFtkYXRhLWxheW91dGNvbHVtbl0nICwgZnVuY3Rpb24oZSl7XG5cdFxuXHQgICAgICAgICAgICBcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0dG9vbGJhcnNlY3Rpb24gZWxlbWVudCBmb2N1cyBoYW5kbGVyOicsIHRoaXMsIGUpO1xuXHQgICAgICAgIFx0ICAgIF90aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2ZvY3VzY2hhbmdlLnBsLmxheW91dHRvb2xiYXJzZWN0aW9uJyk7XG5cblx0ICAgICAgICAgICAgXHRpZiAoX3RoaXMuX2J1aWxkZXIgaW5zdGFuY2VvZiBMYXlvdXRidWlsZGVyKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgX3RoaXMuX2J1aWxkZXIuc3dpdGNoVG9vbGJhcnNlY3Rpb25zLmFwcGx5KF90aGlzLCBbZS5jdXJyZW50VGFyZ2V0XSk7XG5cdCAgICAgICAgICAgIFx0fVxuXHQgICAgICAgICAgICBcdFxuXHQgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHQgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblx0ICAgICAgICAgICAgfSk7XG4gICAgXHQgICAgJCgnW2RhdGEtbGF5b3V0YnVpbGRlcicpXG5cdFx0ICAgICAgICAub2ZmKCd1bmZvY3VzZWQucGwubGF5b3V0ZWxlbWVudCcpXG5cdFx0ICAgICAgICAub24oJ3VuZm9jdXNlZC5wbC5sYXlvdXRlbGVtZW50JywgJ1tkYXRhLWxheW91dHJvd10sW2RhdGEtbGF5b3V0Y29sdW1uXScgLCBmdW5jdGlvbihlKXtcblx0XHRcblx0XHQgICAgICAgIFx0aWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXR0b29sYmFyc2VjdGlvbiBlbGVtZW50IGZvY3VzIGhhbmRsZXI6JywgdGhpcywgZSk7XG5cdFx0ICAgIFx0ICAgIF90aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2ZvY3VzY2hhbmdlLnBsLmxheW91dHRvb2xiYXJzZWN0aW9uJyk7XG5cblx0ICAgICAgICAgICAgXHRpZiAoX3RoaXMuX3Rvb2xiYXIgaW5zdGFuY2VvZiBMYXlvdXR0b29sYmFyKSB7XG5cdFx0ICAgICAgICAgICAgICAgIF90aGlzLl90b29sYmFyLmhpZGVTZWN0aW9ucygpO1xuXHQgICAgICAgICAgICBcdH1cblx0ICAgICAgICAgICAgXHRcblx0XHQgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHQgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKlxuICAgICAqIGdlbmVyYXRlIGluaXRpYWwgbWFya3VwXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXQgX21hcmt1cCgpIHtcbiAgICBcdHZhciBodG1sID0gW1xuICAgIFx0XHRgPGRpdiBkYXRhLWxheW91dHRvb2xiYXJzZWN0aW9uIHJlbD1cIiR7dGhpcy5vcHRpb25zLm5hbWV9XCI+YCxcblx0XHQgICAgICAgIGA8JHt0aGlzLm9wdGlvbnMuc2VjdGlvbmNvbnRhaW5lci50YWd9IGNsYXNzPVwiJHt0aGlzLm9wdGlvbnMuc2VjdGlvbmNvbnRhaW5lci5jbGFzc25hbWVzLmpvaW4oJyAnKX1cIiAke3RoaXMub3B0aW9ucy5zZWN0aW9uY29udGFpbmVyLmF0dHJpYnV0ZXMuam9pbignICcpfT5gLFxuICAgIFx0XHQgICAgICAgIGA8bGkgY2xhc3M9XCIke3RoaXMub3B0aW9ucy5zZWN0aW9uY29udGFpbmVyLmxhYmVsLmNsYXNzbmFtZXMuam9pbignICcpfVwiIHJvbGU9XCJtZW51aXRlbVwiPiR7dWNmaXJzdCh0aGlzLm9wdGlvbnMubmFtZSl9OjwvbGk+YCxcbiAgICBcdFx0ICAgICAgICAvLyBpdGVtcyBmb2xsb3cgaGVyZS4uLlxuICAgIFx0XHQgICAgYDwvJHt0aGlzLm9wdGlvbnMuc2VjdGlvbmNvbnRhaW5lci50YWd9PmAsXG4gICAgXHRcdCc8L2Rpdj4nXG4gICAgXHRdO1xuICAgIFx0XG4gICAgXHRyZXR1cm4gJChodG1sLmpvaW4oJycpKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogcmV0dXJuIGluaXRpYWwgbWFya3VwIGVsZW1lbnRzXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICovXG4gICAgdG9FbGVtZW50KHNlY3Rpb25jb25maWcpIHtcbiAgICBcdHZhciBjdXJyZW50T3B0aW9ucyA9ICh0aGlzLm9wdGlvbnMpO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgTGF5b3V0dG9vbGJhcnNlY3Rpb24uZGVmYXVsdHMsIHRoaXMub3B0aW9ucywgc2VjdGlvbmNvbmZpZyk7XG4gICAgXHR2YXIgJGVsZW1lbnQgPSAkKHRoaXMudG9TdHJpbmcoKSk7XG4gICAgXHR0aGlzLm9wdGlvbnMgPSBjdXJyZW50T3B0aW9ucztcbiAgICBcdHJldHVybiAkZWxlbWVudDtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogRGVzdHJveXMgdGhlIGxheW91dHRvb2xiYXJzZWN0aW9uLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuICAgIF9kZXN0cm95KCkge1xuICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoJyonKS5vZmYoJy5wbC5sYXlvdXR0b29sYmFyc2VjdGlvbicpO1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZignLnBsLmxheW91dHRvb2xiYXJzZWN0aW9uJyk7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlKCk7XG4gICAgfVxuXHRcbn1cblxuTGF5b3V0dG9vbGJhcnNlY3Rpb24uZGVmYXVsdHMgPSB7XG5cdFxuXHRzZWN0aW9uY29udGFpbmVyIDoge1xuXHRcdHRhZyAgICAgICA6ICd1bCcsXG5cdFx0Y2xhc3NuYW1lczogWydkcm9wZG93bicsJ21lbnUnXSxcblx0XHRhdHRyaWJ1dGVzOiBbJ2RhdGEtZHJvcGRvd24tbWVudSddLFxuICAgICAgICBsYWJlbCAgICAgOiB7XG4gICAgXHRcdGNsYXNzbmFtZXM6IFsnbWVudS10ZXh0J11cbiAgICAgICAgfVxuXHR9LFxuXHRpdGVtY29udGFpbmVyIDoge1xuXHRcdHRhZyAgICAgICA6ICdsaScsXG5cdFx0Y2xhc3NuYW1lczogW10sXG5cdFx0YXR0cmlidXRlczogWydyb2xlPVwibWVudWl0ZW1cIiddXG5cdH1cbn07XG5cbnBhdHRlcm5saWJyYXJ5LnBsdWdpbihMYXlvdXR0b29sYmFyc2VjdGlvbiwgJ0xheW91dHRvb2xiYXJzZWN0aW9uJyk7XG5cbiIsIi8qKlxuICogaW5pdGlhbGl6ZSBtb2RhbCBYSFIgdHJpZ2dlcnMgYW5kIHdhdGNoIGZvciBtb2RhbCBYSFIgZm9ybXNcbiAqL1xuOyhmdW5jdGlvbiAoJCwgd2luZG93LCBkb2N1bWVudCwgcGF0dGVybmxpYnJhcnksIHVuZGVmaW5lZCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICBpZiAoKHR5cGVvZiAkLmZuLm1vZGFsID09ICd1bmRlZmluZWQnKSAmJiAodHlwZW9mIFBMRm91bmRhdGlvbi5SZXZlYWwgPT0gJ3VuZGVmaW5lZCcpKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignalF1ZXJ5IE1vZGFsIGFuZC9vciBQTEZvdW5kYXRpb24gUmV2ZWFsIHBsdWctaW5zIG5vdCBmb3VuZC4uLicpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciAkYm9keSA9ICQoZG9jdW1lbnQpLFxuICAgICAgICAkYWpheEJ1dHRvbnMgID0gcGF0dGVybmxpYnJhcnkuQ29uZmlnLnhoclNlbGVjdG9ycy54aHJCdXR0b25zLCAvLyBcIkEuYnRuW2hyZWYqPSdhZGQnXSwgQS5idG5baHJlZio9J2VkaXQnXSwgQS5idG5baHJlZio9J2RldGFpbHMnXSwgQS5idG5baHJlZio9J2RlbGV0ZSddXCIsXG4gICAgICAgICRhamF4Q1RBT3BlbiAgPSBwYXR0ZXJubGlicmFyeS5Db25maWcueGhyU2VsZWN0b3JzLnhockNUQU9wZW4sIC8vIFwiQS5idG4tY3RhLXhoci5jdGEteGhyLW1vZGFsXCIsXG4gICAgICAgICRhamF4Q1RBQ2xvc2UgPSBwYXR0ZXJubGlicmFyeS5Db25maWcueGhyU2VsZWN0b3JzLnhockNUQUNsb3NlLCAvLyBcIi5tb2RhbC1jb250ZW50IC5idG4tY3RhLXhoci1jbG9zZSwgLm1vZGFsLWNvbnRlbnQgLmFsZXJ0LCAubW9kYWwtY29udGVudCAuY2xvc2UsIC5tb2RhbC1jb250ZW50IC5jdGEteGhyLW1vZGFsLWNsb3NlXCIsXG4gICAgICAgICRhamF4Rm9ybXMgICAgPSBwYXR0ZXJubGlicmFyeS5Db25maWcueGhyU2VsZWN0b3JzLnhockZvcm1zIC8vIFwiLm1vZGFsLWNvbnRlbnQgLmZvcm0teGhyXCJcbiAgICA7XG4gICAgXG4gICAgLy9cbiAgICAvLyBtb2RhbCB0cmlnZ2Vyc1xuICAgIC8vXG4gICAgdmFyIGhhbmRsZXJfaW5pdFhIUk1vZGFsVHJpZ2dlciA9IGZ1bmN0aW9uIChvRXZlbnQpIHtcbiAgICAgICAgXG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXG4gICAgICAgICAgICAkYnRuVXJsID0gJHRoaXMuYXR0cignaHJlZicpO1xuICAgICAgICBcbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIGhlYWRlcnMgOiB7XG4gICAgICAgICAgICAgICAgJ0FjY2VwdCcgOiAndGV4dC9odG1sJyxcbiAgICAgICAgICAgICAgICAnWC1sYXlvdXQnIDogJ21vZGFsJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHR5cGUgICAgOiBcIkdFVFwiLFxuICAgICAgICAgICAgY2FjaGUgICAgOiBmYWxzZSxcbiAgICAgICAgICAgIHVybCAgICAgICAgOiAkdGhpcy5hdHRyKCdocmVmJyksXG4gICAgICAgICAgICBzdWNjZXNzICAgIDogZnVuY3Rpb24gKGRhdGEpIHtcblxuICAgICAgICAgICAgICAgIHBhdHRlcm5saWJyYXJ5Lk1vZGFsLm9wZW4oZGF0YSwgJGJ0blVybCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoICh0eXBlb2YgJC5mbi5kYXRhVGFibGUgIT0gJ3VuZGVmaWVuZWQnKSApIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnLmRhdGF0YWJsZS5jcnVkJykuZGF0YVRhYmxlKCkuYXBpKCkuYWpheC5yZWxvYWQoZnVuY3Rpb24gKCB0YWJsZWRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyggdGFibGVkYXRhICk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBvRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgb0V2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBvRXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHJldHVybiAoZmFsc2UpO1xuICAgICAgICBcbiAgICB9OyBcblxuICAgIC8vXG4gICAgLy8gbW9kYWwgZm9ybXNcbiAgICAvL1xuICAgIHZhciBoYW5kbGVyX2luaXRYSFJNb2RhbEZvcm0gPSBmdW5jdGlvbiAob0V2ZW50KSB7XG4gICAgICAgIHZhciAkZm9ybSA9ICQodGhpcyksXG4gICAgICAgICAgICBmb3JtVVJMID0gJGZvcm0uYXR0cignYWN0aW9uJyksXG4gICAgICAgICAgICBmb3JtRGF0YSA9ICRmb3JtLnNlcmlhbGl6ZUFycmF5KClcbiAgICAgICAgO1xuICAgICAgICBcbiAgICAgICAgZm9ybURhdGEucHVzaCggXG4gICAgICAgICAgICAoJGZvcm0uZmluZCgnaW5wdXRbbmFtZT1kZWxdLmJ0bicpLnNpemUoKSA+IDApID8ge25hbWU6ICdkZWwnLCB2YWx1ZTogJ2RlbGV0ZSd9IDogbnVsbCBcbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICBoZWFkZXJzIDoge1xuICAgICAgICAgICAgICAgICdBY2NlcHQnIDogJ3RleHQvaHRtbCcsXG4gICAgICAgICAgICAgICAgJ1gtbGF5b3V0JyA6ICdtb2RhbCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0eXBlICAgIDogXCJQT1NUXCIsXG4gICAgICAgICAgICBjYWNoZSAgICA6IGZhbHNlLFxuICAgICAgICAgICAgdXJsICAgICAgICA6IGZvcm1VUkwsXG4gICAgICAgICAgICBkYXRhICAgIDogZm9ybURhdGEsXG4gICAgICAgICAgICBzdWNjZXNzICAgIDogZnVuY3Rpb24gKGRhdGEpIHtcblxuICAgICAgICAgICAgICAgIHBhdHRlcm5saWJyYXJ5Lk1vZGFsLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgcGF0dGVybmxpYnJhcnkuTW9kYWwub3BlbihkYXRhLCBmb3JtVVJMKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoICh0eXBlb2YgJC5mbi5kYXRhVGFibGUgIT0gJ3VuZGVmaWVuZWQnKSApIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnLmRhdGF0YWJsZS5jcnVkJykuZGF0YVRhYmxlKCkuYXBpKCkuYWpheC5yZWxvYWQoZnVuY3Rpb24gKCB0YWJsZWRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyggdGFibGVkYXRhICk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBvRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgb0V2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBvRXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHJldHVybiAoZmFsc2UpO1xuICAgIH07XG5cbiAgICAvL1xuICAgIC8vIG1vZGFsIGNsb3NlXG4gICAgLy9cbiAgICB2YXIgaGFuZGxlcl9jbG9zZU1vZGFsID0gZnVuY3Rpb24gKG9FdmVudCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcGF0dGVybmxpYnJhcnkuTW9kYWwuY2xvc2UoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgXG4gICAgICAgIG9FdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBvRXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIG9FdmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgcmV0dXJuIChmYWxzZSk7XG4gICAgfTtcblxuICAgIC8vXG4gICAgLy8gd2F0Y2ggRE9NIGVsZW1lbnRzXG4gICAgLy9cbiAgICAkYm9keS5vbignY2xpY2sucGF0dGVybmxpYnJhcnkueGhybW9kYWxvcGVuJywgICRhamF4Q1RBT3BlbiwgIHt9LCBoYW5kbGVyX2luaXRYSFJNb2RhbFRyaWdnZXIpO1xuICAgICRib2R5Lm9uKCdzdWJtaXQucGF0dGVybmxpYnJhcnkueGhybW9kYWxzdWJtaXQnLCAkYWpheEZvcm1zLCAgICB7fSwgaGFuZGxlcl9pbml0WEhSTW9kYWxGb3JtKTtcbiAgICAkYm9keS5vbignY2xpY2sucGF0dGVybmxpYnJhcnkueGhybW9kYWxjbG9zZScsICAkYWpheENUQUNsb3NlLCB7fSwgaGFuZGxlcl9jbG9zZU1vZGFsKTtcblxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCgkYWpheENUQU9wZW4pLm9uKCdjbGljay5wYXR0ZXJubGlicmFyeS54aHJtb2RhbG9wZW4nLCBoYW5kbGVyX2luaXRYSFJNb2RhbFRyaWdnZXIpO1xuICAgICAgICAkKCRhamF4Rm9ybXMpLm9uKCdzdWJtaXQucGF0dGVybmxpYnJhcnkueGhybW9kYWxzdWJtaXQnLCBoYW5kbGVyX2luaXRYSFJNb2RhbEZvcm0pO1xuICAgICAgICAkKCRhamF4Q1RBQ2xvc2UpLm9uKCdjbGljay5wYXR0ZXJubGlicmFyeS54aHJtb2RhbGNsb3NlJywgaGFuZGxlcl9jbG9zZU1vZGFsKTtcbiAgICB9KTtcblxufSkoalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50LCB3aW5kb3cucGF0dGVybmxpYnJhcnkpO1xuIiwiLyoqXG4gKiB0aGVtZSBiYXNlIHNldHVwIChadXJiIFBMRm91bmRhdGlvbilcbiAqIFxuICogcGF0dGVybmxpYnJhcnkgY2xpZW50IChpbml0LSlzY3JpcHRcbiAqICAgXG4gKiBAcGFja2FnZSAgICAgW3BhdHRlcm5saWJyYXJ5XVxuICogQHN1YnBhY2thZ2UgIHBhdHRlcm5saWJyYXJ5IGNsaWVudCBzY3JpcHRcbiAqIEBhdXRob3IgICAgICBCasO2cm4gQmFydGVscyA8Y29kaW5nQGJqb2VybmJhcnRlbHMuZWFydGg+XG4gKiBAbGluayAgICAgICAgaHR0cHM6Ly9naXRsYWIuYmpvZXJuYmFydGVscy5lYXJ0aC9qcy9wYXR0ZXJubGlicmFyeVxuICogQGxpY2Vuc2UgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMCBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjBcbiAqIEBjb3B5cmlnaHQgICBjb3B5cmlnaHQgKGMpIDIwMTYgQmrDtnJuIEJhcnRlbHMgPGNvZGluZ0Biam9lcm5iYXJ0ZWxzLmVhcnRoPlxuICovXG5cbmlmICghalF1ZXJ5KSB7XG4gICAgY29uc29sZS5lcnJvcignalF1ZXJ5IG5vdCBmb3VuZC4uLicpO1xuICAgIHdpbmRvdy5zdG9wKCk7XG59XG5cbmlmICghJC5mbi5wbGZvdW5kYXRpb24pIHtcbiAgICBjb25zb2xlLmVycm9yKCdQTEZvdW5kYXRpb24gbm90IGZvdW5kLi4uJyk7XG4gICAgd2luZG93LnN0b3AoKTtcbn1cblxuKGZ1bmN0aW9uICgkLCBkb2MsIHdpbiwgcGF0dGVybmxpYnJhcnkpIHtcbiAgICBcbiAgICB2YXIgJGRvYyA9ICQoZG9jKSxcbiAgICAgICAgJGxhbmcgPSBwYXR0ZXJubGlicmFyeS5Db25maWcubGFuZ1xuICAgIDtcbiAgICBwYXR0ZXJubGlicmFyeS5Db25maWcuZGVidWcgPSB0cnVlO1xuICAgIFxuXHQvL3dpbmRvdy5vbnRvdWNobW92ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gZmFsc2U7IH1cblx0Ly93aW5kb3cub25vcmllbnRhdGlvbmNoYW5nZSA9IGZ1bmN0aW9uKCkgeyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCA9IDA7IH0gIFxuICAgICAgICBcbiAgICAvL1xuICAgIC8vIGluaXQgcGF0dGVybmxpYnJhcnkgKGZyb250ZW50KVxuICAgIC8vXG4gICAgJGRvYy5yZWFkeShmdW5jdGlvbiAoKSB7XG4gICAgXHRcbiAgICBcdCQoZG9jdW1lbnQpXG4gICAgXHQgICAgLnBsZm91bmRhdGlvbigpXG4gICAgXHQgICAgLnBhdHRlcm5saWJyYXJ5KClcbiAgICBcdDtcbiAgICBcdFxuICAgIFx0Ly8kZG9jLnBhdHRlcm5saWJyYXJ5KCk7XG4gICAgICAgIFxuICAgIH0pO1xuXG59KShqUXVlcnksIGRvY3VtZW50LCB3aW5kb3csIHBhdHRlcm5saWJyYXJ5KTsiLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG4gICAgLy8gLi4uXG59KTsiXX0=
