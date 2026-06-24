import csv
import sys


def main():

    if len(sys.argv) != 3:
        print("Usage: python dna.py data.csv sequence.txt")
        sys.exit(1)

    database = sys.argv[1]
    sequence_file = sys.argv[2]

    with open(database) as f:
        reader = csv.DictReader(f)
        database_list = list(reader)

    with open(sequence_file) as f:
        dna = f.read().strip()

    str_list = database_list[0].keys()
    str_list = list(str_list)[1:]

    str_counts = {}
    for str_name in str_list:
        str_counts[str_name] = longest_run(dna, str_name)

    for person in database_list:
        match = True
        for str_name in str_list:
            if int(person[str_name]) != str_counts[str_name]:
                match = False
                break
        if match:
            print(person["name"])
            sys.exit(0)

    print("No match")
    sys.exit(0)


def longest_run(dna, str_name):
    """Retorna o maior número de repetições consecutivas de str_name na dna"""
    max_count = 0
    current_count = 0
    i = 0
    while i < len(dna):
        if dna[i:i + len(str_name)] == str_name:
            current_count += 1
            max_count = max(max_count, current_count)
            i += len(str_name)
        else:
            current_count = 0
            i += 1
    return max_count


if __name__ == "__main__":
    main()
