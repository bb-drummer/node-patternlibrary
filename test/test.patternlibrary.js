import { src, dest } from 'vinyl-fs';
import assert from 'assert';
import equal from 'assert-dir-equal';
import Patternlibrary from '..';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';

const FIXTURES = 'test/fixtures.patternlibrary/';

const CLEAN_UP = !true;

var patternlibraryOptions = {
    verbose: false,
    dest : FIXTURES + 'build',
    root    : FIXTURES + 'pages/',
    layouts : FIXTURES + 'layouts',
    partials: FIXTURES + 'partials'
}


describe('Patternlibrary, the basic page genarator, ', () => {

    beforeEach(function(done) {
        this.timeout(5000); // A very long environment setup.
        done();
    });

    it('builds a page with a default layout', function (done) {

        patternlibraryOptions = {
            verbose : false,
            dest    : FIXTURES + 'basic/build',
            root    : FIXTURES + 'basic/pages/',
            layouts : FIXTURES + 'basic/layouts/',
            partials: FIXTURES + 'basic/partials/',
            nogui   : true,
            testing : true
        };
        rimraf.sync(FIXTURES + 'basic/build'); mkdirp(FIXTURES + 'basic/build');
        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
    
        p.run();
    
        setTimeout( function () {
            equal(FIXTURES + 'basic/expected/index.html', FIXTURES + 'basic/build/index.html');
            if (CLEAN_UP) rimraf.sync(FIXTURES + 'basic/build');
            done();
        }, 250);
    
    });

    it('builds a page with a custom layout', function (done) {

        patternlibraryOptions = {
            verbose : false,
            dest    : FIXTURES + 'layouts/build',
            root    : FIXTURES + 'layouts/pages/',
            layouts : FIXTURES + 'layouts/layouts/',
            partials: FIXTURES + 'layouts/partials/',
            nogui   : true,
            testing : true
        };
        rimraf.sync(FIXTURES + 'layouts/build'); mkdirp(FIXTURES + 'layouts/build');
        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
    
        p.run();
    
        setTimeout( function () {
            equal(FIXTURES + 'layouts/expected/index.html', FIXTURES + 'layouts/build/index.html');
            if (CLEAN_UP) rimraf.sync(FIXTURES + 'layouts/build');
            done();
        }, 250);
    
    });
 
    it('builds a page with a preset layout in sub folder', function (done) {
    
        patternlibraryOptions = {
            verbose : false,
            dest    : FIXTURES + 'page-layouts/build',
            root    : FIXTURES + 'page-layouts/pages/',
            layouts : FIXTURES + 'page-layouts/layouts/',
            partials: FIXTURES + 'page-layouts/partials/',
            nogui   : true,
            testing : true
        };
        rimraf.sync(FIXTURES + 'page-layouts/build'); mkdirp(FIXTURES + 'page-layouts/build');
        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
    
        p.run();
    
        setTimeout( function () {
            equal(FIXTURES + 'page-layouts/expected/index.html', FIXTURES + 'page-layouts/build/index.html');
            equal(FIXTURES + 'page-layouts/expected/sub/index.html', FIXTURES + 'page-layouts/build/sub/index.html');
            if (CLEAN_UP) rimraf.sync(FIXTURES + 'page-layouts/build');
            done();
        }, 250);
    
    });

    it('builds a page with custom partials', function (done) {
    
        patternlibraryOptions = {
            verbose : false,
            dest    : FIXTURES + 'partials/build',
            root    : FIXTURES + 'partials/pages/',
            layouts : FIXTURES + 'partials/layouts/',
            partials: FIXTURES + 'partials/partials/',
            nogui   : true,
            testing : true
        };
        rimraf.sync(FIXTURES + 'partials/build'); mkdirp(FIXTURES + 'partials/build');
        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
    
        p.run();
    
        setTimeout( function () {
            equal(FIXTURES + 'partials/expected/index.html', FIXTURES + 'partials/build/index.html');
            if (CLEAN_UP) rimraf.sync(FIXTURES + 'partials/build');
            done();
        }, 250);
    
    });

    it('builds a page with custom helpers', function (done) {
    
        patternlibraryOptions = {
            verbose : false,
            dest    : FIXTURES + 'helpers/build',
            root    : FIXTURES + 'helpers/pages/',
            layouts : FIXTURES + 'helpers/layouts/',
            partials: FIXTURES + 'helpers/partials/',
            helpers : FIXTURES + 'helpers/helpers/',
            nogui   : true,
            testing : true
        };
        rimraf.sync(FIXTURES + 'helpers/build'); mkdirp(FIXTURES + 'helpers/build');
        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
    
        p.run();
    
        setTimeout( function () {
            equal(FIXTURES + 'helpers/expected/index.html', FIXTURES + 'helpers/build/index.html');
            if (CLEAN_UP) rimraf.sync(FIXTURES + 'partials/build');
            done();
        }, 250);
    
    });

});

describe('Patternlibrary, injecting (custom) data, ', () => {

    it('builds a page with custom page data', function (done) {
    
        patternlibraryOptions = {
            verbose : false,
            dest    : FIXTURES + 'data-page/build',
            root    : FIXTURES + 'data-page/pages/',
            layouts : FIXTURES + 'data-page/layouts/',
            partials: FIXTURES + 'data-page/partials/',
            nogui   : true,
            testing : true
        };
        rimraf.sync(FIXTURES + 'data-page/build'); mkdirp(FIXTURES + 'data-page/build');
        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
    
        p.run();
    
        setTimeout( function () {
            equal(FIXTURES + 'data-page/expected/index.html', FIXTURES + 'data-page/build/index.html');
            equal(FIXTURES + 'data-page/expected/pl/patternlibrary.json', FIXTURES + 'data-page/build/pl/patternlibrary.json');
            if (CLEAN_UP) rimraf.sync(FIXTURES + 'data-page/build');
            done();
        }, 250);
    
    });

    it('builds a page with external JS data', function (done) {
    
        patternlibraryOptions = {
            verbose : false,
            dest    : FIXTURES + 'data-js/build',
            root    : FIXTURES + 'data-js/pages/',
            layouts : FIXTURES + 'data-js/layouts/',
            partials: FIXTURES + 'data-js/partials/',
            data    : FIXTURES + 'data-js/data/',
            nogui   : true,
            testing : true
        };
        rimraf.sync(FIXTURES + 'data-js/build'); mkdirp(FIXTURES + 'data-js/build');
        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
    
        p.run();
    
        setTimeout( function () {
            equal(FIXTURES + 'data-js/expected/index.html', FIXTURES + 'data-js/build/index.html');
            equal(FIXTURES + 'data-js/expected/pl/patternlibrary.json', FIXTURES + 'data-js/build/pl/patternlibrary.json');
            if (CLEAN_UP) rimraf.sync(FIXTURES + 'data-js/build');
            done();
        }, 250);
    
    });

    it('builds a page with external JSON data', function (done) {
    
        patternlibraryOptions = {
            verbose : false,
            dest    : FIXTURES + 'data-json/build',
            root    : FIXTURES + 'data-json/pages/',
            layouts : FIXTURES + 'data-json/layouts/',
            partials: FIXTURES + 'data-json/partials/',
            data    : FIXTURES + 'data-json/data/',
            nogui   : true,
            testing : true
        };
        rimraf.sync(FIXTURES + 'data-json/build'); mkdirp(FIXTURES + 'data-json/build');
        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
    
        p.run();
    
        setTimeout( function () {
            equal(FIXTURES + 'data-json/expected/index.html', FIXTURES + 'data-json/build/index.html');
            equal(FIXTURES + 'data-json/expected/pl/patternlibrary.json', FIXTURES + 'data-json/build/pl/patternlibrary.json');
            if (CLEAN_UP) rimraf.sync(FIXTURES + 'data-json/build');
            done();
        }, 250);
    
    });

    it('builds a page with an array of external JSON data', function (done) {
    
        patternlibraryOptions = {
            verbose : false,
            dest    : FIXTURES + 'data-array/build',
            root    : FIXTURES + 'data-array/pages/',
            layouts : FIXTURES + 'data-array/layouts/',
            partials: FIXTURES + 'data-array/partials/',
            data    : [FIXTURES + 'data-array/data/', FIXTURES + 'data-array/data-extra/'],
            nogui   : true,
            testing : true
        };
        rimraf.sync(FIXTURES + 'data-array/build'); mkdirp(FIXTURES + 'data-array/build');
        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
    
        p.run();
    
        setTimeout( function () {
            equal(FIXTURES + 'data-array/expected/index.html', FIXTURES + 'data-array/build/index.html');
            equal(FIXTURES + 'data-array/expected/pl/patternlibrary.json', FIXTURES + 'data-array/build/pl/patternlibrary.json');
            if (CLEAN_UP) rimraf.sync(FIXTURES + 'data-array/build');
            done();
        }, 250);
    
    });

    it('builds a page with external YAML data', function (done) {
    
        patternlibraryOptions = {
            verbose : false,
            dest    : FIXTURES + 'data-yaml/build',
            root    : FIXTURES + 'data-yaml/pages/',
            layouts : FIXTURES + 'data-yaml/layouts/',
            partials: FIXTURES + 'data-yaml/partials/',
            data    : FIXTURES + 'data-yaml/data/',
            nogui   : true,
            testing : true
        };
        rimraf.sync(FIXTURES + 'data-yaml/build'); mkdirp(FIXTURES + 'data-yaml/build');
        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
    
        p.run();
    
        setTimeout( function () {
            equal(FIXTURES + 'data-yaml/expected/index.html', FIXTURES + 'data-yaml/build/index.html');
            equal(FIXTURES + 'data-yaml/expected/pl/patternlibrary.json', FIXTURES + 'data-yaml/build/pl/patternlibrary.json');
            if (CLEAN_UP) rimraf.sync(FIXTURES + 'data-yaml/build');
            done();
        }, 250);
    
    });

});


describe('Patternlibrary, assigning', () => {

    it('{{page}} variable that stores the current page', function (done) {
    
        patternlibraryOptions = {
            verbose : false,
            dest    : FIXTURES + 'variable-page/build',
            root    : FIXTURES + 'variable-page/pages/',
            layouts : FIXTURES + 'variable-page/layouts/',
            partials: FIXTURES + 'variable-page/partials/',
            nogui   : true,
            testing : true
        };
        rimraf.sync(FIXTURES + 'variable-page/build'); mkdirp(FIXTURES + 'variable-page/build');
        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
    
        p.run();
    
        setTimeout( function () {
            equal(FIXTURES + 'variable-page/expected/index.html', FIXTURES + 'variable-page/build/index.html');
            if (CLEAN_UP) rimraf.sync(FIXTURES + 'variable-page/build');
            done();
        }, 250);
    
    });

    it('{{layout}} variable that stores the current layout', function (done) {
    
        patternlibraryOptions = {
            verbose : false,
            dest    : FIXTURES + 'variable-layout/build',
            root    : FIXTURES + 'variable-layout/pages/',
            layouts : FIXTURES + 'variable-layout/layouts/',
            partials: FIXTURES + 'variable-layout/partials/',
            nogui   : true,
            testing : true
        };
        rimraf.sync(FIXTURES + 'variable-layout/build'); mkdirp(FIXTURES + 'variable-layout/build');
        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
    
        p.run();
    
        setTimeout( function () {
            equal(FIXTURES + 'variable-layout/expected/index.html', FIXTURES + 'variable-layout/build/index.html');
            if (CLEAN_UP) rimraf.sync(FIXTURES + 'variable-layout/build');
            done();
        }, 250);
    
    });

    it('{{root}} variable that stores a relative path to the root folder', function (done) {
    
        patternlibraryOptions = {
            verbose : false,
            dest    : FIXTURES + 'variable-root/build',
            root    : FIXTURES + 'variable-root/pages/',
            layouts : FIXTURES + 'variable-root/layouts/',
            partials: FIXTURES + 'variable-root/partials/',
            nogui   : true,
            testing : true
        };
        rimraf.sync(FIXTURES + 'variable-root/build'); mkdirp(FIXTURES + 'variable-root/build');
        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
    
        p.run();
    
        setTimeout( function () {
            equal(FIXTURES + 'variable-root/expected/index.html', FIXTURES + 'variable-root/build/index.html');
            if (CLEAN_UP) rimraf.sync(FIXTURES + 'variable-root/build');
            done();
        }, 250);
    
    });
	
});


describe('Patternlibrary built-in', () => {

    it('#code helper that renders code blocks', function (done) {
    
        patternlibraryOptions = {
            verbose : false,
            dest    : FIXTURES + 'helper-code/build',
            root    : FIXTURES + 'helper-code/pages/',
            layouts : FIXTURES + 'helper-code/layouts/',
            partials: FIXTURES + 'helper-code/partials/',
            nogui   : true,
            testing : true
        };
        rimraf.sync(FIXTURES + 'helper-code/build'); mkdirp(FIXTURES + 'helper-code/build');
        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
    
        p.run();
    
        setTimeout( function () {
            equal(FIXTURES + 'helper-code/expected/index.html', FIXTURES + 'helper-code/build/index.html');
            if (CLEAN_UP) rimraf.sync(FIXTURES + 'helper-code/build');
            done();
        }, 250);
    
    });

    it('#ifEqual helper that compares two values', function (done) {
    
        patternlibraryOptions = {
            verbose : false,
            dest    : FIXTURES + 'helper-ifequal/build',
            root    : FIXTURES + 'helper-ifequal/pages/',
            layouts : FIXTURES + 'helper-ifequal/layouts/',
            partials: FIXTURES + 'helper-ifequal/partials/',
            nogui   : true,
            testing : true
        };
        rimraf.sync(FIXTURES + 'helper-ifequal/build'); mkdirp(FIXTURES + 'helper-ifequal/build');
        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
    
        p.run();
    
        setTimeout( function () {
            equal(FIXTURES + 'helper-ifequal/expected/index.html', FIXTURES + 'helper-ifequal/build/index.html');
            if (CLEAN_UP) rimraf.sync(FIXTURES + 'helper-ifequal/build');
            done();
        }, 250);
    
    });

    it('#markdown helper that converts Markdown to HTML', function (done) {
    
        patternlibraryOptions = {
            verbose : false,
            dest    : FIXTURES + 'helper-markdown/build',
            root    : FIXTURES + 'helper-markdown/pages/',
            layouts : FIXTURES + 'helper-markdown/layouts/',
            partials: FIXTURES + 'helper-markdown/partials/',
            nogui   : true,
            testing : true
        };
        rimraf.sync(FIXTURES + 'helper-markdown/build'); mkdirp(FIXTURES + 'helper-markdown/build');
        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
    
        p.run();
    
        setTimeout( function () {
            equal(FIXTURES + 'helper-markdown/expected/index.html', FIXTURES + 'helper-markdown/build/index.html');
            if (CLEAN_UP) rimraf.sync(FIXTURES + 'helper-markdown/build');
            done();
        }, 250);
    
    });

    it('#repeat helper that prints content multiple times', function (done) {
    
        patternlibraryOptions = {
            verbose : false,
            dest    : FIXTURES + 'helper-repeat/build',
            root    : FIXTURES + 'helper-repeat/pages/',
            layouts : FIXTURES + 'helper-repeat/layouts/',
            partials: FIXTURES + 'helper-repeat/partials/',
            nogui   : true,
            testing : true
        };
        rimraf.sync(FIXTURES + 'helper-repeat/build'); mkdirp(FIXTURES + 'helper-repeat/build');
        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
    
        p.run();
    
        setTimeout( function () {
            equal(FIXTURES + 'helper-repeat/expected/index.html', FIXTURES + 'helper-repeat/build/index.html');
            if (CLEAN_UP) rimraf.sync(FIXTURES + 'helper-repeat/build');
            done();
        }, 250);
    
    });

    it('#ifpage helper that checks the current page', function (done) {
    
        patternlibraryOptions = {
            verbose : false,
            dest    : FIXTURES + 'helper-ifpage/build',
            root    : FIXTURES + 'helper-ifpage/pages/',
            layouts : FIXTURES + 'helper-ifpage/layouts/',
            partials: FIXTURES + 'helper-ifpage/partials/',
            nogui   : true,
            testing : true
        };
        rimraf.sync(FIXTURES + 'helper-ifpage/build'); mkdirp(FIXTURES + 'helper-ifpage/build');
        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
    
        p.run();
    
        setTimeout( function () {
            equal(FIXTURES + 'helper-ifpage/expected/index.html', FIXTURES + 'helper-ifpage/build/index.html');
            equal(FIXTURES + 'helper-ifpage/expected/about.html', FIXTURES + 'helper-ifpage/build/about.html');
            if (CLEAN_UP) rimraf.sync(FIXTURES + 'helper-ifpage/build');
            done();
        }, 250);
    
    });

    it('#unlesspage helper that checks the current page', function (done) {
    
        patternlibraryOptions = {
            verbose : false,
            dest    : FIXTURES + 'helper-unlesspage/build',
            root    : FIXTURES + 'helper-unlesspage/pages/',
            layouts : FIXTURES + 'helper-unlesspage/layouts/',
            partials: FIXTURES + 'helper-unlesspage/partials/',
            nogui   : true,
            testing : true
        };
        rimraf.sync(FIXTURES + 'helper-unlesspage/build'); mkdirp(FIXTURES + 'helper-unlesspage/build');
        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
    
        p.run();
    
        setTimeout( function () {
            equal(FIXTURES + 'helper-unlesspage/expected/index.html', FIXTURES + 'helper-unlesspage/build/index.html');
            equal(FIXTURES + 'helper-unlesspage/expected/about.html', FIXTURES + 'helper-unlesspage/build/about.html');
            if (CLEAN_UP) rimraf.sync(FIXTURES + 'helper-unlesspage/build');
            done();
        }, 250);
    
    });
	
});

