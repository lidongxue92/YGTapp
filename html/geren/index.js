$(document).on("pageInit", "#stuInfo", function (e, id, $page) {

    var userInfo = getUserInfo();
    //console.log(JSON.stringify(userInfo));
    //男
    if (userInfo.user_Sex != undefined && userInfo.user_Sex == 1) {
        $("#usersex").html("<i class='iconfont icon-unie71c' style='color: #39f'></i>");
        //女
    } else if (userInfo.user_Sex != undefined && userInfo.user_Sex == 0) {
        $("#usersex").html("<i class='iconfont icon-unie71a' style='color: #fe5d81'></i>");
    }
    if (userInfo.organization_ID == "") { //jinjingjingyuan
        $("#userkscs").hide();
    }
    //console.log(JSON.stringify(userInfo.userOrgList));
    if(userInfo.userOrgList.length>0)
    {
      $("#orgname").html(userInfo.userOrgList[0].organization_Name);
    }
    else {
      $("#orgname").html(userInfo.organization_Name);
    }
    $("#userimg").attr("src", userInfo.user_Img);
    api.addEventListener({
        name: 'setuserIMG'
    }, function(ret, err) {
      //  alert(ret.value.img);
        $("#userimg").prop("src",ret.value.img);
    });
    $("#uname").html(userInfo.username);

    $("#userno").html("编号：" + userInfo.user_No);
      $("#jifencount").html(userInfo.remark);


    getAjax(javaserver + "/exampaper/stuTotleInfo", { orgid: userInfo.organization_ID, userid: userInfo.user_ID, org_Id: userInfo.allorgid, role_Id: userInfo.allroleid, user_groupId: userInfo.allgroupid }, function (data) {
        data = strToJson(data);
        if (data.errorcode == 0 && data.data != null) {
            if(data.data.totleStudyTime >99) //总学时
            {
                $("#totleStudyTime").html((data.data.totleStudyTime/60).toFixed(2));
                $("#totleStudyTime_danwei").html('(小时)');
            }
            else {
               $("#totleStudyTime").html(data.data.totleStudyTime.toFixed(2));
               $("#totleStudyTime_danwei").html('(分钟)');
            }

            $("#totleStudyCourse").html(data.data.totleStudyCourse);//课程数
            $("#totleExam").html(data.data.totleExam);//任务数
            $("#shoucangliang").html(data.data.totleCollection);//收藏两
        }
    });



    //绑定缓存信息
    var byteConvert = function(bytes) {
        if (isNaN(bytes)) {
            return '';
        }
        var symbols = ['B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
        var exp = Math.floor(Math.log(bytes)/Math.log(2));
        if (exp < 1) {
            exp = 0;
        }
        var i = Math.floor(exp / 10);
        bytes = bytes / Math.pow(2, 10 * i);

        if (bytes.toString().length > bytes.toFixed(2).toString().length) {
            bytes = bytes.toFixed(2);
        }
        return bytes + ' ' + symbols[i];
    };
    api.getCacheSize(function(ret) {
        var size = ret.size;
        $("#huancung").html(byteConvert(size));
    });

/**
    //退出登录  exitLogin
    $(document).on('click', '#exitLogin', function (event) {
      //alert("x");
      event.preventDefault();
      var r=confirm("您确定要退出当前登陆账号吗？")
      if (r==true)
      {
        getAjax(javaserver + "/ApiUser/exit",
                 { userid: getUserInfo().user_id },
                 function (data) {
                   localStorage.clear();
                    // localStorage.setItem("userinfo", "");
                  //   localStorage.setItem("userinfo_token", "");
                  //   var UserOrgInfoObj = strToJson(GetlocalStorage("UserOrgInfoObj"));
                    // if (UserOrgInfoObj.organization_domain_name) {
                    //     window.location.href = "//" + UserOrgInfoObj.organization_domain_name + "?signout=0";
                    // } else if (UserOrgInfoObj.organization_two_domain_name) {
                    //     window.location.href = "//" + UserOrgInfoObj.organization_two_domain_name + sortdomain + "?signout=0";
                    // } else {
                         window.location.href = api.wgtRootDir+"/login.html";
                    // }
        });
      }
      else
      {
        //document.write("You pressed Cancel!")
      }

    });
    **/
});
//清除缓存
function qingchuhuancun(){
  api.confirm({
    title: '系统提示',
    msg: '您确定要清楚缓存数据吗？注意：清除缓存后，本地缓存文件也会被同步清除！',
    buttons: ['确定', '取消']
  }, function(ret, err) {
        var index = ret.buttonIndex;
        if(index == 1)
        {
        api.clearCache(function() {
          api.toast({
              msg: '清除完成'
          });
          $("#huancung").html(0);
      });
  }
});
}
//退出软件
function exitLogin(){
  // event.preventDefault();
  api.confirm({
    title: '系统提示',
    msg: '您确定要退出当前登陆账号吗？',
    buttons: ['确定', '取消']
}, function(ret, err) {
    var index = ret.buttonIndex;
    if(index == 1)
    {
      getAjax(javaserver + "/ApiUser/exit",
               { userid: getUserInfo().user_id },
               function (data) {
                 localStorage.clear();
                  // localStorage.setItem("userinfo", "");
                //   localStorage.setItem("userinfo_token", "");
                //   var UserOrgInfoObj = strToJson(GetlocalStorage("UserOrgInfoObj"));
                  // if (UserOrgInfoObj.organization_domain_name) {
                  //     window.location.href = "//" + UserOrgInfoObj.organization_domain_name + "?signout=0";
                  // } else if (UserOrgInfoObj.organization_two_domain_name) {
                  //     window.location.href = "//" + UserOrgInfoObj.organization_two_domain_name + sortdomain + "?signout=0";
                  // } else {
                       window.location.href = api.wgtRootDir+"/ypylogin.html";
                  // }
      });
    }
  //  alert("x"+index);
});

}
function disanfang(title,url){
    api.openWin({
        name: 'disanfang',
        url: api.wgtRootDir+"/html/iframe.html",
        pageParam: {
            title:title,
            url: url
        }
    });
    /**
    api.openApp({
      iosUrl:'iting://',
      androidPkg: 'com.jianshu.haruki',
      mimeType: 'text/html',
      uri: 'http://m.ximalaya.com/'
  }, function(ret, err) {
      if (ret) {
          alert(JSON.stringify(ret));
      } else {
          alert('您的手机未安装本应用');
          api.openWin({
              name: 'disanfang',
              url: api.wgtRootDir+"/html/iframe.html",
              pageParam: {
                  title:'喜马拉雅FM',
                  url: 'http://m.ximalaya.com/'
              }
          });
      }
  });**/
}


/***************************************************************************/
//考试历史的加载事件
/**************************************************************************/
$(document).on("pageInit", "#historyExam", function(e, id, $page) {
    var pageIndex=1;
    var pageSize=20;
    //登录用户
    sysUserInfo=getUserInfo();
    //请求,第一次加载  替换页面
    historyExam(1,pageSize,pageIndex);

})

 //分页
   function getMoreHistory(){
        var pageIndex=$("#pageIndex").html();
        pageIndex=parseInt(pageIndex)+1;
      //  console.log("每页条数："+pageSize);
        console.log("当前第几页："+pageIndex);

        //这里条数（每页20条，给死了）
        historyExam(2,20,pageIndex);//追加
   }
   //查询考试历史，调出来
   //optype   1,替换，2拼接
   /******************************************查询方法开始*************************************************/
   function historyExam(optype,pageSize,pageIndex){
   sysUserInfo=getUserInfo();
    //请求
    getAjax(javaserver + "/exampaper/historyPaper",
                    { userid: sysUserInfo.user_ID, //用户id
                      pageIndex: pageIndex,
                      pageSize:pageSize
                       }, function (data) {
                        // console.log(JSON.stringify(data));
                        data = strToJson(data);
                        if (data.errorcode == 0 ) {
                            var block="";
                           for(var i=0;i<data.datas.length;i++){
                              if(data.datas[i].exampaper != undefined)
                              {
                                data.datas[i].exampaper.scoreId=data.datas[i].scoreId;
                                block+="<li><a href='#' onclick='openSj("+JSON.stringify(data.datas[i])+",99)' class='item-link item-content'><div class='item-inner'><div class='item-title-row'><div class='item-title'>"+data.datas[i].paperName+"</div></div><div class='item-subtitle'>得分：<b style='color: #fe5945'>"+data.datas[i].score+"</b>分</div><div class='item-text'>考试时间："+data.datas[i].scoreTime+"</div></div></a></li>";
                              }
                              else {
                                block+="<li><a href='#' onclick='alert('试卷已被删除')' class='item-link item-content'><div class='item-inner'><div class='item-title-row'><div class='item-title'>"+data.datas[i].paperName+"[已删除]</div></div><div class='item-subtitle'>得分：<b style='color: #fe5945'>"+data.datas[i].score+"</b>分</div><div class='item-text'>考试时间："+data.datas[i].scoreTime+"</div></div></a></li>";
                              }
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
 /******************************************查询方法结束*************************************************/

 /***************************************************************************/
 //学员资料
 /**************************************************************************/
$(document).on("pageInit", "#studentInfo", function (e, id, $page) {
     sysUserInfo=getUserInfo();
  console.log(JSON.stringify(sysUserInfo));
    //个人中心信息
   $("#userImg").attr("src",sysUserInfo.user_Img);
   $("#userEmail").val(sysUserInfo.email);
   $("#userPhone").val(sysUserInfo.phone);
   $("#idcard").val(sysUserInfo.identifyCard);
   $("#userName").html(sysUserInfo.username);
   $("#userNo").html(sysUserInfo.user_No);


   if(sysUserInfo.user_Sex != undefined)
   {
      $("#user_Sex").val(sysUserInfo.user_Sex);
   }

  // alert(sysUserInfo.userContact.duties);
  if(sysUserInfo.userContact != undefined)
  {
         $("#duties").val(sysUserInfo.userContact.duties);

         if(sysUserInfo.userContact.education != undefined && sysUserInfo.userContact.education !="")
         {
            $("#education").val(sysUserInfo.userContact.education);
         }

       if(sysUserInfo.userContact.servants == "0")
       {
         sysUserInfo.userContact.servants = "是";
       }
       else if(sysUserInfo.userContact.servants == "1")
       {
         sysUserInfo.userContact.servants = "否";
       }
       else if(sysUserInfo.userContact.servants == "2")
       {
         sysUserInfo.userContact.servants = "参公";
       }

       $("#servants").val(sysUserInfo.userContact.servants);
       if(sysUserInfo.userContact.nation != undefined && sysUserInfo.userContact.nation !="")
       {
          $("#nation").val(sysUserInfo.userContact.nation);
        //  alert(sysUserInfo.userContact.nation);
       }


       if(sysUserInfo.userContact.birthDate != undefined && sysUserInfo.userContact.birthDate.split(' ').length>1)
       {
         sysUserInfo.userContact.birthDate = sysUserInfo.userContact.birthDate.split(' ')[0];
       }
       //alert(sysUserInfo.userContact.birthDate);
       if(sysUserInfo.userContact.birthDate != undefined)
       {
         var userbd = sysUserInfo.userContact.birthDate.split('-');
         if(userbd.length >2)
         {
           $('#birthDate').val(userbd[0]+"-"+(userbd[1].length==1?"0"+userbd[1]:userbd[1])+"-"+(userbd[2].length==1?"0"+userbd[2]:userbd[2]));
         }
       }


       $("#political").val(sysUserInfo.userContact.political);

       $("#telephone").val(sysUserInfo.userContact.telephone);
    }
   getAjax(javaserver + "/Level/findLevel",{
     userid:sysUserInfo.user_ID,
     orgId:sysUserInfo.organization_ID
   },function(data){
      //console.log(data);
      data = strToJson(data);
      if(data.errorcode =="0")
      {
         for(var i=0;i<data.datas.length;i++){
            $("#levelid").append("<option value=\""+data.datas[i].levelId+"\">"+data.datas[i].levelName+"</option>");
         }
        // alert(JSON.stringify(sysUserInfo.userContact));
         if(sysUserInfo.userContact.levelid != undefined)
         {
            $("#levelid").val(sysUserInfo.userContact.levelid);
         }

      }
      else {
        //职级查询错误
        console.error("查询错误"+data.errcode);
      }
   });



   //学员组织架构信息
   $("#userOrg").html(sysUserInfo.allorgname==""?"暂无":sysUserInfo.allorgname);
   $("#userGroup").html(sysUserInfo.allgroupname==""?"暂无":sysUserInfo.allgroupname);
   $("#userRole").html(sysUserInfo.allrolename==""?"暂无":sysUserInfo.allrolename);
})

//个人信息保存
function saveStuInfo(){
   //对电子邮件的验证
var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
var mobile=/^((1[345789]{1}))+\d{9}$/;

    sysUserInfo=getUserInfo();
    //赋值
    sysUserInfo.email=$("#userEmail").val();
    sysUserInfo.phone=$("#userPhone").val();
    sysUserInfo.identifyCard=$("#idcard").val();
	$("#errmsg").html("&nbsp;");

if(sysUserInfo.email==""){
  $.toast("邮箱地址不能为空！");
	$("#errmsg").html("邮箱地址不能为空！");
	$("#userEmail").focus();
	return;
}else if(sysUserInfo.phone==""){
  $.toast("手机号码不能为空！");
	$("#errmsg").html("手机号码不能为空！");
	$("#userPhone").focus();
	return;
}
//else if(sysUserInfo.identifyCard==""){
//	$("#errmsg").html("身份证号不能为空！");
//	$("#idcard").focus();
//	return;
//}
else{
	if(!myreg.test(sysUserInfo.email)){
    $.toast("邮箱地址格式错误！");
		$("#errmsg").html("邮箱地址格式错误！");
		$("#userEmail").focus();
		return;
	}else if(!mobile.test(sysUserInfo.phone)){
    $.toast("文件手机号码格式错误！");
		$("#errmsg").html("手机号码格式错误！");
		$("#userPhone").focus();
		return;
	}
  //else if(!/^\d{17}(\d|x)$/i.test(sysUserInfo.identifyCard)){
	//	$("#errmsg").html("身份证号格式错误！");
	//	$("#idcard").focus();
	//	return;
	//}
  $.showIndicator(); //loading
}

      //公务员
      sysUserInfo.userContact.servants =  $("#servants").val();
      if(sysUserInfo.userContact.servants == "是")
      {
        sysUserInfo.userContact.servants = "0";
      }
      else if(sysUserInfo.userContact.servants == "否")
      {
        sysUserInfo.userContact.servants = "1";
      }
      else if(sysUserInfo.userContact.servants == "参公")
      {
        sysUserInfo.userContact.servants = "2";
      }
      var bdate =$("#birthDate").val();
      if(bdate != "")
      {
          var date = new Date(bdate);
          var year = date.getFullYear(),
          month = date.getMonth() + 1,//月份是从0开始的
          day = date.getDate();
          sysUserInfo.userContact.birthDate =  year + '-' +month + '-' +day;
          //console.log('生日：'+sysUserInfo.userContact.birthDate);
      }

    sysUserInfo.userContact.telephone = $("#telephone").val();
    sysUserInfo.user_Sex =  $("#user_Sex").val();
    sysUserInfo.userContact.duties = $("#duties").val();
    sysUserInfo.userContact.education = $("#education").val();
    sysUserInfo.userContact.nation = $("#nation").val();
    sysUserInfo.userContact.levelid = jq("#levelid").val();
    sysUserInfo.userContact.levelName = jq("#levelid").find("option:selected").text();
    sysUserInfo.userContact.political = $("#political").val();

  //  alert(jq("#levelid").val());
    //请求
    getAjax(javaserver + "/exampaper/updateStuInfo",
                    { userid: sysUserInfo.user_ID, //用户id
                      email: sysUserInfo.email,//用户email
                      identifyCard:sysUserInfo.identifyCard,//用户身份证号
                      phone:sysUserInfo.phone,//用户电话
                      telephone:$("#telephone").val(),//电话
                      usersex:$("#user_Sex").val(),
                      duties:$("#duties").val(),
                      education:$("#education").val(),
                      birthDate:sysUserInfo.userContact.birthDate,
                      nation:$("#nation").val(),
                      levelid:$("#levelid").val(),
                      levelName:jq("#levelid").find("option:selected").text(),
                      political:$("#political").val(),
                      servants:sysUserInfo.userContact.servants,
                       }, function (data) {
                        data = strToJson(data);
                        if (data.errorcode == 0 ) {
                            $.toast('修改成功！');
                             //修改成功，则放入缓存
                             console.error(JSON.stringify(sysUserInfo));
                             SetlocalStorage("userinfo",JSON.stringify(sysUserInfo));
                        }  else {
                            $.toast('请求错误！');
                            //console.error(JSON.stringify(data));
                        }
       });
}


/***************************************************************************/
//课程收藏的加载事件
/**************************************************************************/
$(document).on("pageInit", "#courseCollection", function(e, id, $page) {
    var pageIndex=1;
    var pageSize=20;
    //登录用户
    sysUserInfo=getUserInfo();
    //请求,第一次加载  替换页面
    courseCollection(1,pageSize,pageIndex);

})

 //分页
   function getMoreCollection(){
        var pageIndex=$("#pageIndex").html();
        pageIndex=parseInt(pageIndex)+1;
      //  console.log("每页条数："+pageSize);
        console.log("当前第几页："+pageIndex);

        //这里条数（每页20条，给死了）
        courseCollection(2,20,pageIndex);//追加
   }
   //查询考试历史，调出来
   //optype   1,替换，2拼接
   /******************************************查询方法开始*************************************************/
   function courseCollection(optype,pageSize,pageIndex){
   sysUserInfo=getUserInfo();
    //请求
    getAjax(javaserver + "/exampaper/courseCollection",
                   { userid: sysUserInfo.user_ID, //用户id
                       orgid: sysUserInfo.organization_ID,
                      pageIndex: pageIndex,
                      pageSize:pageSize
                       }, function (data) {
                        data = strToJson(data);
                        if (data.errorcode == 0 ) {
                            var block="";
                           for(var i=0;i<data.datas.length;i++){
                                //如果最后修改日期为null，吧创建日期给他
                                if(data.datas[i].upd_Date==undefined||data.datas[i].upd_Date==null){
                                    data.datas[i].upd_Date=data.datas[i].create_Date
                                }
                                if(data.datas[i].course_img.indexOf("http") != 0){
                                  data.datas[i].course_img = staticimgserver+data.datas[i].course_img;
                              //  block+="<a href='#' onClick='openKe_collection(" + JSON.stringify(data.datas[i].course_Id) + ","+null+","+ JSON.stringify((data.datas[i].course_Detailed&&data.datas[i].course_Detailed)?data.datas[i].course_Detailed:null)+ ")' class='item-link item-content'><div class='item-media'><img src='../.."+data.datas[i].course_img+"'  style='width: 5rem;height:3rem;'></div><div class='item-inner'><div class='item-title-row'><div class='item-title' style='width:10rem;'>"+data.datas[i].course_Name+"</div></div><div class='item-text'>课程最后更新时间："+data.datas[i].upd_Date+"</div></div></a></li>";
                              }
                                  block+="<a href='#' onClick='openKe_collection(" + JSON.stringify(data.datas[i].course_Id) + ","+null+","+ JSON.stringify((data.datas[i].course_Detailed&&data.datas[i].course_Detailed)?data.datas[i].course_Detailed:null)+ ")' class='item-link item-content'><div class='item-media'><img src='"+data.datas[i].course_img+"'  style='width: 5rem;height:3rem;'></div><div class='item-inner'><div class='item-title-row'><div class='item-title' style='width:10rem;'>"+data.datas[i].course_Name+"</div></div><div class='item-text'>课程最后更新时间："+data.datas[i].upd_Date+"</div></div></a></li>";

                              //}
                           }
                           //替换
                           if(optype==1){

                                 if(block!=""){
                                        $("#courseCollecList").html(block);
                                        $("#moreCollec").show();
                                 }else{
                                        $("#shoucangnodate").show();
                                        $("#moreCollec").hide();
                                 }
                           //拼接
                           }else{
                                if(block!=""){
                                        $("#courseCollecList").append(block);
                                 }else{
                                        //没有数据可获取了
                                        $("#moreCollec").hide();
                                 }
                           }
                           //把当前页给页面
                          $("#pageIndex").html(pageIndex);
                          //如果总条数小于等于每页显示条数
                          //隐藏加载更多，
                          if(pageIndex>=data.pageCount){
                                 $("#moreCollec").hide();
                          }else{
                                $("#moreCollec").show();
                          }
                        }  else {
                            $.toast('请求错误！');
                        }
   });
   }
   /******************************************查询方法结束*************************************************/
   //===========================学习历史===============================
        $(document).on("pageInit", "#studyHistory", function (e, id, $page) {
        sysUserInfo=getUserInfo();
        //  console.log(javaserver+"xxx"+sysUserInfo.user_ID);
           //请求最近学习的前三个课程记录
           getAjax(javaserver + "/exampaper/studyCourseTopThree", { userid: sysUserInfo.user_ID, pageSize:6 }, function (data) {

               data = strToJson(data);
               if (data.errorcode == 0) {
                   var block = "";
                   if(data.datas.length>0){
                   for (var i = 0; i < data.datas.length; i++) {
                     if(data.datas[i].courseImg.indexOf("http")==-1){
                       data.datas[i].courseImg=staticimgserver+data.datas[i].courseImg;
                     }
                    block+="<a href='#' onClick='openKe_collection(" + JSON.stringify(data.datas[i].courseId) + "," + null + "," + JSON.stringify(data.datas[i].arrangeId) + ")' class='item-link item-content'><div class='item-media'><img src='"+data.datas[i].courseImg+"'  style='width: 5rem;height:3rem;'></div><div class='item-inner'><div class='item-title-row'><div class='item-title' style='width:10rem;'>"+data.datas[i].courseName+"</div></div><div class='item-text'>学习进度："+data.datas[i].learningProgress+"</div></div></a></li>";
                   }

                   if (block != "") {
                       $("#studyHistory ul").html(block);
                   } else {

                   }
                 }
                 else {
                   $("#shoucangnodate").show();
                 }
               } else {
                   $.toast('请求错误！');
               }
           });
       });/** 修改密码 初始化 start***/
 $(document).on("pageInit", "#studentUpdatepwd", function (e, id, $page) {
   sysUserInfo=getUserInfo();
})
function updatePwd(){
    var dqpwd = sysUserInfo.user_Pwd;
    var oldpwd = $("#oldpwd").val();
    var newpwd = $("#newpwd").val();
    var newpwdagain = $("#newpwdagain").val();
    if(oldpwd == ""){
        $("#errmsg").text("旧密码不能为空");
        $("#oldpwd").focus();
        return;
    }else if(newpwd == ""){
        $("#errmsg").text("新密码密码不能为空");
        return;
    }else if(newpwd != newpwdagain){
        $("#errmsg").text("俩次输入新密码不一致");
        return;
    }else if(newpwd == oldpwd){
        $("#errmsg").text("新密码不能与旧密码一致");
        return;
    }else{

        getAjax(javaserver + "/ApiUser/updatePwd", { userid:sysUserInfo.user_ID,userpwd:newpwd,oldpwd:oldpwd}, function (data) {
          data = strToJson(data);
            if(data.errorcode == "0"){
                sysUserInfo.user_Pwd = newpwd;
                SetlocalStorage("userinfo", JSON.stringify(sysUserInfo));
                alert('密码修改成功');
                $.router.back("index.html");
            }
            else if(data.errorcode == "12"){
               alert('原密码错误');
            }
            else {
                alert('密码修改失败，请重试'+data.errorcode);
              //  window.location.reload();
            }
        });
    }
}
/** 修改密码 初始化 end***/


/******************我的问答**********************************************/
$(document).on("pageInit", "#wodewenda", function (e, id, $page) {
    getwodetiwen();
});
function getwodetiwen(){
  sysUserInfo=getUserInfo();
  getAjax(javaserver + "/interlocution/findProblemPage",
  { userId:sysUserInfo.user_ID,pageSize:10,pageIndex:1,searchText:''},
  function (data) {
      data = strToJson(data);
      if(data.errorcode == "0"){
        if(data.datas.length >0)
        {
            var html = "";
            for (var i = 0; i < data.datas.length; i++) {
                html += "<div class='card' onclick=\"openInterlocutionss('" + data.datas[i].qaid+ "')\">"
                html += "<div class='card-content'>"
                html += "<div class='list-block media-list'>"
                html += " <ul>"
                html += "  <li class='item-content'>"
                html += "     <div class='item-inner'>"

                html += "               <div class='item-title-row'>"
                html += "               <div class='item-title'>" + data.datas[i].title +(data.datas[i].state != 2 ?' <span style=\'color:Red;\'> 未审核</span>':'') + "</div>"
                html += "             </div>"
                html += "             <div class='item-subtitle' style='white-space: inherit;color: #999;margin: 0.5rem 0;'>" + data.datas[i].content + "</div>"

                html += "       </div>"
                html += "    </li>"
                html += "     </ul>"
                html += "  </div>"
                html += " </div>"
                html += " <div class='card-footer' style='border-bottom: 1px solid #e1e1e1; border-top:0px;'>"
                html += "    <span><img src='" + data.datas[i].questionerAvatar + "' style='width:15px;height:15px;border-radius:50%;margin:0;padding:0'> <i class='iconfont'>&#xe6fd;</i>" + data.datas[i].createDate + "</span>"
                html += "    <span><i class='iconfont'>&#xe69b;</i> " + data.datas[i].replyNum + " 回答</span>"
                html += "  </div>"
                html += "</div>"
            }
            $("#tab1").html(html);
        }

      }else{
          alert('查询错误');
      }
  });
}
function getwodehuida(){
  //alert('xxxx');
  sysUserInfo=getUserInfo();
  getAjax(javaserver + "/interlocution/findReplayPage",
  {
    userId:sysUserInfo.user_ID,pageSize:10,pageIndex:1,searchText:''
  },
  function (data) {
      data = strToJson(data);
      if(data.errorcode == "0"){
        if(data.datas.length >0)
        {
            var html = "";
            for (var i = 0; i < data.datas.length; i++) {
                html += "<div class='card' onclick=\"openInterlocutionss('" + data.datas[i].qaid+ "')\">"
                html += "<div class='card-content'>"
                html += "<div class='list-block media-list'>"
                html += " <ul>"
                html += "  <li class='item-content'>"
                html += "     <div class='item-inner'>"

                html += "               <div class='item-title-row'>"
                html += "               <div class='item-title'>" + data.datas[i].title +(data.datas[i].state != 2 ?' <span style=\'color:Red;\'> 未审核</span>':'') + "</div>"
                html += "             </div>"
                html += "             <div class='item-subtitle' style='white-space: inherit;color: #999;margin: 0.5rem 0;'>" + data.datas[i].content + "</div>"

                html += "       </div>"
                html += "    </li>"
                html += "     </ul>"
                html += "  </div>"
                html += " </div>"
                html += " <div class='card-footer' style='border-bottom: 1px solid #e1e1e1; border-top:0px;'>"
                html += "    <span><img src='" + data.datas[i].questionerAvatar + "' style='width:15px;height:15px;border-radius:50%;margin:0;padding:0'> <i class='iconfont'>&#xe6fd;</i>" + data.datas[i].createDate + "</span>"
                html += "    <span><i class='iconfont'>&#xe69b;</i> " + data.datas[i].replyNum + " 回答</span>"
                html += "  </div>"
                html += "</div>"
            }
            $("#tab2").html(html);
        }

      }else{
          alert('查询错误'+data.errorcode);
      }
  });
}
function getwodeshoucang(){
  sysUserInfo=getUserInfo();
  getAjax(javaserver + "/interlocution/findQuestionList",
  { userid:sysUserInfo.user_ID,pageSize:10,pageIndex:1,searchText:'',powerLV:2,type:3,orgid:sysUserInfo.organization_ID},
  function (data) {
      data = strToJson(data);
      if(data.errorcode == "0"){
        if(data.datas.length >0)
        {
            var html = "";
            for (var i = 0; i < data.datas.length; i++) {
                html += "<div class='card' onclick=\"openInterlocutionss('" + data.datas[i].qaid+ "')\">"
                html += "<div class='card-content'>"
                html += "<div class='list-block media-list'>"
                html += " <ul>"
                html += "  <li class='item-content'>"
                html += "     <div class='item-inner'>"

                html += "               <div class='item-title-row'>"
                html += "               <div class='item-title'>" + data.datas[i].title +(data.datas[i].state != 2 ?' <span style=\'color:Red;\'> 未审核</span>':'') + "</div>"
                html += "             </div>"
                html += "             <div class='item-subtitle' style='white-space: inherit;color: #999;margin: 0.5rem 0;'>" + data.datas[i].content + "</div>"

                html += "       </div>"
                html += "    </li>"
                html += "     </ul>"
                html += "  </div>"
                html += " </div>"
                html += " <div class='card-footer' style='border-bottom: 1px solid #e1e1e1; border-top:0px;'>"
                html += "    <span><img src='" + data.datas[i].questionerAvatar + "' style='width:15px;height:15px;border-radius:50%;margin:0;padding:0'> <i class='iconfont'>&#xe6fd;</i>" + data.datas[i].createDate + "</span>"
                html += "    <span><i class='iconfont'>&#xe69b;</i> " + data.datas[i].replyNum + " 回答</span>"
                html += "  </div>"
                html += "</div>"
            }
            $("#tab3").html(html);
        }

      }else{
          alert('查询错误');
      }
  });
}
/******************我的问答结束**********************************************/
