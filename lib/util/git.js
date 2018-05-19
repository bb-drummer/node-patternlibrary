var childProcess = require('child_process');

module.exports = {

  log: function(filepath, pretty, callback) {
	  var dateformat = 'short';
	  
	  // git log --date=format:"%d/%m/%Y" --pretty=format:"## %cd%n- %an <%ae>: %s (%H)" src/partials/atoms/link/index.html
	  var cmd = 'git log' + 
          (' --date='+dateformat) + 
          (pretty ? ' --pretty='+pretty : '') + 
	      (filepath ? ' '+filepath : '');
	  
	  return childProcess.execSync(cmd);
  }

};
