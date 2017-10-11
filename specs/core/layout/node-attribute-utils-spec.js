/*global require, describe, beforeEach, it, expect*/

const underTest = require('../../../src/core/layout/node-attribute-utils');

describe('nodeAttributeUtils', () => {
	'use strict';
	let nodes;
	beforeEach(() => {
		nodes = {
			1: {
				attr: {
					foo: {
						bar: 'actual bar value'
					}
				}
			},
			2: {
				attr: {
					foo: {
						bar: underTest.INHERIT_MARKER,
						foo: underTest.INHERIT_MARKER,
						foobar: 'actual foobar value'
					}
				},
				parentId: 1
			},
			3: {
				attr: {
					foo: {
						bar: underTest.INHERIT_MARKER,
						foo: underTest.INHERIT_MARKER,
						foobar: underTest.INHERIT_MARKER
					}
				},
				parentId: 2
			}
		};
	});
	describe('inheritAttributeKeysFromParentNode', () => {
		let keysToInherit;
		beforeEach(() => {
			keysToInherit = [
				['foo', 'bar'],
				['foo', 'foo']
			];
		});
		it('should inherit values from the parent node', () => {
			underTest.inheritAttributeKeysFromParentNode(nodes[1], nodes[2], keysToInherit);
			expect(nodes[2].attr.foo.bar).toEqual('actual bar value');
		});
		it('should leave values missing from the parent node', () => {
			underTest.inheritAttributeKeysFromParentNode(nodes[1], nodes[2], keysToInherit);
			expect(nodes[2].attr.foo.foo).toEqual(underTest.INHERIT_MARKER);
		});
		it('should return keys not resolved', () => {
			expect(underTest.inheritAttributeKeysFromParentNode(nodes[1], nodes[2], keysToInherit)).toEqual([['foo', 'foo']]);
		});
		it('should return all keys if parent does not have attr', () => {
			delete nodes[1].attr;
			expect(underTest.inheritAttributeKeysFromParentNode(nodes[1], nodes[2], keysToInherit)).toEqual(keysToInherit);
		});
	});
	describe('inheritAttributeKeys', () => {
		let keysToInherit;
		beforeEach(() => {
			keysToInherit = [
				['foo', 'bar'],
				['foo', 'foo'],
				['foo', 'foobar']
			];
		});
		it('should inherit all possible attributes', () => {
			underTest.inheritAttributeKeys(nodes, nodes[3], keysToInherit);
			expect(nodes[3].attr).toEqual({
				foo: {
					bar: 'actual bar value',
					foo: underTest.INHERIT_MARKER,
					foobar: 'actual foobar value'
				}
			});
		});
		it('should inherit all attributes in intermediate parents', () => {
			underTest.inheritAttributeKeys(nodes, nodes[3], keysToInherit);
			expect(nodes[2].attr).toEqual({
				foo: {
					bar: 'actual bar value',
					foo: underTest.INHERIT_MARKER,
					foobar: 'actual foobar value'
				}
			});
		});
	});
	describe('inheritAttributes', () => {
		it('should inherit all marked attributes for leaf nodes', () => {
			underTest.inheritAttributes(nodes, nodes[3]);
			expect(nodes[3].attr).toEqual({
				foo: {
					bar: 'actual bar value',
					foo: underTest.INHERIT_MARKER,
					foobar: 'actual foobar value'
				}
			});
		});
		it('should inherit all attributes in intermediate nodes', () => {
			underTest.inheritAttributes(nodes, nodes[3]);
			expect(nodes[2].attr).toEqual({
				foo: {
					bar: 'actual bar value',
					foo: underTest.INHERIT_MARKER,
					foobar: 'actual foobar value'
				}
			});
		});

	});
});
