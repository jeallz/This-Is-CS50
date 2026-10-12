# C$50 Finance

CS50 Finance implementation based on the CS50x 2026 specification.

## Run
1. Use the CS50 Codespace / environment with the CS50 SQL library available.
2. Install dependencies: `pip install -r requirements.txt`
3. Ensure the distribution `finance.db` (with the standard `users` table) is in this directory.
4. Run: `flask run`

The app creates the `orders` table and indexes automatically on first authenticated use. The database is intentionally not included because the starter database should be supplied by the course environment.

Personal touch: `/add_cash` lets a user add simulated practice cash.
