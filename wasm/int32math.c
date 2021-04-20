#include <inttypes.h>
//#include <emscripten/emscripten.h>

// https://developer.mozilla.org/en-US/docs/WebAssembly/C_to_wasm

#ifdef __cplusplus
extern "C" {
#endif

//EMSCRIPTEN_KEEPALIVE
uint32_t add(uint32_t a, uint32_t b) {
    return a+b;
}

uint32_t subtract(uint32_t a, uint32_t b) {
    return a-b;
}

uint32_t multiply(uint32_t a, uint32_t b) {
    return a*b;
}

uint32_t divide(uint32_t a, uint32_t b) {
    return a/b;
}

uint32_t remain(uint32_t a, uint32_t b) {
    return a % b;
}

uint32_t and(uint32_t a, uint32_t b) {
    return a & b;
}

uint32_t or(uint32_t a, uint32_t b) {
    return a|b;
}

uint32_t xor(uint32_t a, uint32_t b) {
    return a^b;
}

uint32_t not(uint32_t a) {
    return ~a;
}

uint32_t left_shift(uint32_t a, uint32_t b) {
    return a << b;
}

uint32_t right_shift(uint32_t a, uint32_t b) {
    // arithmetic right shift
    return (int32_t)a >> b;
}

uint32_t logic_right_shift(uint32_t a, uint32_t b) {
    return a >> b;
}

#ifdef __cplusplus
}
#endif