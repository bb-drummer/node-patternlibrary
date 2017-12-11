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
};

//PLFoundation.plugin(Layoutelement, 'Layoutelement');
patternlibrary.plugin(Layoutelement, 'Layoutelement');
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhdHRlcm5saWJyYXJ5LmNvcmUuanMiLCJwYXR0ZXJubGlicmFyeS5jb25maWcuanMiLCJkb2NzLnNlYXJjaC5qcyIsIm1lZGlhUXVlcnkuanMiLCJtb2RhbC5qcyIsIndpbmRvd2hyZWYuanMiLCJwbHVnaW4vcGx1Z2luLm1vZHVsZS5qcyIsImxheW91dGJ1aWxkZXIubW9kdWxlLmpzIiwibGF5b3V0YnVpbGRlci5sYXlvdXRib2R5LmpzIiwibGF5b3V0YnVpbGRlci5sYXlvdXR0b29sYmFyc2VjdGlvbi5idWlsZGVyLmpzIiwibGF5b3V0YnVpbGRlci5sYXlvdXR0b29sYmFyc2VjdGlvbi5sYXlvdXRjb2x1bW4uanMiLCJsYXlvdXRidWlsZGVyLmxheW91dHRvb2xiYXJzZWN0aW9uLmxheW91dHJvdy5qcyIsImxheW91dGJ1aWxkZXIubGF5b3V0dG9vbGJhcnNlY3Rpb24ucGF0dGVybi5qcyIsImxheW91dGJ1aWxkZXIubGF5b3V0dG9vbGJhci5qcyIsImxheW91dGJ1aWxkZXIubGF5b3V0ZWxlbWVudC5qcyIsImxheW91dGJ1aWxkZXIuZXhjZXB0aW9uLmpzIiwibGF5b3V0YnVpbGRlci5sYXlvdXRjb2x1bW4uanMiLCJsYXlvdXRidWlsZGVyLmxheW91dGVsZW1lbnRkcmFndHJpZ2dlci5qcyIsImxheW91dGJ1aWxkZXIubGF5b3V0ZWxlbWVudHRvb2xiYXIuanMiLCJsYXlvdXRidWlsZGVyLmxheW91dHBhdHRlcm4uanMiLCJsYXlvdXRidWlsZGVyLmxheW91dHJvdy5qcyIsImxheW91dGJ1aWxkZXIubGF5b3V0dG9vbGJhcmFjdGlvbi5qcyIsImxheW91dGJ1aWxkZXIubGF5b3V0dG9vbGJhcnNlY3Rpb24uanMiLCJhcHBsaWNhdGlvbi1jdGEteGhyLW1vZGFscy5qcyIsInBhdHRlcm5saWJyYXJ5LmluaXQuanMiLCJhcHAuanMiXSwibmFtZXMiOlsicGF0dGVybmxpYnJhcnkiLCIkIiwicGF0dGVybmxpYnJhcnlfVkVSU0lPTiIsInZlcnNpb24iLCJfcGx1Z2lucyIsIl91dWlkcyIsImRlYnVnIiwiQ29uZmlnIiwibGVuZ3RoIiwicnRsIiwiYXR0ciIsInBsdWdpbiIsIm5hbWUiLCJjbGFzc05hbWUiLCJmdW5jdGlvbk5hbWUiLCJhdHRyTmFtZSIsImh5cGhlbmF0ZSIsInJlZ2lzdGVyUGx1Z2luIiwicGx1Z2luTmFtZSIsImNvbnN0cnVjdG9yIiwidG9Mb3dlckNhc2UiLCJ1dWlkIiwiR2V0WW9EaWdpdHMiLCIkZWxlbWVudCIsImRhdGEiLCJ0cmlnZ2VyIiwicHVzaCIsInVucmVnaXN0ZXJQbHVnaW4iLCJzcGxpY2UiLCJpbmRleE9mIiwicmVtb3ZlQXR0ciIsInJlbW92ZURhdGEiLCJwcm9wIiwicmVJbml0IiwicGx1Z2lucyIsImlzSlEiLCJlYWNoIiwiX2luaXQiLCJ0eXBlIiwiX3RoaXMiLCJmbnMiLCJwbGdzIiwiZm9yRWFjaCIsInAiLCJPYmplY3QiLCJrZXlzIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwibmFtZXNwYWNlIiwiTWF0aCIsInJvdW5kIiwicG93IiwicmFuZG9tIiwidG9TdHJpbmciLCJzbGljZSIsInJlZmxvdyIsImVsZW0iLCJpIiwiJGVsZW0iLCJmaW5kIiwiYWRkQmFjayIsIiRlbCIsIm9wdHMiLCJ3YXJuIiwidGhpbmciLCJzcGxpdCIsImUiLCJvcHQiLCJtYXAiLCJlbCIsInRyaW0iLCJwYXJzZVZhbHVlIiwiZXIiLCJnZXRGbk5hbWUiLCJ0cmFuc2l0aW9uZW5kIiwidHJhbnNpdGlvbnMiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJlbmQiLCJ0Iiwic3R5bGUiLCJzZXRUaW1lb3V0IiwidHJpZ2dlckhhbmRsZXIiLCJsaWJzIiwidXRpbCIsInRocm90dGxlIiwiZnVuYyIsImRlbGF5IiwidGltZXIiLCJjb250ZXh0IiwiYXJncyIsImFyZ3VtZW50cyIsImFwcGx5Iiwic2l0ZWFwcCIsIm1ldGhvZCIsIiRtZXRhIiwiJG5vSlMiLCJhcHBlbmRUbyIsImhlYWQiLCJyZW1vdmVDbGFzcyIsImFkZENsYXNzIiwiUExGb3VuZGF0aW9uIiwiTWVkaWFRdWVyeSIsIkFycmF5IiwicHJvdG90eXBlIiwiY2FsbCIsInBsdWdDbGFzcyIsInVuZGVmaW5lZCIsIlJlZmVyZW5jZUVycm9yIiwiVHlwZUVycm9yIiwid2luZG93IiwiZm4iLCJqUXVlcnkiLCJEYXRlIiwibm93IiwiZ2V0VGltZSIsInZlbmRvcnMiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJ2cCIsImNhbmNlbEFuaW1hdGlvbkZyYW1lIiwidGVzdCIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsImxhc3RUaW1lIiwiY2FsbGJhY2siLCJuZXh0VGltZSIsIm1heCIsImNsZWFyVGltZW91dCIsInBlcmZvcm1hbmNlIiwic3RhcnQiLCJGdW5jdGlvbiIsImJpbmQiLCJvVGhpcyIsImFBcmdzIiwiZlRvQmluZCIsImZOT1AiLCJmQm91bmQiLCJjb25jYXQiLCJmdW5jTmFtZVJlZ2V4IiwicmVzdWx0cyIsImV4ZWMiLCJzdHIiLCJpc05hTiIsInBhcnNlRmxvYXQiLCJyZXBsYWNlIiwiZ2V0UGx1Z2luTmFtZSIsIm9iaiIsInVjZmlyc3QiLCJzdHJpbmciLCJjaGFyQXQiLCJ0b1VwcGVyQ2FzZSIsInJlbmRlcmVyIiwibGFuZyIsInhoclNlbGVjdG9ycyIsInhockJ1dHRvbnMiLCJ4aHJDVEFPcGVuIiwieGhyQ1RBQ2xvc2UiLCJ4aHJGb3JtcyIsIm1vZGFscyIsImJvb3RzdHJhcEVsZW1lbnRDbGFzc25hbWUiLCJwbGZvdW5kYXRpb25FbGVtZW50Q2xhc3NuYW1lIiwiZGF0YVRhYmxlIiwibGFuZ1VSTHMiLCJzdGF0ZVNhdmUiLCJzdGF0ZUR1cmF0aW9uIiwic2VhcmNoU291cmNlIiwibGltaXQiLCJzb3VyY2UiLCJxdWVyeSIsInN5bmMiLCJhc3luYyIsImdldEpTT04iLCJzdGF0dXMiLCJmaWx0ZXIiLCJhcnIiLCJ0ZXJtcyIsInRhZ3MiLCJkaXNwbGF5IiwiaXRlbSIsInRlbXBsYXRlcyIsIm5vdEZvdW5kIiwic3VnZ2VzdGlvbiIsImRlc2NyaXB0aW9uIiwicmVhZHkiLCJsb2ciLCJ0eXBlYWhlYWQiLCJoaWdobGlnaHQiLCJzZWwiLCJsaW5rVXJsIiwiU3RyaW5nIiwibGluayIsImxvY2F0aW9uIiwiaHJlZiIsIm1hdGNoIiwiZm9jdXMiLCJkZWZhdWx0UXVlcmllcyIsImxhbmRzY2FwZSIsInBvcnRyYWl0IiwicmV0aW5hIiwicXVlcmllcyIsImN1cnJlbnQiLCJhdExlYXN0Iiwic2l6ZSIsImdldCIsIm1hdGNoTWVkaWEiLCJtYXRjaGVzIiwidmFsdWUiLCJzZWxmIiwiZXh0cmFjdGVkU3R5bGVzIiwiY3NzIiwibmFtZWRRdWVyaWVzIiwicGFyc2VTdHlsZVRvT2JqZWN0Iiwia2V5IiwiX2dldEN1cnJlbnRTaXplIiwiX3dhdGNoZXIiLCJtYXRjaGVkIiwib24iLCJuZXdTaXplIiwic3R5bGVNZWRpYSIsIm1lZGlhIiwic2NyaXB0IiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJpbmZvIiwiaWQiLCJwYXJlbnROb2RlIiwiaW5zZXJ0QmVmb3JlIiwiZ2V0Q29tcHV0ZWRTdHlsZSIsImN1cnJlbnRTdHlsZSIsIm1hdGNoTWVkaXVtIiwidGV4dCIsInN0eWxlU2hlZXQiLCJjc3NUZXh0IiwidGV4dENvbnRlbnQiLCJ3aWR0aCIsInN0eWxlT2JqZWN0IiwicmVkdWNlIiwicmV0IiwicGFyYW0iLCJwYXJ0cyIsInZhbCIsImRlY29kZVVSSUNvbXBvbmVudCIsImhhc093blByb3BlcnR5IiwiaXNBcnJheSIsIm1vZGFsIiwic2V0dGluZ3MiLCJvcGVuIiwidXBkYXRlV2luZG93SHJlZiIsIlJldmVhbCIsIiRtb2RhbCIsImFwcGVuZCIsInJldmVhbE9wdGlvbnMiLCJtb2RhbERhdGEiLCJtIiwiaHRtbCIsInBsZm91bmRhdGlvbiIsIk1vZGFsIiwiY2xvc2UiLCIkbW9kYWxEZWZhdWx0cyIsInNob3ciLCJXaW5kb3dIcmVmIiwicmVzZXQiLCJfb2xkX2hyZWYiLCJoaXN0b3J5IiwicHVzaFN0YXRlIiwidGl0bGUiLCJoaWRlIiwicmVtb3ZlIiwid2luZG93aHJlZiIsImluaXQiLCJzY29wZSIsIm9wdGlvbnMiLCJ1cGRhdGUiLCJ1cmwiLCJjbGVhciIsImNsZWFyT2xkSHJlZiIsIlBsdWdpbiIsImVsZW1lbnQiLCJfc2V0dXAiLCJfZGVzdHJveSIsIl9tYXJrdXAiLCJmaXJzdCIsIl9ib2R5Iiwiam9pbiIsIkxheW91dGJ1aWxkZXIiLCJleHRlbmQiLCJkZWZhdWx0cyIsIlRyaWdnZXJzIiwiY2hpbGRyZW4iLCJfY2hlY2tEZWVwTGluayIsIl9ldmVudHMiLCJfaW5pdFRvb2xiYXIiLCJfaW5pdERvY3VtZW50Ym9keSIsIiR0b29sYmFyIiwicHJlcGVuZCIsIkxheW91dHRvb2xiYXIiLCJ0b0VsZW1lbnQiLCJfdG9vbGJhciIsIl9hZGRLZXlIYW5kbGVyIiwiX2FkZENsaWNrSGFuZGxlciIsIl9zZXRNcUhhbmRsZXIiLCJkZWVwTGluayIsIm9mZiIsInN3aXRjaFRvb2xiYXJzZWN0aW9ucyIsImN1cnJlbnRUYXJnZXQiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsImZvY3VzZWRfZWxlbWVudCIsIiRmb2N1cyIsIkxheW91dGVsZW1lbnQiLCJzd2l0Y2hTZWN0aW9uIiwiY2xhc3NuYW1lIiwid2hpY2giLCJLZXlib2FyZCIsImhhbmRsZUtleSIsImV2ZW50IiwiaGFuZGxlZCIsInJlZ2lzdGVyIiwiYWN0aXZlRWxlbWVudCIsImJsdXIiLCJhbmNob3IiLCJoYXNoIiwiJGxpbmsiLCJib2R5IiwiY2xhc3NDb2xQcmVmaXgiLCJjbGFzc1JvdyIsImNsYXNzU2l6ZXMiLCJjb2x1bW5NYXgiLCJMYXlvdXRidWlsZGVyQ2xpY2tkdW1teSIsIiR0aGlzIiwiTGF5b3V0Ym9keSIsIl9hZGRGdWxsc2NyZWVuSGFuZGxlciIsImhhc0NsYXNzIiwic3dpdGNoIiwic3dpdGNoRnVsbHNjcmVlbiIsIkxheW91dHRvb2xiYXJzZWN0aW9uQnVpbGRlciIsIml0ZW1zIiwibGFiZWwiLCJhY3Rpb24iLCJpY29uIiwiZXZlbnRzIiwiY2xpY2siLCJfbGF5b3V0Ym9keSIsIkxheW91dHRvb2xiYXJzZWN0aW9uTGF5b3V0Y29sdW1uIiwiTGF5b3V0dG9vbGJhcnNlY3Rpb25MYXlvdXRyb3ciLCJMYXlvdXR0b29sYmFyc2VjdGlvblBhdHRlcm4iLCJoaWRlU2VjdGlvbnMiLCJfYWRkSW5pdEhhbmRsZXIiLCJfaW5pdFNlY3Rpb25zIiwic2VjdGlvbnMiLCJpZHgiLCJzZWN0aW9uY29uZmlnIiwiX2luaXRTZWN0aW9uIiwiTGF5b3V0dG9vbGJhcnNlY3Rpb24iLCIkc2VjdGlvbiIsIl9zZWN0aW9ucyIsIl9zZWN0aW9uIiwic2VjdGlvbiIsIl9idWlsZGVyU2VjdGlvbiIsInJlZmVyZW5jZSIsImJ1aWxkZXJTZWN0aW9uIiwiZGVmaW5lIiwicmVxdWlyZSIsImV4cG9ydHMiLCJtb2R1bGUiLCJfYWRkRm9jdXNIYW5kbGVyIiwiX2RyYWd0cmlnZ2VyIiwiX2VsZW1lbnR0b29sYmFyIiwiTGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyIiwiX2luaXREcmFndHJpZ2dlciIsIkxheW91dGVsZW1lbnR0b29sYmFyIiwiX2luaXRFbGVtZW50dG9vbGJhciIsImRlc3Ryb3kiLCJmb2N1c0NsYXNzbmFtZSIsIl9mb2N1c0xheW91dGVsZW1lbnQiLCIkdG9vbGJhcnNlY3Rpb24iLCJhY3RpdmVDbGFzc25hbWUiLCJMYXlvdXRidWlsZGVyRXhjZXB0aW9uIiwibWVzc2FnZSIsImNvZGUiLCJMYXlvdXRjb2x1bW4iLCIkbGF5b3V0ZWxlbWVudCIsInBhcmVudCIsIkxheW91dHBhdHRlcm4iLCJMYXlvdXRyb3ciLCJMYXlvdXR0b29sYmFyYWN0aW9uIiwiY2xpY2tIYW5kbGVyIiwiY3VycmVudE9wdGlvbnMiLCJtYWtlQXJyYXkiLCIkaXRlbSIsIml0ZW1jb250YWluZXIiLCJ0YWciLCJjbGFzc25hbWVzIiwiYXR0cmlidXRlcyIsIl9jb250YWluZXIiLCJfaW5pdEl0ZW1zIiwiJGZ1bGxzY3JlZW5Ub2dnbGVyIiwiJGxheW91dGJvZHkiLCIkYnVpbGRlciIsIl9idWlsZGVyIiwic2VjdGlvbmNvbnRhaW5lciIsIiRib2R5IiwiJGFqYXhCdXR0b25zIiwiJGFqYXhDVEFPcGVuIiwiJGFqYXhDVEFDbG9zZSIsIiRhamF4Rm9ybXMiLCJoYW5kbGVyX2luaXRYSFJNb2RhbFRyaWdnZXIiLCJvRXZlbnQiLCIkYnRuVXJsIiwiYWpheCIsImhlYWRlcnMiLCJjYWNoZSIsInN1Y2Nlc3MiLCJhcGkiLCJyZWxvYWQiLCJ0YWJsZWRhdGEiLCJzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24iLCJoYW5kbGVyX2luaXRYSFJNb2RhbEZvcm0iLCIkZm9ybSIsImZvcm1VUkwiLCJmb3JtRGF0YSIsInNlcmlhbGl6ZUFycmF5IiwiaGFuZGxlcl9jbG9zZU1vZGFsIiwic3RvcCIsImRvYyIsIndpbiIsIiRkb2MiLCIkbGFuZyJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0EsSUFBSSxDQUFDQSxjQUFMLEVBQXFCO0FBQ2pCLFFBQUlBLGlCQUFpQixFQUFyQjtBQUNIOztBQUVEOzs7Ozs7Ozs7Ozs7O0FBYUEsQ0FBQyxVQUFTQyxDQUFULEVBQVk7QUFDYjs7QUFHSSxRQUFJQyx5QkFBeUIsT0FBN0I7O0FBRUE7QUFDQTtBQUNBLFFBQUlGLGlCQUFpQjtBQUNqQkcsaUJBQVNELHNCQURROztBQUdqQjs7O0FBR0FFLGtCQUFVLEVBTk87O0FBUWpCOzs7QUFHQUMsZ0JBQVEsRUFYUzs7QUFhakI7OztBQUdBQyxlQUFPLGlCQUFVO0FBQ2IsbUJBQU8sS0FBS0MsTUFBTCxDQUFZRCxLQUFaLElBQXNCTCxFQUFFLFVBQUYsRUFBY08sTUFBZCxHQUF1QixDQUFwRDtBQUNILFNBbEJnQjs7QUFvQmpCOzs7QUFHQUMsYUFBSyxlQUFVO0FBQ1gsbUJBQU9SLEVBQUUsTUFBRixFQUFVUyxJQUFWLENBQWUsS0FBZixNQUEwQixLQUFqQztBQUNILFNBekJnQjs7QUEyQmpCOzs7Ozs7QUFNQUMsZ0JBQVEsZ0JBQVNBLE9BQVQsRUFBaUJDLElBQWpCLEVBQXVCO0FBQzNCO0FBQ0E7QUFDQSxnQkFBSUMsWUFBYUQsUUFBUUUsYUFB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QWlCM0wsRUFBakIsQ0FBb0Isb0NBQXBCLEVBQTBENk0sa0JBQTFEO0FBQ0gsS0FKRDtBQU1ILENBdkhBLEVBdUhFclQsTUF2SEYsRUF1SFVGLE1BdkhWLEVBdUhrQmxDLFFBdkhsQixFQXVINEJrQyxPQUFPL0csY0F2SG5DOzs7QUNIRDs7Ozs7Ozs7Ozs7OztBQWFBLElBQUksQ0FBQ2lILE1BQUwsRUFBYTtBQUNUbEUsWUFBUUMsS0FBUixDQUFjLHFCQUFkO0FBQ0ErRCxXQUFPd1QsSUFBUDtBQUNIOztBQUVELElBQUksQ0FBQ3RhLEVBQUUrRyxFQUFGLENBQUsrSSxZQUFWLEVBQXdCO0FBQ3BCaE4sWUFBUUMsS0FBUixDQUFjLDJCQUFkO0FBQ0ErRCxXQUFPd1QsSUFBUDtBQUNIOztBQUVELENBQUMsVUFBVXRhLENBQVYsRUFBYXVhLEdBQWIsRUFBa0JDLEdBQWxCLEVBQXVCemEsY0FBdkIsRUFBdUM7O0FBRXBDLFFBQUkwYSxPQUFPemEsRUFBRXVhLEdBQUYsQ0FBWDtBQUFBLFFBQ0lHLFFBQVEzYSxlQUFlTyxNQUFmLENBQXNCa0osSUFEbEM7QUFHQXpKLG1CQUFlTyxNQUFmLENBQXNCRCxLQUF0QixHQUE4QixJQUE5Qjs7QUFFSDtBQUNBOztBQUVHO0FBQ0E7QUFDQTtBQUNBb2EsU0FBS2xQLEtBQUwsQ0FBVyxZQUFZOztBQUV0QnZMLFVBQUU0RSxRQUFGLEVBQ0trTCxZQURMLEdBRUsvUCxjQUZMOztBQUtBO0FBRUEsS0FURDtBQVdILENBeEJELEVBd0JHaUgsTUF4QkgsRUF3QldwQyxRQXhCWCxFQXdCcUJrQyxNQXhCckIsRUF3QjZCL0csY0F4QjdCOzs7QUN2QkFDLEVBQUU0RSxRQUFGLEVBQVkyRyxLQUFaLENBQWtCLFlBQVk7QUFDMUI7QUFDSCxDQUZEIiwiZmlsZSI6InBhdHRlcm5saWJyYXJ5LWZyb250ZW5kLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEB2YXIgIG9iamVjdCAgcGF0dGVybmxpYnJhcnkgIGdsb2JhbCBwYXR0ZXJubGlicmFyeSBuYW1lc3BhY2UgKi9cbmlmICghcGF0dGVybmxpYnJhcnkpIHtcbiAgICB2YXIgcGF0dGVybmxpYnJhcnkgPSB7fTtcbn1cblxuLyoqXG4gKiB0aGVtZSBiYXNlIHNldHVwIChadXJiIFBMRm91bmRhdGlvbilcbiAqIFxuICogcGF0dGVybmxpYnJhcnkgY2xpZW50IChpbml0LSlzY3JpcHRcbiAqICAgICBcbiAqIEBwYWNrYWdlICAgICBbcGF0dGVybmxpYnJhcnldXG4gKiBAc3VicGFja2FnZSAgdGhlbWUgYmFzZSBzZXR1cCAoWnVyYiBQTEZvdW5kYXRpb24pXG4gKiBAc3VicGFja2FnZSAgcGF0dGVybmxpYnJhcnkgY2xpZW50IHNjcmlwdFxuICogQGF1dGhvciAgICAgIEJqw7ZybiBCYXJ0ZWxzIDxjb2RpbmdAYmpvZXJuYmFydGVscy5lYXJ0aD5cbiAqIEBsaW5rICAgICAgICBodHRwczovL2dpdGxhYi5iam9lcm5iYXJ0ZWxzLmVhcnRoL2pzL3BhdHRlcm5saWJyYXJ5XG4gKiBAbGljZW5zZSAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMFxuICogQGNvcHlyaWdodCAgIGNvcHlyaWdodCAoYykgMjAxNiBCasO2cm4gQmFydGVscyA8Y29kaW5nQGJqb2VybmJhcnRlbHMuZWFydGg+XG4gKi9cbiFmdW5jdGlvbigkKSB7XG5cInVzZSBzdHJpY3RcIjtcblxuICAgIFxuICAgIHZhciBwYXR0ZXJubGlicmFyeV9WRVJTSU9OID0gJzAuMC4xJztcbiAgICBcbiAgICAvLyBHbG9iYWwgW3BhdHRlcm5saWJyYXJ5XSBvYmplY3RcbiAgICAvLyBUaGlzIGlzIGF0dGFjaGVkIHRvIHRoZSB3aW5kb3csIG9yIHVzZWQgYXMgYSBtb2R1bGUgZm9yIEFNRC9Ccm93c2VyaWZ5XG4gICAgdmFyIHBhdHRlcm5saWJyYXJ5ID0ge1xuICAgICAgICB2ZXJzaW9uOiBwYXR0ZXJubGlicmFyeV9WRVJTSU9OLFxuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogU3RvcmVzIGluaXRpYWxpemVkIHBsdWdpbnMuXG4gICAgICAgICAqL1xuICAgICAgICBfcGx1Z2luczoge30sXG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdG9yZXMgZ2VuZXJhdGVkIHVuaXF1ZSBpZHMgZm9yIHBsdWdpbiBpbnN0YW5jZXNcbiAgICAgICAgICovXG4gICAgICAgIF91dWlkczogW10sXG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIGEgYm9vbGVhbiBmb3IgUlRMIHN1cHBvcnRcbiAgICAgICAgICovXG4gICAgICAgIGRlYnVnOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuQ29uZmlnLmRlYnVnIHx8ICgkKCcucGxkZWJ1ZycpLmxlbmd0aCA+IDApO1xuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgYSBib29sZWFuIGZvciBSVEwgc3VwcG9ydFxuICAgICAgICAgKi9cbiAgICAgICAgcnRsOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuICQoJ2h0bWwnKS5hdHRyKCdkaXInKSA9PT0gJ3J0bCc7XG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRGVmaW5lcyBhIFtwYXR0ZXJubGlicmFyeV0gcGx1Z2luLCBhZGRpbmcgaXQgdG8gdGhlIGBwYXR0ZXJubGlicmFyeWAgbmFtZXNwYWNlIFxuICAgICAgICAgKiBhbmQgdGhlIGxpc3Qgb2YgcGx1Z2lucyB0byBpbml0aWFsaXplIHdoZW4gcmVmbG93aW5nLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIFRoZSBjb25zdHJ1Y3RvciBvZiB0aGUgcGx1Z2luLlxuICAgICAgICAgKi9cbiAgICAgICAgcGx1Z2luOiBmdW5jdGlvbihwbHVnaW4sIG5hbWUpIHtcbiAgICAgICAgICAgIC8vIE9iamVjdCBrZXkgdG8gdXNlIHdoZW4gYWRkaW5nIHRvIGdsb2JhbCBwYXR0ZXJubGlicmFyeSBvYmplY3RcbiAgICAgICAgICAgIC8vIEV4YW1wbGVzOiBwYXR0ZXJubGlicmFyeS5PYmplY3QxLCBwYXR0ZXJubGlicmFyeS5PYmplY3QyXG4gICAgICAgICAgICB2YXIgY2xhc3NOYW1lID0gKG5hbWUgfHwgZnVuY3Rpb25OYW1lKHBsdWdpbikpO1xuICAgICAgICAgICAgLy8gT2JqZWN0IGtleSB0byB1c2Ugd2hlbiBzdG9yaW5nIHRoZSBwbHVnaW4sIGFsc28gdXNlZCB0byBjcmVhdGUgdGhlXG4gICAgICAgICAgICAvLyBpZGVudGlmeWluZyBkYXRhIGF0dHJpYnV0ZSBmb3IgdGhlIHBsdWdpblxuICAgICAgICAgICAgLy8gRXhhbXBsZXM6IGRhdGEtb2JqZWN0dHJpZ2dlcm5hbWUxLCBkYXRhLW9iamVjdHRyaWdnZXJuYW1lMlxuICAgICAgICAgICAgdmFyIGF0dHJOYW1lICAgID0gaHlwaGVuYXRlKGNsYXNzTmFtZSk7XG4gICAgXG4gICAgICAgICAgICAvLyBBZGQgdG8gdGhlIHBhdHRlcm5saWJyYXJ5IG9iamVjdCBhbmQgdGhlIHBsdWdpbnMgbGlzdCAoZm9yIHJlZmxvd2luZylcbiAgICAgICAgICAgIHRoaXMuX3BsdWdpbnNbYXR0ck5hbWVdID0gdGhpc1tjbGFzc05hbWVdID0gcGx1Z2luO1xuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICAgKiBQb3B1bGF0ZXMgdGhlIF91dWlkcyBhcnJheSB3aXRoIHBvaW50ZXJzIHRvIGVhY2ggaW5kaXZpZHVhbCBwbHVnaW4gaW5zdGFuY2UuXG4gICAgICAgICAqIEFkZHMgdGhlIGBwYXR0ZXJubGlicmFyeVBsdWdpbmAgZGF0YS1hdHRyaWJ1dGUgdG8gcHJvZ3JhbW1hdGljYWxseSBjcmVhdGVkIHBsdWdpbnMgXG4gICAgICAgICAqIHRvIGFsbG93IHVzZSBvZiAkKHNlbGVjdG9yKS5wYXR0ZXJubGlicmFyeShtZXRob2QpIGNhbGxzLlxuICAgICAgICAgKiBBbHNvIGZpcmVzIHRoZSBpbml0aWFsaXphdGlvbiBldmVudCBmb3IgZWFjaCBwbHVnaW4sIGNvbnNvbGlkYXRpbmcgcmVwZWRpdGl2ZSBjb2RlLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIGFuIGluc3RhbmNlIG9mIGEgcGx1Z2luLCB1c3VhbGx5IGB0aGlzYCBpbiBjb250ZXh0LlxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIHRoZSBuYW1lIG9mIHRoZSBwbHVnaW4sIHBhc3NlZCBhcyBhIGNhbWVsQ2FzZWQgc3RyaW5nLlxuICAgICAgICAgKiBAZmlyZXMgUGx1Z2luI2luaXRcbiAgICAgICAgICovXG4gICAgICAgIHJlZ2lzdGVyUGx1Z2luOiBmdW5jdGlvbihwbHVnaW4sIG5hbWUpe1xuICAgICAgICAgICAgdmFyIHBsdWdpbk5hbWUgPSBuYW1lID8gaHlwaGVuYXRlKG5hbWUpIDogZnVuY3Rpb25OYW1lKHBsdWdpbi5jb25zdHJ1Y3RvcikudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIHBsdWdpbi51dWlkID0gdGhpcy5HZXRZb0RpZ2l0cyg2LCBwbHVnaW5OYW1lKTtcbiAgICBcbiAgICAgICAgICAgIGlmKCFwbHVnaW4uJGVsZW1lbnQuYXR0cignZGF0YS0nICsgcGx1Z2luTmFtZSkpeyBwbHVnaW4uJGVsZW1lbnQuYXR0cignZGF0YS0nICsgcGx1Z2luTmFtZSwgcGx1Z2luLnV1aWQpOyB9XG4gICAgICAgICAgICBpZighcGx1Z2luLiRlbGVtZW50LmRhdGEoJ3BhdHRlcm5saWJyYXJ5UGx1Z2luJykpeyBwbHVnaW4uJGVsZW1lbnQuZGF0YSgncGF0dGVybmxpYnJhcnlQbHVnaW4nLCBwbHVnaW4pOyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgaW5pdGlhbGl6ZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgUGx1Z2luI2luaXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcGx1Z2luLiRlbGVtZW50LnRyaWdnZXIoJ2luaXQucGF0dGVybmxpYnJhcnkuJyArIHBsdWdpbk5hbWUpO1xuICAgIFxuICAgICAgICAgICAgdGhpcy5fdXVpZHMucHVzaChwbHVnaW4udXVpZCk7XG4gICAgXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgICAqIFJlbW92ZXMgdGhlIHBsdWdpbnMgdXVpZCBmcm9tIHRoZSBfdXVpZHMgYXJyYXkuXG4gICAgICAgICAqIFJlbW92ZXMgdGhlIHpmUGx1Z2luIGRhdGEgYXR0cmlidXRlLCBhcyB3ZWxsIGFzIHRoZSBkYXRhLXBsdWdpbi1uYW1lIGF0dHJpYnV0ZS5cbiAgICAgICAgICogQWxzbyBmaXJlcyB0aGUgZGVzdHJveWVkIGV2ZW50IGZvciB0aGUgcGx1Z2luLCBjb25zb2xpZGF0aW5nIHJlcGVkaXRpdmUgY29kZS5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBhbiBpbnN0YW5jZSBvZiBhIHBsdWdpbiwgdXN1YWxseSBgdGhpc2AgaW4gY29udGV4dC5cbiAgICAgICAgICogQGZpcmVzIFBsdWdpbiNkZXN0cm95ZWRcbiAgICAgICAgICovXG4gICAgICAgIHVucmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uKHBsdWdpbil7XG4gICAgICAgICAgICB2YXIgcGx1Z2luTmFtZSA9IGh5cGhlbmF0ZShmdW5jdGlvbk5hbWUocGx1Z2luLiRlbGVtZW50LmRhdGEoJ3BhdHRlcm5saWJyYXJ5UGx1Z2luJykuY29uc3RydWN0b3IpKTtcbiAgICBcbiAgICAgICAgICAgIHRoaXMuX3V1aWRzLnNwbGljZSh0aGlzLl91dWlkcy5pbmRleE9mKHBsdWdpbi51dWlkKSwgMSk7XG4gICAgICAgICAgICBwbHVnaW4uJGVsZW1lbnQucmVtb3ZlQXR0cignZGF0YS0nICsgcGx1Z2luTmFtZSkucmVtb3ZlRGF0YSgncGF0dGVybmxpYnJhcnlQbHVnaW4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaGFzIGJlZW4gZGVzdHJveWVkLlxuICAgICAgICAgICAgICAgICAgICAgICAgICogQGV2ZW50IFBsdWdpbiNkZXN0cm95ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgLnRyaWdnZXIoJ2Rlc3Ryb3llZC5wYXR0ZXJubGlicmFyeS4nICsgcGx1Z2luTmFtZSk7XG4gICAgICAgICAgICBmb3IodmFyIHByb3AgaW4gcGx1Z2luKXtcbiAgICAgICAgICAgICAgICBwbHVnaW5bcHJvcF0gPSBudWxsOy8vY2xlYW4gdXAgc2NyaXB0IHRvIHByZXAgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSxcbiAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICAgKiBDYXVzZXMgb25lIG9yIG1vcmUgYWN0aXZlIHBsdWdpbnMgdG8gcmUtaW5pdGlhbGl6ZSwgcmVzZXR0aW5nIGV2ZW50IGxpc3RlbmVycywgXG4gICAgICAgICAqIHJlY2FsY3VsYXRpbmcgcG9zaXRpb25zLCBldGMuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGx1Z2lucyAtIG9wdGlvbmFsIHN0cmluZyBvZiBhbiBpbmRpdmlkdWFsIHBsdWdpbiBrZXksIFxuICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dGFpbmVkIGJ5IGNhbGxpbmcgYCQoZWxlbWVudCkuZGF0YSgncGx1Z2luTmFtZScpYCwgXG4gICAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgb3Igc3RyaW5nIG9mIGEgcGx1Z2luIGNsYXNzIGkuZS4gYCdkcm9wZG93bidgXG4gICAgICAgICAqIEBkZWZhdWx0IElmIG5vIGFyZ3VtZW50IGlzIHBhc3NlZCwgcmVmbG93IGFsbCBjdXJyZW50bHkgYWN0aXZlIHBsdWdpbnMuXG4gICAgICAgICAqL1xuICAgICAgICAgcmVJbml0OiBmdW5jdGlvbihwbHVnaW5zKXtcbiAgICAgICAgICAgICB2YXIgaXNKUSA9IHBsdWdpbnMgaW5zdGFuY2VvZiAkO1xuICAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICAgaWYoaXNKUSl7XG4gICAgICAgICAgICAgICAgICAgICBwbHVnaW5zLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmRhdGEoJ3BhdHRlcm5saWJyYXJ5UGx1Z2luJykuX2luaXQoKTtcbiAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgIHZhciB0eXBlID0gdHlwZW9mIHBsdWdpbnMsXG4gICAgICAgICAgICAgICAgICAgICBfdGhpcyA9IHRoaXMsXG4gICAgICAgICAgICAgICAgICAgICBmbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgJ29iamVjdCc6IGZ1bmN0aW9uKHBsZ3Mpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGdzLmZvckVhY2goZnVuY3Rpb24ocCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCdbZGF0YS0nKyBwICsnXScpLnBhdHRlcm5saWJyYXJ5KCdfaW5pdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICdzdHJpbmcnOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCdbZGF0YS0nKyBwbHVnaW5zICsnXScpLnBhdHRlcm5saWJyYXJ5KCdfaW5pdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ3VuZGVmaW5lZCc6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbJ29iamVjdCddKE9iamVjdC5rZXlzKF90aGlzLl9wbHVnaW5zKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgIGZuc1t0eXBlXShwbHVnaW5zKTtcbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1jYXRjaChlcnIpe1xuICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAgfWZpbmFsbHl7XG4gICAgICAgICAgICAgICAgIHJldHVybiBwbHVnaW5zO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgIH0sXG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiByZXR1cm5zIGEgcmFuZG9tIGJhc2UtMzYgdWlkIHdpdGggbmFtZXNwYWNpbmdcbiAgICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGggLSBudW1iZXIgb2YgcmFuZG9tIGJhc2UtMzYgZGlnaXRzIGRlc2lyZWQuIEluY3JlYXNlIFxuICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIG1vcmUgcmFuZG9tIHN0cmluZ3MuXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2UgLSBuYW1lIG9mIHBsdWdpbiB0byBiZSBpbmNvcnBvcmF0ZWQgaW4gdWlkLCBvcHRpb25hbC5cbiAgICAgICAgICogQGRlZmF1bHQge1N0cmluZ30gJycgLSBpZiBubyBwbHVnaW4gbmFtZSBpcyBwcm92aWRlZCwgbm90aGluZyBpcyBhcHBlbmRlZCBcbiAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICB0byB0aGUgdWlkLlxuICAgICAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSAtIHVuaXF1ZSBpZFxuICAgICAgICAgKi9cbiAgICAgICAgR2V0WW9EaWdpdHM6IGZ1bmN0aW9uKGxlbmd0aCwgbmFtZXNwYWNlKXtcbiAgICAgICAgICAgIGxlbmd0aCA9IGxlbmd0aCB8fCA2O1xuICAgICAgICAgICAgcmV0dXJuIE1hdGgucm91bmQoXG4gICAgICAgICAgICAgICAgICAgIChNYXRoLnBvdygzNiwgbGVuZ3RoICsgMSkgLSBNYXRoLnJhbmRvbSgpICogTWF0aC5wb3coMzYsIGxlbmd0aCkpXG4gICAgICAgICAgICApLnRvU3RyaW5nKDM2KS5zbGljZSgxKSArIChuYW1lc3BhY2UgPyAnLScgKyBuYW1lc3BhY2UgOiAnJyk7XG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogSW5pdGlhbGl6ZSBwbHVnaW5zIG9uIGFueSBlbGVtZW50cyB3aXRoaW4gYGVsZW1gIChhbmQgYGVsZW1gIGl0c2VsZikgdGhhdCBcbiAgICAgICAgICogYXJlbid0IGFscmVhZHkgaW5pdGlhbGl6ZWQuXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtIC0galF1ZXJ5IG9iamVjdCBjb250YWluaW5nIHRoZSBlbGVtZW50IHRvIGNoZWNrIGluc2lkZS4gXG4gICAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgQWxzbyBjaGVja3MgdGhlIGVsZW1lbnQgaXRzZWxmLCB1bmxlc3MgaXQncyB0aGUgYGRvY3VtZW50YCBcbiAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QuXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBwbHVnaW5zIC0gQSBsaXN0IG9mIHBsdWdpbnMgdG8gaW5pdGlhbGl6ZS4gTGVhdmUgdGhpcyBcbiAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXQgdG8gaW5pdGlhbGl6ZSBldmVyeXRoaW5nLlxuICAgICAgICAgKi9cbiAgICAgICAgcmVmbG93OiBmdW5jdGlvbihlbGVtLCBwbHVnaW5zKSB7XG4gICAgXG4gICAgICAgICAgICAvLyBJZiBwbHVnaW5zIGlzIHVuZGVmaW5lZCwganVzdCBncmFiIGV2ZXJ5dGhpbmdcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcGx1Z2lucyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBwbHVnaW5zID0gT2JqZWN0LmtleXModGhpcy5fcGx1Z2lucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJZiBwbHVnaW5zIGlzIGEgc3RyaW5nLCBjb252ZXJ0IGl0IHRvIGFuIGFycmF5IHdpdGggb25lIGl0ZW1cbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBwbHVnaW5zID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHBsdWdpbnMgPSBbcGx1Z2luc107XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIFxuICAgICAgICAgICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGVhY2ggcGx1Z2luXG4gICAgICAgICAgICAkLmVhY2gocGx1Z2lucywgZnVuY3Rpb24oaSwgbmFtZSkge1xuICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgY3VycmVudCBwbHVnaW5cbiAgICAgICAgICAgICAgICB2YXIgcGx1Z2luID0gX3RoaXMuX3BsdWdpbnNbbmFtZV07XG4gICAgXG4gICAgICAgICAgICAgICAgLy8gTG9jYWxpemUgdGhlIHNlYXJjaCB0byBhbGwgZWxlbWVudHMgaW5zaWRlIGVsZW0sIGFzIHdlbGwgYXMgZWxlbSBcbiAgICAgICAgICAgICAgICAvLyBpdHNlbGYsIHVubGVzcyBlbGVtID09PSBkb2N1bWVudFxuICAgICAgICAgICAgICAgIHZhciAkZWxlbSA9ICQoZWxlbSkuZmluZCgnW2RhdGEtJytuYW1lKyddJykuYWRkQmFjaygnW2RhdGEtJytuYW1lKyddJyk7XG4gICAgXG4gICAgICAgICAgICAgICAgLy8gRm9yIGVhY2ggcGx1Z2luIGZvdW5kLCBpbml0aWFsaXplIGl0XG4gICAgICAgICAgICAgICAgJGVsZW0uZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyICRlbCA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0cyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAvLyBEb24ndCBkb3VibGUtZGlwIG9uIHBsdWdpbnNcbiAgICAgICAgICAgICAgICAgICAgaWYgKCRlbC5kYXRhKCdwYXR0ZXJubGlicmFyeVBsdWdpbicpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJUcmllZCB0byBpbml0aWFsaXplIFwiK25hbWUrXCIgb24gYW4gZWxlbWVudCB0aGF0IFwiK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFscmVhZHkgaGFzIGEgW3BhdHRlcm5saWJyYXJ5XSBwbHVnaW46IFwiLCAkZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICAgICAgICAgIGlmKCRlbC5hdHRyKCdkYXRhLW9wdGlvbnMnKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGhpbmcgPSAkZWwuYXR0cignZGF0YS1vcHRpb25zJykuc3BsaXQoJzsnKS5mb3JFYWNoKGZ1bmN0aW9uKGUsIGkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvcHQgPSBlLnNwbGl0KCc6JykubWFwKGZ1bmN0aW9uKGVsKXsgcmV0dXJuIGVsLnRyaW0oKTsgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYob3B0WzBdKSBvcHRzW29wdFswXV0gPSBwYXJzZVZhbHVlKG9wdFsxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgICAgICAgICAkZWwuZGF0YSgncGF0dGVybmxpYnJhcnlQbHVnaW4nLCBuZXcgcGx1Z2luKCQodGhpcyksIG9wdHMpKTtcbiAgICAgICAgICAgICAgICAgICAgfWNhdGNoKGVyKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXIpO1xuICAgICAgICAgICAgICAgICAgICB9ZmluYWxseXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldEZuTmFtZTogZnVuY3Rpb25OYW1lLFxuICAgICAgICB0cmFuc2l0aW9uZW5kOiBmdW5jdGlvbigkZWxlbSl7XG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgJ3RyYW5zaXRpb24nOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICAgICAgICAgICAgJ1dlYmtpdFRyYW5zaXRpb24nOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXG4gICAgICAgICAgICAgICAgJ01velRyYW5zaXRpb24nOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICAgICAgICAgICAgJ09UcmFuc2l0aW9uJzogJ290cmFuc2l0aW9uZW5kJ1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgICAgICAgICAgICAgICAgIGVuZDtcbiAgICBcbiAgICAgICAgICAgIGZvciAodmFyIHQgaW4gdHJhbnNpdGlvbnMpe1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZWxlbS5zdHlsZVt0XSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgICAgICAgICBlbmQgPSB0cmFuc2l0aW9uc1t0XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihlbmQpe1xuICAgICAgICAgICAgICAgIHJldHVybiBlbmQ7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBlbmQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICRlbGVtLnRyaWdnZXJIYW5kbGVyKCd0cmFuc2l0aW9uZW5kJywgWyRlbGVtXSk7XG4gICAgICAgICAgICAgICAgfSwgMSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICd0cmFuc2l0aW9uZW5kJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgXG4gICAgXG4gICAgLyoqXG4gICAgICogbGlicmFyeSBjb250YWluZXIvbmFtZXNwYWNlXG4gICAgICovXG4gICAgcGF0dGVybmxpYnJhcnkubGlicyA9IHtcbiAgICBcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIHV0aWxpdHkgY29udGFpbmVyL25hbWVzcGFjZVxuICAgICAqL1xuICAgIHBhdHRlcm5saWJyYXJ5LnV0aWwgPSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGdW5jdGlvbiBmb3IgYXBwbHlpbmcgYSBkZWJvdW5jZSBlZmZlY3QgdG8gYSBmdW5jdGlvbiBjYWxsLlxuICAgICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyAtIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBhdCBlbmQgb2YgdGltZW91dC5cbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbGF5IC0gVGltZSBpbiBtcyB0byBkZWxheSB0aGUgY2FsbCBvZiBgZnVuY2AuXG4gICAgICAgICAqIEByZXR1cm5zIGZ1bmN0aW9uXG4gICAgICAgICAqL1xuICAgICAgICB0aHJvdHRsZTogZnVuY3Rpb24gKGZ1bmMsIGRlbGF5KSB7XG4gICAgICAgICAgICB2YXIgdGltZXIgPSBudWxsO1xuICAgIFxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29udGV4dCA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgXG4gICAgICAgICAgICAgICAgaWYgKHRpbWVyID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXIgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9LCBkZWxheSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgXG4gICAgLy8gVE9ETzogY29uc2lkZXIgbm90IG1ha2luZyB0aGlzIGEgalF1ZXJ5IGZ1bmN0aW9uXG4gICAgLy8gVE9ETzogbmVlZCB3YXkgdG8gcmVmbG93IHZzLiByZS1pbml0aWFsaXplXG4gICAgLyoqXG4gICAgICogVGhlIHBhdHRlcm5saWJyYXJ5IGpRdWVyeSBtZXRob2QuXG4gICAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IG1ldGhvZCAtIEFuIGFjdGlvbiB0byBwZXJmb3JtIG9uIHRoZSBjdXJyZW50IGpRdWVyeSBvYmplY3QuXG4gICAgICovXG4gICAgdmFyIHNpdGVhcHAgPSBmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgdmFyIHR5cGUgID0gdHlwZW9mIG1ldGhvZCxcbiAgICAgICAgICAgICRtZXRhID0gJCgnbWV0YS5wYXR0ZXJubGlicmFyeS1tcScpLFxuICAgICAgICAgICAgJG5vSlMgPSAkKCcubm8tanMnKTtcbiAgICBcbiAgICAgICAgaWYoISRtZXRhLmxlbmd0aCl7XG4gICAgICAgICAgICAkKCc8bWV0YSBjbGFzcz1cInBhdHRlcm5saWJyYXJ5LW1xXCI+JykuYXBwZW5kVG8oZG9jdW1lbnQuaGVhZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYoJG5vSlMubGVuZ3RoKXtcbiAgICAgICAgICAgICRub0pTLnJlbW92ZUNsYXNzKCduby1qcycpO1xuICAgICAgICB9XG4gICAgICAgICQoJ2JvZHknKS5hZGRDbGFzcyhcbiAgICAgICAgICAgICh0eXBlb2YgUExGb3VuZGF0aW9uID09ICd1bmRlZmluZWQnKSA/ICdib290c3RyYXAnIDogJ3BsZm91bmRhdGlvbidcbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIGlmKHR5cGUgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIC8vbmVlZHMgdG8gaW5pdGlhbGl6ZSB0aGUgcGF0dGVybmxpYnJhcnkgb2JqZWN0LCBvciBhbiBpbmRpdmlkdWFsIHBsdWdpbi5cbiAgICAgICAgICAgIHBhdHRlcm5saWJyYXJ5Lk1lZGlhUXVlcnkuX2luaXQoKTtcbiAgICAgICAgICAgIHBhdHRlcm5saWJyYXJ5LnJlZmxvdyh0aGlzKTtcbiAgICAgICAgfWVsc2UgaWYodHlwZSA9PT0gJ3N0cmluZycpe1xuICAgICAgICAgICAgLy9hbiBpbmRpdmlkdWFsIG1ldGhvZCB0byBpbnZva2Ugb24gYSBwbHVnaW4gb3IgZ3JvdXAgb2YgcGx1Z2luc1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICAgICAgLy9jb2xsZWN0IGFsbCB0aGUgYXJndW1lbnRzLCBpZiBuZWNlc3NhcnlcbiAgICAgICAgICAgIHZhciBwbHVnQ2xhc3MgPSB0aGlzLmRhdGEoJ3BhdHRlcm5saWJyYXJ5LXBsdWdpbicpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2RldGVybWluZSB0aGUgY2xhc3Mgb2YgcGx1Z2luXG4gICAgICAgICAgICBpZihwbHVnQ2xhc3MgIT09IHVuZGVmaW5lZCAmJiBwbHVnQ2xhc3NbbWV0aG9kXSAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgICAgICAvL21ha2Ugc3VyZSBib3RoIHRoZSBjbGFzcyBhbmQgbWV0aG9kIGV4aXN0XG4gICAgICAgICAgICAgICAgaWYodGhpcy5sZW5ndGggPT09IDEpe1xuICAgICAgICAgICAgICAgICAgICAvL2lmIHRoZXJlJ3Mgb25seSBvbmUsIGNhbGwgaXQgZGlyZWN0bHkuXG4gICAgICAgICAgICAgICAgICAgIHBsdWdDbGFzc1ttZXRob2RdLmFwcGx5KHBsdWdDbGFzcywgYXJncyk7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbihpLCBlbCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL290aGVyd2lzZSBsb29wIHRocm91Z2ggdGhlIGpRdWVyeSBjb2xsZWN0aW9uIGFuZCBpbnZva2UgdGhlIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWV0aG9kIG9uIGVhY2hcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsdWdDbGFzc1ttZXRob2RdLmFwcGx5KCQoZWwpLmRhdGEoJ3BhdHRlcm5saWJyYXJ5LXBsdWdpbicpLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfWVsc2V7Ly9lcnJvciBmb3Igbm8gY2xhc3Mgb3Igbm8gbWV0aG9kXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwiV2UncmUgc29ycnksICdcIiArIG1ldGhvZCArIFxuICAgICAgICAgICAgICAgICAgICBcIicgaXMgbm90IGFuIGF2YWlsYWJsZSBtZXRob2QgZm9yIFwiICsgXG4gICAgICAgICAgICAgICAgICAgIChwbHVnQ2xhc3MgPyBmdW5jdGlvbk5hbWUocGx1Z0NsYXNzKSA6ICd0aGlzIGVsZW1lbnQnKSArICcuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1lbHNley8vZXJyb3IgZm9yIGludmFsaWQgYXJndW1lbnQgdHlwZVxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIldlJ3JlIHNvcnJ5LCAnXCIgKyB0eXBlICsgXCInIGlzIG5vdCBhIHZhbGlkIHBhcmFtZXRlci4gXCIrXG4gICAgICAgICAgICAgICAgXCJZb3UgbXVzdCB1c2UgYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBtZXRob2QgeW91IHdpc2ggdG8gaW52b2tlLlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIHdpbmRvdy5wYXR0ZXJubGlicmFyeSA9IHBhdHRlcm5saWJyYXJ5O1xuICAgICQuZm4ucGF0dGVybmxpYnJhcnkgPSBzaXRlYXBwO1xuICAgIFxuXG5cbn0oalF1ZXJ5KTtcblxuLy8gUG9seWZpbGwgZm9yIHJlcXVlc3RBbmltYXRpb25GcmFtZVxuKGZ1bmN0aW9uKCkge1xuICAgIGlmICghRGF0ZS5ub3cgfHwgIXdpbmRvdy5EYXRlLm5vdylcbiAgICAgICAgd2luZG93LkRhdGUubm93ID0gRGF0ZS5ub3cgPSBmdW5jdGlvbigpIHsgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpOyB9O1xuXG4gICAgdmFyIHZlbmRvcnMgPSBbJ3dlYmtpdCcsICdtb3onXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZlbmRvcnMubGVuZ3RoICYmICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lOyArK2kpIHtcbiAgICAgICAgdmFyIHZwID0gdmVuZG9yc1tpXTtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2cCsnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9ICh3aW5kb3dbdnArJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHx8IHdpbmRvd1t2cCsnQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ10pO1xuICAgIH1cbiAgICBpZiAoL2lQKGFkfGhvbmV8b2QpLipPUyA2Ly50ZXN0KHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50KVxuICAgICAgICB8fCAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCAhd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgIHZhciBsYXN0VGltZSA9IDA7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgIHZhciBuZXh0VGltZSA9IE1hdGgubWF4KGxhc3RUaW1lICsgMTYsIG5vdyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGNhbGxiYWNrKGxhc3RUaW1lID0gbmV4dFRpbWUpOyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRUaW1lIC0gbm93KTtcbiAgICAgICAgfTtcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gY2xlYXJUaW1lb3V0O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQb2x5ZmlsbCBmb3IgcGVyZm9ybWFuY2Uubm93LCByZXF1aXJlZCBieSByQUZcbiAgICAgKi9cbiAgICBpZighd2luZG93LnBlcmZvcm1hbmNlIHx8ICF3aW5kb3cucGVyZm9ybWFuY2Uubm93KXtcbiAgICAgICAgd2luZG93LnBlcmZvcm1hbmNlID0ge1xuICAgICAgICAgICAgc3RhcnQ6IERhdGUubm93KCksXG4gICAgICAgICAgICBub3c6IGZ1bmN0aW9uKCl7IHJldHVybiBEYXRlLm5vdygpIC0gdGhpcy5zdGFydDsgfVxuICAgICAgICB9O1xuICAgIH1cbn0pKCk7XG5cbmlmICghRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpIHtcbiAgICBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKG9UaGlzKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgLy8gY2xvc2VzdCB0aGluZyBwb3NzaWJsZSB0byB0aGUgRUNNQVNjcmlwdCA1XG4gICAgICAgICAgICAvLyBpbnRlcm5hbCBJc0NhbGxhYmxlIGZ1bmN0aW9uXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGdW5jdGlvbi5wcm90b3R5cGUuYmluZCAtIHdoYXQgaXMgdHJ5aW5nIHRvIGJlICcrXG4gICAgICAgICAgICAgICAgICAgICdib3VuZCBpcyBub3QgY2FsbGFibGUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhQXJncyAgID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcbiAgICAgICAgICAgIGZUb0JpbmQgPSB0aGlzLFxuICAgICAgICAgICAgZk5PUCAgICA9IGZ1bmN0aW9uKCkge30sXG4gICAgICAgICAgICBmQm91bmQgID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZUb0JpbmQuYXBwbHkoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMgaW5zdGFuY2VvZiBmTk9QID8gdGhpcyA6IG9UaGlzLFxuICAgICAgICAgICAgICAgICAgICBhQXJncy5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICBpZiAodGhpcy5wcm90b3R5cGUpIHtcbiAgICAgICAgICAgIC8vIG5hdGl2ZSBmdW5jdGlvbnMgZG9uJ3QgaGF2ZSBhIHByb3RvdHlwZVxuICAgICAgICAgICAgZk5PUC5wcm90b3R5cGUgPSB0aGlzLnByb3RvdHlwZTtcbiAgICAgICAgfVxuICAgICAgICBmQm91bmQucHJvdG90eXBlID0gbmV3IGZOT1AoKTtcblxuICAgICAgICByZXR1cm4gZkJvdW5kO1xuICAgIH07XG59XG5cbi8vIFBvbHlmaWxsIHRvIGdldCB0aGUgbmFtZSBvZiBhIGZ1bmN0aW9uIGluIElFOVxuZnVuY3Rpb24gZnVuY3Rpb25OYW1lKGZuKSB7XG4gICAgaWYgKEZ1bmN0aW9uLnByb3RvdHlwZS5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmFyIGZ1bmNOYW1lUmVnZXggPSAvZnVuY3Rpb25cXHMoW14oXXsxLH0pXFwoLztcbiAgICAgICAgdmFyIHJlc3VsdHMgPSAoZnVuY05hbWVSZWdleCkuZXhlYygoZm4pLnRvU3RyaW5nKCkpO1xuICAgICAgICByZXR1cm4gKHJlc3VsdHMgJiYgcmVzdWx0cy5sZW5ndGggPiAxKSA/IHJlc3VsdHNbMV0udHJpbSgpIDogXCJcIjtcbiAgICB9XG4gICAgZWxzZSBpZiAoZm4ucHJvdG90eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGZuLmNvbnN0cnVjdG9yLm5hbWU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gZm4ucHJvdG90eXBlLmNvbnN0cnVjdG9yLm5hbWU7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZVZhbHVlKHN0cil7XG4gICAgaWYoL3RydWUvLnRlc3Qoc3RyKSkgcmV0dXJuIHRydWU7XG4gICAgZWxzZSBpZigvZmFsc2UvLnRlc3Qoc3RyKSkgcmV0dXJuIGZhbHNlO1xuICAgIGVsc2UgaWYoIWlzTmFOKHN0ciAqIDEpKSByZXR1cm4gcGFyc2VGbG9hdChzdHIpO1xuICAgIHJldHVybiBzdHI7XG59XG5cbi8vIENvbnZlcnQgUGFzY2FsQ2FzZSB0byBrZWJhYi1jYXNlXG4vLyBUaGFuayB5b3U6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzg5NTU1ODBcbmZ1bmN0aW9uIGh5cGhlbmF0ZShzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG59XG5cbmZ1bmN0aW9uIGdldFBsdWdpbk5hbWUob2JqKSB7XG4gIGlmKHR5cGVvZihvYmouY29uc3RydWN0b3IubmFtZSkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGh5cGhlbmF0ZShvYmouY29uc3RydWN0b3IubmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGh5cGhlbmF0ZShvYmouY2xhc3NOYW1lKTtcbiAgfVxufVxuXG4vKipcbiAqIHJldHVybnMgYSByYW5kb20gYmFzZS0zNiB1aWQgd2l0aCBuYW1lc3BhY2luZ1xuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoIC0gbnVtYmVyIG9mIHJhbmRvbSBiYXNlLTM2IGRpZ2l0cyBkZXNpcmVkLiBJbmNyZWFzZSBmb3IgbW9yZSByYW5kb20gc3RyaW5ncy5cbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2UgLSBuYW1lIG9mIHBsdWdpbiB0byBiZSBpbmNvcnBvcmF0ZWQgaW4gdWlkLCBvcHRpb25hbC5cbiAqIEBkZWZhdWx0IHtTdHJpbmd9ICcnIC0gaWYgbm8gcGx1Z2luIG5hbWUgaXMgcHJvdmlkZWQsIG5vdGhpbmcgaXMgYXBwZW5kZWQgdG8gdGhlIHVpZC5cbiAqIEByZXR1cm5zIHtTdHJpbmd9IC0gdW5pcXVlIGlkXG4gKi9cbmZ1bmN0aW9uIEdldFlvRGlnaXRzKGxlbmd0aCwgbmFtZXNwYWNlKXtcbiAgbGVuZ3RoID0gbGVuZ3RoIHx8IDY7XG4gIHJldHVybiBNYXRoLnJvdW5kKChNYXRoLnBvdygzNiwgbGVuZ3RoICsgMSkgLSBNYXRoLnJhbmRvbSgpICogTWF0aC5wb3coMzYsIGxlbmd0aCkpKS50b1N0cmluZygzNikuc2xpY2UoMSkgKyAobmFtZXNwYWNlID8gYC0ke25hbWVzcGFjZX1gIDogJycpO1xufVxuXG5mdW5jdGlvbiB1Y2ZpcnN0KHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSk7XG59XG5cbiIsIi8qKiBAdmFyICBvYmplY3QgIHBhdHRlcm5saWJyYXJ5LkNvbmZpZyAgcGF0dGVybmxpYnJhcnkgZ2xvYmFsIGNvbmZpZ3VyYXRpb24gY29udGFpbmVyICovXG5pZiAoIXBhdHRlcm5saWJyYXJ5LkNvbmZpZykge1xuICAgIHBhdHRlcm5saWJyYXJ5LkNvbmZpZyA9IHtcbiAgICBcdFxuICAgIFx0Ly8gZGVidWcgbW9kZSAoY29uc29sZSBvdXRwdXQpIG9uL29mZlxuICAgIFx0ZGVidWc6IGZhbHNlLFxuICAgIFx0XG4gICAgICAgIC8vIGRldGVjdCBVSSBmcmFtZXdvcmtcbiAgICAgICAgcmVuZGVyZXIgOiAoKHR5cGVvZiBQTEZvdW5kYXRpb24gIT0gJ3VuZGVmaW5lZCcpID8gJ3BsZm91bmRhdGlvbicgOiAnYm9vdHN0cmFwJyksXG4gICAgICAgIC8vIGRldGVjdCBsYW5ndWFnZVxuICAgICAgICBsYW5nIDogJCgnSFRNTCcpLmF0dHIoJ2xhbmcnKSB8fCAnZW4nLFxuICAgICAgICBcbiAgICAgICAgLy8gWEhSIHNlbGVjdG9yc1xuICAgICAgICB4aHJTZWxlY3RvcnMgOiB7XG4gICAgICAgICAgICB4aHJCdXR0b25zICA6IFwiQS5idG5baHJlZio9J2FkZCddLCBBLmJ0bltocmVmKj0nZWRpdCddLCBBLmJ0bltocmVmKj0nZGV0YWlscyddLCBBLmJ0bltocmVmKj0nZGVsZXRlJ11cIixcbiAgICAgICAgICAgIHhockNUQU9wZW4gIDogXCJBLmJ0bi1jdGEteGhyLmN0YS14aHItbW9kYWxcIixcbiAgICAgICAgICAgIHhockNUQUNsb3NlIDogXCIubW9kYWwtY29udGVudCAuYnRuLWN0YS14aHItY2xvc2UsIC5tb2RhbC1jb250ZW50IC5hbGVydCwgLm1vZGFsLWNvbnRlbnQgLmNsb3NlLCAubW9kYWwtY29udGVudCAuY3RhLXhoci1tb2RhbC1jbG9zZSwgLnJldmVhbCAuY3RhLXhoci1tb2RhbC1jbG9zZVwiLFxuICAgICAgICAgICAgeGhyRm9ybXMgICAgOiBcIi5tb2RhbC1jb250ZW50IC5mb3JtLXhoclwiXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICAvLyBtb2RhbCBzZXR0aW5nc1xuICAgICAgICBtb2RhbHMgOiB7XG4gICAgICAgICAgICBib290c3RyYXBFbGVtZW50Q2xhc3NuYW1lICA6ICdtb2RhbCcsXG4gICAgICAgICAgICBwbGZvdW5kYXRpb25FbGVtZW50Q2xhc3NuYW1lIDogJ3JldmVhbCdcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIC8vIGRhdGFUYWJsZSBwbHVnLWluIHNldHRpbmdzXG4gICAgICAgIGRhdGFUYWJsZSA6IHtcbiAgICAgICAgICAgIGxhbmdVUkxzIDoge1xuICAgICAgICAgICAgICAgICdlbicgOiAnLy9jZG4uZGF0YXRhYmxlcy5uZXQvcGx1Zy1pbnMvMS4xMC45L2kxOG4vRW5nbGlzaC5qc29uJyxcbiAgICAgICAgICAgICAgICAnZGUnIDogJy8vY2RuLmRhdGF0YWJsZXMubmV0L3BsdWctaW5zLzEuMTAuOS9pMThuL0dlcm1hbi5qc29uJyxcbiAgICAgICAgICAgICAgICAnZnInIDogJy8vY2RuLmRhdGF0YWJsZXMubmV0L3BsdWctaW5zLzEuMTAuOS9pMThuL0ZyZW5jaC5qc29uJyxcbiAgICAgICAgICAgICAgICAnZXMnIDogJy8vY2RuLmRhdGF0YWJsZXMubmV0L3BsdWctaW5zLzEuMTAuOS9pMThuL1NwYW5pc2guanNvbicsXG4gICAgICAgICAgICAgICAgJ2l0JyA6ICcvL2Nkbi5kYXRhdGFibGVzLm5ldC9wbHVnLWlucy8xLjEwLjkvaTE4bi9JdGFsaWFuLmpzb24nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3RhdGVTYXZlIDogdHJ1ZSxcbiAgICAgICAgICAgIHN0YXRlRHVyYXRpb24gOiA2MCAqIDYwICogMjQgKiAxICAvLyBzZWMgKiBtaW4gKiBoICogZFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICB9O1xufVxuIiwiLyoqXG4gKiBUaGlzIG1vZHVsZSBzZXRzIHVwIHRoZSBzZWFyY2ggYmFyLlxuICovXG5cbiFmdW5jdGlvbigpIHtcblxudmFyIHNlYXJjaFNvdXJjZSA9IHtcbiAgbmFtZSA6ICdwYXR0ZXJubGlicmFyeScsXG5cbiAgLy8gT25seSBzaG93IDEwIHJlc3VsdHMgYXQgb25jZVxuICBsaW1pdDogMTAsXG5cbiAgLy8gRnVuY3Rpb24gdG8gZmV0Y2ggcmVzdWx0IGxpc3QgYW5kIHRoZW4gZmluZCBhIHJlc3VsdDtcbiAgc291cmNlOiBmdW5jdGlvbihxdWVyeSwgc3luYywgYXN5bmMpIHtcbiAgICBxdWVyeSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG5cbiAgICAkLmdldEpTT04oJy9wbC9zZWFyY2guanNvbicsIGZ1bmN0aW9uKGRhdGEsIHN0YXR1cykge1xuICAgICAgYXN5bmMoZGF0YS5maWx0ZXIoZnVuY3Rpb24oZWxlbSwgaSwgYXJyKSB7XG4gICAgICAgIHZhciBuYW1lID0gZWxlbS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHZhciB0ZXJtcyA9IFtuYW1lLCBuYW1lLnJlcGxhY2UoJy0nLCAnJyldLmNvbmNhdChlbGVtLnRhZ3MgfHwgW10pO1xuICAgICAgICBmb3IgKHZhciBpIGluIHRlcm1zKSBpZiAodGVybXNbaV0uaW5kZXhPZihxdWVyeSkgPiAtMSkgcmV0dXJuIHRydWU7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pKTtcbiAgICB9KTtcbiAgfSxcblxuICAvLyBOYW1lIHRvIHVzZSBmb3IgdGhlIHNlYXJjaCByZXN1bHQgaXRzZWxmXG4gIGRpc3BsYXk6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS5uYW1lO1xuICB9LFxuXG4gIHRlbXBsYXRlczoge1xuICAgIC8vIEhUTUwgdGhhdCByZW5kZXJzIGlmIHRoZXJlIGFyZSBubyByZXN1bHRzXG4gICAgbm90Rm91bmQ6IGZ1bmN0aW9uKHF1ZXJ5KSB7XG4gICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJ0dC1lbXB0eVwiPk5vIHJlc3VsdHMgZm9yIFwiJyArIHF1ZXJ5LnF1ZXJ5ICsgJ1wiLjwvZGl2Pic7XG4gICAgfSxcbiAgICAvLyBIVE1MIHRoYXQgcmVuZGVycyBmb3IgZWFjaCByZXN1bHQgaW4gdGhlIGxpc3RcbiAgICBzdWdnZXN0aW9uOiBmdW5jdGlvbihpdGVtKSB7XG4gICAgICByZXR1cm4gJzxkaXY+PHNwYW4gY2xhc3M9XCJuYW1lXCI+JyArIGl0ZW0ubmFtZSArICc8c3BhbiBjbGFzcz1cIm1ldGFcIj4nICsgaXRlbS50eXBlICsgJzwvc3Bhbj48L3NwYW4+IDxzcGFuIGNsYXNzPVwiZGVzY1wiPicgKyBpdGVtLmRlc2NyaXB0aW9uICsgJzwvc3Bhbj48L2Rpdj4nO1xuICAgIH1cbiAgfVxufVxuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG5cdFxuXHQvLyBTZWFyY2hcblx0aWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdzZWFyY2g6ICcsICQoJ1tkYXRhLWRvY3Mtc2VhcmNoXScpKTtcblx0XG5cdCQoJ1tkYXRhLWRvY3Mtc2VhcmNoXScpXG5cdCAgLnR5cGVhaGVhZCh7IGhpZ2hsaWdodDogZmFsc2UgfSwgc2VhcmNoU291cmNlKTtcblx0XG5cdCQoJ1tkYXRhLWRvY3Mtc2VhcmNoXScpXG5cdCAgLmJpbmQoJ3R5cGVhaGVhZDpzZWxlY3QnLCBmdW5jdGlvbihlLCBzZWwpIHtcblx0ICAgIHZhciBsaW5rVXJsID0gU3RyaW5nKHNlbC5saW5rKVxuXHQgICAgICAgICAgICAucmVwbGFjZSgnLi4vcGF0dGVybnMnLCAnL3BsL3BhdHRlcm5zJylcblx0ICAgICAgICAgICAgLnJlcGxhY2UoJy9yZWFkbWUuaHRtbCcsICcnKTtcblx0ICAgIFxuXHQgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBsaW5rVXJsO1xuXHQgICAgLy9lLnByZXZlbnREZWZhdWx0KCk7IGUuc3RvcFByb3BhZ2F0aW9uKCk7IHJldHVybiBmYWxzZTtcblx0ICB9KTtcblx0XG5cdC8vIEF1dG8taGlnaGxpZ2h0IHVubGVzcyBpdCdzIGEgcGhvbmVcblx0aWYgKCFuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC8oaVAoaG9uZXxhZHxvZCl8QW5kcm9pZCkvKSkge1xuXHQgICQoJ1tkYXRhLWRvY3Mtc2VhcmNoXScpLmZvY3VzKCk7XG5cdH1cblx0XG59KTtcblxufSgpO1xuIiwiIWZ1bmN0aW9uKCQsIHBhdHRlcm5saWJyYXJ5KSB7XG5cbi8vIERlZmF1bHQgc2V0IG9mIG1lZGlhIHF1ZXJpZXNcbnZhciBkZWZhdWx0UXVlcmllcyA9IHtcbiAgJ2RlZmF1bHQnIDogJ29ubHkgc2NyZWVuJyxcbiAgbGFuZHNjYXBlIDogJ29ubHkgc2NyZWVuIGFuZCAob3JpZW50YXRpb246IGxhbmRzY2FwZSknLFxuICBwb3J0cmFpdCA6ICdvbmx5IHNjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBwb3J0cmFpdCknLFxuICByZXRpbmEgOiAnb25seSBzY3JlZW4gYW5kICgtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi0tbW96LWRldmljZS1waXhlbC1yYXRpbzogMiksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAoLW8tbWluLWRldmljZS1waXhlbC1yYXRpbzogMi8xKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMTkyZHBpKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMmRwcHgpJ1xufTtcblxudmFyIE1lZGlhUXVlcnkgPSB7XG4gIHF1ZXJpZXM6IFtdLFxuICBjdXJyZW50OiAnJyxcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBzY3JlZW4gaXMgYXQgbGVhc3QgYXMgd2lkZSBhcyBhIGJyZWFrcG9pbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGJyZWFrcG9pbnQgbWF0Y2hlcywgYGZhbHNlYCBpZiBpdCdzIHNtYWxsZXIuXG4gICAqL1xuICBhdExlYXN0OiBmdW5jdGlvbihzaXplKSB7XG4gICAgdmFyIHF1ZXJ5ID0gdGhpcy5nZXQoc2l6ZSk7XG5cbiAgICBpZiAocXVlcnkpIHtcbiAgICAgIHJldHVybiB3aW5kb3cubWF0Y2hNZWRpYShxdWVyeSkubWF0Y2hlcztcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG1lZGlhIHF1ZXJ5IG9mIGEgYnJlYWtwb2ludC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBnZXQuXG4gICAqIEByZXR1cm5zIHtTdHJpbmd8bnVsbH0gLSBUaGUgbWVkaWEgcXVlcnkgb2YgdGhlIGJyZWFrcG9pbnQsIG9yIGBudWxsYCBpZiB0aGUgYnJlYWtwb2ludCBkb2Vzbid0IGV4aXN0LlxuICAgKi9cbiAgZ2V0OiBmdW5jdGlvbihzaXplKSB7XG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLnF1ZXJpZXMpIHtcbiAgICAgIHZhciBxdWVyeSA9IHRoaXMucXVlcmllc1tpXTtcbiAgICAgIGlmIChzaXplID09PSBxdWVyeS5uYW1lKSByZXR1cm4gcXVlcnkudmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBtZWRpYSBxdWVyeSBoZWxwZXIsIGJ5IGV4dHJhY3RpbmcgdGhlIGJyZWFrcG9pbnQgbGlzdCBmcm9tIHRoZSBDU1MgYW5kIGFjdGl2YXRpbmcgdGhlIGJyZWFrcG9pbnQgd2F0Y2hlci5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBleHRyYWN0ZWRTdHlsZXMgPSAkKCcucGF0dGVybmxpYnJhcnktbXEnKS5jc3MoJ2ZvbnQtZmFtaWx5Jyk7XG4gICAgdmFyIG5hbWVkUXVlcmllcztcblxuICAgIG5hbWVkUXVlcmllcyA9IHBhcnNlU3R5bGVUb09iamVjdChleHRyYWN0ZWRTdHlsZXMpO1xuXG4gICAgZm9yICh2YXIga2V5IGluIG5hbWVkUXVlcmllcykge1xuICAgICAgc2VsZi5xdWVyaWVzLnB1c2goe1xuICAgICAgICBuYW1lOiBrZXksXG4gICAgICAgIHZhbHVlOiAnb25seSBzY3JlZW4gYW5kIChtaW4td2lkdGg6ICcgKyBuYW1lZFF1ZXJpZXNba2V5XSArICcpJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5jdXJyZW50ID0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKTtcblxuICAgIHRoaXMuX3dhdGNoZXIoKTtcblxuICAgIC8vIEV4dGVuZCBkZWZhdWx0IHF1ZXJpZXNcbiAgICAvLyBuYW1lZFF1ZXJpZXMgPSAkLmV4dGVuZChkZWZhdWx0UXVlcmllcywgbmFtZWRRdWVyaWVzKTtcbiAgfSxcblxuICAvKipcbiAgICogR2V0cyB0aGUgY3VycmVudCBicmVha3BvaW50IG5hbWUgYnkgdGVzdGluZyBldmVyeSBicmVha3BvaW50IGFuZCByZXR1cm5pbmcgdGhlIGxhc3Qgb25lIHRvIG1hdGNoICh0aGUgYmlnZ2VzdCBvbmUpLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybnMge1N0cmluZ30gTmFtZSBvZiB0aGUgY3VycmVudCBicmVha3BvaW50LlxuICAgKi9cbiAgX2dldEN1cnJlbnRTaXplOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbWF0Y2hlZDtcblxuICAgIGZvciAodmFyIGkgaW4gdGhpcy5xdWVyaWVzKSB7XG4gICAgICB2YXIgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbaV07XG5cbiAgICAgIGlmICh3aW5kb3cubWF0Y2hNZWRpYShxdWVyeS52YWx1ZSkubWF0Y2hlcykge1xuICAgICAgICBtYXRjaGVkID0gcXVlcnk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYodHlwZW9mIG1hdGNoZWQgPT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4gbWF0Y2hlZC5uYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbWF0Y2hlZDtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEFjdGl2YXRlcyB0aGUgYnJlYWtwb2ludCB3YXRjaGVyLCB3aGljaCBmaXJlcyBhbiBldmVudCBvbiB0aGUgd2luZG93IHdoZW5ldmVyIHRoZSBicmVha3BvaW50IGNoYW5nZXMuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3dhdGNoZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS56Zi5tZWRpYXF1ZXJ5JywgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbmV3U2l6ZSA9IF90aGlzLl9nZXRDdXJyZW50U2l6ZSgpO1xuXG4gICAgICBpZiAobmV3U2l6ZSAhPT0gX3RoaXMuY3VycmVudCkge1xuICAgICAgICAvLyBCcm9hZGNhc3QgdGhlIG1lZGlhIHF1ZXJ5IGNoYW5nZSBvbiB0aGUgd2luZG93XG4gICAgICAgICQod2luZG93KS50cmlnZ2VyKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBbbmV3U2l6ZSwgX3RoaXMuY3VycmVudF0pO1xuXG4gICAgICAgIC8vIENoYW5nZSB0aGUgY3VycmVudCBtZWRpYSBxdWVyeVxuICAgICAgICBfdGhpcy5jdXJyZW50ID0gbmV3U2l6ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxucGF0dGVybmxpYnJhcnkuTWVkaWFRdWVyeSA9IE1lZGlhUXVlcnk7XG5cbi8vIG1hdGNoTWVkaWEoKSBwb2x5ZmlsbCAtIFRlc3QgYSBDU1MgbWVkaWEgdHlwZS9xdWVyeSBpbiBKUy5cbi8vIEF1dGhvcnMgJiBjb3B5cmlnaHQgKGMpIDIwMTI6IFNjb3R0IEplaGwsIFBhdWwgSXJpc2gsIE5pY2hvbGFzIFpha2FzLCBEYXZpZCBLbmlnaHQuIER1YWwgTUlUL0JTRCBsaWNlbnNlXG53aW5kb3cubWF0Y2hNZWRpYSB8fCAod2luZG93Lm1hdGNoTWVkaWEgPSBmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIEZvciBicm93c2VycyB0aGF0IHN1cHBvcnQgbWF0Y2hNZWRpdW0gYXBpIHN1Y2ggYXMgSUUgOSBhbmQgd2Via2l0XG4gIHZhciBzdHlsZU1lZGlhID0gKHdpbmRvdy5zdHlsZU1lZGlhIHx8IHdpbmRvdy5tZWRpYSk7XG5cbiAgLy8gRm9yIHRob3NlIHRoYXQgZG9uJ3Qgc3VwcG9ydCBtYXRjaE1lZGl1bVxuICBpZiAoIXN0eWxlTWVkaWEpIHtcbiAgICB2YXIgc3R5bGUgICA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyksXG4gICAgc2NyaXB0ICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF0sXG4gICAgaW5mbyAgICAgICAgPSBudWxsO1xuXG4gICAgc3R5bGUudHlwZSAgPSAndGV4dC9jc3MnO1xuICAgIHN0eWxlLmlkICAgID0gJ21hdGNobWVkaWFqcy10ZXN0JztcblxuICAgIHNjcmlwdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzdHlsZSwgc2NyaXB0KTtcblxuICAgIC8vICdzdHlsZS5jdXJyZW50U3R5bGUnIGlzIHVzZWQgYnkgSUUgPD0gOCBhbmQgJ3dpbmRvdy5nZXRDb21wdXRlZFN0eWxlJyBmb3IgYWxsIG90aGVyIGJyb3dzZXJzXG4gICAgaW5mbyA9ICgnZ2V0Q29tcHV0ZWRTdHlsZScgaW4gd2luZG93KSAmJiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShzdHlsZSwgbnVsbCkgfHwgc3R5bGUuY3VycmVudFN0eWxlO1xuXG4gICAgc3R5bGVNZWRpYSA9IHtcbiAgICAgIG1hdGNoTWVkaXVtOiBmdW5jdGlvbihtZWRpYSkge1xuICAgICAgICB2YXIgdGV4dCA9ICdAbWVkaWEgJyArIG1lZGlhICsgJ3sgI21hdGNobWVkaWFqcy10ZXN0IHsgd2lkdGg6IDFweDsgfSB9JztcblxuICAgICAgICAvLyAnc3R5bGUuc3R5bGVTaGVldCcgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnc3R5bGUudGV4dENvbnRlbnQnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICAgICAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICAgICAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSB0ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0eWxlLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRlc3QgaWYgbWVkaWEgcXVlcnkgaXMgdHJ1ZSBvciBmYWxzZVxuICAgICAgICByZXR1cm4gaW5mby53aWR0aCA9PT0gJzFweCc7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihtZWRpYSkge1xuICAgIHJldHVybiB7XG4gICAgICBtYXRjaGVzOiBzdHlsZU1lZGlhLm1hdGNoTWVkaXVtKG1lZGlhIHx8ICdhbGwnKSxcbiAgICAgIG1lZGlhOiBtZWRpYSB8fCAnYWxsJ1xuICAgIH07XG4gIH07XG59KCkpO1xuXG4vLyBUaGFuayB5b3U6IGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvcXVlcnktc3RyaW5nXG5mdW5jdGlvbiBwYXJzZVN0eWxlVG9PYmplY3Qoc3RyKSB7XG4gIHZhciBzdHlsZU9iamVjdCA9IHt9O1xuXG4gIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBzdHlsZU9iamVjdDtcbiAgfVxuXG4gIHN0ciA9IHN0ci50cmltKCkuc2xpY2UoMSwgLTEpOyAvLyBicm93c2VycyByZS1xdW90ZSBzdHJpbmcgc3R5bGUgdmFsdWVzXG5cbiAgaWYgKCFzdHIpIHtcbiAgICByZXR1cm4gc3R5bGVPYmplY3Q7XG4gIH1cblxuICBzdHlsZU9iamVjdCA9IHN0ci5zcGxpdCgnJicpLnJlZHVjZShmdW5jdGlvbihyZXQsIHBhcmFtKSB7XG4gICAgdmFyIHBhcnRzID0gcGFyYW0ucmVwbGFjZSgvXFwrL2csICcgJykuc3BsaXQoJz0nKTtcbiAgICB2YXIga2V5ID0gcGFydHNbMF07XG4gICAgdmFyIHZhbCA9IHBhcnRzWzFdO1xuICAgIGtleSA9IGRlY29kZVVSSUNvbXBvbmVudChrZXkpO1xuXG4gICAgLy8gbWlzc2luZyBgPWAgc2hvdWxkIGJlIGBudWxsYDpcbiAgICAvLyBodHRwOi8vdzMub3JnL1RSLzIwMTIvV0QtdXJsLTIwMTIwNTI0LyNjb2xsZWN0LXVybC1wYXJhbWV0ZXJzXG4gICAgdmFsID0gdmFsID09PSB1bmRlZmluZWQgPyBudWxsIDogZGVjb2RlVVJJQ29tcG9uZW50KHZhbCk7XG5cbiAgICBpZiAoIXJldC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICByZXRba2V5XSA9IHZhbDtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocmV0W2tleV0pKSB7XG4gICAgICByZXRba2V5XS5wdXNoKHZhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldFtrZXldID0gW3JldFtrZXldLCB2YWxdO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9LCB7fSk7XG5cbiAgcmV0dXJuIHN0eWxlT2JqZWN0O1xufVxuXG59KGpRdWVyeSwgcGF0dGVybmxpYnJhcnkpO1xuIiwiLyoqXG4gKiBcbiAqL1xuOyhmdW5jdGlvbiAoJCwgd2luZG93LCBkb2N1bWVudCwgcGF0dGVybmxpYnJhcnksIHVuZGVmaW5lZCkge1xuICAndXNlIHN0cmljdCc7XG5cblxuICBwYXR0ZXJubGlicmFyeS5saWJzLm1vZGFsID0ge1xuICAgIG5hbWUgOiAnbW9kYWwnLFxuXG4gICAgdmVyc2lvbiA6ICcwLjAuMScsXG5cbiAgICBzZXR0aW5ncyA6IHtcbiAgICAgIGNhbGxiYWNrIDogZnVuY3Rpb24gKCkge31cbiAgICB9LFxuXG4gICAgLyppbml0IDogZnVuY3Rpb24gKHNjb3BlLCBtZXRob2QsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIC8vIHBhdHRlcm5saWJyYXJ5LmluaGVyaXQodGhpcywgJ21vZHVsZW5hbWUxIG1vZHVsZW5hbWUyJyk7XG5cbiAgICAgIHRoaXMuYmluZGluZ3MobWV0aG9kLCBvcHRpb25zKTtcbiAgICB9LCovXG5cbiAgICAvKipcbiAgICAgKiBvcGVuIG1vZGFsIGRpYWxvZ1xuICAgICAqIFxuICAgICAqIEBwYXJhbSAgbWl4ZWQgIGRhdGEgIHRoZSBtb2RhbCBjb250ZW50XG4gICAgICogQHBhcmFtICBzdHJpbmcgIHVwZGF0ZVdpbmRvd0hyZWYgIFVSTCB0byB1cGRhdGUgYnJvd3NlciBoaXN0b3J5IGFuZCBsb2NhdGlvbiwgLWZhbHNlL251bGwtIGRpc2FibGVzLCBkZWZhdWx0IC1mYWxzZS0gXG4gICAgICogQHJldHVybiBwYXR0ZXJubGlicmFyeS5saWJzLm1vZGFsXG4gICAgICovXG4gICAgb3BlbiA6IGZ1bmN0aW9uIChkYXRhLCB1cGRhdGVXaW5kb3dIcmVmKSB7XG4gICAgICAgIGlmICgodHlwZW9mICQuZm4ubW9kYWwgPT0gJ3VuZGVmaW5lZCcpICYmICh0eXBlb2YgUExGb3VuZGF0aW9uLlJldmVhbCA9PSAndW5kZWZpbmVkJykpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignQm9vdHN0cmFwIE1vZGFsIGFuZC9vciBQTEZvdW5kYXRpb24gUmV2ZWFsIHBsdWctaW5zIG5vdCBmb3VuZC4uLicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciAkbW9kYWwgPSBudWxsO1xuICAgICAgICBpZiAodHlwZW9mIFBMRm91bmRhdGlvbiAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgaWYgKCAkKCcjJytwYXR0ZXJubGlicmFyeS5Db25maWcubW9kYWxzLnBsZm91bmRhdGlvbkVsZW1lbnRDbGFzc25hbWUpLnNpemUoKSA9PSAwICkge1xuICAgICAgICAgICAgICAgICQoJ0JPRFknKS5hcHBlbmQoJzxkaXYgaWQ9XCInK3BhdHRlcm5saWJyYXJ5LkNvbmZpZy5tb2RhbHMucGxmb3VuZGF0aW9uRWxlbWVudENsYXNzbmFtZSsnXCIgY2xhc3M9XCInK3BhdHRlcm5saWJyYXJ5LkNvbmZpZy5tb2RhbHMucGxmb3VuZGF0aW9uRWxlbWVudENsYXNzbmFtZSsnXCIgZGF0YS1yZXZlYWw+PC9kaXY+JylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciByZXZlYWxPcHRpb25zID0geyBcbiAgICAgICAgICAgIFx0XCJhbmltYXRpb25JblwiICAgIDogXCJzY2FsZS1pbi11cFwiLFxuICAgICAgICAgICAgXHRcImFuaW1hdGlvbk91dFwiICAgOiBcInNjYWxlLW91dC1kb3duXCIsXG4gICAgICAgICAgICBcdFwib3ZlcmxheVwiICAgICAgICA6IHRydWUsXG4gICAgICAgICAgICBcdFwiY2xvc2VPbkNsaWNrXCIgICA6IGZhbHNlLFxuICAgICAgICAgICAgXHRcImNsb3NlT25FY3NcIiAgICAgOiB0cnVlLFxuICAgICAgICAgICAgXHRcIm11bHRpcGxlT3BlbmVkXCIgOiBmYWxzZSxcbiAgICAgICAgICAgIFx0XCJkZWVwTGlua1wiICAgICAgIDogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBtb2RhbERhdGEgPSAnJytkYXRhKycnLFxuICAgICAgICAgICAgICAgIG0gPSBuZXcgUExGb3VuZGF0aW9uLlJldmVhbCgkKCcjJytwYXR0ZXJubGlicmFyeS5Db25maWcubW9kYWxzLnBsZm91bmRhdGlvbkVsZW1lbnRDbGFzc25hbWUpLCByZXZlYWxPcHRpb25zKVxuICAgICAgICAgICAgO1xuICAgICAgICAgICAgJCgnIycrcGF0dGVybmxpYnJhcnkuQ29uZmlnLm1vZGFscy5wbGZvdW5kYXRpb25FbGVtZW50Q2xhc3NuYW1lKS5odG1sKGRhdGEpLnBsZm91bmRhdGlvbignb3BlbicpO1xuICAgICAgICAgICAgJG1vZGFsID0gJCgnLicrcGF0dGVybmxpYnJhcnkuQ29uZmlnLm1vZGFscy5wbGZvdW5kYXRpb25FbGVtZW50Q2xhc3NuYW1lKTtcbiAgICAgICAgICAgICRtb2RhbC5vbignY2xvc2VkLnpmLnJldmVhbCcsIHBhdHRlcm5saWJyYXJ5Lk1vZGFsLmNsb3NlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciAkbW9kYWxEZWZhdWx0cyA9IHtcbiAgICAgICAgICAgICAgICBzaG93OiB0cnVlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgJChkYXRhKS5tb2RhbCgkbW9kYWxEZWZhdWx0cyk7XG4gICAgICAgICAgICAkbW9kYWwgPSAkKCcuJytwYXR0ZXJubGlicmFyeS5Db25maWcubW9kYWxzLmJvb3RzdHJhcEVsZW1lbnRDbGFzc25hbWUpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAodXBkYXRlV2luZG93SHJlZikge1xuICAgICAgICAgICAgcGF0dGVybmxpYnJhcnkuV2luZG93SHJlZi5yZXNldCgpO1xuICAgICAgICAgICAgZG9jdW1lbnQuX29sZF9ocmVmID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBcImh0bWxcIiA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIFwicGFnZVRpdGxlXCIgOiBkb2N1bWVudC50aXRsZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgICAgICB1cGRhdGVXaW5kb3dIcmVmXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gKCRtb2RhbCk7XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiBjbG9zZSBtb2RhbCBkaWFsb2dcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJuIHBhdHRlcm5saWJyYXJ5LmxpYnMubW9kYWxcbiAgICAgKi9cbiAgICBjbG9zZSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCh0eXBlb2YgJC5mbi5tb2RhbCA9PSAndW5kZWZpbmVkJykgJiYgKHR5cGVvZiBQTEZvdW5kYXRpb24uUmV2ZWFsID09ICd1bmRlZmluZWQnKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdqUXVlcnkgTW9kYWwgYW5kL29yIFBMRm91bmRhdGlvbiBSZXZlYWwgcGx1Zy1pbnMgbm90IGZvdW5kLi4uJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciAkbW9kYWw7XG4gICAgICAgIC8vIGNsb3NlL2Rlc3Ryb3kgbW9kYWxzXG4gICAgICAgIGlmICh0eXBlb2YgUExGb3VuZGF0aW9uICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAkbW9kYWwgPSAkKCcuJytwYXR0ZXJubGlicmFyeS5Db25maWcubW9kYWxzLnBsZm91bmRhdGlvbkVsZW1lbnRDbGFzc25hbWUpO1xuICAgICAgICAgICAgaWYgKCRtb2RhbCkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICRtb2RhbC5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICRtb2RhbC5wbGZvdW5kYXRpb24oJ2Nsb3NlJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vJG1vZGFsLnBsZm91bmRhdGlvbignZGVzdHJveScpO1xuICAgICAgICAgICAgICAgICAgICAvLyQoJy5yZXZlYWwtb3ZlcmxheScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIFx0Y29uc29sZS5pbmZvKCdtb2RhbCBjbG9zZWQuLi4nKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgXHQvL2NvbnNvbGUud2FybignbW9kYWwgY291bGQgbm90IGJlIGNsb3NlZC4uLiBmb3JjZSByZW1vdmFsLi4uJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJG1vZGFsID0gJCgnLicrcGF0dGVybmxpYnJhcnkuQ29uZmlnLm1vZGFscy5ib290c3RyYXBFbGVtZW50Q2xhc3NuYW1lKTtcbiAgICAgICAgICAgIGlmICgkbW9kYWwpIHtcbiAgICAgICAgICAgICAgICAkbW9kYWwubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gY2xlYW4gdXBcbiAgICAgICAgJCgnQk9EWScpLnJlbW92ZUNsYXNzKCdpcy1yZXZlYWwtb3BlbicpO1xuICAgICAgICAkKCcucmV2ZWFsLCAucmV2ZWFsLXdyYXBwZXIsIC5tb2RhbCwgLm1vZGFsLWJhY2tkcm9wJykucmVtb3ZlKCk7XG4gICAgICAgIFxuICAgICAgICAvLyAocmUpc2V0IGRvY3VtZW50IFVSTFxuICAgICAgICBwYXR0ZXJubGlicmFyeS5XaW5kb3dIcmVmLnJlc2V0KCk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gKHRoaXMpO1xuICAgIH1cblxuICB9O1xuXG4gIC8vIGNvZGUsIHByaXZhdGUgZnVuY3Rpb25zLCBldGMgaGVyZS4uLlxuXG4gIHBhdHRlcm5saWJyYXJ5Lk1vZGFsID0ge1xuICAgICAgb3BlbiA6IHBhdHRlcm5saWJyYXJ5LmxpYnMubW9kYWwub3BlbixcbiAgICAgIGNsb3NlIDogcGF0dGVybmxpYnJhcnkubGlicy5tb2RhbC5jbG9zZSxcbiAgfTtcbiAgXG59KShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQsIHdpbmRvdy5wYXR0ZXJubGlicmFyeSk7XG5cblxuIiwiLyoqXG4gKiBcbiAqL1xuOyhmdW5jdGlvbiAoJCwgd2luZG93LCBkb2N1bWVudCwgcGF0dGVybmxpYnJhcnkpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG5cbiAgcGF0dGVybmxpYnJhcnkubGlicy53aW5kb3docmVmID0ge1xuICAgIG5hbWUgOiAnd2luZG93aHJlZicsXG5cbiAgICB2ZXJzaW9uIDogJzAuMC4xJyxcblxuICAgIHNldHRpbmdzIDoge1xuICAgICAgY2FsbGJhY2sgOiBmdW5jdGlvbiAoKSB7fVxuICAgIH0sXG5cbiAgICBpbml0IDogZnVuY3Rpb24gKHNjb3BlLCBtZXRob2QsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIC8vIHBhdHRlcm5saWJyYXJ5LmluaGVyaXQodGhpcywgJ21vZHVsZW5hbWUxIG1vZHVsZW5hbWUyJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHVwZGF0ZSB3aW5kb3cncyBocmVmIHRvIFVSTCBhbmQgc2F2ZSBvbGQgaHJlZlxuICAgICAqIFxuICAgICAqIEBwYXJhbSAgc3RyaW5nICB1cmwgIFVSTCB0byB1cGRhdGUgdG9cbiAgICAgKiBAcmV0dXJuIHBhdHRlcm5saWJyYXJ5LmxpYnMud2luZG93aHJlZlxuICAgICAqL1xuICAgIHVwZGF0ZSA6IGZ1bmN0aW9uICggdXJsICkge1xuICAgICAgICBpZiAoICh1cmwgPT0gJycpIHx8ICh1cmwgPT0gd2luZG93LmxvY2F0aW9uLmhyZWYpICkgeyByZXR1cm47IH1cbiAgICAgICAgXG4gICAgICAgIGRvY3VtZW50Ll9vbGRfaHJlZiA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJodG1sXCIgOiBudWxsLFxuICAgICAgICAgICAgICAgIFwicGFnZVRpdGxlXCIgOiBkb2N1bWVudC50aXRsZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiXCIsXG4gICAgICAgICAgICB1cGRhdGVXaW5kb3dIcmVmXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gKHRoaXMpO1xuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICogcmVzZXQgd2luZG93J3MgaHJlZiB0byBzdG9yZWQgVVJMXG4gICAgICogXG4gICAgICogQHJldHVybiBwYXR0ZXJubGlicmFyeS5saWJzLndpbmRvd2hyZWZcbiAgICAgKi9cbiAgICByZXNldCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGRvY3VtZW50Ll9vbGRfaHJlZikge1xuICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgXCJodG1sXCI6bnVsbCxcbiAgICAgICAgICAgICAgICAgICAgXCJwYWdlVGl0bGVcIjpkb2N1bWVudC50aXRsZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5fb2xkX2hyZWZcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICh0aGlzKTtcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIGNsZWFyIHN0b3JlZCBVUkxcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJuIHBhdHRlcm5saWJyYXJ5LmxpYnMud2luZG93aHJlZlxuICAgICAqL1xuICAgIGNsZWFyT2xkSHJlZiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZG9jdW1lbnQuX29sZF9ocmVmID0gbnVsbDtcbiAgICAgICAgcmV0dXJuICh0aGlzKTtcbiAgICB9XG5cbiAgfTtcblxuICAvLyBjb2RlLCBwcml2YXRlIGZ1bmN0aW9ucywgZXRjIGhlcmUuLi5cblxuICBwYXR0ZXJubGlicmFyeS5XaW5kb3dIcmVmID0ge1xuICAgICAgdXBkYXRlIDogcGF0dGVybmxpYnJhcnkubGlicy53aW5kb3docmVmLnVwZGF0ZSxcbiAgICAgIHJlc2V0IDogcGF0dGVybmxpYnJhcnkubGlicy53aW5kb3docmVmLnJlc2V0LFxuICAgICAgY2xlYXIgOiBwYXR0ZXJubGlicmFyeS5saWJzLndpbmRvd2hyZWYuY2xlYXJPbGRIcmVmXG4gIH07XG4gIFxufSkoalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50LCB3aW5kb3cucGF0dGVybmxpYnJhcnkpO1xuXG5cbiIsIlxuLyoqXG4gKiBQbHVnaW4gbW9kdWxlLlxuICogQG1vZHVsZSBwbGZvdW5kYXRpb24ucGx1Z2luXG4gKi9cbmNsYXNzIFBsdWdpbiB7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgYSBwbHVnaW4uXG4gICAgICogQGNsYXNzXG4gICAgICogQG5hbWUgUGx1Z2luXG4gICAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGFwcGx5IHRoZSBwbHVnaW4gdG8uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcblx0ICAgIHRoaXMuX3NldHVwKGVsZW1lbnQsIG9wdGlvbnMpO1xuXHQgICAgdmFyIHBsdWdpbk5hbWUgPSBnZXRQbHVnaW5OYW1lKHRoaXMpO1xuXHQgICAgdGhpcy51dWlkID0gR2V0WW9EaWdpdHMoNiwgcGx1Z2luTmFtZSk7XG5cblx0ICAgIGlmKCF0aGlzLiRlbGVtZW50LmF0dHIoYGRhdGEtJHtwbHVnaW5OYW1lfWApKXsgdGhpcy4kZWxlbWVudC5hdHRyKGBkYXRhLSR7cGx1Z2luTmFtZX1gLCB0aGlzLnV1aWQpOyB9XG5cdCAgICBpZighdGhpcy4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicpKXsgdGhpcy4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicsIHRoaXMpOyB9XG5cdCAgICAvKipcblx0ICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgaW5pdGlhbGl6ZWQuXG5cdCAgICAgKiBAZXZlbnQgUGx1Z2luI2luaXRcblx0ICAgICAqL1xuXHQgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGBpbml0LnBsLiR7cGx1Z2luTmFtZX1gKTtcblx0fVxuICAgIFxuICAgIC8qKlxuICAgICAqIERlc3Ryb3lzIHRoZSBwbHVnaW4uXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICovXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5fZGVzdHJveSgpO1xuICAgICAgICB2YXIgcGx1Z2luTmFtZSA9IGdldFBsdWdpbk5hbWUodGhpcyk7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQXR0cihgZGF0YS0ke3BsdWdpbk5hbWV9YCkucmVtb3ZlRGF0YSgnemZQbHVnaW4nKVxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaGFzIGJlZW4gZGVzdHJveWVkLlxuICAgICAgICAgICAgICogQGV2ZW50IFBsdWdpbiNkZXN0cm95ZWRcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgLnRyaWdnZXIoYGRlc3Ryb3llZC5wbC4ke3BsdWdpbk5hbWV9YCk7XG4gICAgICAgIGZvcih2YXIgcHJvcCBpbiB0aGlzKXtcbiAgICAgICAgICB0aGlzW3Byb3BdID0gbnVsbDsvL2NsZWFuIHVwIHNjcmlwdCB0byBwcmVwIGZvciBnYXJiYWdlIGNvbGxlY3Rpb24uXG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogUmV0cmlldmUgbWFpbiBsYXlvdXQtYnVpbGRlciBpbnN0YW5jZS5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cbiAgICBnZXQgX2J1aWxkZXIgKCkge1xuICAgIFx0cmV0dXJuICQoJ1tkYXRhLWxheW91dGJ1aWxkZXJdJykuZmlyc3QoKS5kYXRhKCdwYXR0ZXJubGlicmFyeVBsdWdpbicpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHJpZXZlIG1haW4gbGF5b3V0LWJ1aWxkZXIgdG9vbGJhciBpbnN0YW5jZS5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cbiAgICBnZXQgX3Rvb2xiYXIgKCkge1xuICAgIFx0cmV0dXJuICQoJ1tkYXRhLWxheW91dHRvb2xiYXJdJykuZmlyc3QoKS5kYXRhKCdwYXR0ZXJubGlicmFyeVBsdWdpbicpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHJpZXZlIG1haW4gbGF5b3V0LWJ1aWxkZXIgbGF5b3V0LWJvZHkgaW5zdGFuY2UuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICovXG4gICAgZ2V0IF9ib2R5ICgpIHtcbiAgICBcdHJldHVybiAkKCdbZGF0YS1sYXlvdXRib2R5XScpLmZpcnN0KCkuZGF0YSgncGF0dGVybmxpYnJhcnlQbHVnaW4nKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBbGlhcyB0byByZXRyaWV2ZSBtYWluIGxheW91dC1idWlsZGVyIGxheW91dC1ib2R5IGluc3RhbmNlLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBzZWUgUGx1Z2luLl9ib2R5XG4gICAgICovXG4gICAgZ2V0IF9sYXlvdXRib2R5ICgpIHtcbiAgICBcdHJldHVybiB0aGlzLl9ib2R5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhpZGUgdGhlIG1haW4gcGx1Z2luIGVsZW1lbnQuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICovXG4gICAgaGlkZSgpIHtcbiAgICBcdHRoaXMuJGVsZW1lbnQuaGlkZSgpO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBTaG93IHRoZSBtYWluIHBsdWdpbiBlbGVtZW50LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuICAgIHNob3coKSB7XG4gICAgXHR0aGlzLiRlbGVtZW50LnNob3coKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBnZW5lcmF0ZSBpbml0aWFsIG1hcmt1cFxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2V0IF9tYXJrdXAoKSB7XG4gICAgXHR2YXIgaHRtbCA9IFtcbiAgICBcdFx0JzxkaXY+JyxcbiAgICBcdFx0JzwvZGl2PidcbiAgICBcdF07XG4gICAgXHRcbiAgICBcdHJldHVybiAkKGh0bWwuam9pbignJykpO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiByZXR1cm4gaW5pdGlhbCBtYXJrdXBcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cbiAgICB0b1N0cmluZygpIHtcbiAgICBcdHJldHVybiAodGhpcy5fbWFya3VwKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogcmV0dXJuIGluaXRpYWwgbWFya3VwIGVsZW1lbnRzXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICovXG4gICAgdG9FbGVtZW50KCkge1xuICAgIFx0cmV0dXJuICQodGhpcy50b1N0cmluZygpKTtcbiAgICB9XG4gICAgXG59XG4iLCIvKipcbiAqIExheW91dGJ1aWxkZXIgbW9kdWxlLlxuICogQG1vZHVsZSBwYXR0ZXJubGlicmFyeS5sYXlvdXRidWlsZGVyXG4gKiBcbiAqIEByZXF1aXJlcyBwYXR0ZXJubGlicmFyeS5QbHVnaW5cbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLlRyaWdnZXJzXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi5LZXlib2FyZFxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24uTWVkaWFRdWVyeVxuICovXG5jbGFzcyBMYXlvdXRidWlsZGVyIGV4dGVuZHMgUGx1Z2luIHtcblxuICAgIC8qKlxuICAgICAqIFNldHVwIGEgbmV3IGluc3RhbmNlIG9mIGEgbGF5b3V0YnVpbGRlci5cbiAgICAgKiBAY2xhc3NcbiAgICAgKiBAbmFtZSBMYXlvdXRidWlsZGVyXG4gICAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhIGxheW91dGJ1aWxkZXIuXG4gICAgICogICAgICAgIE9iamVjdCBzaG91bGQgYmUgb2YgdGhlIGxheW91dGJ1aWxkZXIgcGFuZWwsIHJhdGhlciB0aGFuIGl0cyBhbmNob3IuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgICAqL1xuXHRfc2V0dXAoZWxlbWVudCwgb3B0aW9ucykge1xuXHRcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0YnVpbGRlciBpbml0Jyk7XG4gICAgXHR0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIExheW91dGJ1aWxkZXIuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbGF5b3V0YnVpbGRlcic7IC8vIGllOSBiYWNrIGNvbXBhdFxuXG4gICAgICAgIC8vIFRyaWdnZXJzIGluaXQgaXMgaWRlbXBvdGVudCwganVzdCBuZWVkIHRvIG1ha2Ugc3VyZSBpdCBpcyBpbml0aWFsaXplZFxuICAgICAgICBQTEZvdW5kYXRpb24uVHJpZ2dlcnMuaW5pdCgkKTtcblxuICAgICAgICB0aGlzLl9pbml0KCk7XG5cbiAgICAgICAgLy8gKG1heWJlLCB0aGlzIGxpbmUgaXMgbm90IG5lc3Nlc3NhcnkgYW55bW9yZS4uLj8hKVxuICAgICAgICAvL1BMRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnTGF5b3V0YnVpbGRlcicpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy4kZWxlbWVudC5jaGlsZHJlbigpLmZpcnN0KCkuZm9jdXMoKTtcbiAgICAgICAgaWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRidWlsZGVyIGluaXRpYWxpemVkJyk7XG4gICAgfVxuXHRcblx0LyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIHBsdWdpbiBieSBzZXR0aW5nL2NoZWNraW5nIG9wdGlvbnMgYW5kIGF0dHJpYnV0ZXMsIGFkZGluZyBoZWxwZXIgdmFyaWFibGVzLCBhbmQgc2F2aW5nIHRoZSBhbmNob3IuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdCgpIHtcblxuICAgIFx0dGhpcy5fY2hlY2tEZWVwTGluaygpO1xuXHQgICAgdGhpcy5fZXZlbnRzKCk7XG5cblx0ICAgIHRoaXMuX2luaXRUb29sYmFyKCk7XG5cdCAgICB0aGlzLl9pbml0RG9jdW1lbnRib2R5KCk7XG5cdCAgICBcblx0ICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignaW5pdGlhbGl6ZWQucGwubGF5b3V0YnVpbGRlcicpO1xuXHQgICAgXG4gICAgfVxuICAgIFxuICAgIF9pbml0RG9jdW1lbnRib2R5ICgpIHtcbiAgICB9XG4gICAgXG4gICAgX2luaXRUb29sYmFyICgpIHtcbiAgICBcdHZhciAkdG9vbGJhcjtcbiAgICBcdGlmICggdGhpcy4kZWxlbWVudC5maW5kKCc+IFtkYXRhLWxheW91dHRvb2xiYXJdJykubGVuZ3RoID09IDAgKSB7XG4gICAgICAgICAgICBpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGJ1aWxkZXIgZ2VuZXJhdGUgdG9vbGJhcicpO1xuICAgIFx0XHR0aGlzLiRlbGVtZW50LnByZXBlbmQoTGF5b3V0dG9vbGJhci5wcm90b3R5cGUudG9FbGVtZW50KCkpO1xuICAgIFx0XHQkdG9vbGJhciA9IG5ldyBMYXlvdXR0b29sYmFyICh0aGlzLiRlbGVtZW50LmZpbmQoJz4gW2RhdGEtbGF5b3V0dG9vbGJhcl0nKS5maXJzdCgpKTtcbiAgICBcdH0gZWxzZSB7XG4gICAgXHRcdCR0b29sYmFyID0gdGhpcy5fdG9vbGJhcjtcbiAgICBcdH1cbiAgICAgICAgaWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRidWlsZGVyIHRvb2xiYXIgaW5pdGlhbGl6ZWQ6ICcsICR0b29sYmFyKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogQWRkcyBldmVudCBsaXN0ZW5lcnMgdG8gdGhlIGVsZW1lbnQgdXRpbGl6aW5nIHRoZSB0cmlnZ2VycyB1dGlsaXR5IGxpYnJhcnkuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZXZlbnRzKCkge1xuICAgICAgICB0aGlzLl9hZGRLZXlIYW5kbGVyKCk7XG4gICAgICAgIHRoaXMuX2FkZENsaWNrSGFuZGxlcigpO1xuICAgICAgICAvL3RoaXMuX2FkZEZvY3VzSGFuZGxlcigpO1xuXG4gICAgICAgICQod2luZG93KS5vbignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgdGhpcy5fc2V0TXFIYW5kbGVyLmJpbmQodGhpcykpO1xuICAgICAgICBcbiAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUucGwubGF5b3V0YnVpbGRlcicsICgpID0+IHsgaWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRidWlsZGVyIHJlc2l6ZSB0cmlnZ2VyIHRlc3QnKTsgfSk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwTGluaykge1xuICAgICAgICAgICAgJCh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIHRoaXMuX2NoZWNrRGVlcExpbmspO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBjbGljayBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSB0YWJzLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZENsaWNrSGFuZGxlcigpIHtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGNsaWNrIGhhbmRsZXJzIGZvciBpdGVtcyB3aXRoaW4gdGhlIHRhYnMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkRm9jdXNIYW5kbGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgICAgICAgIC5vZmYoJ2ZvY3VzZWQucGwubGF5b3V0ZWxlbWVudCx1bmZvY3VzZWQucGwubGF5b3V0ZWxlbWVudCcpXG4gICAgICAgICAgICAub24gKCdmb2N1c2VkLnBsLmxheW91dGVsZW1lbnQsdW5mb2N1c2VkLnBsLmxheW91dGVsZW1lbnQnLCAnW2RhdGEtbGF5b3V0cm93XSxbZGF0YS1sYXlvdXRjb2x1bW5dLFtkYXRhLWxheW91dHBhdHRlcm5dJyAsIGZ1bmN0aW9uKGUpe1xuXG4gICAgICAgICAgICBcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0YnVpbGRlciBlbGVtZW50IGZvY3VzIGhhbmRsZXI6JywgdGhpcywgZSk7XG4gICAgICAgIFx0ICAgIF90aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2ZvY3VzY2hhbmdlLnBsLmxheW91dGJ1aWxkZXInKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBfdGhpcy5zd2l0Y2hUb29sYmFyc2VjdGlvbnMuYXBwbHkoX3RoaXMsIFtlLmN1cnJlbnRUYXJnZXRdKTtcbiAgICAgICAgXHQgICAgXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMga2V5Ym9hcmQgZXZlbnQgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgdGFicy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHN3aXRjaFRvb2xiYXJzZWN0aW9ucyggZm9jdXNlZF9lbGVtZW50ICkge1xuICAgIFx0dmFyICRmb2N1cyA9ICQoZm9jdXNlZF9lbGVtZW50KTtcblxuICAgICAgICBpZiAoJGZvY3VzLmRhdGEoJ3BhdHRlcm5saWJyYXJ5UGx1Z2luJykgaW5zdGFuY2VvZiBMYXlvdXRlbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLl90b29sYmFyLnN3aXRjaFNlY3Rpb24oJGZvY3VzLmRhdGEoJ3BhdHRlcm5saWJyYXJ5UGx1Z2luJykuY2xhc3NuYW1lLCAkZm9jdXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBrZXlib2FyZCBldmVudCBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSB0YWJzLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZEtleUhhbmRsZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy4kZWxlbWVudC5jaGlsZHJlbigpLm9mZigna2V5ZG93bi5wbC5sYXlvdXRidWlsZGVyJykub24oJ2tleWRvd24ucGwubGF5b3V0YnVpbGRlcicsIGZ1bmN0aW9uKGUpe1xuXG4gICAgXHQgICAgdGhpcy5pZCA9IEdldFlvRGlnaXRzKDYsICdMYXlvdXRidWlsZGVyJyk7XG5cdCAgICBcdC8qXG5cdCAgICBcdCAqIGlnbm9yZSBUQUIga2V5XG5cdCAgICBcdCAqICBcblx0ICAgIFx0ICogY29uc3Qga2V5Q29kZXMgPSB7XG5cdCAgICBcdCAqICAgOSA6ICdUQUInLFxuXHQgICAgXHQgKiAgIDEzOiAnRU5URVInLFxuXHQgICAgXHQgKiAgIDI3OiAnRVNDQVBFJyxcblx0ICAgIFx0ICogICAzMjogJ1NQQUNFJyxcblx0ICAgIFx0ICogICAzNTogJ0VORCcsXG5cdCAgICBcdCAqICAgMzY6ICdIT01FJyxcblx0ICAgIFx0ICogICAzNzogJ0FSUk9XX0xFRlQnLFxuXHQgICAgXHQgKiAgIDM4OiAnQVJST1dfVVAnLFxuXHQgICAgXHQgKiAgIDM5OiAnQVJST1dfUklHSFQnLFxuXHQgICAgXHQgKiAgIDQwOiAnQVJST1dfRE9XTidcblx0ICAgIFx0ICogfVxuXHQgICAgIFx0ICogXG5cdCAgICBcdCAqL1xuXHQgICAgICAgIGlmIChlLndoaWNoID09PSA5KSByZXR1cm47XG5cdFxuXHQgICAgICAgIHZhciAkZWxlbWVudCA9ICQodGhpcyk7XG5cdFxuXHQgICAgICAgIC8vIGhhbmRsZSBrZXlib2FyZCBldmVudCB3aXRoIGtleWJvYXJkIHV0aWxcblx0ICAgICAgICBQTEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdMYXlvdXRidWlsZGVyJywge1xuXHQgICAgICAgICAgICBvcGVuOiBmdW5jdGlvbihldmVudCkge1xuXHQgICAgICAgICAgICBcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnb3BlbiBldmVudDonLCBlKVxuXHQgICAgICAgICAgICAgICAgX3RoaXMub3BlbigkZWxlbWVudCk7XG5cdCAgICAgICAgICAgIH0sXG5cdCAgICAgICAgICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcblx0ICAgICAgICAgICAgICAgIF90aGlzLmNsb3NlKCRlbGVtZW50KTtcblx0ICAgICAgICAgICAgfSxcblx0ICAgICAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24oKSB7XG5cdCAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXHQgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgfSk7XG5cblx0ICAgICAgICBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gcmVnaXN0ZXIga2V5Ym9hcmQga2V5cyBtYXBwaW5nXG4gICAgICAgIFBMRm91bmRhdGlvbi5LZXlib2FyZC5yZWdpc3RlcignTGF5b3V0YnVpbGRlcicsIHtcbiAgICAgICAgICAgICdFTlRFUicgICAgOiAnb3BlbicsXG4gICAgICAgICAgICAnQUxUX1NQQUNFJzogJ29wZW4nLFxuICAgICAgICAgICAgJ0VTQ0FQRScgICA6ICdjbG9zZSdcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMga2V5Ym9hcmQgZXZlbnQgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgdGFicy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRNcUhhbmRsZXIoZSkge1xuICAgIFx0aWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRidWlsZGVyIG1lZGlhIHF1ZXJ5IGNoYW5nZScpO1xuICAgICAgICAkKGRvY3VtZW50KS5mb2N1cygpO1xuICAgICAgICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmJsdXIoKTtcblx0ICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcigncmVzaXplLnBsLmxheW91dGJ1aWxkZXInKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBmb3IgYW5jaG9yL2RlZXAtbGluayBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXHRfY2hlY2tEZWVwTGluaygpIHtcblx0ICAgIHZhciBhbmNob3IgPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcblx0ICAgIFxuXHQgICAgLy9uZWVkIGEgaGFzaCBhbmQgYSByZWxldmFudCBhbmNob3Jcblx0ICAgIGlmKGFuY2hvci5sZW5ndGgpIHtcblx0ICAgIFx0Ly8gZmluZCB0aGUgYW5jaG9yL2RlZXBsaW5rIGFjdGlvblxuXHQgICAgICAgIHZhciAkbGluayA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW2hyZWYkPVwiJythbmNob3IrJ1wiXScpO1xuXHQgICAgICAgIGlmICgkbGluay5sZW5ndGgpIHtcblxuXHQgICAgICAgIFx0Ly8gLi4uYW5kIGRvIHlvdXIgc3R1ZmZcblx0ICAgICAgICBcdFxuXHQgICAgICAgICAgICAvKipcblx0ICAgICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgenBsdWdpbiBoYXMgZGVlcGxpbmtlZCBhdCBwYWdlbG9hZFxuXHQgICAgICAgICAgICAgKiBAZXZlbnQgVGFicyNkZWVwbGlua1xuXHQgICAgICAgICAgICAgKi9cblx0ICAgICAgICBcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0YnVpbGRlciBkZWVwLWxpbms6JywgYW5jaG9yKTtcblx0ICAgICAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdkZWVwbGluay5wbC5sYXlvdXRidWlsZGVyJywgWyRsaW5rLCAkKGFuY2hvcildKTtcblx0ICAgICAgICB9XG5cdCAgICB9XG5cdH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBEZXN0cm95cyB0aGUgbGF5b3V0YnVpbGRlci5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cbiAgICBfZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJy5wbC5sYXlvdXRidWlsZGVyJykuaGlkZSgpO1xuICAgICAgICB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKCkub2ZmKCcucGwubGF5b3V0YnVpbGRlcicpO1xuICAgICAgICAkKGRvY3VtZW50LmJvZHkpLm9mZignLnBsLmxheW91dGJ1aWxkZXInKTtcbiAgICAgICAgJCh3aW5kb3cpLm9mZignLnBsLmxheW91dGJ1aWxkZXInKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIG9wZW4uLi5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAYWNjZXNzIHB1YmxpY1xuICAgICAqL1xuICAgIG9wZW4oKSB7XG4gICAgXHRpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGJ1aWxkZXIgb3BlbicpO1xuXHQgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdvcGVuLnBsLmxheW91dGJ1aWxkZXInKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjbG9zZS4uLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBhY2Nlc3MgcHVibGljXG4gICAgICovXG4gICAgY2xvc2UoKSB7XG4gICAgXHRpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGJ1aWxkZXIgY2xvc2UnKTtcblx0ICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignY2xvc2UucGwubGF5b3V0YnVpbGRlcicpO1xuICAgIH1cblxufVxuXG5MYXlvdXRidWlsZGVyLmRlZmF1bHRzID0ge1xuXHRjbGFzc0NvbFByZWZpeCA6IFwiXCIsXG5cdGNsYXNzUm93ICAgICAgIDogXCJyb3dcIixcblx0Y2xhc3NTaXplcyAgICAgOiBcIlsnc21hbGwnLCdtZWRpdW0nLCdsYXJnZScsJ3hsYXJnZScsJ3h4bGFyZ2UnXVwiLFxuXHRjb2x1bW5NYXggICAgICA6IDEyXG59XG5cbnZhciBMYXlvdXRidWlsZGVyQ2xpY2tkdW1teSA9IChlKSA9PiB7XG5cdHZhciAkdGhpcyA9ICQoZS5jdXJyZW50VGFyZ2V0KS5kYXRhKCdwYXR0ZXJubGlicmFyeVBsdWdpbicpO1xuICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0dG9vbGJhcmFjdGlvbiBpdGVtIGNsaWNrZWQ6JywgZSwgJHRoaXMpO1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xufVxuLy9QTEZvdW5kYXRpb24ucGx1Z2luKExheW91dGJ1aWxkZXIsICdMYXlvdXRidWlsZGVyJyk7XG5wYXR0ZXJubGlicmFyeS5wbHVnaW4oTGF5b3V0YnVpbGRlciwgJ0xheW91dGJ1aWxkZXInKTtcblxuIiwiLyoqXG4gKiBMYXlvdXRib2R5IG1vZHVsZS5cbiAqIEBtb2R1bGUgcGF0dGVybmxpYnJhcnkubGF5b3V0Ym9keVxuICogXG4gKiBAcmVxdWlyZXMgcGF0dGVybmxpYnJhcnkuTGF5b3V0ZWxlbWVudFxuICogQHJlcXVpcmVzIHBhdHRlcm5saWJyYXJ5LlBsdWdpblxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24uVHJpZ2dlcnNcbiAqL1xuY2xhc3MgTGF5b3V0Ym9keSBleHRlbmRzIFBsdWdpbiB7XG5cbiAgICAvKipcbiAgICAgKiBTZXR1cCBhIG5ldyBpbnN0YW5jZSBvZiBhIGxheW91dGJvZHkuXG4gICAgICogQGNsYXNzXG4gICAgICogQG5hbWUgTGF5b3V0Ym9keVxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYSBsYXlvdXRib2R5LlxuICAgICAqICAgICAgICBPYmplY3Qgc2hvdWxkIGJlIG9mIHRoZSBsYXlvdXRib2R5IHBhbmVsLCByYXRoZXIgdGhhbiBpdHMgYW5jaG9yLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICAgKi9cblx0X3NldHVwKGVsZW1lbnQsIG9wdGlvbnMpIHtcblx0XHRpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGJvZHkgaW5pdCcpO1xuICAgIFx0dGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBMYXlvdXRib2R5LmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ2xheW91dGJvZHknOyAvLyBpZTkgYmFjayBjb21wYXRcblxuICAgICAgICAvLyBUcmlnZ2VycyBpbml0IGlzIGlkZW1wb3RlbnQsIGp1c3QgbmVlZCB0byBtYWtlIHN1cmUgaXQgaXMgaW5pdGlhbGl6ZWRcbiAgICAgICAgUExGb3VuZGF0aW9uLlRyaWdnZXJzLmluaXQoJCk7XG5cbiAgICAgICAgdGhpcy5faW5pdCgpO1xuXG4gICAgICAgIC8vIChtYXliZSwgdGhpcyBsaW5lIGlzIG5vdCBuZXNzZXNzYXJ5IGFueW1vcmUuLi4/ISlcbiAgICAgICAgLy9QTEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0xheW91dGJvZHknKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0Ym9keSBpbml0aWFsaXplZCcpO1xuICAgIH1cblx0XG5cdC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBwbHVnaW4gYnkgc2V0dGluZy9jaGVja2luZyBvcHRpb25zIGFuZCBhdHRyaWJ1dGVzLCBhZGRpbmcgaGVscGVyIHZhcmlhYmxlcywgYW5kIHNhdmluZyB0aGUgYW5jaG9yLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXQoKSB7XG5cdCAgICB0aGlzLl9ldmVudHMoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVycyB0byB0aGUgZWxlbWVudCB1dGlsaXppbmcgdGhlIHRyaWdnZXJzIHV0aWxpdHkgbGlicmFyeS5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9ldmVudHMoKSB7XG4gICAgXHR0aGlzLl9hZGRLZXlIYW5kbGVyKCk7XG4gICAgXHR0aGlzLl9hZGRDbGlja0hhbmRsZXIoKTtcbiAgICBcdHRoaXMuX2FkZEZ1bGxzY3JlZW5IYW5kbGVyKCk7XG4gICAgfVxuICAgIFxuICAgIF9hZGRGdWxsc2NyZWVuSGFuZGxlciAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBcdHRoaXMuJGVsZW1lbnRcblx0ICAgICAgICAub2ZmKCdmdWxsc2NyZWVuLnBsLmxheW91dGJvZHknKVxuXHQgICAgICAgIC5vbignZnVsbHNjcmVlbi5wbC5sYXlvdXRib2R5JywgZnVuY3Rpb24oZSl7XG5cdFxuXHQgICAgXHQgICAgX3RoaXMuJGVsZW1lbnQudHJpZ2dlcignZnVsbHNjcmVlbi1zd2l0Y2hlZC5wbC5sYXlvdXRib2R5Jyk7XG5cdCAgICBcdCAgICBcblx0ICAgICAgICAgICAgaWYgKCFfdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnZnVsbHNjcmVlbicpKSB7XG5cdCAgICAgICAgICAgIFx0X3RoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2Z1bGxzY3JlZW4nKTtcblx0ICAgICAgICAgICAgXHRfdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdjbGljay5wbC5sYXlvdXRib2R5Jyk7XG5cdFx0ICAgICAgICB9IGVsc2Uge1xuXHRcdCAgICAgICAgXHRfdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnZnVsbHNjcmVlbicpO1xuXHRcdCAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpO1xuICAgICAgICAgICAgICAgIFxuXHQgICAgICAgICAgICBpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGJvZHkgc3dpdGNoIGZ1bGxzY3JlZW46JywgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCwgZSk7XG5cdCAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIFxuXHQgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIF9hZGRDbGlja0hhbmRsZXIgKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgXHR0aGlzLiRlbGVtZW50XG5cdCAgICAgICAgLm9mZignY2xpY2sucGwubGF5b3V0Ym9keScpXG5cdCAgICAgICAgLm9uKCdjbGljay5wbC5sYXlvdXRib2R5JywgZnVuY3Rpb24oZSl7XG5cdCAgICAgICAgXHRcblx0ICAgICAgICBcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0Ym9keSBmb2N1c2VkOicsIHRoaXMsIGUpO1xuXHQgICAgXHQgICAgX3RoaXMuJGVsZW1lbnQudHJpZ2dlcignZm9jdXNlZC5wbC5sYXlvdXRib2R5Jyk7XG5cdCAgICBcdCAgICBcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuXHQgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIEFkZHMga2V5Ym9hcmQgZXZlbnQgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgdGFicy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRLZXlIYW5kbGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICQod2luZG93KVxuICAgICAgICAgICAgLy8ub2ZmKCdrZXlkb3duLnBsLmxheW91dGJvZHknKVxuICAgICAgICAgICAgLm9uKCdrZXlkb3duLnBsLmxheW91dGJvZHknLCBmdW5jdGlvbihlKXtcblxuICAgIFx0ICAgIHRoaXMuaWQgPSBHZXRZb0RpZ2l0cyg2LCAnTGF5b3V0Ym9keScpO1xuXHQgICAgXHQvKlxuXHQgICAgXHQgKiBpZ25vcmUgVEFCIGtleVxuXHQgICAgXHQgKiAgXG5cdCAgICBcdCAqIGNvbnN0IGtleUNvZGVzID0ge1xuXHQgICAgXHQgKiAgIDkgOiAnVEFCJyxcblx0ICAgIFx0ICogICAxMzogJ0VOVEVSJyxcblx0ICAgIFx0ICogICAyNzogJ0VTQ0FQRScsXG5cdCAgICBcdCAqICAgMzI6ICdTUEFDRScsXG5cdCAgICBcdCAqICAgMzU6ICdFTkQnLFxuXHQgICAgXHQgKiAgIDM2OiAnSE9NRScsXG5cdCAgICBcdCAqICAgMzc6ICdBUlJPV19MRUZUJyxcblx0ICAgIFx0ICogICAzODogJ0FSUk9XX1VQJyxcblx0ICAgIFx0ICogICAzOTogJ0FSUk9XX1JJR0hUJyxcblx0ICAgIFx0ICogICA0MDogJ0FSUk9XX0RPV04nXG5cdCAgICBcdCAqIH1cblx0ICAgICBcdCAqIFxuXHQgICAgXHQgKi9cblx0ICAgICAgICBpZiAoZS53aGljaCA9PT0gOSkgcmV0dXJuO1xuXHRcblx0ICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKHRoaXMpO1xuXHRcblx0ICAgICAgICAvLyBoYW5kbGUga2V5Ym9hcmQgZXZlbnQgd2l0aCBrZXlib2FyZCB1dGlsXG5cdCAgICAgICAgUExGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnTGF5b3V0Ym9keScsIHtcblx0ICAgICAgICBcdHN3aXRjaDogZnVuY3Rpb24oKSB7XG5cdCAgICAgICAgICAgICAgICBfdGhpcy5zd2l0Y2hGdWxsc2NyZWVuKCk7XG5cdCAgICAgICAgICAgICAgICBcblx0ICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdCAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cdCAgICAgICAgICAgIH0sXG5cdCAgICAgICAgICAgIGhhbmRsZWQ6IGZ1bmN0aW9uKCkge1xuXHQgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblx0ICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgIH0pO1xuXG5cdCAgICAgICAgXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHJlZ2lzdGVyIGtleWJvYXJkIGtleXMgbWFwcGluZ1xuICAgICAgICBQTEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ0xheW91dGJvZHknLCB7XG4gICAgICAgICAgICAnRVNDQVBFJyAgICAgOiAnc3dpdGNoJyxcbiAgICAgICAgICAgICdDVFJMX0FMVF9GJyA6ICdzd2l0Y2gnLFxuICAgICAgICAgICAgJ0FMVF9DVFJMX0YnIDogJ3N3aXRjaCdcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZXMgbGF5b3V0LWJvZHkncyBmdWxsc2NyZWVuIGRpc3BsYXlcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHN3aXRjaEZ1bGxzY3JlZW4oKSB7XG4gICAgICAgIC8qaWYgKCF0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdmdWxsc2NyZWVuJykpIHtcbiAgICAgICAgXHR0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdmdWxsc2NyZWVuJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgIFx0dGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnZnVsbHNjcmVlbicpO1xuICAgICAgICB9Ki9cblxuICAgIFx0aWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRib2R5IHN3aXRjaCBmdWxsc2NyZWVuJyk7XG5cdCAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2Z1bGxzY3JlZW4ucGwubGF5b3V0Ym9keScpO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBEZXN0cm95cyB0aGUgbGF5b3V0Ym9keS5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cbiAgICBfZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCcqJykub2ZmKCcucGwubGF5b3V0Ym9keScpO1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZignLnBsLmxheW91dGJvZHknKTtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmUoKTtcbiAgICB9XG5cdFx0XG59XG5cbi8vUExGb3VuZGF0aW9uLnBsdWdpbihMYXlvdXRib2R5LCAnTGF5b3V0Ym9keScpO1xucGF0dGVybmxpYnJhcnkucGx1Z2luKExheW91dGJvZHksICdMYXlvdXRib2R5Jyk7XG5cbiIsIi8qKlxuICogTGF5b3V0dG9vbGJhcnNlY3Rpb25CdWlsZGVyIG1vZHVsZS5cbiAqIFxuICogQG1vZHVsZSBwYXR0ZXJubGlicmFyeS5MYXlvdXR0b29sYmFyc2VjdGlvbkJ1aWxkZXJcbiAqIFxuICogQHJlcXVpcmVzIHBhdHRlcm5saWJyYXJ5LkxheW91dHRvb2xiYXJzZWN0aW9uXG4gKi9cbnZhciBMYXlvdXR0b29sYmFyc2VjdGlvbkJ1aWxkZXIgPSB7XG5cdG5hbWUgIDogJ2J1aWxkZXInLFxuXHRpdGVtcyA6IFtcblx0XHR7XG5cdFx0XHR0eXBlICA6ICdhY3Rpb24nLFxuXHRcdFx0bGFiZWwgOiAnbG9hZCBsYXlvdXQnLFxuXHRcdFx0YWN0aW9uOiAnI2xvYWRfbGF5b3V0Jyxcblx0XHRcdGljb24gIDogJ2ZhIGZhLWZvbGRlci1vcGVuJ1xuXHRcdH0sXG5cdFx0e1xuXHRcdFx0dHlwZSAgOiAnYWN0aW9uJyxcblx0XHRcdGxhYmVsIDogJ3NhdmUgbGF5b3V0Jyxcblx0XHRcdGFjdGlvbjogJyNsb2FkX2xheW91dCcsXG5cdFx0XHRpY29uICA6ICdmYSBmYS1zYXZlJ1xuXHRcdH0sXG5cdFx0eyAgIHR5cGUgIDogJ3NlcGFyYXRvcicgfSxcblx0XHR7XG5cdFx0XHR0eXBlICA6ICdhY3Rpb24nLFxuXHRcdFx0bGFiZWwgOiAnc2hvdyBzb3VyY2UnLFxuXHRcdFx0YWN0aW9uOiAnI3Nob3dfc291cmNlJyxcblx0XHRcdGljb24gIDogJ2ZhIGZhLWNvZGUnXG5cdFx0fSxcblx0XHR7ICAgdHlwZSAgOiAnc2VwYXJhdG9yJyB9LFxuXHRcdHtcblx0XHRcdHR5cGUgIDogJ2FjdGlvbicsXG5cdFx0XHRsYWJlbCA6ICdzd2l0Y2ggZnVsbHNjcmVlbicsXG5cdFx0XHRhY3Rpb246ICcjc3dpdGNoX2Z1bGxzY3JlZW4nLFxuXHRcdFx0aWNvbiAgOiAnZmEgZmEtdHYnLFxuXHRcdFx0ZXZlbnRzOiB7XG5cdFx0XHQgICAgY2xpY2sgOiAoZSkgPT4ge1xuXHRcdFx0ICAgIFx0Ly92YXIgJGxheW91dGJvZHkgPSAkKCdbZGF0YS1sYXlvdXRib2R5XScpO1xuXHRcdFx0ICAgIFx0dmFyICR0aGlzID0gJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ3BhdHRlcm5saWJyYXJ5UGx1Z2luJyk7XG5cdFx0XHQgICAgICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0dG9vbGJhcmFjdGlvbiBmdWxsc2NyZWVuIHN3aXRjaCBjbGlja2VkOicsIGUsICR0aGlzKTtcblx0XHRcdCAgICBcdC8vJGxheW91dGJvZHkuZGF0YSgncGF0dGVybmxpYnJhcnlQbHVnaW4nKS5zd2l0Y2hGdWxsc2NyZWVuKCk7XG5cdFx0XHQgICAgXHQkdGhpcy5fbGF5b3V0Ym9keS5zd2l0Y2hGdWxsc2NyZWVuKCk7XG5cdFx0ICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHQgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHQgICAgICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0dG9vbGJhcmFjdGlvbiBmdWxsc2NyZWVuIHN3aXRjaCBjbGljaycpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR7ICAgdHlwZSAgOiAnc2VwYXJhdG9yJyB9LFxuXHRcdHtcblx0XHRcdHR5cGUgIDogJ2FjdGlvbicsXG5cdFx0XHRsYWJlbCA6ICdlZGl0IHNldHRpbmdzJyxcblx0XHRcdGFjdGlvbjogJyNlZGl0X3NldHRpbmdzJyxcblx0XHRcdGljb24gIDogJ2ZhIGZhLWNvZ3MnXG5cdFx0fVxuXHRdXG59O1xuIiwiLyoqXG4gKiBMYXlvdXR0b29sYmFyc2VjdGlvbkxheW91dGNvbHVtbiBtb2R1bGUuXG4gKiBcbiAqIEBtb2R1bGUgcGF0dGVybmxpYnJhcnkuTGF5b3V0dG9vbGJhcnNlY3Rpb25MYXlvdXRjb2x1bW5cbiAqIFxuICogQHJlcXVpcmVzIHBhdHRlcm5saWJyYXJ5LkxheW91dHRvb2xiYXJzZWN0aW9uXG4gKi9cbnZhciBMYXlvdXR0b29sYmFyc2VjdGlvbkxheW91dGNvbHVtbiA9IHtcblx0bmFtZSAgOiAnbGF5b3V0Y29sdW1uJyxcblx0aXRlbXMgOiBbXG5cdFx0Lyp7XG5cdFx0XHR0eXBlICA6ICdhY3Rpb24nLFxuXHRcdFx0bGFiZWwgOiAnbW92ZSBlbGVtZW50Jyxcblx0XHRcdGFjdGlvbjogJyNtb3ZlX2VsZW1lbnQnLFxuXHRcdFx0aWNvbiAgOiAnZmEgZmEtYmFycyBmYS1yb3RhdGUtOTAnLFxuXHRcdFx0ZXZlbnRzOiB7XG5cdFx0XHQgICAgY2xpY2sgOiBMYXlvdXRidWlsZGVyQ2xpY2tkdW1teVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0eyAgIHR5cGUgIDogJ3NlcGFyYXRvcicgfSwqL1xuXHRcdHtcblx0XHRcdHR5cGUgIDogJ2FjdGlvbicsXG5cdFx0XHRsYWJlbCA6ICdhZGQgY29sdW1uJyxcblx0XHRcdGFjdGlvbjogJyNhZGRfY29sdW1uJyxcblx0XHRcdGljb24gIDogJ2ZhIGZhLXBsdXMnLFxuXHRcdFx0ZXZlbnRzOiB7XG5cdFx0XHQgICAgY2xpY2sgOiBMYXlvdXRidWlsZGVyQ2xpY2tkdW1teVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0dHlwZSAgOiAnYWN0aW9uJyxcblx0XHRcdGxhYmVsIDogJ3JlbW92ZSByb3cnLFxuXHRcdFx0YWN0aW9uOiAnI3JlbW92ZV9yb3cnLFxuXHRcdFx0aWNvbiAgOiAnZmEgZmEtbWludXMnLFxuXHRcdFx0ZXZlbnRzOiB7XG5cdFx0XHQgICAgY2xpY2sgOiBMYXlvdXRidWlsZGVyQ2xpY2tkdW1teVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0eyAgIHR5cGUgIDogJ3NlcGFyYXRvcicgfSxcblx0XHR7XG5cdFx0XHR0eXBlICA6ICdhY3Rpb24nLFxuXHRcdFx0bGFiZWwgOiAnYWRkIHBhdHRlcm4nLFxuXHRcdFx0YWN0aW9uOiAnI2FkZF9wYXR0ZXJuJyxcblx0XHRcdGljb24gIDogJ2ZhIGZhLXB1enpsZS1waWVjZScsXG5cdFx0XHRldmVudHM6IHtcblx0XHRcdCAgICBjbGljayA6IExheW91dGJ1aWxkZXJDbGlja2R1bW15XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR7ICAgdHlwZSAgOiAnc2VwYXJhdG9yJyB9LFxuXHRcdHtcblx0XHRcdHR5cGUgIDogJ2FjdGlvbicsXG5cdFx0XHRsYWJlbCA6ICdlZGl0IHNldHRpbmdzJyxcblx0XHRcdGFjdGlvbjogJyNlZGl0X3NldHRpbmdzJyxcblx0XHRcdGljb24gIDogJ2ZhIGZhLWNvZ3MnLFxuXHRcdFx0ZXZlbnRzOiB7XG5cdFx0XHQgICAgY2xpY2sgOiBMYXlvdXRidWlsZGVyQ2xpY2tkdW1teVxuXHRcdFx0fVxuXHRcdH1cblx0XVxufTtcbiIsIi8qKlxuICogTGF5b3V0dG9vbGJhcnNlY3Rpb25MYXlvdXRyb3cgbW9kdWxlLlxuICogXG4gKiBAbW9kdWxlIHBhdHRlcm5saWJyYXJ5LkxheW91dHRvb2xiYXJzZWN0aW9uTGF5b3V0cm93XG4gKiBcbiAqIEByZXF1aXJlcyBwYXR0ZXJubGlicmFyeS5MYXlvdXR0b29sYmFyc2VjdGlvblxuICovXG52YXIgTGF5b3V0dG9vbGJhcnNlY3Rpb25MYXlvdXRyb3cgPSB7XG5cdG5hbWUgIDogJ2xheW91dHJvdycsXG5cdGl0ZW1zIDogW1xuXHRcdC8qe1xuXHRcdFx0dHlwZSAgOiAnYWN0aW9uJyxcblx0XHRcdGxhYmVsIDogJ21vdmUgZWxlbWVudCcsXG5cdFx0XHRhY3Rpb246ICcjbW92ZV9lbGVtZW50Jyxcblx0XHRcdGljb24gIDogJ2ZhIGZhLWJhcnMnLFxuXHRcdFx0ZXZlbnRzOiB7XG5cdFx0XHQgICAgY2xpY2sgOiBMYXlvdXRidWlsZGVyQ2xpY2tkdW1teVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0eyAgIHR5cGUgIDogJ3NlcGFyYXRvcicgfSwqL1xuXHRcdHtcblx0XHRcdHR5cGUgIDogJ2FjdGlvbicsXG5cdFx0XHRsYWJlbCA6ICdhZGQgY29sdW1uJyxcblx0XHRcdGFjdGlvbjogJyNhZGRfY29sdW1uJyxcblx0XHRcdGljb24gIDogJ2ZhIGZhLXBsdXMnLFxuXHRcdFx0ZXZlbnRzOiB7XG5cdFx0XHQgICAgY2xpY2sgOiBMYXlvdXRidWlsZGVyQ2xpY2tkdW1teVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0dHlwZSAgOiAnYWN0aW9uJyxcblx0XHRcdGxhYmVsIDogJ3JlbW92ZSByb3cnLFxuXHRcdFx0YWN0aW9uOiAnI3JlbW92ZV9yb3cnLFxuXHRcdFx0aWNvbiAgOiAnZmEgZmEtbWludXMnLFxuXHRcdFx0ZXZlbnRzOiB7XG5cdFx0XHQgICAgY2xpY2sgOiBMYXlvdXRidWlsZGVyQ2xpY2tkdW1teVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0eyAgIHR5cGUgIDogJ3NlcGFyYXRvcicgfSxcblx0XHR7XG5cdFx0XHR0eXBlICA6ICdhY3Rpb24nLFxuXHRcdFx0bGFiZWwgOiAnZWRpdCBzZXR0aW5ncycsXG5cdFx0XHRhY3Rpb246ICcjZWRpdF9zZXR0aW5ncycsXG5cdFx0XHRpY29uICA6ICdmYSBmYS1jb2dzJyxcblx0XHRcdGV2ZW50czoge1xuXHRcdFx0ICAgIGNsaWNrIDogTGF5b3V0YnVpbGRlckNsaWNrZHVtbXlcblx0XHRcdH1cblx0XHR9XG5cdF1cbn07XG5cbiIsIi8qKlxuICogTGF5b3V0dG9vbGJhcnNlY3Rpb25QYXR0ZXJuIG1vZHVsZS5cbiAqIFxuICogQG1vZHVsZSBwYXR0ZXJubGlicmFyeS5MYXlvdXR0b29sYmFyc2VjdGlvblBhdHRlcm5cbiAqIFxuICogQHJlcXVpcmVzIHBhdHRlcm5saWJyYXJ5LkxheW91dHRvb2xiYXJzZWN0aW9uXG4gKi9cbnZhciBMYXlvdXR0b29sYmFyc2VjdGlvblBhdHRlcm4gPSB7XG5cdG5hbWUgIDogJ3BhdHRlcm4nLFxuXHRpdGVtcyA6IFtcblx0XHQvKntcblx0XHRcdHR5cGUgIDogJ2FjdGlvbicsXG5cdFx0XHRsYWJlbCA6ICdtb3ZlIGVsZW1lbnQnLFxuXHRcdFx0YWN0aW9uOiAnI21vdmVfZWxlbWVudCcsXG5cdFx0XHRpY29uICA6ICdmYSBmYS1iYXJzJyxcblx0XHRcdGV2ZW50czoge1xuXHRcdFx0ICAgIGNsaWNrIDogTGF5b3V0YnVpbGRlckNsaWNrZHVtbXlcblx0XHRcdH1cblx0XHR9LFxuXHRcdHsgICB0eXBlICA6ICdzZXBhcmF0b3InIH0sKi9cblx0XHR7XG5cdFx0XHR0eXBlICA6ICdhY3Rpb24nLFxuXHRcdFx0bGFiZWwgOiAndmlldyBwYXR0ZXJuIGRvYycsXG5cdFx0XHRhY3Rpb246ICcjdmlld19wYXR0ZXJuX2RvYycsXG5cdFx0XHRpY29uICA6ICdmYSBmYS1pbmZvJyxcblx0XHRcdGV2ZW50czoge1xuXHRcdFx0ICAgIGNsaWNrIDogTGF5b3V0YnVpbGRlckNsaWNrZHVtbXlcblx0XHRcdH1cblx0XHR9LFxuXHRcdHtcblx0XHRcdHR5cGUgIDogJ2FjdGlvbicsXG5cdFx0XHRsYWJlbCA6ICdlZGl0IHBhdHRlcm4nLFxuXHRcdFx0YWN0aW9uOiAnI2VkaXRfcGF0dGVybicsXG5cdFx0XHRpY29uICA6ICdmYSBmYS1lZGl0Jyxcblx0XHRcdGV2ZW50czoge1xuXHRcdFx0ICAgIGNsaWNrIDogTGF5b3V0YnVpbGRlckNsaWNrZHVtbXlcblx0XHRcdH1cblx0XHR9LFxuXHRcdHtcblx0XHRcdHR5cGUgIDogJ2FjdGlvbicsXG5cdFx0XHRsYWJlbCA6ICdyZW1vdmUgcGF0dGVybicsXG5cdFx0XHRhY3Rpb246ICcjcmVtb3ZlX3BhdHRlcm4nLFxuXHRcdFx0aWNvbiAgOiAnZmEgZmEtbWludXMnLFxuXHRcdFx0ZXZlbnRzOiB7XG5cdFx0XHQgICAgY2xpY2sgOiBMYXlvdXRidWlsZGVyQ2xpY2tkdW1teVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0eyAgIHR5cGUgIDogJ3NlcGFyYXRvcicgfSxcblx0XHR7XG5cdFx0XHR0eXBlICA6ICdhY3Rpb24nLFxuXHRcdFx0bGFiZWwgOiAncGF0dGVybiBzZXR0aW5ncycsXG5cdFx0XHRhY3Rpb246ICcjcGF0dGVybl9zZXR0aW5ncycsXG5cdFx0XHRpY29uICA6ICdmYSBmYS1jb2dzJyxcblx0XHRcdGV2ZW50czoge1xuXHRcdFx0ICAgIGNsaWNrIDogTGF5b3V0YnVpbGRlckNsaWNrZHVtbXlcblx0XHRcdH1cblx0XHR9XG5cdF1cbn07XG5cbiIsIi8qKlxuICogTGF5b3V0dG9vbGJhciBtb2R1bGUuXG4gKiBAbW9kdWxlIHBsZm91bmRhdGlvbi5sYXlvdXR0b29sYmFyXG4gKiBcbiAqIEByZXF1aXJlcyBwYXR0ZXJubGlicmFyeS5QbHVnaW5cbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLlRyaWdnZXJzXG4gKi9cbmNsYXNzIExheW91dHRvb2xiYXIgZXh0ZW5kcyBQbHVnaW4ge1xuXG4gICAgLyoqXG4gICAgICogU2V0dXAgYSBuZXcgaW5zdGFuY2Ugb2YgYSBsYXlvdXR0b29sYmFyLlxuICAgICAqIEBjbGFzc1xuICAgICAqIEBuYW1lIExheW91dHRvb2xiYXJcbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGEgbGF5b3V0dG9vbGJhci5cbiAgICAgKiAgICAgICAgT2JqZWN0IHNob3VsZCBiZSBvZiB0aGUgbGF5b3V0dG9vbGJhciBwYW5lbCwgcmF0aGVyIHRoYW4gaXRzIGFuY2hvci5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAgICovXG5cdF9zZXR1cChlbGVtZW50LCBvcHRpb25zKSB7XG5cdFx0aWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXR0b29sYmFyIGluaXQnKTtcbiAgICBcdHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgTGF5b3V0dG9vbGJhci5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICdsYXlvdXR0b29sYmFyJzsgLy8gaWU5IGJhY2sgY29tcGF0XG5cbiAgICAgICAgLy8gVHJpZ2dlcnMgaW5pdCBpcyBpZGVtcG90ZW50LCBqdXN0IG5lZWQgdG8gbWFrZSBzdXJlIGl0IGlzIGluaXRpYWxpemVkXG4gICAgICAgIFBMRm91bmRhdGlvbi5UcmlnZ2Vycy5pbml0KCQpO1xuXG4gICAgICAgIHRoaXMuX2luaXQoKTtcblxuICAgICAgICAvLyAobWF5YmUsIHRoaXMgbGluZSBpcyBub3QgbmVzc2Vzc2FyeSBhbnltb3JlLi4uPyEpXG4gICAgICAgIC8vUExGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdMYXlvdXR0b29sYmFyJyk7XG4gICAgICAgIFxuICAgICAgICBpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dHRvb2xiYXIgaW5pdGlhbGl6ZWQnKTtcbiAgICB9XG5cdFxuXHQvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgcGx1Z2luIGJ5IHNldHRpbmcvY2hlY2tpbmcgb3B0aW9ucyBhbmQgYXR0cmlidXRlcywgYWRkaW5nIGhlbHBlciB2YXJpYWJsZXMsIGFuZCBzYXZpbmcgdGhlIGFuY2hvci5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0KCkge1xuXHQgICAgdGhpcy5fZXZlbnRzKCk7XG5cdCAgICB0aGlzLmhpZGVTZWN0aW9ucygpO1xuXHQgICAgaWYgKHRoaXMuJGVsZW1lbnQpIHtcblx0ICAgIFx0dGhpcy4kZWxlbWVudC50cmlnZ2VyKCdpbml0aWFsaXplZC5wbC5sYXlvdXR0b29sYmFyJyk7XG5cdCAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBldmVudCBsaXN0ZW5lcnMgdG8gdGhlIGVsZW1lbnQgdXRpbGl6aW5nIHRoZSB0cmlnZ2VycyB1dGlsaXR5IGxpYnJhcnkuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZXZlbnRzKCkge1xuICAgIFx0dGhpcy5fYWRkSW5pdEhhbmRsZXIoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGluaXRpYWx6YXRpb24gZXZlbnQgbGlzdGVuZXJzXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkSW5pdEhhbmRsZXIoKSB7XG4gICAgXHR2YXIgJHRoaXMgPSB0aGlzO1xuICAgIFx0dGhpcy4kZWxlbWVudFxuICAgIFx0ICAgIC5vZmYoJ2luaXRpYWxpemVkLnBsLmxheW91dHRvb2xiYXInKVxuICAgIFx0ICAgIC5vbignaW5pdGlhbGl6ZWQucGwubGF5b3V0dG9vbGJhcicsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgXHQgICAgXHQkdGhpcy5faW5pdFNlY3Rpb25zLmFwcGx5KCR0aGlzKTtcbiAgICBcdCAgICB9KTtcbiAgICB9XG5cblx0LyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIHRvb2xiYXIgc2VjdGlvbnMgZ2l2ZW4gYnkgY29uZmlnXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdFNlY3Rpb25zKCkge1xuICAgICAgICBpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dHRvb2xiYXIgaW5pdGlhbGl6ZSBzZWN0aW9uJywgdGhpcy5vcHRpb25zLnNlY3Rpb25zKTtcbiAgICBcdHZhciAkdGhpcyA9IHRoaXM7XG4gICAgXHQkKHRoaXMub3B0aW9ucy5zZWN0aW9ucykuZWFjaCgoaWR4LCBzZWN0aW9uY29uZmlnKSA9PiB7XG4gICAgICAgICAgICBpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dHRvb2xiYXIgaW5pdCBzZWN0aW9uJywgc2VjdGlvbmNvbmZpZyk7XG4gICAgXHRcdGlmICggJHRoaXMuJGVsZW1lbnQuZmluZChgPiBbcmVsPVwiJHtzZWN0aW9uY29uZmlnLm5hbWV9XCJdYCkubGVuZ3RoID09IDAgKSB7XG4gICAgXHRcdFx0JHRoaXMuX2luaXRTZWN0aW9uKHNlY3Rpb25jb25maWcpO1xuICAgIFx0XHR9XG4gICAgXHR9KVxuICAgIH1cblxuXHQvKipcbiAgICAgKiBJbml0aWFsaXplcyBhIHNpbmdsZSBuZXcgdG9vbGJhciBzZWN0aW9uc1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXRTZWN0aW9uKHNlY3Rpb25jb25maWcpIHtcbiAgICAgICAgaWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXR0b29sYmFyIGluaXRpYWxpemUgc2VjdGlvbicsIHNlY3Rpb25jb25maWcpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy4kZWxlbWVudC5wcmVwZW5kKExheW91dHRvb2xiYXJzZWN0aW9uLnByb3RvdHlwZS50b0VsZW1lbnQoc2VjdGlvbmNvbmZpZykpO1xuICAgICAgICB2YXIgJHNlY3Rpb24gPSBuZXcgTGF5b3V0dG9vbGJhcnNlY3Rpb24gKFxuICAgICAgICBcdHRoaXMuJGVsZW1lbnQuZmluZChgPiBbcmVsPVwiJHtzZWN0aW9uY29uZmlnLm5hbWV9XCJdYCksXG4gICAgICAgIFx0c2VjdGlvbmNvbmZpZ1xuICAgICAgICApO1xuICAgICAgICAvLyRzZWN0aW9uLiRlbGVtZW50LmNoaWxkcmVuKCkuZmlyc3QoKS5wbGZvdW5kYXRpb24oKTsvL3BhdHRlcm5saWJyYXJ5KCk7XG4gICAgICAgICRzZWN0aW9uLiRlbGVtZW50LnRyaWdnZXIoJ2luaXRpYWxpemVkJyk7XG4gICAgICAgIFxuICAgICAgICBpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dHRvb2xiYXIgc2VjdGlvbiBpbml0aWFsaXplZDogJywgJHNlY3Rpb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHJpZXZlIGFsbCB0b29sYmFyIHNlY3Rpb25zXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXQgX3NlY3Rpb25zICgpIHtcbiAgICBcdHJldHVybiB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLWxheW91dHRvb2xiYXJzZWN0aW9uXScpLm1hcCgoaWR4LCBlbGVtKSA9PiB7IFxuICAgIFx0XHRyZXR1cm4gJChlbGVtKS5kYXRhKCdwYXR0ZXJubGlicmFyeVBsdWdpbicpXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHJpZXZlIGEgdG9vbGJhciBzZWN0aW9uIGJ5IG5hbWVcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cbiAgICBzZWN0aW9uIChuYW1lKSB7XG4gICAgXHR2YXIgJHNlY3Rpb247XG4gICAgXHRcbiAgICAgICAgJCh0aGlzLl9zZWN0aW9ucykuZWFjaCgoaWR4LCBfc2VjdGlvbikgPT4ge1xuICAgICAgICBcdGlmIChfc2VjdGlvbi4kZWxlbWVudCAmJiBfc2VjdGlvbi4kZWxlbWVudC5hdHRyKCdyZWwnKSA9PSBuYW1lKSB7XG4gICAgICAgIFx0XHQkc2VjdGlvbiA9IF9zZWN0aW9uO1xuICAgICAgICBcdH1cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gKCRzZWN0aW9uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZXRyaWV2ZSBidWlsZGVyJ3MgdG9vbGJhciBzZWN0aW9uXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXQgX2J1aWxkZXJTZWN0aW9uICgpIHtcbiAgICBcdHZhciBidWlsZGVyU2VjdGlvbiA9IG51bGw7XG4gICAgXHR0aGlzLl9zZWN0aW9ucy5lYWNoKChpZHgsIHNlY3Rpb24pID0+IHsgIFxuICAgIFx0XHRpZiAoc2VjdGlvbi4kZWxlbWVudC5hdHRyKCdyZWwnKSA9PSAnYnVpbGRlcicpIHtcbiAgICBcdFx0XHRidWlsZGVyU2VjdGlvbiA9IHNlY3Rpb247XG4gICAgXHRcdFx0cmV0dXJuIChmYWxzZSk7XG4gICAgXHRcdH1cbiAgICBcdH0pO1xuICAgIFx0cmV0dXJuIGJ1aWxkZXJTZWN0aW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGhpZGUgYWxsIHRvb2xiYXIgc2VjdGlvbnNcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cbiAgICBoaWRlU2VjdGlvbnMgKCkge1xuICAgIFx0dmFyIHNlY3Rpb25zID0gdGhpcy5fc2VjdGlvbnM7XG4gICAgXHRzZWN0aW9ucy5lYWNoKChpZHgsIHNlY3Rpb24pID0+IHsgc2VjdGlvbi5oaWRlKCk7IH0pO1xuICAgIFx0aWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nICgnYnVpbGRlcjonLCB0aGlzLl9idWlsZGVyU2VjdGlvbiApO1xuXHQgICAgLy90aGlzLl9idWlsZGVyU2VjdGlvbi5zaG93KCk7XG4gICAgXHRzZWN0aW9ucy5lYWNoKChpZHgsIHNlY3Rpb24pID0+IHtcbiAgICBcdFx0aWYgKHNlY3Rpb24uJGVsZW1lbnQuYXR0cigncmVsJykgPT0gJ2J1aWxkZXInKSB7XG4gICAgXHRcdFx0c2VjdGlvbi5zaG93KCk7XG4gICAgXHRcdH1cbiAgICBcdH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHN3aXRjaCB0b29sYmFyIHNlY3Rpb25zIGFjY29yZGluZyB0byBmb2N1c2VkIGVsZW1lbnRcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cbiAgICBzd2l0Y2hTZWN0aW9uIChuYW1lLCByZWZlcmVuY2UpIHtcbiAgICBcdHZhciBzZWN0aW9ucyA9IHRoaXMuX3NlY3Rpb25zO1xuICAgIFx0c2VjdGlvbnMuZWFjaCgoaWR4LCBzZWN0aW9uKSA9PiB7XG4gICAgXHRcdHZhciAkc2VjdGlvbiA9ICQoc2VjdGlvbik7XG5cbiAgICBcdFx0aWYgKHNlY3Rpb24uJGVsZW1lbnQuYXR0cigncmVsJykgIT0gJ2J1aWxkZXInKSB7XG5cdCAgICBcdFx0aWYgKHNlY3Rpb24uJGVsZW1lbnQuYXR0cigncmVsJykgPT0gbmFtZSkge1xuXHQgICAgXHRcdFx0c2VjdGlvbi5zaG93KCk7XG5cdCAgICBcdFx0fSBlbHNlIHtcblx0ICAgIFx0XHRcdHNlY3Rpb24uaGlkZSgpOyBcblx0ICAgIFx0XHR9XG4gICAgXHRcdH1cbiAgICBcdH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGdlbmVyYXRlIGluaXRpYWwgbWFya3VwXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXQgX21hcmt1cCgpIHtcbiAgICBcdHZhciBodG1sID0gW1xuICAgIFx0XHQnPGRpdiBkYXRhLWxheW91dHRvb2xiYXIgY2xhc3M9XCJ0b29sYmFyXCI+JyxcbiAgICBcdFx0JzwvZGl2PidcbiAgICBcdF07XG4gICAgXHRcbiAgICBcdHJldHVybiAkKGh0bWwuam9pbignJykpO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBEZXN0cm95cyB0aGUgbGF5b3V0dG9vbGJhcidzIHNlY3Rpb25zLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Rlc3Ryb3lTZWN0aW9ucygpIHtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogRGVzdHJveXMgdGhlIGxheW91dHRvb2xiYXIuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCcqJykub2ZmKCcucGwubGF5b3V0dG9vbGJhcicpO1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZignLnBsLmxheW91dHRvb2xiYXInKTtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmUoKTtcbiAgICB9XG5cdFxufVxuXG5MYXlvdXR0b29sYmFyLmRlZmF1bHRzID0ge1xuXHRzZWN0aW9uczogW1xuXHRcdExheW91dHRvb2xiYXJzZWN0aW9uQnVpbGRlcixcblx0XHRMYXlvdXR0b29sYmFyc2VjdGlvbkxheW91dHJvdyxcblx0XHRMYXlvdXR0b29sYmFyc2VjdGlvbkxheW91dGNvbHVtbixcblx0XHRMYXlvdXR0b29sYmFyc2VjdGlvblBhdHRlcm5cblx0XVxufTtcblxuLy9QTEZvdW5kYXRpb24ucGx1Z2luKExheW91dHRvb2xiYXIsICdMYXlvdXR0b29sYmFyJyk7XG5wYXR0ZXJubGlicmFyeS5wbHVnaW4oTGF5b3V0dG9vbGJhciwgJ0xheW91dHRvb2xiYXInKTtcblxuaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJykge1xuXHQvLyByZXF1aXJlL0FNRCBtb2R1bGUgZGVmaW5pdGlvblxuXHRkZWZpbmUoW10sIChyZXF1aXJlLCBleHBvcnRzLCBtb2R1bGUpID0+IHtcblx0XHRyZXR1cm4gTGF5b3V0dG9vbGJhcjtcblx0fSk7XG59IiwiLyoqXG4gKiBMYXlvdXRlbGVtZW50IG1vZHVsZS5cbiAqIEBtb2R1bGUgcGxmb3VuZGF0aW9uLmxheW91dGVsZW1lbnRcbiAqIFxuICogQHJlcXVpcmVzIHBsZm91bmRhdGlvbi5QbHVnaW5cbiAqIEByZXF1aXJlcyBwbGZvdW5kYXRpb24uS2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBwbGZvdW5kYXRpb24uTWVkaWFRdWVyeVxuICovXG5jbGFzcyBMYXlvdXRlbGVtZW50IGV4dGVuZHMgUGx1Z2luIHtcblxuICAgIC8qKlxuICAgICAqIFNldHVwIGEgbmV3IGluc3RhbmNlIG9mIGEgbGF5b3V0ZWxlbWVudC5cbiAgICAgKiBAY2xhc3NcbiAgICAgKiBAbmFtZSBMYXlvdXRlbGVtZW50XG4gICAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhIGxheW91dGVsZW1lbnQuXG4gICAgICogICAgICAgIE9iamVjdCBzaG91bGQgYmUgb2YgdGhlIGxheW91dGVsZW1lbnQgcGFuZWwsIHJhdGhlciB0aGFuIGl0cyBhbmNob3IuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgICAqL1xuXHRfc2V0dXAoZWxlbWVudCwgb3B0aW9ucykge1xuXHRcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0ZWxlbWVudCBpbml0Jyk7XG4gICAgXHR0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIExheW91dGVsZW1lbnQuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbGF5b3V0ZWxlbWVudCc7IC8vIGllOSBiYWNrIGNvbXBhdFxuXG4gICAgICAgIC8vIFRyaWdnZXJzIGluaXQgaXMgaWRlbXBvdGVudCwganVzdCBuZWVkIHRvIG1ha2Ugc3VyZSBpdCBpcyBpbml0aWFsaXplZFxuICAgICAgICBQTEZvdW5kYXRpb24uVHJpZ2dlcnMuaW5pdCgkKTtcblxuICAgICAgICB0aGlzLl9pbml0KCk7XG5cbiAgICAgICAgLy8gKG1heWJlLCB0aGlzIGxpbmUgaXMgbm90IG5lc3Nlc3NhcnkgYW55bW9yZS4uLj8hKVxuICAgICAgICAvL1BMRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnTGF5b3V0ZWxlbWVudCcpO1xuICAgICAgICBcbiAgICAgICAgaWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRlbGVtZW50IGluaXRpYWxpemVkJyk7XG4gICAgfVxuXHRcblx0LyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIHBsdWdpbiBieSBzZXR0aW5nL2NoZWNraW5nIG9wdGlvbnMgYW5kIGF0dHJpYnV0ZXMsIGFkZGluZyBoZWxwZXIgdmFyaWFibGVzLCBhbmQgc2F2aW5nIHRoZSBhbmNob3IuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdCgpIHtcblx0ICAgIHRoaXMuX2V2ZW50cygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIHRoZSBlbGVtZW50IHV0aWxpemluZyB0aGUgdHJpZ2dlcnMgdXRpbGl0eSBsaWJyYXJ5LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2V2ZW50cygpIHtcbiAgICAgICAgdGhpcy5fYWRkQ2xpY2tIYW5kbGVyKCk7XG4gICAgICAgIHRoaXMuX2FkZEZvY3VzSGFuZGxlcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgY2xpY2sgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgdGFicy5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRDbGlja0hhbmRsZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy4kZWxlbWVudFxuICAgICAgICAgICAgLm9mZignY2xpY2sucGwubGF5b3V0ZWxlbWVudCcpXG4gICAgICAgICAgICAub24oJ2NsaWNrLnBsLmxheW91dGVsZW1lbnQnLCBmdW5jdGlvbihlKXtcblxuICAgICAgICAgICAgXHRpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGVsZW1lbnQgY2xpY2sgaGFuZGxlcicpO1xuICAgICAgICBcdCAgICBfdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdjbGlja2VkJyk7XG4gICAgICAgIFx0ICAgIFxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgX3RoaXMuZm9jdXMoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBjbGljayBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSB0YWJzLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZEZvY3VzSGFuZGxlcigpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB0aGlzLiRlbGVtZW50XG4gICAgICAgICAgICAub2ZmKCdmb2N1c2VkLnBsLmxheW91dGVsZW1lbnQnKVxuICAgICAgICAgICAgLm9uKCdmb2N1c2VkLnBsLmxheW91dGVsZW1lbnQnLCBmdW5jdGlvbihlKXtcblxuICAgICAgICAgICAgXHRpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGVsZW1lbnQgZm9jdXMgZXZlbnQgaGFuZGxlcjonLCBfdGhpcy5fZHJhZ3RyaWdnZXIsIF90aGlzLl9lbGVtZW50dG9vbGJhcik7XG4gICAgICAgIFx0ICAgIFxuICAgICAgICAgICAgXHRpZiAoIShfdGhpcy5fZHJhZ3RyaWdnZXIgaW5zdGFuY2VvZiBMYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXIpKSB7XG4gICAgICAgICAgICBcdFx0X3RoaXMuX2luaXREcmFndHJpZ2dlcigpO1xuICAgICAgICAgICAgXHR9XG4gICAgICAgICAgICBcdGlmICghKF90aGlzLl9lbGVtZW50dG9vbGJhciBpbnN0YW5jZW9mIExheW91dGVsZW1lbnR0b29sYmFyKSkge1xuICAgICAgICAgICAgXHRcdF90aGlzLl9pbml0RWxlbWVudHRvb2xiYXIoKTtcbiAgICAgICAgICAgIFx0fVxuXG4gICAgICAgICAgICBcdGlmIChfdGhpcy5fdG9vbGJhciBpbnN0YW5jZW9mIExheW91dHRvb2xiYXIpIHtcbiAgICAgICAgICAgIFx0ICAgIF90aGlzLl90b29sYmFyLnN3aXRjaFNlY3Rpb24oX3RoaXMuY2xhc3NuYW1lKTtcbiAgICAgICAgICAgIFx0fVxuICAgICAgICAgICAgXHQvL190aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2ZvY3VzZWQnKTtcbiAgICAgICAgXHQgICAgXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAvL190aGlzLmZvY3VzKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgICAgICAgIC5vZmYoJ3VuZm9jdXNlZC5wbC5sYXlvdXRlbGVtZW50JylcbiAgICAgICAgICAgIC5vbigndW5mb2N1c2VkLnBsLmxheW91dGVsZW1lbnQnLCBmdW5jdGlvbihlKXtcblxuICAgICAgICAgICAgXHRpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGVsZW1lbnQgdW4tZm9jdXMgZXZlbnQgaGFuZGxlcjonLCBfdGhpcy5fZHJhZ3RyaWdnZXIsIF90aGlzLl9lbGVtZW50dG9vbGJhcik7XG5cbiAgICAgICAgICAgIFx0aWYgKF90aGlzLl9kcmFndHJpZ2dlciBpbnN0YW5jZW9mIExheW91dGVsZW1lbnRkcmFndHJpZ2dlcikge1xuICAgICAgICAgICAgXHRcdF90aGlzLl9kcmFndHJpZ2dlci5kZXN0cm95KCk7XG4gICAgICAgICAgICBcdH1cbiAgICAgICAgICAgIFx0aWYgKF90aGlzLl9lbGVtZW50dG9vbGJhciBpbnN0YW5jZW9mIExheW91dGVsZW1lbnR0b29sYmFyKSB7XG4gICAgICAgICAgICBcdFx0X3RoaXMuX2VsZW1lbnR0b29sYmFyLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIFx0fVxuXG4gICAgICAgICAgICBcdGlmIChfdGhpcy5fdG9vbGJhciBpbnN0YW5jZW9mIExheW91dHRvb2xiYXIpIHtcbiAgICAgICAgICAgICAgICBcdF90aGlzLl90b29sYmFyLmhpZGVTZWN0aW9ucygpO1xuICAgICAgICAgICAgXHR9XG4gICAgICAgICAgICBcdC8vX3RoaXMuJGVsZW1lbnQudHJpZ2dlcigndW5mb2N1c2VkJyk7XG4gICAgICAgIFx0ICAgIFxuICAgICAgICAgICAgICAgIC8vZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIC8vZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgIC8vX3RoaXMuZm9jdXMoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGZvY3VzIGNsYXNzIG9uIGN1cnJlbnQgJGVsZW1lbnQsIHJlbW92ZXMgZnJvbSBvdGhlcnNcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb2N1c0xheW91dGVsZW1lbnQoKSB7XG4gICAgXHQkKCdbZGF0YS1sYXlvdXRlbGVtZW50dG9vbGJhcl0sW2RhdGEtbGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyXScpLnJlbW92ZSgpO1xuICAgIFx0aWYgKCF0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKHRoaXMub3B0aW9ucy5mb2N1c0NsYXNzbmFtZSkpIHtcbiAgICAgICAgXHQkKCcuJyt0aGlzLm9wdGlvbnMuZm9jdXNDbGFzc25hbWUpLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5mb2N1c0NsYXNzbmFtZSk7XG4gICAgICAgIFx0dGhpcy4kZWxlbWVudC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuZm9jdXNDbGFzc25hbWUpO1xuICAgICAgICBcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0ZWxlbWVudCBmb2N1c2VkOicsIHRoaXMudXVpZCk7XG4gICAgXHQgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdmb2N1c2VkJyk7XG4gICAgXHR9IGVsc2Uge1xuICAgICAgICBcdHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmZvY3VzQ2xhc3NuYW1lKTtcbiAgICAgICAgXHRpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGVsZW1lbnQgdW4tZm9jdXNlZDonLCB0aGlzLnV1aWQpO1xuICAgIFx0ICAgIHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oKS50cmlnZ2VyKCd1bmZvY3VzZWQnKTtcbiAgICBcdCAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3VuZm9jdXNlZCcpO1xuICAgIFx0fVxuICAgIFx0aWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRlbGVtZW50IGZvY3VzIGNoYW5nZWQnKTtcblx0ICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignZm9jdXNjaGFuZ2UnKTtcbiAgICBcdHJldHVybiAodGhpcyk7XG4gICAgfVxuICBcbiAgICAvKipcbiAgICAgKiBTZXQgZm9jdXMgb24gY3VycmVudCAkZWxlbWVudFxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBmb2N1cygpIHtcbiAgICBcdHJldHVybiB0aGlzLl9mb2N1c0xheW91dGVsZW1lbnQoKTtcbiAgICB9XG4gIFxuICAgIC8qKlxuICAgICAqIFVuLWZvY3VzIGFueSBsYXlvdXQgZWxlbWVudFxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICB1bmZvY3VzKCkge1xuICAgIFx0JCgnW2RhdGEtbGF5b3V0Ym9keV0gLmZvY3VzZWQnKS5lYWNoKChpZHgsIGVsZW0pID0+IHtcbiAgICBcdFx0aWYgKCQoZWxlbSkuZGF0YSgpKSB7XG4gICAgXHRcdFx0JChlbGVtKS5kYXRhKCdwYXR0ZXJubGlicmFyeVBsdWdpbicpLmZvY3VzKCk7XG4gICAgXHRcdH1cbiAgICBcdH0pO1xuICAgIH1cbiAgXG4gICAgLyoqXG4gICAgICogUmV0cmlldmUgZWxlbWVudCdzIHRvb2xiYXIgaW5zdGFuY2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdldCBfZWxlbWVudHRvb2xiYXIoKSB7XG4gICAgICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0ZWxlbWVudHRvb2xiYXIgc2VjdGlvbiBlbGVtZW50OicsIHRoaXMuJGVsZW1lbnQuZmluZCgnPiBbZGF0YS1sYXlvdXRlbGVtZW50dG9vbGJhcl0nKSk7XG4gICAgXHRyZXR1cm4gdGhpcy4kZWxlbWVudC5maW5kKCc+IFtkYXRhLWxheW91dGVsZW1lbnR0b29sYmFyXScpLmRhdGEoJ3BhdHRlcm5saWJyYXJ5UGx1Z2luJyk7XG4gICAgfVxuICBcblx0LyoqXG4gICAgICogSW5pdGlhbGl6ZXMgYSBzaW5nbGUgbmV3IHRvb2xiYXIgc2VjdGlvbnNcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0RWxlbWVudHRvb2xiYXIoc2VjdGlvbmNvbmZpZykge1xuICAgICAgICBpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGVsZW1lbnR0b29sYmFyIGluaXRpYWxpemUgc2VjdGlvbiBlbGVtZW50OicsIHNlY3Rpb25jb25maWcpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy4kZWxlbWVudC5wcmVwZW5kKExheW91dGVsZW1lbnR0b29sYmFyLnByb3RvdHlwZS50b0VsZW1lbnQoKSk7XG4gICAgICAgIHZhciAkdG9vbGJhcnNlY3Rpb24gPSB0aGlzLiRlbGVtZW50LmZpbmQoJz4gW2RhdGEtbGF5b3V0ZWxlbWVudHRvb2xiYXJdJyk7XG4gICAgICAgIHZhciAkc2VjdGlvbiA9IG5ldyBMYXlvdXRlbGVtZW50dG9vbGJhciAoXG4gICAgICAgIFx0JHRvb2xiYXJzZWN0aW9uLFxuICAgICAgICBcdHNlY3Rpb25jb25maWdcbiAgICAgICAgKTtcbiAgICAgICAgJHRvb2xiYXJzZWN0aW9uLmRhdGEoJ3BhdHRlcm5saWJyYXJ5UGx1Z2luJywgJHNlY3Rpb24pO1xuICAgICAgICAvLyRzZWN0aW9uLiRlbGVtZW50LmNoaWxkcmVuKCkuZmlyc3QoKS5wYXR0ZXJubGlicmFyeSgpOy8vcGxmb3VuZGF0aW9uKCk7Ly9cbiAgICAgICAgLy8kc2VjdGlvbi4kZWxlbWVudC50cmlnZ2VyKCdpbml0aWFsaXplZCcpO1xuICAgICAgICBcbiAgICAgICAgaWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRlbGVtZW50dG9vbGJhciBpbml0aWFsaXplZDogJywgJHNlY3Rpb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHJpZXZlIGVsZW1lbnQncyBkcmFnLXRyaWdnZXIgaW5zdGFuY2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdldCBfZHJhZ3RyaWdnZXIoKSB7XG4gICAgXHRpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGVsZW1lbnRkcmFndHJpZ2dlciBzZWN0aW9uIGVsZW1lbnQ6JywgdGhpcy4kZWxlbWVudC5maW5kKCc+IFtkYXRhLWxheW91dGVsZW1lbnRkcmFndHJpZ2dlcl0nKSk7XG4gICAgXHRyZXR1cm4gdGhpcy4kZWxlbWVudC5maW5kKCc+IFtkYXRhLWxheW91dGVsZW1lbnRkcmFndHJpZ2dlcl0nKS5kYXRhKCdwYXR0ZXJubGlicmFyeVBsdWdpbicpO1xuICAgIH1cbiAgICBcblx0LyoqXG4gICAgICogSW5pdGlhbGl6ZXMgYSBzaW5nbGUgbmV3IGRyYWctdHJpZ2dlciBzZWN0aW9uc1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXREcmFndHJpZ2dlcihzZWN0aW9uY29uZmlnKSB7XG4gICAgICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyIGluaXRpYWxpemUgc2VjdGlvbiBlbGVtZW50OicsIHNlY3Rpb25jb25maWcpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy4kZWxlbWVudC5wcmVwZW5kKExheW91dGVsZW1lbnRkcmFndHJpZ2dlci5wcm90b3R5cGUudG9FbGVtZW50KCkpO1xuICAgICAgICB2YXIgJHRvb2xiYXJzZWN0aW9uID0gdGhpcy4kZWxlbWVudC5maW5kKCc+IFtkYXRhLWxheW91dGVsZW1lbnRkcmFndHJpZ2dlcl0nKTtcbiAgICAgICAgdmFyICRzZWN0aW9uID0gbmV3IExheW91dGVsZW1lbnRkcmFndHJpZ2dlciAoXG4gICAgICAgICBcdCR0b29sYmFyc2VjdGlvbixcbiAgICAgICAgXHRzZWN0aW9uY29uZmlnXG4gICAgICAgICk7XG4gICAgICAgICR0b29sYmFyc2VjdGlvbi5kYXRhKCdwYXR0ZXJubGlicmFyeVBsdWdpbicsICRzZWN0aW9uKTtcbiAgICAgICAgLy8kc2VjdGlvbi4kZWxlbWVudC5jaGlsZHJlbigpLmZpcnN0KCkucGF0dGVybmxpYnJhcnkoKTsvL3BsZm91bmRhdGlvbigpOy8vXG4gICAgICAgIC8vJHNlY3Rpb24uJGVsZW1lbnQudHJpZ2dlcignaW5pdGlhbGl6ZWQnKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyIGluaXRpYWxpemVkOiAnLCAkc2VjdGlvbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVzdHJveXMgdGhlIGxheW91dGVsZW1lbnQuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCcqJykub2ZmKCcucGwubGF5b3V0ZWxlbWVudCcpO1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZignLnBsLmxheW91dGVsZW1lbnQnKTtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmUoKTtcbiAgICB9XG5cbn1cblxuTGF5b3V0ZWxlbWVudC5kZWZhdWx0cyA9IHtcblx0YWN0aXZlQ2xhc3NuYW1lIDogJ2FjdGl2YXRlZCcsXG5cdGZvY3VzQ2xhc3NuYW1lICA6ICdmb2N1c2VkJ1xufVxuXG4vL1BMRm91bmRhdGlvbi5wbHVnaW4oTGF5b3V0ZWxlbWVudCwgJ0xheW91dGVsZW1lbnQnKTtcbnBhdHRlcm5saWJyYXJ5LnBsdWdpbihMYXlvdXRlbGVtZW50LCAnTGF5b3V0ZWxlbWVudCcpO1xuXG4iLCIvKipcbiAqIExheW91dGJ1aWxkZXIgRXhjZXB0aW9uIG9iamVjdFxuICogXG4gKiBAbW9kdWxlIExheW91dGJ1aWxkZXJFeGNlcHRpb25cbiAqL1xuY2xhc3MgTGF5b3V0YnVpbGRlckV4Y2VwdGlvbiB7XG5cdFxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBhIExheW91dGJ1aWxkZXJFeGNlcHRpb24uXG4gICAgICogQGNsYXNzXG4gICAgICogQG5hbWUgTGF5b3V0YnVpbGRlckV4Y2VwdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gbWVzc2FnZSBvZiB0aGUgZXhjZXB0aW9uIGRlY3JpYmluZyB0aGUgb2NjdXJlbmNlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjb2RlIC0gb3B0aW9uYWwgbWVzc2FnZSBjb2RlLCBkZWZhdWx0ID0gMC5cbiAgICAgKi9cblx0Y29uc3RydWN0b3IobWVzc2FnZSwgY29kZSA9IDApIHtcblxuXHQgICAgdGhpcy5uYW1lID0gXCJMYXlvdXRidWlsZGVyRXhjZXB0aW9uXCI7XG5cdCAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuXHR9XG5cblx0LyoqXG5cdCAqIGNvbXBvc2Ugc3RyaW5nIG91dHB1dCBvZiBMYXlvdXRidWlsZGVyRXhjZXB0aW9uXG5cdCAqIFxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHJldHVybiB7c3RyaW5nfVxuXHQgKi9cbiAgICB0b1N0cmluZygpIHsgcmV0dXJuIHRoaXMubmFtZSArIFwiOiBcIiArIHRoaXMubWVzc2FnZTsgfVxuICAgIFxufTsiLCIvKipcbiAqIExheW91dGNvbHVtbiBtb2R1bGUuXG4gKiBAbW9kdWxlIHBsZm91bmRhdGlvbi5sYXlvdXRjb2x1bW5cbiAqIFxuICogQHJlcXVpcmVzIHBsZm91bmRhdGlvbi5MYXlvdXRlbGVtZW50XG4gKi9cbmNsYXNzIExheW91dGNvbHVtbiBleHRlbmRzIExheW91dGVsZW1lbnQge1xuXG5cdGdldCBjbGFzc25hbWUgKCkgeyByZXR1cm4gJ2xheW91dGNvbHVtbic7IH1cblx0XG59XG5cbi8vUExGb3VuZGF0aW9uLnBsdWdpbihMYXlvdXRjb2x1bW4sICdMYXlvdXRjb2x1bW4nKTtcbnBhdHRlcm5saWJyYXJ5LnBsdWdpbihMYXlvdXRjb2x1bW4sICdMYXlvdXRjb2x1bW4nKTtcblxuIiwiLyoqXG4gKiBMYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXIgbW9kdWxlLlxuICogQG1vZHVsZSBwbGZvdW5kYXRpb24ubGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyXG4gKiBcbiAqIEByZXF1aXJlcyBwYXR0ZXJubGlicmFyeS5QbHVnaW5cbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLlRyaWdnZXJzXG4gKi9cbmNsYXNzIExheW91dGVsZW1lbnRkcmFndHJpZ2dlciBleHRlbmRzIFBsdWdpbiB7XG5cbiAgICAvKipcbiAgICAgKiBTZXR1cCBhIG5ldyBpbnN0YW5jZSBvZiBhIGxheW91dGVsZW1lbnRkcmFndHJpZ2dlci5cbiAgICAgKiBAY2xhc3NcbiAgICAgKiBAbmFtZSBMYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXJcbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGEgbGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyLlxuICAgICAqICAgICAgICBPYmplY3Qgc2hvdWxkIGJlIG9mIHRoZSBsYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXIgcGFuZWwsIHJhdGhlciB0aGFuIGl0cyBhbmNob3IuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgICAqL1xuXHRfc2V0dXAoZWxlbWVudCwgb3B0aW9ucykge1xuXHRcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyIGluaXQnKTtcbiAgICBcdHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgTGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ2xheW91dGVsZW1lbnRkcmFndHJpZ2dlcic7IC8vIGllOSBiYWNrIGNvbXBhdFxuXG4gICAgICAgIC8vIFRyaWdnZXJzIGluaXQgaXMgaWRlbXBvdGVudCwganVzdCBuZWVkIHRvIG1ha2Ugc3VyZSBpdCBpcyBpbml0aWFsaXplZFxuICAgICAgICBQTEZvdW5kYXRpb24uVHJpZ2dlcnMuaW5pdCgkKTtcblxuICAgICAgICB0aGlzLl9pbml0KCk7XG5cbiAgICAgICAgLy8gKG1heWJlLCB0aGlzIGxpbmUgaXMgbm90IG5lc3Nlc3NhcnkgYW55bW9yZS4uLj8hKVxuICAgICAgICAvL1BMRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnTGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyJyk7XG4gICAgICAgIFxuICAgICAgICBpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGVsZW1lbnRkcmFndHJpZ2dlciBpbml0aWFsaXplZCcpO1xuICAgIH1cblx0XG5cdC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBwbHVnaW4gYnkgc2V0dGluZy9jaGVja2luZyBvcHRpb25zIGFuZCBhdHRyaWJ1dGVzLCBhZGRpbmcgaGVscGVyIHZhcmlhYmxlcywgYW5kIHNhdmluZyB0aGUgYW5jaG9yLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXQoKSB7XG5cdCAgICB0aGlzLl9ldmVudHMoKTtcblx0ICAgIHRoaXMuaGlkZVNlY3Rpb25zKCk7XG5cdCAgICBpZiAodGhpcy4kZWxlbWVudCkge1xuXHQgICAgXHR0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2luaXRpYWxpemVkLnBsLmxheW91dGVsZW1lbnRkcmFndHJpZ2dlcicpO1xuXHQgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIHRoZSBlbGVtZW50IHV0aWxpemluZyB0aGUgdHJpZ2dlcnMgdXRpbGl0eSBsaWJyYXJ5LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2V2ZW50cygpIHtcbiAgICBcdHRoaXMuX2FkZEluaXRIYW5kbGVyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBpbml0aWFsemF0aW9uIGV2ZW50IGxpc3RlbmVyc1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZEluaXRIYW5kbGVyKCkge1xuICAgIFx0dmFyICR0aGlzID0gdGhpcztcbiAgICBcdHRoaXMuJGVsZW1lbnRcbiAgICBcdCAgICAub2ZmKCdpbml0aWFsaXplZC5wbC5sYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXInKVxuICAgIFx0ICAgIC5vbignaW5pdGlhbGl6ZWQucGwubGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyJywgKGUpID0+IHtcbiAgICBcdCAgICBcdCR0aGlzLl9pbml0U2VjdGlvbnMuYXBwbHkoJHRoaXMpO1xuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIFx0ICAgIH0pO1xuICAgIH1cblxuXHQvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgdG9vbGJhciBzZWN0aW9ucyBnaXZlbiBieSBjb25maWdcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0U2VjdGlvbnMoKSB7XG4gICAgICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyIGluaXRpYWxpemUgc2VjdGlvbicsIHRoaXMub3B0aW9ucy5zZWN0aW9ucyk7XG4gICAgXHR2YXIgJHRoaXMgPSB0aGlzO1xuICAgIFx0JCh0aGlzLm9wdGlvbnMuc2VjdGlvbnMpLmVhY2goKGlkeCwgc2VjdGlvbmNvbmZpZykgPT4ge1xuICAgICAgICAgICAgaWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXIgaW5pdCBzZWN0aW9uJywgc2VjdGlvbmNvbmZpZyk7XG4gICAgXHRcdGlmICggJHRoaXMuJGVsZW1lbnQuZmluZChgPiBbcmVsPVwiJHtzZWN0aW9uY29uZmlnLm5hbWV9XCJdYCkubGVuZ3RoID09IDAgKSB7XG4gICAgXHRcdFx0JHRoaXMuX2luaXRTZWN0aW9uKHNlY3Rpb25jb25maWcpO1xuICAgIFx0XHR9XG4gICAgXHR9KVxuICAgIH1cblxuXHQvKipcbiAgICAgKiBJbml0aWFsaXplcyBhIHNpbmdsZSBuZXcgdG9vbGJhciBzZWN0aW9uc1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXRTZWN0aW9uKHNlY3Rpb25jb25maWcpIHtcbiAgICAgICAgaWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXIgaW5pdGlhbGl6ZSBzZWN0aW9uJywgc2VjdGlvbmNvbmZpZyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLiRlbGVtZW50LnByZXBlbmQoTGF5b3V0dG9vbGJhcnNlY3Rpb24ucHJvdG90eXBlLnRvRWxlbWVudChzZWN0aW9uY29uZmlnKSk7XG4gICAgICAgIHZhciAkc2VjdGlvbiA9IG5ldyBMYXlvdXR0b29sYmFyc2VjdGlvbiAoXG4gICAgICAgIFx0dGhpcy4kZWxlbWVudC5maW5kKGA+IFtyZWw9XCIke3NlY3Rpb25jb25maWcubmFtZX1cIl1gKSxcbiAgICAgICAgXHRzZWN0aW9uY29uZmlnXG4gICAgICAgICk7XG4gICAgICAgICRzZWN0aW9uLiRlbGVtZW50LmNoaWxkcmVuKCkuZmlyc3QoKS5wbGZvdW5kYXRpb24oKTsvL3BhdHRlcm5saWJyYXJ5KCk7XG4gICAgICAgICRzZWN0aW9uLiRlbGVtZW50LnRyaWdnZXIoJ2luaXRpYWxpemVkJyk7XG4gICAgICAgIFxuICAgICAgICBpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGVsZW1lbnRkcmFndHJpZ2dlciBzZWN0aW9uIGluaXRpYWxpemVkOiAnLCAkc2VjdGlvbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmV0cmlldmUgYWxsIHRvb2xiYXIgc2VjdGlvbnNcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdldCBfc2VjdGlvbnMgKCkge1xuICAgIFx0cmV0dXJuIHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtbGF5b3V0dG9vbGJhcnNlY3Rpb25dJykubWFwKChpZHgsIGVsZW0pID0+IHsgXG4gICAgXHRcdHJldHVybiAkKGVsZW0pLmRhdGEoJ3BhdHRlcm5saWJyYXJ5UGx1Z2luJylcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmV0cmlldmUgYSB0b29sYmFyIHNlY3Rpb24gYnkgbmFtZVxuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuICAgIHNlY3Rpb24gKG5hbWUpIHtcbiAgICBcdHZhciAkc2VjdGlvbjtcbiAgICBcdFxuICAgICAgICAkKHRoaXMuX3NlY3Rpb25zKS5lYWNoKChpZHgsIF9zZWN0aW9uKSA9PiB7XG4gICAgICAgIFx0aWYgKF9zZWN0aW9uLiRlbGVtZW50ICYmIF9zZWN0aW9uLiRlbGVtZW50LmF0dHIoJ3JlbCcpID09IG5hbWUpIHtcbiAgICAgICAgXHRcdCRzZWN0aW9uID0gX3NlY3Rpb247XG4gICAgICAgIFx0fVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiAoJHNlY3Rpb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHJpZXZlIGJ1aWxkZXIncyB0b29sYmFyIHNlY3Rpb25cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdldCBfYnVpbGRlclNlY3Rpb24gKCkge1xuICAgIFx0dmFyIGJ1aWxkZXJTZWN0aW9uID0gbnVsbDtcbiAgICBcdHRoaXMuX3NlY3Rpb25zLmVhY2goKGlkeCwgc2VjdGlvbikgPT4geyAgXG4gICAgXHRcdGlmIChzZWN0aW9uLiRlbGVtZW50LmF0dHIoJ3JlbCcpID09ICdidWlsZGVyJykge1xuICAgIFx0XHRcdGJ1aWxkZXJTZWN0aW9uID0gc2VjdGlvbjtcbiAgICBcdFx0XHRyZXR1cm4gKGZhbHNlKTtcbiAgICBcdFx0fVxuICAgIFx0fSk7XG4gICAgXHRyZXR1cm4gYnVpbGRlclNlY3Rpb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogaGlkZSBhbGwgdG9vbGJhciBzZWN0aW9uc1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuICAgIGhpZGVTZWN0aW9ucyAoKSB7XG4gICAgXHR2YXIgc2VjdGlvbnMgPSB0aGlzLl9zZWN0aW9ucztcbiAgICBcdHNlY3Rpb25zLmVhY2goKGlkeCwgc2VjdGlvbikgPT4geyBzZWN0aW9uLmhpZGUoKTsgfSk7XG4gICAgXHRpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2cgKCdidWlsZGVyOicsIHRoaXMuX2J1aWxkZXJTZWN0aW9uICk7XG5cdCAgICAvL3RoaXMuX2J1aWxkZXJTZWN0aW9uLnNob3coKTtcbiAgICBcdHNlY3Rpb25zLmVhY2goKGlkeCwgc2VjdGlvbikgPT4ge1xuICAgIFx0XHRpZiAoc2VjdGlvbi4kZWxlbWVudC5hdHRyKCdyZWwnKSA9PSAnYnVpbGRlcicpIHtcbiAgICBcdFx0XHRzZWN0aW9uLnNob3coKTtcbiAgICBcdFx0fVxuICAgIFx0fSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogc3dpdGNoIHRvb2xiYXIgc2VjdGlvbnMgYWNjb3JkaW5nIHRvIGZvY3VzZWQgZWxlbWVudFxuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuICAgIHN3aXRjaFNlY3Rpb24gKG5hbWUsIHJlZmVyZW5jZSkge1xuICAgIFx0dmFyIHNlY3Rpb25zID0gdGhpcy5fc2VjdGlvbnM7XG4gICAgXHRzZWN0aW9ucy5lYWNoKChpZHgsIHNlY3Rpb24pID0+IHtcbiAgICBcdFx0dmFyICRzZWN0aW9uID0gJChzZWN0aW9uKTtcblxuICAgIFx0XHRpZiAoc2VjdGlvbi4kZWxlbWVudC5hdHRyKCdyZWwnKSAhPSAnYnVpbGRlcicpIHtcblx0ICAgIFx0XHRpZiAoc2VjdGlvbi4kZWxlbWVudC5hdHRyKCdyZWwnKSA9PSBuYW1lKSB7XG5cdCAgICBcdFx0XHRzZWN0aW9uLnNob3coKTtcblx0ICAgIFx0XHR9IGVsc2Uge1xuXHQgICAgXHRcdFx0c2VjdGlvbi5oaWRlKCk7IFxuXHQgICAgXHRcdH1cbiAgICBcdFx0fVxuICAgIFx0fSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogZ2VuZXJhdGUgaW5pdGlhbCBtYXJrdXBcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdldCBfbWFya3VwKCkge1xuICAgIFx0dmFyIGh0bWwgPSBbXG4gICAgXHRcdCc8ZGl2IGRhdGEtbGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyIGNsYXNzPVwidG9vbGJhciBhY3Rpb25zXCI+JyxcbiAgICBcdFx0JzwvZGl2PidcbiAgICBcdF07XG4gICAgXHRcbiAgICBcdHJldHVybiAkKGh0bWwuam9pbignJykpO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBEZXN0cm95cyB0aGUgbGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyJ3Mgc2VjdGlvbnMuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZGVzdHJveVNlY3Rpb25zKCkge1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBEZXN0cm95cyB0aGUgbGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Rlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnKicpLm9mZignLnBsLmxheW91dGVsZW1lbnRkcmFndHJpZ2dlcicpO1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZignLnBsLmxheW91dGVsZW1lbnRkcmFndHJpZ2dlcicpO1xuICAgICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZSgpO1xuICAgIH1cblx0XG59XG5cbkxheW91dGVsZW1lbnRkcmFndHJpZ2dlci5kZWZhdWx0cyA9IHtcblx0c2VjdGlvbnM6IFtcblx0XHR7XG5cdFx0XHRuYW1lIDogJ2xheW91dGVsZW1lbnRkcmFndHJpZ2dlcicsXG5cdFx0XHRpdGVtczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZSAgOiAnYWN0aW9uJyxcblx0XHRcdFx0XHRsYWJlbCA6ICdtb3ZlIGVsZW1lbnQnLFxuXHRcdFx0XHRcdGljb24gIDogJ2ZhIGZhLWFycm93cycsXG5cdFx0XHRcdFx0YWN0aW9uOiAnI21vdmVfZWxlbWVudCcsXG5cdFx0XHRcdFx0ZXZlbnRzOiB7XG5cdFx0XHRcdFx0ICAgIGNsaWNrIDogTGF5b3V0YnVpbGRlckNsaWNrZHVtbXlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9XG5cdF1cbn07XG5cbi8vUExGb3VuZGF0aW9uLnBsdWdpbihMYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXIsICdMYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXInKTtcbnBhdHRlcm5saWJyYXJ5LnBsdWdpbihMYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXIsICdMYXlvdXRlbGVtZW50ZHJhZ3RyaWdnZXInKTtcblxuaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJykge1xuXHQvLyByZXF1aXJlL0FNRCBtb2R1bGUgZGVmaW5pdGlvblxuXHRkZWZpbmUoW10sIChyZXF1aXJlLCBleHBvcnRzLCBtb2R1bGUpID0+IHtcblx0XHRyZXR1cm4gTGF5b3V0ZWxlbWVudGRyYWd0cmlnZ2VyO1xuXHR9KTtcbn0iLCIvKipcbiAqIExheW91dGVsZW1lbnR0b29sYmFyIG1vZHVsZS5cbiAqIEBtb2R1bGUgcGxmb3VuZGF0aW9uLmxheW91dGVsZW1lbnR0b29sYmFyXG4gKiBcbiAqIEByZXF1aXJlcyBwYXR0ZXJubGlicmFyeS5QbHVnaW5cbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLlRyaWdnZXJzXG4gKi9cbmNsYXNzIExheW91dGVsZW1lbnR0b29sYmFyIGV4dGVuZHMgUGx1Z2luIHtcblxuICAgIC8qKlxuICAgICAqIFNldHVwIGEgbmV3IGluc3RhbmNlIG9mIGEgbGF5b3V0ZWxlbWVudHRvb2xiYXIuXG4gICAgICogQGNsYXNzXG4gICAgICogQG5hbWUgTGF5b3V0ZWxlbWVudHRvb2xiYXJcbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGEgbGF5b3V0ZWxlbWVudHRvb2xiYXIuXG4gICAgICogICAgICAgIE9iamVjdCBzaG91bGQgYmUgb2YgdGhlIGxheW91dGVsZW1lbnR0b29sYmFyIHBhbmVsLCByYXRoZXIgdGhhbiBpdHMgYW5jaG9yLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICAgKi9cblx0X3NldHVwKGVsZW1lbnQsIG9wdGlvbnMpIHtcblx0XHRpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGVsZW1lbnR0b29sYmFyIGluaXQnKTtcbiAgICBcdHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgTGF5b3V0ZWxlbWVudHRvb2xiYXIuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnbGF5b3V0ZWxlbWVudHRvb2xiYXInOyAvLyBpZTkgYmFjayBjb21wYXRcblxuICAgICAgICAvLyBUcmlnZ2VycyBpbml0IGlzIGlkZW1wb3RlbnQsIGp1c3QgbmVlZCB0byBtYWtlIHN1cmUgaXQgaXMgaW5pdGlhbGl6ZWRcbiAgICAgICAgUExGb3VuZGF0aW9uLlRyaWdnZXJzLmluaXQoJCk7XG5cbiAgICAgICAgdGhpcy5faW5pdCgpO1xuXG4gICAgICAgIC8vIChtYXliZSwgdGhpcyBsaW5lIGlzIG5vdCBuZXNzZXNzYXJ5IGFueW1vcmUuLi4/ISlcbiAgICAgICAgLy9QTEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0xheW91dGVsZW1lbnR0b29sYmFyJyk7XG4gICAgICAgIFxuICAgICAgICBpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGVsZW1lbnR0b29sYmFyIGluaXRpYWxpemVkJyk7XG4gICAgfVxuXHRcblx0LyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIHBsdWdpbiBieSBzZXR0aW5nL2NoZWNraW5nIG9wdGlvbnMgYW5kIGF0dHJpYnV0ZXMsIGFkZGluZyBoZWxwZXIgdmFyaWFibGVzLCBhbmQgc2F2aW5nIHRoZSBhbmNob3IuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdCgpIHtcblx0ICAgIHRoaXMuX2V2ZW50cygpO1xuXHQgICAgdGhpcy5oaWRlU2VjdGlvbnMoKTtcblx0ICAgIGlmICh0aGlzLiRlbGVtZW50KSB7XG5cdCAgICBcdHRoaXMuJGVsZW1lbnQudHJpZ2dlcignaW5pdGlhbGl6ZWQucGwubGF5b3V0ZWxlbWVudHRvb2xiYXInKTtcblx0ICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVycyB0byB0aGUgZWxlbWVudCB1dGlsaXppbmcgdGhlIHRyaWdnZXJzIHV0aWxpdHkgbGlicmFyeS5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9ldmVudHMoKSB7XG4gICAgXHR0aGlzLl9hZGRJbml0SGFuZGxlcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgaW5pdGlhbHphdGlvbiBldmVudCBsaXN0ZW5lcnNcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRJbml0SGFuZGxlcigpIHtcbiAgICBcdHZhciAkdGhpcyA9IHRoaXM7XG4gICAgXHR0aGlzLiRlbGVtZW50XG4gICAgXHQgICAgLm9mZignaW5pdGlhbGl6ZWQucGwubGF5b3V0ZWxlbWVudHRvb2xiYXInKVxuICAgIFx0ICAgIC5vbignaW5pdGlhbGl6ZWQucGwubGF5b3V0ZWxlbWVudHRvb2xiYXInLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIFx0ICAgIFx0JHRoaXMuX2luaXRTZWN0aW9ucy5hcHBseSgkdGhpcyk7XG4gICAgXHQgICAgfSk7XG4gICAgfVxuXG5cdC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSB0b29sYmFyIHNlY3Rpb25zIGdpdmVuIGJ5IGNvbmZpZ1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXRTZWN0aW9ucygpIHtcbiAgICAgICAgaWYgKHBhdHRlcm5saWJyYXJ5LmRlYnVnKCkpIGNvbnNvbGUubG9nKCdsYXlvdXRlbGVtZW50dG9vbGJhciBpbml0aWFsaXplIHNlY3Rpb24nLCB0aGlzLm9wdGlvbnMuc2VjdGlvbnMpO1xuICAgIFx0dmFyICR0aGlzID0gdGhpcztcbiAgICBcdCQodGhpcy5vcHRpb25zLnNlY3Rpb25zKS5lYWNoKChpZHgsIHNlY3Rpb25jb25maWcpID0+IHtcbiAgICBcdFx0dmFyICRsYXlvdXRlbGVtZW50ID0gJHRoaXMuJGVsZW1lbnQucGFyZW50KCkuZGF0YSgncGF0dGVybmxpYnJhcnlQbHVnaW4nKTtcbiAgICBcdFx0aWYgKCAkbGF5b3V0ZWxlbWVudC5jbGFzc25hbWUgPT0gc2VjdGlvbmNvbmZpZy5uYW1lICkge1xuICAgIFx0XHRcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0ZWxlbWVudHRvb2xiYXIgaW5pdCBzZWN0aW9uJywgc2VjdGlvbmNvbmZpZyk7XG5cdCAgICBcdFx0aWYgKCAkdGhpcy4kZWxlbWVudC5maW5kKCc+IFtkYXRhLWxheW91dHRvb2xiYXJzZWN0aW9uXScpLmxlbmd0aCA9PSAwICkge1xuXHQgICAgXHRcdFx0JHRoaXMuX2luaXRTZWN0aW9uKHNlY3Rpb25jb25maWcpO1xuXHQgICAgXHRcdH1cbiAgICBcdFx0fVxuICAgIFx0fSlcbiAgICB9XG5cblx0LyoqXG4gICAgICogSW5pdGlhbGl6ZXMgYSBzaW5nbGUgbmV3IHRvb2xiYXIgc2VjdGlvbnNcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0U2VjdGlvbihzZWN0aW9uY29uZmlnKSB7XG4gICAgICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0ZWxlbWVudHRvb2xiYXIgaW5pdGlhbGl6ZSBzZWN0aW9uJywgc2VjdGlvbmNvbmZpZyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLiRlbGVtZW50LnByZXBlbmQoTGF5b3V0dG9vbGJhcnNlY3Rpb24ucHJvdG90eXBlLnRvRWxlbWVudChzZWN0aW9uY29uZmlnKSk7XG4gICAgICAgIHZhciAkc2VjdGlvbiA9IG5ldyBMYXlvdXR0b29sYmFyc2VjdGlvbiAoXG4gICAgICAgIFx0dGhpcy4kZWxlbWVudC5maW5kKGA+IFtyZWw9XCIke3NlY3Rpb25jb25maWcubmFtZX1cIl1gKSxcbiAgICAgICAgXHRzZWN0aW9uY29uZmlnXG4gICAgICAgICk7XG4gICAgICAgICRzZWN0aW9uLiRlbGVtZW50LmNoaWxkcmVuKCkuZmlyc3QoKS5wbGZvdW5kYXRpb24oKTsvL3BhdHRlcm5saWJyYXJ5KCk7XG4gICAgICAgICRzZWN0aW9uLiRlbGVtZW50LnRyaWdnZXIoJ2luaXRpYWxpemVkJyk7XG4gICAgICAgIFxuICAgICAgICBpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dGVsZW1lbnR0b29sYmFyIHNlY3Rpb24gaW5pdGlhbGl6ZWQ6ICcsICRzZWN0aW9uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZXRyaWV2ZSBhbGwgdG9vbGJhciBzZWN0aW9uc1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2V0IF9zZWN0aW9ucyAoKSB7XG4gICAgXHRyZXR1cm4gdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1sYXlvdXR0b29sYmFyc2VjdGlvbl0nKS5tYXAoKGlkeCwgZWxlbSkgPT4geyBcbiAgICBcdFx0cmV0dXJuICQoZWxlbSkuZGF0YSgncGF0dGVybmxpYnJhcnlQbHVnaW4nKVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZXRyaWV2ZSBhIHRvb2xiYXIgc2VjdGlvbiBieSBuYW1lXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICovXG4gICAgc2VjdGlvbiAobmFtZSkge1xuICAgIFx0dmFyICRzZWN0aW9uO1xuICAgIFx0XG4gICAgICAgICQodGhpcy5fc2VjdGlvbnMpLmVhY2goKGlkeCwgX3NlY3Rpb24pID0+IHtcbiAgICAgICAgXHRpZiAoX3NlY3Rpb24uJGVsZW1lbnQgJiYgX3NlY3Rpb24uJGVsZW1lbnQuYXR0cigncmVsJykgPT0gbmFtZSkge1xuICAgICAgICBcdFx0JHNlY3Rpb24gPSBfc2VjdGlvbjtcbiAgICAgICAgXHR9XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuICgkc2VjdGlvbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmV0cmlldmUgYnVpbGRlcidzIHRvb2xiYXIgc2VjdGlvblxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2V0IF9idWlsZGVyU2VjdGlvbiAoKSB7XG4gICAgXHR2YXIgYnVpbGRlclNlY3Rpb24gPSBudWxsO1xuICAgIFx0dGhpcy5fc2VjdGlvbnMuZWFjaCgoaWR4LCBzZWN0aW9uKSA9PiB7ICBcbiAgICBcdFx0aWYgKHNlY3Rpb24uJGVsZW1lbnQuYXR0cigncmVsJykgPT0gJ2J1aWxkZXInKSB7XG4gICAgXHRcdFx0YnVpbGRlclNlY3Rpb24gPSBzZWN0aW9uO1xuICAgIFx0XHRcdHJldHVybiAoZmFsc2UpO1xuICAgIFx0XHR9XG4gICAgXHR9KTtcbiAgICBcdHJldHVybiBidWlsZGVyU2VjdGlvbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBoaWRlIGFsbCB0b29sYmFyIHNlY3Rpb25zXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICovXG4gICAgaGlkZVNlY3Rpb25zICgpIHtcbiAgICBcdHZhciBzZWN0aW9ucyA9IHRoaXMuX3NlY3Rpb25zO1xuICAgIFx0c2VjdGlvbnMuZWFjaCgoaWR4LCBzZWN0aW9uKSA9PiB7IHNlY3Rpb24uaGlkZSgpOyB9KTtcbiAgICBcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZyAoJ2J1aWxkZXI6JywgdGhpcy5fYnVpbGRlclNlY3Rpb24gKTtcblx0ICAgIC8vdGhpcy5fYnVpbGRlclNlY3Rpb24uc2hvdygpO1xuICAgIFx0c2VjdGlvbnMuZWFjaCgoaWR4LCBzZWN0aW9uKSA9PiB7XG4gICAgXHRcdGlmIChzZWN0aW9uLiRlbGVtZW50LmF0dHIoJ3JlbCcpID09ICdidWlsZGVyJykge1xuICAgIFx0XHRcdHNlY3Rpb24uc2hvdygpO1xuICAgIFx0XHR9XG4gICAgXHR9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzd2l0Y2ggdG9vbGJhciBzZWN0aW9ucyBhY2NvcmRpbmcgdG8gZm9jdXNlZCBlbGVtZW50XG4gICAgICogQGZ1bmN0aW9uXG4gICAgICovXG4gICAgc3dpdGNoU2VjdGlvbiAobmFtZSwgcmVmZXJlbmNlKSB7XG4gICAgXHR2YXIgc2VjdGlvbnMgPSB0aGlzLl9zZWN0aW9ucztcbiAgICBcdHNlY3Rpb25zLmVhY2goKGlkeCwgc2VjdGlvbikgPT4ge1xuICAgIFx0XHR2YXIgJHNlY3Rpb24gPSAkKHNlY3Rpb24pO1xuXG4gICAgXHRcdGlmIChzZWN0aW9uLiRlbGVtZW50LmF0dHIoJ3JlbCcpICE9ICdidWlsZGVyJykge1xuXHQgICAgXHRcdGlmIChzZWN0aW9uLiRlbGVtZW50LmF0dHIoJ3JlbCcpID09IG5hbWUpIHtcblx0ICAgIFx0XHRcdHNlY3Rpb24uc2hvdygpO1xuXHQgICAgXHRcdH0gZWxzZSB7XG5cdCAgICBcdFx0XHRzZWN0aW9uLmhpZGUoKTsgXG5cdCAgICBcdFx0fVxuICAgIFx0XHR9XG4gICAgXHR9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBnZW5lcmF0ZSBpbml0aWFsIG1hcmt1cFxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2V0IF9tYXJrdXAoKSB7XG4gICAgXHR2YXIgaHRtbCA9IFtcbiAgICBcdFx0JzxkaXYgZGF0YS1sYXlvdXRlbGVtZW50dG9vbGJhciBjbGFzcz1cInRvb2xiYXIgYWN0aW9uc1wiPicsXG4gICAgXHRcdCc8L2Rpdj4nXG4gICAgXHRdO1xuICAgIFx0XG4gICAgXHRyZXR1cm4gJChodG1sLmpvaW4oJycpKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogRGVzdHJveXMgdGhlIGxheW91dGVsZW1lbnR0b29sYmFyJ3Mgc2VjdGlvbnMuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZGVzdHJveVNlY3Rpb25zKCkge1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBEZXN0cm95cyB0aGUgbGF5b3V0ZWxlbWVudHRvb2xiYXIuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCcqJykub2ZmKCcucGwubGF5b3V0ZWxlbWVudHRvb2xiYXInKTtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJy5wbC5sYXlvdXRlbGVtZW50dG9vbGJhcicpO1xuICAgICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZSgpO1xuICAgIH1cblx0XG59XG5cbkxheW91dGVsZW1lbnR0b29sYmFyLmRlZmF1bHRzID0ge1xuXHRzZWN0aW9uczogW1xuXHRcdExheW91dHRvb2xiYXJzZWN0aW9uTGF5b3V0cm93LFxuXHRcdExheW91dHRvb2xiYXJzZWN0aW9uTGF5b3V0Y29sdW1uLFxuXHRcdExheW91dHRvb2xiYXJzZWN0aW9uUGF0dGVyblxuXHRdXG59O1xuXG4vL1BMRm91bmRhdGlvbi5wbHVnaW4oTGF5b3V0ZWxlbWVudHRvb2xiYXIsICdMYXlvdXRlbGVtZW50dG9vbGJhcicpO1xucGF0dGVybmxpYnJhcnkucGx1Z2luKExheW91dGVsZW1lbnR0b29sYmFyLCAnTGF5b3V0ZWxlbWVudHRvb2xiYXInKTtcblxuaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJykge1xuXHQvLyByZXF1aXJlL0FNRCBtb2R1bGUgZGVmaW5pdGlvblxuXHRkZWZpbmUoW10sIChyZXF1aXJlLCBleHBvcnRzLCBtb2R1bGUpID0+IHtcblx0XHRyZXR1cm4gTGF5b3V0ZWxlbWVudHRvb2xiYXI7XG5cdH0pO1xufSIsIi8qKlxuICogTGF5b3V0cGF0dGVybiBtb2R1bGUuXG4gKiBAbW9kdWxlIHBhdHRlcm5saWJyYXJ5LmxheW91dHBhdHRlcm5cbiAqIFxuICogQHJlcXVpcmVzIHBhdHRlcm5saWJyYXJ5LkxheW91dGVsZW1lbnRcbiAqL1xuY2xhc3MgTGF5b3V0cGF0dGVybiBleHRlbmRzIExheW91dGVsZW1lbnQge1xuXG5cdGdldCBjbGFzc25hbWUgKCkgeyByZXR1cm4gJ2xheW91dHBhdHRlcm4nOyB9XG5cdFxufVxuXG5cbi8vUExGb3VuZGF0aW9uLnBsdWdpbihMYXlvdXRwYXR0ZXJuLCAnTGF5b3V0cGF0dGVybicpO1xucGF0dGVybmxpYnJhcnkucGx1Z2luKExheW91dHBhdHRlcm4sICdMYXlvdXRwYXR0ZXJuJyk7XG5cbiIsIi8qKlxuICogTGF5b3V0cm93IG1vZHVsZS5cbiAqIEBtb2R1bGUgcGxmb3VuZGF0aW9uLmxheW91dHJvd1xuICogXG4gKiBAcmVxdWlyZXMgcGxmb3VuZGF0aW9uLkxheW91dGVsZW1lbnRcbiAqL1xuY2xhc3MgTGF5b3V0cm93IGV4dGVuZHMgTGF5b3V0ZWxlbWVudCB7XG5cblx0Z2V0IGNsYXNzbmFtZSAoKSB7IHJldHVybiAnbGF5b3V0cm93JzsgfVxuXHRcbn1cblxuXG4vL1BMRm91bmRhdGlvbi5wbHVnaW4oTGF5b3V0cm93LCAnTGF5b3V0cm93Jyk7XG5wYXR0ZXJubGlicmFyeS5wbHVnaW4oTGF5b3V0cm93LCAnTGF5b3V0cm93Jyk7XG5cbiIsIi8qKlxuICogTGF5b3V0dG9vbGJhcmFjdGlvbiBtb2R1bGUuXG4gKiBAbW9kdWxlIHBhdHRlcm5saWJyYXJ5LmxheW91dHRvb2xiYXJhY3Rpb25cbiAqIFxuICogQHJlcXVpcmVzIHBhdHRlcm5saWJyYXJ5LlBsdWdpblxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24uVHJpZ2dlcnNcbiAqL1xuY2xhc3MgTGF5b3V0dG9vbGJhcmFjdGlvbiBleHRlbmRzIFBsdWdpbiB7XG5cbiAgICAvKipcbiAgICAgKiBTZXR1cCBhIG5ldyBpbnN0YW5jZSBvZiBhIGxheW91dHRvb2xiYXJhY3Rpb24uXG4gICAgICogQGNsYXNzXG4gICAgICogQG5hbWUgTGF5b3V0dG9vbGJhcmFjdGlvblxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYSBsYXlvdXR0b29sYmFyYWN0aW9uLlxuICAgICAqICAgICAgICBPYmplY3Qgc2hvdWxkIGJlIG9mIHRoZSBsYXlvdXR0b29sYmFyYWN0aW9uIHBhbmVsLCByYXRoZXIgdGhhbiBpdHMgYW5jaG9yLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICAgKi9cblx0X3NldHVwKGVsZW1lbnQsIG9wdGlvbnMpIHtcblx0XHRpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dHRvb2xiYXJhY3Rpb24gaW5pdDonLCBvcHRpb25zKTtcbiAgICBcdHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgTGF5b3V0dG9vbGJhcmFjdGlvbi5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICdsYXlvdXR0b29sYmFyYWN0aW9uJzsgLy8gaWU5IGJhY2sgY29tcGF0XG5cbiAgICAgICAgLy8gVHJpZ2dlcnMgaW5pdCBpcyBpZGVtcG90ZW50LCBqdXN0IG5lZWQgdG8gbWFrZSBzdXJlIGl0IGlzIGluaXRpYWxpemVkXG4gICAgICAgIFBMRm91bmRhdGlvbi5UcmlnZ2Vycy5pbml0KCQpO1xuXG4gICAgICAgIHRoaXMuX2luaXQoKTtcblxuICAgICAgICAvLyAobWF5YmUsIHRoaXMgbGluZSBpcyBub3QgbmVzc2Vzc2FyeSBhbnltb3JlLi4uPyEpXG4gICAgICAgIC8vUExGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdMYXlvdXR0b29sYmFyYWN0aW9uJyk7XG4gICAgICAgIFxuICAgICAgICBpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dHRvb2xiYXJhY3Rpb24gaW5pdGlhbGl6ZWQnKTtcbiAgICB9XG5cdFxuXHQvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgcGx1Z2luIGJ5IHNldHRpbmcvY2hlY2tpbmcgb3B0aW9ucyBhbmQgYXR0cmlidXRlcywgYWRkaW5nIGhlbHBlciB2YXJpYWJsZXMsIGFuZCBzYXZpbmcgdGhlIGFuY2hvci5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0KCkge1xuICAgIFx0aWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMudHlwZSA9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBcdHRocm93IChuZXcgTGF5b3V0YnVpbGRlckV4Y2VwdGlvbignbm8gdHlwZSBnaXZlbiBmb3IgdG9vbGJhciBhY3Rpb24nKSkudG9TdHJpbmcoKTtcbiAgICBcdH1cbiAgICBcdGlmICggKHRoaXMub3B0aW9ucy50eXBlID09ICdhY3Rpb24nKSAmJiAodHlwZW9mIHRoaXMub3B0aW9ucy5hY3Rpb24gPT0gJ3VuZGVmaW5lZCcpICkge1xuICAgICAgICBcdHRocm93IChuZXcgTGF5b3V0YnVpbGRlckV4Y2VwdGlvbignbm8gYWN0aW9uLWlkIGdpdmVuIGZvciB0b29sYmFyIGFjdGlvbicpKS50b1N0cmluZygpO1xuICAgIFx0fVxuICAgIFx0XG5cdCAgICB0aGlzLl9ldmVudHMoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVycyB0byB0aGUgZWxlbWVudCB1dGlsaXppbmcgdGhlIHRyaWdnZXJzIHV0aWxpdHkgbGlicmFyeS5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9ldmVudHMoKSB7XG4gICAgXHR0aGlzLl9hZGRJbml0SGFuZGxlcigpO1xuICAgIFx0aWYgKCB0aGlzLm9wdGlvbnMuZXZlbnRzICYmICh0eXBlb2YgdGhpcy5vcHRpb25zLmV2ZW50cy5jbGljayA9PSAnZnVuY3Rpb24nKSApIHtcbiAgICAgICAgXHR0aGlzLl9hZGRDbGlja0hhbmRsZXIodGhpcy5vcHRpb25zLmV2ZW50cy5jbGljayk7XG4gICAgXHR9XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIEFkZHMgaW5pdGlhbHphdGlvbiBldmVudCBsaXN0ZW5lcnNcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRJbml0SGFuZGxlcigpIHtcbiAgICBcdHZhciAkdGhpcyA9IHRoaXM7XG4gICAgXHR0aGlzLiRlbGVtZW50XG4gICAgXHQgICAgLm9mZignaW5pdGlhbGl6ZWQucGwubGF5b3V0dG9vbGJhcmFjdGlvbicpXG4gICAgXHQgICAgLm9uKCdpbml0aWFsaXplZC5wbC5sYXlvdXR0b29sYmFyYWN0aW9uJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBcdCAgICBcdC8vJHRoaXMuX2luaXRJdGVtcy5hcHBseSgkdGhpcyk7XG4gICAgXHQgICAgfSk7XG4gICAgfVxuXG4gICAgX2FkZENsaWNrSGFuZGxlciAoY2xpY2tIYW5kbGVyKSB7XG4gICAgXHRpZiAoIGNsaWNrSGFuZGxlciAmJiAodHlwZW9mIGNsaWNrSGFuZGxlciA9PSAnZnVuY3Rpb24nKSApIHtcbiAgICBcdCAgICB0aGlzLiRlbGVtZW50Lm9mZignY2xpY2sucGwubGF5b3V0dG9vbGJhcmFjdGlvbicpLm9uKCdjbGljay5wbC5sYXlvdXR0b29sYmFyYWN0aW9uJywgY2xpY2tIYW5kbGVyKTtcbiAgICBcdH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBnZW5lcmF0ZSBpbml0aWFsIG1hcmt1cFxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2V0IF9tYXJrdXAoKSB7XG4gICAgXHR2YXIgaHRtbCA9IFtcblx0XHQgICAgYDxhIGNsYXNzPVwiYnV0dG9uIHNtYWxsXCIgaHJlZj1cIiR7dGhpcy5vcHRpb25zLmFjdGlvbn1cIiB0aXRsZT1cIiR7dGhpcy5vcHRpb25zLmxhYmVsfVwiIGRhdGEtbGF5b3V0dG9vbGJhcmFjdGlvbj5gLFxuXHRcdCAgICAgICAgYDxpIGNsYXNzPVwiJHt0aGlzLm9wdGlvbnMuaWNvbn1cIj48L2k+YCxcblx0XHQgICAgICAgIGA8c3BhbiBjbGFzcz1cImhpZGUtZm9yLXNtYWxsIHNob3ctZm9yLXh4bGFyZ2VcIj4gJHt0aGlzLm9wdGlvbnMubGFiZWx9PC9zcGFuPmAsXG5cdFx0ICAgICc8L2E+J1xuICAgIFx0XTtcbiAgICBcdFxuICAgIFx0cmV0dXJuICQoaHRtbC5qb2luKCcnKSk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIHJldHVybiBpbml0aWFsIG1hcmt1cCBlbGVtZW50c1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuICAgIHRvRWxlbWVudChzZWN0aW9uY29uZmlnKSB7XG4gICAgXHR2YXIgY3VycmVudE9wdGlvbnMgPSAodGhpcy5vcHRpb25zKTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIHRoaXMub3B0aW9ucywgc2VjdGlvbmNvbmZpZyk7XG4gICAgXHR2YXIgJGVsZW1lbnQgPSAkKHRoaXMudG9TdHJpbmcoKSk7XG4gICAgXHR0aGlzLm9wdGlvbnMgPSBjdXJyZW50T3B0aW9ucztcbiAgICBcdHJldHVybiAkZWxlbWVudDtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogRGVzdHJveXMgdGhlIGxheW91dHRvb2xiYXJhY3Rpb24uXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICovXG4gICAgX2Rlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnKicpLm9mZignLnBsLmxheW91dHRvb2xiYXJhY3Rpb24nKTtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJy5wbC5sYXlvdXR0b29sYmFyYWN0aW9uJyk7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlKCk7XG4gICAgfVxuXHRcbn1cblxucGF0dGVybmxpYnJhcnkucGx1Z2luKExheW91dHRvb2xiYXJhY3Rpb24sICdMYXlvdXR0b29sYmFyYWN0aW9uJyk7XG5cbiIsIi8qKlxuICogTGF5b3V0dG9vbGJhcnNlY3Rpb24gbW9kdWxlLlxuICogQG1vZHVsZSBwbGZvdW5kYXRpb24ubGF5b3V0dG9vbGJhcnNlY3Rpb25cbiAqIFxuICogQHJlcXVpcmVzIHBhdHRlcm5saWJyYXJ5LlBsdWdpblxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24uVHJpZ2dlcnNcbiAqL1xuY2xhc3MgTGF5b3V0dG9vbGJhcnNlY3Rpb24gZXh0ZW5kcyBQbHVnaW4ge1xuXG4gICAgLyoqXG4gICAgICogU2V0dXAgYSBuZXcgaW5zdGFuY2Ugb2YgYSBsYXlvdXR0b29sYmFyc2VjdGlvbi5cbiAgICAgKiBAY2xhc3NcbiAgICAgKiBAbmFtZSBMYXlvdXR0b29sYmFyc2VjdGlvblxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYSBsYXlvdXR0b29sYmFyc2VjdGlvbi5cbiAgICAgKiAgICAgICAgT2JqZWN0IHNob3VsZCBiZSBvZiB0aGUgbGF5b3V0dG9vbGJhcnNlY3Rpb24gcGFuZWwsIHJhdGhlciB0aGFuIGl0cyBhbmNob3IuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgICAqL1xuXHRfc2V0dXAoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIFx0dGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBMYXlvdXR0b29sYmFyc2VjdGlvbi5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICdsYXlvdXR0b29sYmFyc2VjdGlvbic7IC8vIGllOSBiYWNrIGNvbXBhdFxuXG4gICAgICAgIC8vIFRyaWdnZXJzIGluaXQgaXMgaWRlbXBvdGVudCwganVzdCBuZWVkIHRvIG1ha2Ugc3VyZSBpdCBpcyBpbml0aWFsaXplZFxuICAgICAgICBQTEZvdW5kYXRpb24uVHJpZ2dlcnMuaW5pdCgkKTtcblxuICAgICAgICB0aGlzLl9pbml0KCk7XG5cbiAgICAgICAgLy8gKG1heWJlLCB0aGlzIGxpbmUgaXMgbm90IG5lc3Nlc3NhcnkgYW55bW9yZS4uLj8hKVxuICAgICAgICAvL1BMRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnTGF5b3V0dG9vbGJhcnNlY3Rpb24nKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0dG9vbGJhcnNlY3Rpb24gaW5pdGlhbGl6ZWQnKTtcbiAgICB9XG5cdFxuXHRcbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZSBhY3Rpb24gaXRlbXMnIGNvbnRhaW5lciBlbGVtZW50XG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblx0Z2V0IF9jb250YWluZXIoKSB7XG5cdFx0cmV0dXJuICh0aGlzLiRlbGVtZW50LmZpbmQoYD4gJHt0aGlzLm9wdGlvbnMuc2VjdGlvbmNvbnRhaW5lci50YWd9YCkpO1xuXHR9XG5cdFxuXHQvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgcGx1Z2luIGJ5IHNldHRpbmcvY2hlY2tpbmcgb3B0aW9ucyBhbmQgYXR0cmlidXRlcywgYWRkaW5nIGhlbHBlciB2YXJpYWJsZXMsIGFuZCBzYXZpbmcgdGhlIGFuY2hvci5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0KCkge1xuXHQgICAgdGhpcy5fZXZlbnRzKCk7XG4gICAgfVxuICAgIFxuICAgIF9pbml0SXRlbXMoKSB7XG4gICAgXHR2YXIgJHRoaXMgPSB0aGlzO1xuICAgICAgICAkLm1ha2VBcnJheSgkKHRoaXMub3B0aW9ucy5pdGVtcykubWFwKChpZHgsIGl0ZW0pID0+IHtcbiAgICAgICAgXHR2YXIgJGl0ZW07XG4gICAgICAgIFx0c3dpdGNoIChpdGVtLnR5cGUpe1xuXHQgICAgICAgIFx0Y2FzZSAnc2VwYXJhdG9yJyA6IHtcblx0ICAgICAgICBcdFx0JGl0ZW0gPSAkKFtcblx0ICAgICAgICBcdFx0XHRgPCR7JHRoaXMub3B0aW9ucy5pdGVtY29udGFpbmVyLnRhZ30gY2xhc3M9XCJtZW51LXNlcGFyYXRvciAkeyR0aGlzLm9wdGlvbnMuaXRlbWNvbnRhaW5lci5jbGFzc25hbWVzLmpvaW4oJyAnKX1cIj5gLFxuXHQgICAgICAgIFx0XHRcdCAgICAgYDxzcGFuPiZuYnNwOzwvc3Bhbj5gLFxuXHQgICAgICAgIFx0XHRcdGA8LyR7JHRoaXMub3B0aW9ucy5pdGVtY29udGFpbmVyLnRhZ30+YFxuXHQgICAgICAgIFx0ICAgIF0uam9pbignJykpO1xuXHQgICAgICAgIFx0XHRicmVhaztcblx0ICAgICAgICBcdH1cblx0ICAgICAgICBcdGNhc2UgJ2FjdGlvbicgOlxuXHQgICAgICAgIFx0ZGVmYXVsdCA6IHtcblx0ICAgICAgICBcdFx0JGl0ZW0gPSAkKFtcblx0ICAgICAgICBcdFx0XHRgPCR7JHRoaXMub3B0aW9ucy5pdGVtY29udGFpbmVyLnRhZ30gY2xhc3M9XCIkeyR0aGlzLm9wdGlvbnMuaXRlbWNvbnRhaW5lci5jbGFzc25hbWVzLmpvaW4oJyAnKX1cIiAkeyR0aGlzLm9wdGlvbnMuaXRlbWNvbnRhaW5lci5hdHRyaWJ1dGVzLmpvaW4oJyAnKX0+YCxcblx0ICAgICAgICBcdFx0XHRgPC8keyR0aGlzLm9wdGlvbnMuaXRlbWNvbnRhaW5lci50YWd9PmBcblx0ICAgICAgICBcdFx0XVxuXHQgICAgICAgIFx0XHQuam9pbignJykpXG5cdCAgICAgICAgXHRcdC5hcHBlbmQoXG5cdCAgICAgICAgXHRcdFx0TGF5b3V0dG9vbGJhcmFjdGlvbi5wcm90b3R5cGUudG9FbGVtZW50KGl0ZW0pXG5cdCAgICAgICAgXHRcdCk7XG5cdCAgICAgICAgXHR9XG4gICAgICAgIFx0fVxuICAgICAgICBcdGlmICgkaXRlbSAmJiAkaXRlbS5maW5kKCc+IGE6Zmlyc3QtY2hpbGQnKSkge1xuICAgICAgICBcdFx0JGl0ZW0uZmluZCgnPiBhOmZpcnN0LWNoaWxkJykuZGF0YSggJ3BhdHRlcm5saWJyYXJ5UGx1Z2luJywgbmV3IExheW91dHRvb2xiYXJhY3Rpb24gKCRpdGVtLmZpbmQoJz4gYTpmaXJzdC1jaGlsZCcpLCBpdGVtKSApO1xuICAgICAgICBcdFx0dGhpcy5fY29udGFpbmVyLmFwcGVuZCggJGl0ZW0gKTtcbiAgICAgICAgXHRcdFxuICAgICAgICAgICAgICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0dG9vbGJhcnNlY3Rpb24gaXRlbSBpbml0aWFsaXplZDogJywgJGl0ZW0uY2hpbGRyZW4oKS5maXJzdCgpKTtcbiAgICAgICAgXHRcdC8vJGl0ZW0uY2hpbGRyZW4oKS5maXJzdCgpLnRyaWdnZXIoJ2luaXRpYWxpemVkJyk7XG4gICAgICAgIFx0fVxuICAgICAgICB9KSk7XG4gICAgXHRcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVycyB0byB0aGUgZWxlbWVudCB1dGlsaXppbmcgdGhlIHRyaWdnZXJzIHV0aWxpdHkgbGlicmFyeS5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9ldmVudHMoKSB7XG4gICAgXHR0aGlzLl9hZGRJbml0SGFuZGxlcigpO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBBZGRzIGluaXRpYWx6YXRpb24gZXZlbnQgbGlzdGVuZXJzXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkSW5pdEhhbmRsZXIoKSB7XG4gICAgXHR2YXIgJHRoaXMgPSB0aGlzO1xuICAgIFx0dGhpcy4kZWxlbWVudFxuICAgIFx0ICAgIC5vZmYoJ2luaXRpYWxpemVkLnBsLmxheW91dHRvb2xiYXJzZWN0aW9uJylcbiAgICBcdCAgICAub24oJ2luaXRpYWxpemVkLnBsLmxheW91dHRvb2xiYXJzZWN0aW9uJywgKGUpID0+IHtcbiAgICBcdCAgICBcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0dG9vbGJhcnNlY3Rpb24gaW5pdCBoYW5kbGVyJyk7XG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBcdCR0aGlzLl9hZGRGb2N1c0hhbmRsZXIoKTtcbiAgICBcdCAgICBcdCR0aGlzLl9pbml0SXRlbXMuYXBwbHkoJHRoaXMpO1xuICAgIFx0ICAgIH0pO1xuICAgIH1cblxuICAgIF9hZGRDbGlja0hhbmRsZXIgKCkge1xuICAgIFx0dmFyIF90aGlzID0gdGhpcztcbiAgICBcdFxuICAgIFx0dmFyICRmdWxsc2NyZWVuVG9nZ2xlciA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW2hyZWY9XCIjc3dpdGNoX2Z1bGxzY3JlZW5cIl0nKTtcblx0ICAgICRmdWxsc2NyZWVuVG9nZ2xlci5vZmYoJ2NsaWNrLnBsLmxheW91dHRvb2xiYXJzZWN0aW9uJykub24oJ2NsaWNrLnBsLmxheW91dHRvb2xiYXJzZWN0aW9uJywgKGUpID0+IHtcblx0ICAgIFx0dmFyICRsYXlvdXRib2R5ID0gJCgnW2RhdGEtbGF5b3V0Ym9keV0nKTtcblx0ICAgIFx0JGxheW91dGJvZHkuZGF0YSgncGF0dGVybmxpYnJhcnlQbHVnaW4nKS5zd2l0Y2hGdWxsc2NyZWVuKCk7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHQgICAgICAgIGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0dG9vbGJhcnNlY3Rpb24gZnVsbHNjcmVlbiBzd2l0Y2ggY2xpY2snKTtcblx0XHR9KTtcblx0ICAgIFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgZm9jdXMgaGFuZGxlcnMgZm9yIGxheW91dHRvb2xiYXJzZWN0aW9uLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZEZvY3VzSGFuZGxlcigpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIFx0dmFyICRidWlsZGVyID0gdGhpcy5fYnVpbGRlcjtcbiAgICBcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0dG9vbGJhcnNlY3Rpb24gZWxlbWVudCBmb2N1cyBoYW5kbGVyIGJ1aWxkZXI6JywgJGJ1aWxkZXIpO1xuICAgICAgICBpZiAoJCgnW2RhdGEtbGF5b3V0YnVpbGRlcl0nKSkge1xuICAgIFx0ICAgICQoJ1tkYXRhLWxheW91dGJ1aWxkZXJdJylcblx0ICAgICAgICAgICAgLm9mZignZm9jdXNlZC5wbC5sYXlvdXRlbGVtZW50Jylcblx0ICAgICAgICAgICAgLm9uKCdmb2N1c2VkLnBsLmxheW91dGVsZW1lbnQnLCAnW2RhdGEtbGF5b3V0cm93XSxbZGF0YS1sYXlvdXRjb2x1bW5dJyAsIGZ1bmN0aW9uKGUpe1xuXHRcblx0ICAgICAgICAgICAgXHRpZiAocGF0dGVybmxpYnJhcnkuZGVidWcoKSkgY29uc29sZS5sb2coJ2xheW91dHRvb2xiYXJzZWN0aW9uIGVsZW1lbnQgZm9jdXMgaGFuZGxlcjonLCB0aGlzLCBlKTtcblx0ICAgICAgICBcdCAgICBfdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdmb2N1c2NoYW5nZS5wbC5sYXlvdXR0b29sYmFyc2VjdGlvbicpO1xuXG5cdCAgICAgICAgICAgIFx0aWYgKF90aGlzLl9idWlsZGVyIGluc3RhbmNlb2YgTGF5b3V0YnVpbGRlcikge1xuXHQgICAgICAgICAgICAgICAgICAgIF90aGlzLl9idWlsZGVyLnN3aXRjaFRvb2xiYXJzZWN0aW9ucy5hcHBseShfdGhpcywgW2UuY3VycmVudFRhcmdldF0pO1xuXHQgICAgICAgICAgICBcdH1cblx0ICAgICAgICAgICAgXHRcblx0ICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblx0ICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdCAgICAgICAgICAgIH0pO1xuICAgIFx0ICAgICQoJ1tkYXRhLWxheW91dGJ1aWxkZXInKVxuXHRcdCAgICAgICAgLm9mZigndW5mb2N1c2VkLnBsLmxheW91dGVsZW1lbnQnKVxuXHRcdCAgICAgICAgLm9uKCd1bmZvY3VzZWQucGwubGF5b3V0ZWxlbWVudCcsICdbZGF0YS1sYXlvdXRyb3ddLFtkYXRhLWxheW91dGNvbHVtbl0nICwgZnVuY3Rpb24oZSl7XG5cdFx0XG5cdFx0ICAgICAgICBcdGlmIChwYXR0ZXJubGlicmFyeS5kZWJ1ZygpKSBjb25zb2xlLmxvZygnbGF5b3V0dG9vbGJhcnNlY3Rpb24gZWxlbWVudCBmb2N1cyBoYW5kbGVyOicsIHRoaXMsIGUpO1xuXHRcdCAgICBcdCAgICBfdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdmb2N1c2NoYW5nZS5wbC5sYXlvdXR0b29sYmFyc2VjdGlvbicpO1xuXG5cdCAgICAgICAgICAgIFx0aWYgKF90aGlzLl90b29sYmFyIGluc3RhbmNlb2YgTGF5b3V0dG9vbGJhcikge1xuXHRcdCAgICAgICAgICAgICAgICBfdGhpcy5fdG9vbGJhci5oaWRlU2VjdGlvbnMoKTtcblx0ICAgICAgICAgICAgXHR9XG5cdCAgICAgICAgICAgIFx0XG5cdFx0ICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdCAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0ICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBnZW5lcmF0ZSBpbml0aWFsIG1hcmt1cFxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2V0IF9tYXJrdXAoKSB7XG4gICAgXHR2YXIgaHRtbCA9IFtcbiAgICBcdFx0YDxkaXYgZGF0YS1sYXlvdXR0b29sYmFyc2VjdGlvbiByZWw9XCIke3RoaXMub3B0aW9ucy5uYW1lfVwiPmAsXG5cdFx0ICAgICAgICBgPCR7dGhpcy5vcHRpb25zLnNlY3Rpb25jb250YWluZXIudGFnfSBjbGFzcz1cIiR7dGhpcy5vcHRpb25zLnNlY3Rpb25jb250YWluZXIuY2xhc3NuYW1lcy5qb2luKCcgJyl9XCIgJHt0aGlzLm9wdGlvbnMuc2VjdGlvbmNvbnRhaW5lci5hdHRyaWJ1dGVzLmpvaW4oJyAnKX0+YCxcbiAgICBcdFx0ICAgICAgICBgPGxpIGNsYXNzPVwiJHt0aGlzLm9wdGlvbnMuc2VjdGlvbmNvbnRhaW5lci5sYWJlbC5jbGFzc25hbWVzLmpvaW4oJyAnKX1cIiByb2xlPVwibWVudWl0ZW1cIj4ke3VjZmlyc3QodGhpcy5vcHRpb25zLm5hbWUpfTo8L2xpPmAsXG4gICAgXHRcdCAgICAgICAgLy8gaXRlbXMgZm9sbG93IGhlcmUuLi5cbiAgICBcdFx0ICAgIGA8LyR7dGhpcy5vcHRpb25zLnNlY3Rpb25jb250YWluZXIudGFnfT5gLFxuICAgIFx0XHQnPC9kaXY+J1xuICAgIFx0XTtcbiAgICBcdFxuICAgIFx0cmV0dXJuICQoaHRtbC5qb2luKCcnKSk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIHJldHVybiBpbml0aWFsIG1hcmt1cCBlbGVtZW50c1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuICAgIHRvRWxlbWVudChzZWN0aW9uY29uZmlnKSB7XG4gICAgXHR2YXIgY3VycmVudE9wdGlvbnMgPSAodGhpcy5vcHRpb25zKTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIExheW91dHRvb2xiYXJzZWN0aW9uLmRlZmF1bHRzLCB0aGlzLm9wdGlvbnMsIHNlY3Rpb25jb25maWcpO1xuICAgIFx0dmFyICRlbGVtZW50ID0gJCh0aGlzLnRvU3RyaW5nKCkpO1xuICAgIFx0dGhpcy5vcHRpb25zID0gY3VycmVudE9wdGlvbnM7XG4gICAgXHRyZXR1cm4gJGVsZW1lbnQ7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIERlc3Ryb3lzIHRoZSBsYXlvdXR0b29sYmFyc2VjdGlvbi5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cbiAgICBfZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCcqJykub2ZmKCcucGwubGF5b3V0dG9vbGJhcnNlY3Rpb24nKTtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJy5wbC5sYXlvdXR0b29sYmFyc2VjdGlvbicpO1xuICAgICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZSgpO1xuICAgIH1cblx0XG59XG5cbkxheW91dHRvb2xiYXJzZWN0aW9uLmRlZmF1bHRzID0ge1xuXHRcblx0c2VjdGlvbmNvbnRhaW5lciA6IHtcblx0XHR0YWcgICAgICAgOiAndWwnLFxuXHRcdGNsYXNzbmFtZXM6IFsnZHJvcGRvd24nLCdtZW51J10sXG5cdFx0YXR0cmlidXRlczogWydkYXRhLWRyb3Bkb3duLW1lbnUnXSxcbiAgICAgICAgbGFiZWwgICAgIDoge1xuICAgIFx0XHRjbGFzc25hbWVzOiBbJ21lbnUtdGV4dCddXG4gICAgICAgIH1cblx0fSxcblx0aXRlbWNvbnRhaW5lciA6IHtcblx0XHR0YWcgICAgICAgOiAnbGknLFxuXHRcdGNsYXNzbmFtZXM6IFtdLFxuXHRcdGF0dHJpYnV0ZXM6IFsncm9sZT1cIm1lbnVpdGVtXCInXVxuXHR9XG59O1xuXG5wYXR0ZXJubGlicmFyeS5wbHVnaW4oTGF5b3V0dG9vbGJhcnNlY3Rpb24sICdMYXlvdXR0b29sYmFyc2VjdGlvbicpO1xuXG4iLCIvKipcbiAqIGluaXRpYWxpemUgbW9kYWwgWEhSIHRyaWdnZXJzIGFuZCB3YXRjaCBmb3IgbW9kYWwgWEhSIGZvcm1zXG4gKi9cbjsoZnVuY3Rpb24gKCQsIHdpbmRvdywgZG9jdW1lbnQsIHBhdHRlcm5saWJyYXJ5LCB1bmRlZmluZWQpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgaWYgKCh0eXBlb2YgJC5mbi5tb2RhbCA9PSAndW5kZWZpbmVkJykgJiYgKHR5cGVvZiBQTEZvdW5kYXRpb24uUmV2ZWFsID09ICd1bmRlZmluZWQnKSkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2pRdWVyeSBNb2RhbCBhbmQvb3IgUExGb3VuZGF0aW9uIFJldmVhbCBwbHVnLWlucyBub3QgZm91bmQuLi4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgJGJvZHkgPSAkKGRvY3VtZW50KSxcbiAgICAgICAgJGFqYXhCdXR0b25zICA9IHBhdHRlcm5saWJyYXJ5LkNvbmZpZy54aHJTZWxlY3RvcnMueGhyQnV0dG9ucywgLy8gXCJBLmJ0bltocmVmKj0nYWRkJ10sIEEuYnRuW2hyZWYqPSdlZGl0J10sIEEuYnRuW2hyZWYqPSdkZXRhaWxzJ10sIEEuYnRuW2hyZWYqPSdkZWxldGUnXVwiLFxuICAgICAgICAkYWpheENUQU9wZW4gID0gcGF0dGVybmxpYnJhcnkuQ29uZmlnLnhoclNlbGVjdG9ycy54aHJDVEFPcGVuLCAvLyBcIkEuYnRuLWN0YS14aHIuY3RhLXhoci1tb2RhbFwiLFxuICAgICAgICAkYWpheENUQUNsb3NlID0gcGF0dGVybmxpYnJhcnkuQ29uZmlnLnhoclNlbGVjdG9ycy54aHJDVEFDbG9zZSwgLy8gXCIubW9kYWwtY29udGVudCAuYnRuLWN0YS14aHItY2xvc2UsIC5tb2RhbC1jb250ZW50IC5hbGVydCwgLm1vZGFsLWNvbnRlbnQgLmNsb3NlLCAubW9kYWwtY29udGVudCAuY3RhLXhoci1tb2RhbC1jbG9zZVwiLFxuICAgICAgICAkYWpheEZvcm1zICAgID0gcGF0dGVybmxpYnJhcnkuQ29uZmlnLnhoclNlbGVjdG9ycy54aHJGb3JtcyAvLyBcIi5tb2RhbC1jb250ZW50IC5mb3JtLXhoclwiXG4gICAgO1xuICAgIFxuICAgIC8vXG4gICAgLy8gbW9kYWwgdHJpZ2dlcnNcbiAgICAvL1xuICAgIHZhciBoYW5kbGVyX2luaXRYSFJNb2RhbFRyaWdnZXIgPSBmdW5jdGlvbiAob0V2ZW50KSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxuICAgICAgICAgICAgJGJ0blVybCA9ICR0aGlzLmF0dHIoJ2hyZWYnKTtcbiAgICAgICAgXG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICBoZWFkZXJzIDoge1xuICAgICAgICAgICAgICAgICdBY2NlcHQnIDogJ3RleHQvaHRtbCcsXG4gICAgICAgICAgICAgICAgJ1gtbGF5b3V0JyA6ICdtb2RhbCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0eXBlICAgIDogXCJHRVRcIixcbiAgICAgICAgICAgIGNhY2hlICAgIDogZmFsc2UsXG4gICAgICAgICAgICB1cmwgICAgICAgIDogJHRoaXMuYXR0cignaHJlZicpLFxuICAgICAgICAgICAgc3VjY2VzcyAgICA6IGZ1bmN0aW9uIChkYXRhKSB7XG5cbiAgICAgICAgICAgICAgICBwYXR0ZXJubGlicmFyeS5Nb2RhbC5vcGVuKGRhdGEsICRidG5VcmwpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCAodHlwZW9mICQuZm4uZGF0YVRhYmxlICE9ICd1bmRlZmllbmVkJykgKSB7XG4gICAgICAgICAgICAgICAgICAgICQoJy5kYXRhdGFibGUuY3J1ZCcpLmRhdGFUYWJsZSgpLmFwaSgpLmFqYXgucmVsb2FkKGZ1bmN0aW9uICggdGFibGVkYXRhICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coIHRhYmxlZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgb0V2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIG9FdmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgb0V2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICByZXR1cm4gKGZhbHNlKTtcbiAgICAgICAgXG4gICAgfTsgXG5cbiAgICAvL1xuICAgIC8vIG1vZGFsIGZvcm1zXG4gICAgLy9cbiAgICB2YXIgaGFuZGxlcl9pbml0WEhSTW9kYWxGb3JtID0gZnVuY3Rpb24gKG9FdmVudCkge1xuICAgICAgICB2YXIgJGZvcm0gPSAkKHRoaXMpLFxuICAgICAgICAgICAgZm9ybVVSTCA9ICRmb3JtLmF0dHIoJ2FjdGlvbicpLFxuICAgICAgICAgICAgZm9ybURhdGEgPSAkZm9ybS5zZXJpYWxpemVBcnJheSgpXG4gICAgICAgIDtcbiAgICAgICAgXG4gICAgICAgIGZvcm1EYXRhLnB1c2goIFxuICAgICAgICAgICAgKCRmb3JtLmZpbmQoJ2lucHV0W25hbWU9ZGVsXS5idG4nKS5zaXplKCkgPiAwKSA/IHtuYW1lOiAnZGVsJywgdmFsdWU6ICdkZWxldGUnfSA6IG51bGwgXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgaGVhZGVycyA6IHtcbiAgICAgICAgICAgICAgICAnQWNjZXB0JyA6ICd0ZXh0L2h0bWwnLFxuICAgICAgICAgICAgICAgICdYLWxheW91dCcgOiAnbW9kYWwnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdHlwZSAgICA6IFwiUE9TVFwiLFxuICAgICAgICAgICAgY2FjaGUgICAgOiBmYWxzZSxcbiAgICAgICAgICAgIHVybCAgICAgICAgOiBmb3JtVVJMLFxuICAgICAgICAgICAgZGF0YSAgICA6IGZvcm1EYXRhLFxuICAgICAgICAgICAgc3VjY2VzcyAgICA6IGZ1bmN0aW9uIChkYXRhKSB7XG5cbiAgICAgICAgICAgICAgICBwYXR0ZXJubGlicmFyeS5Nb2RhbC5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIHBhdHRlcm5saWJyYXJ5Lk1vZGFsLm9wZW4oZGF0YSwgZm9ybVVSTCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKCAodHlwZW9mICQuZm4uZGF0YVRhYmxlICE9ICd1bmRlZmllbmVkJykgKSB7XG4gICAgICAgICAgICAgICAgICAgICQoJy5kYXRhdGFibGUuY3J1ZCcpLmRhdGFUYWJsZSgpLmFwaSgpLmFqYXgucmVsb2FkKGZ1bmN0aW9uICggdGFibGVkYXRhICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coIHRhYmxlZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgb0V2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIG9FdmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgb0V2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICByZXR1cm4gKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICAvLyBtb2RhbCBjbG9zZVxuICAgIC8vXG4gICAgdmFyIGhhbmRsZXJfY2xvc2VNb2RhbCA9IGZ1bmN0aW9uIChvRXZlbnQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBhdHRlcm5saWJyYXJ5Lk1vZGFsLmNsb3NlKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgIFxuICAgICAgICBvRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgb0V2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBvRXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHJldHVybiAoZmFsc2UpO1xuICAgIH07XG5cbiAgICAvL1xuICAgIC8vIHdhdGNoIERPTSBlbGVtZW50c1xuICAgIC8vXG4gICAgJGJvZHkub24oJ2NsaWNrLnBhdHRlcm5saWJyYXJ5Lnhocm1vZGFsb3BlbicsICAkYWpheENUQU9wZW4sICB7fSwgaGFuZGxlcl9pbml0WEhSTW9kYWxUcmlnZ2VyKTtcbiAgICAkYm9keS5vbignc3VibWl0LnBhdHRlcm5saWJyYXJ5Lnhocm1vZGFsc3VibWl0JywgJGFqYXhGb3JtcywgICAge30sIGhhbmRsZXJfaW5pdFhIUk1vZGFsRm9ybSk7XG4gICAgJGJvZHkub24oJ2NsaWNrLnBhdHRlcm5saWJyYXJ5Lnhocm1vZGFsY2xvc2UnLCAgJGFqYXhDVEFDbG9zZSwge30sIGhhbmRsZXJfY2xvc2VNb2RhbCk7XG5cbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG4gICAgICAgICQoJGFqYXhDVEFPcGVuKS5vbignY2xpY2sucGF0dGVybmxpYnJhcnkueGhybW9kYWxvcGVuJywgaGFuZGxlcl9pbml0WEhSTW9kYWxUcmlnZ2VyKTtcbiAgICAgICAgJCgkYWpheEZvcm1zKS5vbignc3VibWl0LnBhdHRlcm5saWJyYXJ5Lnhocm1vZGFsc3VibWl0JywgaGFuZGxlcl9pbml0WEhSTW9kYWxGb3JtKTtcbiAgICAgICAgJCgkYWpheENUQUNsb3NlKS5vbignY2xpY2sucGF0dGVybmxpYnJhcnkueGhybW9kYWxjbG9zZScsIGhhbmRsZXJfY2xvc2VNb2RhbCk7XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCwgd2luZG93LnBhdHRlcm5saWJyYXJ5KTtcbiIsIi8qKlxuICogdGhlbWUgYmFzZSBzZXR1cCAoWnVyYiBQTEZvdW5kYXRpb24pXG4gKiBcbiAqIHBhdHRlcm5saWJyYXJ5IGNsaWVudCAoaW5pdC0pc2NyaXB0XG4gKiAgIFxuICogQHBhY2thZ2UgICAgIFtwYXR0ZXJubGlicmFyeV1cbiAqIEBzdWJwYWNrYWdlICBwYXR0ZXJubGlicmFyeSBjbGllbnQgc2NyaXB0XG4gKiBAYXV0aG9yICAgICAgQmrDtnJuIEJhcnRlbHMgPGNvZGluZ0Biam9lcm5iYXJ0ZWxzLmVhcnRoPlxuICogQGxpbmsgICAgICAgIGh0dHBzOi8vZ2l0bGFiLmJqb2VybmJhcnRlbHMuZWFydGgvanMvcGF0dGVybmxpYnJhcnlcbiAqIEBsaWNlbnNlICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjAgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wXG4gKiBAY29weXJpZ2h0ICAgY29weXJpZ2h0IChjKSAyMDE2IEJqw7ZybiBCYXJ0ZWxzIDxjb2RpbmdAYmpvZXJuYmFydGVscy5lYXJ0aD5cbiAqL1xuXG5pZiAoIWpRdWVyeSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2pRdWVyeSBub3QgZm91bmQuLi4nKTtcbiAgICB3aW5kb3cuc3RvcCgpO1xufVxuXG5pZiAoISQuZm4ucGxmb3VuZGF0aW9uKSB7XG4gICAgY29uc29sZS5lcnJvcignUExGb3VuZGF0aW9uIG5vdCBmb3VuZC4uLicpO1xuICAgIHdpbmRvdy5zdG9wKCk7XG59XG5cbihmdW5jdGlvbiAoJCwgZG9jLCB3aW4sIHBhdHRlcm5saWJyYXJ5KSB7XG4gICAgXG4gICAgdmFyICRkb2MgPSAkKGRvYyksXG4gICAgICAgICRsYW5nID0gcGF0dGVybmxpYnJhcnkuQ29uZmlnLmxhbmdcbiAgICA7XG4gICAgcGF0dGVybmxpYnJhcnkuQ29uZmlnLmRlYnVnID0gdHJ1ZTtcbiAgICBcblx0Ly93aW5kb3cub250b3VjaG1vdmUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdC8vd2luZG93Lm9ub3JpZW50YXRpb25jaGFuZ2UgPSBmdW5jdGlvbigpIHsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgPSAwOyB9ICBcbiAgICAgICAgXG4gICAgLy9cbiAgICAvLyBpbml0IHBhdHRlcm5saWJyYXJ5IChmcm9udGVudClcbiAgICAvL1xuICAgICRkb2MucmVhZHkoZnVuY3Rpb24gKCkge1xuICAgIFx0XG4gICAgXHQkKGRvY3VtZW50KVxuICAgIFx0ICAgIC5wbGZvdW5kYXRpb24oKVxuICAgIFx0ICAgIC5wYXR0ZXJubGlicmFyeSgpXG4gICAgXHQ7XG4gICAgXHRcbiAgICBcdC8vJGRvYy5wYXR0ZXJubGlicmFyeSgpO1xuICAgICAgICBcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBkb2N1bWVudCwgd2luZG93LCBwYXR0ZXJubGlicmFyeSk7IiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICAgIC8vIC4uLlxufSk7Il19
