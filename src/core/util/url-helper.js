/*global module*/
const URLHelper = function () {
	'use strict';
	const self = this,
		urlPattern = /(https?:\/\/|www\.)[\w-]+(\.[\w-]+)+([\w\(\)\u0080-\u00FF.,!@?^=%&amp;:\/~+#-]*[\w\(\)\u0080-\u00FF!@?^=%&amp;\/~+#-])?/i,
		hrefUrl = function (url) {
			if (!/https?:\/\//i.test(url)) {
				return 'http://' + url;
			}
			return url;
		};

	self.containsLink = function (text) {
		return urlPattern.test(text);
	};

	self.getLink  = function (text) {
		const url = text && text.match(urlPattern);
		if (url && url[0]) {
			return hrefUrl(url[0]);
		}
		return url;
	};

	self.stripLink  = function (text) {
		if (!text) {
			return '';
		}
		return text.replace(urlPattern, '').trim();
	};
	self.formatLinks = function (text) {
		if (!text) {
			return '';
		}
		return text.replace(new RegExp(urlPattern, 'gi'), url => `<a target="_blank" href="${hrefUrl(url)}">${url}</a>`);
	};
};

module.exports = new URLHelper();
