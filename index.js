
const {Cli, Map} = require('cli.util'),
	path = require('path'),
	scope = require('./src/scope');

const cwd = process.cwd();
const cli = new Cli(process.argv, [
	new Map('help')
		.alias(['h', 'H']),
	new Map('port')
		.alias(['p', 'P'])
		.argument()
], 1);

(() => {
	if (cli.argument().is('scope')) {
		const u = cli.get('user') || 'anzerr';
		return Promise.all([
			scope(path.join(cwd, 'package.json'), u),
			scope(path.join(cwd, 'package-lock.json'), u)
		]);
	}
	if (cli.argument().is('help')) {
		console.log('display command help');
		return;
	}
	console.log('command error');
})();

