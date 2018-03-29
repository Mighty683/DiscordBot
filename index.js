const Channel = require('./channel.js')
const config = require('./config.json')

config.channels.forEach((apiChannel) => {
  var channel = new Channel({
    config: config,
    apiChannel: apiChannel
  })
  channel.start()
})
