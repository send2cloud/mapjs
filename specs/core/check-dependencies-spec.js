/*global describe, it, expect, require */

const packageFile = require('../../package.json');
describe('NPM package dependencies', () => {
	'use strict';
	it('requires MAPJS to put all dependencies in packages/browser-dependencies instead of main package.json', () => {
		const prodDependencies = Object.keys(packageFile.dependencies);
		expect(prodDependencies).toEqual(['@mindmup/mapjs-browser-dependencies']);
	});
});
