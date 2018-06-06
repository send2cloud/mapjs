/*global module*/
module.exports = function applyIdeaAttributesToNodeTheme(idea, nodeTheme) {
	'use strict';
	if (!nodeTheme  || !idea || !idea.attr || !idea.attr.style) {
		return nodeTheme;
	}
	const fontMultiplier = idea.attr.style.fontMultiplier,
		textAlign = idea.attr.style.textAlign;

	if (textAlign) {
		nodeTheme.text = Object.assign({}, nodeTheme.text, {alignment: textAlign});
	}

	if ((nodeTheme && nodeTheme.hasFontMultiplier)) {
		return nodeTheme;
	}

	if (!nodeTheme.font || !fontMultiplier || Math.abs(fontMultiplier) <= 0.01 || Math.abs(fontMultiplier - 1) <= 0.01) {
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
