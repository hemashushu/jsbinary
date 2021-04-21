#include "int32math.c"

#include <stdio.h>
#include <inttypes.h>

typedef uint32_t (*func)(uint32_t, uint32_t);

/**
 * str: 33-length chars (32 char + 1 '\0').
 */
void bits_to_string(uint32_t x, char str[])
{
    for (int i = 31; i >= 0; i--)
    {
       str[31 - i] =(x & (1u << i) ? '1' : '0');
    }

    str[32] = '\0';
}

int main() {
	int32_t numbers[] = {
        13, 5,
        13, -5,
        -13, 5,
        -13, -5};

    func funcs[] = {add, subtract,
        multiply_low, multiply_high, multiply_high_unsigned,
        divide, divide_unsigned,
        remainder_, remainder_unsigned,
        and, or, xor};

    char* func_names[] = {"add", "subtract",
        "multiply_low", "multiply_high", "multiply_high_unsigned",
        "divide", "divide_unsigned",
        "remainder_", "remainder_unsigned",
        "and", "or", "xor"};

    char* operators[] = {"+", "-",
        "* (low)", "* (high)", "* (high unsig)",
        "/", "/ (unsig)",
        "%", "% (unsig)",
        "&", "|", "^"};

    for(int fi=0;fi<12;fi++) {
        printf("function: %s\n", func_names[fi]);
        for(int ni=0;ni<4;ni++) {
            int32_t a = numbers[ni*2];
            int32_t b = numbers[ni*2+1];
            int32_t r = funcs[fi](a, b);
            printf("  %d %s %d = %d\n", a, operators[fi], b, r);
        }
        printf("\n");
    }

    // function not
    int32_t a, r;
    char str_a[33];
    char str_r[33];

    printf("function: not\n");

    a = 13;
    r = not(a);
    bits_to_string(a, str_a);
    bits_to_string(r, str_r);
    printf("not(%d, %s) = %d, %s\n", a, str_a, r, str_r);

    a = -5;
    r = not(a);
    bits_to_string(a, str_a);
    bits_to_string(r, str_r);
    printf("not(%d, %s) = %d, %s\n", a, str_a, r, str_r);

    printf("\n");

    // function left shift

    printf("function: left shift\n");

    a = 13;
    r = left_shift(a, 2);
    bits_to_string(a, str_a);
    bits_to_string(r, str_r);
    printf("left shift 2 (%d, %s) = %d, %s\n", a, str_a, r, str_r);

    a = -5;
    r = left_shift(a, 2);
    bits_to_string(a, str_a);
    bits_to_string(r, str_r);
    printf("left shift 2 (%d, %s) = %d, %s\n", a, str_a, r, str_r);

    printf("\n");

    // function right shift

    printf("function: right shift\n");

    a = 13;
    r = right_shift(a, 2);
    bits_to_string(a, str_a);
    bits_to_string(r, str_r);
    printf("right shift 2 (%d, %s) = %d, %s\n", a, str_a, r, str_r);

    a = -5;
    r = right_shift(a, 2);
    bits_to_string(a, str_a);
    bits_to_string(r, str_r);
    printf("right shift 2 (%d, %s) = %d, %s\n", a, str_a, r, str_r);

    printf("\n");

    // function logic right shift

    printf("function: logic right shift\n");

    a = 13;
    r = logic_right_shift(a, 2);
    bits_to_string(a, str_a);
    bits_to_string(r, str_r);
    printf("logic right shift 2 (%d, %s) = %d, %s\n", a, str_a, r, str_r);

    a = -5;
    r = logic_right_shift(a, 2);
    bits_to_string(a, str_a);
    bits_to_string(r, str_r);
    printf("logic right shift 2 (%d, %s) = %d, %s\n", a, str_a, r, str_r);

    printf("\n");
}
