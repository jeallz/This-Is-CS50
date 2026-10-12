const { EmbedBuilder } = require('discord.js');
const Users = require("../../models/User");

module.exports = {
    name: 'balance',

    async execute(message, args) {
        const member = message.mentions.users.first() || message.author

        if (!member) {
            return message.reply("❌ Your account was not found.");
        }

        const user = await Users.findOne({
            where: {
                discord_id: member.id
            }
        })

        const wallet = Number(user.money);
        const bank = Number(user.bank);

        const balance = wallet + bank;

        const embed = new EmbedBuilder()
            .setTitle(`${member.username} balance`)
            .setDescription(
                `💰 Total: **$${balance.toFixed(2)}**`
            )
            .addFields(
                {
                    name: "💵 Wallet",
                    value: `$ ${wallet.toFixed(2)}`,
                    inline: true,
                },
                {
                    name: "🏦 Bank",
                    value: `$ ${bank.toFixed(2)}`,
                    inline: true,
                }
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