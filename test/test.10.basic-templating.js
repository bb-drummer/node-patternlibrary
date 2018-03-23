import Patternlibrary from '..';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';

var extend = require('deep-extend');
var expect = require('chai').expect;

const CLEAN_UP = !true;

describe('Patternlibrary basic templating:', function() {

    describe('Patternlibrary.layout', function() {
    	
    	it('retrieves the default GUI layout if none is set (yet)', function(){
            var p = new Patternlibrary.Patternlibrary();
            var layout = p.layout;

            expect(p.layout).to.be.a('function');
            expect(layout).to.be.a('function');

            p.handlebars.registerPartial('docs-htmlhead', '<head>');
            p.handlebars.registerPartial('body', '<body>');
            p.handlebars.registerPartial('docs-htmlclose', '<close>');
            var rendered = layout({});
            expect(rendered).to.contain('<head>');
            expect(rendered).to.contain('<body>');
            expect(rendered).to.contain('<close>');
            
    	});
        
        it('assings a handlebars default layout "{{> body}}" from an empty template name string', function() {
            var p = new Patternlibrary.Patternlibrary();
            p.layout = '';
            expect(p.layout).to.be.a('function');
            
            p.handlebars.registerPartial('body', 'I am here');
            var rendered = p.layout({});
            expect(rendered).to.equal('I am here')
        });
        
        it('assings a handlebars layout by template name from module dir', function() {
            var p = new Patternlibrary.Patternlibrary();
            p.layout = 'ajax';
            expect(p.layout).to.be.a('function');
            
            p.handlebars.registerPartial('body', 'I am here');
            var rendered = p.layout({});
            expect(rendered).to.equal('I am here')
        });
        
        it('assings a handlebars layout by template name from project dir', function() {
            const FIXTURES = 'test/fixtures.templating/layout/';

            var patternlibraryOptions = {
                verbose : false,
                dest    : FIXTURES + 'build',
                root    : FIXTURES + 'pages/',
                layouts : FIXTURES + 'layouts',
                partials: FIXTURES + 'partials'
            }

            var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
            p.layout = 'mylayout';
            expect(p.layout).to.be.a('function');
            
            p.handlebars.registerPartial('body', 'I am here');
            var rendered = p.layout({});
            expect(rendered).to.equal("<html>\n  <body>\n    <h1>My Layout</h1>\n    I am here  </body>\n</html>\n");
        });
        
        it('assings a handlebars layout by template name from project dir overriding file in module dir', function() {
            const FIXTURES = 'test/fixtures.templating/layout-override/';

            var patternlibraryOptions = {
                verbose : false,
                dest    : FIXTURES + 'build',
                root    : FIXTURES + 'pages/',
                layouts : FIXTURES + 'layouts',
                partials: FIXTURES + 'partials'
            }

            var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
            p.layout = 'ajax';
            expect(p.layout).to.be.a('function');
            
            p.handlebars.registerPartial('body', 'I am here');
            var rendered = p.layout({});
            expect(rendered).to.equal("User: I am here\n");
        });
        
        it('throws an error if layout could not be found by template name', function() {
            var p = new Patternlibrary.Patternlibrary();

            expect(function() {
                p.layout = 'some_unknown_templatefile';
            }).to.throw(Error);
        });
        
        it('layout name is empty if no layout is assigned', function() {
            var p = new Patternlibrary.Patternlibrary();
            
            expect(p.layoutname).to.be.undefined;
        });
        
        it('layout name is not empty if a layout is assigned', function() {
            var p = new Patternlibrary.Patternlibrary();
            
            p.layout = 'ajax';
            expect(p.layoutname).to.equal('ajax');
        });
        
        it('layout name is "none" if an empty layout name is assigned', function() {
            var p = new Patternlibrary.Patternlibrary();
            
            p.layout = '';
            expect(p.layoutname).to.equal('none');
        });
        
    });
    
    describe('Patternlibrary.pagetemplate', function() {
        
        it('assigns the default GUI doc page template as default', function() {
            var opts = { gui : { docpage : 'the page' } };
            var p = new Patternlibrary.Patternlibrary(opts);
            
            p.layout = '';
            expect(p.pagetemplate).to.be.a('function');
            expect(p.pagetemplate({})).to.equal('the page');
        });
        
        it('assings a doc page template by filename from project\'s doc pages dir (pages src dir + basepath)', function() {
            const FIXTURES = 'test/fixtures.templating/page-filename/';

            var patternlibraryOptions = {
                verbose : false,
                dest    : FIXTURES + 'build',
                root    : FIXTURES + 'pages',
                layouts : FIXTURES + 'layouts',
                partials: FIXTURES + 'partials'
            }

            var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
            p.layout = '';
            p.pagetemplate = 'mypage.html';
            expect(p.pagetemplate).to.be.a('function');
            expect(p.pagetemplate({})).to.equal("<p>Body</p>\n");
        });
        
        
        it('assings a doc page template by filename from modules\'s gui pages dir', function() {
            const FIXTURES = 'test/fixtures.templating/page-guipages/';

            var patternlibraryOptions = {
                verbose : false,
                dest    : FIXTURES + 'build',
                root    : FIXTURES + 'pages',
                layouts : FIXTURES + 'layouts',
                partials: FIXTURES + 'partials'
            }

            var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
            p.layout = '';
            p.pagetemplate = 'dashboard.html';
            expect(p.pagetemplate).to.be.a('function');
            p.handlebars.registerPartial('docs-dashboard', 'the dashboard.html');
            expect(p.pagetemplate({})).to.equal("the dashboard.html ");
        });
        
        it('assings a doc page template by filename from project\'s gui pages dir', function() {
            const FIXTURES = 'test/fixtures.templating/page-guipages/';

            var patternlibraryOptions = {
                verbose : false,
                dest    : FIXTURES + 'build',
                root    : FIXTURES + 'pages',
                layouts : FIXTURES + 'layouts',
                partials: FIXTURES + 'partials',
                gui : {
                    pages: FIXTURES + 'gui/pages'
                }
            }

            var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
            p.layout = '';
            p.pagetemplate = 'mypage.html';
            expect(p.pagetemplate).to.be.a('function');
            expect(p.pagetemplate({})).to.equal("<p>Body</p>\n");
        });
        
        it('assings a doc page template by filename from project\'s gui pages dir over the same (filename) from modules\'s gui pages dir', function() {
            const FIXTURES = 'test/fixtures.templating/page-guipages/';

            var patternlibraryOptions = {
                verbose : false,
                dest    : FIXTURES + 'build',
                root    : FIXTURES + 'pages',
                layouts : FIXTURES + 'layouts',
                partials: FIXTURES + 'partials',
                gui : {
                    pages: FIXTURES + 'gui/pages'
                }
            }

            var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
            p.layout = '';
            p.pagetemplate = 'index.html';
            expect(p.pagetemplate).to.be.a('function');
            expect(p.pagetemplate({})).to.equal("<p>Patternlist</p>\n");
        });
        
        
        it('assings a doc page template by file-path from project\'s pages dir', function() {
            const FIXTURES = 'test/fixtures.templating/page-guipages/';

            var patternlibraryOptions = {
                verbose : false,
                dest    : FIXTURES + 'build',
                root    : FIXTURES + 'pages',
                layouts : FIXTURES + 'layouts',
                partials: FIXTURES + 'partials'
            }

            var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
            p.layout = '';
            p.pagetemplate = FIXTURES + 'pages/otherpage.html';
            expect(p.pagetemplate).to.be.a('function');
            expect(p.pagetemplate({})).to.equal("<p>Body</p>\n");
        });
        
        
        it('assings a markdown file as a doc page template', function() {
            const FIXTURES = 'test/fixtures.templating/page-markdown/';

            var patternlibraryOptions = {
                verbose : false,
                dest    : FIXTURES + 'build',
                root    : FIXTURES + 'pages',
                layouts : FIXTURES + 'layouts',
                partials: FIXTURES + 'partials'
            }

            var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
            p.layout = '';
            p.pagetemplate = FIXTURES + 'pages/mypage.md';
            expect(p.pagetemplate).to.be.a('function');
            
            expect(p.pagetemplate({})).to.equal('<h1 id="body">Body</h1>\n');
        });
        

    });
    
    // rimraf.sync(FIXTURES + 'basic/build'); mkdirp(FIXTURES + 'basic/build');
    /// if (CLEAN_UP) rimraf.sync(FIXTURES + 'basic/build');
    
});
