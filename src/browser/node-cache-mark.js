/*global require, module */
const _ = require('underscore'),
	DOMRender = require('./dom-render');
module.exports = function nodeCacheMark(idea, levelOverride) {
	'use strict';
	return {
		title: idea.title,
		width: idea.attr && idea.attr.style && idea.attr.style.width,
		theme: DOMRender.theme &&  DOMRender.theme.name,
		icon: idea.attr && idea.attr.icon && _.pick(idea.attr.icon, 'width', 'height', 'position'),
		collapsed: idea.attr && idea.attr.collapsed,
		note: !!(idea.attr && idea.attr.note),
		styles: DOMRender.theme &&  DOMRender.theme.nodeStyles(idea.level  || levelOverride, idea.attr),
		level: idea.level || levelOverride
	};
};

