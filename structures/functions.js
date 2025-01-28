const { verify, registerCommands } = require('./verify.js');
const { Invite, DMChannel, User, Client, Message } = require('discord.js');
const client = new Client({ intents: [] });
const headers = { Authorization: `Bot ${process.env.TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'NouJS' };

// handling API request
async function apiRequest(endpoint, method = 'GET', body = null) {
    const response = await fetch(`https://discord.com/api/v10${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
    });
    
    return await response.json();
}

// sending messages
async function createMessage(channelId, options) {
    const result = await apiRequest(`/channels/${channelId}/messages`, 'POST', options);
    return new Message(client, result);
}

// editing messages
async function editMessage(channelId, messageId, options) {
    const result = await apiRequest(`/channels/${channelId}/messages/${messageId}`, 'PATCH', options);
    return new Message(client, result);
}

// creating DM
async function createDM(userId) {
    const result = await apiRequest('/users/@me/channels', 'POST', { recipient_id: userId });
    return new DMChannel(client, result);
}

// retrieve user info by id
async function getUser(userId) {
    const result = await apiRequest(`/users/${userId}`);
    return new User(client, result);
}

// create invite activity
async function createInvite(channelId, appId) {
    const result = await apiRequest(`/channels/${channelId}/invites`, 'POST', {
        max_age: 86400,
        max_uses: 100,
        unique: true,
        target_type: 2,
        target_application_id: appId,
    });

    if (result?.code === 50013 || !result) return 'missing';
    if (result?.code === 50035 || !result) return 'bad';
               
    return new Invite(client, result);
}

// reply interaction with content
async function sendReply(interaction, content, components, flags) {
    const result = await interaction.reply({ content, components, flags });
    return new Message(client, result);
}

// reply interaction with embeds
async function sendEmbedReply(interaction, embed, components, flags) {
    const result = await interaction.reply({ embeds: [embed], components, flags });
    return new Message(client, result);
}

module.exports = {
    createMessage,
    editMessage,
    createDM,
    getUser,
    createInvite,
    verify,
    registerCommands,
    sendReply,
    sendEmbedReply,
    getTimestamp: (snowflake) => Number((BigInt(snowflake) >> BigInt(22)) + 1420070400000n),
};
