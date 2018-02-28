import { src, dest } from 'vinyl-fs';
import assert from 'assert';
import equal from 'assert-dir-equal';
import Patternlibrary from '..';

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
    var p = Patternlibrary(patternlibraryOptions);

    //p.run();
    
    //done();
    
    src(FIXTURES + 'basic/pages/*')
      .pipe(p.run())
      .pipe(dest(FIXTURES + 'basic/build'))
      .on('finish', () => {

    	equal(FIXTURES + 'basic/expected', FIXTURES + 'basic/build');
        done();
      });
    
    
  });

});

