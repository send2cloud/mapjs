/*global require */

const jQuery = require('jquery'),
	_ = require('underscore'),
	createSVG = require('./create-svg'),
	themeConnector = require('../core/theme/connector'),
	defaultTheme = require('../core/theme/default-theme'),
	lineStrokes = require('../core/theme/line-strokes'),
	convertPositionToTransform = require('../core/util/convert-position-to-transform'),
	updateConnectorText = require('./update-connector-text'),
	calcLabelCenterPont = require('./calc-label-center-point');


require('./get-box');
require('./get-data-box');

jQuery.fn.updateConnector = function (optional) {
	'use strict';
	const connectorBuilder = optional && optional.connectorBuilder || themeConnector,
		canUseData = optional && optional.canUseData,
		theme = optional && optional.theme;
	return jQuery.each(this, function () {
		let connection = false, pathElement, hitElement, fromBox, toBox,
			changeCheck = false;
		const element = jQuery(this),
			shapeFrom = element.data('nodeFrom'),
			shapeTo = element.data('nodeTo'),
			connectorAttr = element.data('attr'),
			allowParentConnectorOverride = !(theme && theme.blockParentConnectorOverride),
			applyInnerRect = function (shape, box) {
				const innerRect = shape.data().innerRect;
				if (innerRect) {
					box.left += innerRect.dx;
					box.top += innerRect.dy;
					box.width = innerRect.width;
					box.height = innerRect.height;
				}
			},
			applyLabel = function () {
				const labelText = (connectorAttr && connectorAttr.label) || '',
					labelTheme = (connection.theme && connection.theme.label) || defaultTheme.connector.default.label,
					labelCenterPoint = labelText && calcLabelCenterPont(connection.position, toBox, connection.d, labelTheme);
				updateConnectorText(
					element,
					labelCenterPoint,
					labelText,
					labelTheme
				);
			};



		if (!shapeFrom || !shapeTo || shapeFrom.length === 0 || shapeTo.length === 0) {
			element.hide();
			return;
		}
		if (canUseData) {
			fromBox = shapeFrom.getDataBox();
			toBox = shapeTo.getDataBox();
		} else {
			fromBox = shapeFrom.getBox();
			toBox = shapeTo.getBox();
		}
		applyInnerRect(shapeFrom, fromBox);
		applyInnerRect(shapeTo, toBox);
		/*
		fromBox.level = shapeFrom.attr('mapjs-level');
		toBox.level = shapeTo.attr('mapjs-level');
		*/
		fromBox.styles = shapeFrom.data('styles');
		toBox.styles = shapeTo.data('styles');
		changeCheck = {from: fromBox, to: toBox, theme: theme &&  theme.name, attr: connectorAttr};
		if (_.isEqual(changeCheck, element.data('changeCheck'))) {
			return;
		}
		element.data('changeCheck', changeCheck);

		connection = _.extend(connectorBuilder(fromBox, toBox, theme), connectorAttr);
		element.data('theme', connection.theme);
		element.data('position', Object.assign({}, connection.position));
		pathElement = element.find('path.mapjs-connector');
		hitElement = element.find('path.mapjs-link-hit');
		element.css(_.extend(convertPositionToTransform(connection.position), {stroke: connection.color}));
		if (pathElement.length === 0) {
			pathElement = createSVG('path').attr('class', 'mapjs-connector').appendTo(element);
		}
		//TODO: if the map was translated (so only the relative position changed), do not re-update the curve!!!!
		pathElement.attr({
			'd': connection.d,
			'stroke-width': connection.width,
			'stroke-dasharray': lineStrokes[connection.lineStyle || 'solid'],
			fill: 'transparent'
		});
		if (allowParentConnectorOverride) {
			if (hitElement.length === 0) {
				hitElement = createSVG('path').attr('class', 'mapjs-link-hit').appendTo(element);
			}
			hitElement.attr({
				'd': connection.d,
				'stroke-width': connection.width + 12
			});
		} else {
			if (hitElement.length > 0) {
				hitElement.remove();
			}
		}
		applyLabel();
		// setTimeout(() => applyLabel(), 500);
		// applyLabel();

	});
};

