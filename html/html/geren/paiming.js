$(document).on("pageInit", "#jifenpaiming", function(e, id, $page) {

  getAjax(javaserver+"/integral/findGoodStudent",{
    org_id:getUserInfo().organization_ID,
    userid:getUserInfo().user_ID
  },
  function(rs){
    var data = strToJson(rs);
    if(data.errorcode =="0")
    {
      var html =pinjiepaiming(data.datas);
      $("#zongpaiming").html(html);
    }
    else {
      alert("排名查询失败");
    }
  });
});

function pinjiepaiming(list){
    var html ="";
    for (var i = 0; i < list.length; i++) {
      html+=("<li class=\'item-content\'>");
      if(i<3)
      {
        var iconfont ="";
        if(i==0){
          iconfont="<i class=\'iconfont icon-diyiming\'></i>";
        }
        else if (i==1) {
          iconfont="<i class=\'iconfont icon-dierming\'></i>";
        }
        else {
          iconfont="<i class=\'iconfont icon-disanming\'></i>";
        }
        html+=("<div class=\'item-media paimingimg paimingimg_h\'><img src=\'"+list[i].user_Img+"\' /><span>"+iconfont+"</span></div>");
      }
      else {
        html+=("<div class=\'item-media paimingimg\'><img src=\'"+list[i].user_Img+"\' /><span>第"+(i+1)+"名</span></div>");
      }

      html+=("<div class=\'item-inner\'>");
      html+=("                             <div class=\'item-title-row\'>");
      html+=("                               <div class=\'item-title\'>"+list[i].user_Name+"</div>");
      html+=("                               <div class=\'item-after\'>"+((list[i].remark==undefined)?'0':list[i].remark)+"</div>");
      html+=("                             </div>");
      if(list[i].userOrgList != undefined && list[i].userOrgList.length >0)
      {
        var bumen = "";
        for (var j = 0; j < list[i].userOrgList.length; j++) {
          bumen+=list[i].userOrgList[j].organization_Name+',';
        }
        html+=("<div class=\'item-subtitle\'>"+bumen+"</div>");
      }
      else {
        if(list[i].organization_Name != undefined){
          html+=("<div class=\'item-subtitle\'>"+list[i].organization_Name+"</div>");
        }
      }
      html+=("                           </div>");
      html+=("</li>");
    }
    return html;
}
