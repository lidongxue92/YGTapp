$(document).on("pageInit", "#ziliao", function (e, id, $page) {
ziliaoinit();

});
//**********************************************************************************
//                               文件预览
//**********************************************************************************
$(document).on("pageInit", "#ziliao_yulan", function (e, id, $page) {

    $.showIndicator(); //loading
    //var upId = QueryString("upId")
    //getAjax(javaserver + "/Kapi/findfileById", { upId: upId }, function (data) {
    //    data = strToJson(data);
    //    if (data.errorcode == 0 && data.data != null) {
            //可转码文件
      $(".huncunbtn").attr("data", JSON.stringify(GetlocalStorage("fileobj")));
      abc();
      //  }
    //});
    $.hideIndicator();
});
//查询文件列表
//fid  父id
//type     排序条件
//tagid     标签
//orderby   排序
//optype   1.追加html，2.替换html
//pageSize   每页条数
//pageIndex   当前页数
//needOrg    是否显示企业文件夹
 function getfilelist(fid,type,tagid,orderby,optype,pageSize,pageIndex,needOrg,name){

    //文件缺省图
   var wenjiannull="<dl style='height:100%;width:100%;position: absolute;margin-top: 25%;color:#cecece;'><dd style='text-align:center;margin:0'><img src='../../res/img/knownull.png' style='width: 50%;'></dd><dt style='text-align: center;'>暂无数据</dt></dl>";
   //var name=$("#search").val();
   sysUserInfo=getUserInfo();
   //获取文件
   getAjax(javaserver + "/Kapi/getuserfile",
       { userid: sysUserInfo.user_ID,
           fid: fid,
           orgid: sysUserInfo.organization_ID,
           searchText: name,
           searchType: type,
           tagid: tagid,
           orderby: orderby,
           pageSize: pageSize,
           pageIndex: pageIndex,
           fileType: "",
           powerLV: 99
       }, function (data) {

           data = strToJson(data);
           if (data.errorcode == 0 && data.datas.length > 0) {


               //是否显示企业文件夹
               if (needOrg != undefined && needOrg) {
                   block = "<li id='orgfile'><label class='label-checkbox item-content'><div class='item-media'><img src='../../res/fileicon/fenxiang_folder_56.png' /></div><div class='item-inner'><a class='item-link' fid=0><div class='item-title'>共享文件</div></a></div></label></li>";
               } else {
                   block = "";
               }
               //遍历文件
               for (var i = 0; i < data.datas.length; i++) {
                   // 处理父级路径
                   var dataFpath = data.datas[i].filepath;
                   if (dataFpath == undefined || dataFpath == null || dataFpath == "" || dataFpath == "/") {
                       dataFpath = "/" + data.datas[i].fileName;
                   } else {
                       dataFpath = data.datas[i].filepath + "/" + data.datas[i].fileName;
                   }
                   //查询子集
                   if (data.datas[i].fileType == "folder") {
                       block += "<li ><label class='label-checkbox item-content'><div class='item-media' ><img src='../../res/fileicon/" + data.datas[i].fileType + "_56.png'  onerror='javascript:this.src=\"../../res/fileicon/qita_56.png\"'/></div><div class='item-inner'><div class='item-title'><a href='#' class='item-link' data=" + data.datas[i].upId + " other=" + data.datas[i].fileType + " fpath=" + dataFpath + " fid=" + data.datas[i].fid + ">" + data.datas[i].fileName + "</a></div><input type='checkbox' name='my-radio' value='" + data.datas[i].upId + "'><div class='item-media'><i class='icon icon-form-checkbox'></i></div></div></label></li>";
                       //预览
                   } else {
                       block += "<li ><label class='label-checkbox item-content'><div class='item-media' onclick='openfile(" + JSON.stringify(data.datas[i]) + ")'><img src='../../res/fileicon/" + data.datas[i].fileType + "_56.png'  onerror='javascript:this.src=\"../../res/fileicon/qita_56.png\"'/></div><div class='item-inner'><div class='item-title'><a onclick='openfile(" + JSON.stringify(data.datas[i]) + ")' class='item-link'>" + data.datas[i].fileName + "</a></div><input type='checkbox' name='my-radio' value='" + data.datas[i].upId + "'><div class='item-media'><i class='icon icon-form-checkbox'></i></div></div></label></li>";
                   }
               }
               //追加html   （分页）
               if (optype == 1) {
                   $("#filelist").append(block);
                   //总页数
                   pageCount = data.pageCount;
                   //隐藏分页
                   if (pageCount <= pageIndex) {
                       $("#loadMore").hide();
                   }
                   //替换html  （刷新，排序，搜索）
               } else {
                   $("#filelist").html(block);
                   //隐藏分页
                   if (data.pageCount <= pageIndex) {
                       $("#loadMore").hide();
                   }
               }
               $.hideIndicator(); //隐藏loading
               //如果查询的数据为空
           } else if (data.errorcode == 0 && data.datas.length <= 0) {
               if (optype == 2) {
                   if ((fid == 0 || fid == "0") && needOrg) {
                       $("#filelist").html("<li id='orgfile'><label class='label-checkbox item-content'><div class='item-media'><img src='../../res/fileicon/fenxiang_folder_56.png' /></div><div class='item-inner'><a class='item-link' fid=0><div class='item-title'>企业共享</div></a></div></label></li>");
                   } else {
                       $("#filelist").html(wenjiannull);
                   }
               }
               $("#loadMore").hide();
               $.hideIndicator(); //隐藏loading
           } else {
               $.hideIndicator(); //隐藏loading
               $("#loadMore").hide();
           }
           $("#filepage").html(pageIndex)
           $.hideIndicator(); //隐藏loading
       });
 }

 //**********************************************************************
 //打开文件列表是触发
 //**********************************************************************
 function ziliaoinit() {
     $.showIndicator();//loading
     $("#zhiliaoback").hide();
     var fid = 0;
     var fpath = "/"; // 文件父级路径 带自己名称的
     var fidorg=0;
     //分页
     var pageIndex=1;
     var pageIndexorg=1;
     var pageSize=20;
     var pageSizeorg=20;

     var pageCount=0;
     var pageCountorg = 0;

     //面包屑路径
     var path="";
     sysUserInfo=getUserInfo();
     getfilelist(0,'','','',2,pageSize,pageIndex,true);
     $.hideIndicator();//隐藏loading

    //文件名称筛选
     $('#searchFileName').keypress(function (e) { //这里给function一个事件参数命名为e，叫event也行，随意的，e就是IE窗口发生的事件。
         var key = e.which; //e.which是按键的值
         if (key == 13) {
             $.showIndicator();//loading
             pageSize=20;
             pageIndex=1;
             var fileName=$("#searchFileName").val();
             //如果在共享文件里
             if(intoOrg){
                 getorglist(2,"",fileName);
             }else{
                 getfilelist(0,3,"","desc",2,pageSize,pageIndex,false,fileName);
             }


         }
     });


     //多选框 选中事件
   $(document).on("click","#filelist input", function(){
         $("#SosoShow").hide();
          //如果选中个数为0，隐藏删除和重命名按钮
         var length = $("input[type='checkbox']:checked").length;
            //如果是选中状态
         if($(this).is(":checked")){
             $("#deleteblock").show();
         }else{
            if(length<=0){
                 $("#deleteblock").hide();
             }
         }
         //多选隐藏重命名
         if(length==1){
             $("#renamefile").show();
           $(".col-50").css("width","46%");
         }else{
             $("#renamefile").hide();
             $(".col-50").css("width","100%");
         }
   });
   //删除的单击事件
   $(document).on("click", "#deletefile", function () {
       var delId = "";
       $($("input[type='checkbox']:checked")).each(function () {
           delId += this.value + ',';    //遍历被选中CheckBox元素的集合 得到Value值
       });
       console.log("删除的id:" + delId);
       $.confirm("确认删除文件？", function () {
           $.showIndicator(); //loading
           //删除文件请求
           getAjax(javaserver + "/Kapi/delfile",
                 { userId: sysUserInfo.user_ID,
                     fileid: delId,
                     confirmdel: 1, //学员端删除关系
                     orgId: sysUserInfo.organization_ID
                 }, function (data) {
                     data = strToJson(data);
                     if (data.errorcode == 0) {
                         $.toast('删除成功！');
                         $("#deleteblock").hide();
                         if (fid == 0 || fid == undefined || fid === "") {
                             getfilelist(fid, "", "", "", 2, pageSize, pageIndex, true);
                         } else {
                             getfilelist(fid, "", "", "", 2, pageSize, 1);
                         }
                         return true;
                     } else if (data.errorcode == 34) {
                         $.toast('有关联数据！');
                         $("#deleteblock").hide();
                     } else {
                         $.toast('请求错误！');
                         $("#deleteblock").hide();
                         return false;
                     }
                 });
           $.hideIndicator();
       });
   });
     //重命名的单击事件
    $(document).on("click","#renamefile", function(){
         var fileId=$("input[type='checkbox']:checked").val();//修改的id
         var name=$("input[type='checkbox']:checked").prev().children().get(0).innerText;//原来的名称
         $.prompt('请输入文件的名字','', function (value) {
            if(name!=value){
                    //文件重命名请求
                   getAjax(javaserver+"/Kapi/UpFileName",
                   {upUserId:sysUserInfo.user_ID,
                   fileName:value,
                   upId:fileId,
                   fid:fid,
                   upOrgId:sysUserInfo.organization_ID},function(data){
                    data=strToJson(data);
                     if (data.errorcode==0) {
                         $.toast('修改成功！');
                         $("#deleteblock").hide();
                           if(fid==0||fid==undefined||fid===""){
                                   getfilelist(fid,"","","",2,pageSize,pageIndex,true);
                          }else{
                               getfilelist(fid,"","","",2,pageSize,1);
                          }
                          return true;
                      } else if (data.errorcode == 29) {
                          $("#deleteblock").hide();
                           $.toast('当前目录已存在此名称！');
                           return false;
                     }else{
                           $.toast('请求错误！');
                           $("#deleteblock").hide();
                           return true;
                     }

                     });
               }
           }, null, name);
    });
   var backId = "";
   var parentid = 0;
   //查询父级文件下的子文件
   $(document).on("click", "#filelist a", function () {
       $("#deleteblock").hide(); //隐藏上边删除和重命名按钮
       $.showIndicator(); //loading
       pageIndex = 1;
       pageSize = 20;
       parentid = $(this).attr("data");
       var type = $(this).attr("other");
       fpath = $(this).attr("fpath");
       fid = $(this).attr("fid"); //给全局变量fid赋值
       if (type == "folder") {
           //如果在企业文件夹下
           if (intoOrg) {
               getorglist(2, parentid); //查询企业共享文件夹下的文件
               $(".ios-is-show").hide();
               $("#zhiliaoadd").hide();//隐藏添加
               // $(".title").html($(this).html()); //改变title的名字
           } else {
               getfilelist(parentid, "", "", "", 2, pageSize, pageIndex);
               var filename=$(this).html();
               if(filename.length>12){
                   filename=filename.substr(0,12)+"...";
               }
               $(".title").html(filename); //改变title的名字
               if(browser.versions.ios){
                   $(".ios-is-show").show();
               }else{
                   $("#zhiliaoadd").show();
               }
           }
           $("#zhiliaoback").show(); //显示返回键
           $("#zhiliaoshuaxin").hide();//文件夹内隐藏刷新按钮
           $("#ios-create").removeClass("pull-left").addClass("pull-right");
       }
       $.hideIndicator();
   });
   $(document).on("click", "#zhiliaoshuaxin", function () {
          if(intoOrg){
              if(fid=="main"){
                  getorglist(2,"");
              }else{
                  getorglist(2,fid);
              }
          //普通查询
          }else{
            if(fid=="main")fid=0;
            if(fid==0||fid==""||fid==undefined||fid=="0"){
              getfilelist(fid,"","","",2,pageSize,1,true);
            }else{
              getfilelist(fid,"","","",2,pageSize,1);
            }
          }
           $.toast('刷新成功！');
            //$.pullToRefreshDone('.ziliao');
     });
   //返回上一级
   $(document).on("click", "#zhiliaoback", function () {
       $("#deleteblock").hide();
       $.showIndicator(); //loading
       var pid = "";
       //非企业文件夹返回
       if (!intoOrg&&fid!="main") {
           if (fid != 0 && fid != "0" && fid != null && fid != null && fid != undefined && fid != "share") {
               getAjax(javaserver + "/Kapi/findfileById", { upId: fid }, function (data) {
                   $.hideIndicator();
                   data = strToJson(data);
                   fid = data.data.fid; //返回上级时 ，上级（父级）的父级id  ——再次返回用
                   pid = data.data.upId; //返回上级时，上级（父级）的id  ——根据父id  查询文件
                   if(data.data.fileName.length>12){
                       $(".title").html(data.data.fileName.substr(0,12)+"...");
                   }else{
                       $(".title").html(data.data.fileName);
                   }

                    if (fid == "share" && intoOrg) {
                       $(".title").html("共享文件");
                       getorglist(2, ""); //查询企业共享文件夹下的文件
                       fid = 0;
                   } else if (fid == "main" && !intoOrg) {
                       intoOrg = false; //0层，保证绝对没有=在企业文件夹下
                       getfilelist(pid, "", "", "", 2, pageSize, 1, true);
                       $(".title").html("资料");
                       $("#zhiliaoback").hide();
                   } else if (fid != "share" && fid != 0 && fid != "0" && fid != "main" && intoOrg) {
                       getorglist(2, fid);
                       fid = 0;
                       $(".title").html("共享文件");
                   } else if ((fid == 0 || fid == "0") && intoOrg) {
                       $(".title").html("共享文件");
                       getorglist(2, ""); //查询企业共享文件夹下的文件
                       fid = "main";
                   }  else {
                       //如果是0层，需要显示出企业文件夹
                       if (pid == 0 || pid == "0" || pid == undefined||pid=="") {
                           $("#zhiliaoback").hide();
                           intoOrg = false; //0层，保证绝对没有=在企业文件夹下
                           getfilelist(pid, "", "", "", 2, pageSize, 1, true);
                           $(".title").html("资料");
                       } else {
                           $("#zhiliaoback").show();
                           $("#zhiliaoshuaxin").hide();//文件夹内隐藏刷新按钮
                           $("#ios-create").removeClass("pull-left").addClass("pull-right");
                           getfilelist(pid, "", "", "", 2, pageSize, 1);
                       }
                   }

                  // $.hideIndicator();
               });
           }else if(fid==0||fid=="0"){
                $("#zhiliaoback").hide();
                intoOrg = false; //0层，保证绝对没有=在企业文件夹下
                getfilelist(pid, "", "", "", 2, pageSize, 1, true);
                $(".title").html("资料");
           }
       }else{
            if (fid == "share" && intoOrg) {
                       $(".title").html("共享文件");
                       getorglist(2, ""); //查询企业共享文件夹下的文件
                       fid = 0;
                   } else if (fid == "main" && intoOrg) {
                       intoOrg = false; //0层，保证绝对没有=在企业文件夹下
                       getfilelist(pid, "", "", "", 2, pageSize, 1, true);
                       $(".title").html("资料");
                       $("#zhiliaoback").hide();
                   } else if (fid != "share" && fid != 0 && fid != "0" && fid != "main" && intoOrg) {
                       getorglist(2, fid);
                       fid = 0;
                       $(".title").html("共享文件");
                   } else if ((fid == 0 || fid == "0") && intoOrg) {
                       $(".title").html("共享文件");
                       getorglist(2, ""); //查询企业共享文件夹下的文件
                       fid = "main";
                   }  else {
                       //如果是0层，需要显示出企业文件夹
                       if (pid == 0 || pid == "0" || pid == undefined||pid=="") {
                           $("#zhiliaoback").hide();
                           intoOrg = false; //0层，保证绝对没有=在企业文件夹下
                           getfilelist(pid, "", "", "", 2, pageSize, 1, true);
                           $(".title").html("资料");
                       } else {
                           $("#zhiliaoback").show();
                           $("#zhiliaoshuaxin").hide();//文件夹内隐藏刷新按钮
                           $("#ios-create").removeClass("pull-left").addClass("pull-right");
                           getfilelist(pid, "", "", "", 2, pageSize, 1);
                       }
                   }
       }
        //如果在企业文件夹下，隐藏创建按钮
         if(intoOrg){
             if(browser.versions.ios){
                 $(".ios-is-show").hide();
             }else{
                 $("#zhiliaoadd").hide();
             }
         }else{
             if(browser.versions.ios){
                 $(".ios-is-show").show();
             }else{
                 $("#zhiliaoadd").show();
             }
         }
       $("#zhiliaoshuaxin").show();
       $("#ios-create").addClass("pull-left").removeClass("pull-right");
      $.hideIndicator();
   });

   //分页
   $(document).on('click', '#loadMore', function () {
       pageIndex=parseInt( $("#filepage").html())+1;
       getfilelist(fid,"","","",1,pageSize,pageIndex);
   });
   // 清除文件
   function clearFile() {
       if (document.getElementById('fileIosId').outerHTML) {
           document.getElementById('fileIosId').outerHTML = document.getElementById('fileIosId').outerHTML;
       } else { // FF(包括3.5)
           document.getElementById('fileIosId').val = "";
       }
       document.getElementById('fileIosId').select();
   }
   // ios 上传
   $(document).on('change','#fileIosId',function(){
       // 生成统一的文件id
       var file_id = guid();
       console.log("文件id"+file_id,"企业id"+ sysUserInfo.organization_ID,"用户id"+sysUserInfo.user_ID,"用户名称"+sysUserInfo.user_Name,"企业名称"+sysUserInfo.organization_Name,"staus:状态1","optype 1 2上传还是更新","state 2","fid"+fid,"fpath"+fpath);
      // $.toast("开始文件上传请不要离开！");
       var file=document.getElementById('fileIosId').files[0];//获取文件流
       var fileName = file.name; //获取文件名
       console.log(file);
       if ((file.size / 1024 / 1024) > 30) {
           alert("请您上传30M，以内的文件");
           clearFile();
           return;
       }
       var fileParams = {
           upid:file_id,
           orgid:sysUserInfo.organization_ID,
           stattus:2,
           fid:fid,
           fpath:fpath,
           username:sysUserInfo.user_Name,
           orgname:sysUserInfo.organization_Name,
           userid:sysUserInfo.user_ID,
           optype:1,
           state:2
       }
       // 请求业务服务器存储配置文件
       var formData = new FormData();
   	formData.append('upid', fileParams.upid);
   	formData.append('orgid', fileParams.orgid);
       $.showIndicator();
       var xhr = new XMLHttpRequest();
       //xhr.timeout = 10000;
       //http://192.168.1.148:8085/file/uploadCover

       xhr.open("POST", javaserver+"/Kapi/sendout",true);
       //xhr.setRequestHeader("Content-Length",file.size);
       xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded;");  //用POST的时候一定要有这句
       //侦查当前附件上传情况
       xhr.upload.onprogress = function (evt) {
         // event.total是需要传输的总字节，event.loaded是已经传输的字节。如果event.lengthComputable不为真，则event.total等于0
         if (evt.lengthComputable) {//
           var loaded = evt.loaded;
           var tot = evt.total;
           var per =  Math.round(evt.loaded / evt.total * 100) + "%";  //已经上传的百分比

           console.log(loaded+','+tot);
           if(per == 100)
           {
               $("#uploadprogress").hide();
           }
           else {
              //$.toast('上传进度：'+per);
               $("#uploadprogress").show().text('上传进度：'+per+'%');
           }
         }
       }

       xhr.onreadystatechange = function (e) {
           if (xhr.readyState == 4 && xhr.status == 200) {
             $("#uploadprogress").hide();
               var resServer = strToJson(xhr.responseText);
               // 请求文件服务器
               if(resServer.errorcode == 0){
                   var fdFile = new FormData();
                   fdFile.append("file",document.getElementById('fileIosId').files[0]);
                   fdFile.append("orgid",fileParams.orgid);
                   fdFile.append("userid",fileParams.userid);
                   fdFile.append("upid",fileParams.upid);
                   fdFile.append("status",2);
                   fdFile.append("fid",fileParams.fid);
                   fdFile.append("fpath",fileParams.fpath);
                   fdFile.append("username",fileParams.username);
                   fdFile.append("orgname",fileParams.orgname);
                   fdFile.append("optype",1)
                   fdFile.append("state",2)
                   fileParams.file =  document.getElementById('fileIosId').files[0];

                  /**
                   var xhr2 = new XMLHttpRequest();
                   //xhr.timeout = 10000;
                   //http://192.168.1.148:8085/file/uploadCover

                   xhr2.open("POST", javafile+"/Md5File/fileUpload",true);
                   xhr2.timeout = 10000;
                   //xhr.setRequestHeader("Content-Length",file.size);
                   xhr2.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=UTF-8");  //用POST的时候一定要有这句
                  $("#uploadprogress").show();
                   //侦查当前附件上传情况
                   xhr2.upload.onprogress = function (evt) {
                     if (evt.lengthComputable) {//
                       var loaded = evt.loaded;
                       var tot = evt.total;
                       var per =  Math.round(evt.loaded / evt.total * 100) + "%";  //已经上传的百分比

                       console.log(loaded+','+tot);
                       if(per == 100)
                       {
                           $("#uploadprogress").hide();
                       }
                       else {
                          $.toast('上传进度：'+per);
                           $("#uploadprogress").text('上传进度：'+per);
                       }
                     }
                   }
                   xhr2.onerror =  function(evt)
                   {
                     console.log(JSON.stringify(evt));
                   }
                   xhr2.onreadystatechange = function(evt){
                       console.log(JSON.stringify(evt));
                     if (xhr.readyState == 4 && xhr.status == 200) {
                       $.toast('上传成功！');
                       // 重新获取一下文件
                       if(fid == 0 || fid == "0"){
                           getfilelist(fid,"","","desc","",20,1,true,"");
                       }else{
                           getfilelist(fid,"","","desc","",20,1,false,"");
                       }

                       clearFile();
                      // $.router.reloadPage();
                     }
                     else {
                        $.toast('上传失败！');
                        console.log(JSON.stringify(evt));
                     }
                   };

                   xhr2.send(fdFile);
                   **/
                   $.ajax({
                       type: "post",
                         url: javafile+"/Md5File/fileUpload",
                         data: fdFile,
                         contentType:'application/x-www-form-urlencoded; charset=UTF-8',
                         cache: false,
                         processData: false,
                         contentType: false,
                         success: function (msg, status, xhr) {
                          console.log(strToJson(msg));
                           $.toast('上传成功！');
                           // 重新获取一下文件
                           if(fid == 0 || fid == "0"){
                               getfilelist(fid,"","","desc","",20,1,true,"");
                           }else{
                               getfilelist(fid,"","","desc","",20,1,false,"");
                           }

                           clearFile();

                         }});

               }

           }
       }

       //增加token
       var token = "userinfo_token is none";
       token = strToJson(GetlocalStorage("userinfo_token"),token);
       xhr.setRequestHeader("X-Session-Token", token);

       xhr.send(formData);



   });
   var intoOrg = false;
   //是否进入了企业文件夹
     //企业文件夹的单击事件
   $(document).on('click', '#orgfile', function () {
       intoOrg = true;
       $(".title").html("共享文件");
       $('.ios-is-show').hide();
       $("#zhiliaoadd").hide();//隐藏添加
       $("#zhiliaoback").show();
       $("#zhiliaoshuaxin").hide();//文件夹内隐藏刷新按钮
       $("#ios-create").removeClass("pull-left").addClass("pull-right");
       fid = "main";
       getorglist(2, ""); //fid等于null，查询企业共享文件，不等于null，查询文件夹下的文件
   });
   //企业文件的分页下拉
   $(document).on('infinite', '#orgfile',function() {
         setTimeout(function() {
          pageIndexorg=pageIndexorg+1;
          //当前页小于总页数
          if(pageIndexorg<=pageCountorg){
                 //触发向下滚动，查询新数据
                getorglist(2,"");
         }
         }, 1000);
   });
   function getorglist(optype,filefid,name){
        $.showIndicator();//loading
         //文件缺省图
         var wenjiannull="<dl style='height:100%;width:100%;position: absolute;margin-top: 25%;color:#cecece;'><dd style='text-align:center;margin:0'><img src='../../res/img/filenull.png' style='width: 50%;'></dd><dt style='text-align: center;'>暂无数据</dt></dl>";
         //获取共享文件
         getAjax(javaserver + "/Kapi/getSharelist",
             { userid: sysUserInfo.user_ID,
                 searchText:name,
                 fid: filefid,
                 orgid: sysUserInfo.organization_ID,
                 xid: sysUserInfo.allorgid + sysUserInfo.allroleid + sysUserInfo.allgroupid + sysUserInfo.user_ID, //权限id
                 pageSize: pageSizeorg,
                 pageIndex: pageIndexorg
             }, function (data) {
                 $.hideIndicator();
                 data = strToJson(data);
                 if (data.errorcode == 0 && data.datas != null&&data.datas.length>0) {
                     var block = "";
                     //遍历文件
                     for (var i = 0; i < data.datas.length; i++) {
                         //查询子集
                         if (data.datas[i].fileType == "folder") {
                             if (fid == "main" ) {
                                 block += "<li ><label class='label-checkbox item-content'><div class='item-media'><img src='../../res/fileicon/" + data.datas[i].fileType + "_56.png'  onerror='javascript:this.src=\"../../res/fileicon/qita_56.png\"'/></div><div class='item-inner'><div class='item-title'><a href='#' class='item-link' data=" + data.datas[i].upId + " other=" + data.datas[i].fileType + " fid=share>" + data.datas[i].fileName + "</a></div></div></label></li>";
                             } else {
                                 block += "<li ><label class='label-checkbox item-content'><div class='item-media'><img src='../../res/fileicon/" + data.datas[i].fileType + "_56.png'  onerror='javascript:this.src=\"../../res/fileicon/qita_56.png\"'/></div><div class='item-inner'><div class='item-title'><a href='#' class='item-link' data=" + data.datas[i].upId + " other=" + data.datas[i].fileType + " fid=" + data.datas[i].fid  + ">" + data.datas[i].fileName + "</a></div></div></label></li>";
                             }

                             //预览
                         } else {
                             block += "<li ><label class='label-checkbox item-content'><div class='item-media' onclick='openfile(" + JSON.stringify(data.datas[i]) + ")'><img src='../../res/fileicon/" + data.datas[i].fileType + "_56.png'  onerror='javascript:this.src=\"../../res/fileicon/qita_56.png\"'/></div><div class='item-inner'><div class='item-title'><a onclick='openfile(" + JSON.stringify(data.datas[i]) + ")' class='item-link'>" + data.datas[i].fileName + "</a></div></div></label></li>";
                         }
                     }
                     if (optype == 1) {
                         $("#filelist").append(block);
                         //总页数
                         pageCountorg = data.pageCount;
                         //隐藏分页
                         if (pageCount <= pageIndex) {
                             $(".infinite-scroll-preloader").remove();
                         }
                     } else {
                         $("#filelist").html(block);
                         //隐藏分页
                         if (data.numCount <= pageSize) {
                             $(".infinite-scroll-preloader").remove();
                         }
                     }
                     //没有共享文件
                 } else if (data.errorcode == 32 || (data.errorcode == 0 && data.datas.length <= 0)) {
                     $("#filelist").html(wenjiannull);
                     $(".infinite-scroll-preloader").remove();
                 }
             });
       }
       //排序
       $(document).on('click','#wenjian_paixu', function () {
         var buttons1 = [
           {
             text: '按文件名升序',
             onClick: function() {
             if(fid==0||fid==undefined||fid==""){
                   getfilelist(fid,1,"","",2,pageSize,pageIndex,true);
             }else{
                   getfilelist(fid,1,"","",2,pageSize,pageIndex);
             }
             }
           },
           {
             text: '按文件名降序',
             onClick: function() {
             if(fid==0||fid==undefined||fid==""){
                   getfilelist(fid,1,"","desc",2,pageSize,pageIndex,true);
             }else{
                   getfilelist(fid,1,"","desc",2,pageSize,pageIndex);
             }

             }
           },
           {
             text: '按文件上传时间倒序',
             onClick: function(){
                if(fid==0||fid==undefined||fid==""){
                   getfilelist(fid,3,"","desc",2,pageSize,pageIndex,true);
                }else{
                   getfilelist(fid,3,"","desc",2,pageSize,pageIndex);
                }
             }
           },
           {
             text: '按文件大小倒序',
             onClick: function() {
                if(fid==0||fid==undefined||fid==""){
                   getfilelist(fid,4,"","desc",2,pageSize,pageIndex,true);
                }else{
                   getfilelist(fid,4,"","desc",2,pageSize,pageIndex)
                }
             }
           }
         ];
         var buttons2 = [
           {
             text: '取消',
             bg: 'danger'
           }
         ];
         var groups = [buttons1, buttons2];
         $.actions(groups);
     });
     //***********************************************************************************************
     //                                      操作表
     //***********************************************************************************************
     $(document).on('click','#ios-create',function(){
            $.prompt('请输入文件夹的名字','', function (value) {
                      addfolder(value,parentid);
                 },null,'新建文件夹');
             $(".modal-inner input").attr("placeholder","新建文件夹");
     			if($(".modal-inner input").val()=="新建文件夹"){
     				$(".modal-inner input").val("");
     			}
     });

     $(document).on('click','#zhiliaoadd', function () {
         var buttons1 = [
           {
             text: '上传文件',
             bold: true,
             color: 'danger',
             onClick: function () {
               //上传文件************************************************
                 $("#fileIosId").click();
             }
           },
           {
             text: '创建文件夹',
             onClick: function() {
                 $.prompt('请输入文件夹的名字','', function (value) {
                    addfolder(value,parentid);
               },null,'新建文件夹');
               $(".modal-inner input").attr("placeholder","新建文件夹");
               if($(".modal-inner input").val()=="新建文件夹"){
                 $(".modal-inner input").val("");
               }
             }
           }
         ];
         var buttons2 = [
           {
             text: '取消',
             bg: 'danger'
           }
         ];
         var groups = [buttons1, buttons2];
         $.actions(groups);
     });

     //标签筛选
     $(document).on('click', '.biaoqian li', function () {
         $.showIndicator(); //loading
         var pageIndex = 1;
         var pageSize = 20;
         var tag = $(this).children(".ng-binding").get(0).attributes.data.nodeValue;
         var color = $(this).get(0).innerText;
         console.log("当前选中颜色" + color);
         //移除遮盖层
         $(".modal-in").removeClass("modal-in");
         $(".popup-tag").addClass("modal-out");
         $(".modal-overlay-visible").remove();
         var lable_block = "";
         if (tag == "01c9cfcb-ffec-4778-be6f-31e633czo33a") {
             lable_block = "hongse";
         } else if (tag == "01c9cfcb-ffec-4778-abcd-31e6321zo33b") {
             lable_block = "chengse";
         } else if (tag == "01c9cfcb-ffec-3208-abcd-31e633czo33c") {
             lable_block = "huangsese";
         } else if (tag == "01c1259cb-ffec-4778-abcd-31e633czo33d") {
             lable_block = "lvse";
         } else if (tag == "05bae156-9d94-482b-a120-86e694e40abe") {
             lable_block = "lanse";
         } else if (tag == "078cbeeb-f78f-312e-9de0-9efe1ee766af") {
             lable_block = "zise";
         } else if (tag == "08283666-15b4-4135-b0aa-3ecfdeed6e7g") {
             lable_block = "huise";
         } else if (tag == "0") {
             lable_block = "toumingquanbu";
         } else {
             $("#lable_color").html("<i class='iconfont icon-xueyuanpinglun'></i> 标签");
             //查询方法
             getfilelist(0, "", "", "", 2, pageSize, pageIndex, true);
         }
         if (lable_block != null && lable_block != "") {
             //$("#lable_color").html("<div style='height:30px;width:100%;display: block;clear: both;'><div class='knowledgebiaoqianyuan'><svg class='icon' aria-hidden='true'><use xmlns:xlink='http://www.w3.org/1999/xlink' xlink:href='#icon-biaoqian" + lable_block + "'></use></svg><div title='" + color + "' class='ng-binding' data='" + tag + "'>" + color + "</div></div></div> ");
             $("#lable_color").html("<svg style='height:30px;width:30px;vertical-align: middle;' aria-hidden='true'><use xmlns:xlink='http://www.w3.org/1999/xlink' xlink:href='#icon-biaoqian" + lable_block + "'></use></svg> " + color);
             //查询方法
             getfilelist("", "", tag, "", 2, pageSize, pageIndex, false);
         }
         $.hideIndicator();
     });
     //***********************************************************************************
     //                               人员资料
     //***********************************************************************************
     $(document).on('click','.left-alert-text', function () {
         $.alert("暂未开放 敬请期待","提示");
     });
     //***********************************************************************************
     //                               添加文件夹
     //***********************************************************************************
     function addfolder(value,thisfid){
         $.showIndicator();//loading
         sysUserInfo=getUserInfo();
         //创建文件夹
         getAjax(javaserver + "/Kapi/CreateFolder",
             {
                 upUserId: sysUserInfo.user_ID,
                 fid: thisfid,
                 upOrgId: sysUserInfo.organization_ID,
                 fileName: value,
                 filepath: fpath != null && fpath ? fpath : "/",
                 userName: sysUserInfo.user_Name
             }, function (data) {
                 $.hideIndicator();

                 data = strToJson(data);
                 if(data.errorcode == "0"){
                   // 处理父级路径
                   var dataFpath = data.data.filepath;
                   if (dataFpath == undefined || dataFpath == null || dataFpath == "" || dataFpath == "/") {
                       dataFpath = "/" + data.data.fileName;
                   } else {
                       dataFpath = data.data.filepath + "/" + data.data.fileName;
                   }
                     $("#filelist").append("<li><label class='label-checkbox item-content'><div class='item-media'><img src='../../res/fileicon/folder_56.png'  onerror='javascript:this.src=\"../../res/fileicon/qita_56.png\"'/></div><div class='item-inner'><div class='item-title'><a href='#' class='item-link' data=" + data.data.upId + " fpath=" + dataFpath + " other=folder fid=" + data.data.fid + ">" + data.data.fileName + "</a></div><input type='checkbox' name='my-radio' value='" + data.data.upId + "'><div class='item-media'><i class='icon icon-form-checkbox'></i></div></div></label></li>");
                     $.toast('创建成功！');
                 } else if (data.errorcode == 29) {
                     $.toast('已存在同名文件！');
                 } else {
                     $.toast('请求错误！'+data.errormsg);
                 }
             }, function () {
                 $.hideIndicator();
                 $.toast('请求错误！');
             });
     }

 };
 // ziliaoinit方法体结束
 // 生成uuid
 function guid() {
     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
         var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
         return v.toString(16);
     });
 }

 function openTag() {
   var taglist = "";
   taglist+=("<div class=\'popup popup-tag\'>");
      taglist+=("      <header class=\'bar bar-nav\'>");
      taglist+=("        <span class=\'pull-right\' ><i class=\'icon iconfont icon-wrong close-popup\' onclick=\"\"></i></span>");
      taglist+=("        <h1 class=\'title\'>请选择筛选标签</h1>");
      taglist+=("      </header>");
      taglist+=("      <div class=\'content\'>");
      taglist+=("      <ul class=\'biaoqian\'>");
      taglist+=("                  <li  >");
      taglist+=("                            <div class=\'knowledgebiaoqianyuan\'>");
      taglist+=("                                <svg class=\'icon\' aria-hidden=\'true\' ><use xmlns:xlink=\'http://www.w3.org/1999/xlink\' xlink:href=\'#icon-biaoqianhongse\'></use></svg>");
      taglist+=("                                </div>");
      taglist+=("                                <div  title=\'红色\' class=\'ng-binding\' data=\'01c9cfcb-ffec-4778-be6f-31e633czo33a\'>红色</div>");
      taglist+=("                                <div class=\'biaoqianname\'>");
      taglist+=("                                    <!--<svg class=\'icon\' aria-hidden=\'true\'><use xmlns:xlink=\'http://www.w3.org/1999/xlink\' xlink:href=\'#icon-zhongmingming\'></use></svg>");
      taglist+=("                                        重命名</span>-->");
      taglist+=("                                </div  >");
      taglist+=("                        </li>");
      taglist+=("                  <li  >");
      taglist+=("                            <div class=\'knowledgebiaoqianyuan\'>");
      taglist+=("                                <svg class=\'icon\' aria-hidden=\'true\' ><use xmlns:xlink=\'http://www.w3.org/1999/xlink\' xlink:href=\'#icon-biaoqianchengse\'></use></svg>");
      taglist+=("");
      taglist+=("                            </div>");
      taglist+=("                            <div title=\'橙色\'  class=\'ng-binding\' data=\'01c9cfcb-ffec-4778-abcd-31e6321zo33b\'>橙色</div>");
      taglist+=("                            <div class=\'biaoqianname\'>");
      taglist+=("                                </div>");
      taglist+=("                        </li><li  >");
      taglist+=("                            <div class=\'knowledgebiaoqianyuan\'>");
      taglist+=("                                <svg class=\'icon\' aria-hidden=\'true\' ><use xmlns:xlink=\'http://www.w3.org/1999/xlink\' xlink:href=\'#icon-biaoqianhuangsese\'></use></svg>");
      taglist+=("");
      taglist+=("                            </div>");
      taglist+=("                            <div title=\'黄色\' class=\'ng-binding\' data=\'01c9cfcb-ffec-3208-abcd-31e633czo33c\'>黄色</div>");
      taglist+=("                            <div class=\'biaoqianname\'>");
      taglist+=("");
      taglist+=("                                </div>");
      taglist+=("");
      taglist+=("                        </li><li  >");
      taglist+=("                            <div class=\'knowledgebiaoqianyuan\'>");
      taglist+=("                                <svg class=\'icon\' aria-hidden=\'true\'><use xmlns:xlink=\'http://www.w3.org/1999/xlink\' xlink:href=\'#icon-biaoqianlvse\'></use></svg>");
      taglist+=("                            </div>");
      taglist+=("                            <div  title=\'绿色\'  class=\'ng-binding\' data=\'01c1259cb-ffec-4778-abcd-31e633czo33d\'>绿色</div>");
      taglist+=("                            <div class=\'biaoqianname\'>");
      taglist+=("");
      taglist+=("                                <span >");
      taglist+=("                                    <!--<svg class=\'icon\' aria-hidden=\'true\'><use xmlns:xlink=\'http://www.w3.org/1999/xlink\' xlink:href=\'#icon-zhongmingming\'></use></svg>");
      taglist+=("                                    重命名</span>--></div>");
      taglist+=("");
      taglist+=("                        </li><li >");
      taglist+=("                            <div class=\'knowledgebiaoqianyuan\'>");
      taglist+=("                                <svg class=\'icon\' aria-hidden=\'true\' ><use xmlns:xlink=\'http://www.w3.org/1999/xlink\' xlink:href=\'#icon-biaoqianlanse\'></use></svg>");
      taglist+=("                            </div>");
      taglist+=("                            <div  title=\'蓝色\' class=\'ng-binding\' data=\'05bae156-9d94-482b-a120-86e694e40abe\'>蓝色</div>");
      taglist+=("                            <div class=\'biaoqianname\'>");
      taglist+=("");
      taglist+=("                                </div>");
      taglist+=("");
      taglist+=("                        </li><li >");
      taglist+=("                            <div class=\'knowledgebiaoqianyuan\'>");
      taglist+=("                                <svg class=\'icon\' aria-hidden=\'true\' ><use xmlns:xlink=\'http://www.w3.org/1999/xlink\' xlink:href=\'#icon-biaoqianzise\'></use></svg>");
      taglist+=("                            </div>");
      taglist+=("                            <div title=\'紫色\'  class=\'ng-binding\' data=\'078cbeeb-f78f-312e-9de0-9efe1ee766af\'>紫色</div>");
      taglist+=("                            <div class=\'biaoqianname\'>");
      taglist+=("");
      taglist+=("                                </div>");
      taglist+=("");
      taglist+=("                        </li><li >");
      taglist+=("                            <div class=\'knowledgebiaoqianyuan\'>");
      taglist+=("                                <svg class=\'icon\' aria-hidden=\'true\' ><use xmlns:xlink=\'http://www.w3.org/1999/xlink\' xlink:href=\'#icon-biaoqianhuise\'></use></svg>");
      taglist+=("                            </div>");
      taglist+=("                            <div title=\'灰色\' class=\'ng-binding\' data=\'08283666-15b4-4135-b0aa-3ecfdeed6e7g\'>灰色</div>");
      taglist+=("                            <div class=\'biaoqianname\'>");
      taglist+=("");
      taglist+=("                                </div>");
      taglist+=("");
      taglist+=("                        </li>");
      taglist+=("                        <li >");
      taglist+=("                            <div class=\'knowledgebiaoqianyuan\'>");
      taglist+=("                                <svg class=\'icon\' aria-hidden=\'true\' ><use xmlns:xlink=\'http://www.w3.org/1999/xlink\' xlink:href=\'#icon-biaoqiantoumingquanbu\'></use></svg>");
      taglist+=("                            </div>");
      taglist+=("                            <div title=\'全部\' class=\'ng-binding\' data=\'0\'>全部标签</div>");
      taglist+=("                        </li>");
      taglist+=("                        <li>");
      taglist+=("                            <div class=\'knowledgebiaoqianyuan\'>");
      taglist+=("                                <svg class=\'icon\' aria-hidden=\'true\'>");
      taglist+=("                                    <use xlink:href=\'#icon-guanbi\'></use>");
      taglist+=("                                </svg>");
      taglist+=("                            </div>");
      taglist+=("                            <div title=\'取消\' class=\'ng-binding\' data=\'1\'>取消筛选</div>");
      taglist+=("                        </li>");
      taglist+=("         </ul>");
      taglist+=("      </div>");
      taglist+=("  </div>");
      taglist+=("");
     $.popup(taglist);
     $(".popup-tag").css("display","block");
     sysUserInfo = getUserInfo();
     var tagId = "";
     //请求个人标签
     getAjax(javaserver + "/Kapi/gettaglist",
       { userid: sysUserInfo.user_ID, orgid: sysUserInfo.organization_ID }, function (data) {
           data = strToJson(data);
           if (data.errorcode == 0 && data.datas.length > 0) {

               //处理查询的标签与原来的标签绑定事件
               //外层遍历已查询到的标签
               for (var i = 0; i < data.datas.length; i++) {
                   //内层遍历赋值
                   $($(".biaoqian .ng-binding")).each(function () {
                       tagId = $(this).attr("data");   //遍历被选中CheckBox元素的集合 得到Value值
                       //把比对上tagid的名称替换成查询出来的名称
                       if (data.datas[i].tagid == tagId) {
                           //data.datas[i].tagname
                           $(this).get(0).innerText = data.datas[i].tagname;
                       }
                   });
               }
           } else if (data.errorcode == 0 && data.datas.length <= 0) {
               //直接放过
               console.log("进入");
           } else {
               $.toast('请求错误！');
           }
       });
 };

 //***********************************************************************************//
                               //文件上传开始
 //***********************************************************************************
 //fileOnload("资料");

 function fileOnload(title, fid, fpath) {
     $('#popup-file-close').attr('onClick', 'closeFilePanel("' + title + '")');
     $('.title').html("上传文件列表");
     $.popup('.popup-file');
     if(fid == undefined || fid == null || fid == "")
     fid =0;
     if(fpath == undefined || fpath == null || fpath == "")
     fpath = "/";
     fileInit(fid,fpath); // 文件上传初始化
     console.log("hello file");

 }
 /*******************************文件搜索*********************************************/
 function showSoInupt(index){
     //显示搜索框
     if(index==1){
          $("#SosoShow").show();
          $("#searchFileName").focus();
     }else{
          $("#SosoShow").hide();
          getfilelist(0, "", "", "", 2, 20,1, true);
     }
 }
