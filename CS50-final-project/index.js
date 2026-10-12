const { Client, GatewayIntentBits, Collection, Events, AttachmentBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ActivityType } = require('discord.js')
const Discord = require('discord.js');
const Colors = require('colors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv')
dotenv.config()
const { TOKEN } = process.env
const client = new Discord.Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});
client.commands = new Collection();

const sequelize = require("./database/connection");
const User = require('./models/User');
const Stock = require('./models/Stock');

async function start() {
    try {
        await sequelize.authenticate();
        console.log("MySQL conectado com sucesso!");
    } catch (error) {
        console.error("Erro ao conectar ao MySQL:", error);
    }
}
start();

const commandsPath = path.join(__dirname, "Commands", "Prefix");

function loadCommands(directory) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const filePath = path.join(directory, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            loadCommands(filePath);
            continue;
        }

        if (!file.endsWith(".js")) {
            continue;
        }

        const command = require(filePath);

        if (command.name && typeof command.execute === "function") {
            client.commands.set(command.name.toLowerCase(), command);
            console.log(`Comando carregado: ${filePath}`);
        } else {
            console.log(`Esse comando em ${filePath} está com "name" ou "execute" ausentes`);
        }
    }
}

loadCommands(commandsPath);

const eventsPath = path.join(__dirname, "Events")
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"))

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    if (event.once) {
        client.once(event.name, async (...args) => {
            try {
                await event.execute(...args, client);
            } catch (error) {
                console.error(`Erro no evento ${event.name}:`, error);
            }
        });
    } else {
        client.on(event.name, async (...args) => {
            try {
                await event.execute(...args, client);
            } catch (error) {
                console.error(`Erro no evento ${event.name}:`, error);
            }
        });
    }
}

async function verifyUser(message) {
    const discordId = message.author.id;
    const discordUsername = message.author.username;

    let usuario = await User.findOne({
        where: {
            discord_id: discordId,
        },
    });

    let stock = await Stock.findOne({
        where: {
            discord_id: discordId,
        },
    });

    if (!usuario) {
        usuario = await User.create({
            discord_id: discordId,
            username: discordUsername
        });

        console.log(`[Banco] Novo usuário criado: ${discordUsername} (${discordId})`);
    }

    if (!stock) {
        stock = await Stock.create({
            discord_id: discordId
        });

        console.log(`[BANCO] Novo stock criado: ${discordUsername} (${discordId})`);
    }

    return usuario && stock;
}

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

    if (!command) return;

    try {
        await verifyUser(message)
        await command.execute(message, args);
    } catch (error) {
        console.error(`Erro ao executar comando ${commandName}:`, error);
        message.reply('Ocorreu um erro ao executar este comando.');
    }
});

client.once(Discord.Events.ClientReady, async (c) => {
    console.log(`Pronto! Login realizado como ${c.user.username}.`.magenta);
});

client.login(TOKEN);