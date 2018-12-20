/*global require, module */
const mapjsFixture = require('./mapjs-fixture'),
	defaultTheme = require('../../src/core/theme/default-theme'),
	mergeThemes = require('../../src/core/theme/merge-themes'),
	getTheme = function (titleProps) {
		'use strict';
		if (!titleProps.textTheme) {
			return false;
		}
		return mergeThemes(defaultTheme, {
			node: [{
				name: 'default',
				text: titleProps.textTheme
			}]
		});
	},
	buildMap = function (titleProps) {
		'use strict';
		return {
			formatVersion: 3,
			id: 'root',
			ideas: {
				1: {
					title: titleProps.title,
					id: 1,
					attr: {
						style: titleProps.style
					}
				}
			},
			labels: {
				1: titleProps.label
			},
			theme: getTheme(titleProps)
		};
	};


module.exports = function (titleProps) {
	'use strict';
	return mapjsFixture(buildMap(titleProps));
};

