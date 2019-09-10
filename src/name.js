
const fs = require('fs.promisify');

module.exports = (p, scope, version, t) => {
	return fs.readFile(p).then((res) => {
		const pack = JSON.parse(res.toString()), tag = (t) ? '/' + t : '';
		if (scope) {
			return `${(scope)}/${pack.name.replace(/(@\w+\/)+/, '')}${tag}:${version || pack.version}`;
		}
		return `${pack.name}${tag}:${version || pack.version}`;
	});
};
