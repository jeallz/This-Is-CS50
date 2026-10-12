const { EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const Pet = require("../../../models/Pet");
const Stock = require("../../../models/Stock");

const foods = {
    pet_food: {
        name: "Pet Food",
        emoji: "🥩"
    },
    premium_pet_food: {
        name: "Premium Pet Food",
        emoji: "🍖"
    },
    gourmet_pet_food: {
        name: "Gourmet Pet Food",
        emoji: "🥓"
    },
    chicken: {
        name: "Chicken",
        emoji: "🍗"
    },
    fillet: {
        name: "Fillet",
        emoji: "🥩"
    }
};

const species = {
    Dog: {
        name: "Dog",
        emoji: "🐶"
    },
    Cat: {
        name: "Cat",
        emoji: "🐱"
    },
    Snake: {
        name: "Snake",
        emoji: "🐍"
    }
};

function getLevel(xp) {
    return Math.floor(xp / 1000) + 1;
}

function getPetEmbed(pet) {
    const petSpecies = species[pet.species];

    return new EmbedBuilder()
        .setTitle(`${petSpecies.emoji} ${pet.name}`)
        .setDescription(
            `${petSpecies.emoji} **Species:** ${petSpecies.name}\n` +
            `⭐ **Level:** ${pet.level}\n` +
            `✨ **XP:** ${pet.xp}/${(pet.level) * 1000}\n` +
            `❤️ **Happiness:** ${pet.happiness}/100`
        )
        .setColor("#ffffff")
        .setFooter({ text: 'Kwanzaa', iconURL: 'https://media.discordapp.net/attachments/1546382578024448081/1546382661868847184/dd7c2f60355612d2cb895f0b992325fc.jpg?ex=6aa18ed4&is=6aa03d54&hm=4b2a1ea3af68677e8b64b3e046c62c8ad202e2232a68a9a21f1533889fa3413f&=&format=webp&width=512&height=512' })
        .setTimestamp()
}

module.exports = {
    name: "pet",

    async execute(message, args) {
        const discordId = message.author.id;

        let pet = await Pet.findOne({
            where: {
                discord_id: discordId
            }
        });

        if (!pet) {
            let selectedSpecies = null;

            const embed = new EmbedBuilder()
                .setTitle("🐾 Pet Creation")
                .setDescription("Choose a species for your pet.")
                .setColor("#ffffff");

            const menu = new StringSelectMenuBuilder()
                .setCustomId(`pet_species_${discordId}`)
                .setPlaceholder("Choose a species")
                .addOptions(
                    Object.entries(species).map(([id, data]) =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(data.name)
                            .setEmoji(data.emoji)
                            .setValue(id)
                    )
                );

            const row = new ActionRowBuilder()
                .addComponents(menu);

            const petMessage = await message.reply({
                embeds: [embed],
                components: [row]
            });

            const collector = petMessage.createMessageComponentCollector({
                filter: interaction => interaction.user.id === discordId,
                time: 120000
            });

            collector.on("collect", async interaction => {
                if (interaction.isStringSelectMenu()) {
                    selectedSpecies = interaction.values[0];

                    const selected = species[selectedSpecies];

                    const updatedEmbed = new EmbedBuilder()
                        .setTitle("🐾 Pet Creation")
                        .setDescription(
                            `Species chosen: ${selected.emoji} **${selected.name}**\n\n` +
                            `Now define the name of your pet.`
                        )
                        .setColor("#ffffff");

                    const nameButton = new ButtonBuilder()
                        .setCustomId(`pet_name_${discordId}`)
                        .setLabel("Define Name")
                        .setEmoji("✏️")
                        .setStyle(ButtonStyle.Primary);

                    const buttonRow = new ActionRowBuilder()
                        .addComponents(nameButton);

                    await interaction.update({
                        embeds: [updatedEmbed],
                        components: [buttonRow]
                    });
                }

                if (interaction.isButton()) {
                    if (!selectedSpecies) {
                        return interaction.reply({
                            content: "❌ Choose a species first.",
                            ephemeral: true
                        });
                    }

                    const modal = new ModalBuilder()
                        .setCustomId(`pet_name_modal_${discordId}`)
                        .setTitle("Pet Name");

                    const nameInput = new TextInputBuilder()
                        .setCustomId("pet_name")
                        .setLabel("Your Pet's Name")
                        .setPlaceholder("Enter your pet's name")
                        .setStyle(TextInputStyle.Short)
                        .setMinLength(1)
                        .setMaxLength(30)
                        .setRequired(true);

                    const modalRow = new ActionRowBuilder()
                        .addComponents(nameInput);

                    modal.addComponents(modalRow);

                    await interaction.showModal(modal);

                    try {
                        const modalInteraction = await interaction.awaitModalSubmit({
                            filter: modal => modal.user.id === discordId && modal.customId === `pet_name_modal_${discordId}`,
                            time: 120000
                        });

                        const petName = modalInteraction.fields.getTextInputValue("pet_name").trim();

                        const existingPet = await Pet.findOne({
                            where: {
                                discord_id: discordId
                            }
                        });

                        if (existingPet) {
                            return modalInteraction.reply({
                                content: "❌ you already have a pet. You cannot create another one.",
                                ephemeral: true
                            });
                        }

                        pet = await Pet.create({
                            discord_id: discordId,
                            name: petName,
                            species: selectedSpecies,
                            xp: 0,
                            level: 1,
                            happiness: 0,
                            hunger: new Date()
                        });

                        const petSpecies = species[selectedSpecies];

                        const createdEmbed = new EmbedBuilder()
                            .setTitle(`${petSpecies.emoji} Pet Created!`)
                            .setDescription(
                                `Your pet has been created successfully!\n\n` +
                                `${petSpecies.emoji} **Name:** ${pet.name}\n` +
                                `🐾 **Species:** ${petSpecies.name}\n` +
                                `⭐ **Level:** 1\n` +
                                `✨ **XP:** 0/1000\n` +
                                `❤️ **Happiness:** 0/100`
                            )
                            .setFooter({ text: 'Kwanzaa', iconURL: 'https://media.discordapp.net/attachments/1546382578024448081/1546382661868847184/dd7c2f60355612d2cb895f0b992325fc.jpg?ex=6aa18ed4&is=6aa03d54&hm=4b2a1ea3af68677e8b64b3e046c62c8ad202e2232a68a9a21f1533889fa3413f&=&format=webp&width=512&height=512' })
                            .setTimestamp()
                            .setColor("#ffffff");

                        await modalInteraction.update({
                            embeds: [createdEmbed],
                            components: []
                        });

                        collector.stop();
                    } catch (error) {
                        console.error("Error creating pet:", error);
                    }
                }
            });

            collector.on("end", async () => {
                try {
                    const disabledMenu = StringSelectMenuBuilder.from(menu).setDisabled(true);

                    await petMessage.edit({
                        components: [
                            new ActionRowBuilder().addComponents(disabledMenu)
                        ]
                    });
                } catch (error) {
                }
            });

            return;
        }

        const embed = getPetEmbed(pet);

        const feedButton = new ButtonBuilder()
            .setCustomId(`pet_feed_${discordId}`)
            .setLabel("Feed")
            .setEmoji("🍖")
            .setStyle(ButtonStyle.Success);

        const playButton = new ButtonBuilder()
            .setCustomId(`pet_play_${discordId}`)
            .setLabel("Play")
            .setEmoji("🎾")
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
            .addComponents(feedButton, playButton);

        const petMessage = await message.reply({
            embeds: [embed],
            components: [row]
        });

        const collector = petMessage.createMessageComponentCollector({
            filter: interaction => interaction.user.id === discordId,
            time: 120000
        });

        collector.on("collect", async interaction => {
            if (interaction.customId === `pet_play_${discordId}`) {
                if (pet.happiness >= 100) {
                    return interaction.reply({
                        content: "❤️ Your pet is completely happy and doesn't need to play right now.",
                        ephemeral: true
                    });
                }

                const ballButton = new ButtonBuilder()
                    .setCustomId(`pet_action_ball_${discordId}`)
                    .setLabel("Ball")
                    .setEmoji("⚾")
                    .setStyle(ButtonStyle.Primary);

                const affectionButton = new ButtonBuilder()
                    .setCustomId(`pet_action_affection_${discordId}`)
                    .setLabel("Affection")
                    .setEmoji("❤️")
                    .setStyle(ButtonStyle.Danger);

                const walkButton = new ButtonBuilder()
                    .setCustomId(`pet_action_walk_${discordId}`)
                    .setLabel("Walk")
                    .setEmoji("🚶")
                    .setStyle(ButtonStyle.Success);

                const backButton = new ButtonBuilder()
                    .setCustomId(`pet_back_${discordId}`)
                    .setLabel("Back")
                    .setEmoji("↩️")
                    .setStyle(ButtonStyle.Secondary);

                const playRow = new ActionRowBuilder()
                    .addComponents(ballButton, affectionButton, walkButton, backButton);

                const playEmbed = getPetEmbed(pet)
                    .setDescription(
                        `🎾 Choose an activity to do with **${pet.name}**.\n\n` +
                        `Each activity grants **+100 XP** and **+10 happiness**.\n\n` +
                        `❤️ Current happiness: **${pet.happiness}/100**`
                    )
                    .setFooter({ text: 'Kwanzaa', iconURL: 'https://media.discordapp.net/attachments/1546382578024448081/1546382661868847184/dd7c2f60355612d2cb895f0b992325fc.jpg?ex=6aa18ed4&is=6aa03d54&hm=4b2a1ea3af68677e8b64b3e046c62c8ad202e2232a68a9a21f1533889fa3413f&=&format=webp&width=512&height=512' })
                    .setTimestamp();

                await interaction.update({
                    embeds: [playEmbed],
                    components: [playRow]
                });

                return;
            }

            if (interaction.customId === `pet_feed_${discordId}`) {
                const lastFeed = new Date(pet.hunger);
                const now = new Date();
                const elapsed = now.getTime() - lastFeed.getTime();
                const oneHour = 60 * 60 * 1000;

                if (elapsed < oneHour) {
                    const remaining = oneHour - elapsed;
                    const minutes = Math.ceil(remaining / 60000);

                    return interaction.reply({
                        content: `🍖 Your pet has already been fed. You can feed it again in approximately **${minutes} minutes**.`,
                        ephemeral: true
                    });
                }

                const foodMenu = new StringSelectMenuBuilder()
                    .setCustomId(`pet_food_${discordId}`)
                    .setPlaceholder("Choose a food for your pet");

                for (const [id, food] of Object.entries(foods)) {
                    foodMenu.addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel(food.name)
                            .setEmoji(food.emoji)
                            .setValue(id)
                    );
                }

                const foodRow = new ActionRowBuilder()
                    .addComponents(foodMenu);

                const backButton = new ButtonBuilder()
                    .setCustomId(`pet_back_${discordId}`)
                    .setLabel("Back")
                    .setEmoji("↩️")
                    .setStyle(ButtonStyle.Secondary);

                const backRow = new ActionRowBuilder()
                    .addComponents(backButton);

                const foodEmbed = getPetEmbed(pet)
                    .setDescription(
                        `🍖 Choose a food for **${pet.name}**.\n\n` +
                        `Each feeding grants **+200 XP**.\n` +
                        `⏱️ Your pet can be fed once every **1 hour**.`
                    )
                    .setFooter({ text: 'Kwanzaa', iconURL: 'https://media.discordapp.net/attachments/1546382578024448081/1546382661868847184/dd7c2f60355612d2cb895f0b992325fc.jpg?ex=6aa18ed4&is=6aa03d54&hm=4b2a1ea3af68677e8b64b3e046c62c8ad202e2232a68a9a21f1533889fa3413f&=&format=webp&width=512&height=512' })
                    .setTimestamp()

                await interaction.update({
                    embeds: [foodEmbed],
                    components: [foodRow, backRow]
                });

                return;
            }

            if (interaction.customId === `pet_back_${discordId}`) {
                const updatedPet = await Pet.findOne({
                    where: {
                        discord_id: discordId
                    }
                });

                const updatedEmbed = getPetEmbed(updatedPet);

                const feedButton = new ButtonBuilder()
                    .setCustomId(`pet_feed_${discordId}`)
                    .setLabel("Feed")
                    .setEmoji("🍖")
                    .setStyle(ButtonStyle.Success);

                const playButton = new ButtonBuilder()
                    .setCustomId(`pet_play_${discordId}`)
                    .setLabel("Play")
                    .setEmoji("🎾")
                    .setStyle(ButtonStyle.Primary);

                const mainRow = new ActionRowBuilder()
                    .addComponents(feedButton, playButton);

                await interaction.update({
                    embeds: [updatedEmbed],
                    components: [mainRow]
                });

                return;
            }

            if (interaction.isStringSelectMenu() && interaction.customId === `pet_food_${discordId}`) {
                const foodId = interaction.values[0];
                const food = foods[foodId];

                if (!food) {
                    return interaction.reply({
                        content: "❌ Invalid food.",
                        ephemeral: true
                    });
                }

                const transaction = await Pet.sequelize.transaction();

                try {
                    const currentPet = await Pet.findOne({
                        where: {
                            discord_id: discordId
                        },
                        transaction,
                        lock: transaction.LOCK.UPDATE
                    });

                    const stock = await Stock.findOne({
                        where: {
                            discord_id: discordId
                        },
                        transaction,
                        lock: transaction.LOCK.UPDATE
                    });

                    if (!currentPet || !stock) {
                        await transaction.rollback();

                        return interaction.reply({
                            content: "❌ Could not find your pet or inventory.",
                            ephemeral: true
                        });
                    }

                    const lastFeed = new Date(currentPet.hunger);
                    const now = new Date();
                    const elapsed = now.getTime() - lastFeed.getTime();
                    const oneHour = 60 * 60 * 1000;

                    if (elapsed < oneHour) {
                        await transaction.rollback();

                        const remaining = oneHour - elapsed;
                        const minutes = Math.ceil(remaining / 60000);

                        return interaction.reply({
                            content: `🍖 Your pet has already been fed. You can feed it again in approximately **${minutes} minutes**.`,
                            ephemeral: true
                        });
                    }

                    if (stock[foodId] <= 0) {
                        await transaction.rollback();

                        return interaction.reply({
                            content: `❌ You don't have **${food.emoji} ${food.name}** in your inventory.`,
                            ephemeral: true
                        });
                    }

                    stock[foodId] -= 1;
                    currentPet.xp += 200;
                    currentPet.level = getLevel(currentPet.xp);
                    currentPet.hunger = now;

                    await stock.save({ transaction });
                    await currentPet.save({ transaction });

                    await transaction.commit();

                    pet = currentPet;

                    await interaction.update({
                        embeds: [
                            getPetEmbed(pet).setDescription(
                                `🍖 **${pet.name}** comeu ${food.emoji} **${food.name}**!\n\n` +
                                `✨ **+200 XP**\n` +
                                `⭐ **Level:** ${pet.level}\n` +
                                `❤️ **Happiness:** ${pet.happiness}/100`
                            )
                            .setFooter({ text: 'Kwanzaa', iconURL: 'https://media.discordapp.net/attachments/1546382578024448081/1546382661868847184/dd7c2f60355612d2cb895f0b992325fc.jpg?ex=6aa18ed4&is=6aa03d54&hm=4b2a1ea3af68677e8b64b3e046c62c8ad202e2232a68a9a21f1533889fa3413f&=&format=webp&width=512&height=512' })
                            .setTimestamp()
                        ],
                        components: []
                    });
                } catch (error) {
                    await transaction.rollback();
                    console.error("Error feeding pet:", error);

                    if (!interaction.replied) {
                        await interaction.reply({
                            content: "❌ An error occurred while feeding your pet.",
                            ephemeral: true
                        });
                    }
                }

                return;
            }

            if (
                interaction.customId === `pet_action_ball_${discordId}` ||
                interaction.customId === `pet_action_affection_${discordId}` ||
                interaction.customId === `pet_action_walk_${discordId}`
            ) {
                const transaction = await Pet.sequelize.transaction();

                try {
                    const currentPet = await Pet.findOne({
                        where: {
                            discord_id: discordId
                        },
                        transaction,
                        lock: transaction.LOCK.UPDATE
                    });

                    if (!currentPet) {
                        await transaction.rollback();

                        return interaction.reply({
                            content: "❌ Your pet was not found.",
                            ephemeral: true
                        });
                    }

                    if (currentPet.happiness >= 100) {
                        await transaction.rollback();

                        return interaction.reply({
                            content: "❤️ Your pet is already at maximum happiness.",
                            ephemeral: true
                        });
                    }

                    currentPet.happiness = Math.min(currentPet.happiness + 10, 100);
                    currentPet.xp += 100;
                    currentPet.level = getLevel(currentPet.xp);

                    await currentPet.save({ transaction });
                    await transaction.commit();

                    pet = currentPet;

                    let activity;

                    if (interaction.customId === `pet_action_ball_${discordId}`) {
                        activity = "⚾ played with a ball";
                    } else if (interaction.customId === `pet_action_affection_${discordId}`) {
                        activity = "❤️ received affection";
                    } else {
                        activity = "🚶 went for a walk";
                    }

                    await interaction.update({
                        embeds: [
                            getPetEmbed(pet).setDescription(
                                `🐾 **${pet.name}** ${activity}!\n\n` +
                                `✨ **+100 XP**\n` +
                                `❤️ **+10 Happiness**\n\n` +
                                `⭐ **Level:** ${pet.level}\n` +
                                `❤️ **Happiness:** ${pet.happiness}/100`
                            )
                            .setFooter({ text: 'Kwanzaa', iconURL: 'https://media.discordapp.net/attachments/1546382578024448081/1546382661868847184/dd7c2f60355612d2cb895f0b992325fc.jpg?ex=6aa18ed4&is=6aa03d54&hm=4b2a1ea3af68677e8b64b3e046c62c8ad202e2232a68a9a21f1533889fa3413f&=&format=webp&width=512&height=512' })
                            .setTimestamp()
                        ],
                        components: []
                    });
                } catch (error) {
                    await transaction.rollback();
                    console.error("Error playing with pet:", error);

                    if (!interaction.replied) {
                        await interaction.reply({
                            content: "❌ An error occurred while playing with your pet.",
                            ephemeral: true
                        });
                    }
                }
            }
        });
    }
};