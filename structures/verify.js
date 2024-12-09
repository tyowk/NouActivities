const { verifyKey } = require('discord-interactions');
const { REST, Routes } = require('discord.js');
const body = require('./commands.js');

function verify(key) {
    if (!key) throw new Error('You must specify a Discord client public key');
    return async (req, res, next) => {
        try {
            const timestamp = req.header('X-Signature-Timestamp') || '';
            const signature = req.header('X-Signature-Ed25519') || '';
            if (!timestamp || !signature) return res.status(401).json({ code: 538401, message: 'Client Unauthorized' });
            const processBody = async (rawBody) => {
                const isValid = await verifyKey(rawBody, signature, timestamp, key);
                if (!isValid) return res.status(401).json({ code: 538401, message: 'Client Unauthorized' });
                const body = JSON.parse(rawBody.toString('utf-8'));

                if (body.type === 1) {
                    await registerCommands();
                    return res.status(200).json({ type: 1 });
                };

                req.body = body;
                next();
            };

            if (req.body) {
                if (Buffer.isBuffer(req.body)) {
                    await processBody(req.body);
                } else if (typeof req.body === 'string') {
                    await processBody(Buffer.from(req.body, 'utf-8'));
                } else {
                    console.warn('req.body was tampered with, probably by some other middleware. We recommend disabling middleware for interaction routes so that req.body is a raw buffer.');
                    await processBody(Buffer.from(JSON.stringify(req.body), 'utf-8'));
                }
            } else {
                const chunks = [];
                req.on('data', (chunk) => chunks.push(chunk));
                req.on('end', async () => {
                    const rawBody = Buffer.concat(chunks);
                    await processBody(rawBody);
                });
            }
        } catch (err) {
            return res.status(500).json({ code: 538500, message: 'Internal Server Error' });
        }
    };
};

async function registerCommands() {
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
        return await rest.put(Routes.applicationCommands(process.env.ID), { body });
    } catch (err) {
        console.error(err);
        return;
    }
};

module.exports = {
    verify,
    registerCommands
};
