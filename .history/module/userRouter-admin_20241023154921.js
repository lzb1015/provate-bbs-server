// 导入express
const express = require('express')
// 创建路由对象
const router = express.Router()
const jwt = require('jsonwebtoken')
const config = require('../config')


// 导入数据库操作
const {
    get_user_admin,
    login_db_admin,
    get_user_db_admin,
    set_user_db_islogin,
    set_user_info_db,
    set_user_admin_db,
    rm_user_admin_db
} = require('../db/database')

// 获取用户数据
router.get('/admin_getuser',async (req,res)=>{
    const result = await get_user_admin()
    // console.log(JSON.parse(JSON.stringify(result)))
    res.send(JSON.stringify(result))
})
// 管理员登录操作
router.post('/login_admin',async(req,res)=>{
    const name = req.body.name
    const password = req.body.password
    const result = await login_db_admin(name,password)
    // res.send(result)
    let token = generateToken(result[0].id, result[0].icon, result[0].nickName,result[0].identity)
    res.send(token)
})
// 根据id获取用户的信息
router.post('/get_user_info_admin',async(req,res)=>{
    const id = req.body.id
    const result = await get_user_db_admin(id)
    res.send(result)
})

// 更改用户是否可以登陆
router.post('/set_user_db_islogin',async(req,res)=>{
    set_user_db_islogin(req.body.id,req.body.islogin)
    res.send('update islogin success')
})

// 修改用户信息
router.post('/set_user_info_db',async(req,res)=>{
    set_user_info_db(req.body.form)
    res.send('update userInfo success')
})
// 设置用户为管理员
router.post('/set_user_admin_db',(req,res)=>{
    set_user_admin_db(req.body.id,req.body.identity)
    res.send('set administrator success')
})
// 删除用户
router.post('/rm_user_admin_db',(req,res)=>{
    rm_user_admin_db(req.body.id)
    res.send('delete user success')
})
module.exports =  router