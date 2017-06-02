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
      window.location.href = sel.link;
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhdHRlcm5saWJyYXJ5LmNvcmUuanMiLCJwYXR0ZXJubGlicmFyeS5jb25maWcuanMiLCJkb2NzLnNlYXJjaC5qcyIsIm1lZGlhUXVlcnkuanMiLCJtb2RhbC5qcyIsIndpbmRvd2hyZWYuanMiLCJhcHBsaWNhdGlvbi1jdGEteGhyLW1vZGFscy5qcyIsInBhdHRlcm5saWJyYXJ5LmluaXQuanMiLCJhcHAuanMiXSwibmFtZXMiOlsicGF0dGVybmxpYnJhcnkiLCIkIiwicGF0dGVybmxpYnJhcnlfVkVSU0lPTiIsInZlcnNpb24iLCJfcGx1Z2lucyIsIl91dWlkcyIsInJ0bCIsImF0dHIiLCJwbHVnaW4iLCJuYW1lIiwiY2xhc3NOYW1lIiwiZnVuY3Rpb25OYW1lIiwiYXR0ck5hbWUiLCJoeXBoZW5hdGUiLCJyZWdpc3RlclBsdWdpbiIsInBsdWdpbk5hbWUiLCJjb25zdHJ1Y3RvciIsInRvTG93ZXJDYXNlIiwidXVpZCIsIkdldFlvRGlnaXRzIiwiJGVsZW1lbnQiLCJkYXRhIiwidHJpZ2dlciIsInB1c2giLCJ1bnJlZ2lzdGVyUGx1Z2luIiwic3BsaWNlIiwiaW5kZXhPZiIsInJlbW92ZUF0dHIiLCJyZW1vdmVEYXRhIiwicHJvcCIsInJlSW5pdCIsInBsdWdpbnMiLCJpc0pRIiwiZWFjaCIsIl9pbml0IiwidHlwZSIsIl90aGlzIiwiZm5zIiwicGxncyIsImZvckVhY2giLCJwIiwiT2JqZWN0Iiwia2V5cyIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsImxlbmd0aCIsIm5hbWVzcGFjZSIsIk1hdGgiLCJyb3VuZCIsInBvdyIsInJhbmRvbSIsInRvU3RyaW5nIiwic2xpY2UiLCJyZWZsb3ciLCJlbGVtIiwiaSIsIiRlbGVtIiwiZmluZCIsImFkZEJhY2siLCIkZWwiLCJvcHRzIiwid2FybiIsInRoaW5nIiwic3BsaXQiLCJlIiwib3B0IiwibWFwIiwiZWwiLCJ0cmltIiwicGFyc2VWYWx1ZSIsImVyIiwiZ2V0Rm5OYW1lIiwidHJhbnNpdGlvbmVuZCIsInRyYW5zaXRpb25zIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiZW5kIiwidCIsInN0eWxlIiwic2V0VGltZW91dCIsInRyaWdnZXJIYW5kbGVyIiwibGlicyIsInV0aWwiLCJ0aHJvdHRsZSIsImZ1bmMiLCJkZWxheSIsInRpbWVyIiwiY29udGV4dCIsImFyZ3MiLCJhcmd1bWVudHMiLCJhcHBseSIsInNpdGVhcHAiLCJtZXRob2QiLCIkbWV0YSIsIiRub0pTIiwiYXBwZW5kVG8iLCJoZWFkIiwicmVtb3ZlQ2xhc3MiLCJhZGRDbGFzcyIsIkZvdW5kYXRpb24iLCJNZWRpYVF1ZXJ5IiwiQXJyYXkiLCJwcm90b3R5cGUiLCJjYWxsIiwicGx1Z0NsYXNzIiwidW5kZWZpbmVkIiwiUmVmZXJlbmNlRXJyb3IiLCJUeXBlRXJyb3IiLCJ3aW5kb3ciLCJmbiIsIkRhdGUiLCJub3ciLCJnZXRUaW1lIiwidmVuZG9ycyIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsInZwIiwiY2FuY2VsQW5pbWF0aW9uRnJhbWUiLCJ0ZXN0IiwibmF2aWdhdG9yIiwidXNlckFnZW50IiwibGFzdFRpbWUiLCJjYWxsYmFjayIsIm5leHRUaW1lIiwibWF4IiwiY2xlYXJUaW1lb3V0IiwicGVyZm9ybWFuY2UiLCJzdGFydCIsIkZ1bmN0aW9uIiwiYmluZCIsIm9UaGlzIiwiYUFyZ3MiLCJmVG9CaW5kIiwiZk5PUCIsImZCb3VuZCIsImNvbmNhdCIsImZ1bmNOYW1lUmVnZXgiLCJyZXN1bHRzIiwiZXhlYyIsInN0ciIsImlzTmFOIiwicGFyc2VGbG9hdCIsInJlcGxhY2UiLCJqUXVlcnkiLCJDb25maWciLCJyZW5kZXJlciIsImxhbmciLCJ4aHJTZWxlY3RvcnMiLCJ4aHJCdXR0b25zIiwieGhyQ1RBT3BlbiIsInhockNUQUNsb3NlIiwieGhyRm9ybXMiLCJtb2RhbHMiLCJib290c3RyYXBFbGVtZW50Q2xhc3NuYW1lIiwiZm91bmRhdGlvbkVsZW1lbnRDbGFzc25hbWUiLCJkYXRhVGFibGUiLCJsYW5nVVJMcyIsInN0YXRlU2F2ZSIsInN0YXRlRHVyYXRpb24iLCJzZWFyY2hTb3VyY2UiLCJsaW1pdCIsInNvdXJjZSIsInF1ZXJ5Iiwic3luYyIsImFzeW5jIiwiZ2V0SlNPTiIsInN0YXR1cyIsImZpbHRlciIsImFyciIsInRlcm1zIiwidGFncyIsImRpc3BsYXkiLCJpdGVtIiwidGVtcGxhdGVzIiwibm90Rm91bmQiLCJzdWdnZXN0aW9uIiwiZGVzY3JpcHRpb24iLCJyZWFkeSIsImxvZyIsInR5cGVhaGVhZCIsImhpZ2hsaWdodCIsInNlbCIsImxvY2F0aW9uIiwiaHJlZiIsImxpbmsiLCJtYXRjaCIsImZvY3VzIiwiZGVmYXVsdFF1ZXJpZXMiLCJsYW5kc2NhcGUiLCJwb3J0cmFpdCIsInJldGluYSIsInF1ZXJpZXMiLCJjdXJyZW50IiwiYXRMZWFzdCIsInNpemUiLCJnZXQiLCJtYXRjaE1lZGlhIiwibWF0Y2hlcyIsInZhbHVlIiwic2VsZiIsImV4dHJhY3RlZFN0eWxlcyIsImNzcyIsIm5hbWVkUXVlcmllcyIsInBhcnNlU3R5bGVUb09iamVjdCIsImtleSIsIl9nZXRDdXJyZW50U2l6ZSIsIl93YXRjaGVyIiwibWF0Y2hlZCIsIm9uIiwibmV3U2l6ZSIsInN0eWxlTWVkaWEiLCJtZWRpYSIsInNjcmlwdCIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwiaW5mbyIsImlkIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsImdldENvbXB1dGVkU3R5bGUiLCJjdXJyZW50U3R5bGUiLCJtYXRjaE1lZGl1bSIsInRleHQiLCJzdHlsZVNoZWV0IiwiY3NzVGV4dCIsInRleHRDb250ZW50Iiwid2lkdGgiLCJzdHlsZU9iamVjdCIsInJlZHVjZSIsInJldCIsInBhcmFtIiwicGFydHMiLCJ2YWwiLCJkZWNvZGVVUklDb21wb25lbnQiLCJoYXNPd25Qcm9wZXJ0eSIsImlzQXJyYXkiLCJtb2RhbCIsInNldHRpbmdzIiwib3BlbiIsInVwZGF0ZVdpbmRvd0hyZWYiLCJSZXZlYWwiLCIkbW9kYWwiLCJhcHBlbmQiLCJyZXZlYWxPcHRpb25zIiwibW9kYWxEYXRhIiwibSIsImh0bWwiLCJmb3VuZGF0aW9uIiwiTW9kYWwiLCJjbG9zZSIsIiRtb2RhbERlZmF1bHRzIiwic2hvdyIsIldpbmRvd0hyZWYiLCJyZXNldCIsIl9vbGRfaHJlZiIsImhpc3RvcnkiLCJwdXNoU3RhdGUiLCJ0aXRsZSIsImhpZGUiLCJyZW1vdmUiLCJ3aW5kb3docmVmIiwiaW5pdCIsInNjb3BlIiwib3B0aW9ucyIsInVwZGF0ZSIsInVybCIsImNsZWFyIiwiY2xlYXJPbGRIcmVmIiwiJGJvZHkiLCIkYWpheEJ1dHRvbnMiLCIkYWpheENUQU9wZW4iLCIkYWpheENUQUNsb3NlIiwiJGFqYXhGb3JtcyIsImhhbmRsZXJfaW5pdFhIUk1vZGFsVHJpZ2dlciIsIm9FdmVudCIsIiR0aGlzIiwiJGJ0blVybCIsImFqYXgiLCJoZWFkZXJzIiwiY2FjaGUiLCJzdWNjZXNzIiwiYXBpIiwicmVsb2FkIiwidGFibGVkYXRhIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24iLCJoYW5kbGVyX2luaXRYSFJNb2RhbEZvcm0iLCIkZm9ybSIsImZvcm1VUkwiLCJmb3JtRGF0YSIsInNlcmlhbGl6ZUFycmF5IiwiaGFuZGxlcl9jbG9zZU1vZGFsIiwic3RvcCIsImRvYyIsIndpbiIsIiRkb2MiLCIkbGFuZyJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0EsSUFBSSxDQUFDQSxjQUFMLEVBQXFCO0FBQ2pCLFFBQUlBLGlCQUFpQixFQUFyQjtBQUNIOztBQUVEOzs7Ozs7Ozs7Ozs7O0FBYUEsQ0FBQyxVQUFTQyxDQUFULEVBQVk7QUFDYjs7QUFHSSxRQUFJQyx5QkFBeUIsT0FBN0I7O0FBRUE7QUFDQTtBQUNBLFFBQUlGLGlCQUFpQjtBQUNqQkcsaUJBQVNELHNCQURROztBQUdqQjs7O0FBR0FFLGtCQUFVLEVBTk87O0FBUWpCOzs7QUFHQUMsZ0JBQVEsRUFYUzs7QUFhakI7OztBQUdBQyxhQUFLLGVBQVU7QUFDWCxt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UDtBQUNIOztBQUVELElBQUksQ0FBQ25TLEVBQUU2RyxFQUFGLENBQUt3SSxVQUFWLEVBQXNCO0FBQ2xCMU0sWUFBUUMsS0FBUixDQUFjLHlCQUFkO0FBQ0FnRSxXQUFPdUwsSUFBUDtBQUNIOztBQUVELENBQUMsVUFBVW5TLENBQVYsRUFBYW9TLEdBQWIsRUFBa0JDLEdBQWxCLEVBQXVCdFMsY0FBdkIsRUFBdUM7O0FBRXBDLFFBQUl1UyxPQUFPdFMsRUFBRW9TLEdBQUYsQ0FBWDtBQUFBLFFBQ0lHLFFBQVF4UyxlQUFlZ0osTUFBZixDQUFzQkUsSUFEbEM7O0FBSUg7QUFDQTs7QUFFRztBQUNBO0FBQ0E7QUFDQXFKLFNBQUt0SCxLQUFMLENBQVcsWUFBWTs7QUFFdEJoTCxVQUFFMEUsUUFBRixFQUFZMkssVUFBWjs7QUFFQWlELGFBQUt2UyxjQUFMOztBQUVBQyxVQUFFLE1BQUYsRUFBVWlHLFdBQVYsQ0FBc0IsU0FBdEI7QUFFQSxLQVJEO0FBVUgsQ0F0QkQsRUFzQkc2QyxNQXRCSCxFQXNCV3BFLFFBdEJYLEVBc0JxQmtDLE1BdEJyQixFQXNCNkI3RyxjQXRCN0I7QUN2QkEiLCJmaWxlIjoicGF0dGVybmxpYnJhcnktZnJvbnRlbmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQHZhciAgb2JqZWN0ICBwYXR0ZXJubGlicmFyeSAgZ2xvYmFsIHBhdHRlcm5saWJyYXJ5IG5hbWVzcGFjZSAqL1xuaWYgKCFwYXR0ZXJubGlicmFyeSkge1xuICAgIHZhciBwYXR0ZXJubGlicmFyeSA9IHt9O1xufVxuXG4vKipcbiAqIHRoZW1lIGJhc2Ugc2V0dXAgKFp1cmIgRm91bmRhdGlvbilcbiAqIFxuICogcGF0dGVybmxpYnJhcnkgY2xpZW50IChpbml0LSlzY3JpcHRcbiAqICAgICBcbiAqIEBwYWNrYWdlICAgICBbcGF0dGVybmxpYnJhcnldXG4gKiBAc3VicGFja2FnZSAgdGhlbWUgYmFzZSBzZXR1cCAoWnVyYiBGb3VuZGF0aW9uKVxuICogQHN1YnBhY2thZ2UgIHBhdHRlcm5saWJyYXJ5IGNsaWVudCBzY3JpcHRcbiAqIEBhdXRob3IgICAgICBCasO2cm4gQmFydGVscyA8Y29kaW5nQGJqb2VybmJhcnRlbHMuZWFydGg+XG4gKiBAbGluayAgICAgICAgaHR0cHM6Ly9naXRsYWIuYmpvZXJuYmFydGVscy5lYXJ0aC9qcy9wYXR0ZXJubGlicmFyeVxuICogQGxpY2Vuc2UgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMCBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjBcbiAqIEBjb3B5cmlnaHQgICBjb3B5cmlnaHQgKGMpIDIwMTYgQmrDtnJuIEJhcnRlbHMgPGNvZGluZ0Biam9lcm5iYXJ0ZWxzLmVhcnRoPlxuICovXG4hZnVuY3Rpb24oJCkge1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBcbiAgICB2YXIgcGF0dGVybmxpYnJhcnlfVkVSU0lPTiA9ICcwLjAuMSc7XG4gICAgXG4gICAgLy8gR2xvYmFsIFtwYXR0ZXJubGlicmFyeV0gb2JqZWN0XG4gICAgLy8gVGhpcyBpcyBhdHRhY2hlZCB0byB0aGUgd2luZG93LCBvciB1c2VkIGFzIGEgbW9kdWxlIGZvciBBTUQvQnJvd3NlcmlmeVxuICAgIHZhciBwYXR0ZXJubGlicmFyeSA9IHtcbiAgICAgICAgdmVyc2lvbjogcGF0dGVybmxpYnJhcnlfVkVSU0lPTixcbiAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0b3JlcyBpbml0aWFsaXplZCBwbHVnaW5zLlxuICAgICAgICAgKi9cbiAgICAgICAgX3BsdWdpbnM6IHt9LFxuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogU3RvcmVzIGdlbmVyYXRlZCB1bmlxdWUgaWRzIGZvciBwbHVnaW4gaW5zdGFuY2VzXG4gICAgICAgICAqL1xuICAgICAgICBfdXVpZHM6IFtdLFxuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyBhIGJvb2xlYW4gZm9yIFJUTCBzdXBwb3J0XG4gICAgICAgICAqL1xuICAgICAgICBydGw6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4gJCgnaHRtbCcpLmF0dHIoJ2RpcicpID09PSAncnRsJztcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZWZpbmVzIGEgW3BhdHRlcm5saWJyYXJ5XSBwbHVnaW4sIGFkZGluZyBpdCB0byB0aGUgYHBhdHRlcm5saWJyYXJ5YCBuYW1lc3BhY2UgXG4gICAgICAgICAqIGFuZCB0aGUgbGlzdCBvZiBwbHVnaW5zIHRvIGluaXRpYWxpemUgd2hlbiByZWZsb3dpbmcuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gVGhlIGNvbnN0cnVjdG9yIG9mIHRoZSBwbHVnaW4uXG4gICAgICAgICAqL1xuICAgICAgICBwbHVnaW46IGZ1bmN0aW9uKHBsdWdpbiwgbmFtZSkge1xuICAgICAgICAgICAgLy8gT2JqZWN0IGtleSB0byB1c2Ugd2hlbiBhZGRpbmcgdG8gZ2xvYmFsIHBhdHRlcm5saWJyYXJ5IG9iamVjdFxuICAgICAgICAgICAgLy8gRXhhbXBsZXM6IHBhdHRlcm5saWJyYXJ5Lk9iamVjdDEsIHBhdHRlcm5saWJyYXJ5Lk9iamVjdDJcbiAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSAobmFtZSB8fCBmdW5jdGlvbk5hbWUocGx1Z2luKSk7XG4gICAgICAgICAgICAvLyBPYmplY3Qga2V5IHRvIHVzZSB3aGVuIHN0b3JpbmcgdGhlIHBsdWdpbiwgYWxzbyB1c2VkIHRvIGNyZWF0ZSB0aGVcbiAgICAgICAgICAgIC8vIGlkZW50aWZ5aW5nIGRhdGEgYXR0cmlidXRlIGZvciB0aGUgcGx1Z2luXG4gICAgICAgICAgICAvLyBFeGFtcGxlczogZGF0YS1vYmplY3R0cmlnZ2VybmFtZTEsIGRhdGEtb2JqZWN0dHJpZ2dlcm5hbWUyXG4gICAgICAgICAgICB2YXIgYXR0ck5hbWUgICAgPSBoeXBoZW5hdGUoY2xhc3NOYW1lKTtcbiAgICBcbiAgICAgICAgICAgIC8vIEFkZCB0byB0aGUgcGF0dGVybmxpYnJhcnkgb2JqZWN0IGFuZCB0aGUgcGx1Z2lucyBsaXN0IChmb3IgcmVmbG93aW5nKVxuICAgICAgICAgICAgdGhpcy5fcGx1Z2luc1thdHRyTmFtZV0gPSB0aGlzW2NsYXNzTmFtZV0gPSBwbHVnaW47XG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgICAqIFBvcHVsYXRlcyB0aGUgX3V1aWRzIGFycmF5IHdpdGggcG9pbnRlcnMgdG8gZWFjaCBpbmRpdmlkdWFsIHBsdWdpbiBpbnN0YW5jZS5cbiAgICAgICAgICogQWRkcyB0aGUgYHBhdHRlcm5saWJyYXJ5UGx1Z2luYCBkYXRhLWF0dHJpYnV0ZSB0byBwcm9ncmFtbWF0aWNhbGx5IGNyZWF0ZWQgcGx1Z2lucyBcbiAgICAgICAgICogdG8gYWxsb3cgdXNlIG9mICQoc2VsZWN0b3IpLnBhdHRlcm5saWJyYXJ5KG1ldGhvZCkgY2FsbHMuXG4gICAgICAgICAqIEFsc28gZmlyZXMgdGhlIGluaXRpYWxpemF0aW9uIGV2ZW50IGZvciBlYWNoIHBsdWdpbiwgY29uc29saWRhdGluZyByZXBlZGl0aXZlIGNvZGUuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gYW4gaW5zdGFuY2Ugb2YgYSBwbHVnaW4sIHVzdWFsbHkgYHRoaXNgIGluIGNvbnRleHQuXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gdGhlIG5hbWUgb2YgdGhlIHBsdWdpbiwgcGFzc2VkIGFzIGEgY2FtZWxDYXNlZCBzdHJpbmcuXG4gICAgICAgICAqIEBmaXJlcyBQbHVnaW4jaW5pdFxuICAgICAgICAgKi9cbiAgICAgICAgcmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uKHBsdWdpbiwgbmFtZSl7XG4gICAgICAgICAgICB2YXIgcGx1Z2luTmFtZSA9IG5hbWUgPyBoeXBoZW5hdGUobmFtZSkgOiBmdW5jdGlvbk5hbWUocGx1Z2luLmNvbnN0cnVjdG9yKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgcGx1Z2luLnV1aWQgPSB0aGlzLkdldFlvRGlnaXRzKDYsIHBsdWdpbk5hbWUpO1xuICAgIFxuICAgICAgICAgICAgaWYoIXBsdWdpbi4kZWxlbWVudC5hdHRyKCdkYXRhLScgKyBwbHVnaW5OYW1lKSl7IHBsdWdpbi4kZWxlbWVudC5hdHRyKCdkYXRhLScgKyBwbHVnaW5OYW1lLCBwbHVnaW4udXVpZCk7IH1cbiAgICAgICAgICAgIGlmKCFwbHVnaW4uJGVsZW1lbnQuZGF0YSgncGF0dGVybmxpYnJhcnlQbHVnaW4nKSl7IHBsdWdpbi4kZWxlbWVudC5kYXRhKCdwYXR0ZXJubGlicmFyeVBsdWdpbicsIHBsdWdpbik7IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBpbml0aWFsaXplZC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEBldmVudCBQbHVnaW4jaW5pdFxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICBwbHVnaW4uJGVsZW1lbnQudHJpZ2dlcignaW5pdC5wYXR0ZXJubGlicmFyeS4nICsgcGx1Z2luTmFtZSk7XG4gICAgXG4gICAgICAgICAgICB0aGlzLl91dWlkcy5wdXNoKHBsdWdpbi51dWlkKTtcbiAgICBcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAgICogUmVtb3ZlcyB0aGUgcGx1Z2lucyB1dWlkIGZyb20gdGhlIF91dWlkcyBhcnJheS5cbiAgICAgICAgICogUmVtb3ZlcyB0aGUgemZQbHVnaW4gZGF0YSBhdHRyaWJ1dGUsIGFzIHdlbGwgYXMgdGhlIGRhdGEtcGx1Z2luLW5hbWUgYXR0cmlidXRlLlxuICAgICAgICAgKiBBbHNvIGZpcmVzIHRoZSBkZXN0cm95ZWQgZXZlbnQgZm9yIHRoZSBwbHVnaW4sIGNvbnNvbGlkYXRpbmcgcmVwZWRpdGl2ZSBjb2RlLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIGFuIGluc3RhbmNlIG9mIGEgcGx1Z2luLCB1c3VhbGx5IGB0aGlzYCBpbiBjb250ZXh0LlxuICAgICAgICAgKiBAZmlyZXMgUGx1Z2luI2Rlc3Ryb3llZFxuICAgICAgICAgKi9cbiAgICAgICAgdW5yZWdpc3RlclBsdWdpbjogZnVuY3Rpb24ocGx1Z2luKXtcbiAgICAgICAgICAgIHZhciBwbHVnaW5OYW1lID0gaHlwaGVuYXRlKGZ1bmN0aW9uTmFtZShwbHVnaW4uJGVsZW1lbnQuZGF0YSgncGF0dGVybmxpYnJhcnlQbHVnaW4nKS5jb25zdHJ1Y3RvcikpO1xuICAgIFxuICAgICAgICAgICAgdGhpcy5fdXVpZHMuc3BsaWNlKHRoaXMuX3V1aWRzLmluZGV4T2YocGx1Z2luLnV1aWQpLCAxKTtcbiAgICAgICAgICAgIHBsdWdpbi4kZWxlbWVudC5yZW1vdmVBdHRyKCdkYXRhLScgKyBwbHVnaW5OYW1lKS5yZW1vdmVEYXRhKCdwYXR0ZXJubGlicmFyeVBsdWdpbicpXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgYmVlbiBkZXN0cm95ZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgUGx1Z2luI2Rlc3Ryb3llZFxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAudHJpZ2dlcignZGVzdHJveWVkLnBhdHRlcm5saWJyYXJ5LicgKyBwbHVnaW5OYW1lKTtcbiAgICAgICAgICAgIGZvcih2YXIgcHJvcCBpbiBwbHVnaW4pe1xuICAgICAgICAgICAgICAgIHBsdWdpbltwcm9wXSA9IG51bGw7Ly9jbGVhbiB1cCBzY3JpcHQgdG8gcHJlcCBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9LFxuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQGZ1bmN0aW9uXG4gICAgICAgICAqIENhdXNlcyBvbmUgb3IgbW9yZSBhY3RpdmUgcGx1Z2lucyB0byByZS1pbml0aWFsaXplLCByZXNldHRpbmcgZXZlbnQgbGlzdGVuZXJzLCBcbiAgICAgICAgICogcmVjYWxjdWxhdGluZyBwb3NpdGlvbnMsIGV0Yy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwbHVnaW5zIC0gb3B0aW9uYWwgc3RyaW5nIG9mIGFuIGluZGl2aWR1YWwgcGx1Z2luIGtleSwgXG4gICAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0YWluZWQgYnkgY2FsbGluZyBgJChlbGVtZW50KS5kYXRhKCdwbHVnaW5OYW1lJylgLCBcbiAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBvciBzdHJpbmcgb2YgYSBwbHVnaW4gY2xhc3MgaS5lLiBgJ2Ryb3Bkb3duJ2BcbiAgICAgICAgICogQGRlZmF1bHQgSWYgbm8gYXJndW1lbnQgaXMgcGFzc2VkLCByZWZsb3cgYWxsIGN1cnJlbnRseSBhY3RpdmUgcGx1Z2lucy5cbiAgICAgICAgICovXG4gICAgICAgICByZUluaXQ6IGZ1bmN0aW9uKHBsdWdpbnMpe1xuICAgICAgICAgICAgIHZhciBpc0pRID0gcGx1Z2lucyBpbnN0YW5jZW9mICQ7XG4gICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgICBpZihpc0pRKXtcbiAgICAgICAgICAgICAgICAgICAgIHBsdWdpbnMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuZGF0YSgncGF0dGVybmxpYnJhcnlQbHVnaW4nKS5faW5pdCgpO1xuICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgcGx1Z2lucyxcbiAgICAgICAgICAgICAgICAgICAgIF90aGlzID0gdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgIGZucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnb2JqZWN0JzogZnVuY3Rpb24ocGxncyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsZ3MuZm9yRWFjaChmdW5jdGlvbihwKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJ1tkYXRhLScrIHAgKyddJykucGF0dGVybmxpYnJhcnkoJ19pbml0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ3N0cmluZyc6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJ1tkYXRhLScrIHBsdWdpbnMgKyddJykucGF0dGVybmxpYnJhcnkoJ19pbml0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAndW5kZWZpbmVkJzogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1snb2JqZWN0J10oT2JqZWN0LmtleXMoX3RoaXMuX3BsdWdpbnMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgZm5zW3R5cGVdKHBsdWdpbnMpO1xuICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfWNhdGNoKGVycil7XG4gICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICB9ZmluYWxseXtcbiAgICAgICAgICAgICAgICAgcmV0dXJuIHBsdWdpbnM7XG4gICAgICAgICAgICAgfVxuICAgICAgICAgfSxcbiAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIHJldHVybnMgYSByYW5kb20gYmFzZS0zNiB1aWQgd2l0aCBuYW1lc3BhY2luZ1xuICAgICAgICAgKiBAZnVuY3Rpb25cbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aCAtIG51bWJlciBvZiByYW5kb20gYmFzZS0zNiBkaWdpdHMgZGVzaXJlZC4gSW5jcmVhc2UgXG4gICAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgbW9yZSByYW5kb20gc3RyaW5ncy5cbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZSAtIG5hbWUgb2YgcGx1Z2luIHRvIGJlIGluY29ycG9yYXRlZCBpbiB1aWQsIG9wdGlvbmFsLlxuICAgICAgICAgKiBAZGVmYXVsdCB7U3RyaW5nfSAnJyAtIGlmIG5vIHBsdWdpbiBuYW1lIGlzIHByb3ZpZGVkLCBub3RoaW5nIGlzIGFwcGVuZGVkIFxuICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgIHRvIHRoZSB1aWQuXG4gICAgICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IC0gdW5pcXVlIGlkXG4gICAgICAgICAqL1xuICAgICAgICBHZXRZb0RpZ2l0czogZnVuY3Rpb24obGVuZ3RoLCBuYW1lc3BhY2Upe1xuICAgICAgICAgICAgbGVuZ3RoID0gbGVuZ3RoIHx8IDY7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChcbiAgICAgICAgICAgICAgICAgICAgKE1hdGgucG93KDM2LCBsZW5ndGggKyAxKSAtIE1hdGgucmFuZG9tKCkgKiBNYXRoLnBvdygzNiwgbGVuZ3RoKSlcbiAgICAgICAgICAgICkudG9TdHJpbmcoMzYpLnNsaWNlKDEpICsgKG5hbWVzcGFjZSA/ICctJyArIG5hbWVzcGFjZSA6ICcnKTtcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbml0aWFsaXplIHBsdWdpbnMgb24gYW55IGVsZW1lbnRzIHdpdGhpbiBgZWxlbWAgKGFuZCBgZWxlbWAgaXRzZWxmKSB0aGF0IFxuICAgICAgICAgKiBhcmVuJ3QgYWxyZWFkeSBpbml0aWFsaXplZC5cbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW0gLSBqUXVlcnkgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGVsZW1lbnQgdG8gY2hlY2sgaW5zaWRlLiBcbiAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICBBbHNvIGNoZWNrcyB0aGUgZWxlbWVudCBpdHNlbGYsIHVubGVzcyBpdCdzIHRoZSBgZG9jdW1lbnRgIFxuICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC5cbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IHBsdWdpbnMgLSBBIGxpc3Qgb2YgcGx1Z2lucyB0byBpbml0aWFsaXplLiBMZWF2ZSB0aGlzIFxuICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dCB0byBpbml0aWFsaXplIGV2ZXJ5dGhpbmcuXG4gICAgICAgICAqL1xuICAgICAgICByZWZsb3c6IGZ1bmN0aW9uKGVsZW0sIHBsdWdpbnMpIHtcbiAgICBcbiAgICAgICAgICAgIC8vIElmIHBsdWdpbnMgaXMgdW5kZWZpbmVkLCBqdXN0IGdyYWIgZXZlcnl0aGluZ1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwbHVnaW5zID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHBsdWdpbnMgPSBPYmplY3Qua2V5cyh0aGlzLl9wbHVnaW5zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIElmIHBsdWdpbnMgaXMgYSBzdHJpbmcsIGNvbnZlcnQgaXQgdG8gYW4gYXJyYXkgd2l0aCBvbmUgaXRlbVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHBsdWdpbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgcGx1Z2lucyA9IFtwbHVnaW5zXTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgXG4gICAgICAgICAgICAvLyBJdGVyYXRlIHRocm91Z2ggZWFjaCBwbHVnaW5cbiAgICAgICAgICAgICQuZWFjaChwbHVnaW5zLCBmdW5jdGlvbihpLCBuYW1lKSB7XG4gICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBjdXJyZW50IHBsdWdpblxuICAgICAgICAgICAgICAgIHZhciBwbHVnaW4gPSBfdGhpcy5fcGx1Z2luc1tuYW1lXTtcbiAgICBcbiAgICAgICAgICAgICAgICAvLyBMb2NhbGl6ZSB0aGUgc2VhcmNoIHRvIGFsbCBlbGVtZW50cyBpbnNpZGUgZWxlbSwgYXMgd2VsbCBhcyBlbGVtIFxuICAgICAgICAgICAgICAgIC8vIGl0c2VsZiwgdW5sZXNzIGVsZW0gPT09IGRvY3VtZW50XG4gICAgICAgICAgICAgICAgdmFyICRlbGVtID0gJChlbGVtKS5maW5kKCdbZGF0YS0nK25hbWUrJ10nKS5hZGRCYWNrKCdbZGF0YS0nK25hbWUrJ10nKTtcbiAgICBcbiAgICAgICAgICAgICAgICAvLyBGb3IgZWFjaCBwbHVnaW4gZm91bmQsIGluaXRpYWxpemUgaXRcbiAgICAgICAgICAgICAgICAkZWxlbS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgJGVsID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRzID0ge307XG4gICAgICAgICAgICAgICAgICAgIC8vIERvbid0IGRvdWJsZS1kaXAgb24gcGx1Z2luc1xuICAgICAgICAgICAgICAgICAgICBpZiAoJGVsLmRhdGEoJ3BhdHRlcm5saWJyYXJ5UGx1Z2luJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlRyaWVkIHRvIGluaXRpYWxpemUgXCIrbmFtZStcIiBvbiBhbiBlbGVtZW50IHRoYXQgXCIrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxyZWFkeSBoYXMgYSBbcGF0dGVybmxpYnJhcnldIHBsdWdpbi5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYoJGVsLmF0dHIoJ2RhdGEtb3B0aW9ucycpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aGluZyA9ICRlbC5hdHRyKCdkYXRhLW9wdGlvbnMnKS5zcGxpdCgnOycpLmZvckVhY2goZnVuY3Rpb24oZSwgaSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9wdCA9IGUuc3BsaXQoJzonKS5tYXAoZnVuY3Rpb24oZWwpeyByZXR1cm4gZWwudHJpbSgpOyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihvcHRbMF0pIG9wdHNbb3B0WzBdXSA9IHBhcnNlVmFsdWUob3B0WzFdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbC5kYXRhKCdwYXR0ZXJubGlicmFyeVBsdWdpbicsIG5ldyBwbHVnaW4oJCh0aGlzKSwgb3B0cykpO1xuICAgICAgICAgICAgICAgICAgICB9Y2F0Y2goZXIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcik7XG4gICAgICAgICAgICAgICAgICAgIH1maW5hbGx5e1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0Rm5OYW1lOiBmdW5jdGlvbk5hbWUsXG4gICAgICAgIHRyYW5zaXRpb25lbmQ6IGZ1bmN0aW9uKCRlbGVtKXtcbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICAndHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICAgICAgICAgICAnV2Via2l0VHJhbnNpdGlvbic6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcbiAgICAgICAgICAgICAgICAnTW96VHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICAgICAgICAgICAnT1RyYW5zaXRpb24nOiAnb3RyYW5zaXRpb25lbmQnXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcbiAgICAgICAgICAgICAgICAgICAgZW5kO1xuICAgIFxuICAgICAgICAgICAgZm9yICh2YXIgdCBpbiB0cmFuc2l0aW9ucyl7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlbGVtLnN0eWxlW3RdICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IHRyYW5zaXRpb25zW3RdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGVuZCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVuZDtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGVuZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgJGVsZW0udHJpZ2dlckhhbmRsZXIoJ3RyYW5zaXRpb25lbmQnLCBbJGVsZW1dKTtcbiAgICAgICAgICAgICAgICB9LCAxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3RyYW5zaXRpb25lbmQnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBsaWJyYXJ5IGNvbnRhaW5lci9uYW1lc3BhY2VcbiAgICAgKi9cbiAgICBwYXR0ZXJubGlicmFyeS5saWJzID0ge1xuICAgIFxuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogdXRpbGl0eSBjb250YWluZXIvbmFtZXNwYWNlXG4gICAgICovXG4gICAgcGF0dGVybmxpYnJhcnkudXRpbCA9IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZ1bmN0aW9uIGZvciBhcHBseWluZyBhIGRlYm91bmNlIGVmZmVjdCB0byBhIGZ1bmN0aW9uIGNhbGwuXG4gICAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIC0gRnVuY3Rpb24gdG8gYmUgY2FsbGVkIGF0IGVuZCBvZiB0aW1lb3V0LlxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gZGVsYXkgLSBUaW1lIGluIG1zIHRvIGRlbGF5IHRoZSBjYWxsIG9mIGBmdW5jYC5cbiAgICAgICAgICogQHJldHVybnMgZnVuY3Rpb25cbiAgICAgICAgICovXG4gICAgICAgIHRocm90dGxlOiBmdW5jdGlvbiAoZnVuYywgZGVsYXkpIHtcbiAgICAgICAgICAgIHZhciB0aW1lciA9IG51bGw7XG4gICAgXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBjb250ZXh0ID0gdGhpcywgYXJncyA9IGFyZ3VtZW50cztcbiAgICBcbiAgICAgICAgICAgICAgICBpZiAodGltZXIgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lciA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH0sIGRlbGF5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfTtcbiAgICBcbiAgICAvLyBUT0RPOiBjb25zaWRlciBub3QgbWFraW5nIHRoaXMgYSBqUXVlcnkgZnVuY3Rpb25cbiAgICAvLyBUT0RPOiBuZWVkIHdheSB0byByZWZsb3cgdnMuIHJlLWluaXRpYWxpemVcbiAgICAvKipcbiAgICAgKiBUaGUgcGF0dGVybmxpYnJhcnkgalF1ZXJ5IG1ldGhvZC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gbWV0aG9kIC0gQW4gYWN0aW9uIHRvIHBlcmZvcm0gb24gdGhlIGN1cnJlbnQgalF1ZXJ5IG9iamVjdC5cbiAgICAgKi9cbiAgICB2YXIgc2l0ZWFwcCA9IGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgICB2YXIgdHlwZSAgPSB0eXBlb2YgbWV0aG9kLFxuICAgICAgICAgICAgJG1ldGEgPSAkKCdtZXRhLnBhdHRlcm5saWJyYXJ5LW1xJyksXG4gICAgICAgICAgICAkbm9KUyA9ICQoJy5uby1qcycpO1xuICAgIFxuICAgICAgICBpZighJG1ldGEubGVuZ3RoKXtcbiAgICAgICAgICAgICQoJzxtZXRhIGNsYXNzPVwicGF0dGVybmxpYnJhcnktbXFcIj4nKS5hcHBlbmRUbyhkb2N1bWVudC5oZWFkKTtcbiAgICAgICAgfVxuICAgICAgICBpZigkbm9KUy5sZW5ndGgpe1xuICAgICAgICAgICAgJG5vSlMucmVtb3ZlQ2xhc3MoJ25vLWpzJyk7XG4gICAgICAgIH1cbiAgICAgICAgJCgnYm9keScpLmFkZENsYXNzKFxuICAgICAgICAgICAgKHR5cGVvZiBGb3VuZGF0aW9uID09ICd1bmRlZmluZWQnKSA/ICdib290c3RyYXAnIDogJ2ZvdW5kYXRpb24nXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICBpZih0eXBlID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICAvL25lZWRzIHRvIGluaXRpYWxpemUgdGhlIHBhdHRlcm5saWJyYXJ5IG9iamVjdCwgb3IgYW4gaW5kaXZpZHVhbCBwbHVnaW4uXG4gICAgICAgICAgICBwYXR0ZXJubGlicmFyeS5NZWRpYVF1ZXJ5Ll9pbml0KCk7XG4gICAgICAgICAgICBwYXR0ZXJubGlicmFyeS5yZWZsb3codGhpcyk7XG4gICAgICAgIH1lbHNlIGlmKHR5cGUgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgICAgIC8vYW4gaW5kaXZpZHVhbCBtZXRob2QgdG8gaW52b2tlIG9uIGEgcGx1Z2luIG9yIGdyb3VwIG9mIHBsdWdpbnNcbiAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgICAgIC8vY29sbGVjdCBhbGwgdGhlIGFyZ3VtZW50cywgaWYgbmVjZXNzYXJ5XG4gICAgICAgICAgICB2YXIgcGx1Z0NsYXNzID0gdGhpcy5kYXRhKCdwYXR0ZXJubGlicmFyeS1wbHVnaW4nKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9kZXRlcm1pbmUgdGhlIGNsYXNzIG9mIHBsdWdpblxuICAgICAgICAgICAgaWYocGx1Z0NsYXNzICE9PSB1bmRlZmluZWQgJiYgcGx1Z0NsYXNzW21ldGhvZF0gIT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICAgICAgLy9tYWtlIHN1cmUgYm90aCB0aGUgY2xhc3MgYW5kIG1ldGhvZCBleGlzdFxuICAgICAgICAgICAgICAgIGlmKHRoaXMubGVuZ3RoID09PSAxKXtcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGVyZSdzIG9ubHkgb25lLCBjYWxsIGl0IGRpcmVjdGx5LlxuICAgICAgICAgICAgICAgICAgICBwbHVnQ2xhc3NbbWV0aG9kXS5hcHBseShwbHVnQ2xhc3MsIGFyZ3MpO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oaSwgZWwpe1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9vdGhlcndpc2UgbG9vcCB0aHJvdWdoIHRoZSBqUXVlcnkgY29sbGVjdGlvbiBhbmQgaW52b2tlIHRoZSBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1ldGhvZCBvbiBlYWNoXG4gICAgICAgICAgICAgICAgICAgICAgICBwbHVnQ2xhc3NbbWV0aG9kXS5hcHBseSgkKGVsKS5kYXRhKCdwYXR0ZXJubGlicmFyeS1wbHVnaW4nKSwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1lbHNley8vZXJyb3IgZm9yIG5vIGNsYXNzIG9yIG5vIG1ldGhvZFxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcIldlJ3JlIHNvcnJ5LCAnXCIgKyBtZXRob2QgKyBcbiAgICAgICAgICAgICAgICAgICAgXCInIGlzIG5vdCBhbiBhdmFpbGFibGUgbWV0aG9kIGZvciBcIiArIFxuICAgICAgICAgICAgICAgICAgICAocGx1Z0NsYXNzID8gZnVuY3Rpb25OYW1lKHBsdWdDbGFzcykgOiAndGhpcyBlbGVtZW50JykgKyAnLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9ZWxzZXsvL2Vycm9yIGZvciBpbnZhbGlkIGFyZ3VtZW50IHR5cGVcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJXZSdyZSBzb3JyeSwgJ1wiICsgdHlwZSArIFwiJyBpcyBub3QgYSB2YWxpZCBwYXJhbWV0ZXIuIFwiK1xuICAgICAgICAgICAgICAgIFwiWW91IG11c3QgdXNlIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgbWV0aG9kIHlvdSB3aXNoIHRvIGludm9rZS5cIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICB3aW5kb3cucGF0dGVybmxpYnJhcnkgPSBwYXR0ZXJubGlicmFyeTtcbiAgICAkLmZuLnBhdHRlcm5saWJyYXJ5ID0gc2l0ZWFwcDtcbiAgICBcbiAgICAvLyBQb2x5ZmlsbCBmb3IgcmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIURhdGUubm93IHx8ICF3aW5kb3cuRGF0ZS5ub3cpXG4gICAgICAgICAgICB3aW5kb3cuRGF0ZS5ub3cgPSBEYXRlLm5vdyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7IH07XG4gICAgXG4gICAgICAgIHZhciB2ZW5kb3JzID0gWyd3ZWJraXQnLCAnbW96J107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmVuZG9ycy5sZW5ndGggJiYgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsraSkge1xuICAgICAgICAgICAgdmFyIHZwID0gdmVuZG9yc1tpXTtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdnArJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgICAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gKHdpbmRvd1t2cCsnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHx8IHdpbmRvd1t2cCsnQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ10pO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvaVAoYWR8aG9uZXxvZCkuKk9TIDYvLnRlc3Qod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpXG4gICAgICAgICAgICB8fCAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCAhd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICB2YXIgbGFzdFRpbWUgPSAwO1xuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dFRpbWUgPSBNYXRoLm1heChsYXN0VGltZSArIDE2LCBub3cpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpIHsgY2FsbGJhY2sobGFzdFRpbWUgPSBuZXh0VGltZSk7IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRUaW1lIC0gbm93KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBvbHlmaWxsIGZvciBwZXJmb3JtYW5jZS5ub3csIHJlcXVpcmVkIGJ5IHJBRlxuICAgICAgICAgKi9cbiAgICAgICAgaWYoIXdpbmRvdy5wZXJmb3JtYW5jZSB8fCAhd2luZG93LnBlcmZvcm1hbmNlLm5vdyl7XG4gICAgICAgICAgICB3aW5kb3cucGVyZm9ybWFuY2UgPSB7XG4gICAgICAgICAgICAgICAgc3RhcnQ6IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgbm93OiBmdW5jdGlvbigpeyByZXR1cm4gRGF0ZS5ub3coKSAtIHRoaXMuc3RhcnQ7IH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9KSgpO1xuICAgIFxuICAgIGlmICghRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpIHtcbiAgICAgICAgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbihvVGhpcykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgLy8gY2xvc2VzdCB0aGluZyBwb3NzaWJsZSB0byB0aGUgRUNNQVNjcmlwdCA1XG4gICAgICAgICAgICAgICAgLy8gaW50ZXJuYWwgSXNDYWxsYWJsZSBmdW5jdGlvblxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Z1bmN0aW9uLnByb3RvdHlwZS5iaW5kIC0gd2hhdCBpcyB0cnlpbmcgdG8gYmUgJytcbiAgICAgICAgICAgICAgICAgICAgICAgICdib3VuZCBpcyBub3QgY2FsbGFibGUnKTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIHZhciBhQXJncyAgID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcbiAgICAgICAgICAgICAgICBmVG9CaW5kID0gdGhpcyxcbiAgICAgICAgICAgICAgICBmTk9QICAgID0gZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgICAgICAgICBmQm91bmQgID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmVG9CaW5kLmFwcGx5KFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcyBpbnN0YW5jZW9mIGZOT1AgPyB0aGlzIDogb1RoaXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBhQXJncy5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgIFxuICAgICAgICAgICAgaWYgKHRoaXMucHJvdG90eXBlKSB7XG4gICAgICAgICAgICAgICAgLy8gbmF0aXZlIGZ1bmN0aW9ucyBkb24ndCBoYXZlIGEgcHJvdG90eXBlXG4gICAgICAgICAgICAgICAgZk5PUC5wcm90b3R5cGUgPSB0aGlzLnByb3RvdHlwZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZCb3VuZC5wcm90b3R5cGUgPSBuZXcgZk5PUCgpO1xuICAgIFxuICAgICAgICAgICAgcmV0dXJuIGZCb3VuZDtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgXG4gICAgLy8gUG9seWZpbGwgdG8gZ2V0IHRoZSBuYW1lIG9mIGEgZnVuY3Rpb24gaW4gSUU5XG4gICAgZnVuY3Rpb24gZnVuY3Rpb25OYW1lKGZuKSB7XG4gICAgICAgIGlmIChGdW5jdGlvbi5wcm90b3R5cGUubmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YXIgZnVuY05hbWVSZWdleCA9IC9mdW5jdGlvblxccyhbXihdezEsfSlcXCgvO1xuICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSAoZnVuY05hbWVSZWdleCkuZXhlYygoZm4pLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgcmV0dXJuIChyZXN1bHRzICYmIHJlc3VsdHMubGVuZ3RoID4gMSkgPyByZXN1bHRzWzFdLnRyaW0oKSA6IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZm4ucHJvdG90eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmbi5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZuLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIHBhcnNlVmFsdWUoc3RyKXtcbiAgICAgICAgaWYoL3RydWUvLnRlc3Qoc3RyKSkgcmV0dXJuIHRydWU7XG4gICAgICAgIGVsc2UgaWYoL2ZhbHNlLy50ZXN0KHN0cikpIHJldHVybiBmYWxzZTtcbiAgICAgICAgZWxzZSBpZighaXNOYU4oc3RyICogMSkpIHJldHVybiBwYXJzZUZsb2F0KHN0cik7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIFxuICAgIC8vIENvbnZlcnQgUGFzY2FsQ2FzZSB0byBrZWJhYi1jYXNlXG4gICAgLy8gVGhhbmsgeW91OiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS84OTU1NTgwXG4gICAgZnVuY3Rpb24gaHlwaGVuYXRlKHN0cikge1xuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuXG59KGpRdWVyeSk7XG4iLCIvKiogQHZhciAgb2JqZWN0ICBwYXR0ZXJubGlicmFyeS5Db25maWcgIHBhdHRlcm5saWJyYXJ5IGdsb2JhbCBjb25maWd1cmF0aW9uIGNvbnRhaW5lciAqL1xuaWYgKCFwYXR0ZXJubGlicmFyeS5Db25maWcpIHtcbiAgICBwYXR0ZXJubGlicmFyeS5Db25maWcgPSB7XG4gICAgICAgIC8vIGRldGVjdCBVSSBmcmFtZXdvcmtcbiAgICAgICAgcmVuZGVyZXIgOiAoKHR5cGVvZiBGb3VuZGF0aW9uICE9ICd1bmRlZmluZWQnKSA/ICdmb3VuZGF0aW9uJyA6ICdib290c3RyYXAnKSxcbiAgICAgICAgLy8gZGV0ZWN0IGxhbmd1YWdlXG4gICAgICAgIGxhbmcgOiAkKCdIVE1MJykuYXR0cignbGFuZycpIHx8ICdlbicsXG4gICAgICAgIFxuICAgICAgICAvLyBYSFIgc2VsZWN0b3JzXG4gICAgICAgIHhoclNlbGVjdG9ycyA6IHtcbiAgICAgICAgICAgIHhockJ1dHRvbnMgIDogXCJBLmJ0bltocmVmKj0nYWRkJ10sIEEuYnRuW2hyZWYqPSdlZGl0J10sIEEuYnRuW2hyZWYqPSdkZXRhaWxzJ10sIEEuYnRuW2hyZWYqPSdkZWxldGUnXVwiLFxuICAgICAgICAgICAgeGhyQ1RBT3BlbiAgOiBcIkEuYnRuLWN0YS14aHIuY3RhLXhoci1tb2RhbFwiLFxuICAgICAgICAgICAgeGhyQ1RBQ2xvc2UgOiBcIi5tb2RhbC1jb250ZW50IC5idG4tY3RhLXhoci1jbG9zZSwgLm1vZGFsLWNvbnRlbnQgLmFsZXJ0LCAubW9kYWwtY29udGVudCAuY2xvc2UsIC5tb2RhbC1jb250ZW50IC5jdGEteGhyLW1vZGFsLWNsb3NlLCAucmV2ZWFsIC5jdGEteGhyLW1vZGFsLWNsb3NlXCIsXG4gICAgICAgICAgICB4aHJGb3JtcyAgICA6IFwiLm1vZGFsLWNvbnRlbnQgLmZvcm0teGhyXCJcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIC8vIG1vZGFsIHNldHRpbmdzXG4gICAgICAgIG1vZGFscyA6IHtcbiAgICAgICAgICAgIGJvb3RzdHJhcEVsZW1lbnRDbGFzc25hbWUgIDogJ21vZGFsJyxcbiAgICAgICAgICAgIGZvdW5kYXRpb25FbGVtZW50Q2xhc3NuYW1lIDogJ3JldmVhbCdcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIC8vIGRhdGFUYWJsZSBwbHVnLWluIHNldHRpbmdzXG4gICAgICAgIGRhdGFUYWJsZSA6IHtcbiAgICAgICAgICAgIGxhbmdVUkxzIDoge1xuICAgICAgICAgICAgICAgICdlbicgOiAnLy9jZG4uZGF0YXRhYmxlcy5uZXQvcGx1Zy1pbnMvMS4xMC45L2kxOG4vRW5nbGlzaC5qc29uJyxcbiAgICAgICAgICAgICAgICAnZGUnIDogJy8vY2RuLmRhdGF0YWJsZXMubmV0L3BsdWctaW5zLzEuMTAuOS9pMThuL0dlcm1hbi5qc29uJyxcbiAgICAgICAgICAgICAgICAnZnInIDogJy8vY2RuLmRhdGF0YWJsZXMubmV0L3BsdWctaW5zLzEuMTAuOS9pMThuL0ZyZW5jaC5qc29uJyxcbiAgICAgICAgICAgICAgICAnZXMnIDogJy8vY2RuLmRhdGF0YWJsZXMubmV0L3BsdWctaW5zLzEuMTAuOS9pMThuL1NwYW5pc2guanNvbicsXG4gICAgICAgICAgICAgICAgJ2l0JyA6ICcvL2Nkbi5kYXRhdGFibGVzLm5ldC9wbHVnLWlucy8xLjEwLjkvaTE4bi9JdGFsaWFuLmpzb24nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3RhdGVTYXZlIDogdHJ1ZSxcbiAgICAgICAgICAgIHN0YXRlRHVyYXRpb24gOiA2MCAqIDYwICogMjQgKiAxICAvLyBzZWMgKiBtaW4gKiBoICogZFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICB9O1xufVxuIiwiLyoqXG4gKiBUaGlzIG1vZHVsZSBzZXRzIHVwIHRoZSBzZWFyY2ggYmFyLlxuICovXG5cbiFmdW5jdGlvbigpIHtcblxudmFyIHNlYXJjaFNvdXJjZSA9IHtcbiAgbmFtZSA6ICdwYXR0ZXJubGlicmFyeScsXG5cbiAgLy8gT25seSBzaG93IDEwIHJlc3VsdHMgYXQgb25jZVxuICBsaW1pdDogMTAsXG5cbiAgLy8gRnVuY3Rpb24gdG8gZmV0Y2ggcmVzdWx0IGxpc3QgYW5kIHRoZW4gZmluZCBhIHJlc3VsdDtcbiAgc291cmNlOiBmdW5jdGlvbihxdWVyeSwgc3luYywgYXN5bmMpIHtcbiAgICBxdWVyeSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG5cbiAgICAkLmdldEpTT04oJy9wbC9zZWFyY2guanNvbicsIGZ1bmN0aW9uKGRhdGEsIHN0YXR1cykge1xuICAgICAgYXN5bmMoZGF0YS5maWx0ZXIoZnVuY3Rpb24oZWxlbSwgaSwgYXJyKSB7XG4gICAgICAgIHZhciBuYW1lID0gZWxlbS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHZhciB0ZXJtcyA9IFtuYW1lLCBuYW1lLnJlcGxhY2UoJy0nLCAnJyldLmNvbmNhdChlbGVtLnRhZ3MgfHwgW10pO1xuICAgICAgICBmb3IgKHZhciBpIGluIHRlcm1zKSBpZiAodGVybXNbaV0uaW5kZXhPZihxdWVyeSkgPiAtMSkgcmV0dXJuIHRydWU7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pKTtcbiAgICB9KTtcbiAgfSxcblxuICAvLyBOYW1lIHRvIHVzZSBmb3IgdGhlIHNlYXJjaCByZXN1bHQgaXRzZWxmXG4gIGRpc3BsYXk6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS5uYW1lO1xuICB9LFxuXG4gIHRlbXBsYXRlczoge1xuICAgIC8vIEhUTUwgdGhhdCByZW5kZXJzIGlmIHRoZXJlIGFyZSBubyByZXN1bHRzXG4gICAgbm90Rm91bmQ6IGZ1bmN0aW9uKHF1ZXJ5KSB7XG4gICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJ0dC1lbXB0eVwiPk5vIHJlc3VsdHMgZm9yIFwiJyArIHF1ZXJ5LnF1ZXJ5ICsgJ1wiLjwvZGl2Pic7XG4gICAgfSxcbiAgICAvLyBIVE1MIHRoYXQgcmVuZGVycyBmb3IgZWFjaCByZXN1bHQgaW4gdGhlIGxpc3RcbiAgICBzdWdnZXN0aW9uOiBmdW5jdGlvbihpdGVtKSB7XG4gICAgICByZXR1cm4gJzxkaXY+PHNwYW4gY2xhc3M9XCJuYW1lXCI+JyArIGl0ZW0ubmFtZSArICc8c3BhbiBjbGFzcz1cIm1ldGFcIj4nICsgaXRlbS50eXBlICsgJzwvc3Bhbj48L3NwYW4+IDxzcGFuIGNsYXNzPVwiZGVzY1wiPicgKyBpdGVtLmRlc2NyaXB0aW9uICsgJzwvc3Bhbj48L2Rpdj4nO1xuICAgIH1cbiAgfVxufVxuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG5cdC8vIFNlYXJjaFxuXHRjb25zb2xlLmxvZygnc2VhcmNoOiAnLCAkKCdbZGF0YS1kb2NzLXNlYXJjaF0nKSk7XG5cdCQoJ1tkYXRhLWRvY3Mtc2VhcmNoXScpXG5cdCAgLnR5cGVhaGVhZCh7IGhpZ2hsaWdodDogZmFsc2UgfSwgc2VhcmNoU291cmNlKTtcblx0JCgnW2RhdGEtZG9jcy1zZWFyY2hdJylcblx0ICAuYmluZCgndHlwZWFoZWFkOnNlbGVjdCcsIGZ1bmN0aW9uKGUsIHNlbCkge1xuXHQgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBzZWwubGluaztcblx0ICB9KTtcblx0XG5cdC8vIEF1dG8taGlnaGxpZ2h0IHVubGVzcyBpdCdzIGEgcGhvbmVcblx0aWYgKCFuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC8oaVAoaG9uZXxhZHxvZCl8QW5kcm9pZCkvKSkge1xuXHQgICQoJ1tkYXRhLWRvY3Mtc2VhcmNoXScpLmZvY3VzKCk7XG5cdH1cbn0pO1xuXG59KCk7XG4iLCIhZnVuY3Rpb24oJCwgcGF0dGVybmxpYnJhcnkpIHtcblxuLy8gRGVmYXVsdCBzZXQgb2YgbWVkaWEgcXVlcmllc1xudmFyIGRlZmF1bHRRdWVyaWVzID0ge1xuICAnZGVmYXVsdCcgOiAnb25seSBzY3JlZW4nLFxuICBsYW5kc2NhcGUgOiAnb25seSBzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogbGFuZHNjYXBlKScsXG4gIHBvcnRyYWl0IDogJ29ubHkgc2NyZWVuIGFuZCAob3JpZW50YXRpb246IHBvcnRyYWl0KScsXG4gIHJldGluYSA6ICdvbmx5IHNjcmVlbiBhbmQgKC13ZWJraXQtbWluLWRldmljZS1waXhlbC1yYXRpbzogMiksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLS1tb3otZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kICgtby1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyLzEpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAxOTJkcGkpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAyZHBweCknXG59O1xuXG52YXIgTWVkaWFRdWVyeSA9IHtcbiAgcXVlcmllczogW10sXG4gIGN1cnJlbnQ6ICcnLFxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIHNjcmVlbiBpcyBhdCBsZWFzdCBhcyB3aWRlIGFzIGEgYnJlYWtwb2ludC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBjaGVjay5cbiAgICogQHJldHVybnMge0Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgYnJlYWtwb2ludCBtYXRjaGVzLCBgZmFsc2VgIGlmIGl0J3Mgc21hbGxlci5cbiAgICovXG4gIGF0TGVhc3Q6IGZ1bmN0aW9uKHNpemUpIHtcbiAgICB2YXIgcXVlcnkgPSB0aGlzLmdldChzaXplKTtcblxuICAgIGlmIChxdWVyeSkge1xuICAgICAgcmV0dXJuIHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5KS5tYXRjaGVzO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICAvKipcbiAgICogR2V0cyB0aGUgbWVkaWEgcXVlcnkgb2YgYSBicmVha3BvaW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGdldC5cbiAgICogQHJldHVybnMge1N0cmluZ3xudWxsfSAtIFRoZSBtZWRpYSBxdWVyeSBvZiB0aGUgYnJlYWtwb2ludCwgb3IgYG51bGxgIGlmIHRoZSBicmVha3BvaW50IGRvZXNuJ3QgZXhpc3QuXG4gICAqL1xuICBnZXQ6IGZ1bmN0aW9uKHNpemUpIHtcbiAgICBmb3IgKHZhciBpIGluIHRoaXMucXVlcmllcykge1xuICAgICAgdmFyIHF1ZXJ5ID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgaWYgKHNpemUgPT09IHF1ZXJ5Lm5hbWUpIHJldHVybiBxdWVyeS52YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfSxcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIG1lZGlhIHF1ZXJ5IGhlbHBlciwgYnkgZXh0cmFjdGluZyB0aGUgYnJlYWtwb2ludCBsaXN0IGZyb20gdGhlIENTUyBhbmQgYWN0aXZhdGluZyB0aGUgYnJlYWtwb2ludCB3YXRjaGVyLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGV4dHJhY3RlZFN0eWxlcyA9ICQoJy5wYXR0ZXJubGlicmFyeS1tcScpLmNzcygnZm9udC1mYW1pbHknKTtcbiAgICB2YXIgbmFtZWRRdWVyaWVzO1xuXG4gICAgbmFtZWRRdWVyaWVzID0gcGFyc2VTdHlsZVRvT2JqZWN0KGV4dHJhY3RlZFN0eWxlcyk7XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gbmFtZWRRdWVyaWVzKSB7XG4gICAgICBzZWxmLnF1ZXJpZXMucHVzaCh7XG4gICAgICAgIG5hbWU6IGtleSxcbiAgICAgICAgdmFsdWU6ICdvbmx5IHNjcmVlbiBhbmQgKG1pbi13aWR0aDogJyArIG5hbWVkUXVlcmllc1trZXldICsgJyknXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLl9nZXRDdXJyZW50U2l6ZSgpO1xuXG4gICAgdGhpcy5fd2F0Y2hlcigpO1xuXG4gICAgLy8gRXh0ZW5kIGRlZmF1bHQgcXVlcmllc1xuICAgIC8vIG5hbWVkUXVlcmllcyA9ICQuZXh0ZW5kKGRlZmF1bHRRdWVyaWVzLCBuYW1lZFF1ZXJpZXMpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBjdXJyZW50IGJyZWFrcG9pbnQgbmFtZSBieSB0ZXN0aW5nIGV2ZXJ5IGJyZWFrcG9pbnQgYW5kIHJldHVybmluZyB0aGUgbGFzdCBvbmUgdG8gbWF0Y2ggKHRoZSBiaWdnZXN0IG9uZSkuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSBOYW1lIG9mIHRoZSBjdXJyZW50IGJyZWFrcG9pbnQuXG4gICAqL1xuICBfZ2V0Q3VycmVudFNpemU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBtYXRjaGVkO1xuXG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLnF1ZXJpZXMpIHtcbiAgICAgIHZhciBxdWVyeSA9IHRoaXMucXVlcmllc1tpXTtcblxuICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5LnZhbHVlKS5tYXRjaGVzKSB7XG4gICAgICAgIG1hdGNoZWQgPSBxdWVyeTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZih0eXBlb2YgbWF0Y2hlZCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBtYXRjaGVkLm5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBtYXRjaGVkO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQWN0aXZhdGVzIHRoZSBicmVha3BvaW50IHdhdGNoZXIsIHdoaWNoIGZpcmVzIGFuIGV2ZW50IG9uIHRoZSB3aW5kb3cgd2hlbmV2ZXIgdGhlIGJyZWFrcG9pbnQgY2hhbmdlcy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfd2F0Y2hlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICQod2luZG93KS5vbigncmVzaXplLnpmLm1lZGlhcXVlcnknLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBuZXdTaXplID0gX3RoaXMuX2dldEN1cnJlbnRTaXplKCk7XG5cbiAgICAgIGlmIChuZXdTaXplICE9PSBfdGhpcy5jdXJyZW50KSB7XG4gICAgICAgIC8vIEJyb2FkY2FzdCB0aGUgbWVkaWEgcXVlcnkgY2hhbmdlIG9uIHRoZSB3aW5kb3dcbiAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIFtuZXdTaXplLCBfdGhpcy5jdXJyZW50XSk7XG5cbiAgICAgICAgLy8gQ2hhbmdlIHRoZSBjdXJyZW50IG1lZGlhIHF1ZXJ5XG4gICAgICAgIF90aGlzLmN1cnJlbnQgPSBuZXdTaXplO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuXG5wYXR0ZXJubGlicmFyeS5NZWRpYVF1ZXJ5ID0gTWVkaWFRdWVyeTtcblxuLy8gbWF0Y2hNZWRpYSgpIHBvbHlmaWxsIC0gVGVzdCBhIENTUyBtZWRpYSB0eXBlL3F1ZXJ5IGluIEpTLlxuLy8gQXV0aG9ycyAmIGNvcHlyaWdodCAoYykgMjAxMjogU2NvdHQgSmVobCwgUGF1bCBJcmlzaCwgTmljaG9sYXMgWmFrYXMsIERhdmlkIEtuaWdodC4gRHVhbCBNSVQvQlNEIGxpY2Vuc2VcbndpbmRvdy5tYXRjaE1lZGlhIHx8ICh3aW5kb3cubWF0Y2hNZWRpYSA9IGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gRm9yIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBtYXRjaE1lZGl1bSBhcGkgc3VjaCBhcyBJRSA5IGFuZCB3ZWJraXRcbiAgdmFyIHN0eWxlTWVkaWEgPSAod2luZG93LnN0eWxlTWVkaWEgfHwgd2luZG93Lm1lZGlhKTtcblxuICAvLyBGb3IgdGhvc2UgdGhhdCBkb24ndCBzdXBwb3J0IG1hdGNoTWVkaXVtXG4gIGlmICghc3R5bGVNZWRpYSkge1xuICAgIHZhciBzdHlsZSAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKSxcbiAgICBzY3JpcHQgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXSxcbiAgICBpbmZvICAgICAgICA9IG51bGw7XG5cbiAgICBzdHlsZS50eXBlICA9ICd0ZXh0L2Nzcyc7XG4gICAgc3R5bGUuaWQgICAgPSAnbWF0Y2htZWRpYWpzLXRlc3QnO1xuXG4gICAgc2NyaXB0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHN0eWxlLCBzY3JpcHQpO1xuXG4gICAgLy8gJ3N0eWxlLmN1cnJlbnRTdHlsZScgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnd2luZG93LmdldENvbXB1dGVkU3R5bGUnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICBpbmZvID0gKCdnZXRDb21wdXRlZFN0eWxlJyBpbiB3aW5kb3cpICYmIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHN0eWxlLCBudWxsKSB8fCBzdHlsZS5jdXJyZW50U3R5bGU7XG5cbiAgICBzdHlsZU1lZGlhID0ge1xuICAgICAgbWF0Y2hNZWRpdW06IGZ1bmN0aW9uKG1lZGlhKSB7XG4gICAgICAgIHZhciB0ZXh0ID0gJ0BtZWRpYSAnICsgbWVkaWEgKyAneyAjbWF0Y2htZWRpYWpzLXRlc3QgeyB3aWR0aDogMXB4OyB9IH0nO1xuXG4gICAgICAgIC8vICdzdHlsZS5zdHlsZVNoZWV0JyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICdzdHlsZS50ZXh0Q29udGVudCcgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xuICAgICAgICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgICAgICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3R5bGUudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGVzdCBpZiBtZWRpYSBxdWVyeSBpcyB0cnVlIG9yIGZhbHNlXG4gICAgICAgIHJldHVybiBpbmZvLndpZHRoID09PSAnMXB4JztcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG1lZGlhKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1hdGNoZXM6IHN0eWxlTWVkaWEubWF0Y2hNZWRpdW0obWVkaWEgfHwgJ2FsbCcpLFxuICAgICAgbWVkaWE6IG1lZGlhIHx8ICdhbGwnXG4gICAgfTtcbiAgfTtcbn0oKSk7XG5cbi8vIFRoYW5rIHlvdTogaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9xdWVyeS1zdHJpbmdcbmZ1bmN0aW9uIHBhcnNlU3R5bGVUb09iamVjdChzdHIpIHtcbiAgdmFyIHN0eWxlT2JqZWN0ID0ge307XG5cbiAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHN0eWxlT2JqZWN0O1xuICB9XG5cbiAgc3RyID0gc3RyLnRyaW0oKS5zbGljZSgxLCAtMSk7IC8vIGJyb3dzZXJzIHJlLXF1b3RlIHN0cmluZyBzdHlsZSB2YWx1ZXNcblxuICBpZiAoIXN0cikge1xuICAgIHJldHVybiBzdHlsZU9iamVjdDtcbiAgfVxuXG4gIHN0eWxlT2JqZWN0ID0gc3RyLnNwbGl0KCcmJykucmVkdWNlKGZ1bmN0aW9uKHJldCwgcGFyYW0pIHtcbiAgICB2YXIgcGFydHMgPSBwYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKS5zcGxpdCgnPScpO1xuICAgIHZhciBrZXkgPSBwYXJ0c1swXTtcbiAgICB2YXIgdmFsID0gcGFydHNbMV07XG4gICAga2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KGtleSk7XG5cbiAgICAvLyBtaXNzaW5nIGA9YCBzaG91bGQgYmUgYG51bGxgOlxuICAgIC8vIGh0dHA6Ly93My5vcmcvVFIvMjAxMi9XRC11cmwtMjAxMjA1MjQvI2NvbGxlY3QtdXJsLXBhcmFtZXRlcnNcbiAgICB2YWwgPSB2YWwgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBkZWNvZGVVUklDb21wb25lbnQodmFsKTtcblxuICAgIGlmICghcmV0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHJldFtrZXldID0gdmFsO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXRba2V5XSkpIHtcbiAgICAgIHJldFtrZXldLnB1c2godmFsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0W2tleV0gPSBbcmV0W2tleV0sIHZhbF07XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH0sIHt9KTtcblxuICByZXR1cm4gc3R5bGVPYmplY3Q7XG59XG5cbn0oalF1ZXJ5LCBwYXR0ZXJubGlicmFyeSk7XG4iLCIvKipcbiAqIFxuICovXG47KGZ1bmN0aW9uICgkLCB3aW5kb3csIGRvY3VtZW50LCBwYXR0ZXJubGlicmFyeSwgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuXG4gIHBhdHRlcm5saWJyYXJ5LmxpYnMubW9kYWwgPSB7XG4gICAgbmFtZSA6ICdtb2RhbCcsXG5cbiAgICB2ZXJzaW9uIDogJzAuMC4xJyxcblxuICAgIHNldHRpbmdzIDoge1xuICAgICAgY2FsbGJhY2sgOiBmdW5jdGlvbiAoKSB7fVxuICAgIH0sXG5cbiAgICAvKmluaXQgOiBmdW5jdGlvbiAoc2NvcGUsIG1ldGhvZCwgb3B0aW9ucykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgLy8gcGF0dGVybmxpYnJhcnkuaW5oZXJpdCh0aGlzLCAnbW9kdWxlbmFtZTEgbW9kdWxlbmFtZTInKTtcblxuICAgICAgdGhpcy5iaW5kaW5ncyhtZXRob2QsIG9wdGlvbnMpO1xuICAgIH0sKi9cblxuICAgIC8qKlxuICAgICAqIG9wZW4gbW9kYWwgZGlhbG9nXG4gICAgICogXG4gICAgICogQHBhcmFtICBtaXhlZCAgZGF0YSAgdGhlIG1vZGFsIGNvbnRlbnRcbiAgICAgKiBAcGFyYW0gIHN0cmluZyAgdXBkYXRlV2luZG93SHJlZiAgVVJMIHRvIHVwZGF0ZSBicm93c2VyIGhpc3RvcnkgYW5kIGxvY2F0aW9uLCAtZmFsc2UvbnVsbC0gZGlzYWJsZXMsIGRlZmF1bHQgLWZhbHNlLSBcbiAgICAgKiBAcmV0dXJuIHBhdHRlcm5saWJyYXJ5LmxpYnMubW9kYWxcbiAgICAgKi9cbiAgICBvcGVuIDogZnVuY3Rpb24gKGRhdGEsIHVwZGF0ZVdpbmRvd0hyZWYpIHtcbiAgICAgICAgaWYgKCh0eXBlb2YgJC5mbi5tb2RhbCA9PSAndW5kZWZpbmVkJykgJiYgKHR5cGVvZiBGb3VuZGF0aW9uLlJldmVhbCA9PSAndW5kZWZpbmVkJykpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignQm9vdHN0cmFwIE1vZGFsIGFuZC9vciBGb3VuZGF0aW9uIFJldmVhbCBwbHVnLWlucyBub3QgZm91bmQuLi4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgJG1vZGFsID0gbnVsbDtcbiAgICAgICAgaWYgKHR5cGVvZiBGb3VuZGF0aW9uICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBpZiAoICQoJyMnK3BhdHRlcm5saWJyYXJ5LkNvbmZpZy5tb2RhbHMuZm91bmRhdGlvbkVsZW1lbnRDbGFzc25hbWUpLnNpemUoKSA9PSAwICkge1xuICAgICAgICAgICAgICAgICQoJ0JPRFknKS5hcHBlbmQoJzxkaXYgaWQ9XCInK3BhdHRlcm5saWJyYXJ5LkNvbmZpZy5tb2RhbHMuZm91bmRhdGlvbkVsZW1lbnRDbGFzc25hbWUrJ1wiIGNsYXNzPVwiJytwYXR0ZXJubGlicmFyeS5Db25maWcubW9kYWxzLmZvdW5kYXRpb25FbGVtZW50Q2xhc3NuYW1lKydcIiBkYXRhLXJldmVhbD48L2Rpdj4nKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHJldmVhbE9wdGlvbnMgPSB7IFxuICAgICAgICAgICAgXHRcImFuaW1hdGlvbkluXCIgICAgOiBcInNjYWxlLWluLXVwXCIsXG4gICAgICAgICAgICBcdFwiYW5pbWF0aW9uT3V0XCIgICA6IFwic2NhbGUtb3V0LWRvd25cIixcbiAgICAgICAgICAgIFx0XCJvdmVybGF5XCIgICAgICAgIDogdHJ1ZSxcbiAgICAgICAgICAgIFx0XCJjbG9zZU9uQ2xpY2tcIiAgIDogZmFsc2UsXG4gICAgICAgICAgICBcdFwiY2xvc2VPbkVjc1wiICAgICA6IHRydWUsXG4gICAgICAgICAgICBcdFwibXVsdGlwbGVPcGVuZWRcIiA6IGZhbHNlLFxuICAgICAgICAgICAgXHRcImRlZXBMaW5rXCIgICAgICAgOiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG1vZGFsRGF0YSA9ICcnK2RhdGErJycsXG4gICAgICAgICAgICAgICAgbSA9IG5ldyBGb3VuZGF0aW9uLlJldmVhbCgkKCcjJytwYXR0ZXJubGlicmFyeS5Db25maWcubW9kYWxzLmZvdW5kYXRpb25FbGVtZW50Q2xhc3NuYW1lKSwgcmV2ZWFsT3B0aW9ucylcbiAgICAgICAgICAgIDtcbiAgICAgICAgICAgICQoJyMnK3BhdHRlcm5saWJyYXJ5LkNvbmZpZy5tb2RhbHMuZm91bmRhdGlvbkVsZW1lbnRDbGFzc25hbWUpLmh0bWwoZGF0YSkuZm91bmRhdGlvbignb3BlbicpO1xuICAgICAgICAgICAgJG1vZGFsID0gJCgnLicrcGF0dGVybmxpYnJhcnkuQ29uZmlnLm1vZGFscy5mb3VuZGF0aW9uRWxlbWVudENsYXNzbmFtZSk7XG4gICAgICAgICAgICAkbW9kYWwub24oJ2Nsb3NlZC56Zi5yZXZlYWwnLCBwYXR0ZXJubGlicmFyeS5Nb2RhbC5jbG9zZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgJG1vZGFsRGVmYXVsdHMgPSB7XG4gICAgICAgICAgICAgICAgc2hvdzogdHJ1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICQoZGF0YSkubW9kYWwoJG1vZGFsRGVmYXVsdHMpO1xuICAgICAgICAgICAgJG1vZGFsID0gJCgnLicrcGF0dGVybmxpYnJhcnkuQ29uZmlnLm1vZGFscy5ib290c3RyYXBFbGVtZW50Q2xhc3NuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKHVwZGF0ZVdpbmRvd0hyZWYpIHtcbiAgICAgICAgICAgIHBhdHRlcm5saWJyYXJ5LldpbmRvd0hyZWYucmVzZXQoKTtcbiAgICAgICAgICAgIGRvY3VtZW50Ll9vbGRfaHJlZiA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgXCJodG1sXCIgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBcInBhZ2VUaXRsZVwiIDogZG9jdW1lbnQudGl0bGVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFwiXCIsXG4gICAgICAgICAgICAgICAgdXBkYXRlV2luZG93SHJlZlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuICgkbW9kYWwpO1xuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICogY2xvc2UgbW9kYWwgZGlhbG9nXG4gICAgICogXG4gICAgICogQHJldHVybiBwYXR0ZXJubGlicmFyeS5saWJzLm1vZGFsXG4gICAgICovXG4gICAgY2xvc2UgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICgodHlwZW9mICQuZm4ubW9kYWwgPT0gJ3VuZGVmaW5lZCcpICYmICh0eXBlb2YgRm91bmRhdGlvbi5SZXZlYWwgPT0gJ3VuZGVmaW5lZCcpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ2pRdWVyeSBNb2RhbCBhbmQvb3IgRm91bmRhdGlvbiBSZXZlYWwgcGx1Zy1pbnMgbm90IGZvdW5kLi4uJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciAkbW9kYWw7XG4gICAgICAgIC8vIGNsb3NlL2Rlc3Ryb3kgbW9kYWxzXG4gICAgICAgIGlmICh0eXBlb2YgRm91bmRhdGlvbiAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgJG1vZGFsID0gJCgnLicrcGF0dGVybmxpYnJhcnkuQ29uZmlnLm1vZGFscy5mb3VuZGF0aW9uRWxlbWVudENsYXNzbmFtZSk7XG4gICAgICAgICAgICBpZiAoJG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgJG1vZGFsLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgJG1vZGFsLmZvdW5kYXRpb24oJ2Nsb3NlJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vJG1vZGFsLmZvdW5kYXRpb24oJ2Rlc3Ryb3knKTtcbiAgICAgICAgICAgICAgICAgICAgLy8kKCcucmV2ZWFsLW92ZXJsYXknKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBcdGNvbnNvbGUuaW5mbygnbW9kYWwgY2xvc2VkLi4uJyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIFx0Ly9jb25zb2xlLndhcm4oJ21vZGFsIGNvdWxkIG5vdCBiZSBjbG9zZWQuLi4gZm9yY2UgcmVtb3ZhbC4uLicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRtb2RhbCA9ICQoJy4nK3BhdHRlcm5saWJyYXJ5LkNvbmZpZy5tb2RhbHMuYm9vdHN0cmFwRWxlbWVudENsYXNzbmFtZSk7XG4gICAgICAgICAgICBpZiAoJG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgJG1vZGFsLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIGNsZWFuIHVwXG4gICAgICAgICQoJ0JPRFknKS5yZW1vdmVDbGFzcygnaXMtcmV2ZWFsLW9wZW4nKTtcbiAgICAgICAgJCgnLnJldmVhbCwgLnJldmVhbC13cmFwcGVyLCAubW9kYWwsIC5tb2RhbC1iYWNrZHJvcCcpLnJlbW92ZSgpO1xuICAgICAgICBcbiAgICAgICAgLy8gKHJlKXNldCBkb2N1bWVudCBVUkxcbiAgICAgICAgcGF0dGVybmxpYnJhcnkuV2luZG93SHJlZi5yZXNldCgpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuICh0aGlzKTtcbiAgICB9XG5cbiAgfTtcblxuICAvLyBjb2RlLCBwcml2YXRlIGZ1bmN0aW9ucywgZXRjIGhlcmUuLi5cblxuICBwYXR0ZXJubGlicmFyeS5Nb2RhbCA9IHtcbiAgICAgIG9wZW4gOiBwYXR0ZXJubGlicmFyeS5saWJzLm1vZGFsLm9wZW4sXG4gICAgICBjbG9zZSA6IHBhdHRlcm5saWJyYXJ5LmxpYnMubW9kYWwuY2xvc2UsXG4gIH07XG4gIFxufSkoalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50LCB3aW5kb3cucGF0dGVybmxpYnJhcnkpO1xuXG5cbiIsIi8qKlxuICogXG4gKi9cbjsoZnVuY3Rpb24gKCQsIHdpbmRvdywgZG9jdW1lbnQsIHBhdHRlcm5saWJyYXJ5LCB1bmRlZmluZWQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG5cbiAgcGF0dGVybmxpYnJhcnkubGlicy53aW5kb3docmVmID0ge1xuICAgIG5hbWUgOiAnd2luZG93aHJlZicsXG5cbiAgICB2ZXJzaW9uIDogJzAuMC4xJyxcblxuICAgIHNldHRpbmdzIDoge1xuICAgICAgY2FsbGJhY2sgOiBmdW5jdGlvbiAoKSB7fVxuICAgIH0sXG5cbiAgICBpbml0IDogZnVuY3Rpb24gKHNjb3BlLCBtZXRob2QsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIC8vIHBhdHRlcm5saWJyYXJ5LmluaGVyaXQodGhpcywgJ21vZHVsZW5hbWUxIG1vZHVsZW5hbWUyJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHVwZGF0ZSB3aW5kb3cncyBocmVmIHRvIFVSTCBhbmQgc2F2ZSBvbGQgaHJlZlxuICAgICAqIFxuICAgICAqIEBwYXJhbSAgc3RyaW5nICB1cmwgIFVSTCB0byB1cGRhdGUgdG9cbiAgICAgKiBAcmV0dXJuIHBhdHRlcm5saWJyYXJ5LmxpYnMud2luZG93aHJlZlxuICAgICAqL1xuICAgIHVwZGF0ZSA6IGZ1bmN0aW9uICggdXJsICkge1xuICAgICAgICBpZiAoICh1cmwgPT0gJycpIHx8ICh1cmwgPT0gd2luZG93LmxvY2F0aW9uLmhyZWYpICkgeyByZXR1cm47IH1cbiAgICAgICAgXG4gICAgICAgIGRvY3VtZW50Ll9vbGRfaHJlZiA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJodG1sXCIgOiBudWxsLFxuICAgICAgICAgICAgICAgIFwicGFnZVRpdGxlXCIgOiBkb2N1bWVudC50aXRsZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiXCIsXG4gICAgICAgICAgICB1cGRhdGVXaW5kb3dIcmVmXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gKHRoaXMpO1xuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICogcmVzZXQgd2luZG93J3MgaHJlZiB0byBzdG9yZWQgVVJMXG4gICAgICogXG4gICAgICogQHJldHVybiBwYXR0ZXJubGlicmFyeS5saWJzLndpbmRvd2hyZWZcbiAgICAgKi9cbiAgICByZXNldCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGRvY3VtZW50Ll9vbGRfaHJlZikge1xuICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgXCJodG1sXCI6bnVsbCxcbiAgICAgICAgICAgICAgICAgICAgXCJwYWdlVGl0bGVcIjpkb2N1bWVudC50aXRsZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5fb2xkX2hyZWZcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICh0aGlzKTtcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIGNsZWFyIHN0b3JlZCBVUkxcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJuIHBhdHRlcm5saWJyYXJ5LmxpYnMud2luZG93aHJlZlxuICAgICAqL1xuICAgIGNsZWFyT2xkSHJlZiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZG9jdW1lbnQuX29sZF9ocmVmID0gbnVsbDtcbiAgICAgICAgcmV0dXJuICh0aGlzKTtcbiAgICB9XG5cbiAgfTtcblxuICAvLyBjb2RlLCBwcml2YXRlIGZ1bmN0aW9ucywgZXRjIGhlcmUuLi5cblxuICBwYXR0ZXJubGlicmFyeS5XaW5kb3dIcmVmID0ge1xuICAgICAgdXBkYXRlIDogcGF0dGVybmxpYnJhcnkubGlicy53aW5kb3docmVmLnVwZGF0ZSxcbiAgICAgIHJlc2V0IDogcGF0dGVybmxpYnJhcnkubGlicy53aW5kb3docmVmLnJlc2V0LFxuICAgICAgY2xlYXIgOiBwYXR0ZXJubGlicmFyeS5saWJzLndpbmRvd2hyZWYuY2xlYXJPbGRIcmVmXG4gIH07XG4gIFxufSkoalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50LCB3aW5kb3cucGF0dGVybmxpYnJhcnkpO1xuXG5cbiIsIi8qKlxuICogaW5pdGlhbGl6ZSBtb2RhbCBYSFIgdHJpZ2dlcnMgYW5kIHdhdGNoIGZvciBtb2RhbCBYSFIgZm9ybXNcbiAqL1xuOyhmdW5jdGlvbiAoJCwgd2luZG93LCBkb2N1bWVudCwgcGF0dGVybmxpYnJhcnksIHVuZGVmaW5lZCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICBpZiAoKHR5cGVvZiAkLmZuLm1vZGFsID09ICd1bmRlZmluZWQnKSAmJiAodHlwZW9mIEZvdW5kYXRpb24uUmV2ZWFsID09ICd1bmRlZmluZWQnKSkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2pRdWVyeSBNb2RhbCBhbmQvb3IgRm91bmRhdGlvbiBSZXZlYWwgcGx1Zy1pbnMgbm90IGZvdW5kLi4uJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyICRib2R5ID0gJChkb2N1bWVudCksXG4gICAgICAgICRhamF4QnV0dG9ucyAgPSBwYXR0ZXJubGlicmFyeS5Db25maWcueGhyU2VsZWN0b3JzLnhockJ1dHRvbnMsIC8vIFwiQS5idG5baHJlZio9J2FkZCddLCBBLmJ0bltocmVmKj0nZWRpdCddLCBBLmJ0bltocmVmKj0nZGV0YWlscyddLCBBLmJ0bltocmVmKj0nZGVsZXRlJ11cIixcbiAgICAgICAgJGFqYXhDVEFPcGVuICA9IHBhdHRlcm5saWJyYXJ5LkNvbmZpZy54aHJTZWxlY3RvcnMueGhyQ1RBT3BlbiwgLy8gXCJBLmJ0bi1jdGEteGhyLmN0YS14aHItbW9kYWxcIixcbiAgICAgICAgJGFqYXhDVEFDbG9zZSA9IHBhdHRlcm5saWJyYXJ5LkNvbmZpZy54aHJTZWxlY3RvcnMueGhyQ1RBQ2xvc2UsIC8vIFwiLm1vZGFsLWNvbnRlbnQgLmJ0bi1jdGEteGhyLWNsb3NlLCAubW9kYWwtY29udGVudCAuYWxlcnQsIC5tb2RhbC1jb250ZW50IC5jbG9zZSwgLm1vZGFsLWNvbnRlbnQgLmN0YS14aHItbW9kYWwtY2xvc2VcIixcbiAgICAgICAgJGFqYXhGb3JtcyAgICA9IHBhdHRlcm5saWJyYXJ5LkNvbmZpZy54aHJTZWxlY3RvcnMueGhyRm9ybXMgLy8gXCIubW9kYWwtY29udGVudCAuZm9ybS14aHJcIlxuICAgIDtcbiAgICBcbiAgICAvL1xuICAgIC8vIG1vZGFsIHRyaWdnZXJzXG4gICAgLy9cbiAgICB2YXIgaGFuZGxlcl9pbml0WEhSTW9kYWxUcmlnZ2VyID0gZnVuY3Rpb24gKG9FdmVudCkge1xuICAgICAgICBcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcbiAgICAgICAgICAgICRidG5VcmwgPSAkdGhpcy5hdHRyKCdocmVmJyk7XG4gICAgICAgIFxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgaGVhZGVycyA6IHtcbiAgICAgICAgICAgICAgICAnQWNjZXB0JyA6ICd0ZXh0L2h0bWwnLFxuICAgICAgICAgICAgICAgICdYLWxheW91dCcgOiAnbW9kYWwnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdHlwZSAgICA6IFwiR0VUXCIsXG4gICAgICAgICAgICBjYWNoZSAgICA6IGZhbHNlLFxuICAgICAgICAgICAgdXJsICAgICAgICA6ICR0aGlzLmF0dHIoJ2hyZWYnKSxcbiAgICAgICAgICAgIHN1Y2Nlc3MgICAgOiBmdW5jdGlvbiAoZGF0YSkge1xuXG4gICAgICAgICAgICAgICAgcGF0dGVybmxpYnJhcnkuTW9kYWwub3BlbihkYXRhLCAkYnRuVXJsKTtcblxuICAgICAgICAgICAgICAgIGlmICggKHR5cGVvZiAkLmZuLmRhdGFUYWJsZSAhPSAndW5kZWZpZW5lZCcpICkge1xuICAgICAgICAgICAgICAgICAgICAkKCcuZGF0YXRhYmxlLmNydWQnKS5kYXRhVGFibGUoKS5hcGkoKS5hamF4LnJlbG9hZChmdW5jdGlvbiAoIHRhYmxlZGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCB0YWJsZWRhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIG9FdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBvRXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIG9FdmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgcmV0dXJuIChmYWxzZSk7XG4gICAgICAgIFxuICAgIH07IFxuXG4gICAgLy9cbiAgICAvLyBtb2RhbCBmb3Jtc1xuICAgIC8vXG4gICAgdmFyIGhhbmRsZXJfaW5pdFhIUk1vZGFsRm9ybSA9IGZ1bmN0aW9uIChvRXZlbnQpIHtcbiAgICAgICAgdmFyICRmb3JtID0gJCh0aGlzKSxcbiAgICAgICAgICAgIGZvcm1VUkwgPSAkZm9ybS5hdHRyKCdhY3Rpb24nKSxcbiAgICAgICAgICAgIGZvcm1EYXRhID0gJGZvcm0uc2VyaWFsaXplQXJyYXkoKVxuICAgICAgICA7XG4gICAgICAgIFxuICAgICAgICBmb3JtRGF0YS5wdXNoKCBcbiAgICAgICAgICAgICgkZm9ybS5maW5kKCdpbnB1dFtuYW1lPWRlbF0uYnRuJykuc2l6ZSgpID4gMCkgPyB7bmFtZTogJ2RlbCcsIHZhbHVlOiAnZGVsZXRlJ30gOiBudWxsIFxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIGhlYWRlcnMgOiB7XG4gICAgICAgICAgICAgICAgJ0FjY2VwdCcgOiAndGV4dC9odG1sJyxcbiAgICAgICAgICAgICAgICAnWC1sYXlvdXQnIDogJ21vZGFsJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHR5cGUgICAgOiBcIlBPU1RcIixcbiAgICAgICAgICAgIGNhY2hlICAgIDogZmFsc2UsXG4gICAgICAgICAgICB1cmwgICAgICAgIDogZm9ybVVSTCxcbiAgICAgICAgICAgIGRhdGEgICAgOiBmb3JtRGF0YSxcbiAgICAgICAgICAgIHN1Y2Nlc3MgICAgOiBmdW5jdGlvbiAoZGF0YSkge1xuXG4gICAgICAgICAgICAgICAgcGF0dGVybmxpYnJhcnkuTW9kYWwuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICBwYXR0ZXJubGlicmFyeS5Nb2RhbC5vcGVuKGRhdGEsIGZvcm1VUkwpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmICggKHR5cGVvZiAkLmZuLmRhdGFUYWJsZSAhPSAndW5kZWZpZW5lZCcpICkge1xuICAgICAgICAgICAgICAgICAgICAkKCcuZGF0YXRhYmxlLmNydWQnKS5kYXRhVGFibGUoKS5hcGkoKS5hamF4LnJlbG9hZChmdW5jdGlvbiAoIHRhYmxlZGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCB0YWJsZWRhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIG9FdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBvRXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIG9FdmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgcmV0dXJuIChmYWxzZSk7XG4gICAgfTtcblxuICAgIC8vXG4gICAgLy8gbW9kYWwgY2xvc2VcbiAgICAvL1xuICAgIHZhciBoYW5kbGVyX2Nsb3NlTW9kYWwgPSBmdW5jdGlvbiAob0V2ZW50KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwYXR0ZXJubGlicmFyeS5Nb2RhbC5jbG9zZSgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICBcbiAgICAgICAgb0V2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIG9FdmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgb0V2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICByZXR1cm4gKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICAvLyB3YXRjaCBET00gZWxlbWVudHNcbiAgICAvL1xuICAgICRib2R5Lm9uKCdjbGljay5wYXR0ZXJubGlicmFyeS54aHJtb2RhbG9wZW4nLCAgJGFqYXhDVEFPcGVuLCAge30sIGhhbmRsZXJfaW5pdFhIUk1vZGFsVHJpZ2dlcik7XG4gICAgJGJvZHkub24oJ3N1Ym1pdC5wYXR0ZXJubGlicmFyeS54aHJtb2RhbHN1Ym1pdCcsICRhamF4Rm9ybXMsICAgIHt9LCBoYW5kbGVyX2luaXRYSFJNb2RhbEZvcm0pO1xuICAgICRib2R5Lm9uKCdjbGljay5wYXR0ZXJubGlicmFyeS54aHJtb2RhbGNsb3NlJywgICRhamF4Q1RBQ2xvc2UsIHt9LCBoYW5kbGVyX2Nsb3NlTW9kYWwpO1xuXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAkKCRhamF4Q1RBT3Blbikub24oJ2NsaWNrLnBhdHRlcm5saWJyYXJ5Lnhocm1vZGFsb3BlbicsIGhhbmRsZXJfaW5pdFhIUk1vZGFsVHJpZ2dlcik7XG4gICAgICAgICQoJGFqYXhGb3Jtcykub24oJ3N1Ym1pdC5wYXR0ZXJubGlicmFyeS54aHJtb2RhbHN1Ym1pdCcsIGhhbmRsZXJfaW5pdFhIUk1vZGFsRm9ybSk7XG4gICAgICAgICQoJGFqYXhDVEFDbG9zZSkub24oJ2NsaWNrLnBhdHRlcm5saWJyYXJ5Lnhocm1vZGFsY2xvc2UnLCBoYW5kbGVyX2Nsb3NlTW9kYWwpO1xuICAgIH0pO1xuXG59KShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQsIHdpbmRvdy5wYXR0ZXJubGlicmFyeSk7XG4iLCIvKipcbiAqIHRoZW1lIGJhc2Ugc2V0dXAgKFp1cmIgRm91bmRhdGlvbilcbiAqIFxuICogcGF0dGVybmxpYnJhcnkgY2xpZW50IChpbml0LSlzY3JpcHRcbiAqICAgXG4gKiBAcGFja2FnZSAgICAgW3BhdHRlcm5saWJyYXJ5XVxuICogQHN1YnBhY2thZ2UgIHBhdHRlcm5saWJyYXJ5IGNsaWVudCBzY3JpcHRcbiAqIEBhdXRob3IgICAgICBCasO2cm4gQmFydGVscyA8Y29kaW5nQGJqb2VybmJhcnRlbHMuZWFydGg+XG4gKiBAbGluayAgICAgICAgaHR0cHM6Ly9naXRsYWIuYmpvZXJuYmFydGVscy5lYXJ0aC9qcy9wYXR0ZXJubGlicmFyeVxuICogQGxpY2Vuc2UgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMCBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjBcbiAqIEBjb3B5cmlnaHQgICBjb3B5cmlnaHQgKGMpIDIwMTYgQmrDtnJuIEJhcnRlbHMgPGNvZGluZ0Biam9lcm5iYXJ0ZWxzLmVhcnRoPlxuICovXG5cbmlmICghalF1ZXJ5KSB7XG4gICAgY29uc29sZS5lcnJvcignalF1ZXJ5IG5vdCBmb3VuZC4uLicpO1xuICAgIHdpbmRvdy5zdG9wKCk7XG59XG5cbmlmICghJC5mbi5mb3VuZGF0aW9uKSB7XG4gICAgY29uc29sZS5lcnJvcignRm91bmRhdGlvbiBub3QgZm91bmQuLi4nKTtcbiAgICB3aW5kb3cuc3RvcCgpO1xufVxuXG4oZnVuY3Rpb24gKCQsIGRvYywgd2luLCBwYXR0ZXJubGlicmFyeSkge1xuICAgIFxuICAgIHZhciAkZG9jID0gJChkb2MpLFxuICAgICAgICAkbGFuZyA9IHBhdHRlcm5saWJyYXJ5LkNvbmZpZy5sYW5nXG4gICAgO1xuXG5cdC8vd2luZG93Lm9udG91Y2htb3ZlID0gZnVuY3Rpb24oKSB7IHJldHVybiBmYWxzZTsgfVxuXHQvL3dpbmRvdy5vbm9yaWVudGF0aW9uY2hhbmdlID0gZnVuY3Rpb24oKSB7IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wID0gMDsgfSAgXG4gICAgICAgIFxuICAgIC8vXG4gICAgLy8gaW5pdCBwYXR0ZXJubGlicmFyeSAoZnJvbnRlbnQpXG4gICAgLy9cbiAgICAkZG9jLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICBcdFxuICAgIFx0JChkb2N1bWVudCkuZm91bmRhdGlvbigpO1xuICAgIFx0XG4gICAgXHQkZG9jLnBhdHRlcm5saWJyYXJ5KCk7XG4gICAgXHRcbiAgICBcdCQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgICBcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBkb2N1bWVudCwgd2luZG93LCBwYXR0ZXJubGlicmFyeSk7IixudWxsXX0=
