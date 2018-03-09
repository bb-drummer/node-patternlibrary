import Patternlibrary from '..';

var expect = require('chai').expect;

describe('Patternlibrary constructor', function() {
  it('creates a new instance of Patternlibrary', function() {
    var p = new Patternlibrary.Patternlibrary();
    expect(p).to.be.an.instanceOf(Patternlibrary.Patternlibrary);
  });

  it('sets blank defaults for config settings', function() {
    var p = new Patternlibrary.Patternlibrary();

    expect(p.options).to.be.an('object');
    expect(p.searchOptions).to.be.an('object');
    expect(p.searchOptions).to.have.all.keys(['extra', 'sort', 'pageTypes']);
    expect(p.adapters).to.be.an('object');
    expect(p.data).to.be.an('object');
    expect(p.template).to.be.null;
  });
});
