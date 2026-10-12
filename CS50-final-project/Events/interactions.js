const blackjack = require("../Commands/Prefix/Bets/blackjack");
const coinflip = require("../Commands/Prefix/Bets/coinflip");
const crash = require("../Commands/Prefix/Bets/crash");

module.exports = {
    name: "interactionCreate",

    async execute(interaction) {
        if (interaction.isButton()) {
            if (interaction.customId.startsWith("blackjack_")) {
                return blackjack.handleInteraction(interaction);
            }

            if (interaction.customId.startsWith("coinflip_")) {
                return coinflip.handleInteraction(interaction);
            }

            if (interaction.customId.startsWith("crash_")) {
                return crash.handleInteraction(interaction);
            }

            return;
        }

        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);

            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: "Ocorreu um erro ao executar este comando!",
                    ephemeral: true
                });
            }
        }
    }
};