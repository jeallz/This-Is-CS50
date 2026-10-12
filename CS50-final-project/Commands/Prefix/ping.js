const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Show bot ping',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setColor('#ffffff')
            .setTitle('Pong! 🏓')
            .setDescription(`Ping: \`${message.client.ws.ping}\``)
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    }
};