const { IllegalArgumentException } = require('jsexception');

const assert = require('assert/strict');

const { Binary } = require('../index');

describe('Test Binary', () => {
    describe('Test create instance', () => {
        it('fromDecimalString', () => {
            let b1 = Binary.fromDecimalString('123', 8);
            assert.equal(b1.toInt32(), 123);
            assert.equal(b1.bitWidth, 8);

            // 测试省略 bitWidth 参数的构造方法
            let b2 = Binary.fromDecimalString('1024');
            assert.equal(b2.toInt32(), 1024);
            assert.equal(b2.bitWidth, 11);
        });

        it('fromBinaryString', () => {
            let b1 = Binary.fromBinaryString('1001', 4);
            assert.equal(b1.toInt32(), 0b1001);
            assert.equal(b1.bitWidth, 4);

            // 测试省略 bitWidth 参数的构造方法
            let b2 = Binary.fromBinaryString('10');
            assert.equal(b2.toInt32(), 0b10)
            assert.equal(b2.bitWidth, 2)
        });

        it('fromHexString', () => {
            let b1 = Binary.fromHexString('FF', 8);
            assert.equal(b1.toInt32(), 0xff);
            assert.equal(b1.bitWidth, 8);

            // 测试省略 bitWidth 参数的构造方法
            let b2 = Binary.fromHexString('DEEF');
            assert.equal(b2.toInt32(), 0xdeef);
            assert.equal(b2.bitWidth, 16);
        });

        it('fromInt32', () => {
            let b1 = Binary.fromInt32(0b1100_0011, 8);
            assert.equal(b1.toInt32(), 0xc3);
            assert.equal(b1.bitWidth, 8);
        });

        it('fromBinaryObject', () => {
            let b1 = Binary.fromInt32(0b1100_0011, 8);
            let b2 = Binary.fromBinaryObject(b1);
            assert.equal(b2.toInt32(), b1.toInt32());
            assert.equal(b2.bitWidth, b1.bitWidth);
        });

        it('Test bit width out of range', () => {
            try {
                Binary.fromBinaryString('0', 0);
                assert.fail();
            } catch (err) {
                assert(err instanceof IllegalArgumentException);
            }

            try {
                Binary.fromBinaryString('0', 128);
                assert.fail();
            } catch (err) {
                assert(err instanceof IllegalArgumentException);
            }

            try {
                Binary.fromHexString('aabbccdd00', 0);
                assert.fail();
            } catch (err) {
                assert(err instanceof IllegalArgumentException);
            }
        });
    });

    it('Test equal()', () => {
        let b1 = Binary.fromInt32(12, 8);
        let b2 = Binary.fromInt32(12, 8);
        let b3 = Binary.fromInt32(10, 8);
        let b4 = Binary.fromInt32(12, 16);

        assert(Binary.equal(b1, b2));
        assert(!Binary.equal(b1, b3));
        assert(!Binary.equal(b1, b4));
    });

    it('Test toInt32()', () => {
        let b1 = Binary.fromHexString('ff', 16);
        let b2 = Binary.fromInt32(128, 16);

        assert.equal(b1.toInt32(), 255);
        assert.equal(b2.toInt32(), 128);
    });

    it('Test greaterThan32(), greaterThanOrEqual32()', () => {
        let b1 = Binary.fromInt32(12, 32);
        let b2 = Binary.fromInt32(8, 32);
        let b3 = Binary.fromInt32(12, 32);
        let b4 = Binary.fromInt32(-8, 32);
        let b5 = Binary.fromInt32(-12, 32);

        assert(Binary.greaterThan32(b1, b2));
        assert(!Binary.greaterThan32(b2, b3))
        assert(!Binary.greaterThan32(b1, b3));
        assert(Binary.greaterThan32(b1, b4));
        assert(Binary.greaterThan32(b4, b5));

        assert(Binary.greaterThanOrEqual32(b1, b2));
        assert(!Binary.greaterThanOrEqual32(b2, b3));
        assert(Binary.greaterThanOrEqual32(b1, b3));
        assert(Binary.greaterThanOrEqual32(b1, b4));
        assert(Binary.greaterThanOrEqual32(b4, b5));
    });

    it('Test greaterThanUnsigned32(), greaterThanOrEqualUnsign32()', () => {
        let b1 = Binary.fromInt32(12, 32);
        let b2 = Binary.fromInt32(8, 32);
        let b3 = Binary.fromInt32(12, 32);
        let b4 = Binary.fromInt32(-8, 32);
        let b5 = Binary.fromInt32(-12, 32);

        assert(Binary.greaterThanUnsigned32(b1, b2));
        assert(!Binary.greaterThanUnsigned32(b2, b3))
        assert(!Binary.greaterThanUnsigned32(b1, b3));
        assert(Binary.greaterThanUnsigned32(b4, b1));
        assert(Binary.greaterThanUnsigned32(b4, b5));

        assert(Binary.greaterThanOrEqualUnsigned32(b1, b2));
        assert(!Binary.greaterThanOrEqualUnsigned32(b2, b3));
        assert(Binary.greaterThanOrEqualUnsigned32(b1, b3));
        assert(Binary.greaterThanOrEqualUnsigned32(b4, b1));
        assert(Binary.greaterThanOrEqualUnsigned32(b4, b5));
    });

    it('Test getBit(), setBit()', () => {
        let b1 = Binary.fromBinaryString('10010', 5);

        assert.equal(b1.getBit(0), 0);
        assert.equal(b1.getBit(1), 1);
        assert.equal(b1.getBit(2), 0);
        assert.equal(b1.getBit(3), 0);
        assert.equal(b1.getBit(4), 1);

        let b1m1 = b1.setBit(0, 1);
        assert.equal(b1m1.getBit(0), 1);
        assert.equal(b1m1.toInt32(), 0b10011);

        let b1m2 = b1.setBit(1, 0);
        assert.equal(b1m2.getBit(1), 0);
        assert.equal(b1m2.toInt32(), 0b10000);

        // 测试负数
        let b2 = Binary.fromInt32(-2, 32);
        assert.equal(b2.getBit(31), 1);
        assert.equal(b2.getBit(0), 0);

        let b2m1 = b2.setBit(31, 0);
        assert.equal(b2m1.getBit(31), 0);
        assert.equal(b2m1.toInt32(), 0x7ffffffe);
    });

    it('Test slice(), splice()', () => {
        let b1 = Binary.fromBinaryString('10101100', 8);
        let bPartial1 = b1.slice(1, 5);
        assert.equal(bPartial1.toBinaryString(), '10110');

        let b2 = Binary.fromBinaryString('10001111', 8);
        let b3 = b2.splice(1, bPartial1);
        assert.equal(b3.toBinaryString(), '10101101');
    });

    it('Test toBinaryString(), toHexString(), toDecimalString()', () => {
        let b1 = Binary.fromBinaryString('1010', 4);
        assert.equal(b1.toBinaryString(), '1010');
        assert.equal(b1.toHexString(), 'a');
        assert.equal(b1.toDecimalString(), '10');

        let b2 = Binary.fromBinaryString('101010', 8);
        assert.equal(b2.toBinaryString(), '00101010');
        assert.equal(b2.toHexString(), '2a');
        assert.equal(b2.toDecimalString(), '42');

        let b3 = Binary.fromBinaryString('100101010', 14);
        assert.equal(b3.toBinaryString(), '00000100101010');
        assert.equal(b3.toHexString(), '012a');
        assert.equal(b3.toDecimalString(), '298');

        // 测试负数
        let b4 = Binary.fromInt32(-1, 32);
        assert.equal(b4.toBinaryString(), '11111111' + '11111111' + '11111111' + '11111111');
        assert.equal(b4.toHexString(), 'ffff' + 'ffff');
        assert.equal(b4.toDecimalString(), '-1');
    });

    it('Test and()', () => {
        let b1 = Binary.fromBinaryString('1000');
        let b2 = Binary.fromBinaryString('1011');
        let b3 = Binary.fromBinaryString('0110');

        let r1 = Binary.and(b1, b2);
        assert(Binary.equal(r1, Binary.fromBinaryString('1000')));

        let r2 = Binary.and(b2, b3);
        assert(Binary.equal(r2, Binary.fromBinaryString('0010')));
    });

    it('Test or()', () => {
        // TODO::
    });

    it('Test nand()', () => {
        // TODO::
    });

    it('Test nor()', () => {
        // TODO::
    });

    it('Test xor()', () => {
        // TODO::
    });

    it('Test xnor()', () => {
        // TODO::
    });

    it('Test not()', () => {
        // TODO::
    });

    it('Test add32()', () => {
        let b1 = Binary.fromHexString('00112233');
        let b2 = Binary.fromHexString('11223344');

        let r1 = Binary.add32(b1, b2);

        let e3 = Binary.fromHexString('11335577');
        assert(Binary.equal(r1, e3));

        // 测试加法溢出
        let b3 = Binary.fromHexString('ffff0000');
        let r2 = Binary.add32(b1, b3);

        // r2 = 0b"1,00102233"
        assert.equal(r2.toHexString(), '00102233');
    });

    it('Test subtract32()', () => {
        let b1 = Binary.fromHexString('11223344');
        let b2 = Binary.fromHexString('00112233');

        let r1 = Binary.subtract32(b1, b2);

        let e3 = Binary.fromHexString('11111111');
        assert(Binary.equal(r1, e3));

        // 测试减法溢出
        let b3 = Binary.fromHexString('ff223344');
        let r2 = Binary.subtract32(b1, b3);

        assert.equal(r2.toHexString(), '12000000');

        // 0xff223344 相当于 -0xDDCCBC
        // 所以 b1 - b3 = b1 -(-0xDDCCBC) = b1 + 0xDDCCBC
        let b4 = Binary.fromHexString('ddccbc', 32);
        let r3 = Binary.add32(b1, b4);
        assert.equal(r3.toHexString(), '12000000');

        assert(Binary.equal(r2, r3));
    });

    // TODO::

    it('Test multiplyLow32()', () => { });
    it('Test multiplyHigh32()', () => { });
    it('Test multiplyHighUnsigned3()', () => { });
    it('Test divide32()', () => { });
    it('Test divideUnsigned32()', () => { });
    it('Test remainder32()', () => { });
    it('Test remainderUnsigned32()', () => { });

    it('Test leftShift()', () => { });
    it('Test logicRightShift()', () => { });

    // TODO::
    it('Test rightShift32()', () => { });
});
