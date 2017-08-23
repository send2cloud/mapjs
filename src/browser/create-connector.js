/*global require */
const jQuery = require('jquery'),
	createSVG = require('./create-svg'),
	connectorKey = require('../core/util/connector-key');

jQuery.fn.createConnector = function (connector) {
	'use strict';
	const stage = this.parent('[data-mapjs-role=stage]');
	return createSVG('g')
		.attr({'id': connectorKey(connector), 'data-mapjs-role': 'connector'})
		.data({'nodeFrom': stage.nodeWithId(connector.from), 'nodeTo': stage.nodeWithId(connector.to), attr: connector.attr})
		.appendTo(this);
};

