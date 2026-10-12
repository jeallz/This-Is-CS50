# Kwanzaa

### Video demo: [https://youtu.be/KAn4io-qD8g](https://youtu.be/KAn4io-qD8g)

<hr>

<h3>My project is a simple economy Discord bot.</h3>

Hey there, i'm Estevan Chicoski, and i full-stack JS developer. I'm 19 years old and i'm live in Guarapuava, Paraná - Brazil
This is my portfolio: [https://estevan.dev.br/](https://estevan.dev.br)

The bot doesn't solve any real-world problems; its goal is to serve as a pastime—a bot you use to kill time by playing with your pet and betting money earned through work or daily rewards.

The bot has a limited set of commands, which are:

## <h3>Economy</h3>
<ul>
  <li>!balance</li>
  <li>!profile</li>
  <li>!daily</li>
  <li>!job</li>
  <li>!work</li>
  <li>!deposit</li>
  <li>!withdraw</li>
</ul>

The economy commands refer to commands where you can choose a job, work, view your accumulated money, and deposit or withdraw money from the bank.

The `balance` shows all your money—the accumulated total, as well as the money in your wallet and in the bank.

The `profile` shows all your information, including level, XP, profession, pet...

The `daily` command gives you a daily cash reward, which can only be claimed once every 24 hours.

The `job` command allows you to choose your job. Each job requires a different level and offers a different salary. To level up and choose a better job, you must work to earn XP and increase your level.

The `work` is the command to work; you use it every hour and receive a salary based on your chosen profession.

As for the `deposit` and `withdraw` commands, these are the commands you use to deposit and withdraw money from the bank.

## <h3>Pet</h3>
<ul>
  <li>!stock</li>
  <li>!market</li>
  <li>!pet</li>
</ul>

The pet commands allow you to adopt a pet, name it, and raise it over time. Using the money you've earned, you need to buy food via the `market` command, check your food supply with the `stock` command, and feed or play with your pet using the `pet` command.

Feeding and playing with your pet increases its happiness; if you neglect to do so for too long, the pet will die, and you will have to raise a new one.

Pets feature a progression system: whenever you play with your pet, you not only boost its happiness but also increase its XP, eventually raising its level.

## <h3>Bet</h3>
<ul>
  <li>!coinflip</li>
  <li>!crash</li>
  <li>!roulette</li>
  <li>!blackjack</li>
</ul>

The betting systems are the bot's main focus, you can wager all your money, with the chance to double, triple, or quadruple it through your bets.

With the `coinflip` command, if the coin lands on the chosen side, your money is doubled.

In the `crash` game, you need to cash out before the crash occurs. If you manage to cash out in time, you receive your money multiplied by the current multiplier value; if you fail to cash out before the crash, you lose everything.

The `roulette` command works as follows: there is an array containing eighteen 0s (representing the color red), eighteen 1s (representing the color black), and a single 2 (representing green). If it lands on red, you lose all your money; if it lands on black, you multiply your money; and if it lands on green, you win ten times your money.

In the `blackjack` command, whoever gets closest to 21 wins. So, if I end up with 18 and the bot has 20, the bot wins and I lose everything. But if, for example, I get 17 and the bot gets 16, I win and double my bet. Whoever gets 21 wins the game instantly.

## Technologies

For this project, I chose to use discord.js and MySQL. I used discord.js because I am very familiar with JavaScript, and also because it is my preferred programming language.

As for the database, I initially considered using MongoDB, but opted for MySQL because it was part of the course curriculum.

Regarding Node.js and discord.js, I studied them a few years ago using free online courses, and I learned discord.js by reading the official documentation for the Discord bot development library.

[https://discordjs.guide/legacy](https://discordjs.guide/legacy)

## File Structure

The project is organized into directories that separate commands, database operations, event handlers, and data models. This structure makes the code easier to maintain and allows each component to have a specific responsibility.

```text
CS50-final-project/
├── Commands/
│   ├── Prefix/
│   │   ├── Bets/
│   │   │   ├── blackjack.js
│   │   │   ├── coinflip.js
│   │   │   ├── crash.js
│   │   │   └── roulette.js
│   │   ├── Pets/
│   │   │   └── pet.js
│   │   ├── Stock/
│   │   │   ├── market.js
│   │   │   ├── stocks.js
│   │   │   ├── balance.js
│   │   │   ├── daily.js
│   │   │   ├── deposit.js
│   │   │   ├── job.js
│   │   │   ├── ping.js
│   │   │   ├── profile.js
│   │   │   ├── withdraw.js
│   │   │   └── work.js
│   │   └── ping.js
│   ├── database/
│   │   └── connection.js
│   ├── Events/
│   │   └── interactions.js
│   ├── models/
│   │   ├── Pet.js
│   │   ├── Stock.js
│   │   └── User.js
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
```

### Directory and File Overview

* **`Commands/`** contains the bot's commands, organized into categories.
* **`Commands/Prefix/Bets/`** contains betting game commands, including blackjack, coinflip, crash, and roulette.
* **`Commands/Prefix/Pets/`** contains commands related to the bot's virtual pets.
* **`Commands/Prefix/Stock/`** contains commands for the economy and stock market systems, including balances, daily rewards, deposits, withdrawals, jobs, profiles, and work.
* **`Commands/database/connection.js`** manages the database connection.
* **`Commands/Events/interactions.js`** handles Discord interaction events.
* **`Commands/models/`** defines the database models for users, pets, and stocks.
* **`index.js`** serves as the bot's main entry point.
* **`package.json`** lists the project's dependencies and scripts.
* **`package-lock.json`** records the installed dependency versions.

## How to Run

### DataBase

First, create the SQL database.

```sql
create database if not exists kwanzaa;
use kwanzaa;
```
Then, within the project, there is a folder named `schemas`; inside it, you'll find the SQL commands to create the tables required for the project.

<img width="873" height="308" alt="image" src="https://github.com/user-attachments/assets/edf8adce-1161-4899-89a8-43aeba4b74bb" />

Execute the SQL commands from the `schemas` folder within your `kwanzaa` database and verify them using the commands `desc users;`, `desc pets;`, and `desc stock;`.

Se todos retornarem resultados, tudo estará configurado corretamente.

Esse deve ser o resultado final da execução dos comandos de SQL:

<img width="1917" height="1080" alt="image" src="https://github.com/user-attachments/assets/cc2e92be-11ea-4b40-8ff0-3128f28acc81" />

Next, you need to enter your database information into the application's `.env` file:

```
DB_USER=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD
```

### Discord.js

First, create a Discord account if you don't have one, and access the Discord Developer Portal.

[Discord Developers Portal](https://discord.dev/)

then access the button in the top right corner

<img width="201" height="79" alt="image" src="https://github.com/user-attachments/assets/f714efc6-b6c9-400e-8558-25f3f240db74" />

<hr>

On the portal, you will go to the area for creating new Discord applications.
Here you must create your bot.

<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/08b9bb5e-628a-4d74-aa83-b60e02b35c67" />

<hr>

With the bot created, you need to copy the application ID.

<img width="277" height="153" alt="image" src="https://github.com/user-attachments/assets/e45feb01-f9bf-4dba-87ff-6fb4ed714f18" />

In the "bot" section, you must reset your application token and copy it.

<img width="1201" height="268" alt="image" src="https://github.com/user-attachments/assets/39c25cac-e778-4467-9b40-9b0e39ad5618" />

<hr>

With the copied application ID and token, you must enter this information into the application's `.env` file as follows, below the database information:

```
TOKEN=YOUR_TOKEN
CLIENT_ID=YOUR_CLIENT_ID
DB_USER=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD
```

This should be the final structure of your `.env` file.

Also, in the "bot" section, you need to keep these three intents enabled.

<img width="1423" height="360" alt="image" src="https://github.com/user-attachments/assets/63e48985-b27d-4dc2-b30d-d16b2689f436" />

Now, for the installation part, you need to set it up exactly as shown in the screenshot below and copy the link provided above by Discord itself.

<img width="1841" height="871" alt="image" src="https://github.com/user-attachments/assets/17487b44-f190-46a2-a304-bf97dea43a23" />

With this link, you create your own private Discord server, send the installation link to any channel on your server, and add the bot to your server.

<img width="350"  alt="image" src="https://github.com/user-attachments/assets/711601fd-ed32-45a3-9c4d-d7ad7014ac3b" />
<img width="250"  alt="image" src="https://github.com/user-attachments/assets/a5f9a813-1d65-4894-8288-978e01ca08e8" />
<img width="250"  alt="image" src="https://github.com/user-attachments/assets/a5120727-1674-4a2c-911e-d94cdde0bc9d" />

<br><br>

Just confirm and add the bot to your server.

### Run the code
<hr>

To run the code, you need to have Node.js installed on your computer.

Navigate via terminal or command prompt to the folder containing the project files, ensure the `.env` file is configured with the correct information, and run the following commands:

```
npm install
```

Then:

```
node index.js
```

This way, the bot will run successfully, and you will be able to use its prefix commands in any text chat on your server.
