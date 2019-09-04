#!/usr/bin/env node

const {Cli, Map} = require('cli.util'),
	path = require('path'),
	scope = require('./src/scope');

const cwd = process.cwd();
const cli = new Cli(process.argv, [
	new Map('user').alias(['u', 'U']).arg()
]);

(() => {
	if (cli.argument().is('scope')) {
		const u = cli.get('user') || 'anzerr';
		return Promise.all([
			scope(path.join(cwd, 'package.json'), u),
			scope(path.join(cwd, 'package-lock.json'), u)
		]).then(() => {
			console.log(`Scope is now "${u}"`);
		});
	}
	if (cli.argument().is('help')) {
		console.log('display command help');
		return;
	}
	console.log('command error');
})();

