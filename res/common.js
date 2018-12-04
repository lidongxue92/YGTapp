
//*************************************************
//全局界面切换监听
//*************************************************

var domain=staticimgserver; // 题目练习地址123

// var javaserver = "//api.jisupeixun.com";
// var javafile = "//file.jisupeixun.com"; //文件上传接口
var javaimg = staticimgserver; //前端的域名，前后端在一起的填后端

var sysUserInfo={};
var allorgid="";
var allgroupid="";
var allroleid="";
var allorgname="";
var allgroupname="";
var allrolename="";
var playerHeight = 200;
var pageSize="20";
var pageIndex="1";

//手机判断
var browser = {
    versions: function () {
        var u = navigator.userAgent, app = navigator.appVersion;
        return {         //移动终端浏览器版本信息
            trident: u.indexOf('Trident') > -1, //IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器
            iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, //是否iPad
            wp: u.indexOf('IEMobile') > -1, //是否wp
            symbianos: !!u.match(/SymbianOS.*/), //是否SymbianOS
            webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
        };
    } (),
    language: (navigator.browserLanguage || navigator.language).toLowerCase()
}
//=====================自己写的公共=========================
//提示框
function tipApp(msg) {
    $.toast(msg);
}
//播放页面的logo
function getLogo() {
    var logoblock = "<img src='" + javafile + "/resources/logo/" + getUserInfo().organization_ID + "_2.png' alt='加载中...' onerror='javascript:this.src=\"/images/logo.png\"' src='/images/logo.png'>";
    return logoblock;
}
try { var jq=$.noConflict(); } catch (e) { }
//进入分类
//**********************************************************************
//打开分类详情界面触发
//**********************************************************************
$(document).on("pageInit", "#renwu_know", function (e, id, $page) {

    sysoUserInfo = getUserInfo(); //用户信息
    var arrangeId = QueryString("arrangeId");
    var item = strToJson(GetlocalStorage("knowobj"));
    if (item == null) {
        return;
    }
    var block = "";
    //有课程1
    if (item.know_select_course != undefined && item.know_select_course) {
        block = "  <div class='content-block-title'>包含课程</div><div class='list row' id='index_course' style='margin: 0;'> </div>";
        $("#content_kn .row").append(block);
        findInKnow(item, "1");
    }
    //有试卷2
    if (item.know_select_exam != undefined && item.know_select_exam) {
        block = "  <div class='content-block-title'>包含试卷</div><div class='list row' id='index_paper' style='margin: 0;'></div>";
        $("#content_kn .row").append(block);
        findInKnow(item, "2");
    }
    //有题库
    if (item.know_select_que != undefined && item.know_select_que) {
        block = "  <div class='content-block-title'>包含题库</div><div class='list row' style='margin: 0;'> </div>";
        //把知识架构放入对象  前端拼接
        if (item.completeStr != null && item.completeStr != "" && (item.completeStr.indexOf(item.knowledge_Id) != -1 || item.completeStr == item.knowledge_Id)) {
            block += "<div class='col-50'><a href='#' onClick='openTi(" + JSON.stringify(item) + ")'><div class='card color-default'><div class='shuqian-down'><span class='shuqian end'></span><span class='shuqiantext'>已完成</span></div><div style='' valign='bottom' class='card-header color-white no-border no-padding'><img class='card-cover' src='/images/train/quenull.png' alt='' onerror='javascript:this.src=\"/images/train/quenull.png\"'></div><div class='card-content'><div class='card-content-inner'><p>" + item.knowledge_Name + "</p></div></div><div class='card-footer'><span class='link'><i class='iconfont icon-shenhetongguo' style='color:#339966'></i> 题库练习</span><span class='link'><i class='iconfont icon-listtable'></i> </span></div></div></a></div>";
        } else {
            block += "<div class='col-50'><a href='#' onClick='openTi(" + JSON.stringify(item) + ")'><div class='card color-default'><div style='' valign='bottom' class='card-header color-white no-border no-padding'><img class='card-cover' src='/images/train/quenull.png' alt='' onerror='javascript:this.src=\"/images/train/quenull.png\"'></div><div class='card-content'><div class='card-content-inner'><p>" + item.knowledge_Name + "</p></div></div><div class='card-footer'><span class='link'><i class='iconfont icon-banyuanxuankuang' style='color:#3399ff'></i> 题库练习</span><span class='link'><i class='iconfont icon-listtable'></i> </span></div></div></a></div>";
        }
        block += "</div>";
        $("#content_kn .row").append(block);
    }


    if (isWeiXin()) {
        $("title").html(item.knowledge_Name);
    } else {
        if (item.knowledge_Name.length > 12) {
            $(".title").html(item.knowledge_Name.substr(0, 12) + "...");
        } else {
            $(".title").html(item.knowledge_Name);
        }
    }

    if (isWeiXin) {
        $("#content_kn .row").find(".content-block-title").css("margin", "0.75rem .75rem .5rem !important");
    }


    //查询知识架构下的课程，试卷，题库
    function findInKnow(item, state) {
        $.showIndicator(); //loading
        getAjax(javaserver + "/stage/findArrangeStage", { knowledgeids: item.knowledge_Id, state: state }, function (data) {
            data = strToJson(data);
            if (data.errorcode == 0) {
                //追加课程
                if (state == "1") {
                    var knowblock = "";
                    //课程
                    for (var i = 0; i < data.datas.length; i++) {
                        //已完成
                        if (item.completeStr != null && item.completeStr != "" && (item.completeStr.indexOf(data.datas[i].courseId) != -1 || item.completeStr == data.datas[i].courseId)) {
                            knowblock += "<div class='col-50'><a href='#' onClick='openKe_collection(" + JSON.stringify(data.datas[i].courseId) + "," + null + "," + JSON.stringify(arrangeId) + ")'><div class='card color-default'><div class='shuqian-down'><span class='shuqian end'></span><span class='shuqiantext'>已完成</span></div><div style='' valign='bottom' class='card-header color-white no-border no-padding'><img class='card-cover' src='" + data.datas[i].courseImg + "' alt='' onerror='javascript:this.src=\"/app/framework/img/fengmian001.gif\"' height=105></div><div class='card-content'><div class='card-content-inner'><p>" + data.datas[i].courseName + "</p></div></div><div class='card-footer'><span class='link'><i class='iconfont icon-shenhetongguo' style='color:#339966'></i> 课程</span><span class='link'><i class='iconfont icon-listtable'>" + data.datas[i].courseSum + "章</i> </span></div></div></a></div>";
                        } else {
                            knowblock += "<div class='col-50'><a href='#' onClick='openKe_collection(" + JSON.stringify(data.datas[i].courseId) + "," + null + "," + JSON.stringify(arrangeId) + ")'><div class='card color-default'><div style='' valign='bottom' class='card-header color-white no-border no-padding'><img class='card-cover' src='" + data.datas[i].courseImg + "' alt='' onerror='javascript:this.src=\"/app/framework/img/fengmian001.gif\"' height=105></div><div class='card-content'><div class='card-content-inner'><p>" + data.datas[i].courseName + "</p></div></div><div class='card-footer'><span class='link'><i class='iconfont icon-banyuanxuankuang' style='color:#3399ff'></i> 课程</span><span class='link'><i class='iconfont icon-listtable'>" + data.datas[i].courseSum + "章</i> </span></div></div></a></div>";
                        }
                    }
                    if (knowblock.length > 0) {
                        $("#index_course").html(knowblock);
                    } else {
                        $("#index_course").html("<center>无课程</center>");
                    }
                } else {
                    var knowblock = "";
                    //试卷
                    for (var s = 0; s < data.datas.length; s++) {
                        if (item.completeStr != null && item.completeStr != "" && (item.completeStr.indexOf(data.datas[s].paperId) != -1 || item.completeStr == data.datas[s].paperId)) {
                            knowblock += "<div class='col-50'><a href='#' onClick='openSj(" + JSON.stringify(data.datas[s]) + ",\"" + arrangeId + "\")'><div class='card color-default'><div class='shuqian-down'><span class='shuqian end'></span><span class='shuqiantext'>已完成</span></div><div style='' valign='bottom' class='card-header color-white no-border no-padding'><img class='card-cover' src='/app/framework/img/examnull.png'  alt='' ></div><div class='card-content'><div class='card-content-inner'><p>" + data.datas[s].paperName + "</p></div></div><div class='card-footer' style='display:none;'><span class='link'><i class='iconfont icon-shenhetongguo' style='color:#339966'></i> 已学</span><span class='link'><i class='iconfont icon-listtable'></i> </span></div></div></a></div>";
                        } else {
                            knowblock += "<div class='col-50'><a href='#' onClick='openSj(" + JSON.stringify(data.datas[s]) + ",\"" + arrangeId + "\")'><div class='card color-default'><div style='' valign='bottom' class='card-header color-white no-border no-padding'><img class='card-cover' src='/app/framework/img/examnull.png'  alt='' ></div><div class='card-content'><div class='card-content-inner'><p>" + data.datas[s].paperName + "</p></div></div><div class='card-footer' style='display:none;'><span class='link'><i class='iconfont icon-banyuanxuankuang' style='color:#3399ff'></i> 已学</span><span class='link'><i class='iconfont icon-listtable'></i> </span></div></div></a></div>";
                        }
                    }
                    if (knowblock.length > 0) {
                        $("#index_paper").html(knowblock);
                    } else {
                        $("#index_paper").html("<center>无试卷</center>");
                    }
                }
            }
            $.hideIndicator();
        });

    }
});
//打开课程播放界面，将课程数据保存，已被下个界面使用
//xxxxxxxxxxxxxxxxxxxxxxxxxxxx
function openKe(stringjson, renwuid) {
    SetlocalStorage("PlayCourse", JSON.stringify(stringjson));
    $.router.loadPage(api.wgtRootDir+"/html/peixun/detail.html?arrangeId=" + renwuid);
}
//从收藏  打开课程播放界面
//需要获取  课程阶段 信息
function openKe_collection(courseId, type, renwuid) {

    //请求获取对象
    getAjax(javaserver + "/stage/findCourseInfoByCourseId", { courseId: courseId }, function (data) {
        data = strToJson(data);
        if (data.errorcode == 0 && data.data != null) {
            if (type == undefined || type == null || type == "") {
                //打开课程
                openKe(data.data, renwuid ? renwuid : 1);
            } else {
                sysUserInfo = data.data;
            }
        } else {
            $.toast("获取课程信息失败");
        }
    }, '', '', '', false);
}
//打开试卷
function openSj(data, arrangeId) {
    sysUserInfo = getUserInfo();

    //历史试卷
    if (arrangeId == 99 || arrangeId == "99") {
        //随机卷
        if (data.exampaper.paper_Random == "0") {
            window.location.href = javafile + "/resources/exam/" + data.paperId + "," + data.randomCount + "/" + ((data.randomNum == undefined) ? 1 : data.randomNum) + ".html" + "?userid=" + sysUserInfo.user_ID + "&id=99&scoreId=" + data.scoreId + "&token=" + strToJson(GetlocalStorage("userinfo_token"));
            //固定卷
        } else {
            window.location.href = javafile + "/resources/exam/" + data.paperId + "/" + data.paperId + ".html?userid=" + sysUserInfo.user_ID + "&id=99&scoreId=" + data.scoreId + "&token=" + strToJson(GetlocalStorage("userinfo_token"));
        }
        //打开试卷
    } else {
        //随机卷
        if (data.paper_Random == "0") {
            data.url = getPaperUrl(data.url, data.paperCount)
            window.location.href = javafile + data.url + "&userid=" + sysUserInfo.user_ID + "&arrangeId=" + arrangeId + "&token=" + strToJson(GetlocalStorage("userinfo_token"));
        } else {
            window.location.href = javafile + data.url + "?random=0&userid=" + sysUserInfo.user_ID + "&arrangeId=" + arrangeId + "&token=" + strToJson(GetlocalStorage("userinfo_token"));
        }

    }

}
// 格式话时间
Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}
//判断是否是企业微信
function isWeiXin() {
    var resource = GetlocalStorage("resource");
    if (resource && (resource == 2 || resource == "2")) {
        return true;
    } else {
        return false;
    }
}
//打开题库
function openTi(obj) {
    //$.toast("暂未开放");
    var arrangeId = QueryString("arrangeId");
    //window.location.href =domain+"/member/index.html#/home/stuquelist/"+obj.knowledge_Id+"/"+arrangeId+"&arrangeId="+arrangeId+"&passtype="+obj.know_select_que_type+"&pass="+obj.know_select_que_num+"&typeId=0&knowledgeName="+obj.knowledge_Name;
    //:xid/:knowledgeId/:passtype/:pass/:typeId/:knowledgeName/:arrangeId/:userId
    sysoUserInfo = getUserInfo();
    //默认任务通过条件是全部答完
    if (obj.know_select_que_type == undefined || obj.know_select_que_type == null) {
        obj.know_select_que_type = 0;
    }
    //全部答完情况下此条件无用，但必须初始
    if (obj.know_select_que_num == undefined || obj.know_select_que_num == null) {
        obj.know_select_que_num = 0;
    }
    window.location.href = domain + "/member/index.html#/home/stuquelist/" + arrangeId + "/" + obj.knowledge_Id + "/" + obj.know_select_que_type + "/" + obj.know_select_que_num + "/0/" + obj.knowledge_Name + "/" + arrangeId + "/" + obj.knowledge_Id + "/" + obj.knowledge_Name + "/0/" + sysoUserInfo.user_ID + "/0/phone";
}
//获得随机卷的地址
function getPaperUrl(paperUrl, coun) {
    var paperReadNum;
    var paperUrlList = paperUrl.split("/");
    var paperNum = paperUrlList[paperUrlList.length - 1].split(".")[0];
    if (paperNum != undefined && paperNum != null && paperNum != "") {
        paperNum;
        paperReadNum = parseInt(Math.random() * coun);
        paperUrlList[paperUrlList.length - 1] = (paperReadNum == 0) ? "1.html" : paperReadNum + ".html";
        paperUrl = paperUrlList.join("/");
    }
    return paperUrl + "?random=" + ((paperReadNum == 0) ? 1 : paperReadNum);
}
//====================公共方法===========================
/*获取格式化后文件大小*/
function getFileSize(byteSize) {
    if (byteSize != undefined) {
        if (byteSize === 0) return '0 KB';
        var k = 1024; // or 1000
        sizes = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        i = Math.floor(Math.log(byteSize) / Math.log(k));
        if (i > 0) {
            return (byteSize / Math.pow(k, i)).toFixed(0) + ' ' + sizes[i];
        } else {
            var num = Math.round(byteSize * 100) / 100;
            if (num <= 0) {
                return '0.01 ' + sizes[0];
            }
            return num + ' ' + sizes[0];
        }
    }
}
// 获取广告banner以及启动页图片
function GetADBanerAndStartImg(){
  var orgid = GetlocalStorage("UserEnterpriseOrgID");
  if(wangluo == "none") //如果没有网络就不练服务器了
  {
    window.location.href = "html/homenew.html";
    return;
  }

  if(orgid != undefined){
    getAjax(javaserver + "/advertisement/findAppAdvert",{orgid: orgid, number:5}, function (data) {

            data = strToJson(data);
            var huanyingad = ""; //欢迎页img url
            var adStr = "";
            if(data.errorcode == "0"){
              $.each(data.datas, function (i, item) {
                if(item.advertisementPosition == "1"){ //欢迎页
                  huanyingad = item.advertisementPath;
                }else{
                  console.log('AD:'+item.advertisementPath);
                  adStr += "<div class=\"swiper-slide\"><div class=\"swiper-zoom-container\"><img src=\""+item.advertisementPath+"\" alt=\""+item.advertisementName+"\"></div></div>";
                }
              });
              SetlocalStorage("HomeAddStr", adStr);
              //$("#homeAdArr").html(adStr);
              if(huanyingad != ""){
                $(".qydongyeimg").css("background-image", "url('" + huanyingad + "')");
                $(".huanyingad").text(getUserInfo().organization_Name);
                var org_logo = javafile+"/resources/logo/"+getUserInfo().organization_ID+"_1.png";
                $(".huanyingorg_img").attr("src", org_logo);
                $(".qidongyediv").show();
                var adtime = window.setTimeout(function(){
                  $(".qidongyediv").css("display", "none");
                  window.location.href = "html/homenew.html";
                //  login(sysUserInfo.user_Account,sysUserInfo.user_Pwd);
                }, 5000);
              }else {
                  window.location.href = "html/homenew.html";

                  //login(sysUserInfo.user_Account,sysUserInfo.user_Pwd);
              }
            }
        }, function (err) {
            $.hideIndicator();
            $.toast('请求错误!');
        }, "json", "post", false);
  }
}
//***********************************************************************************
//                              遍历参数
//***********************************************************************************
function getParam(){
    //所有的部门id
    for(var i=0;i<sysUserInfo.userOrgList.length;i++){
        allorgid+=sysUserInfo.userOrgList[i].organization_ID+",";
        allorgname=allorgname.length>0?allorgname+","+sysUserInfo.userOrgList[i].organization_Name:sysUserInfo.userOrgList[i].organization_Name;
    }
    //所有的角色id
    for(var i=0;i<sysUserInfo.userRoleList.length;i++){
        allroleid+=sysUserInfo.userRoleList[i].roles_ID+",";
        // allrolename+=sysUserInfo.userRoleList[i].roles_Name+",";
          allrolename=allrolename.length>0?allrolename+","+sysUserInfo.userRoleList[i].roles_Name:sysUserInfo.userRoleList[i].roles_Name;
    }
    //所有的用户组id
    for(var i=0;i<sysUserInfo.userGroupList.length;i++){
        allgroupid+=sysUserInfo.userGroupList[i].userGroup_ID+",";
       // allgroupname+=sysUserInfo.userGroupList[i].userGroup_Name+",";
         allgroupname=allgroupname.length>0?allgroupname+","+sysUserInfo.userGroupList[i].userGroup_Name:sysUserInfo.userGroupList[i].userGroup_Name;
    }
}
//***********************************************************************************
//                              字符串转json
//***********************************************************************************
function strToJson(str){
    //如果本来就是对象，强转会异常
   try {
         if(str!=null&&str!=""&&str!=undefined){
            return JSON.parse(str);
        }else{
            return null;
        }
    } catch (e) {
        return str;
    }
}
//**********************************************************************
//                              全局方法系列
//**********************************************************************

//夜间模式
var $dark = $("#dark-switch").on("change", function() {
  $(document.body)[$dark.is(":checked") ? "addClass" : "removeClass"]("theme-dark");
});
try {
  $.init();//加载组件
} catch (e) {
  console.log("light7 page 组件加载异常" + e.toString());
} finally {

}




//**********************************************************************
//全局异步请求数据
//**********************************************************************
function getAjax(url, parm, callBack, callBackError, callBackType, mode,istongbu) {
    var token = "userinfo_token is none";
    if (callBackType == null || callBackType == "" || callBackType == undefined)
        callBackType = "text";
    if (mode == null || mode == "" || mode == undefined)
        mode = "get";
    if (istongbu!=undefined&&!istongbu){
        istongbu =false;
  	}else{
  		  istongbu =true;
  	}
    token = strToJson(GetlocalStorage("userinfo_token"));
    //alert(token)
    if(token == "" || token == null)
    {
      //alert(api.connectionType);
      try {
        if(api == undefined || api.connectionType == "none")
        {

        }
        else {

          window.location = "../ypylogin.html";
        }
      } catch (e) {

        window.location = "../ypylogin.html";
      } finally {

      }

    }
  try{
      $.ajax({
          type: mode,
          beforeSend: function (xhr) {
             if(!QueryString("courseId")){
                  token = strToJson(GetlocalStorage("userinfo_token"));
                  xhr.setRequestHeader("X-Session-Token",token);
              }
          },
          //手机端需要加上token验证
          headers: {
              //"Accept": "text/plain; charset=utf-8",
              //"Content-Type": "text/plain; charset=utf-8",
              "Accept": "application/json, text/javascript, */*; charset=utf-8",
              "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
          },
          async:istongbu,
          url: url,
          data: parm,
          dataType: callBackType,
          cache: false,
          success: function (msg, status, xhr) {
            pedding=false;
              callBack(msg);
               $.hideIndicator(); //隐藏loading
          },
          error: function (err) {
            try {
              if(callBackError != undefined && callBackError != null && callBackError != "")
              callBackError(err);
              // $.alert(err);
              console.log('请求服务器错误！');
              pedding=false;
              //console.error("服务器访问异常：" + JSON.stringify(err));
              $.hideIndicator(); //loading
            } catch (e) {

            }

          }
      });

  }
  catch(error) {
    $.alert("请求错误,请刷新重试！");
    console.log(url);
    $.hideIndicator();
  }
}


  //获取缓存用户信息，如果为空，跳转登录页
  function getUserInfo(){
    var sysUserInfo=strToJson(GetlocalStorage("userinfo"));
    if(sysUserInfo==null||sysUserInfo==undefined||sysUserInfo==""){
        window.location ="../ypylogin.html";
    }else{
        return sysUserInfo;
    }
  }
  function GetlocalStorage(name) {
    // / <summary>
    // / 获得本地数据
    // / </summary>
    if (window.localStorage) {
        // 获取token
        if(name == "userinfo_token"){
            return getToKen();
        }
        //获取本地缓存
        var value = localStorage.getItem(name);
        if (value != null&&value!=""&&value!=undefined) {
                //如果获取的值已经是对象，强转会报错，直接返回
               try {
                   return JSON.parse(value);
               } catch (e) {
                    return value;
              }
       } else {
              return value;
         }

    } else {
       $.toast("您的浏览器不支持本系统，或开启了隐身模式");
    }
}
// 获取token
function getToKen (){
    var localtoken={};
    try{
        //alert(localStorage.getItem("userinfo_token"));
        var localtoken = JSON.parse(localStorage.getItem("userinfo_token"));
    }catch(e){
        return null;
    }
    var exp = 1000 * 60 * 60 * 24; // 过期时间 1 天
    if (localtoken == undefined || localtoken == null || localtoken == "") {
        localtoken = "";
    } else if (!localtoken.hasOwnProperty('outTime') || !localtoken.hasOwnProperty('token')) {
        localtoken = "";
    } else if (localtoken.hasOwnProperty('outTime') && parseInt(new Date().getTime() - exp) > new Date(localtoken.outTime).getTime()) {
        localtoken = "";
    } else if (localtoken.hasOwnProperty('token')) {
        localtoken = localtoken.token.toString();
    }
    return localtoken;
}
function SetlocalStorage(name, obj) {
    // / <summary>
    // / 重写本地数据
    // / </summary>
    if (window.localStorage) {

        try {
            if(name == "userinfo_token"){
                var tokenObj = { token: obj, outTime: "" };
                tokenObj.outTime = new Date().getTime();
                localStorage.setItem("userinfo_token", JSON.stringify(tokenObj));
            }else{
                //localStorage.setItem(name, JSON.stringify(obj));
                localStorage.setItem(name, obj);
            }
        }
        catch (oException) {
            if (oException.name  == 'QuotaExceededError') {
                $.toast("超出本地存储限额！");
                //如果历史信息不重要了，可清空后再设置
                localStorage.clear();
                if(name == "userinfo_token"){
                    var tokenObj = { token: obj, outTime: "" };
                    tokenObj.outTime = new Date().getTime();
                    localStorage.setItem("userinfo_token", JSON.stringify(tokenObj));
                }else{
                    //localStorage.setItem(name, JSON.stringify(obj));
                    localStorage.setItem(name, obj);
                }
            }
        }
    } else {
       $.toast("您的浏览器不支持本系统，或开启了隐身模式");
    }
}
function QueryString(fieldName) {
    /// <summary>
    ///   获得URL GET参数
    /// </summary>
    /// <param name="fieldName" type="String">
    ///   参数名
    /// </param>
    /// <returns type="void" />如果不存在返回NULL
    var reg = new RegExp("(^|&)" + fieldName.toLowerCase() + "=([^&]*)(&|$)", "i");
    var r = window.location.search.toLowerCase().substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}
function goto(url) {
    $.router.loadPage(url);
}


//获取手机当前的网络状态
function GetConnectionType(){
  var connectionT = winapi.connectionType;
  if(connectionT == "none"){  //无网络链接
    $.toast('当前网络不可用，请检查网络设置！');
  }
}
//打开任务详情
function openRenwuDetail(stringjson,state) {
    //console.log("预览文件");
    if(state==5){
      $.toast('任务已过期！');
      return;
    }else if(state==6){
      $.toast('任务还未到开始时间！');
      return;
    }

    SetlocalStorage("renwuobj", JSON.stringify(stringjson));
    $.router.loadPage("../html/peixun/info.html");
}
//打开文件预览
function openfile(stringjson) {
    SetlocalStorage("fileobj", JSON.stringify(stringjson));
    var dangqianUrl = window.location.href;
    var lastH = dangqianUrl.substring(dangqianUrl.lastIndexOf('/') + 1, dangqianUrl.lastIndexOf('.'));
    if(lastH != "home"){
      $.router.loadPage("../../html/wenjian/yulan.html");
    }else {
      $.router.loadPage("wenjian/yulan.html");
    }
}
function openfile1(path) {
  bPlayer = api.require('bPlayer');  //实例化百度播放器
  bPlayer.open({
        rect: {
            x: 0,
            y: 38,
            w: 0,
            h: 0,
        },
        path: path,//mima.replace('\\', '/'),
        autoPlay: true
    }, function(ret, err) {
        if (ret) {
          bPlayer.full();
          bPlayer.addEventListener({name : ['all','click','playbackState']}, function(ret) {
            var EventType = eval(ret);
            if(EventType.eventType == "click"){
              bPlayer.close();
             }
           });
        }
  });
}

function abc(){
  var data = {data:GetlocalStorage("fileobj")};
  if (data.data != null) {  //data.errorcode == 0 &&
      //  alert(JSON.stringify(data));
        if (data.data.fileType==undefined){
            data.data.fileType=data.data.filepreview.substr(data.data.filepreview.lastIndexOf(".")+1).replace("'", "");
        }
        //alert(data.data.fileType);
        if (data.data.fileType == "pdf" || data.data.fileType == "docx" || data.data.fileType == "doc" || data.data.fileType == "xls" || data.data.fileType == "xlsx" || data.data.fileType == "ppt" || data.data.fileType == "pptx") {
            $(".content_yulan").html("<iframe src='../../script/pdf2/web/viewer.html?file=" + base64encode(encodeURI(data.data.filepreview)) + "' style='width:100%;border:0;height:100%;position:absolute;' ></iframe>");
            //console.log("<iframe src='http://file.jisupeixun.com/resources/pdf2/officeshow/web/viewer.html?file=?file=" + base64encode(encodeURI(data.data.filepreview)) + "' style='width:100%;border:0;height:100%;position:absolute;' ></iframe>");
        } else if (data.data.fileType == "txt") {
            $(".content_yulan").html("<iframe src='" + data.data.filepreview + "' style='width:100%;border:0' ></iframe>");
        } else if (data.data.fileType == "mp4") {
            //$(".content_yulan").html("<video controls autoplay style='width:100%'><source src='" + data.data.filepreview + "'  type='video/mp4' ></video>  ");
            //文件预览引入播放器
            console.log("文件预览引入播放器");
          /**  bPlayer = api.require('bPlayer');  //实例化百度播放器
            bPlayer.open({
                  rect: {
                      x: 0,
                      y: 38,
                      w: 0,
                      h: 0,
                  },
                  path: data.data.filepreview,//mima.replace('\\', '/'),
                  autoPlay: true
              }, function(ret, err) {
                  if (ret) {
                    bPlayer.setRect({
                              rect:{
                              x: 0,
                              y: 50,
                              w: winapi.winWidth,
                              h: 200,
                                    },
                        });

                        BDPlayerLoader();
                  }
            });**/
            bPlayer = api.require('videoPlayer');
            //console.log(mima);

        		bPlayer.play({
                      rect:{
                          x: 0,
                          y: api.safeArea.top+38,
                          w: api.winWidth,
                          h: playerHeight,
                      },
        		            texts: {
        		                head: {
        		                    title: ''
        		                }
        		            },
        		            styles: {
        		                head: {
        		                    bg: 'rgba(0.5,0.5,0.5,0)',
        		                    height: 44,
        		                    titleSize: 20,
        		                    titleColor: '#fff',
        		                    backSize: 30,
        		                    backImg: 'widget://images/videoPlayer/back.png',
        		                    setSize: 30,
        		                    setImg: 'widget://images/videoPlayer/more.png'
        		                },
        		                foot: {
        		                    bg: 'rgba(0.5,0.5,0.5,0.7)',
        		                    height: 44,
        		                    playSize: 30,
        		                    playImg: 'widget://images/videoPlayer/play.png',
        		                    pauseImg: 'widget://images/videoPlayer/pause.png',
        		                    nextSize: 0,
        		                    nextImg: '',
        		                    timeSize: 12,
        		                    timeColor: '#fff',
        		                    sliderImg: 'widget://images/handler.png',
        		                    progressColor: '#666666',
        		                    progressSelected: '#3399ff',
        		                    verticalImg: "widget://images/videoPlayer/unfullscreen.png",
        		                    horizontalImg: "widget://images/videoPlayer/fullscreen.png"
        		                }
        		            },
        		            path:data.data.filepreview,
        		            autoPlay: true
        		        }, function(ret, err) {

                        console.log('xxx2:'+JSON.stringify(ret));
                        if(ret.eventType == 'show')
                        {
                          bPlayer.addEventListener(
                          {
                            name: 'play'
                          },
                          function(ret, err) {
                            //console.log('xxx:'+JSON.stringify(ret)+'xxx'+JSON.stringify(err));
                            if (ret) {
                              if(ret.eventType == 'playing')
                              {
                                console.log('播放到哪了：'+ret.current);
                              }

                            } else {
                                alert(JSON.stringify(err));
                            }
                          });

                        }

        		        });


        } else if (data.data.fileType == "mp3") {
            $(".content_yulan").html("<video controls autoplay style='width:100%'><source src='" + data.data.filepreview + "'  type='audio/mpeg' ></video>  ");
        } else if (data.data.fileType == "jpg" || data.data.fileType == "png" || data.data.fileType == "gif" || data.data.fileType == "bmp" || data.data.fileType == "wbmp" || data.data.fileType == "jpeg"
                             || data.data.fileType == "JPEG" || data.data.fileType == "GIF" || data.data.fileType == "WBMP" || data.data.fileType == "PNG") {
                        //       alert(data.data.filepreview);
            $(".content_yulan").html(" <div ><img id='fileimg'  src='" + data.data.filepreview + "'   style='width:100%' /></div> ");
        } else {
            //$(".content_yulan").html(" <div style='text-align: center;margin-top: 60%;color: #CCC;font-size: 20px;' >文件不支持预览！</div> ");
            $(".content_yulan").html(" <div ><img id='fileimg'  src='" + data.data.filepreview + "'   style='width:100%' /></div> ");
        }
    }
}
function CloseBaiDuplayer(){
    $(".content_yulan").html("");
}
var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
                                              -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
                                              -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57,
                                              58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6,
                                              7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
                                              25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
                                              37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1,
                                              -1, -1);

function base64encode(str) {
    var out, i, len;
    var c1, c2, c3;
    len = str.length;
    i = 0;
    out = "";

    while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff;

        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt((c1 & 0x3) << 4);
            out += "==";
            break
        }

        c2 = str.charCodeAt(i++);

        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt((c2 & 0xF) << 2);
            out += "=";
            break
        }

        c3 = str.charCodeAt(i++);
        out += base64EncodeChars.charAt(c1 >> 2);
        out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
        out += base64EncodeChars.charAt(c3 & 0x3F)
    }

    return out
}

function base64decode(str) {
    var c1, c2, c3, c4;
    var i, len, out;
    len = str.length;
    i = 0;
    out = "";

    while (i < len) {
        do {
            c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff]
        } while (i < len && c1 == -1);

        if (c1 == -1)
            break;

        do {
            c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff]
        } while (i < len && c2 == -1);

        if (c2 == -1)
            break;

        out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

        do {
            c3 = str.charCodeAt(i++) & 0xff;

            if (c3 == 61)
                return out;

            c3 = base64DecodeChars[c3]
        } while (i < len && c3 == -1);

        if (c3 == -1)
            break;

        out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

        do {
            c4 = str.charCodeAt(i++) & 0xff;

            if (c4 == 61)
                return out;

            c4 = base64DecodeChars[c4]
        } while (i < len && c4 == -1);

        if (c4 == -1)
            break;

        out += String.fromCharCode(((c3 & 0x03) << 6) | c4)
    }

    return out
}

$(document).on("open", ".popup-services", function (e, id, $page) {
        var MsgInfo={
            id:"这是消息的id",
            title:"关于举办中烟部门预算培训班的通知",
            content:"我们将在2018-08-05开启中烟部门预算培训班，请需要参与的同学留意开班日期，进行报名",
            date:"2018-07-31",
            type:"2",//1.班级动态消息推送只有id（需要查询），2其他
        };
        var msgObj=GetlocalStorage("MsgInfo");
  //console.log((msgObj));
  //console.log(JSON.stringify(msgObj));
        if(msgObj!=undefined){
            MsgInfo=strToJson(msgObj);
        }

        //这是需要查询的消息
        if(MsgInfo.type==1){//通知，消息类类容
          //alert(JSON.stringify(MsgInfo))
        //  console.log(javaserver+"/communication/findMessgae?xid="+MsgInfo.id);
                getAjax(javaserver + "/communication/findMessgae",{cid:MsgInfo.id}
                , function (data) {
                  //alert(data);
                    data = strToJson(data);
                    if (data.errorcode == "0") {
                          $(".popup-services .msg_title").html(data.data.title);
                          $(".popup-services .msg_date").html(data.data.dateTime);
                          $(".popup-services .msg_content").html(data.data.content);
                          if(data.data.souceType!=1){
                                $(".popup-services .msg_button_baoming").remove();
                          }else{
                                $(".popup-services .msg_button_baoming").show().click(function(){
                                  var classid = MsgInfo.classid;//GetParam(content, "c");
                                  //alert(classid);
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
                                });
                          }
                    } else {
                        $.toast('消息获取失败！');
                    }
                });
        }
        else{
            $(".popup-services .msg_title").html(MsgInfo.title);
            if(MsgInfo.date == undefined)
            {
              $(".popup-services .msg_date").hide();
            }
            else {
              $(".popup-services .msg_date").html(MsgInfo.date);
            }

            $(".popup-services .msg_content").html(MsgInfo.content);
            $(".popup-services .msg_button_baoming").remove();
        }
    });
    //清除弹框值
$(document).on("close", ".popup-services", function (e, id, $page) {
     localStorage.removeItem("MsgInfo");
 });
