var classdongtai = "";//全部被动态为空，班级动态为班级ID
$(document).on("pageInit", "#classDynamics", function (e, id, $page) {
    classdongtai = localStorage.getItem("classiddongtai");
  //  alert(classdongtai);
    if(classdongtai == null)
    {
      classdongtai = "";
    }
    else {
      localStorage.removeItem("classiddongtai");
    }

    if(classdongtai == "")
    {
      $("#dongtaitile").text("消息中心");
    }
    else {
      $("#dongtaitile").text("班级动态");
    }

    gettongxunlist(0,classdongtai);
})
function gettongxunlist(pageindex,classid)
{
  $("#pageIndex").text(pageindex);
  var pagesize = 10;
  var canshu={
    recipientId:getUserInfo().user_ID,
    pageIndex:pageindex,
    pageSize:pagesize
  };
  if(classid != "")
  {
    canshu.xid =classid;
  }
  console.log('动态：'+JSON.stringify(canshu));
  $.showIndicator();
      getAjax(javaMsg+"/MessageCenter/findMessagePage",canshu,function(data){
        //    alert(data);
        $.hideIndicator();
        data = strToJson(data);
        if(data.errorcode == "0")
        {
          var list = data.datas;
          if(list.length >0)
          {
            var html= "";
            for (var i = 0; i < list.length; i++) {
              //list[i]
              //isRead //是否阅读 0.未阅读 1.已阅读
            //  console.log(JSON.stringify(list[i]));

              html+=("<div  style=\"margin:10px; border-radius: 3px; background-color: white;\" onclick=\"opentongzhi('"+list[i].id+"','"+list[i].sendTitle.replace(/[\r\n]/g,"")+"','"+escape(list[i].sendContent)+"','"+list[i].sendDate+"')\">");
              html+=("");
              var read ="";
              if(list[i].isRead == "0" || list[i].isRead == 0)
              {
                //<i class='iconfont icon-icon27' style='color:#39f'></i>
                read = "<span class='weidu' data='"+list[i].id+"' id='card_t_"+list[i].id+"'><i class='iconfont icon-icon27' style='color:#39f'></i></span>";
              }
              html+=("<div class=\'card-content-inner\'><div><b>"+read+list[i].sendTitle+"</b></div><div style='color:#666;font-size:14px;border-bottom:1px #ddd solid;padding-bottom:10px;padding-top:5px;margin-bottom:10px;'>");
              var msg = list[i].sendContent.replace(/<\/?[^>]*>/g, '');
              msg = msg.replace(/[|]*\n/, '') //去除行尾空格
              msg = msg.replace(/&npsp;/ig, ''); //去掉npsp
              msg = msg.replace(' ', ''); //去掉npsp
              html+=(msg.substring(0,200));

              html +="</div><div style=\"color:#666;font-size:14px;\"><span class=\"iconfont icon-shijian1\"></span>发布时间："+ list[i].sendDate+"</div></div>";
              html+=("</div>");
            }
            $("#dongtailist").html(html);
          }
          else {
            $("#dongtailist").html("<center><br /><br />暂无消息</center>");
          }

          if(list.length <pagesize)
          {
            $("#moredongtailist").hide();
          }
        }
        else {
            $("#dongtailist").html("<center><br /><br />查询异常</center>");
        }



      });
}
function opentongzhi(id,title,content,date){

      var popupHTML = '<div class="popup"> <a class=\"pull-right close-popup\"  style=\"padding: .5rem;\" onclick=\"\"><i class="iconfont">&#xe6b9;</i></a>'+
                      '<div class="content-block">'+
                        '<p style=" text-align:center;" class="msg_title">'+title+'</p>'+
                        '<p style=" text-align:right;"><a class="msg_date">'+date+'</a></p>'+
                        '<p>'+unescape(content)+'</p>'+
                      '</div>'+
                    '</div>'
      $.popup(popupHTML);
      //alert(id);
      getAjax(javaMsg+"/MessageCenter/modifyMessgae",{messageId:id},
        function(data){
          var data = strToJson(data);
          if(data.errorcode == "0")
          {
              $("#card_t_"+id).remove();
              console.log("同步成功");
          }
          else {
            console.error("阅读状态同步错误"+data.errorcode);
          }
      });
}

function getMoredongtai(){
  var index =$("#pageIndex").text();
  gettongxunlist(parseInt(index)+1,classdongtai);
}
//标记全部已读
function quanbuyidu(){
  var canshu ={recipientId:getUserInfo().user_ID};
  var  classdongtai = localStorage.getItem("classiddongtai");
  if(classdongtai != null && classdongtai != "")
  {
    canshu.xid = classdongtai;
  }
  getAjax(javaMsg+"/MessageCenter/markRead",canshu,function(data){
      var data = strToJson(data);
      if(data.errorcode == "0")
      {
          $(".weidu").remove();
          api.toast({
              msg: '已经将全部消息标记为已读',
              duration: 2000,
              location: 'bottom'
          });
      }
      else {
        console.error("阅读状态同步错误"+data.errorcode);
      }
  });
  /**
  $(".weidu").each(function(){
    var id = ($(this).attr('data'));
    //alert(id);
    getAjax(javaMsg+"/MessageCenter/modifyMessgae",{messageId:id},
      function(data){
        var data = strToJson(data);
        if(data.errorcode == "0")
        {
            $("#card_t_"+id).remove();
            console.log("同步成功");
        }
        else {
          console.error("阅读状态同步错误"+data.errorcode);
        }
    });
  });
  **/
}
