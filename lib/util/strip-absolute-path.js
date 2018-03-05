var path = require('path');



function stripAbsolutePath ( pathstr ) {
	
	return String(pathstr)
	   .replace(process.cwd(), '')
	   .replace(path.join(__dirname, '../../'), '')
	;
}

module.exports = stripAbsolutePath;