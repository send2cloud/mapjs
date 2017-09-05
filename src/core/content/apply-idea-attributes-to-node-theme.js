/*global module*/
module.exports = function applyIdeaAttributesToNodeTheme(idea, nodeTheme) {
	'use strict';
	if (nodeTheme && nodeTheme.hasFontMultiplier) {
		return nodeTheme;
	}
	if (!nodeTheme || !nodeTheme.font || !idea || !idea.attr || !idea.attr.style || !idea.attr.style.fontMultiplier) {
		return nodeTheme;
	}
	const fontMultiplier = idea.attr.style.fontMultiplier;

	if (Math.abs(fontMultiplier) <= 0.01 || Math.abs(fontMultiplier - 1) <= 0.01) {
		return nodeTheme;
	}
	if (nodeTheme.font.size) {
		nodeTheme.font.size = nodeTheme.font.size * fontMultiplier;
	}

	if (nodeTheme.font.lineSpacing) {
		nodeTheme.font.lineSpacing = nodeTheme.font.lineSpacing * fontMultiplier;
	}

	if (nodeTheme.font.sizePx) {
		nodeTheme.font.sizePx = nodeTheme.font.sizePx * fontMultiplier;
	}
	if (nodeTheme.font.lineSpacingPx) {
		nodeTheme.font.lineSpacingPx = nodeTheme.font.lineSpacingPx * fontMultiplier;
	}
	nodeTheme.hasFontMultiplier = true;
	return nodeTheme;
};
