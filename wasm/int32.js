// 使用 WASM 实现符号数（及无符号数） int32 的加减乘除、逻辑、移位等运算。
// Javascript 调用 WASM 的方法并返回值的过程需要消耗额外的时间，所以对于简单的
// 算术计算，直接使用 Javascript 的本身算术功能效率较高。

const wasmHex = '0061736d01000000000c0664796c696e6b0000000000010f0360027f7f017f60000060017f017f031716010000000000000000000000000000000000020000000606017f0041000b07fa0218125f5f706f73745f696e7374616e7469617465000005657175616c00010c677265617465725f7468616e000215677265617465725f7468616e5f6f725f657175616c000315677265617465725f7468616e5f756e7369676e656400041e677265617465725f7468616e5f6f725f657175616c5f756e7369676e6564000503616464000608737562747261637400070c6d756c7469706c795f6c6f7700080d6d756c7469706c795f686967680009166d756c7469706c795f686967685f756e7369676e6564000a06646976696465000b0f6469766964655f756e7369676e6564000c1072656d61696e6465725f7369676e6564000d1272656d61696e6465725f756e7369676e6564000e03616e64000f026f72001003786f720011036e6f7400120a6c6566745f736869667400130b72696768745f73686966740014116c6f6769635f72696768745f736869667400150c5f5f64736f5f68616e646c650300185f5f7761736d5f6170706c795f646174615f72656c6f637300000abf01160300010b070020002001460b0700200020014a0b0700200020014e0b0700200020014b0b0700200020014f0b0700200020016a0b0700200020016b0b0700200020016c0b13002000ad2001ad4230864230877e422088a70b0d002001ad2000ad7e422088a70b0700200020016d0b0700200020016e0b0700200020016f0b070020002001700b070020002001710b070020002001720b070020002001730b07002000417f730b070020002001740b070020002001750b070020002001760b';

// WebAssembly key concepts
// https://developer.mozilla.org/en-US/docs/WebAssembly/Concepts#webassembly_key_concepts
//
// Module: Represents a WebAssembly binary that has been compiled by the browser into executable
//     machine code. A Module is stateless and thus, like a Blob, can be explicitly shared between windows
//     and workers (via postMessage()). A Module declares imports and exports just like an ES2015module.
// Memory: A resizable ArrayBuffer that contains the linear array of bytes read and written by
//     WebAssembly’s low-level memory access instructions.
// Table: A resizable typed array of references (e.g. to functions) that could not otherwise be
//     stored as raw bytes in Memory (for safety and portability reasons).
// Instance: A Module paired with all the state it uses at runtime including a Memory, Table,
//     and set of imported values. An Instance is like an ES2015 module that has been loaded into a
//     particular global with a particular set of imports.

let importObject = {
    env: {
        memory: new WebAssembly.Memory({ initial: 256 }),
    },
    imports: {
        // jsprintf: function(arg) {
        //     // some function import to WASM vm
        // }
    }
};

let wasmLength = wasmHex.length / 2;
let wasmBytes = new Int8Array(wasmLength);
for (let idx = 0; idx < wasmLength; idx++) {
    wasmBytes[idx] = parseInt(wasmHex.substr(idx * 2, 2), 16);
}

// 异步加载 WASM
//
// fetch('int32.wasm').then(response =>
//     response.arrayBuffer()
// ).then(bytes =>
//     WebAssembly.instantiate(bytes, importObject)
// ).then(results => {
//     console.log(result.instance.exports.exported_func());
// });

// 同步加载 WASM

let m = new WebAssembly.Module(wasmBytes.buffer);
let instance = new WebAssembly.Instance(m, importObject);
let e = instance.exports;

// 导出方法
const Int32 = {
    equal: e.equal,
    greaterThan: e.greater_than,
    greaterThanUnsigned: e.greater_than_unsigned,
    greaterThanOrEqual: e.greater_than_or_equal,
    greaterThanOrEqualUnsigned: e.greater_than_or_equal_unsigned,
    add: e.add,
    subtract: e.subtract,
    multiplyLow: e.multiply_low,
    multiplyHigh: e.multiply_high,
    multiplyHighUnsigned: e.multiply_high_unsigned,
    divide: e.divide,
    divideUnsigned: e.divide_unsigned,
    remainder: e.remainder_signed,
    remainderUnsigned: e.remainder_unsigned,
    and: e.and,
    or: e.or,
    xor: e.xor,
    not: e.not,
    leftShift: e.left_shift,
    rightShift: e.right_shift,
    logicRightShift: e.logic_right_shift
};

module.exports = Int32;
