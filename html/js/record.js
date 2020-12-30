var selfuid = 0;
var ws = {};
var heart = 0;
function getrytoken() {
    // ws = new WebSocket("ws://121.40.99.104:7272");
    ws = new WebSocket("ws://192.168.1.30:7272");
    // 当socket连接打开时，输入用户名
    ws.onopen = onopen;
    // 当有消息时根据消息类型显示不同信息
    ws.onmessage = onmessage;
    ws.onclose = function (e) {
        console.log(e);
        //alert('链接关闭');
        console.log("连接关闭");
        if (confirm('是否重新连接？重新连接，其他设备会断开')) {
            connect();
        }else {
            clearInterval(heart);
        }

        //
    };
    ws.onerror = function () {
        clearInterval(heart);
        console.log("出现错误");
    };
}

// 打开连接
function onopen(){
    // 登录
    console.log('ttttttttttttttttt');
    api.ajax({
        url: wtkurl +'classroom/openWorkerman',
        method: 'post',
        headers: {
            'TOKEN':ygtuserinfo.token
        },
        data: {
            values: {
                classroomid: classroomid,
                uid: ygtuserinfo.id
            },
        }
    }, function(data, err) {
        console.log(JSON.stringify(data))
        console.log(JSON.stringify(err))
        if (data) {
          var login_data = '{"type":"login","client_name":"'+data.data.client_name+'","room_id":"'+data.data.room_id+'", "uid":'+data.data.uid+'}';
          ws.send(login_data);

          console.log("websocket握手成功，发送登录数据:"+login_data);
          selfuid = data.data.uid;
          heart = setInterval(function(){
              console.log('type:pong');
              ws.send('{"type":"pong"}');
          }, 55000);
        }

    });
}


// 服务端发来消息时
function onmessage(e){
    console.log(e);
    console.log(e.data);
    var data = JSON.parse(e.data);

    if (data['senderUserId'] == selfuid) {
        console.log(data['client_name']+"发言成功");
        return false;
    }
console.log(JSON.stringify(data));
    switch(data['type']){
        // 服务端ping客户端
        case 'ping':
            console.log(data);
            ws.send('{"type":"pong"}');
            break;
        // 登录 更新用户列表
        case 'login':

            console.log(data['client_name']+"登录成功");
            break;
        // 发言
        case 'say':

            switch (data['objectName']) {
                // 普通文本消息
                case 'RC:TxtMsg':
                    getTextmessage(data);
                    break;
                // 奖赏消息
                case 's:reward':
                    getRewardmessage(data);
                    break;
                // 提问消息
                case 's:question':
                    getQuestionmessage(data);
                    break;
                // 回答消息
                case 's:answer':
                    getAnswermessage(data);
                    break;
                // 图片消息
                case 'RC:ImgMsg':
                    getImagemessage(data);
                    break;
                // 语音消息
                case 'RC:VcMsg':
                    getVoicemessage(data);
                    break;
                // 系统消息
                case 's:system':
                    getSystemMessage(data);
                    break;
                // 通知消息
                case 'RC:InfoNtf':
                    getInfoNtfMessage(data);
                    break;
            }

            //{"type":"say","from_client_id":xxx,"to_client_id":"all/client_id","content":"xxx","time":"xxx"}
            //say(data['from_client_id'], data['from_client_name'], data['content'], data['time']);
            break;
        // 用户退出 更新用户列表
        case 'logout':
            //{"type":"logout","client_id":xxx,"time":"xxx"}
            //say(data['from_client_id'], data['from_client_name'], data['from_client_name']+' 退出了', data['time']);
            //delete client_list[data['from_client_id']];
            //flush_client_list();
            break;
    }
}


function oldgetrytoken() {
    api.ajax({
        url: wtkurl +'classroom/getrytoken',
        method: 'post',
        headers :{
            'TOKEN':ygtuserinfo.token
        },
        data: {
            values: {
                uid:ygtuserinfo.id
            }
        }
    }, function(res, err) {

        if (res) {
            token = res.data.data.token;
            rykey = res.data.data.ryappkey;
            RongIMClient.init(rykey);
            RongIMLib.RongIMVoice.init();
            RongIMClient.connect(token, {
                onSuccess: function(userId) {
                    console.log("Login successfully." + userId);
                },
                onTokenIncorrect: function() {
                    console.log('token无效');
                },
                onError: function(errorCode) {
                    var info = '';
                    switch (errorCode) {
                        case RongIMLib.ErrorCode.TIMEOUT:
                            info = '超时';
                            break;
                        case RongIMLib.ErrorCode.UNKNOWN_ERROR:
                            info = '未知错误';
                            break;
                        case RongIMLib.ErrorCode.UNACCEPTABLE_PaROTOCOL_VERSION:
                            info = '不可接受的协议版本';
                            break;
                        case RongIMLib.ErrorCode.IDENTIFIER_REJECTED:
                            info = 'appkey不正确';
                            break;
                        case RongIMLib.ErrorCode.SERVER_UNAVAILABLE:
                            info = '服务器不可用';
                            break;
                    }
                    console.log(errorCode);
                }
            });
            RongIMClient.setConnectionStatusListener({

                onChanged: function(status) {
                    console.log('这是状态码' + status);
                    switch (status) {
                        //链接成功
                        case RongIMLib.ConnectionStatus.CONNECTED:
                            console.log('链接成功');
                            break;
                            //正在链接
                        case RongIMLib.ConnectionStatus.CONNECTING:
                            console.log('正在链接');
                            break;
                            //重新链接
                        case RongIMLib.ConnectionStatus.DISCONNECTED:
                            console.log('断开连接');
                            break;
                            //其他设备登陆
                        case RongIMLib.ConnectionStatus.KICKED_OFFLINE_BY_OTHER_CLIENT:
                            console.log('其他设备登陆');
                            break;
                            //网络不可用
                        case RongIMLib.ConnectionStatus.NETWORK_UNAVAILABLE:
                            console.log('网络不可用');
                            break;
                    }
                }
            });
            var messageName = "RewardMessage"; // 消息名称。
            var objectName = "s:reward"; // 消息内置名称，请按照此格式命名。
            var mesasgeTag = new RongIMLib.MessageTag(true, true); // 消息是否保存是否计数，true true 保存且计数，false false 不保存不计数。
            var propertys = ["senduid", "sendusername", 'receiveuid', 'receivename', 'extra']; // 消息类中的属性名。
            RongIMClient.registerMessageType(messageName, objectName, mesasgeTag, propertys);
            // 提问题消息
            RongIMClient.registerMessageType('QuestionMessage', 's:question', new RongIMLib.MessageTag(true, true), ['content', 'extra']);
            // 回答问题消息
            RongIMClient.registerMessageType('AnswerMessage', 's:answer', new RongIMLib.MessageTag(true, true), ['content', 'questionid', 'questionusername', 'questionpic', 'quesionttime', 'voicesrc', 'duration', 'extra']);
            // 系统消息
            RongIMClient.registerMessageType('SystemMessage', 's:system', new RongIMLib.MessageTag(true, true), ['content', 'extra']);
            RongIMClient.setOnReceiveMessageListener({
                // 接收到的消息
                onReceived: function(message) {
                    console.log(JSON.stringify(message));
                    if (message.targetId != groupid) {
                        return false;
                    }
                    if (message.sentTime < ((parseInt(time) + 1) * 1000)) {
                        return false;
                    }
                    // 判断消息类型
                    switch (message.messageType) {
                        case RongIMClient.MessageType.TextMessage:
                            // 发送的消息内容将会被打印
                            getTextmessage(message);
                            break;
                        case RongIMClient.MessageType.VoiceMessage:
                            // 对声音进行预加载
                            // message.content.content 格式为 AMR 格式的 base64 码
                            getVoicemessage(message);
                            break;
                        case RongIMClient.MessageType.ImageMessage:
                            // do something...
                            getImagemessage(message);
                            break;
                        case RongIMClient.MessageType.RewardMessage:
                            getRewardmessage(message);
                            break;
                        case RongIMClient.MessageType.QuestionMessage:
                            getQuestionmessage(message);
                            break;
                        case RongIMClient.MessageType.AnswerMessage:
                            getAnswermessage(message);
                            break;
                        case RongIMClient.MessageType.SystemMessage:
                            getSystemMessage(message);
                            break;
                        case RongIMClient.MessageType.InformationNotificationMessage:
                            getInfoNtfMessage(message);
                            break;
                    }
                }
            });
        } else {
            //alert(JSON.stringify(err));
        }
    });
}
// 收到回答
function getAnswermessage(message) {
    if (userlist[message.senderUserId] == undefined) {
        $.post(
            getuserurl, {
                'uid': message.senderUserId,
                'classroomid': classroomid
            },
            function(data) {
                if (data.status == 1) {
                    userlist[message.senderUserId] = {
                        'pic': data.data.pic,
                        'pos': data.data.pos,
                        'userid': data.data.userid,
                        'username': data.data.username
                    };
                    html = '<li data-id="' + message.content.extra + '">' +
                        '<div class="user-head"><img src="' + data.data.pic + '"><a href="javascript:void(0);" class="reward open-popup" data-target="#zsred">赏</a></div>' +
                        '<div class="user-msgw">' +
                        '<div class="user-name">' + data.data.username + '<em>讲师</em></div>' +
                        '<div class="user-msg"><i class="ico"></i>回答<em>' + message.content.questionusername + '</em>问：' + message.content.content + '<p class="w100"></p></div>' +
                        '<div class="user-msg msgvoice othermsgvoice clear"  data-id="' + message.content.extra + '" data-src="' + replace_oss_upload_path(message.content.voicesrc) + '">' +
                        message.content.duration + '＂<i class="iconfont">&#xe609;</i><i class="unread"></i></div>' +
                        '</li>';
                    /*html = '<li>'
                              +'<p class="redtip"><i class="iconfont"></i>&nbsp;'+message.content.sendusername
                              +'&nbsp;赞赏了&nbsp;'+message.content.receivename
                              +'&nbsp;一个<em>红包</em>'
                              +'<input type="hidden" value="'+message.content.sendusername+'" class="sendusername" />'
                              +'<input type="hidden" value="'+message.content.receivename+'" class="receivename" />'
                              +'<input type="hidden" value="'+message.content.extra+'" class="total_fee" />'
                              +'<input type="hidden" value="'+data.data.pic+'" class="pic" />'
                          +'</p></li>';*/
                    $('#list').append(html);
                    $('#list').scrollTop($('#list')[0].scrollHeight);
                    $('#listdiv').scrollTop($('#listdiv')[0].scrollHeight);
                }
            },
            'json'
        );
    } else {
        html = '<li data-id="' + message.content.extra + '">' +
            '<div class="user-head"><img src="' + userlist[message.senderUserId].pic + '"><a href="javascript:void(0);" class="reward open-popup" data-target="#zsred">赏</a></div>' +
            '<div class="user-msgw">' +
            '<div class="user-name">' + userlist[message.senderUserId].username + '<em>讲师</em></div>' +
            '<div class="user-msg"><i class="ico"></i>回答<em>' + message.content.questionusername + '</em>问：' + message.content.content + '<p class="w100"></p></div>' +
            '<div class="user-msg msgvoice othermsgvoice clear"  data-id="' + message.content.extra + '" data-src="' + replace_oss_upload_path(message.content.voicesrc) + '">' +
            message.content.duration + '＂<i class="iconfont">&#xe609;</i><i class="unread"></i></div>' +
            '</li>';
        $('#list').append(html);
        $('#list').scrollTop($('#list')[0].scrollHeight);
        $('#listdiv').scrollTop($('#listdiv')[0].scrollHeight);
    }
}
// 收到提问
function getQuestionmessage(message) {
    if (userlist[message.senderUserId] == undefined) {
        $.post(
            getuserurl, {
                'uid': message.senderUserId,
                'classroomid': classroomid
            },
            function(data) {
                if (data.status == 1) {
                    userlist[message.senderUserId] = {
                        'pic': data.data.pic,
                        'pos': data.data.pos,
                        'userid': data.data.userid,
                        'username': data.data.username
                    };
                    html = '<li  data-id="' + message.content.extra + '" >' +
                        '<p class="systemtip"><em>系统消息：' +
                        data.data.username + '向讲师问了一个问题</em></p>' +
                        '</li>';
                    if (undefined != $('#qlist').attr('id')) {
                        // var qt = new Date();
                        // qt.setTime(message.sentTime);
                        // var month = (parseInt(qt.getMonth()) + 1),
                        //     day = parseInt(qt.getDate());

                        queshtml = '<li data-id="' + message.content.extra + '">' +
                            '<b class="time"></b>' +
                            '<a href="javascript:void(0);" class="actionBut">回答</a>' +
                            '<a href="javascript:void(0);" class="send">发送</a>' +
                            '<span><img src="' + data.data.pic + '"></span>' +
                            '<div class="oh qlistc">' +
                            '<p><em>' + data.data.username + '</em></p>' +
                            '<p>' + message.time + '&nbsp;问</p>' +
                            '</div>' +
                            '<div class="oh qlistcont">' +
                            '<p>' +
                            message.content.content +
                            '</p>' +
                            '</div>' +
                            '</li>';
                        $('.lastq').before(queshtml);
                    }
                    /*html = '<li>'
                              +'<p class="redtip"><i class="iconfont"></i>&nbsp;'+message.content.sendusername
                              +'&nbsp;赞赏了&nbsp;'+message.content.receivename
                              +'&nbsp;一个<em>红包</em>'
                              +'<input type="hidden" value="'+message.content.sendusername+'" class="sendusername" />'
                              +'<input type="hidden" value="'+message.content.receivename+'" class="receivename" />'
                              +'<input type="hidden" value="'+message.content.extra+'" class="total_fee" />'
                              +'<input type="hidden" value="'+data.data.pic+'" class="pic" />'
                          +'</p></li>';*/
                    $('#list').append(html);
                    $('#list').scrollTop($('#list')[0].scrollHeight);
                    $('#listdiv').scrollTop($('#listdiv')[0].scrollHeight);
                }
            },
            'json'
        );
    } else {
        html = '<li  data-id="' + message.content.extra + '" >' +
            '<p class="systemtip"><em>系统消息：' +
            userlist[message.senderUserId].username + '向讲师问了一个问题</em></p>' +
            '</li>';
        if (undefined != $('#qlist').attr('id')) {
            // var qt = new Date();
            // qt.setTime(message.sentTime);
            // var month = (parseInt(qt.getMonth()) + 1),
            //     day = parseInt(qt.getDate());

            queshtml = '<li data-id="' + message.content.extra + '">' +
                '<b class="time"></b>' +
                '<a href="javascript:void(0);" class="actionBut">回答</a>' +
                '<a href="javascript:void(0);" class="send">发送</a>' +
                '<span><img src="' + userlist[message.senderUserId].pic + '"></span>' +
                '<div class="oh qlistc">' +
                '<p><em>' + userlist[message.senderUserId].username + '</em></p>' +
                '<p>' + message.time + '&nbsp;问</p>' +
                '</div>' +
                '<div class="oh qlistcont">' +
                '<p>' +
                message.content.content +
                '</p>' +
                '</div>' +
                '</li>';
            $('.lastq').before(queshtml);
        }
        $('#list').append(html);
        $('#list').scrollTop($('#list')[0].scrollHeight);
        $('#listdiv').scrollTop($('#listdiv')[0].scrollHeight);
    }
}
// 接收红包信息
function getRewardmessage(message) {
    if (userlist[message.senderUserId] == undefined) {
        $.post(
            getuserurl, {
                'uid': message.senderUserId,
                'classroomid': classroomid
            },
            function(data) {
                if (data.status == 1) {
                    userlist[message.senderUserId] = {
                        'pic': data.data.pic,
                        'pos': data.data.pos,
                        'userid': data.data.userid,
                        'username': data.data.username
                    };
                    html = '';
                    if (data.data.pos == '3' || data.data.pos == 3) {
                        html = '<li class="my" data-id="' + message.content.extra + '">' +
                            '<div class="user-head"><img src="' + data.data.pic + '"></div>' +
                            '<div class="user-msgw">' +
                            '<div class="user-msg red">' +
                            '<i class="ico"></i>' +
                            '<dl class="redtip open-popup" data-target="#redmsg">' +
                            '<dt><img src="http://www.wtk.so/Public/img/redicon.png"></dt>' +
                            '<dd>老师讲得太赞啦~</dd>' +
                            '<dd>我忍不住赞赏了一个红包</dd>' +
                            '<input type="hidden" value="' + message.content.sendusername + '" class="sendusername" />' +
                            '<input type="hidden" value="' + message.content.receivename + '" class="receivename" />' +
                            '<input type="hidden" value="' + message.content.extra + '" class="total_fee" />' +
                            '<input type="hidden" value="' + data.data.pic + '" class="pic" />' +
                            '</dl>' +
                            '<p><em>微信红包</em><i class="iconfont">&#xe617;</i></p>' +
                            '</div>' +
                            '</div>' +
                            '</li>';
                    } else if (data.data.pos == '2' || data.data.pos == 2) {
                        html = '<li data-id="' + message.content.extra + '">' +
                            '<div class="user-head"><img src="' + data.data.pic + '"></div>' +
                            '<div class="user-msgw">' +
                            '<div class="user-name">' + data.data.username +
                            '<em>主持人</em></div>' +
                            '<div class="user-msg red">' +
                            '<i class="ico"></i>' +
                            '<dl class="redtip open-popup" data-target="#redmsg">' +
                            '<dt><img src="http://www.wtk.so/Public/img/redicon.png"></dt>' +
                            '<dd>老师讲得太赞啦~</dd>' +
                            '<dd>我忍不住赞赏了一个红包</dd>' +
                            '<input type="hidden" value="' + message.content.sendusername + '" class="sendusername" />' +
                            '<input type="hidden" value="' + message.content.receivename + '" class="receivename" />' +
                            '<input type="hidden" value="' + message.content.extra + '" class="total_fee" />' +
                            '<input type="hidden" value="' + data.data.pic + '" class="pic" />' +
                            '</dl>' +
                            '<p><em>微信红包</em><i class="iconfont">&#xe617;</i></p>' +
                            '</div>' +
                            '</div>' +
                            '</li>';
                    } else if (data.data.pos == '1' || data.data.pos == 1) {
                        html = '<li data-id="' + message.content.extra + '">' +
                            '<div class="user-head"><img src="' + data.data.pic + '"><a href="javascript:void(0);" class="reward open-popup" data-target="#zsred">赏</a></div>' +
                            '<div class="user-msgw">' +
                            '<div class="user-name">' + data.data.username +
                            '<em>讲师</em></div>' +
                            '<div class="user-msg red">' +
                            '<i class="ico"></i>' +
                            '<dl class="redtip open-popup" data-target="#redmsg">' +
                            '<dt><img src="http://www.wtk.so/Public/img/redicon.png"></dt>' +
                            '<dd>老师讲得太赞啦~</dd>' +
                            '<dd>我忍不住赞赏了一个红包</dd>' +
                            '<input type="hidden" value="' + message.content.sendusername + '" class="sendusername" />' +
                            '<input type="hidden" value="' + message.content.receivename + '" class="receivename" />' +
                            '<input type="hidden" value="' + message.content.extra + '" class="total_fee" />' +
                            '<input type="hidden" value="' + data.data.pic + '" class="pic" />' +
                            '</dl>' +
                            '<p><em>微信红包</em><i class="iconfont">&#xe617;</i></p>' +
                            '</div>' +
                            '</div>' +
                            '</li>';
                    } else {
                        html = '<li data-id="' + message.content.extra + '">' +
                            '<div class="user-head"><img src="' + data.data.pic + '"></div>' +
                            '<div class="user-msgw">' +
                            '<div class="user-name">' + data.data.username + '</div>' +
                            '<div class="user-msg red">' +
                            '<i class="ico"></i>' +
                            '<dl class="redtip open-popup" data-target="#redmsg">' +
                            '<dt><img src="http://www.wtk.so/Public/img/redicon.png"></dt>' +
                            '<dd>老师讲得太赞啦~</dd>' +
                            '<dd>我忍不住赞赏了一个红包</dd>' +
                            '<input type="hidden" value="' + message.content.sendusername + '" class="sendusername" />' +
                            '<input type="hidden" value="' + message.content.receivename + '" class="receivename" />' +
                            '<input type="hidden" value="' + message.content.extra + '" class="total_fee" />' +
                            '<input type="hidden" value="' + data.data.pic + '" class="pic" />' +
                            '</dl>' +
                            '<p><em>微信红包</em><i class="iconfont">&#xe617;</i></p>' +
                            '</div>'

                        +
                        '</div>' +
                        '</li>';
                    }
                    $('#list').append(html);
                    $('#list').scrollTop($('#list')[0].scrollHeight);
                    $('#listdiv').scrollTop($('#listdiv')[0].scrollHeight);
                }
            },
            'json'
        );
    } else {
        html = '';
        if (userlist[message.senderUserId].pos == '3' || userlist[message.senderUserId].pos == 3) {
            html = '<li class="my" data-id="' + message.content.extra + '">' +
                '<div class="user-head"><img src="' + userlist[message.senderUserId].pic + '"></div>' +
                '<div class="user-msgw">' +
                '<div class="user-msg red">' +
                '<i class="ico"></i>' +
                '<dl class="redtip open-popup" data-target="#redmsg">' +
                '<dt><img src="http://www.wtk.so/Public/img/redicon.png"></dt>' +
                '<dd>老师讲得太赞啦~</dd>' +
                '<dd>我忍不住赞赏了一个红包</dd>' +
                '<input type="hidden" value="' + message.content.sendusername + '" class="sendusername" />' +
                '<input type="hidden" value="' + message.content.receivename + '" class="receivename" />' +
                '<input type="hidden" value="' + message.content.extra + '" class="total_fee" />' +
                '<input type="hidden" value="' + userlist[message.senderUserId].pic + '" class="pic" />' +
                '</dl>' +
                '<p><em>微信红包</em><i class="iconfont">&#xe617;</i></p>' +
                '</div>' +
                '</div>' +
                '</li>';
        } else if (userlist[message.senderUserId].pos == '2' || userlist[message.senderUserId].pos == 2) {
            html = '<li data-id="' + message.content.extra + '">' +
                '<div class="user-head"><img src="' + userlist[message.senderUserId].pic + '"></div>' +
                '<div class="user-msgw">' +
                '<div class="user-name">' + userlist[message.senderUserId].username +
                '<em>主持人</em></div>' +
                '<div class="user-msg red">' +
                '<i class="ico"></i>' +
                '<dl class="redtip open-popup" data-target="#redmsg">' +
                '<dt><img src="http://www.wtk.so/Public/img/redicon.png"></dt>' +
                '<dd>老师讲得太赞啦~</dd>' +
                '<dd>我忍不住赞赏了一个红包</dd>' +
                '<input type="hidden" value="' + message.content.sendusername + '" class="sendusername" />' +
                '<input type="hidden" value="' + message.content.receivename + '" class="receivename" />' +
                '<input type="hidden" value="' + message.content.extra + '" class="total_fee" />' +
                '<input type="hidden" value="' + userlist[message.senderUserId].pic + '" class="pic" />' +
                '</dl>' +
                '<p><em>微信红包</em><i class="iconfont">&#xe617;</i></p>' +
                '</div>' +
                '</div>' +
                '</li>';
        } else if (userlist[message.senderUserId].pos == '1' || userlist[message.senderUserId].pos == 1) {
            html = '<li data-id="' + message.content.extra + '">' +
                '<div class="user-head"><img src="' + userlist[message.senderUserId].pic + '"><a href="javascript:void(0);" class="reward open-popup" data-target="#zsred">赏</a></div>' +
                '<div class="user-msgw">' +
                '<div class="user-name">' + userlist[message.senderUserId].username +
                '<em>讲师</em></div>' +
                '<div class="user-msg red">' +
                '<i class="ico"></i>' +
                '<dl class="redtip open-popup" data-target="#redmsg">' +
                '<dt><img src="http://www.wtk.so/Public/img/redicon.png"></dt>' +
                '<dd>老师讲得太赞啦~</dd>' +
                '<dd>我忍不住赞赏了一个红包</dd>' +
                '<input type="hidden" value="' + message.content.sendusername + '" class="sendusername" />' +
                '<input type="hidden" value="' + message.content.receivename + '" class="receivename" />' +
                '<input type="hidden" value="' + message.content.extra + '" class="total_fee" />' +
                '<input type="hidden" value="' + userlist[message.senderUserId].pic + '" class="pic" />' +
                '</dl>' +
                '<p><em>微信红包</em><i class="iconfont">&#xe617;</i></p>' +
                '</div>' +
                '</div>' +
                '</li>';
        } else {
            html = '<li data-id="' + message.content.extra + '">' +
                '<div class="user-head"><img src="' + userlist[message.senderUserId].pic + '"></div>' +
                '<div class="user-msgw">' +
                '<div class="user-name">' + userlist[message.senderUserId].username + '</div>' +
                '<div class="user-msg red">' +
                '<i class="ico"></i>' +
                '<dl class="redtip open-popup" data-target="#redmsg">' +
                '<dt><img src="http://www.wtk.so/Public/img/redicon.png"></dt>' +
                '<dd>老师讲得太赞啦~</dd>' +
                '<dd>我忍不住赞赏了一个红包</dd>' +
                '<input type="hidden" value="' + message.content.sendusername + '" class="sendusername" />' +
                '<input type="hidden" value="' + message.content.receivename + '" class="receivename" />' +
                '<input type="hidden" value="' + message.content.extra + '" class="total_fee" />' +
                '<input type="hidden" value="' + userlist[message.senderUserId].pic + '" class="pic" />' +
                '</dl>' +
                '<p><em>微信红包</em><i class="iconfont">&#xe617;</i></p>' +
                '</div>'

            +
            '</div>' +
            '</li>';
        }
        $('#list').append(html);
        $('#list').scrollTop($('#list')[0].scrollHeight);
        $('#listdiv').scrollTop($('#listdiv')[0].scrollHeight);
    }
}
// 接收富文本信息
function getTextmessage(message) {
    if (userlist[message.senderUserId] == undefined) {
        $.post(
            getuserurl, {
                'uid': message.senderUserId,
                'classroomid': classroomid
            },
            function(data) {
                if (data.status == 1) {
                    userlist[message.senderUserId] = {
                        'pic': data.data.pic,
                        'pos': data.data.pos,
                        'userid': data.data.userid,
                        'username': data.data.username
                    };
                    var html = '';
                    if (data.data.pos == '3' || data.data.pos == 3) {
                        html = '<li class="my" data-id="' + message.content.extra + '">' +
                            '<div class="user-head"><img src="' + data.data.pic + '"></div>' +
                            '<div class="user-msgw">' +
                            '<div class="user-msg"><i class="ico"></i>' + message.content.content + '</div>' +
                            '</div>' +
                            '</li>';
                        $('#list').append(html);
                        $('#list').scrollTop($('#list')[0].scrollHeight);
                        $('#listdiv').scrollTop($('#listdiv')[0].scrollHeight);
                    } else if (data.data.pos == '2' || data.data.pos == 2) {
                        html = '<li data-id="' + message.content.extra + '">' +
                            '<div class="user-head"><img src="' + data.data.pic + '"></div>' +
                            '<div class="user-msgw">' +
                            '<div class="user-name">' + data.data.username +
                            '<em>主持人</em></div>' +
                            '<div class="user-msg"><i class="ico"></i>' + message.content.content + '</div>' +
                            '</div>' +
                            '</li>';
                        $('#list').append(html);
                        $('#list').scrollTop($('#list')[0].scrollHeight);
                        $('#listdiv').scrollTop($('#listdiv')[0].scrollHeight);
                    } else if (data.data.pos == '1' || data.data.pos == 1) {
                        html = '<li data-id="' + message.content.extra + '">' +
                            '<div class="user-head"><img src="' + data.data.pic + '"><a href="javascript:void(0);" class="reward open-popup" data-target="#zsred">赏</a></div>' +
                            '<div class="user-msgw">' +
                            '<div class="user-name">' + data.data.username +
                            '<em>讲师</em></div>' +
                            '<div class="user-msg"><i class="ico"></i>' + message.content.content + '</div>' +
                            '</div>' +
                            '</li>';
                        $('#list').append(html);
                        $('#list').scrollTop($('#list')[0].scrollHeight);
                        $('#listdiv').scrollTop($('#listdiv')[0].scrollHeight);
                    } else {
                        html = '<li>' +
                            '<img src="' + data.data.pic + '"/>' +
                            '<p class="name"><em>' + data.data.username + '</em>说</p>' +
                            '<p class="con"><i class="icon"></i>' + message.content.content + '</p>' +
                            '</li>';
                        $(PTmessage).append(html);
                        $(PTmessage).scrollTop($(PTmessage)[0].scrollHeight);
                    }

                }
            },
            'json'
        );
    } else {
        var html = '';
        if (userlist[message.senderUserId].pos == '3' || userlist[message.senderUserId].pos == 3) {
            html = '<li class="my" data-id="' + message.content.extra + '">' +
                '<div class="user-head"><img src="' + userlist[message.senderUserId].pic + '"></div>' +
                '<div class="user-msgw">' +
                '<div class="user-msg"><i class="ico"></i>' + message.content.content + '</div>' +
                '</div>' +
                '</li>';
            $('#list').append(html);
            $('#list').scrollTop($('#list')[0].scrollHeight);
            $('#listdiv').scrollTop($('#listdiv')[0].scrollHeight);
        } else if (userlist[message.senderUserId].pos == '2' || userlist[message.senderUserId].pos == 2) {
            html = '<li data-id="' + message.content.extra + '">' +
                '<div class="user-head"><img src="' + userlist[message.senderUserId].pic + '"></div>' +
                '<div class="user-msgw">' +
                '<div class="user-name">' + userlist[message.senderUserId].username +
                '<em>主持人</em></div>' +
                '<div class="user-msg"><i class="ico"></i>' + message.content.content + '</div>' +
                '</div>' +
                '</li>';
            $('#list').append(html);
            $('#list').scrollTop($('#list')[0].scrollHeight);
            $('#listdiv').scrollTop($('#listdiv')[0].scrollHeight);
        } else if (userlist[message.senderUserId].pos == '1' || userlist[message.senderUserId].pos == 1) {
            html = '<li data-id="' + message.content.extra + '">' +
                '<div class="user-head"><img src="' + userlist[message.senderUserId].pic + '"><a href="javascript:void(0);" class="reward open-popup" data-target="#zsred">赏</a></div>' +
                '<div class="user-msgw">' +
                '<div class="user-name">' + userlist[message.senderUserId].username +
                '<em>讲师</em></div>' +
                '<div class="user-msg"><i class="ico"></i>' + message.content.content + '</div>' +
                '</div>' +
                '</li>';
            $('#list').append(html);
            $('#list').scrollTop($('#list')[0].scrollHeight);
            $('#listdiv').scrollTop($('#listdiv')[0].scrollHeight);
        } else {
            html = '<li>' +
                '<img src="' + userlist[message.senderUserId].pic + '"/>' +
                '<p class="name"><em>' + userlist[message.senderUserId].username + '</em>说</p>' +
                '<p class="con"><i class="icon"></i>' + message.content.content + '</p>' +
                '</li>';
            $(PTmessage).append(html);
            $(PTmessage).scrollTop($(PTmessage)[0].scrollHeight);
            if ($('#closelist').is(':hidden')) {
                $('#msg').show();
            }
        }
    }
}
// 接收语音信息
function getVoicemessage(message) {
    if (userlist[message.senderUserId] == undefined) {
        $.post(
            getuserurl, {
                'uid': message.senderUserId,
                'classroomid': classroomid
            },
            function(data) {
                if (data.status == 1) {
                    userlist[message.senderUserId] = {
                        'pic': data.data.pic,
                        'pos': data.data.pos,
                        'userid': data.data.userid,
                        'username': data.data.username
                    };
                    var html = '';
                    var extra = message.content.extra;
                    if (extra == undefined || extra == '') {
                        extra = new Array();
                        extra[0] = '';
                        extra[1] = 1;
                        // RongIMLib.RongIMVoice.preLoaded(message.content.content);
                    }
                    if (data.data.pos == '3' || data.data.pos == 3) {
                        html = '<li class="my" data-id="' + extra[0] + '">' +
                            '<div class="user-head"><img src="' + data.data.pic + '"></div>' +
                            '<div class="user-msgw">' +
                            '<div class="user-msg msgvoice othermsgvoice" data-id="' + extra[0] + '" data-src="' + replace_oss_upload_path(message.content.content) + '" data-img="' + extra[1] + '"><i class="ico"></i>' +
                            '<i class="iconfont">&#xe609;</i>' +
                            message.content.duration + '＂</div>' +
                            '</div>' +
                            '</li>';
                    } else if (data.data.pos == '2' || data.data.pos == 2) {
                        html = '<li data-id="' + extra[0] + '">' +
                            '<div class="user-head"><img src="' + data.data.pic + '"></div>' +
                            '<div class="user-msgw">' +
                            '<div class="user-name">' + data.data.username +
                            '<em>主持人</em></div>' +
                            '<div class="user-msg msgvoice othermsgvoice" data-id="' + extra[0] + '" data-src="' + replace_oss_upload_path(message.content.content) + '" data-img="' + extra[1] + '"><i class="ico"></i>' +
                            '<i class="iconfont">&#xe609;</i>' +
                            message.content.duration +
                            '＂<i class="unread"></i></div>' +
                            '</div>' +
                            '</li>'
                    } else if (data.data.pos == '1' || data.data.pos == 1) {
                        html = '<li data-id="' + extra[0] + '">' +
                            '<div class="user-head"><img src="' + data.data.pic + '"><a href="javascript:void(0);" class="reward open-popup" data-target="#zsred">赏</a></div>' +
                            '<div class="user-msgw">' +
                            '<div class="user-name">' + data.data.username +
                            '<em>讲师</em></div>' +
                            '<div class="user-msg msgvoice othermsgvoice" data-id="' + extra[0] + '" data-src="' + replace_oss_upload_path(message.content.content) + '" data-img="' + extra[1] + '"><i class="ico"></i>' +
                            '<i class="iconfont">&#xe609;</i>' +
                            message.content.duration +
                            '＂<i class="unread"></i></div>' +
                            '</div>' +
                            '</li>'
                    } else {
                        html = '<li data-id="' + extra[0] + '">' +
                            '<div class="user-head"><img src="' + data.data.pic + '"></div>' +
                            '<div class="user-msgw">' +
                            '<div class="user-name">' + data.data.username +
                            '</div>' +
                            '<div class="user-msg msgvoice othermsgvoice" data-id="' + extra[0] + '" data-src="' + replace_oss_upload_path(message.content.content) + '" data-img="' + extra[1] + '"><i class="ico"></i>' +
                            '<i class="iconfont">&#xe609;</i>' +
                            message.content.duration +
                            '＂<i class="unread"></i></div>' +
                            '</div>' +
                            '</li>'
                    }
                    $('#list').append(html);
                    $('#list').scrollTop($('#list')[0].scrollHeight);
                    $('#listdiv').scrollTop($('#listdiv')[0].scrollHeight);
                    // if ($('#closelist').is(':hidden')) {
                    //     $('#msg').show();
                    // }
                }
            },
            'json'
        );
    } else {
        var html = '';
        var extra = message.content.extra;
        if (extra == undefined || extra == '') {
            extra = new Array();
            extra[0] = '';
            extra[1] = 1;
            // RongIMLib.RongIMVoice.preLoaded(message.content.content);
        }
        if (userlist[message.senderUserId].pos == '3' || userlist[message.senderUserId].pos == 3) {
            html = '<li class="my" data-id="' + extra[0] + '">' +
                '<div class="user-head"><img src="' + userlist[message.senderUserId].pic + '"></div>' +
                '<div class="user-msgw">' +
                '<div class="user-msg msgvoice othermsgvoice" data-id="' + extra[0] + '" data-src="' + replace_oss_upload_path(message.content.content) + '" data-img="' + extra[1] + '"><i class="ico"></i>' +
                '<i class="iconfont">&#xe609;</i>' +
                message.content.duration + '＂</div>' +
                '</div>' +
                '</li>';
        } else if (userlist[message.senderUserId].pos == '2' || userlist[message.senderUserId].pos == 2) {
            html = '<li data-id="' + extra[0] + '">' +
                '<div class="user-head"><img src="' + userlist[message.senderUserId].pic + '"></div>' +
                '<div class="user-msgw">' +
                '<div class="user-name">' + userlist[message.senderUserId].username +
                '<em>主持人</em></div>' +
                '<div class="user-msg msgvoice othermsgvoice" data-id="' + extra[0] + '" data-src="' + replace_oss_upload_path(message.content.content) + '" data-img="' + extra[1] + '"><i class="ico"></i>' +
                '<i class="iconfont">&#xe609;</i>' +
                message.content.duration +
                '＂<i class="unread"></i></div>' +
                '</div>' +
                '</li>'
        } else if (userlist[message.senderUserId].pos == '1' || userlist[message.senderUserId].pos == 1) {
            html = '<li data-id="' + extra[0] + '">' +
                '<div class="user-head"><img src="' + userlist[message.senderUserId].pic + '"><a href="javascript:void(0);" class="reward open-popup" data-target="#zsred">赏</a></div>' +
                '<div class="user-msgw">' +
                '<div class="user-name">' + userlist[message.senderUserId].username +
                '<em>讲师</em></div>' +
                '<div class="user-msg msgvoice othermsgvoice" data-id="' + extra[0] + '" data-src="' + replace_oss_upload_path(message.content.content) + '" data-img="' + extra[1] + '"><i class="ico"></i>' +
                '<i class="iconfont">&#xe609;</i>' +
                message.content.duration +
                '＂<i class="unread"></i></div>' +
                '</div>' +
                '</li>'
        } else {
            html = '<li data-id="' + extra[0] + '">' +
                '<div class="user-head"><img src="' + userlist[message.senderUserId].pic + '"></div>' +
                '<div class="user-msgw">' +
                '<div class="user-name">' + userlist[message.senderUserId].username +
                '</div>' +
                '<div class="user-msg msgvoice othermsgvoice" data-id="' + extra[0] + '" data-src="' + replace_oss_upload_path(message.content.content) + '" data-img="' + extra[1] + '"><i class="ico"></i>' +
                '<i class="iconfont">&#xe609;</i>' +
                message.content.duration +
                '＂<i class="unread"></i></div>' +
                '</div>' +
                '</li>'
        }
        $('#list').append(html);
        $('#list').scrollTop($('#list')[0].scrollHeight);
        $('#listdiv').scrollTop($('#listdiv')[0].scrollHeight);
    }
}
// 接收图片信息
function getImagemessage(message) {
    if (userlist[message.senderUserId] == undefined) {
        $.post(
            getuserurl, {
                'uid': message.senderUserId,
                'classroomid': classroomid
            },
            function(data) {
                if (data.status == 1) {
                    userlist[message.senderUserId] = {
                        'pic': data.data.pic,
                        'pos': data.data.pos,
                        'userid': data.data.userid,
                        'username': data.data.username
                    };
                    var html = '';
                    if (message.content.content.length > 100) {
                        message.content.content = message.content.imageUri;
                    }
                    if (data.data.pos == '3' || data.data.pos == 3) {
                        html = '<li class="my" data-id="' + message.content.extra + '">' +
                            '<div class="user-head"><img src="' + data.data.pic + '"></div>' +
                            '<div class="user-msgw">' +
                            '<div class="user-msg msgimage"><i class="ico"></i><img src="' + replace_oss_upload_path(message.content.content) + '" /></div>' +
                            '</div>' +
                            '</li>';
                    } else if (data.data.pos == '2' || data.data.pos == 2) {
                        html = '<li data-id="' + message.content.extra + '">' +
                            '<div class="user-head"><img src="' + data.data.pic + '"></div>' +
                            '<div class="user-msgw">' +
                            '<div class="user-name">' + data.data.username +
                            '<em>主持人</em></div>' +
                            '<div class="user-msg msgimage"><i class="ico"></i><img src="' + replace_oss_upload_path(message.content.content) + '" /></div>' +
                            '</div>' +
                            '</li>';
                    } else if (data.data.pos == '1' || data.data.pos == 1) {
                        html = '<li data-id="' + message.content.extra + '">' +
                            '<div class="user-head"><img src="' + data.data.pic + '"><a href="javascript:void(0);" class="reward open-popup" data-target="#zsred">赏</a></div>' +
                            '<div class="user-msgw">' +
                            '<div class="user-name">' + data.data.username +
                            '<em>讲师</em></div>' +
                            '<div class="user-msg msgimage"><i class="ico"></i><img src="' + replace_oss_upload_path(message.content.content) + '" /></div>' +
                            '</div>' +
                            '</li>';
                    } else {
                        html = '<li data-id="' + message.content.extra + '">' +
                            '<div class="user-head"><img src="' + data.data.pic + '"></div>' +
                            '<div class="user-msgw">' +
                            '<div class="user-name">' + data.data.username + '</div>' +
                            '<div class="user-msg msgimage"><i class="ico"></i><img src="' + replace_oss_upload_path(message.content.content) + '" /></div>' +
                            '</div>' +
                            '</li>';
                    }
                    $('#list').append(html);
                    $('#list').scrollTop($('#list')[0].scrollHeight);
                    $('#listdiv').scrollTop($('#listdiv')[0].scrollHeight);
                }
            },
            'json'
        );
    } else {
        var html = '';
        if (message.content.content.length > 100) {
            message.content.content = message.content.imageUri;
        }
        if (userlist[message.senderUserId].pos == '3' || userlist[message.senderUserId].pos == 3) {
            html = '<li class="my" data-id="' + message.content.extra + '">' +
                '<div class="user-head"><img src="' + userlist[message.senderUserId].pic + '"></div>' +
                '<div class="user-msgw">' +
                '<div class="user-msg msgimage"><i class="ico"></i><img src="' + replace_oss_upload_path(message.content.content) + '" /></div>' +
                '</div>' +
                '</li>';
        } else if (userlist[message.senderUserId].pos == '2' || userlist[message.senderUserId].pos == 2) {
            html = '<li data-id="' + message.content.extra + '">' +
                '<div class="user-head"><img src="' + userlist[message.senderUserId].pic + '"></div>' +
                '<div class="user-msgw">' +
                '<div class="user-name">' + userlist[message.senderUserId].username +
                '<em>主持人</em></div>' +
                '<div class="user-msg msgimage"><i class="ico"></i><img src="' + replace_oss_upload_path(message.content.content) + '" /></div>' +
                '</div>' +
                '</li>';
        } else if (userlist[message.senderUserId].pos == '1' || userlist[message.senderUserId].pos == 1) {
            html = '<li data-id="' + message.content.extra + '">' +
                '<div class="user-head"><img src="' + userlist[message.senderUserId].pic + '"><a href="javascript:void(0);" class="reward open-popup" data-target="#zsred">赏</a></div>' +
                '<div class="user-msgw">' +
                '<div class="user-name">' + userlist[message.senderUserId].username +
                '<em>讲师</em></div>' +
                '<div class="user-msg msgimage"><i class="ico"></i><img src="' + replace_oss_upload_path(message.content.content) + '" /></div>' +
                '</div>' +
                '</li>';
        } else {
            html = '<li data-id="' + message.content.extra + '">' +
                '<div class="user-head"><img src="' + userlist[message.senderUserId].pic + '"></div>' +
                '<div class="user-msgw">' +
                '<div class="user-name">' + userlist[message.senderUserId].username + '</div>' +
                '<div class="user-msg msgimage"><i class="ico"></i><img src="' + replace_oss_upload_path(message.content.content) + '" /></div>' +
                '</div>' +
                '</li>';
        }
        $('#list').append(html);
        $('#list').scrollTop($('#list')[0].scrollHeight);
        $('#listdiv').scrollTop($('#listdiv')[0].scrollHeight);
    }
}
// 接收系统消息
function getSystemMessage(message) {
    var html = '<li><p class="systemtip"><em>系统消息：' + message.content.content + '</em></p></li>';
    $('#list').append(html);
    $('#list').scrollTop($('#list')[0].scrollHeight);
    $('#listdiv').scrollTop($('#listdiv')[0].scrollHeight);
}
// 接收系统消息
function getInfoNtfMessage(message) {
    var html = '<li><p class="systemtip"><em>系统消息：' + message.content.message + '</em></p></li>';
    $('#list').append(html);
    $('#list').scrollTop($('#list')[0].scrollHeight);
    $('#listdiv').scrollTop($('#listdiv')[0].scrollHeight);
}

function sub(str, n) {
    var r = /[^\x00-\xff]/g;
    if (str.replace(r, "mm").length <= n) {
        return str;
    }
    var m = Math.floor(n / 2);
    for (var i = m; i < str.length; i++) {
        if (str.substr(0, i).replace(r, "mm").length >= n) {
            return str.substr(0, i) + "...";
        }
    }
    return str;
}

function replace_oss_upload_path(src) {
    var srcs = src.split('/');
    srcs[0] = bucketsarr[srcs[0]];
    if (srcs[0] == undefined || srcs[0] == '') {
        return src;
    }
    return srcs.join('/');
}

function isiOS() {
    return !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
}

function isAndroid() {
    var a = navigator.userAgent;
    return -1 < a.indexOf("Android") || -1 < a.indexOf("Linux")
}
