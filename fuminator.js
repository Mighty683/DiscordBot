
const config = require('./config.json')
const ApiListener = require('./apiListener.js')
const DiscordBot = require('./discordBot.js')
const events = require('events');

var discordBot = new DiscordBot(config.discord)

function start () {
    discordBot.discordInit()
    discordBot.on('bot:ready', () => {
        console.log('Fuminator is ready')
        config.channels.forEach(registerApiChannel)
    })
}

function registerApiChannel (apiChannel) {
    console.log('Registering ' + apiChannel.name + ' api channel')
    var apiListener = new ApiListener(apiChannel)
    registerApiChannelListener(apiListener, apiChannel)
    apiListener.startSubscribe(config.interval)
    registerCommandListener (apiChannel, apiListener)
}

function registerCommandListener (apiChannel, apiListener) {
    discordBot.on('command:received', (channelId, commandContent) => {
        if (apiChannel.discordChannel === channelId) {
            apiChannel.commands.forEach((command) => {
                if (commandContent === command.command) {
                    discordBot.sendMessage(apiChannel.discordChannel,
                        prepareMsg(apiChannel.name, command.prefix, apiListener.getValueFromResponse(command.location)))
                }
            })
        }
    })
}

function registerApiChannelListener (apiListener, apiChannel) {
    var prevKeyValue = {},
        keyValue = {}
    apiListener.on('response:received', (response) => {
        keyValue = apiListener.getValueFromResponse(apiChannel.key.location)
        if (keyValue && (keyValue !== prevKeyValue)) {
            discordBot.sendMessage(apiChannel.discordChannel,
            prepareMsg(apiChannel.name, apiChannel.key.prefix, keyValue))
            prevKeyValue = keyValue
        }
    })
}

function prepareMsg (channelName, prefix, name) {
    return config.discord.messagePrefix + channelName + "\n" + prefix + name
}

function checkMessage (message, channel) {
    return message.channel.id === channel.discordChannel && isMessageCommand(message.content)
}

start()
