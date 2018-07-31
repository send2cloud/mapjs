/*global module, require */
const _ = require('underscore'),
	AUTO_COLOR = 'theme-auto-color',
	themeFallbackValues = require('./theme-fallback-values'),
	themeToDictionary = require('./theme-to-dictionary'),
	themeAttributeUtils = require('./theme-attribute-utils'),
	defaultTheme = require('./default-theme');
module.exports = function Theme(themeJson) {
	'use strict';

	const self = this,
		themeDictionary = themeToDictionary(themeJson),
		getElementForPath = function (object, pathArray) {
			let remaining = pathArray.slice(0),
				current = object;

			while (remaining.length > 0) {
				current = current[remaining[0]];
				if (current === undefined) {
					return;
				}
				remaining = remaining.slice(1);
			}
			return current;
		};

	self.getFontForStyles = function (themeStyles) {
		const weight = self.attributeValue(['node'], themeStyles, ['text', 'font', 'weight'], 'semibold'),
			size = self.attributeValue(['node'], themeStyles, ['text', 'font', 'size'], themeFallbackValues.nodeTheme.font.size),
			lineSpacing = self.attributeValue(['node'], themeStyles, ['text', 'font', 'lineSpacing'], themeFallbackValues.nodeTheme.font.lineSpacing);
		return {size: size, weight: weight, lineGap: lineSpacing};
	};
	self.getNodeMargin = function (themeStyles) {
		return self.attributeValue(['node'], themeStyles, ['text', 'margin'], themeFallbackValues.nodeTheme.margin);
	};
	self.name = themeJson && themeJson.name;
	self.connectorEditingContext = themeJson && themeJson.connectorEditingContext;
	//TODO: rempve blockParentConnectorOverride once site has been live for a while
	self.blockParentConnectorOverride = themeJson && themeJson.blockParentConnectorOverride;

	self.attributeValue = (prefixes, styles, postfixes, fallback) => themeAttributeUtils.themeAttributeValue(themeDictionary, prefixes, styles, postfixes, fallback);

	self.nodeStyles = function (nodeLevel, nodeAttr) {
		const result = ['level_' + nodeLevel, 'default'];
		if (nodeAttr && nodeAttr.group) {
			result.unshift('attr_group');
			if (typeof nodeAttr.group === 'string' || typeof nodeAttr.group === 'number') {
				result.unshift('attr_group_' + nodeAttr.group);
			}
		}
		return result;
	};
	self.nodeTheme = function (styles) {
		const nodeAttribute = themeAttributeUtils.themeAttributeValue(themeDictionary, ['node'], styles);
		return themeAttributeUtils.nodeAttributeToNodeTheme(nodeAttribute);
	};

	self.connectorControlPoint = function (childPosition, connectorStyle) {
		const controlPointOffset = childPosition === 'horizontal' ? themeFallbackValues.connectorControlPoint.horizontal : themeFallbackValues.connectorControlPoint.default,
			defaultControlPoint = {'width': 0, 'height': controlPointOffset},
			configuredControlPoint = connectorStyle && getElementForPath(themeDictionary, ['connector', connectorStyle, 'controlPoint', childPosition]);

		return (configuredControlPoint && _.extend({}, configuredControlPoint)) || defaultControlPoint;
	};
	self.connectorTheme = function (childPosition, childStyles, parentStyles) {
		const position = childPosition || 'horizontal',
			childConnectorStyle = self.attributeValue(['node'], childStyles, ['connections', 'style'], 'default'),
			parentConnectorStyle = parentStyles && self.attributeValue(['node'], parentStyles, ['connections', 'childstyle'], false),
			childConnector = getElementForPath(themeDictionary, ['connector', childConnectorStyle]),
			parentConnector = parentConnectorStyle && getElementForPath(themeDictionary, ['connector', parentConnectorStyle]),
			combinedStyle = parentConnectorStyle && (parentConnectorStyle + '.' + childConnectorStyle),
			combinedConnector = combinedStyle &&  getElementForPath(themeDictionary, ['connector', combinedStyle]),
			connectorStyle  = (combinedConnector && combinedStyle) || (parentConnector && parentConnectorStyle) || childConnectorStyle || 'default',
			controlPoint = self.connectorControlPoint(position, connectorStyle),
			connectorDefaults = _.extend({}, themeFallbackValues.connectorTheme),
			returnedConnector =  _.extend({}, combinedConnector || parentConnector || childConnector || connectorDefaults);
		if (!returnedConnector.label) {
			returnedConnector.label = connectorDefaults.label;
		}
		returnedConnector.controlPoint = controlPoint;
		returnedConnector.line = returnedConnector.line || connectorDefaults.line;
		return returnedConnector;
	};
	self.linkTheme = function (linkStyle) {
		const fromCurrentTheme = getElementForPath(themeDictionary, ['link', linkStyle || 'default']),
			fromDefaultTheme = defaultTheme.link.default;
		return _.extend({}, fromDefaultTheme, fromCurrentTheme);
	};

	self.noAnimations = () => !!(themeDictionary.noAnimations);
	self.getLayoutConnectorAttributes = (styles) => {
		const childConnectorStyle = self.attributeValue(['node'], styles, ['connections', 'style'], 'default'),
			connectorDefaults = _.extend({}, themeFallbackValues.connectorTheme),
			childConnector = getElementForPath(themeDictionary, ['connector', childConnectorStyle]) || connectorDefaults,
			result = {};
		if (childConnector && childConnector.line) {
			result.parentConnector = {
				color: childConnector.line.color
			};
		}
		return result;
	};

	self.cleanPersistedAttributes = (currentAttribs) => {
		if (currentAttribs && currentAttribs.parentConnector && currentAttribs.parentConnector.themeAutoColor) {
			if (currentAttribs.parentConnector.themeAutoColor === currentAttribs.parentConnector.color) {
				delete currentAttribs.parentConnector.color;
			}
			delete currentAttribs.parentConnector.themeAutoColor;
			if (_.isEmpty(currentAttribs.parentConnector)) {
				delete currentAttribs.parentConnector;
			}
		}
		return currentAttribs;
	};

	self.getPersistedAttributes = (currentAttribs, nodeLevel, numberOfSiblings) => {
		const styles = ['level_' + nodeLevel, 'default'],
			getAutoColor = () => {
				const autoColors = themeDictionary.autoColors || [defaultTheme.connector.default.line.color],
					index = (numberOfSiblings % autoColors.length);
				return autoColors[index];
			},
			childConnectorStyle = self.attributeValue(['node'], styles, ['connections', 'style'], 'default'),
			connectorDefaults = _.extend({}, themeFallbackValues.connectorTheme),
			childConnector = getElementForPath(themeDictionary, ['connector', childConnectorStyle]) || connectorDefaults,
			autoColor = getAutoColor(),
			result = {
				attr: _.pick(_.extend({}, currentAttribs), ['parentConnector']),
				removed: []
			};

		if (childConnector && childConnector.line && childConnector.line.color === AUTO_COLOR) {
			result.attr = _.extend({
				parentConnector: {
					color: autoColor,
					themeAutoColor: autoColor
				}
			}, result.attr);
		} else if (result.attr.parentConnector && result.attr.parentConnector.themeAutoColor) {
			result.attr.parentConnector = _.extend({}, result.attr.parentConnector);
			if (result.attr.parentConnector.themeAutoColor === result.attr.parentConnector.color) {
				delete result.attr.parentConnector.color;
			}
			delete result.attr.parentConnector.themeAutoColor;

			if (_.isEmpty(result.attr.parentConnector)) {
				result.removed.push('parentConnector');
				delete result.attr.parentConnector;
			}
		}
		return result;
	};
};
