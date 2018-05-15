const MongoClient = require('mongodb').MongoClient
const util = require('util')
const EventEmitter = require('events').EventEmitter

function DBController (options) {
  this.config = options

  this.init = function () {
    this.on('db:connected', function (client) {
      this.createCollection(client.db('fuminator'))
    }.bind(this))
    this.connectDB()
  }

  this.connectDB = function () {
    MongoClient.connect(this.config.url, function (err, client) {
      if (!err) {
        this.emit('db:connected', client)
        console.log('DB connection: ' + this.config.url)
      } else {
        console.log(err)
      }
    }.bind(this))
  }
  this.createCollection = function (db) {
    db.listCollections().toArray(function (err, list) {
      if (!err) {
        if (!list.map((el) => { return el.name }).includes('channels')) {
          db.createCollection('channels', function (err, res) {
            if (!err) {
              console.log('Collection channels created!')
            }
          })
        } else {
          console.log('Collection already exists!')
        }
      } else {
        console.log(err)
      }
    })
  }
  this.close = function () {
    this.client.close()
  }
}

util.inherits(DBController, EventEmitter)
module.exports = DBController
