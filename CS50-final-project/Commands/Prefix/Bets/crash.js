const {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle
} = require('discord.js');

const User = require("../../../models/User");

const games = new Map();

function generateCrashPoint() {
    const random = Math.random();

    if (random < 0.03) {
        return 1.00;
    }

    const crash = 0.99 / (1 - random);

    return Math.max(1.00, Math.floor(crash * 100) / 100);
}

function formatMoney(value) {
    return Math.trunc(Number(value)).toLocaleString("pt-BR");
}

function createButton(userId) {
    const button = new ButtonBuilder()
        .setCustomId(`crash_cashout_${userId}`)
        .setLabel("Withdraw")
        .setEmoji("💰")
        .setStyle(ButtonStyle.Success);

    return new ActionRowBuilder().addComponents(button);
}

function createEmbed(game) {
    const withdrawalValue = Math.floor(game.bet * game.multiplier);

    return new EmbedBuilder()
        .setTitle("🚀 Crash")
        .setDescription(
            `## 🚀 Multiplier\n\n` +
            `# **${game.multiplier.toFixed(2)}x**\n\n` +
            `💰 **Bet:** ${formatMoney(game.bet)}\n` +
            `💵 **Withdrawal Value:** ${formatMoney(withdrawalValue)}\n\n` +
            `🔥 The multiplier is rising!\n` +
            `💰 Click **Withdraw** before the crash.`
        )
        .setFooter({ text: 'Kwanzaa', iconURL: 'https://media.discordapp.net/attachments/1546382578024448081/1546382661868847184/dd7c2f60355612d2cb895f0b992325fc.jpg?ex=6aa18ed4&is=6aa03d54&hm=4b2a1ea3af68677e8b64b3e046c62c8ad202e2232a68a9a21f1533889fa3413f&=&format=webp&width=512&height=512' })
        .setTimestamp()
        .setColor("#57F287");
}

function createCrashEmbed(game) {
    return new EmbedBuilder()
        .setTitle("🚀 Crash")
        .setDescription(
            `## 💥 CRASH!\n\n` +
            `# **${game.crashPoint.toFixed(2)}x**\n\n` +
            `💰 **Bet:** ${formatMoney(game.bet)}\n` +
            `💵 **Payout:** 0\n\n` +
            `💀 You didn't withdraw in time.`
        )
        .setFooter({ text: 'Kwanzaa', iconURL: 'https://media.discordapp.net/attachments/1546382578024448081/1546382661868847184/dd7c2f60355612d2cb895f0b992325fc.jpg?ex=6aa18ed4&is=6aa03d54&hm=4b2a1ea3af68677e8b64b3e046c62c8ad202e2232a68a9a21f1533889fa3413f&=&format=webp&width=512&height=512' })
        .setTimestamp()
        .setColor("#ED4245");
}

module.exports = {
    name: "crash",

    async execute(message, args) {
        const userId = message.author.id;

        if (games.has(userId)) {
            return message.reply(
                "❌ You already have a Crash game in progress."
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
                "Example: `!crash 500`"
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
                `🚀 **Bet:** ${formatMoney(bet)}`
            );
        }

        const newBalance = currentMoney - bet;

        user.money = newBalance;

        await user.save();

        const game = {
            userId,
            username: message.author.username,
            bet,
            multiplier: 1.00,
            crashPoint: generateCrashPoint(),
            message: null,
            interval: null
        };

        games.set(userId, game);

        const sentMessage = await message.reply({
            embeds: [createEmbed(game)],
            components: [createButton(userId)]
        });

        game.message = sentMessage;

        game.interval = setInterval(async () => {
            if (!games.has(userId)) {
                clearInterval(game.interval);
                return;
            }

            game.multiplier += 0.05;

            game.multiplier = Math.round(
                game.multiplier * 100
            ) / 100;

            if (game.multiplier >= game.crashPoint) {
                game.multiplier = game.crashPoint;

                clearInterval(game.interval);

                games.delete(userId);

                await game.message.edit({
                    embeds: [createCrashEmbed(game)],
                    components: []
                }).catch(() => {});

                return;
            }

            await game.message.edit({
                embeds: [createEmbed(game)],
                components: [createButton(userId)]
            }).catch(() => {});

        }, 500);
    },

    async handleInteraction(interaction) {
        if (!interaction.isButton()) {
            return;
        }

        if (!interaction.customId.startsWith("crash_")) {
            return;
        }

        const parts = interaction.customId.split("_");

        const action = parts[1];
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

        if (action !== "cashout") {
            return;
        }

        clearInterval(game.interval);

        games.delete(userId);

        const user = await User.findOne({
            where: {
                discord_id: userId
            }
        });

        if (!user) {
            return interaction.reply({
                content: "❌ User not found.",
                ephemeral: true
            });
        }

        const currentMoney = Math.trunc(Number(user.money));

        const reward = Math.floor(
            Number(game.bet) * Number(game.multiplier)
        );

        const newBalance = currentMoney + reward;

        const profit = reward - Number(game.bet);

        user.money = Math.trunc(newBalance);

        await user.save();

        const finalBalance = Math.trunc(Number(user.money));

        const embed = new EmbedBuilder()
            .setTitle("🚀 Crash | 💰 Withdrawal Completed!")
            .setDescription(
                `## ${game.username}\n\n` +
                `🚀 **Multiplier:** ${game.multiplier.toFixed(2)}x\n\n` +
                `💰 **Bet:** ${formatMoney(game.bet)}\n` +
                `💵 **Payout:** ${formatMoney(reward)}\n` +
                `📈 **Profit:** ${formatMoney(profit)}\n` +
                `💳 **Balance:** ${formatMoney(finalBalance)}`
            )
            .setFooter({ text: 'Kwanzaa', iconURL: 'https://media.discordapp.net/attachments/1546382578024448081/1546382661868847184/dd7c2f60355612d2cb895f0b992325fc.jpg?ex=6aa18ed4&is=6aa03d54&hm=4b2a1ea3af68677e8b64b3e046c62c8ad202e2232a68a9a21f1533889fa3413f&=&format=webp&width=512&height=512' })
            .setTimestamp()
            .setColor("#57F287");

        await interaction.update({
            embeds: [embed],
            components: []
        });
    }
};