/*global describe, it, expect, require, beforeEach*/
const calcLabelCenterPoint = require('../../src/browser/calc-label-center-point');
describe('calcLabelCenterPoint', () => {
	'use strict';
	let connectorPosition, toBox, d;
	beforeEach(() => {
		connectorPosition = {
			top: 100,
			left: 200
		};
		toBox = {
			top: 300,
			left: 250,
			width: 50
		};
		d = 'M20,10L60,30';
	});
	it('returns a percentage point on the curve if the theme position.ratio is set', () => {
		const point = calcLabelCenterPoint(connectorPosition, toBox, d, {
			position: {
				ratio: 0.25
			}
		});
		expect(point.x).toEqual(30);
		expect(point.y).toEqual(15);
	});
	it('returns a point over the end box relative to connector position if aboveEnd is set', () => {
		const point = calcLabelCenterPoint(connectorPosition, toBox, d, {
			position: {
				aboveEnd: 10
			}
		});

		//[50, 200] + [25, -10]
		expect(point.x).toEqual(75);
		expect(point.y).toEqual(190);
	});
	it('returns the center of the path if no position set in theme', () => {
		const point = calcLabelCenterPoint(connectorPosition, toBox, d, {
			xposition: {}
		});

		expect(point.x).toEqual(40);
		expect(point.y).toEqual(20);

	});

});
