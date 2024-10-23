const fs = require('fs')
const multer = require('multer')

const express = require('express')
const router = express.Router()

const { 
    set_user_time,
    set_user_info,
    get_like_num,
    get_user_info_id,
} = require('../db/database')

// 设置用户最后登陆的时间
router.post('/set_login_time',async(req,res)=>{
    await set_user_time([req.body.time,req.body.uid])
    res.send('set login time success')
})


// 获取用户信息
router.post('/get_user_info',async(req,res)=>{
    console.log(req.body)
    let result = await get_user_info_id(parseInt(req.body.uid))
    console.log(result)
    res.send({
        id:result.id,
        nickName:result.nickName,
        icon:result.icon,
        gender:result.gender,
        identity:result.identity
    })
})

// 修改用户信息
router.post('/set_user_info',async(req,res)=>{
    let result = await set_user_info(req.body.form)
    res.send(result)
})


// 获得点赞数量
router.get('/getlikeNum',async(req,res)=>{
    let result = await get_like_num(req.query.id)
    res.send(result)
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
router.post('/userImg',userIcon.single('file'),(req,res)=>{
    res.send('userIcon is upload successfully')
})

// 对旧头像进行删除
router.get('/deluserIcon',(req,res)=>{
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

module.exports = router