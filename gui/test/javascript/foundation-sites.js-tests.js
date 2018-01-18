'use strict';

/* jslint mocha: true */
/*global describe, it, before, beforeEach, after, afterEach, $, Foundation */

describe('Abide', function () {
  var plugin;
  var $html;

  afterEach(function () {
    plugin.destroy();
    $html.remove();
  });

  describe('constructor()', function () {
    it('stores the element & plugin options', function () {
      $html = $('<form data-abide novalidate></form>').appendTo('body');
      plugin = new Foundation.Abide($html, {});

      plugin.$element.should.be.an('object');
      plugin.options.should.be.an('object');
    });
  });

  describe('validateInput()', function () {
    it('returns true for hidden inputs', function () {
      $html = $("<form data-abide novalidate><input type='hidden' required></form>").appendTo("body");
      plugin = new Foundation.Abide($html, {});

      plugin.validateInput($html.find("input")).should.equal(true);
    });

    it('returns true for inputs with [data-abide-ignore]', function () {
      $html = $("<form data-abide novalidate><input type='text' required data-abide-ignore></form>").appendTo("body");
      plugin = new Foundation.Abide($html, {});

      plugin.validateInput($html.find("input")).should.equal(true);
    });
  });
});
'use strict';

describe('Accordion', function () {
  var plugin;
  var $html;
  var template = '<ul class="accordion" data-accordion>\n  <li class="accordion-item is-active" data-accordion-item>\n    <a href="#" class="accordion-title">Accordion 1</a>\n    <div class="accordion-content" data-tab-content >\n      <p>Panel 1. Lorem ipsum dolor</p>\n      <a href="#">Nowhere to Go</a>\n    </div>\n  </li>\n  <li class="accordion-item" data-accordion-item>\n    <a href="#" class="accordion-title">Accordion 2</a>\n    <div class="accordion-content" data-tab-content>\n      <textarea></textarea>\n      <button class="button">I do nothing!</button>\n    </div>\n  </li>\n  <li class="accordion-item" data-accordion-item>\n    <a href="#" class="accordion-title">Accordion 3</a>\n    <div class="accordion-content" data-tab-content>\n      Pick a date!\n      <input type="date"></input>\n    </div>\n  </li>\n</ul>';

  afterEach(function () {
    plugin.destroy();
    $html.remove();
  });

  describe('constructor()', function () {
    it('stores the element and plugin options', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Accordion($html, {});

      plugin.$element.should.be.an('object');
      plugin.options.should.be.an('object');
    });
  });

  describe('up()', function (done) {
    it('closes the targeted container if allowAllClosed is true', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Accordion($html, { allowAllClosed: true });

      plugin.up($html.find('.accordion-content').eq(0));
      $html.find('.accordion-content').eq(0).should.have.attr('aria-hidden', 'true');
      $html.on('up.zf.accordion', function () {
        $html.find('.accordion-content').eq(0).should.be.hidden;
        done();
      });
    });

    it('toggles attributes of title of the targeted container', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Accordion($html, { allowAllClosed: true });

      plugin.up($html.find('.accordion-content').eq(0));
      $html.find('.accordion-title').eq(0).should.have.attr('aria-expanded', 'false');
      $html.find('.accordion-title').eq(0).should.have.attr('aria-selected', 'false');
    });

    it('not closes the open container if allowAllClosed is false', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Accordion($html, { allowAllClosed: false });

      plugin.up($html.find('.accordion-content').eq(0));
      $html.find('.accordion-content').eq(0).should.be.visible;
      // Element has aria-hidden="false" not set if it has not been actively toggled so far
      // Therefor check if it has not aria-hidden="true"
      $html.find('.accordion-content').eq(0).should.not.have.attr('aria-hidden', 'true');
    });
  });

  describe('down()', function () {
    it('opens the targeted container', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Accordion($html, {});

      plugin.down($html.find('.accordion-content').eq(1));
      $html.find('.accordion-content').eq(1).should.be.visible;
      $html.find('.accordion-content').eq(1).should.have.attr('aria-hidden', 'false');
    });

    it('toggles attributes of title of the targeted container', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Accordion($html, {});

      plugin.down($html.find('.accordion-content').eq(1));
      $html.find('.accordion-title').eq(1).should.have.attr('aria-expanded', 'true');
      $html.find('.accordion-title').eq(1).should.have.attr('aria-selected', 'true');
    });

    it('closes open container if multiExpand is false', function (done) {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Accordion($html, { multiExpand: false });

      plugin.down($html.find('.accordion-content').eq(1));
      $html.find('.accordion-content').eq(0).should.have.attr('aria-hidden', 'true');
      $html.on('up.zf.accordion', function () {
        $html.find('.accordion-content').eq(0).should.be.hidden;
        done();
      });
    });

    it('not closes open container if multiExpand is true', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Accordion($html, { multiExpand: true });

      plugin.down($html.find('.accordion-content').eq(1));
      $html.find('.accordion-content').eq(0).should.be.visible;
      // Element has aria-hidden="false" not set if it has not been actively toggled so far
      // Therefor check if it has not aria-hidden="true"
      $html.find('.accordion-content').eq(0).should.not.have.attr('aria-hidden', 'true');
    });
  });

  describe('toggle()', function (done) {
    it('closes the only open container if allowAllClosed is true', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Accordion($html, { allowAllClosed: true });

      plugin.toggle($html.find('.accordion-content').eq(0));
      $html.find('.accordion-content').eq(0).should.have.attr('aria-hidden', 'true');
      $html.on('up.zf.accordion', function () {
        $html.find('.accordion-content').eq(0).should.be.hidden;
        done();
      });
    });

    it('not closes the only open container if allowAllClosed is false', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Accordion($html, { allowAllClosed: false });

      plugin.toggle($html.find('.accordion-content').eq(0));
      $html.find('.accordion-content').eq(0).should.be.visible;
      $html.find('.accordion-content').eq(0).should.have.attr('aria-hidden', 'false');
    });
  });
});
'use strict';

describe('Accordion Menu', function () {
  var plugin;
  var $html;
  var template = '\n    <ul class="vertical menu">\n      <li>\n        <a href="#">Item 1</a>\n        <ul class="menu vertical nested">\n          <li>\n            <a href="#">Item 1A</a>\n            <ul class="menu vertical nested">\n              <li><a href="#">Item 1Ai</a></li>\n              <li><a href="#">Item 1Aii</a></li>\n              <li><a href="#">Item 1Aiii</a></li>\n            </ul>\n          </li>\n          <li><a href="#">Item 1B</a></li>\n          <li><a href="#">Item 1C</a></li>\n        </ul>\n      </li>\n      <li>\n        <a href="#">Item 2</a>\n        <ul class="menu vertical nested">\n          <li><a href="#">Item 2A</a></li>\n          <li><a href="#">Item 2B</a></li>\n        </ul>\n      </li>\n      <li><a href="#">Item 3</a></li>\n    </ul>';
  Foundation.AccordionMenu.defaults.slideSpeed = 0;

  afterEach(function () {
    plugin.destroy();
    $html.remove();
  });

  describe('constructor()', function () {
    it('stores the element and plugin options', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.AccordionMenu($html, {});

      plugin.$element.should.be.an('object');
      plugin.options.should.be.an('object');
    });
  });

  describe('up()', function () {
    it('closes the targeted submenu', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.AccordionMenu($html);

      // Open it first
      plugin.down($html.find('.is-accordion-submenu').eq(0));

      plugin.up($html.find('.is-accordion-submenu').eq(0));
      $html.find('.is-accordion-submenu').eq(0).should.be.hidden;
    });

    it('toggles attributes of title of the targeted container', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.AccordionMenu($html, {});

      // Open it first
      plugin.down($html.find('.is-accordion-submenu').eq(0));

      plugin.up($html.find('.is-accordion-submenu').eq(0));
      $html.find('.is-accordion-submenu-parent').eq(0).should.have.attr('aria-expanded', 'false');
    });

    it('fires up.zf.accordionMenu event', function (done) {
      $html = $(template).appendTo('body');
      plugin = new Foundation.AccordionMenu($html, { slideSpeed: 200 });

      // Open it first
      plugin.down($html.find('.is-accordion-submenu').eq(0));

      $html.on('up.zf.accordionMenu', function () {
        $html.find('.is-accordion-submenu').eq(0).should.be.hidden;
        done();
      });
      plugin.up($html.find('.is-accordion-submenu').eq(0));
    });
  });

  describe('down()', function () {
    it('opens the targeted submenu', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.AccordionMenu($html, {});

      plugin.down($html.find('.is-accordion-submenu').eq(0));
      $html.find('.is-accordion-submenu').eq(0).should.be.visible;
    });

    it('toggles attributes of title of the targeted submenu', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.AccordionMenu($html, {});

      plugin.down($html.find('.is-accordion-submenu').eq(0));
      $html.find('.is-accordion-submenu-parent').eq(0).should.have.attr('aria-expanded', 'true');
    });

    it('closes open submenu if multiOpen is false', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.AccordionMenu($html, { multiOpen: false });

      // Open another one first
      plugin.down($html.find('.is-accordion-submenu').eq(0));

      plugin.down($html.find('.is-accordion-submenu').eq(2));
      $html.find('.is-accordion-submenu').eq(0).should.be.hidden;
    });

    it('not closes open submenu if multiOpen is true', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.AccordionMenu($html, { multiOpen: true });

      // Open another one first
      plugin.down($html.find('.is-accordion-submenu').eq(0));

      plugin.down($html.find('.is-accordion-submenu').eq(2));
      $html.find('.is-accordion-submenu').eq(0).should.be.visible;
    });

    it('fires down.zf.accordionMenu event', function (done) {
      $html = $(template).appendTo('body');
      plugin = new Foundation.AccordionMenu($html, { slideSpeed: 200 });

      $html.on('down.zf.accordionMenu', function () {
        $html.find('.is-accordion-submenu').eq(0).should.be.visible;
        done();
      });
      plugin.down($html.find('.is-accordion-submenu').eq(0));
    });
  });

  describe('toggle()', function () {
    it('opens a closed container', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.AccordionMenu($html, {});

      plugin.toggle($html.find('.is-accordion-submenu').eq(0));
      $html.find('.is-accordion-submenu').eq(0).should.be.visible;
    });

    it('closes an open container', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.AccordionMenu($html, {});

      // Open first
      plugin.down($html.find('.is-accordion-submenu').eq(0));

      plugin.toggle($html.find('.is-accordion-submenu').eq(0));
      $html.find('.is-accordion-submenu').eq(0).should.be.hidden;
    });
  });

  describe('hideAll()', function () {
    it('closes all accordions', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.AccordionMenu($html, {});

      // Open some first
      plugin.down($html.find('.is-accordion-submenu').eq(0));
      plugin.down($html.find('.is-accordion-submenu').eq(1));
      plugin.down($html.find('.is-accordion-submenu').eq(2));

      plugin.hideAll();

      $html.find('[data-submenu]').each(function () {
        $(this).should.be.hidden;
      });
    });
  });
});
'use strict';

describe('Drilldown Menu', function () {
  var plugin;
  var $html;
  var template = '<ul class="menu" data-drilldown style="width: 200px" id="m1">\n    <li>\n      <a href="#">Item 1</a>\n      <ul class="menu">\n        <li>\n          <a href="#">Item 1A</a>\n          <ul class="menu">\n            <li><a href="#Item-1Aa">Item 1Aa</a></li>\n            <li><a href="#Item-1Ba">Item 1Ba</a></li>\n          </ul>\n        </li>\n        <li><a href="#Item-1B">Item 1B</a></li>\n        <li><a href="#Item-1C">Item 1C</a></li>\n      </ul>\n    </li>\n    <li>\n      <a href="#">Item 2</a>\n      <ul class="menu">\n        <li><a href="#Item-2A">Item 2A</a></li>\n        <li><a href="#Item-2B">Item 2B</a></li>\n      </ul>\n    </li>\n    <li><a href="#Item-3"> Item 3</a></li>\n  </ul>';

  afterEach(function () {
    plugin.destroy();
    $html.remove();
  });

  describe('constructor()', function () {
    it('stores the element and plugin options', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Drilldown($html, {});

      plugin.$element.should.be.an('object');
      plugin.options.should.be.an('object');
    });
  });

  describe('init()', function () {
    it('stores additional elements', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Drilldown($html, {});

      plugin.$submenuAnchors.should.be.an('object');
      plugin.$submenus.should.be.an('object');
      plugin.$menuItems.should.be.an('object');
    });
  });

  describe('prepareMenu()', function () {
    it('wraps the submenus', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Drilldown($html, {});
    });
    it('adds ARIA attributes', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Drilldown($html, {});

      plugin.$element.find('[data-submenu]').each(function () {
        $(this).should.have.attr('role', 'menu');
        $(this).should.have.attr('aria-hidden', 'true');
      });

      plugin.$element.find('.is-drilldown-submenu-parent').each(function () {
        $(this).should.have.attr('aria-haspopup', 'true');
        $(this).should.have.attr('aria-expanded', 'false');
        $(this).should.have.attr('aria-label', $(this).children('a').first().text());
      });
    });
  });

  describe('show()', function () {
    it('shows the given submenu', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Drilldown($html, {});

      plugin._show($html.find('li.is-drilldown-submenu-parent').eq(0));

      // Checking with .be.hidden is not possible because they don't have display: block but z-index: -1
      $html.find('li.is-drilldown-submenu-parent').eq(0).find('ul').should.have.class('is-active');
    });
    it('toggles ARIA attributes', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Drilldown($html, {});

      plugin._show($html.find('li.is-drilldown-submenu-parent').eq(0));

      $html.find('li.is-drilldown-submenu-parent').eq(0).should.have.attr('aria-expanded', 'true');
      $html.find('li.is-drilldown-submenu-parent').eq(0).children('ul').should.have.attr('aria-hidden', 'false');
    });
    it('fires open.zf.drilldown event', function (done) {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Drilldown($html, {});

      $html.on('open.zf.drilldown', function () {
        // Checking with .be.hidden is not possible because they don't have display: block but z-index: -1
        $html.find('li.is-drilldown-submenu-parent').eq(0).find('ul').should.have.class('is-active');
        done();
      });

      plugin._show($html.find('li.is-drilldown-submenu-parent').eq(0));
    });
  });

  describe('hide()', function () {
    it('hides the given submenu', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Drilldown($html, {});

      // Open it first
      plugin._show($html.find('li.is-drilldown-submenu-parent').eq(0));

      plugin._hide($html.find('li.is-drilldown-submenu-parent').eq(0).children('ul'));

      // Checking with .be.hidden is not possible because they don't have display: block but z-index: -1
      $html.find('li.is-drilldown-submenu-parent').eq(0).children('ul').should.have.class('is-closing');
    });
    it('toggles ARIA attributes', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Drilldown($html, {});

      // Open it first
      plugin._show($html.find('li.is-drilldown-submenu-parent').eq(0));

      plugin._hide($html.find('li.is-drilldown-submenu-parent').eq(0).children('ul'));

      $html.find('li.is-drilldown-submenu-parent').eq(0).should.have.attr('aria-expanded', 'false');
      $html.find('li.is-drilldown-submenu-parent').eq(0).children('ul').should.have.attr('aria-hidden', 'true');
    });
    it('fires hide.zf.drilldown event', function (done) {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Drilldown($html, {});

      // Open it first
      plugin._show($html.find('li.is-drilldown-submenu-parent').eq(0));

      $html.on('hide.zf.drilldown', function () {
        // Checking with .be.hidden is not possible because they don't have display: block but z-index: -1
        $html.find('li.is-drilldown-submenu-parent').eq(0).children('ul').should.have.class('is-closing');
        done();
      });

      plugin._hide($html.find('li.is-drilldown-submenu-parent').eq(0).children('ul'));
    });
  });

  describe('hideAll()', function () {
    it('hides all submenus', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Drilldown($html, {});

      // Open one first
      plugin._show($html.find('li.is-drilldown-submenu-parent').eq(2));

      plugin._hideAll();

      $html.find('ul[data-submenu].is-active').each(function () {
        // Checking with .be.hidden is not possible because they don't have display: block but z-index: -1
        $(this).should.have.class('is-closing');
      });
    });
    it('fires closed.zf.drilldown event', function (done) {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Drilldown($html, {});

      // Open one first
      plugin._show($html.find('li.is-drilldown-submenu-parent').eq(2));

      $html.one('closed.zf.drilldown', function () {
        $html.find('ul[data-submenu].is-active').each(function () {
          // Checking with .be.hidden is not possible because they don't have display: block but z-index: -1
          $(this).should.have.class('is-closing');
        });
        done();
      });

      plugin._hideAll();
    });
  });

  describe('back()', function () {
    it('hides current submenu', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Drilldown($html, {});

      // Open one first
      plugin._show($html.find('li.is-drilldown-submenu-parent').eq(1));

      $html.find('li.is-drilldown-submenu-parent').eq(1).children('ul').children('.js-drilldown-back').trigger('click');

      // Checking with .be.hidden is not possible because they don't have display: block but z-index: -1
      $html.find('li.is-drilldown-submenu-parent').eq(1).children('ul').should.have.class('is-closing');
    });
    it('shows parent submenu', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Drilldown($html, {});

      // Open one first
      plugin._show($html.find('li.is-drilldown-submenu-parent').eq(1));

      $html.find('li.is-drilldown-submenu-parent').eq(1).children('ul').children('.js-drilldown-back').trigger('click');

      // Checking with .be.hidden is not possible because they don't have display: block but z-index: -1
      $html.find('li.is-drilldown-submenu-parent').eq(0).children('ul').should.have.class('is-active');
    });
  });
});
'use strict';

describe('Dropdown', function () {
  var plugin = void 0;
  var $dropdownController = void 0;
  var $dropdownContainer = void 0;

  var getDropdownController = function getDropdownController() {
    var buttonClasses = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return '<button class="' + buttonClasses + '" type="button" data-toggle="my-dropdown">toggle</button>';
  };
  var getDropdownContainer = function getDropdownContainer() {
    var dropdownClasses = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return '<div class="' + dropdownClasses + '" data-dropdown id="my-dropdown">Dropdown</div>';
  };

  afterEach(function () {
    plugin.destroy();
    $dropdownController.remove();
    $dropdownContainer.remove();
  });

  describe('constructor()', function () {
    it('stores the element & plugin options', function () {
      $dropdownController = $(getDropdownController()).appendTo('body');
      $dropdownContainer = $(getDropdownContainer()).appendTo('body');
      plugin = new Foundation.Dropdown($dropdownContainer, {});

      plugin.$element.should.be.an('object');
      plugin.options.should.be.an('object');
    });
  });

  describe('open()', function () {
    it('traps focus if trapFocus option is true', function () {
      $dropdownController = $(getDropdownController()).appendTo('body');
      $dropdownContainer = $(getDropdownContainer()).appendTo('body');
      plugin = new Foundation.Dropdown($dropdownContainer, { trapFocus: true });

      var spy = sinon.spy(Foundation.Keyboard, 'trapFocus');
      plugin.open();

      sinon.assert.called(spy);
      Foundation.Keyboard.trapFocus.restore();
    });
  });

  describe('close()', function () {
    it('releases focus if trapFocus option is true', function () {
      $dropdownController = $(getDropdownController()).appendTo('body');
      $dropdownContainer = $(getDropdownContainer()).appendTo('body');
      plugin = new Foundation.Dropdown($dropdownContainer, { trapFocus: true });

      // Open it first...
      plugin.open();

      var spy = sinon.spy(Foundation.Keyboard, 'releaseFocus');
      plugin.close();

      sinon.assert.called(spy);
      Foundation.Keyboard.releaseFocus.restore();
    });
  });

  describe('getPositionClass()', function () {
    it('has no orientation', function () {
      $dropdownController = $(getDropdownController()).appendTo('body');
      $dropdownContainer = $(getDropdownContainer()).appendTo('body');
      plugin = new Foundation.Dropdown($dropdownContainer, {});

      plugin.getPositionClass().trim().should.equal('');
    });

    it('has vertical position', function () {
      $dropdownController = $(getDropdownController()).appendTo('body');
      $dropdownContainer = $(getDropdownContainer('custom-style-before bottom custom-style-after')).appendTo('body');
      plugin = new Foundation.Dropdown($dropdownContainer, {});

      plugin.getPositionClass().trim().should.equal('bottom');
    });

    it('has horizontal position', function () {
      $dropdownController = $(getDropdownController('custom-style-before float-right custom-style-after')).appendTo('body');
      $dropdownContainer = $(getDropdownContainer()).appendTo('body');
      plugin = new Foundation.Dropdown($dropdownContainer, {});

      plugin.getPositionClass().trim().should.equal('right');
    });

    it('has horizontal position and only one class', function () {
      $dropdownController = $(getDropdownController('float-right')).appendTo('body');
      $dropdownContainer = $(getDropdownContainer()).appendTo('body');
      plugin = new Foundation.Dropdown($dropdownContainer, {});

      plugin.getPositionClass().trim().should.equal('right');
    });
  });
});
'use strict';

describe('Dropdown Menu', function () {
	var plugin;
	var $html;

	// afterEach(function() {
	// 	plugin.destroy();
	// 	$html.remove();
	// });

	describe('constructor()', function () {
		// it('', function() {
		// 	$html = $('').appendTo('body');
		// 	plugin = new Foundation.DropdownMenu($html, {});

		// 	plugin.$element.should.be.an('object');
		// 	plugin.options.should.be.an('object');
		// });
	});
});
'use strict';

describe('Equalizer', function () {
	var plugin;
	var $html;

	// afterEach(function() {
	// 	plugin.destroy();
	// 	$html.remove();
	// });

	describe('constructor()', function () {
		// it('', function() {
		// 	$html = $('').appendTo('body');
		// 	plugin = new Foundation.Equalizer($html, {});

		// 	plugin.$element.should.be.an('object');
		// 	plugin.options.should.be.an('object');
		// });
	});
});
'use strict';

describe('Orbit', function () {
  var plugin;
  var $html;
  var template = '<div class="orbit" role="region" aria-label="Favorite Space Pictures" data-orbit>\n    <ul class="orbit-container">\n      <button class="orbit-previous"><span class="show-for-sr">Previous Slide</span>&#9664;&#xFE0E;</button>\n      <button class="orbit-next"><span class="show-for-sr">Next Slide</span>&#9654;&#xFE0E;</button>\n      <li class="is-active orbit-slide">\n        Slide #1 content.\n      </li>\n      <li class="orbit-slide">\n        Slide #2 content.\n      </li>\n      <li class="orbit-slide">\n        Slide #3 content.\n      </li>\n      <li class="orbit-slide">\n        Slide #4 content.\n      </li>\n    </ul>\n    <nav class="orbit-bullets">\n      <button class="is-active" data-slide="0"><span class="show-for-sr">First slide details.</span><span class="show-for-sr">Current Slide</span></button>\n      <button data-slide="1"><span class="show-for-sr">Second slide details.</span></button>\n      <button data-slide="2"><span class="show-for-sr">Third slide details.</span></button>\n      <button data-slide="3"><span class="show-for-sr">Fourth slide details.</span></button>\n    </nav>\n  </div>';
  Foundation.Orbit.defaults.useMUI = false;

  afterEach(function () {
    plugin.destroy();
    $html.remove();
  });

  describe('constructor()', function () {
    it('stores the element and plugin options', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Orbit($html, {});

      plugin.$element.should.be.an('object');
      plugin.$wrapper.should.be.an('object');
      plugin.$slides.should.be.an('object');
      plugin.options.should.be.an('object');
    });
  });

  describe('init()', function () {
    it('shows the first slide', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Orbit($html, {});

      $html.find('.orbit-slide').eq(0).should.be.visible;
    });
    it('hides all slides except the first one', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Orbit($html, {});

      $html.find('.orbit-slide').each(function (index) {
        if (index === 0) {
          return;
        } // Not for the first one as this is visible
        $(this).should.be.hidden;
      });
    });
    it('makes slide with is-active class active initially', function () {
      $html = $(template).appendTo('body');
      $html.find('.orbit-slide.is-active').removeClass('is-active');
      $html.find('.orbit-slide').eq(2).addClass('is-active');
      plugin = new Foundation.Orbit($html, {});

      $html.find('.orbit-slide').eq(2).should.be.visible;
    });
  });

  describe('loadBullets()', function () {
    it('stores the bullets', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Orbit($html, {});

      plugin.$bullets.should.be.an('object');
    });
  });

  describe('changeSlide()', function () {
    it('changes slides to the next one for ltr is true', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Orbit($html, {});

      plugin.changeSlide(true);

      $html.find('.orbit-slide').eq(0).should.be.hidden;
      $html.find('.orbit-slide').eq(1).should.be.visible;
    });
    it('changes slides to the last one for ltr is false', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Orbit($html, {});

      plugin.changeSlide(false);

      $html.find('.orbit-slide').eq(0).should.not.have.class('is-active');
      $html.find('.orbit-slide').eq(-1).should.have.class('is-active');
    });
    it('changes slides to the chosen one', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Orbit($html, {});

      plugin.changeSlide(true, $html.find('.orbit-slide').eq(2), 2);

      $html.find('.orbit-slide').eq(0).should.be.hidden;
      $html.find('.orbit-slide').eq(2).should.be.visible;
    });
    it('toggles ARIA attributes', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Orbit($html, {});

      plugin.changeSlide(true);

      $html.find('.orbit-slide').eq(0).should.not.have.attr('aria-live');
      $html.find('.orbit-slide').eq(1).should.have.attr('aria-live', 'polite');
    });
    it('fires beforeslidechange.zf.orbit event', function (done) {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Orbit($html, {});

      $html.on('beforeslidechange.zf.orbit', function () {
        // Old slide should still be active
        $html.find('.orbit-slide').eq(0).should.be.visible;
        done();
      });
      plugin.changeSlide(true);
    });
    it('fires slidechange.zf.orbit event', function (done) {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Orbit($html, {});

      $html.on('slidechange.zf.orbit', function () {
        // New slide is already active
        $html.find('.orbit-slide').eq(1).should.be.visible;
        done();
      });
      plugin.changeSlide(true);
    });
  });

  describe('updateBullets()', function () {
    it('updates the bullets', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Orbit($html, {});

      plugin.changeSlide(true);

      $html.find('.orbit-bullets [data-slide]').eq(0).should.not.have.class('is-active');
      $html.find('.orbit-bullets [data-slide]').eq(1).should.have.class('is-active');
    });
  });

  describe('events()', function () {
    it('changes slides on bullet click', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Orbit($html, {});

      $html.find('.orbit-bullets [data-slide]').eq(2).trigger('click');

      $html.find('.orbit-slide').eq(0).should.be.hidden;
      $html.find('.orbit-slide').eq(2).should.be.visible;
    });
    it('changes slides to the previous one', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Orbit($html, {});

      $html.find('.orbit-previous').trigger('click');

      $html.find('.orbit-slide').eq(0).should.be.hidden;
      $html.find('.orbit-slide').eq(-1).should.be.visible;
    });
    it('changes slides to the next one', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Orbit($html, {});

      $html.find('.orbit-next').trigger('click');

      $html.find('.orbit-slide').eq(0).should.be.hidden;
      $html.find('.orbit-slide').eq(1).should.be.visible;
    });
  });

  describe('geoSync()', function () {
    it('changes slides automatically based on timerDelay option', function (done) {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Orbit($html, { timerDelay: 200 });

      setTimeout(function () {
        $html.find('.orbit-slide').eq(0).should.be.hidden;
        $html.find('.orbit-slide').eq(1).should.be.visible;
        done();
      }, 201);
    });
  });
});
'use strict';

describe('Responsive Menu', function () {
	var plugin;
	var $html;

	// afterEach(function() {
	// 	plugin.destroy();
	// 	$html.remove();
	// });

	describe('constructor()', function () {
		// it('', function() {
		// 	$html = $('').appendTo('body');
		// 	plugin = new Foundation.ResponsiveMenu($html, {});

		// 	plugin.$element.should.be.an('object');
		// 	plugin.options.should.be.an('object');
		// });
	});
});
'use strict';

describe('Responsive Toggle', function () {
	var plugin;
	var $html;

	// afterEach(function() {
	// 	plugin.destroy();
	// 	$html.remove();
	// });

	describe('constructor()', function () {
		// it('', function() {
		// 	$html = $('').appendTo('body');
		// 	plugin = new Foundation.ResponsiveToggle($html, {});

		// 	plugin.$element.should.be.an('object');
		// 	plugin.options.should.be.an('object');
		// });
	});
});
'use strict';

describe('Reveal', function () {
  var plugin;
  var $html;
  var template = '<div class="reveal" id="exampleModal1" data-reveal>\n\t  Modal content\n\t  <button class="close-button" data-close aria-label="Close modal" type="button">\n\t    <span aria-hidden="true">&times;</span>\n\t  </button>\n\t</div>';

  afterEach(function () {
    plugin.destroy();
    $html.remove();
  });

  describe('constructor()', function () {
    it('stores the element and plugin options', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Reveal($html, {});

      plugin.$element.should.be.an('object');
      plugin.options.should.be.an('object');
    });
  });

  describe('init()', function () {
    it('sets ARIA attributes for modal', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Reveal($html, {});

      $html.should.have.attr('aria-hidden', 'true');
      $html.should.have.attr('role', 'dialog');
    });

    it('detects anchor if one exists', function () {
      $html = $(template).appendTo('body');
      var $anchor = $('<button data-open="exampleModal1">Open</button>').appendTo('body');
      plugin = new Foundation.Reveal($html, {});

      plugin.$anchor[0].should.be.equal($anchor[0]);

      $anchor.remove();
    });

    it('sets ARIA attributes for anchor if one exists', function () {
      $html = $(template).appendTo('body');
      var $anchor = $('<button data-open="exampleModal1">Open</button>').appendTo('body');
      plugin = new Foundation.Reveal($html, {});

      $anchor.should.have.attr('aria-haspopup', 'true');
      $anchor.should.have.attr('aria-controls', $html.attr('id'));

      $anchor.remove();
    });
  });

  describe('makeOverlay()', function () {
    it('creates an overlay if overlay option is true', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Reveal($html, { overlay: true });

      plugin.$overlay.should.be.an('object');
      plugin.$overlay.should.have.class('reveal-overlay');
      $.contains(document.body, plugin.$overlay[0]).should.be.true;
    });
  });

  describe('open()', function () {
    it('opens the modal', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Reveal($html, {});

      plugin.open();

      $html.should.be.visible;
    });
    it('opens the overlay', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Reveal($html, { overlay: true });

      plugin.open();

      plugin.$overlay.should.be.visible;
    });
    it('toggles ARIA attributes', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Reveal($html, {});

      plugin.open();

      $html.should.have.attr('aria-hidden', 'false');
      $html.should.have.attr('tabindex', '-1');
    });
    it('adds class to body', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Reveal($html, {});

      plugin.open();

      $('body').should.have.class('is-reveal-open');
    });
    // TODO: Check if  this.$element.trigger('closeme.zf.reveal', this.id) is correctly used.

    // it('closes previously opened modal if multipleOpened option is false', function(done) {
    //   $html = $(template).appendTo('body');
    //   $html2 = $(template).attr('id', 'exampleModal2').appendTo('body');

    //   plugin = new Foundation.Reveal($html, {multipleOpened: false});
    //   plugin2 = new Foundation.Reveal($html2, {multipleOpened: false});

    //   plugin.open();

    //   plugin2.open();

    //   $html.should.be.hidden;

    //   plugin2.destroy();
    //   $html2.remove();
    // });
    it('fires open.zf.reveal event', function (done) {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Reveal($html, {});

      $html.on('open.zf.reveal', function () {
        $html.should.be.visible;
        done();
      });

      plugin.open();
    });

    it('traps focus if trapFocus option is true', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Reveal($html, { trapFocus: true });

      var spy = sinon.spy(Foundation.Keyboard, 'trapFocus');
      plugin.open();

      sinon.assert.called(spy);
      Foundation.Keyboard.trapFocus.restore();
    });
  });

  describe('close()', function () {
    it('closes the modal', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Reveal($html, {});

      // Open it first
      plugin.open();

      plugin.close();

      $html.should.be.hidden;
    });
    it('closes the overlay', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Reveal($html, { overlay: true });

      // Open it first
      plugin.open();

      plugin.close();

      plugin.$overlay.should.be.hidden;
    });
    it('toggles ARIA attributes', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Reveal($html, {});

      // Open it first
      plugin.open();

      plugin.close();

      $html.should.have.attr('aria-hidden', 'true');
    });
    it('removes class from body', function (done) {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Reveal($html, {});

      // Open it first
      plugin.open();

      $html.on('closed.zf.reveal', function () {
        //$('body').should.not.have.class('is-reveal-open');
        $html.should.not.have.class('is-reveal-open');
        done();
      });

      plugin.close();
    });
    it('does not remove class from body if another reveal is open', function (done) {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Reveal($html, { multipleOpened: true });

      var $html2 = $(template).attr('id', 'exampleModal2').appendTo('body');
      var plugin2 = new Foundation.Reveal($html2, { multipleOpened: true, vOffset: 10 });

      // Open both first
      plugin.open();
      plugin2.open();

      $html.on('closed.zf.reveal', function () {

        $('body').should.have.class('is-reveal-open');
        plugin2.destroy();
        $html2.remove();
        done();
      });

      plugin.close();
    });
    it('fires closed.zf.reveal event', function (done) {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Reveal($html, {});

      // Open it first
      plugin.open();

      $html.on('closed.zf.reveal', function () {
        $html.should.be.hidden;
        done();
      });

      plugin.close();
    });

    it('releases focus if trapFocus option is true', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Reveal($html, { trapFocus: true });

      // Open it first
      plugin.open();

      var spy = sinon.spy(Foundation.Keyboard, 'releaseFocus');
      plugin.close();

      sinon.assert.called(spy);
      Foundation.Keyboard.releaseFocus.restore();
    });
  });

  describe('toggle()', function () {
    it('opens a closed modal', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Reveal($html, { overlay: true });

      plugin.open();

      plugin.$overlay.should.be.visible;
    });
    it('closes an open modal', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Reveal($html, {});

      // Open it first
      plugin.open();

      plugin.close();

      $html.should.be.hidden;
    });
  });

  describe('events()', function () {
    it('opens the modal on anchor click', function () {
      $html = $(template).appendTo('body');
      var $anchor = $('<button data-open="exampleModal1">Open</button>').appendTo('body');
      plugin = new Foundation.Reveal($html, {});

      $anchor.trigger('click');

      plugin.$overlay.should.be.visible;
      $anchor.remove();
    });
    it('closes a modal on overlay click if closeOnClick option is true', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Reveal($html, { overlay: true, closeOnClick: true });

      // Open it first
      plugin.open();

      plugin.$overlay.trigger('click');

      $html.should.be.hidden;
    });
    it('not closes a modal on overlay click if closeOnClick option is true', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Reveal($html, { overlay: true, closeOnClick: false });

      // Open it first
      plugin.open();

      plugin.$overlay.trigger('click');

      $html.should.be.visible;
    });
  });
});
'use strict';

describe('Slider', function () {
  var plugin;
  var $html;
  var template = '<div class="slider" data-slider>\n      <span class="slider-handle" data-slider-handle role="slider" tabindex="1"></span>\n      <span class="slider-fill" data-slider-fill></span>\n      <input type="hidden">\n    </div>';

  Foundation.Slider.defaults.moveTime = 0;
  Foundation.Slider.defaults.changedDelay = 0;

  afterEach(function (done) {
    // Timeout needed because even with changeDelay = 0 the changed.zf.slider event may be fired after this hook
    plugin.destroy();
    $html.remove();
    done();
  });

  describe('constructor()', function () {
    it('stores the element and plugin options', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Slider($html, {});

      plugin.$element.should.be.an('object');
      plugin.options.should.be.an('object');
    });
  });

  describe('init()', function () {
    it('stores handle, inout and fill elements', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Slider($html, {});

      plugin.$handle.should.be.an('object');
      plugin.$input.should.be.an('object');
      plugin.$fill.should.be.an('object');
    });
    it('stores two handle and input elements for two sided slider', function () {
      $html = $(template).append('<span class="slider-handle" data-slider-handle role="slider" tabindex="1"></span><input type="hidden">').appendTo('body');
      plugin = new Foundation.Slider($html, { doubleSided: true });

      plugin.$handle2.should.be.an('object');
      plugin.$input2.should.be.an('object');
    });
    it('is disabled when disable option is true', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Slider($html, { disabled: true });

      $html.should.have.class('disabled');
    });
  });

  describe('setHandlePos()', function () {
    it('positions the handle', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Slider($html, {});

      plugin._setHandlePos(plugin.$handle, 10, true);

      plugin.$handle[0].style.left.should.not.be.equal('');
    });
    it('does nothing if disabled option is true', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Slider($html, { disabled: true });

      plugin._setHandlePos(plugin.$handle, 10, true);

      plugin.$handle[0].style.left.should.be.equal('');
    });
    it('fires changed.zf.slider event', function (done) {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Slider($html, { changedDelay: 50 });

      $html.on('changed.zf.slider', function (e, $handle) {
        $handle[0].should.be.equal(plugin.$handle[0]);
        done();
      });

      // Rapidly change to see if event fires only once

      var _loop = function _loop(i) {
        setTimeout(function () {
          plugin._setHandlePos(plugin.$handle, i * 10, true);
        }, i * 20);
      };

      for (var i = 0; i < 5; i++) {
        _loop(i);
      }
    });
    it('fires moved.zf.slider event', function (done) {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Slider($html, {});

      var timesCallbackCalled = 0;
      $html.on('moved.zf.slider', function (e, $handle) {
        if (++timesCallbackCalled === 5) {
          $handle[0].should.be.equal(plugin.$handle[0]);
          done();
        }
      });

      // Rapidly change to see if event fires multiple times

      var _loop2 = function _loop2(i) {
        setTimeout(function () {
          plugin._setHandlePos(plugin.$handle, i * 10, true);
        }, i * 20);
      };

      for (var i = 0; i < 5; i++) {
        _loop2(i);
      }
    });
  });

  describe('setValues()', function () {
    it('updates ARIA attributes', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Slider($html, {});

      plugin._setValues(plugin.$handle, 10);

      plugin.$handle.should.have.attr('aria-valuenow', '10');
    });
    it('updates input value', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Slider($html, {});

      plugin._setValues(plugin.$handle, 10);

      plugin.$input.val().should.have.be.equal('10');
    });
  });

  describe('setInitAttr()', function () {
    it('adds ARIA attributes to handle', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Slider($html, {
        initialStart: 50,
        end: 70,
        start: 20,
        vertical: true
      });

      plugin.$handle.should.have.attr('role', 'slider');
      plugin.$handle.should.have.attr('aria-controls', plugin.$handle.attr('id'));
      plugin.$handle.should.have.attr('aria-valuemax', '70');
      plugin.$handle.should.have.attr('aria-valuemin', '20');
      plugin.$handle.should.have.attr('aria-valuenow', '50');
      plugin.$handle.should.have.attr('aria-orientation', 'vertical');
      plugin.$handle.should.have.attr('tabindex', '0');
    });
    it('adds attributes to input', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Slider($html, {});

      plugin.$input.should.have.attr('max', '100');
      plugin.$input.should.have.attr('min', '0');
      plugin.$input.should.have.attr('step', '1');
    });
  });
});
'use strict';

describe('Sticky', function () {
	var plugin;
	var $html;

	// afterEach(function() {
	// 	plugin.destroy();
	// 	$html.remove();
	// });

	describe('constructor()', function () {
		// it('', function() {
		// 	$html = $('').appendTo('body');
		// 	plugin = new Foundation.Sticky($html, {});

		// 	plugin.$element.should.be.an('object');
		// 	plugin.options.should.be.an('object');
		// });
	});
});
'use strict';

describe('Tabs', function () {
  var plugin;
  var $html;
  var template = '\n    <div>\n      <ul class="tabs" data-tabs id="example-tabs">\n        <li class="tabs-title is-active"><a href="#panel1" aria-selected="true">Tab 1</a></li>\n        <li class="tabs-title"><a href="#panel2">Tab 2</a></li>\n        <li class="tabs-title"><a href="#panel3">Tab 3</a></li>\n      </ul>\n\n      <div class="tabs-content" data-tabs-content="example-tabs">\n        <div class="tabs-panel is-active" id="panel1">\n          <p>one</p>\n          <p>Check me out! I\'m a super cool Tab panel with text content!</p>\n        </div>\n        <div class="tabs-panel" id="panel2">\n          <p>two</p>\n          <p>Check me out! I\'m a super cool Tab panel with text content!</p>\n        </div>\n        <div class="tabs-panel" id="panel3">\n          <p>three</p>\n          <p>Check me out! I\'m a super cool Tab panel with text content!</p>\n        </div>\n      </div>\n    </div>';

  afterEach(function () {
    plugin.destroy();
    $html.remove();
  });

  describe('constructor()', function () {
    it('stores the element and plugin options', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Tabs($html.find('[data-tabs]'), {});

      plugin.$element.should.be.an('object');
      plugin.options.should.be.an('object');
    });
  });

  describe('init()', function () {
    it('sets ARIA attributes', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Tabs($html.find('[data-tabs]'), {});

      // Panels
      $html.find('#panel1').should.have.attr('role', 'tabpanel');
      $html.find('#panel1').should.have.attr('aria-labelledby', $html.find('[href="#panel1"]').attr('id'));
      $html.find('#panel1').should.have.attr('aria-hidden', 'false');
      $html.find('#panel2').should.have.attr('aria-hidden', 'true');

      // Links
      $html.find('[href="#panel1"]').should.have.attr('role', 'tab');
      $html.find('[href="#panel1"]').should.have.attr('aria-controls', $html.find('panel1').attr('id'));
      $html.find('[href="#panel1"]').should.have.attr('aria-selected', 'true');
      $html.find('[href="#panel2"]').should.have.attr('aria-selected', 'false');

      // Tab list items
      $html.find('[href="#panel1"]').parent().should.have.attr('role', 'presentation');
    });
  });

  describe('selectTab()', function () {
    it('opens the selected tab via jQuery element', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Tabs($html.find('[data-tabs]'), {});

      plugin.selectTab($html.find('#panel2'));
      $html.find('#panel2').should.be.visible;
    });

    it('opens the selected tab via id string', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Tabs($html.find('[data-tabs]'), {});

      plugin.selectTab('#panel2');
      $html.find('#panel2').should.be.visible;
    });
  });

  describe('_handleTabChange()', function () {
    it('opens the selected tab', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Tabs($html.find('[data-tabs]'), {});

      plugin.selectTab('#panel2');
      $html.find('#panel2').should.be.visible;
      $html.find('#panel2').should.have.class('is-active');
    });

    it('sets ARIA attributes for open tab', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Tabs($html.find('[data-tabs]'), {});

      plugin.selectTab('#panel2');
      $html.find('#panel2').should.have.attr('aria-hidden', 'false');
      $html.find('[href="#panel2"]').should.have.attr('aria-selected', 'true');
    });

    it('hides the open tab', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Tabs($html.find('[data-tabs]'), {});

      plugin.selectTab('#panel2');

      //$html.find('#panel1').should.be.hidden;
      $html.find('#panel1').should.not.have.class('is-active');
    });

    it('sets ARIA attributes for closed tab', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Tabs($html.find('[data-tabs]'), {});

      plugin.selectTab('#panel2');
      $html.find('#panel1').should.be.have.attr('aria-hidden', 'true');
      $html.find('[href="#panel1"]').should.be.have.attr('aria-selected', 'false');
    });

    it('fires change.zf.tabs event with target as data', function (done) {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Tabs($html.find('[data-tabs]'), {});

      $html.one('change.zf.tabs', function (e, $target) {
        e.stopPropagation();
        $html.find('[href="#panel2"]').parent()[0].should.be.equal($target[0]);
        done();
      });

      plugin.selectTab('#panel2');
    });
  });
});
'use strict';

describe('Toggler', function () {
  var plugin;
  var $html;

  afterEach(function () {
    plugin.destroy();
    $html.remove();
  });

  describe('constructor()', function () {
    it('stores the element and plugin options', function () {
      $html = $('<div id="toggler" data-toggler="class"></div>').appendTo('body');
      plugin = new Foundation.Toggler($html, {});

      plugin.$element.should.be.an('object');
      plugin.options.should.be.an('object');
    });
  });

  describe('init()', function () {
    it('stores the class defined on the data-toggler attribute', function () {
      $html = $('<div id="toggler" data-toggler="class"></div>').appendTo('body');
      plugin = new Foundation.Toggler($html, {});

      plugin.className.should.equal('class');
    });

    it('stores the class defined on the data-toggler attribute (with leading dot)', function () {
      $html = $('<div id="toggler" data-toggler=".class"></div>').appendTo('body');
      plugin = new Foundation.Toggler($html, {});

      plugin.className.should.equal('class');
    });

    it('stores defined animation classes', function () {
      $html = $('<div id="toggler" data-toggler data-animate="fade-in fade-out"></div>').appendTo('body');
      plugin = new Foundation.Toggler($html, {});

      plugin.animationIn.should.equal('fade-in');
      plugin.animationOut.should.equal('fade-out');
    });

    it('adds Aria attributes to click triggers', function () {
      $html = $('<div id="toggler" data-toggler="class"></div>').appendTo('body');
      var $triggers = $('<div>\n          <a data-open="toggler">Open</a>\n          <a data-close="toggler">Close</a>\n          <a data-toggle="toggler">Toggle</a>\n        </div>').appendTo('body');
      plugin = new Foundation.Toggler($html, {});

      $triggers.find('[data-open]').should.have.attr('aria-controls', 'toggler');
      $triggers.find('[data-close]').should.have.attr('aria-controls', 'toggler');
      $triggers.find('[data-toggle]').should.have.attr('aria-controls', 'toggler');

      $triggers.remove();
    });

    it('sets aria-expanded to true if the element is visible', function () {
      $html = $('<div id="toggler" data-toggler="class"></div>').appendTo('body');
      plugin = new Foundation.Toggler($html, {});

      $('#toggler').should.have.attr('aria-expanded', 'true');
    });

    it('sets aria-expanded to false if the element is invisible', function () {
      var $css = $('<style>#toggler { display: none }</style>').appendTo('body');
      $html = $('<div id="toggler" data-toggler="class"></div>').appendTo('body');
      plugin = new Foundation.Toggler($html, {});

      $('#toggler').should.have.attr('aria-expanded', 'false');
      $css.remove();
    });
  });

  describe('toggle()', function () {
    it('calls Toggler._toggleClass() if the element toggles with a class');
    it('calls Toggler._toggleAnimate() if the element toggles with animation');
  });

  describe('toggleClass()', function () {
    it('toggles a class on the element', function () {
      $html = $('<div id="toggler" data-toggler="class"></div>').appendTo('body');
      plugin = new Foundation.Toggler($html, {});

      plugin._toggleClass();
      $('#toggler').should.have.class('class');

      plugin._toggleClass();
      $('#toggler').should.not.have.class('class');
    });

    it('updates aria-expanded after the class is toggled', function () {
      $html = $('<div id="toggler" data-toggler="class"></div>').appendTo('body');
      plugin = new Foundation.Toggler($html, {});

      plugin._toggleClass();
      $('#toggler').should.have.attr('aria-expanded', 'true');

      plugin._toggleClass();
      $('#toggler').should.have.attr('aria-expanded', 'false');
    });
  });

  // [TODO] Re-enable this if you can get it working in PhantomJS
  xdescribe('toggleAnimate()', function () {
    it('animates an invisible element in', function (done) {
      var $css = $('<style>#toggler { display: none; }</style>').appendTo('body');
      $html = $('<div id="toggler" data-toggler data-animate="fade-in fade-out"></div>').appendTo('body');
      plugin = new Foundation.Toggler($html, {});

      $html.on('on.zf.toggler', function () {
        $('#toggler').should.be.visible;
        $('#toggler').should.have.attr('aria-expanded', 'true');
        $css.remove();
        done();
      });

      plugin._toggleAnimate();
    });

    it('animates an visible element out', function (done) {
      $html = $('<div id="toggler" data-toggler data-animate="fade-in fade-out"></div>').appendTo('body');
      plugin = new Foundation.Toggler($html, {});

      $html.on('off.zf.toggler', function () {
        $('#toggler').should.be.hidden;
        $('#toggler').should.have.attr('aria-expanded', 'false');
        done();
      });

      plugin._toggleAnimate();
    });
  });
});
'use strict';

describe('Tooltip', function () {
  var plugin;
  var $html;
  var template = '\n    <span data-tooltip aria-haspopup="true" class="has-tip" tabindex="1" title="TOOLTIP_CONTENT">\n      TEXT\n    </span>';
  Foundation.Tooltip.defaults.showOn = 'all';
  Foundation.Tooltip.defaults.fadeOutDuration = 0;
  Foundation.Tooltip.defaults.fadeInDuration = 0;

  afterEach(function () {
    plugin.destroy();
    $html.remove();
  });

  describe('constructor()', function () {
    it('stores the element and plugin options', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Tooltip($html, {});

      plugin.$element.should.be.an('object');
      plugin.options.should.be.an('object');
    });
  });

  describe('init()', function () {

    it('has value of title attribute as content', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Tooltip($html, {});

      plugin.template.text().should.equal('TOOLTIP_CONTENT');
    });

    it('has value of tipText option as content', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Tooltip($html, { tipText: 'TOOLTIP_CONTENT_OPTION' });

      plugin.template.text().should.equal('TOOLTIP_CONTENT_OPTION');
    });

    it('uses value of template option as template', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Tooltip($html, { template: '<div class="TEMPLATE_OPTION"></div>' });

      plugin.template.should.have.class('TEMPLATE_OPTION');
    });

    it('uses value of triggerClass option as trigger class', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Tooltip($html, { triggerClass: 'TRIGGER_CLASS_OPTION' });

      //plugin.$element.should.have.class('TRIGGER_CLASS_OPTION');
    });

    it('sets ARIA attributes', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Tooltip($html, {});

      plugin.$element.should.have.attr('aria-describedby', plugin.template.attr('id'));
      plugin.template.should.have.attr('role', 'tooltip');
    });
  });

  describe('buildTemplate()', function () {
    it('uses value of templateClasses option as template class', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Tooltip($html, { templateClasses: 'TOOLTIP_CLASS_OPTION' });

      plugin.template.should.have.class('TOOLTIP_CLASS_OPTION');
    });
  });

  describe('show()', function () {
    it('shows the tooltip', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Tooltip($html, {});

      plugin.show();

      plugin.template.should.be.visible;
    });

    it('fires show.zf.tooltip event', function (done) {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Tooltip($html, {});

      $html.on('show.zf.tooltip', function () {
        plugin.template.should.be.visible;
        done();
      });

      plugin.show();
    });
  });

  describe('hide()', function () {
    it('hides the tooltip', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Tooltip($html, {});

      // Show first
      plugin.show();

      plugin.hide();

      plugin.template.should.be.hidden;
    });

    it('fires hide.zf.tooltip event', function (done) {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Tooltip($html, {});

      // Open it first
      plugin.show();

      $html.on('hide.zf.tooltip', function () {
        plugin.template.should.be.hidden;
        done();
      });

      plugin.hide();
    });
  });

  describe('toggle()', function () {
    it('shows a hidden tooltip', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Tooltip($html, {});

      plugin.toggle();
      plugin.template.should.be.visible;
    });
    it('hides a visible tooltip', function () {
      $html = $(template).appendTo('body');
      plugin = new Foundation.Tooltip($html, {});

      // Show first
      plugin.show();

      plugin.toggle();
      plugin.template.should.be.hidden;
    });
  });
});
'use strict';

describe('Foundation core', function () {
  it('exists on the window', function () {
    window.Foundation.should.be.an('object');
  });

  it('is a jQuery prototype function', function () {
    $.fn.foundation.should.to.be.a('function');
  });

  describe('rtl()', function () {
    it('detects the text direction on the document', function () {
      Foundation.rtl().should.be.false;
      $('html').attr('dir', 'rtl');

      Foundation.rtl().should.be.true;
      $('html').attr('dir', 'ltr');
    });
  });

  describe('plugin()', function () {
    afterEach(function () {
      delete Foundation._plugins['plugin'];
      delete Foundation.Plugin;
    });

    it('adds Foundation plugins', function () {
      function Plugin() {}
      Foundation.plugin(Plugin, 'Plugin');

      Foundation._plugins['plugin'].should.be.a('function');
      Foundation.Plugin.should.be.a('function');
    });

    it('uses the name of the Plugin class/function if one is not provided', function () {
      function Plugin() {}
      Foundation.plugin(Plugin);

      Foundation._plugins['plugin'].should.be.a('function');
      Foundation.Plugin.should.be.a('function');
    });
  });

  describe('registerPlugin()', function () {
    it('registers a new instance of a plugin');
  });

  describe('unregisterPlugin()', function () {
    it('un-registers a plugin being destroyed');
  });

  xdescribe('reInit()', function () {});

  describe('GetYoDigits()', function () {
    it('generates a random ID matching a given length', function () {
      var id = Foundation.GetYoDigits(6);

      id.should.be.a('string');
      id.should.have.lengthOf(6);
    });

    it('can append a namespace to the number', function () {
      var id = Foundation.GetYoDigits(6, 'plugin');

      id.should.be.a('string');
      id.should.have.lengthOf(6 + '-plugin'.length);
      id.should.contain('-plugin');
    });
  });

  describe('reflow()', function () {});

  describe('getFnName()', function () {});

  describe('transitionEnd()', function () {});

  describe('throttle()', function () {});
});
'use strict';

describe('Keyboard util', function () {
  /**
   * Creates a dummy event to parse.
   * Uses jQuery Event class constructor.
   * @param  {number} keyCode Key code of the key that is simulated.
   * @param  {object} opts    Options that say if modifiers are pressed.
   * @return {Event}          Event to use.
   */
  var createEvent = function createEvent(keyCode, opts) {
    var options = opts || {},
        isCtrl = !!options.ctrl,
        isAlt = !!options.alt,
        isShift = !!options.shift,
        isMeta = !!options.meta,
        event = {
      shiftKey: isShift,
      altKey: isAlt,
      ctrlKey: isCtrl,
      metaKey: isMeta,
      keyCode: keyCode,
      which: keyCode
    };
    return new $.Event('keydown', event);
  };
  var keyCodes = {
    'A': 65,
    'TAB': 9,
    'ENTER': 13,
    'ESCAPE': 27,
    'SPACE': 32,
    'ARROW_LEFT': 37,
    'ARROW_UP': 38,
    'ARROW_RIGHT': 39,
    'ARROW_DOWN': 40
  };

  it('exists on the Foundation API', function () {
    window.Foundation.Keyboard.should.be.an('object');
  });

  describe('parseKey()', function () {
    it('returns the character pressed for a normal key', function () {
      var event = createEvent(keyCodes['A']),
          parsedKey = Foundation.Keyboard.parseKey(event);

      parsedKey.should.be.equal('A');
    });
    it('returns the character pressed for special keys', function () {
      for (var key in keyCodes) {
        var keyCode = keyCodes[key];
        var event = createEvent(keyCode),
            parsedKey = Foundation.Keyboard.parseKey(event);

        parsedKey.should.be.equal(key);
      }
    });
    it('recognizes if CTRL was pressed', function () {
      var event = createEvent(keyCodes['A'], { ctrl: true }),
          parsedKey = Foundation.Keyboard.parseKey(event);

      parsedKey.should.be.equal('CTRL_A');
    });
    it('recognizes if ALT was pressed', function () {
      var event = createEvent(keyCodes['A'], { alt: true }),
          parsedKey = Foundation.Keyboard.parseKey(event);

      parsedKey.should.be.equal('ALT_A');
    });
    it('recognizes if SHIFT was pressed', function () {
      var event = createEvent(keyCodes['A'], { shift: true }),
          parsedKey = Foundation.Keyboard.parseKey(event);

      parsedKey.should.be.equal('SHIFT_A');
    });
    it('recognizes if multiple modifiers were pressed', function () {
      var event = createEvent(keyCodes['A'], { shift: true, alt: true, ctrl: true }),
          parsedKey = Foundation.Keyboard.parseKey(event);

      parsedKey.should.be.equal('ALT_CTRL_SHIFT_A');
    });
  });
  describe('handleKey()', function () {
    it('executes callback for given key event', function () {
      var spy = sinon.spy();

      // Register component
      Foundation.Keyboard.register('MyComponent', {
        'ESCAPE': 'close'
      });

      var event = createEvent(keyCodes['ESCAPE']);

      Foundation.Keyboard.handleKey(event, 'MyComponent', {
        close: function close() {
          spy();
        }
      });

      spy.called.should.be.true;
    });
    it('executes handled callback for given key event', function () {
      var spy = sinon.spy();

      // Register component
      Foundation.Keyboard.register('MyComponent', {
        'ESCAPE': 'close'
      });

      var event = createEvent(keyCodes['ESCAPE']);

      Foundation.Keyboard.handleKey(event, 'MyComponent', {
        close: function close() {
          // stuff
        },
        handled: function handled() {
          spy();
        }
      });

      spy.called.should.be.true;
    });
    it('executes unhandled callback for given key event', function () {
      var spy = sinon.spy();

      // Register component
      Foundation.Keyboard.register('MyComponent', {});

      var event = createEvent(keyCodes['ESCAPE']);

      Foundation.Keyboard.handleKey(event, 'MyComponent', {
        unhandled: function unhandled() {
          spy();
        }
      });

      spy.called.should.be.true;
    });
  });

  describe('findFocusable()', function () {
    it('finds focusable elements inside a container', function () {
      var $html = $('<div>\n            <a href="#">Link</a>\n            <button>Button</button>\n          </div>').appendTo('body');

      var $focusable = Foundation.Keyboard.findFocusable($html);

      $focusable.length.should.be.equal(2);

      $html.remove();
    });

    it('does not find hidden focusable elements', function () {
      var $html = $('<div>\n            <a style="display: none;" href="#">Link</a>\n            <button style="display: none;">Button</button>\n          </div>').appendTo('body');

      var $focusable = Foundation.Keyboard.findFocusable($html);

      $focusable.length.should.be.equal(0);

      $html.remove();
    });

    it('does not find disabled focusable elements', function () {
      var $html = $('<div>\n            <button disabled>Button</button>\n          </div>').appendTo('body');

      var $focusable = Foundation.Keyboard.findFocusable($html);

      $focusable.length.should.be.equal(0);

      $html.remove();
    });

    it('does not find focusable elements with negative tabindex', function () {
      var $html = $('<div>\n            <button tabindex="-1">Button</button>\n          </div>').appendTo('body');

      var $focusable = Foundation.Keyboard.findFocusable($html);

      $focusable.length.should.be.equal(0);

      $html.remove();
    });
  });

  describe('trapFocus()', function () {
    it('moves the focus to the first focusable element', function () {
      var $html = $('<div>\n            <a href="#">Link1</a>\n            <a href="#">Link2</a>\n            <a href="#">Link3</a>\n          </div>').appendTo('body');

      Foundation.Keyboard.trapFocus($html);
      $html.find('a').last().focus();

      var event = createEvent(keyCodes['TAB']);
      $(document.activeElement).trigger(event);

      document.activeElement.should.be.equal($html.find('a').eq(0)[0]);

      $html.remove();
    });

    it('moves the focus to the last focusable element', function () {
      var $html = $('<div>\n            <a href="#">Link1</a>\n            <a href="#">Link2</a>\n            <a href="#">Link3</a>\n          </div>').appendTo('body');

      Foundation.Keyboard.trapFocus($html);
      $html.find('a').first().focus();

      var event = createEvent(keyCodes['TAB'], { shift: true });
      $(document.activeElement).trigger(event);

      document.activeElement.should.be.equal($html.find('a').eq(2)[0]);

      $html.remove();
    });
  });

  describe('releaseFocus()', function () {
    it('stops trapping the focus at the end', function () {
      var $html = $('<div>\n            <a href="#">Link1</a>\n            <a href="#">Link2</a>\n            <a href="#">Link3</a>\n          </div>').appendTo('body');

      Foundation.Keyboard.trapFocus($html);
      $html.find('a').last().focus();

      Foundation.Keyboard.releaseFocus($html);

      var event = createEvent(keyCodes['TAB']);
      $(document.activeElement).trigger(event);

      document.activeElement.should.not.be.equal($html.find('a').eq(0)[0]);

      $html.remove();
    });

    it('stops trapping the focus at the top', function () {
      var $html = $('<div>\n            <a href="#">Link1</a>\n            <a href="#">Link2</a>\n            <a href="#">Link3</a>\n          </div>').appendTo('body');

      Foundation.Keyboard.trapFocus($html);
      $html.find('a').first().focus();

      Foundation.Keyboard.releaseFocus($html);

      var event = createEvent(createEvent(keyCodes['TAB'], { shift: true }));
      $(document.activeElement).trigger(event);

      document.activeElement.should.not.be.equal($html.find('a').eq(2)[0]);

      $html.remove();
    });
  });
});