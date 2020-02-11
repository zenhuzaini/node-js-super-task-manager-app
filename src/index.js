const express = require('express')
const app = express()
const port = process.env.PORT
//just to make usure it directly runs
require('./database/db')

const User = require('./models/user')
const Task = require('./models/task')

//ceating middleware
//middleware will be better in other file
// without miidleware: new request (post, get, etc) ->run route handler
//with middleware : new request (post, get) -> middleware (do something) -> run route handler
//we must put it before the registering routers

// app.use((req, res, next) => {
//     // console.log(req.method, req.path)
//     // next() //without next it will not be go to next router handler
//     if (req.method === 'GET') {
//         res.send('get rquest are disabled :)')
//     } else {
//         next()
//     }
// })

// app.use((req, res, next) => {
//     res.status(503).send('come back agai soon , we are under maintenance! :D')
// })

app.use(express.json()) //parse incoming json to object

//Routers
const userRouter = require('./router/user')
const taskRouter = require('./router/task')

//Rregistering ROUTERS
app.use(userRouter)
app.use(taskRouter)

//example multer
const multer = require('multer')
const upload = multer({
    dest: 'images'
})

app.post('/upload', upload.single('uploadkey'), (req, res) => {
    res.send()
})

app.listen(port, () => {
    console.log('sever connected connected to ', port)
})