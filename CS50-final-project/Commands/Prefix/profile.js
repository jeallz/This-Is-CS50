const { EmbedBuilder } = require('discord.js');
const Users = require("../../models/User");
const Pets = require("../../models/Pet");

module.exports = {
    name: 'profile',

    async execute(message, args) {
        const member = message.mentions.users.first() || message.author;

        const user = await Users.findOne({
            where: {
                discord_id: member.id
            }
        });

        if (!user) {
            return message.reply("❌ Your account was not found.");
        }

        const pet = await Pets.findOne({
            where: {
                discord_id: member.id
            }
        });

        let petText = "🐾 No pet found.";

        if (pet) {
            if (pet.species === "Dog") {
                petText = `🐶 ${pet.name}`;

            } else if (pet.species === "Cat") {
                petText = `🐱 ${pet.name}`;

            } else if (pet.species === "Snake") {
                petText = `🐍 ${pet.name}`;

            } else {
                petText = "🐾 No pet found.";
            }
        }

        // Informações da conta
        const wallet = Number(user.money);
        const bank = Number(user.bank);
        const balance = wallet + bank;

        const level = user.level;
        const xp = user.xp;
        const job = user.job || "Unemployed";

        // Criação do Embed
        const embed = new EmbedBuilder()
            .setTitle(`${member.username} Profile`)

            .setThumbnail(
                member.displayAvatarURL({
                    dynamic: true
                })
            )

            .setDescription(
                `## 🤵🏻 *${job}*\n\n`
            )

            .addFields(
                {
                    name: "📊 Level",
                    value: `${level}`,
                    inline: true
                },
                {
                    name: "✨ XP",
                    value: `${xp}`,
                    inline: true
                },
                {
                    name: "💰 Balance",
                    value: `$${balance.toFixed(2)}`,
                    inline: true
                }, 
                {
                    name: "🐾 Pet",
                    value: `${petText}`,
                    inline: true
                }
            )

            .setColor("#ffffff")

            .setAuthor({
                name: member.username,
                iconURL: member.displayAvatarURL({
                    dynamic: true
                })
            })

            .setFooter({
                text: 'Kwanzaa',
                iconURL: 'https://media.discordapp.net/attachments/1546382578024448081/1546382661868847184/dd7c2f60355612d2cb895f0b992325fc.jpg?ex=6aa18ed4&is=6aa03d54&hm=4b2a1ea3af68677e8b64b3e046c62c8ad202e2232a68a9a21f1533889fa3413f&=&format=webp&width=512&height=512'
            })

            .setTimestamp();

        await message.reply({
            embeds: [embed]
        });
    }
};