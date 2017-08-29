/*global describe, it, expect, require */

const packageFile = require('../../src/core/package.json');
describe('NPM package dependencies', () => {
	'use strict';
	it('requires MAPJS to put all dependencies in packages/core-dependencies instead of main package.json', () => {
		const prodDependencies = Object.keys(packageFile.dependencies);
		expect(prodDependencies).toEqual(['@mindmup/mapjs-core-dependencies']);
	});
});
