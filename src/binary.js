const Int32Math = require('../wasm/int32math');

const MAX_BIT_LENGTH = 32;

// 二进制数每一位的数值
const bitMask = new Array(MAX_BIT_LENGTH);

for (let idx = 0; idx < MAX_BIT_LENGTH; idx++) {
    bitMask[idx] = Math.pow(2, idx) | 0;
}

/**
 * 一个简单的二进制数据类型操作对象。最长支持 32 位二进制数。
 *
 * 备注：
 * 为了提高效率，本类的所有方法都没有对参数（包括 value 和 length）的
 * 有效性进行检测，调用者必须保证参数的有效性。
 */
class Binary {

    /**
     * 构造 Binary 对象
     *
     * @param {*} value Int32 数值
     * @param {*} length 取值范围为 1-32，当 value 为负数时，length 必须为 32
     */
    constructor(value, length) {
        // value 将作为无符号数（uint32_t）来处里，当传入的数字为负数时，由于 JavaScript 缺少
        // 无符号数据类型，所以读取 value 时仍然会获得负数。
        this.value = value | 0;

        // 当前 Binary 实现并未对 length 作任何检测。
        // 对于算术运算，必须保证两个操作数的长度均为 32 位。
        this.length = length;
    }

    /**
     * 从二进制字符串构造 Binary 对象
     *
     * @param {*} str 二进制数字字符串，最长不超过 32 个字符，字符串中不能有
     *     除了 [01] 之外的字符。示例：
     *     '1010', '11100000'
     * @param {*} length 1-32
     * @returns
     */
    static fromBinaryString(str, length) {
        if (length === undefined) {
            length = str.length;
        }
        return new Binary(parseInt(str, 2), length);
    }

    /**
     * 从十六进制字符串构造 Binary 对象
     *
     * @param {*} str 十六进制数字字符串，最长不超过 8 个字符，字符串中不能有
     *     除了 [0-9a-fA-F-] 之外的字符。示例：
     *     'FF00', 'DEADBEEF'
     * @param {*} length 1-32
     * @returns
     */
    static fromHexString(str, length) {
        if (length === undefined) {
            length = str.length * 4;
        }

        return new Binary(parseInt(str, 16), length);
    }

    /**
     * 从十进制字符串构造 Binary 对象
     *
     * @param {*} str 十进制字符串，最大值不超过 Int32.MAX，字符串仅可包含
     *     [0-9-] 字符。
     * @param {*} length 1-32
     * @returns
     */
    static fromDecimalString(str, length) {
        let value = parseInt(str, 10);
        if (length === undefined) {
            length = value.toString(2).length;
        }
        return new Binary(value, length);
    }

    /**
     * 复制 Binary 对象。
     *
     * @param {*} binary
     * @returns
     */
    static clone(binary) {
        return new Binary(binary.value, binary.length);
    }

    /**
     * 判断两个 Binary 对象是否相等（数值和长度均相等）。
     * @param {*} left
     * @param {*} right
     * @returns
     */
    static equals(left, right) {
        return left.value === right.value &&
            left.length === right.length;
    }

    static add(left, right) {
        return new Binary(left.value + right.value, left.length);
    }

    static subtract(left, right) {
        return new Binary(left.value - right.value, left.length);
    }

    static multiplyLow(left, right) {
        let value = Int32Math.multiplyLow(left.value, right.value);
        return new Binary(value, left.length);
    }

    static multiplyHigh(left, right) {
        let value = Int32Math.multiplyHigh(left.value, right.value);
        return new Binary(value, left.length);
    }

    static multiplyHighUnsigned(left, right) {
        let value = Int32Math.multiplyHighUnsigned(left.value, right.value);
        return new Binary(value, left.length);
    }

    static divide(left, right) {
        let value = Int32Math.divide(left.value, right.value);
        return new Binary(value, left.length);
    }

    static divideUnsigned(left, right) {
        let value = Int32Math.divideUnsigned(left.value, right.value);
        return new Binary(value, left.length);
    }

    static remainder(left, right) {
        let value = Int32Math.remainder(left.value, right.value);
        return new Binary(value, left.length);
    }

    static remainderUnsigned(left, right) {
        let value = Int32Math.remainderUnsigned(left.value, right.value);
        return new Binary(value, left.length);
    }

    static and(left, right) {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators#bitwise_operators
        return new Binary(left.value & right.value, left.length);
    }

    static or(left, right) {
        return new Binary(left.value | right.value, left.length);
    }

    static xor(left, right) {
        return new Binary(left.value ^ right.value, left.length);
    }

    static not(binary) {
        return new Binary(~binary.value, binary.length);
    }

    static leftShift(binary, length) {
        return new Binary(binary.value << length, binary.length);
    }

    /**
     * 算术右移。
     * 当数值的最高位为 1 时（即表示负数时），最高位会使用 1 来填充。
     * 当最高位为 0 时，最高位会使用 0 来填充，效果如同逻辑右移。
     *
     * @param {*} binary
     * @param {*} length 0-32
     * @returns
     */
    static rightShift(binary, length) {
        // 001100...00 >> 2 = 000011...00
        // 110000...00 >> 2 = 111100...00
        return new Binary(binary.value >> length, binary.length);
    }

    /**
     * 逻辑右移。
     * 最高位将会使用 0 来填充。
     *
     * @param {*} binary
     * @param {*} length 0-32
     * @returns
     */
    static logicRightShift(binary, length) {
        // 001100...00 >> 2 = 000011...00
        // 110000...00 >> 2 = 001100...00
        return new Binary(binary.value >>> length, binary.length);
    }

    /**
     * 按位更新数值
     *
     * @param {*} offset 0-31
     * @param {*} value 0 或者 1
     */
    setBit(offset, value) {
        if (value === 0) {
            this.value = this.value ^ bitMask[offset];
        } else {
            this.value = this.value | bitMask[offset];
        }
    }

    /**
     * 更新（连续的）多位的数值
     *
     * @param {*} binary
     * @param {*} offset 目标数值（即当前 Binary 对象数值的）偏移值，注意
     *     offset + binary.length 必须小于等于 this.length.
     */
    setBits(binary, offset) {
        for (let idx = 0; idx < binary.length; idx++) {
            this.setBit(idx + offset, binary.getBit(idx));
        }
    }

    /**
     * 按位读取数值
     *
     * @param {*} offset 0-31
     * @returns 0 或者 1
     */
    getBit(offset) {
        return ((this.value & bitMask[offset]) === bitMask[offset]) ? 1 : 0;
    }

    /**
     * 读取（连续的）多位的数值
     *
     * @param {*} offset 当前数值的偏移值，注意
     *     offset + length 必须小于等于 this.length.
     * @param {*} length 需读取的长度（位）
     */
    getBits(offset, length) {
        let binary = new Binary(0, length);
        for (let idx = 0; idx < length; idx++) {
            binary.setBit(idx, this.getBit(idx + offset));
        }
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

    toBinaryString() {
        if (this.value >= 0) {
            return this.value.toString(2);
        } else {
            let buffer = [];
            for (let idx = this.length - 1; idx >= 0; idx--) {
                buffer.push(this.getBit(idx));
            }
            return buffer.join('');
        }
    }

    toHexString() {
        if (this.value >= 0) {
            return this.value.toString(16);
        } else {
            let mask4bits = 0b1111;
            let remainBits = this.length;

            let buffer = [];
            while (remainBits >= 4) {
                let right4bits = this.value & mask4bits;
                buffer.push(right4bits.toString(16));

                this.value = this.value >> 4;
                remainBits -= 4;
            }

            if (remainBits > 0) {
                let right4bits = this.value & mask4bits;
                buffer.push(right4bits.toString(16));
            }

            return buffer.reverse().join('');
        }

    }

    toDecimalString() {
        return this.value.toString(10);
    }

}

module.exports = Binary;

