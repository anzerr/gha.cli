
const fs = require('fs.promisify');

module.exports = (p, scope) => {
	return fs.readFile(p).then((res) => {
		let pack = JSON.parse(res.toString());
		pack.name = `@${(scope)}/${pack.name.replace(/(@\w+\/)+/, '')}`;
		return fs.writeFile(p, JSON.stringify(pack, null, '\t'));
	});
};
