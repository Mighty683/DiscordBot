const util = require('util')
const ApiListener = require('./apiListener.js')
const DiscordBot = require('./discordBot.js')
const EventEmitter = require('events').EventEmitter

function Fuminator (options) {
  this.config = options.config
  this.discordBot = new DiscordBot(this.config.discord)

  this.registerCommandListener = function (apiChannel, apiListener) {
    this.discordBot.on('command:received', (channelId, commandContent) => {
      if (apiChannel.discordChannel === channelId) {
        apiChannel.commands.forEach((command) => {
          if (commandContent === command.command) {
            console.log(apiChannel.name + ':cmd:' + command.command + ':received')
            this.emit(apiChannel.name + ':cmd:' + command.command + ':received',
              command,
              apiChannel,
              apiListener.getValueFromResponse(command.location))
          }
        })
      }
    })
  }

  this.registerApiChannelListener = function (apiListener, apiChannel) {
    var prevKeyValue,
      keyValue
    apiListener.on('response:received', (response) => {
      keyValue = apiListener.getValueFromResponse(apiChannel.key.location)
      if (keyValue && (keyValue !== prevKeyValue)) {
        this.emit(apiChannel.name + ':keyValue:changed', apiChannel, keyValue)
        prevKeyValue = keyValue
      }
    })
  }

  this.registerApiChannel = function (apiChannel) {
    console.log('Registering ' + apiChannel.name + ' api channel')
    var apiListener = new ApiListener(apiChannel)
    this.registerApiChannelListener(apiListener, apiChannel)
    apiListener.startSubscribe(this.config.interval)
    this.registerCommandListener(apiChannel, apiListener)
  }

  this.sendMessage = function (discordChannel, msgContent) {
    this.discordBot.sendMessage(discordChannel, msgContent)
  }

  this.start = function () {
    this.discordBot.discordInit()
    this.discordBot.on('bot:ready', () => {
      console.log('Fuminator is starting')
      this.config.channels.forEach(this.registerApiChannel.bind(this))
    })
  }
}

util.inherits(Fuminator, EventEmitter)
module.exports = Fuminator
