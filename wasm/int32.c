#include <inttypes.h>
//#include <emscripten/emscripten.h>

// https://developer.mozilla.org/en-US/docs/WebAssembly/C_to_wasm

#ifdef __cplusplus
extern "C"
{
#endif
    uint32_t equal(uint32_t a, uint32_t b) {
        return a == b ? 1 : 0;
    }

    uint32_t greater_than(uint32_t a, uint32_t b) {
        return (int32_t)a > (int32_t)b ? 1 : 0;
    }

    uint32_t greater_than_or_equal(uint32_t a, uint32_t b) {
        return (int32_t)a >= (int32_t)b ? 1 : 0;
    }

    uint32_t greater_than_unsigned(uint32_t a, uint32_t b) {
        return a > b ? 1 : 0;
    }

    uint32_t greater_than_or_equal_unsigned(uint32_t a, uint32_t b) {
        return a >= b ? 1 : 0;
    }

    //EMSCRIPTEN_KEEPALIVE
    uint32_t add(uint32_t a, uint32_t b)
    {
        // 13 + 5 = 18
        // 13 + -5 = 8
        // -13 + 5 = -8
        // -13 + -5 = -18
        return a + b;
    }

    uint32_t subtract(uint32_t a, uint32_t b)
    {
        // 13 - 5 = 8
        // 13 - -5 = 18
        // -13 - 5 = -18
        // -13 - -5 = -8
        return a - b;
    }

    uint32_t multiply_low(uint32_t a, uint32_t b)
    {
        // 13 * (low) 5 = 65
        // 13 * (low) -5 = -65
        // -13 * (low) 5 = -65
        // -13 * (low) -5 = 65
        uint64_t c = a * b;
        return c & 0xffffffff;
    }

    uint32_t multiply_high(uint32_t a, uint32_t b)
    {
        // 13 * (high) 5 = 0
        // 13 * (high) -5 = -1
        // -13 * (high) 5 = -1
        // -13 * (high) -5 = 0
        int64_t ax = a;
        int16_t bx = b;
        int64_t c = ax * bx;
        return c >> 32;
    }

    uint32_t multiply_high_unsigned(uint32_t a, uint32_t b)
    {
        // 13 * (high unsig) 5 = 0
        // 13 * (high unsig) -5 = 0
        // -13 * (high unsig) 5 = 0
        // -13 * (high unsig) -5 = 0
        uint64_t ax = a;
        uint64_t bx = b;
        uint64_t c = ax * bx;
        return c >> 32;
    }

    uint32_t divide(uint32_t a, uint32_t b)
    {
        // 13 / 5 = 2
        // 13 / -5 = -2
        // -13 / 5 = -2
        // -13 / -5 = 2
        return (int32_t)a / (int32_t)b;
    }

    uint32_t divide_unsigned(uint32_t a, uint32_t b)
    {
        // 13 / (unsig) 5 = 2
        // 13 / (unsig) -5 = 0
        // -13 / (unsig) 5 = 858993456
        // -13 / (unsig) -5 = 0
        return a / b;
    }

    uint32_t remainder_signed(uint32_t a, uint32_t b)
    {
        // conflicting types for built-in function ‘remainder’; expected ‘double(double,  double)’
        // note: ‘remainder’ is declared in header ‘<math.h>’

        // 13 % 5 = 3
        // 13 % -5 = 3
        // -13 % 5 = -3
        // -13 % -5 = -3
        return (int32_t)a % (int32_t)b;
    }

    uint32_t remainder_unsigned(uint32_t a, uint32_t b)
    {
        // 13 % (unsig) 5 = 3
        // 13 % (unsig) -5 = 13
        // -13 % (unsig) 5 = 3
        // -13 % (unsig) -5 = -13
        return a % b;
    }

    uint32_t and (uint32_t a, uint32_t b)
    {
        // 13 & 5 = 5
        // 13 & -5 = 9
        // -13 & 5 = 1
        // -13 & -5 = -13
        return a & b;
    }

    uint32_t or (uint32_t a, uint32_t b)
    {
        // 13 | 5 = 13
        // 13 | -5 = -1
        // -13 | 5 = -9
        // -13 | -5 = -5
        return a | b;
    }

    uint32_t xor (uint32_t a, uint32_t b)
    {
        // 13 ^ 5 = 8
        // 13 ^ -5 = -10
        // -13 ^ 5 = -10
        // -13 ^ -5 = 8
        return a ^ b;
    }

    uint32_t not(uint32_t a)
    {
        // not(13, 00000000000000000000000000001101) = -14, 11111111111111111111111111110010
        // not(-5, 11111111111111111111111111111011) = 4, 00000000000000000000000000000100
        return ~a;
    }

    uint32_t left_shift(uint32_t a, uint32_t b)
    {
        // left shift 2 (13, 00000000000000000000000000001101) = 52, 00000000000000000000000000110100
        // left shift 2 (-5, 11111111111111111111111111111011) = -20, 11111111111111111111111111101100
        return a << b;
    }

    uint32_t right_shift(uint32_t a, uint32_t b)
    {
        // arithmetic right shift:
        //
        // right shift 2 (13, 00000000000000000000000000001101) = 3, 00000000000000000000000000000011
        // right shift 2 (-5, 11111111111111111111111111111011) = -2, 11111111111111111111111111111110
        return (int32_t)a >> b;
    }

    uint32_t logic_right_shift(uint32_t a, uint32_t b)
    {
        // logic right shift:
        //
        // logic right shift 2 (13, 00000000000000000000000000001101) = 3, 00000000000000000000000000000011
        // logic right shift 2 (-5, 11111111111111111111111111111011) = 1073741822, 00111111111111111111111111111110
        return a >> b;
    }

#ifdef __cplusplus
}
#endif