/*global module, require*/
const calcIdeaLevel = require('./calc-idea-level'),
	_ = require('underscore'),
	addSubIdea = (activeContent, themeObj, parentId, ideaTitle, optionalNewId, optionalIdeaAttr) => {
		'use strict';
		if (!themeObj) {
			return activeContent.addSubIdea(parentId, ideaTitle, optionalNewId, optionalIdeaAttr);
		}
		const parentLevel = calcIdeaLevel(activeContent, parentId),
			parentIdea = parentId && activeContent.findSubIdeaById(parentId),
			numberOfSiblings = (parentIdea && parentIdea.ideas && Object.keys(parentIdea.ideas).length) || 0,
			attrs = themeObj.getPersistedAttributes(optionalIdeaAttr, parentLevel + 1, numberOfSiblings).attr,
			attrsToSave = (!_.isEmpty(attrs) && attrs) || undefined;
		return activeContent.addSubIdea(parentId, ideaTitle, optionalNewId, attrsToSave);
	},
	recalcAutoNodeAttrs = (activeContent, themeObj, idea, level, numberOfSiblings) => {
		'use strict';
		const updatedAttr = (idea && themeObj.getPersistedAttributes(idea.attr, level, numberOfSiblings)) || {};

		updatedAttr.removed.forEach((key) => activeContent.updateAttr(idea.id, key, false));
		Object.keys(updatedAttr.attr).forEach((key) => {
			activeContent.updateAttr(idea.id, key, updatedAttr.attr[key]);
		});
	},
	changeParent = (activeContent, themeObj, ideaId, newParentId) => {
		'use strict';
		if (!themeObj) {
			return activeContent.changeParent(ideaId, newParentId);
		}
		let result;
		const newParent = activeContent.findSubIdeaById(newParentId),
			numberOfSiblings = (newParent && newParent.ideas && Object.keys(newParent.ideas).length) || 0,
			parentLevel = calcIdeaLevel(activeContent, newParentId);

		activeContent.batch(() => {
			activeContent.changeParent(ideaId, newParentId);
			const idea = activeContent.findSubIdeaById(ideaId);
			recalcAutoNodeAttrs(activeContent, themeObj, idea, parentLevel + 1, numberOfSiblings);
			let childSiblings = 0;
			if (idea.ideas) {
				Object.keys(idea.ideas).forEach((childIdeaId) => {
					recalcAutoNodeAttrs(activeContent, themeObj, idea.ideas[childIdeaId], parentLevel + 2, childSiblings);
					childSiblings += 1;
				});
			}
		});
		return result;
	},
	insertIntermediateMultiple = (activeContent, themeObj, inFrontOfIdeaIds, ideaOptions) => {
		'use strict';
		if (!themeObj) {
			return activeContent.insertIntermediateMultiple(inFrontOfIdeaIds, ideaOptions);
		}

		const ideaOptionsSafe = _.extend({}, ideaOptions),
			inFrontOfIdeaId = themeObj && inFrontOfIdeaIds && inFrontOfIdeaIds[0],
			inFrontOfIdea = inFrontOfIdeaId && activeContent.findSubIdeaById(inFrontOfIdeaId),
			level = inFrontOfIdeaId && calcIdeaLevel(activeContent, inFrontOfIdeaId),
			insertAttr = (inFrontOfIdea && inFrontOfIdea.attr && _.extend(inFrontOfIdea.attr, ideaOptionsSafe.attr)) || ideaOptionsSafe.attr,
			siblingIds = activeContent.sameSideSiblingIds(inFrontOfIdeaId),
			numberOfSiblings = (siblingIds && siblingIds.length) || 0,
			attrs = themeObj.getPersistedAttributes(insertAttr, level, numberOfSiblings).attr;

		ideaOptionsSafe.attr = attrs;
		let result;
		activeContent.batch(() => {
			result = activeContent.insertIntermediateMultiple(inFrontOfIdeaIds, ideaOptionsSafe);
			let siblings = 0;
			inFrontOfIdeaIds.forEach((movedIdeaId) => {
				const movedIdea = activeContent.findSubIdeaById(movedIdeaId);
				recalcAutoNodeAttrs(activeContent, themeObj, movedIdea, level + 1, siblings);
				siblings += 1;
			});
		});
		return result;

	};

module.exports = {
	addSubIdea: addSubIdea,
	changeParent: changeParent,
	insertIntermediateMultiple: insertIntermediateMultiple
};
