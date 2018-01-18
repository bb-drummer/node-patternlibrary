
//import Siteapp from 'siteapp';
//import Siteapp from '../../../../bower_components/siteapp/dist/js/siteapp';
import Siteapp from '../../../../bower_components/siteapp/js/entries/siteapp';
//require('../../../../bower_components/siteapp/dist/js/siteapp');

const PatterlibraryGUI = class PatterlibraryGUI extends Siteapp {
	
};

var Patterlibrary = new PatterlibraryGUI({
	namespace: 'patternlibrary'
});

$(document).ready(function () {
	Patterlibrary.addToGlobal();
	//Patterlibrary.addToJquery();
	Patterlibrary.run();
});

//export default Patterlibrary;