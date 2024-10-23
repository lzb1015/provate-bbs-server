const express = require('express')
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const app = express()
const {
    mysql_init,
    get_plate_db,
    get_post_db,
    get_leavel_db,
    add_new_post,
    update_db_post,
    add_db_leavel,
    update_db_leavel,
    get_msg_db,
    change_msg_read_db,
    rm_db_leavel,
    add_new_msg_db,
    set_user_time,
    get_user_db,
    login_db,
    get_login_user,
    set_user_info,
    add_user_db,
    check_user_name,
    get_like_num,
    del_db_post,
    get_post_detail
} = require("./db/database")
const bodyParser = require('body-parser')
// 导入路由模块
const userRouter_admin = require('./module/userRouter-admin')
const plateRouter_admin = require('./module/plateRouter-admin')
const postRouter_admin = require('./module/postRouter-admin')
const leavelRouter_admin = require('./module/leavelRouter-admin')
const logRouter_admin = require('./module/logRouter-admin')
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
// 获取帖子板块的请求
app.get('/get_plate',async (req,res)=>{
    const result = await get_plate_db()
    // console.log(result)
    res.send(JSON.stringify(result))
})



// 对留言变化成Object
function changeLeavel(list,index,plid = null){
    let result = []
    let flag = false
    list.forEach(item=>{
        if(item.index === index){
            flag = true
        }
    })
    if(!flag){
        return result
    }
    list.map(item=>{
        if(item.index === index && item.plid === plid){
            item.like = JSON.parse(item.like)
            result.push(item)
        }
    })
    index += 1
    for(const item of result){
        item.children = changeLeavel(list,index,item.lid)
    }
    return result
}

// 获取帖子的请求
app.get('/get_posts',async (req,res)=>{
    // 获取请求携带的参数
    let reqObj = JSON.parse(req.query.obj)
    // 获取指定参数的帖子的数据
    const posts = await get_post_db(reqObj)
    // 获取用户的数据
    const users = await get_user_db()
    const leavel = await get_leavel_db()

    let result = posts.map((item)=>{
        // 获取用户的昵称
        item.like = JSON.parse(item.like)
        item.name = users.find(it=>it.id === item.uid).nickName
        item.leavelNum = leavel.filter(it=>it.tid === item.tid).length
        return item
    })
    // console.log(result)
    if(reqObj.type === 'hot'){
        result.sort((a,b)=>b.like.length - a.like.length)
    }else if(reqObj.type === 'create'){
        result.sort((a,b)=>{
            return a['craete_time'] < b['create_time'] ? -1 : 1
        })
    }else{
        result.sort((a,b)=>{
            return a['create_time'] > b['create_time'] ? -1 : 1
        })
    }
    result = result.map(item=>{
        item.like = JSON.stringify(item.like)
        return item
    })
    result = result.slice((reqObj.pageIndex-1)*reqObj.currentPage,reqObj.pageIndex*reqObj.currentPage)
    // console.log(posts.length)
    return res.send(JSON.stringify({data:result,total_page:Math.ceil(posts.length / reqObj.currentPage)}))
})

// 获取用户帖子的请求
app.get('/get_user_posts',async(req,res)=>{
    // 要获得帖子数据的用户id
    let reqObj = JSON.parse(req.query.obj)
    // 获取指定参数的帖子的数据
    let posts = await get_post_db(reqObj)
    // 获取用户的数据
    const users = await get_user_db()
    const leavel = await get_leavel_db()
    // console.log(reqObj.type)
    posts = posts.map(item=>{
        item.like = JSON.parse(item.like)
        return item
    })
    let postNum = posts.filter(item=>item.uid === reqObj.uid).length
    let likeNum = posts.filter(item=>item.like.includes(reqObj.uid)).length
    if(reqObj.type === 'create'){
        posts = posts.filter(item=>item.uid === reqObj.uid)
    }else if(reqObj.type === 'leavel'){
        let tidList =[...new Set(leavel.filter(item=>item.uid === reqObj.uid).map(item=>item.tid))]
        // console.log(tidList)
        posts = tidList.map(item=>{
            let ls = posts.find(it=>it.tid === item)
            return ls
        })
        // console.log(posts)
    }else{
        posts = posts.filter(item=>item.like.includes(reqObj.uid))
    }

    let result = posts.map((item)=>{
        // 获取用户的昵称
        item.name = users.find(it=>it.id === item.uid).nickName
        item.leavelNum = leavel.filter(it=>it.tid === item.tid).length
        item.like = JSON.stringify(item.like)
        return item
    })
    result = result.slice((reqObj.pageIndex-1)*reqObj.currentPage,reqObj.pageIndex*reqObj.currentPage)
    // console.log(posts.length)
    return res.send(JSON.stringify({data:result,total_page:Math.ceil(posts.length / reqObj.currentPage),postNum,likeNum}))
})

// 获取帖子得详细信息
app.get('/get_post_detail',async(req,res)=>{
    // console.log(req.query)
    const tid = req.query.tid
    // 获取帖子详细信息
    let detail =await get_post_detail(tid)
    detail = detail[0]
    // 获取留言信息
    const leavel = await get_leavel_db()
    // 获取用户的数据
    const users = await get_user_db()
    let newLeavel = changeLeavel(leavel,-1)
    newLeavel = newLeavel.filter(item=>item.tid === parseInt(tid))
    detail['leave_list'] = newLeavel
    detail.userInfo = users.filter(item=>item.id === detail.uid)[0]
    // console.log(detail)
    return res.send(JSON.stringify(detail))
})


// 将数组打乱顺序
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
// 获取随机帖子（6条）
app.get('/get_random_post',async(req,res)=>{
    // 获取指定参数的帖子的数据
    let posts = await get_post_db()
    posts = shuffleArray(posts).map(item=>{
        return {
            tid:item.tid,
            title:item.title
        }
    })
    return res.send(JSON.stringify(posts.slice(0,6)))
})

//帖子搜索功能
app.get('/search_post',async(req,res)=>{
    // console.log(req.query)
    const str = req.query.str
    const pageIndex = req.query.pageIndex
    const currentPage = req.query.currentPage
    // 获取指定参数的帖子的数据
    let posts = await get_post_db()
    // 获取用户的数据
    const users = await get_user_db()
    const leavel = await get_leavel_db()

    let result = posts.map((item)=>{
        // 获取用户的昵称
        item.like = JSON.parse(item.like)
        item.name = users.find(it=>it.id === item.uid).nickName
        item.leavelNum = leavel.filter(it=>it.tid === item.tid).length
        return item
    })
    result = result.filter(item=>item.title.includes(str))
    let list = result.slice((pageIndex-1)*currentPage,pageIndex*currentPage)
    return res.send(JSON.stringify({
        data:list,
        total_page:Math.ceil(result.length / currentPage)
    }))
})

// 添加新帖子的请求
app.post('/add_post',async(req,res)=>{
    const form = req.body.form
    // console.log(form)
    add_new_post(form)
    res.send('add post success')
})


// 更新帖子点赞数据
app.post('/update_post',async(req,res)=>{
    await update_db_post(req.body.list)
    res.send('update post success')
})

// 删除对应帖子
app.post('/del_post',async(req,res)=>{
    // console.log(req.body.tid)
    await del_db_post(req.body.tid)
    res.send('del post success')
})

// 更新留言数据
app.post('/add_leavel',async(req,res)=>{
    // console.log(req.body.list)
    await add_db_leavel(req.body.list)
    res.send('add leavel success')
})

// 更新留言的点赞数据
app.post('/update_leavel',(req,res)=>{
    update_db_leavel(req.body.list)
    res.send('update leavel success')
})

// 删除留言
app.post('/del_leavel',(req,res)=>{
    rm_db_leavel(req.body.lid)
    res.send('delete leavel success')
})

// 获取消息列表
app.get('/get_message',async (req,res)=>{
    // console.log(req.query)
    // 获取指定参数的帖子的数据
    const posts = await get_post_db()
    // 获取用户的数据
    const users = await get_user_db()
    const leavel = await get_leavel_db()

    let result = await get_msg_db(parseInt(req.query.uid))
    // console.log(result)
    result = result.map(item=>{
        let uname  = users.find(it=>it.id === item.uid).nickName
        let wname = users.find(it=>it.id === item.wid).nickName
        let value = null
        if(item.type === 'post'){
            value  = posts.find(it=>it.tid === item.tid).title           
        }else{
            value = leavel.find(it=>it.lid === item.lid).value
        }
        return {
            mid:item.mid,
            value:value,
            tid:item.tid,
            wid:item.wid,
            uname,
            wname,
            isread:item.isread,
            type:item.type
        }
    })
    res.send(result)
})

// 更改消息的已读状态
app.post('/change_msg_read',async (req,res)=>{
    await change_msg_read_db(req.body.isread,req.body.mid)
    res.send('change msg read success')
})

// 添加新消息
app.post('/add_new_msg',async (req,res)=>{
    await add_new_msg_db(req.body.obj)
    res.send('add new msg success')
})

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

// 保持帖子内容的图片
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