
//**********************************************************************
//问答界面初始
//**********************************************************************
var knowledgeId = "";
var fileObj = {};
$(document).on("pageInit", "#interlocution", function (e, id, $page) {
  sysUserInfo = getUserInfo();
    getSpectailColnum(1)
    get_SP_KnowledgeList();
    fileObj = {};
    //搜索框查询
    $('#interlocutionTxt').keypress(function (e) { //这里给function一个事件参数命名为e，叫event也行，随意的，e就是IE窗口发生的事件。
        var key = e.which; //e.which是按键的值
        if (key == 13) {
        //  alert('x');
            e.preventDefault();
            specialColnum = strToJson(GetlocalStorage("SpectailColnum"));
            getInterlocution(1,specialColnum,1);
        }
    });
});

//请求列表
function getSpectailColnum(optype) {
    $.showIndicator(); //loading
    var pageIndex = parseInt($("#SpectailColnumIndex").html());

    //默认登录进来就请求任务列表
    //请求所有任务
    getAjax(javaserver + "/specialColumn/findStuSclist",
            { knowledgeid: knowledgeId,
                orderby: 1,
                type: 1,
                orgid: sysUserInfo.organization_ID,
                userid: sysUserInfo.user_ID,
                searchTxt: $("#SpectailColnumTxt").val(),
                pageSize: 10,
                pageIndex: pageIndex
            },
            function (data) {
                data = strToJson(data);
                if (data.errorcode == 0 && data.numCount > 0 && data.datas.length > 0) {

                    //荣誉列表
                    var renwu = "";
                    for (var i = 0; i < data.datas.length; i++) {
                      //  renwu += "<div class='card' onclick='openSpectailColnum(" + JSON.stringify(data.datas[i]) + ")' >"
                      //  renwu += "<div class='card-content'>"
                      //  renwu += "<div class='list-block media-list'>"
                    //    renwu += " <ul>"
                      //  renwu += "  <li class='item-content'>"
                      //  renwu += "     <div class='item-inner'>"
                      //  renwu += "          <div class='item-title-row'>"
                      //  renwu += "         <div class='item-title'>" + data.datas[i].columnName + "</div>"
                      //  renwu += "        </div>"
                      //  renwu += "         <div class='item-subtitle' style='white-space: inherit;color: #999;'>" + data.datas[i].columnDesc + "</div>"
                    //    renwu += "       </div>"
                    //    renwu += "    </li>"
                    //    renwu += "     </ul>"
                    //    renwu += "  </div>"
                    //    renwu += " </div>"
                    //    renwu += " <div class='card-footer' style='border-bottom: 1px solid #e1e1e1; border-top:0px;'>"
                    //    renwu += "    <span><i class='iconfont'>&#xe6fd;</i>" + data.datas[i].CreateDate + "</span>"
                    //    renwu += "    <span><i class='iconfont'>&#xe69b;</i> " + data.datas[i].answerCount + " 问题</span>"
                    //    renwu += "  </div>"
                    //    renwu += "</div>"
                        active ="";
                        if(i==0)
                        {
                          active = "active";
                          getlanmu(data.datas[i]);
                        }
                        renwu+="<a href=\"#tab"+i+"\"  id=\"tab"+data.datas[i].columnId+"\" class=\"tab-link "+active+" button\" onclick=\'getlanmu(" + JSON.stringify(data.datas[i]) + ")\'>" + data.datas[i].columnName + "</a>";
                    }
                    //给页面附上列表
                    if (optype == 1) {
                        $("#zhuanlantab").html(renwu);
                    } else {
                        $("#zhuanlantab").append(renwu);
                    }
                  //  if (pageIndex >= data.pageCount) {
                        $("#SpectailColnumLoadMore").hide();
                  //  } else {
                  //      $("#SpectailColnumLoadMore").show();
                  //  }
                } else if (data.errorcode == 0 && (data.numCount == 0 || data.datas.length <= 0)) {
                    if (pageIndex == 1) {
                        $("#SpectailColnum .list-block").html("<br /><br /><br /><center style='color:#999;font-size:14px;'>暂无数据</center>");
                    }
                    $("#SpectailColnumLoadMore").hide();
                }
                $("#SpectailColnumIndex").html(pageIndex);
                $.hideIndicator();
            });
        }
function getlanmu(obj){
  //alert(obj);
  $(".tab-link").removeClass("active");
  obj = strToJson(obj);
  $("#tab"+obj.columnId).addClass("active");
  obj.xtype = 4;//专栏
  obj.xid = obj.columnId;
  obj.xname = obj.columnName;
  SetlocalStorage("SpectailColnum", JSON.stringify(obj));
  getInterlocution(1,obj,parseInt($("#SpectailColnumIndex").html()));
}
/**************************************************知识分类开始*********************************************************************/
var knowParam ={
    userId: sysUserInfo.user_ID,
  //  powerLV: sysUserInfo.powerLV,
    knowledge_Id: "", //父级id
    orgId: sysUserInfo.organization_ID
};;
//获取知识架构列表
function get_SP_KnowledgeList() {
  //查询知识架构的参数

      knowParam.userId=sysUserInfo.user_ID,
      knowParam.orgId=sysUserInfo.organization_ID

  //alert(JSON.stringify(knowParam));
    getAjax(javaserver + "/knowledge/findKnowledgeList", knowParam
    , function (data) {
      //  alert(JSON.stringify(data));

        data = strToJson(data);
        if (data.errorcode == "0") {
            var block = "";
            for (i = 0; i < data.datas.length; i++) {
                block += "<li><a href='#' class='list-button item-link close-popover' data-popover='#knowledgeSort'  onClick='setParentId(" + JSON.stringify(data.datas[i]) + ")'>" + data.datas[i].knowledge_Name + "</a></li>";
            }
            if (block.length <= 0) {
                block = "<li><a href='#' class='list-button item-link close-popover' data-popover='#knowledgeSort' >暂无数据</a></li>";
            }
            $("#knowledgeSort ul").html(block);
        } else {
            $.toast('查询失败！');
        }
    });
}

var clickList = [];
//选择知识分类
function setParentId(obj) {
    clickList.push(obj);
    //点击全部分类
    if (obj == undefined) {
        knowParam.knowledge_Id = "";
        clickList = [];
        knowledgeId = "";
    } else {
        obj.sortindex = clickList.length;
        knowParam.knowledge_Id = obj.knowledge_Id;
        knowledgeId = obj.knowledge_Id;
    }
    updateStyle();
    get_SP_KnowledgeList();
    getSpectailColnum(1)
}
//选择其中一个
function backKnow(item) {
    if (item == undefined) {
        knowParam.knowledge_Id = "";
        clickList = [];
        knowledgeId = "";
    } else {
        knowParam.knowledge_Id = item.knowledge_Id;
        clickList.forEach(function (data, index) {
            if (index >= item.sortindex) {
                clickList.splice(index, 1);
            }
        });
        knowledgeId = item.knowledge_Id;
    }
    updateStyle();
    get_SP_KnowledgeList();
    getSpectailColnum(1);
    $.closeModal();
}
//修改选择分类后的样式
function updateStyle() {

    block = "";
    for (i = 0; i < clickList.length; i++) {
        block += (i == 0 ? "" : ">") + "<span style='font-size:16px;margin: 0 5px;' onclick='backKnow(" + JSON.stringify(clickList[i]) + ")' > " + clickList[i].knowledge_Name + " </span> ";
    }
    $(".sp_knowname").html(block);
}
/*********************************************知识分类结束********************************************/
//跳转问答页面
function openSpectailColnum(obj) {
    obj.xtype = 4;//专栏
    obj.xid = obj.columnId;
    obj.xname = obj.columnName;
    SetlocalStorage("SpectailColnum", JSON.stringify(obj));
    $.router.loadPage(api.wgtRootDir+"/html/interlocution/interlocution.html");
}

//**********************************************************************
//进入专栏后的问答列表页面
//**********************************************************************
var specialColnum = null;
$(document).on("pageInit", "#sp_interlocution", function (e, id, $page) {
    sysUserInfo = getUserInfo();
    //获取需要查询的专栏
    specialColnum = strToJson(GetlocalStorage("SpectailColnum"));

  //  console.log('专栏：'+JSON.stringify(specialColnum));
    if (specialColnum.xname != undefined && specialColnum.xname != null && specialColnum.xname.length > 0) {
        if(specialColnum.xname.length > 10)
        {
            $("#sp_interlocution .title").html(specialColnum.xname.substring(0,10)+'...');
        }
        else {
          $("#sp_interlocution .title").html(specialColnum.xname);
        }

    }
    //专栏查询加入状态
    if (specialColnum != undefined && specialColnum != null && specialColnum.xtype == 4) {
        getState();
    }
    isJoinColumn();

    //搜索框查询
    $('#interlocutionTxt').keypress(function (e) { //这里给function一个事件参数命名为e，叫event也行，随意的，e就是IE窗口发生的事件。
        var key = e.which; //e.which是按键的值
        if (key == 13) {
        //  alert('x');
            e.preventDefault();
            getInterlocution(1,specialColnum,1);
        }
    });
});
//请求列表
function getInterlocution(optype,obj,index) {
    sysUserInfo = getUserInfo();
    $.showIndicator(); //loading
  //  var pageIndex = (index!=null&&index != undefined)?index:parseInt($("#interlocutionIndex").html());
    sysUserInfo = getUserInfo(); //用户信息
    var canshu =   {
      columnid: obj.xid,
          orderby: 1,
          type: 1,
          xtype:obj.xtype,
          orgid: sysUserInfo.organization_ID,
          userid: sysUserInfo.user_ID,
          powerLV: sysUserInfo.powerLV,
          searchTxt: $("#interlocutionTxt").val(),
          pageSize: 20,
          pageIndex: index
      };
    //alert(JSON.stringify(canshu));
    //默认登录进来就请求任务列表
    //alert(JSON.stringify(javafile));
    //请求所有任务
    getAjax(javaserver + "/interlocution/findQuestionList",
        canshu  ,
            function (data) {

                data = strToJson(data);
                if (data.errorcode == 0 && data.numCount > 0 && data.datas.length > 0) {

                    //问答列表
                    var renwu = "";
                    for (var i = 0; i < data.datas.length; i++) {
                      //console.log(JSON.stringify(data.datas[i]));
                      if(data.datas[i].state == 2 || data.datas[i].questionerId == sysUserInfo.user_ID){
                        renwu += "<div class='card' onclick=\"openInterlocutionss('" + data.datas[i].qaid+ "')\">"
                        renwu += "<div class='card-content'>"
                        renwu += "<div class='list-block media-list'>"
                        renwu += " <ul>"
                        renwu += "  <li class='item-content'>"
                        renwu += "     <div class='item-inner'>"

                        renwu += "               <div class='item-title-row'>"
                        renwu += "               <div class='item-title'>" + data.datas[i].title +(data.datas[i].state != 2 ?' <span style=\'color:Red;\'> 未审核</span>':'') + "</div>"
                        renwu += "             </div>"
                        renwu += "             <div class='item-subtitle' style='white-space: inherit;color: #999;margin: 0.5rem 0;'>" + data.datas[i].content + "</div>"

                        renwu += "       </div>"
                        renwu += "    </li>"
                        renwu += "     </ul>"
                        renwu += "  </div>"
                        renwu += " </div>"
                        renwu += " <div class='card-footer' style='border-bottom: 1px solid #e1e1e1; border-top:0px;'>"
                        renwu += "    <span><img src='" + data.datas[i].questionerAvatar + "' style='width:15px;height:15px;border-radius:50%;margin:0;padding:0'> <i class='iconfont'>&#xe6fd;</i>" + data.datas[i].createDate + "</span>"
                        renwu += "    <span><i class='iconfont'>&#xe69b;</i> " + data.datas[i].replyNum + " 回答</span>"
                        renwu += "  </div>"
                        renwu += "</div>"
                      }
                    }
                    //给页面附上列表
                    if (optype == 1) {
                        $("#spinterlocution .list-block").html(renwu);
                    } else {
                        $("#spinterlocution .list-block").append(renwu);
                    }
                    if (pageIndex >= data.pageCount) {
                        $("#interlocutionLoadMore").hide();
                    } else {
                        $("#interlocutionLoadMore").show();
                    }
                } else if (data.errorcode == 0 && (data.numCount == 0 || data.datas.length <= 0)) {
                    if (pageIndex == 1) {
                        $("#spinterlocution .list-block").html("<center style='color:#999;font-size:16px;'><i class='iconfont' style='font-size: 6rem;color:#ccc;'>&#xe731;</i><br/>暂无数据</center>");
                    }
                    $("#interlocutionLoadMore").hide();
                }
                $("#interlocutionIndex").html(pageIndex);
                $.hideIndicator();
            });
        }
//关注专栏
function collectionCol() {
    var text = $("#sp_interlocution .sp_collection").text();
    //alert(text);
    getAjax(javaserver + "/specialColumn/addFollowSC", { columnId: specialColnum.columnId, userId: sysUserInfo.user_ID }
    , function (data) {
        data = strToJson(data);
        if (data.errorcode == "0") {
            if (text=="已关注") {
                $.toast('取消成功！');
                $("#sp_interlocution .sp_collection").html("关注");
            } else {
                $.toast('关注成功！');
                $("#sp_interlocution .sp_collection").html("已关注");
            }
        } else {
            $.toast('操作失败！');
        }
    });

}
//申请加入
function JoinColumn() {
    if(joinState==1){
        $.toast('已提交申请，请耐心等候审核！');
        return;
    }
     var text = $("#sp_interlocution .sp_join").innerText();
    getAjax(javaserver + "/specialColumn/joinSpecialColumn", {orgid:sysUserInfo.organization_ID,userid:sysUserInfo.user_ID,username:sysUserInfo.user_Name,userimg:sysUserInfo.user_Img,colnumid:specialColnum.columnId,colnumname:specialColnum.columnName}
    , function (data) {
        data = strToJson(data);
        if (data.errorcode == "0") {
              if (text=="已申请") {
                $.toast('取消成功！');
                $("#sp_interlocution .sp_join").html("申请");
            } else if (text=="申请") {
                $.toast('已成功提交加入申请！');
                $("#sp_interlocution .sp_join").html("申请中");
                joinState=1;
            }
        } else {
            $.toast('申请失败！');
        }
    });
}
var joinState = 0; //加入专栏的状态  0什么也不是，初始，1申请中，2失败  3通过 4，不需要加入
//是否加入专栏
function isJoinColumn() {
    //专栏
    if (specialColnum.xtype ==4) {
        //1.加密状态
        if (specialColnum.columnState == 1) {
            getAjax(javaserver + "/specialColumn/addFollowSC", { columnId: specialColnum.columnId, userId: sysUserInfo.user_ID }
        , function (data) {
            data = strToJson(data);
            if (data.errorcode == "0") {
                if (data.datas != undefined && data.datas[0] != undefined) {
                    joinState = data.datas[0].state;
                }
                //审核通过在查询
                if (joinState == 3) {
                    getInterlocution(1,specialColnum,parseInt($("#SpectailColnumIndex").html()));
                }
                if (joinState == 2) {
                    $("#sp_interlocution .sp_join").remove();
                    $("#interlocution_sosoHide .row div").css("width", "45%");
                } else {
                    $("#sp_interlocution .sp_join").html(joinState == 1 ? "申请中" : (joinState == 3 ? '已加入' : (joinState == 0 ? '申请' : '失败')));
                }

                if (joinState == null || joinState == undefined || joinState != 3) {
                    $("#spinterlocution .list-block").html("<center style='color:#999;font-size:16px;'><i class='iconfont' style='font-size: 6rem;color:#ccc;'>&#xe731;</i><br/>无权限访问</center>");
                }

            } else {
                $.toast('操作失败！');
            }
        });
            //公开
        } else {
            joinState = 4;
            $("#sp_interlocution .sp_join").remove();
            $("#interlocution_sosoHide .row div").css("width", "45%");
            getInterlocution(1,specialColnum,parseInt($("#SpectailColnumIndex").html()));
        }
    //班级
    } else if (specialColnum.xtype == 5) {
        $("#interlocution_sosoHide").remove();//移除蓝色工具条
        $("#interlocution_sosoShow").show();//显示搜索
        //  alert("x");
        getInterlocution(1,specialColnum,1);

    }


}
//专栏列表 的下拉刷新
$(document).on('refresh', '.interlocution', function () {
    getSpectailColnum(1);
    setTimeout(function () {
        $.pullToRefreshDone('.interlocution');
        $.toast('刷新成功！');
    }, 500);
});
//问答列表 的下拉刷新
$(document).on('refresh', '.sp_interlocution', function () {
    isJoinColumn(); //刷新请求是否审核通过
    setTimeout(function () {
        $.pullToRefreshDone('.sp_interlocution');
        $.toast('刷新成功！');
    }, 500);
});
//是否收藏改专栏
function getState() {
    sysUserInfo = getUserInfo();
    specialColnum = strToJson(GetlocalStorage("SpectailColnum"));
    getAjax(javaserver + "/specialColumn/getIsCollcol", { colnumid: specialColnum.columnId, userid: sysUserInfo.user_ID }
    , function (data) {
        data = strToJson(data);
        if (data.errorcode == "0") {
            //存在收藏信息
            if (data.datas != null && data.datas.length > 0) {
                $("#sp_interlocution .sp_collection").html("已关注");
            }else{
                $("#sp_interlocution .sp_collection").html("关注");
            }
        } else {
            $.toast('查询失败！');
        }
    });
}
function addQuestion1(){
  sysUserInfo = getUserInfo();
  specialColnum = strToJson(GetlocalStorage("SpectailColnum"));
  var title = $("#tanchuangtitle2").val();
  var content = $("#tanchuangcontent2").val();

  if (title.length <= 0) {
      alert('请输入标题！！');
      $("#tanchuangtitle2").focus();
      return;
  }
  if (content.length <= 0) {
      alert('请输入内容！！');
      $("#tanchuangcontent2").focus();
      return;
  }
  var item = {
      columnId: specialColnum.columnId,
      title: title, // 标题
      content: content, // 内容
      questionerId: sysUserInfo.user_ID,
      questionerName: sysUserInfo.user_Name,
      orgId: sysUserInfo.organization_ID,
      orgName: sysUserInfo.organization_Name,
      questionerAvatar: sysUserInfo.user_Img,
      state: 2, //审核状态
      isAnonymous: false, //是否匿名
      xtype: specialColnum.xtype, //4.专栏
      xid: specialColnum.xid,
      xname: specialColnum.xname,
      spare:[]//附件
  };
  if (fileObj.name != undefined && fileObj.name.length > 0) {
      item.spare.push(fileObj);
  }
  item.spare = JSON.stringify(item.spare);
  getAjax(javaserver + "/interlocution/saveEditQA", { data: JSON.stringify(item), colid: item.xid }
      , function (data) {
          //alert("cx");
          data = strToJson(data);
          if (data.errorcode == "0") {
              $.closeModal();
              $.toast('添加成功！');
              fileObj = {}
              if (joinState == 3 || (specialColnum.xtype != 4)) {
                  getInterlocution(1,specialColnum,1);
              }
              $("#tanchuangtitle2").val("");
              $("#tanchuangcontent2").val("");
          } else {
              alert('添加失败！');
          }
      }, function (value) {alert("cx"+JSON.stringify(value)); });
}
function addQuestion() {
    //alert("x");
    sysUserInfo = getUserInfo();
    specialColnum = strToJson(GetlocalStorage("SpectailColnum"));
    var title = $("#tanchuangtitle").val();
    var content = $("#tanchuangcontent").val();

    if (title.length <= 0) {
        alert('请输入标题！');
        $("#tanchuangtitle").focus();
        return;
    }
    if (content.length <= 0) {
        alert('请输入内容！');
        $("#tanchuangcontent").focus();
        return;
    }
    var item = {
        columnId: specialColnum.columnId,
        title: title, // 标题
        content: content, // 内容
        questionerId: sysUserInfo.user_ID,
        questionerName: sysUserInfo.user_Name,
        orgId: sysUserInfo.organization_ID,
        orgName: sysUserInfo.organization_Name,
        questionerAvatar: sysUserInfo.user_Img,
        state: 2, //审核状态
        isAnonymous: false, //是否匿名
        xtype: specialColnum.xtype, //4.专栏
        xid: specialColnum.xid,
        xname: specialColnum.xname,
        spare:[]//附件
    };
    if (fileObj.name != undefined && fileObj.name.length > 0) {
        item.spare.push(fileObj);
    }
    item.spare = JSON.stringify(item.spare);
    getAjax(javaserver + "/interlocution/saveEditQA", { data: JSON.stringify(item), colid: item.xid }
        , function (data) {
            //alert("cx");
            data = strToJson(data);
            if (data.errorcode == "0") {
                $.closeModal();
                $.toast('添加成功！');
                fileObj = {}
                if (joinState == 3 || (specialColnum.xtype != 4)) {
                    getInterlocution(1,specialColnum,1);
                }
                $(".popup-interlocution input").val("");
                $(".popup-interlocution textarea").val("");
            } else {
                alert('添加失败！');
            }
        }, function (value) {alert("cx"+JSON.stringify(value)); });
}
//显示收搜框
function showSearch(){
    $("#interlocution_sosoHide").hide();
    $("#interlocution_sosoShow").show();
}
//影藏收搜框
function hideSearch() {
    //专栏下的问答才需要影藏
  //  if (specialColnum.xtype == 1) {
        $("#interlocution_sosoHide").show();
        $("#interlocution_sosoShow").hide();

}


//跳转问答详情页面
function openInterlocutionss(id) {
    $.router.loadPage(api.wgtRootDir+"/html/interlocution/interlocutiondetail.html?1=1&qaid="+id);
}

//**********************************************************************
//进入问答详情页面
//**********************************************************************
var specialColnum = null;
var replayparam = {
    userid: "",
    orgid: "",
    qaid:"",
    orderby:1,
    parentId:0,
    pageIndex:1,
    pageSize:10
};
var interlocutionDetail=null;
$(document).on("pageInit", "#interlocutionDetail", function (e, id, $page) {

    getpageinitdetail();
    $("#fjname").html("附件");
});
function getpageinitdetail(){
  sysUserInfo = getUserInfo();
  replayparam.userid = getUserInfo().user_ID;
  replayparam.orgid = getUserInfo().organization_ID;
  replayparam.qaid = QueryString("qaid");

  //获取当前的 问题是啥
  getAjax(javaserver + "/replay/findQuestionById",
   { userid: sysUserInfo.user_ID, qaid: QueryString("qaid") }
   , function (data) {
       data = strToJson(data);
     try {


       interlocutionDetail = data.data;
       if (data.data.spare != undefined && data.data.spare.length > 0 && typeof (data.data.spare) == "string") {
           data.data.spare = JSON.parse(data.data.spare);
       } else {
           data.data.spare = [];
       }
       if (data.errorcode == "0") {
           var renwu = "<div class='card-content'>";
           renwu += "  <div class='list-block media-list'>"
           renwu += "       <ul>"
           renwu += "        <li class='item-content'>"
           renwu += "          <div class='item-inner'>"
           renwu += "              <img src='" + data.data.questionerAvatar + "' style='width:15px;height:15px;border-radius:50%;margin:0;padding:0'> " + data.data.questionerName + ""
           renwu += "               <div class='item-title-row'>"
           renwu += "               <div class='item-title'><b>" + data.data.title + "</b></div>"
           renwu += "             </div>"
           if(data.data.title != data.data.content)
           {
                renwu += "             <div class='item-subtitle' style='white-space: inherit;color: #999;margin: 1rem 0;'>" + data.data.content + "</div>"
           }

           if (data.data.spare.length > 0) {
               renwu += "             <div class='item-subtitle' style='white-space: inherit;color: #999;'>附件：<br/>"
               for (i = 0; i < data.data.spare.length; i++) {
                   renwu += "             <a onclick='dowloadFj(" + JSON.stringify(data.data.spare[i].path) + ",\""+data.data.spare[i].type+"\")' ><img src='../../res/fileicon/" + data.data.spare[i].type + "_56.png' onerror='javascript:this.src=\"../../res/fileicon/qita_56.png\"' style='width:30px;height:30px'> " + data.data.spare[i].name + "</a>"
                   if (i < (data.data.spare.length - 1)) {
                       renwu += "              <br/>"
                   }
               }
           }
           renwu += "             </div>"
           renwu += "           </div>"
           renwu += "         </li>"
           renwu += "        </ul>"
           renwu += "       </div>"
           renwu += "     </div>"
           renwu += "     <div class='card-footer' style='border-bottom: 1px solid #e1e1e1; border-top:0px;'>"
           renwu += "      <span><i class='iconfont'>&#xe6fd;</i> " + data.data.createDate + "</span>"
           renwu += "     <span><i class='iconfont'>&#xe69b;</i>" + data.data.replyNum + " 回答</span>"

           //console.log(JSON.stringify(data.data));
           //alert(sysUserInfo.user_ID);
           if(data.data.examineUserId == sysUserInfo.user_ID || data.data.questionerId == sysUserInfo.user_ID)
           {
               renwu += "     <span onclick=\"deleteQuestion('"+data.data.qaid+"','"+data.data.xid+"')\"><i class='iconfont'>&#xe606;</i>删除</span>"
           }
           else {
             if (data.data.isCollection) {
                 renwu += "     <span onclick='collectionQuestion(null,this)'><i class='iconfont'>&#xe72f;</i>已收藏</span>"
             } else {
                 renwu += "     <span onclick='collectionQuestion(2,this)'><i class='iconfont'>&#xe67d;</i>收藏</span>"
             }
           }


           renwu += "  </div>";

           //绑定样式
           $("#questionDetail").html(renwu);
           getReplay(1);
       }

     } catch (e) {
        alert("您所访问的内容不存在或被删除！");
     } finally {

     }
   });


}
//删除自己发的帖子
function deleteQuestion(qid,xid){
    sysUserInfo = getUserInfo();
  getAjax(javaserver + "/interlocution/delQA", {
  colid:xid,
  qaid:qid,
  userid:sysUserInfo.user_ID
}
  , function (data) {
      data = strToJson(data)
      if (data.errorcode == "0") {
          alert("删除成功");
          try {
              api.closeWin({name: 'xxxcc'});
          } catch (e) {

          }

      }
      else {
        alert("删除错误"+data.errorcode);
      }
    });
}
//删除回复帖子
function deleterQuestion(qid,rid){
  sysUserInfo = getUserInfo();
    getAjax(javaserver + "/replay/delReplay", {
    qaid:qid,
    replayid:rid,
    userid:sysUserInfo.user_ID
    }
    , function (data) {
        data = strToJson(data)
        if (data.errorcode == "0") {
            alert("删除成功");
            $("#id_"+rid).remove();

        }
        else {
          alert("删除错误"+data.errorcode);
        }
      });
}
 //获取回复列表
 function getReplay(optype) {
     $.showIndicator(); //loading
     replayparam.userid = getUserInfo().user_ID;
     replayparam.orgid = getUserInfo().organization_ID;
     replayparam.qaid = QueryString("qaid");

     //获取当前的 问题是啥
     getAjax(javaserver + "/replay/findReplay", replayparam
     , function (data) {

         data = strToJson(data)
         if (data.errorcode == "0") {
             data = strToJson(data);
             if (data.errorcode == 0 && data.numCount > 0 && data.datas.length > 0) {

                 //问答列表
                 var renwu = "";
                 for (var i = 0; i < data.datas.length; i++) {
                     if (data.datas[i].spare != undefined && data.datas[i].spare.length > 0 && typeof (data.datas[i].spare) == "string") {
                         data.datas[i].spare = JSON.parse(data.datas[i].spare);
                     } else {
                         data.datas[i].spare = [];
                     }
                     if (data.datas[i].isSolve) {
                         renwu += "<div class='card manyi' id='id_"+data.datas[i].areplayId+"'>"
                     } else {
                         renwu += "<div class='card' id='id_"+data.datas[i].areplayId+"'>"
                     }
                     renwu += "<div class='strong'><i class='iconfont'>&#xe707;</i>满意答案</div>"
                     renwu += "<div class='card-content'>"
                     renwu += "<div class='card-footer' style='border-top:0px;'>"
                     renwu += "  <span><img src='" + data.datas[i].replyAvatar + "' style='width:15px;height:15px;border-radius:50%;margin:0;padding:0'> " + data.datas[i].replyUserName + "</span>"
                     if (data.datas[i].isPoint) {
                         renwu += "  <span id='dz_" + data.datas[i].areplayId + "' style='color:#39f;' onclick='dianzhan(" + JSON.stringify(data.datas[i].areplayId) + ",this,2)'><i class='iconfont'>&#xe730;</i> <b>" + (data.datas[i].pointNum == undefined ? 0 : data.datas[i].pointNum) + "</b></span>"
                     } else {
                         renwu += "  <span id='dz_" + data.datas[i].areplayId + "' style='color:#39f;' onclick='dianzhan(" + JSON.stringify(data.datas[i].areplayId) + ",this,1)'><i class='iconfont'>&#xe72e;</i> <b>" + (data.datas[i].pointNum == undefined ? 0 : data.datas[i].pointNum) + "</b></span>"
                     }
                     renwu += "</div>"
                     renwu += "  <div class='list-block media-list'>"
                     renwu += "    <ul>"
                     renwu += "      <li class='item-content'>"
                     renwu += "         <div class='item-inner' style=''>"
                     renwu += "          <div class='item-subtitle' style='white-space: inherit;'> " + data.datas[i].areplayContent + "</div>"
                     if (data.datas[i].spare.length > 0) {
                         renwu += "             <div class='item-subtitle' style='white-space: inherit;color: #999;margin-top: .5rem;'>附件：<br/>"
                         for (j = 0; j < data.datas[i].spare.length; j++) {
                             renwu += "             <a onclick='dowloadFj(" + JSON.stringify(data.datas[i].spare[j].path) + ",\""+data.datas[i].spare[j].type+"\")' ><img src='../../res/fileicon/" + data.datas[i].spare[j].type + "_56.png' onerror='javascript:this.src=\"../../res/fileicon/qita_56.png\"' style='height:30px;width:30px'> " + data.datas[i].spare[j].name + "</a>"
                             if (j < (data.datas[i].spare.length - 1)) {
                                 renwu += "              <br/>"
                             }
                         }
                     }
                     renwu += "        </div>"
                     renwu += "      </li>"
                     renwu += "   </ul>"
                     renwu += "  </div>"
                     renwu += "</div>"
                     renwu += "<div class='card-footer' style='border-bottom: 1px solid #e1e1e1; border-top:0px;'>"
                     renwu += "  <span> <i class='iconfont'>&#xe6fd;</i> " + data.datas[i].replyTime + "</span>"
                     // renwu += "  <span><i class='iconfont'>&#xe6bd;</i> 回复</span>"
                     if (sysUserInfo.user_ID == interlocutionDetail.questionerId) {
                         if (data.datas[i].isSolve) {
                             renwu += "<span onclick='setManyi(" + data.datas[i].isSolve + "," + JSON.stringify(data.datas[i].areplayId) + ",this)'><i class='iconfont'>&#xe65a;</i> 取消满意</span>"
                         } else {
                             renwu += "<span onclick='setManyi(" + data.datas[i].isSolve + "," + JSON.stringify(data.datas[i].areplayId) + ",this)'><i class='iconfont'>&#xe749;</i>设为满意</span>"
                         }





                     }
                     if(data.datas[i].replyUserId == sysUserInfo.user_ID)
                     {
                       renwu += "<span onclick=\"deleterQuestion('"+replayparam.qaid+"','"+data.datas[i].areplayId+"')\"><i class='iconfont'>&#xe606;</i>删除</span>"
                     }
                    //console.log(JSON.stringify(data.datas[i]));

                     renwu += "</div>"
                     renwu += "</div>"
                 }
                 //给页面附上列表
                 if (optype == 1) {
                     $("#interlocution_repalyParent").html(renwu);
                 } else {
                     $("#interlocution_repalyParent").append(renwu);
                 }
                 if (replayparam.pageIndex >= data.pageCount) {
                     $("#interlocutionDetailLoadMore").hide();
                 } else {
                     $("#interlocutionDetailLoadMore").show();
                 }
             } else if (data.errorcode == 0 && (data.numCount == 0 || data.datas.length <= 0)) {
                 if (replayparam.pageIndex == 1) {
                     $("#interlocution_repalyParent").html("<center style='color:#999;font-size:16px;'><i class='iconfont' style='font-size: 6rem;color:#ccc;'>&#xe731;</i><br/>暂无数据</center>");
                 }
                 $("#interlocutionDetailLoadMore").hide();
             }
             $("#interlocutionDetailIndex").html(replayparam.pageIndex);
             $.hideIndicator();
         }
     });
 }

 //回答问题
 function sendReplay() {
     var content = $("#rePlayContent").val();
     //alert(content);
     if (content == null || content.length <= 0) {
         alert("回答内容不能为空！");
         return;
     }
     //新增的参数
     var replayInfo = {
         qaId: QueryString("qaid"),
         areplayFid: "0",
         areplayContent: content,
         replyUserId: sysUserInfo.user_ID,
         replyUserName: sysUserInfo.user_Name,
         replyAvatar: sysUserInfo.user_Img,
         replyOrgId: sysUserInfo.organization_ID,
         spare:[]//附件
     };
     if (fileObj.name != undefined && fileObj.name.length > 0) {
         replayInfo.spare.push(fileObj);

     }
      replayInfo.spare = JSON.stringify(replayInfo.spare);
     $.showIndicator(); //loading
     getAjax(javaserver + "/replay/saveReplay", { data: JSON.stringify(replayInfo) }
     , function (data) {
        //alert(data);
         data = strToJson(data)

         if (data.errorcode == "0") {

                  if (data.data.spare != undefined && data.data.spare.length > 0 && typeof (data.data.spare) == "string") {
                      data.data.spare = JSON.parse(data.data.spare);
                  } else {
                      data.data.spare = [];
                  }
             fileObj = {};
             $(".questionFJ").html("");
             var renwu = "";
             if (replayInfo.areplayFid == "0") {
                 renwu += "<div class='card' id='id_"+data.data.areplayId+"'>"
                 renwu += "<div class='card-content'>"
                 renwu += "<div class='card-footer' style='border-top:0px;'>"
                 renwu += "  <span><img src='" + data.data.replyAvatar + "' style='width:15px;height:15px;border-radius:50%;margin:0;padding:0'> " + data.data.replyUserName + "</span>"
                 renwu += "  <span id='dz_" + data.data.areplayId + "' style='color:#39f;' onclick='dianzhan(" + JSON.stringify(data.data.areplayId) + ",this,1)'><i class='iconfont'>&#xe72e;</i> <b>0</b></span>"
                 renwu += "</div>"
                 renwu += "  <div class='list-block media-list'>"
                 renwu += "    <ul>"
                 renwu += "      <li class='item-content'>"
                 renwu += "         <div class='item-inner' style=''>"
                 renwu += "          <div class='item-subtitle' style='white-space: inherit;'> " + data.data.areplayContent + "</div>"
                 if (data.data.spare.length > 0) {
                     renwu += "             <div class='item-subtitle' style='white-space: inherit;color: #999;margin-top: .5rem;'>附件：<br/>"
                     for (j = 0; j < data.data.spare.length; j++) {
                         renwu += "             <a onclick='dowloadFj(" + JSON.stringify(data.data.spare[j].path) + ",\""+data.data.spare[j].type+"\")'><img src='../../res/fileicon/" + data.data.spare[j].type + "_56.png' onerror='javascript:this.src=\"../../res/fileicon/qita_56.png\"' style='height: 30px;width:30px;'> " + data.data.spare[j].name + "</a>"
                         if (j < (data.data.spare.length - 1)) {
                             renwu += "              <br/>"
                         }
                     }
                 }
                 renwu += "        </div>"
                 renwu += "      </li>"
                 renwu += "   </ul>"
                 renwu += "  </div>"
                 renwu += "</div>"
                 renwu += "<div class='card-footer' style='border-bottom: 1px solid #e1e1e1; border-top:0px;'>"
                 renwu += "  <span> <i class='iconfont'>&#xe6fd;</i> " + data.data.replyTime + "</span>"
                 //if(data.datas[i].replyUserId == sysUserInfo.user_ID)
                // {
                   renwu += "<span onclick=\"deleterQuestion('"+QueryString("qaid")+"','"+data.data.areplayId+"')\"><i class='iconfont'>&#xe606;</i>删除</span>"
                // }
                 //   renwu += "  <span><i class='iconfont'>&#xe6bd;</i> 回复</span>"
                 //    renwu += "<span onclick='setManyi(" + data.data.isSolve + "," + JSON.stringify(data.data.areplayId) + ",this)'><i class='iconfont'>&#xe749;</i>设为满意</span>"
                 renwu += "</div>"
                 renwu += "</div>"
             }
             //绑定样式
             $("#interlocution_repalyParent center").remove();
             $("#interlocution_repalyParent").prepend(renwu);
             $("#rePlayContent").val("");
         }
         else {
           alert("回复错误"+data.errormsg);
         }
     });
 }


 //回复的分页
 function loadMoreReplay() {
     replayparam.pageIndex = replayparam.pageIndex + 1;
     getReplay(2);
 }

 //收藏问答
 function collectionQuestion(type,obj) {
     $.showIndicator(); //loading
     //新增
     if (type == 2) {
         var colparam = { xid: QueryString("qaid"), xname: interlocutionDetail.title, xtype: "2", userid: sysUserInfo.user_ID, orgid: sysUserInfo.organization_ID };
         getAjax(javaserver + "/collection/saveCollection", { data: JSON.stringify(colparam) }
        , function (data) {
            data = strToJson(data)
            if (data.errorcode == "0") {
                $.toast('收藏成功！');
                $(obj).parent().append("<span onclick='collectionQuestion(null,this)'><i class='iconfont'>&#xe72f;</i>已收藏</span>");
                $(obj).remove();
            }else{
                $.toast('收藏失败！');
            }
        });
         //取消
     } else {
     getAjax(javaserver + "/collection/delCollection", { qaid: QueryString("qaid"), userid: sysUserInfo.user_ID }
        , function (data) {
            data = strToJson(data)
            if (data.errorcode == "0") {
                $.toast('取消成功！');
                $(obj).parent().append(" <span onclick='collectionQuestion(2,this)'><i class='iconfont'>&#xe67d;</i>收藏</span>");
                $(obj).remove();
            } else {
                $.toast('取消失败！');
            }
        });
     }
}

//1点赞，或2取消
function dianzhan(apid,obj,s) {
    getAjax(javaserver + "/replay/modifyPoint", { userid: sysUserInfo.user_ID, type: "1", state: s, xid: apid }
        , function (data) {

            data = strToJson(data);
            if (data.errorcode == "0") {
                var number = parseInt($("#dz_"+apid+" b").text());
              //  alert(parseInt(number));
                //点赞
                if (s == 1) {
                    $(obj).parent().append("<span id='dz_"+apid+"' style='color:#39f;' onclick='dianzhan(" + JSON.stringify(apid) + ",this,2)'><i class='iconfont'>&#xe730;</i> <b>" + parseInt(number+1) + "</b></span>");
               //取消点赞
                } else {
                    $(obj).parent().append("<span id='dz_"+apid+"' style='color:#39f;' onclick='dianzhan(" + JSON.stringify(apid) + ",this,1)'><i class='iconfont'>&#xe72e;</i> <b>" + parseInt(number-1) + "</b></span>");
                }
                $(obj).remove();
            } else {
                $.toast('取消失败！');
            }
        });
    }

    //设为取消满意
    function setManyi(bol,id,obj) {

        getAjax(javaserver + "/replay/setManyi", { replayid: id, qaid: QueryString("qaid") }
        , function (data) {
            data = strToJson(data);
            if (data.errorcode == "0") {
                if (bol) {
                    //移除样式
                    $("#interlocution_repalyParent div").removeClass("manyi");
                    $.toast('取消成功！');
                    //修改html
                    $(obj).parent().append("<span onclick='setManyi(false," + JSON.stringify(id) + ")'><i class='iconfont'>&#xe749;</i>设为满意</span>");
                } else {
                    $.toast('设置成功！');
                    //修改html
                    $("#interlocution_repalyParent div").removeClass("manyi");
                    $(obj).parent().parent().addClass("manyi");
                    $(obj).parent().append("<span onclick='setManyi(false," + JSON.stringify(id) + ")'><i class='iconfont'>&#xe65a;</i> 取消满意</span>");
                    //放到第一个
                    $("#interlocution_repalyParent").prepend($(obj).parent().parent());
                }
                $(obj).remove();
            } else {
                $.toast('操作失败！');
            }
        });
    }
    //选择附件
    function checkFile(id) {
        //document.getElementById("FjButton2").click();
        $("#" + id).click();
    }

    //上传附件
    function uploadFj(id) {
       $.showPreloader();
        var upfile = document.getElementById(id).files[0];
        formdata = new FormData();
        formdata.append('file', upfile);
        formdata.append('userid', sysUserInfo.user_ID);
        formdata.append('orgid', sysUserInfo.organization_ID);

        $.ajax({
            url: javafile + "/file/uploadEnclosure",
            dataType: "JSON",
            type: "post",
            data: formdata,
            processData: false,
            contentType: false,
            success: function (data) {
                //alert(data);
                data = strToJson(data);
                if (data.errorcode == "0") {
                    fileObj = { name: upfile.name, path: data.errormsg, type: upfile.name.split(".")[1] };
                    if (id == "FjButton2") {

                        $("#fjname").html("<b>已传</b>");
                    } else {
                        $(".questionFJ").html("上传文件：" + upfile.name);
                        //$("#tiwenbtn").click();
                        setTimeout(function(){

                          $.popup('.popup-interlocution');
                        },500);
                        //
                    }
                  //  alert('上传成功！');

                  //
                } else if (data.errorcode == "10002") {
                    $.alert("文件过大，请重新选择！");
                } else {
                    $.alert('上传失败！');
                }
                $.hidePreloader();
            },
            error: function (err,code) {
                alert("网络连接失败,稍后重试"+JSON.stringify(code));
                $.hidePreloader();
            }

        })
    }
    //上传附件
    function uploadFj2(id) {
       $.showPreloader();
        var upfile = document.getElementById(id).files[0];
        formdata = new FormData();
        formdata.append('file', upfile);
        formdata.append('userid', sysUserInfo.user_ID);
        formdata.append('orgid', sysUserInfo.organization_ID);
        $.ajax({
            url: javafile + "/file/uploadEnclosure",
            dataType: "JSON",
            type: "post",
            data: formdata,
            processData: false,
            contentType: false,
            success: function (data) {
                data = strToJson(data);
                if (data.errorcode == "0") {
                    fileObj = { name: upfile.name, path: data.errormsg, type: upfile.name.split(".")[1] };
                    if (id == "FjButton2") {
                        $("#fjname").html("<b>已传</b>");
                    } else {
                        $(".questionFJ1").html("上传文件：" + upfile.name);
                        //$("#tiwenbtn").click();
                        alert("上传成功！");
                        setTimeout(function(){
                          $.popup('.popup-interlocution2');
                        },500);
                        //
                    }
                } else if (data.errorcode == "10002") {
                    $.alert("文件过大，请重新选择！");
                } else {
                    $.alert('上传失败！');
                }
                $.hidePreloader();
            },
            error: function (err) {
                $.alert("网络连接失败,稍后重试", err);
                $.hidePreloader();
            }

        })
    }
    //下载
    function dowloadFj(url,type) {
      //  var $eleForm = $("#dowloadFj");
      //  $eleForm.attr("action", url);
        //提交表单，实现下载
      //  $eleForm.submit();
      var data={
            filepreview:url,
            fileType:type
        };

      SetlocalStorage("fileobj", JSON.stringify(data));
      $.router.loadPage(api.wgtRootDir+"/html/wenjian/yulan.html");

    }
    function closePopup() {
        $.closeModal();
    }
