const Discord = require('discord.js')
const EventEmitter = require('events').EventEmitter
const util = require('util')

function DiscordBot (config, token) {
  this.config = config
  this.token = token
  this.client = new Discord.Client()
  this.discordInit = function () {
    this.client.login(this.token)
    this.client.on('ready', () => {
      console.log('Discordbot is ready')
      this.emit('bot:ready')
    })
    this.client.on('message', (message) => {
      this.emit('message:received', message)
    })
  }

  this.getDiscordChannel = function (id) {
    return this.client.channels.get(id)
  }

  this.sendMessage = function (channelId, msgContent) {
    let channel = this.getDiscordChannel(channelId)
    if (channel) {
      this.getDiscordChannel(channelId).send(this.getMsgContent(msgContent))
    } else {
      console.log('Wrong Channel')
    }
  }

  this.getMsgContent = function (msgContent) {
    return typeof msgContent === 'string' ? msgContent : this.getMsgEmbed(msgContent)
  }

  this.getMsgEmbed = function (msgContent) {
    let embed = new Discord.RichEmbed()
      .setColor(0x00AE86)
      .setFooter(this.config.footer)
    msgContent.title && embed.setTitle(msgContent.title)
    msgContent.desc && embed.setDescription(msgContent.desc)
    if (msgContent.file) {
      embed.attachFile(msgContent.file)
      embed.setImage('attachment://' + msgContent.file.name)
    }
    return embed
  }
}

util.inherits(DiscordBot, EventEmitter)
module.exports = DiscordBot
