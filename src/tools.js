const cp = require('child_process');

function log(message) {
  console.log(message)
}
function info(message) {
  console.log(message)
}

function exec(command, options) {
  // execute shell command
	return new Promise((resolve, reject) => {
		cp.exec(command, options, (error, stdout, stderr) => {
			if (error) {
				reject({ error, stdout, stderr });
			}
			resolve({ stdout, stderr });
		});
	});
}

module.exports = {
  log,
  exec,
  info
}