// 导入express
const express = require('express')
// 创建路由对象
const router = express.Router()

const { 
    get_logs_db_admin,
    set_logs_db
} = require('../db/database')

router.get('/get_logs_admin',async (req,res)=>{
    let result = await get_logs_db_admin()
    res.send(JSON.stringify(result))
})

router.post('/set_logs',(req,res)=>{
    set_logs_db(req.body.obj)
    res.send('insert log success')
})

module.exports = router