/*global require, describe, it, beforeEach, expect, jasmine*/

const underTest = require('../../../src/core/content/auto-themed-idea-utils'),
	content = require('../../../src/core/content/content'),
	Theme = require('../../../src/core/theme/theme');

describe('autoThemedIdeaUtils', () => {
	'use strict';
	let activeContent, theme, themeSource, idea;
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
		themeSource = jasmine.createSpy('themeSource').and.callFake(() => new Theme(theme));
		idea = {
			id: 1,
			title: 'single root node'
		};
		activeContent = content(idea);
	});
	describe('addSubIdea', () => {
		it('should add a root node child with theme configured color', () => {
			const newId = underTest.addSubIdea(activeContent, themeSource, 1, 'first child');
			expect(activeContent.findSubIdeaById(newId).attr).toEqual({
				parentConnector: { color: 'red' }
			});
		});
		it('should add a sub node child without a theme configured color', () => {
			const newId1 = underTest.addSubIdea(activeContent, themeSource, 1, 'first child'),
				newId2 = underTest.addSubIdea(activeContent, themeSource, newId1, 'first sub child');
			expect(activeContent.findSubIdeaById(newId2).attr).toBeFalsy();
		});
		it('should add a root node without a theme configured color', () => {
			const newId = underTest.addSubIdea(activeContent, themeSource, 'root', 'second root');
			expect(activeContent.findSubIdeaById(newId).attr).toBeFalsy();
		});
	});
});
