// 进行连接数据库，对数据库进行初始化等
const mysql = require('mysql')
const fs = require('fs')
const path  = require('path')
// 数据库的连接配置
const dbConfig = {
    host:'localhost',
    user:'root',
    password:'2003010230'
}

// 要创建的项目所用的数据库的名字
const dbName = 'provate_test_bbs'

// 建立数据库的连接
const connection = mysql.createConnection(dbConfig)
// 进行连接
connection.connect(err=>{
    if(err){
        console.log('->Error connect MySQL')
    }
})

// 创建数据库 - 用于初始化
function createDatabase(){
    // 初始化数据的文件
    const dbFile = path.resolve(__dirname,'./data.sql')
    const fileValue = fs.readFileSync(dbFile,'utf-8')
    // console.log(fileValue)
    // 处理文件内容
    let lines = fileValue.split('\n');
    let sqlList = lines.filter(line => line.trim() !== '' && !line.trim().startsWith('--')).map(line => line.trim().replace(/;$/, ''))
    // console.log(sqlList)
    // 运行处理处理的sql语句
    for(const item of sqlList){
        connection.query(item)
    }
    // connection.query("CREATE DATABASE IF NOT EXISTS 'provate_test_bbs'")
    console.log('->数据库初始化成功！')
}

// 查看MySQL中有的库
// connection.query('SHOW DATABASES',(err,res)=>{
//     if(err) console.log(err)
//     console.log(res)
// })
// 数据库初始化
async function mysql_init(){
    // 检查provateBBS的库是否存在
    console.log('>>>正在进行数据库初始化')
    res = await new Promise((resolve,reject)=>{
        connection.query(`SHOW DATABASES LIKE '${dbName}'`,(err,res)=>{
            if(err){
                reject(err)
            }
            resolve(res)
        })
    })
    // 数据库不存在的时候，进行初始化数据库
    if(res.length===0){
        createDatabase(dbName)
    }else{
        connection.query(`USE ${dbName}`)
        console.log('-> 数据库已经存在,不需要重新创建')
    }
}


// // 获取板块列表
async function get_plate_db(){
    let mList = []
    let nList = []
    // 获得大板块的数据
    mList = await new Promise((resolve,reject)=>{
        connection.query('SELECT * FROM platem',(err,res)=>{
            if(err) reject(err)
            resolve(res)
        })
    })
    // 获得小板块的数据
    nList = await new Promise((resolve,reject)=>{
        connection.query('SELECT * FROM platen',(err,res)=>{
            if(err) reject(err)
            resolve(res)
        })  
    })
    // 对大板块和小板块的数据进行组合
    let result = mList.map(item=>{
        item.children = nList.filter(it=>it['parent_id'] === item.pid)
        return item
    })
    return result
}

// 获取帖子列表
async function get_post_db(reqObj={}){
    // console.log(reqObj)
    let sql = 'SELECT * from posts'
    if(reqObj.pid){
        sql+=` where pid = ${reqObj.pid}`
    }
    if(reqObj.cid){
        sql += ` and cid = ${reqObj.cid}`
    }
    // console.log(sql)
    let result = await new Promise((resolve,reject)=>{
        connection.query(sql,(err,res)=>{
            if(err) reject(err)
            resolve(res)
        })
    })
    return result
}


// 根据tid获取帖子得详细信息
async function get_post_detail(tid){
    let result = await new Promise((resolve,reject)=>{
        connection.query(`SELECT * from posts where tid = '${tid}'`,(err,res)=>{
            if(err) reject(err)
                resolve(res)
        })
    })
    return result
}

// 获取留言列表
async function get_leavel_db(){
    let result = await new Promise((resolve,reject)=>{
        connection.query(`SELECT * FROM leavel`,(err,res)=>{
            if(err) reject(err)
            resolve(res)
        })
    })
    return result
}

// 发表新帖子
async function add_new_post(obj){
    // console.log(obj)
    let result = await new Promise((resolve,reject)=>{
        connection.query("INSERT INTO posts(tid,title,abstract,content,create_time,tImg,pid,cid,uid)VALUES(?,?,?,?,?,?,?,?,?);",[obj.tid,obj.title,obj.abstract,obj.content,obj['create_time'],obj.tImg,obj.pid,obj.cid,obj.uid],(err)=>{
            if(err){
                reject(err)
            }
            resolve(res)
        })
    })
    return result
}

// 删除帖子
async function del_db_post(tid){
    let result = await new Promise((resolve,reject)=>{
        connection.query('DELETE FROM posts WHERE tid = ?',[tid],(err,res)=>{
            if(err) reject(err)
            resolve(res)
        })
    })
    return result
}

// 更改指定tid的点赞列表
async function update_db_post(obj){
    // console.log(obj)
    let result = await new Promise((resolve,reject)=>{
        connection.query("UPDATE posts SET `like`= ? WHERE `tid` = ?",[JSON.stringify(obj.like),obj.tid],(err,res)=>{
            if(err){
                reject(err)
            }
            resolve(res)
        })
    })
    return result
}

// 添加新的留言
async function add_db_leavel(list){
    let result = await new Promise((resolve,reject)=>{
        connection.query('INSERT INTO leavel (`lid`, `uid`, `tid`, `value`, `index`, `createTime`, `plid`) VALUES(?,?,?,?,?,?,?)',list,(err,res)=>{
            if(err){
                reject(err)
            }
            resolve(res)
        })
    })
    return result
}

// 删除留言
async function rm_db_leavel(lid){
    connection.query('DELETE FROM leavel WHERE lid = ?',[lid])
}

// 更新留言的点赞情况
function update_db_leavel(list){
    connection.query("UPDATE leavel SET `like`= ? WHERE `lid` = ?",[JSON.stringify(list.like),list.lid])
}

// 获取消息列表
async function get_msg_db(uid){
    // console.log(uid)
    let result = await new Promise((resolve,reject)=>{
        connection.query("SELECT * FROM message WHERE uid = ?",[uid],(err,res)=>{
            if(err) reject(err)    
            resolve(res)
        })
    })
    return result
}

// 改变消息的已读状态
async function change_msg_read_db(read,mid){
    let result = await new Promise((resolve,reject)=>{
        connection.query('UPDATE message SET isread = ? WHERE mid = ?',[read,mid],(err,res)=>{
            if(err)reject(err)
            resolve(res)
        })
    })
    return result
}

// 添加新消息
async function add_new_msg_db(obj){
    let result = await new Promise((resolve,reject)=>{
        connection.query('SELECT * from message WHERE uid = ? AND wid = ? AND type = ? AND lid = ? AND tid = ?',[obj.uid,obj.wid,obj.type,obj.lid,obj.tid],(error,result)=>{
            if(error){
                resolve(error)
            }
            if(result.length ===0){
                connection.query('INSERT INTO message VALUES(?,?,?,?,?,?,?)',[obj.mid,obj.uid,obj.wid,obj.lid,obj.type,obj.tid,obj.isread],(err,res)=>{
                    if(err) reject(err)
                    resolve(res)
                })
            }else{
                resolve(result)
            }
        })
    })
    return result
}

// 根据uid  获取用户的信息
async function get_user_info_id(id){
    // console.log(id)
    let res = await new Promise((resolve,reject)=>{
        connection.query(`select * from user where id ='${id}'`,(err,res)=>{
            if(err){
                reject(err)
            }
            // console.log(res)
            resolve(res[0])
        })
    })
    return res
}

// 获取所有用户的基本信息
async function get_user_db(){
    let res = await new Promise((resolve,reject)=>{
        connection.query('SELECT id,nickName,icon,introduction,create_time,lastLoginTime FROM user',(err,res)=>{
            if(err) reject(err)
            resolve(res)
        })
    })
    return res
}

// 查看检查用户的密码是否正确
async function login_db(obj){
    let res = await new Promise((resolve,reject)=>{
        connection.query('SELECT * FROM user WHERE name = ? AND password = ? AND `isLogin` = 1',[obj.name,obj.password],(err,res)=>{
            if(err) reject(err)
            resolve(res)
        })
    })
    return res
}

// 添加用户
async function add_user_db(obj){
    let res = await new Promise((resolve,reject)=>{
        connection.query('INSERT INTO user(`id`,`name`,`nickName`,`password`,`icon`,`create_time`) VALUES(?,?,?,?,?,?)',[obj.id,obj.name,obj.nickName,obj.password,obj.icon,obj['create_time']],(err,res)=>{
            if(err) reject(err)
            resolve(res)
        })
    })
    return res
}

// 更改用户密码
async function set_user_pwd(list){
    connection.query('UPDATE user SET password = ?  WHERE id = ?',list)
}

// 更改用户的基本信息
 function set_user_info(obj){
    connection.query('UPDATE user SET nickName = ?,icon = ?, gender = ?, introduction = ? WHERE id = ?',[obj.nickName,obj.icon,obj.gender,obj.introduction,obj.id])
}

// 更改用户最后登录的时间
function set_user_time(list){
    // console.log(list)
    connection.query('UPDATE user SET lastLoginTime = ? WHERE id = ?',list)
}

// 获取登录的用户的信息
async function get_login_user(id){
    let result = await new Promise((resolve,reject)=>{
        connection.query('SELECT * from user WHERE id = ?',[id],(err,res)=>{
            // if(err)
            if(err) reject(err)
            resolve(res)
        })
    })
    return result
}

// 检测账户是否存在
async function check_user_name(name){
    let result = await new Promise((resolve,reject)=>{
        connection.query('SELECT * from user WHERE name = ?',[name],(err,res)=>{
            if(err) reject(err)
            resolve(res)
        })
    })
    return result
}

// 获取点赞数量
async function get_like_num(id){
    let result = await new Promise((resolve,reject)=>{
        connection.query("SELECT * from message WHERE ( uid = ? AND  `type`='like_leavel' ) OR ( uid = ? AND `type`='post' )",[id,id],(err,res)=>{
            if(err)reject(err)
            resolve(res)
        })
    })
    return result
}

// 关闭连接
// function close_db(){
//     connection.end()
// }

// ------------------------------------------------------后台管理端-------------------------------------------------------------------
// 后台的请求

// 获得用户的数据
async function get_user_admin(){
    let result = await new Promise((resolve,reject)=>{
        connection.query("SELECT * FROM user",(err,res)=>{
            if(err)reject(err)
            resolve(res)
        })
    })
    return result
}

// 进行后台登陆功能
async function login_db_admin(name,pwd){
    // console.log(name,pwd)
    let result = await new Promise((resolve,reject)=>{
        connection.query("SELECT * FROM user WHERE (name = ? AND password = ? AND `identity` = 'root' AND `isLogin` = 1) OR (name = ? AND password = ? AND `identity` = 'adminstrator' AND `isLogin` = 1)", [name,pwd,name,pwd],(err,res)=>{
            if(err)reject(err)
            // console.log(res)
            resolve(res)
        })
    })
    return result
}
// 根据id获得用户的信息
async function get_user_db_admin(id){
    // console.log(id)
    let result = await new Promise((resolve,reject)=>{
        connection.query("SELECT * FROM user WHERE id = ?",[id],(err,res)=>{
            if(err)reject(err)
            resolve(res)
        })
    })
    return result
}

// 根据id，设置用户的允许登陆情况
function set_user_db_islogin(id,islogin){
    connection.query("UPDATE user SET isLogin = ? WHERE id = ?",[islogin,id])
}

// 修改用户信息
function set_user_info_db(form){
    connection.query("UPDATE user SET nickName = ?,password =?,icon=? WHERE id =?",[form.nickName,form.password,form.icon,form.id])
}

// 设置用户为普通用户或者管理员
function set_user_admin_db(id,identity){
    connection.query('UPDATE user SET identity = ? WHERE id =?',[identity,id])
}

// 删除用户
function rm_user_admin_db(id){
    connection.query('DELETE FROM user WHERE id = ?',[id])
}

// 获取板块信息
async function get_plate_db_admin(){
    let mList = []
    let nList = [] 
    mList = await new Promise((resolve,reject)=>{
        connection.query('SELECT * FROM platem',(err,res)=>{
            if(err)reject(err)
            resolve(res)
        })
    })
    nList = await new Promise((resolve,reject)=>{
        connection.query('SELECT * FROM platen',(err,res)=>{
            if(err)reject(err)
            resolve(res)
        })
    })
    let result = mList.map(item=>{
        item.children = nList.filter(it=>it['parent_id'] === item.pid)
        return item
    })
    return result
}

// 修改板块信息
function set_plate_db_admin(form){
    // console.log(form)
    if(form.table === 'platem'){
        connection.query('UPDATE platem set name = ? WHERE pid =?',[form.name,form.id])
    }else{
        connection.query('UPDATE platen set name = ?,parent_id = ? WHERE cid = ?',[form.name,form.parent_id,form.id])
    }
    return get_plate_db_admin()
}

// 添加新板块
function add_plate_db_admin(form){
    const newId = + new Date()
    if(form.table === 'platem'){
        connection.query("insert into `platem`(`pid`,`name`)values(?,?)",[newId,form.name])
    }else{
        connection.query("insert into `platen`(`cid`,`name`,`parent_id`)values(?,?,?)",[newId,form.name,form.parent_id])
    }
    return get_plate_db_admin()
}
// 删除板块
function rm_plate_db_admin(form){
    if(form.table === 'platem'){
        connection.query('DELETE FROM platem WHERE pid =?',[form.id])
    }else{
        connection.query('DELETE FROM platen WHERE cid =?',[form.id])
    }
    return get_plate_db_admin()
}

// 获取帖子数据
async function get_post_db_admin(){
    let result = await new Promise((resolve,reject)=>{
        connection.query('SELECT * from posts',(err,res)=>{
            if(err)reject(err)
            resolve(res)
        })
    })
    return result
}
// 修改帖子内容
function set_post_db_admin(obj){
    connection.query('UPDATE posts SET title =?,abstract = ?,content=?,pid=?,cid=? WHERE tid =?',[obj.title,obj.abstract,obj.content,obj.pid,obj.cid,obj.tid])
}
// 删除帖子
function rm_post_db_admin(tid){
    connection.query('DELETE FROM posts WHERE tid =?',[tid])
}

// 获得留言数据
async function get_leavel_db_admin(){
    let result = await new Promise((resolve,reject)=>{
        connection.query('SELECT * FROM leavel',(err,res)=>{
            if(err)reject(err)
            resolve(res)
        })
    })
    return result
}

// 修改留言内容
function set_leavel_db_admin(obj){
    connection.query('UPDATE leavel SET value =? WHERE lid =?',[obj.value,obj.lid])
}
// 删除留言
function rm_leavel_db_admin(lid){
    connection.query('DELETE FROM leavel WHERE lid =?',[lid])
}

// 获取日志
async function get_logs_db_admin(){
    let result = await new Promise((reslove,reject)=>{
        connection.query('SELECT * FROM logs',(err,res)=>{
            if(err)reject(err)
            reslove(res)
        })
    })
    return result
}

// 创建日志事件
function set_logs_db(obj){
    connection.query('INSERT INTO `logs`(`uid`,`create_time`,`value`,`identity`)VALUES(?,?,?,?)',[obj.uid,obj.create_time,obj.value,obj.identity])
}

// 将模块导出
module.exports = {
    mysql_init,
    get_plate_db,
    get_post_db,
    get_leavel_db,
    add_new_post,
    update_db_post,
    add_db_leavel,
    rm_db_leavel,
    update_db_leavel,
    get_msg_db,
    change_msg_read_db,
    add_new_msg_db,
    set_user_info,
    set_user_pwd,
    set_user_time,
    get_user_db,
    add_user_db,
    login_db,
    get_login_user,
    check_user_name,
    get_like_num,
    del_db_post,
    get_user_info_id,
    get_post_detail,
    // 后台请求
    get_user_admin,
    login_db_admin,
    get_user_db_admin,
    set_user_db_islogin,
    set_user_info_db,
    set_user_admin_db,
    rm_user_admin_db,
    get_plate_db_admin,
    set_plate_db_admin,
    add_plate_db_admin,
    rm_plate_db_admin,
    get_post_db_admin,
    set_post_db_admin,
    rm_post_db_admin,
    get_leavel_db_admin,
    set_leavel_db_admin,
    rm_leavel_db_admin,
    get_logs_db_admin,
    set_logs_db
}