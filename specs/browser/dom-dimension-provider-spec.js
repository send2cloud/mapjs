/*global describe, it, beforeEach, afterEach, expect, jasmine, require */
const jQuery = require('jquery'),
	_ = require('underscore'),
	nodeCacheMark = require('../../src/browser/node-cache-mark'),
	domDimensionProvider = require('../../src/browser/dom-dimension-provider');

describe('domDimensionProvider', function () {
	'use strict';
	let newElement, oldUpdateNodeContent, idea;
	beforeEach(function () {
		oldUpdateNodeContent = jQuery.fn.updateNodeContent;
		idea = {id: 'foo.1', title: 'zeka'};
	});
	afterEach(function () {
		if (newElement) {
			newElement.remove();
		}
		jQuery.fn.updateNodeContent = oldUpdateNodeContent;
	});
	it('calculates the width and height of node by drawing an invisible box with .mapjs-node and detaching it after', function () {
		newElement = jQuery('<style type="text/css">.mapjs-node { width:456px !important; min-height:789px !important}</style>').appendTo('body');
		expect(domDimensionProvider(idea)).toEqual({width: 456, height: 789});
		expect(jQuery('.mapjs-node').length).toBe(0);
	});
	describe('when ideas has a width attribute', function () {
		beforeEach(function () {
			newElement = jQuery('<style type="text/css">.mapjs-node span { min-height:789px; display: inline-block;}</style>').appendTo('body');
		});
		it('should use the width if greater than than the text width', function () {
			idea.attr = {
				style: {
					width: 500
				}
			};
			expect(domDimensionProvider(idea)).toEqual({width: 500, height: 789});
		});
		it('should use the width if greater than than the max unwrappable text width', function () {
			idea.attr = {
				style: {
					width: 500
				}
			};
			idea.title = 'some short words are in this title that is still a quite long piece of text';
			expect(domDimensionProvider(idea)).toEqual({width: 500, height: 789});
		});
		it('should use max unwrappable text width if greater than the prefferred width', function () {
			idea.attr = {
				style: {
					width: 500
				}
			};
			idea.title = 'someWshortWwordsWareWinWthisWtitleWthatWisWstillWaWquiteWlongWpieceWofWtext';
			expect(domDimensionProvider(idea).width).toBeGreaterThan(500);
		});
	});
	it('takes level into consideration when calculating node dimensions', function () {
		newElement = jQuery('<style type="text/css">' +
			'.mapjs-node { width:356px !important; min-height:389px !important} ' +
			'.mapjs-node[mapjs-level="1"] { width:456px !important; min-height:789px !important} ' +
			'</style>').appendTo('body');
		expect(domDimensionProvider(idea, 1)).toEqual({width: 456, height: 789});
		expect(domDimensionProvider(idea, 2)).toEqual({width: 356, height: 389});

	});
	it('applies the updateNodeContent function while calculating dimensions', function () {
		jQuery.fn.updateNodeContent = function () {
			this.css('width', '654px');
			this.css('height', '786px');
			return this;
		};
		expect(domDimensionProvider(idea)).toEqual({width: 654, height: 786});
	});
	describe('caching', function () {
		beforeEach(function () {
			jQuery.fn.updateNodeContent = jasmine.createSpy();
			jQuery.fn.updateNodeContent.and.callFake(function () {
				this.css('width', '654px');
				this.css('height', '786px');
				return this;
			});
		});
		it('looks up a DOM object with the matching node ID and if the node cache mark matches, returns the DOM width without re-applying content', function () {
			newElement = jQuery('<div>').data({width: 111, height: 222}).attr('id', 'node_foo_1').appendTo('body');
			newElement.data('nodeCacheMark', nodeCacheMark(idea));
			expect(domDimensionProvider(idea)).toEqual({width: 111, height: 222});
			expect(jQuery.fn.updateNodeContent).not.toHaveBeenCalled();
		});
		it('ignores DOM objects where the cache mark does not match', function () {
			newElement = jQuery('<div>').data({width: 111, height: 222}).attr('id', 'node_foo_1').appendTo('body');
			newElement.data('nodeCacheMark', nodeCacheMark(idea));
			expect(domDimensionProvider(_.extend(idea, {title: 'not zeka'}))).toEqual({width: 654, height: 786});
			expect(jQuery.fn.updateNodeContent).toHaveBeenCalled();
		});
		it('passes the level as an override when finding the cache mark', function () {
			newElement = jQuery('<div>').data({width: 111, height: 222}).attr('id', 'node_foo_1').appendTo('body');
			idea.level = 5;
			newElement.data('nodeCacheMark', nodeCacheMark(idea));
			idea.level = undefined;
			expect(domDimensionProvider(idea, 5)).toEqual({width: 111, height: 222});
			expect(jQuery.fn.updateNodeContent).not.toHaveBeenCalled();
		});
	});
});
