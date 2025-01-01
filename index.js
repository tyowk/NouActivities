const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();

// util functions
const {
    createMessage, editMessage, createDM, getUser, sendReply,
    createInvite, verify, registerCommands, getTimestamp, sendEmbedReply
} = require('./structures/functions.js');

// discord.js
const {
    ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder,
    Client, ActionRowBuilder, ButtonBuilder, ButtonStyle,
    GatewayIntentBits, MessageComponentInteraction, 
    ChatInputCommandInteraction, ModalSubmitInteraction
} = require('discord.js');

// client instance
const client = new Client({ intents: Object.values(GatewayIntentBits) });
const inviteURL = 'https://discord.com/oauth2/authorize?client_id=1305829720213950474&permissions=549756077057&integration_type=0&scope=bot+applications.commands';

client.on('interaction', async (interaction, raw, ping) => {
    
    // client commands
    const commands = {
        invite: async () => await sendEmbedReply(interaction, new EmbedBuilder()
            .setTitle('Invite Me to Your Server!')
            .setDescription(`Press the button below to add me to your server.\nNeed help? [Join my support server](https://discord.gg/hyQYXcVnmZ)!`)
            .setColor('#3b3ee3'), [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setLabel('Invite').setURL(inviteURL).setStyle(ButtonStyle.Link),
                    new ButtonBuilder().setLabel('Support').setURL('https://discord.gg/hyQYXcVnmZ').setStyle(ButtonStyle.Link),
                    new ButtonBuilder().setLabel('Source').setURL('https://github.com/tyowk/NouActivities').setStyle(ButtonStyle.Link)
                )
            ]),
        
        activities: async () => {
            try {
                if (!interaction.inGuild()) return sendReply(interaction, '🚫 This command cannot be used in DM', []);
                const channelId = raw.data.options[1].value;
                const appId = raw.data.options[0].value;
            
                const invite = await createInvite(channelId, appId);
                if (invite.code === 50013 || !invite) return sendReply(interaction, '🚫 Missing permissions\nMake sure I have `ViewChannel, CreateInvite` permissions', []);
                if (invite.code === 50035) return sendReply(interaction, '🚫 Bad request', []);
                await sendReply(interaction, `<:dot:1315241311988879403> **${invite.target_application?.name}**: https://discord.gg/${invite.code}`, [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setLabel('Start Activity').setURL(`https://discord.gg/${invite.code}`).setStyle(ButtonStyle.Link).setEmoji('☕')
                    )
                ]);
            } catch (error) { 
                await sendReply(interaction, `🚫 Error: ${error.message}`, []); 
            }
        },

        ping: async () => await sendEmbedReply(interaction, new EmbedBuilder()
            .setDescription(`<:dot:1315241311988879403> Pong! ${ping}ms`)
            .setColor('#3b3ee3'), []),

        help: async () => await sendEmbedReply(interaction, new EmbedBuilder()
            .addFields({
                name: '<:dot:1315241311988879403>  /activities',
                value: `Lists the available Discord voice activities, such as interactive games or group experiences that can be launched directly within a voice channel. Engage with friends or server members by participating in these fun and immersive activities.`
            },{
                name: '<:dot:1315241311988879403>  /help',
                value: `List of all available commands along with their descriptions, guiding you on how to interact with the bot and make the most of its features.`
            },{
                name: '<:dot:1315241311988879403>  /ping',
                value: `Checks the bot's response time to the server, showing the latency (in milliseconds) between the bot and the server to ensure everything is working smoothly.`
            },{
                name: '<:dot:1315241311988879403>  /invite',
                value: `Generate an invite link for the bot, allowing you to add it to your own Discord server or share it with others.`
            })
            .setColor('#3b3ee3'), [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setLabel('Invite').setURL(inviteURL).setStyle(ButtonStyle.Link),
                    new ButtonBuilder().setLabel('Support').setURL('https://discord.gg/hyQYXcVnmZ').setStyle(ButtonStyle.Link),
                    new ButtonBuilder().setLabel('Report').setCustomId(`report_${interaction.user.id}`).setStyle(ButtonStyle.Danger)
                )
            ])
    };

    // handlng command interaction
    if (interaction.isChatInputCommand()) {
        const command = commands[interaction.commandName?.toLowerCase()];
        if (command) return await command();
        return await sendReply(interaction, '🚫 Unknown command interaction', []);
    } 

    // Handling button interactions
    if (interaction.isButton()) {
        const [action, userId] = interaction.customId.split('_');
        if (action === 'report' && userId !== interaction.user.id) return await sendReply(interaction, '🚫 You cannot use this button', []);

        return await interaction.showModal(new ModalBuilder()
            .setCustomId(`${action}_${interaction.user.id}`)
            .setTitle('NouActivities Report')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('input')
                        .setLabel(action === 'report' ? 'What do you want to report?' : 'Reason')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder(action === 'report' ? 'You can report a bug, user, guild, etc.' : 'Reason...')
                        .setRequired(action === 'report')
                )
            )
        );
    }

    // Handling modal submission
    if (interaction.isModalSubmit()) {
        const [action, userId] = interaction.customId.split('_');
        await interaction.deferReply({ ephemeral: true });
        const text = interaction.fields.getTextInputValue('input');
        
        if (action === 'report') {
            createMessage(process.env.REPORT, { embeds: [new EmbedBuilder()
                .setColor('#3b3ee3')
                .setDescription(`>>> ${text.slice(0, 3996)}`)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTitle(`New Report Submitted by ${interaction.user.username}`)
                .addFields({ name: 'User ID', value: interaction.user.id }, { name: 'User Name', value: interaction.user.username })
            ], components: [new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                .setLabel('Accept')
                .setCustomId(`accept_${interaction.user.id}`)
                .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                .setLabel('Decline')
                .setCustomId(`decline_${interaction.user.id}`)
                .setStyle(ButtonStyle.Danger)
            )]});
            
            return interaction.editReply('📝 Thank you for reporting!');
        } else {
            const dm = await createDM(userId);
            const replyText = text?.slice(0, 1020);
            interaction.message.embeds[0].fields.push({ name: 'Reason', value: `>>> ${replyText  || 'No reason provided'}` || 'No reason provided' });
            await editMessage(interaction.channelId, interaction.message.id, { embeds: interaction.message.embeds, components: [new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                .setCustomId('-')
                .setStyle(action === 'accept' ? ButtonStyle.Success : ButtonStyle.Danger)
                .setLabel(`Report ${action === 'accept' ? 'Accepted' : 'Declined'} by ${interaction.user.username}`)
                .setDisabled(true))
            ]});
            
            const msg = await createMessage(dm?.id, { embeds: [new EmbedBuilder()
                .setColor(action === 'accept' ? 'Green' : 'Red')
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTitle(`Your report was ${action === 'accept' ? 'accepted' : 'declined'}`)
                .setDescription(interaction.message.embeds[0].description)
                .addFields({ name: 'Reason', value: `>>> ${replyText  || 'No reason provided'}` }, { name: 'Moderator', value: interaction.user.username })
            ]});
            
            return interaction.editReply(`Report ${action === 'accept' ? 'Accepted' : 'Declined'}`);
        }
    }

    return sendReply(interaction, '🚫 Unknown modal interaction', []);
});

// register commands via API request
app.put('/register', async (req, res) => {
    if (req.header('Authorization') !== process.env.TOKEN)
        return res.status(401).json({ code: 548401, message: 'Unauthorized' });

    const response = await registerCommands();
    res.status(response ? 538200 : 548500).json({
        code: response ? 538200 : 538500,
        message: response ? 'OK' : 'Internal Server Error',
        response
    });
});

// rechieve interaction post from discord
app.post('/interactions', verify(process.env.KEY), async (req, res) => {
    if (!req.body) return;
    let ping = Date.now() - (getTimestamp(req.body.id) || 0);
    let interaction;
    
    if (req.body.type === 2) interaction = new ChatInputCommandInteraction(client, req.body);
    if (req.body.type === 3) interaction = new MessageComponentInteraction(client, req.body);
    if (req.body.type === 5) interaction = new ModalSubmitInteraction(client, req.body);
    
    if (!interaction) return res.status(200).json({ type: 4, data: { content: '🚫 Unknown interaction', flags: 64 }});
    res.status(200);
    client.emit('interaction', interaction, req.body, ping);
});

// receive vote post from top.gg
app.post('/webhook', express.json(), async (req, res) => {
    if (req.header('Authorization') !== process.env.AUTH)
        return res.status(401).json({ code: 538401, message: 'Unauthorized' });
    
    const user = await getUser(req.body?.user);
    if (!user || !user?.id)
        return res.status(404).json({ code: 538404, message: 'Not Found' });
    
    res.status(200).json({ code: 538200, message: 'OK' });
    
    await createMessage(process.env.VOTE, { content: `<@${user.id}>`, embeds: [new EmbedBuilder()
        .setTitle(`${user.global_name || user.username} Just Voted Me!`)
        .setThumbnail(user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=4096` : `https://cdn.discordapp.com/embed/avatars/0.png`)
        .setDescription(`Thanks for voting for me, <@${user.id}>! Your support keeps this bot running and improving every day. We're working hard to bring you even better features.\n\nYou can [vote](https://top.gg/bot/${process.env.ID}/vote) again <t:${((Date.now() + 43200000) / 1000).toFixed()}:R>`)
        .setColor('#3b3ee3')
        .setTimestamp()
    ], components: [new ActionRowBuilder().addComponents(
        new ButtonBuilder()
        .setLabel('Vote me on Top.gg!')
        .setURL(`https://top.gg/bot/${process.env.ID}/vote`)
        .setStyle(ButtonStyle.Link)
        .setEmoji('<:topgg:1322153742581104660>')
    )]});
});

// others
app.use((req, res) => res.sendFile(path.join(__dirname, 'website', '404.html')));
app.listen(process.env.PORT);
