
//import jQuery              from '../../../../node_modules/jquery/src/jquery';
//import PLFoundation        from '../../../../node_modules/plfoundation-sites/dist/js/plfoundation';
 

//import Bloodhound          from '../../../../node_modules/corejs-typeahead/dist/bloodhound';
//import loadjQueryPlugin    from '../../../../node_modules/corejs-typeahead/dist/typeahead.bundle';
//require('../../../../node_modules/corejs-typeahead');
//window.Bloodhound = require("../../../../node_modules/corejs-typeahead/dist/bloodhound");
//require("../../../../node_modules/corejs-typeahead/dist/typeahead.jquery");
import Patternlibrary      from './app/core';

import Search              from './components/search';
Patternlibrary.Ui.register(Search, 'Search');

import DependencyChord     from './components/dependency-chord';
Patternlibrary.Ui.register(DependencyChord, 'DependencyChord');


$(document).ready(function () {

	$(document).plfoundation();
	//$(document).patternlibrary();
	
	Patternlibrary.run();
	
});
