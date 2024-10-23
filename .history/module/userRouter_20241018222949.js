const express = require('express')
const router = express.Router()


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

// 修改用户信息
app.post('/set_user_info',async(req,res)=>{
    let result = await set_user_info(req.body.form)
    res.send(result)
})


// 获得点赞数量
app.get('/getlikeNum',async(req,res)=>{
    let result = await get_like_num(req.query.id)
    res.send(result)
})

module.exports = router