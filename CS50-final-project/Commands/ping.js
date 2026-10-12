const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Pong! 🏓'),

	async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#ffffff')
            .setTitle('Pong! 🏓')
            .setDescription(`Ping: \`${interaction.client.ws.ping}\``)
            .setTimestamp();

		interaction.reply({ embeds: [embed] })
	},
};