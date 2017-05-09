import { src, dest } from 'vinyl-fs';
import assert from 'assert';
import equal from 'assert-dir-equal';
import { Patternlibrary } from '..';

const FIXTURES = 'test/fixtures.patternlibrary/';

var patternlibraryOptions = {
  verbose: false,
  dest : FIXTURES + 'build',
  dirs : {
	atoms     : 'atoms/',
	molecules : 'molecules/',
	organisms : 'organisms/',
	templates : 'tempates/'
  },
  panini : {
    root    : FIXTURES + 'pages/',
    layouts : FIXTURES + 'layouts',
    partials: FIXTURES + 'partials'
  }
}


describe('Patternlibrary', () => {

  it('builds a page with a default layout', done => {
	patternlibraryOptions.dest = FIXTURES + 'basic/build';
	patternlibraryOptions.panini = {
	  root    : FIXTURES + 'basic/pages/',
	  layouts : FIXTURES + 'basic/layouts',
	  partials: FIXTURES + 'basic/partials'
	};
    var p = new Patternlibrary(patternlibraryOptions);

    p.refresh();

    src(FIXTURES + 'basic/pages/*')
      .pipe(p.processFileStream())
      .pipe(dest(FIXTURES + 'basic/build'))
      .on('finish', () => {
        equal(FIXTURES + 'basic/expected', FIXTURES + 'basic/build');
        done();
      });
  });

});

describe('Patternlibrary helpers', () => {

  it('#code helper that renders code blocks', done => {
	patternlibraryOptions.dest = FIXTURES + 'helper-code/build';
	patternlibraryOptions.panini = {
	  root    : FIXTURES + 'helper-code/pages/',
	  layouts : FIXTURES + 'helper-code/layouts',
	  partials: FIXTURES + 'helper-code/partials'
	};
    var p = new Patternlibrary(patternlibraryOptions);

    //p.loadBuiltinHelpers();
    p.refresh();

    src(FIXTURES + 'helper-code/pages/**/*.html')
      .pipe(p.processFileStream())
      .pipe(dest(FIXTURES + 'helper-code/build'))
      .on('finish', () => {
        equal(FIXTURES + 'helper-code/expected', FIXTURES + 'helper-code/build');
        done();
      });
  });

});
