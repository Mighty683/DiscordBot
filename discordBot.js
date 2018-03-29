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

  this.sendMessage = function (channelId, channelName, msgContent, file) {
    this.getDiscordChannel(channelId).send(this.getMsgEmbed(this.getMsgTitle(channelName), msgContent, file))
  }

  this.getMsgEmbed = function (title, msgContent, file) {
      let embed = new Discord.RichEmbed()
        .setColor(0x00AE86)
        .setFooter('Fuminator made by Migum')
      if (file) {
          embed.setTitle(msgContent)
          embed.attachFile(file)
          embed.setImage('attachment://' + file.name)
      } else {
          embed.setTitle(title)
          embed.setDescription(msgContent)
      }
      return embed
  }


    this.getMsgTitle = function (channelName) {
      return this.config.messagePrefix + channelName
    }
}

util.inherits(DiscordBot, EventEmitter)
module.exports = DiscordBot
