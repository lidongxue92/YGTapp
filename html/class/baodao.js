$(document).on("pageInit", "#baodao", function (e, id, $page) {

  var user = getUserInfo();
  var cid = sessionStorage.getItem('cid');
  getAjax(javaserver + "/grade/findGradeEnroll", { userid:user.user_ID,gradeid:cid}, function (data) {
        data = JSON.parse(data);
        if(data.errorcode == "0"){
          var gradeEnroll = data.data;
          if(gradeEnroll.address != undefined && gradeEnroll.address != "")
          {
            $("#fangjianhao").html("您被分配的房间为："+gradeEnroll.address).show();
          }

        }
  });

});
