$(document).on("pageInit", "#paike", function (e, id, $page) {
	// alert('x');
    $.showPreloader();

    var classObj = GetlocalStorage("classObj");
    var orgid = getUserInfo().organization_ID;
    //console.log(JSON.stringify(classObj));
    var grade_id ="1";
    if(classObj != null){
       grade_id = classObj.gradeId;
    }
    //***************test复制，正式使用后注释掉*****************//
    //grade_id = "1";
    //orgid = "1";
    //*******test****************//
    getAjax(javaserver + "/makecourse/findMakecourse",{grade_id:grade_id,org_id:'1',pageIndex:1, pageSize:50}, function(rs){
        //console.log('班级课程表：'+rs);
        var data = strToJson(rs);
        if(data.errorcode == "0"){
           var html = "";
           $('#paiketext').html("");
           if(data.datas.length > 0){
             //1、对课程进行日期分组，根据分组，再进行课程绑定
             var newlist = [];//用于存储新结构的课程表
             for(var i = 0; i < data.datas.length; i++){
               var jieguo = false;
               for(var j=0;j<newlist.length;j++){
                  // alert('xxxx'+newlist[j].time);
                 if(newlist[j].time == undefined || newlist[j].time == "" || ConvertStrToDate(newlist[j].time).getDate() == ConvertStrToDate(data.datas[i].start_course_time).getDate()) //日期已经有了
                 {
                   newlist[j].list.push(data.datas[i]);
                   jieguo = true;
                   break;
                 }
               }
               if(!jieguo)//还未插入果的日期
                {
                  var newkecheng = {"time":data.datas[i].start_course_time,"list":[data.datas[i]]};
                    newlist.push(newkecheng);
                }
             }
             //console.log("yyy"+JSON.stringify(newlist));
             //2、对新的数组，按照日期排序
             newlist.sort(function(a,b){
                return Date.parse(a.time) - Date.parse(b.time);//时间正序
             });
          //   console.log("xxx"+JSON.stringify(newlist));
            //3、遍历日期
            var riqihtml = "";
             for(var j=0;j<newlist.length;j++){
                var active = "";
                if(j == 0){
                  active = " active ";
                }
                if(newlist[j].time == undefined || newlist[j].time == "")
                {
                    riqihtml+="<a href=\"#tab"+j+"\" class=\"tab-link "+active+" button\">课表</a>";
                }
                else {

                  var shijian = ConvertStrToDate(newlist[j].time);

                  var weekday=["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
                  var myddy=shijian.getDay();//获取存储当前日期
                  var month=shijian.getMonth()+1;
                  month =(month<10 ? "0"+month:month);
                  riqihtml+="<a href=\"#tab"+j+"\" class=\"tab-link "+active+" button\">"+month+"-"+shijian.getDate()+"<br />"+  weekday[myddy]+"</a>";
                }
                //4、遍历课程

                var carlist ="";
                for(var x=0;x<newlist[j].list.length;x++){
                    //alert(newlist[j].list[x].course_starttime);
                    try{
                    var stime =newlist[j].list[x].course_starttime.split(':');
                    var etime =newlist[j].list[x].course_endtime.split(':');
                    carlist += "<div style=\"margin:10px; border-radius: 3px; background-color: white;\">";
                    carlist +=("    <div class=\'card-content\'>");
                    carlist +=("      <div class=\'list-block media-list\'>");
                    carlist +=("        <ul>");
                    carlist +=("          <li class=\'item-content\'>");
                    carlist +=("            <div class=\'item-inner\'>");
                    carlist +=("              <div class=\'item-title-row\'>");
                    carlist +=("                <div class=\'item-title\'><b>"+newlist[j].list[x].course_name+"</b></div>");
                    carlist +=("              </div>");
                    var teacher = newlist[j].list[x].start_course_teacher;
                    var teacherobj = {user_Name:'未知'};
                    if(teacher != undefined && teacher != "")
                    {
                        teacherobj = JSON.parse(teacher);
                    }
                    carlist +=("              <div class=\'item-subtitle\' style='color:#666;font-size:14px'><i class='iconfont icon-jiaoshiguanli'></i>主持人/讲师："+teacherobj.user_Name+"<br><i class='iconfont icon-shijianaini'></i>时间："+stime[0]+":"+stime[1]+"-"+etime[0]+":"+etime[1]+"<br /><i class='iconfont icon-dizhi'></i>地址："+newlist[j].list[x].start_course_address+"</div>");
                    carlist +=("            </div>");
                    carlist +=("          </li>");
                    carlist +=("        </ul>");
                    carlist +=("      </div>");
                    carlist +=("    </div>");

                    if(newlist[j].list[x].file_number >0)
                    {
                      carlist +=("    <div class=\'card-footer\'>");
                      carlist +=("      <span><a href=\'#\'  onclick=\"getkejianlist('"+grade_id+"','"+newlist[j].list[x].course_id+"')\" class=\'button button-fill\'>查看课件</a></span>");
                      carlist +=("    </div>");
                    }
                    //  carlist +=("      <span><a href=\'#\' onclick=\'pinggu()\' class=\'button\'>参与评估</a></span>");

                    carlist += "</div>";
                  }
                  catch(e){}
                }
                $('#paiketext').append("<div class=\"tab "+active+"\" id=\"tab"+j+"\" style=\" background-color:#eee;\">"+carlist+"</div>");
             }
             $('#riqitab').html(riqihtml);
           }
           else {
             html = "<center><br/><br/><img src=\"../../res/img/none.png\" style=\"width: 50%;\" /><br />当前班级暂时还未安排课程<br/><br/></center>";
             $("#paiketext").html(html);
           }

        }
        else {
            console.log('班级课程表查询错误：'+rs);
        }
        $.hidePreloader();
    },function(err){
        html = "<center><img src=\"../../res/img/none.png\" style=\"width: 50%;\" /><br />当前班级暂时还未安排课程</center>";
        $("#paiketext").html(html);
        console.log('班级课程表查询错误：'+JSON.stringify(err));
        $.hidePreloader();
    });
})
//获得每节课对应的课件列表
function getkejianlist(gid,cid){
    //***************test复制，正式使用后注释掉*****************//
    //alert(cid);
    //*******test****************//

      getAjax(javaserver + "/makecourse/findGradefile",{file_type:'2',grade_id:gid,course_id:cid}, function(rs){
      // console.log('文件列表：'+rs);
        var data = strToJson(rs);
        if(data.errorcode == "0"){
             if(data.datas.length > 0){
              //alert(rs);
              if(data.datas.length >1){
                  var html ="";
                  for(var i=0;i<data.datas.length;i++){

                    html+="<p><a href=\"#\" onClick=\"kejianopen('"+data.datas[i].fileName+"','"+data.datas[i].filepreview+"','"+cid+"','"+data.datas[i].upId+"')\">"+data.datas[i].fileName+"</a></p>"
                  }
                //  console.log(html);
                  var popupHTML = '<div class="popup">'+
                  '<a class="pull-right close-popup"  style="padding: .5rem;">'+
                       '<i class="iconfont">&#xe6b9;</i>'+
                     '</a>'+
                      '<div class="content-block">'+
                        '<p>请选择要查看的课件：</p>'+html
                        +
                      '</div>'+
                    '</div>';
                    $.popup(popupHTML);
              }
              else {
                //如果只有一个文件，直接打开，如果多个文件，选择打开
              //  alert(JSON.stringify(data.datas[0]));
                kejianopen(data.datas[0].fileName,data.datas[0].filepreview,cid,data.datas[0].upId);
                return;
              }
           }
           else {
             alert("该课程未找到任何课件");
           }
        }
          else {
            console.log('文件列表错误：'+rs);
          }
    });
}

function kejianopen(title,urlbm,cid,fid){
//  alert(urlbm);
  urlbm = base64encode(urlbm);//地址编码，在common.js中
  //aHR0cHM6Ly9jZG4uamlzdXBlaXh1bi5jb20vcmVzb3VyY2VzL2tub3dsZWRnZS8wYmQwMjQ2NC03NTM4LTQ1ZDAtYTRmYy0zNDJmNTQ2N2MxNTcvYWVkZDk2ZGItZmM2OC00YWNhLWE3OWMtOTgwYjY5OGJkMGVlLzFlZTkzYjc3LWQxOGUtNGFkZC1hYzczLWMwMWNjOTEzOWZmMS9wcmV2aWV3LzFlZTkzYjc3LWQxOGUtNGFkZC1hYzczLWMwMWNjOTEzOWZmMS5wZGY=
  //var url ='aHR0cHM6Ly9jZG4uamlzdXBlaXh1bi5jb20vcmVzb3VyY2VzL2tub3dsZWRnZS8wYmQwMjQ2NC03NTM4LTQ1ZDAtYTRmYy0zNDJmNTQ2N2MxNTcvYWVkZDk2ZGItZmM2OC00YWNhLWE3OWMtOTgwYjY5OGJkMGVlLzFlZTkzYjc3LWQxOGUtNGFkZC1hYzczLWMwMWNjOTEzOWZmMS9wcmV2aWV3LzFlZTkzYjc3LWQxOGUtNGFkZC1hYzczLWMwMWNjOTEzOWZmMS5wZGY=';
  //'https://cdn.jisupeixun.com/resources/knowledge/0bd02464-7538-45d0-a4fc-342f5467c157/aedd96db-fc68-4aca-a79c-980b698bd0ee/1ee93b77-d18e-4add-ac73-c01cc9139ff1/preview/1ee93b77-d18e-4add-ac73-c01cc9139ff1.pdf';

  api.openWin({
      name: 'kejian',
      url: "ziliao.html",
      pageParam: {
          title:title,
          url: urlbm,
          cid:cid,
          fid:fid
      }
  });
}
function pinggu(){
  api.openWin({
      name: 'wenjuan',
      url: api.wgtRootDir +"/html/iframe.html",
      pageParam: {
          title:'师资评估',
          url: api.wgtRootDir +'/html/wenjuan/wenjuan_info.html?key=2a77ec45-5354-227f-687e-17c330f01dd5'
      }
  });
}
//把字符串日期转为日期
function ConvertStrToDate(datetimeStr) {
    var mydateint = Date.parse(datetimeStr);//数值格式的时间
    if (!isNaN(mydateint)) {
        var mydate = new Date(mydateint);
        return mydate;
    }
    var mydate = new Date(datetimeStr);//字符串格式时间
    var monthstr = mydate.getMonth() + 1;
    if (!isNaN(monthstr)) {//转化成功
        return mydate;
    }//字符串格式时间转化失败
    var dateParts = datetimeStr.split(" ");
    var dateToday = new Date();
    var year = dateToday.getFullYear();
    var month = dateToday.getMonth();
    var day = dateToday.getDate();
    if (dateParts.length >= 1) {
        var dataPart = dateParts[0].split("-");//yyyy-mm-dd  格式时间
        if (dataPart.length == 1) {
            dataPart = dateParts[0].split("/");//yyyy/mm/dd格式时间
        }
        if (dataPart.length == 3) {
            year = Math.floor(dataPart[0]);
            month = Math.floor(dataPart[1]) - 1;
            day = Math.floor(dataPart[2]);
        }
    }
    if (dateParts.length == 2) {//hh:mm:ss格式时间
        var timePart = dateParts[1].split(":");//hh:mm:ss格式时间
        if (timePart.length == 3) {
            var hour = Math.floor(timePart[0]);
            var minute = Math.floor(timePart[1]);
            var second = Math.floor(timePart[2]);
            return new Date(year, month, day, hour, minute, second);
        }
    }
    else {
        return new Date(year, month, day);
    }
}
