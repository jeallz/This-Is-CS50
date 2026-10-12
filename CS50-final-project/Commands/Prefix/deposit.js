const { EmbedBuilder } = require("discord.js");
const Users = require("../../models/User");

module.exports = {
    name: "deposit",

    async execute(message, args) {
        const user = await Users.findOne({
            where: {
                discord_id: message.author.id,
            },
        });

        if (!user) {
            return message.reply("❌ Your account was not found.");
        }

        if (!args[0]) {
            return message.reply(
                "❌ Please specify an amount to deposit.\nExample: `!!deposit 500`"
            );
        }

        let valor;

        if (args[0].toLowerCase() === "all") {
            valor = Number(user.money);
        } else {
            valor = Number(args[0]);
        }

        if (!Number.isFinite(valor) || valor <= 0) {
            return message.reply(
                "❌ Please enter a valid amount to deposit."
            );
        }

        valor = Math.floor(valor);

        const carteira = Number(user.money);
        const banco = Number(user.bank);

        if (valor > carteira) {
            return message.reply(
                `❌ You do not have **$${valor.toFixed(2)}** in your wallet.\nYour current balance is **$${carteira.toFixed(2)}**.`
            );
        }

        await user.update({
            money: carteira - valor,
            bank: banco + valor,
        });

        const embed = new EmbedBuilder()
            .setTitle("🏦 Deposit")
            .setDescription(
                `You deposited **$${valor.toFixed(2)}** in the bank.`
            )
            .setColor("#ffffff")
            .setAuthor({
                name: message.author.username,
                iconURL: message.author.displayAvatarURL({
                    dynamic: true,
                }),
            })
            .addFields(
                {
                    name: "💵 Wallet",
                    value: `$ ${(carteira - valor).toFixed(2)}`,
                    inline: true,
                },
                {
                    name: "🏦 Bank",
                    value: `$ ${(banco + valor).toFixed(2)}`,
                    inline: true,
                }
            )
            .setFooter({ text: 'Kwanzaa', iconURL: 'https://media.discordapp.net/attachments/1546382578024448081/1546382661868847184/dd7c2f60355612d2cb895f0b992325fc.jpg?ex=6aa18ed4&is=6aa03d54&hm=4b2a1ea3af68677e8b64b3e046c62c8ad202e2232a68a9a21f1533889fa3413f&=&format=webp&width=512&height=512' })
            .setTimestamp();

        await message.reply({
            embeds: [embed],
        });
    },
};