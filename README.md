# JSBinary

A simple `Binary` data type for JavaScript.

一个简单的 `二进制` 数据类型，提供基本的数值转换、读写、算术运算等操作。

## 使用方法

使用如下命令将该库添加到你的项目：

`npm i jsbinary`

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

## 单元测试

1. 下载本项目的源码到本地任意文件夹，并切换至该文件夹。
2. 使用 `npm install` 命令安装依赖包。
3. 使用 `npm test` 命令进行单元测试。