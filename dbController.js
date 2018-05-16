const MongoClient = require('mongodb').MongoClient
const util = require('util')
const EventEmitter = require('events').EventEmitter

function DBController (options) {
  this.config = options
  this.connectDB = function () {
    MongoClient.connect(this.config.url, {
      auth: {
        user: this.config.user,
        password: this.config.password
      }}, (err, client) => {
      if (!err) {
        this.emit('db:connected', client)
        console.log(`DB connection: ${this.config.url}`)
      } else {
        console.log(err)
      }
    })
  }

  this.checkAndCreateDoc = function (collection, data, query, name) {
    collection.find(query).next((err, doc) => {
      if (!err) {
        if (doc) {
          console.log(`DB:${name}:doc:exists`)
          this.emit(`DB:${name}:doc:created`, doc, collection.find(query))
        } else {
          console.log(`DB:${name}:doc:created`)
          collection.insertOne(data, (err, doc) => {
            if (!err) {
              this.emit(`DB:${name}:doc:created`, doc.ops[0], collection.find(query))
            }
          })
        }
      } else {
        console.log('Doc access error!')
      }
    })
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
