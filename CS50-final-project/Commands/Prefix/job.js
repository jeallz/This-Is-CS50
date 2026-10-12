const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ComponentType,
} = require('discord.js');

const { Op } = require('sequelize');

const Users = require('../../models/User');

const jobs = {
    Fisherman: {
        salary: 2000,
        level: 0,
        emoji: '🎣',
    },

    Baker: {
        salary: 2000,
        level: 0,
        emoji: '🥖',
    },

    Professor: {
        salary: 3000,
        level: 5,
        emoji: '👨‍🏫',
    },

    Designer: {
        salary: 4000,
        level: 10,
        emoji: '🎨',
    },

    Advocate: {
        salary: 6000,
        level: 20,
        emoji: '⚖️',
    },

    Doctor: {
        salary: 10000,
        level: 35,
        emoji: '👨‍⚕️',
    },

    Programmer: {
        salary: 15000,
        level: 55,
        emoji: '💻',
    },
};

module.exports = {

    name: 'job',

    async execute(message, args) {

        const member = message.author;

        const user = await Users.findOne({
            where: {
                discord_id: member.id,
            },
        });

        const level = Number(user.level);
        const atualJob = user.job || "Not"

        const options = Object.entries(jobs).map(
            ([jobName, job]) => {

                const unlocked = level >= job.level;

                return new StringSelectMenuOptionBuilder()
                    .setLabel(jobName)
                    .setDescription(
                        unlocked
                            ? `Salary: $${job.salary.toLocaleString('en-US')} • Available`
                            : `Salary: $${job.salary.toLocaleString('en-US')} • Requires level ${job.level}`
                    )
                    .setValue(jobName)
                    .setEmoji(job.emoji);
            }
        );

        const select = new StringSelectMenuBuilder()
            .setCustomId(`job_select_${member.id}`)
            .setPlaceholder('Select a profession...')
            .addOptions(options);

        const row = new ActionRowBuilder()
            .addComponents(select);

        const embed = new EmbedBuilder()
            .setTitle('💼 Choose your profession')
            .setDescription(
                `Your current level: **${user.level}**\n` +
                `Your current profession is: **${atualJob}**\n\n` +
                `**Select a profession below.**\n\n` +
                `🔓 You can only choose professions available for your level.\n` +
                `🔒 Professions with a higher level than yours are locked.`
            )
            .setColor('#ffffff')
            .setAuthor({
                name: member.username,
                iconURL: member.displayAvatarURL({
                    dynamic: true,
                }),
            })
            .setFooter({
                text: 'Kwanzaa',
                iconURL:
                    'https://media.discordapp.net/attachments/1546382578024448081/1546382661868847184/dd7c2f60355612d2cb895f0b992325fc.jpg?ex=6aa18ed4&is=6aa03d54&hm=4b2a1ea3af68677e8b64b3e046c62c8ad202e2232a68a9a21f1533889fa3413f&=&format=webp&width=512&height=512',
            })
            .setTimestamp();

        const reply = await message.reply({
            embeds: [embed],
            components: [row],
        });

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 60000,

            filter: interaction =>
                interaction.user.id === member.id &&
                interaction.customId === `job_select_${member.id}`,
        });

        collector.on('collect', async interaction => {

            const selectedJob = interaction.values[0];

            const job = jobs[selectedJob];

            if (!job) {
                return interaction.reply({
                    content: '❌ This profession does not exist.',
                    ephemeral: true,
                });
            }

            const currentUser = await Users.findOne({
                where: {
                    discord_id: member.id,
                },
            });

            if (!currentUser) {
                return interaction.reply({
                    content: '❌ Your account was not found.',
                    ephemeral: true,
                });
            }

            const currentLevel = Number(currentUser.level);

            if (currentLevel < job.level) {

                return interaction.reply({
                    content:
                        `🔒 You cannot be a **${selectedJob}** yet.\n\n` +
                        `📈 Required level: **${job.level}**\n` +
                        `⭐ Your level: **${currentLevel}**`,
                    ephemeral: true,
                });
            }

            const [updated] = await Users.update(
                {
                    job: selectedJob,
                },
                {
                    where: {
                        discord_id: member.id,

                        level: {
                            [Op.gte]: job.level,
                        },
                    },
                }
            );

            if (updated === 0) {

                return interaction.reply({
                    content:
                        `🔒 You cannot be a **${selectedJob}** yet.\n\n` +
                        `📈 Required level: **${job.level}**\n` +
                        `⭐ Your current level is not sufficient.`,
                    ephemeral: true,
                });
            }

            const successEmbed = new EmbedBuilder()
                .setTitle('💼 Profession chosen!')
                .setDescription(
                    `${job.emoji} You are now a **${selectedJob}**!\n\n` +
                    `💵 **Salary:** $${job.salary.toLocaleString('en-US')}\n` +
                    `📈 **Required Level:** ${job.level}`
                )
                .setColor('#ffffff')
                .setAuthor({
                    name: member.username,
                    iconURL: member.displayAvatarURL({
                        dynamic: true,
                    }),
                })
                .setFooter({
                    text: 'Kwanzaa',
                    iconURL:
                        'https://media.discordapp.net/attachments/1546382578024448081/1546382661868847184/dd7c2f60355612d2cb895f0b992325fc.jpg?ex=6aa18ed4&is=6aa03d54&hm=4b2a1ea3af68677e8b64b3e046c62c8ad202e2232a68a9a21f1533889fa3413f&=&format=webp&width=512&height=512',
                })
                .setTimestamp();

            select.setDisabled(true);

            await interaction.update({
                embeds: [successEmbed],
                components: [row],
            });

            collector.stop();
        });

        collector.on('end', async () => {

            select.setDisabled(true);

            await reply.edit({
                components: [row],
            }).catch(() => {});

        });
    },
};