const request = require('request')
const config = require('./config.json')
const async = require('async')
const Discord = require('discord.js')
const client = new Discord.Client()
var state = {
    channels: new Array(config.channels.length)
}
client.login(config.discord.token)
client.on('ready', () => {
    console.log('Fuminator is ready')
    start()
});

client.on('message', (message) => {
    config.channels.forEach(function (channel) {
        if (checkMessage(message, channel)) {
            var command = isCommand(message.content, channel.commands)
            if (command) {
                startRequest(channel, responseToCommand.bind(this, {
                    message: message,
                    channel: channel,
                    command: command
                }))
            }
        }
    })
})

function responseToCommand(commandData, err, response) {
    sendMessage(
        commandData.message.channel,
        commandData.channel.name,
        commandData.command.prefix,
        parseResponse(response.response, commandData.command)
    )
}

function checkMessage (message, channel) {
    return message.channel.id === channel.discordChannel && isMessageCommand(message.content)
}

function isCommand (content, commands) {
    return commands.find(function (command) {
        return content === config.discord.commandPrefix + command.command
    })
}

function isMessageCommand (content) {
    return content.substring(0,2) === config.discord.commandPrefix
}

function start () {
    setInterval(startRequests, config.interval)
}

function sendMessage (channel, channelName, prefix, key) {
    channel.send(prepareMsg(channelName, prefix, key))
}

function checkChannels () {
    state.channels.forEach((channel) => {
        var data = channel.data,
            checkedKey = parseResponse(channel.response, data.key)
        if (channel.prevResponse !== checkedKey) {
            channel.prevResponse = checkedKey
            var discordChannel = getDiscordChannel(data.discordChannel)
            sendMessage(discordChannel, data.name, data.key.prefix, checkedKey)
        }
    })
}

function getDiscordChannel (id) {
    return client.channels.get(id)
}

function prepareMsg (channel, prefix, name) {
    return 'Na antenie radia ' + channel + "\n" + prefix + name
}

function startRequests () {
    async.map(config.channels, startRequest, saveResponses)
}

function parseResponse (response, key) {
    if (!(response instanceof Object)) {
        response = JSON.parse(
            response.substring(
                response.indexOf('(') + 1,
                response.lastIndexOf(')')
            )
        )
    }
    return getValue(response, key.location)
}

function getValue (response, location) {
    var locationArray = location.split('.')
    for (let i = 0; i < locationArray.length;  i++) {
        response = response[locationArray[i]]
    }
    return response
}

function startRequest (channel, callback) {
    if (!channel.method) {
        console.log('No request method for' + channel.name)
        return
    }
    var options = {
        url: channel.url,
        method: channel.method,
        json: true,
        form: channel.form
    }

    request(options, function(err, res, body) {
        callback(err, {
            data: channel,
            response: body
        })
    })
}

function saveResponses (err, responses) {
    if (!err) {
        for (let i = 0; i < responses.length; i++) {
            if (state.channels[i] instanceof Object) {
                state.channels[i] = Object.assign(
                    state.channels[i],
                    responses[i]
                )
            } else {
                state.channels[i] = responses[i]
            }
        }
        checkChannels()
    }
}
