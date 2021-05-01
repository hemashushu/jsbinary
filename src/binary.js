const Int32Math = require('../wasm/int32math');

const MAX_BIT_WIDTH = 32;

// 二进制数每位的数值，bitMark[n] = 2 ^ n，n 从 0 开始。
// 如 bitMark[5] = 0b10000，bitMark[8] = 0b100000000
const bitMask = new Array(MAX_BIT_WIDTH);

for (let idx = 0; idx < MAX_BIT_WIDTH; idx++) {
    // Math.pow(2, idx) 跟 (2 ** idx) 结果相同
    bitMask[idx] = (2 ** idx) | 0;
}

// 二进制数每个位宽的最大值，bitWidthValue[len] = (2 ^ len) - 1，len 从 1 开始
// 如 bitWidthValue[1] = 0b1 = 1, bitWidthValue[3] = 0b111 = 1 + 2 + 4,
const bitWidthValue = new Array(MAX_BIT_WIDTH + 1);

for(let len=1;len<MAX_BIT_WIDTH+1; len++) {
    bitWidthValue[len] = ((2 ** len) - 1) | 0;
}

/**
 * 一个简单的二进制数据类型操作对象。最长支持 32 位二进制数。
 *
 * 注：
 * 为提高效率，本类的大部分方法都没有对参数
 * 有效性进行检测，调用者必须自己保证参数的有效性。
 *
 */
class Binary {

    /**
     * 构造 Binary 对象
     *
     * 这里未对 value, bitWidth 作有效性检测，调用者必须自己保证参数的有效性。
     *
     * @param {*} value Int32 数值
     * @param {*} bitWidth 取值范围为 1-32，当 value 为负数时，length 必须为 32
     */
    constructor(value, bitWidth) {

        // Binary 对象对应的整型数值，其值为 Int32。
        //
        // value 将作为无符号数（uint32_t）来处里，当传入的数字
        // 为负数时，将会转换到无符号数的范围，不过由于 JavaScript 缺少
        // 无符号数据类型，所以直接读取 value 时，仍然会获得负数。
        // 当需要使用字符串表达 Binary 对象的数值时，尽量使用 toBinaryString()、toHexString() 以及
        // toDecimalString() 方法，直接使用 value.toString() 未必能正确表达数值（因为有符号）。
        this.value = value | 0;

        // Binary 对象的位宽，范围从 1~32。
        this.bitWidth = bitWidth;
    }

    /**
     * 从二进制字符串构造 Binary 对象
     *
     * @param {*} str 二进制数字字符串，最长不超过 32 个字符，字符串中不能有
     *     除了 [01] 之外的字符，不能出现正负符号。
     *     正确的示例：
     *     '1010', '11100000'
     * @param {*} bitWidth 1-32
     * @returns
     */
    static fromBinaryString(str, bitWidth) {
        if (bitWidth === undefined) {
            // 将字符串的长度作为位宽
            bitWidth = str.length;
        }

        if (str.length > 32 || bitWidth > 32) {
            throw new RangeError('Bit width out of range.');
        }

        return new Binary(parseInt(str, 2), bitWidth);
    }

    /**
     * 从十六进制字符串构造 Binary 对象
     *
     * @param {*} str 十六进制数字字符串，最长不超过 8 个字符，字符串中不能有
     *     除了 [0-9a-fA-F] 之外的字符，不能出现正负符号。
     *     正确示例：
     *     'FF00', 'DEADBEEF'
     * @param {*} bitWidth 1-32
     * @returns
     */
    static fromHexString(str, bitWidth) {
        if (bitWidth === undefined) {
            bitWidth = str.length * 4;
        }

        if (str.startsWith('-') || str.length > 8 || bitWidth > 32) {
            throw new RangeError('Bit width out of range.');
        }

        return new Binary(parseInt(str, 16), bitWidth);
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

        if (bitWidth > 32) {
            throw new RangeError('Bit width out of range.');
        }

        return new Binary(value, bitWidth);
    }

    /**
     * 复制 Binary 对象。
     *
     * @param {*} binary
     * @returns
     */
    static clone(binary) {
        return new Binary(binary.value, binary.bitWidth);
    }

    /**
     * 判断两个 Binary 对象是否相等（数值和位宽均相等）。
     *
     * @param {*} left
     * @param {*} right
     * @returns
     */
    static equals(left, right) {
        return left.value === right.value &&
            left.bitWidth === right.bitWidth;
    }

    static add32(left, right) {
        // 调用者必须确保两个操作数的位宽均为 32 位。
        return new Binary(left.value + right.value, left.bitWidth);
    }

    static subtract32(left, right) {
        // 调用者必须确保两个操作数的位宽均为 32 位。
        return new Binary(left.value - right.value, left.bitWidth);
    }

    static multiplyLow32(left, right) {
        // 调用者必须确保两个操作数的位宽均为 32 位。
        let value = Int32Math.multiplyLow(left.value, right.value);
        return new Binary(value, left.bitWidth);
    }

    static multiplyHigh32(left, right) {
        // 调用者必须确保两个操作数的位宽均为 32 位。
        let value = Int32Math.multiplyHigh(left.value, right.value);
        return new Binary(value, left.bitWidth);
    }

    static multiplyHighUnsigned32(left, right) {
        // 调用者必须确保两个操作数的位宽均为 32 位。
        let value = Int32Math.multiplyHighUnsigned(left.value, right.value);
        return new Binary(value, left.bitWidth);
    }

    static divide32(left, right) {
        // 调用者必须确保两个操作数的位宽均为 32 位。
        let value = Int32Math.divide(left.value, right.value);
        return new Binary(value, left.bitWidth);
    }

    static divideUnsigned32(left, right) {
        // 调用者必须确保两个操作数的位宽均为 32 位。
        let value = Int32Math.divideUnsigned(left.value, right.value);
        return new Binary(value, left.bitWidth);
    }

    static remainder32(left, right) {
        // 调用者必须确保两个操作数的位宽均为 32 位。
        let value = Int32Math.remainder(left.value, right.value);
        return new Binary(value, left.bitWidth);
    }

    static remainderUnsigned32(left, right) {
        // 调用者必须确保两个操作数的位宽均为 32 位。
        let value = Int32Math.remainderUnsigned(left.value, right.value);
        return new Binary(value, left.bitWidth);
    }

    static and(left, right) {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators#bitwise_operators
        let value = (left.value & right.value) & bitWidthValue[left.bitWidth];
        return new Binary(value, left.bitWidth);
    }

    static or(left, right) {
        let value = (left.value | right.value) & bitWidthValue[left.bitWidth];
        return new Binary(value, left.bitWidth);
    }

    static nand(left, right) {
        // nand = not(and)
        let value = (~(left.value & right.value)) & bitWidthValue[left.bitWidth];
        return new Binary(value, left.bitWidth);
    }

    static nor(left, right) {
        // nor = not(or)
        let value = (~(left.value | right.value)) & bitWidthValue[left.bitWidth];
        return new Binary(value, left.bitWidth);
    }

    /**
     * 异或
     * @param {*} left
     * @param {*} right
     * @returns
     */
    static xor(left, right) {
        // In1	In2	Out
        // 0	0	0
        // 0	1	1
        // 1	0	1
        // 1	1	0
        let value = (left.value ^ right.value) & bitWidthValue[left.bitWidth];
        return new Binary(value, left.bitWidth);
    }

    /**
     * 同或
     * @param {*} left
     * @param {*} right
     * @returns
     */
    static xnor(left, right) {
        // xnor = not(xor)
        //
        // In1	In2	Out
        // 0	0	1
        // 0	1	0
        // 1	0	0
        // 1	1	1
        let value = (~(left.value ^ right.value)) & bitWidthValue[left.bitWidth];
        return new Binary(value, left.bitWidth);
    }

    static not(binary) {
        let value = (~binary.value) & bitWidthValue[binary.bitWidth];
        return new Binary(value, binary.bitWidth);
    }

    static leftShift(binary, bitWidth) {
        let value = (binary.value << bitWidth) & bitWidthValue[binary.bitWidth];
        return new Binary(value, binary.bitWidth);
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
        let value = binary.value >> bitWidth;
        return new Binary(value, binary.bitWidth);
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
        let value = (bitWidthValue[bitWidth] & binary.value) >>> bitWidth
        return new Binary(value, binary.bitWidth);
    }

    /**
     * 按位更新数值
     *
     * @param {*} offset 0-31，offset 是从最低位开始数的，比如 0b11110000，
     *     最右边（最低位）的 0 的 offset 为 0，最左边（最高位）的 offset 为 7。
     * @param {*} value 0 或者 1
     */
    setBit(offset, value) {
        if (value === 0) {
            this.value = this.value & (~bitMask[offset]);
        } else {
            this.value = this.value | bitMask[offset];
        }
    }

    /**
     * 更新（连续的）多位的数值
     *
     * @param {*} binary
     * @param {*} offset 目标数值（即当前 Binary 对象数值的）偏移值，注意
     *     offset + binary.bitWidth 必须小于等于 this.bitWidth.
     *     offset 是从最低位开始数的，比如 0b11110000，最右边（最低位）的 0 的
     *     offset 为 0，最左边（最高位）的 offset 为 7。
     */
    setBits(binary, offset) {
        // 示例，如果对如下二进制数调用 setBits('10110', 1)
        // 10000000
        // --^---^-
        //   |   |
        // 结束  开始
        //   10110
        //   |   |
        //   v   v
        // 10101100

        for (let idx = 0; idx < binary.bitWidth; idx++) {
            this.setBit(idx + offset, binary.getBit(idx));
        }
    }

    /**
     * 按位读取数值
     *
     * @param {*} offset 0-31，offset 是从最低位开始数的，比如 0b11110000，
     *     最右边（最低位）的 0 的 offset 为 0，最左边（最高位）的 offset 为 7。
     * @returns 0 或者 1
     */
    getBit(offset) {
        return (this.value & bitMask[offset]) === bitMask[offset] ? 1 : 0;
    }

    /**
     * 读取（连续的）多位的数值
     *
     * @param {*} offset 当前数值的偏移值，注意
     *     offset + bitWidth 必须小于等于 this.bitWidth.
     *     offset 是从最低位开始数的，比如 0b11110000，最右边（最低位）的 0 的
     *     offset 为 0，最左边（最高位）的 offset 为 7。
     * @param {*} bitWidth 需读取的位宽（位）
     */
    getBits(offset, bitWidth) {
        // 示例，如果对如下二进制数调用 getBits(1, 5)
        // 10101100
        // --^---^-
        //   |   |
        // 结束  开始
        //
        // 将得到 10110

        let binary = new Binary(0, bitWidth);
        for (let idx = 0; idx < bitWidth; idx++) {
            binary.setBit(idx, this.getBit(idx + offset));
        }
        return binary;
    }

    /**
     * 更新数值
     *
     * @param {*} binary
     */
    update(binary) {
        this.value = binary.value | 0;
    }

    /**
     * 通过数值来更新数值
     *
     * @param {*} value Int32 数值
     */
    updateByValue(value) {
        this.value = value | 0;
    }

    /**
     * 复制 Binary 对象。
     *
     * @param {*} binary
     * @returns
     */
    clone() {
        return Binary.clone(this);
    }

    equals(other) {
        return Binary.equals(this, other);
    }

    /**
     * 转换为 2 进制字符串
     *
     * 前导的 0 会被省略
     * @returns
     */
    toBinaryString() {
        let value = this.value & bitWidthValue[this.bitWidth];
        if (value >= 0) {
            return value.toString(2);
        } else {
            let buffer = [];
            for (let idx = this.bitWidth - 1; idx >= 0; idx--) {
                buffer.push(this.getBit(idx));
            }
            return buffer.join('');
        }
    }

    /**
     * 转换为 16 进制字符串
     *
     * 前导的 0 会被省略
     * @returns
     */
    toHexString() {
        let value = this.value & bitWidthValue[this.bitWidth];
        if (value >= 0) {
            return value.toString(16);
        } else {
            let mask4bits = 0b1111;
            let remainBits = this.bitWidth;

            let buffer = [];
            while (remainBits >= 4) {
                let right4bits = value & mask4bits;
                buffer.push(right4bits.toString(16));

                value = value >> 4;
                remainBits -= 4;
            }

            if (remainBits > 0) {
                let right4bits = value & mask4bits;
                buffer.push(right4bits.toString(16));
            }

            return buffer.reverse().join('');
        }
    }

    /**
     * 转换为 10 进制字符串
     *
     * 前导的 0 会被省略
     * @returns
     */
    toDecimalString() {
        let value = this.value & bitWidthValue[this.bitWidth];
        return value.toString(10);
    }

}

module.exports = Binary;

