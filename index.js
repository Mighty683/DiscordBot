const Fuminator = require('./fuminator.js')
const config = require('./config.json')
var fuminator = new Fuminator({
  config: config
})

function getMsgPrefix (channelName) {
  return config.discord.messagePrefix + channelName + '\n'
}

function defaultCommandHandler (command, apiChannel, keyValue) {
  fuminator.sendMessage(apiChannel.discordChannel,
    getMsgPrefix(apiChannel.name) + command.prefix + keyValue)
}

fuminator.on('Wakai:keyValue:changed', function (apiChannel, keyValue) {
  console.log(apiChannel.name + ':keyValue:changed')
  fuminator.sendMessage(apiChannel.discordChannel,
    getMsgPrefix(apiChannel.name) + apiChannel.key.prefix + ' ' + keyValue)
})
fuminator.on('Wakai:cmd:who:received', defaultCommandHandler)
fuminator.on('Wakai:cmd:song:received', defaultCommandHandler)

fuminator.start()
