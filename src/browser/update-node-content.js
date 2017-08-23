/*global require */
const jQuery = require('jquery'),
	_ = require('underscore'),
	URLHelper = require('../core/util/url-helper'),
	foregroundStyle = require('../core/theme/foreground-style'),
	formattedNodeTitle = require('../core/content/formatted-node-title'),
	DOMRender = require('./dom-render'),
	nodeCacheMark = require('./node-cache-mark');

require('./set-theme-class-list');

jQuery.fn.updateNodeContent = function (nodeContent, optional) {
	'use strict';
	const resourceTranslator = optional && optional.resourceTranslator,
		forcedLevel = optional && optional.level,
		self = jQuery(this),
		textSpan = function () {
			let span = self.find('[data-mapjs-role=title]');
			if (span.length === 0) {
				span = jQuery('<span>').attr('data-mapjs-role', 'title').appendTo(self);
			}
			return span;
		},
		decorations = function () {
			let element = self.find('[data-mapjs-role=decorations]');
			if (element.length === 0) {
				element = jQuery('<div data-mapjs-role="decorations" class="mapjs-decorations">').on('mousedown click', function (e) {
					e.stopPropagation();
					e.stopImmediatePropagation();
				}).appendTo(self);
			}
			return element;
		},
		applyLinkUrl = function (title) {
			const url = URLHelper.getLink(title);
			let element = self.find('a.mapjs-hyperlink');
			if (!url) {
				element.hide();
				return;
			}
			if (element.length === 0) {
				element = jQuery('<a target="_blank" class="mapjs-hyperlink icon-hyperlink"></a>').addClass().appendTo(decorations());
			}
			element.attr('href', url).show();
		},
		applyLabel = function (label) {
			let element = self.find('.mapjs-label');
			if (!label && label !== 0) {
				element.hide();
				return;
			}
			if (element.length === 0) {
				element = jQuery('<span class="mapjs-label"></span>').appendTo(decorations());
			}
			element.text(label).show();
		},
		applyAttachment = function () {
			const attachment = nodeContent.attr && nodeContent.attr.attachment;
			let element = self.find('a.mapjs-attachment');
			if (!attachment) {
				element.hide();
				return;
			}
			if (element.length === 0) {
				element = jQuery('<a href="#" class="mapjs-attachment icon-attachment"></a>').
					appendTo(decorations()).click(function () {
						self.trigger('attachment-click');
						self.trigger('decoration-click', 'attachment');
					});
			}
			element.show();
		},
		applyNote = function () {
			const note = nodeContent.attr && nodeContent.attr.note;
			let element = self.find('a.mapjs-note');
			if (!note) {
				element.hide();
				return;
			}
			if (element.length === 0) {
				element = jQuery('<a href="#" class="mapjs-note icon-note"></a>').appendTo(decorations()).click(function () {
					self.trigger('decoration-click', 'note');
				});
			}
			element.show();
		},
		updateText = function (title) {
			const text = formattedNodeTitle(title, 25),
				nodeTextPadding = DOMRender.nodeTextPadding || 11,
				element = textSpan(),
				domElement = element[0],
				preferredWidth = nodeContent.attr && nodeContent.attr.style && nodeContent.attr.style.width;
			let height;

			element.text(text.trim());
			self.data('title', title);
			element.css({'max-width': '', 'min-width': ''});
			if (preferredWidth) {
				element.css({'max-width': preferredWidth, 'min-width': preferredWidth});
			}
			if ((domElement.scrollWidth - nodeTextPadding) > domElement.offsetWidth) {
				element.css('max-width', domElement.scrollWidth + 'px');
			} else if (!preferredWidth) {
				height = domElement.offsetHeight;

				element.css('min-width', element.css('max-width'));
				if (domElement.offsetHeight === height) {
					element.css('min-width', '');
				}
			}
		},
		setCollapseClass = function () {
			if (nodeContent.attr && nodeContent.attr.collapsed) {
				self.addClass('collapsed');
			} else {
				self.removeClass('collapsed');
			}
		},
		setColors = function (colorText) {
			let fromStyle = nodeContent.attr && nodeContent.attr.style && nodeContent.attr.style.background;
			const textColorClasses = {
				'color': 'mapjs-node-light',
				'lightColor': 'mapjs-node-dark',
				'darkColor': 'mapjs-node-white'
			};
			if (fromStyle === 'false' || fromStyle === 'transparent') {
				fromStyle = false;
			}
			self.removeClass('mapjs-node-dark mapjs-node-white mapjs-node-light mapjs-node-colortext');
			self.css({'color': '', 'background-color': ''});
			if (fromStyle) {
				if (colorText) {
					self.css('color', fromStyle);
				} else {
					self.css('background-color', fromStyle);
					self.addClass(textColorClasses[foregroundStyle(fromStyle)]);
				}
			}
			if (colorText) {
				self.addClass('mapjs-node-colortext');
			}
		},
		setIcon = function (icon) {
			let textHeight,
				textWidth,
				maxTextWidth,
				padding;
			const textBox = textSpan(),
				selfProps = {
					'min-height': '',
					'min-width': '',
					'background-image': '',
					'background-repeat': '',
					'background-size': '',
					'background-position': ''
				},
				textProps = {
					'margin-top': '',
					'margin-left': ''
				};
			self.css({padding: ''});
			if (icon) {
				padding = parseInt(self.css('padding-left'), 10);
				textHeight = textBox.outerHeight();
				textWidth = textBox.outerWidth();
				maxTextWidth = parseInt(textBox.css('max-width'), 10);
				_.extend(selfProps, {
					'background-image': 'url("' + (resourceTranslator ? resourceTranslator(icon.url) : icon.url) + '")',
					'background-repeat': 'no-repeat',
					'background-size': icon.width + 'px ' + icon.height + 'px',
					'background-position': 'center center'
				});
				if (icon.position === 'top' || icon.position === 'bottom') {
					if (icon.position === 'top') {
						selfProps['background-position'] = 'center ' + padding + 'px';
					} else if (DOMRender.fixedLayout) {
						selfProps['background-position'] = 'center ' + (padding + textHeight) + 'px';
					} else {
						selfProps['background-position'] = 'center ' + icon.position + ' ' + padding + 'px';
					}

					selfProps['padding-' + icon.position] = icon.height + (padding * 2);
					selfProps['min-width'] = icon.width;
					if (icon.width > maxTextWidth) {
						textProps['margin-left'] =  Math.round((icon.width - maxTextWidth) / 2);
					}
				} else if (icon.position === 'left' || icon.position === 'right') {
					if (icon.position === 'left') {
						selfProps['background-position'] = padding + 'px center';
					} else if (DOMRender.fixedLayout) {
						selfProps['background-position'] = (textWidth + (2 * padding)) + 'px center ';
					} else {
						selfProps['background-position'] = icon.position + ' ' + padding + 'px center';
					}

					selfProps['padding-' + icon.position] = icon.width + (padding * 2);
					if (icon.height > textHeight) {
						textProps['margin-top'] =  Math.round((icon.height - textHeight) / 2);
						selfProps['min-height'] = icon.height;
					}
				} else {
					if (icon.height > textHeight) {
						textProps['margin-top'] =  Math.round((icon.height - textHeight) / 2);
						selfProps['min-height'] = icon.height;
					}
					selfProps['min-width'] = icon.width;
					if (icon.width > maxTextWidth) {
						textProps['margin-left'] =  Math.round((icon.width - maxTextWidth) / 2);
					}
				}
			}
			self.css(selfProps);
			textBox.css(textProps);
		},
		nodeLevel = forcedLevel || nodeContent.level,
		themeDefault =  function (a, b, c, d) {
			return d;
		},
		styleDefault = function () {
			return ['default'];
		},
		attrValue = (DOMRender.theme && DOMRender.theme.attributeValue) || themeDefault,
		nodeStyles = (DOMRender.theme &&  DOMRender.theme.nodeStyles) || styleDefault,
		effectiveStyles = nodeStyles(nodeLevel, nodeContent.attr),
		borderType = attrValue(['node'], effectiveStyles, ['border', 'type'], 'surround'),
		decorationEdge = attrValue(['node'], effectiveStyles, ['decorations', 'edge'], ''),
		decorationOverlap = attrValue(['node'], effectiveStyles, ['decorations', 'overlap'], ''),
		colorText = (borderType !== 'surround'),
		isGroup = nodeContent.attr && nodeContent.attr.group,
		nodeCacheData = {
			x: Math.round(nodeContent.x),
			y: Math.round(nodeContent.y),
			width: Math.round(nodeContent.width),
			height: Math.round(nodeContent.height),
			nodeId: nodeContent.id,
			styles: effectiveStyles,
			parentConnector: nodeContent && nodeContent.attr && nodeContent.attr.parentConnector
		};


	let offset;




	nodeCacheData.innerRect = _.pick(nodeCacheData, ['width', 'height']);
	nodeCacheData.innerRect.dx = 0;
	nodeCacheData.innerRect.dy = 0;


	if (isGroup) {
		this.css({margin: '', width: nodeContent.width, height: nodeContent.height});
		updateText('');
	} else {
		updateText(nodeContent.title);
		applyLinkUrl(nodeContent.title);
		applyLabel(nodeContent.label);
		applyNote();
		applyAttachment();
		this.css({margin: '', width: '', height: ''});
		if (decorationEdge === 'left') {
			nodeCacheData.innerRect.dx = decorations().outerWidth();
			nodeCacheData.innerRect.width = nodeCacheData.width - decorations().outerWidth();
			self.css('margin-left', decorations().outerWidth());
		} else if (decorationEdge === 'right') {
			nodeCacheData.innerRect.width = nodeCacheData.width - decorations().outerWidth();
			self.css('margin-right', decorations().outerWidth());
		} else if (decorationEdge === 'top') {
			offset = (decorations().outerHeight() * (decorationOverlap ? 0.5 : 1));
			nodeCacheData.innerRect.dy = offset;
			nodeCacheData.innerRect.height = nodeCacheData.height - offset;
			if (offset) {
				self.css('margin-top', offset);
			}

		} else if (decorationEdge === 'bottom') {
			offset = decorations().outerHeight() * (decorationOverlap ? 0.5 : 1);
			nodeCacheData.innerRect.height = nodeCacheData.height - offset;
			self.css('margin-bottom', decorations().outerHeight() * (decorationOverlap ? 0.5 : 1));
		}
	}

	self.setThemeClassList(effectiveStyles).attr('mapjs-level', nodeLevel);

	self.data(nodeCacheData);
	self.data('nodeCacheMark', nodeCacheMark(nodeContent));
	setColors(colorText);
	setIcon(nodeContent.attr && nodeContent.attr.icon);
	setCollapseClass();
	self.trigger('mapjs:resize');
	return self;
};

