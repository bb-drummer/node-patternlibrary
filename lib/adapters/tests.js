//
// @SOON: split up into testsass, testjs, testui
//
var fs          = require('fs');

module.exports = function(value, config, cb, pl) {
    var data = getPatternSpecs (value, config, pl);
    cb(null, processTree(data));
}

module.exports.config = {
    verbose: false
}

module.exports.search = function(items, link) {
    var results = [];
    // this => collider
    /* results.push({
        name: name,
        type: 'sass ' + type,
        description: description,
        link: link + hash
    }); */

    return results;
}


function getPatternSpecs(value, config, pl) {
    if (!fs.existsSync(value)) return false;
    //var sourceFile = frontMatter(fs.readFileSync(value).toString());
    return {};
}


function processTree(tree) {

    // do stuff...

    return tree; //my_stuff;
}

