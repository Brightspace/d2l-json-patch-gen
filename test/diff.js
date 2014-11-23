var diff = require('../lib/diff');
var chai = require('chai');
var expect = chai.expect;

describe('#diff()', function() {
    'use strict';

    it('should blow up when given something other than an object or array', function(){
        expect(function() {
            diff.diff({}, '');
        }).to.throw(TypeError);

        expect(function() {
            diff.diff('', {});
        }).to.throw(TypeError);

        expect(function() {
            diff.diff([], {});
        }).to.not.throw(TypeError);
    });

    it('should blow up when an object has a prototype', function(){
        var proto = { foo: 'bar' };

        var WithPrototype = function() {};
        WithPrototype.prototype = proto;

        var obj1 = new WithPrototype(),
            obj2 = { key: 'value' };

        expect(function() {
            diff.diff(obj1, obj2);
        }).to.throw(/has a prototype/);

        expect(function() {
            diff.diff(obj2, obj1);
        }).to.throw(/has a prototype/);
    });

    it('should blow up when an object contains a function', function(){
        var obj1 = {foo: 'bar'},
            obj2 = {f: function() {}};

        expect(function() {
            diff.diff(obj1, obj2);
        }).to.throw(/valid JSON value/);
    });

    it('should support comparing empty objects', function(){
        expect(diff.diff({}, {})).to.be.empty();
    });

    it('should support comparing equal objects', function(){
        var obj1 = {foo: {bar: 'baz'}},
            obj2 = {foo: {bar: 'baz'}};
        expect(diff.diff(obj1, obj2)).to.be.empty();
    });

    it('should support single top-level add', function(){
        var obj1 = {},
            obj2 = {foo: 'bar'};
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'add', path: '/foo', value: 'bar' });
    });

    it('should support multiple top-level adds', function(){
        var obj1 = {},
            obj2 = {foo: 'bar', baz: 5};
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'add', path: '/foo', value: 'bar' });
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'add', path: '/baz', value: 5 });
    });

    it('should support nested object adds', function(){
        var obj1 = {foo: 'bar', nested: {baz: {}}},
            obj2 = {foo: 'bar', nested: {baz: {key: 'value'}}};
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'add', path: '/nested/baz/key', value: 'value' });
    });

    it('should support single a top-level remove', function(){
        var obj1 = {foo: 'bar'},
            obj2 = {};
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'remove', path: '/foo' });
    });

    it('should support multiple top-level removes', function(){
        var obj1 = {foo: 'bar', baz: 5},
            obj2 = {};
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'remove', path: '/foo' });
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'remove', path: '/baz' });
    });

    it('should support nested object removes', function(){
        var obj1 = {nested: {inner: {something: 5}}},
            obj2 = {nested: {inner: {}}};
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'remove', path: '/nested/inner/something' });
    });

    it('should support a single top-level replace', function(){
        var obj1 = {foo: 'bar'},
            obj2 = {foo: 'baz'};
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'replace', path: '/foo', value: 'baz' });
    });

    it('should support multiple top-level replaces', function(){
        var obj1 = {foo: 'bar', baz: 5},
            obj2 = {foo: 'baz', baz: 8};
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'replace', path: '/foo', value: 'baz' });
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'replace', path: '/baz', value: 8 });
    });

    it('should support nested object replaces', function(){
        var obj1 = {nested: {inner: {something: 5}}},
            obj2 = {nested: {inner: {something: 8}}};
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'replace', path: '/nested/inner/something', value: 8 });
    });

    it('should support moves at the top-level', function(){
        var obj1 = {foo: 'bar'},
            obj2 = {baz: 'bar'};
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'move', from: '/foo', path: '/baz' });
    });

    it('should support multiple moves', function(){
        var obj1 = {foo: 'bar', bar: 5},
            obj2 = {baz: 'bar', quux: 5};
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'move', from: '/foo', path: '/baz' });
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'move', from: '/bar', path: '/quux' });
    });

    it('should support moves at the same level of nesting', function(){
        var obj1 = {foo: {bar: 'baz'}},
            obj2 = {foo: {baz: 'baz'}};
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'move', from: '/foo/bar', path: '/foo/baz' });
    });

    it('should use a separate add and remove for differing levels', function(){
        var obj1 = {foo: {bar: 'baz'}},
            obj2 = {quux: 'baz'};
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'remove', path: '/foo' });
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'add', path: '/quux', value: 'baz' });
    });

    // TODO: arrays

    // TODO: use quick check
});
