/*
 * @Author: your name
 * @Date: 2021-12-12 17:04:43
 * @LastEditTime: 2021-12-22 09:38:34
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \work\NodejsBlogSystem\routes\users.js
 */
const express= require('express')
const router = express.Router()
const bcrypt = require('bcryptjs');
const passport = require('passport')
const {User, validateUser} = require('../models/user')
const {checkAuthenticated, checkNotAuthenticated} = require('../middleware/auth')


router.get('/users/register', checkNotAuthenticated, (req, res) => {
    res.render('users/register.ejs')
})


router.post('/users/register', checkNotAuthenticated, async(req, res) => {

    const { error } = validateUser(req.body)

    if(error) {
        return res.render('users/register.ejs', {
            errors : error.details[0].message,
            name : req.body.name,
            email : req.body.email,
            password  : req.body.password,
            confirmPassword : req.body.confirmPassword
        })
    } 

    try {
        const user = new User({
            name : req.body.name,
            email : req.body.email,
            password  : req.body.password    
        })

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(user.password, salt)
        user.password = hashedPassword;
        await user.save()

        await req.flash('success_msg', "You are now registered and can login")
        res.redirect('/users/login')

    }   catch(error) {
        return res.render('users/register.ejs', {
            errors : error,
            name : req.body.name,
            email : req.body.email,
            password  : req.body.password,
            confirmPassword  : req.body.confirmPassword
        })
    }

})


// login form
router.get('/users/login', checkNotAuthenticated, (req, res) => {
    res.render('users/login.ejs')
})


// Login submit
router.post('/users/login', checkNotAuthenticated, (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/posts',
      failureRedirect: '/users/login',
      failureFlash: true // show failure msg using message : error 
    })(req, res, next);
  });
 
 

   // logout
 router.get('/users/logout', (req, res) => {
    req.logOut()
    req.flash('success_msg', ' Successfully logged out')
    res.redirect('/users/login')
 })

// // profile form
// router.get('/posts/profile', (req, res) => {
//     res.render('posts/profile.ejs')
// })


// //edit profile form
// router.get('/users/editprofile', (req, res) => {
//     res.render('users/editprofile.ejs')
// })

module.exports = router