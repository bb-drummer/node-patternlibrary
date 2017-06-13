'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/** @var  object  patternlibrary  global patternlibrary namespace */
if (!patternlibrary) {
    var patternlibrary = {};
}

/**
 * theme base setup (Zurb Foundation)
 * 
 * patternlibrary client (init-)script
 *     
 * @package     [patternlibrary]
 * @subpackage  theme base setup (Zurb Foundation)
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
                        console.warn("Tried to initialize " + name + " on an element that " + "already has a [patternlibrary] plugin.");
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
        $('body').addClass(typeof Foundation == 'undefined' ? 'bootstrap' : 'foundation');

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
}(jQuery);
'use strict';

/** @var  object  patternlibrary.Config  patternlibrary global configuration container */
if (!patternlibrary.Config) {
    patternlibrary.Config = {
        // detect UI framework
        renderer: typeof Foundation != 'undefined' ? 'foundation' : 'bootstrap',
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
            foundationElementClassname: 'reveal'
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
    console.log('search: ', $('[data-docs-search]'));
    $('[data-docs-search]').typeahead({ highlight: false }, searchSource);
    $('[data-docs-search]').bind('typeahead:select', function (e, sel) {
      window.location.href = String(sel.link).replace('src/partials', '/pl/patterns').replace('/readme.html', '');
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
            if (typeof $.fn.modal == 'undefined' && typeof Foundation.Reveal == 'undefined') {
                console.warn('Bootstrap Modal and/or Foundation Reveal plug-ins not found...');
                return;
            }
            var $modal = null;
            if (typeof Foundation != 'undefined') {
                if ($('#' + patternlibrary.Config.modals.foundationElementClassname).size() == 0) {
                    $('BODY').append('<div id="' + patternlibrary.Config.modals.foundationElementClassname + '" class="' + patternlibrary.Config.modals.foundationElementClassname + '" data-reveal></div>');
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
                    m = new Foundation.Reveal($('#' + patternlibrary.Config.modals.foundationElementClassname), revealOptions);
                $('#' + patternlibrary.Config.modals.foundationElementClassname).html(data).foundation('open');
                $modal = $('.' + patternlibrary.Config.modals.foundationElementClassname);
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
            if (typeof $.fn.modal == 'undefined' && typeof Foundation.Reveal == 'undefined') {
                console.warn('jQuery Modal and/or Foundation Reveal plug-ins not found...');
                return;
            }

            var $modal;
            // close/destroy modals
            if (typeof Foundation != 'undefined') {
                $modal = $('.' + patternlibrary.Config.modals.foundationElementClassname);
                if ($modal) {
                    try {
                        $modal.hide();
                        $modal.foundation('close');
                        //$modal.foundation('destroy');
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
;(function ($, window, document, patternlibrary, undefined) {
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

/**
 * initialize modal XHR triggers and watch for modal XHR forms
 */
;(function ($, window, document, patternlibrary, undefined) {
    'use strict';

    if (typeof $.fn.modal == 'undefined' && typeof Foundation.Reveal == 'undefined') {
        console.warn('jQuery Modal and/or Foundation Reveal plug-ins not found...');
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
 * theme base setup (Zurb Foundation)
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

if (!$.fn.foundation) {
    console.error('Foundation not found...');
    window.stop();
}

(function ($, doc, win, patternlibrary) {

    var $doc = $(doc),
        $lang = patternlibrary.Config.lang;

    //window.ontouchmove = function() { return false; }
    //window.onorientationchange = function() { document.body.scrollTop = 0; }  

    //
    // init patternlibrary (frontent)
    //
    $doc.ready(function () {

        $(document).foundation();

        $doc.patternlibrary();

        $('body').removeClass('loading');
    });
})(jQuery, document, window, patternlibrary);
"use strict";
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhdHRlcm5saWJyYXJ5LmNvcmUuanMiLCJwYXR0ZXJubGlicmFyeS5jb25maWcuanMiLCJkb2NzLnNlYXJjaC5qcyIsIm1lZGlhUXVlcnkuanMiLCJtb2RhbC5qcyIsIndpbmRvd2hyZWYuanMiLCJhcHBsaWNhdGlvbi1jdGEteGhyLW1vZGFscy5qcyIsInBhdHRlcm5saWJyYXJ5LmluaXQuanMiLCJhcHAuanMiXSwibmFtZXMiOlsicGF0dGVybmxpYnJhcnkiLCIkIiwicGF0dGVybmxpYnJhcnlfVkVSU0lPTiIsInZlcnNpb24iLCJfcGx1Z2lucyIsIl91dWlkcyIsInJ0bCIsImF0dHIiLCJwbHVnaW4iLCJuYW1lIiwiY2xhc3NOYW1lIiwiZnVuY3Rpb25OYW1lIiwiYXR0ck5hbWUiLCJoeXBoZW5hdGUiLCJyZWdpc3RlclBsdWdpbiIsInBsdWdpbk5hbWUiLCJjb25zdHJ1Y3RvciIsInRvTG93ZXJDYXNlIiwidXVpZCIsIkdldFlvRGlnaXRzIiwiJGVsZW1lbnQiLCJkYXRhIiwidHJpZ2dlciIsInB1c2giLCJ1bnJlZ2lzdGVyUGx1Z2luIiwic3BsaWNlIiwiaW5kZXhPZiIsInJlbW92ZUF0dHIiLCJyZW1vdmVEYXRhIiwicHJvcCIsInJlSW5pdCIsInBsdWdpbnMiLCJpc0pRIiwiZWFjaCIsIl9pbml0IiwidHlwZSIsIl90aGlzIiwiZm5zIiwicGxncyIsImZvckVhY2giLCJwIiwiT2JqZWN0Iiwia2V5cyIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsImxlbmd0aCIsIm5hbWVzcGFjZSIsIk1hdGgiLCJyb3VuZCIsInBvdyIsInJhbmRvbSIsInRvU3RyaW5nIiwic2xpY2UiLCJyZWZsb3ciLCJlbGVtIiwiaSIsIiRlbGVtIiwiZmluZCIsImFkZEJhY2siLCIkZWwiLCJvcHRzIiwid2FybiIsInRoaW5nIiwic3BsaXQiLCJlIiwib3B0IiwibWFwIiwiZWwiLCJ0cmltIiwicGFyc2VWYWx1ZSIsImVyIiwiZ2V0Rm5OYW1lIiwidHJhbnNpdGlvbmVuZCIsInRyYW5zaXRpb25zIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiZW5kIiwidCIsInN0eWxlIiwic2V0VGltZW91dCIsInRyaWdnZXJIYW5kbGVyIiwibGlicyIsInV0aWwiLCJ0aHJvdHRsZSIsImZ1bmMiLCJkZWxheSIsInRpbWVyIiwiY29udGV4dCIsImFyZ3MiLCJhcmd1bWVudHMiLCJhcHBseSIsInNpdGVhcHAiLCJtZXRob2QiLCIkbWV0YSIsIiRub0pTIiwiYXBwZW5kVG8iLCJoZWFkIiwicmVtb3ZlQ2xhc3MiLCJhZGRDbGFzcyIsIkZvdW5kYXRpb24iLCJNZWRpYVF1ZXJ5IiwiQXJyYXkiLCJwcm90b3R5cGUiLCJjYWxsIiwicGx1Z0NsYXNzIiwidW5kZWZpbmVkIiwiUmVmZXJlbmNlRXJyb3IiLCJUeXBlRXJyb3IiLCJ3aW5kb3ciLCJmbiIsIkRhdGUiLCJub3ciLCJnZXRUaW1lIiwidmVuZG9ycyIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsInZwIiwiY2FuY2VsQW5pbWF0aW9uRnJhbWUiLCJ0ZXN0IiwibmF2aWdhdG9yIiwidXNlckFnZW50IiwibGFzdFRpbWUiLCJjYWxsYmFjayIsIm5leHRUaW1lIiwibWF4IiwiY2xlYXJUaW1lb3V0IiwicGVyZm9ybWFuY2UiLCJzdGFydCIsIkZ1bmN0aW9uIiwiYmluZCIsIm9UaGlzIiwiYUFyZ3MiLCJmVG9CaW5kIiwiZk5PUCIsImZCb3VuZCIsImNvbmNhdCIsImZ1bmNOYW1lUmVnZXgiLCJyZXN1bHRzIiwiZXhlYyIsInN0ciIsImlzTmFOIiwicGFyc2VGbG9hdCIsInJlcGxhY2UiLCJqUXVlcnkiLCJDb25maWciLCJyZW5kZXJlciIsImxhbmciLCJ4aHJTZWxlY3RvcnMiLCJ4aHJCdXR0b25zIiwieGhyQ1RBT3BlbiIsInhockNUQUNsb3NlIiwieGhyRm9ybXMiLCJtb2RhbHMiLCJib290c3RyYXBFbGVtZW50Q2xhc3NuYW1lIiwiZm91bmRhdGlvbkVsZW1lbnRDbGFzc25hbWUiLCJkYXRhVGFibGUiLCJsYW5nVVJMcyIsInN0YXRlU2F2ZSIsInN0YXRlRHVyYXRpb24iLCJzZWFyY2hTb3VyY2UiLCJsaW1pdCIsInNvdXJjZSIsInF1ZXJ5Iiwic3luYyIsImFzeW5jIiwiZ2V0SlNPTiIsInN0YXR1cyIsImZpbHRlciIsImFyciIsInRlcm1zIiwidGFncyIsImRpc3BsYXkiLCJpdGVtIiwidGVtcGxhdGVzIiwibm90Rm91bmQiLCJzdWdnZXN0aW9uIiwiZGVzY3JpcHRpb24iLCJyZWFkeSIsImxvZyIsInR5cGVhaGVhZCIsImhpZ2hsaWdodCIsInNlbCIsImxvY2F0aW9uIiwiaHJlZiIsIlN0cmluZyIsImxpbmsiLCJtYXRjaCIsImZvY3VzIiwiZGVmYXVsdFF1ZXJpZXMiLCJsYW5kc2NhcGUiLCJwb3J0cmFpdCIsInJldGluYSIsInF1ZXJpZXMiLCJjdXJyZW50IiwiYXRMZWFzdCIsInNpemUiLCJnZXQiLCJtYXRjaE1lZGlhIiwibWF0Y2hlcyIsInZhbHVlIiwic2VsZiIsImV4dHJhY3RlZFN0eWxlcyIsImNzcyIsIm5hbWVkUXVlcmllcyIsInBhcnNlU3R5bGVUb09iamVjdCIsImtleSIsIl9nZXRDdXJyZW50U2l6ZSIsIl93YXRjaGVyIiwibWF0Y2hlZCIsIm9uIiwibmV3U2l6ZSIsInN0eWxlTWVkaWEiLCJtZWRpYSIsInNjcmlwdCIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwiaW5mbyIsImlkIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsImdldENvbXB1dGVkU3R5bGUiLCJjdXJyZW50U3R5bGUiLCJtYXRjaE1lZGl1bSIsInRleHQiLCJzdHlsZVNoZWV0IiwiY3NzVGV4dCIsInRleHRDb250ZW50Iiwid2lkdGgiLCJzdHlsZU9iamVjdCIsInJlZHVjZSIsInJldCIsInBhcmFtIiwicGFydHMiLCJ2YWwiLCJkZWNvZGVVUklDb21wb25lbnQiLCJoYXNPd25Qcm9wZXJ0eSIsImlzQXJyYXkiLCJtb2RhbCIsInNldHRpbmdzIiwib3BlbiIsInVwZGF0ZVdpbmRvd0hyZWYiLCJSZXZlYWwiLCIkbW9kYWwiLCJhcHBlbmQiLCJyZXZlYWxPcHRpb25zIiwibW9kYWxEYXRhIiwibSIsImh0bWwiLCJmb3VuZGF0aW9uIiwiTW9kYWwiLCJjbG9zZSIsIiRtb2RhbERlZmF1bHRzIiwic2hvdyIsIldpbmRvd0hyZWYiLCJyZXNldCIsIl9vbGRfaHJlZiIsImhpc3RvcnkiLCJwdXNoU3RhdGUiLCJ0aXRsZSIsImhpZGUiLCJyZW1vdmUiLCJ3aW5kb3docmVmIiwiaW5pdCIsInNjb3BlIiwib3B0aW9ucyIsInVwZGF0ZSIsInVybCIsImNsZWFyIiwiY2xlYXJPbGRIcmVmIiwiJGJvZHkiLCIkYWpheEJ1dHRvbnMiLCIkYWpheENUQU9wZW4iLCIkYWpheENUQUNsb3NlIiwiJGFqYXhGb3JtcyIsImhhbmRsZXJfaW5pdFhIUk1vZGFsVHJpZ2dlciIsIm9FdmVudCIsIiR0aGlzIiwiJGJ0blVybCIsImFqYXgiLCJoZWFkZXJzIiwiY2FjaGUiLCJzdWNjZXNzIiwiYXBpIiwicmVsb2FkIiwidGFibGVkYXRhIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24iLCJoYW5kbGVyX2luaXRYSFJNb2RhbEZvcm0iLCIkZm9ybSIsImZvcm1VUkwiLCJmb3JtRGF0YSIsInNlcmlhbGl6ZUFycmF5IiwiaGFuZGxlcl9jbG9zZU1vZGFsIiwic3RvcCIsImRvYyIsIndpbiIsIiRkb2MiLCIkbGFuZyJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0EsSUFBSSxDQUFDQSxjQUFMLEVBQXFCO0FBQ2pCLFFBQUlBLGlCQUFpQixFQUFyQjtBQUNIOztBQUVEOzs7Ozs7Ozs7Ozs7O0FBYUEsQ0FBQyxVQUFTQyxDQUFULEVBQVk7QUFDYjs7QUFHSSxRQUFJQyx5QkFBeUIsT0FBN0I7O0FBRUE7QUFDQTtBQUNBLFFBQUlGLGlCQUFpQjtBQUNqQkcsaUJBQVNELHNCQURROztBQUdqQjs7O0FBR0FFLGtCQUFVLEVBTk87O0FBUWpCOzs7QUFHQUMsZ0JBQVEsRUFYUzs7QUFhakI7OztBQUdBQyxhQUFLLGVB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bkM7OztBQ0hEOzs7Ozs7Ozs7Ozs7O0FBYUEsSUFBSSxDQUFDK0ksTUFBTCxFQUFhO0FBQ1RuRyxZQUFRQyxLQUFSLENBQWMscUJBQWQ7QUFDQWdFLFdBQU93TCxJQUFQO0FBQ0g7O0FBRUQsSUFBSSxDQUFDcFMsRUFBRTZHLEVBQUYsQ0FBS3lJLFVBQVYsRUFBc0I7QUFDbEIzTSxZQUFRQyxLQUFSLENBQWMseUJBQWQ7QUFDQWdFLFdBQU93TCxJQUFQO0FBQ0g7O0FBRUQsQ0FBQyxVQUFVcFMsQ0FBVixFQUFhcVMsR0FBYixFQUFrQkMsR0FBbEIsRUFBdUJ2UyxjQUF2QixFQUF1Qzs7QUFFcEMsUUFBSXdTLE9BQU92UyxFQUFFcVMsR0FBRixDQUFYO0FBQUEsUUFDSUcsUUFBUXpTLGVBQWVnSixNQUFmLENBQXNCRSxJQURsQzs7QUFJSDtBQUNBOztBQUVHO0FBQ0E7QUFDQTtBQUNBc0osU0FBS3ZILEtBQUwsQ0FBVyxZQUFZOztBQUV0QmhMLFVBQUUwRSxRQUFGLEVBQVk0SyxVQUFaOztBQUVBaUQsYUFBS3hTLGNBQUw7O0FBRUFDLFVBQUUsTUFBRixFQUFVaUcsV0FBVixDQUFzQixTQUF0QjtBQUVBLEtBUkQ7QUFVSCxDQXRCRCxFQXNCRzZDLE1BdEJILEVBc0JXcEUsUUF0QlgsRUFzQnFCa0MsTUF0QnJCLEVBc0I2QjdHLGNBdEI3QjtBQ3ZCQSIsImZpbGUiOiJwYXR0ZXJubGlicmFyeS1mcm9udGVuZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKiBAdmFyICBvYmplY3QgIHBhdHRlcm5saWJyYXJ5ICBnbG9iYWwgcGF0dGVybmxpYnJhcnkgbmFtZXNwYWNlICovXG5pZiAoIXBhdHRlcm5saWJyYXJ5KSB7XG4gICAgdmFyIHBhdHRlcm5saWJyYXJ5ID0ge307XG59XG5cbi8qKlxuICogdGhlbWUgYmFzZSBzZXR1cCAoWnVyYiBGb3VuZGF0aW9uKVxuICogXG4gKiBwYXR0ZXJubGlicmFyeSBjbGllbnQgKGluaXQtKXNjcmlwdFxuICogICAgIFxuICogQHBhY2thZ2UgICAgIFtwYXR0ZXJubGlicmFyeV1cbiAqIEBzdWJwYWNrYWdlICB0aGVtZSBiYXNlIHNldHVwIChadXJiIEZvdW5kYXRpb24pXG4gKiBAc3VicGFja2FnZSAgcGF0dGVybmxpYnJhcnkgY2xpZW50IHNjcmlwdFxuICogQGF1dGhvciAgICAgIEJqw7ZybiBCYXJ0ZWxzIDxjb2RpbmdAYmpvZXJuYmFydGVscy5lYXJ0aD5cbiAqIEBsaW5rICAgICAgICBodHRwczovL2dpdGxhYi5iam9lcm5iYXJ0ZWxzLmVhcnRoL2pzL3BhdHRlcm5saWJyYXJ5XG4gKiBAbGljZW5zZSAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMFxuICogQGNvcHlyaWdodCAgIGNvcHlyaWdodCAoYykgMjAxNiBCasO2cm4gQmFydGVscyA8Y29kaW5nQGJqb2VybmJhcnRlbHMuZWFydGg+XG4gKi9cbiFmdW5jdGlvbigkKSB7XG5cInVzZSBzdHJpY3RcIjtcblxuICAgIFxuICAgIHZhciBwYXR0ZXJubGlicmFyeV9WRVJTSU9OID0gJzAuMC4xJztcbiAgICBcbiAgICAvLyBHbG9iYWwgW3BhdHRlcm5saWJyYXJ5XSBvYmplY3RcbiAgICAvLyBUaGlzIGlzIGF0dGFjaGVkIHRvIHRoZSB3aW5kb3csIG9yIHVzZWQgYXMgYSBtb2R1bGUgZm9yIEFNRC9Ccm93c2VyaWZ5XG4gICAgdmFyIHBhdHRlcm5saWJyYXJ5ID0ge1xuICAgICAgICB2ZXJzaW9uOiBwYXR0ZXJubGlicmFyeV9WRVJTSU9OLFxuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogU3RvcmVzIGluaXRpYWxpemVkIHBsdWdpbnMuXG4gICAgICAgICAqL1xuICAgICAgICBfcGx1Z2luczoge30sXG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdG9yZXMgZ2VuZXJhdGVkIHVuaXF1ZSBpZHMgZm9yIHBsdWdpbiBpbnN0YW5jZXNcbiAgICAgICAgICovXG4gICAgICAgIF91dWlkczogW10sXG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIGEgYm9vbGVhbiBmb3IgUlRMIHN1cHBvcnRcbiAgICAgICAgICovXG4gICAgICAgIHJ0bDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiAkKCdodG1sJykuYXR0cignZGlyJykgPT09ICdydGwnO1xuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlZmluZXMgYSBbcGF0dGVybmxpYnJhcnldIHBsdWdpbiwgYWRkaW5nIGl0IHRvIHRoZSBgcGF0dGVybmxpYnJhcnlgIG5hbWVzcGFjZSBcbiAgICAgICAgICogYW5kIHRoZSBsaXN0IG9mIHBsdWdpbnMgdG8gaW5pdGlhbGl6ZSB3aGVuIHJlZmxvd2luZy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBUaGUgY29uc3RydWN0b3Igb2YgdGhlIHBsdWdpbi5cbiAgICAgICAgICovXG4gICAgICAgIHBsdWdpbjogZnVuY3Rpb24ocGx1Z2luLCBuYW1lKSB7XG4gICAgICAgICAgICAvLyBPYmplY3Qga2V5IHRvIHVzZSB3aGVuIGFkZGluZyB0byBnbG9iYWwgcGF0dGVybmxpYnJhcnkgb2JqZWN0XG4gICAgICAgICAgICAvLyBFeGFtcGxlczogcGF0dGVybmxpYnJhcnkuT2JqZWN0MSwgcGF0dGVybmxpYnJhcnkuT2JqZWN0MlxuICAgICAgICAgICAgdmFyIGNsYXNzTmFtZSA9IChuYW1lIHx8IGZ1bmN0aW9uTmFtZShwbHVnaW4pKTtcbiAgICAgICAgICAgIC8vIE9iamVjdCBrZXkgdG8gdXNlIHdoZW4gc3RvcmluZyB0aGUgcGx1Z2luLCBhbHNvIHVzZWQgdG8gY3JlYXRlIHRoZVxuICAgICAgICAgICAgLy8gaWRlbnRpZnlpbmcgZGF0YSBhdHRyaWJ1dGUgZm9yIHRoZSBwbHVnaW5cbiAgICAgICAgICAgIC8vIEV4YW1wbGVzOiBkYXRhLW9iamVjdHRyaWdnZXJuYW1lMSwgZGF0YS1vYmplY3R0cmlnZ2VybmFtZTJcbiAgICAgICAgICAgIHZhciBhdHRyTmFtZSAgICA9IGh5cGhlbmF0ZShjbGFzc05hbWUpO1xuICAgIFxuICAgICAgICAgICAgLy8gQWRkIHRvIHRoZSBwYXR0ZXJubGlicmFyeSBvYmplY3QgYW5kIHRoZSBwbHVnaW5zIGxpc3QgKGZvciByZWZsb3dpbmcpXG4gICAgICAgICAgICB0aGlzLl9wbHVnaW5zW2F0dHJOYW1lXSA9IHRoaXNbY2xhc3NOYW1lXSA9IHBsdWdpbjtcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAgICogUG9wdWxhdGVzIHRoZSBfdXVpZHMgYXJyYXkgd2l0aCBwb2ludGVycyB0byBlYWNoIGluZGl2aWR1YWwgcGx1Z2luIGluc3RhbmNlLlxuICAgICAgICAgKiBBZGRzIHRoZSBgcGF0dGVybmxpYnJhcnlQbHVnaW5gIGRhdGEtYXR0cmlidXRlIHRvIHByb2dyYW1tYXRpY2FsbHkgY3JlYXRlZCBwbHVnaW5zIFxuICAgICAgICAgKiB0byBhbGxvdyB1c2Ugb2YgJChzZWxlY3RvcikucGF0dGVybmxpYnJhcnkobWV0aG9kKSBjYWxscy5cbiAgICAgICAgICogQWxzbyBmaXJlcyB0aGUgaW5pdGlhbGl6YXRpb24gZXZlbnQgZm9yIGVhY2ggcGx1Z2luLCBjb25zb2xpZGF0aW5nIHJlcGVkaXRpdmUgY29kZS5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBhbiBpbnN0YW5jZSBvZiBhIHBsdWdpbiwgdXN1YWxseSBgdGhpc2AgaW4gY29udGV4dC5cbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSB0aGUgbmFtZSBvZiB0aGUgcGx1Z2luLCBwYXNzZWQgYXMgYSBjYW1lbENhc2VkIHN0cmluZy5cbiAgICAgICAgICogQGZpcmVzIFBsdWdpbiNpbml0XG4gICAgICAgICAqL1xuICAgICAgICByZWdpc3RlclBsdWdpbjogZnVuY3Rpb24ocGx1Z2luLCBuYW1lKXtcbiAgICAgICAgICAgIHZhciBwbHVnaW5OYW1lID0gbmFtZSA/IGh5cGhlbmF0ZShuYW1lKSA6IGZ1bmN0aW9uTmFtZShwbHVnaW4uY29uc3RydWN0b3IpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBwbHVnaW4udXVpZCA9IHRoaXMuR2V0WW9EaWdpdHMoNiwgcGx1Z2luTmFtZSk7XG4gICAgXG4gICAgICAgICAgICBpZighcGx1Z2luLiRlbGVtZW50LmF0dHIoJ2RhdGEtJyArIHBsdWdpbk5hbWUpKXsgcGx1Z2luLiRlbGVtZW50LmF0dHIoJ2RhdGEtJyArIHBsdWdpbk5hbWUsIHBsdWdpbi51dWlkKTsgfVxuICAgICAgICAgICAgaWYoIXBsdWdpbi4kZWxlbWVudC5kYXRhKCdwYXR0ZXJubGlicmFyeVBsdWdpbicpKXsgcGx1Z2luLiRlbGVtZW50LmRhdGEoJ3BhdHRlcm5saWJyYXJ5UGx1Z2luJywgcGx1Z2luKTsgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaGFzIGluaXRpYWxpemVkLlxuICAgICAgICAgICAgICAgICAgICAgICAgICogQGV2ZW50IFBsdWdpbiNpbml0XG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHBsdWdpbi4kZWxlbWVudC50cmlnZ2VyKCdpbml0LnBhdHRlcm5saWJyYXJ5LicgKyBwbHVnaW5OYW1lKTtcbiAgICBcbiAgICAgICAgICAgIHRoaXMuX3V1aWRzLnB1c2gocGx1Z2luLnV1aWQpO1xuICAgIFxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICAgKiBSZW1vdmVzIHRoZSBwbHVnaW5zIHV1aWQgZnJvbSB0aGUgX3V1aWRzIGFycmF5LlxuICAgICAgICAgKiBSZW1vdmVzIHRoZSB6ZlBsdWdpbiBkYXRhIGF0dHJpYnV0ZSwgYXMgd2VsbCBhcyB0aGUgZGF0YS1wbHVnaW4tbmFtZSBhdHRyaWJ1dGUuXG4gICAgICAgICAqIEFsc28gZmlyZXMgdGhlIGRlc3Ryb3llZCBldmVudCBmb3IgdGhlIHBsdWdpbiwgY29uc29saWRhdGluZyByZXBlZGl0aXZlIGNvZGUuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gYW4gaW5zdGFuY2Ugb2YgYSBwbHVnaW4sIHVzdWFsbHkgYHRoaXNgIGluIGNvbnRleHQuXG4gICAgICAgICAqIEBmaXJlcyBQbHVnaW4jZGVzdHJveWVkXG4gICAgICAgICAqL1xuICAgICAgICB1bnJlZ2lzdGVyUGx1Z2luOiBmdW5jdGlvbihwbHVnaW4pe1xuICAgICAgICAgICAgdmFyIHBsdWdpbk5hbWUgPSBoeXBoZW5hdGUoZnVuY3Rpb25OYW1lKHBsdWdpbi4kZWxlbWVudC5kYXRhKCdwYXR0ZXJubGlicmFyeVBsdWdpbicpLmNvbnN0cnVjdG9yKSk7XG4gICAgXG4gICAgICAgICAgICB0aGlzLl91dWlkcy5zcGxpY2UodGhpcy5fdXVpZHMuaW5kZXhPZihwbHVnaW4udXVpZCksIDEpO1xuICAgICAgICAgICAgcGx1Z2luLiRlbGVtZW50LnJlbW92ZUF0dHIoJ2RhdGEtJyArIHBsdWdpbk5hbWUpLnJlbW92ZURhdGEoJ3BhdHRlcm5saWJyYXJ5UGx1Z2luJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBiZWVuIGRlc3Ryb3llZC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEBldmVudCBQbHVnaW4jZGVzdHJveWVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIC50cmlnZ2VyKCdkZXN0cm95ZWQucGF0dGVybmxpYnJhcnkuJyArIHBsdWdpbk5hbWUpO1xuICAgICAgICAgICAgZm9yKHZhciBwcm9wIGluIHBsdWdpbil7XG4gICAgICAgICAgICAgICAgcGx1Z2luW3Byb3BdID0gbnVsbDsvL2NsZWFuIHVwIHNjcmlwdCB0byBwcmVwIGZvciBnYXJiYWdlIGNvbGxlY3Rpb24uXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0sXG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAgICogQ2F1c2VzIG9uZSBvciBtb3JlIGFjdGl2ZSBwbHVnaW5zIHRvIHJlLWluaXRpYWxpemUsIHJlc2V0dGluZyBldmVudCBsaXN0ZW5lcnMsIFxuICAgICAgICAgKiByZWNhbGN1bGF0aW5nIHBvc2l0aW9ucywgZXRjLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHBsdWdpbnMgLSBvcHRpb25hbCBzdHJpbmcgb2YgYW4gaW5kaXZpZHVhbCBwbHVnaW4ga2V5LCBcbiAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRhaW5lZCBieSBjYWxsaW5nIGAkKGVsZW1lbnQpLmRhdGEoJ3BsdWdpbk5hbWUnKWAsIFxuICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yIHN0cmluZyBvZiBhIHBsdWdpbiBjbGFzcyBpLmUuIGAnZHJvcGRvd24nYFxuICAgICAgICAgKiBAZGVmYXVsdCBJZiBubyBhcmd1bWVudCBpcyBwYXNzZWQsIHJlZmxvdyBhbGwgY3VycmVudGx5IGFjdGl2ZSBwbHVnaW5zLlxuICAgICAgICAgKi9cbiAgICAgICAgIHJlSW5pdDogZnVuY3Rpb24ocGx1Z2lucyl7XG4gICAgICAgICAgICAgdmFyIGlzSlEgPSBwbHVnaW5zIGluc3RhbmNlb2YgJDtcbiAgICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgIGlmKGlzSlEpe1xuICAgICAgICAgICAgICAgICAgICAgcGx1Z2lucy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5kYXRhKCdwYXR0ZXJubGlicmFyeVBsdWdpbicpLl9pbml0KCk7XG4gICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBwbHVnaW5zLFxuICAgICAgICAgICAgICAgICAgICAgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgZm5zID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICdvYmplY3QnOiBmdW5jdGlvbihwbGdzKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxncy5mb3JFYWNoKGZ1bmN0aW9uKHApe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnW2RhdGEtJysgcCArJ10nKS5wYXR0ZXJubGlicmFyeSgnX2luaXQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAnc3RyaW5nJzogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnW2RhdGEtJysgcGx1Z2lucyArJ10nKS5wYXR0ZXJubGlicmFyeSgnX2luaXQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICd1bmRlZmluZWQnOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzWydvYmplY3QnXShPYmplY3Qua2V5cyhfdGhpcy5fcGx1Z2lucykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICBmbnNbdHlwZV0ocGx1Z2lucyk7XG4gICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgIH1maW5hbGx5e1xuICAgICAgICAgICAgICAgICByZXR1cm4gcGx1Z2lucztcbiAgICAgICAgICAgICB9XG4gICAgICAgICB9LFxuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogcmV0dXJucyBhIHJhbmRvbSBiYXNlLTM2IHVpZCB3aXRoIG5hbWVzcGFjaW5nXG4gICAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoIC0gbnVtYmVyIG9mIHJhbmRvbSBiYXNlLTM2IGRpZ2l0cyBkZXNpcmVkLiBJbmNyZWFzZSBcbiAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBtb3JlIHJhbmRvbSBzdHJpbmdzLlxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlIC0gbmFtZSBvZiBwbHVnaW4gdG8gYmUgaW5jb3Jwb3JhdGVkIGluIHVpZCwgb3B0aW9uYWwuXG4gICAgICAgICAqIEBkZWZhdWx0IHtTdHJpbmd9ICcnIC0gaWYgbm8gcGx1Z2luIG5hbWUgaXMgcHJvdmlkZWQsIG5vdGhpbmcgaXMgYXBwZW5kZWQgXG4gICAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgdG8gdGhlIHVpZC5cbiAgICAgICAgICogQHJldHVybnMge1N0cmluZ30gLSB1bmlxdWUgaWRcbiAgICAgICAgICovXG4gICAgICAgIEdldFlvRGlnaXRzOiBmdW5jdGlvbihsZW5ndGgsIG5hbWVzcGFjZSl7XG4gICAgICAgICAgICBsZW5ndGggPSBsZW5ndGggfHwgNjtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKFxuICAgICAgICAgICAgICAgICAgICAoTWF0aC5wb3coMzYsIGxlbmd0aCArIDEpIC0gTWF0aC5yYW5kb20oKSAqIE1hdGgucG93KDM2LCBsZW5ndGgpKVxuICAgICAgICAgICAgKS50b1N0cmluZygzNikuc2xpY2UoMSkgKyAobmFtZXNwYWNlID8gJy0nICsgbmFtZXNwYWNlIDogJycpO1xuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEluaXRpYWxpemUgcGx1Z2lucyBvbiBhbnkgZWxlbWVudHMgd2l0aGluIGBlbGVtYCAoYW5kIGBlbGVtYCBpdHNlbGYpIHRoYXQgXG4gICAgICAgICAqIGFyZW4ndCBhbHJlYWR5IGluaXRpYWxpemVkLlxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbSAtIGpRdWVyeSBvYmplY3QgY29udGFpbmluZyB0aGUgZWxlbWVudCB0byBjaGVjayBpbnNpZGUuIFxuICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgIEFsc28gY2hlY2tzIHRoZSBlbGVtZW50IGl0c2VsZiwgdW5sZXNzIGl0J3MgdGhlIGBkb2N1bWVudGAgXG4gICAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0LlxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gcGx1Z2lucyAtIEEgbGlzdCBvZiBwbHVnaW5zIHRvIGluaXRpYWxpemUuIExlYXZlIHRoaXMgXG4gICAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0IHRvIGluaXRpYWxpemUgZXZlcnl0aGluZy5cbiAgICAgICAgICovXG4gICAgICAgIHJlZmxvdzogZnVuY3Rpb24oZWxlbSwgcGx1Z2lucykge1xuICAgIFxuICAgICAgICAgICAgLy8gSWYgcGx1Z2lucyBpcyB1bmRlZmluZWQsIGp1c3QgZ3JhYiBldmVyeXRoaW5nXG4gICAgICAgICAgICBpZiAodHlwZW9mIHBsdWdpbnMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgcGx1Z2lucyA9IE9iamVjdC5rZXlzKHRoaXMuX3BsdWdpbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSWYgcGx1Z2lucyBpcyBhIHN0cmluZywgY29udmVydCBpdCB0byBhbiBhcnJheSB3aXRoIG9uZSBpdGVtXG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgcGx1Z2lucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBwbHVnaW5zID0gW3BsdWdpbnNdO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICBcbiAgICAgICAgICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIHBsdWdpblxuICAgICAgICAgICAgJC5lYWNoKHBsdWdpbnMsIGZ1bmN0aW9uKGksIG5hbWUpIHtcbiAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIGN1cnJlbnQgcGx1Z2luXG4gICAgICAgICAgICAgICAgdmFyIHBsdWdpbiA9IF90aGlzLl9wbHVnaW5zW25hbWVdO1xuICAgIFxuICAgICAgICAgICAgICAgIC8vIExvY2FsaXplIHRoZSBzZWFyY2ggdG8gYWxsIGVsZW1lbnRzIGluc2lkZSBlbGVtLCBhcyB3ZWxsIGFzIGVsZW0gXG4gICAgICAgICAgICAgICAgLy8gaXRzZWxmLCB1bmxlc3MgZWxlbSA9PT0gZG9jdW1lbnRcbiAgICAgICAgICAgICAgICB2YXIgJGVsZW0gPSAkKGVsZW0pLmZpbmQoJ1tkYXRhLScrbmFtZSsnXScpLmFkZEJhY2soJ1tkYXRhLScrbmFtZSsnXScpO1xuICAgIFxuICAgICAgICAgICAgICAgIC8vIEZvciBlYWNoIHBsdWdpbiBmb3VuZCwgaW5pdGlhbGl6ZSBpdFxuICAgICAgICAgICAgICAgICRlbGVtLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciAkZWwgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgLy8gRG9uJ3QgZG91YmxlLWRpcCBvbiBwbHVnaW5zXG4gICAgICAgICAgICAgICAgICAgIGlmICgkZWwuZGF0YSgncGF0dGVybmxpYnJhcnlQbHVnaW4nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiVHJpZWQgdG8gaW5pdGlhbGl6ZSBcIituYW1lK1wiIG9uIGFuIGVsZW1lbnQgdGhhdCBcIitcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbHJlYWR5IGhhcyBhIFtwYXR0ZXJubGlicmFyeV0gcGx1Z2luLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgICAgICAgICBpZigkZWwuYXR0cignZGF0YS1vcHRpb25zJykpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRoaW5nID0gJGVsLmF0dHIoJ2RhdGEtb3B0aW9ucycpLnNwbGl0KCc7JykuZm9yRWFjaChmdW5jdGlvbihlLCBpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3B0ID0gZS5zcGxpdCgnOicpLm1hcChmdW5jdGlvbihlbCl7IHJldHVybiBlbC50cmltKCk7IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKG9wdFswXSkgb3B0c1tvcHRbMF1dID0gcGFyc2VWYWx1ZShvcHRbMV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgICAgICAgICAgJGVsLmRhdGEoJ3BhdHRlcm5saWJyYXJ5UGx1Z2luJywgbmV3IHBsdWdpbigkKHRoaXMpLCBvcHRzKSk7XG4gICAgICAgICAgICAgICAgICAgIH1jYXRjaChlcil7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVyKTtcbiAgICAgICAgICAgICAgICAgICAgfWZpbmFsbHl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBnZXRGbk5hbWU6IGZ1bmN0aW9uTmFtZSxcbiAgICAgICAgdHJhbnNpdGlvbmVuZDogZnVuY3Rpb24oJGVsZW0pe1xuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb25zID0ge1xuICAgICAgICAgICAgICAgICd0cmFuc2l0aW9uJzogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgICAgICAgICAgICdXZWJraXRUcmFuc2l0aW9uJzogJ3dlYmtpdFRyYW5zaXRpb25FbmQnLFxuICAgICAgICAgICAgICAgICdNb3pUcmFuc2l0aW9uJzogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgICAgICAgICAgICdPVHJhbnNpdGlvbic6ICdvdHJhbnNpdGlvbmVuZCdcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuICAgICAgICAgICAgICAgICAgICBlbmQ7XG4gICAgXG4gICAgICAgICAgICBmb3IgKHZhciB0IGluIHRyYW5zaXRpb25zKXtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGVsZW0uc3R5bGVbdF0gIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gdHJhbnNpdGlvbnNbdF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZW5kKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZW5kO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgZW5kID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAkZWxlbS50cmlnZ2VySGFuZGxlcigndHJhbnNpdGlvbmVuZCcsIFskZWxlbV0pO1xuICAgICAgICAgICAgICAgIH0sIDEpO1xuICAgICAgICAgICAgICAgIHJldHVybiAndHJhbnNpdGlvbmVuZCc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIFxuICAgIC8qKlxuICAgICAqIGxpYnJhcnkgY29udGFpbmVyL25hbWVzcGFjZVxuICAgICAqL1xuICAgIHBhdHRlcm5saWJyYXJ5LmxpYnMgPSB7XG4gICAgXG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiB1dGlsaXR5IGNvbnRhaW5lci9uYW1lc3BhY2VcbiAgICAgKi9cbiAgICBwYXR0ZXJubGlicmFyeS51dGlsID0ge1xuICAgICAgICAvKipcbiAgICAgICAgICogRnVuY3Rpb24gZm9yIGFwcGx5aW5nIGEgZGVib3VuY2UgZWZmZWN0IHRvIGEgZnVuY3Rpb24gY2FsbC5cbiAgICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgLSBGdW5jdGlvbiB0byBiZSBjYWxsZWQgYXQgZW5kIG9mIHRpbWVvdXQuXG4gICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBkZWxheSAtIFRpbWUgaW4gbXMgdG8gZGVsYXkgdGhlIGNhbGwgb2YgYGZ1bmNgLlxuICAgICAgICAgKiBAcmV0dXJucyBmdW5jdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgdGhyb3R0bGU6IGZ1bmN0aW9uIChmdW5jLCBkZWxheSkge1xuICAgICAgICAgICAgdmFyIHRpbWVyID0gbnVsbDtcbiAgICBcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLCBhcmdzID0gYXJndW1lbnRzO1xuICAgIFxuICAgICAgICAgICAgICAgIGlmICh0aW1lciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfSwgZGVsYXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIC8vIFRPRE86IGNvbnNpZGVyIG5vdCBtYWtpbmcgdGhpcyBhIGpRdWVyeSBmdW5jdGlvblxuICAgIC8vIFRPRE86IG5lZWQgd2F5IHRvIHJlZmxvdyB2cy4gcmUtaW5pdGlhbGl6ZVxuICAgIC8qKlxuICAgICAqIFRoZSBwYXR0ZXJubGlicmFyeSBqUXVlcnkgbWV0aG9kLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBtZXRob2QgLSBBbiBhY3Rpb24gdG8gcGVyZm9ybSBvbiB0aGUgY3VycmVudCBqUXVlcnkgb2JqZWN0LlxuICAgICAqL1xuICAgIHZhciBzaXRlYXBwID0gZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgIHZhciB0eXBlICA9IHR5cGVvZiBtZXRob2QsXG4gICAgICAgICAgICAkbWV0YSA9ICQoJ21ldGEucGF0dGVybmxpYnJhcnktbXEnKSxcbiAgICAgICAgICAgICRub0pTID0gJCgnLm5vLWpzJyk7XG4gICAgXG4gICAgICAgIGlmKCEkbWV0YS5sZW5ndGgpe1xuICAgICAgICAgICAgJCgnPG1ldGEgY2xhc3M9XCJwYXR0ZXJubGlicmFyeS1tcVwiPicpLmFwcGVuZFRvKGRvY3VtZW50LmhlYWQpO1xuICAgICAgICB9XG4gICAgICAgIGlmKCRub0pTLmxlbmd0aCl7XG4gICAgICAgICAgICAkbm9KUy5yZW1vdmVDbGFzcygnbm8tanMnKTtcbiAgICAgICAgfVxuICAgICAgICAkKCdib2R5JykuYWRkQ2xhc3MoXG4gICAgICAgICAgICAodHlwZW9mIEZvdW5kYXRpb24gPT0gJ3VuZGVmaW5lZCcpID8gJ2Jvb3RzdHJhcCcgOiAnZm91bmRhdGlvbidcbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIGlmKHR5cGUgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIC8vbmVlZHMgdG8gaW5pdGlhbGl6ZSB0aGUgcGF0dGVybmxpYnJhcnkgb2JqZWN0LCBvciBhbiBpbmRpdmlkdWFsIHBsdWdpbi5cbiAgICAgICAgICAgIHBhdHRlcm5saWJyYXJ5Lk1lZGlhUXVlcnkuX2luaXQoKTtcbiAgICAgICAgICAgIHBhdHRlcm5saWJyYXJ5LnJlZmxvdyh0aGlzKTtcbiAgICAgICAgfWVsc2UgaWYodHlwZSA9PT0gJ3N0cmluZycpe1xuICAgICAgICAgICAgLy9hbiBpbmRpdmlkdWFsIG1ldGhvZCB0byBpbnZva2Ugb24gYSBwbHVnaW4gb3IgZ3JvdXAgb2YgcGx1Z2luc1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICAgICAgLy9jb2xsZWN0IGFsbCB0aGUgYXJndW1lbnRzLCBpZiBuZWNlc3NhcnlcbiAgICAgICAgICAgIHZhciBwbHVnQ2xhc3MgPSB0aGlzLmRhdGEoJ3BhdHRlcm5saWJyYXJ5LXBsdWdpbicpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2RldGVybWluZSB0aGUgY2xhc3Mgb2YgcGx1Z2luXG4gICAgICAgICAgICBpZihwbHVnQ2xhc3MgIT09IHVuZGVmaW5lZCAmJiBwbHVnQ2xhc3NbbWV0aG9kXSAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgICAgICAvL21ha2Ugc3VyZSBib3RoIHRoZSBjbGFzcyBhbmQgbWV0aG9kIGV4aXN0XG4gICAgICAgICAgICAgICAgaWYodGhpcy5sZW5ndGggPT09IDEpe1xuICAgICAgICAgICAgICAgICAgICAvL2lmIHRoZXJlJ3Mgb25seSBvbmUsIGNhbGwgaXQgZGlyZWN0bHkuXG4gICAgICAgICAgICAgICAgICAgIHBsdWdDbGFzc1ttZXRob2RdLmFwcGx5KHBsdWdDbGFzcywgYXJncyk7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbihpLCBlbCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL290aGVyd2lzZSBsb29wIHRocm91Z2ggdGhlIGpRdWVyeSBjb2xsZWN0aW9uIGFuZCBpbnZva2UgdGhlIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWV0aG9kIG9uIGVhY2hcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsdWdDbGFzc1ttZXRob2RdLmFwcGx5KCQoZWwpLmRhdGEoJ3BhdHRlcm5saWJyYXJ5LXBsdWdpbicpLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfWVsc2V7Ly9lcnJvciBmb3Igbm8gY2xhc3Mgb3Igbm8gbWV0aG9kXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwiV2UncmUgc29ycnksICdcIiArIG1ldGhvZCArIFxuICAgICAgICAgICAgICAgICAgICBcIicgaXMgbm90IGFuIGF2YWlsYWJsZSBtZXRob2QgZm9yIFwiICsgXG4gICAgICAgICAgICAgICAgICAgIChwbHVnQ2xhc3MgPyBmdW5jdGlvbk5hbWUocGx1Z0NsYXNzKSA6ICd0aGlzIGVsZW1lbnQnKSArICcuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1lbHNley8vZXJyb3IgZm9yIGludmFsaWQgYXJndW1lbnQgdHlwZVxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIldlJ3JlIHNvcnJ5LCAnXCIgKyB0eXBlICsgXCInIGlzIG5vdCBhIHZhbGlkIHBhcmFtZXRlci4gXCIrXG4gICAgICAgICAgICAgICAgXCJZb3UgbXVzdCB1c2UgYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBtZXRob2QgeW91IHdpc2ggdG8gaW52b2tlLlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIHdpbmRvdy5wYXR0ZXJubGlicmFyeSA9IHBhdHRlcm5saWJyYXJ5O1xuICAgICQuZm4ucGF0dGVybmxpYnJhcnkgPSBzaXRlYXBwO1xuICAgIFxuICAgIC8vIFBvbHlmaWxsIGZvciByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghRGF0ZS5ub3cgfHwgIXdpbmRvdy5EYXRlLm5vdylcbiAgICAgICAgICAgIHdpbmRvdy5EYXRlLm5vdyA9IERhdGUubm93ID0gZnVuY3Rpb24oKSB7IHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTsgfTtcbiAgICBcbiAgICAgICAgdmFyIHZlbmRvcnMgPSBbJ3dlYmtpdCcsICdtb3onXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2ZW5kb3JzLmxlbmd0aCAmJiAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTsgKytpKSB7XG4gICAgICAgICAgICB2YXIgdnAgPSB2ZW5kb3JzW2ldO1xuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2cCsnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSAod2luZG93W3ZwKydDYW5jZWxBbmltYXRpb25GcmFtZSddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgd2luZG93W3ZwKydDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC9pUChhZHxob25lfG9kKS4qT1MgNi8udGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudClcbiAgICAgICAgICAgIHx8ICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8ICF3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgICAgICAgIHZhciBsYXN0VGltZSA9IDA7XG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXh0VGltZSA9IE1hdGgubWF4KGxhc3RUaW1lICsgMTYsIG5vdyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBjYWxsYmFjayhsYXN0VGltZSA9IG5leHRUaW1lKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFRpbWUgLSBub3cpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogUG9seWZpbGwgZm9yIHBlcmZvcm1hbmNlLm5vdywgcmVxdWlyZWQgYnkgckFGXG4gICAgICAgICAqL1xuICAgICAgICBpZighd2luZG93LnBlcmZvcm1hbmNlIHx8ICF3aW5kb3cucGVyZm9ybWFuY2Uubm93KXtcbiAgICAgICAgICAgIHdpbmRvdy5wZXJmb3JtYW5jZSA9IHtcbiAgICAgICAgICAgICAgICBzdGFydDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICBub3c6IGZ1bmN0aW9uKCl7IHJldHVybiBEYXRlLm5vdygpIC0gdGhpcy5zdGFydDsgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0pKCk7XG4gICAgXG4gICAgaWYgKCFGdW5jdGlvbi5wcm90b3R5cGUuYmluZCkge1xuICAgICAgICBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKG9UaGlzKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAvLyBjbG9zZXN0IHRoaW5nIHBvc3NpYmxlIHRvIHRoZSBFQ01BU2NyaXB0IDVcbiAgICAgICAgICAgICAgICAvLyBpbnRlcm5hbCBJc0NhbGxhYmxlIGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgLSB3aGF0IGlzIHRyeWluZyB0byBiZSAnK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2JvdW5kIGlzIG5vdCBjYWxsYWJsZScpO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgdmFyIGFBcmdzICAgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLFxuICAgICAgICAgICAgICAgIGZUb0JpbmQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGZOT1AgICAgPSBmdW5jdGlvbigpIHt9LFxuICAgICAgICAgICAgICAgIGZCb3VuZCAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZUb0JpbmQuYXBwbHkoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzIGluc3RhbmNlb2YgZk5PUCA/IHRoaXMgOiBvVGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFBcmdzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH07XG4gICAgXG4gICAgICAgICAgICBpZiAodGhpcy5wcm90b3R5cGUpIHtcbiAgICAgICAgICAgICAgICAvLyBuYXRpdmUgZnVuY3Rpb25zIGRvbid0IGhhdmUgYSBwcm90b3R5cGVcbiAgICAgICAgICAgICAgICBmTk9QLnByb3RvdHlwZSA9IHRoaXMucHJvdG90eXBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZkJvdW5kLnByb3RvdHlwZSA9IG5ldyBmTk9QKCk7XG4gICAgXG4gICAgICAgICAgICByZXR1cm4gZkJvdW5kO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBcbiAgICAvLyBQb2x5ZmlsbCB0byBnZXQgdGhlIG5hbWUgb2YgYSBmdW5jdGlvbiBpbiBJRTlcbiAgICBmdW5jdGlvbiBmdW5jdGlvbk5hbWUoZm4pIHtcbiAgICAgICAgaWYgKEZ1bmN0aW9uLnByb3RvdHlwZS5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhciBmdW5jTmFtZVJlZ2V4ID0gL2Z1bmN0aW9uXFxzKFteKF17MSx9KVxcKC87XG4gICAgICAgICAgICB2YXIgcmVzdWx0cyA9IChmdW5jTmFtZVJlZ2V4KS5leGVjKChmbikudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICByZXR1cm4gKHJlc3VsdHMgJiYgcmVzdWx0cy5sZW5ndGggPiAxKSA/IHJlc3VsdHNbMV0udHJpbSgpIDogXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChmbi5wcm90b3R5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZuLmNvbnN0cnVjdG9yLm5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZm4ucHJvdG90eXBlLmNvbnN0cnVjdG9yLm5hbWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZnVuY3Rpb24gcGFyc2VWYWx1ZShzdHIpe1xuICAgICAgICBpZigvdHJ1ZS8udGVzdChzdHIpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgZWxzZSBpZigvZmFsc2UvLnRlc3Qoc3RyKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBlbHNlIGlmKCFpc05hTihzdHIgKiAxKSkgcmV0dXJuIHBhcnNlRmxvYXQoc3RyKTtcbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgXG4gICAgLy8gQ29udmVydCBQYXNjYWxDYXNlIHRvIGtlYmFiLWNhc2VcbiAgICAvLyBUaGFuayB5b3U6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzg5NTU1ODBcbiAgICBmdW5jdGlvbiBoeXBoZW5hdGUoc3RyKSB7XG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxLSQyJykudG9Mb3dlckNhc2UoKTtcbiAgICB9XG5cbn0oalF1ZXJ5KTtcbiIsIi8qKiBAdmFyICBvYmplY3QgIHBhdHRlcm5saWJyYXJ5LkNvbmZpZyAgcGF0dGVybmxpYnJhcnkgZ2xvYmFsIGNvbmZpZ3VyYXRpb24gY29udGFpbmVyICovXG5pZiAoIXBhdHRlcm5saWJyYXJ5LkNvbmZpZykge1xuICAgIHBhdHRlcm5saWJyYXJ5LkNvbmZpZyA9IHtcbiAgICAgICAgLy8gZGV0ZWN0IFVJIGZyYW1ld29ya1xuICAgICAgICByZW5kZXJlciA6ICgodHlwZW9mIEZvdW5kYXRpb24gIT0gJ3VuZGVmaW5lZCcpID8gJ2ZvdW5kYXRpb24nIDogJ2Jvb3RzdHJhcCcpLFxuICAgICAgICAvLyBkZXRlY3QgbGFuZ3VhZ2VcbiAgICAgICAgbGFuZyA6ICQoJ0hUTUwnKS5hdHRyKCdsYW5nJykgfHwgJ2VuJyxcbiAgICAgICAgXG4gICAgICAgIC8vIFhIUiBzZWxlY3RvcnNcbiAgICAgICAgeGhyU2VsZWN0b3JzIDoge1xuICAgICAgICAgICAgeGhyQnV0dG9ucyAgOiBcIkEuYnRuW2hyZWYqPSdhZGQnXSwgQS5idG5baHJlZio9J2VkaXQnXSwgQS5idG5baHJlZio9J2RldGFpbHMnXSwgQS5idG5baHJlZio9J2RlbGV0ZSddXCIsXG4gICAgICAgICAgICB4aHJDVEFPcGVuICA6IFwiQS5idG4tY3RhLXhoci5jdGEteGhyLW1vZGFsXCIsXG4gICAgICAgICAgICB4aHJDVEFDbG9zZSA6IFwiLm1vZGFsLWNvbnRlbnQgLmJ0bi1jdGEteGhyLWNsb3NlLCAubW9kYWwtY29udGVudCAuYWxlcnQsIC5tb2RhbC1jb250ZW50IC5jbG9zZSwgLm1vZGFsLWNvbnRlbnQgLmN0YS14aHItbW9kYWwtY2xvc2UsIC5yZXZlYWwgLmN0YS14aHItbW9kYWwtY2xvc2VcIixcbiAgICAgICAgICAgIHhockZvcm1zICAgIDogXCIubW9kYWwtY29udGVudCAuZm9ybS14aHJcIlxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgLy8gbW9kYWwgc2V0dGluZ3NcbiAgICAgICAgbW9kYWxzIDoge1xuICAgICAgICAgICAgYm9vdHN0cmFwRWxlbWVudENsYXNzbmFtZSAgOiAnbW9kYWwnLFxuICAgICAgICAgICAgZm91bmRhdGlvbkVsZW1lbnRDbGFzc25hbWUgOiAncmV2ZWFsJ1xuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgLy8gZGF0YVRhYmxlIHBsdWctaW4gc2V0dGluZ3NcbiAgICAgICAgZGF0YVRhYmxlIDoge1xuICAgICAgICAgICAgbGFuZ1VSTHMgOiB7XG4gICAgICAgICAgICAgICAgJ2VuJyA6ICcvL2Nkbi5kYXRhdGFibGVzLm5ldC9wbHVnLWlucy8xLjEwLjkvaTE4bi9FbmdsaXNoLmpzb24nLFxuICAgICAgICAgICAgICAgICdkZScgOiAnLy9jZG4uZGF0YXRhYmxlcy5uZXQvcGx1Zy1pbnMvMS4xMC45L2kxOG4vR2VybWFuLmpzb24nLFxuICAgICAgICAgICAgICAgICdmcicgOiAnLy9jZG4uZGF0YXRhYmxlcy5uZXQvcGx1Zy1pbnMvMS4xMC45L2kxOG4vRnJlbmNoLmpzb24nLFxuICAgICAgICAgICAgICAgICdlcycgOiAnLy9jZG4uZGF0YXRhYmxlcy5uZXQvcGx1Zy1pbnMvMS4xMC45L2kxOG4vU3BhbmlzaC5qc29uJyxcbiAgICAgICAgICAgICAgICAnaXQnIDogJy8vY2RuLmRhdGF0YWJsZXMubmV0L3BsdWctaW5zLzEuMTAuOS9pMThuL0l0YWxpYW4uanNvbidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdGF0ZVNhdmUgOiB0cnVlLFxuICAgICAgICAgICAgc3RhdGVEdXJhdGlvbiA6IDYwICogNjAgKiAyNCAqIDEgIC8vIHNlYyAqIG1pbiAqIGggKiBkXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgIH07XG59XG4iLCIvKipcbiAqIFRoaXMgbW9kdWxlIHNldHMgdXAgdGhlIHNlYXJjaCBiYXIuXG4gKi9cblxuIWZ1bmN0aW9uKCkge1xuXG52YXIgc2VhcmNoU291cmNlID0ge1xuICBuYW1lIDogJ3BhdHRlcm5saWJyYXJ5JyxcblxuICAvLyBPbmx5IHNob3cgMTAgcmVzdWx0cyBhdCBvbmNlXG4gIGxpbWl0OiAxMCxcblxuICAvLyBGdW5jdGlvbiB0byBmZXRjaCByZXN1bHQgbGlzdCBhbmQgdGhlbiBmaW5kIGEgcmVzdWx0O1xuICBzb3VyY2U6IGZ1bmN0aW9uKHF1ZXJ5LCBzeW5jLCBhc3luYykge1xuICAgIHF1ZXJ5ID0gcXVlcnkudG9Mb3dlckNhc2UoKTtcblxuICAgICQuZ2V0SlNPTignL3BsL3NlYXJjaC5qc29uJywgZnVuY3Rpb24oZGF0YSwgc3RhdHVzKSB7XG4gICAgICBhc3luYyhkYXRhLmZpbHRlcihmdW5jdGlvbihlbGVtLCBpLCBhcnIpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBlbGVtLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgdmFyIHRlcm1zID0gW25hbWUsIG5hbWUucmVwbGFjZSgnLScsICcnKV0uY29uY2F0KGVsZW0udGFncyB8fCBbXSk7XG4gICAgICAgIGZvciAodmFyIGkgaW4gdGVybXMpIGlmICh0ZXJtc1tpXS5pbmRleE9mKHF1ZXJ5KSA+IC0xKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSkpO1xuICAgIH0pO1xuICB9LFxuXG4gIC8vIE5hbWUgdG8gdXNlIGZvciB0aGUgc2VhcmNoIHJlc3VsdCBpdHNlbGZcbiAgZGlzcGxheTogZnVuY3Rpb24oaXRlbSkge1xuICAgIHJldHVybiBpdGVtLm5hbWU7XG4gIH0sXG5cbiAgdGVtcGxhdGVzOiB7XG4gICAgLy8gSFRNTCB0aGF0IHJlbmRlcnMgaWYgdGhlcmUgYXJlIG5vIHJlc3VsdHNcbiAgICBub3RGb3VuZDogZnVuY3Rpb24ocXVlcnkpIHtcbiAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cInR0LWVtcHR5XCI+Tm8gcmVzdWx0cyBmb3IgXCInICsgcXVlcnkucXVlcnkgKyAnXCIuPC9kaXY+JztcbiAgICB9LFxuICAgIC8vIEhUTUwgdGhhdCByZW5kZXJzIGZvciBlYWNoIHJlc3VsdCBpbiB0aGUgbGlzdFxuICAgIHN1Z2dlc3Rpb246IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIHJldHVybiAnPGRpdj48c3BhbiBjbGFzcz1cIm5hbWVcIj4nICsgaXRlbS5uYW1lICsgJzxzcGFuIGNsYXNzPVwibWV0YVwiPicgKyBpdGVtLnR5cGUgKyAnPC9zcGFuPjwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJkZXNjXCI+JyArIGl0ZW0uZGVzY3JpcHRpb24gKyAnPC9zcGFuPjwvZGl2Pic7XG4gICAgfVxuICB9XG59XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcblx0Ly8gU2VhcmNoXG5cdGNvbnNvbGUubG9nKCdzZWFyY2g6ICcsICQoJ1tkYXRhLWRvY3Mtc2VhcmNoXScpKTtcblx0JCgnW2RhdGEtZG9jcy1zZWFyY2hdJylcblx0ICAudHlwZWFoZWFkKHsgaGlnaGxpZ2h0OiBmYWxzZSB9LCBzZWFyY2hTb3VyY2UpO1xuXHQkKCdbZGF0YS1kb2NzLXNlYXJjaF0nKVxuXHQgIC5iaW5kKCd0eXBlYWhlYWQ6c2VsZWN0JywgZnVuY3Rpb24oZSwgc2VsKSB7XG5cdCAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IFN0cmluZyhzZWwubGluaykucmVwbGFjZSgnc3JjL3BhcnRpYWxzJywgJy9wbC9wYXR0ZXJucycpLnJlcGxhY2UoJy9yZWFkbWUuaHRtbCcsICcnKTtcblx0ICB9KTtcblx0XG5cdC8vIEF1dG8taGlnaGxpZ2h0IHVubGVzcyBpdCdzIGEgcGhvbmVcblx0aWYgKCFuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC8oaVAoaG9uZXxhZHxvZCl8QW5kcm9pZCkvKSkge1xuXHQgICQoJ1tkYXRhLWRvY3Mtc2VhcmNoXScpLmZvY3VzKCk7XG5cdH1cbn0pO1xuXG59KCk7XG4iLCIhZnVuY3Rpb24oJCwgcGF0dGVybmxpYnJhcnkpIHtcblxuLy8gRGVmYXVsdCBzZXQgb2YgbWVkaWEgcXVlcmllc1xudmFyIGRlZmF1bHRRdWVyaWVzID0ge1xuICAnZGVmYXVsdCcgOiAnb25seSBzY3JlZW4nLFxuICBsYW5kc2NhcGUgOiAnb25seSBzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogbGFuZHNjYXBlKScsXG4gIHBvcnRyYWl0IDogJ29ubHkgc2NyZWVuIGFuZCAob3JpZW50YXRpb246IHBvcnRyYWl0KScsXG4gIHJldGluYSA6ICdvbmx5IHNjcmVlbiBhbmQgKC13ZWJraXQtbWluLWRldmljZS1waXhlbC1yYXRpbzogMiksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLS1tb3otZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kICgtby1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyLzEpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAxOTJkcGkpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAyZHBweCknXG59O1xuXG52YXIgTWVkaWFRdWVyeSA9IHtcbiAgcXVlcmllczogW10sXG4gIGN1cnJlbnQ6ICcnLFxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIHNjcmVlbiBpcyBhdCBsZWFzdCBhcyB3aWRlIGFzIGEgYnJlYWtwb2ludC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBjaGVjay5cbiAgICogQHJldHVybnMge0Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgYnJlYWtwb2ludCBtYXRjaGVzLCBgZmFsc2VgIGlmIGl0J3Mgc21hbGxlci5cbiAgICovXG4gIGF0TGVhc3Q6IGZ1bmN0aW9uKHNpemUpIHtcbiAgICB2YXIgcXVlcnkgPSB0aGlzLmdldChzaXplKTtcblxuICAgIGlmIChxdWVyeSkge1xuICAgICAgcmV0dXJuIHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5KS5tYXRjaGVzO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICAvKipcbiAgICogR2V0cyB0aGUgbWVkaWEgcXVlcnkgb2YgYSBicmVha3BvaW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGdldC5cbiAgICogQHJldHVybnMge1N0cmluZ3xudWxsfSAtIFRoZSBtZWRpYSBxdWVyeSBvZiB0aGUgYnJlYWtwb2ludCwgb3IgYG51bGxgIGlmIHRoZSBicmVha3BvaW50IGRvZXNuJ3QgZXhpc3QuXG4gICAqL1xuICBnZXQ6IGZ1bmN0aW9uKHNpemUpIHtcbiAgICBmb3IgKHZhciBpIGluIHRoaXMucXVlcmllcykge1xuICAgICAgdmFyIHF1ZXJ5ID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgaWYgKHNpemUgPT09IHF1ZXJ5Lm5hbWUpIHJldHVybiBxdWVyeS52YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfSxcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIG1lZGlhIHF1ZXJ5IGhlbHBlciwgYnkgZXh0cmFjdGluZyB0aGUgYnJlYWtwb2ludCBsaXN0IGZyb20gdGhlIENTUyBhbmQgYWN0aXZhdGluZyB0aGUgYnJlYWtwb2ludCB3YXRjaGVyLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGV4dHJhY3RlZFN0eWxlcyA9ICQoJy5wYXR0ZXJubGlicmFyeS1tcScpLmNzcygnZm9udC1mYW1pbHknKTtcbiAgICB2YXIgbmFtZWRRdWVyaWVzO1xuXG4gICAgbmFtZWRRdWVyaWVzID0gcGFyc2VTdHlsZVRvT2JqZWN0KGV4dHJhY3RlZFN0eWxlcyk7XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gbmFtZWRRdWVyaWVzKSB7XG4gICAgICBzZWxmLnF1ZXJpZXMucHVzaCh7XG4gICAgICAgIG5hbWU6IGtleSxcbiAgICAgICAgdmFsdWU6ICdvbmx5IHNjcmVlbiBhbmQgKG1pbi13aWR0aDogJyArIG5hbWVkUXVlcmllc1trZXldICsgJyknXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLl9nZXRDdXJyZW50U2l6ZSgpO1xuXG4gICAgdGhpcy5fd2F0Y2hlcigpO1xuXG4gICAgLy8gRXh0ZW5kIGRlZmF1bHQgcXVlcmllc1xuICAgIC8vIG5hbWVkUXVlcmllcyA9ICQuZXh0ZW5kKGRlZmF1bHRRdWVyaWVzLCBuYW1lZFF1ZXJpZXMpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBjdXJyZW50IGJyZWFrcG9pbnQgbmFtZSBieSB0ZXN0aW5nIGV2ZXJ5IGJyZWFrcG9pbnQgYW5kIHJldHVybmluZyB0aGUgbGFzdCBvbmUgdG8gbWF0Y2ggKHRoZSBiaWdnZXN0IG9uZSkuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSBOYW1lIG9mIHRoZSBjdXJyZW50IGJyZWFrcG9pbnQuXG4gICAqL1xuICBfZ2V0Q3VycmVudFNpemU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBtYXRjaGVkO1xuXG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLnF1ZXJpZXMpIHtcbiAgICAgIHZhciBxdWVyeSA9IHRoaXMucXVlcmllc1tpXTtcblxuICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5LnZhbHVlKS5tYXRjaGVzKSB7XG4gICAgICAgIG1hdGNoZWQgPSBxdWVyeTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZih0eXBlb2YgbWF0Y2hlZCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBtYXRjaGVkLm5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBtYXRjaGVkO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQWN0aXZhdGVzIHRoZSBicmVha3BvaW50IHdhdGNoZXIsIHdoaWNoIGZpcmVzIGFuIGV2ZW50IG9uIHRoZSB3aW5kb3cgd2hlbmV2ZXIgdGhlIGJyZWFrcG9pbnQgY2hhbmdlcy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfd2F0Y2hlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICQod2luZG93KS5vbigncmVzaXplLnpmLm1lZGlhcXVlcnknLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBuZXdTaXplID0gX3RoaXMuX2dldEN1cnJlbnRTaXplKCk7XG5cbiAgICAgIGlmIChuZXdTaXplICE9PSBfdGhpcy5jdXJyZW50KSB7XG4gICAgICAgIC8vIEJyb2FkY2FzdCB0aGUgbWVkaWEgcXVlcnkgY2hhbmdlIG9uIHRoZSB3aW5kb3dcbiAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIFtuZXdTaXplLCBfdGhpcy5jdXJyZW50XSk7XG5cbiAgICAgICAgLy8gQ2hhbmdlIHRoZSBjdXJyZW50IG1lZGlhIHF1ZXJ5XG4gICAgICAgIF90aGlzLmN1cnJlbnQgPSBuZXdTaXplO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuXG5wYXR0ZXJubGlicmFyeS5NZWRpYVF1ZXJ5ID0gTWVkaWFRdWVyeTtcblxuLy8gbWF0Y2hNZWRpYSgpIHBvbHlmaWxsIC0gVGVzdCBhIENTUyBtZWRpYSB0eXBlL3F1ZXJ5IGluIEpTLlxuLy8gQXV0aG9ycyAmIGNvcHlyaWdodCAoYykgMjAxMjogU2NvdHQgSmVobCwgUGF1bCBJcmlzaCwgTmljaG9sYXMgWmFrYXMsIERhdmlkIEtuaWdodC4gRHVhbCBNSVQvQlNEIGxpY2Vuc2VcbndpbmRvdy5tYXRjaE1lZGlhIHx8ICh3aW5kb3cubWF0Y2hNZWRpYSA9IGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gRm9yIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBtYXRjaE1lZGl1bSBhcGkgc3VjaCBhcyBJRSA5IGFuZCB3ZWJraXRcbiAgdmFyIHN0eWxlTWVkaWEgPSAod2luZG93LnN0eWxlTWVkaWEgfHwgd2luZG93Lm1lZGlhKTtcblxuICAvLyBGb3IgdGhvc2UgdGhhdCBkb24ndCBzdXBwb3J0IG1hdGNoTWVkaXVtXG4gIGlmICghc3R5bGVNZWRpYSkge1xuICAgIHZhciBzdHlsZSAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKSxcbiAgICBzY3JpcHQgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXSxcbiAgICBpbmZvICAgICAgICA9IG51bGw7XG5cbiAgICBzdHlsZS50eXBlICA9ICd0ZXh0L2Nzcyc7XG4gICAgc3R5bGUuaWQgICAgPSAnbWF0Y2htZWRpYWpzLXRlc3QnO1xuXG4gICAgc2NyaXB0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHN0eWxlLCBzY3JpcHQpO1xuXG4gICAgLy8gJ3N0eWxlLmN1cnJlbnRTdHlsZScgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnd2luZG93LmdldENvbXB1dGVkU3R5bGUnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICBpbmZvID0gKCdnZXRDb21wdXRlZFN0eWxlJyBpbiB3aW5kb3cpICYmIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHN0eWxlLCBudWxsKSB8fCBzdHlsZS5jdXJyZW50U3R5bGU7XG5cbiAgICBzdHlsZU1lZGlhID0ge1xuICAgICAgbWF0Y2hNZWRpdW06IGZ1bmN0aW9uKG1lZGlhKSB7XG4gICAgICAgIHZhciB0ZXh0ID0gJ0BtZWRpYSAnICsgbWVkaWEgKyAneyAjbWF0Y2htZWRpYWpzLXRlc3QgeyB3aWR0aDogMXB4OyB9IH0nO1xuXG4gICAgICAgIC8vICdzdHlsZS5zdHlsZVNoZWV0JyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICdzdHlsZS50ZXh0Q29udGVudCcgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xuICAgICAgICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgICAgICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3R5bGUudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGVzdCBpZiBtZWRpYSBxdWVyeSBpcyB0cnVlIG9yIGZhbHNlXG4gICAgICAgIHJldHVybiBpbmZvLndpZHRoID09PSAnMXB4JztcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG1lZGlhKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1hdGNoZXM6IHN0eWxlTWVkaWEubWF0Y2hNZWRpdW0obWVkaWEgfHwgJ2FsbCcpLFxuICAgICAgbWVkaWE6IG1lZGlhIHx8ICdhbGwnXG4gICAgfTtcbiAgfTtcbn0oKSk7XG5cbi8vIFRoYW5rIHlvdTogaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9xdWVyeS1zdHJpbmdcbmZ1bmN0aW9uIHBhcnNlU3R5bGVUb09iamVjdChzdHIpIHtcbiAgdmFyIHN0eWxlT2JqZWN0ID0ge307XG5cbiAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHN0eWxlT2JqZWN0O1xuICB9XG5cbiAgc3RyID0gc3RyLnRyaW0oKS5zbGljZSgxLCAtMSk7IC8vIGJyb3dzZXJzIHJlLXF1b3RlIHN0cmluZyBzdHlsZSB2YWx1ZXNcblxuICBpZiAoIXN0cikge1xuICAgIHJldHVybiBzdHlsZU9iamVjdDtcbiAgfVxuXG4gIHN0eWxlT2JqZWN0ID0gc3RyLnNwbGl0KCcmJykucmVkdWNlKGZ1bmN0aW9uKHJldCwgcGFyYW0pIHtcbiAgICB2YXIgcGFydHMgPSBwYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKS5zcGxpdCgnPScpO1xuICAgIHZhciBrZXkgPSBwYXJ0c1swXTtcbiAgICB2YXIgdmFsID0gcGFydHNbMV07XG4gICAga2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KGtleSk7XG5cbiAgICAvLyBtaXNzaW5nIGA9YCBzaG91bGQgYmUgYG51bGxgOlxuICAgIC8vIGh0dHA6Ly93My5vcmcvVFIvMjAxMi9XRC11cmwtMjAxMjA1MjQvI2NvbGxlY3QtdXJsLXBhcmFtZXRlcnNcbiAgICB2YWwgPSB2YWwgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBkZWNvZGVVUklDb21wb25lbnQodmFsKTtcblxuICAgIGlmICghcmV0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHJldFtrZXldID0gdmFsO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXRba2V5XSkpIHtcbiAgICAgIHJldFtrZXldLnB1c2godmFsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0W2tleV0gPSBbcmV0W2tleV0sIHZhbF07XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH0sIHt9KTtcblxuICByZXR1cm4gc3R5bGVPYmplY3Q7XG59XG5cbn0oalF1ZXJ5LCBwYXR0ZXJubGlicmFyeSk7XG4iLCIvKipcbiAqIFxuICovXG47KGZ1bmN0aW9uICgkLCB3aW5kb3csIGRvY3VtZW50LCBwYXR0ZXJubGlicmFyeSwgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuXG4gIHBhdHRlcm5saWJyYXJ5LmxpYnMubW9kYWwgPSB7XG4gICAgbmFtZSA6ICdtb2RhbCcsXG5cbiAgICB2ZXJzaW9uIDogJzAuMC4xJyxcblxuICAgIHNldHRpbmdzIDoge1xuICAgICAgY2FsbGJhY2sgOiBmdW5jdGlvbiAoKSB7fVxuICAgIH0sXG5cbiAgICAvKmluaXQgOiBmdW5jdGlvbiAoc2NvcGUsIG1ldGhvZCwgb3B0aW9ucykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgLy8gcGF0dGVybmxpYnJhcnkuaW5oZXJpdCh0aGlzLCAnbW9kdWxlbmFtZTEgbW9kdWxlbmFtZTInKTtcblxuICAgICAgdGhpcy5iaW5kaW5ncyhtZXRob2QsIG9wdGlvbnMpO1xuICAgIH0sKi9cblxuICAgIC8qKlxuICAgICAqIG9wZW4gbW9kYWwgZGlhbG9nXG4gICAgICogXG4gICAgICogQHBhcmFtICBtaXhlZCAgZGF0YSAgdGhlIG1vZGFsIGNvbnRlbnRcbiAgICAgKiBAcGFyYW0gIHN0cmluZyAgdXBkYXRlV2luZG93SHJlZiAgVVJMIHRvIHVwZGF0ZSBicm93c2VyIGhpc3RvcnkgYW5kIGxvY2F0aW9uLCAtZmFsc2UvbnVsbC0gZGlzYWJsZXMsIGRlZmF1bHQgLWZhbHNlLSBcbiAgICAgKiBAcmV0dXJuIHBhdHRlcm5saWJyYXJ5LmxpYnMubW9kYWxcbiAgICAgKi9cbiAgICBvcGVuIDogZnVuY3Rpb24gKGRhdGEsIHVwZGF0ZVdpbmRvd0hyZWYpIHtcbiAgICAgICAgaWYgKCh0eXBlb2YgJC5mbi5tb2RhbCA9PSAndW5kZWZpbmVkJykgJiYgKHR5cGVvZiBGb3VuZGF0aW9uLlJldmVhbCA9PSAndW5kZWZpbmVkJykpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignQm9vdHN0cmFwIE1vZGFsIGFuZC9vciBGb3VuZGF0aW9uIFJldmVhbCBwbHVnLWlucyBub3QgZm91bmQuLi4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgJG1vZGFsID0gbnVsbDtcbiAgICAgICAgaWYgKHR5cGVvZiBGb3VuZGF0aW9uICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBpZiAoICQoJyMnK3BhdHRlcm5saWJyYXJ5LkNvbmZpZy5tb2RhbHMuZm91bmRhdGlvbkVsZW1lbnRDbGFzc25hbWUpLnNpemUoKSA9PSAwICkge1xuICAgICAgICAgICAgICAgICQoJ0JPRFknKS5hcHBlbmQoJzxkaXYgaWQ9XCInK3BhdHRlcm5saWJyYXJ5LkNvbmZpZy5tb2RhbHMuZm91bmRhdGlvbkVsZW1lbnRDbGFzc25hbWUrJ1wiIGNsYXNzPVwiJytwYXR0ZXJubGlicmFyeS5Db25maWcubW9kYWxzLmZvdW5kYXRpb25FbGVtZW50Q2xhc3NuYW1lKydcIiBkYXRhLXJldmVhbD48L2Rpdj4nKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHJldmVhbE9wdGlvbnMgPSB7IFxuICAgICAgICAgICAgXHRcImFuaW1hdGlvbkluXCIgICAgOiBcInNjYWxlLWluLXVwXCIsXG4gICAgICAgICAgICBcdFwiYW5pbWF0aW9uT3V0XCIgICA6IFwic2NhbGUtb3V0LWRvd25cIixcbiAgICAgICAgICAgIFx0XCJvdmVybGF5XCIgICAgICAgIDogdHJ1ZSxcbiAgICAgICAgICAgIFx0XCJjbG9zZU9uQ2xpY2tcIiAgIDogZmFsc2UsXG4gICAgICAgICAgICBcdFwiY2xvc2VPbkVjc1wiICAgICA6IHRydWUsXG4gICAgICAgICAgICBcdFwibXVsdGlwbGVPcGVuZWRcIiA6IGZhbHNlLFxuICAgICAgICAgICAgXHRcImRlZXBMaW5rXCIgICAgICAgOiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG1vZGFsRGF0YSA9ICcnK2RhdGErJycsXG4gICAgICAgICAgICAgICAgbSA9IG5ldyBGb3VuZGF0aW9uLlJldmVhbCgkKCcjJytwYXR0ZXJubGlicmFyeS5Db25maWcubW9kYWxzLmZvdW5kYXRpb25FbGVtZW50Q2xhc3NuYW1lKSwgcmV2ZWFsT3B0aW9ucylcbiAgICAgICAgICAgIDtcbiAgICAgICAgICAgICQoJyMnK3BhdHRlcm5saWJyYXJ5LkNvbmZpZy5tb2RhbHMuZm91bmRhdGlvbkVsZW1lbnRDbGFzc25hbWUpLmh0bWwoZGF0YSkuZm91bmRhdGlvbignb3BlbicpO1xuICAgICAgICAgICAgJG1vZGFsID0gJCgnLicrcGF0dGVybmxpYnJhcnkuQ29uZmlnLm1vZGFscy5mb3VuZGF0aW9uRWxlbWVudENsYXNzbmFtZSk7XG4gICAgICAgICAgICAkbW9kYWwub24oJ2Nsb3NlZC56Zi5yZXZlYWwnLCBwYXR0ZXJubGlicmFyeS5Nb2RhbC5jbG9zZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgJG1vZGFsRGVmYXVsdHMgPSB7XG4gICAgICAgICAgICAgICAgc2hvdzogdHJ1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICQoZGF0YSkubW9kYWwoJG1vZGFsRGVmYXVsdHMpO1xuICAgICAgICAgICAgJG1vZGFsID0gJCgnLicrcGF0dGVybmxpYnJhcnkuQ29uZmlnLm1vZGFscy5ib290c3RyYXBFbGVtZW50Q2xhc3NuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKHVwZGF0ZVdpbmRvd0hyZWYpIHtcbiAgICAgICAgICAgIHBhdHRlcm5saWJyYXJ5LldpbmRvd0hyZWYucmVzZXQoKTtcbiAgICAgICAgICAgIGRvY3VtZW50Ll9vbGRfaHJlZiA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgXCJodG1sXCIgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBcInBhZ2VUaXRsZVwiIDogZG9jdW1lbnQudGl0bGVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFwiXCIsXG4gICAgICAgICAgICAgICAgdXBkYXRlV2luZG93SHJlZlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuICgkbW9kYWwpO1xuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICogY2xvc2UgbW9kYWwgZGlhbG9nXG4gICAgICogXG4gICAgICogQHJldHVybiBwYXR0ZXJubGlicmFyeS5saWJzLm1vZGFsXG4gICAgICovXG4gICAgY2xvc2UgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICgodHlwZW9mICQuZm4ubW9kYWwgPT0gJ3VuZGVmaW5lZCcpICYmICh0eXBlb2YgRm91bmRhdGlvbi5SZXZlYWwgPT0gJ3VuZGVmaW5lZCcpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ2pRdWVyeSBNb2RhbCBhbmQvb3IgRm91bmRhdGlvbiBSZXZlYWwgcGx1Zy1pbnMgbm90IGZvdW5kLi4uJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciAkbW9kYWw7XG4gICAgICAgIC8vIGNsb3NlL2Rlc3Ryb3kgbW9kYWxzXG4gICAgICAgIGlmICh0eXBlb2YgRm91bmRhdGlvbiAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgJG1vZGFsID0gJCgnLicrcGF0dGVybmxpYnJhcnkuQ29uZmlnLm1vZGFscy5mb3VuZGF0aW9uRWxlbWVudENsYXNzbmFtZSk7XG4gICAgICAgICAgICBpZiAoJG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgJG1vZGFsLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgJG1vZGFsLmZvdW5kYXRpb24oJ2Nsb3NlJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vJG1vZGFsLmZvdW5kYXRpb24oJ2Rlc3Ryb3knKTtcbiAgICAgICAgICAgICAgICAgICAgLy8kKCcucmV2ZWFsLW92ZXJsYXknKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBcdGNvbnNvbGUuaW5mbygnbW9kYWwgY2xvc2VkLi4uJyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIFx0Ly9jb25zb2xlLndhcm4oJ21vZGFsIGNvdWxkIG5vdCBiZSBjbG9zZWQuLi4gZm9yY2UgcmVtb3ZhbC4uLicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRtb2RhbCA9ICQoJy4nK3BhdHRlcm5saWJyYXJ5LkNvbmZpZy5tb2RhbHMuYm9vdHN0cmFwRWxlbWVudENsYXNzbmFtZSk7XG4gICAgICAgICAgICBpZiAoJG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgJG1vZGFsLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIGNsZWFuIHVwXG4gICAgICAgICQoJ0JPRFknKS5yZW1vdmVDbGFzcygnaXMtcmV2ZWFsLW9wZW4nKTtcbiAgICAgICAgJCgnLnJldmVhbCwgLnJldmVhbC13cmFwcGVyLCAubW9kYWwsIC5tb2RhbC1iYWNrZHJvcCcpLnJlbW92ZSgpO1xuICAgICAgICBcbiAgICAgICAgLy8gKHJlKXNldCBkb2N1bWVudCBVUkxcbiAgICAgICAgcGF0dGVybmxpYnJhcnkuV2luZG93SHJlZi5yZXNldCgpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuICh0aGlzKTtcbiAgICB9XG5cbiAgfTtcblxuICAvLyBjb2RlLCBwcml2YXRlIGZ1bmN0aW9ucywgZXRjIGhlcmUuLi5cblxuICBwYXR0ZXJubGlicmFyeS5Nb2RhbCA9IHtcbiAgICAgIG9wZW4gOiBwYXR0ZXJubGlicmFyeS5saWJzLm1vZGFsLm9wZW4sXG4gICAgICBjbG9zZSA6IHBhdHRlcm5saWJyYXJ5LmxpYnMubW9kYWwuY2xvc2UsXG4gIH07XG4gIFxufSkoalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50LCB3aW5kb3cucGF0dGVybmxpYnJhcnkpO1xuXG5cbiIsIi8qKlxuICogXG4gKi9cbjsoZnVuY3Rpb24gKCQsIHdpbmRvdywgZG9jdW1lbnQsIHBhdHRlcm5saWJyYXJ5LCB1bmRlZmluZWQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG5cbiAgcGF0dGVybmxpYnJhcnkubGlicy53aW5kb3docmVmID0ge1xuICAgIG5hbWUgOiAnd2luZG93aHJlZicsXG5cbiAgICB2ZXJzaW9uIDogJzAuMC4xJyxcblxuICAgIHNldHRpbmdzIDoge1xuICAgICAgY2FsbGJhY2sgOiBmdW5jdGlvbiAoKSB7fVxuICAgIH0sXG5cbiAgICBpbml0IDogZnVuY3Rpb24gKHNjb3BlLCBtZXRob2QsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIC8vIHBhdHRlcm5saWJyYXJ5LmluaGVyaXQodGhpcywgJ21vZHVsZW5hbWUxIG1vZHVsZW5hbWUyJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHVwZGF0ZSB3aW5kb3cncyBocmVmIHRvIFVSTCBhbmQgc2F2ZSBvbGQgaHJlZlxuICAgICAqIFxuICAgICAqIEBwYXJhbSAgc3RyaW5nICB1cmwgIFVSTCB0byB1cGRhdGUgdG9cbiAgICAgKiBAcmV0dXJuIHBhdHRlcm5saWJyYXJ5LmxpYnMud2luZG93aHJlZlxuICAgICAqL1xuICAgIHVwZGF0ZSA6IGZ1bmN0aW9uICggdXJsICkge1xuICAgICAgICBpZiAoICh1cmwgPT0gJycpIHx8ICh1cmwgPT0gd2luZG93LmxvY2F0aW9uLmhyZWYpICkgeyByZXR1cm47IH1cbiAgICAgICAgXG4gICAgICAgIGRvY3VtZW50Ll9vbGRfaHJlZiA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJodG1sXCIgOiBudWxsLFxuICAgICAgICAgICAgICAgIFwicGFnZVRpdGxlXCIgOiBkb2N1bWVudC50aXRsZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiXCIsXG4gICAgICAgICAgICB1cGRhdGVXaW5kb3dIcmVmXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gKHRoaXMpO1xuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICogcmVzZXQgd2luZG93J3MgaHJlZiB0byBzdG9yZWQgVVJMXG4gICAgICogXG4gICAgICogQHJldHVybiBwYXR0ZXJubGlicmFyeS5saWJzLndpbmRvd2hyZWZcbiAgICAgKi9cbiAgICByZXNldCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGRvY3VtZW50Ll9vbGRfaHJlZikge1xuICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgXCJodG1sXCI6bnVsbCxcbiAgICAgICAgICAgICAgICAgICAgXCJwYWdlVGl0bGVcIjpkb2N1bWVudC50aXRsZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5fb2xkX2hyZWZcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICh0aGlzKTtcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIGNsZWFyIHN0b3JlZCBVUkxcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJuIHBhdHRlcm5saWJyYXJ5LmxpYnMud2luZG93aHJlZlxuICAgICAqL1xuICAgIGNsZWFyT2xkSHJlZiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZG9jdW1lbnQuX29sZF9ocmVmID0gbnVsbDtcbiAgICAgICAgcmV0dXJuICh0aGlzKTtcbiAgICB9XG5cbiAgfTtcblxuICAvLyBjb2RlLCBwcml2YXRlIGZ1bmN0aW9ucywgZXRjIGhlcmUuLi5cblxuICBwYXR0ZXJubGlicmFyeS5XaW5kb3dIcmVmID0ge1xuICAgICAgdXBkYXRlIDogcGF0dGVybmxpYnJhcnkubGlicy53aW5kb3docmVmLnVwZGF0ZSxcbiAgICAgIHJlc2V0IDogcGF0dGVybmxpYnJhcnkubGlicy53aW5kb3docmVmLnJlc2V0LFxuICAgICAgY2xlYXIgOiBwYXR0ZXJubGlicmFyeS5saWJzLndpbmRvd2hyZWYuY2xlYXJPbGRIcmVmXG4gIH07XG4gIFxufSkoalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50LCB3aW5kb3cucGF0dGVybmxpYnJhcnkpO1xuXG5cbiIsIi8qKlxuICogaW5pdGlhbGl6ZSBtb2RhbCBYSFIgdHJpZ2dlcnMgYW5kIHdhdGNoIGZvciBtb2RhbCBYSFIgZm9ybXNcbiAqL1xuOyhmdW5jdGlvbiAoJCwgd2luZG93LCBkb2N1bWVudCwgcGF0dGVybmxpYnJhcnksIHVuZGVmaW5lZCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICBpZiAoKHR5cGVvZiAkLmZuLm1vZGFsID09ICd1bmRlZmluZWQnKSAmJiAodHlwZW9mIEZvdW5kYXRpb24uUmV2ZWFsID09ICd1bmRlZmluZWQnKSkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2pRdWVyeSBNb2RhbCBhbmQvb3IgRm91bmRhdGlvbiBSZXZlYWwgcGx1Zy1pbnMgbm90IGZvdW5kLi4uJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyICRib2R5ID0gJChkb2N1bWVudCksXG4gICAgICAgICRhamF4QnV0dG9ucyAgPSBwYXR0ZXJubGlicmFyeS5Db25maWcueGhyU2VsZWN0b3JzLnhockJ1dHRvbnMsIC8vIFwiQS5idG5baHJlZio9J2FkZCddLCBBLmJ0bltocmVmKj0nZWRpdCddLCBBLmJ0bltocmVmKj0nZGV0YWlscyddLCBBLmJ0bltocmVmKj0nZGVsZXRlJ11cIixcbiAgICAgICAgJGFqYXhDVEFPcGVuICA9IHBhdHRlcm5saWJyYXJ5LkNvbmZpZy54aHJTZWxlY3RvcnMueGhyQ1RBT3BlbiwgLy8gXCJBLmJ0bi1jdGEteGhyLmN0YS14aHItbW9kYWxcIixcbiAgICAgICAgJGFqYXhDVEFDbG9zZSA9IHBhdHRlcm5saWJyYXJ5LkNvbmZpZy54aHJTZWxlY3RvcnMueGhyQ1RBQ2xvc2UsIC8vIFwiLm1vZGFsLWNvbnRlbnQgLmJ0bi1jdGEteGhyLWNsb3NlLCAubW9kYWwtY29udGVudCAuYWxlcnQsIC5tb2RhbC1jb250ZW50IC5jbG9zZSwgLm1vZGFsLWNvbnRlbnQgLmN0YS14aHItbW9kYWwtY2xvc2VcIixcbiAgICAgICAgJGFqYXhGb3JtcyAgICA9IHBhdHRlcm5saWJyYXJ5LkNvbmZpZy54aHJTZWxlY3RvcnMueGhyRm9ybXMgLy8gXCIubW9kYWwtY29udGVudCAuZm9ybS14aHJcIlxuICAgIDtcbiAgICBcbiAgICAvL1xuICAgIC8vIG1vZGFsIHRyaWdnZXJzXG4gICAgLy9cbiAgICB2YXIgaGFuZGxlcl9pbml0WEhSTW9kYWxUcmlnZ2VyID0gZnVuY3Rpb24gKG9FdmVudCkge1xuICAgICAgICBcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcbiAgICAgICAgICAgICRidG5VcmwgPSAkdGhpcy5hdHRyKCdocmVmJyk7XG4gICAgICAgIFxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgaGVhZGVycyA6IHtcbiAgICAgICAgICAgICAgICAnQWNjZXB0JyA6ICd0ZXh0L2h0bWwnLFxuICAgICAgICAgICAgICAgICdYLWxheW91dCcgOiAnbW9kYWwnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdHlwZSAgICA6IFwiR0VUXCIsXG4gICAgICAgICAgICBjYWNoZSAgICA6IGZhbHNlLFxuICAgICAgICAgICAgdXJsICAgICAgICA6ICR0aGlzLmF0dHIoJ2hyZWYnKSxcbiAgICAgICAgICAgIHN1Y2Nlc3MgICAgOiBmdW5jdGlvbiAoZGF0YSkge1xuXG4gICAgICAgICAgICAgICAgcGF0dGVybmxpYnJhcnkuTW9kYWwub3BlbihkYXRhLCAkYnRuVXJsKTtcblxuICAgICAgICAgICAgICAgIGlmICggKHR5cGVvZiAkLmZuLmRhdGFUYWJsZSAhPSAndW5kZWZpZW5lZCcpICkge1xuICAgICAgICAgICAgICAgICAgICAkKCcuZGF0YXRhYmxlLmNydWQnKS5kYXRhVGFibGUoKS5hcGkoKS5hamF4LnJlbG9hZChmdW5jdGlvbiAoIHRhYmxlZGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCB0YWJsZWRhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIG9FdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBvRXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIG9FdmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgcmV0dXJuIChmYWxzZSk7XG4gICAgICAgIFxuICAgIH07IFxuXG4gICAgLy9cbiAgICAvLyBtb2RhbCBmb3Jtc1xuICAgIC8vXG4gICAgdmFyIGhhbmRsZXJfaW5pdFhIUk1vZGFsRm9ybSA9IGZ1bmN0aW9uIChvRXZlbnQpIHtcbiAgICAgICAgdmFyICRmb3JtID0gJCh0aGlzKSxcbiAgICAgICAgICAgIGZvcm1VUkwgPSAkZm9ybS5hdHRyKCdhY3Rpb24nKSxcbiAgICAgICAgICAgIGZvcm1EYXRhID0gJGZvcm0uc2VyaWFsaXplQXJyYXkoKVxuICAgICAgICA7XG4gICAgICAgIFxuICAgICAgICBmb3JtRGF0YS5wdXNoKCBcbiAgICAgICAgICAgICgkZm9ybS5maW5kKCdpbnB1dFtuYW1lPWRlbF0uYnRuJykuc2l6ZSgpID4gMCkgPyB7bmFtZTogJ2RlbCcsIHZhbHVlOiAnZGVsZXRlJ30gOiBudWxsIFxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIGhlYWRlcnMgOiB7XG4gICAgICAgICAgICAgICAgJ0FjY2VwdCcgOiAndGV4dC9odG1sJyxcbiAgICAgICAgICAgICAgICAnWC1sYXlvdXQnIDogJ21vZGFsJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHR5cGUgICAgOiBcIlBPU1RcIixcbiAgICAgICAgICAgIGNhY2hlICAgIDogZmFsc2UsXG4gICAgICAgICAgICB1cmwgICAgICAgIDogZm9ybVVSTCxcbiAgICAgICAgICAgIGRhdGEgICAgOiBmb3JtRGF0YSxcbiAgICAgICAgICAgIHN1Y2Nlc3MgICAgOiBmdW5jdGlvbiAoZGF0YSkge1xuXG4gICAgICAgICAgICAgICAgcGF0dGVybmxpYnJhcnkuTW9kYWwuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICBwYXR0ZXJubGlicmFyeS5Nb2RhbC5vcGVuKGRhdGEsIGZvcm1VUkwpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmICggKHR5cGVvZiAkLmZuLmRhdGFUYWJsZSAhPSAndW5kZWZpZW5lZCcpICkge1xuICAgICAgICAgICAgICAgICAgICAkKCcuZGF0YXRhYmxlLmNydWQnKS5kYXRhVGFibGUoKS5hcGkoKS5hamF4LnJlbG9hZChmdW5jdGlvbiAoIHRhYmxlZGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCB0YWJsZWRhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIG9FdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBvRXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIG9FdmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgcmV0dXJuIChmYWxzZSk7XG4gICAgfTtcblxuICAgIC8vXG4gICAgLy8gbW9kYWwgY2xvc2VcbiAgICAvL1xuICAgIHZhciBoYW5kbGVyX2Nsb3NlTW9kYWwgPSBmdW5jdGlvbiAob0V2ZW50KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwYXR0ZXJubGlicmFyeS5Nb2RhbC5jbG9zZSgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICBcbiAgICAgICAgb0V2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIG9FdmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgb0V2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICByZXR1cm4gKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICAvLyB3YXRjaCBET00gZWxlbWVudHNcbiAgICAvL1xuICAgICRib2R5Lm9uKCdjbGljay5wYXR0ZXJubGlicmFyeS54aHJtb2RhbG9wZW4nLCAgJGFqYXhDVEFPcGVuLCAge30sIGhhbmRsZXJfaW5pdFhIUk1vZGFsVHJpZ2dlcik7XG4gICAgJGJvZHkub24oJ3N1Ym1pdC5wYXR0ZXJubGlicmFyeS54aHJtb2RhbHN1Ym1pdCcsICRhamF4Rm9ybXMsICAgIHt9LCBoYW5kbGVyX2luaXRYSFJNb2RhbEZvcm0pO1xuICAgICRib2R5Lm9uKCdjbGljay5wYXR0ZXJubGlicmFyeS54aHJtb2RhbGNsb3NlJywgICRhamF4Q1RBQ2xvc2UsIHt9LCBoYW5kbGVyX2Nsb3NlTW9kYWwpO1xuXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAkKCRhamF4Q1RBT3Blbikub24oJ2NsaWNrLnBhdHRlcm5saWJyYXJ5Lnhocm1vZGFsb3BlbicsIGhhbmRsZXJfaW5pdFhIUk1vZGFsVHJpZ2dlcik7XG4gICAgICAgICQoJGFqYXhGb3Jtcykub24oJ3N1Ym1pdC5wYXR0ZXJubGlicmFyeS54aHJtb2RhbHN1Ym1pdCcsIGhhbmRsZXJfaW5pdFhIUk1vZGFsRm9ybSk7XG4gICAgICAgICQoJGFqYXhDVEFDbG9zZSkub24oJ2NsaWNrLnBhdHRlcm5saWJyYXJ5Lnhocm1vZGFsY2xvc2UnLCBoYW5kbGVyX2Nsb3NlTW9kYWwpO1xuICAgIH0pO1xuXG59KShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQsIHdpbmRvdy5wYXR0ZXJubGlicmFyeSk7XG4iLCIvKipcbiAqIHRoZW1lIGJhc2Ugc2V0dXAgKFp1cmIgRm91bmRhdGlvbilcbiAqIFxuICogcGF0dGVybmxpYnJhcnkgY2xpZW50IChpbml0LSlzY3JpcHRcbiAqICAgXG4gKiBAcGFja2FnZSAgICAgW3BhdHRlcm5saWJyYXJ5XVxuICogQHN1YnBhY2thZ2UgIHBhdHRlcm5saWJyYXJ5IGNsaWVudCBzY3JpcHRcbiAqIEBhdXRob3IgICAgICBCasO2cm4gQmFydGVscyA8Y29kaW5nQGJqb2VybmJhcnRlbHMuZWFydGg+XG4gKiBAbGluayAgICAgICAgaHR0cHM6Ly9naXRsYWIuYmpvZXJuYmFydGVscy5lYXJ0aC9qcy9wYXR0ZXJubGlicmFyeVxuICogQGxpY2Vuc2UgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMCBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjBcbiAqIEBjb3B5cmlnaHQgICBjb3B5cmlnaHQgKGMpIDIwMTYgQmrDtnJuIEJhcnRlbHMgPGNvZGluZ0Biam9lcm5iYXJ0ZWxzLmVhcnRoPlxuICovXG5cbmlmICghalF1ZXJ5KSB7XG4gICAgY29uc29sZS5lcnJvcignalF1ZXJ5IG5vdCBmb3VuZC4uLicpO1xuICAgIHdpbmRvdy5zdG9wKCk7XG59XG5cbmlmICghJC5mbi5mb3VuZGF0aW9uKSB7XG4gICAgY29uc29sZS5lcnJvcignRm91bmRhdGlvbiBub3QgZm91bmQuLi4nKTtcbiAgICB3aW5kb3cuc3RvcCgpO1xufVxuXG4oZnVuY3Rpb24gKCQsIGRvYywgd2luLCBwYXR0ZXJubGlicmFyeSkge1xuICAgIFxuICAgIHZhciAkZG9jID0gJChkb2MpLFxuICAgICAgICAkbGFuZyA9IHBhdHRlcm5saWJyYXJ5LkNvbmZpZy5sYW5nXG4gICAgO1xuXG5cdC8vd2luZG93Lm9udG91Y2htb3ZlID0gZnVuY3Rpb24oKSB7IHJldHVybiBmYWxzZTsgfVxuXHQvL3dpbmRvdy5vbm9yaWVudGF0aW9uY2hhbmdlID0gZnVuY3Rpb24oKSB7IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wID0gMDsgfSAgXG4gICAgICAgIFxuICAgIC8vXG4gICAgLy8gaW5pdCBwYXR0ZXJubGlicmFyeSAoZnJvbnRlbnQpXG4gICAgLy9cbiAgICAkZG9jLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICBcdFxuICAgIFx0JChkb2N1bWVudCkuZm91bmRhdGlvbigpO1xuICAgIFx0XG4gICAgXHQkZG9jLnBhdHRlcm5saWJyYXJ5KCk7XG4gICAgXHRcbiAgICBcdCQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgICBcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBkb2N1bWVudCwgd2luZG93LCBwYXR0ZXJubGlicmFyeSk7IixudWxsXX0=
