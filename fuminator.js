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

function start () {
setInterval(startRequests, config.interval)
}

function sendMessage (channel, key) {
    var dicordChannel = client.channels.get(config.discord.server.channel)
    dicordChannel.send(prepareMsg(channel.name, key))
}

function checkChannels () {
    state.channels.forEach((channel) => {
        var checkedKey = parseResponse(channel.response, channel.data.key)
        if (channel.prevResponse !== checkedKey) {
            channel.prevResponse = checkedKey
            sendMessage(channel.data, checkedKey)
        }
    })
}

function prepareMsg (channel, name) {
    return 'Na antenie radia ' + channel + ' \nGra dla was ' + name
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
