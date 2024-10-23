// 导入express
const express = require('express')
// 创建路由
const router = express.Router()

const {
    get_leavel_db_admin,
    set_leavel_db_admin,
    rm_leavel_db_admin
} = require('../db/database')
// 获取留言数据
router.get('/get_leavel_admin',async (req,res)=>{
    let result =await get_leavel_db_admin()
    res.send(JSON.stringify(result))
})
// 修改留言内容
router.post('/set_leavel_admin',async (req,res)=>{
    set_leavel_db_admin(req.body.obj)
    res.send('Update the leavel success')
})
// 删除留言
router.post('/rm_leavel_admin',async(req,res)=>{
    rm_leavel_db_admin(req.body.lid)
    res.send('delete leavel success')
})

module.exports = router