// 导入express
const express = require('express')
// 创建路由对象
const router = express.Router()

const {
    get_post_db_admin,
    set_post_db_admin,
    rm_post_db_admin
} = require('../db/database.js')

// 获得数据
router.get('/get_post_admin',async (req,res)=>{
    const result = await get_post_db_admin()
    res.send(JSON.stringify(result))
})
// 修改信息
router.post('/set_post_info_admin',(req,res)=>{
    set_post_db_admin(req.body.obj)
    res.send('update post success')
})
// 删除帖子
router.post('/rm_post_admin',(req,res)=>{
    rm_post_db_admin(req.body.tid)
    res.send('delete post success')
})

module.exports = router
// get_post_admin