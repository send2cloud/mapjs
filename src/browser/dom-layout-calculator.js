/*global require, module */
const calculateLayout = require('../core/layout/calculate-layout'),
	domDimensionProvider = require('./dom-dimension-provider'),
	DOMRender = require('./dom-render'),
	layoutCalculator = function (contentAggregate) {
		'use strict';
		return calculateLayout(contentAggregate, domDimensionProvider, {
			theme: DOMRender.theme
		});
	};

module.exports = layoutCalculator;
