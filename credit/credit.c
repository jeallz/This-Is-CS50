#include <cs50.h>
#include <stdio.h>

int main(void)
{
    long number = 0;

    do
    {
        number = get_long("Number: ");
    }
    while (number < 0);

    long temp = number;
    int digits = 0;
    while (temp > 0)
    {
        temp /= 10;
        digits++;
    }

    if (digits != 13 && digits != 15 && digits != 16)
    {
        printf("INVALID\n");
        return 0;
    }

    long n = number;
    int sum = 0;
    int position = 0;

    while (n > 0)
    {
        int digit = n % 10;

        if (position % 2 == 1)
        {
            digit *= 2;
            sum += digit / 10 + digit % 10;
        }
        else
        {
            sum += digit;
        }

        n /= 10;
        position++;
    }

    if (sum % 10 != 0)
    {
        printf("INVALID\n");
        return 0;
    }

    long first_digits = number;
    while (first_digits >= 100)
    {
        first_digits /= 10;
    }

    if (digits == 15 && (first_digits == 34 || first_digits == 37))
    {
        printf("AMEX\n");
    }
    else if (digits == 16 && first_digits >= 51 && first_digits <= 55)
    {
        printf("MASTERCARD\n");
    }
    else if ((digits == 13 || digits == 16) && (first_digits / 10 == 4))
    {
        printf("VISA\n");
    }
    else
    {
        printf("INVALID\n");
    }

    return 0;
}
