#!/usr/bin/env node

const {Cli, Map} = require('cli.util'),
	path = require('path'),
	scope = require('./src/scope'),
	npm = require('./src/npm'),
	name = require('./src/name');

const cwd = process.cwd();
const cli = new Cli(process.argv, [
	new Map('user').alias(['u', 'U']).arg(),
	new Map('version').alias(['v', 'V']).arg(),
	new Map('tag').alias(['t', 'T']).arg(),
	new Map('registry').alias(['r', 'R'])
]);

(() => {
	if (cli.argument().is('npm')) {
		const u = cli.get('user') || 'anzerr';
		return npm(cwd, u).then(() => {
			console.log(`NPM Scope is now "${u}"`);
		});
	}
	if (cli.argument().is('scope')) {
		const u = cli.get('user') || 'anzerr';
		return Promise.all([
			scope(path.join(cwd, 'package.json'), u),
			scope(path.join(cwd, 'package-lock.json'), u)
		]).then(() => {
			console.log(`Scope is now "${u}"`);
		});
	}
	if (cli.argument().is('name')) {
		return name(path.join(cwd, 'package.json'), cli.get('user') || '', cli.get('version'), cli.get('tag')).then((res) => {
			process.stdout.write(cli.has('registry') ? `${process.env.INPUT_REGISTRY || ''}/${res}` : res);
		});
	}
	if (cli.argument().is('help')) {
		console.log('display command help');
		return;
	}
	console.log('command error');
})();

