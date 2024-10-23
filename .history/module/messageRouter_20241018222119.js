const express = require('express')
const router = express.Router()

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


module.exports = router