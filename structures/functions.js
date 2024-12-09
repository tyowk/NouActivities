const { REST, Routes } = require('discord.js');
const body = require('./commands.js');

async function createMessage(channelId, options) {
    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
            Authorization: `Bot ${process.env.TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
    });
    const data = await response.json();
    return data;
}

/*async function deleteMessage(channelId, messageId) {
    await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bot ${process.env.TOKEN}`,
        },
    });
};*/

async function editMessage(channelId, messageId, options) {
    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bot ${process.env.TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
    });
    const data = await response.json();
    return data;
};

async function createDM(userId) {
    const response = await fetch(`https://discord.com/api/v10/users/@me/channels`, {
        method: 'POST',
        headers: {
            Authorization: `Bot ${process.env.TOKEN}`,
            "Content-Type": 'application/json',
        },
        body: JSON.stringify({
            recipient_id: userId
        })
    });
    const data = await response.json();
    return data;
}

/*async function getUser(userId) {
    const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bot ${process.env.TOKEN}`,
            'Content-Type': 'application/json',
        }
    });
    const data = await response.json();
    return data;
}*/

async function getChannel(channelId) {
    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bot ${process.env.TOKEN}`,
            "Content-Type": 'application/json',
        }
    });
    const data = await response.json();
    return data;
}

async function createInvite(channelId, appId) {
    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/invites`, {
        method: 'POST',
        headers: { Authorization: `Bot ${process.env.TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            max_age: 86400,
            max_uses: 100,
            unique: true,
            target_type: 2,
            target_application_id: appId
        })
    });
    const data = await response.json();
    return data;
};

async function registerCommands() {
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
        return await rest.put(Routes.applicationCommands(process.env.ID), { body });
    } catch (err) {
        return err;
    };
};

module.exports = {
    createMessage,
    editMessage,
    createDM,
    getChannel,
    createInvite,
    registerCommands
};
