const express = require('express')
const router = express.Router()

const {
    get_plate_db,
    add_db_leavel,
    update_db_leavel,
    rm_db_leavel,
    get_post_detail
 } = require('../db/database')

// 获取帖子板块的请求
router.get('/get_plate',async (req,res)=>{
    const result = await get_plate_db()
    // console.log(result)
    res.send(JSON.stringify(result))
})


// 更新留言数据
router.post('/add_leavel',async(req,res)=>{
    // console.log(req.body.list)
    await add_db_leavel(req.body.list)
    res.send('add leavel success')
})

// 更新留言的点赞数据
router.post('/update_leavel',(req,res)=>{
    update_db_leavel(req.body.list)
    res.send('update leavel success')
})

// 删除留言
router.post('/del_leavel',(req,res)=>{
    rm_db_leavel(req.body.lid)
    res.send('delete leavel success')
})

module.exports = router