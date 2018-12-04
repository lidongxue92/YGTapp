$(document).on("pageInit", "#jifenlist", function(e, id, $page) {
  //积分
  var pageIndex=1;
  var pageSize=20;
  //登录用户

  //请求,第一次加载  替换页面
  getjifenlist(1,pageSize,pageIndex);
});

function getjifenlist(optype,pageSize,pageIndex){
    sysUserInfo=getUserInfo();
    getAjax(javaserver + "/integral/findStuIntergalDetails",
                    { userid: sysUserInfo.user_ID, //用户id
                      pageIndex: pageIndex,
                      pageSize:pageSize,
                      order:1
                       }, function (data) {
                        // console.log(JSON.stringify(data));
                        data = strToJson(data);
                        if (data.errorcode == 0 ) {
                            var block="";
                           for(var i=0;i<data.datas.length;i++){
                                block+="<li><a href='#'  class='item-content'><div class='item-inner'><div class='item-title-row'><div class='item-title'>"+data.datas[i].describe+"</div></div><div class='item-subtitle'>得分：<b style='color: #fe5945'>"+data.datas[i].integral+"</b>分</div><div class='item-text'>积分时间："+data.datas[i].createDate+"</div></div></a></li>";
                           }
                           //替换
                           if(optype==1){

                                 if(block!=""){
                                        $("#historyList").html(block);
                                        $("#moreHis").show();
                                 }else{
                                        $("#lishinodate").show();
                                        $("#moreHis").hide();
                                 }
                           //拼接
                           }else{
                                if(block!=""){
                                        $("#historyList").append(block);
                                 }else{
                                        //没有数据可获取了
                                        $("#moreHis").hide();
                                 }
                           }
                           //把当前页给页面
                          $("#pageIndex").html(pageIndex);

                            //如果总条数小于等于每页显示条数
                          //隐藏加载更多，
                           if(pageIndex>=data.pageCount){
                                 $("#moreHis").hide();
                          }else{
                                $("#moreHis").show();
                          }
                        }  else {
                            $.toast('请求错误！');
                        }
   });
}
