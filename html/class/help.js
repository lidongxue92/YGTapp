//帮助列表
$(document).on("pageInit", "#useringHelp", function (e, id, $page) {
  hleplistbind(1);
});
function hleplistbind(pageindex){
  $("#pageIndex").text(pageindex);
  var pagesize =10;
  $.showIndicator();
  getAjax(javaserver+'/HelpMeanu/findHelpList',
  {
    pageSize:pagesize,
    pageIndex:pageindex
  },
  function(rs){
    //alert(rs);
    var data = strToJson(rs);
    if(data.errorcode =="0"){
          if(data.datas.length>0)
          {
            var html ="";
            for (var i = 0; i < data.datas.length; i++) {
              //data.datas[i]
              html+=("<div class=\'card\' style=\'border-bottom: 1px solid #eee;\' onclick=\"opennews('"+data.datas[i].id+"')\">");
              html+=("    <div class=\'card-content\'>");
              html+=("      <div class=\'card-content-inner\'><div><a href=\'#\' target=\'_blank\'>"+data.datas[i].helpTitle+"</a></div>"+data.datas[i].creatTime+"</div>");
              html+=("    </div>");
              html+=("</div>");
            }
            if(pageindex == 1)
            {
              $('#helplist').html(html);
            }
            else {
              $('#helplist').append(html);
            }


          }

          if(data.datas.length <pagesize)
          {
            $("#morehleplist").hide();
          }
    }
    else {
      var html = "<center><br /><br /><img src=\"../../res/img/none.png\" style=\"width: 50%;\" /><br />当前不存在帮助<br /><br /></center>";
       $('#helplist').html(html);
    }
    $.hideIndicator();
  });
}
function opennews(id){

  $.showIndicator();
  getAjax(javaserver+'/HelpMeanu/findHelp',{id:id},function(data){
    data = strToJson(data);
    if(data.errorcode =="0"){
      var popupHTML = '<div class="popup"> <a class=\"pull-right close-popup\"  style=\"padding: .5rem;\" onclick=\"\"><i class="iconfont">&#xe6b9;</i></a>'+
                      '<div class="content-block">'+
                        '<p style=" text-align:center;" class="msg_title">'+data.data.helpTitle+'</p>'+
                        '<p style=" text-align:right;"><a class="msg_date">'+data.data.creatTime+'</a></p>'+
                        '<p>'+data.data.helpText+'</p>'+
                      '</div>'+
                    '</div>'
      $.popup(popupHTML);
    }
    else {
      alert('查询错误'+data.errorcode);
    }
    $.hideIndicator();
  });
}
function getMorehlep(){
  var index =$("#pageIndex").text();
  hleplistbind(parseInt(index)+1);
}
