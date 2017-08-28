/*global module, require */

require('./browser/theme-css-widget');
require('./browser/dom-map-widget');
require('./browser/map-toolbar-widget');
require('./browser/link-edit-widget');

module.exports = {
	MapModel: require('./core/map-model'),
	content: require('./core/content/content'),
	observable: require('./core/util/observable'),
	DomMapController: require('./browser/dom-map-controller'),
	ThemeProcessor: require('./core/theme/theme-processor'),
	version: 4
};
