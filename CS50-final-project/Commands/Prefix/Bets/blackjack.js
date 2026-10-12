const {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle
} = require('discord.js');

const User = require("../../../models/User");

const games = new Map();

const suits = ["♠️", "♥️", "♦️", "♣️"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function formatMoney(value) {
    return Math.trunc(Number(value)).toLocaleString("pt-BR");
}

function createDeck() {
    const deck = [];

    for (const suit of suits) {
        for (const value of values) {
            deck.push({
                value,
                suit
            });
        }
    }

    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
}

function calculateHand(hand) {
    let total = 0;
    let aces = 0;

    for (const card of hand) {
        if (card.value === "A") {
            total += 11;
            aces++;
        } else if (["J", "Q", "K"].includes(card.value)) {
            total += 10;
        } else {
            total += Number(card.value);
        }
    }

    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }

    return total;
}

function formatHand(hand) {
    return hand
        .map(card => `\`${card.value}${card.suit}\``)
        .join(" ");
}

function createButtons(userId) {
    const hit = new ButtonBuilder()
        .setCustomId(`blackjack_hit_${userId}`)
        .setLabel("Hit")
        .setEmoji("🃏")
        .setStyle(ButtonStyle.Primary);

    const stand = new ButtonBuilder()
        .setCustomId(`blackjack_stand_${userId}`)
        .setLabel("Stand")
        .setEmoji("✋")
        .setStyle(ButtonStyle.Danger);

    return new ActionRowBuilder().addComponents(hit, stand);
}

function createGameEmbed(game, revealDealer = false) {
    const playerTotal = calculateHand(game.playerHand);

    const dealerCards = revealDealer
        ? formatHand(game.dealerHand)
        : `\`${game.dealerHand[0].value}${game.dealerHand[0].suit}\` ❓`;

    const dealerTotal = revealDealer
        ? calculateHand(game.dealerHand)
        : "?";

    return new EmbedBuilder()
        .setTitle("🃏 Blackjack")
        .setDescription(
            `## 👤 ${game.username}\n` +
            `${formatHand(game.playerHand)}\n` +
            `**Total: ${playerTotal}**\n\n` +
            `## 🏦 Banca\n` +
            `${dealerCards}\n` +
            `**Total: ${dealerTotal}**\n\n` +
            `💰 **Bet:** ${formatMoney(game.bet)}`
        )
        .setColor("#5865F2")
        .setFooter({ text: 'Kwanzaa', iconURL: 'https://media.discordapp.net/attachments/1546382578024448081/1546382661868847184/dd7c2f60355612d2cb895f0b992325fc.jpg?ex=6aa18ed4&is=6aa03d54&hm=4b2a1ea3af68677e8b64b3e046c62c8ad202e2232a68a9a21f1533889fa3413f&=&format=webp&width=512&height=512' })
        .setTimestamp();
}

async function finishGame(game, interaction, result) {
    const user = await User.findOne({
        where: {
            discord_id: game.userId
        }
    });

    if (!user) {
        games.delete(game.userId);

        return interaction.reply({
            content: "❌ User not found.",
            ephemeral: true
        });
    }

    let multiplier = 0;
    let title = "";
    let emoji = "";

    if (result === "blackjack") {
        multiplier = 2.5;
        title = "BLACKJACK!";
        emoji = "🃏";
    }

    if (result === "win") {
        multiplier = 2;
        title = "You won!";
        emoji = "🎉";
    }

    if (result === "push") {
        multiplier = 1;
        title = "Push!";
        emoji = "🤝";
    }

    if (result === "lose") {
        multiplier = 0;
        title = "You lost!";
        emoji = "💀";
    }

    const bet = Math.trunc(Number(game.bet));
    const reward = Math.trunc(bet * multiplier);

    const currentMoney = Math.trunc(Number(user.money));

    const newBalance = currentMoney + reward;

    user.money = Math.trunc(newBalance);

    await user.save();

    const finalBalance = Math.trunc(Number(user.money));

    games.delete(game.userId);

    const playerTotal = calculateHand(game.playerHand);
    const dealerTotal = calculateHand(game.dealerHand);

    const embed = new EmbedBuilder()
        .setTitle(`🃏 Blackjack | ${emoji} ${title}`)
        .setDescription(
            `## 👤 ${game.username}\n` +
            `${formatHand(game.playerHand)}\n` +
            `**Total: ${playerTotal}**\n\n` +
            `## 🏦 Banca\n` +
            `${formatHand(game.dealerHand)}\n` +
            `**Total: ${dealerTotal}**\n\n` +
            `💰 **Bet:** ${formatMoney(bet)}\n` +
            `💵 **Payout:** ${formatMoney(reward)}\n` +
            `💳 **Balance:** ${formatMoney(finalBalance)}`
        )
        .setFooter({ text: 'Kwanzaa', iconURL: 'https://media.discordapp.net/attachments/1546382578024448081/1546382661868847184/dd7c2f60355612d2cb895f0b992325fc.jpg?ex=6aa18ed4&is=6aa03d54&hm=4b2a1ea3af68677e8b64b3e046c62c8ad202e2232a68a9a21f1533889fa3413f&=&format=webp&width=512&height=512' })
        .setTimestamp()
        .setColor(result === "lose" ? "#ED4245" : "#57F287");

    await interaction.update({
        embeds: [embed],
        components: []
    });
}

async function dealerTurn(game) {
    while (calculateHand(game.dealerHand) < 17) {
        game.dealerHand.push(game.deck.pop());
    }
}

module.exports = {
    name: "blackjack",

    async execute(message, args) {
        const userId = message.author.id;

        if (games.has(userId)) {
            return message.reply(
                "❌ You already have a Blackjack game in progress."
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
                "Example: `!blackjack 100`"
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
                `🎰 **Bet:** ${formatMoney(bet)}`
            );
        }

        const newBalance = currentMoney - bet;

        user.money = Math.trunc(newBalance);

        await user.save();

        const deck = createDeck();

        const game = {
            userId,
            username: message.author.username,
            bet,
            deck,
            playerHand: [
                deck.pop(),
                deck.pop()
            ],
            dealerHand: [
                deck.pop(),
                deck.pop()
            ]
        };

        games.set(userId, game);

        const playerTotal = calculateHand(game.playerHand);
        const dealerTotal = calculateHand(game.dealerHand);

        if (playerTotal === 21 && dealerTotal === 21) {
            const embed = createGameEmbed(game, true);

            const sentMessage = await message.reply({
                embeds: [embed]
            });

            const fakeInteraction = {
                update: async data => {
                    await sentMessage.edit(data);
                }
            };

            return finishGame(game, fakeInteraction, "push");
        }

        if (playerTotal === 21) {
            const embed = createGameEmbed(game, true);

            const sentMessage = await message.reply({
                embeds: [embed]
            });

            const fakeInteraction = {
                update: async data => {
                    await sentMessage.edit(data);
                }
            };

            return finishGame(game, fakeInteraction, "blackjack");
        }

        if (dealerTotal === 21) {
            const embed = createGameEmbed(game, true);

            const sentMessage = await message.reply({
                embeds: [embed]
            });

            const fakeInteraction = {
                update: async data => {
                    await sentMessage.edit(data);
                }
            };

            return finishGame(game, fakeInteraction, "lose");
        }

        const embed = createGameEmbed(game);

        const sentMessage = await message.reply({
            embeds: [embed],
            components: [createButtons(userId)]
        });

        game.messageId = sentMessage.id;
    },

    async handleInteraction(interaction) {
        if (!interaction.isButton()) {
            return;
        }

        if (!interaction.customId.startsWith("blackjack_")) {
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

        if (action === "hit") {
            game.playerHand.push(game.deck.pop());

            const playerTotal = calculateHand(game.playerHand);

            if (playerTotal > 21) {
                return finishGame(game, interaction, "lose");
            }

            if (playerTotal === 21) {
                await dealerTurn(game);

                const dealerTotal = calculateHand(game.dealerHand);

                if (
                    dealerTotal > 21 ||
                    playerTotal > dealerTotal
                ) {
                    return finishGame(game, interaction, "win");
                }

                if (playerTotal === dealerTotal) {
                    return finishGame(game, interaction, "push");
                }

                return finishGame(game, interaction, "lose");
            }

            return interaction.update({
                embeds: [createGameEmbed(game)],
                components: [createButtons(userId)]
            });
        }

        if (action === "stand") {
            await dealerTurn(game);

            const playerTotal = calculateHand(game.playerHand);
            const dealerTotal = calculateHand(game.dealerHand);

            if (dealerTotal > 21) {
                return finishGame(game, interaction, "win");
            }

            if (playerTotal > dealerTotal) {
                return finishGame(game, interaction, "win");
            }

            if (playerTotal === dealerTotal) {
                return finishGame(game, interaction, "push");
            }

            return finishGame(game, interaction, "lose");
        }
    }
};