const choices = require('./choices.js');

module.exports = [{
    name: 'activities',
    description: 'Start an activity in a voice channel',
    type: 1,
    options: [{
        name: 'activities',
        description: 'Select the activity',
        type: 3,
        required: true,
        choices
    },{
        name: 'channel',
        description: 'Select the voice channel',
        type: 7,
        required: true,
        channel_types: [2]
    }]
},{
    name: 'invite',
    description: 'Add me to your server',
    type: 1,
    options: []
},{
    name: 'ping',
    description: 'Pong!',
    type: 1,
    options: []
},{
    name: 'help',
    description: 'See all my available commands',
    type: 1,
    options: []
},{
    name: 'report',
    description: 'Report something to the developer',
    type: 1,
    options: []
}];
