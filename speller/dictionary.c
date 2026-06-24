#include <ctype.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>

#include "dictionary.h"

#define HASH_SIZE 65536

typedef struct node
{
    char word[LENGTH + 1];
    struct node *next;
} node;

node *table[HASH_SIZE];
unsigned int word_count = 0;

unsigned int hash(const char *word)
{
    unsigned int h = 0;
    for (int i = 0; word[i] != '\0'; i++)
        h = (h << 2) ^ tolower(word[i]);
    return h % HASH_SIZE;
}

bool load(const char *dictionary)
{
    FILE *f = fopen(dictionary, "r");
    if (f == NULL)
        return false;

    char word[LENGTH + 1];
    while (fscanf(f, "%45s", word) != EOF)
    {
        node *n = malloc(sizeof(node));
        if (n == NULL)
        {
            fclose(f);
            return false;
        }
        strcpy(n->word, word);
        unsigned int h = hash(word);
        n->next = table[h];
        table[h] = n;
        word_count++;
    }

    fclose(f);
    return true;
}

bool check(const char *word)
{
    unsigned int h = hash(word);
    node *cur = table[h];
    while (cur != NULL)
    {
        if (strcasecmp(cur->word, word) == 0)
            return true;
        cur = cur->next;
    }
    return false;
}

unsigned int size(void)
{
    return word_count;
}

bool unload(void)
{
    for (int i = 0; i < HASH_SIZE; i++)
    {
        node *cur = table[i];
        while (cur != NULL)
        {
            node *tmp = cur->next;
            free(cur);
            cur = tmp;
        }
    }
    return true;
}
