var alivcLivePusher;
var uislider;

apiready = function() { //API载入就绪（功能初始化）

  //api.setFullScreen({ //全屏
  //    fullScreen: true
  //});
  api.addEventListener({
      name: 'keyback'
  }, function(ret, err) {
      //alert('按了返回键');.
      msgshow('点击右上角退出直播间',5000);
      return;
  });
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

  uislider = api.require('UISlider');

  api.addEventListener({
      name:'volumedown'
  }, function(ret, err){
      yinliangshow();
  });
  api.addEventListener({
      name: 'volumeup'
  }, function(ret, err) {
        yinliangshow();
  });

  //console.log("API载入就绪");
  alivcLivePusher = api.require('alivcLivePusher');
  if(api.debug){
    //测试悬浮窗，发布时候注释掉
    alivcLivePusher.showDebugView();
  }

        $.post(liveserver+"/Server/Manager.ashx", { param: "getpushurl", roomid: talkId, litype: 0, r: Math.random() }, function (data) {
            if (data != undefined && data != null) {
              //console.log(data);
                var liveinfo = eval("(" + data + ")");
                if (liveinfo.mes != null) {
                      pushurl = liveinfo.mes.Live_TeacherRtmp;
                      //$(".teacher_name").html( liveinfo.mes.Live_name+"<br />"+ liveinfo.mes.Live_TeacherName);
                      $(".teacher_name").html( liveinfo.mes.Live_name+"<br />"+ sysUserInfo.user_Name);
                      livetype = liveinfo.mes.Live_Type;//直播类型（2为OBS,1为PPT+语音）
                    //  userobj.name = liveinfo.mes.Live_TeacherName+"(APP)";
                    //  userobj.id= liveinfo.mes[0].Live_TeacherId;
                      socketserver = liveinfo.mes.Live_RoomSocketUrl;
                      loadJs(socketserver+"/socket.io/socket.io.js",function(){
                            Messaging.initMsg(socketserver);
                      });


                      if(liveinfo.mes.Live_Status == 0) //状态值  0未开始  1开始 2结束
                      {

                      }
                      else if(liveinfo.mes.Live_Status == 1) {
                            sysConfig.zhibotime();
                      }
                      else {
                          $("#tishi").html("<center>直播已结束</center>").show();
                      }
                      if(livetype == "1"){
                        alivcLivePusher.initPusher({
                              resolution:'540P',
                              initialVideoBitrate:800,
                              targetVideoBitrate:2000,
                              minVideoBitrate:400,
                              qualityMode:'Custom',
                              beautyMode:'professional',
                              previewOrientation:'PORTRAIT',
                              beautyEnable:true,
                              fps:60,
                              videoOnly:false,
                              audioOnly:true
                          },function(ret){
                            if(ret.status) //初始化成功
                            {
                                  console.log('初始化直播：'+JSON.stringify(ret));
                            }
                            else {
                                msgshow('直播初始化失败！');
                                console.log(JSON.stringify(ret));
                            }
                          });
                          var zongkuan = $(window).width();
                          alivcLivePusher.startPreview({
                                    rect: {
                                         x: 0,y: 0,w:zongkuan,h: 250
                                    }
                                    },function(ret){
                                      if(ret.status) //捕获音频或视频数据
                                      {
                                            console.log('开启麦克风：'+JSON.stringify(ret));
                                      }
                                      else {
                                          msgshow('直播失败！摄像头或麦克风读取异常！');
                                          console.log(JSON.stringify(ret));
                                      }
                          });
                      }
                      else if(livetype == "2"){//视频直播
                        alivcLivePusher.initPusher({
                              resolution:'720P',
                              initialVideoBitrate:1000,
                              targetVideoBitrate:2000,
                              minVideoBitrate:800,
                              qualityMode:'FluencyFirst',
                              beautyMode:'professional',
                              previewOrientation:'PORTRAIT',
                              beautyEnable:true,
                              fps:24
                          },function(ret){
                            if(ret.status) //初始化成功
                            {
                                  console.log('初始化直播：'+JSON.stringify(ret));
                            }
                            else {
                                msgshow('直播初始化失败！');
                                console.log(JSON.stringify(ret));
                            }
                          });



                          alivcLivePusher.startPreview({
                                    rect: {
                                         x: 0,y: 0,w:141,h: 250
                                    },
                                  //  fixedOn:'yulan'
                                    },function(ret){
                                      if(ret.status) //捕获音频或视频数据
                                      {
                                            console.log('开启摄像头：'+JSON.stringify(ret));

                                      }
                                      else {
                                          msgshow('直播失败！摄像头或麦克风读取异常！');
                                          console.log(JSON.stringify(ret));
                                      }
                          });


                      }
                      else {
                        $("#tishi").html("<center>本直播工具暂时不支持语音直播意外的其它模式"+livetype+"，请关注今后版本更新</center>").show();
                      }
                      //4、连接通信服务器


                }
                else {
                  $("#tishi").html("<center>直播间不存在或已被删除！</center>").show();
                }
            }
        });
        //查询当前直播间的一些参数
        $.post(liveserver+"/server/httprequest.ashx", { action: "getcurrentoperator", talkId: talkId, r: Math.random() }, function (data) {
            if (data != undefined && data != null) {
                  console.log(data);
                  var fanhui =  data.split("|");
                  if(fanhui.length == 2)
                  {
                    if(fanhui[0] != ""){
                        var zhiboren = JSON.parse(fanhui[0]);//当前正在主讲的人
                        micid = zhiboren.TeacherId;
                    }
                    else {
                        micid = "";
                    }
                    if(fanhui[1] != ""){
                        var jiaoan = JSON.parse(fanhui[1].toLowerCase());//获得教案信息
                        console.log(JSON.stringify(jiaoan));

                        liveRecord.loadImg(jiaoan.id); //加载所有图片div
                        //跳转到当前图片
                        //swiper.slideTo(jiaoan.id.PageNum, 200, true);

                        zbtiem=jiaoan.id.title;
                    }
                  }
            }
        });

  //监听直播状态
  alivcLivePusher.addEventListener(function(ret){
      if(ret.eventType == "connectFail")//链接失败
      {
        $("#zhibozhuangtai").css("background-color","red");
        alert("服务器连接失败");
      }
      else if (ret.eventType == "previewStarted") {
          $("#zhibozhuangtai").css("background-color","#fbea00");
      }
      else if (ret.eventType=="previewStoped") {
            $("#zhibozhuangtai").css("background-color","red");
      }
      else if (ret.eventType == "pushStarted") {
          $("#zhibozhuangtai").css("background-color","green");
      }
      else if (ret.eventType == "pushStoped") {
          $("#zhibozhuangtai").css("background-color","red");
      }
      else if (ret.eventType == "pushRestarted") {
          $("#zhibozhuangtai").css("background-color","green");
      }
      else if (ret.eventType == "dropFrame") {
          $("#zhibozhuangtai").css("background-color","#aebb07");
      }
      else if (ret.eventType == "networkPoor") {
          $("#zhibozhuangtai").css("background-color","#fb9900");
      }
      else if (ret.eventType == "networkRecovery") {
          $("#zhibozhuangtai").css("background-color","green");
      }
      else if (ret.eventType == "reconnectStart") {
          $("#zhibozhuangtai").css("background-color","#999");
      }
      else if (ret.eventType == "reconnectFail") {
          $("#zhibozhuangtai").css("background-color","red");
      }
      else if (ret.eventType == "reconnectSucceed") {
          $("#zhibozhuangtai").css("background-color","green");
      }
      else {
        console.log(JSON.stringify(ret));
      }


  });



};
//开始直播
var  livego =  function () {
    if(micid == "" || micid == userobj.id ||micid == null || micid == "null")
    {
      alivcLivePusher.setpreviewDisplayMode(function(ret){
          alert(JSON.stringify(ret));
      });
    }
    else {
        msgshow('麦序占用中！上麦失败！'+micid);
        return;
    }
try{
      //在做直播初始化之前，需要先验证是否有人在直播
    alivcLivePusher.startPush({
       url: pushurl,
    },function(ret){
      if(ret.status) //推流成功
      {
            sysConfig.zhibotime();//启动计时器
            $("#livestart").hide();
            $("#liveing").show();
            $("#zhibozhuangtai").css("background-color","green");

            var livemsg = JSON.stringify({
                dataType: 'MESSAGE',
                dataContent: 'cmd:startmkf',
                username: userobj.name,
                userid: userobj.id,
                usertype: userobj.type,
                livetiem: zbtiem
            });
            Messaging.publish(talkId, livemsg); //向学员推送通知

            //除了发送给学员，还要发给服务器一份
            $.post(liveserver+"/Server/Manager.ashx", { param: "getpushurl", roomid: talkId, litype: 0,teachername:userobj.name,teacherid:userobj.id, r: Math.random() },
             function (data) {
               //alert("xxxx"+data)
                console.log(data);
            });
            // 用于录制回放使用 王晓帅 0709
            liveAppRecord(false);
            // end

            //降噪设置
            alivcLivePusher.setAudioDenoise({
              isOpen:true,
            });
            msgshow("语音上麦正常");
      }
      else {
          msgshow('直播推送失败！.');
      }

    });
}catch(e){
  msgshow('异常啦');
  alert(e);
}
    //开启直播后增加一些监听
    api.addEventListener({
            name: 'keymenu'
        }, function(ret, err) {
          msgshow('直播还在后台进行中.');
    });

    //如监听网络连接事件
    api.addEventListener({
        name: 'online'
    }, function(ret, err) {
        msgshow('网络已经恢复.');
        $("#zhibozhuangtai").css("background-color","green");
    });
    api.addEventListener({
        name:'offline'
    }, function(ret, err){
        msgshow('网络中断.');
        $("#zhibozhuangtai").css("background-color","red");
    });
}

// 用于录制回放使用 王晓帅 0709
// flag 是否下麦
var liveAppRecord = function(flag){
  var pushLiveDate = new Date().getTime();
  var pushStr = {"id": pushLiveDate,
      "type": "1",
      "title": zbtiem,
      "dis": "上麦",
      "fileNames": [],
      "pagenum": 0,
      "fxpathMax": "",
      "option": []};
  if(flag){
    pushStr.dis = "下麦";
  }
  // 录制key
  var lznum = "zhibo_app_luzhi_"+talkId;
  //提交录制记录
  $.post(liveserver+"/Server/HttpRequest.ashx", { action: "saveappredis", talkId: lznum, jsonstr: encodeURIComponent(JSON.stringify(pushStr)) }, function (data) {
      console.log("提交录制记录:" + data); //录制记录
  });
  // end
}
//结束直播
var liveend = function () {
  //alivcLivePusher.pause();//暂停
  zbflag = false;
  alivcLivePusher.stopPush();
  $("#liveing").hide();
  $("#livestart").show();
  $("#zhibozhuangtai").css("background-color","#999");


  var livemsg = JSON.stringify({
                dataType: 'MESSAGE',
                dataContent: "cmd:colsemkf",
                username: userobj.name,
                livetiem: zbtiem,
                usertype: userobj.type,
                userid: userobj.id
  });
  Messaging.publish(talkId, livemsg);
  //将下麦时间给服务器
  $.post(liveserver+"/Server/Manager.ashx", { param: "overteacher", roomid: talkId,  r: Math.random() },
  function (data) {
    console.log(data);
  });
  liveAppRecord(true);
}
var liveover = function(){
  api.confirm({
      title: '系统提示',
      msg: '请确定是否推出直播间？',
      buttons: ['确定', '取消']
  }, function(ret, err) {
      var index = ret.buttonIndex;
      if(index == 1)
      {
          liveend();
          $("#liveoverdiv").show();
      }
  });
}
//静音
var jinyingstype=false;//静音状态
var jingyin = function () {
  if(!jinyingstype){
    jinyingstype = true;
    $("#jingyinbtn").css("background-color","red");
  }
  else {
    jinyingstype = false;
    $("#jingyinbtn").css("background-color","#00aacf");
  }
  alivcLivePusher.setMute({
      isMute:jinyingstype
  });
}
//美颜参数
var livemeiyan = function () {
    alivcLivePusher.setBeautyValues({
            beautyWhite:80, //美白
            beautyBuffing:80,//磨皮
            //beautyRuddy:1,//红润
            beautyCheekPink:100,//瘦脸
            beautyThinFace:100,//收下吧
            beautyShortenFace:10,//腮红度
            beautyBigEye:10 //大眼
    });
}
var bgmgo = function(url,obj){
    var state = $(obj).attr("state");
    if(state == undefined || state == null || state =="0")
    {
      $(".icon-zanting").removeClass("icon-zanting").css("color","").addClass("icon-bofang");
      $(obj).html("<i class=\"iconfont icon-zanting\" style=\"color:#39f\"></i>");
      $(obj).attr("state","1") //0未开始，1开始，2暂停
      bgmplay(url);
    }
    else {
      $(obj).html("<i class=\"iconfont icon-bofang\" ></i>");
      $(obj).attr("state","0") //0未开始，1开始，2暂停
      bgmend();
    }


}
//播放背景音乐
var bgmplay = function(path) {
//  alert(path);
//  bgmend();
  alivcLivePusher.startBGMWithMusicPathAsync({
  path:path,
  },function(ret){
      //播放模式(循环播放)
    //  alert(JSON.stringify(ret));
    //  alivcLivePusher.setBGMLoop({
      //  isLoop:true,
      //});
  });

}
//停止播放
var bgmend = function () {
  //alivcLivePusher.pauseBGM();//暂停
  //alivcLivePusher.resumeBGM();//恢复
  alivcLivePusher.stopBGMAsync();
}
//耳反开关
var erfan = function (bools) {
  alivcLivePusher.setBGMEarsBack({
      isOpen:bools,
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
var yinliangshow = function(){
  $("#yinliangtiao").show();

  if(ids.length >0)
  {
    for (var i = 0; i < ids.length; i++) {
      uislider.show({
          id: ids[i]
      });
    }
  }
  else {
    //mic音量
    uislidernew(90,function(vules){
        alivcLivePusher.setCaptureVolume({
          volume:vules.value,
        });
    });
    //背景音乐
    uislidernew(170,function(vules){
      alivcLivePusher.setBGMVolume({
        volume:vules.value,
      });
    });
  }


  setTimeout(function(){
    for (var i = 0; i < ids.length; i++) {
      uislider.hide({
          id: ids[i]
      });

    }
    //ids =[];
    $("#yinliangtiao").hide();

  },5000);
}
var yinlianghide = function(){
  for (var i = 0; i < ids.length; i++) {
    uislider.hide({
        id: ids[i]
    });

  }
  //ids =[];
  $("#yinliangtiao").hide();
}
var ids=[];
var uislidernew = function(y,fun){
  uislider.open({
      animation: true,
      orientation: 'horizontal',
      rect: {
          x: 0,
          y: y,
          size: 300
      },
      bubble: {
          state: 'hide'
      },
      handler: {
          w: 40,
          h: 40,
          bg: 'widget://images/handler.png'
      },
      bar: {
          h: 4,
          bg: '#888',
          active: '#39f',
      },
      value: {
          min: 1,
          max: 100,
          step: 1,
          init: 50
      },
      fixedOn: api.frameName,
      fixed: false
  }, function(ret, err) {
    //  console.log(JSON.stringify(ret));
      if (ret) {
          if(ret.eventType == 'show'){
              ids.push(ret.id);
          }
         else if(ret.eventType == 'end'){
            fun(ret);
         }
      } else {
          //alert(JSON.stringify(err));
      }
  });
}

var bgmshow = function(){
  $("#bgmdiv").animate({"top":"0"});
}
var bgmclose = function(){
  $("#bgmdiv").animate({"top":"-110%"});
}
