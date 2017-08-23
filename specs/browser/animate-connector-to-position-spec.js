/*global describe, it, beforeEach, afterEach, expect, spyOn, require */
const jQuery = require('jquery'),
	_ = require('underscore');

require('../../src/browser/animate-connector-to-position');

require('../helpers/jquery-extension-matchers');
describe('animateConnectorToPosition', function () {
	'use strict';
	let from, to, connector;
	beforeEach(function () {
		from = jQuery('<div>').attr('id', 'fromC').appendTo('body').css({position: 'absolute', width: 50, height: 60, left: 70, top: 80}).data({width: 50, height: 60, x: 70, y: 80});
		to = jQuery('<div>').attr('id', 'toC').appendTo('body').css({position: 'absolute', width: 90, height: 100, left: 110, top: 120}).data({width: 90, height: 100, x: 110, y: 120});
		connector = jQuery('<div>').data({type: 'connector', 'nodeFrom': from, 'nodeTo': to}).appendTo('body');
		spyOn(jQuery.fn, 'animate').and.callThrough();
	});
	afterEach(function () {
		from.add(to).add(connector).remove();
	});
	describe('optimises connector transformations to simple animations if possible', function () {
		let result;
		it('when dataBox and real dom boxes for connecting element have just moved by the same offset', function () {
			from.data('x', from.data('x') + 20);
			from.data('y', from.data('y') + 30);
			to.data('x', to.data('x') + 20);
			to.data('y', to.data('y') + 30);
			result = connector.animateConnectorToPosition({ duration: 230, queue: 'animQueue' });
			expect(result).toBeTruthy();
			expect(jQuery.fn.animate).toHaveBeenCalledWith({ left: 90, top: 110 }, { duration: 230, queue: 'animQueue'});
		});
		it('when the movement difference  is less than threshold (to avoid small rounding errors)', function () {
			from.data('x', from.data('x') + 22);
			from.data('y', from.data('y') + 30);
			to.data('x', to.data('x') + 20);
			to.data('y', to.data('y') + 33);
			result = connector.animateConnectorToPosition({ duration: 230, queue: 'animQueue' }, 5);
			expect(result).toBeTruthy();
			expect(jQuery.fn.animate).toHaveBeenCalledWith({ left: 92, top: 110 }, { duration: 230, queue: 'animQueue'});
		});
		it('rounds the coordinates to avoid performance problems', function () {
			from.data('x', from.data('x') + 20.1);
			from.data('y', from.data('y') + 30.3);
			to.data('x', to.data('x') + 20.3);
			to.data('y', to.data('y') + 30.1);
			result = connector.animateConnectorToPosition({ duration: 230, queue: 'animQueue' });
			expect(result).toBeTruthy();
			expect(jQuery.fn.animate).toHaveBeenCalledWith({ left: 90, top: 110 }, { duration: 230, queue: 'animQueue'});
		});
	});
	describe('returns false and does not schedule animations if box differences are nor resolvable using simple translation', function () {
		it('when orientation changes', function () {
			const fromData = _.clone(from.data());
			from.data(to.data());
			to.data(fromData);
			expect(connector.animateConnectorToPosition()).toBeFalsy();
			expect(jQuery.fn.animate).not.toHaveBeenCalled();
		});
		_.each(['fromC', 'toC'], function (changeId) {
			_.each(['width', 'height', 'x', 'y'], function (attrib) {
				it('when node boxes change independently (' + changeId + ' ' + attrib, function () {
					const changeOb = jQuery('#' + changeId);
					changeOb.data(attrib, changeOb.data(attrib) + 5.1);
					expect(connector.animateConnectorToPosition({}, 5)).toBeFalsy();
					expect(jQuery.fn.animate).not.toHaveBeenCalled();
				});
			});
		});

	});

});
