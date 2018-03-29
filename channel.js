const util = require('util')
const ApiListener = require('./apiListener.js')
const DiscordBot = require('./discordBot.js')
const EventEmitter = require('events').EventEmitter

function Fuminator (options) {
  this.config = options.config
  this.apiChannel = options.apiChannel

  this.start = function () {
    this.apiListener = new ApiListener(this.apiChannel)
    this.discordBot = new DiscordBot(this.config.discord)
    this.discordBot.discordInit()
    this.discordBot.on('bot:ready', () => {
      console.log('Channel listener is starting')
      this.registerApiChannel()
    })
  }

  this.registerApiChannel = function () {
    console.log('Registering ' + this.apiChannel.name + ' api channel')
    this.registerApiChannelListener()
    this.apiListener.startSubscribe(this.config.interval)
    this.registerCommandListener()
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

  this.keyValueChangeHandler = function (keyValue) {
    this.sendMessage(this.apiChannel.key.prefix + ' ' + keyValue)
  }

  this.registerCommandListener = function () {
    this.discordBot.on('message:received', (channelId, message) => {
      if (this.apiChannel.discordChannel === channelId) {
        let checkedCommand = this.isCommand(message.content)
        if (checkedCommand) {
          this.processCommand(message)
        }
      }
    })
  }

  this.processCommand = function (message) {
    let commands = this.apiChannel.commands

    for (let i = 0; i < commands.length; i++) {
      let command = commands[i]
      if (this.trimCommand(message.content) === command.command) {
        this.defaultCommandHandler(command,
          this.apiListener.getValueFromResponse(command.location))
        return
      }
    }
    this.emit('cmd:received', this.apiChannel, message)
  }

  this.defaultCommandHandler = function (command, keyValue) {
    this.sendMessage(command.prefix + keyValue)
  }

  this.trimCommand = function (content) {
      return content.substring(2)
  }

  this.isCommand = function (content) {
    return content.substring(0, 2) === this.config.discord.commandPrefix
  }
  this.sendMessage = function (msgContent, file) {
      console.log(msgContent)
    this.discordBot.sendMessage(this.apiChannel.discordChannel, this.apiChannel.name, msgContent, file)
  }
}

util.inherits(Fuminator, EventEmitter)
module.exports = Fuminator
