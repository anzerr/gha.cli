
const fs = require('fs.promisify'),
	Request = require('request.libary'),
	promise = require('promise.util'),
	path = require('path');

class Format {

	constructor(p, user) {
		this.path = p;
		this.user = user;
		this.dep = {};
		this.ref = {};
	}

	getVersion(url) {
		return new Request('https://raw.githubusercontent.com').get(`${url}/master/package.json`).then((res) => {
			return JSON.parse(res.body().toString());
		});
	}

	scan(dir, cd) {
		return fs.access(dir).then(async () => {
			let res = await fs.stat(dir);
			if (res.isDirectory()) {
				let list = await fs.readdir(dir);
				return promise.each(list, (r) => {
					return this.scan(path.join(dir, r), cd);
				}, 5);
			}
			return cd(dir);
		});
	}

	async formatPackage() {
		const pack = JSON.parse((await fs.readFile(path.join(this.path, 'package.json'))).toString()),
			wait = [],
			map = {},
			ref = {};
		pack.name = `@${this.user}/${pack.name.replace(/@.*?\//, '')}`;
		for (const i in pack.dependencies) {
			let find = pack.dependencies[i].match(/^git\+(https*|ssh):\/\/(git@)*github.com\/(.*?)\.git$/);
			if (find) {
				((id, url) => {
					wait.push(this.getVersion(url).then((res) => {
						map[`@${this.user}/${res.name}`] = `^${res.version}`;
						ref[id] = `@${this.user}/${res.name}`;
					}));
				})(i, find[3]);
			} else {
				map[i] = pack.dependencies[i];
			}
		}
		pack.dependencies = map;
		return Promise.all(wait).then(() => {
			this.ref = ref;
			return fs.writeFile(path.join(this.path, 'package.json'), JSON.stringify(pack, null, '\t'));
		});
	}

	refChange() {
		return this.scan(this.path, (file) => {
			if (!file.match(/(\\|\/)\.git(\\|\/)/) && !file.match(/(\\|\/)\dist(\\|\/)/) && file.match(/\.(ts|js)$/)) {
				return fs.readFile(file).then((res) => {
					let data = res.toString();
					for (let i in this.ref) {
						data = data.replace(new RegExp(`("|')${i.replace(/\./, '\.')}('|")`, 'gm'), `'${this.ref[i]}'`);
					}
					return fs.writeFile(file, data);
				});
			}
		});
	}

}

module.exports = (p, u) => {
	const f = new Format(p, u);
	return f.formatPackage().then(() => {
		return f.refChange();
	});
};
