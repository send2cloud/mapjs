/*global module, require*/
const _ = require('underscore'),
	layoutGeometry = require('./layout-geometry');

module.exports = function MultiRootLayout() {
	'use strict';
	const self = this,
		mergeNodes = function (storedLayout, offset) {
			_.each(storedLayout.rootLayout, function (node) {
				node.x = node.x + offset.x;
				node.y = node.y + offset.y;
				node.rootId = storedLayout.rootIdea.id;
			});
		},
		globalIdeaTopLeftPosition = function (idea) {
			const positionArray = (idea && idea.attr && idea.attr.position) || [0, 0, 0];
			return {
				x: positionArray[0],
				y: positionArray[1],
				priority: positionArray[2]
			};
		},
		toStoredLayout = function (rootLayout, rootIdea) {
			const storedLayout = {
				rootIdea: rootIdea,
				rootNode: rootLayout[rootIdea.id],
				rootLayout: rootLayout
			};
			return storedLayout;
		},
		isPositioned = function (rootIdea) {
			return globalIdeaTopLeftPosition(rootIdea).priority;
		},
		getDesiredRootNodeOffset = function (storedLayout) {
			let rootPosition = globalIdeaTopLeftPosition(storedLayout.rootIdea);
			if (!storedLayout.rootNode) {
				return {x: 0, y: 0};
			}
			if (!rootPosition || !rootPosition.priority) {
				rootPosition = {x: Math.round(storedLayout.rootNode.width / -2), y: Math.round(storedLayout.rootNode.height / -2)};
			}
			return {
				x: (rootPosition.x - storedLayout.rootNode.x),
				y: (rootPosition.y - storedLayout.rootNode.y)
			};
		},
		positionedLayouts = [],
		unpositionedLayouts = [];

	self.appendRootNodeLayout = function (rootLayout, rootIdea) {
		const storedLayout = toStoredLayout(rootLayout, rootIdea);
		if (isPositioned(rootIdea)) {
			positionedLayouts.push(storedLayout);
		} else {
			unpositionedLayouts.push(storedLayout);
		}
	};
	self.getCombinedLayout = function (margin) {
		let placedLayoutPoly = [],
			result = {};

		const mostRecentlyPositioned = positionedLayouts.length && _.max(positionedLayouts, function (layout) {
				return globalIdeaTopLeftPosition(layout.rootIdea).priority;
			}),
			rootDistance = function (storedLayout) {
				// return globalIdeaTopLeftPosition(storedLayout.rootIdea).priority * -1;
				// return storedLayout.rootIdea.id;
				const rootCenter = getDesiredRootNodeOffset(storedLayout);
				return Math.pow(rootCenter.x, 2) + Math.pow(rootCenter.y, 2);
			},
			sortedPositionedLayouts = _.sortBy(positionedLayouts, rootDistance),
			placedLayouts = [],

			layoutCount = positionedLayouts.length + unpositionedLayouts.length,
			hasMultipleLayouts = layoutCount > 1,
			positionLayout = function (storedLayout) {
				let offset,
					translationResult,
					storedLayoutPoly;

				const placedRootOffset = getDesiredRootNodeOffset(storedLayout),
					initialTranslation = layoutGeometry.roundVector([placedRootOffset.x, placedRootOffset.y]),
					placeNewLayout = function () {
						let vector = layoutGeometry.unitVector([placedRootOffset.x, placedRootOffset.y]);
						if (vector[0] === 0 && vector[1] === 0) {
							vector = [1, 0];
						} else if (Math.abs(vector[0]) > Math.abs(vector[1])) {
							vector = [Math.sign(vector[0]), 0];
						} else {
							vector = [0, Math.sign(vector[1])];
						}
						translationResult = layoutGeometry.translatePolyToNotOverlap(storedLayoutPoly, placedLayoutPoly, initialTranslation, vector, initialTranslation);
						offset = {x: translationResult.translation[0], y: translationResult.translation[1]};
						storedLayoutPoly = translationResult.translatedPoly;
					};




				storedLayoutPoly = hasMultipleLayouts && layoutGeometry.translatePoly(layoutGeometry.tolayoutPolygonHull(storedLayout.rootLayout, margin), initialTranslation);

				if (!storedLayout || _.contains(placedLayouts, storedLayout)) {
					return;
				}
				if (placedLayouts.length) {
					placeNewLayout();
				} else {
					offset = placedRootOffset;
				}

				mergeNodes(storedLayout, offset);
				placedLayouts.push(storedLayout);
				if (hasMultipleLayouts) {
					placedLayoutPoly = placedLayoutPoly.concat(storedLayoutPoly);
				}

			};
		if (!margin) {
			throw 'invalid-args';
		}
		if (mostRecentlyPositioned) {
			positionLayout(mostRecentlyPositioned);
		}
		sortedPositionedLayouts.forEach(positionLayout);
		unpositionedLayouts.forEach(positionLayout);
		placedLayouts.forEach(function (placedLayout) {
			result = _.extend(result, placedLayout.rootLayout);
		});
		return result;
	};
};
