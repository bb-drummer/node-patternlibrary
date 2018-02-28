var handlebars = require('handlebars');
/**
 * simple condition checker
 * 
 * USAGE:
 * 
 * {{#cond "this.myvar == 'hallo'"}}
 *     $myvar ist gleich '{{myvar}}'
 * {{else}}
 *     $myvar ist nicht gleich 'hallo'
 * {{/cond}}
 * 
 */
handlebars.registerHelper('cond', function() {

	var condition = `${arguments[0]}`;
	var options   = arguments[1];

	var result    = eval(condition.toString()); // .bind(this);
	
	if (result === true) return options.fn(this);
	else return options.inverse(this);
    
});
