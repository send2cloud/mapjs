/*global describe, it, expect, beforeEach, jasmine, require */
const $ = require('jquery'),
	observable = require('../../src/core/util/observable');
require('../../src/browser/theme-css-widget');
require('../helpers/jquery-extension-matchers');
describe('themeCssWidget', function () {
	'use strict';
	const template = '<span></span>';
	let underTest, mapModel, themeProvider, themeProcessor, domMapController;
	beforeEach(function () {
		mapModel = observable({});
		themeProcessor = jasmine.createSpyObj('themeProcessor', ['process']);
		themeProvider = {
			default: {name: 'default'},
			compact: {name: 'compact'}
		};
		themeProcessor.process.and.returnValue({css: 'old css'});
		domMapController = jasmine.createSpyObj('domMapController', ['setTheme']);
		underTest = $(template).themeCssWidget(themeProvider, themeProcessor, mapModel, domMapController);
	});
	it('should activate default theme when initialised', function () {
		expect(domMapController.setTheme).toHaveBeenCalledWith(jasmine.objectContaining({name: 'default'}));
		expect(themeProcessor.process).toHaveBeenCalledWith({name: 'default'});
		expect(underTest.text()).toEqual('old css');
	});
	it('should activate the requested theme when mapModel dispatches themeChanged', function () {
		themeProcessor.process.and.returnValue({css: 'new css'});
		domMapController.setTheme.calls.reset();
		mapModel.dispatchEvent('themeChanged', 'compact');
		expect(domMapController.setTheme).toHaveBeenCalledWith(jasmine.objectContaining({name: 'compact'}));
		expect(themeProcessor.process).toHaveBeenCalledWith({name: 'compact'});
		expect(underTest.text()).toEqual('new css');
	});

});
