const express = require('express')
const router = new express.Router()
const bcrypt = require('bcryptjs')

//upload things
const multer = require('multer')
const sharp = require('sharp')

const { welcomeEmail, goodbyeEmail } = require('../emails/account')

const User = require('../models/user')

//set up middlewares
const auth = require('../middlewares/auth')


//USER
//post method
router.post('/user', async (req, res) => {
    // console.log(req.body)
    const user = new User(req.body)

    try {
        const token = await user.generateAuthToken()
        await user.save()

        welcomeEmail(user.email, user.name)

        res.status(201).send({ user, token })
    } catch (e) {
        res.status(404).send(e)
    }

    // user.save()
    //     .then(() => {
    //         res.status(201)
    //         res.send(user)
    //     })
    //     .catch((err) => {
    //         res.status(400).send(err)
    //     })
})

router.post('/user/logout', auth, async (req, res) => {
    try {
        const currentToken = req.token
        req.user.tokens = req.user.tokens.filter((res) => {
            return res.token !== currentToken
        })

        await req.user.save()
        res.send(`you've logged out!`)
    } catch (error) {
        res.status(500).send()
    }
})

router.post('/user/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(201).send('logged out from all devices!')
    } catch (error) {
        res.status(501).send(error)
    }
})

router.post('/user/login', async (req, res) => {
    try {
        const user = await User.FindByCredentials(req.body.email, req.body.password) //this function is made ourself
        const token = await user.generateAuthToken()
        // res.status(200).send({ user: user.getPublicInformation(), token })
        //or we can use this instead

        res.status(200).send({ user, token }) //because we have made it into toJSON

    } catch (err) {
        console.log(err)
        res.status(401).send({ err: err })
    }
})

//to get my profiles
router.get('/user/me', auth, async (req, res) => {
    try {
        res.send(req.user) //req.usr has attached to the auth middleware
    } catch (error) {
        res.send({ error: 'no data provided!' })
    }
})

//to retrieve all user
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.find()
        res.status(200).send(user)
    } catch (error) {
        res.status(404).send(error)
    }
    // User.find() // to return all values , to return based on something User.find({name:'zen'})
    //     .then((result) => {
    //         res.status(200).send(result)
    //     }).catch((err) => {
    //         res.status(404).send()
    //     });
})

router.get('/user/:id', async (req, res) => {
    const _id = req.params.id
    try {
        const user = await User.findById(_id)
        if (!user) {
            return res.status(404).send({ err: 'data not found', message: 'try other Id' })
        }
        res.status(200).send(user)
    } catch (error) {
        res.status(400).send(error)
    }

    // User.findById({ _id })
    //     .then((result) => {
    //         if (!result) {
    //             return res.status(404).send({ message: 'no data found' })
    //         }
    //         res.status(200).send(result)
    //     }).catch((err) => {
    //         res.send(err)
    //     });
})

router.patch('/user/nolongerneeded/:id', async (req, res) => {
    const id = req.params.id
    const updates = req.body

    const propertiesBody = Object.keys(req.body)
    const validProperties = ['name', 'password', 'email', 'age']
    const isValidInput = propertiesBody.every((res) => {
        return validProperties.includes(res)
    })

    if (!isValidInput) {
        return res.status(400).send('its not valid inputs')
    }

    try {
        console.log(id)
        //findbyidandupdate query bypass moongose options or method so that's why options are given.
        //moreover,it will bypass the midlleware
        // const updateUser = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }) //new, before save you replicate it to new

        //therefore we use more traditional
        const updateUser = await User.findById(id)
        propertiesBody.forEach((update) => updateUser[update] = req.body[update])
        await updateUser.save()

        if (!updateUser) {
            res.status(404).send('no id found')
        }
        res.status(200).send(updateUser)
    } catch (error) {
        console.log("eror bok")
        res.status(400).send(error)
    }
})

//use this instead, to get yourself
router.patch('/user/me', auth, async (req, res) => {
    const user = req.user
    const updatedData = req.body
    const getKeys = Object.keys(updatedData)

    const elementsNeeded = ['name', 'password', 'email', 'age']

    const checkNewInput = getKeys.every((res) => {
        return elementsNeeded.includes(res)
    })

    if (!checkNewInput) {
        return res.status.send({ err: 'must be appropriate inputs!' })
    }

    try {
        getKeys.forEach((res) => {
            user[res] = updatedData[res]
        })

        user.save()
        res.status(200).send(user)

    } catch (error) {
        res.status(500).send('cannot be found!')
    }

})

//AVATAR SECTIONS
//configuration for multer
const uploadAvatar = multer({
    // dest: 'public/images/avatar', this is used if we don't want to use database
    limits: {
        fileSize: 1000000 //it is equal 1 mb in bytes
    },
    fileFilter(req, file, thecallback) { //functions with 3 parameters
        if (!file.originalname.match(/\.(jpeg|png|jpg|gif)$/)) { //check regex in regex101.com
            return thecallback(new Error('the file type doesnt match'))
        }

        thecallback(undefined, true) //for accepted filter
    }
})

const middlewareUpload = uploadAvatar.single('forAvatar')

router.post('/user/me/avatar', auth, middlewareUpload, async (req, res) => {
    // req.user.avatar = req.file.buffer //change file to buffer and save it

    const bufferResized = await sharp(req.file.buffer).png().resize({ width: 250, height: 250 }).toBuffer()
    req.user.avatar = bufferResized
    await req.user.save()

    res.send(req.user) //to check binary : <img src="data:image/jpg;base64, binarycodehere >
}, (error, req, res, next) => { //for error handling
    res.status(404).send({ error: error.message })
})


router.delete('/user/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined // to make it empty
        await req.user.save()
        res.send()
    } catch (error) {
        res.send(error)
    }
})

//Show avata
//it will simply show the  images of specific user
router.get('/user/:id/avatar', async (req, res) => {
    try {
        const id = req.params.id
        const user = await User.findById(id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png') //this is automatically set to json 'application/json', but as we want to show image, we must set to image/jpg
        res.send(user.avatar) //check this route on browser
    } catch (error) {
        res.send(error)
    }
})



//NOT NEEDED
router.delete('/user/nolongerneeded/:id', async (req, res) => {
    const id = req.params.id
    try {
        const deleteuser = await User.findByIdAndDelete(id)
        if (!deleteuser) {
            return res.status(404).send({ message: 'user connot be found ' })
        }
        res.status(200).send(deleteuser)
    } catch (error) {
        res.status(500).send(error)
    }
})



//CHANGED TO
router.delete('/user/me', auth, async (req, res) => {
    try {
        const me = req.user
        goodbyeEmail(req.user.email, req.user.name)
        await req.user.remove() //better this instead of findByIdandDelete(req.user._id)
        res.status(200).send(me)
    } catch (error) {
        res.send(error)
    }

})

module.exports = router
