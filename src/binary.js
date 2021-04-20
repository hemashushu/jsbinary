const MAX_BIT_LENGTH = 32;

const bitMask = new Array(MAX_BIT_LENGTH);

for(let idx=0; idx<MAX_BIT_LENGTH; idx++) {
    bitMask[idx] = Math.pow(2, idx) | 0;
}

class Binary {
    /**
     * 构造 Binary 对象
     *
     * @param {*} value Int32 数值
     * @param {*} length 取值范围为 1-32
     */
    constructor(value = 0, length = 1) {
        this.value = value | 0;
        this.length = length;
    }

    /**
     * 从二进制字符串构造 Binary 对象
     *
     * @param {*} str 二进制数字字符串，最长不超过 32 个字符，字符串中不能有
     *     除了 [01] 之外的字符。如：
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
     *     除了 [0-9a-fA-F-] 之外的字符。如：
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
        return new Binary(parseInt(str, 10), length);
    }

    /**
     * 复制一个 Binary 对象。
     *
     * @param {*} binary
     * @returns
     */
    static clone(binary) {
        return new Binary(binary.value, binary.length);
    }

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

    static multiply(left, right) {
        return new Binary(Math.imul(left.value, right.value), left.length);
    }

    static divide(left, right) {
        return new Binary(Math.trunc(left.value / right.value), left.length);
    }

    static remain(left, right) {
        return new Binary(left.value % right.value, left.length);
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

    static rightShift(binary, length) {
        // arithmetic right shift
        return new Binary(binary.value >> length, binary.length);
    }

    static logicRightShift(binary, length) {
        return new Binary(binary.value >>> length, binary.length);
    }

    /**
     * 更新数值
     *
     * @param {*} value Int32 数值
     */
    update(value) {
        this.value = value | 0;
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
        }else {
            this.value = this.value | bitMask[offset];
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

    equalsTo(other) {
        return Binary.equals(this, other);
    }

    toBinaryString() {
        return this.value.toString(2);
    }

    toHexString() {
        return this.value.toString(16);
    }

    toDecimalString() {
        return this.value.toString(10);
    }

}

module.exports = Binary;

