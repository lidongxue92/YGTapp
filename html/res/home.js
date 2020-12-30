// 生成uuid
function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

/**
** 一些首页按钮功能
**/
$("#renwu_m").click(function(){
    $("title").html("任务");
});
$("#xuexi_m").click(function(){
    $("title").html("首页");
});
$("#ziliao_m").click(function(){
    $("title").html("资料");
});
$("#ziliao_m2").click(function(){
    $("#ziliao_m").click();
});
$("#stuInfo_m").click(function(){
    $("title").html("个人中心");
});
$("#manage_m").click(function(){
    $("title").html("管理");
});
$("#course_m").click(function(){
    $("title").html("公开课");
    $("#publicCourseName").val("");
    goPublicCourse();
});
$("#course_make").click(function(){
    $(".title").html("课件录制");
    //window.location.href = "../ckt/ckt.html?callback=http://api.jisupeixun.com/Kapi/AddEditURLCollection&type=0&key="+guid()+"&fid=0&fpath=/&upOrgId="+getUserInfo().organization_ID+"&upUserId="+getUserInfo().user_ID+"&upUserName="+getUserInfo().user_Name+"#/index";
    api.openWin({
        name: 'coursemake',
        animation:{
            type:"flip",                //动画类型（详见动画类型常量）
            subType:"from_right",       //动画子类型（详见动画子类型常量）
            duration:300                //动画过渡时间，默认300毫秒
        },
        url: "../ckt/ckt.html?callback=http://api.jisupeixun.com/Kapi/AddEditURLCollection&type=0&key="+guid()+"&fid=0&fpath=/&upOrgId="+getUserInfo().organization_ID+"&uid="+getUserInfo().user_ID+"&upUserName="+getUserInfo().user_Name+"#/index",
        pageParam: {
            name: '课程录制'
        }
    });
});
//系统扫一扫功能，扫码
function saoyisao(){
  var FNScanner = api.require('FNScanner');
   FNScanner.openScanner({
       autorotation: true
   }, function(ret, err) {
       if (ret) {
          var FNobj = strToJson(ret);
          if(FNobj.eventType == "cameraError"){
            $.toast("访问摄像头失败");
            FNScanner.closeView();
          }else if(FNobj.eventType == "albumError"){
            $.toast("访问相册失败");
            FNScanner.closeView();
          }else if(FNobj.eventType == "fail"){
            $.toast("扫码失败,请重试！");
            FNScanner.closeView();
          }else if(FNobj.eventType == "success"){
            var hrefUrl = FNobj.content;
            api.openFrame({
                name: 'ComonFrame',
                slidBackEnabled:true,
                vScrollBarEnabled:true,
                animation:{
                    type:"push",                //动画类型（详见动画类型常量）
                    subType:"from_right",       //动画子类型（详见动画子类型常量）
                    duration:300                //动画过渡时间，默认300毫秒
                },
                progress:{
                  type:"page",                //加载进度效果类型，默认值为 default，取值范围为 default|page，default 等同于 showProgress 参数效果；为 page 时，进度效果为仿浏览器类型，固定在页面的顶部
                  title:"",               //type 为 default 时显示的加载框标题
                  text:"正在加载",
                  color:"#39f"                //type 为 page 时进度条的颜色，默认值为 #45C01A，支持#FFF，#FFFFFF，rgb(255,255,255)，rgba(255,255,255,1.0)等格式
                },
                url: '../html/manager/CommonHtml.html',
                pageParam: {
                    name: '扫码结果',
                    resultUrl:hrefUrl
                }
            });
          }
       } else {
       }
   });
}
function nofunction(){
    $.toast('暂未开放！');
}
/**
** 一些首页按钮功能（结束）
**/
