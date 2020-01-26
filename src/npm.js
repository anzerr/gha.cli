
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

	async formatPackage(key) {
		const pack = JSON.parse((await fs.readFile(path.join(this.path, 'package.json'))).toString()),
			wait = [],
			map = {},
			ref = {};
		pack.name = `@${this.user}/${pack.name.replace(/@.*?\//, '')}`;
		for (const i in pack[key]) {
			let find = pack[key][i].match(/^git\+(https*|ssh):\/\/(git@)*github.com\/(.*?)\.git$/);
			if (find) {
				((id, url) => {
					wait.push(this.getVersion(url).then((res) => {
						map[`@${this.user}/${res.name}`] = `^${res.version}`;
						ref[id] = `@${this.user}/${res.name}`;
					}));
				})(i, find[3]);
			} else {
				map[i] = pack[key][i];
			}
		}
		pack[key] = map;
		return Promise.all(wait).then(() => {
			this.ref = {...this.ref, ...ref};
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
		}).then(async () => {
			const file = path.join(this.path, 'package.json');
			let data = (await fs.readFile(file)).toString();
			console.log(this.ref);
			for (let i in this.ref) {
				data = data.replace(new RegExp(`"${i.replace(/\./, '\.')}"`, 'gm'), `"${this.ref[i]}"`);
			}
			console.log(data);
			return fs.writeFile(file, data);
		});
	}

}

module.exports = (p, u) => {
	const f = new Format(p, u);
	return f.formatPackage('dependencies').then(() => {
		return f.formatPackage('devDependencies');
	}).then(() => {
		return f.refChange();
	});
};
