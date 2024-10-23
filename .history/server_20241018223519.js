const express = require('express')
const app = express()
const {
    mysql_init,
    login_db,
    get_login_user,
    add_user_db,
    check_user_name,
} = require("./db/database")
const bodyParser = require('body-parser')
// 导入路由模块
const userRouter_admin = require('./module/userRouter-admin')
const plateRouter_admin = require('./module/plateRouter-admin')
const postRouter_admin = require('./module/postRouter-admin')
const leavelRouter_admin = require('./module/leavelRouter-admin')
const logRouter_admin = require('./module/logRouter-admin')

const postRouter = require('./module/postRouter')
const leavelRouter = require('./module/leavelRouter')
const messageRouter = require('./module/messageRouter.js')
const userRouter = require('./module/userRouter')

const jwt = require('jsonwebtoken')
const config = require('./config')

// 对数据库进行初始化
;(async ()=>{
    await mysql_init();
})()


app.use(bodyParser.json())

// 设置运行跨域请求
app.use((req, res, next) => {
    //设置跨域运行请求 
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next()
})

// 开启静态资源
app.use(express.static('platData'))
app.use(express.static('userData'))
app.use(express.static('banners'))

// 使用路由模块
app.use(userRouter_admin)
app.use(plateRouter_admin)
app.use(postRouter_admin)
app.use(leavelRouter_admin)
app.use(logRouter_admin)

app.use(postRouter)
app.use(leavelRouter)
app.use(messageRouter)
app.use(userRouter)


// 登录
app.post('/login',async (req,res)=>{
    let name = req.body.name
    let pwd = req.body.pwd
    let result = await login_db({
        name:name,
        password:pwd
    })
    res.send(result)
})

// 获得已经登录的用户的信息
app.post('/get_login_user',async (req,res)=>{
    let result = await get_login_user(req.body.id)
    res.send(result)
})



// 注册新用户
app.post('/add_new_user',async(req,res)=>{
    let result = await add_user_db(req.body.form)
    res.send(result)
})

// 检测账户是否存在
app.post('/check_name',async(req,res)=>{
    let result = await check_user_name(req.body.name)
    res.send(result)
})



app.listen(3030,()=>{
    console.log('>>>服务器已启动')
})