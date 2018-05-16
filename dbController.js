const MongoClient = require('mongodb').MongoClient
const util = require('util')
const EventEmitter = require('events').EventEmitter

function DBController (options) {
  this.config = options
  this.connectDB = function () {
    MongoClient.connect(this.config.url, (err, client) => {
      if (!err) {
        this.emit('db:connected', client)
        console.log(`DB connection: ${this.config.url}`)
      } else {
        console.log(err)
      }
    })
  }

  this.findDoc = function (collection, doc) {
    return this.find(doc)
  }

  this.createDoc = function (collection, doc) {

  }

  this.createCollection = function (db, name) {
    db.collection(name, (err, collection) => {
      if (!err) {
        if (!collection) {
          db.createCollection(name, (err, res) => {
            if (!err) {
              this.emit('collection:set', res)
              console.log('Collection channels created!')
            }
          })
        } else {
          this.emit('collection:set', collection)
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
