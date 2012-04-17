var assert = require('chai').assert;
var chai = require('chai');

var dataEquivalent = require('../dataEquivalent').dataEquivalent;

describe('dataEquivalent', function(){
	it('should find equivalent structures equal', function(done){
		var y = {a:1, b:[2,3,4], c:{d:5, e:{f:6}}};
		assert.equal(dataEquivalent({a:1, b:[2,3,4], c:{d:5, e:{f:6}}}, y), true);
		done();
	});
	it('should find objects with properties with different values not equal', function(done){
        assert.equal(dataEquivalent(
				{a:2, b:[2,3,4], c:{d:5, e:{f:6}}},
				{a:1, b:[2,3,4], c:{d:5, e:{f:6}}}),
			false);
        assert.equal(dataEquivalent(
				{a:1, b:[2,3,4], c:{d:5, e:{f:6}}},
				{a:2, b:[2,3,4], c:{d:5, e:{f:6}}}),
			false);
		done();
	});
	it('should find objects with missing properties not equal', function(done){
		assert.equal(dataEquivalent(
				{     b:[2,3,4], c:{d:5, e:{f:6}}},
				{a:1, b:[2,3,4], c:{d:5, e:{f:6}}}),
			false);
		assert.equal(dataEquivalent(
				{a:1, b:[2,3,4], c:{d:5, e:{f:6}}},
				{     b:[2,3,4], c:{d:5, e:{f:6}}}),
			false);
		done();
	});
	it('should find objects with missing nested array properties not equal', function(done){
		assert.equal(dataEquivalent(
				{a:1, b:[3,4  ], c:{d:5, e:{f:6}}},
				{a:1, b:[2,3,4], c:{d:5, e:{f:6}}}),
			false);
		assert.equal(dataEquivalent(
				{a:1, b:[2,3,4], c:{d:5, e:{f:6}}},
				{a:1, b:[3,4  ], c:{d:5, e:{f:6}}}),
			false);
		done();
	});
	it('should find objects with different nested values not equal', function(done){
		assert.equal(dataEquivalent(
				{a:1, b:[2,3,5], c:{d:5, e:{f:6}}},
				{a:1, b:[2,3,4], c:{d:5, e:{f:6}}}),
			false);
		assert.equal(dataEquivalent(
				{a:1, b:[2,3,4], c:{d:5, e:{f:6}}},
				{a:1, b:[2,3,5], c:{d:5, e:{f:6}}}),
			false);
		done();
	});
	it('should find objects with missing nested object properties not equal', function(done){
		assert.equal(dataEquivalent(
				{a:1, b:[2,3,4], c:{     e:{f:6}}},
				{a:1, b:[2,3,4], c:{d:5, e:{f:6}}}),
			false);
		assert.equal(dataEquivalent(
				{a:1, b:[2,3,4], c:{d:5, e:{f:6}}},
				{a:1, b:[2,3,4], c:{     e:{f:6}}}),
			false);
		done();
	});
	it('should find objects with nested object values of different types not equal', function(done){
		assert.equal(dataEquivalent(
				{a:1, b:[2,3,4], c:{d:'dsf', e:{f:6}}},
				{a:1, b:[2,3,4], c:{d:5,     e:{f:6}}}),
			false);
		assert.equal(dataEquivalent(
				{a:1, b:[2,3,4], c:{d:5,     e:{f:6}}},
				{a:1, b:[2,3,4], c:{d:'dsf', e:{f:6}}}),
			false);
		done();
	});
});

