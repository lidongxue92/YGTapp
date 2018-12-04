///<summary>
///消息通道
///</summary>
var Messaging = new function () {

    //验证消息通道
    //var msg_sdk = new Yunba({ appkey: '55cc0d389477ebf52469582a' });
    this.mancount = 0;
    var userList = [], numUsers = 1, username = ''; //用户列表、直播间当前在线人数、用户信息、用户总数

    ///<summary>
    ///初始化
    ///</summary>
    this.initMsg = function (wsurl) {
      try{
        var wsserver = (wsurl==undefined || wsurl==null)?'http://123.57.255.51:3000':wsurl;
        //alert(wsserver);
        this.socket = io.connect(wsserver);
        this.socket.on('connecting',function(){//：
            $("#chat-messages").append("<p class='log'>正在连接服务器</p>");
        });
        this.socket.on('disconnect', function() {
            $("#chat-messages").append("<p class='log' style='color:red'>与服务其断开,正在尝试重连...</p>");
        });
        this.socket.on('connect_failed', function() {
            $("#chat-messages").append("<p class='log' style='color:red'>连接失败</p>");
        });
        this.socket.on('error', function() {
            $("#chat-messages").append("<p class='log' style='color:red'>错误发生，并且无法被其他事件类型所处理</p>");
        });
        this.socket.on('connect',function(){
          //连接成功
          $("#chat-messages").append("<p class='log'>连接成功</p>");
        });
      }
      catch(err){
        $("#tishi").html("<center>通讯服务连接失败"+err+"</center>").show();
        return;
      }
        Messaging.setAlias();
        Messaging.getOnlineUsers();
    }
    ///<summary>
    ///设置通讯中使用的别名
    ///</summary>
    this.setAlias = function () {
        var alias = userobj.name + "|" + userobj.id + "|" + userobj.type;
        this.socket.emit('login', { userid: userobj.id, username: userobj.name, userRoom: talkId, usertype: userobj.type, alias: alias });

        Messaging.removeOnlineUserElement();
        this.socket.on('message', function (data) {
            Messaging.dataController(data.msg);
        });
        //监听新用户登录
        this.socket.on('login', function (o) {
            Messaging.addOnlineUserElement(o.onlineUsers);
        });
    }

    ///<summary>
    ///在线用户列表中添加一个元素
    ///</summary>
    this.addOnlineUserElement = function (o) {
        username = o;
        var user = username.split("|");
      //  console.log("上线：" + username);
        if (-1 === userList.indexOf(user[1])) {
            Messaging.mancount++;
            userList.push(user[1]);
            numUsers = userList.length;
        }
        //        $("#talkp").text("(" + Messaging.mancount + ")");
        $("#usercount").text(Messaging.mancount);

    }

    ///<summary>
    ///在线用户列表中移除一个元素
    ///</summary>
    this.removeOnlineUserElement = function () {
        //监听用户退出
        this.socket.on('logout', function (o) {
            var user = username.split("|");
            console.log("离线：" + username);
            var indexOf = userList.indexOf(user[1]);
            if (-1 != indexOf) {
                try {
                    Messaging.mancount--;
                    userList.splice(indexOf, 1);
                    numUsers = userList.length;
                    $('li[id="' + user[1] + '"]').remove();
                } catch (e) {
                    console.error("用户离线异常：" + username);
                }
            }
            $("#usercount").text(Messaging.mancount);
        });
    }


    ///<summary>
    ///取得在线用户
    ///</summary>
    this.getOnlineUsers = function () {
        this.socket.emit('getOnlineUsers', { userRoom: talkId });
        this.socket.on('getOnlineUsers', function (data) {
            $("#usercount").text(data.onlineUsers.length);
            for (var index = 0; index < data.onlineUsers.length; index++) {
                Messaging.addOnlineUserElement(data.onlineUsers[index].alias);
            }
        });
    }


    ///<summary>
    ///输出提示信息
    ///</summary>
    this.logMessage = function (data) {
        Messaging.addMessageElement({ log: data }, true);
    }


    ///<summary>
    ///在聊天框中输出一条信息
    ///</summary>
    this.addMessageElement = function (data, isLog) {

        var $chatMessages = $('#chat-messages');
        if (data.hasOwnProperty("dataContent")) {
            if (isLog) {
                $chatMessages.append('<div class="log">'+data.log+'</div>');
                console.log("聊天框", data.log);
                return;
            }
            if (data.dataContent.indexOf("cmd:") >= 0) {
            }
             else {
                var decodeMsg = Messaging.replace_em(data.dataContent); //解析表情
                //var $messageBodySpan = $('<span class="chat-message-body"></span>').html(decodeMsg);

                if (data.usertype == 0) {
                    //var $messageLi = $('<li class="chat-message_item talk_teacher"></li>').append("<div class=\"nametime\"><span class=\"chat-username\">" + data.username + "</span><span class=\"chat-time\">" + sysConfig.CurentTime() + "</span><div class=\"clear\"></div></div>", $messageBodySpan);

                    var $messageLi = $('<div class="chat-message_item talk_teacher"></div>').append("<span class=\"chat-username\">" + data.username + "</span>:<span class=\"chat-message-body\">" + decodeMsg + "</span>");


                    $chatMessages.append($messageLi);
                } else {
                    // var $messageLi = $('<li class="chat-message_item "></li>').append("<div class=\"nametime\"><span class=\"chat-username\">" + data.username + "</span><span class=\"chat-time\">" + sysConfig.CurentTime() + "</span><div class=\"clear\"></div></div>", $messageBodySpan);
                    var $messageLi = $('<div class="chat-message_item "></div>').append("<span class=\"chat-username\">" + data.username + "</span>:<span class=\"chat-message-body\">" + decodeMsg + "</span>");
                    $chatMessages.append($messageLi);
                }
                //                $chatMessages.scrollTop($chatMessages[0].scrollHeight);
            }
        }
        $chatMessages.scrollTop($chatMessages[0].scrollHeight);
    }

    ///<summary>
    ///解析表情
    ///</summary>
    this.replace_em = function (str) {
        str = str.replace(/\</g, '&lt;');
        str = str.replace(/\>/g, '&gt;');
        str = str.replace(/\n/g, '<br/>');
        str = str.replace(/\[em_([0-9]*)\]/g, '<img src="'+liveserver+'/images/arclist/$1.png" width="50" height="50" border="0" />');
        return str;

    }

    ///<summary>
    ///组合发送消息的内容
    ///</summary>
    this.sendMessage = function () {
		var txt_input= "";
		if (window.orientation == 180 || window.orientation == 0) {txt_input=$("#chatroom-input3").val();}//竖屏
		else if (window.orientation == 90 || window.orientation == -90) {txt_input=$("#chatroom-input3").val();}//横屏
		else{txt_input=$("#chatroom-input").val();}//PC

        if ($(".appvideoliaotianhp").css("display") == "block") {
			if ('' === txt_input) {
                //$('.chatroom-input').focus();
                return;
            }

        } else {
            if ('' ===txt_input) {
                //$('#chatroom-input').focus();
                return;
            }
        }

        //        if (zbtiem == 0) {
        //            layer.alert('直播未开始，暂时不能发言！', { icon: 0, title: '系统提示' });
        //        } else {
        var messageStr = "";
        if (messageStr.indexOf("cmd:") >= 0) {
            //命令忽略
        } else {
            messageStr = "msg:" + txt_input;
        }
        var data = JSON.stringify({
            dataType: 'MESSAGE',
            dataContent: messageStr,
            username: userobj.name,
            userid: userobj.id,
            livetiem: zbtiem,
            usertype: userobj.type
        });
        Messaging.publish(CHATROOM_TOPIC, data);
        $('#chatroom-input').val('');
        $('.chatroom-input').val('');
        //        }
    }

    ///<summary>
    ///执行发送消息事件
    ///</summary>
    this.publish = function (topic, message) {
        this.socket.emit('message', { 'userRoom': topic, 'msg': message });
    }

    // 接收到消息后处理消息内容
    this.dataController = function (data) {
        //console.log("用户接收消息："); //+ data
        data = JSON.parse(data);
      //  try {
            if ('MESSAGE' === data.dataType) {
                //*****************************收到一般命令******************************//
                if (data != undefined && data.hasOwnProperty("dataContent")) {
                  if (data.dataContent.indexOf("msg:") >= 0) {//接收消息
                        //alert("消息");
                        data.dataContent = data.dataContent.substring(data.dataContent.indexOf("msg:") + 4, data.dataContent.length - data.dataContent.indexOf("msg:")); //截取消息
                  }
                  if (data.dataContent.indexOf("cmd:") >= 0) {//接收命令
                        // alert("命令");
                        var cmdstr = data.dataContent.substring(data.dataContent.indexOf("cmd:") + 4, data.dataContent.length - data.dataContent.indexOf("cmd:")); //截取命令
                        var logStr = "";

                        if (cmdstr == "overlive") {
                            //loginwindow.showerr("直播已结束");
                            alert("直播结束，感谢敢看！");
                        } else if (cmdstr == "start") {
                            istext = 0;
                          //  logStr = "<span class=\"Open\">解开禁言</span>"; //SpeakingStatus(0);

                        } else if (cmdstr == "stop") {
                          //  logStr = "<span class=\"Stop\">禁止发言</span>"; //SpeakingStatus(1);
                            istext = 1;
                        } else if (cmdstr == "colsemkf") {//关闭麦克风
                            isvoice = 0;
                            //logStr = "<div class=\"chat-time_1\">" + sysConfig.CurentTime() + "</div><span class=\"Stop\">关闭麦克风</span>";
                        } else if (cmdstr == "colsesxt") {//关闭摄像头
                            isvideo = 0;
                            //logStr = "<div class=\"chat-time_1\">" + sysConfig.CurentTime() + "</div><span class=\"Stop\">关闭摄像头</span>";
                            //                            $("#playercontainer").html("<div id=\"playercontainer\"><img src=\"/images/voidenot.png\" style=\"width:100%;\" ></div>");
                        } else if (cmdstr == "startmkf") { //开启麦克风
                            isvoice = 1;
                            //logStr = "<div class=\"chat-time_1\">" + sysConfig.CurentTime() + "</div><span class=\"Open\">开启麦克风</span>";

                        } else if (cmdstr == "startsxt") {//开启摄像头
                            isvideo = 1;
                            //logStr = "<div class=\"chat-time_1\">" + sysConfig.CurentTime() + "</div><span class=\"Open\">开启摄像头</span>";

                        }

                        if (data.usertype == 0 && userobj.id != data.userid) { //不是自己发的情况，
                            if (cmdstr == "startlive") {
                                if (userobj.id != data.userid) {
                                    $("#livestate").val("直播中");
                                    sysConfig.zhibotime();
                                }
                            } else if (cmdstr == "startsxt" || cmdstr == "startmkf") {//开启摄像头
                                //教师 开启摄像头


                            }

                        }
                        if (data.usertype == 0 && userobj.id == data.userid) {
                            if (cmdstr == "user_tichu") {//剔除指定用户
                                if (data.userid == userobj.id) {
                                    //$("body").html("");
                                    $("#tishi").html("<center>您已被管理员踢出此直播间！</center>").show();
                                    localStorage.setItem(talkId+'tichu', data.userid);
                                    UIChatTools.close();
                                    bPlayer.stop();
                                    //需要在本地存储下被提出了，刷新再进进不来！
                                }
                            }
                            else if (cmdstr == "user_hf") {//恢复指定用户
                               if (data.user_id == userobj.id) { //判断教师操作的指定学员
                                 $("#chat-messages").append("<div class=\"log\">" +'您被解除了禁言' + "</div>");
                                 localStorage.removeItem(talkId+'jinyan');
                                  UIChatTools.show();
                               }
                           } else if (cmdstr == "user_jy") {//禁言指定用户
                               if (data.user_id == userobj.id) { //判断教师操作的指定学员
                                 $("#chat-messages").append("<div class=\"log\">" +'您被禁言了' + "</div>");
                                 localStorage.setItem(talkId+'jinyan', data.userid);
                                 UIChatTools.hide();
                               }
                          }
                        }

                        //关闭摄像头
                        if ((cmdstr == "colsesxt" || cmdstr == "colsemkf") && userobj.id != data.userid) {

                        }

                        if (cmdstr == "startmkf") {
                            //console.log(JSON.stringify(data));
                              micid= data.userid;
                              liveplay(pushurl); //换人里，重新连接
                              $("#chat-messages").append("<div class=\"log\">" + data.username+'上麦啦！' + "</div>");
                        }
                        else if (cmdstr == "colsemkf") {
                              micid= "";
                              playstop();
                              $("#chat-messages").append("<div class=\"log\">" + data.username+'下麦' + "</div>");
                        }
                        else if (cmdstr == "start") {
                            //解除禁言
                            $("#chat-messages").append("<div class=\"log\">" +'解除禁言' + "</div>");
                              UIChatTools.show();
                        } else if (cmdstr == "stop") {
                            //全员禁言
                            $("#chat-messages").append("<div class=\"log\">" +'全员禁止' + "</div>");
                            UIChatTools.hide();
                        }
                        else {
                          //  $("#chat-messages").append("<div class=\"log\">" + cmdstr+logStr + "</div>");
                        }
                  }
                  //zbtiem = data.livetiem;  //同步时间
                }
                else {
                  /*******************白板类数据处理，特殊业务（如文件分享，投票）****************************/
                    if (data != undefined && data.hasOwnProperty("mestype")) {

                        if (data.mestype == 5) {
                            //接收分享的文件
                            var imghtml = "<li class=\"chat-message_item talk_wenjian\"><div class=\"nametime\"><span class=\"chat-username\">" + decodeURI(data.username) + "</span><div class=\"clear\"></div></div><span class=\"chat-message-body\"><div class=\"chat-message-down\"><div class=\"chat-message-wenjianname\">";
                            //office显示对应的图标
                            if (data.docname.indexOf(".doc") >= 0 || data.docname.indexOf(".docx") >= 0) {
                                imghtml += "<div class=\"ico icoword\"></div>";
                            } else if (data.docname.indexOf(".ppt") >= 0 || data.docname.indexOf(".pptx") >= 0) {
                                imghtml += "<div class=\"ico icoppt\"></div>";
                            } else if (data.docname.indexOf(".pdf") >= 0) {
                                imghtml += "<div class=\"ico icopdf\"></div>";
                            } else if (data.docname.indexOf(".jpg") >= 0 || data.docname.indexOf(".png") >= 0 || data.docname.indexOf(".gif") >= 0 || data.docname.indexOf(".jpeg") >= 0) {
                                imghtml += "<div class=\"ico icoimg\"></div>";
                            } else if (data.docname.indexOf(".xls") >= 0 || data.docname.indexOf(".xlsx") >= 0) {
                                imghtml += "<div class=\"ico icoexcel\"></div>";
                            } else {
                                imghtml += "<div class=\"ico iconull\"></div>";
                            }
                            imghtml += "<div class=\"chat-messages-fenxiangname\" title='" + decodeURI(data.docname) + "'>" + decodeURI(data.docname) + "　</div><div class=\"chat-messages-caozuo\"><a   href=\"" + data.fxpath + "\" download=\"" + decodeURI(data.docname) + "\" >下载</a></div></div></div></span><div class=\"clear\"></div></li>";
                          //  $("#chat-messages").append(imghtml);
                        }

                        if (userobj.id != data.userid) {
                            if (userobj.type == 1) { zbtiem = data.livetiem; } //同步时间
                            if(data.mestype == 3)
                            {
                                if (data.clear == "clear") {//执行清除操作
                                   eduCanvas.clearArea();
                                 } else {//重绘
                                     xy = new Array();
                                     eduCanvas.drowDTX(eval(data.data_xy), 0, 1);
                                 }
                              //  console.log("xx"+data.data_xy);
                            }
                            else if (data.mestype == 4){
                              //livetiem = data.livetiem;
                              fileguid = data.fileguid;
                              fileNames = eval(data.filenames);
                              var imgsrc = data.fxpath;
                               if (imgsrc.indexOf(".mp3") >= 0 || imgsrc.indexOf(".flv") >= 0 || imgsrc.indexOf(".mp4") >= 0){
                                 //特殊处理
                               }else{

                                    liveRecord.loadImg(data); //加载所有图片div

                                  //  alert(data.pagenum);
                                    pagenum = data.pagenum;
                                    fxpathMax = imgsrc.substring(0, imgsrc.lastIndexOf('/') + 1);
                                }
                            }

                        }

                        if (data.hasOwnProperty("dataContent")) {
                            if (flashvars.type == 1) { if (zbtiem == 0) { sysConfig.zhibotime(); } zbtiem = data.livetiem; } //同步时间
                            if (data.dataContent.indexOf("msg:") >= 0) {//接收消息
                                //alert("消息");
                                data.dataContent = data.dataContent.substring(data.dataContent.indexOf("msg:") + 4, data.dataContent.length - data.dataContent.indexOf("msg:")); //截取消息
                            }
                        }
                    }
                }
            }
            Messaging.addMessageElement(data);
      //  } catch (e) {
      //      console.error('用户接收失败' + e);
      //  }
    }

    this.updateSysMsg = function (o, action) {
        console.log(action);
        debugger;

    }
}
//----------------------翻页--新------------------------------
function fanye(pagenum) {
            //console.log("翻页：zhibo_" + talkId + "_" + fileguid + "_" + pagenum);

            var jsoninfo = JSON.stringify({ dataType: "MESSAGE", mestype: 4, fxpath: fxpathMax + fileNames[pagenum], pagenum: pagenum, userid: userobj.id, filenames: JSON.stringify(fileNames), fileguid: fileguid, livetiem: zbtiem, fxpathMax: fxpathMax });
            //console.log("翻页：" + jsoninfo);
            //发送图片路径
            Messaging.publish(talkId, jsoninfo);
}
