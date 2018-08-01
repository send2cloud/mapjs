/*global module, require*/
const deepAssign = require('../deep-assign'),
	colorParser = require('./color-parser'),
	themeFallbackValues = require('./theme-fallback-values'),
	attributeForPath = function (object, pathArray, fallback) {
		'use strict';
		if (!object || !pathArray || !pathArray.length) {
			return (object === undefined && fallback) || object;
		}
		if (pathArray.length === 1) {
			return (object[pathArray[0]] === undefined && fallback) || object[pathArray[0]];
		}
		let remaining = pathArray.slice(0),
			current = object;

		while (remaining.length > 0) {
			current = current[remaining[0]];
			if (current === undefined) {
				return fallback;
			}
			remaining = remaining.slice(1);
		}
		return current;
	},
	themeAttributeValue = (themeDictionary, prefixes, styles, postfixes, fallback) => {
		'use strict';
		const rootElement = attributeForPath(themeDictionary, prefixes);
		let toAssign = [{}];
		if (!rootElement) {
			return fallback;
		}
		if (styles && styles.length) {
			toAssign = toAssign.concat(styles.slice(0).reverse().map(style => rootElement[style]).filter(item => !!item));
		} else {
			toAssign.push(rootElement);
		}
		return attributeForPath(deepAssign.apply(deepAssign, toAssign), postfixes, fallback);
	},
	nodeAttributeToNodeTheme = (nodeAttribute) => {
		'use strict';
		const getBackgroundColor = function () {
				const colorObj = attributeForPath(nodeAttribute, ['background']);
				if (colorObj) {
					return colorParser(colorObj);
				}
				return attributeForPath(nodeAttribute, ['backgroundColor']);
			},
			result = deepAssign({}, themeFallbackValues.nodeTheme);
		if (nodeAttribute) {
			result.margin = attributeForPath(nodeAttribute, ['text', 'margin'], result.margin);
			result.font = deepAssign({}, result.font, attributeForPath(nodeAttribute, ['text', 'font'], result.font));
			result.text = deepAssign({}, result.text, attributeForPath(nodeAttribute, ['text'], result.text));
			result.borderType = attributeForPath(nodeAttribute, ['border', 'type'], result.borderType);
			result.backgroundColor = getBackgroundColor() || result.backgroundColor;
			result.cornerRadius = attributeForPath(nodeAttribute, ['cornerRadius'], result.cornerRadius);
			result.lineColor = attributeForPath(nodeAttribute, ['border', 'line', 'color'], result.lineColor);
		}
		return result;

	},
	connectorControlPoint = (themeDictionary, childPosition, connectorStyle) => {
		'use strict';
		const controlPointOffset = childPosition === 'horizontal' ? themeFallbackValues.connectorControlPoint.horizontal : themeFallbackValues.connectorControlPoint.default,
			defaultControlPoint = {'width': 0, 'height': controlPointOffset},
			configuredControlPoint = connectorStyle && attributeForPath(themeDictionary, ['connector', connectorStyle, 'controlPoint', childPosition]);

		return (configuredControlPoint && Object.assign({}, configuredControlPoint)) || defaultControlPoint;
	};

module.exports = {
	attributeForPath: attributeForPath,
	themeAttributeValue: themeAttributeValue,
	nodeAttributeToNodeTheme: nodeAttributeToNodeTheme,
	connectorControlPoint: connectorControlPoint
};
