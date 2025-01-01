const { verifyKey } = require('discord-interactions');
const { REST, Routes } = require('discord.js');
const body = require('./commands.js');

// verify client public key
function verify(key) {
    if (!key) throw new Error('You must specify a Discord client public key');

    return async (req, res, next) => {
        try {
            const timestamp = req.header('X-Signature-Timestamp');
            const signature = req.header('X-Signature-Ed25519');
            
            if (!timestamp || !signature) {
                return res.status(401).json({ code: 538401, message: 'Client Unauthorized' });
            }

            const processBody = async (rawBody) => {
                if (!await verifyKey(rawBody, signature, timestamp, key)) {
                    return res.status(401).json({ code: 538401, message: 'Client Unauthorized' });
                }

                const parsedBody = JSON.parse(rawBody.toString('utf-8'));
                if (parsedBody.type === 1) {
                    await registerCommands();
                    return res.status(200).json({ type: 1 });
                }

                req.body = parsedBody;
                next();
            };

            if (req.body) {
                const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body, 'utf-8');
                await processBody(rawBody);
            } else {
                const chunks = [];
                req.on('data', chunk => chunks.push(chunk));
                req.on('end', async () => {
                    const rawBody = Buffer.concat(chunks);
                    await processBody(rawBody);
                });
            }
        } catch (err) {
            return res.status(500).json({ code: 538500, message: 'Internal Server Error' });
        }
    };
}

// register commands when rechieve PING from discord
async function registerCommands() {
    try {
        const rest = new REST({ version: '10', userAgentAppendix: 'NouJS' }).setToken(process.env.TOKEN);
        await rest.put(Routes.applicationCommands(process.env.ID), { body });
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    verify,
    registerCommands
};
