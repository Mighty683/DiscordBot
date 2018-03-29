const Discord = require('discord.js')
const EventEmitter = require('events').EventEmitter
const util = require('util')

function DiscordBot (config) {
  this.config = config
  this.client = new Discord.Client()
  this.discordInit = function () {
    this.client.login(this.config.token)
    this.client.on('ready', () => {
      console.log('Discordbot is ready')
      this.emit('bot:ready')
    })
    this.client.on('message', (message) => {
      this.emit('message:received', message.channel.id, message)
    })
  }

  this.getDiscordChannel = function (id) {
    return this.client.channels.get(id)
  }

  this.sendMessage = function (channelId, messageContent) {
    this.getDiscordChannel(channelId).send(messageContent)
  }
}

util.inherits(DiscordBot, EventEmitter)
module.exports = DiscordBot
