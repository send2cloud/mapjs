/*global module, require*/
const defaultTheme = require('./default-theme'),
	firstNode = defaultTheme.node[0],
	defaultConnector = defaultTheme.connector.default;

module.exports = Object.freeze({
	nodeTheme: Object.freeze({
		margin: firstNode.text.margin,
		font: firstNode.text.font,
		maxWidth: firstNode.text.maxWidth,
		backgroundColor: firstNode.backgroundColor,
		borderType: firstNode.border.type,
		cornerRadius: firstNode.cornerRadius,
		lineColor: firstNode.border.line.color,
		text: Object.freeze({
			color: firstNode.text.color,
			lightColor: firstNode.text.lightColor,
			darkColor: firstNode.text.darkColor
		})
	}),
	connectorControlPoint: Object.freeze({
		horizontal: defaultConnector.controlPoint.horizontal.height,
		default: defaultConnector.controlPoint.above.height
	}),
	connectorTheme: Object.freeze({
		type: defaultConnector.type,
		label: defaultConnector.label,
		line: defaultConnector.line
	})
});
