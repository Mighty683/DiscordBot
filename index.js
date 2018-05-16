const Channel = require('./channel.js')
const config = require('./config.json')

function WakaiListenerInit (channel) {
  channel.on('message:received', (msg) => {
      if (msg.mentions.users.find(channel.isUserBot.bind(channel))) {
          if (msg.content.includes('slap')) {
              channel.sendMessage({channelId: msg.channel.id, string: 'Fuminator slaps ' + msg.author + '!'})
          }
      }
  })

  channel.on('fumi:cmd:received', () => {
      channel.sendMessage({
          title: 'Fumi na dziś',
          file: {
              attachment: '/home/migum/fuminatorData/' + Math.floor((Math.random() * 6) + 1) + '.jpg',
              name: 'fumi.jpg'
          }
      })
  })

  channel.on('help:cmd:received', (msg) => {
      channel.sendMessage({
          desc: 'f!fumi - random fumi quote\nf!hug - hugs!\nf!who - current radio dj\nf!song - current song title\nf!listeners - current number of listeners'
      })
  })
}

config.channels.forEach((apiChannel) => {
  var channel = new Channel({
    config: config,
    apiChannel: apiChannel
  })

  channel.on('hug:cmd:received', (msg) => {
    let userToHug = msg.mentions.users.first() || msg.author
    channel.sendMessage({channelId: msg.channel.id, string: 'Fuminator hug ' + userToHug + '!'})
  })



  if (channel.name === 'Wakai') {
    WakaiListenerInit(channel)
  }
  channel.start()
}

function start () {
  if (config.db) {
    let dbController = initDB()
    dbController.on('collection:set', (collection) => {
      config.channels.forEach((channel) => {
        dbController.on(`DB:${channel.name}:doc:created`, channelInit)
        dbController.checkAndCreateDoc(collection, channel, { name: channel.name }, channel.name)
      })
    })
  } else {
    config.channels.forEach(channelInit)
  }
}

start()
