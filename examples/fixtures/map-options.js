/*global require, module */
const svgMapFixture = require('./svg-map-fixture'),
	buildMap = function (exportProps) {
		'use strict';
		return {
			formatVersion: 3,
			id: 'root',
			ideas: {
				1: {
					title: 'parent',
					id: 1,
					attr: {
						position: [-185, -182, 1]
					},
					ideas: {
						1: {
							title: 'child',
							id: 2,
							attr: {
								position: [170, 157, 1]
							}
						}
					}
				}
			},
			export: exportProps
		};
	};


module.exports = function buildSvgMap(mapOptions) {
	'use strict';
	return svgMapFixture(buildMap(mapOptions.export), mapOptions);
};
