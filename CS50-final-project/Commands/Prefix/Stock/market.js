const { EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const User = require("../../../models/User");
const Stock = require("../../../models/Stock");

const products = {
    pet_food: {
        name: "Default",
        price: 300,
        emoji: "🐶"
    },
    premium_pet_food: {
        name: "Premium",
        price: 750,
        emoji: "🌟"
    },
    gourmet_pet_food: {
        name: "Gourmet",
        price: 1500,
        emoji: "🥓"
    },
    chicken: {
        name: "Chicken",
        price: 2000,
        emoji: "🍗"
    },
    fillet: {
        name: "Fillet",
        price: 5000,
        emoji: "🥩"
    }
};

module.exports = {
    name: "market",

    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setTitle("🛒 Market")
            .setDescription("Select an item below to buy.\n\nEach purchase adds **1 unit** to your stock.")
            .setColor("#ffffff")
            .setAuthor({
                name: message.author.username,
                iconURL: message.author.displayAvatarURL({
                    dynamic: true
                })
            })
            .setFooter({ text: 'Kwanzaa', iconURL: 'https://media.discordapp.net/attachments/1546382578024448081/1546382661868847184/dd7c2f60355612d2cb895f0b992325fc.jpg?ex=6aa18ed4&is=6aa03d54&hm=4b2a1ea3af68677e8b64b3e046c62c8ad202e2232a68a9a21f1533889fa3413f&=&format=webp&width=512&height=512' })
            .setTimestamp();

        for (const product of Object.values(products)) {
            embed.addFields({
                name: `${product.emoji} ${product.name}`,
                value: `💰 ${product.price.toLocaleString("pt-BR")} coins`,
                inline: true
            });
        }

        const menu = new StringSelectMenuBuilder()
            .setCustomId(`market_${message.author.id}`)
            .setPlaceholder("Select an item to buy")
            .addOptions(
                Object.entries(products).map(([id, product]) =>
                    new StringSelectMenuOptionBuilder()
                        .setLabel(product.name)
                        .setDescription(`${product.price.toLocaleString("pt-BR")} coins`)
                        .setEmoji(product.emoji)
                        .setValue(id)
                )
            );

        const row = new ActionRowBuilder()
            .addComponents(menu);

        const marketMessage = await message.reply({
            embeds: [embed],
            components: [row]
        });

        const collector = marketMessage.createMessageComponentCollector({
            filter: interaction => interaction.customId === `market_${message.author.id}` && interaction.user.id === message.author.id,
            time: 60000
        });

        collector.on("collect", async interaction => {
            const productId = interaction.values[0];
            const product = products[productId];

            if (!product) {
                return interaction.reply({
                    content: "❌ This product does not exist.",
                    ephemeral: true
                });
            }

            try {
                const user = await User.findOne({
                    where: {
                        discord_id: interaction.user.id
                    }
                });

                const stock = await Stock.findOne({
                    where: {
                        discord_id: interaction.user.id
                    }
                });

                if (!user || !stock) {
                    return interaction.reply({
                        content: "❌ Your account was not found in the database.",
                        ephemeral: true
                    });
                }

                if (user.money < product.price) {
                    return interaction.reply({
                        content: `❌ You don't have enough money to buy **${product.name}**.\n\n💰 Your balance: **${user.money.toLocaleString("pt-BR")}**\n🏷️ Price: **${product.price.toLocaleString("pt-BR")}**`,
                        ephemeral: true
                    });
                }

                user.money -= product.price;
                stock[productId] += 1;

                await user.save();
                await stock.save();

                await interaction.reply({
                    content: `✅ You bought **1x ${product.emoji} ${product.name}** for **${product.price.toLocaleString("pt-BR")} coins**!\n\n💰 Remaining balance: **${user.money.toLocaleString("pt-BR")}**`,
                    ephemeral: true
                });
            } catch (error) {
                console.error("Error occurred while making purchase:", error);

                if (!interaction.replied) {
                    await interaction.reply({
                        content: "❌ An error occurred while making the purchase.",
                        ephemeral: true
                    });
                }
            }
        });

        collector.on("end", async () => {
            menu.setDisabled(true);

            try {
                await marketMessage.edit({
                    components: [row]
                });
            } catch (error) {
                console.error("Error occurred while disabling the market:", error);
            }
        });
    }
};