/*global module, require */

require('./browser/theme-css-widget');
require('./browser/dom-map-widget');
require('./browser/map-toolbar-widget');
require('./browser/link-edit-widget');
require('./browser/image-drop-widget');

module.exports = {
	MapModel: require('./core/map-model'),
	ImageInsertController: require('./browser/image-insert-controller'),
	content: require('./core/content/content'),
	observable: require('./core/util/observable'),
	DomMapController: require('./browser/dom-map-view'),
	ThemeProcessor: require('./core/theme/theme-processor'),
	version: 4
};
