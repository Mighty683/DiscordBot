const Channel = require('./channel.js')
const config = require('./config.json')
const DBConstroller = require('./dbController.js')

function initDB () {
  let dbController = new DBConstroller(config.db)
  dbController.on('db:connected', (client) => {
    dbController.createCollection(client.db('fuminator'), config.db.channelsCollection)
  })
  dbController.connectDB()
  return dbController
}

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

function A24ListenerInit (channel) {
  channel.on('help:cmd:received', (msg) => {
    channel.sendMessage({
      desc: 'f!hug - hugs!\nf!who - current radio dj\nf!song - current song title\nf!listeners - current number of listeners',
      channelId: msg.channel.id
    })
  })
}

function channelInit (apiChannel, dbDocConnection) {
  var channel = new Channel({
    apiChannel: apiChannel,
    dbDocConnection: dbDocConnection
  })

  channel.on('hug:cmd:received', (msg) => {
    let userToHug = msg.mentions.users.first() || msg.author
    channel.sendMessage({channelId: msg.channel.id, string: 'Fuminator hug ' + userToHug + '!'})
  })

  if (channel.name === 'Wakai') {
    WakaiListenerInit(channel)
  } else {
    A24ListenerInit(channel)
  }
  channel.start()
}

function start () {
  let dbController = initDB()
  dbController.on('collection:set', (collection) => {
    config.channels.forEach((channel) => {
      collection.find({name: channel.name}).next((err, doc) => {
        if (!err) {
          if (doc) {
            console.log(`DB:${channel.name}:doc:exists`)
            channelInit(doc, collection.find({name: channel.name}))
          } else {
            console.log(`DB:${channel.name}:doc:created`)
            collection.insertOne(channel, (err, doc) => {
              if (!err) {
                channelInit(doc.ops[0], collection.find({name: channel.name}))
              }
            })
          }
        } else {
          console.log('Doc access error!')
        }
      })
    })
  })
}

start()
