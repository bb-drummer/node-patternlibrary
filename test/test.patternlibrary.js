import { src, dest } from 'vinyl-fs';
import assert from 'assert';
import equal from 'assert-dir-equal';
import { Panini } from 'panini';

const FIXTURES = 'test/fixtures.panini/';

describe('Panini', () => {

  it('builds a page with a default layout', done => {
    var p = new Panini({
      root: FIXTURES + 'basic/pages/',
      layouts: FIXTURES + 'basic/layouts'
    });

    p.refresh();

    src(FIXTURES + 'basic/pages/*')
      .pipe(p.render())
      .pipe(dest(FIXTURES + 'basic/build'))
      .on('finish', () => {
        equal(FIXTURES + 'basic/expected', FIXTURES + 'basic/build');
        done();
      });
  });

});

describe('Panini helpers', () => {

  it('#code helper that renders code blocks', done => {
    var p = new Panini({
      root: FIXTURES + 'helper-code/pages/',
      layouts: FIXTURES + 'helper-code/layouts/',
    });

    p.loadBuiltinHelpers();
    p.refresh();

    src(FIXTURES + 'helper-code/pages/**/*.html')
      .pipe(p.render())
      .pipe(dest(FIXTURES + 'helper-code/build'))
      .on('finish', () => {
        equal(FIXTURES + 'helper-code/expected', FIXTURES + 'helper-code/build');
        done();
      });
  });

});
