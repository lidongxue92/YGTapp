$(document).on("pageInit", "#Assessment", function (e, id, $page) {
    pingguzonghe();//查询综合评估卷
})
//查询综合评估
function pingguzonghe(){
  $.showIndicator();
  var classObj = strToJson(GetlocalStorage("classObj"));
  getAjax(javaserver + "/questionnaire/findBinding", { xid: classObj.gradeId, xtype: 1 }, function (data) {
      $.hideIndicator();
      data = strToJson(data);
      if (data.errorcode == "0") {
          if(data.data==undefined){
              $("#assessment_tab1").html("<center><br /><br />当前班级未绑定评估卷</center>");
            //  $.toast('该班级未添加问卷！');
          }else{
              if(classObj.state==2){
                $("#assessment_tab1").html("<center><br /><br />感谢参与，您已经完成了评估</center>");
                //  $("#iframequessrc").attr("src", "../wenjuan/wenjuan_info.html?key=" + data.data.questionnaireId+"&xid="+classObj.gradeId+"&xtype=1&type="+classObj.state+"&b=1");
              }else{
                  $("#iframequessrc").attr("src", "../wenjuan/wenjuan_info.html?key=" + data.data.questionnaireId+"&xid="+classObj.gradeId+"&xtype=1&type="+classObj.state);
              }
          }
      } else {
          $.toast('获取问卷异常！');
      }
  });
}
//绑定课程评估卷
function pinggukecheng(){
  $.showIndicator();
  var classObj = strToJson(GetlocalStorage("classObj"));
  getAjax(javaserver + "/makecourse/findMakecourse", { grade_id: classObj.gradeId,org_id:'1',pageIndex:1, pageSize:50 },
  function (data) {
    data = strToJson(data);
    if(data.errorcode == "0"){
      var html ="";
      if(data.datas.length >0){
        for(var i=0;i<data.datas.length;i++)
        {
          html+=("<li class=\'item-content\'>");
          html+=("              <div class=\'item-inner\'>");
          html+=("                <div class=\'item-title-row\'>");
          html+=("                  <div class=\'item-title\'>"+data.datas[i].course_name+"</div>");
          html+=("                  <div class=\'item-after\'>");
        //  html+=("                    <button class=\'button button-success\'><i class=\'iconfont\' style=\' color:#4cd964;\'>&#xe67a;</i>已参与</button>");
          html+=("                    <a id=\""+data.datas[i].course_id+"\"  class=\'button pull-right\'>参与评估</a>");
          html+=("                  </div>");
          html+=("                </div>");

          html+=("                <div class=\'item-text\'>讲师："+JSON.parse(data.datas[i].start_course_teacher).user_Name+"</div>");
          html+=("                <div class=\'item-text\'>时间："+data.datas[i].start_course_time+"</div>");
          html+=("              </div>");
          html+=("</li>");

        }
        $("#kechengpinggu").html(html);
        for(var i=0;i<data.datas.length;i++)
        {
            getpinggulink(data.datas[i].course_id);//查询评估卷链接
        }
      }
      else {
        $("#kechengpinggu").html("<center>本班中不含任何课程</center>");
      }

    }
    else {
      alert("获取课程失败");
    }
    $.hideIndicator();
  });

}
//根据课程ID，查询评估卷链接
function getpinggulink(cid){
  var classObj = strToJson(GetlocalStorage("classObj"));
  getAjax(javaserver + "/questionnaire/findIsaAnser",
  {
    gradeid: classObj.gradeId,
    courseid:cid,
    xtype: 3,
    userid:getUserInfo().user_ID
  }, function (data) {
      data = strToJson(data);
      if (data.errorcode == "0") {
          if(data.data.questionnaireId==undefined){
              $("#kechengpinggu").html("<center><br /><br />当前班级未绑定评估卷<br /><br /></center>");
            //  $.toast('该班级未添加问卷！');
          }else{
            //  alert(data.data.isAnswer);
              if(data.data.isAnswer){
                  $("#"+cid).addClass("button-success").html("<i class=\'iconfont\' style=\' color:#4cd964;\'>&#xe67a;</i>已参与")
                //  .click(function(){
                //    openwenjuans(data.data.questionnaireId,"/html/wenjuan/wenjuan_info.html?key=" + data.data.questionnaireId+"&xid="+cid+"&xtype=1&type=3");
                //  })

              }else{
                  $("#"+cid).click(function(){
                    openwenjuans(data.data.questionnaireId,"/html/wenjuan/wenjuan_info.html?key=" + data.data.questionnaireId+"&xid="+cid+"&xtype=3");
                  });

              }
          }
      }
      else {
        $("#"+cid).hide();
      }
  });
}
//跳转问卷
function openwenjuans(id,url) {
    //var doc = document.getElementById("iframequessrc");
  //  doc.src = "/system/views/wenjuan/wenjuan_info.html?key=" + id;

  api.openWin({
      name: 'wenjuan',
      url: "../iframe.html",
      pageParam: {
          title:'问卷调研',
          url: api.wgtRootDir +url
      }
  });
}
///ifream页面 开始
$(document).on("pageInit", "#iframepage", function (e, id, $page) {
    var urlsrc = GetlocalStorage("iframepageSrc");
    if(urlsrc != ""){
        $("#iframeurl").attr("src", urlsrc);
    }else{
         $.toast('页面错误，请返回');
    }
});

$(document).on('refresh', '.pull-to-refresh-content',function(e) {
    pinggukecheng();
    // done
    $.pullToRefreshDone('.pull-to-refresh-content');

});
