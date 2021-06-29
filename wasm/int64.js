const wasmHex =
"0061736d0100000001080260017f0060000003100f01000000000000000000000000000005030100"+
"020624067f004180080b7f004180080b7f004180080b7f00418088040b7f0041000b7f0041010b07"+
"d20216066d656d6f72790200115f5f7761736d5f63616c6c5f63746f7273000007657175616c3634"+
"00010e677265617465725f7468616e3634000217677265617465725f7468616e5f6f725f65717561"+
"6c3634000317677265617465725f7468616e5f756e7369676e65643634000420677265617465725f"+
"7468616e5f6f725f657175616c5f756e7369676e65643634000505616464363400060a7375627472"+
"6163743634000705616e6436340008046f723634000905786f723634000a056e6f743634000b0c6c"+
"6566745f73686966743634000c0d72696768745f73686966743634000d136c6f6769635f72696768"+
"745f73686966743634000e0c5f5f64736f5f68616e646c6503000a5f5f646174615f656e6403010d"+
"5f5f676c6f62616c5f6261736503020b5f5f686561705f6261736503030d5f5f6d656d6f72795f62"+
"61736503040c5f5f7461626c655f6261736503050a91020f0300010b130020002000290300200029"+
"030851ad3703100b130020002000290300200029030855ad3703100b130020002000290300200029"+
"030859ad3703100b130020002000290300200029030856ad3703100b130020002000290300200029"+
"03085aad3703100b12002000200029030820002903007c3703100b12002000200029030020002903"+
"087d3703100b1200200020002903082000290300833703100b120020002000290308200029030084"+
"3703100b1200200020002903082000290300853703100b0f0020002000290300427f853703100b12"+
"00200020002903002000290308863703100b1200200020002903002000290308873703100b120020"+
"0020002903002000290308883703100b00260970726f647563657273010c70726f6365737365642d"+
"62790105636c616e670631312e312e30";

let importObject = {
    env: {
        memory: new WebAssembly.Memory({ initial: 256 }),
    },
    imports: {
    }
};

let wasmLength = wasmHex.length / 2;
let wasmBytes = new Int8Array(wasmLength);
for (let idx = 0; idx < wasmLength; idx++) {
    wasmBytes[idx] = parseInt(wasmHex.substr(idx * 2, 2), 16);
}

// 同步加载 WASM

let m = new WebAssembly.Module(wasmBytes.buffer);
let instance = new WebAssembly.Instance(m, importObject);
let e = instance.exports;

// 导出方法
const Int64Private = {
    equal: e.equal64,
    greater_than: e.greater_than64,
    greater_than_or_equal: e.greater_than_or_equal64,
    greater_than_unsigned: e.greater_than_unsigned64,
    greater_than_or_equal_unsigned: e.greater_than_or_equal_unsigned64,
    add: e.add64,
    subtract: e.subtract64,
    and: e.and64,
    or: e.or64,
    xor: e.xor64,
    not: e.not64,
    left_shift: e.left_shift64,
    right_shift: e.right_shift64,
    logic_right_shift: e.logic_right_shift64
};

// instance.exports.memory 是 JavaScript 环境跟 WebAssembly 共享的内存（堆），
// 也是诸如数组、字符串、结构等相互传递的桥梁。
// buffer 的 byteOffset 对应着 C/C++ 里面的变量/数组的指针。
//
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
let memory = e.memory;
let buffer = memory.buffer;

// 使用 BigUint64Array 可以很方便地对 buffer 进行 int64 整型
// 操作，而 DataView 对 buffer 的操作更多。
//
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setBigUint64
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getBigUint64
//
// let dataView = new DataView(buffer);
// dataView.setBigUint64(0, 1111111n, true);
// dataView.setBigUint64(8, 2222222n, true);
// Int64Private.add64(uint64array.byteOffset);
// let result = dataView.getBigUint64(16, true);

// 这里使用更为简单的 BigUint64Array
//
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigUint64Array
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/BYTES_PER_ELEMENT
//
// let uint64array = new BigUint64Array(buffer, 0, 4);
// uint64array[0] = 33333n;
// uint64array[1] = 66666n;
// Int64Private.add(uint64array.byteOffset);
// let result = uint64array[2];

let uint64array = new BigUint64Array(buffer, 0, 4);

const Int64 = {
    add: function(a, b) {
        uint64array[0] = a;
        uint64array[1] = b;
        Int64Private.add(uint64array.byteOffset);
        return uint64array[2];
    },

    subtract: function(a, b) {
        uint64array[0] = a;
        uint64array[1] = b;
        Int64Private.subtract(uint64array.byteOffset);
        return uint64array[2];
    }

    // TODO::
};

module.exports = Int64;
