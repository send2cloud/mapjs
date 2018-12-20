/*global module, require, console */
let textEngine;
const TTFWriter = require('@mindmup/ttf-writer'),
	TSpanTextEngine = require('../../src/tspan-text-engine'),
	LineBreak = require('../../src/naive-line-break'),
	fontPath = require('./font-path'),
	initTextEngine = function () {
		'use strict';
		if (!textEngine) {
			const ttfWriter = new TTFWriter();
			return ttfWriter.load([fontPath('notor.ttf')], [fontPath('notob.ttf')])
				.then(() =>	textEngine = new TSpanTextEngine(ttfWriter.width, LineBreak))
				.catch(e => console.error('cannot load fonts', e));
		}
		return Promise.resolve(textEngine);
	};

module.exports = initTextEngine;
