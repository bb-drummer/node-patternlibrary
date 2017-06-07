/**
 * Aufruf in templates per
 * 
 * {{#ifCond value="1" comp="2" mode='lt'}}
 *     "1" ist kleiner "2"
 * {{else}}
 *     "1" ist nicht kleiner "2"
 * {{/ifCond}}
 * 
 * mögliche "mode"s:
 * - eq   ==
 * - lt   <
 * - gt   >
 * - lte  <=
 * - gte  >=
 * - neq  !=
 * 
 */
module.exports = function(options) {
    var 
        modes = ['eq', 'lt', 'gt', 'lte', 'gte', 'neq'],
        mode = ( (typeof options.hash.mode != 'undefined') && (modes.indexOf(options.hash.mode) != -1) ) ? options.hash.mode : 'eq'
    ;
    
    switch (mode) {
        case 'lt' :
            if (options.hash.value < options.hash.comp) return options.fn(this);
        break;
        case 'gt' :
            if (options.hash.value > options.hash.comp) return options.fn(this);
        break;
        case 'lte' :
            if (options.hash.value <= options.hash.comp) return options.fn(this);
        break;
        case 'gte' :
            if (options.hash.value >= options.hash.comp) return options.fn(this);
        break;
        case 'neq' :
            if (options.hash.value != options.hash.comp) return options.fn(this);
        break;
        case 'eq' :
        default :
            if (options.hash.value == options.hash.comp) return options.fn(this);
        break;
    }
    return options.inverse(this);
}
