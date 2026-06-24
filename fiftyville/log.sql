SELECT * FROM crime_scene_reports WHERE street = 'Humphrey Street' AND month = 7 AND day = 28 AND year = 2025;

SELECT name, transcript FROM interviews WHERE month = 7 AND day = 28 AND year = 2025;

SELECT * FROM bakery_security_logs WHERE month = 7 AND day = 28 AND year = 2025 AND hour = 10 AND minute >= 15 AND minute <= 25;

SELECT name, license_plate FROM people WHERE license_plate IN ('5P2BI95','94KL13X','6P58WS2','4328GD8','G412CB7','L93JTIZ','322W7JE','0NTHK55');

SELECT people.name FROM people JOIN bank_accounts ON people.id = bank_accounts.person_id JOIN atm_transactions ON bank_accounts.account_number = atm_transactions.account_number WHERE atm_transactions.month = 7 AND atm_transactions.day = 28 AND atm_transactions.year = 2025 AND atm_transactions.atm_location = 'Leggett Street' AND atm_transactions.transaction_type = 'withdraw';

SELECT people.name FROM people JOIN phone_calls ON people.phone_number = phone_calls.caller WHERE phone_calls.month = 7 AND phone_calls.day = 28 AND phone_calls.year = 2025 AND phone_calls.duration < 60;

SELECT flights.id, flights.hour, flights.minute, airports.city FROM flights JOIN airports ON flights.destination_airport_id = airports.id WHERE flights.month = 7 AND flights.day = 29 AND flights.year = 2025 ORDER BY flights.hour, flights.minute LIMIT 1;

SELECT people.name FROM people JOIN passengers ON people.passport_number = passengers.passport_number WHERE passengers.flight_id = 36 AND people.name IN ('Bruce', 'Diana');

SELECT people.name FROM people JOIN phone_calls ON people.phone_number = phone_calls.receiver WHERE phone_calls.caller = (SELECT phone_number FROM people WHERE name = 'Bruce') AND phone_calls.month = 7 AND phone_calls.day = 28 AND phone_calls.year = 2025 AND phone_calls.duration < 60;
