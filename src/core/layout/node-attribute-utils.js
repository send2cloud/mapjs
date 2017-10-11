/*global module, require*/
const objectUtils = require('../util/object-utils'),
	INHERIT_MARKER = 'theme_inherit',
	inheritAttributeKeysFromParentNode = (parentNode, node, keysToInherit) => {
		'use strict';
		console.log('inheritAttributeKeysFromParentNode parentNode', parentNode, 'node', node, 'keysToInherit', keysToInherit); //eslint-disable-line
		let remainingToInherit = [];
		if (parentNode.attr) {
			keysToInherit.forEach((keyToInherit) => {
				const parentValue = objectUtils.getValue(parentNode.attr, keyToInherit);
				if (parentValue && parentValue !== INHERIT_MARKER) {

					objectUtils.setValue(node.attr, keyToInherit, parentValue);
				} else {
					remainingToInherit.push(keyToInherit);
				}
			});
		} else {
			remainingToInherit = keysToInherit;
		}
		return remainingToInherit;
	},
	inheritAttributeKeys = (nodesMap, node, keysToInherit) => {
		'use strict';
		if (!node || !node.parentId) {
			return;
		}
		const parentNode = nodesMap[node.parentId],
			remainingToInherit = (parentNode && inheritAttributeKeysFromParentNode(parentNode, node, keysToInherit)) || [];
		if (!remainingToInherit.length || !parentNode || !parentNode.parentId) {
			return;
		}
		inheritAttributeKeys(nodesMap, parentNode, remainingToInherit);
		inheritAttributeKeysFromParentNode(parentNode, node, remainingToInherit);
	},
	inheritAttributes = (nodesMap, node) => {
		'use strict';
		if (!node || !node.parentId || !node.attr) {
			return;
		}
		const keysToInherit = objectUtils.keyComponentsWithValue(node.attr, INHERIT_MARKER);
		if (!keysToInherit || !keysToInherit.length) {
			return;
		}
		inheritAttributeKeys(nodesMap, node, keysToInherit);
	};

module.exports = {
	INHERIT_MARKER: INHERIT_MARKER,
	inheritAttributes: inheritAttributes,
	inheritAttributeKeys: inheritAttributeKeys,
	inheritAttributeKeysFromParentNode: inheritAttributeKeysFromParentNode
};
