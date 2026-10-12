const { EmbedBuilder } = require('discord.js');
const Stock = require("../../../models/Stock");

module.exports = {
    name: 'stock',

    async execute(message, args) {
        const member = message.mentions.users.first() || message.author

        const stock = await Stock.findOne({
            where: {
                discord_id: member.id
            }
        })

        if (!stock) {
            return message.reply("❌ Your account was not found.");
        }

        const pet_food = stock.pet_food;
        const premium = stock.premium_pet_food;
        const gorumet = stock.gourmet_pet_food;
        const chicken = stock.chicken;
        const fillet = stock.fillet;

        const embed = new EmbedBuilder()
            .setTitle(`${member.username} Stock`)
            .setThumbnail(`${member.displayAvatarURL({
                dynamic: true
            })}`)
            .setDescription(
                "## Pet Food Stock"
            )
            .addFields(
                {
                    name: "Default 🐶",
                    value: `${pet_food}`,
                    inline: true,
                },{
                    name: "Premium ⭐️",
                    value: `${premium}`,
                    inline: true,
                },{
                    name: "Gourmet 👑",
                    value: `${gorumet}`,
                    inline: true,
                },{
                    name: "Chicken 🍗",
                    value: `${chicken}`,
                    inline: true,
                },{
                    name: "Fillet 🥩",
                    value: `${fillet}`,
                    inline: true,
                },
            )
            .setColor("#ffffff")
            .setAuthor({
                name: member.username,
                iconURL: member.displayAvatarURL({
                    dynamic: true,
                }),
            })
            .setFooter({ text: 'Kwanzaa', iconURL: 'https://media.discordapp.net/attachments/1546382578024448081/1546382661868847184/dd7c2f60355612d2cb895f0b992325fc.jpg?ex=6aa18ed4&is=6aa03d54&hm=4b2a1ea3af68677e8b64b3e046c62c8ad202e2232a68a9a21f1533889fa3413f&=&format=webp&width=512&height=512' })
            .setTimestamp()

        await message.reply({
            embeds: [embed]
        })
    }
};