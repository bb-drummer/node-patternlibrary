describe('Pattern-Library core and dependencies', function() {
  
  it('-jQuery- exists on the window', function() {
    (window.jQuery).should.be.an('function');
  });
  
  it('jQuery shortcut -$- exists on the window', function() {
    (window.$).should.be.an('function');
  });
  
  it('-Foundation- exists on the window', function() {
    (window.Foundation).should.be.an('object');
  });
  
  it('Pattern-Library namespace -patternlibrary- exists on the window', function() {
    (window.patternlibrary).should.be.an('object');
  });

});