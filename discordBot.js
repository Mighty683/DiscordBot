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
      this.emit('message:received', message)
    })
  }

  this.getmainChannel = function (id) {
    return this.client.channels.get(id)
  }

  this.sendMessage = function (msgContent) {
    let channel = msgContent.channelId ? this.getmainChannel(msgContent.channelId) : this.getmainChannel(this.config.commandChannel)
    if (channel) {
      channel.send(this.getMsgContent(msgContent))
    } else {
      console.log('Wrong Channel')
    }
  }

  this.getMsgContent = function (msgContent) {
    return typeof msgContent === 'string' ? msgContent : this.getMsgEmbed(msgContent)
  }

  this.getMsgEmbed = function (msgContent) {
    if (msgContent.string) {
      return msgContent.string
    } else {
      let embed = new Discord.RichEmbed()
        .setColor(0x00AE86)
        .setFooter(this.config.footer)
      msgContent.title && embed.setTitle(msgContent.title)
      msgContent.desc && embed.setDescription(msgContent.desc)
      if (msgContent.file) {
        embed.attachFile(msgContent.file)
        embed.setImage(`attachment://${msgContent.file.name}`)
      }
      return embed
    }
  }
}

util.inherits(DiscordBot, EventEmitter)
module.exports = DiscordBot
