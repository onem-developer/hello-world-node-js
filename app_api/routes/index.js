
const express = require('express')
const api = express.Router()
const jwt = require('jwt-simple')
const { loadTemplate } = require('onemsdk').parser
const { Response } = require('onemsdk')

const TEMPLATES_PATH = './app_api/templates/'

const templates = {
    LANDING_MENU : `${TEMPLATES_PATH}landing.pug`
}

/*
 * Middleware to grab user
 */
function getUser(req, res, next) {
    if (!req.header('Authorization')) {
        return res.status(401).send({ message: 'Unauthorized request' })
    }
    const token = req.header('Authorization').split(' ')[1]
    const payload = jwt.decode(token, process.env.TOKEN_SECRET)

    if (!payload) {
        return res.status(401).send({ message: 'Unauthorized Request' })
    }
    req.user = payload.sub
    next()
}

api.use(getUser)

/*
 * Routes
 */
// Landing menu
api.get('/', function (req, res) {
    let rootTag = loadTemplate(templates.LANDING_MENU)
    let response = Response.fromTag(rootTag)
    res.json(response.toJSON())
})

module.exports = api
