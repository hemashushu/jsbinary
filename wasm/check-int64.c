#include "int64.c"

#include <stdio.h>
#include <inttypes.h>

int main() {
    uint64_t buffer[4];
    buffer[0] = 10;
    buffer[1] = 22;
    add64(buffer);
    printf("%d\n", buffer[2]);
    return 0;
}
