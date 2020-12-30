$(document).on("pageInit", "#manuals", function (e, id, $page) {
  //  alert('xc');
    $.showPreloader();
    var classObj = GetlocalStorage("classObj");
    getAjax(javaserver + "/makecourse/findGradefile",
    {file_type:'1',grade_id:classObj.gradeId},
    function(rs){
    //  console.log(rs);
      var data = strToJson(rs);
      if(data.errorcode == "0"){
           if(data.datas.length > 0){
             var manual_list ="";
             for(var i=0;i<data.datas.length;i++){
               //console.log(JSON.stringify(data.datas[i]));
               //data.datas[i].fileName
               //data.datas[i].fileName,data.datas[i].filepreview
              //   alert(JSON.stringify(data.datas[i]));
              if(data.datas[i] != null){
                  manual_list +=("<li>");
                  manual_list +=("            <a href=\'#\' class=\'item-link item-content\' onclick=\"openfilemanual('"+escape(JSON.stringify(data.datas[i]))+"')\">");
                  manual_list +=("              <div class=\'item-media\'><img src=\'../../res/fileicon/pdf_56.png\' onerror=\"src='../../res/fileicon/qita_56.png'\"  height=\'30\' /></div>");
                  manual_list +=("              <div class=\'item-inner\'>");
                  manual_list +=("                <div class=\'item-title\'>"+data.datas[i].fileName+"</div>");
                  manual_list +=("              </div>");
                  manual_list +=("            </a>");
                  manual_list +=("</li>");
              }
              else {
              //  manual_list = "<center><br /><br /><img src=\"../../res/img/none.png\" style=\"width: 50%;\" /><br />该课程未找到任何资料<br /><br /></center>";
              //  break;
              }
             }
             $('#manual_list').html(manual_list);
         }
         else {
          var html = "<center><br /><br /><img src=\"../../res/img/none.png\" style=\"width: 50%;\" /><br />该课程未找到任何资料<br /><br /></center>";
           $('#manual_list').html(html);
         }
      }
      else {
          console.log('文件列表错误：'+rs);
      }
      $.hidePreloader();
    },function(err){
      $.hidePreloader();
    });
})

function openfilemanual(obj){
  var stringjson =JSON.parse(unescape(obj));
  SetlocalStorage("fileobj", JSON.stringify(stringjson));
  //var dangqianUrl = window.location.href;
//  var lastH = dangqianUrl.substring(dangqianUrl.lastIndexOf('/') + 1, dangqianUrl.lastIndexOf('.'));
  $.router.loadPage(api.wgtRootDir+"/html/wenjian/yulan.html");

}
/**
//预览页面，文件缓存
function huancunxiazai(obj, flag) {
  var playCourse = GetlocalStorage("PlayCourse");//获得当前的播放课程对象
  var userinfo = getUserInfo();
  var data = strToJson($(obj).attr("data"));
  if (data != null) {
    var renwuid = QueryString("arrangeId");
    if(renwuid == "" && playCourse.isOpen == "1"){ //任务id为空的时候，课程如果是公开课，任务id为 1 ， 如果任务id不为空，则不走
      renwuid = "1";
    }else if(renwuid == "" && playCourse.isOpen != "1"){ //任务id为空，课程不为公开课，则可能是班级中的课程观看，任务id 为
      renwuid = "0";
    }
    var newcms = {};
    var savefile_url = "";
    var savefile_title = "";
    var savefile_jsonObj = {};
    if(flag == "course"){
      newcms.pid = data.CSID;
      newcms.ptype = data.CSTYPE;
      newcms.cstime = data.CSTIME;
      newcms.playTime = 0;
      newcms.learnTime = 0;
      newcms.pstate = 0;
      newcms.csid = playCourse.courseId;
      newcms.userid = userinfo.user_ID;
      newcms.orgid = userinfo.organization_ID;
      newcms.renwuid = renwuid;
      //说一下此处视频缓存的保存路径的地址拼接：
      // fs://极速培训/缓存标志（课程或知识库缓存，用于计时业务处理判断）/企业id/用户id/任务id/课程id/小结id/小结名称.mp4
      savefile_url = api.cacheDir+"/"+ flag + "/" +userinfo.organization_ID + "/" + userinfo.user_ID +"/" + renwuid + "/"+playCourse.courseId + "/" + data.CSID + "/" + data.CSNAME + ".mp4";
      savefile_title = data.CSNAME;
      var geturl ="",iconPath='';
      if(data.chapterJson != undefined)
      {
        geturl = strToJson(data.chapterJson)[0].filepreview;
        iconPath = strToJson(data.chapterJson)[0].filecover;
      }
      else {
        geturl = data.CSURL;
        if(geturl.indexOf('.htm') >0)
        {
          alert('暂时不支持本类型的视频下载');
          return false;
        }
      }
      savefile_jsonObj = {
        "url": geturl,
        "savePath": savefile_url,
        "iconPath":iconPath,
        "cache": true,
        "allowResume": true,
        "title": savefile_title,
        "networkTypes": 'all'
      };
    }else{
      //alert(JSON.stringify(data));
      if(data.fileName == undefined)
      {
        var arr=  data.filepreview.split('/');
        data.fileName = arr[arr.length-1];
        savefile_jsonObj = {
          "url": data.filepreview,
          "savePath": api.cacheDir+'/down/'+data.fileName,
          "iconPath":'',
          "cache": true,
          "allowResume": true,
          "title": data.fileName,
          "networkTypes": 'all'
        };
      }
      else {
        savefile_title = data.fileName.split('.')[0];
        savefile_url = api.cacheDir+"/"+ flag + "/" + data.upId + "/" + data.fileName;
        savefile_jsonObj = {
          "url": data.filepreview,
          "savePath": savefile_url,
          "iconPath":data.filecover,
          "cache": true,
          "allowResume": true,
          "title": savefile_title,
          "networkTypes": 'all'
        };
      }

    }
   downfile(savefile_jsonObj, newcms);
 }else{
   $.toast("文件下载为空！");
 }
}

$(document).on("pageInit", "#ziliao_yulan", function (e, id, $page) {
    $.showIndicator(); //loading
    //var upId = QueryString("upId")
    //getAjax(javaserver + "/Kapi/findfileById", { upId: upId }, function (data) {
    //    data = strToJson(data);
    //    if (data.errorcode == 0 && data.data != null) {
            //可转码文件
      $(".huncunbtn").attr("data", JSON.stringify(GetlocalStorage("fileobj")));

      abc();
      //  }
    //});
    $.hideIndicator();
});
**/
