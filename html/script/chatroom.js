/*
 * 极速聊天室功能 jQuery版本
 * @requires jQuery v1.11 or later
 *
 * Version: 1.0
 * 开启客服功能后，可在客服列表管理会话
 * jisuchatroom_setUser(userid,username,userpic,rid)通过本方法设置
 * openjisu_kefu_window(); 打开与客服的沟通窗口
 * 目前仅支持IE10以上浏览器
 */
(function ($,win) {
	win.kefuid = "";//空为不在线，其余存储客服ID
	var httpurl = 'ws://123.57.255.51:3000';//服务器地址
	var flashvars = {
            rid: 'rid',//房间编号
            img:'../images/User_Image.jpg',
            name: '匿名用户', //用户昵称
            id: '123',//用户ID
            type: 1 // 1、用户 0、客服
    };
    var yemianjihuo = true;//当前页面是否为激活状态

	//设置当前登录人
	function jisukefu_setUser(userid,username,userimg,rid){
		flashvars.id = userid;
		flashvars.name = username;
		flashvars.img = userimg;
		flashvars.rid = rid;
		//**************************客服聊天通讯初始化****************************************
		loadJs("http://123.57.255.51:3000/socket.io/socket.io.js",function(){Messaging.initMsg()});
		$("#chat_send_btn").click(function(){
			var chattext =	$("#chat_send_input").val();
			jisu_chat_send(chattext);
		});
	}
	win.jisuchatroom_setUser = jisukefu_setUser;

	//发送消息
	function jisu_chat_send(input){
		if(input != "")
		{
		//	try{
			//通过通讯通道发出去
			//jisu_chat_minwinow("ALL","xxx",input);
			Messaging.mytextshow(input);
			var messageStr = "msg:"+input;
			var data = JSON.stringify({
				dataType: 'MESSAGE',
				dataContent: messageStr,
				username: flashvars.name,
				userid: flashvars.id,
				livetiem: 0,
				usertype: flashvars.type,
				sendid:'ALL' //指定发送给某人，或ALL进行光宝
			});
			Messaging.publish(flashvars.rid, data);

			//清空输入框
			$("#chat_send_input").val("");
		//	}
		//	catch(e){
		//		console.error(e);
		//	}
		}
		else{
			$("#chat_send_input").focus();
		}
	}


	///<summary>
	///消息通道
	///</summary>
	var Messaging = new function () {
		var socket;
		//初始化
		this.initMsg = function () {
			socket = io.connect(httpurl);

			socket.on('connect',function(){
				//连接成功
				console.log("通讯服务链接成功");
				var alias = flashvars.name + "|" + flashvars.id + "|" + flashvars.type;
	      socket.emit('login', { userid: flashvars.id, username: flashvars.name, userRoom: flashvars.rid, usertype: flashvars.type, alias: alias });
			});
			socket.on('disconnect',function(data){
				//连接断开
				console.log("链接断开！");
			});
			/**
			socket.emit('getOnlineUsers', { userRoom: flashvars.rid });
			socket.on('getOnlineUsers', function (data) {
				for (var index = 0; index < data.onlineUsers.length; index++) {
					if(data.onlineUsers[index].usertype == 0){ //随便个当前人找个客服
						kefuid=data.onlineUsers[index].userid;
						jisu_chat_minwinow(data.onlineUsers[index].userid,data.onlineUsers[index].username+"客服在线");
						newjisukekfuwindow(data.onlineUsers[index].userid,data.onlineUsers[index].username);
						break;
					}
				}
			});**/
			//监听发消息
			socket.on('message', function (data) {
				var msgdata = JSON.parse(data.msg);
				try {
					//找到和自己有关的消息
					if ('MESSAGE' === msgdata.dataType && (msgdata.sendid == "ALL" || msgdata.sendid == flashvars.id) && msgdata.userid != flashvars.id) {
						if (msgdata != undefined && msgdata.hasOwnProperty("dataContent")) {
							if (msgdata.dataContent.indexOf("msg:") >= 0) {//接收消息
								msgdata.dataContent = msgdata.dataContent.substring(msgdata.dataContent.indexOf("msg:") + 4, msgdata.dataContent.length - msgdata.dataContent.indexOf("msg:")); //截取消息
								if(messagetype == 0){
										messagesetnumber();
										win.$.notification({
										  title: "班级交流",
										  text: msgdata.dataContent.substring(0, 10),
										  media: "<img src='../../html/framework/czb/icon-29.png'>",
										  onClick: function(data) {
												messagesetnumberhide();
												win.$.router.loadPage("#chat");
										  }
										});
								}
								console.log('您有新的消息！'+messagetype);

							}
							if (msgdata.dataContent.indexOf("cmd:") >= 0) {//接收命令
								// alert("命令");
							}
							Messaging.addMessageElement(msgdata);
						}
					}
				} catch (e) {
					console.error('用户接收失败' + e);
				}
			});
			//监听新用户登录
			socket.on('login', function (o) {
				//发现客服在线
			//	if(o.user.usertype == 0 && kefuid == ""){
					//console.log(o);
					console.log(o.user.userid+'x'+o.user.username+"上线");
			//		newjisukekfuwindow(o.user.userid,o.user.username);
			//		kefuid = o.user.userid;//绑定个客服
			//	}
			});
			//监听退出
			socket.on('logout', function (o) {
       ///if(o.user.usertype == 0 && kefuid ==  o.user.userid){
					console.log(o.user.username+"离线");
			///		jisu_chat_minwinow(o.user.userid,o.user.username+"客服下线了");
			//		$("#jisu_kefu_window_"+o.user.userid).remove();
			//		kefuid = "";
			//	}
      });
		}
		///<summary>
		///执行发送消息事件
		///</summary>
		this.publish = function (topic, message) {
			socket.emit('message', { 'userRoom': topic, 'msg': message });
		}
		///<summary>
		///在聊天框中输出一条信息
		///</summary>
		this.addMessageElement = function (data, isLog) {
			if (!data.hasOwnProperty("sendid")) {
    			data.sendid="ALL";
    		}
			//1、接收到消息后，修改数字
			//2、也同时修改聊天内容
			//3、点击数字，归0
			//console.log(data);
			textshow(data.dataContent,data.userid,data.username);

		}
		//客服说话
		function textshow(text,userid,username) {
			$("#chat_text").append("<div class=\"nishuo\"><img src=\""+javafile+"/resources/knowledge/userAvatar/"+userid+".jpg?t="+Date.parse(new Date())+"\" onerror=\"javascript:this.src='../../images/avatar.png';\" class=\"touxiang\" /><div class=\"name\">"+username+"</div><div class=\"nairong\"><span class=\"triangle-left\"></span><span>" + text + "</span></div></div>").scrollTop(9999999999);
		}
		//自己说话
		this.mytextshow = function(text) {
			$("#chat_text").append("<div class=\"woshuo\"><img src=\""+flashvars.img+"\" onerror=\"javascript:this.src='../../images/avatar.png';\" class=\"touxiang\" /><div class=\"nairong\"><span class=\"triangle-left\"></span><span>" + text + "</span></div></div>").scrollTop(9999999999);
		}
	}
	//异步载入
    function loadJs(file,fun){
        var scriptTag = document.getElementById('loadScript');
        var head = document.getElementsByTagName('head').item(0);
        if(scriptTag) head.removeChild(scriptTag);
        script = document.createElement('script');
        script.src = file;
        script.type = 'text/javascript';
        script.id = 'loadScript';
        head.appendChild(script);
		script.onload = fun;
    }
    function loadCss(file){
        var cssTag = document.getElementById('loadCss');
        var head = document.getElementsByTagName('head').item(0);
        if(cssTag) head.removeChild(cssTag);
        css = document.createElement('link');
        css.href = file;
        css.rel = 'stylesheet';
        css.type = 'text/css';
        css.id = 'loadCss';
        head.appendChild(css);
    }
} (jQuery,window));
