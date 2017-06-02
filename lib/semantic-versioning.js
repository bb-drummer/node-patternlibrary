/**
 * https://www.npmjs.com/package/semver
 * https://www.npmjs.com/package/update-changelog
 * 
 */
	// versioning tasks
	grunt.registerTask('timestamp', 'Creates a file with a timestamp in it', function () {
		var options = this.options({
			file: '.timestamp'
		});
		var stamp = +new Date(); // cast date into a unix timestamp
		var contents = stamp.toString();

		grunt.file.write(options.file, contents);
	});
	
	grunt.registerTask('incbuild', 'Increments build number', function () {
		var options = this.options({
			file: '.build'
		});
		var buildNo = (grunt.file.isFile(options.file) ? grunt.file.read(options.file) : '0');
		if (buildNo === '') {
			buildNo = 1;
		} else {
			buildNo = parseInt(buildNo) + 1;
		}
		grunt.file.write(options.file, buildNo);
	});
	
	grunt.registerTask('incversion', 'Increments build number', function () {
		var options = this.options({
			file: '.version'
		});
		var versionNo	= (grunt.file.isFile(options.file)	? grunt.file.read(options.file)	: '0.0.0');
		var buildNo		= (grunt.file.isFile('.build')		? grunt.file.read('.build')		: '1' );
		var timeStamp	= (grunt.file.isFile('.timestamp')	? grunt.file.read('.timestamp')	: (+new Date()) );
		if (versionNo === '') {
			versionNo = '0.0.1';
		} else {
			var ver = String(versionNo).split('.', 3);
			if (typeof ver[0] == 'undefined') { ver[0] = 0; }
			if (typeof ver[1] == 'undefined') { ver[1] = 0; }
			if (typeof ver[2] == 'undefined') { ver[2] = 0; }
			switch (options.inc) {
				case 'mayor'	: ver[0] = parseInt(ver[0]) + 1; break;
				case 'minor'	: ver[1] = parseInt(ver[1]) + 1; break;
				case 'sub'		: ver[2] = parseInt(ver[2]) + 1; break;
			}
			versionNo = ver[0] + '.' + ver[1] + '.' + ver[2];
		}
		
		grunt.file.write(options.file, versionNo);
		grunt.file.write('.release', versionNo + '-' + buildNo +  '-' + timeStamp );
	});
