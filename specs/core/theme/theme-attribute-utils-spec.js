/*global require, describe, it, expect, beforeEach*/
const themeToDictionary = require('../../../src/core/theme/theme-to-dictionary'),
	defaultTheme = require('../../../src/core/theme/default-theme'),
	deepAssign = require('../../../src/core/deep-assign'),
	themeFallbackValues = require('../../../src/core/theme/theme-fallback-values'),
	underTest = require('../../../src/core/theme/theme-attribute-utils');

describe('themeAttributeUtils', () => {
	'use strict';
	let themeDictionary;
	beforeEach(() => {
		themeDictionary = themeToDictionary(defaultTheme);
	});
	describe('attributeForPath', () => {
		it('should return attribute value for path', () => {
			expect(underTest.attributeForPath(themeDictionary, ['node'], 'fallbackValueHere')).toEqual(themeDictionary.node);
			expect(underTest.attributeForPath(themeDictionary, ['node', 'default'], 'fallbackValueHere')).toEqual(themeDictionary.node.default);
			expect(underTest.attributeForPath(themeDictionary.connector.default.controlPoint.above, ['width'], 'fallbackValueHere')).toEqual(0);
		});
		it('return attribute 0 value for path', () => {
			expect(underTest.attributeForPath(themeDictionary.connector.default.controlPoint, ['above', 'width'], 'fallbackValueHere')).toEqual(0);
			expect(underTest.attributeForPath(themeDictionary.connector.default.controlPoint.above, ['width'], 'fallbackValueHere')).toEqual(0);
			expect(underTest.attributeForPath(themeDictionary.connector.default.controlPoint.above.width, [], 'fallbackValueHere')).toEqual(0);

		});
		describe('should return root object', () => {
			it('when pathArray is empty', () => {
				expect(underTest.attributeForPath(themeDictionary, [], 'fallbackValueHere')).toEqual(themeDictionary);
			});
			it('when pathArray is falsy', () => {
				expect(underTest.attributeForPath(themeDictionary, undefined, 'fallbackValueHere')).toEqual(themeDictionary);
			});

		});
		describe('should return provided fallback', () => {
			it('when object is falsy', () => {
				expect(underTest.attributeForPath(undefined, ['node'], 'fallbackValueHere')).toEqual('fallbackValueHere');
			});
			it('when object is falsy and pathArray is empty', () => {
				expect(underTest.attributeForPath(undefined, [], 'fallbackValueHere')).toEqual('fallbackValueHere');
			});
			it('when object and pathArray are falsy', () => {
				expect(underTest.attributeForPath(undefined, undefined, 'fallbackValueHere')).toEqual('fallbackValueHere');
			});
			it('when attribute for path is falsy', () => {
				expect(underTest.attributeForPath(themeDictionary, ['node', 'wut'], 'fallbackValueHere')).toEqual('fallbackValueHere');
			});
		});
	});
	describe('themeAttributeValue', () => {
		it('should return a merged value for the styles', () => {
			const expected = deepAssign({}, themeDictionary.node.default, themeDictionary.node.level_1);
			expect(underTest.themeAttributeValue(themeDictionary, ['node'], ['level_1', 'default'])).toEqual(expected);
		});
		it('should ignore styles that are not in the theme', () => {
			const expected = deepAssign({}, themeDictionary.node.default, themeDictionary.node.level_1);
			expect(underTest.themeAttributeValue(themeDictionary, ['node'], ['level_foo', 'level_1', 'default'])).toEqual(expected);
		});
		it('should use postfixes to return part of the merged attribute', () => {
			expect(underTest.themeAttributeValue(themeDictionary, ['node'], ['level_1', 'default'], ['text', 'font'])).toEqual(themeDictionary.node.default.text.font);
		});
		it('should return the fallback value if nothing found', () => {
			expect(underTest.themeAttributeValue(themeDictionary, ['node'], ['level_1', 'default'], ['text', 'font', 'wut'], 'fallbackValueHere')).toEqual('fallbackValueHere');
		});
		it('should not return the fallback value if attribute value is 0', () => {
			expect(underTest.themeAttributeValue(themeDictionary, ['connector'], ['default'], ['controlPoint', 'above', 'width'], 'fallbackValueHere')).toEqual(0);
		});
	});
	describe('nodeAttributeToNodeTheme', () => {
		let nodeAttribute;
		beforeEach(() => {
			nodeAttribute = underTest.themeAttributeValue(themeDictionary, ['node'], ['level_1', 'default']);
		});
		describe('should return defaults', () => {
			it('when merged object is falsy', () => {
				expect(underTest.nodeAttributeToNodeTheme()).toEqual(themeFallbackValues.nodeTheme);
			});
			it('when merged object is empty', () => {
				expect(underTest.nodeAttributeToNodeTheme({})).toEqual(themeFallbackValues.nodeTheme);
			});
		});
		describe('should return result with attributes', () => {
			it('margin', () => {
				expect(underTest.nodeAttributeToNodeTheme(nodeAttribute).margin).toEqual(nodeAttribute.text.margin);
			});
			it('font', () => {
				expect(underTest.nodeAttributeToNodeTheme(nodeAttribute).font).toEqual(nodeAttribute.text.font);
			});
			it('text', () => {
				expect(underTest.nodeAttributeToNodeTheme(nodeAttribute).text).toEqual(nodeAttribute.text);
			});
			it('borderType', () => {
				expect(underTest.nodeAttributeToNodeTheme(nodeAttribute).borderType).toEqual(nodeAttribute.border.type);
			});
			it('backgroundColor', () => {
				expect(underTest.nodeAttributeToNodeTheme(nodeAttribute).backgroundColor).toEqual(nodeAttribute.backgroundColor);
			});
			it('cornerRadius', () => {
				expect(underTest.nodeAttributeToNodeTheme(nodeAttribute).cornerRadius).toEqual(nodeAttribute.cornerRadius);
			});
			it('lineColor', () => {
				expect(underTest.nodeAttributeToNodeTheme(nodeAttribute).lineColor).toEqual(nodeAttribute.border.line.color);

			});
		});
	});
});
