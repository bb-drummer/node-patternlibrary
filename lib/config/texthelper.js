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
const TextHelper_Texts = {
	
// product
	'product-name' : 'An Awesome Product Name',
	'product-id'   : '98765-432109',
	'product-ean'  : '987-65432-109-8',
		

// contact
	'name'        : 'Marianne Mustermann',
	'name-rev'    : 'Mustermann, Marianne',
	'prename'     : 'Marianne',
	'lastname'    : 'Mustermann',
	'street'      : 'Musterstraße',
	'housenumber' : '12a',
	'streetnr'    : 'Musterstraße 12a',
	'zipcode'     : '12345',
	'city'        : 'Musterstadt',
	'zipcity'     : '12345 Musterstadt',
	'cityzip'     : 'Musterstadt, 12345',
	'country'     : 'Deutschland',
	'iso'         : 'DE',
	'phone'       : '+49 1234 5678-9012',
	'email'       : 'contact@example.com',
	'url'         : 'http://example.com',
	'social'      : '@twitter_user',
	

// date/time
	'time'      : '13:54h',
	'date'      : '12.06.2017',
	'date-long' : '12. Juni 2017',
	

// text
	'word'        : 'Loremipsum',
	'word-dashed' : 'Lorem-ipsum',
	'words'       : 'Lorem ipsum dolor sit amet',
	'normal'      : 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
	'long'        : 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
	'xlong'       : 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet,',
	'short'       : 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
	
	
	'default' : 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.'
		
};

module.exports = TextHelper_Texts;