import Siteapp          from 'siteapp/js/entries/siteapp';

const PatternlibraryApp = class Patternlibrary extends Siteapp {
	
};

const Patternlibrary_VERSION = require('../../../../../package.json').version;
const Patternlibrary = new PatternlibraryApp({
	namespace: 'patternlibrary'
});
Patternlibrary.version = Patternlibrary_VERSION;

Patternlibrary.addToGlobal(window, true);
Patternlibrary.addPluginShortcut(window);
Patternlibrary.addToJquery($);


export default Patternlibrary;