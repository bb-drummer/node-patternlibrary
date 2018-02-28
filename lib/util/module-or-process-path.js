import path from 'path';
import fs from 'fs';

function moduleOrProcessPath ( file_or_dir ) {
	
	var module     = path.join(__dirname, '../../'),
	    cwd        = process.cwd(),
	    relPath    = path.relative(cwd, module),
	    
	    cwdFile    = path.join(cwd, file_or_dir),
	    moduleFile = path.join(module, file_or_dir),
	    relFile    = path.join(relPath, file_or_dir);
	
	if ( (moduleFile != cwdFile) ) {
		if ( !fs.existsSync(cwdFile) && !fs.existsSync(cwdFile)) {
			
			// dindn't find in 'process' dir but found in 'module' dir 
			return (relFile);
			
		}
	}

	return (cwdFile);
	
}

module.exports = moduleOrProcessPath;