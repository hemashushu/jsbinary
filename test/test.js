const assert = require('assert/strict');

const { Binary } = require('../index');

// TODO:: 以下方法尚未测试：
//
// multiplyLow32, multiplyHigh32, multiplyHighUnsigned32,
// divide32, divideUnsigned32, remainder32, remainderUnsigned32

describe('Binary', () => {
    describe('Test constructor', () => {
        it('fromBinaryString', () => {
            let b1 = Binary.fromBinaryString('1001', 4);
            assert.equal(b1.value, 0b1001);
            assert.equal(b1.bitWidth, 4);

            // 测试省略 bitWidth 参数的构造方法
            let b2 = Binary.fromBinaryString('10');
            assert.equal(b2.value, 0b10)
            assert.equal(b2.bitWidth, 2)
        });

        it('fromHexString', () => {
            let b1 = Binary.fromHexString('FF', 8);
            assert.equal(b1.value, 0xff);
            assert.equal(b1.bitWidth, 8);

            // 测试省略 bitWidth 参数的构造方法
            let b2 = Binary.fromHexString('DEEF');
            assert.equal(b2.value, 0xdeef);
            assert.equal(b2.bitWidth, 16);
        });

        it('fromDecimalString', () => {
            let b1 = Binary.fromDecimalString('123', 8);
            assert.equal(b1.value, 123);
            assert.equal(b1.bitWidth, 8);

            // 测试省略 bitWidth 参数的构造方法
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

    it('Test getBit(), setBit()', () => {
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

    it('Test getBits(), setBits()', () => {
        let b1 = Binary.fromBinaryString('10101100', 8);

        let bp = b1.getBits(1, 5);
        assert.equal(bp.toBinaryString(), '10110');

        let b2 = Binary.fromBinaryString('10000000', 8);

        b2.setBits(bp, 1);
        assert.equal(b2.toBinaryString(), '10101100');
    });

    describe('Test toString', () => {
        it('toBinaryString, toHexString, toDecimalString', () => {
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

    it('Test equals()', () => {
        let b1 = new Binary(12, 8);
        let b2 = new Binary(12, 8);
        let b3 = new Binary(10, 8);
        let b4 = new Binary(12, 16);

        assert(Binary.equals(b1, b2));
        assert(!Binary.equals(b1, b3));
        assert(!Binary.equals(b1, b4));
    });

    it('Test clone()', () => {
        let b1 = new Binary(12, 8);
        let b2 = Binary.clone(b1);

        assert(Binary.equals(b1, b2));
    });

    it('Test update()', () => {
        let b1 = new Binary(12, 8);
        let b2 = new Binary(16, 8);

        b1.update(b2);
        assert.equal(16, b1.value);
        assert.equal(8, b1.bitWidth);

        assert(Binary.equals(b1, b2));
    });

    it('Test updateByValue()', () => {
        let b1 = new Binary(12, 8);

        b1.updateByValue(16);
        assert.equal(16, b1.value);
        assert.equal(8, b1.bitWidth);
    });

    it('Test add32()', () => {
        let b1 = Binary.fromHexString('00112233');
        let b2 = Binary.fromHexString('11223344');

        let r1 = Binary.add32(b1, b2);

        let e3 = Binary.fromHexString('11335577');
        assert(Binary.equals(r1, e3));

        // 测试加法溢出
        let b3 = Binary.fromHexString('ffff0000');
        let r2 = Binary.add32(b1, b3);

        // r2 = 0b"1,00102233"
        assert.equal(r2.toHexString(), '102233');
    });

    it('Test subtract32()', () => {
        let b1 = Binary.fromHexString('11223344');
        let b2 = Binary.fromHexString('00112233');

        let r1 = Binary.subtract32(b1, b2);

        let e3 = Binary.fromHexString('11111111');
        assert(Binary.equals(r1, e3));

        // 测试减法溢出
        let b3 = Binary.fromHexString('ff223344');
        let r2 = Binary.subtract32(b1, b3);

        assert.equal(r2.toHexString(), '12000000');

        // 0xff223344 相当于 -0xDDCCBC
        // 所以 b1 - b3 = b1 -(-0xDDCCBC) = b1 + 0xDDCCBC
        let b4 = Binary.fromHexString('ddccbc', 32);
        let r3 = Binary.add32(b1, b4);
        assert.equal(r3.toHexString(), '12000000');

        assert(Binary.equals(r2, r3));
    });

    it('Test and()', () => {
        let b1 = Binary.fromBinaryString('1000');
        let b2 = Binary.fromBinaryString('1011');

        let r1 = Binary.and(b1, b2);
        assert(Binary.equals(r1, Binary.fromBinaryString('1000')));

        let b3 = Binary.fromBinaryString('0110');
        let r2 = Binary.and(b2, b3);
        assert(Binary.equals(r2, Binary.fromBinaryString('0010')));
    });

    // TODO::

    it('Test or()', () => { });
    it('Test nand()', () => { });
    it('Test nor()', () => { });
    it('Test xor()', () => { });
    it('Test xnor()', () => { });
    it('Test not()', () => { });
    it('Test leftShift()', () => { });
    it('Test rightShift32()', () => { });
    it('Test logicRightShift()', () => { });
});
