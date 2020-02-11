const express = require('express')
const router = new express.Router()

const Task = require('../models/task')
const auth = require('../middlewares/auth')

//TASK
router.post('/task', auth, async (req, res) => {
    // const task = new Task(req.body) we can use this 1 solution, withouth inserting user ID
    const task = new Task({
        ...req.body, //to copy property of body to the object
        owner: req.user._id //to get the owner id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(404).send(error)
    }

    //without asynnc await -> without try catch
    // task
    //     .save(task)
    //     .then(() => {
    //         res.status(201).send(task)
    //     }).catch((err) => {
    //         res.status(400).send(err.message)
    //     });
})

router.get('/task', auth, async (req, res) => {
    try {
        ///using q string
        const filterCompleted = req.query.completed
        console.log(filterCompleted)
        const correctInputs = ['true', 'false']
        const validateInput = correctInputs.includes(filterCompleted)

        if (!validateInput) {
            return res.send('put the correct value! false or true')
        }
        //to get filtered or you can chek the next route for different approach!
        if (filterCompleted) {
            const allTasks = await req.user.populate({
                path: 'mytasks',
                match: {
                    completed: filterCompleted
                }
            }).execPopulate()
            return res.status(200).send(allTasks.mytasks)
        }


        // const alltasks = await Task.find()
        // const alltasks = await Task.find({ owner: req.user._id })
        // orr we can use populate
        const alltasks = await req.user.populate('mytasks').execPopulate()
        res.status(200).send(alltasks.mytasks)
    } catch (error) {
        res.status(400).send(error)
    }
    // Task.find()
    //     .then((result) => {
    //         res.send(result)
    //     }).catch((err) => {
    //         res.send(err)
    //     });
})

//GET /tasks?completed=true
//GET /gettasks?limit=2&skip=2 // skip 2 firts row and show limit only 2
//GET /gettasks?sortBy=createdAt:desc //anything 
router.get('/gettasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true' //it can only retur true, if apart from it it would be false
        // it is so much like parsing
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        const gettasks = await req.user.populate({
            path: 'mytasks',
            match, //using shorthand syntax
            options: { //thi option provides limit and skips for paginations
                limit: parseInt(req.query.limit), //if not number, will let go
                skip: parseInt(req.query.skip),
                sort
                // sort: { //other version
                //     createdAt: 1 // createdaAt is based on column field. 1 for ascending, -1 for decending
                // }
            }
        }).execPopulate()
        console.log(gettasks.mytasks)
        res.send(gettasks.mytasks)
    } catch (error) {
        res.status(400).send(error)
    }
})

//GET TASK/id
router.get('/task/:idtask', auth, async (req, res) => {
    const _id = req.params.idtask
    console.log(_id)
    try {
        // const task = await Task.findById(_id) //wthh no auth
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) {
            return res.status(404).send('not found :(')
        }
        res.status(200).send(task)
    } catch (error) {
        res.status(400).send(error)
    }


    // Task.findById({ _id })
    //     .then((result) => {
    //         if (!result) {
    //             return res.status(404).send({ message: 'not found' })
    //         }
    //         res.status(200).send(result)
    //     }).catch((err) => {
    //         res.status(500).send(err)
    //     });
})


//Update task
router.patch('/task/:id', auth, async (req, res) => {
    const id = req.params.id
    const data = req.body

    const seeNewProperties = Object.keys(data)
    const taskproperties = ['description', 'completed']
    const isvalidPreperties = seeNewProperties.every((res) => {
        return taskproperties.includes(res)
    })

    if (!isvalidPreperties) {
        return res.status(500).send({ message: 'Bad Code woy' })
    }

    try {
        // const updatetask = await Task.findByIdAndUpdate(id, data, { new: true, runValidators: true })
        // const updatetask = await Task.findById(id)
        const updatetask = await Task.findOne({ _id: id, owner: req.user._id })

        if (!updatetask) {
            return res.status(404).send('No User found!')
        }

        seeNewProperties.forEach((res) => {
            updatetask[res] = data[res]
        })

        await updatetask.save()

        res.status(201).send(updatetask)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/task/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        // const deletetask = await Task.findByIdAndDelete(id)
        const deletetask = await Task.findOneAndDelete({ _id, owner: req.user._id })
        if (!deletetask) {
            return res.status(404).send({ message: 'id cannot find!' })
        }

        res.status(200).send(deletetask)
    } catch (error) {
        res.status(404).send(error)
    }
})

module.exports = router