'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const https = require('https')
const mongoose = require('mongoose')
const fs = require('fs')
require('dotenv').config()

const key = fs.readFileSync('selfsigned.key')
const cert = fs.readFileSync('selfsigned.crt')
const options = {
  key: key,
  cert: cert
}

const apiRoutes = require('./routes/api.js')
const fccTestingRoutes = require('./routes/fcctesting.js')
const runner = require('./test-runner')

// -- Mongo db Atlas connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
console.log('> connection db ✅')

const app = express()

app.use('/public', express.static(process.cwd() + '/public'))

app.use(cors({ origin: '*' })) // USED FOR FCC TESTING PURPOSES ONLY!

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html')
  })

// For FCC testing purposes
fccTestingRoutes(app)

// Routing for API
apiRoutes(app)

// 404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found')
})

const server = https.createServer(options, app)

server.listen(3000, () => {
  console.log('Server https listening on port : ' + 3000)
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...')
    setTimeout(function () {
      try {
        runner.run()
      } catch (e) {
        console.log('Tests are not valid:')
        console.error(e)
      }
    }, 1500)
  }
})

// Start our server and tests!
// const listener = app.listen(process.env.PORT || 3000, function () {
//   console.log('Your app is listening on port ' + listener.address().port)
//   if (process.env.NODE_ENV === 'test') {
//     console.log('Running Tests...')
//     setTimeout(function () {
//       try {
//         runner.run()
//       } catch (e) {
//         console.log('Tests are not valid:')
//         console.error(e)
//       }
//     }, 1500)
//   }
// })

module.exports = app // for unit/functional testing
