import Patternlibrary from '..';

var expect = require('chai').expect;

describe('Patternlibrary.adapter()', function() {
  it('loads built-in adapters', function() {
    var p = new Patternlibrary.Patternlibrary();
    p = p.adapter('sass');

    expect(p).to.be.an.instanceOf(Patternlibrary.Patternlibrary);
    expect(p.adapters).to.have.a.property('sass');
    expect(p.adapters.sass.config).to.exist;
    
    
  });

  it('throws an error if you try to load a non-existant built-in adapter', function() {
    var p = new Patternlibrary.Patternlibrary();

    expect(function() {
      p.adapter('kitten');
    }).to.throw(Error);
  });

  it('loads custom adapters', function() {
    var p = new Patternlibrary.Patternlibrary();
    p = p.adapter('custom', function() {});

    expect(p.adapters).to.have.a.property('custom');
    expect(p.adapters.custom).to.be.a('function');
  });

  it('throws an error if you use a reserved keyword as an adapter name', function() {
    var p = new Patternlibrary.Patternlibrary();

    expect(function() {
      p.adapter('docs', function() {});
    }).to.throw(Error);
  });

  it('throws an error if you try to pass something other than a function as an adapter', function() {
    var s = new Patternlibrary.Patternlibrary();

    expect(function() {
      p.adapter('docs', 'kittens');
    }).to.throw(Error);
  });
});
