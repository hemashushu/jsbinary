const Binary = require('../src/binary');

// var assert = require('assert');
//
// describe('Array', function() {
//   describe('#indexOf()', function() {
//     it('should return -1 when the value is not present', function() {
//       assert.strictEqual([1, 2, 3].indexOf(4), -1);
//     });
//   });
// });

function t1() {
    let b1 = Binary.fromBinaryString('1', 32);
    let b2 = Binary.fromBinaryString('100',32);
    console.log(b1.toDecimalString());
    console.log(b2.toDecimalString());
    let b3 = Binary.add(b1, b2);
    console.log('bin:' + b3.toBinaryString());
    console.log('dec:' + b3.toDecimalString());
}

t1();