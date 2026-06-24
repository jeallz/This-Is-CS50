#include <stdio.h>

int main(void)
{
    int cents;

    do
    {
        printf("Change owed: ");
        scanf("%i", &cents);
    }
    while (cents < 0);

    int coins = 0;

    while (cents > 0)
    {
        if (cents >= 25)
        {
            cents -= 25;
        }
        else if (cents >= 10)
        {
            cents -= 10;
        }
        else if (cents >= 5)
        {
            cents -= 5;
        }
        else
        {
            cents -= 1;
        }
        coins++;
    }

    printf("%i\n", coins);

    return 0;
}
