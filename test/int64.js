const assert = require('assert/strict');

const { Int64 } = require('../index');

describe('Test Int64', () => {
    it('Test comparison', () => {
        assert.equal(Int64.equal(1n,1n), 1n);
        assert.equal(Int64.equal(11n,10n), 0n);
        assert.equal(Int64.greaterThan(11n,10n), 1n);
        assert.equal(Int64.greaterThan(-1n,10n), 0n);
        assert.equal(Int64.greaterThanUnsigned(-1n,10n), 1n);
    });

    it('Test arithmetic', () => {
        // TODO::
    });

    it('Test logic', ()=>{
        // TODO::
    });
});