/**
 * simple condition checker
 * 
 * USAGE:
 * 
 * {{#cond "this.myvar != 'hallo'"}}
 *     $myvar ist gleich '{{myvar}}'
 * {{else}}
 *     $myvar ist gleich 'hallo'
 * {{/cond}}
 * 
 */
module.exports = function() {

    var condition = `${arguments[0]}`;
    var options   = arguments[1];
    
    for (var key in options.data.root) {
        console.log('this-var:', key);
    }
    var result    = eval(condition.toString()); //.bind(this);
    
    if (result === true) return options.fn(this);
    else return options.inverse(this);
    
}
