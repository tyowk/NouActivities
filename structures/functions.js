const { verify, registerCommands } = require('./verify.js');
const headers = { Authorization: `Bot ${process.env.TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'NouJS' };

// handling API request
async function apiRequest(endpoint, method = 'GET', body = null) {
    const response = await fetch(`https://discord.com/api/v10${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
    });
    return response.json();
}

// sending messages
async function createMessage(channelId, options) {
    return apiRequest(`/channels/${channelId}/messages`, 'POST', options);
}

// editing messages
async function editMessage(channelId, messageId, options) {
    return apiRequest(`/channels/${channelId}/messages/${messageId}`, 'PATCH', options);
}

// creating DM
async function createDM(userId) {
    return apiRequest('/users/@me/channels', 'POST', { recipient_id: userId });
}

// retrieve user info by id
async function getUser(userId) {
    return apiRequest(`/users/${userId}`);
}

// create invite activity
async function createInvite(channelId, appId) {
    return apiRequest(`/channels/${channelId}/invites`, 'POST', {
        max_age: 86400,
        max_uses: 100,
        unique: true,
        target_type: 2,
        target_application_id: appId,
    });
}

// reply interaction with content
async function sendReply(interaction, content, components, flags) {
    await interaction.reply({ content, components, flags });
}

// reply interaction with embeds
async function sendEmbedReply(interaction, embed, components, flags) {
    await interaction.reply({ embeds: [embed], components, flags });
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
