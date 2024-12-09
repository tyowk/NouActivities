const express = require('express');
const app = express(); 
const body = require('./structures/commands.js');
const { verifyKeyMiddleware } = require('discord-interactions');
require('dotenv').config();

const { createMessage,
       editMessage,
       createDM,
       getChannel,
       createInvite,
       registerCommands
      } = require('./structures/functions.js');

const { ModalBuilder,
       TextInputBuilder,
       TextInputStyle,
       REST,
       Routes,
       EmbedBuilder,
       Client,
       ActionRowBuilder,
       ButtonBuilder,
       ButtonStyle,
       GatewayIntentBits,
       MessageComponentInteraction,
       ChatInputCommandInteraction,
       ModalSubmitInteraction
      } = require('discord.js');

const client = new Client({ intents: Object.values(GatewayIntentBits) });
client.on('interaction', async (interaction, raw) => {
    if (interaction.isChatInputCommand()) {
        switch (interaction.commandName?.toLowerCase()) {
                      
            case 'invite': {
                const embed = new EmbedBuilder()
                    .setTitle('Invite Me to Your Server!')
                    .setDescription(`Press the button bellow to add me to your server.\nNeed help? then join to my support server!`)
                    .setColor('#3b3ee3');
                
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('Invite Me!')
                        .setURL('https://discord.com/oauth2/authorize?client_id=1305829720213950474&permissions=281601&integration_type=0&scope=bot+applications.commands')
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
                );
                
                return interaction.reply({
                    embeds: [embed],
                    components: [row]
                });
            }
                      
            case 'activities': {
                if (!interaction.inGuild())
                    return interaction.reply({ content: '🚫  Uhh... This command cannot be used in DM', ephemeral: true });
                const channelId = raw.data.options[1].value;
                const appId = raw.data.options[0].value;
                const channel = await getChannel(channelId);
                if (channel.code === 50001)
                    return interaction.reply({ content: '🚫  Uh oh... I don\'t have access to the channel', ephemeral: true });
                if (channel.type !== 2)
                    return interaction.reply({ content: '🚫  Nuh uh uh, The channel type must be a voice channel', ephemeral: true });
                
                try {
                    const invite = await createInvite(channel.id, appId);
                    if (invite.code === 50013 || !invite)
                        return interaction.reply({ content: '🚫  Hmm... I don\'t have enough permissions', ephemeral: true });
                    if (!isNaN(invite.code) || invite.code === 50035)
                        return interaction.reply({ content: '🚫  Well, This is awkward... Bad request', ephemeral: true });
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel('Start Activity')
                            .setURL(`https://discord.gg/${invite.code}`)
                            .setStyle(ButtonStyle.Link)
                            .setEmoji('☕')
                    );
                    return interaction.reply({
                        content: `<:dot:1315241311988879403>  **${invite.target_application?.name}**: https://discord.gg/${invite.code}`,
                        components: [row]
                    });
                } catch (error) { return interaction.reply({ content: `🚫  Well... An error occurred: ${error.message}`, ephemeral: true })}
            }
                
            case 'ping': {
                const start = Date.now();
                await interaction.deferReply();
                await fetch('https://interactions.noujs.my.id/activities/ping', { method: 'POST', body: JSON.stringify({ type: 1 }) });
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                        .setDescription(`<:dot:1315241311988879403>  Pong! ${Date.now() - start}ms`)
                        .setColor('#3b3ee3')
                    ]
                });
            }
                
            case 'help': {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('Invite')
                        .setURL('https://discord.com/oauth2/authorize?client_id=1305829720213950474&permissions=281601&integration_type=0&scope=bot+applications.commands')
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
                );
                
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
                    components: [row]
                });
            }
                
            default:
                return interaction.reply({ content: '🚫  Unknown interaction', ephemeral: true });
        };
        
    } else if (interaction.isButton()) {
        const customId = interaction.customId.split('_');
        if (customId[0] === `report`) {
            
            if (customId[1] !== interaction.user.id) return interaction.reply({ content: '🚫  You cannot use this button', ephemeral: true });
            const modal = new ModalBuilder()
                .setCustomId('report')
                .setTitle('NouActivities Report');
            const input = new TextInputBuilder()
                .setCustomId('input')
                .setLabel('What do you want to report?')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('You can report a bug, user, guild, etc.')
                .setRequired(true);
            const row = new ActionRowBuilder().addComponents(input);
            modal.addComponents(row);
            interaction.showModal(modal);
            
        } else if (customId[0] === 'accept') {
            
            const modal = new ModalBuilder()
                .setCustomId(`accept_${customId[1]}`)
                .setTitle('NouActivities Report');
            const input = new TextInputBuilder()
                .setCustomId('input')
                .setLabel('Reason')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false);
            const row = new ActionRowBuilder().addComponents(input);
            modal.addComponents(row);
            interaction.showModal(modal);
            
        } else if (customId[0] === 'decline') {
            
            const modal = new ModalBuilder()
                .setCustomId(`decline_${customId[1]}`)
                .setTitle('NouActivities Report');
            const input = new TextInputBuilder()
                .setCustomId('input')
                .setLabel('Reason')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false);
            const row = new ActionRowBuilder().addComponents(input);
            modal.addComponents(row);
            interaction.showModal(modal);
        }
        
    } else if (interaction.isModalSubmit()) {
        const customId = interaction.customId.split('_');
        if (interaction.customId === 'report') {
            
            await interaction.deferReply({ ephemeral: true });
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Accept')
                    .setCustomId(`accept_${interaction.user.id}`)
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setLabel('Decline')
                    .setCustomId(`decline_${interaction.user.id}`)
                    .setStyle(ButtonStyle.Danger)
            );
            const text = interaction.fields.getTextInputValue('input');
            const embed = new EmbedBuilder()
                .setColor('#3b3ee3')
                .setTimestamp()
                .setDescription(`>>> ${text?.slice(0, 3997) || 'null'}`)
                .setThumbnail(interaction.user.avatarURL())
                .setTitle(`New Report Submitted by ${interaction.user.username}`)
                .addFields(
                    { name: '<:dot:1315241311988879403>  User ID', value: interaction.user.id },
                    { name: '<:dot:1315241311988879403>  User Name', value: interaction.user.username },
                );
            await createMessage(process.env.REPORT, { embeds: [embed], components: [row] });
            return interaction.editReply({
                content: '📝  Thank you for reporting!\nWe will follow up on your report shortly.',
                ephemeral: true
            })
            
        } else if (customId[0] === 'accept') {
            await interaction.deferReply({ ephemeral: true });
            const dm = await createDM(customId[1]);
            const text = interaction.fields.getTextInputValue('input');
            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTimestamp()
                .setThumbnail(interaction.user.avatarURL())
                .setTitle(`Your report was accepted`)
                .setDescription(interaction.message.embeds[0].description)
                .addFields(
                    { name: 'Reason', value: `>>> ${text?.slice(0, 1997)  || 'No reason provided'}` },
                    { name: 'Moderator', value: interaction.user.username },
                );
            await editMessage(interaction.channelId, interaction.message?.id, {
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('-')
                            .setStyle(ButtonStyle.Success)
                            .setLabel('Report Accepted')
                            .setDisabled(true)
                    )
                ]
            });
            const msg = await createMessage(dm?.id, { embeds: [embed] });
            if (msg?.code === 50007) return interaction.editReply('Report accepted, cannot send dm to this user');
            return interaction.editReply('Report accepted');
            
        } else if (customId[0] === 'decline') {
            await interaction.deferReply({ ephemeral: true });
            const dm = await createDM(customId[1]);
            const text = interaction.fields.getTextInputValue('input');
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTimestamp()
                .setThumbnail(interaction.user.avatarURL())
                .setTitle(`Your report was declined`)
                .setDescription(interaction.message.embeds[0].description)
                .addFields(
                    { name: 'Reason', value: `>>> ${text?.slice(0, 1997)  || 'No reason provided'}` },
                    { name: 'Moderator', value: interaction.user.username },
                );
            await editMessage(interaction.channelId, interaction.message?.id, {
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('-')
                            .setStyle(ButtonStyle.Danger)
                            .setLabel('Report Declined')
                            .setDisabled(true)
                    )
                ]
            });
            const msg = await createMessage(dm?.id, { embeds: [embed] });
            if (msg?.code === 50007) return interaction.editReply('Report declined, cannot send dm to this user');
            return interaction.editReply('Report declined');
        }
    } else { return interaction.reply({ content: '🚫  Unknown interaction', ephemeral: true }); }
});

app.post('/ping', (req, res) => { return res.status(200).json({ code: 200, message: 'OK' })});
app.post('/interactions', verifyKeyMiddleware(process.env.KEY), async (req, res) => {
    const raw = req.body;
    if (!raw) return res.status(200).json({ type: 4, data: { content: '🚫  Unknown interaction', flags: 64 }});
    let interaction;
    
    if (raw.type === 1) {
           await registerCommands();
           return res.status(200).json({ type: 1 });
    }
    if (raw.type === 2) interaction = new ChatInputCommandInteraction(client, raw);
    if (raw.type === 3) interaction = new MessageComponentInteraction(client, raw);
    if (raw.type === 5) interaction = new ModalSubmitInteraction(client, raw);
    
    if (!interaction) return res.status(200).json({ type: 4, data: { content: '🚫  Unknown interaction', flags: 64 }});
    res.status(200);
    client.emit('interaction', interaction, raw);
});

app.use((req, res) => { return res.status(404).json({ code: 404, message: 'Not Found' }) });
app.listen(process.env.PORT);
