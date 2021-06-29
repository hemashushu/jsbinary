#include <inttypes.h>

#ifdef __cplusplus
extern "C"
{
#endif

    // 方法的参数及计算结果（数值）都通过
    // WebAssembly instance.exports.memory （共享内存/堆）传递。
    //
    // uint64_t buffer[4]
    // [dest-ext, dest, src2, src1] <-- content
    //  3         2     1     0     <-- index

    void equal64(uint64_t* buffer) {
        buffer[2] = buffer[0] == buffer[1] ? 1 : 0;
    }

    void greater_than64(uint64_t* buffer) {
        buffer[2] = (int64_t)buffer[0] > (int64_t)buffer[1] ? 1 : 0;
    }

    void greater_than_or_equal64(uint64_t* buffer) {
        buffer[2] = (int64_t)buffer[0] >= (int64_t)buffer[1] ? 1 : 0;
    }

    void greater_than_unsigned64(uint64_t* buffer) {
        buffer[2] = buffer[0] > buffer[1] ? 1 : 0;
    }

    void greater_than_or_equal_unsigned64(uint64_t* buffer) {
        buffer[2] = buffer[0] >= buffer[1] ? 1 : 0;
    }

    void add64(uint64_t* buffer) {
        buffer[2] = buffer[0] + buffer[1];
    }

    void subtract64(uint64_t* buffer) {
        buffer[2] = buffer[0] - buffer[1];
    }

    void and64 (uint64_t* buffer)
    {
        buffer[2] = buffer[0] & buffer[1];
    }

    void or64 (uint64_t* buffer)
    {
        buffer[2] = buffer[0] | buffer[1];
    }

    void xor64 (uint64_t* buffer)
    {
        buffer[2] = buffer[0] ^ buffer[1];
    }

    void not64(uint64_t* buffer)
    {
        buffer[2] = ~buffer[0];
    }

    void left_shift64(uint64_t* buffer)
    {
        buffer[2] = buffer[0] << buffer[1];
    }

    void right_shift64(uint64_t* buffer)
    {
        // arithmetic right shift:
        buffer[2] = (int64_t)buffer[0] >> buffer[1];
    }

    void logic_right_shift64(uint64_t* buffer)
    {
        buffer[2] = buffer[0] >> buffer[1];
    }

#ifdef __cplusplus
}
#endif