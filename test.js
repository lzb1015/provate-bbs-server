// const fs = require('fs')
// const path = require('path')
// platpath = path.resolve(__dirname,'./platData')
// fs.readdir(platpath,(err,files)=>{
//     console.log(files)
//     if(!files.includes('1002')){
//         fs.mkdir(platpath + '/1002',err=>{
//             if(err){
//                 console.log('创建失败')
//             }
//         })
//     }
// })

const {mysql_init} = require("./db/database")

// 对数据进行初始化
mysql_init()

// connection.query('SHOW DATABASES',(err,res)=>{
//     // console.log(err)
//     console.log(res)
// })
// console.log(connection)