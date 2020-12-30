var ajpush;
var downloadManager;//下载插件对象
var FNScanner;//扫码工具
var bmap;
//系统进入后，需要后台初始化的内容（针对原生APP操作类）
apiready = function() {
  //************************通讯系统初始化。接受通知**********************************//
  console.log('初始化开始-----!');
  api.setStatusBarStyle({
     style: 'dark'
     //,color: 'rgba(0,0,0,0.0)'
  });
  var u = navigator.userAgent;
   var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
   var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
  // alert('是否是Android：'+isAndroid);
  // alert('是否是iOS：'+);
   if(isiOS){
     $("body").append("<style>.popup{margin-top: 0!important;}</style>");
   }

  // $("body").css("margin-top",api.safeArea.top+"px");

  var connectionType = api.connectionType.toUpperCase();  //比如： wifi
  if(connectionType == "4G" || connectionType == "3G" ||  connectionType =="2G")
  {
      api.toast({
          msg: '您在使用手机流量，可能会产生额外费用！',
          duration: 5000,
          location: 'bottom'
      });
  }
  else if(connectionType == "NONE") {
    alert("检测到您当前无法连接网络,为您打开离线缓存进行学习！");
  //  api.toast({
  //      msg: '网络异常或无网络访问权限',
  //      duration: 5000,
  //      location: 'bottom'
  //  });
    openDownManager();
    //	$("#tishi").html("<center>网络异常或无网络访问权限</center>").show();

  }



  ajpush = api.require('ajpush');
  ajpush.init(function(ret, err){
    if(ret && ret.status){
      console.log('操作成功!');
    }else{
      console.log('操作失败!');
    }
  });
  //启动事件监听（注意：只有点击了通知才会触发，注意页面激活后，把页面上数据更新下）
  api.addEventListener({name:'appintent'}, function(ret,err) {
    //console.log('通知被点击，收到数据：\n' + JSON.stringify(ret));//监听通知被点击后收到的数据
    if(ret && ret.appParam.ajpush){
        var ajpush = ret.appParam.ajpush;
      //  alert(JSON.stringify(ajpush));
        var id = ajpush.id;
        //alert(id);
        //console.log("APPID:"+id);
        var title = ajpush.title;
        var content = ajpush.content;
        var extra = ajpush.extra;
        //alert(content);
        try{
          var MsgInfo={
              id:id,
              title:title,
              content:content,
              //date:"2018-07-31",
              type:"2",//1.班级动态消息推送只有id（需要查询），2其他
          };
          if(extra.xid != undefined){//班级通知
            MsgInfo={
                classid:extra.xid,//班级ID
                id:extra.infoid, //消息ID
                type:extra.xtype,//1.班级动态消息推送只有id（需要查询），2其他（系统推送的）
                souce:extra.souce //消息类型
            };
          }

          SetlocalStorage("MsgInfo", JSON.stringify(MsgInfo));
          $.popup('.popup-services');
        }
        catch(e){
          console.log('通知错误：'+JSON.stringify(e));
        }
    }
  })
  //监听应用进入后台，通知jpush暂停事件
  api.addEventListener({name:'pause'}, function(ret,err) {
    //ajpush.onPause();
    console.log('APP进入后台');
    ajpush.removeListener();
  })
  //监听应用恢复到前台，通知jpush恢复事件
  api.addEventListener({name:'resume'}, function(ret,err) {
    //ajpush.onResume();
    console.log('APP被激活'+JSON.stringify(ret)+'|'+JSON.stringify(err));
    getxiaoxi();
  })
  //获得用户标识
  ajpush.getRegistrationId(function(ret) {
     var registrationId = ret.id;
     console.log('jpush_id:'+registrationId);
     var user = getUserInfo();
     if(user == null)
     {
       return false;
     }
     //console.log(JSON.stringify(user));
     //判断当前设备ID，是否与系统中一致，如果不一致，则更新
     if(user.thirdid == undefined || registrationId != user.thirdid)
     {
       var token = "userinfo_token is none";
          getAjax(javaserver+"/ApiUser/modifyAppIdentity",

          {"appid":registrationId,"userid":user.user_ID,"token":strToJson(GetlocalStorage("userinfo_token"),token)},
          function(data){
              data = JSON.parse(data);
              if(data.errorcode == "0")
              {
                console.log('通讯ID同步成功：'+registrationId);
              }
              else {
                console.log('通讯ID同步失败：'+data.errorcode);
              }

          });
     }
     else {
       console.log("通讯已打通！");
     }
  });
  //获取消息，如果用户不点击通知，系统无法自动更新消息内容，需要程序子集更新
  function getxiaoxi(){
    //获得用户消息(只有在当前软件激活情况下起作用，非激活状态下，走上面通知业务)
    ajpush.setListener(
        function(ret) {
             var id = ret.id;
             var title = ret.title;
             var content = ret.content;
             var extra = ret.extra;
             console.log('jpush_SMS:'+content);
        }
    );
  }
  getxiaoxi();//进入系统时开始监听消息，切出系统时暂停

  //***********************初始化离线缓存********************************//
  downloadManager = api.require('downloadManager');


  //********************初始化二维码扫描功能****************************//
  FNScanner = api.require('FNScanner');

  //********************地图****************************//
  // bmap = api.require('bMap');
  // bmap.initMapSDK(function(ret) {
  //     if (ret.status) {
         //  alert('地图初始化成功，可以从百度地图服务器检索信息了！');
  //     }
   //});
}

//*****************************二维码操作**************************************//
var kaoqinqiandaodekechengid="";
//扫描二维码
function saomiao(){
  if(FNScanner == undefined)
  {
    FNScanner = api.require('FNScanner');
  }

  FNScanner.open({
      autorotation: true
  }, function(ret, err) {
      if (ret) {
          if(ret.eventType == "success"){
            //alert(ret.eventType);
            if(sysUserInfo != null){
              var content = ret.content;
              //console.log(content);
              var flag = GetParam(content, "f");
            //  console.log(flag);
              if(flag == "l"){  //解释一下，这是字母L，不是数字1,(直播)
                var roomid = GetParam(content, "r");
                var liveserver = GetParam(content, "l");
                var liveurl = "../livepush/livep.html?roomid=" + roomid;
                if(liveserver != ""){
                   liveurl += "&liveserver=" + liveserver;
                }
                api.openWin({
                    name: 'live',
                    url:liveurl
                });

              }
              else if(flag == "b"){ //（报名二维码 1=1&f=b&c=gid）
                  var classid = GetParam(content, "c");
                  $.showPreloader('正在连接服务器,请稍后');
                  getAjax(javaserver + "/grade/gradeEnroll", { userid:getUserInfo().user_ID,gradeid:classid}, function (data) {
                  //  alert(data);
                    data = JSON.parse(data);
                  if(data.errorcode == "0"){
                      if(data.data.reviewed =="1" || data.data.reviewed ==1)
                      {
                        alert('报名成功！等待审核中');
                      }
                      else if(data.data.reviewed =="2" || data.data.reviewed ==2) {
                        alert('报名成功！欢迎加入！');
                      }
                      else if(data.data.reviewed =="3"|| data.data.reviewed ==3) {
                        alert('报名审核失败！');
                      }
                      else {
                          alert('报名失败！'+JSON.stringify(data));
                      }

                    }else if(data.errorcode == "74"){
                                alert('正在审核中，请耐心等待！');
                            }else if(data.errorcode == "75"){
                                alert('您已经报过名了！');
                            }else if(data.errorcode == "71"){
                                alert('班级不存在！');
                            }else if(data.errorcode == "72"){
                                alert('用户不存在！');
                            }else if(data.errorcode == "73"){
                                alert('未到开始时间！');
                            }else if(data.errorcode == "76"){
                                alert('报名审核失败！');
                            }
                            else if(data.errorcode == "77"){
                                alert('报名已过截至日期');
                            }
                            else {
                              alert("报名失败"+data.errorcode);
                            }
                            $.hidePreloader();
                    });
              }
              else if(flag == "q"){ //（签到二维码）
                  $.showPreloader('正在连接服务器,请稍后');
                  var classid = GetParam(content, "c");
                  sessionStorage.setItem('cid', classid);
                  //$.router.loadPage(api.wgtRootDir+"/html/class/baodao.html");

                  getAjax(javaserver + "/grade/arriveSignIn",
                  {
                      gradeid:classid,
                      userid:getUserInfo().user_ID,
                      signToPlace:''//签到地址
                  },
                  function(rs){
                      if(JSON.parse(rs).errorcode == "0")
                      {
                        $.router.loadPage(api.wgtRootDir+"/html/class/baodao.html");
                      }
                      else {
                          alert("签到失败！"+JSON.parse(rs).errormsg);
                      }
                      $.hidePreloader();
                  });

              }
              else if(flag == "k"){ //（考勤二维码）
                  //1、判断下网络环境，如果网络不好，缓存下，下次登陆时候，自动上传。
                  $.showPreloader('正在连接服务器,请稍后');
                  var classid = GetParam(content, "c");
                //  alert(javaserver+'||'+classid);
              //  alert('id:'+classid);
              //  classid = "01213ec5-028a-46e5-bb71-c9ab12c78c96";
                var userid = getUserInfo().user_ID;
              //  userid = "027076d9-c766-46c7-a3af-3fb62f1ad9dd";
                sessionStorage.setItem('cid', classid);
                //  $.router.loadPage(api.wgtRootDir+"/html/class/kaoqin.html");
                  var obj = {
                      courseId:classid,//签到课程
                      signAddress:'',//签到地址
                      studentId:userid //签到人ID
                  };
                  //javaserver+;
                  getAjax(javaserver+"/attence/addOrEditAttence",
                    {
                      attence_info:JSON.stringify(obj)
                    },
                    function(rs){
                      //alert(rs);
                        if(JSON.parse(rs).errorcode == "0")
                        {
                            $.router.loadPage(api.wgtRootDir+"/html/class/kaoqin.html");
                            //alert("考勤记录成功！");
                        }
                        else {
                          alert("考勤记录异常！"+JSON.parse(rs).errormsg);
                        }
                        $.hidePreloader();
                    },function(err){
                      //联网上传失败了！！！！
                      alert("考勤签到失败！");
                      $.hidePreloader();
                  });

              }
              else{
                $.alert("无法识别的二维码");
              }
            }else {
              $.alert("请先登录！", function() {
                window.location.href = "ypylogin.html";
                return;
              });
            }

          }
      } else {
          alert("扫码失败，请重试");
      }
  });
}
//工具方法
function GetParam(paramUrl, paramName) {
  var reg = new RegExp("(^|&)" + paramName.toLowerCase() + "=([^&]*)(&|$)", "i");
  var r = paramUrl.toLowerCase().substr(1).match(reg);
  if (r != null) return unescape(r[2]); return "";
}

//*******************************离线缓存************************************//
//打开离线缓存列表
function openDownManager(){
  if(downloadManager == undefined)
  {
    downloadManager = api.require('downloadManager');
  }
  downloadManager.openManagerView({
      title: '离线缓存'
  }, function(ret, err) {
      if (ret) {
          //打开预览文件
          //downloadManager.closeManagerView();//关闭窗口
          //var jieguo =JSON.stringify(ret);
          if(ret.hasOwnProperty('event'))//关闭窗口时
          {
             //$.toast('关闭窗口时');
          }
          else
          {
              //打开文件时候触发
              var title = ret.savePath.substring(ret.savePath.lastIndexOf('/')+1,ret.savePath.lastIndexOf('.'));
              api.openWin({
                  name: 'lixianguankan',
                  url: "../html/res/CachePreview.html",
                  pageParam: {
                      title:title,
                      downid:ret.id,
                      VideoInfo:JSON.stringify(ret)
                  }
              });
          }
      } else {
          //alert();
          $.toast('正在打开');
      }
  });
}
//下载文件
//downfile({url: 'http://app.newstartsoft.com/live/tks_v1.mp4',savePath: 'cacheDir://xxx.mp4',iconPath:'http://www.newstartsoft.com/Content/New/img/video_bj.jpg',cache: true,allowResume: true,title: '教程',networkTypes: 'all'})
function downfile(fileobj, course){
  if(downloadManager == undefined)
  {
    downloadManager = api.require('downloadManager');
  }
  $.toast('开始下载');
//  alert(JSON.stringify(fileobj));
  downloadManager.enqueue(fileobj, function(ret, err) {
    //alert(JSON.stringify(ret));
      if (ret) {
          if(parseInt(ret.id) > 0){
            $.toast('下载中,请在“个人/离线缓存”栏目中查看');
            if(course != "" && course != null && course != "null" && JSON.stringify(course) != "{}"){
              course.downid = ret.id;
              var cacheinfo = GetlocalStorage("APPCourseCacheList");
              if(cacheinfo != "" && cacheinfo != null && cacheinfo && "null"){
                cacheinfo.push(course);
              }else {
                cacheinfo = [];
                cacheinfo.push(course);
              }
              SetlocalStorage("APPCourseCacheList", JSON.stringify(cacheinfo));
            }
          }else {
            alert('下载错误:' + ret.id);
          }
      } else {
          alert('下载错误'+JSON.stringify(err));
      }
  });
}
