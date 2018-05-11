'use strict';

import $ from 'jquery';

/**
 * TextExcerptToggle module.
 * 
 * @module Siteapp.TextExcerptToggle
 * 
 */

class TextExcerptToggle {
	
    /**
     * Creates a new instance of a Siteapp.TextExcerptToggle.
     * @class
     * @param {jQuery} element - jQuery object to make into a Siteapp.TextExcerptToggle.
     *        Object should be of the TextExcerptToggle panel, rather than its anchor.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    constructor(element, options) {
        this.$element = element;
        this.options = $.extend({}, TextExcerptToggle.initoptions, this.$element.data(), options);
        this._init();

    }

    /**
     * Initializes the plugin by setting/checking options and attributes, adding helper variables, and saving the anchor.
     * @function
     * @private
     */
    _init() {
        var $id = this.$element.attr('id');

        this.$anchor = $(`[data-toggle="${$id}"]`).length ? $(`[data-toggle="${$id}"]`) : $(`[data-open="${$id}"]`);
        this.$anchor.attr({
        	  'aria-controls': $id,
        	  'data-is-focus': false,
        	  'data-yeti-box': $id,
        	  'aria-haspopup': true,
        	  'aria-expanded': false

         });

    if(this.options.parentClass){
      this.$parent = this.$element.parents('.' + this.options.parentClass);
    }else{
      this.$parent = null;
    }
    this.options.positionClass = this.getPositionClass();
    this.counter = 4;
    this.usedPositions = [];
    this.$element.attr({
      'aria-hidden': 'true',
      'data-yeti-box': $id,
      'data-resize': $id,
      'aria-labelledby': this.$anchor[0].id || GetYoDigits(6, 'dd-anchor')
    });
    this._events();
  }

  /**
   * Helper function to determine current orientation of TextExcerptToggle pane.
   * @function
   * @returns {String} position - string value of a position class.
   */
  getPositionClass() {
    var verticalPosition = this.$element[0].className.match(/(top|left|right|bottom)/g);
        verticalPosition = verticalPosition ? verticalPosition[0] : '';
    var horizontalPosition = /float-(\S+)/.exec(this.$anchor[0].className);
        horizontalPosition = horizontalPosition ? horizontalPosition[1] : '';
    var position = horizontalPosition ? horizontalPosition + ' ' + verticalPosition : verticalPosition;

    return position;
  }

  /**
   * Adjusts the TextExcerptToggle panes orientation by adding/removing positioning classes.
   * @function
   * @private
   * @param {String} position - position class to remove.
   */
  _reposition(position) {
    this.usedPositions.push(position ? position : 'bottom');
    //default, try switching to opposite side
    if(!position && (this.usedPositions.indexOf('top') < 0)){
      this.$element.addClass('top');
    }else if(position === 'top' && (this.usedPositions.indexOf('bottom') < 0)){
      this.$element.removeClass(position);
    }else if(position === 'left' && (this.usedPositions.indexOf('right') < 0)){
      this.$element.removeClass(position)
          .addClass('right');
    }else if(position === 'right' && (this.usedPositions.indexOf('left') < 0)){
      this.$element.removeClass(position)
          .addClass('left');
    }

    //if default change didn't work, try bottom or left first
    else if(!position && (this.usedPositions.indexOf('top') > -1) && (this.usedPositions.indexOf('left') < 0)){
      this.$element.addClass('left');
    }else if(position === 'top' && (this.usedPositions.indexOf('bottom') > -1) && (this.usedPositions.indexOf('left') < 0)){
      this.$element.removeClass(position)
          .addClass('left');
    }else if(position === 'left' && (this.usedPositions.indexOf('right') > -1) && (this.usedPositions.indexOf('bottom') < 0)){
      this.$element.removeClass(position);
    }else if(position === 'right' && (this.usedPositions.indexOf('left') > -1) && (this.usedPositions.indexOf('bottom') < 0)){
      this.$element.removeClass(position);
    }
    //if nothing cleared, set to bottom
    else{
      this.$element.removeClass(position);
    }
    this.classChanged = true;
    this.counter--;
  }

  /**
   * Sets the position and orientation of the TextExcerptToggle pane, checks for collisions.
   * Recursively calls itself if a collision is detected, with a new position class.
   * @function
   * @private
   */
  _setPosition() {
    if(this.$anchor.attr('aria-expanded') === 'false'){ return false; }
    var position = this.getPositionClass(),
        $eleDims = Box.GetDimensions(this.$element),
        $anchorDims = Box.GetDimensions(this.$anchor),
        _this = this,
        direction = (position === 'left' ? 'left' : ((position === 'right') ? 'left' : 'top')),
        param = (direction === 'top') ? 'height' : 'width',
        offset = (param === 'height') ? this.options.vOffset : this.options.hOffset;

    if(($eleDims.width >= $eleDims.windowDims.width) || (!this.counter && !Box.ImNotTouchingYou(this.$element, this.$parent))){
      var newWidth = $eleDims.windowDims.width,
          parentHOffset = 0;
      if(this.$parent){
        var $parentDims = Box.GetDimensions(this.$parent),
            parentHOffset = $parentDims.offset.left;
        if ($parentDims.width < newWidth){
          newWidth = $parentDims.width;
        }
      }

      this.$element.offset(Box.GetOffsets(this.$element, this.$anchor, 'center bottom', this.options.vOffset, this.options.hOffset + parentHOffset, true)).css({
        'width': newWidth - (this.options.hOffset * 2),
        'height': 'auto'
      });
      this.classChanged = true;
      return false;
    }

    this.$element.offset(Box.GetOffsets(this.$element, this.$anchor, position, this.options.vOffset, this.options.hOffset));

    while(!Box.ImNotTouchingYou(this.$element, this.$parent, true) && this.counter){
      this._reposition(position);
      this._setPosition();
    }
  }

  /**
   * Adds event listeners to the element utilizing the triggers utility library.
   * @function
   * @private
   */
  _events() {
    var _this = this;
    this.$element.on({
      'open.zf.trigger': this.open.bind(this),
      'close.zf.trigger': this.close.bind(this),
      'toggle.zf.trigger': this.toggle.bind(this),
      'resizeme.zf.trigger': this._setPosition.bind(this)
    });

    if(this.options.hover){
      this.$anchor.off('mouseenter.zf.textexcerpttoggle mouseleave.zf.textexcerpttoggle')
      .on('mouseenter.zf.textexcerpttoggle', function(){
        var bodyData = $('body').data();
        if(typeof(bodyData.whatinput) === 'undefined' || bodyData.whatinput === 'mouse') {
          clearTimeout(_this.timeout);
          _this.timeout = setTimeout(function(){
            _this.open();
            _this.$anchor.data('hover', true);
          }, _this.options.hoverDelay);
        }
      }).on('mouseleave.zf.textexcerpttoggle', function(){
        clearTimeout(_this.timeout);
        _this.timeout = setTimeout(function(){
          _this.close();
          _this.$anchor.data('hover', false);
        }, _this.options.hoverDelay);
      });
      if(this.options.hoverPane){
        this.$element.off('mouseenter.zf.textexcerpttoggle mouseleave.zf.textexcerpttoggle')
            .on('mouseenter.zf.textexcerpttoggle', function(){
              clearTimeout(_this.timeout);
            }).on('mouseleave.zf.textexcerpttoggle', function(){
              clearTimeout(_this.timeout);
              _this.timeout = setTimeout(function(){
                _this.close();
                _this.$anchor.data('hover', false);
              }, _this.options.hoverDelay);
            });
      }
    }
    this.$anchor.add(this.$element).on('keydown.zf.textexcerpttoggle', function(e) {

      var $target = $(this),
        visibleFocusableElements = Keyboard.findFocusable(_this.$element);

      Keyboard.handleKey(e, 'TextExcerptToggle', {
        open: function() {
          if ($target.is(_this.$anchor)) {
            _this.open();
            _this.$element.attr('tabindex', -1).focus();
            e.preventDefault();
          }
        },
        close: function() {
          _this.close();
          _this.$anchor.focus();
        }
      });
    });
  }

  /**
   * Adds an event handler to the body to close any TextExcerptToggle on a click.
   * @function
   * @private
   */
  _addBodyHandler() {
     var $body = $(document.body).not(this.$element),
         _this = this;
     $body.off('click.zf.textexcerpttoggle')
          .on('click.zf.textexcerpttoggle', function(e){
            if(_this.$anchor.is(e.target) || _this.$anchor.find(e.target).length) {
              return;
            }
            if(_this.$element.find(e.target).length) {
              return;
            }
            _this.close();
            $body.off('click.zf.textexcerpttoggle');
          });
  }

  /**
   * Opens the TextExcerptToggle pane, and fires a bubbling event to close other TextExcerptToggle.
   * @function
   * @fires TextExcerptToggle#closeme
   * @fires TextExcerptToggle#show
   */
  open() {
    // var _this = this;
    /**
     * Fires to close other open TextExcerptToggle, typically when TextExcerptToggle is opening
     * @event TextExcerptToggle#closeme
     */
    this.$element.trigger('closeme.zf.textexcerpttoggle', this.$element.attr('id'));
    this.$anchor.addClass('hover')
        .attr({'aria-expanded': true});
    // this.$element/*.show()*/;
    this._setPosition();
    this.$element.addClass('is-open')
        .attr({'aria-hidden': false});

    if(this.options.autoFocus){
      var $focusable = Keyboard.findFocusable(this.$element);
      if($focusable.length){
        $focusable.eq(0).focus();
      }
    }

    if(this.options.closeOnClick){ this._addBodyHandler(); }

    if (this.options.trapFocus) {
      Keyboard.trapFocus(this.$element);
    }

    /**
     * Fires once the TextExcerptToggle is visible.
     * @event TextExcerptToggle#show
     */
    this.$element.trigger('show.zf.textexcerpttoggle', [this.$element]);
  }

  /**
   * Closes the open TextExcerptToggle pane.
   * @function
   * @fires TextExcerptToggle#hide
   */
  close() {
    if(!this.$element.hasClass('is-open')){
      return false;
    }
    this.$element.removeClass('is-open')
        .attr({'aria-hidden': true});

    this.$anchor.removeClass('hover')
        .attr('aria-expanded', false);

    if(this.classChanged){
      var curPositionClass = this.getPositionClass();
      if(curPositionClass){
        this.$element.removeClass(curPositionClass);
      }
      this.$element.addClass(this.options.positionClass)
          /*.hide()*/.css({height: '', width: ''});
      this.classChanged = false;
      this.counter = 4;
      this.usedPositions.length = 0;
    }
    /**
     * Fires once the TextExcerptToggle is no longer visible.
     * @event TextExcerptToggle#hide
     */
    this.$element.trigger('hide.zf.textexcerpttoggle', [this.$element]);

    if (this.options.trapFocus) {
      Keyboard.releaseFocus(this.$element);
    }
  }

  /**
   * Toggles the TextExcerptToggle pane's visibility.
   * @function
   */
  toggle() {
    if(this.$element.hasClass('is-open')){
      if(this.$anchor.data('hover')) return;
      this.close();
    }else{
      this.open();
    }
  }

  /**
   * Destroys the TextExcerptToggle.
   * @function
   */
  _destroy() {
    this.$element.off('.zf.trigger').hide();
    this.$anchor.off('.zf.textexcerpttoggle');
    $(document.body).off('click.zf.textexcerpttoggle');

  }
}

TextExcerptToggle.initoptions = {
  /**
   * Class that designates bounding container of TextExcerptToggle (default: window)
   * @option
   * @type {?string}
   * @default null
   */
  parentClass: null,
  /**
   * Amount of time to delay opening a submenu on hover event.
   * @option
   * @type {number}
   * @default 250
   */
  hoverDelay: 250,
  /**
   * Allow submenus to open on hover events
   * @option
   * @type {boolean}
   * @default false
   */
  hover: false,
  /**
   * Don't close TextExcerptToggle when hovering over TextExcerptToggle pane
   * @option
   * @type {boolean}
   * @default false
   */
  hoverPane: false,
  /**
   * Number of pixels between the TextExcerptToggle pane and the triggering element on open.
   * @option
   * @type {number}
   * @default 1
   */
  vOffset: 1,
  /**
   * Number of pixels between the TextExcerptToggle pane and the triggering element on open.
   * @option
   * @type {number}
   * @default 1
   */
  hOffset: 1,
  /**
   * Class applied to adjust open position. JS will test and fill this in.
   * @option
   * @type {string}
   * @default ''
   */
  positionClass: '',
  /**
   * Allow the plugin to trap focus to the TextExcerptToggle pane if opened with keyboard commands.
   * @option
   * @type {boolean}
   * @default false
   */
  trapFocus: false,
  /**
   * Allow the plugin to set focus to the first focusable element within the pane, regardless of method of opening.
   * @option
   * @type {boolean}
   * @default false
   */
  autoFocus: false,
  /**
   * Allows a click on the body to close the TextExcerptToggle.
   * @option
   * @type {boolean}
   */
  closeOnClick: false
}

export {TextExcerptToggle};
