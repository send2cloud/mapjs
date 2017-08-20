/*global module, require */

require('./browser/theme-css-widget');
require('./browser/dom-map-widget');
require('./browser/map-toolbar-widget');
require('./browser/link-edit-widget');
require('./browser/image-drop-widget');

module.exports = {
	MapModel: require('./core/map-model'),
	ImageInsertController: require('./browser/image-insert-controller'),
	DOMRender: require('./browser/dom-render'),
	version: 3
};
