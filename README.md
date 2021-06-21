# JSBinary

A simple `Binary` data type for JavaScript.

一个简单的 `二进制` 数据类型，提供基本的数值转换、算术运算、逻辑运算、比较等操作。

## 示例

```
const {Binary} = require('jsbinary');

let b1 = Binary.fromBinaryString('1001');

console.log(b1.toBinaryString());
console.log(b1.toHexString());
console.log(b1.toDecimalString());

let b2 = Binary.fromBinaryString('11');
let b3 = Binary.add(b1, b2);

console.log(b2.toBinaryString());
console.log(b3.toBinaryString());
```
