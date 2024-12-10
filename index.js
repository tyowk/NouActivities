const express = require('express');
const app = express();
require('dotenv').config();

const {
    createMessage, editMessage, createDM, getUser,
    createInvite, verify, registerCommands, getTimestamp
} = require('./structures/functions.js');

const {
    ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder,
    Client, ActionRowBuilder, ButtonBuilder, ButtonStyle,
    GatewayIntentBits, MessageComponentInteraction, 
    ChatInputCommandInteraction, ModalSubmitInteraction
} = require('discord.js');

const client = new Client({ intents: Object.values(GatewayIntentBits) });
const inviteURL = 'https://discord.com/oauth2/authorize?client_id=1305829720213950474&permissions=549756077057&integration_type=0&scope=bot+applications.commands';
client.on('interaction', async (interaction, raw, ping) => {
    if (interaction.isChatInputCommand()) {
        switch (interaction.commandName?.toLowerCase()) {  
            case 'invite': {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Invite Me to Your Server!')
                            .setDescription(`Press the button bellow to add me to your server.\nNeed help? then join to my support server!`)
                            .setColor('#3b3ee3')
                    ],
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setLabel('Invite')
                                .setURL(inviteURL)
                                .setStyle(ButtonStyle.Link),
                            new ButtonBuilder()
                                .setLabel('Support')
                                .setURL('https://noujs.my.id/discord')
                                .setStyle(ButtonStyle.Link)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setLabel('Source')
                                .setURL('https://github.com/tyowk/NouActivities')
                                .setStyle(ButtonStyle.Link)
                        )
                    ]
                });
            }  
            case 'activities': {
                if (!interaction.inGuild()) return interaction.reply({ content: '🚫  Uhh... This command cannot be used in DM', ephemeral: true });
                const channelId = raw.data.options[1].value;
                const appId = raw.data.options[0].value;
                try {
                    const invite = await createInvite(channelId, appId);
                    if (invite.code === 50013 || !invite) return interaction.reply({ content: '🚫  Hmm... I don\'t have enough permissions\nMake sure I have `ViewChannel, CreateInvite` permissions', ephemeral: true });
                    if (invite.code === 50035) return interaction.reply({ content: '🚫  Well, This is awkward... Bad request', ephemeral: true });
                    return interaction.reply({
                        content: `<:dot:1315241311988879403>  **${invite.target_application?.name}**: https://discord.gg/${invite.code}`,
                        components: [
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setLabel('Start Activity')
                                    .setURL(`https://discord.gg/${invite.code}`)
                                    .setStyle(ButtonStyle.Link)
                                    .setEmoji('☕')
                            )
                        ]
                    });
                } catch (error) { return interaction.reply({ content: `🚫  Well... An error occurred: ${error.message}`, ephemeral: true })}
            }
            case 'ping': {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setDescription(`<:dot:1315241311988879403>  Pong! ${ping}ms`)
                        .setColor('#3b3ee3')
                    ]
                });
            }
            case 'help': {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
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
                        .setColor('#3b3ee3')
                    ],
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setLabel('Invite')
                                .setURL(inviteURL)
                                .setStyle(ButtonStyle.Link),
                            new ButtonBuilder()
                                .setLabel('Support')
                                .setURL('https://noujs.my.id/discord')
                                .setStyle(ButtonStyle.Link)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setLabel('Report')
                                .setCustomId(`report_${interaction.user.id}`)
                                .setStyle(ButtonStyle.Danger)
                        )
                    ]
                });
            }
            default: return interaction.reply({ content: '🚫  Unknown interaction', ephemeral: true });
        };
        
    } else if (interaction.isButton()) {
        const customId = interaction.customId.split('_');
        if (customId[0] === 'report' && customId[1] !== interaction.user.id) return interaction.reply({ content: '🚫  You cannot use this button', ephemeral: true });
        const modal = new ModalBuilder()
            .setCustomId(`${customId[0]}_${interaction.user.id}`)
            .setTitle('NouActivities Report');
        interaction.showModal(
            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('input')
                        .setLabel(customId[0] === 'report' ? 'What do you want to report?' : 'Reason')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder(customId[0] === 'report' ? 'You can report a bug, user, guild, etc.' : 'Reason...')
                        .setRequired(customId[0] === 'report' ? true : false)
                )
            )
        );
    } else if (interaction.isModalSubmit()) {
        const customId = interaction.customId.split('_');
        if (customId[0] === 'report') {
            await interaction.deferReply({ ephemeral: true });
            const text = interaction.fields.getTextInputValue('input');
            createMessage(process.env.REPORT, { embeds: [
                new EmbedBuilder()
                    .setColor('#3b3ee3')
                    .setTimestamp()
                    .setDescription(`>>> ${text?.slice(0, 3996) || 'null'}`)
                    .setThumbnail(interaction.user.avatarURL())
                    .setTitle(`New Report Submitted by ${interaction.user.username}`)
                    .addFields(
                        { name: '<:dot:1315241311988879403>  User ID', value: interaction.user.id },
                        { name: '<:dot:1315241311988879403>  User Name', value: interaction.user.username },
                    )
            ], components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('Accept')
                        .setCustomId(`accept_${interaction.user.id}`)
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setLabel('Decline')
                        .setCustomId(`decline_${interaction.user.id}`)
                        .setStyle(ButtonStyle.Danger)
                )
            ]});
            return interaction.editReply({
                content: '📝  Thank you for reporting!\nWe will follow up on your report shortly.',
                ephemeral: true
            })
            
        } else {
            await interaction.deferReply({ ephemeral: true });
            const dm = await createDM(customId[1]);
            const text = interaction.fields.getTextInputValue('input');
            interaction.message.embeds[0].fields.push({ name: '<:dot:1315241311988879403>  Reason', value: text?.slice(0, 1024)  || 'No reason provided' });
            await editMessage(interaction.channelId, interaction.message?.id, {
                embeds: interaction.message.embeds,
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('-')
                            .setStyle(customId[0] === 'accept' ? ButtonStyle.Success : ButtonStyle.Danger)
                            .setLabel(`Report ${customId[0] === 'accept' ? 'Accepted' : 'Declined'} by ${interaction.user.username}`)
                            .setDisabled(true)
                    )
                ]
            });
            const msg = await createMessage(dm?.id, { embeds: [
                new EmbedBuilder()
                    .setColor(customId[0] === 'accept' ? 'Green' : 'Red')
                    .setTimestamp()
                    .setThumbnail(interaction.user.avatarURL())
                    .setTitle(`Your report was ${customId[0] === 'accept' ? 'accepted' : 'declined'}`)
                    .setDescription(interaction.message.embeds[0].description)
                    .addFields(
                        { name: 'Reason', value: `>>> ${text?.slice(0, 1020)  || 'No reason provided'}` },
                        { name: 'Moderator', value: interaction.user.username },
                    )
            ]});
            if (msg?.code === 50007) return interaction.editReply(`Report ${customId[0] === 'accept' ? 'Accepted' : 'Declined'}, cannot send dm to this user`);
            return interaction.editReply(`Report ${customId[0] === 'accept' ? 'Accepted' : 'Declined'}`);
        };
    } else { return interaction.reply({ content: '🚫  Unknown interaction', ephemeral: true }); }
});

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

app.post('/interactions', verify(process.env.KEY), async (req, res) => {
    if (!req.body) return;
    let ping = Date.now() - (getTimestamp(req.body.id) || 0);
    let interaction;
    if (req.body.type === 2) interaction = new ChatInputCommandInteraction(client, req.body);
    if (req.body.type === 3) interaction = new MessageComponentInteraction(client, req.body);
    if (req.body.type === 5) interaction = new ModalSubmitInteraction(client, req.body);
    if (!interaction) return res.status(200).json({ type: 4, data: { content: '🚫  Unknown interaction', flags: 64 }});
    res.status(200);
    client.emit('interaction', interaction, req.body, ping);
});

app.use((req, res) => { return res.status(404).json({ code: 538404, message: 'Not Found' }) });
app.listen(process.env.PORT);
