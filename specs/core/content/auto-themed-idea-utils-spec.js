/*global require, describe, it, beforeEach, expect*/

const underTest = require('../../../src/core/content/auto-themed-idea-utils'),
	content = require('../../../src/core/content/content'),
	Theme = require('../../../src/core/theme/theme');

describe('autoThemedIdeaUtils', () => {
	'use strict';
	let activeContent, theme, idea, themeObj;
	beforeEach(() => {
		theme = {
			autoColors: ['red', 'green', 'blue'],
			name: 'test',
			layout: 'portrait',
			node: [
				{
					name: 'default'
				},
				{
					name: 'level_2',
					connections: {
						style: 'level_2',
						childstyle: 'level_2'
					}
				}
			],
			connector: {
				default: {
					line: {
						color: 'theme_inherit'
					}
				},
				level_2: {
					line: {
						color: 'theme-auto-color'
					}
				}

			}
		};
		themeObj = new Theme(theme);
		idea = {
			id: 1,
			title: 'single root node'
		};
		activeContent = content(idea);
	});
	describe('addSubIdea', () => {
		it('should add a root node child with theme configured color', () => {
			const newId = underTest.addSubIdea(activeContent, themeObj, 1, 'first child');
			expect(activeContent.findSubIdeaById(newId).attr).toEqual({
				parentConnector: {
					color: 'red',
					themeAutoColor: 'red'
				}
			});
		});
		it('should add a sub node child without a theme configured color', () => {
			const newId1 = underTest.addSubIdea(activeContent, themeObj, 1, 'first child'),
				newId2 = underTest.addSubIdea(activeContent, themeObj, newId1, 'first sub child');
			expect(activeContent.findSubIdeaById(newId2).attr).toBeFalsy();
		});
		it('should add a root node without a theme configured color', () => {
			const newId = underTest.addSubIdea(activeContent, themeObj, 'root', 'second root');
			expect(activeContent.findSubIdeaById(newId).attr).toBeFalsy();
		});
	});

	describe('insertIntermediateMultiple', () => {
		let nodeIds;
		beforeEach(() => {
			nodeIds = [];
			nodeIds.push(underTest.addSubIdea(activeContent, themeObj, 1, 'first root'));
			const id = underTest.addSubIdea(activeContent, themeObj, 1, 'second root');
			nodeIds.push(underTest.addSubIdea(activeContent, themeObj, id, 'second root child 1'));
			nodeIds.push(underTest.addSubIdea(activeContent, themeObj, id, 'second root child 2'));
		});
		it('should add a root node child with theme configured auto color', () => {
			const newId = underTest.insertIntermediateMultiple(activeContent, themeObj, nodeIds, {title: 'first intermediate'});
			expect(activeContent.findSubIdeaById(newId).attr).toEqual({
				parentConnector: {
					color: 'red',
					themeAutoColor: 'red'
				}
			});
		});
		it('should add a root node child with theme configured auto color when no attributes ar supplied', () => {
			const newId = underTest.insertIntermediateMultiple(activeContent, themeObj, nodeIds);
			expect(activeContent.findSubIdeaById(newId).attr).toEqual({
				parentConnector: {
					color: 'red',
					themeAutoColor: 'red'
				}
			});
		});

		it('should remove theme configured auto color from the moved down a level node if is no longer auto colored, preserving other attributes', () => {
			activeContent.updateAttr(nodeIds[0], 'foo', 'bar');
			underTest.insertIntermediateMultiple(activeContent, themeObj, nodeIds, {title: 'first intermediate'});
			expect(activeContent.findSubIdeaById(nodeIds[0]).attr).toEqual({
				foo: 'bar'
			});
			expect(activeContent.findSubIdeaById(nodeIds[1]).attr).toEqual({});
			expect(activeContent.findSubIdeaById(nodeIds[2]).attr).toEqual({});
		});

	});
});
