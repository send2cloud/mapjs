/*global MAPJS, $, _*/
MAPJS.MapImageBuilder = function (layoutModel) {
	'use strict';
	var self = this,
		toBox = function (node) {
			return {
				left: node.x,
				top: node.y,
				width: node.width,
				height: node.height,
				level: node.level
			};
		};

	self.generateSVG = function (theme) {
		var deferred = $.Deferred(),
			bounds = layoutModel.layoutBounds(),
			layout = layoutModel.getLayout(),
			viewbox = bounds.minX + ' ' + bounds.minY + ' ' + bounds.width + ' '  + bounds.height,
			svg =  MAPJS.createSVG().attr({'width': bounds.width, 'height': bounds.height, 'viewBox': viewbox}),
			g = MAPJS.createSVG('g').attr('transform', 'translate(' + (-1 *  bounds.minX) + ',' + (-1 *  bounds.minY) + ')').appendTo(svg),
			writeConnector = function (fromNode, toNode) {
				var path = MAPJS.Connectors.themePath(toBox(fromNode), toBox(toNode), theme),
					g = MAPJS.createSVG('g').attr('transform', 'translate(' + path.position.left + ',' + path.position.top + ')');

				MAPJS.createSVG('path').attr({'d': path.d, stroke: path.color, fill: 'none'}).appendTo(g);
				return g;
			};

		_.values(layout.connectors).forEach(function (connector) {
			var fromNode = layout.nodes[connector.from],
				toNode = layout.nodes[connector.to];
			g.append(writeConnector(fromNode, toNode));
		});

		return deferred.resolve(svg).promise();
	};
};


$.fn.toImageWidget = function (imageBuilder) {
	'use strict';
	var widget = this;
	widget.click(function () {
		imageBuilder.generateSVG(MAPJS.DOMRender.theme).then(function (svg) {
			$('#container').empty().append(svg);
		});
	});
	return this;
};
