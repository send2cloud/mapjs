/*global module, require */
const _ = require('underscore');
module.exports = function extractConnectors(aggregate, visibleNodes, theme) {
	'use strict';
	const result = {},
		allowParentConnectorOverride = !(theme && theme.blockParentConnectorOverride),
		traverse = function (idea, parentId, isChildNode) {
			if (isChildNode) {
				//TODO: specs
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
					console.log('idea.id', idea.id, visibleNode.attr.parentConnector); //eslint-disable-line
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
