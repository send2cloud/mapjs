/*global describe, it, expect, beforeEach, jasmine, require */
const $ = require('jquery'),
	observable = require('../../src/core/util/observable');
require('../../src/browser/theme-css-widget');
require('../helpers/jquery-extension-matchers');
describe('themeCssWidget', function () {
	'use strict';
	const template = '<span></span>';
	let underTest, mapThemeModel, optional;
	beforeEach(function () {
		mapThemeModel = observable({});
		optional = {
			themeProcessor: jasmine.createSpyObj('themeProcessor', ['process'])
		};
		optional.themeProcessor.process.and.returnValue({css: 'old css'});
		underTest = $(template).themeCssWidget(mapThemeModel, optional);
	});
	it('should throw invalid-args if created without a mapThemeModel', () => expect(() => $(template).themeCssWidget(undefined, optional)).toThrow('invalid-args'));
	it('should activate the requested theme when mapThemeModel dispatches themeJSONChanged', function () {
		optional.themeProcessor.process.and.returnValue({css: 'new css'});
		mapThemeModel.dispatchEvent('themeJSONChanged', 'themeJSONHere');
		expect(optional.themeProcessor.process).toHaveBeenCalledWith('themeJSONHere');
		expect(underTest.text()).toEqual('new css');
	});

});
