//**********************************************************************
//打开问卷列表触发
//**********************************************************************
$(document).on("pageInit", "#questionnaire", function (e, id, $page) {
    loadQuestionAri(1);

    $(document).on('refresh', '.questionnaire', function (e) {
        //下拉刷新处理(重新查询绑定)
      //  setTimeout(function () {
            // 加载完毕需要重置
            loadQuestionAri(1);
            $.pullToRefreshDone('.questionnaire');
            $.toast('刷新成功！');
        //}, 1000);
    });
    $('#questionnaireText').keypress(function (e) { //这里给function一个事件参数命名为e，叫event也行，随意的，e就是IE窗口发生的事件。
        var key = e.which; //e.which是按键的值
        if (key == 13) {
            e.preventDefault();
            loadQuestionAri(1);
        }
    });
    /*********************************分页查询**************************************/
    $(document).on('click', '#questionnaireLoadMore', function () {
        $.showIndicator(); //loading
        loadQuestionAri(2);
    });
});
//跳转问卷
function openwenjuan(id) {
    //var doc = document.getElementById("iframequessrc");
  //  doc.src = "/system/views/wenjuan/wenjuan_info.html?key=" + id;

  api.openWin({
      name: 'wenjuan',
      url: "../html/iframe.html",
      pageParam: {
          title:'问卷调研',
          url: api.wgtRootDir +'/html/wenjuan/wenjuan_info.html?key='+id
      }
  });
}
//查询问卷列表的方法
function loadQuestionAri(optype) {
    $.showIndicator(); //loading
    var pageIndex = parseInt($("#questionnaireIndex").html());
    sysoUserInfo = getUserInfo(); //用户信息
    var name = $("#questionnaireText").val();
    sysUserInfo = getUserInfo();
    //默认登录进来就请求任务列表
    //请求所有任务
    getAjax(javaserver + "/questionnaire/findQuestionnairePage",
            { searchText: name,
                orgid: sysUserInfo.organization_ID,
                userid: sysUserInfo.user_ID,
                pageSize: 10,
                pageIndex: pageIndex
            },
            function (data) {
                data = strToJson(data);
                if (data.errorcode == 0 && data.numCount > 0 && data.datas.length > 0) {
                    //当前所有的任务
                    allrenwu = data;
                    //任务列表
                    var renwu = "";
                    for (var i = 0; i < data.datas.length; i++) {
                        renwu += "<li onclick=\"openwenjuan('"+data.datas[i].questionnaireId+"')\" > <a href='#' class='item-link item-content'> <div class='item-inner'><div class='item-title'>" + data.datas[i].title + "</div></div></a></li>    ";
                    }
                    //给页面附上列表
                    if (optype == 1) {
                        $(".questionnairelist").html(renwu);
                    } else {
                        $(".questionnairelist").append(renwu);
                    }
                    if (pageIndex >= data.pageCount) {
                        $("#questionnaireLoadMore").hide();
                    } else {
                        $("#questionnaireLoadMore").show();
                    }
                } else if (data.errorcode == 0 && (data.numCount == 0 || data.datas.length <= 0)) {
                  var renwunull="<dl style='height:100%;width:100%;position: absolute;margin-top: 25%;color:#cecece;'><dd style='text-align:center;margin:0'><img src='../../res/img/none.png' style='width: 50%;'></dd><dt style='text-align: center;'>暂无问卷</dt></dl>";
                    $(".questionnairelist").html(renwunull);
                    $("#questionnaireLoadMore").hide();
                }
                $("#questionnaireIndex").html(pageIndex);
                $.hideIndicator();
            });
}
