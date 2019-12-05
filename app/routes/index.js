var express = require('express');
var router = express.Router();

//使用数据库模型
var Content = require('../models/Content');
//在线用户
var onlineUsers = {};
//当前在线人数
var onlineCount = 0;
//初始化时间
var time = '';
//获取时间模块
var getcurrenttime = require('../gettime');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/*socket内容*/
router.io = function(io){
  io.on('connection', function(socket){
    console.log('a user connected');
    //监听新用户加入
    socket.on('login', function(obj){
    //将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
    socket.name = obj.userid;
    time = getcurrenttime();
    //检查在线列表，如果不在里面就加入
    if(!onlineUsers.hasOwnProperty(obj.userid)) {
        onlineUsers[obj.userid] = obj.username;
    //在线人数+1
        onlineCount++;
    }     
    //向所有客户端广播用户加入
    io.emit('login', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj, time:time});
    var content = new Content({
      issystem: 'yes',
      userid: obj.userid,
      username: obj.username,
      time: time,
      content: obj.username+'加入了聊天室'
    });
    content.save((err)=>{ //添加进数据库
      if(err){
        console.log('save status:', err ? 'failed' : 'success');
      }
    });
    //console.log(obj.username+'加入了聊天室');
    });
     
    //监听用户退出
    socket.on('disconnect', function(){
        time = getcurrenttime();
        //将退出的用户从在线列表中删除
        if(onlineUsers.hasOwnProperty(socket.name)) {
            //退出用户的信息
            var obj = {userid:socket.name, username:onlineUsers[socket.name]};           
            //删除
            delete onlineUsers[socket.name];
            //在线人数-1
            onlineCount--;            
            //向所有客户端广播用户退出
            io.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj, time:time});
            var content = new Content({
              issystem: 'yes',
              userid: obj.userid,
              username: obj.username,
              time: time,
              content: obj.username+'退出了聊天室'
            });
            content.save((err)=>{ //添加进数据库
              if(err){
                console.log('save status:', err ? 'failed' : 'success');
              }
            });
            //console.log(obj.username+'退出了聊天室');
        }
    });    
    //监听用户发布聊天内容
    socket.on('message', function(obj){
        time = getcurrenttime();
        //向所有客户端广播发布的消息
        io.emit('message', obj);
        var content = new Content({
          issystem: 'no',
          userid: obj.userid,
          username: obj.username,
          time: obj.time,
          content: obj.content
        });
        content.save((err)=>{ //添加进数据库
          if(err){
            console.log('save status:', err ? 'failed' : 'success');
          }
        });
        //console.log(obj.username+'说：'+obj.content);
    });
    //监听用户获取历史消息
    socket.on('gethiscontent',function(obj){
        Content.find({},function(err,docs){
          if(err){
            socket.emit('error',{msg:'获取聊天记录出错！'});
          }else{
            socket.emit('gethiscontent',docs)
            //console.log(docs);
          }
        })
    })
});
    return io;
}

module.exports = router;
