const assert = require('assert/strict');

const { Int32 } = require('../index');

describe('Test Int32', () => {
    it('Test comparison', () => {
        assert.equal(Int32.equal(1,1), 1);
        assert.equal(Int32.equal(11,10), 0);
        assert.equal(Int32.greaterThan(11,10), 1);
        assert.equal(Int32.greaterThan(-1,10), 0);
        assert.equal(Int32.greaterThanUnsigned(-1,10), 1);
    });

    it('Test arithmetic', () => {
        // TODO::
    });

    it('Test logic', ()=>{
        // TODO::
    });
});