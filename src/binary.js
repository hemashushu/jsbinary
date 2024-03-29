const { IllegalArgumentException } = require('jsexception');

const Int32 = require('../wasm/int32');

const MAX_BIT_WIDTH = 32;

// 二进制数每位的数值，用来跟内部的 int32 数值作 and 运算以
// 获取二进制每一位的值（1 或者 0）
//
// bitNumberMask[n] = 2 ^ n，n 从 0 开始。
//
// 如
// bitNumberMask[5] = 0b10000
// bitNumberMask[8] = 0b100000000
const bitNumberMask = new Array(MAX_BIT_WIDTH);

for (let idx = 0; idx < MAX_BIT_WIDTH; idx++) {
    // Math.pow(2, idx) 跟 (2 ** idx) 结果相同
    bitNumberMask[idx] = (2 ** idx) | 0;
}

// 二进制数每个位宽的最大值
// 用于把超过指定位宽的二进制数的位置 0。
//
// bitWidthMask[len] = (2 ^ len) - 1，
//
// len 从 1 开始，如
// bitWidthMask[1] = 0b1 = 1,
// bitWidthMask[3] = 0b111 = 1 + 2 + 4,
const bitWidthMask = new Array(MAX_BIT_WIDTH + 1);

bitWidthMask[0] = 0;
for (let len = 1; len < MAX_BIT_WIDTH + 1; len++) {
    bitWidthMask[len] = ((2 ** len) - 1) | 0;
}

/**
 * 一个简单的二进制数据类型操作对象。
 *
 * - 最长支持 32 位二进制数。
 * - Binary 对象的值是不可变的，一元的操作会返回新的 Binary 对象。
 */
class Binary {

    /**
     * - 这个构造函数是一个私有的构造函数
     * - 提高可移植性，构造 Binary 对象时请勿直接使用此构造函数，而应该使用诸如
     *   fromBinaryString、fromInt32 等等静态方法。
     *
     * @param {*} int32Value 内部用于表示二进制数据的值，目前采用的是 JavaScript 内部
     *     的基本 int（Number） 类型。
     * @param {*} bitWidth 取值范围为 1-32，当 value 为负数时，length 必须为 32
     */
    constructor(int32Value, bitWidth) {
        // - 当前的实现使用 JavaScript 的基本 int（Number）储存内部数据的值，
        //   该数值将作为无符号数（uint32_t）来处里，当传入的数字
        //   为负数时，将会转换到无符号数的范围，不过由于 JavaScript 缺少
        //   无符号数据类型，所以当使用 toInt32() 方法读取 value 时，仍然会获得负数。
        //
        // - this._int32Value 是一个内部私有的数据，外部不要直接读取这个类成员的值。
        //
        // - 当需要使用字符串表达 Binary 对象的数值时，应使用 toBinaryString()、
        //   toHexString() 以及 toDecimalString() 方法。
        //   不用使用 toInt32() 方法获取数值再自己 toString()。
        this._int32Value = int32Value & bitWidthMask[bitWidth] | 0;

        // Binary 对象的位宽，范围从 1~32。
        this.bitWidth = bitWidth;
    }

    static fromInt32(value, bitWidth) {
        if (!(bitWidth >= 1 && bitWidth <= 32)) {
            throw new IllegalArgumentException('Bit width out of range.');
        }

        return new Binary(value, bitWidth);
    }

    static fromDoubleInt32(hi, low, bitWidth) {
        //
    }

    static fromBitInt64(value, bitWidth) {
        //
    }

    /**
     * 从二进制字符串构造 Binary 对象
     *
     * @param {*} str 二进制数字字符串，最长不超过 32 个字符，字符串中不能有
     *     除了 [01] 之外的字符，不能出现正负符号。
     *     示例：
     *     '1010', '11100000'
     * @param {*} bitWidth 1-32
     * @returns
     */
    static fromBinaryString(str, bitWidth) {
        if (bitWidth === undefined) {
            // 将字符串的长度作为位宽
            bitWidth = str.length;
        }

        if (str.length > 32) {
            throw new IllegalArgumentException('Binary value is too large.');
        }

        if (!(bitWidth >= 1 && bitWidth <= 32)) {
            throw new IllegalArgumentException('Bit width out of range.');
        }

        return Binary.fromInt32(parseInt(str, 2), bitWidth);
    }

    /**
     * 从十六进制字符串构造 Binary 对象
     *
     * @param {*} str 十六进制数字字符串，最长不超过 8 个字符，字符串中不能有
     *     除了 [0-9a-fA-F] 之外的字符，不能出现正负符号。
     *     示例：
     *     'FF00', 'DEADBEEF'
     * @param {*} bitWidth 1-32
     * @returns
     */
    static fromHexString(str, bitWidth) {
        if (bitWidth === undefined) {
            bitWidth = str.length * 4;
        }

        if (str.startsWith('-')) {
            throw new IllegalArgumentException('Cannot be a negative hexadecimal number.');
        }

        if (str.length > 8) {
            throw new IllegalArgumentException('Hex value is too large.');
        }

        if (!(bitWidth >= 1 && bitWidth <= 32)) {
            throw new IllegalArgumentException('Bit width out of range.');
        }

        return Binary.fromInt32(parseInt(str, 16), bitWidth);
    }

    /**
     * 从十进制字符串构造 Binary 对象
     *
     * @param {*} str 十进制字符串，最大值不超过 Int32.MAX，字符串仅可包含
     *     [0-9-] 字符。
     * @param {*} bitWidth 1-32
     * @returns
     */
    static fromDecimalString(str, bitWidth) {
        let value = parseInt(str, 10);
        if (bitWidth === undefined) {
            bitWidth = value.toString(2).length;
        }

        if (!(bitWidth >= 1 && bitWidth <= 32)) {
            throw new IllegalArgumentException('Bit width out of range.');
        }

        return Binary.fromInt32(value, bitWidth);
    }

    /**
     * 复制 Binary 对象。
     *
     * @param {*} binaryObject
     * @returns
     */
    static fromBinaryObject(binaryObject) {
        return new Binary(binaryObject._int32Value, binaryObject.bitWidth);
    }

    /**
     * 判断两个 Binary 对象是否相等（数值和位宽均相等）。
     *
     * @param {*} leftBinary
     * @param {*} rightBinary
     * @returns Boolean
     */
    static equal(leftBinary, rightBinary) {
        return leftBinary._int32Value === rightBinary._int32Value &&
            leftBinary.bitWidth === rightBinary.bitWidth;
    }

    /**
     *
     * @param {*} leftBinary
     * @param {*} rightBinary
     * @returns Boolean
     */
    static greaterThan32(leftBinary, rightBinary) {
        if (leftBinary.bitWidth !== 32 || rightBinary.bitWidth !== 32) {
            throw new IllegalArgumentException('Bit width does not match.');
        }
        return Int32.greaterThan(leftBinary._int32Value, rightBinary._int32Value) === 1;
    }

    static greaterThanUnsigned32(leftBinary, rightBinary) {
        if (leftBinary.bitWidth !== 32 || rightBinary.bitWidth !== 32) {
            throw new IllegalArgumentException('Bit width does not match.');
        }
        return Int32.greaterThanUnsigned(leftBinary._int32Value, rightBinary._int32Value) === 1;
    }

    static greaterThanOrEqual32(leftBinary, rightBinary) {
        if (leftBinary.bitWidth !== 32 || rightBinary.bitWidth !== 32) {
            throw new IllegalArgumentException('Bit width does not match.');
        }
        return Int32.greaterThanOrEqual(leftBinary._int32Value, rightBinary._int32Value) === 1;
    }

    static greaterThanOrEqualUnsigned32(leftBinary, rightBinary) {
        if (leftBinary.bitWidth !== 32 || rightBinary.bitWidth !== 32) {
            throw new IllegalArgumentException('Bit width does not match.');
        }
        return Int32.greaterThanOrEqualUnsigned(leftBinary._int32Value, rightBinary._int32Value) === 1;
    }

    static add32(leftBinary, rightBinary) {
        if (leftBinary.bitWidth !== 32 || rightBinary.bitWidth !== 32) {
            throw new IllegalArgumentException('Bit width does not match.');
        }
        return Binary.fromInt32(leftBinary._int32Value + rightBinary._int32Value, leftBinary.bitWidth);
    }

    static subtract32(leftBinary, rightBinary) {
        if (leftBinary.bitWidth !== 32 || rightBinary.bitWidth !== 32) {
            throw new IllegalArgumentException('Bit width does not match.');
        }
        return Binary.fromInt32(leftBinary._int32Value - rightBinary._int32Value, leftBinary.bitWidth);
    }

    static multiplyLow32(leftBinary, rightBinary) {
        if (leftBinary.bitWidth !== 32 || rightBinary.bitWidth !== 32) {
            throw new IllegalArgumentException('Bit width does not match.');
        }
        let value = Int32.multiplyLow(leftBinary._int32Value, rightBinary._int32Value);
        return Binary.fromInt32(value, leftBinary.bitWidth);
    }

    static multiplyHigh32(leftBinary, rightBinary) {
        if (leftBinary.bitWidth !== 32 || rightBinary.bitWidth !== 32) {
            throw new IllegalArgumentException('Bit width does not match.');
        }
        let value = Int32.multiplyHigh(leftBinary._int32Value, rightBinary._int32Value);
        return Binary.fromInt32(value, leftBinary.bitWidth);
    }

    static multiplyHighUnsigned32(leftBinary, rightBinary) {
        if (leftBinary.bitWidth !== 32 || rightBinary.bitWidth !== 32) {
            throw new IllegalArgumentException('Bit width does not match.');
        }
        let value = Int32.multiplyHighUnsigned(leftBinary._int32Value, rightBinary._int32Value);
        return Binary.fromInt32(value, leftBinary.bitWidth);
    }

    static divide32(leftBinary, rightBinary) {
        if (leftBinary.bitWidth !== 32 || rightBinary.bitWidth !== 32) {
            throw new IllegalArgumentException('Bit width does not match.');
        }
        let value = Int32.divide(leftBinary._int32Value, rightBinary._int32Value);
        return Binary.fromInt32(value, leftBinary.bitWidth);
    }

    static divideUnsigned32(leftBinary, rightBinary) {
        if (leftBinary.bitWidth !== 32 || rightBinary.bitWidth !== 32) {
            throw new IllegalArgumentException('Bit width does not match.');
        }
        let value = Int32.divideUnsigned(leftBinary._int32Value, rightBinary._int32Value);
        return Binary.fromInt32(value, leftBinary.bitWidth);
    }

    static remainder32(leftBinary, rightBinary) {
        if (leftBinary.bitWidth !== 32 || rightBinary.bitWidth !== 32) {
            throw new IllegalArgumentException('Bit width does not match.');
        }
        let value = Int32.remainder(leftBinary._int32Value, rightBinary._int32Value);
        return Binary.fromInt32(value, leftBinary.bitWidth);
    }

    static remainderUnsigned32(leftBinary, rightBinary) {
        if (leftBinary.bitWidth !== 32 || rightBinary.bitWidth !== 32) {
            throw new IllegalArgumentException('Bit width does not match.');
        }
        let value = Int32.remainderUnsigned(leftBinary._int32Value, rightBinary._int32Value);
        return Binary.fromInt32(value, leftBinary.bitWidth);
    }

    static and(leftBinary, rightBinary) {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators#bitwise_operators
        let value = (leftBinary._int32Value & rightBinary._int32Value) & bitWidthMask[leftBinary.bitWidth];
        return Binary.fromInt32(value, leftBinary.bitWidth);
    }

    static or(leftBinary, rightBinary) {
        let value = (leftBinary._int32Value | rightBinary._int32Value) & bitWidthMask[leftBinary.bitWidth];
        return Binary.fromInt32(value, leftBinary.bitWidth);
    }

    static nand(leftBinary, rightBinary) {
        // nand = not(and)
        let value = (~(leftBinary._int32Value & rightBinary._int32Value)) & bitWidthMask[leftBinary.bitWidth];
        return Binary.fromInt32(value, leftBinary.bitWidth);
    }

    static nor(leftBinary, rightBinary) {
        // nor = not(or)
        let value = (~(leftBinary._int32Value | rightBinary._int32Value)) & bitWidthMask[leftBinary.bitWidth];
        return Binary.fromInt32(value, leftBinary.bitWidth);
    }

    /**
     * 异或
     * @param {*} leftBinary
     * @param {*} rightBinary
     * @returns
     */
    static xor(leftBinary, rightBinary) {
        // In1	In2	Out
        // 0	0	0
        // 0	1	1
        // 1	0	1
        // 1	1	0
        let value = (leftBinary._int32Value ^ rightBinary._int32Value) & bitWidthMask[leftBinary.bitWidth];
        return Binary.fromInt32(value, leftBinary.bitWidth);
    }

    /**
     * 同或
     * @param {*} leftBinary
     * @param {*} rightBinary
     * @returns
     */
    static xnor(leftBinary, rightBinary) {
        // xnor = not(xor)
        //
        // In1	In2	Out
        // 0	0	1
        // 0	1	0
        // 1	0	0
        // 1	1	1
        let value = (~(leftBinary._int32Value ^ rightBinary._int32Value)) & bitWidthMask[leftBinary.bitWidth];
        return Binary.fromInt32(value, leftBinary.bitWidth);
    }

    static not(binary) {
        let value = (~binary._int32Value) & bitWidthMask[binary.bitWidth];
        return Binary.fromInt32(value, binary.bitWidth);
    }

    static leftShift(binary, bitWidth) {
        let value = (binary._int32Value << bitWidth) & bitWidthMask[binary.bitWidth];
        return Binary.fromInt32(value, binary.bitWidth);
    }

    /**
     * 逻辑右移。
     * 最高位将会使用 0 来填充。
     *
     * @param {*} binary
     * @param {*} bitWidth 0-32
     * @returns
     */
    static logicRightShift(binary, bitWidth) {
        // 001100...00 >> 2 = 000011...00
        // 110000...00 >> 2 = 001100...00
        let value = (bitWidthMask[bitWidth] & binary._int32Value) >>> bitWidth
        return Binary.fromInt32(value, binary.bitWidth);
    }

    /**
     * 算术右移。
     * 当数值的最高位为 1 时（即表示负数时），最高位会使用 1 来填充。
     * 当最高位为 0 时，最高位会使用 0 来填充，效果如同逻辑右移。
     *
     * @param {*} binary
     * @param {*} bitWidth 0-32
     * @returns
     */
    static rightShift32(binary, bitWidth) {
        // 调用者必须确保操作数的位宽为 32 位

        // 001100...00 >> 2 = 000011...00
        // 110000...00 >> 2 = 111100...00
        let value = binary._int32Value >> bitWidth;
        return Binary.fromInt32(value, binary.bitWidth);
    }

    /**
     * 按位读取数值
     *
     * @param {*} offset 位置索引值
     *     - offset 是从最低位开始数的，比如 0b11110000，
     *       最右边（最低位）的 0 的 offset 为 0，最左边（最高位）的 offset 为 7。
     *     - offset 不能超过原有的位宽。
     * @returns 0 或者 1
     */
    getBit(offset) {
        if (offset >= this.bitWidth) {
            throw new IllegalArgumentException('Offset out of range.');
        }

        return (this._int32Value & bitNumberMask[offset]) === bitNumberMask[offset] ? 1 : 0;
    }

    /**
     * 按位更新数值并返回新的 Binary 对象
     *
     * @param {*} offset 位置索引值
     *     - offset 是从最低位开始数的，比如 0b11110000，
     *       最右边（最低位）的 0 的 offset 为 0，最左边（最高位）的 offset 为 7。
     *     - offset 不能超过原有的位宽。
     * @param {*} bitValue 0 或者 1
     * @returns 新的 Binary 对象。
     */
    setBit(offset, bitValue) {
        if (offset >= this.bitWidth) {
            throw new IllegalArgumentException('Offset out of range.');
        }

        let originalInt32Value = this._int32Value;
        let resultInt32Value;
        if (bitValue === 0) {
            resultInt32Value = originalInt32Value & (~bitNumberMask[offset]);
        } else {
            resultInt32Value = originalInt32Value | bitNumberMask[offset];
        }
        return Binary.fromInt32(resultInt32Value, this.bitWidth);
    }

    /**
     * 读取（连续的）多位的数值并返回新的 Binary 对象。
     *
     * @param {*} offset 当前数值的偏移值
     *     - offset + bitWidth 必须小于等于 this.bitWidth.
     *     - offset 是从最低位开始数的，比如 0b11110000，
     *       最右边（最低位）的 0 的 offset 为 0，最左边（最高位）的 offset 为 7。
     * @param {*} bitWidth 需读取的位宽（位）
     * @returns 新的 Binary 对象。
     */
    slice(offset, bitWidth) {
        // 示例，如果对如下二进制数调用 slice(1, 5)
        // 10101100
        // --^---^-
        //   |   |
        // 结束  开始
        //
        // 将得到 10110

        if (offset + bitWidth > this.bitWidth) {
            throw new IllegalArgumentException('Offset out of range.');
        }

        let currentInt32Value = this._int32Value;
        let resultInt32Value = Int32.logicRightShift(currentInt32Value, offset);

        // 高位会被 fromInt32 方法清空，这里不需要对高位进行处理。
        return Binary.fromInt32(resultInt32Value, bitWidth);
    }

    /**
     * 更新（连续的）多位的数值并返回新的 Binary 对象。
     *
     * @param {*} offset 目标数值（即当前 Binary 对象数值的）偏移值
     *     - offset + binaryObject.bitWidth 必须小于等于 this.bitWidth.
     *     - offset 是从最低位开始数的，比如 0b11110000，最右边（最低位）的 0 的
     *     - offset 为 0，最左边（最高位）的 offset 为 7。
     * @param {*} sourceBinaryObject
     */
    splice(offset, sourceBinaryObject) {
        // 示例，如果对如下二进制数调用 splice(1, '10110')
        // 10000000
        // --^---^-
        //   |   |
        // 结束  开始
        //   10110
        //   |   |
        //   v   v
        // 10101100

        if (offset + sourceBinaryObject.bitWidth > this.bitWidth) {
            throw new IllegalArgumentException('Offset out of range.');
        }

        let allOneInt32Value = -1; // 所有位都是 1 的数，e.g. 11111111

        // 左移 (offset + sourceBinaryObject.bitWidth) 位， e.g. 11000000 (offset + bitWidth = 2 + 4 = 6)
        let leftShiftedAllOneInt32Value = Int32.leftShift(allOneInt32Value, offset + sourceBinaryObject.bitWidth);

        // 补上末尾 offset 个 1, 形成一个有空槽的数，即空槽位置为 0，其他位为 1。
        // 用于将源值相应的位置 0，e.g. 11000011 (tail ones: 11)
        let maskInt32Value = Int32.or(leftShiftedAllOneInt32Value, bitWidthMask[offset]);

        let currentInt32Value = this._int32Value;
        let cuttedCurrentInt32Value = Int32.and(maskInt32Value, currentInt32Value); // current 值相应位已经被置零

        let sourceInt32Value = sourceBinaryObject.toInt32(); // 源数 e.g. 1111  (bitWidth = 4)
        let leftShiftedSourceInt32Value = Int32.leftShift(sourceInt32Value, offset); // 左移 offset 位，e.g. 111100 (offset = 2)

        let resultInt32Value = Int32.or(leftShiftedSourceInt32Value, cuttedCurrentInt32Value); // or 合并
        return Binary.fromInt32(resultInt32Value, this.bitWidth);
    }

    equal(other) {
        return Binary.equal(this, other);
    }

    /**
     * 转换为 2 进制字符串
     * @returns
     */
    toBinaryString() {
        let value = this._int32Value & bitWidthMask[this.bitWidth];
        let charLength = this.bitWidth;

        if (value >= 0) {
            return value.toString(2).padStart(charLength, '0');

        } else {
            let buffer = [];

            for (let idx = 0; idx < this.bitWidth; idx++) {
                if (value & 1 === 1) {
                    buffer.push('1');
                } else {
                    buffer.push('0');
                }
            }

            return buffer.reverse().join('');
        }
    }


    /**
     * 转换为 16 进制字符串
     * @returns
     */
    toHexString() {
        let value = this._int32Value & bitWidthMask[this.bitWidth];
        let charLength = Math.ceil(this.bitWidth / 4);

        if (value >= 0) {
            return value.toString(16).padStart(charLength, '0');

        } else {
            let mask4bits = 0b1111;
            let buffer = [];

            //             let remainBits = this.bitWidth;
            //             while (remainBits >= 4) {
            //                 let right4bits = value & mask4bits;
            //                 buffer.push(right4bits.toString(16));
            //
            //                 value = value >> 4;
            //                 remainBits -= 4;
            //             }
            //             if (remainBits > 0) {
            //                 let right4bits = value & mask4bits;
            //                 buffer.push(right4bits.toString(16));
            //             }

            for (let idx = 0; idx < charLength; idx++) {
                let right4bits = value & mask4bits;
                buffer.push(right4bits.toString(16));
                value = value >> 4;
            }

            return buffer.reverse().join('');
        }
    }

    /**
     * 转换为 10 进制字符串
     * @returns
     */
    toDecimalString() {
        let value = this._int32Value & bitWidthMask[this.bitWidth];
        return value.toString(10);
    }

    toInt32() {
        let value = this._int32Value & bitWidthMask[this.bitWidth];
        return value;
    }

}

module.exports = Binary;

