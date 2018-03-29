const util = require('util')
const ApiListener = require('./apiListener.js')
const DiscordBot = require('./discordBot.js')
const EventEmitter = require('events').EventEmitter

function Fuminator (options) {
  this.config = options.config
  this.apiChannel = options.apiChannel
  this.apiListener = new ApiListener(this.apiChannel)
  this.discordBot = new DiscordBot(this.config.discord)

  this.registerCommandListener = function () {
    this.discordBot.on('message:received', (channelId, message) => {
      if (this.apiChannel.discordChannel === channelId) {
        let checkedCommand = this.checkCommand(message.content)
        if (checkedCommand) {
          this.processCommand(checkedCommand)
        }
      }
    })
  }

  this.processCommand = function (checkedCommand) {
    this.apiChannel.commands.forEach((command) => {
      if (checkedCommand === command.command) {
        this.defaultCommandHandler(command,
          this.apiListener.getValueFromResponse(command.location))
      }
    })
  }

  this.checkCommand = function (content) {
    return content.substring(0, 2) === this.config.discord.commandPrefix ? content.substring(2) : undefined
  }

  this.registerApiChannelListener = function () {
    var prevKeyValue,
      keyValue
    this.apiListener.on('response:received', (response) => {
      keyValue = this.apiListener.getValueFromResponse(this.apiChannel.key.location)
      if (keyValue && (keyValue !== prevKeyValue)) {
        this.keyValueChangeHandler(keyValue)
        prevKeyValue = keyValue
      }
    })
  }

  this.registerApiChannel = function () {
    console.log('Registering ' + this.apiChannel.name + ' api channel')
    this.registerApiChannelListener()
    this.apiListener.startSubscribe(this.config.interval)
    this.registerCommandListener()
  }

  this.sendMessage = function (discordChannel, msgContent) {
    console.log('Sending Message')
    this.discordBot.sendMessage(discordChannel, msgContent)
  }

  this.start = function () {
    this.discordBot.discordInit()
    this.discordBot.on('bot:ready', () => {
      console.log('Channel listener is starting')
      this.registerApiChannel()
    })
  }

  this.keyValueChangeHandler = function (keyValue) {
    this.sendMessage(this.apiChannel.discordChannel,
      this.getMsgPrefix(this.apiChannel.name) + this.apiChannel.key.prefix + ' ' + keyValue)
  }

  this.defaultCommandHandler = function (command, keyValue) {
    this.sendMessage(this.apiChannel.discordChannel,
      this.getMsgPrefix(this.apiChannel.name) + command.prefix + keyValue)
  }

  this.getMsgPrefix = function (channelName) {
    return this.config.discord.messagePrefix + channelName + '\n'
  }
}

util.inherits(Fuminator, EventEmitter)
module.exports = Fuminator
