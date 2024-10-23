// 获取帖子板块的请求
app.get('/get_plate',async (req,res)=>{
    const result = await get_plate_db()
    // console.log(result)
    res.send(JSON.stringify(result))
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


// 更新留言数据
app.post('/add_leavel',async(req,res)=>{
    // console.log(req.body.list)
    await add_db_leavel(req.body.list)
    res.send('add leavel success')
})

// 更新留言的点赞数据
app.post('/update_leavel',(req,res)=>{
    update_db_leavel(req.body.list)
    res.send('update leavel success')
})

// 删除留言
app.post('/del_leavel',(req,res)=>{
    rm_db_leavel(req.body.lid)
    res.send('delete leavel success')
})