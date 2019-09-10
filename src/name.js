
const fs = require('fs.promisify');

module.exports = (p, scope, version) => {
	return fs.readFile(p).then((res) => {
		let pack = JSON.parse(res.toString());
		if (scope) {
			return `${(scope)}/${pack.name.replace(/(@\w+\/)+/, '')}:${version || pack.version}`;
		}
		return `${pack.name}:${version || pack.version}`;
	});
};
