var msgObj = document.getElementById("message");
var screenheight = window.innerHeight;
var usernamebtn = document.getElementById("usernamesubmit");
var msgbtn = document.getElementById("msgsubmit");
var logoutbtn = document.getElementById("logoutsubmit");
var historybtn = document.getElementById("history");

var userObj = {
    userid:null,
    username:null
}

var time={
    hour:null,
    min:null
}
//连接websocket后端服务器
var socket = io.connect('http://192.168.1.108:8000/');

//监听新用户登录
socket.on('login', function(o){
    updateSysMsg(o, 'login');
});

//监听用户退出
socket.on('logout', function(o){
    updateSysMsg(o, 'logout');
});

//监听错误
socket.on('error',function(o){
    alert(o.msg)
});

usernamebtn.onclick = function(){
    usernameSubmit();
}

msgbtn.onclick = function(){
    submitmsg();
}

logoutbtn.onclick = function(){
    logout();
}

historybtn.onclick = function(){
    msgObj.innerHTML= '';
    historybtn.style.display = 'none';
    gethiscontent();
}

//监听消息发送
socket.on('message', function(obj){
    var isme = (obj.userid == userObj.userid) ? true : false;
    //var contentDiv = '<div>'+obj.content+'</div>';
    //var usernameDiv = '<span>'+obj.username+'<span>';
    var section = document.createElement('div');
    if(isme){
        section.className = 'user';
        section.innerHTML = '<div class="name">'+obj.username+'&nbsp;&nbsp;'+obj.time+'</div>'+'<div class="content">'+obj.content+'</div>';
    } else {
        section.className = 'service';
        section.innerHTML = '<div class="name">&nbsp;&nbsp;'+obj.username+'&nbsp;&nbsp;'+obj.time+'</div>'+'<div class="content">'+obj.content+'</div>';
    }
    msgObj.appendChild(section);
    scrollToBottom();
});

//监听历史消息的获取
socket.on('gethiscontent',function(obj){
    for(let i=0;i<obj.length;i++){
        if(obj[i].issystem=='yes'){
            //var first = msgObj.firstChild;
            //添加系统消息
            var html = '<div class="msg-system">'+obj[i].content+obj[i].time+'</div>';
            var section = document.createElement('section');
            section.className = 'system J-mjrlinkWrap J-cutMsg';
            section.innerHTML = html;
            msgObj.appendChild(section);
        }else if(obj[i].issystem=='no'){
            //添加用户消息
            //var first = msgObj.firstChild;
            var isme = (obj[i].username == userObj.username||obj[i].userid == userObj.username) ? true : false;
            var section = document.createElement('div');
            if(isme){
                section.className = 'user';
                section.innerHTML = '<div class="name">'+obj[i].username+'&nbsp;&nbsp;'+obj[i].time+'</div>'+'<div class="content">'+obj[i].content+'</div>';
            } else {
                section.className = 'service';
                section.innerHTML = '<div class="name">&nbsp;&nbsp;'+obj[i].username+'&nbsp;&nbsp;'+obj[i].time+'</div>'+'<div class="content">'+obj[i].content+'</div>';
            }
            msgObj.appendChild(section);
        }else{
            alert('历史记录加载失败！');
        }
        scrollToBottom();
    }
})


// 函数部分

//让浏览器滚动条保持在最低部
function scrollToBottom(){
    msgObj.scrollTo(0, msgObj.scrollHeight);
}

//用户退出
function logout(){
    location.reload();
}

//获取历史消息
function gethiscontent(){
    var obj = {
        userid: userObj.userid,
        username: userObj.username,
    };
    socket.emit('gethiscontent',obj);
}


//提交聊天消息内容
function submitmsg(){
    var content = document.getElementById("content").value;
            if(content != ''){
                var obj = {
                    userid: userObj.userid,
                    username: userObj.username,
                    time: gettime(),
                    content: content
                };
                socket.emit('message', obj);
                document.getElementById("content").value = '';
            }
            return false;
}

//生成随机id
function genUid(){
    return new Date().getTime()+""+Math.floor(Math.random()*899+100);
}

//更新系统消息，本例中在用户加入、退出的时候调用
function updateSysMsg(o, action){
    //当前在线用户列表
    var onlineUsers = o.onlineUsers;

    //当前在线人数
    var onlineCount = o.onlineCount;

    //新加入用户的信息
    var user = o.user;

    //时间
    var time = o.time;

    //更新在线人数
    var userhtml = '';
    var separator = '';
    for(key in onlineUsers) {
        if(onlineUsers.hasOwnProperty(key)){
            userhtml += separator+onlineUsers[key];
            separator = '、';
        }
    }
    document.getElementById("onlinecount").innerHTML = '当前共有 '+onlineCount+' 人在线，在线列表：'+userhtml;

    //添加系统消息
    var html = '';
    html += '<div class="msg-system">';
    html += user.username;
    html += (action == 'login') ? ' 加入了聊天室' : ' 退出了聊天室';
    html += time;
    html += '</div>';
    var section = document.createElement('section');
    section.className = 'system J-mjrlinkWrap J-cutMsg';
    section.innerHTML = html;
    msgObj.appendChild(section);
    scrollToBottom();
}

//第一个界面用户提交用户名
function usernameSubmit(){
    var u = document.getElementById("username").value;
    if(u!= ""){
        document.getElementById("username").value = '';
        document.getElementById("loginbox").style.display = 'none';
        document.getElementById("chatbox").style.display = 'block';
        loginsuccess(u);
    }
    return true;
}

function loginsuccess(username){
    /*
    客户端根据时间和随机数生成uid,这样使得聊天室用户名称可以重复。
    实际项目中，如果是需要用户登录，那么直接采用用户的uid来做标识就可以
    */
    userObj.userid = genUid();
    userObj.username = username;

    document.getElementById("showusername").innerHTML = userObj.username;
    msgObj.style.minHeight = (screenheight - document.body.clientHeight + msgObj.clientHeight) + "px";
    msgObj.style.maxHeight = (screenheight - document.body.clientHeight + msgObj.clientHeight) + "px";
    //告诉服务器端有用户登录
    socket.emit('login', {userid:userObj.userid, username:userObj.username});
    scrollToBottom();
}

//通过“回车”提交用户名
document.getElementById("username").onkeydown = function(e) {
    e = e || event;
    if (e.keyCode === 13) {
        usernameSubmit();
    }
};

//通过“回车”提交信息
document.getElementById("content").onkeydown = function(e) {
    e = e || event;
    if (e.keyCode === 13) {
        submitmsg();
    }
};

//获取当前时间
function gettime(){
    //创建对象  
    var date = new Date();  
    //获取年份  
    var y = date.getFullYear(); 
    //获取月份  返回0-11     
    var m =date.getMonth()+1; 
    // 获取日   
    var d = date.getDate();
    //获取星期几  返回0-6   (0=星期天)   
    var w = date.getDay();    
    //星期几
    var ww = ' 星期'+'日一二三四五六'.charAt(date.getDay()) ;
    //时
    var h = date.getHours();
    //分  
    var minute = date.getMinutes() 
    //秒 
    var s = date.getSeconds(); 
    //毫秒
    var sss = date.getMilliseconds() ;
     
    if(m<10){
    m = "0"+m;
    }
    if(d<10){
    d = "0"+d;
    }
    if(h<10){
    h = "0"+h;
    }
    if(minute<10){
    minute = "0"+minute;
    } 
    if(s<10){
    s = "0"+s;
    }
    
    if(sss<10){
    sss = "00"+sss;
    }else if(sss<100){
    sss = "0"+sss;
    }
    return y+"-"+m+"-"+d+" "+h+":"+minute+":"+s;  
}