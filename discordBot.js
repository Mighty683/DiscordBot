const Discord = require('discord.js')
const client = new Discord.Client()
const EventEmitter = require('events').EventEmitter;
const util = require('util');

function DiscordBot(config) {
  this.config = config
  this.discordInit = function () {
    client.login(this.config.token)
    client.on('ready', () => {
      console.log('Discordbot is ready')
      this.emit('bot:ready')
    })
    client.on('message', (message) => {
      var command = this.isMessageCommand(message.content)
      if (command) {
        this.emit('command:received', message.channel.id, command)
      }
    })
  }

  this.isMessageCommand = function (content) {
    return content.substring(0, 2) === this.config.commandPrefix ? content.substring(2) : undefined
  }

  this.getDiscordChannel = function (id) {
    return client.channels.get(id)
  }

  this.sendMessage = function (channelId, messageContent) {
    this.getDiscordChannel(channelId).send(messageContent)
  }
}

util.inherits(DiscordBot, EventEmitter);
module.exports = DiscordBot
