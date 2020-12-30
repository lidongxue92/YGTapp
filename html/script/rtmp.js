var bPlayer;
var UIChatTools;
apiready = function() { //API载入就绪（功能初始化）
  bPlayer = api.require('bPlayer');  //实例化百度播放器
  //api.setScreenOrientation({
  //    orientation: 'auto'
  //});

  talkId = api.pageParam.roomid;
  socketurl = api.pageParam.socketurl;

  var tichu = localStorage.getItem(talkId+'tichu');
  if(tichu !=null){
      if(tichu == userobj.id){
          $("#tishi").html("<center>您已经永远禁止访问本直播间！</center>").show();
          return;
      }
  }
  var jinyan = localStorage.getItem(talkId+'jinyan');
  if(jinyan !=null){
      if(jinyan == userobj.id){
          UIChatTools.hide();
          return;
      }
  }
  api.addEventListener({
        name:'resume'
    }, function(ret, err){
      isFullScreen();
    });

  //(推流地址，通信服务地址,PPT对象，当前播放页码,当前直播时间，主播人ID)
  $.get(liveserver+"/Server/Manager.ashx", { param: "getpushurl", roomid: talkId, litype: 0, r: Math.random() }, function (data) {
    //  console.log(talkId+','+liveserver);
      if (data != undefined && data != null) {
          //console.log(JSON.stringify(data));
          var liveinfo = eval("(" + data + ")");
          if (liveinfo.mes != null) {
                pushurl = liveinfo.mes.Live_StuRtmp;
                $("#teacher_name").html( liveinfo.mes.Live_name+"<br />"+ userobj.name);
                livetype = liveinfo.mes.Live_Type;//直播类型（2为OBS,1为PPT+语音）

                socketurl =liveinfo.mes.Live_RoomSocketUrl;

                //  userobj.name = liveinfo.mes.Live_TeacherName+"(APP)";
                //  userobj.id= liveinfo.mes[0].Live_TeacherId;
                //查询当前直播间的一些参数
                $.get(liveserver+"/server/httprequest.ashx", { action: "getcurrentoperator", talkId: talkId, r: Math.random() }, function (data) {
                    if (data != undefined && data != null) {
                          //console.log(data);
                          //alert(talkId+','+data);
                          var fanhui =  data.split("|");

                          if(fanhui.length == 2)
                          {
                            if(fanhui[0] != ""){
                                var zhiboren = JSON.parse(fanhui[0]);//当前正在主讲的人
                                micid = zhiboren.TeacherId;

                                liveplay(pushurl);
                            }
                            else {
                                micid = "";
                            }


                            if(fanhui[1] != ""){

                                var jiaoan = JSON.parse(fanhui[1].toLowerCase());//获得教案信息
                                //console.log(JSON.stringify(jiaoan));

                                liveRecord.loadImg(jiaoan.id); //加载所有图片div
                                //跳转到当前图片
                              //  swiper.slideTo(jiaoan.id.PageNum, 200, true);

                                zbtiem=jiaoan.id.title;
                            }
                          }
                    }
                });
                if(liveinfo.mes.Live_Status == 0) //状态值  0未开始  1开始 2结束
                {
                    msgshow('直播还未开始！',5000);
                }
                else if(liveinfo.mes.Live_Status == 1) {
                      sysConfig.zhibotime();
                }
                else {
                    $("#tishi").html("<center>直播已结束</center>").show();
                }
                if(livetype != "1"){
                    $("#tishi").html("<center>本直播工具暂时不支持语音直播意外的其它模式，请关注今后版本更新</center>").show();
                }
                //alert(socketurl);
                //4、连接通信服务器
                loadJs(socketurl+"/socket.io/socket.io.js",function(){
                    //alert("x");
                      Messaging.initMsg(socketurl);
                });

          }
          else {
            $("#tishi").html("<center>直播间不存在或已被删除！</center>").show();
          }
      }
  });


  //4、连接通信服务器
  //Messaging.initMsg();
  sysConfig.zhibotime();//启动计时


  api.setKeepScreenOn({//禁止休眠
      keepOn: true
  });


  var connectionType = api.connectionType.toUpperCase();  //比如： wifi
  if(connectionType == "4G" || connectionType == "3G" ||  connectionType =="2G")
  {
      msgshow('您在使用手机流量，可能会产生额外费用！',5000);
  }
  else if(connectionType == "none") {
    $("#tishi").html("<center>网络异常或无网络访问权限</center>").show();
  }

  api.addEventListener({
      name: 'keyback'
  }, function(ret, err) {
      //alert('按了返回键');.
      return;
  });

  var zongkuan = $(window).width();
  UIChatTools = api.require('UIChatTools');
  UIChatTools.open({
      chatBox: {
          placeholder: '请输入聊天内容',
          autoFocuse: false,
          maxRows: 6
      },
      styles: {
          bgColor: '#eee',
          margin: 10
      },
      tools: {
          h: 22,
          iconSize: 20,
        /*  recorder: {
             normal: 'fs://UIChatTolls/recorder.png',
             selected: 'fs://UIChatTolls/recorder1.png'
          },
          image: {
             normal: 'fs://UIChatTolls/image.png',
             selected: 'fs://UIChatTolls/image1.png'
          },
          face: {
             normal: 'fs://UIChatTolls/face.png',
             selected: 'fs://UIChatTolls/face1.png'
          }*/

      },
      emotions:['widget://res/emotions/basic','widget://res/emotions/append1','widget://res/emotions/append2']
  }, function(ret) {
      if (ret) {
          //api.alert({msg:JSON.stringify(ret)});
          //console.log(JSON.stringify(ret));
          if(ret.eventType == "send"){
            if(ret.msg != ""){
              var data = JSON.stringify({
                   dataType: 'MESSAGE',
                   dataContent: ret.msg,
                   username: userobj.name,
                   userid: userobj.id,
                   livetiem: new Date().getTime(),
                   usertype: userobj.type
              });
              Messaging.publish(talkId, data);
              msgshow("发送成功！");
              UIChatTools.clearText();
              UIChatTools.closeKeyboard();
            }
          }
      }
  });

UIChatTools.recorderListener(function(ret) {
    if(ret.eventType == 'press' && ret.target == 'talkback'){
        alert('按下录音');
    }

    if(ret.eventType == 'start' && ret.target == 'record'){
        alert('开始录音');
    }
});
};
var liveplay = function(liveurl){
  //alert(liveurl);
  bPlayer.open({
        rect: {
            x: -10,
            y: -10,
            w: 10,
            h: 10,
        },
        path:liveurl,//mima.replace('\\', '/'),
        autoPlay: true
    }, function(ret) {
        if (ret.status) {
          bPlayer.addEventListener({
                      name : ['playbackState','loadState']
                      },
                      function(ret) {
                         if (ret) {
                             console.log(JSON.stringify(ret));
                             if(ret.eventType == "error " && micid !="")
                             {
                              //  $("#chat-messages").append("<p class='log'>音频异常,正在尝试重连</p>");
                                setTimeout(function(){
                                  chongkaishi(liveurl);
                                },1000);

                             }
                             else {

                             }
                         }
          });
          $("#tishilive").text("直播中");
          $("#guanquan").show();
        }
        else {
            $("#chat-messages").append("<p class='log' style='color:red'>音频播放器载入失败</p>");
        }
  });


}
var chongkaishi = function(liveurl){
  //alert("开始播放直播"+liveurl);
  console.log("开始播放直播"+liveurl);
  bPlayer.replay({
              path : liveurl,
              autoPlay : true,
     },function(ret) {
         //alert("开始播放直播"+JSON.stringify(ret));
         if (ret) {
           if(ret.eventType == "error" && micid !="")
           {
              // $("#chat-messages").append("<p class='log'>音频异常,常识重连</p>");
               setTimeout(function(){
                 chongkaishi(liveurl);
               },1000);
           }
           else {
             console.log("xxx"+JSON.stringify(ret));
           }

         }
   });
}
var playstop = function () {
  try {
    bPlayer.cancelFull();
    bPlayer.stop();
    bPlayer.close();
  } catch (e) {

  } finally {
    $("#guanquan").hide();
    $("#tishilive").text("暂无主播");
  }
}
var liveover = function(){
  api.confirm({
      title: '系统提示',
      msg: '请确定是否退出直播间？',
      buttons: ['确定', '取消']
  }, function(ret, err) {
      console.log(JSON.stringify(ret));
      var index = ret.buttonIndex;
      if(index == 1)
      {
          playstop();
          api.closeWin();
      }
  });
}
//短提示
var msgshow = function(msgtext,dtime){
  if(dtime == undefined)
  {
    dtime = 2000;
  }
  api.toast({
      msg: msgtext,
      duration: dtime,
      location: 'bottom'
  });
}
//异步加载js
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
