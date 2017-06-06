/**
 * simple text helper to provide consistent test-data over all patterns
 * 
 * usage:
 * {{#texthelper $mode}}
 * 
 * provides text samples for
 * - text
 * - date/time
 * - contact info
 * - product info
 * 
 * default mode: short (text)
 * 
 */
module.exports = function(mode) {
	
	switch (mode) {
	
	// product
		case 'product-name' :
		    return 'An Awesome Product Name';
		break;
		case 'product-id' :
		    return '98765-432109';
		break;
		case 'product-ean' :
		    return '987-65432-109-8';
		break;
	
	// contact
		case 'name' :
		    return 'Marianne Mustermann';
		break;
		case 'name-rev' :
		    return 'Mustermann, Marianne';
		break;
		case 'prename' :
		    return 'Marianne';
		break;
		case 'lastname' :
		    return 'Mustermann';
		break;
		case 'street' :
		    return 'Musterstraße';
		break;
		case 'housenumber' :
		    return '12a';
		break;
		case 'streetnr' :
		    return 'Musterstraße 12a';
		break;
		case 'zipcode' :
		    return '12345';
		break;
		case 'city' :
		    return 'Musterstadt';
		break;
		case 'zipcity' :
		    return '12345 Musterstadt';
		break;
		case 'cityzip' :
		    return 'Musterstadt, 12345';
		break;
		case 'country' :
		    return 'Deutschland';
		break;
		case 'iso' :
		    return 'DE';
		break;
		case 'phone' :
		    return '+49 1234 5678-9012';
		break;
		case 'email' :
		    return 'contact@example.com';
		break;
		case 'url' :
		    return 'https://www.example.com';
		break;
		case 'social' :
		    return '@twitter_user';
		break;

	// date/time
		case 'time' :
		    return '13:54h';
		break;
		case 'date' :
		    return '12.06.2017';
		break;
		case 'date-long' :
		    return '12. Juni 2017';
		break;

	// text
		case 'word' :
		    return 'Loremipsum';
		break;
		case 'word-dashed' :
		    return 'Lorem-ipsum';
		break;
		case 'words' :
		    return 'Lorem ipsum dolor sit amet';
		break;
		case 'normal' :
		    return 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod \n'
		          +'tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At \n'
		          +'vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, \n'
		          +'no sea takimata sanctus est Lorem ipsum dolor sit amet.';
		break;
		case 'long' :
		    return 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod \n'
	          +'tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At \n'
	          +'vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, \n'
	          +'no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, \n'
	          +'consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore \n'
	          +'magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea \n'
	          +'rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. \n'
	          +'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor \n'
	          +'invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam \n'
	          +'et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est \n'
	          +'Lorem ipsum dolor sit amet.';
		break;
		case 'xlong' :
		    return 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod \n'
	          +'tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At \n'
	          +'vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, \n'
	          +'no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, \n'
	          +'consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore \n'
	          +'magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea \n'
	          +'rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. \n'
	          +'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor \n'
	          +'invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam \n'
	          +'et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est \n'
	          +'Lorem ipsum dolor sit amet. Duis autem vel eum iriure dolor in hendrerit in vulputate velit \n'
	          +'esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan \n'
	          +'et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te \n'
	          +'feugait nulla facilisi. Lorem ipsum dolor sit amet,';
		break;
		
		case 'short' :
		default :
		    return 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod \n'
	          +'tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.';
		break;
		
	}
	
}
