/*global module, require */
const _ = require('underscore');
module.exports = function extractConnectors(aggregate, visibleNodes, theme) {
	'use strict';
	const result = {},
		allowParentConnectorOverride = !(theme && theme.blockParentConnectorOverride),
		traverse = function (idea, parentId, isChildNode) {
			if (isChildNode) {
				const visibleNode = visibleNodes[idea.id];
				if (!visibleNode) {
					return;
				}
				if (parentId !== aggregate.id) {
					result[idea.id] = {
						type: 'connector',
						from: parentId,
						to: idea.id
					};
					if (allowParentConnectorOverride && visibleNode.attr && visibleNode.attr.parentConnector) {
						result[idea.id].attr = _.clone(visibleNode.attr.parentConnector);
					}
				}
			}
			if (idea.ideas) {
				Object.keys(idea.ideas).forEach(function (subNodeRank) {
					traverse(idea.ideas[subNodeRank], idea.id, true);
				});
			}
		};
	traverse(aggregate);
	return result;
};
