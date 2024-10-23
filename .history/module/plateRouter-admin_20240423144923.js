// 导入express
const express = require('express')
// 创建路由对象
const router = express.Router()

const {
    get_plate_db_admin,
    set_plate_db_admin,
    add_plate_db_admin,
    rm_plate_db_admin
}  = require('../db/database.js')

// 获取板块信息
router.get('/get_plate_admin',async (req,res)=>{
    const result = await get_plate_db_admin()
    res.send(JSON.stringify(result))
})
//修改板块信息
router.post('/set_plate_admin',async (req,res)=>{
    const result = await set_plate_db_admin(req.body.form)
    res.send(JSON.stringify(result))
})
// 添加板块
router.post('/add_plate_admin',async (req,res)=>{
    const result = await add_plate_db_admin(req.body.form)
    res.send(JSON.stringify(result))
})
// 删除板块
router.post('/rm_plate_admin',async (req,res)=>{
    const result = await rm_plate_db_admin(req.body.form)
    res.send(JSON.stringify(result))
})

module.exports = router