require('dotenv').config()
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const morgan = require('morgan')
const path = require('path')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const errorHandler = require('errorhandler')

const port = process.env.PORT || 8080

// Bring in the routes for the API (delete the default routes)
const api = require('./app_api/routes/index.js')

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride())

if (app.get('env') === 'development') {
    app.use(errorHandler())
    app.use(morgan('dev'))
}
// Use the API routes when path starts with /api
app.use('/api', api)
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function (req, res, next) {
    res.sendFile('/public/index.html', { root: __dirname })
})

app.get('*', function (req, res) {
    res.sendFile('/public/index.html', { root: __dirname })
})

app.get('/*', function (req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('/public/index.html', { root: __dirname })
})

server.listen(port)
console.log("listening on port:" + port)

module.exports = app
