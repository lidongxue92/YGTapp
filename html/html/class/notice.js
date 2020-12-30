$(document).on("pageInit", "#NoticeLIST", function (e, id, $page) {
    sysUserInfo=getUserInfo();
    var UserOrgInfoObj = GetlocalStorage("UserOrgInfoObj");
    var CurrentOrgid = "";//企业ID
    if(UserOrgInfoObj != null){
        CurrentOrgid = UserOrgInfoObj.organization_ID + "";
    }
    if(sysUserInfo != null){
        CurrentOrgid = sysUserInfo.organization_ID + "";
    }
    // alert('x');
    $("#noticelist").html("");
     $.showPreloader();
    getAjax(javaserver + "/Operate/findStudentNotice",{orgid:CurrentOrgid, pageSize: 20}, function(rs){

       $.hidePreloader();
       var data = strToJson(rs);
       if(data.errorcode == "0"){
           var noticeStr = "";
           if(data.datas.length > 0){
               for(var j =0; j <= data.datas.length; j++){
                    var jinji = "",jinjitext ="";
                    if(j == 0)
                    {
                      console.log(JSON.stringify(data.datas[j]));
                    }
                    //
                    var obj = data.datas[j];
                    //console.log(typeof obj);

                  if(obj != undefined)
                  {
                    //alert(obj.isflag);
                    if(obj.pubCritical){
                      //console.log(JSON.stringify(obj));
                       jinji = "color:Red";
                       jinjitext ="[紧急]";
                     }

                   noticeStr += "<div  onClick=\"getnoticeinfo('"+obj.noticeId+"','"+obj.pubTitle+"','"+escape(obj.pubContent)+"','"+obj.pubDate+"')\" style=' background-color:#fff; margin:5px 0!important;padding:10px; padding-bottom:5px; border:1px #ddd solid; border-radius:5px;font-size：14px;"+jinji+"'><a' href='#' >";
                   noticeStr += "                        "+(j+1)+"、"+jinjitext+obj.pubTitle+"";
                   noticeStr += "                </a><div  style='height:30px;line-height:30px;font-size:12px; border-top:1px #ddd solid;'>";
                  noticeStr += "<a href=\"#\" class=\"link\" style='float: left; '><i class='iconfont icon-jiaoshiguanli'></i> "+obj.username+"</a>";
                   noticeStr += "<a href=\"#\" class=\"link\" style=' float: right;'><i class='iconfont icon-shijianaini'></i> "+obj.pubDate+"</a>";
                   noticeStr += "</div></div>";
                 }
               }
           }
           else {
             noticeStr = "<center><br /><br /><img src=\"../../res/img/none.png\" style=\"width: 50%;\" /><br />暂无公告</center>";
           }

           $("#noticelist").html(noticeStr);
       }
    });

})

function getnoticeinfo(p1,p2,p3,p4){
//  alert('x');
  var gonggaoobj ={
      id:p1,
      title:p2,
      content:unescape(p3),
      date:p4,
      type:"3",//1.班级动态消息推送只有id（需要查询），2其他
  }
  SetlocalStorage('MsgInfo',JSON.stringify(gonggaoobj));
  //class=\"open-popup open-services\" data-popup=\".popup-services\"
  $.popup('.popup-services');
}
