const Binary = require('../src/binary');

var assert = require('assert/strict');

describe('Binary', () => {
    describe('constructor', () => {
        it('fromBinaryString', () => {
            let b1 = Binary.fromBinaryString('1001', 4);
            assert.equal(b1.value, 0b1001);
            assert.equal(b1.bitWidth, 4);

            // 测试省略 bitWidth 参数
            let b2 = Binary.fromBinaryString('10');
            assert.equal(b2.value, 0b10)
            assert.equal(b2.bitWidth, 2)
        });

        it('fromHexString', () => {
            let b1 = Binary.fromHexString('FF', 8);
            assert.equal(b1.value, 0xff);
            assert.equal(b1.bitWidth, 8);

            // 测试省略 bitWidth 参数
            let b2 = Binary.fromHexString('DEEF');
            assert.equal(b2.value, 0xdeef);
            assert.equal(b2.bitWidth, 16);
        });

        it('fromDecimalString', () => {
            let b1 = Binary.fromDecimalString('123', 8);
            assert.equal(b1.value, 123);
            assert.equal(b1.bitWidth, 8);

            // 测试省略 bitWidth 参数
            let b2 = Binary.fromDecimalString('1024');
            assert.equal(b2.value, 1024);
            assert.equal(b2.bitWidth, 11);
        });

        it('directly', () => {
            let b1 = new Binary(0b1100_0011, 8);
            assert.equal(b1.value, 0xc3);
            assert.equal(b1.bitWidth, 8);
        });
    });

    describe('modify', ()=>{
        it('getBit, setBit', ()=> {
            let b1 = Binary.fromBinaryString('10010', 5);

            assert.equal(b1.getBit(0), 0);
            assert.equal(b1.getBit(1), 1);
            assert.equal(b1.getBit(2), 0);
            assert.equal(b1.getBit(3), 0);
            assert.equal(b1.getBit(4), 1);

            b1.setBit(0, 1);
            assert.equal(b1.getBit(0), 1);
            assert.equal(b1.value, 0b10011);

            b1.setBit(1, 0);
            assert.equal(b1.getBit(1), 0);
            assert.equal(b1.value, 0b10001);

            // 测试负数
            let b2 = new Binary(-2, 32);
            assert.equal(b2.getBit(31), 1);
            assert.equal(b2.getBit(0), 0);

            b2.setBit(31, 0);
            assert.equal(b2.getBit(31), 0);
            assert.equal(b2.value, 0x7ffffffe);
        });

        it('getBits, setBits', ()=> {
            let b1 = Binary.fromBinaryString('10101100', 8);

            let bp = b1.getBits(1, 5);
            assert.equal(bp.toBinaryString(), '10110');

            let b2 = Binary.fromBinaryString('10000000', 8);

            b2.setBits(bp, 1);
            assert.equal(b2.toBinaryString(), '10101100');
        });

    });

    describe('toString', ()=>{
        it('toBinaryString, toHexString, toDecimalString', ()=> {
            let b1 = Binary.fromBinaryString('1010', 4);
            assert.equal(b1.toBinaryString(), '1010');
            assert.equal(b1.toHexString(), 'a');
            assert.equal(b1.toDecimalString(), '10');

            // 测试负数
            let b2 = new Binary(-1, 32);
            assert.equal(b2.toBinaryString(), '11111111' + '11111111' + '11111111' + '11111111');
            assert.equal(b2.toHexString(), 'ffff' + 'ffff');
            assert.equal(b2.toDecimalString(), '-1');
        });
    });
});
