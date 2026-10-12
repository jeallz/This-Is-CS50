const {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle
} = require('discord.js');

const User = require("../../../models/User");

const games = new Map();

function formatMoney(value) {
    return Math.trunc(Number(value)).toLocaleString("pt-BR");
}

function createButtons(userId) {
    const heads = new ButtonBuilder()
        .setCustomId(`coinflip_heads_${userId}`)
        .setLabel("Heads")
        .setEmoji("👤")
        .setStyle(ButtonStyle.Primary);

    const tails = new ButtonBuilder()
        .setCustomId(`coinflip_tails_${userId}`)
        .setLabel("Tails")
        .setEmoji("🪙")
        .setStyle(ButtonStyle.Secondary);

    return new ActionRowBuilder().addComponents(heads, tails);
}

module.exports = {
    name: "coinflip",

    async execute(message, args) {
        const userId = message.author.id;

        if (games.has(userId)) {
            return message.reply(
                "❌ You already have a Coinflip game in progress."
            );
        }

        const bet = Number(args[0]);

        if (
            !args[0] ||
            !Number.isInteger(bet) ||
            bet <= 0
        ) {
            return message.reply(
                "❌ Please provide a valid bet amount.\n\n" +
                "Example: `!coinflip 500`"
            );
        }

        const user = await User.findOne({
            where: {
                discord_id: userId
            }
        });

        if (!user) {
            return message.reply("❌ User not found.");
        }

        const currentMoney = Math.trunc(Number(user.money));

        if (currentMoney < bet) {
            return message.reply(
                `❌ You don't have enough money.\n\n` +
                `💰 **Balance:** ${formatMoney(currentMoney)}\n` +
                `🪙 **Bet:** ${formatMoney(bet)}`
            );
        }

        const newBalance = currentMoney - bet;

        user.money = Math.trunc(newBalance);

        await user.save();

        games.set(userId, {
            userId,
            username: message.author.username,
            bet,
            messageId: null
        });

        const payout = bet * 2;

        const embed = new EmbedBuilder()
            .setTitle("🪙 Heads or Tails")
            .setDescription(
                `## ${message.author.username}\n\n` +
                `Choose the coin flip result:\n\n` +
                `👤 **Heads**\n` +
                `🪙 **Tails**\n\n` +
                `💰 **Bet:** ${formatMoney(bet)}\n` +
                `💵 **Payout:** ${formatMoney(payout)}`
            )
            .setColor("#5865F2")
            .setFooter({ text: 'Kwanzaa', iconURL: 'https://media.discordapp.net/attachments/1546382578024448081/1546382661868847184/dd7c2f60355612d2cb895f0b992325fc.jpg?ex=6aa18ed4&is=6aa03d54&hm=4b2a1ea3af68677e8b64b3e046c62c8ad202e2232a68a9a21f1533889fa3413f&=&format=webp&width=512&height=512' })
            .setTimestamp();

        const sentMessage = await message.reply({
            embeds: [embed],
            components: [createButtons(userId)]
        });

        const game = games.get(userId);

        if (game) {
            game.messageId = sentMessage.id;
        }
    },

    async handleInteraction(interaction) {
        if (!interaction.isButton()) {
            return;
        }

        if (!interaction.customId.startsWith("coinflip_")) {
            return;
        }

        const parts = interaction.customId.split("_");

        const choice = parts[1];
        const userId = parts[2];

        if (interaction.user.id !== userId) {
            return interaction.reply({
                content: "❌ This game doesn't belong to you.",
                ephemeral: true
            });
        }

        const game = games.get(userId);

        if (!game) {
            return interaction.reply({
                content: "❌ This game has already ended.",
                ephemeral: true
            });
        }

        const result = Math.random() < 0.5
            ? "heads"
            : "tails";

        const won = choice === result;

        const user = await User.findOne({
            where: {
                discord_id: userId
            }
        });

        if (!user) {
            games.delete(userId);

            return interaction.reply({
                content: "❌ User not found.",
                ephemeral: true
            });
        }

        const currentMoney = Math.trunc(Number(user.money));

        const reward = won
            ? Math.trunc(Number(game.bet) * 2)
            : 0;

        const newBalance = currentMoney + reward;

        user.money = Math.trunc(newBalance);

        await user.save();

        games.delete(userId);

        const finalBalance = Math.trunc(Number(user.money));

        const resultName = result === "heads"
            ? "Heads"
            : "Tails";

        const resultEmoji = result === "heads"
            ? "👤"
            : "🪙";

        const choiceName = choice === "heads"
            ? "Heads"
            : "Tails";

        const embed = new EmbedBuilder()
            .setTitle("🪙 Heads or Tails")
            .setDescription(
                `## ${resultEmoji} **${resultName}**\n\n` +
                `🎯 **Your choice:** ${choiceName}\n` +
                `🪙 **Result:** ${resultName}\n\n` +
                `${won
                    ? "🎉 **You got it right!**"
                    : "💀 **You got it wrong!**"
                }\n\n` +
                `💰 **Bet:** ${formatMoney(game.bet)}\n` +
                `💵 **Payout:** ${formatMoney(reward)}\n` +
                `💳 **Balance:** ${formatMoney(finalBalance)}`
            )
            .setFooter({ text: 'Kwanzaa', iconURL: 'https://media.discordapp.net/attachments/1546382578024448081/1546382661868847184/dd7c2f60355612d2cb895f0b992325fc.jpg?ex=6aa18ed4&is=6aa03d54&hm=4b2a1ea3af68677e8b64b3e046c62c8ad202e2232a68a9a21f1533889fa3413f&=&format=webp&width=512&height=512' })
            .setTimestamp()
            .setColor(won ? "#57F287" : "#ED4245");

        await interaction.update({
            embeds: [embed],
            components: []
        });
    }
};