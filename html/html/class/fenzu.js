$(document).on("pageInit", "#fenzu", function (e, id, $page) {
	// alert('x');

    $.showPreloader();
    var classObj = GetlocalStorage("classObj");
    getAjax(javaserver + "/groups/findGroupPage",
    {
      gradeid:classObj.gradeId,
      pageIndex:1,
      pageSize:10
    },
    function(rs){
      //console.log(rs);
      var data = strToJson(rs);
      if(data.errorcode == "0"){
          //alert(JSON.stringify(data));
           if(data.datas.length > 0){
             var html ="";
              for (var i = 0; i < data.datas.length; i++) {

                html+=("	<div class=\'card\' style=\'margin-bottom: 10px!important;\'>");
                html+=("    <div class=\'card-header\' id='group_"+data.datas[i].groupId+"'><strong>"+ data.datas[i].groupName+"</strong>");

                html+=("    </div><div class=\'card-content\'>");
                html+=("      <div class=\'list-block media-list\'>");
                html+=("        <ul>");
                html+=("          <li class=\'item-content\'>");
                html+=("            <div class=\'item-inner\'>");
                html+=("              <div class=\'item-title-row\'>");
                html+=("                <div class=\'item-title\'>议题："+ data.datas[i].issues+"</div>");
                html+=("              </div>");
                html+=("              <div class=\'item-subtitle\'>");
                if(data.datas[i].groupTime != undefined)
                {
                    html+="时间："+ data.datas[i].groupTime+"<br />";
                }
                if(data.datas[i].groupTime != undefined)
                {
                   html+= "地址："+ data.datas[i].address+"<br>";
                }
                if(data.datas[i].orgName != undefined)
                {
                    html+=("组长："+data.datas[i].orgName);
                }
                html+=("           </div> </div>");
                html+=("          </li>");
                html+=("        </ul>");
                html+=("      </div>");
                html+=("    </div>");
                html+=("    <div class=\'card-footer\'>");
                html+=("      <span>共"+data.datas[i].groupNumber+"人</span>");
                html+=("      <span><a href=\'#\' onclick=\"fenzumingdan('"+data.datas[i].groupId+"')\" class=\'button\'>查看名单</a></span>");
                html+=("    </div>");
                html+=("  </div>");
              }
              $('#fenzudiv').html(html);

              //查找我所在的分组
              getAjax(javaserver + "/groups/findMyGroup",
              {
                  gradeid:classObj.gradeId,
                  userid:getUserInfo().user_ID
              },
              function(rs){
                //  alert(rs);
                var data = strToJson(rs);
                if(data.errorcode == "0")
                {
                  if(data.data != undefined)
                  {
                    $("#group_"+data.data.groupId).append("<button class=\'button pull-right button-fill  \'>我的分组</button>");
                  }

                }
              });
           }
           else {
             var html = "<center><br /><br /><img src=\"../../res/img/none.png\" style=\"width: 50%;\" /><br />本班暂时没有分组<br /><br /></center>";
              $('#fenzudiv').html(html);
           }
      }
      else {
          alert("分组查询失败"+rs.errormsg);
      }
      $.hidePreloader();
    });
})
//分组查询人员明细
function fenzumingdan(id){
//  parusergroupid = id;
  localStorage.setItem("parusergroupid",id);
  $.router.loadPage("personnel.html",true);
}
