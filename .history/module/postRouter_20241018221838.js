// 导入express
const express = require('express')
// 创建路由
const router = express.Router()

const [
    add_new_post,
    update_db_post,
    del_db_post,
    get_post_detail
] = require('../db/database')

// 获取帖子的请求
router.get('/get_posts',async (req,res)=>{
    // 获取请求携带的参数
    let reqObj = JSON.parse(req.query.obj)
    // 获取指定参数的帖子的数据
    const posts = await get_post_db(reqObj)
    // 获取用户的数据
    const users = await get_user_db()
    const leavel = await get_leavel_db()

    let result = posts.map((item)=>{
        // 获取用户的昵称
        item.like = JSON.parse(item.like)
        item.name = users.find(it=>it.id === item.uid).nickName
        item.leavelNum = leavel.filter(it=>it.tid === item.tid).length
        return item
    })
    // console.log(result)
    if(reqObj.type === 'hot'){
        result.sort((a,b)=>b.like.length - a.like.length)
    }else if(reqObj.type === 'create'){
        result.sort((a,b)=>{
            return a['craete_time'] < b['create_time'] ? -1 : 1
        })
    }else{
        result.sort((a,b)=>{
            return a['create_time'] > b['create_time'] ? -1 : 1
        })
    }
    result = result.map(item=>{
        item.like = JSON.stringify(item.like)
        return item
    })
    result = result.slice((reqObj.pageIndex-1)*reqObj.currentPage,reqObj.pageIndex*reqObj.currentPage)
    // console.log(posts.length)
    return res.send(JSON.stringify({data:result,total_page:Math.ceil(posts.length / reqObj.currentPage)}))
})

// 获取用户帖子的请求
router.get('/get_user_posts',async(req,res)=>{
    // 要获得帖子数据的用户id
    let reqObj = JSON.parse(req.query.obj)
    // 获取指定参数的帖子的数据
    let posts = await get_post_db(reqObj)
    // 获取用户的数据
    const users = await get_user_db()
    const leavel = await get_leavel_db()
    // console.log(reqObj.type)
    posts = posts.map(item=>{
        item.like = JSON.parse(item.like)
        return item
    })
    let postNum = posts.filter(item=>item.uid === reqObj.uid).length
    let likeNum = posts.filter(item=>item.like.includes(reqObj.uid)).length
    if(reqObj.type === 'create'){
        posts = posts.filter(item=>item.uid === reqObj.uid)
    }else if(reqObj.type === 'leavel'){
        let tidList =[...new Set(leavel.filter(item=>item.uid === reqObj.uid).map(item=>item.tid))]
        // console.log(tidList)
        posts = tidList.map(item=>{
            let ls = posts.find(it=>it.tid === item)
            return ls
        })
        // console.log(posts)
    }else{
        posts = posts.filter(item=>item.like.includes(reqObj.uid))
    }

    let result = posts.map((item)=>{
        // 获取用户的昵称
        item.name = users.find(it=>it.id === item.uid).nickName
        item.leavelNum = leavel.filter(it=>it.tid === item.tid).length
        item.like = JSON.stringify(item.like)
        return item
    })
    result = result.slice((reqObj.pageIndex-1)*reqObj.currentPage,reqObj.pageIndex*reqObj.currentPage)
    // console.log(posts.length)
    return res.send(JSON.stringify({data:result,total_page:Math.ceil(posts.length / reqObj.currentPage),postNum,likeNum}))
})

// 对留言变化成Object
function changeLeavel(list,index,plid = null){
    let result = []
    let flag = false
    list.forEach(item=>{
        if(item.index === index){
            flag = true
        }
    })
    if(!flag){
        return result
    }
    list.map(item=>{
        if(item.index === index && item.plid === plid){
            item.like = JSON.parse(item.like)
            result.push(item)
        }
    })
    index += 1
    for(const item of result){
        item.children = changeLeavel(list,index,item.lid)
    }
    return result
}


// 获取帖子得详细信息
router.get('/get_post_detail',async(req,res)=>{
    // console.log(req.query)
    const tid = req.query.tid
    // 获取帖子详细信息
    let detail =await get_post_detail(tid)
    detail = detail[0]
    // 获取留言信息
    const leavel = await get_leavel_db()
    // 获取用户的数据
    const users = await get_user_db()
    let newLeavel = changeLeavel(leavel,-1)
    newLeavel = newLeavel.filter(item=>item.tid === parseInt(tid))
    detail['leave_list'] = newLeavel
    detail.userInfo = users.filter(item=>item.id === detail.uid)[0]
    // console.log(detail)
    return res.send(JSON.stringify(detail))
})


// 将数组打乱顺序
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
// 获取随机帖子（6条）
router.get('/get_random_post',async(req,res)=>{
    // 获取指定参数的帖子的数据
    let posts = await get_post_db()
    posts = shuffleArray(posts).map(item=>{
        return {
            tid:item.tid,
            title:item.title
        }
    })
    return res.send(JSON.stringify(posts.slice(0,6)))
})

//帖子搜索功能
router.get('/search_post',async(req,res)=>{
    // console.log(req.query)
    const str = req.query.str
    const pageIndex = req.query.pageIndex
    const currentPage = req.query.currentPage
    // 获取指定参数的帖子的数据
    let posts = await get_post_db()
    // 获取用户的数据
    const users = await get_user_db()
    const leavel = await get_leavel_db()

    let result = posts.map((item)=>{
        // 获取用户的昵称
        item.like = JSON.parse(item.like)
        item.name = users.find(it=>it.id === item.uid).nickName
        item.leavelNum = leavel.filter(it=>it.tid === item.tid).length
        return item
    })
    result = result.filter(item=>item.title.includes(str))
    let list = result.slice((pageIndex-1)*currentPage,pageIndex*currentPage)
    return res.send(JSON.stringify({
        data:list,
        total_page:Math.ceil(result.length / currentPage)
    }))
})

// 添加新帖子的请求
router.post('/add_post',async(req,res)=>{
    const form = req.body.form
    // console.log(form)
    add_new_post(form)
    res.send('add post success')
})


// 更新帖子点赞数据
router.post('/update_post',async(req,res)=>{
    await update_db_post(req.body.list)
    res.send('update post success')
})

// 删除对应帖子
router.post('/del_post',async(req,res)=>{
    // console.log(req.body.tid)
    await del_db_post(req.body.tid)
    res.send('del post success')
})

module.exports = router