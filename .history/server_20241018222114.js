const express = require('express')
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const app = express()
const {
    mysql_init,
    get_post_db,
    get_leavel_db,
    get_msg_db,
    change_msg_read_db,
    add_new_msg_db,
    set_user_time,
    get_user_db,
    login_db,
    get_login_user,
    set_user_info,
    add_user_db,
    check_user_name,
    get_like_num,
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


// 设置用户最后登陆的时间
app.post('/set_login_time',async(req,res)=>{
    await set_user_time([req.body.time,req.body.uid])
    res.send('set login time success')
})

//获取所有用户的基本信息
app.get('/get_all_user',async(req,res)=>{
    let result = await get_user_db()
    res.send(result)
})

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

// 修改用户信息
app.post('/set_user_info',async(req,res)=>{
    let result = await set_user_info(req.body.form)
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

// 获得点赞数量
app.get('/getlikeNum',async(req,res)=>{
    let result = await get_like_num(req.query.id)
    res.send(result)
})

// 生成随机数----------------------------
function getRandomNum(){
    // console.log(11)
    let num =Math.round(Math.random() * 1E9)
    return Date.now() + '-' + num
}

// 保存帖子内容的图片
let random = null
const storage_detail = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'platData/') //设置保存位置
    },
    filename:function(req,file,cb){
        // console.log(file)
        const ext = path.extname(file.originalname)
        random = getRandomNum()
        cb(null,random + ext ) //设置保存的名称
    }
})
const upload_detail = multer({storage:storage_detail})
app.post('/upload_img_detail',upload_detail.single('wangeditor-uploaded-image'),(req,res)=>{
    // console.log('1111')
    // console.log('帖子内容的图片')
    // console.log(req.body)
    const ext = path.extname(req.file.originalname)
    res.json({
        errno:0,
        data:{
            url:'http://192.168.30.10:3030/' + random + ext
        }
    })
})

// 封面请求----------------------------------
// 设置保存的路径，和随机生成文件名
const upload = multer({ 
    storage:multer.diskStorage({ 
        destination:`platData/`,
        filename:function(req,file,cb){;
            const ext = path.extname(file.originalname)
            cb(null,req.query.name + ext);
        }
    })
})

// 封面请求
app.post('/upload_img_postImg',upload.single('file'),(req,res)=>{
    
    res.send('file upload successfully')
    // res.end('1111')
})

// 提交时删除已经不存在的图片------------------------------
app.get('/clear_img',(req,res)=>{
    const rmList = req.query.list.split(',')
    for(const item of rmList){
        fs.rm('./platData/'+item,err=>{
            if(err){
                console.log('删除不存在的图片->> 删除失败')
                res.end('delete error')
            }
        })
    }
    res.send('Delete img success!')
})

// 设置用户头像保存的路径和图片名称
const userIcon = multer({
    storage:multer.diskStorage({
        destination:'userData/',
        filename:function(req,file,cb){
            cb(null,req.query.imgName)
        }
    })
})
// 进行头像上传
app.post('/userImg',userIcon.single('file'),(req,res)=>{
    res.send('userIcon is upload successfully')
})

// 对旧头像进行删除
app.get('/deluserIcon',(req,res)=>{
    // console.log(req.query)
    const oldIcon = req.query.oldIcon
    // console.log(oldIcon)
    // console.log(req.query.oldIcon)
    fs.rm('./userData/'+oldIcon,err=>{
        if(err){
            console.log('旧头像删除失败')
            res.end('delete error')
        }
    })
    res.send('delete old icon is successfully')
})

app.listen(3030,()=>{
    console.log('>>>服务器已启动')
})