#include <stdio.h>

int main(void)
{
    char nome[100];

    printf("What's your name? ");
    scanf("%s", nome);

    printf("Hello, %s\n", nome);

    return 0;
}
