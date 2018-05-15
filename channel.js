const util = require('util')
const ApiListener = require('./apiListener.js')
const DiscordBot = require('./discordBot.js')
const EventEmitter = require('events').EventEmitter

function Fuminator (options) {
  this.config = options.config
  this.apiChannel = options.apiChannel

  this.start = function () {
    this.apiListener = new ApiListener(this.apiChannel)
    this.discordBot = new DiscordBot(this.apiChannel.discord)
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
    this.sendMessage({
      channelId: this.apiChannel.discord.mainChannel,
      title: this.getMsgTitle(),
      desc: this.apiChannel.key.prefix + ' ' + keyValue
    })
  }

  this.registerCommandListener = function () {
    this.discordBot.on('message:received', (message) => {
      if ((this.apiChannel.discord.commandChannel && this.apiChannel.discord.commandChannel === message.channel.id) ||
        (!this.apiChannel.discord.commandChannel && this.apiChannel.discord.discordServer === message.guild.id)) {
        let checkedCommand = this.isCommand(message.content)
        if (checkedCommand) {
          this.processCommand(message)
        } else {
          this.emit('message:received', message)
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
          this.apiListener.getValueFromResponse(command.location),
          message)
        return
      }
    }
    this.emit(this.trimCommand(message.content) + ':cmd:received', message)
  }

  this.defaultCommandHandler = function (command, keyValue, message) {
    this.sendMessage({
      title: this.getMsgTitle(),
      desc: command.prefix + keyValue,
      channelId: message.channel.id
    })
  }

  this.trimCommand = function (content) {
    return content.split(' ')[0].substring(2)
  }

  this.isCommand = function (content) {
    return content.substring(0, 2) === this.apiChannel.discord.commandPrefix
  }

  this.sendMessage = function (msgContent, file) {
    this.discordBot.sendMessage(msgContent, file)
  }

  this.isUserBot = function (user) {
    return user.id === this.discordBot.client.user.id
  }

  this.getMsgTitle = function () {
    return this.apiChannel.discord.messagePrefix + this.apiChannel.name
  }
}

util.inherits(Fuminator, EventEmitter)
module.exports = Fuminator
