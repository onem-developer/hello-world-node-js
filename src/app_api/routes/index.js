
const logger = require('debug-level')('todos')
const express = require('express')
const api = express.Router()
const mongoose = require('mongoose')
const ObjectId = require('mongoose').Types.ObjectId
const Service = require('onem-nodejs-api').Service
const TodoSchema = require('../models/Model').TodoSchema
const Todo = mongoose.model('todos', TodoSchema)
const jwt = require('jwt-simple')

const todo = new Service("TODO")

const landingMenu = todo.addMenu('./src/app_api/templates/todoLanding.pug')
landingMenu.header("TODO MENU")

const viewMenu = todo.addMenu('./src/app_api/templates/todoView.pug')
viewMenu.header("TODO VIEW")

const doneMenu = todo.addMenu('./src/app_api/templates/todoDone.pug')
doneMenu.header("TODO DONE")

const descForm = todo.addForm('./src/app_api/templates/todoDescriptionForm.pug')
descForm.header("TODO DESCRIPTION")

const dateForm = todo.addForm('./src/app_api/templates/todoDuedateForm.pug')
dateForm.header("TODO DUE DATE")

/*
 * Middleware to grab user
 */
function getUser(req, res, next) {
    if (!req.header('Authorization')) {
        logger.error("missing header")
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

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

const landingMenuData = async function(user) {
    return new Promise((resolve, reject) => {
        const result = {
            doneCount: 0,
            todoCount: 0,
            todos: [],
        }
        Todo.countDocuments({ user: user, status: 'done' }).then(function(count) {
            result.doneCount = count
            return Todo.countDocuments({ user: user, status: 'todo' })
        }).then(function(count) {
            result.todoCount = count
            return Todo.find({ user: user, status: 'todo' })
        }).then(function(todos) {
            result.todos = todos
            resolve(result)
        }).catch(function(error) {
            reject(error)
        })
    })
}

/*
 * Routes
 */
// Landing menu
api.get('/todo', getUser, async function (req, res) {
    landingMenu.data = await landingMenuData(req.user)
    res.json(landingMenu.render())
})

// Todo view menu
api.get('/todo/view/:id', getUser, function (req, res) {
    Todo.findOne({ _id: ObjectId(req.params.id) }).then(function (todo) {
       // viewMenu.data = todo
        viewMenu.data = todo
        res.json(viewMenu.render())
    })
})

api.get('/todoListdone', getUser, function (req, res) {
    Todo.find({ status: 'done', user: req.user }).then(async function(todos) {
        if (todos.length > 0) {
            doneMenu.data.todos = todos
            res.json(doneMenu.render())
        } else {
            landingMenu.data = await landingMenuData(req.user)
            landingMenu.data.preBody = "No tasks in done status"
            res.json(landingMenu.render())         
        }
    })
})

api.get('/todo/form/desc', getUser, function (req, res) {
    res.json(descForm.render())
})

api.put('/todoSetDuedate/:id', getUser, function (req, res) {
    Todo.findOneAndUpdate({ _id: ObjectId(req.params.id) },
        { $set: { dueDate: req.body.dueDate } },
        { new: true }).then(async function(todo) {
        landingMenu.data = await landingMenuData(req.user)
        res.json(landingMenu.render())
    })
})

api.put('/todoDone/:id', getUser, function (req, res) {
    Todo.findOneAndUpdate({ _id: ObjectId(req.params.id) },
        { $set: { status: 'done' } },
        { new: true }).then(async function(todo) {
        landingMenu.data = await landingMenuData(req.user)
        res.json(landingMenu.render())
    })
})

api.put('/todoTodo/:id', getUser, function (req, res) {
    Todo.findOneAndUpdate({ _id: ObjectId(req.params.id) },
        { $set: { status: 'todo' } },
        { new: true }).then(async function(todo) {
        landingMenu.data = await landingMenuData(req.user)
        res.json(landingMenu.render())
    })
})

api.delete('/todo/:id', getUser, function (req, res) {
    Todo.deleteOne({ _id: ObjectId(req.params.id) }).then(async function(todo) {
        landingMenu.data = await landingMenuData(req.user)
        res.json(landingMenu.render())
    })
})

api.post('/todoAddDesc', getUser, function (req, res) {
    logger.info("/todoAddDesc")
    let todo = new Todo()
    todo.user = req.user
    todo.taskDescription = capitalize(req.body.description)
    todo.status = 'todo'
    todo.save(function (err, todo) {
        dateForm.data.todo = todo
        res.json(dateForm.render())
    })
})

module.exports = api
