const {
    EmbedBuilder,
} = require('discord.js');

const Users = require('../../models/User');

const jobs = {
    Fisherman: {
        salary: 2000,
        emoji: '🎣',
    },

    Baker: {
        salary: 2000,
        emoji: '🥖',
    },

    Professor: {
        salary: 3000,
        emoji: '👨‍🏫',
    },

    Designer: {
        salary: 4000,
        emoji: '🎨',
    },

    Advocate: {
        salary: 6000,
        emoji: '⚖️',
    },

    Doctor: {
        salary: 10000,
        emoji: '👨‍⚕️',
    },

    Programmer: {
        salary: 15000,
        emoji: '💻',
    },
};

module.exports = {
    name: 'work',

    async execute(message, args) {

        const member = message.author;

        const user = await Users.findOne({
            where: {
                discord_id: member.id,
            },
        });

        const currentJob = user.job;

        if (!currentJob || !jobs[currentJob]) {
            return message.reply(
                '❌ You don\'t have a profession.\n\n' +
                '💼 Use the `job` command to choose a profession.'
            );
        }

        const job = jobs[currentJob];

        const now = new Date();

        /*if (user.last_work) {

            const lastWork = new Date(user.last_work);

            const cooldown = 60 * 60 * 1000;
            const elapsed = now - lastWork;

            if (elapsed < cooldown) {

                const remaining = cooldown - elapsed;

                const minutes = Math.floor(
                    remaining / (1000 * 60)
                );

                const seconds = Math.floor(
                    (remaining % (1000 * 60)) / 1000
                );

                return message.reply(
                    `⏰ You already worked recently.\n\n` +
                    `💼 Your work as **${currentJob}** has already been done.\n` +
                    `🕐 Try again in **${minutes}m ${seconds}s**.`
                );
            }
        }*/

        const currentXP = Number(user.xp) || 0;
        const currentLevel = Number(user.level) || 0;

        const xpGained = 100;

        const totalXP = currentXP + xpGained;

        const levelsGained = Math.floor(totalXP / 1000);

        const newXP = totalXP % 1000;

        const newLevel = currentLevel + levelsGained;

        await Users.update(
            {
                money: Number(user.money) + job.salary,
                xp: newXP,
                level: newLevel,
                last_work: now,
            },
            {
                where: {
                    discord_id: member.id,
                },
            }
        );

        const embed = new EmbedBuilder()
            .setTitle('💼 You Worked!')
            .setDescription(
                `${job.emoji} You worked as **${currentJob}**!\n\n` +

                `💵 **Salary received:** $${job.salary.toLocaleString('en-US')}\n` +
                `⭐ **XP received:** +${xpGained}\n\n` +

                `📊 **Level:** ${newLevel}\n` +
                `✨ **XP:** ${newXP}/1000\n\n` +

                `${levelsGained > 0
                    ? `🎉 You leveled up **${levelsGained} time${levelsGained > 1 ? 's' : ''}**!`
                    : `📈 You need **${1000 - newXP} XP** to reach the next level.`
                }`
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
                    'https://media.discordapp.net/attachments/1546382578024448081/1546382661868847184/dd7c2f60355612d2cb895f0b992325fc.jpg?format=webp&width=512&height=512',
            })
            .setTimestamp();

        return message.reply({
            embeds: [embed],
        });
    },
};