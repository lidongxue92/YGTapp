
$(document).on("pageInit", "#scheduling", function (e, id, $page) {
    //alert('scheduling');

    var classObj = GetlocalStorage("classObj");//班级信息
    var user = getUserInfo();

    getAjax(javaserver + "/grade/findGradeEnroll", { userid:user.user_ID,gradeid:classObj.gradeId}, function (data) {
        //  alert(data);
          data = JSON.parse(data);
          if(data.errorcode == "0"){
            var gradeEnroll = data.data;
            //查询基地信息
            if(classObj.trainbaseId != "")
            {
                //console.log('拥有培训基地');
                zhandians =[];
                getAjax(javaserver+'/trainbase/findJunction',
                {
                  trainbase_id:classObj.trainbaseId,
                  pageIndex:1,
                  pageSize:20
                },function(rs){
                //  alert(rs);
                  var data = strToJson(rs);
                  if(data.errorcode =="0"){
                      if(data.datas.length >0)
                      {
                        $("#jiezhan").html("");
                        $("#songzhan").html("");
                        for(var i=0;i<data.datas.length;i++){
                          //data.datas[i].junction_id //基地站点ID
                          //data.datas[i].junctionid_address //基地站点名册
                          //alert(data.datas[i].junctionid_address);
                          $("#jiezhan").append("<option value='"+data.datas[i].junction_id+"'>"+data.datas[i].junctionid_address+"</option>");
                          $("#songzhan").append("<option value='"+data.datas[i].junction_id+"'>"+data.datas[i].junctionid_address+"</option>");
                        }
                      }
                      schedulingbind(gradeEnroll);
                  }
                  else {
                    console.log("获取位置失败");
                  }
                });
            }
            else {
              schedulingbind(gradeEnroll);
            }

          }
    });



});
function schedulingbind(gradeEnroll){
  //alert(JSON.stringify(gradeEnroll));
  var classObj = GetlocalStorage("classObj");//班级信息
  //var gradeEnroll = GetlocalStorage("gradeenroll");//报名信息
  if(gradeEnroll != undefined && gradeEnroll != null)
  {
    $("#scheduling_jiesong").prop("checked", gradeEnroll.isRelay);
    $("#scheduling_shisu").prop("checked", gradeEnroll.isAccommodation);
    //接站信息
    if(gradeEnroll.receptionTime != undefined)//接站时间
    {
      $("#starttime-picker").val(gradeEnroll.receptionTime);
    }
    else {
      $("#starttime-picker").val(getNowFormatDate());
    }
    if(gradeEnroll.receptionRemark != undefined)//接站班次
    {
      $("#starttime-checi").val(gradeEnroll.receptionRemark);
    }

    if(gradeEnroll.receptionId != undefined)//接占地ID
    {
      $("#jiezhan").val(gradeEnroll.receptionId);
    }
    else{
      if(gradeEnroll.deliveryAddress != undefined)//送占地名
      {

      }
    }
    //送站信息
    if(gradeEnroll.deliveryTime != undefined)//送站时间
    {
      $("#endtime-picker").val(gradeEnroll.deliveryTime);
    }
    else {
      $("#endtime-picker").val(getNowFormatDate());
    }
    if(gradeEnroll.deliveryRemark != undefined)//接站班次
    {
      $("#endtime-checi").val(gradeEnroll.deliveryRemark);
    }
    if(gradeEnroll.deliveryId != undefined)//送占地ID
    {
      $("#songzhan").val(gradeEnroll.deliveryId);
    }
    else{
      if(gradeEnroll.deliveryAddress != undefined)//送占地名
      {

      }
    }
    if(gradeEnroll.remarks != undefined){
          $("#shisubeizhu").val(gradeEnroll.remarks);
     }
    if(gradeEnroll.address != undefined){
          $("#zhusufangjian").html(gradeEnroll.address);
    }
  //  alert(gradeEnroll.address);

      //console.log(JSON.stringify(gradeEnroll));
  }
  $("#starttime-picker").datetimePicker({
      toolbarTemplate: '<header class="bar bar-nav">\
      <button class="button button-link pull-right close-picker">确定</button>\
      <h1 class="title">选择日期和时间</h1>\
      </header>'
  });
  $("#endtime-picker").datetimePicker({
      toolbarTemplate: '<header class="bar bar-nav">\
      <button class="button button-link pull-right close-picker">确定</button>\
      <h1 class="title">选择日期和时间</h1>\
      </header>'
  });
}
function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes();
    return currentdate;
}
function schedulingsave(){
  var gradeEnroll = GetlocalStorage("gradeenroll");//报名信息
  var baomingobj = {};
  if(gradeEnroll != undefined && gradeEnroll != null)
  {
      baomingobj =gradeEnroll;
  }
  baomingobj.isRelay =   $("#scheduling_jiesong").prop("checked");
  baomingobj.isAccommodation = $("#scheduling_shisu").prop("checked");
  if($("#starttime-picker").val() != "")
  {
    if($("#starttime-picker").val().split(':').length<3) //2018-07-12 11:22:00
    {
      baomingobj.receptionTime = $("#starttime-picker").val()+':00';
    }

  }

  baomingobj.receptionRemark =  $("#starttime-checi").val();
  baomingobj.receptionId = $("#jiezhan").val();
  baomingobj.receptionAddress = jq("#jiezhan").find("option:selected").text();

  if($("#endtime-picker").val() != "")
  {
    if($("#endtime-picker").val().split(':').length<3) //2018-07-12 11:22:00
    {
        baomingobj.deliveryTime = $("#endtime-picker").val()+':00';
    }
  }

  baomingobj.deliveryRemark =  $("#endtime-checi").val();
  baomingobj.deliveryId = $("#songzhan").val();
  baomingobj.deliveryAddress = jq("#songzhan").find("option:selected").text();

  baomingobj.remarks =   $("#shisubeizhu").val();

  //console.log(JSON.stringify(baomingobj));
  getAjax(javaserver+'/grade/editGradeEnroll',
  {
    enroll:JSON.stringify(baomingobj)
  },
  function(rs){
    var data = strToJson(rs);
    if(data.errorcode == "0")
    {
      SetlocalStorage("gradeenroll",JSON.stringify(baomingobj));
      alert("保存成功");
      $.router.back("index.html");

    }
    else {
      alert("保存失败"+data.errorcode);
    }
  });

}
