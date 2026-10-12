const { EmbedBuilder } = require('discord.js');
const User = require("../../../models/User");

const roulette = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 
    1, 1, 1, 1, 1, 1, 1, 1, 1,
    2
];

const colors = {
    0: {
        name: "Red",
        emoji: "🔴",
        multiplier: 0
    },
    1: {
        name: "Black",
        emoji: "⚫",
        multiplier: 2
    },
    2: {
        name: "Green",
        emoji: "🟢",
        multiplier: 10
    }
};

module.exports = {
    name: "roulette",

    async execute(message, args) {
        const bet = Number(args[0]);

        if (!args[0] || !Number.isInteger(bet) || bet <= 0) {
            return message.reply("❌ Inform a valid amount to bet.\n\nExample: `!roulette 100`");
        }

        const user = await User.findOne({
            where: {
                discord_id: message.author.id
            }
        });

        if (!user) {
            return message.reply("❌ User not found.");
        }

        if (user.money < bet) {
            return message.reply(`❌ You don't have enough money.\n\n💰 Your balance: **${user.money.toLocaleString("pt-BR")}**\n🎰 Your bet: **${bet.toLocaleString("pt-BR")}**`);
        }

        const result = roulette[Math.floor(Math.random() * roulette.length)];
        const rouletteColor = colors[result];

        const reward = bet * rouletteColor.multiplier;

        user.money -= bet;
        user.money += reward;

        await user.save();

        const embed = new EmbedBuilder()
            .setTitle("🎰 Roulette")
            .setDescription(
                `The roulette spun and landed on...\n\n` +
                `${rouletteColor.emoji} **${rouletteColor.name}**\n\n` +
                `🎲 Bet: **${bet.toLocaleString("pt-BR")}**\n` +
                `💰 Multiplier: **${rouletteColor.multiplier}x**\n` +
                `💵 Payout: **${reward.toLocaleString("pt-BR")}**\n\n` +
                `💳 Current Balance: **${user.money.toLocaleString("pt-BR")}**`
            )
            .setFooter({ text: 'Kwanzaa', iconURL: 'https://media.discordapp.net/attachments/1546382578024448081/1546382661868847184/dd7c2f60355612d2cb895f0b992325fc.jpg?ex=6aa18ed4&is=6aa03d54&hm=4b2a1ea3af68677e8b64b3e046c62c8ad202e2232a68a9a21f1533889fa3413f&=&format=webp&width=512&height=512' })
            .setTimestamp()
            .setColor("#ffffff");

        await message.reply({
            embeds: [embed]
        });
    }
};