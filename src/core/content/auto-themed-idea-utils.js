/*global module, require*/
const calcIdeaLevel = require('./calc-idea-level'),
	addSubIdea = (activeContent, themeSource, parentId, ideaTitle, optionalNewId, optionalIdeaAttr) => {
		'use strict';
		const parentLevel = calcIdeaLevel(activeContent, parentId),
			parentIdea = parentId && activeContent.findSubIdeaById(parentId),
			themeObj = parentIdea && parentLevel && themeSource && themeSource(),
			numberOfSiblings = (parentIdea && parentIdea.ideas && Object.keys(parentIdea.ideas).length) || 0,
			attrs = (themeObj && themeObj.getPersistedAttributes(optionalIdeaAttr, parentLevel + 1, numberOfSiblings)) || undefined;

		// console.log('parentLevel', parentLevel, 'numberOfSiblings', numberOfSiblings, 'attrs', attrs);
		return activeContent.addSubIdea(parentId, ideaTitle, optionalNewId, attrs);
	};

module.exports = {
	addSubIdea: addSubIdea
};
