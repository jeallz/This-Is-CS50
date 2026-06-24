#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

typedef struct person
{
    struct person *parents[2];
    char alleles[2];
}
person;

const int GENERATIONS = 3;
const char ALLELES[4] = {'A', 'B', 'O', 'O'};

person *create_family(int generations);
void print_family(person *p, int generation);
void free_family(person *p);
char random_allele(void);

int main(void)
{
    srand(time(NULL));

    person *p = create_family(GENERATIONS);

    print_family(p, 0);

    free_family(p);

    return 0;
}

person *create_family(int generations)
{
    person *new_person = malloc(sizeof(person));

    if (new_person == NULL)
    {
        return NULL;
    }

    if (generations > 1)
    {
        new_person->parents[0] = create_family(generations - 1);
        new_person->parents[1] = create_family(generations - 1);
    }
    else
    {
        new_person->parents[0] = NULL;
        new_person->parents[1] = NULL;
    }

    if (new_person->parents[0] == NULL && new_person->parents[1] == NULL)
    {
        new_person->alleles[0] = random_allele();
        new_person->alleles[1] = random_allele();
    }
    else
    {
        new_person->alleles[0] = new_person->parents[0]->alleles[rand() % 2];
        new_person->alleles[1] = new_person->parents[1]->alleles[rand() % 2];
    }

    return new_person;
}

void print_family(person *p, int generation)
{
    if (p == NULL)
    {
        return;
    }

    for (int i = 0; i < generation; i++)
    {
        printf("    ");
    }

    printf("Generation %i, blood type: %c%c\n", generation, p->alleles[0], p->alleles[1]);

    print_family(p->parents[0], generation + 1);
    print_family(p->parents[1], generation + 1);
}

void free_family(person *p)
{
    if (p == NULL)
    {
        return;
    }

    free_family(p->parents[0]);
    free_family(p->parents[1]);

    free(p);
}

char random_allele(void)
{
    return ALLELES[rand() % 4];
}
