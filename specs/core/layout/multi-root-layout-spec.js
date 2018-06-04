/*global describe, beforeEach, it, require, expect*/
const MultiRootLayout = require('../../../src/core/layout/multi-root-layout');

describe('MultiRootLayout', function () {
	'use strict';
	let underTest,
		rootLayouts,
		defaultRootMargin;
	beforeEach(function () {
		underTest = new MultiRootLayout();
		rootLayouts = {
			first: {
				1: {level: 1, x: -50, y: -10, height: 20, width: 100}
			},
			second: {
				2: {level: 1, x: -40, y: -12, height: 24, width: 80}
			}
		};
		defaultRootMargin = 20;
	});
	it('should throw an exception if no margin supplied', function () {
		underTest.appendRootNodeLayout(rootLayouts.first, {id: 1});
		expect(function () {
			underTest.getCombinedLayout();
		}).toThrow();
	});
	it('should return a single root layout unchanged', function () {
		underTest.appendRootNodeLayout(rootLayouts.first, {id: 1});
		expect(underTest.getCombinedLayout(defaultRootMargin)).toEqual(rootLayouts.first);
	});
	it('should reposition when to single root nodes are appended', function () {
		underTest.appendRootNodeLayout(rootLayouts.first, {id: 1});
		underTest.appendRootNodeLayout(rootLayouts.second, {id: 2});
		expect(underTest.getCombinedLayout(defaultRootMargin)).toEqual({
			1: { level: 1, x: -50, y: -10, height: 20, width: 100, rootId: 1},
			2: { level: 1, x: 90, y: -12, height: 24, width: 80, rootId: 2}
		});
	});
	it('should reposition according to major axis horizontally', function () {
		underTest.appendRootNodeLayout(rootLayouts.first, {id: 1, attr: {position: [-50, -10, 2]}});
		underTest.appendRootNodeLayout(rootLayouts.second, {id: 2, attr: {position: [30, -5, 1]}});
		expect(underTest.getCombinedLayout(defaultRootMargin)).toEqual({
			1: { level: 1, x: -50, y: -10, height: 20, width: 100, rootId: 1},
			2: { level: 1, x: 90, y: -5, height: 24, width: 80, rootId: 2}
		});
	});
	it('should put layouts into desired positions if not overlapping', function () {
		underTest.appendRootNodeLayout(rootLayouts.first, {id: 1, attr: {position: [-200, -100, 2]}});
		underTest.appendRootNodeLayout(rootLayouts.second, {id: 2, attr: {position: [200, 50, 1]}});
		expect(underTest.getCombinedLayout(defaultRootMargin)).toEqual({
			1: { level: 1, x: -200, y: -100, height: 20, width: 100, rootId: 1},
			2: { level: 1, x: 200, y: 50, height: 24, width: 80, rootId: 2}
		});
	});
	it('should push layouts out according to the major X axis when overlapping', function () {
		underTest.appendRootNodeLayout(rootLayouts.first, {id: 1, attr: {position: [-20, -10, 2]}});
		underTest.appendRootNodeLayout(rootLayouts.second, {id: 2, attr: {position: [20, 5, 1]}});
		expect(underTest.getCombinedLayout(defaultRootMargin)).toEqual({
			1: { level: 1, x: -20, y: -10, height: 20, width: 100, rootId: 1},
			2: { level: 1, x: 120, y: 5, height: 24, width: 80, rootId: 2}
		});
	});
	it('should push layouts out according to the major Y axis when overlapping', function () {
		underTest.appendRootNodeLayout(rootLayouts.first, {id: 1, attr: {position: [-20, -80, 2]}});
		underTest.appendRootNodeLayout(rootLayouts.second, {id: 2, attr: {position: [-2, -75, 1]}});
		expect(underTest.getCombinedLayout(defaultRootMargin)).toEqual({
			1: { level: 1, x: -20, y: -80, height: 20, width: 100, rootId: 1},
			2: { level: 1, x: -2, y: -144, height: 24, width: 80, rootId: 2}
		});
	});


});
