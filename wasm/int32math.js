// WASM 版本的 Int32 算术比 Javascript 的大概慢 100%，估计大部分时间被 JS->WASM 调用过程消耗。

const wasmHex = '0061736d01000000000c0664796c696e6b0000000000010f0360027f7f017f60000060017f017f030e0d010000000000000000020000000606017f0041000b07b4010f125f5f706f73745f696e7374616e746961746500000361646400010873756274726163740002086d756c7469706c7900030664697669646500040672656d61696e000503616e640006026f72000703786f720008036e6f7400090a6c6566745f7368696674000a0b72696768745f7368696674000b116c6f6769635f72696768745f7368696674000c0c5f5f64736f5f68616e646c650300185f5f7761736d5f6170706c795f646174615f72656c6f637300000a650d0300010b0700200020016a0b0700200020016b0b0700200020016c0b0700200020016e0b070020002001700b070020002001710b070020002001720b070020002001730b07002000417f730b070020002001740b070020002001750b070020002001760b';

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
        //     console.log(arg);
        // }
    }
};

let wasmLength = wasmHex.length / 2;
let wasmBytes = new Int8Array(wasmLength);
for(let idx=0; idx<wasmLength; idx++) {
    wasmBytes[idx] = parseInt(wasmHex.substr(idx*2, 2), 16);
}

// 异步加载 WASM
//
// fetch('int32math.wasm').then(response =>
//     response.arrayBuffer()
// ).then(bytes =>
//     WebAssembly.instantiate(bytes, importObject)
// ).then(results => {
//     console.log(result.instance.exports.exported_func());
// });

// 同步加载 WASM

let md = new WebAssembly.Module(wasmBytes.buffer);
let instance = new WebAssembly.Instance(md, importObject);
let ep = instance.exports;

// 导出方法
const Int32Math = {
    add: ep.add,
    subtract: ep.subtract,
    multiply: ep.multiply,
    divide: ep.divide,
    remain: ep.remain,
    and: ep.and,
    or: ep.or,
    xor: ep.xor,
    not: ep.not,
    leftShift: ep.left_shift,
    rightShift: ep.right_shift,
    logicRightShift: ep.logic_right_shift
};

module.exports = Int32Math;
