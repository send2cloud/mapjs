/*global describe, it, beforeEach, afterEach, expect, jasmine, spyOn, window, document, require */
const jQuery = require('jquery'),
	_ = require('underscore'),
	createSVG = require('../../src/browser/create-svg'),
	nodeCacheMark = require('../../src/browser/node-cache-mark'),
	Theme = require('../../src/core/theme/theme'),
	observable = require('../../src/core/util/observable'),
	DomMapController = require('../../src/browser/dom-map-view');

require('../helpers/jquery-extension-matchers');


describe('innerText', function () {
	'use strict';
	let underTest;
	beforeEach(function () {
		jQuery.fn.innerText.check = false;
		underTest = jQuery('<span></span>').appendTo('body');
		spyOn(jQuery.fn, 'text').and.callThrough();
	});
	afterEach(function () {
		underTest.detach();
	});
	it('executes using .text if content does not contain BR elements', function () {
		underTest.html('does\nthis\nhave\nbreaks');
		expect(underTest.innerText()).toEqual('does\nthis\nhave\nbreaks');
		expect(jQuery.fn.text).toHaveBeenCalledOnJQueryObject(underTest);
	});
	it('removes html tags and replaces BR with newlines if content contains BR elements (broken firefox contenteditable)', function () {
		underTest.html('does<br>this<br/>ha<a href="">ve</a><br>breaks');
		expect(underTest.innerText()).toEqual('does\nthis\nhave\nbreaks');
		expect(jQuery.fn.text).not.toHaveBeenCalledOnJQueryObject(underTest);
	});
	it('removes html tags and replaces divs with newlines if content contains div elements (broken safari contenteditable)', function () {
		underTest.html('does<div>this</div><div>ha<a href="">ve</a></div>breaks and spaces');
		expect(underTest.innerText()).toEqual('does\nthis\nhave\nbreaks and spaces');
		expect(jQuery.fn.text).not.toHaveBeenCalledOnJQueryObject(underTest);
	});
});
describe('updateReorderBounds', function () {
	'use strict';
	let underTest;
	beforeEach(function () {
		underTest = jQuery('<div>').css({position: 'absolute', width: 6, height: 16}).appendTo('body');
	});
	afterEach(function () {
		underTest.remove();
	});
	it('hides the element if the border is not defined', function () {
		underTest.updateReorderBounds(false, {});
		expect(underTest.css('display')).toEqual('none');
	});
	it('shows the element if the border is defined', function () {
		underTest.css('display', 'none');
		underTest.updateReorderBounds({edge: 'top', minY: 10}, {}, {x: 10});
		expect(underTest.css('display')).not.toEqual('none');
	});
	it('shows the top border at drop coordinates x', function () {
		underTest.updateReorderBounds({edge: 'top', minY: 33}, {}, {x: 10});
		expect(underTest.attr('mapjs-edge')).toEqual('top');
		expect(underTest.css('left')).toEqual('7px');
		expect(underTest.css('top')).toEqual('33px');
	});
	it('shows the left border at drop coords (-chevron width, Y)', function () {
		underTest.updateReorderBounds({edge: 'left', x: 33}, {}, {y: 10});
		expect(underTest.attr('mapjs-edge')).toEqual('left');
		expect(underTest.css('top')).toEqual('2px');
		expect(underTest.css('left')).toEqual('27px');
	});
	it('shows the right border at drop coords (0, Y)', function () {
		underTest.updateReorderBounds({edge: 'right', x: 33}, {}, {y: 10});
		expect(underTest.attr('mapjs-edge')).toEqual('right');
		expect(underTest.css('top')).toEqual('2px');
		expect(underTest.css('left')).toEqual('33px');
	});
});
describe('updateStage', function () {
	'use strict';
	let stage, second;
	beforeEach(function () {
		stage = jQuery('<div>').appendTo('body');
		second = jQuery('<div>').appendTo('body');
	});
	afterEach(function () {
		stage.remove();
		second.remove();
	});
	it('applies width and height by adding subtracting offset from data width', function () {
		stage.data({width: 200, height: 100, offsetX: 50, offsetY: 10}).updateStage();
		expect(stage.css('width')).toBe('150px');
		expect(stage.css('min-width')).toBe('150px');
		expect(stage.css('height')).toBe('90px');
		expect(stage.css('min-height')).toBe('90px');
	});
	it('translates by offsetX, offsetY if scale is 1', function () {
		/* different browsers report transformations differently so we transform an element and compare css */
		stage.data({width: 200, height: 100, offsetX: 50, offsetY: 10, scale: 1}).updateStage();
		second.css({'width': '100px', 'height': '200px', 'transform': 'translate(50px,10px)'});
		expect(stage.css('transform')).toEqual(second.css('transform'));
		second.remove();
	});
	it('scales then transforms', function () {
		stage.data({width: 200, height: 100, offsetX: 50, offsetY: 10, scale: 2}).updateStage();
		second.css({'transform-origin': 'top left', 'width': '100px', 'height': '200px', 'transform': 'scale(2) translate(50px,10px)'});
		expect(stage.css('transform')).toEqual(second.css('transform'));
		expect(stage.css('transform-origin')).toEqual(second.css('transform-origin'));
	});
	it('rounds coordinates for performance', function () {
		stage.data({width: 137.33, height: 100.34, offsetX: 50.21, offsetY: 10.93, scale: 1}).updateStage();
		second.css({'width': '137px', 'height': '100px', 'transform': 'translate(50px,11px)'});
		expect(stage.css('transform')).toEqual(second.css('transform'));
		expect(stage.css('width')).toEqual('87px');
		expect(stage.css('min-width')).toEqual('87px');
		expect(stage.css('height')).toEqual('89px');
		expect(stage.css('min-height')).toEqual('89px');

	});
	it('updates the svg container if present', function () {
		const svgContainer = createSVG().css(
			{
				position: 'absolute',
				top: 0,
				left: 0
			}).attr({
				'data-mapjs-role': 'svg-container',
				'class': 'mapjs-draw-container',
				'width': '100%',
				'height': '100%'
			}).appendTo(stage);
		stage.data({width: 137.33, height: 100.34, offsetX: 50.21, offsetY: 10.93, scale: 1}).updateStage();
		expect(svgContainer[0].getAttribute('viewBox')).toEqual('-50 -11 137 100');
		expect(svgContainer[0].style.top).toEqual('-11px');
		expect(svgContainer[0].style.left).toEqual('-50px');
		expect(svgContainer[0].style.width).toEqual('137px');
		expect(svgContainer[0].style.height).toEqual('100px');
	});
});
describe('editNode', function () {
	'use strict';
	let textBox, node, resolved, rejected;
	const triggerBlur = function (element) {
		const e = document.createEvent('Event');
		e.initEvent('blur', true, true);
		element.dispatchEvent(e);
	};
	beforeEach(function () {
		node = jQuery('<div>').data('title', 'some title').appendTo('body');
		textBox = jQuery('<div>').attr('data-mapjs-role', 'title').text('some old text').appendTo(node);
		spyOn(jQuery.fn, 'focus').and.callThrough();
		spyOn(jQuery.fn, 'shadowDraggable').and.callThrough();
		resolved = jasmine.createSpy('resolved');
		rejected = jasmine.createSpy('rejected');
		node.editNode().then(resolved, rejected);
	});
	it('makes the text box content editable', function () {
		expect(textBox.attr('contenteditable')).toBeTruthy();
	});
	it('fills the text box with the data title attribute', function () {
		expect(textBox.text()).toEqual('some title');
	});
	describe('break word control', function () {
		it('sets the word break to break-all if the original title is different from the text in the box  - this is to avoid long text normally hidden (eg links) messing up the layuot', function () {
			expect(textBox.css('word-break')).toBe('break-all');
		});

		it('clears the word break when the editing is completed', function () {
			//textBox.trigger('blur'); // complete previous edit
			triggerBlur(textBox[0]);
			expect(textBox).not.toHaveOwnStyle('word-break');

		});
		it('clears the word break when the editing is canceled', function () {
			textBox.trigger(jQuery.Event('keydown', { which: 27 }));
			expect(textBox).not.toHaveOwnStyle('word-break');
		});
		it('does not set the word break if the original title and the node text are the same', function () {
			triggerBlur(textBox[0]);
			textBox.text('some title');
			node.editNode();
			expect(textBox).not.toHaveOwnStyle('word-break');
		});
	});

	it('focuses on the text box', function () {
		expect(jQuery.fn.focus).toHaveBeenCalledOnJQueryObject(textBox);
	});
	it('deactivates dragging on the node', function () {
		expect(jQuery.fn.shadowDraggable).toHaveBeenCalledOnJQueryObject(node);
		expect(jQuery.fn.shadowDraggable).toHaveBeenCalledWith({disable: true});
	});
	it('puts the caret at the end of the textbox', function () {
		const selection = window.getSelection();
		expect(selection.type).toEqual('Caret');
		expect(selection.baseOffset).toEqual(10);
		expect(selection.extentOffset).toEqual(10);
		expect(selection.baseNode.parentElement).toEqual(textBox[0]);
		expect(selection.extentNode.parentElement).toEqual(textBox[0]);
	});
	it('does not resolve or reject the promise immediately', function () {
		expect(resolved).not.toHaveBeenCalled();
		expect(rejected).not.toHaveBeenCalled();
	});
	describe('event processing', function () {
		let options, event;
		beforeEach(function () {
			textBox.text('changed text');
		});
		it('completes editing when focus is lost', function () {
			triggerBlur(textBox[0]);
			expect(textBox.attr('contenteditable')).toBeFalsy();
			expect(resolved).toHaveBeenCalledWith('changed text');
		});
		it('consumes multi-line text', function () {
			textBox.html('changed\ntext');
			triggerBlur(textBox[0]);
			expect(resolved).toHaveBeenCalledWith('changed\ntext');
		});
		it('consumes broken firefox contenteditable multi-line text', function () {
			textBox.html('changed<br>text');
			triggerBlur(textBox[0]);
			expect(resolved).toHaveBeenCalledWith('changed\ntext');
		});
		it('converts text box content to text using innerText', function () {
			spyOn(jQuery.fn, 'innerText').and.returnValue('hello there');
			triggerBlur(textBox[0]);
			expect(resolved).toHaveBeenCalledWith('hello there');
		});
		it('reactivates dragging when focus is lost', function () {
			node.attr('mapjs-level', 2);
			jQuery.fn.shadowDraggable.calls.reset();
			triggerBlur(textBox[0]);
			expect(jQuery.fn.shadowDraggable).toHaveBeenCalledOnJQueryObject(node);
			expect(jQuery.fn.shadowDraggable.calls.mostRecent().args).toEqual([]);
		});
		it('completes editing when enter is pressed and prevents further keydown event propagation', function () {
			event = jQuery.Event('keydown', { which: 13 });
			textBox.trigger(event);
			expect(textBox.attr('contenteditable')).toBeFalsy();
			expect(resolved).toHaveBeenCalledWith('changed text');
			expect(event.isPropagationStopped()).toBeTruthy();
		});
		it('completes editing when tab is pressed, prevents the default to avoid focusing out, but does not prevents event propagation so stage can add a new node', function () {
			event = jQuery.Event('keydown', { which: 9 });
			textBox.trigger(event);
			expect(textBox.attr('contenteditable')).toBeFalsy();
			expect(resolved).toHaveBeenCalledWith('changed text');
			expect(event.isPropagationStopped()).toBeFalsy();
			expect(event.isDefaultPrevented()).toBeTruthy();
		});
		it('does not complete editing or prevent propagation if shift+enter is pressed - instead it lets the document handle the line break', function () {
			event = jQuery.Event('keydown', { which: 13, shiftKey: true });
			textBox.trigger(event);
			expect(textBox.attr('contenteditable')).toBeTruthy();
			expect(resolved).not.toHaveBeenCalled();
			expect(event.isPropagationStopped()).toBeFalsy();
		});
		it('cancels editing when escape is pressed, restoring original text and stops event propagation', function () {
			event = jQuery.Event('keydown', { which: 27 });
			textBox.trigger(event);
			expect(textBox.attr('contenteditable')).toBeFalsy();
			expect(rejected).toHaveBeenCalled();
			expect(event.isPropagationStopped()).toBeTruthy();
			expect(textBox.text()).toBe('some old text');
		});
		it('cancels editing if the text is not modified, even if the user did not press escape', function () {
			textBox.text('some title');
			triggerBlur(textBox[0]);
			expect(textBox.attr('contenteditable')).toBeFalsy();
			expect(rejected).toHaveBeenCalled();
			expect(textBox.text()).toBe('some old text');
		});
		_.each(['ctrl', 'meta'], function (specialKey) {
			it('stops editing but lets events propagate when ' + specialKey + ' +s is pressed so map can be saved', function () {
				options = { which: 83 };
				options[specialKey + 'Key'] = true;
				event = jQuery.Event('keydown', options);
				textBox.trigger(event);
				expect(textBox.attr('contenteditable')).toBeFalsy();
				expect(resolved).toHaveBeenCalledWith('changed text');
				expect(event.isPropagationStopped()).toBeFalsy();
				expect(event.isDefaultPrevented()).toBeTruthy();
			});
			it('does not cancel editing if text has changed and ' + specialKey + '+z pressed, but cancels propagation so the map does not get this keyclick as well', function () {
				options = { which: 90 };
				options[specialKey + 'Key'] = true;
				event = jQuery.Event('keydown', options);
				textBox.trigger(event);
				expect(textBox.attr('contenteditable')).toBeTruthy();
				expect(rejected).not.toHaveBeenCalled();
				expect(resolved).not.toHaveBeenCalled();
				expect(event.isPropagationStopped()).toBeTruthy();
			});
			it('cancels editing if text has not changed and ' + specialKey + '+z pressed, also cancels propagation so the map does not get this keyclick as well', function () {
				options = { which: 90 };
				options[specialKey + 'Key'] = true;
				textBox.text('some title');
				event = jQuery.Event('keydown', options);
				textBox.trigger(event);
				expect(textBox.attr('contenteditable')).toBeFalsy();
				expect(rejected).toHaveBeenCalled();
				expect(event.isPropagationStopped()).toBeTruthy();
			});
		});
	});
	afterEach(function () {
		node.remove();
	});
});
describe('animateConnectorToPosition', function () {
	'use strict';
	let from, to, connector;
	beforeEach(function () {
		from = jQuery('<div>').attr('id', 'fromC').appendTo('body').css({position: 'absolute', width: 50, height: 60, left: 70, top: 80}).data({width: 50, height: 60, x: 70, y: 80});
		to = jQuery('<div>').attr('id', 'toC').appendTo('body').css({position: 'absolute', width: 90, height: 100, left: 110, top: 120}).data({width: 90, height: 100, x: 110, y: 120});
		connector = jQuery('<div>').data({type: 'connector', 'nodeFrom': from, 'nodeTo': to}).appendTo('body');
		spyOn(jQuery.fn, 'animate').and.callThrough();
	});
	afterEach(function () {
		from.add(to).add(connector).remove();
	});
	describe('optimises connector transformations to simple animations if possible', function () {
		let result;
		it('when dataBox and real dom boxes for connecting element have just moved by the same offset', function () {
			from.data('x', from.data('x') + 20);
			from.data('y', from.data('y') + 30);
			to.data('x', to.data('x') + 20);
			to.data('y', to.data('y') + 30);
			result = connector.animateConnectorToPosition({ duration: 230, queue: 'animQueue' });
			expect(result).toBeTruthy();
			expect(jQuery.fn.animate).toHaveBeenCalledWith({ left: 90, top: 110 }, { duration: 230, queue: 'animQueue'});
		});
		it('when the movement difference  is less than threshold (to avoid small rounding errors)', function () {
			from.data('x', from.data('x') + 22);
			from.data('y', from.data('y') + 30);
			to.data('x', to.data('x') + 20);
			to.data('y', to.data('y') + 33);
			result = connector.animateConnectorToPosition({ duration: 230, queue: 'animQueue' }, 5);
			expect(result).toBeTruthy();
			expect(jQuery.fn.animate).toHaveBeenCalledWith({ left: 92, top: 110 }, { duration: 230, queue: 'animQueue'});
		});
		it('rounds the coordinates to avoid performance problems', function () {
			from.data('x', from.data('x') + 20.1);
			from.data('y', from.data('y') + 30.3);
			to.data('x', to.data('x') + 20.3);
			to.data('y', to.data('y') + 30.1);
			result = connector.animateConnectorToPosition({ duration: 230, queue: 'animQueue' });
			expect(result).toBeTruthy();
			expect(jQuery.fn.animate).toHaveBeenCalledWith({ left: 90, top: 110 }, { duration: 230, queue: 'animQueue'});
		});
	});
	describe('returns false and does not schedule animations if box differences are nor resolvable using simple translation', function () {
		it('when orientation changes', function () {
			const fromData = _.clone(from.data());
			from.data(to.data());
			to.data(fromData);
			expect(connector.animateConnectorToPosition()).toBeFalsy();
			expect(jQuery.fn.animate).not.toHaveBeenCalled();
		});
		_.each(['fromC', 'toC'], function (changeId) {
			_.each(['width', 'height', 'x', 'y'], function (attrib) {
				it('when node boxes change independently (' + changeId + ' ' + attrib, function () {
					const changeOb = jQuery('#' + changeId);
					changeOb.data(attrib, changeOb.data(attrib) + 5.1);
					expect(connector.animateConnectorToPosition({}, 5)).toBeFalsy();
					expect(jQuery.fn.animate).not.toHaveBeenCalled();
				});
			});
		});

	});

});

describe('DomMapController', function () {
	'use strict';
	let stage,
		viewPort,
		mapModel,
		imageInsertController,
		domMapController,
		resourceTranslator;
	beforeEach(function () {
		mapModel = observable(jasmine.createSpyObj('mapModel', ['setLayoutCalculator', 'selectConnector', 'getReorderBoundary', 'dropImage', 'clickNode', 'positionNodeAt', 'dropNode', 'openAttachment', 'toggleCollapse', 'undo', 'editNode', 'isEditingEnabled', 'editNode', 'setInputEnabled', 'getInputEnabled', 'updateTitle', 'getNodeIdAtPosition', 'selectNode', 'getCurrentlySelectedIdeaId', 'requestContextMenu', 'setNodeWidth']));
		mapModel.getInputEnabled.and.returnValue(true);
		mapModel.isEditingEnabled.and.returnValue(true);
		imageInsertController = observable({});
		viewPort = jQuery('<div>').appendTo('body');
		stage = jQuery('<div>').css('overflow', 'scroll').appendTo(viewPort);
		resourceTranslator = jasmine.createSpy('resourceTranslator');
		domMapController = new DomMapController(mapModel, stage, false, imageInsertController, resourceTranslator);
		spyOn(jQuery.fn, 'queueFadeIn').and.callThrough();
	});
	afterEach(function () {
		viewPort.remove();
	});

	describe('dimensionProvider', function () {
		let newElement, oldUpdateNodeContent, idea;
		beforeEach(function () {
			oldUpdateNodeContent = jQuery.fn.updateNodeContent;
			idea = {id: 'foo.1', title: 'zeka'};
		});
		afterEach(function () {
			if (newElement) {
				newElement.remove();
			}
			jQuery.fn.updateNodeContent = oldUpdateNodeContent;
		});
		it('calculates the width and height of node by drawing an invisible box with .mapjs-node and detaching it after', function () {
			newElement = jQuery('<style type="text/css">.mapjs-node { width:456px !important; min-height:789px !important}</style>').appendTo('body');
			expect(domMapController.dimensionProvider(idea)).toEqual({width: 456, height: 789});
			expect(jQuery('.mapjs-node').length).toBe(0);
		});
		describe('when ideas has a width attribute', function () {
			beforeEach(function () {
				newElement = jQuery('<style type="text/css">.mapjs-node span { min-height:789px; display: inline-block;}</style>').appendTo('body');
			});
			it('should use the width if greater than than the text width', function () {
				idea.attr = {
					style: {
						width: 500
					}
				};
				expect(domMapController.dimensionProvider(idea)).toEqual({width: 500, height: 789});
			});
			it('should use the width if greater than than the max unwrappable text width', function () {
				idea.attr = {
					style: {
						width: 500
					}
				};
				idea.title = 'some short words are in this title that is still a quite long piece of text';
				expect(domMapController.dimensionProvider(idea)).toEqual({width: 500, height: 789});
			});
			it('should use max unwrappable text width if greater than the prefferred width', function () {
				idea.attr = {
					style: {
						width: 500
					}
				};
				idea.title = 'someWshortWwordsWareWinWthisWtitleWthatWisWstillWaWquiteWlongWpieceWofWtext';
				expect(domMapController.dimensionProvider(idea).width).toBeGreaterThan(500);
			});
		});
		it('takes level into consideration when calculating node dimensions', function () {
			newElement = jQuery('<style type="text/css">' +
				'.mapjs-node { width:356px !important; min-height:389px !important} ' +
				'.mapjs-node[mapjs-level="1"] { width:456px !important; min-height:789px !important} ' +
				'</style>').appendTo('body');
			expect(domMapController.dimensionProvider(idea, 1)).toEqual({width: 456, height: 789});
			expect(domMapController.dimensionProvider(idea, 2)).toEqual({width: 356, height: 389});

		});
		it('applies the updateNodeContent function while calculating dimensions', function () {
			jQuery.fn.updateNodeContent = function () {
				this.css('width', '654px');
				this.css('height', '786px');
				return this;
			};
			expect(domMapController.dimensionProvider(idea)).toEqual({width: 654, height: 786});
		});
		describe('caching', function () {
			beforeEach(function () {
				jQuery.fn.updateNodeContent = jasmine.createSpy();
				jQuery.fn.updateNodeContent.and.callFake(function () {
					this.css('width', '654px');
					this.css('height', '786px');
					return this;
				});
			});
			it('looks up a DOM object with the matching node ID and if the node cache mark matches, returns the DOM width without re-applying content', function () {
				newElement = jQuery('<div>').data({width: 111, height: 222}).attr('id', 'node_foo_1').appendTo('body');
				newElement.data('nodeCacheMark', nodeCacheMark(idea));
				expect(domMapController.dimensionProvider(idea)).toEqual({width: 111, height: 222});
				expect(jQuery.fn.updateNodeContent).not.toHaveBeenCalled();
			});
			it('ignores DOM objects where the cache mark does not match', function () {
				newElement = jQuery('<div>').data({width: 111, height: 222}).attr('id', 'node_foo_1').appendTo('body');
				newElement.data('nodeCacheMark', nodeCacheMark(idea));
				expect(domMapController.dimensionProvider(_.extend(idea, {title: 'not zeka'}))).toEqual({width: 654, height: 786});
				expect(jQuery.fn.updateNodeContent).toHaveBeenCalled();
			});
			it('passes the level as an override when finding the cache mark', function () {
				newElement = jQuery('<div>').data({width: 111, height: 222}).attr('id', 'node_foo_1').appendTo('body');
				idea.level = 5;
				newElement.data('nodeCacheMark', nodeCacheMark(idea));
				idea.level = undefined;
				expect(domMapController.dimensionProvider(idea, 5)).toEqual({width: 111, height: 222});
				expect(jQuery.fn.updateNodeContent).not.toHaveBeenCalled();
			});
		});
	});
	describe('event actions', function () {
		describe('nodeCreated', function () {
			describe('adds a DIV for the node to the stage', function () {
				let underTest, node, theme;

				beforeEach(function () {
					theme = new Theme({name: 'test'});
					domMapController.setTheme(theme);
					node = {id: '11.12^13#AB-c', title: 'zeka', x: 10, y: 20, width: 30, height: 40};
					spyOn(jQuery.fn, 'updateNodeContent').and.callFake(function () {
						this.data(node);
						this.css('height', 40);
						this.css('width', 30);
						return this;
					});
					stage.data('offsetX', 200);
					stage.data('offsetY', 100);
					stage.data('scale', 3);

					mapModel.dispatchEvent('nodeCreated', node);
					underTest = stage.children('[data-mapjs-role=node]').first();
				});
				it('sanitises the ID by replacing non alphanumeric chars with underscores', function () {
					expect(underTest.attr('id')).toBe('node_11_12_13_AB-c');
				});
				it('makes the node focusable by adding a tabindex', function () {
					expect(underTest.attr('tabIndex')).toBe('0');
				});
				it('assigns the node role', function () {
					expect(underTest.attr('data-mapjs-role')).toBe('node');
				});
				it('adds an absolute position so it can move and have width', function () {
					expect(underTest.css('display')).toBe('block');
					expect(underTest.css('position')).toBe('absolute');
				});
				it('assigns a mapjs-node css class', function () {
					expect(underTest.hasClass('mapjs-node')).toBeTruthy();
				});
				it('updates the node content', function () {
					expect(jQuery.fn.updateNodeContent).toHaveBeenCalledWith(node, {theme: theme, resourceTranslator: resourceTranslator});
					expect(jQuery.fn.updateNodeContent).toHaveBeenCalledOnJQueryObject(underTest);
					expect(jQuery.fn.updateNodeContent.calls.count()).toBe(1);
				});
				it('schedules a fade-in animation', function () {
					expect(jQuery.fn.queueFadeIn).toHaveBeenCalledOnJQueryObject(underTest);
				});
				it('connects the node tap event to mapModel clickNode', function () {
					const event = jQuery.Event('tap');
					underTest.trigger(event);
					expect(mapModel.clickNode).toHaveBeenCalledWith('11.12^13#AB-c', event);
				});
				it('does not forward right-click events to the mapModel clickNode to avoid double processing', function () {
					const event = jQuery.Event('tap', {gesture: { stopPropagation: jasmine.createSpy(), srcEvent: { button: 1}}});
					underTest.trigger(event);
					expect(mapModel.clickNode).not.toHaveBeenCalled();
				});
				it('selects the node and forwards the contextMenu event by dispatching it for the mapModel', function () {
					mapModel.requestContextMenu.and.returnValue(true);
					const event = jQuery.Event('contextmenu', {pageX: 111, pageY: 112});
					underTest.trigger(event);
					expect(mapModel.selectNode).toHaveBeenCalledWith('11.12^13#AB-c');
					expect(mapModel.requestContextMenu).toHaveBeenCalledWith(111, 112);
					expect(event.isDefaultPrevented()).toBeTruthy();
					expect(event.result).toBe(false);
				});
				it('does not prevent the default on context menu if mapModel returns false from the context menu request', function () {
					mapModel.requestContextMenu.and.returnValue(false);
					const event = jQuery.Event('contextmenu', {pageX: 111, pageY: 112});
					underTest.trigger(event);
					expect(mapModel.selectNode).toHaveBeenCalledWith('11.12^13#AB-c');
					expect(mapModel.requestContextMenu).toHaveBeenCalledWith(111, 112);
					expect(event.isDefaultPrevented()).toBeFalsy();
					expect(event.result).toBeUndefined();
				});
				it('connects the node double-tap event to toggleCollapse if editing is disabled', function () {
					mapModel.isEditingEnabled.and.returnValue(false);
					underTest.trigger('doubletap');
					expect(mapModel.toggleCollapse).toHaveBeenCalledWith('mouse');
					expect(mapModel.editNode).not.toHaveBeenCalled();
				});
				it('connects the node double-tap event to node editing if editing is enabled', function () {
					mapModel.isEditingEnabled.and.returnValue(true);
					underTest.trigger('doubletap');
					expect(mapModel.toggleCollapse).not.toHaveBeenCalled();
					expect(mapModel.editNode).toHaveBeenCalledWith('mouse');
				});
				it('connects attachment-click with openAttachment even when editing is disabled', function () {
					mapModel.isEditingEnabled.and.returnValue(false);
					underTest.trigger('attachment-click');
					expect(mapModel.openAttachment).toHaveBeenCalledWith('mouse', '11.12^13#AB-c');
				});
				it('fixes the width of the node so it does not condense on movements', function () {
					expect(underTest.css('min-width')).toBe('30px');
				});
				it('sets the screen coordinates according to data attributes, ignoring stage zoom and transformations', function () {
					expect(underTest.css('top')).toBe('20px');
					expect(underTest.css('left')).toBe('10px');
				});
			});
			describe('grows the stage if needed to fit in', function () {
				beforeEach(function () {
					stage.data({offsetX: 200, offsetY: 100, width: 300, height: 150});
					spyOn(jQuery.fn, 'updateStage').and.callThrough();
				});

				it('grows the stage from the top if y would be negative', function () {
					mapModel.dispatchEvent('nodeCreated', {x: 20, y: -120, width: 20, height: 10, title: 'zeka', id: 1});
					expect(stage.data('offsetY')).toBe(120);
					expect(stage.data('height')).toBe(170);
					expect(jQuery.fn.updateStage).toHaveBeenCalledOnJQueryObject(stage);
				});
				it('grows the stage from the left if x would be negative', function () {
					mapModel.dispatchEvent('nodeCreated', {x: -230, y: 20, width: 20, height: 10, title: 'zeka', id: 1});
					expect(stage.data('offsetX')).toBe(230);
					expect(stage.data('width')).toBe(330);
					expect(jQuery.fn.updateStage).toHaveBeenCalledOnJQueryObject(stage);
				});
				it('expands the stage min width without touching the offset if the total width would be over the current boundary', function () {
					mapModel.dispatchEvent('nodeCreated', {x: 80, y: 20, width: 40, height: 10, title: 'zeka', id: 1});
					expect(stage.data('width')).toBe(320);
					expect(stage.data('offsetX')).toBe(200);
					expect(jQuery.fn.updateStage).toHaveBeenCalledOnJQueryObject(stage);
				});
				it('expands the stage min height without touching the offset if the total height would be over the current boundary', function () {
					mapModel.dispatchEvent('nodeCreated', {x: 80, y: 20, width: 40, height: 60, title: 'zeka', id: 1});
					expect(stage.data('height')).toBe(180);
					expect(stage.data('offsetY')).toBe(100);
					expect(jQuery.fn.updateStage).toHaveBeenCalledOnJQueryObject(stage);
				});
				it('does not expand the stage or call updateStage if the node would fit into current bounds', function () {
					mapModel.dispatchEvent('nodeCreated', {x: -10, y: -10, width: 20, height: 20, title: 'zeka', id: 1});
					expect(stage.data('width')).toBe(300);
					expect(stage.data('height')).toBe(150);
					expect(stage.data('offsetX')).toBe(200);
					expect(stage.data('offsetY')).toBe(100);
					expect(jQuery.fn.updateStage).not.toHaveBeenCalled();
				});
			});
			describe('holding node action', function () {
				let underTest, holdEvent;
				beforeEach(function () {
					holdEvent = jQuery.Event('hold',
						{
							gesture: {
								center: {pageX: 70, pageY: 50},
								preventDefault: jasmine.createSpy(),
								stopPropagation: jasmine.createSpy(),
								srcEvent: 'the real event'
							}
						});
				});
				it('is not applicable to non touch devices', function () {
					mapModel.dispatchEvent('nodeCreated', {x: 20, y: -120, width: 20, height: 10, title: 'zeka', id: 1});
					underTest = stage.children('[data-mapjs-role=node]').first();
					spyOn(mapModel, 'dispatchEvent').and.callThrough();

					underTest.trigger(holdEvent);

					expect(mapModel.dispatchEvent).not.toHaveBeenCalled();
					expect(mapModel.clickNode).not.toHaveBeenCalled();
				});
				it('on touch devices sends clickNode message to map model and requests the context menu to be shown', function () {
					stage.remove();
					stage = jQuery('<div>').css('overflow', 'scroll').appendTo(viewPort);
					domMapController = new DomMapController(mapModel, stage, true);
					mapModel.dispatchEvent('nodeCreated', {x: 20, y: -120, width: 20, height: 10, title: 'zeka', id: 1});
					underTest = stage.children('[data-mapjs-role=node]').first();

					underTest.trigger(holdEvent);

					expect(mapModel.clickNode).toHaveBeenCalledWith(1, 'the real event');
					expect(mapModel.requestContextMenu).toHaveBeenCalledWith(70, 50);
				});

			});
			describe('drag and drop features', function () {
				let underTest, noShift, withShift, outsideViewport, reorderBoundary;
				beforeEach(function () {
					mapModel.dispatchEvent('nodeCreated', {x: 20, y: -120, width: 20, level: 2, height: 10, title: 'zeka', id: 1});
					mapModel.dispatchEvent('nodeCreated', {x: 20, y: -120, width: 20, level: 1, height: 10, title: 'zeka', id: 2});
					mapModel.dispatchEvent('nodeCreated', {x: 20, y: -120, width: 20, level: 2, height: 10, title: 'zeka', id: 3});
					jQuery('#node_3').addClass('droppable');
					underTest = jQuery('#node_1');
					reorderBoundary = [{
						edge: 'left',
						maxY: 130,
						minY: 120,
						x: 110,
						margin: 10
					}];
					mapModel.getReorderBoundary.and.returnValue(reorderBoundary);
					underTest.trigger(jQuery.Event('mm:start-dragging', {relatedTarget: underTest[0]}));
					viewPort.css({'width': '1000px', 'height': '500px', 'overflow': 'scroll', 'top': '10px', 'left': '10px', 'position': 'absolute'});
					stage.data({offsetX: 200, offsetY: 100, width: 3000, height: 1500, scale: 2}).updateStage();

					viewPort.scrollLeft(20);
					viewPort.scrollTop(10);
					noShift = {gesture: {center: {pageX: 70, pageY: 50}, deltaX: -30, deltaY: -20}, finalPosition: {left: 614, top: 446} };
					withShift = {gesture: {srcEvent: {shiftKey: true}, center: {pageX: 70, pageY: 50}}, finalPosition: {left: 614, top: 446}};
					outsideViewport = {gesture: {srcEvent: {shiftKey: true}, center: {pageX: 1100, pageY: 446}}};
				});
				it('should set node width when resized', function () {
					underTest.trigger(jQuery.Event('mm:resize', {nodeWidth: 120}));
					expect(mapModel.setNodeWidth).toHaveBeenCalledWith('mouse', 1, 120);
				});
				describe('when dragging', function () {
					it('assigns a dragging class', function () {
						expect(underTest.hasClass('dragging')).toBeTruthy();
					});

					it('clears the current droppable if drag event does not have a scrieen position', function () {
						underTest.trigger('mm:drag');
						expect(jQuery('#node_3').hasClass('droppable')).toBeFalsy();
					});
					it('works out the stage position from the page drop position and calls mapModel.getNodeIdAtPosition', function () {
						underTest.trigger(jQuery.Event('mm:drag', noShift));
						expect(mapModel.getNodeIdAtPosition).toHaveBeenCalledWith(-160, -75);
					});
					describe('when over a node', function () {
						beforeEach(function () {
							mapModel.getNodeIdAtPosition.and.returnValue(2);
						});
						it('sets draggable class on the node', function () {
							underTest.trigger(jQuery.Event('mm:drag', noShift));
							expect(jQuery('#node_2').hasClass('droppable')).toBeTruthy();
							expect(jQuery('#node_3').hasClass('droppable')).toBeFalsy();
						});
						it('hides reorder bounds even when the drag object is within reorder bounds', function () {
							noShift.currentPosition = noShift.finalPosition;
							underTest.trigger(jQuery.Event('mm:drag', noShift));
							expect(stage.find('[data-mapjs-role=reorder-bounds]').length).toBeTruthy();
							expect(stage.find('[data-mapjs-role=reorder-bounds]').css('display')).toBe('none');
						});
					});
					describe('when over the background', function () {
						beforeEach(function () {
							mapModel.getNodeIdAtPosition.and.returnValue(false);
						});
						it('removes the draggable class from all nodes', function () {
							underTest.trigger(jQuery.Event('mm:drag', noShift));
							expect(jQuery('#node_2').hasClass('droppable')).toBeFalsy();
							expect(jQuery('#node_3').hasClass('droppable')).toBeFalsy();
						});
						describe('when reorder boundary set with x and margin', function () {
							it('hides the reorder boundary if current position is above the bounds', function () {
								noShift.currentPosition = noShift.finalPosition;
								noShift.currentPosition.top -= 30;
								underTest.trigger(jQuery.Event('mm:drag', noShift));
								expect(stage.find('[data-mapjs-role=reorder-bounds]').length).toBeTruthy();
								expect(stage.find('[data-mapjs-role=reorder-bounds]').css('display')).toBe('none');
							});
							it('shows the reorder boundary if current position is within the bounds', function () {
								noShift.currentPosition = noShift.finalPosition;
								underTest.trigger(jQuery.Event('mm:drag', noShift));
								expect(stage.find('[data-mapjs-role=reorder-bounds]').length).toBeTruthy();
								expect(stage.find('[data-mapjs-role=reorder-bounds]').css('display')).not.toBe('none');
							});
						});
						describe('when reorder boundary set with minX and maxX', function () {
							beforeEach(function () {
								/* box position is 112, 123 */
								reorderBoundary[0] = {
									edge: 'top',
									maxY: 130,
									minY: 120,
									minX: 110,
									maxX: 120
								};
							});
							it('hides the reorder boundary if current position is above the bounds', function () {
								noShift.currentPosition = noShift.finalPosition;
								noShift.currentPosition.top -= 30;
								underTest.trigger(jQuery.Event('mm:drag', noShift));
								expect(stage.find('[data-mapjs-role=reorder-bounds]').length).toBeTruthy();
								expect(stage.find('[data-mapjs-role=reorder-bounds]').css('display')).toBe('none');
							});
							it('shows the reorder boundary if current position is within the bounds', function () {
								noShift.currentPosition = noShift.finalPosition;
								underTest.trigger(jQuery.Event('mm:drag', noShift));
								expect(stage.find('[data-mapjs-role=reorder-bounds]').length).toBeTruthy();
								expect(stage.find('[data-mapjs-role=reorder-bounds]').css('display')).not.toBe('none');
							});

						});
						it('hides the reorder boundary if shift is pressed', function () {
							withShift.currentPosition = noShift.finalPosition;
							underTest.trigger(jQuery.Event('mm:drag', withShift));
							expect(stage.find('[data-mapjs-role=reorder-bounds]').length).toBeTruthy();
							expect(stage.find('[data-mapjs-role=reorder-bounds]').css('display')).toBe('none');
						});
					});
					describe('when over itself', function () {
						beforeEach(function () {
							mapModel.getNodeIdAtPosition.and.returnValue(1);
						});
						it('removes the draggable class from all nodes', function () {
							underTest.trigger(jQuery.Event('mm:drag', noShift));
							expect(jQuery('#node_1').hasClass('droppable')).toBeFalsy();
						});
					});
				});
				describe('when dragging is cancelled', function () {
					beforeEach(function () {
						stage.find('[data-mapjs-role=reorder-bounds]').show();
						underTest.trigger('mm:cancel-dragging');
					});
					it('removes the dragging class', function () {
						expect(underTest.hasClass('dragging')).toBeFalsy();
					});
					it('removes the dropppable class', function () {
						expect(jQuery('#node_3').hasClass('droppable')).toBeFalsy();
					});
					it('hides reorder bounds', function () {
						expect(stage.find('[data-mapjs-role=reorder-bounds]').css('display')).toBe('none');
					});
				});
				describe('when dragging stops', function () {
					it('hides reorder bounds', function () {
						stage.find('[data-mapjs-role=reorder-bounds]').show();
						underTest.trigger('mm:stop-dragging');
						expect(stage.find('[data-mapjs-role=reorder-bounds]').css('display')).toBe('none');
					});
					it('removes the dragging class', function () {
						underTest.trigger('mm:stop-dragging');
						expect(underTest.hasClass('dragging')).toBeFalsy();
					});
					it('removes the droppable class', function () {
						underTest.trigger('mm:stop-dragging');
						expect(jQuery('#node_3').hasClass('droppable')).toBeFalsy();
					});

					it('calls getNodeIdAtPosition to work out if it got dropped on a node', function () {
						underTest.trigger(jQuery.Event('mm:stop-dragging', noShift));
						expect(mapModel.getNodeIdAtPosition).toHaveBeenCalledWith(-160, -75);
					});
					describe('when dropped on a node', function () {
						beforeEach(function () {
							mapModel.getNodeIdAtPosition.and.returnValue(2);
						});
						it('calls dropNode and passes the dropped node ID', function () {
							underTest.trigger(jQuery.Event('mm:stop-dragging', noShift));
							expect(mapModel.dropNode).toHaveBeenCalledWith(1, 2, false);
						});
						it('passes shiftKey status', function () {
							underTest.trigger(jQuery.Event('mm:stop-dragging', withShift));
							expect(mapModel.dropNode).toHaveBeenCalledWith(1, 2, true);
						});
						it('does not set event result to false by default', function () {
							const e = jQuery.Event('mm:stop-dragging', withShift);
							underTest.trigger(e);
							expect(e.result).toBeUndefined();
						});
						it('sets the result to false if dropNode returns false', function () {
							mapModel.dropNode.and.returnValue(false);
							const e = jQuery.Event('mm:stop-dragging', withShift);
							underTest.trigger(e);
							expect(e.result === false).toBeTruthy();
						});
					});
					describe('when level > 1 dropped on background', function () {
						beforeEach(function () {
							mapModel.getNodeIdAtPosition.and.returnValue(false);
						});
						it('calls positionNode and passes the current drop position if not manual', function () {
							underTest.trigger(jQuery.Event('mm:stop-dragging', noShift));
							expect(mapModel.positionNodeAt).toHaveBeenCalledWith(1, -160, -75, /*112, 123, */ false);
						});
						it('calls positionNode and passes the current DOM position if  manual', function () {
							underTest.trigger(jQuery.Event('mm:stop-dragging', withShift));
							expect(mapModel.positionNodeAt).toHaveBeenCalledWith(1, 112, 123, true);
						});
						describe('reorder or manual position check', function () {
							it('does not position manually inside reorder bounds', function () {
								underTest.trigger(jQuery.Event('mm:stop-dragging', noShift));
								expect(mapModel.positionNodeAt.calls.mostRecent().args[3]).toBeFalsy();
							});
							it('forces manual position right of reorder bounds', function () {
								noShift.finalPosition.left += 60;
								underTest.trigger(jQuery.Event('mm:stop-dragging', noShift));
								expect(mapModel.positionNodeAt.calls.mostRecent().args[3]).toBeTruthy();
							});
							it('forces manual position left of reorder bounds', function () {
								noShift.finalPosition.left -= 60;
								underTest.trigger(jQuery.Event('mm:stop-dragging', noShift));
								expect(mapModel.positionNodeAt.calls.mostRecent().args[3]).toBeTruthy();
							});
							it('forces manual position top of reorder bounds', function () {
								noShift.finalPosition.top -= 30;
								underTest.trigger(jQuery.Event('mm:stop-dragging', noShift));
								expect(mapModel.positionNodeAt.calls.mostRecent().args[3]).toBeTruthy();
							});
							it('forces manual position below of reorder bounds', function () {
								noShift.finalPosition.top += 30;
								underTest.trigger(jQuery.Event('mm:stop-dragging', noShift));
								expect(mapModel.positionNodeAt.calls.mostRecent().args[3]).toBeTruthy();
							});
							it('forces manual positioning if shift is pressed even within bounds', function () {
								underTest.trigger(jQuery.Event('mm:stop-dragging', withShift));
								expect(mapModel.positionNodeAt.calls.mostRecent().args[3]).toBeTruthy();
							});
						});
						it('does not set event result to false by default', function () {
							const e = jQuery.Event('mm:stop-dragging', withShift);
							underTest.trigger(e);
							expect(e.result).toBeUndefined();
						});
						it('sets the result to false if dropNode returns false', function () {
							mapModel.positionNodeAt.and.returnValue(false);
							const e = jQuery.Event('mm:stop-dragging', withShift);
							underTest.trigger(e);
							expect(e.result === false).toBeTruthy();
						});
					});
					it('manually positions level 1 nodes when dropped on a background', function () {

						underTest.trigger(jQuery.Event('mm:stop-dragging', noShift));
						mapModel.positionNodeAt.calls.reset();

						underTest = jQuery('#node_2');
						mapModel.getReorderBoundary.and.returnValue(false);
						underTest.trigger('mm:start-dragging');

						const e = jQuery.Event('mm:stop-dragging', noShift);
						mapModel.positionNodeAt.and.returnValue(true);
						underTest.trigger(e);
						expect(mapModel.positionNodeAt).toHaveBeenCalledWith(2, 112, 123, true);
						expect(e.result).toBe(true);
					});
					it('does not position node and does not returns false when dropped outside viewport', function () {
						mapModel.getNodeIdAtPosition.and.returnValue(false);
						const e = jQuery.Event('mm:stop-dragging', outsideViewport);
						underTest.trigger(e);
						expect(mapModel.positionNodeAt).not.toHaveBeenCalled();
						expect(e.result).toBeUndefined();
					});
					describe('when dropped on itself', function () {
						beforeEach(function () {
							mapModel.getNodeIdAtPosition.and.returnValue(1);
							underTest.css({position: 'absolute', top: '123px', left: '112px'});
						});
						it('triggers automatic positioning to drop coordinates if within reorder bounds', function () {
							underTest.trigger(jQuery.Event('mm:stop-dragging', noShift));
							expect(mapModel.positionNodeAt).toHaveBeenCalledWith(1, -160, -75, /*112, 123,*/ false);
							expect(mapModel.dropNode).not.toHaveBeenCalled();
						});
						it('triggers manual positioning to DOM coordinates outside of reorder bounds', function () {
							noShift.finalPosition.left += 60;
							underTest.trigger(jQuery.Event('mm:stop-dragging', noShift));
							expect(mapModel.positionNodeAt).toHaveBeenCalledWith(1, 142, 123, true);
							expect(mapModel.dropNode).not.toHaveBeenCalled();
						});
						it('triggers manual positioning if shift is pressed', function () {
							underTest.trigger(jQuery.Event('mm:stop-dragging', withShift));
							expect(mapModel.positionNodeAt).toHaveBeenCalledWith(1, 112, 123, true);
							expect(mapModel.dropNode).not.toHaveBeenCalled();
						});
					});
				});
			});

		});
		describe('activatedNodesChanged', function () {
			let nodes;
			beforeEach(function () {
				nodes = [];
				for (let i = 0; i < 4; i++) {
					nodes.push(jQuery('<div>').attr('id', 'node_' + i).appendTo(stage));
				}
			});
			it('adds the activated class to all the activated nodes', function () {
				mapModel.dispatchEvent('activatedNodesChanged', [1, 2], []);
				expect(nodes[0].hasClass('activated')).toBeFalsy();
				expect(nodes[1].hasClass('activated')).toBeTruthy();
				expect(nodes[2].hasClass('activated')).toBeTruthy();
				expect(nodes[3].hasClass('activated')).toBeFalsy();
			});
			it('removes the activated class from all deactivated nodes', function () {
				nodes[2].addClass('activated');
				nodes[3].addClass('activated');
				mapModel.dispatchEvent('activatedNodesChanged', [], [2, 3]);
				expect(nodes[0].hasClass('activated')).toBeFalsy();
				expect(nodes[1].hasClass('activated')).toBeFalsy();
				expect(nodes[2].hasClass('activated')).toBeFalsy();
				expect(nodes[3].hasClass('activated')).toBeFalsy();
			});
			it('applies both operations at the same time', function () {
				nodes[2].addClass('activated');
				nodes[3].addClass('activated');
				mapModel.dispatchEvent('activatedNodesChanged', [1], [2, 3]);
				expect(nodes[0].hasClass('activated')).toBeFalsy();
				expect(nodes[1].hasClass('activated')).toBeTruthy();
				expect(nodes[2].hasClass('activated')).toBeFalsy();
				expect(nodes[3].hasClass('activated')).toBeFalsy();
			});
		});
		describe('nodeSelectionChanged', function () {
			let underTest;
			beforeEach(function () {
				const node = {id: '11.12', title: 'zeka', x: -80, y: -35, width: 30, height: 20};
				spyOn(jQuery.fn, 'updateNodeContent').and.callFake(function () {
					this.css('height', 40);
					this.css('width', 30);
					this.data(node);
					return this;
				});
				viewPort.css({'width': '200', 'height': '100', 'overflow': 'scroll'});
				stage.data({
					'offsetX': 100,
					'offsetY': 50,
					'scale': 2,
					'width': 500,
					'height': 500
				});
				stage.updateStage();
				viewPort.scrollLeft(180);
				viewPort.scrollTop(80);

				mapModel.dispatchEvent('nodeCreated', node);
				underTest = stage.children('[data-mapjs-role=node]').first();
				spyOn(jQuery.fn, 'focus').and.callThrough();
				spyOn(jQuery.fn, 'animate');
			});
			describe('when deselected', function () {
				beforeEach(function () {
					underTest.addClass('selected');
					mapModel.dispatchEvent('nodeSelectionChanged', '11.12', false);
				});
				it('removes the selected class', function () {
					expect(underTest.hasClass('selected')).toBeFalsy();
				});
				it('does not move the viewport', function () {
					expect(viewPort.scrollLeft()).toBe(180);
					expect(viewPort.scrollTop()).toBe(80);
				});
				it('does not request focus or animate', function () {
					expect(jQuery.fn.focus).not.toHaveBeenCalled();
					expect(jQuery.fn.animate).not.toHaveBeenCalled();
				});
			});
			describe('when selected', function () {
				describe('when node is visible', function () {
					beforeEach(function () {
						viewPort.scrollLeft(5);
						viewPort.scrollTop(3);
						mapModel.getCurrentlySelectedIdeaId.and.returnValue('11.12');
						mapModel.dispatchEvent('nodeSelectionChanged', '11.12', true);
					});
					it('adds the selected class immediately', function () {
						expect(underTest.hasClass('selected')).toBeTruthy();
					});

					it('does not animate', function () {
						expect(jQuery.fn.animate).not.toHaveBeenCalled();
					});
				});

				_.each([
					['left', -80, 0, {scrollLeft: 30}],
					['top', 0, -20, {scrollTop: 50}],
					['left', -80, 0, {scrollLeft: 30}],
					['top left', -80, -20, {scrollLeft: 30, scrollTop: 50}],
					['right', 90, 0, {scrollLeft: 250}],
					['bottom', 0, 80, {scrollTop: 210}],
					['bottom right', 90, 80, {scrollTop: 210, scrollLeft: 250}]
				], function (testArgs) {
					const caseName = testArgs[0],
						nodeX = testArgs[1],
						nodeY = testArgs[2],
						expectedAnimation = testArgs[3];
					describe('when ' + caseName + ' of viewport', function () {
						beforeEach(function () {
							underTest.data('x', nodeX);
							underTest.data('y', nodeY);
							mapModel.getCurrentlySelectedIdeaId.and.returnValue('11.12');
							mapModel.dispatchEvent('nodeSelectionChanged', '11.12', true);
						});
						it('immediately adds the selected class', function () {
							expect(underTest.hasClass('selected')).toBeTruthy();
						});
						it('animates scroll movements to show selected node', function () {
							expect(jQuery.fn.animate).toHaveBeenCalledOnJQueryObject(viewPort);
							expect(jQuery.fn.animate.calls.first().args[0]).toEqual(expectedAnimation);
						});
					});
				});
			});
		});
		describe('nodeVisibilityRequested', function () {
			let underTest;
			beforeEach(function () {
				const node = {id: '11.12', title: 'zeka', x: -80, y: -35, width: 30, height: 20};
				spyOn(jQuery.fn, 'updateNodeContent').and.callFake(function () {
					this.css('height', 40);
					this.css('width', 30);
					this.data(node);
					return this;
				});
				viewPort.css({'width': '200', 'height': '100', 'overflow': 'scroll'});
				stage.data({
					'offsetX': 100,
					'offsetY': 50,
					'scale': 2,
					'width': 500,
					'height': 500
				});
				stage.updateStage();
				viewPort.scrollLeft(180);
				viewPort.scrollTop(80);
				mapModel.dispatchEvent('nodeCreated', node);
				underTest = stage.children('[data-mapjs-role=node]').first();
				spyOn(jQuery.fn, 'animate').and.callThrough();
			});
			it('should animate scroll movement to show the node', function () {
				underTest.data('x', -80);
				underTest.data('y', -20);
				mapModel.getCurrentlySelectedIdeaId.and.returnValue('11.12');
				mapModel.dispatchEvent('nodeVisibilityRequested', '11.12');
				expect(jQuery.fn.animate).toHaveBeenCalledOnJQueryObject(viewPort);
				expect(jQuery.fn.animate.calls.first().args[0]).toEqual({scrollLeft: 30, scrollTop: 50});
				expect(viewPort.queue()).toEqual([]);
			});
		});

		describe('nodeRemoved', function () {
			let underTest, node;
			beforeEach(function () {
				node = {id: '11', title: 'zeka', x: -80, y: -35, width: 30, height: 20};
				mapModel.dispatchEvent('nodeCreated', node);
				underTest = stage.children('[data-mapjs-role=node]').first();
				spyOn(jQuery.fn, 'queueFadeOut');
			});
			it('animates a fade-out', function () {
				mapModel.dispatchEvent('nodeRemoved', node);
				expect(jQuery.fn.queueFadeOut).toHaveBeenCalledOnJQueryObject(underTest);
			});
		});
		describe('nodeMoved', function () {
			let underTest, node;
			beforeEach(function () {
				node = {id: 1, title: 'zeka', x: 0, y: 0, width: 20, height: 10};
				stage.data({offsetX: 200, offsetY: 100, width: 300, height: 150});
				mapModel.dispatchEvent('nodeCreated', node);
				underTest = stage.children('[data-mapjs-role=node]').first();

				spyOn(jQuery.fn, 'updateStage').and.callThrough();
			});
			it('sets the new data coordinates', function () {
				mapModel.dispatchEvent('nodeMoved', {x: 20, y: -120, width: 200, height: 100, title: 'zeka', id: 1});
				expect(underTest.data('x')).toBe(20);
				expect(underTest.data('y')).toBe(-120);
				expect(underTest.data('width')).toBe(200);
				expect(underTest.data('height')).toBe(100);
			});
			it('rounds the coordinates for performance', function () {
				mapModel.dispatchEvent('nodeMoved', {x: 20.11, y: -119.99, width: 200.4, height: 99.8, title: 'zeka', id: 1});
				expect(underTest.data('x')).toBe(20);
				expect(underTest.data('y')).toBe(-120);
				expect(underTest.data('width')).toBe(200);
				expect(underTest.data('height')).toBe(100);
			});
			describe('expands the stage if needed - using a margin', function () {
				beforeEach(function () {
					domMapController.setStageMargin({top: 10, left: 11, bottom: 12, right: 13});
				});
				it('grows the stage from the top if y would be negative', function () {
					mapModel.dispatchEvent('nodeMoved', {x: 20, y: -120, width: 20, height: 10, title: 'zeka', id: 1});
					expect(stage.data('offsetY')).toBe(130);
					expect(stage.data('height')).toBe(180);
					expect(jQuery.fn.updateStage).toHaveBeenCalledOnJQueryObject(stage);
				});
				it('grows the stage from the left if x would be negative', function () {
					mapModel.dispatchEvent('nodeMoved', {x: -230, y: 20, width: 20, height: 10, title: 'zeka', id: 1});
					expect(stage.data('offsetX')).toBe(241);
					expect(stage.data('width')).toBe(341);
					expect(jQuery.fn.updateStage).toHaveBeenCalledOnJQueryObject(stage);
				});
				it('expands the stage min width without touching the offset if the total width would be over the current boundary', function () {
					mapModel.dispatchEvent('nodeMoved', {x: 90, y: 20, width: 20, height: 10, title: 'zeka', id: 1});
					expect(stage.data('width')).toBe(323);
					expect(stage.data('offsetX')).toBe(200);
					expect(jQuery.fn.updateStage).toHaveBeenCalledOnJQueryObject(stage);
				});
				it('expands the stage min height without touching the offset if the total height would be over the current boundary', function () {
					mapModel.dispatchEvent('nodeMoved', {x: 20, y: 45, width: 20, height: 10, title: 'zeka', id: 1});
					expect(stage.data('height')).toBe(167);
					expect(stage.data('offsetY')).toBe(100);
					expect(jQuery.fn.updateStage).toHaveBeenCalledOnJQueryObject(stage);
				});
				it('does not expand the stage or call updateStage if the node would fit into current bounds', function () {
					mapModel.dispatchEvent('nodeMoved', {x: -10, y: -10, width: 20, height: 10, title: 'zeka', id: 1});
					expect(stage.data('width')).toBe(300);
					expect(stage.data('height')).toBe(150);
					expect(stage.data('offsetX')).toBe(200);
					expect(stage.data('offsetY')).toBe(100);
					expect(jQuery.fn.updateStage).not.toHaveBeenCalled();
				});
			});

			describe('viewport interactions', function () {
				let moveListener, animateMoveListener;
				beforeEach(function () {
					viewPort.css({'width': '200', 'height': '100', 'overflow': 'scroll'});
					stage.data({ 'offsetX': 100, 'offsetY': 50, 'scale': 2, 'width': 500, 'height': 500 });
					stage.updateStage();
					viewPort.scrollLeft(180);
					viewPort.scrollTop(80);
					moveListener = jasmine.createSpy('mapjs:move');
					animateMoveListener = jasmine.createSpy('mapjs:animatemove');
					underTest.on('mapjs:move', moveListener).on('mapjs:animatemove', animateMoveListener);
					spyOn(jQuery.fn, 'animate').and.returnValue(underTest);
				});
				_.each([
					['on left edge of', -20, 10],
					['on right edge of', 80, 10],
					['on top edge of', 20, -15],
					['on bottom edge of', 20, 35],
					['inside', 20, 10]
				],
				function (testArgs) {
					const caseName = testArgs[0], nodeX = testArgs[1], nodeY = testArgs[2];
					describe('when ' + caseName + ' viewport', function () {
						beforeEach(function () {
							mapModel.dispatchEvent('nodeMoved', {x: nodeX, y: nodeY, width: 20, height: 10, id: 1});
						});
						it('does not update screen coordinates immediately', function () {
							expect(underTest.css('left')).toBe('0px');
							expect(underTest.css('top')).toBe('0px');
						});
						it('does not fire the moved event immediately', function () {
							expect(moveListener).not.toHaveBeenCalled();
						});
						it('fires the moveanimate event', function () {
							expect(animateMoveListener).toHaveBeenCalled();
						});
						it('schedules an animation to move the coordinates', function () {
							expect(jQuery.fn.animate).toHaveBeenCalledOnJQueryObject(underTest);
							expect(jQuery.fn.animate.calls.first().args[0]).toEqual({left: nodeX, top: nodeY, opacity: 1});
						});
						it('fires the move event after the animation completes', function () {
							jQuery.fn.animate.calls.first().args[1].complete();
							expect(underTest.css('left')).toBe(nodeX + 'px');
							expect(underTest.css('top')).toBe(nodeY + 'px');
							expect(moveListener).toHaveBeenCalled();
							expect(underTest).not.toHaveOwnStyle('opacity');
						});

					});
				});
				_.each([
					['above', 20, -30],
					['below', 20, 45],
					['left of', -35, 10],
					['right of', 95, 10]
				], function (testArgs) {
					const caseName = testArgs[0], nodeX = testArgs[1], nodeY = testArgs[2];
					describe('when ' + caseName + ' viewport', function () {
						beforeEach(function () {
							mapModel.dispatchEvent('nodeMoved', {x: nodeX, y: nodeY, width: 20, height: 10, id: 1});
						});
						it('updates screen coordinates immediately', function () {
							expect(underTest.css('left')).toBe(nodeX + 'px');
							expect(underTest.css('top')).toBe(nodeY + 'px');
						});
						it('fires the moved event immediately', function () {
							expect(moveListener).toHaveBeenCalled();
						});
						it('does not fire the moveanimate event', function () {
							expect(animateMoveListener).not.toHaveBeenCalled();
						});
						it('does not schedule an animation', function () {
							expect(jQuery.fn.animate).not.toHaveBeenCalled();
						});
					});
				});
			});
		});
		_.each(['nodeTitleChanged', 'nodeAttrChanged', 'nodeLabelChanged'], function (eventType) {
			let underTest;
			it('updates node content on ' + eventType, function () {
				const node = {id: '11', title: 'zeka', x: -80, y: -35, width: 30, height: 20},
					theme = new Theme({name: 'test'});
				domMapController.setTheme(theme);
				mapModel.dispatchEvent('nodeCreated', node);
				underTest = stage.children('[data-mapjs-role=node]').first();
				spyOn(jQuery.fn, 'updateNodeContent');

				mapModel.dispatchEvent(eventType, node);
				expect(jQuery.fn.updateNodeContent).toHaveBeenCalledOnJQueryObject(underTest);
				expect(jQuery.fn.updateNodeContent).toHaveBeenCalledWith(node,
					{
						theme: theme,
						resourceTranslator: resourceTranslator
					});
			});
		});
		describe('nodeEditRequested', function () {
			let underTest, node, editDeferred;
			beforeEach(function () {
				node = {id: '11', title: 'zeka', x: -80, y: -35, width: 30, height: 20};
				mapModel.dispatchEvent('nodeCreated', node);
				underTest = stage.children('[data-mapjs-role=node]').first();
				editDeferred = jQuery.Deferred();
				spyOn(jQuery.fn, 'focus');
				spyOn(jQuery.fn, 'finish');
				spyOn(jQuery.fn, 'editNode').and.returnValue(editDeferred.promise());
			});
			describe('options', function () {
				describe('inlineEditingDisabled', function () {
					beforeEach(function () {
						viewPort.remove();
						spyOn(mapModel, 'addEventListener');
						viewPort = jQuery('<div>').appendTo('body');
						stage = jQuery('<div>').css('overflow', 'scroll').appendTo(viewPort);
						resourceTranslator = jasmine.createSpy('resourceTranslator');
					});
					it('should subscribe to mapModel nodeEditRequested event when no options supplied', function () {
						domMapController = new DomMapController(mapModel, stage, false, imageInsertController, resourceTranslator);
						expect(mapModel.addEventListener).toHaveBeenCalledWith('nodeEditRequested', jasmine.any(Function));
					});
					it('should subscribe to mapModel nodeEditRequested event when no options.inlineEditingDisabled is false', function () {
						domMapController = new DomMapController(mapModel, stage, false, imageInsertController, resourceTranslator, {inlineEditingDisabled: false});
						expect(mapModel.addEventListener).toHaveBeenCalledWith('nodeEditRequested', jasmine.any(Function));
					});
					it('should not subscribe to mapModel nodeEditRequested event when true', function () {
						domMapController = new DomMapController(mapModel, stage, false, imageInsertController, resourceTranslator, {inlineEditingDisabled: true});
						expect(mapModel.addEventListener).not.toHaveBeenCalledWith('nodeEditRequested', jasmine.any(Function));
					});
				});

			});
			describe('when editing an existing node', function () {
				beforeEach(function () {
					mapModel.dispatchEvent('nodeEditRequested', '11', false, false);
				});

				it('disables input on mapModel', function () {
					expect(mapModel.setInputEnabled).toHaveBeenCalledWith(false);
				});
				it('completes all viewport scrolling animations immediately - required to prevent loss of focus when viewport is scrolling', function () {
					expect(jQuery.fn.finish).toHaveBeenCalledOnJQueryObject(viewPort);
				});
				it('puts the node into edit mode', function () {
					expect(jQuery.fn.editNode).toHaveBeenCalledOnJQueryObject(underTest);
				});
				describe('when editing completes', function () {
					beforeEach(function () {
						mapModel.setInputEnabled.calls.reset();
						editDeferred.resolve('new text');
					});
					it('re-enables input on map model', function () {
						expect(mapModel.setInputEnabled).toHaveBeenCalledWith(true);
					});
					it('updates the node title', function () {
						expect(mapModel.updateTitle).toHaveBeenCalledWith('11', 'new text', false);
					});
					it('sets the focus back on the node', function () {
						expect(jQuery.fn.focus).toHaveBeenCalledOnJQueryObject(underTest);
					});
				});
				describe('when editing fails', function () {
					beforeEach(function () {
						mapModel.setInputEnabled.calls.reset();
						editDeferred.reject();
					});
					it('re-enables input on map model', function () {
						expect(mapModel.setInputEnabled).toHaveBeenCalledWith(true);
					});
					it('does not undo the last action', function () {
						expect(mapModel.undo).not.toHaveBeenCalled();
					});
					it('sets the focus back on the node', function () {
						expect(jQuery.fn.focus).toHaveBeenCalledOnJQueryObject(underTest);
					});
				});
			});
			describe('when editing an existing node', function () {
				beforeEach(function () {
					mapModel.dispatchEvent('nodeEditRequested', '11', false, true);
				});
				it('passes the editNew correctly to mapModel when updating the title', function () {
					editDeferred.resolve('new text');
					expect(mapModel.updateTitle).toHaveBeenCalledWith('11', 'new text', true);
				});
				it('calls undo to drop the newly added node when editing is cancelled', function () {
					editDeferred.reject();
					expect(mapModel.undo).toHaveBeenCalled();

				});
			});
		});
		describe('connector events', function () {
			let nodeFrom, nodeTo, underTest, connector, svgContainer, theme;
			beforeEach(function () {
				svgContainer = createSVG().attr({
					'data-mapjs-role': 'svg-container',
					'class': 'mapjs-draw-container'
				});
				stage.append(svgContainer);
				theme = new Theme({name: 'fromTest'});
				domMapController.setTheme(theme);
				stage.attr('data-mapjs-role', 'stage');
				connector = {type: 'connector', from: '1.from', to: '1.to', attr: {lovely: true}};
				mapModel.dispatchEvent('nodeCreated', {id: '1.from', title: 'zeka', x: -80, y: -35, width: 30, height: 20});
				mapModel.dispatchEvent('nodeCreated', {id: '1.to', title: 'zeka2', x: 80, y: 35, width: 50, height: 34});
				nodeFrom = jQuery('#node_1_from');
				nodeTo = jQuery('#node_1_to');
				spyOn(jQuery.fn, 'updateConnector').and.callThrough();
				jQuery.fn.queueFadeIn.calls.reset();

				mapModel.dispatchEvent('connectorCreated', connector);
				underTest = svgContainer.children('[data-mapjs-role=connector]').first();

			});
			describe('connectorCreated', function () {
				it('adds a connector element to the stage', function () {
					expect(underTest.length).toBe(1);
					expect(underTest.parent()[0]).toEqual(svgContainer[0]);
				});
				it('creates a SVG mapjs-draw-container class', function () {
					expect(underTest.prop('tagName')).toBe('g');
				});
				it('assigns the DOM Id by sanitising node IDs', function () {
					expect(underTest.prop('id')).toBe('connector_1_from_1_to');
				});
				it('maps the from and to nodes as jQuery objects to data properties', function () {
					expect(underTest.data('nodeFrom')[0]).toEqual(nodeFrom[0]);
					expect(underTest.data('nodeTo')[0]).toEqual(nodeTo[0]);
				});
				it('updates the connector content', function () {
					expect(jQuery.fn.updateConnector).toHaveBeenCalledOnJQueryObject(underTest);
					expect(jQuery.fn.updateConnector.calls.mostRecent().args).toEqual([{canUseData: true, theme: theme}]);
				});
				it('sets the connector attributes as data', function () {
					expect(underTest.data('attr')).toEqual({lovely: true});
				});
				it('wires a link hit event to mapModel selectConnector', function () {
					const evt = new jQuery.Event('tap');
					underTest.find('path.mapjs-link-hit').trigger(evt);
					expect(mapModel.selectConnector).toHaveBeenCalledWith('mouse', connector, undefined);
					expect(evt.isPropagationStopped()).toBeTruthy();
				});
				it('sends the gesture page coordinates if the gesture is supplied with the event', function () {
					const stopProp = jasmine.createSpy('stopProp'),
						evt = new jQuery.Event('tap', { gesture: {stopPropagation: stopProp, center: { pageX: 100, pageY: 200} } });

					underTest.find('path.mapjs-link-hit').trigger(evt);
					expect(mapModel.selectConnector).toHaveBeenCalledWith('mouse', connector, {x: 100, y: 200});
					expect(stopProp).toHaveBeenCalled();
				});
				describe('event wiring for node updates', function () {
					beforeEach(function () {
						jQuery.fn.updateConnector.calls.reset();
						spyOn(jQuery.fn, 'animateConnectorToPosition');
					});
					_.each(['from', 'to'], function (node) {
						describe('moving node ' + node, function () {
							beforeEach(function () {
								jQuery('#node_1_' + node).trigger('mapjs:move');
							});
							it('updates connector', function () {
								expect(jQuery.fn.updateConnector).toHaveBeenCalledOnJQueryObject(underTest);
								expect(jQuery.fn.updateConnector.calls.mostRecent().args).toEqual([{theme: theme, canUseData: true}]);
							});
							it('does not add connectors to animation list', function () {
								mapModel.dispatchEvent('layoutChangeComplete');
								expect(jQuery.fn.animateConnectorToPosition).not.toHaveBeenCalled();
							});
						});
						it('updates the connector immediately on theme change', function () {
							mapModel.dispatchEvent('layoutChangeComplete', {themeChanged: true});
							expect(jQuery.fn.updateConnector).toHaveBeenCalledOnJQueryObject(underTest);
							expect(jQuery.fn.updateConnector.calls.mostRecent().args).toEqual([{theme: theme, canUseData: true}]);
						});
						describe('animating node ' + node, function () {
							beforeEach(function () {
								jQuery('#node_1_' + node).trigger('mapjs:animatemove');
							});
							it('does not update the connector immediately', function () {
								expect(jQuery.fn.updateConnector).not.toHaveBeenCalled();
							});
							it('does not animate the connector immediately', function () {
								expect(jQuery.fn.animateConnectorToPosition).not.toHaveBeenCalled();
							});
							it('animates the connector after the layout change is complete', function () {
								mapModel.dispatchEvent('layoutChangeComplete');
								expect(jQuery.fn.animateConnectorToPosition).toHaveBeenCalledOnJQueryObject(underTest);
							});
							it('if a connector cannot simply be animated, updates with each animation progress tick', function () {
								jQuery.fn.animateConnectorToPosition.and.returnValue(false);
								jQuery.fn.updateConnector.calls.reset();

								spyOn(jQuery.fn, 'animate');
								mapModel.dispatchEvent('layoutChangeComplete');

								jQuery.fn.animate.calls.mostRecent().args[1].progress();
								expect(jQuery.fn.updateConnector).toHaveBeenCalledOnJQueryObject(underTest);
								expect(jQuery.fn.updateConnector.calls.mostRecent().args).toEqual([{theme: theme}]);

							});
						});
					});
				});
			});
			describe('connectorRemoved', function () {
				it('removes the element', function () {
					mapModel.dispatchEvent('connectorRemoved', connector);
					expect(underTest.parent().length).toEqual(0);
				});
			});

			describe('connectorAttrChanged', function () {
				beforeEach(function () {
					connector.attr = {lovely: false};
				});
				it('updates the connector', function () {
					jQuery.fn.updateConnector.calls.reset();
					mapModel.dispatchEvent('connectorAttrChanged', connector);
					expect(jQuery.fn.updateConnector).toHaveBeenCalledOnJQueryObject(underTest);
					expect(jQuery.fn.updateConnector.calls.mostRecent().args).toEqual([{canUseData: true, theme: theme}]);
				});
				it('updates the connector data attributes', function () {
					mapModel.dispatchEvent('connectorAttrChanged', connector);
					expect(underTest.data('attr')).toEqual({lovely: false});
				});
			});

		});


		describe('link events', function () {
			let nodeFrom, nodeTo, underTest, link, svgContainer, theme;
			beforeEach(function () {
				svgContainer = createSVG().attr({
					'data-mapjs-role': 'svg-container',
					'class': 'mapjs-draw-container'
				});
				theme = new Theme({name: 'new'});
				domMapController.setTheme(theme);
				stage.append(svgContainer);
				stage.attr('data-mapjs-role', 'stage');
				link = {type: 'link', ideaIdFrom: '1.from', ideaIdTo: '1.to', attr: {style: {color: 'blue', lineStyle: 'solid', arrow: true}}};
				mapModel.dispatchEvent('nodeCreated', {id: '1.from', title: 'zeka', x: -80, y: -35, width: 30, height: 20});
				mapModel.dispatchEvent('nodeCreated', {id: '1.to', title: 'zeka2', x: 80, y: 35, width: 50, height: 34});
				nodeFrom = jQuery('#node_1_from');
				nodeTo = jQuery('#node_1_to');
				spyOn(jQuery.fn, 'updateLink').and.callThrough();
				jQuery.fn.queueFadeIn.calls.reset();

				mapModel.dispatchEvent('linkCreated', link);
				underTest = svgContainer.children('[data-mapjs-role=link]').first();

			});
			describe('linkCreated', function () {
				it('adds a link element to the stage', function () {
					expect(underTest.length).toBe(1);
					expect(underTest.parent()[0]).toEqual(svgContainer[0]);
				});
				it('creates a SVG mapjs-draw-container class', function () {
					expect(underTest.prop('tagName')).toBe('g');
				});
				it('assigns the DOM Id by sanitising node IDs', function () {
					expect(underTest.prop('id')).toBe('link_1_from_1_to');
				});
				it('maps the from and to nodes as jQuery objects to data properties', function () {
					expect(underTest.data('nodeFrom')[0]).toEqual(nodeFrom[0]);
					expect(underTest.data('nodeTo')[0]).toEqual(nodeTo[0]);
				});
				it('updates the link content', function () {
					expect(jQuery.fn.updateLink).toHaveBeenCalledOnJQueryObject(underTest);
					expect(jQuery.fn.updateLink.calls.mostRecent().args).toEqual([{theme: theme}]);
				});
				it('passes the style properties as data attributes to the DOM object', function () {
					expect(underTest.data('attr')).toEqual({
						'lineStyle': 'solid',
						'color': 'blue',
						'arrow': true
					});
				});
				describe('event wiring for node updates', function () {

					beforeEach(function () {
						jQuery.fn.updateLink.calls.reset();
						spyOn(jQuery.fn, 'animateConnectorToPosition');

					});
					_.each(['from', 'to'], function (node) {
						describe('moving node ' + node, function () {
							beforeEach(function () {
								jQuery('#node_1_' + node).trigger('mapjs:move');
							});
							it('updates link', function () {
								expect(jQuery.fn.updateLink).toHaveBeenCalledOnJQueryObject(underTest);
								expect(jQuery.fn.updateLink.calls.mostRecent().args).toEqual([{theme: theme}]);
							});
							it('does not add links to animation list', function () {
								mapModel.dispatchEvent('layoutChangeComplete');
								expect(jQuery.fn.animateConnectorToPosition).not.toHaveBeenCalled();
							});
						});
						it('updates the connector immediately on theme change', function () {
							mapModel.dispatchEvent('layoutChangeComplete', {themeChanged: true});
							expect(jQuery.fn.updateLink).toHaveBeenCalledOnJQueryObject(underTest);
							expect(jQuery.fn.updateLink.calls.mostRecent().args).toEqual([{theme: theme, canUseData: true}]);
						});

						describe('animating node ' + node, function () {
							beforeEach(function () {
								jQuery('#node_1_' + node).trigger('mapjs:animatemove');
							});
							it('does not update the link immediately', function () {
								expect(jQuery.fn.updateLink).not.toHaveBeenCalled();
							});
							it('does not animate the link immediately', function () {
								expect(jQuery.fn.animateConnectorToPosition).not.toHaveBeenCalled();
							});
							it('animates the link after the layout change is complete', function () {
								mapModel.dispatchEvent('layoutChangeComplete');
								expect(jQuery.fn.animateConnectorToPosition).toHaveBeenCalledOnJQueryObject(underTest);
							});
							it('if a link cannot simply be animated, updates with each animation progress tick', function () {
								jQuery.fn.animateConnectorToPosition.and.returnValue(false);
								jQuery.fn.updateLink.calls.reset();

								spyOn(jQuery.fn, 'animate');
								mapModel.dispatchEvent('layoutChangeComplete');

								jQuery.fn.animate.calls.mostRecent().args[1].progress();
								expect(jQuery.fn.updateLink).toHaveBeenCalledOnJQueryObject(underTest);
								expect(jQuery.fn.updateLink.calls.mostRecent().args).toEqual([{theme: theme}]);
							});
						});
					});
				});
			});
			describe('linkRemoved', function () {
				it('schedules a fade out animation', function () {
					mapModel.dispatchEvent('linkRemoved', link);
					expect(underTest.parent().length).toEqual(0);
				});
			});
			describe('linkAttrChanged', function () {

				it('passes the style properties as data attributes to the DOM object', function () {
					mapModel.dispatchEvent('linkAttrChanged', {type: 'link', ideaIdFrom: '1.from', ideaIdTo: '1.to', attr: {style: {color: 'yellow', lineStyle: 'dashed', arrow: true}}});
					expect(underTest.data('attr')).toEqual({
						lineStyle: 'dashed',
						color: 'yellow',
						arrow: true
					});
				});
				it('removes arrow if not set', function () {
					mapModel.dispatchEvent('linkAttrChanged', {type: 'link', ideaIdFrom: '1.from', ideaIdTo: '1.to', attr: {style: {color: 'yellow', lineStyle: 'dashed'}}});
					expect(underTest.data('arrow')).toBeFalsy();
					expect(underTest.data('attr')).toEqual({
						lineStyle: 'dashed',
						color: 'yellow'
					});
				});
				it('calls updateLink', function () {
					jQuery.fn.updateLink.calls.reset();
					mapModel.dispatchEvent('linkAttrChanged', {type: 'link', ideaIdFrom: '1.from', ideaIdTo: '1.to', attr: {style: {color: 'yellow', lineStyle: 'dashed'}}});
					expect(jQuery.fn.updateLink).toHaveBeenCalledOnJQueryObject(underTest);
					expect(jQuery.fn.updateLink.calls.mostRecent().args).toEqual([{theme: theme}]);
				});
			});
			describe('addLinkModeToggled', function () {
				it('gives the stage the mapjs-add-link class if on', function () {
					mapModel.dispatchEvent('addLinkModeToggled', true);
					expect(stage.hasClass('mapjs-add-link')).toBeTruthy();
				});
				it('gives the stage the mapjs-add-link class if on', function () {
					stage.addClass('mapjs-add-link');
					mapModel.dispatchEvent('addLinkModeToggled', false);
					expect(stage.hasClass('mapjs-add-link')).toBeFalsy();
				});
			});
		});
		describe('mapScaleChanged', function () {
			beforeEach(function () {
				spyOn(jQuery.fn, 'updateStage').and.callThrough();
				spyOn(jQuery.fn, 'animate');
				viewPort.css({'width': '200', 'height': '100', 'overflow': 'scroll'});
				stage.data({ 'offsetX': 100, 'offsetY': 50, 'scale': 1, 'width': 1000, 'height': 1000 });
				stage.updateStage();
				viewPort.scrollLeft(180);
				viewPort.scrollTop(80);

				stage.updateStage.calls.reset();
				mapModel.dispatchEvent('mapScaleChanged', 2);
			});
			it('updates stage data property and calls updateStage to set CSS transformations', function () {
				expect(stage.data('scale')).toBe(2);
				expect(jQuery.fn.updateStage).toHaveBeenCalledOnJQueryObject(stage);
			});
			it('applies scale factors successively', function () {
				mapModel.dispatchEvent('mapScaleChanged', 2.5);
				expect(stage.data('scale')).toBe(5);
			});
			it('keeps the center point in the same position in the new scale', function () {
				expect(viewPort.scrollLeft()).toBe(460);
				expect(viewPort.scrollTop()).toBe(210);
			});
			it('does not allow scaling by more than factor of 5', function () {
				mapModel.dispatchEvent('mapScaleChanged', 10);
				expect(stage.data('scale')).toBe(5);
			});
			it('does not allow scaling by a factor of less than 0.2', function () {
				mapModel.dispatchEvent('mapScaleChanged', 0.0001);
				expect(stage.data('scale')).toBe(0.2);
			});
		});
		describe('mapViewResetRequested', function () {
			let theme;
			beforeEach(function () {
				theme = new Theme({name: 'new'});
				domMapController.setTheme(theme);

				spyOn(jQuery.fn, 'updateStage').and.callThrough();
				spyOn(jQuery.fn, 'updateConnector').and.callThrough();
				spyOn(jQuery.fn, 'updateLink').and.callThrough();
				viewPort.css({'width': '200', 'height': '100', 'overflow': 'scroll'});
				stage.data({ 'offsetX': 100, 'offsetY': 50, 'scale': 1, 'width': 400, 'height': 300 }).updateStage();
				viewPort.scrollLeft(10).scrollTop(10);
				mapModel.dispatchEvent('nodeCreated', {id: '11.12', title: 'zeka2', x: 100, y: 50, width: 20, height: 10});
				mapModel.dispatchEvent('nodeCreated', {id: '12.12', title: 'zeka3', x: 200, y: 150, width: 20, height: 10});
				mapModel.dispatchEvent('nodeCreated', {id: '13.12', title: 'zeka3', x: 300, y: 250, width: 20, height: 10});
				mapModel.dispatchEvent('connectorCreated', {from: '11.12', to: '12.12'});
				mapModel.dispatchEvent('connectorCreated', {from: '12.12', to: '13.12'});
				mapModel.dispatchEvent('linkCreated', {ideaIdFrom: '11.12', ideaIdTo: '13.12', attr: {style: {color: 'blue', lineStyle: 'solid', arrow: true}}});
				mapModel.getCurrentlySelectedIdeaId.and.returnValue('11.12');
				jQuery.fn.updateStage.calls.reset();
			});

			it('resets stage scale', function () {
				stage.data({scale: 2}).updateStage();
				stage.updateStage.calls.reset();
				mapModel.dispatchEvent('mapViewResetRequested');
				expect(stage.data('scale')).toBe(1);
				expect(jQuery.fn.updateStage).toHaveBeenCalledOnJQueryObject(stage);
			});
			it('resets stage data to contain all nodes and put the focused node in the center', function () {
				stage.data({'scale': 1, 'height': 500, 'width': 1000, 'offsetX': 20, 'offsetY': 500}).updateStage();
				mapModel.dispatchEvent('mapViewResetRequested');
				expect(stage.data()).toEqual({'scale': 1, 'height': 260, 'width': 320, 'offsetX': 0, 'offsetY': 0});
			});
			it('should update Connectors', function () {
				jQuery.fn.updateConnector.calls.reset();
				mapModel.dispatchEvent('mapViewResetRequested');
				expect(jQuery.fn.updateConnector).toHaveBeenCalledOnJQueryObject(jQuery('[data-mapjs-role=connector]'));
				expect(jQuery.fn.updateConnector.calls.mostRecent().args).toEqual([{canUseData: true, theme: theme}]);
			});
			it('should update Links', function () {
				jQuery.fn.updateLink.calls.reset();
				mapModel.dispatchEvent('mapViewResetRequested');
				expect(jQuery.fn.updateLink).toHaveBeenCalledOnJQueryObject(jQuery('[data-mapjs-role=link]'));
				expect(jQuery.fn.updateLink.calls.mostRecent().args).toEqual([{theme: theme}]);
			});
			it('centers the view', function () {
				mapModel.dispatchEvent('mapViewResetRequested');
				expect(viewPort.scrollLeft()).toBe(10);
				expect(viewPort.scrollTop()).toBe(5);
			});
		});
		describe('nodeFocusRequested', function () {
			beforeEach(function () {
				spyOn(jQuery.fn, 'updateStage').and.callThrough();
				spyOn(jQuery.fn, 'animate').and.callFake(function () {
					return this;
				});
				viewPort.css({'width': '200', 'height': '100', 'overflow': 'scroll'});
				stage.data({ 'offsetX': 100, 'offsetY': 50, 'scale': 1, 'width': 400, 'height': 300 });
				stage.updateStage();
				viewPort.scrollLeft(180);
				viewPort.scrollTop(80);
				mapModel.dispatchEvent('nodeCreated', {id: '11.12', title: 'zeka2', x: 100, y: 50, width: 20, height: 10});
				jQuery.fn.animate.calls.reset();
				jQuery.fn.updateStage.calls.reset();
			});
			it('resets stage scale', function () {
				stage.data({scale: 2}).updateStage();
				stage.updateStage.calls.reset();
				mapModel.dispatchEvent('nodeFocusRequested', '11.12');
				expect(stage.data('scale')).toBe(1);
				expect(jQuery.fn.updateStage).toHaveBeenCalledOnJQueryObject(stage);
			});
			it('does not immediately change viewport', function () {
				mapModel.dispatchEvent('nodeFocusRequested', '11.12');
				expect(viewPort.scrollLeft()).toBe(180);
				expect(viewPort.scrollTop()).toBe(80);
			});
			it('schedules an animation for the viewport', function () {
				mapModel.dispatchEvent('nodeFocusRequested', '11.12');
				expect(jQuery.fn.animate.calls.count()).toBe(1);
				expect(jQuery.fn.animate).toHaveBeenCalledWith({scrollLeft: 110, scrollTop: 55}, {duration: 400});
				expect(jQuery.fn.animate).toHaveBeenCalledOnJQueryObject(viewPort);
			});
			it('does not expand the stage if not needed', function () {
				mapModel.dispatchEvent('nodeFocusRequested', '11.12');
				expect(stage.data()).toEqual({ 'offsetX': 100, 'offsetY': 50, 'scale': 1, 'width': 400, 'height': 300 });
				expect(jQuery.fn.updateStage).not.toHaveBeenCalled();
			});
			describe('expands the stage to enable scrolling to the node point when the node is ', function () {
				[
					['left', -50, 50, 140, 50, 440, 300],
					['top', 100, -40, 100, 85, 400, 335],
					['right', 270, 50, 100, 50, 480, 300],
					['bottom', 100, 230, 100, 50, 400, 335]
				].forEach(function (testCase) {
					const testName = testCase[0],
						nodeX = testCase[1],
						nodeY = testCase[2],
						expectedStageOffsetX = testCase[3],
						expectedStageOffsetY = testCase[4],
						expectedStageWidth = testCase[5],
						expectedStageHeight = testCase[6];

					it(testName, function () {
						jQuery('#node_11_12').data({x: nodeX, y: nodeY});
						mapModel.dispatchEvent('nodeFocusRequested', '11.12');
						expect(jQuery.fn.updateStage).toHaveBeenCalledOnJQueryObject(stage);

						expect(stage.data('offsetX')).toEqual(expectedStageOffsetX);
						expect(stage.data('offsetY')).toEqual(expectedStageOffsetY);
						expect(stage.data('width')).toEqual(expectedStageWidth);
						expect(stage.data('height')).toEqual(expectedStageHeight);
					});
				});
			});
		});
		describe('image drag and drop', function () {
			it('converts event coordinates to stage coordinates and delegates to mapModel.dropImage', function () {
				viewPort.css({'width': '100px', 'height': '50px', 'overflow': 'scroll', 'top': '10px', 'left': '10px', 'position': 'absolute'});
				stage.data({offsetX: 200, offsetY: 100, width: 300, height: 150, scale: 2}).updateStage();
				viewPort.scrollLeft(20);
				viewPort.scrollTop(10);
				imageInsertController.dispatchEvent('imageInserted', 'http://url', 666, 777, {pageX: 70, pageY: 50});
				expect(mapModel.dropImage).toHaveBeenCalledWith('http://url', 666, 777, -160, -75);
				expect(resourceTranslator).not.toHaveBeenCalled();
			});
		});
	});
});
describe('setThemeClassList', function () {
	'use strict';
	let underTest, domElement;
	beforeEach(function () {
		underTest = jQuery('<div>').appendTo('body');
		domElement = underTest[0];
		domElement.classList.add.apply(domElement.classList, ['level_2', 'attr_foo']);
	});
	afterEach(function () {
		underTest.remove();
	});
	it('should remove theme classes that are already set on the element', function () {
		underTest.setThemeClassList([]);
		expect(underTest.attr('class')).toEqual('');
	});
	it('should remove theme classes if no array is supplied', function () {
		underTest.setThemeClassList();
		expect(underTest.attr('class')).toEqual('');
	});
	it('should not remove non theme classes that are already set on the element', function () {
		domElement.classList.add.apply(domElement.classList, ['foo', 'bar']);
		underTest.setThemeClassList([]);
		expect(underTest.attr('class')).toEqual('foo bar');
	});
	it('should not add the default class', function () {
		underTest.setThemeClassList(['default']);
		expect(underTest.attr('class')).toEqual('');

	});
	it('should add theme classes to the element', function () {
		underTest.setThemeClassList(['level_3', 'attr_bar']);
		expect(underTest.attr('class')).toEqual('level_3 attr_bar');
		expect(underTest.hasClass('level_3')).toBeTruthy();
		expect(underTest.hasClass('attr_bar')).toBeTruthy();
	});
	it('should not duplicate classes on the element', function () {
		underTest.setThemeClassList(['level_2', 'attr_bar']);
		expect(underTest.attr('class')).toEqual('level_2 attr_bar');

	});

});
