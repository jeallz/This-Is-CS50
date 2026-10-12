const { EmbedBuilder } = require('discord.js');
const Users = require("../../models/User");

module.exports = {
    name: 'daily',

    async execute(message, args) {
        const member = message.author;

        const user = await Users.findOne({
            where: {
                discord_id: member.id
            }
        });

        if (!user) {
            return message.reply("❌ Your account was not found.");
        }

        const now = new Date();

        if (user.last_daily) {
            const lastDaily = new Date(user.last_daily);

            const diference = now - lastDaily;
            const hour = 24 * 60 * 60 * 1000;

            if (diference < hour) {
                const restante = hour - diference;

                const horas = Math.floor(restante / (1000 * 60 * 60));
                const minutes = Math.floor( (restante % (1000 * 60 * 60) / (1000 * 60)) )

                return message.reply (
                    `❌ You have already claimed your daily reward. You can claim it again in ${horas}h ${minutes}min`
                )
            }
        }

        const recompensa = Math.floor(Math.random() * 4001) + 1000;

        await user.increment("money", {
            by: recompensa
        })

        await user.update({
            last_daily: now
        });

        const embed = new EmbedBuilder()
            .setTitle("🎁 Daily")
            .setDescription(
                `You received **$${recompensa.toFixed(2)}** for your daily!`
            )
            .setColor("#ffffff")
            .setAuthor({
                name: message.author.username,
                iconURL: message.author.displayAvatarURL({
                    dynamic: true,
                }),
            })
            .setFooter({ text: 'Kwanzaa', iconURL: 'https://media.discordapp.net/attachments/1546382578024448081/1546382661868847184/dd7c2f60355612d2cb895f0b992325fc.jpg?ex=6aa18ed4&is=6aa03d54&hm=4b2a1ea3af68677e8b64b3e046c62c8ad202e2232a68a9a21f1533889fa3413f&=&format=webp&width=512&height=512' })
            .setTimestamp();

        await message.reply({
            embeds: [embed],
        });
    }
};