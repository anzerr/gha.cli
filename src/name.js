
const fs = require('fs.promisify');

module.exports = (p, scope) => {
	return fs.readFile(p).then((res) => {
		let pack = JSON.parse(res.toString());
		if (scope) {
			return `@${(scope)}/${pack.name.replace(/(@\w+\/)+/, '')}:${pack.version}`;
		}
		return `${pack.name}:${pack.version}`;
	});
};
