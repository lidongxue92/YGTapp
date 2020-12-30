//当前访问的状态
var nowState = 1;
/**********************************************我的课程列表初始化start **********************************************/
try { $.noConflict(); } catch (e) { }
//任务缺省图
var renwunull = "<dl style='height:100%;width:100%;position: absolute;margin-top: 25%;color:#cecece;'><dd style='text-align:center;margin:0'><img src='../../res/img/none.png' style='width: 50%;'></dd><dt style='text-align: center;'>暂无数据</dt></dl>";

$(document).on("pageInit", "#renwu", function (e, id, $page) {
    nowState = 1; //当前查询状态
  $.showIndicator(); //loading
    //所有的任务集合
    var allrenwu = {};
    //查询全部
    getrenwuList(1, 1);
    //进行中
    $(document).on('click', '#renwu_jxz', function () {
        initPage(3);
        $("#renwu_all").removeClass("active")
        $("#renwu_wks").removeClass("active")
        $("#renwu_jxz").addClass("active")
        $("#renwu_ywce").removeClass("active")
        $("#renwu_ygq").removeClass("active")
        $("#renwu_gh").removeClass("active")
    });
    //未开始
    $(document).on('click', '#renwu_wks', function () {
        initPage(2);
        $("#renwu_all").removeClass("active")
        $("#renwu_jxz").removeClass("active")
        $("#renwu_wks").addClass("active")
        $("#renwu_ywce").removeClass("active")
        $("#renwu_ygq").removeClass("active")
        $("#renwu_gh").removeClass("active")
    });
    //已完成
    $(document).on('click', '#renwu_ywce', function () {
        initPage(4);
        $("#renwu_all").removeClass("active")
        $("#renwu_jxz").removeClass("active")
        $("#renwu_wks").removeClass("active")
        $("#renwu_ywce").addClass("active")
        $("#renwu_ygq").removeClass("active")
        $("#renwu_gh").removeClass("active")
    });
    //全部
    $(document).on('click', '#renwu_all', function () {
        initPage(1);
        $("#renwu_ywce").removeClass("active");
        $("#renwu_jxz").removeClass("active");
        $("#renwu_wks").removeClass("active");
        $("#renwu_all").addClass("active");
        $("#renwu_ygq").removeClass("active")
        $("#renwu_gh").removeClass("active")
    });
    //已过期
    $(document).on('click', '#renwu_ygq', function () {
        initPage(5);
        $("#renwu_ywce").removeClass("active");
        $("#renwu_jxz").removeClass("active");
        $("#renwu_wks").removeClass("active");
        $("#renwu_all").removeClass("active");
        $("#renwu_ygq").addClass("active")
        $("#renwu_gh").removeClass("active")
    });
    //规划
    $(document).on('click', '#renwu_gh', function () {
        initPage(6);
        $("#renwu_ywce").removeClass("active");
        $("#renwu_jxz").removeClass("active");
        $("#renwu_wks").removeClass("active");
        $("#renwu_all").removeClass("active");
        $("#renwu_ygq").removeClass("active")
        $("#renwu_gh").addClass("active")
    });
    //任务名称筛选
    $('#search').keypress(function (e) { //这里给function一个事件参数命名为e，叫event也行，随意的，e就是IE窗口发生的事件。
        var key = e.which; //e.which是按键的值
        if (key == 13) {
            e.preventDefault();
            initPage(1); //筛选全部
            $("#renwu_ywce").removeClass("active");
            $("#renwu_jxz").removeClass("active");
            $("#renwu_wks").removeClass("active");
            $("#renwu_all").addClass("active");
            $("#renwu_ygq").removeClass("active")
            $("#renwu_gh").removeClass("active")
        }
    });
    $(document).on('refresh', '.renwu', function (e) {
        //下拉刷新处理(重新查询绑定)
      //  setTimeout(function () {
            // 加载完毕需要重置
            pageIndex = 1;
            getrenwuList(nowState, 1);
            $.pullToRefreshDone('.renwu');
            $.toast('刷新成功！');
      //  }, 1000);
    });
    /*********************************初始化分页查询**************************************/
    function initPage(state) {
        $.showIndicator(); //loading
        nowState = state;
        pageIndex = 1;
        $("#stagePageIndex").html("1");
        pageSize = 20;
        getrenwuList(state, 1);
    }

    $(document).on('change', '#peixunrenwujd', function () {
       var jindu =  $("#peixunrenwujd").val();
       initPage(jindu);
    });
});

//*************************任务的查询单独取出来，方便再次调用*********************************
function getrenwuList(state, optype) {
    //任务缺省图
    var renwunull = "<dl style='height:100%;width:100%;position: absolute;margin-top: 25%;color:#cecece;'><dd style='text-align:center;margin:0'><img src='../../res/img/none.png' style='width: 50%;'></dd><dt style='text-align: center;'>暂无数据</dt></dl>";
    //  debugger;
    var name = $("#search").val();
    sysUserInfo = getUserInfo();
    //默认登录进来就请求任务列表
    //请求所有任务
    getAjax(javaserver + "/stage/findStudentStage",
            { name: name,
                orgID: sysUserInfo.organization_ID,
                user_id: sysUserInfo.user_ID,
                org_Id: sysUserInfo.allorgid,
                role_Id: sysUserInfo.allroleid,
                user_groupId: sysUserInfo.allgroupid,
                orderType: "2", //1.名称 2.时间
                pageSize: pageSize,
                pageIndex: pageIndex,
                state: state
            },
            function (data) {
                data = strToJson(data);
                if (data.errorcode == 0 && data.numCount > 0 && data.datas.length > 0) {
                    //当前所有的任务
                    allrenwu = data;
                    //任务列表
                    var renwu = "";
                    for (var i = 0; i < data.datas.length; i++) {
                        //进度标识
                        var center = "";
                        //单独把string 拿出来转一下（否则比较不了）
                        var coursecout = parseFloat(data.datas[i].courser_count);
                        var completeCount = parseFloat(data.datas[i].completeCount);
                        //追加的任务列表
                        if (state == 5 || state == 6) {
                            center = "<div class='item-title'><marquee scrolldelay='300'>" + data.datas[i].name + "</marquee></div>";
                            var icon = "";
                            //空任务
                            if (coursecout <= 0) {
                                icon += "<i class='iconfont icon-yuan' style='color:Red'></i>";
                                //已完成
                            } else if (completeCount >= coursecout) {
                                icon += "<i class='iconfont icon-shenhetongguo' style='color:#339966'></i>";
                                //进行中
                            } else if (completeCount < coursecout && completeCount > 0) {
                                icon += "<i class='iconfont icon-icon27' title='学习中' style='color:#39f'></i>";
                            }
                            //规划和已过期添加跑马灯
                            if (state == 5 && data.datas[i].date_formate == 1) {
                                center += "<div class='item-after'>结束时间：" + data.datas[i].end_Date + icon + "</div>";
                            } else if (state == 5 && data.datas[i].date_formate == 2) {
                                center += "<div class='item-after'>任务天数：" + data.datas[i].date_formate_time + icon + "</div>";
                            } else if (state == 6 && data.datas[i].date_formate == 1) {
                                center += "<div class='item-after'>开始时间：" + data.datas[i].start_Date + icon + "</div>";
                            } else if (state == 6 && data.datas[i].date_formate == 2) {
                                center += "<div class='item-after'>任务天数：" + data.datas[i].date_formate_time + icon + "</div>";
                            }

                            renwu += "<li> <a onclick='openWarning(" + state + ")'  target='_black' class='item-link item-content'> <div class='item-inner'>" + center + " </div>  </a> </li>    ";
                        } else {
                            center = "<div class='item-title'>" + data.datas[i].name + "</div>";
                            //空任务
                            if (coursecout <= 0) {
                                center += "<div class='item-after'><i class='iconfont icon-yuan' style='color:Red'></i></div>";
                                //已完成
                            } else if (completeCount >= coursecout) {
                                center += "<div class='item-after'><i class='iconfont icon-shenhetongguo' style='color:#339966'></i></div>";
                                //进行中
                            } else if (completeCount < coursecout && completeCount > 0) {
                                center += "<div class='item-after'><i class='iconfont icon-icon27' title='学习中' style='color:#39f'></i></div>";
                            }
                            //alert(data.datas[i].img);
                            if(data.datas[i].img == undefined)
                            {
                              data.datas[i].img = "../../images/train/fengmian098.png";
                            }
                            renwu += "<li> <a onclick='openRenwuDetail(" + JSON.stringify(data.datas[i]) + ")'  target='_black' class='item-link item-content'><div class=\"item-media\"><img src=\""+data.datas[i].img+"\" style='width: 80px;height:45px'></div> <div class='item-inner'>" + center + " </div>  </a> </li>    ";
                        }
                    }
                    //给页面附上列表
                    if (optype == 1) {
                        $(".renwulist").html(renwu);
                    } else {
                        $(".renwulist").append(renwu);
                    }
                    if (pageIndex >= data.pageCount) {
                        $("#stageLoadMore").hide();
                    } else {
                        $("#stageLoadMore").show();
                    }
                    tabCss(state, data.numCount);

                } else if (data.errorcode == 0 && (data.numCount == 0 || data.datas.length <= 0)) {
                    tabCss(state, data.numCount);
                    if (optype == 1) {
                        $(".renwulist").html(renwunull);
                        $("#stageLoadMore").hide();
                    } else {
                        $("#stageLoadMore").hide();
                    }
                }
                else {
                    $(".renwulist").html(renwunull);
                }
                $("#stagePageIndex").html(pageIndex);
                $.hideIndicator();
            },function(){console.log("errorS")});

}
/*********************************分页查询**************************************/
function stageLoadMore() {
    $.showIndicator(); //loading
    pageIndex = parseInt($("#stagePageIndex").html()) + 1;
    getrenwuList(nowState, 2);
};

function tabCss(state, numCount) {
    if (state == 1) {
        $("#renwu_all").html("全部<span class='badge'>" + (numCount == undefined ? 0 : numCount) + "</span>");
        $("#renwu_wks").html("未开始");
        $("#renwu_jxz").html("进行中");
        $("#renwu_ywce").html("已完成");
        $("#renwu_ygq").html("过期");
        $("#renwu_gh").html("规划");
    } else if (state == 2) {
        $("#renwu_all").html("全部");
        $("#renwu_wks").html("未开始<span class='badge'>" + (numCount == undefined ? 0 : numCount) + "</span>");
        $("#renwu_jxz").html("进行中");
        $("#renwu_ywce").html("已完成");
        $("#renwu_ygq").html("过期");
        $("#renwu_gh").html("规划");
    } else if (state == 3) {
        $("#renwu_all").html("全部");
        $("#renwu_wks").html("未开始");
        $("#renwu_jxz").html("进行中<span class='badge'>" + (numCount == undefined ? 0 : numCount) + "</span>");
        $("#renwu_ywce").html("已完成");
        $("#renwu_ygq").html("过期");
        $("#renwu_gh").html("规划");
    } else if (state == 4) {
        $("#renwu_all").html("全部");
        $("#renwu_wks").html("未开始");
        $("#renwu_jxz").html("进行中");
        $("#renwu_ywce").html("已完成<span class='badge'>" + (numCount == undefined ? 0 : numCount) + "</span>");
        $("#renwu_ygq").html("过期");
        $("#renwu_gh").html("规划");
    } else if (state == 5) {
        $("#renwu_all").html("全部");
        $("#renwu_wks").html("未开始");
        $("#renwu_jxz").html("进行中");
        $("#renwu_ywce").html("已完成");
        $("#renwu_ygq").html("过期<span class='badge'>" + (numCount == undefined ? 0 : numCount) + "</span>");
        $("#renwu_gh").html("规划");
    } else if (state == 6) {
        $("#renwu_all").html("全部");
        $("#renwu_wks").html("未开始");
        $("#renwu_jxz").html("进行中");
        $("#renwu_ywce").html("已完成");
        $("#renwu_ygq").html("过期");
        $("#renwu_gh").html("规划<span class='badge'>" + (numCount == undefined ? 0 : numCount) + "</span>");
    }
}
function openWarning(state) {
    if (state == 5) {
        $.toast('任务已过期！');
    } else if (state == 6) {
        $.toast('任务未开始！');
    }
}
//打开任务详情
function openRenwuDetail(stringjson) {
    //console.log("预览文件");
    SetlocalStorage("renwuobj", JSON.stringify(stringjson));
    $.router.loadPage(api.wgtRootDir+"/html/peixun/info.html");
}
//打开任务分类
function openRenwuKnow(stringjson, id) {
    //console.log("预览文件");
    //任务id不存在则是从班级进来，
    //班级进来不需要题库
    if (id == 2) {
        stringjson.know_select_course = true;
        stringjson.know_select_exam = true;
    }
    SetlocalStorage("knowobj", JSON.stringify(stringjson));
    $.router.loadPage(api.wgtRootDir+"/html/peixun/know.html?arrangeId=" + id);
}
//**********************************************************************
//打开任务详情界面触发
//**********************************************************************
$(document).on("pageInit", "#renwu_info", function (e, id, $page) {

    sysoUserInfo = getUserInfo(); //用户信息

    var renwuObj = strToJson(GetlocalStorage("renwuobj"));
    if (renwuObj == null) {
        return;
    }
    var arrangeId = renwuObj.id; //任务id
    var completeStr = "";
    //获取单个任务的已完成课程、试卷、的id
    getAjax(javaserver + "/stage/findOneProgress", { arrangeId: arrangeId, userId: sysoUserInfo.user_ID }, function (data) {
        data = strToJson(data);
        if (data.errorcode == 0 && data.data != null) {
            completeStr = data.data.json_details;
            console.log(completeStr);
        }
        var block = "";
        renwuObj.arragetype = strToJson(renwuObj.arragetype);
        var dateTime = "";
        //固定天数
        if (renwuObj.date_formate == "2") {
            dateTime = "<div style='padding: 0.5rem;font-size: 15px;color: #6d6d72;'>任务周期：" + renwuObj.date_formate_time + "天</div>";
            //固定周期
        } else if (renwuObj.date_formate == "1") {
            dateTime = "<div style='padding: 0.5rem;font-size: 15px;color: #6d6d72;'>任务周期：<br/>" + renwuObj.start_Date + " - " + renwuObj.end_Date + "</div>";
            //不限制
        } else {
            dateTime = "<div style='padding: 0.5rem;font-size: 15px;color: #6d6d72;'>任务周期：不限制</div>";
        }
        $("#content_xq").append(dateTime);
        //遍历阶段
        for (var i = 0; i < renwuObj.arragetype.length; i++) {
            var item = renwuObj.arragetype[i];
            var block = "  <div class='content-block-title'>第" + item.key + "阶段</div><div class='list row'>";

            //课程
            for (var c = 0; c < item.kscList.length; c++) {
              if(item.kscList[c].course_img.indexOf('http') !=0)
              {
                item.kscList[c].course_img = staticimgserver+ item.kscList[c].course_img;
              }
                //已完成
                if (completeStr != null && completeStr != "" && (completeStr.indexOf(item.kscList[c].course_Id) != -1 || completeStr == item.kscList[c].course_Id)) {
                    block += "<div class='col-50'><a href='#' onClick='openKe_collection(" + JSON.stringify(item.kscList[c].course_Id) + "," + null + ",\"" + arrangeId + "\")'><div class='card color-default'><div class='shuqian-down'><span class='shuqian end'></span><span class='shuqiantext'>已完成</span></div><div style='' valign='bottom' class='card-header color-white no-border no-padding'><img class='card-cover' src='"+ item.kscList[c].course_img + "' alt='' onerror='javascript:this.src=\"../../res/img/fengmian001.gif\"' height=105></div><div class='card-content'><div class='card-content-inner'><p>" + item.kscList[c].course_Name + "</p></div></div><div class='card-footer'><span class='link'><i class='iconfont icon-shenhetongguo' style='color:#339966'></i> 课程</span><span class='link'><i class='iconfont icon-listtable'>" + item.kscList[c].course_Sum + "章</i> </span></div></div></a></div>";
                } else {
                    block += "<div class='col-50'><a href='#' onClick='openKe_collection(" + JSON.stringify(item.kscList[c].course_Id) + "," + null + ",\"" + arrangeId + "\")'><div class='card color-default'><div style='' valign='bottom' class='card-header color-white no-border no-padding'><img class='card-cover' src='" +item.kscList[c].course_img + "' alt='' onerror='javascript:this.src=\"../../res/img/fengmian001.gif\"' height=105></div><div class='card-content'><div class='card-content-inner'><p>" + item.kscList[c].course_Name + "</p></div></div><div class='card-footer'><span class='link'><i class='iconfont icon-banyuanxuankuang' style='color:#3399ff;'></i> 课程</span><span class='link'><i class='iconfont icon-listtable'>" + item.kscList[c].course_Sum + "章</i> </span></div></div></a></div>";
                }
            }
            //试卷
            for (var s = 0; s < item.kseList.length; s++) {
                if (completeStr != null && completeStr != "" && (completeStr.indexOf(item.kseList[s].paperId) != -1 || completeStr == item.kseList[s].paperId)) {
                    block += "<div class='col-50'><a href='#' onClick='openSj(" + JSON.stringify(item.kseList[s]) + ",\"" + arrangeId + "\")'><div class='card color-default'><div class='shuqian-down'><span class='shuqian end'></span><span class='shuqiantext'>已完成</span></div><div style='' valign='bottom' class='card-header color-white no-border no-padding'><img class='card-cover' src='../../res/img/examnull.png'  alt='' ></div><div class='card-content'><div class='card-content-inner'><p>" + item.kseList[s].paperName + "</p></div></div><div class='card-footer'><span class='link'><i class='iconfont icon-icon04' style='color:#339966'></i> 试卷</span><span class='link'><i class='iconfont icon-listtable'></i> </span></div></div></a></div>";
                } else {
                    block += "<div class='col-50'><a href='#' onClick='openSj(" + JSON.stringify(item.kseList[s]) + ",\"" + arrangeId + "\")'><div class='card color-default'><div style='' valign='bottom' class='card-header color-white no-border no-padding'><img class='card-cover' src='../../res/img/examnull.png'  alt='' ></div><div class='card-content'><div class='card-content-inner'><p>" + item.kseList[s].paperName + "</p></div></div><div class='card-footer'><span class='link'><i class='iconfont icon-icon04' style='color:#3399ff'></i> 试卷</span><span class='link'><i class='iconfont icon-listtable'></i> </span></div></div></a></div>";
                }
            }

            //遍历知识架构
            for (var t = 0; t < item.kssList.length; t++) {
                item.kssList[t].completeStr = completeStr;
                //把知识架构放入对象  前端拼接
                if (completeStr != null && completeStr != "" && (completeStr.indexOf(item.kssList[t].knowledge_Id) != -1 || completeStr == item.kssList[t].knowledge_Id)) {
                    block += "<div class='col-50'><a href='#' onClick='openRenwuKnow(" + JSON.stringify(item.kssList[t]) + ",\"" + arrangeId + "\")'><div class='card color-default'><div class='shuqian-down'><span class='shuqian end'></span><span class='shuqiantext'>已完成</span></div><div style='' valign='bottom' class='card-header color-white no-border no-padding'> <svg class='icon' aria-hidden='true' style='margin:1rem auto;'><use xmlns:xlink='http://www.w3.org/1999/xlink' xlink:href='" + (item.kssList[t].ico == undefined ? '#icon-mulumoshi' : item.kssList[t].ico) + "'></use></svg></div><div class='card-footer'><span class='link'><i class='iconfont icon-shenhetongguo' style='color:#339966'></i> " + item.kssList[t].knowledge_Name + "</span><span class='link'><i class='iconfont icon-listtable'></i> </span></div></div></a></div>";
                } else {
                    block += "<div class='col-50'><a href='#' onClick='openRenwuKnow(" + JSON.stringify(item.kssList[t]) + ",\"" + arrangeId + "\")'><div class='card color-default'><div style='' valign='bottom' class='card-header color-white no-border no-padding'> <svg class='icon' aria-hidden='true' style='margin: 1rem auto;'><use xmlns:xlink='http://www.w3.org/1999/xlink' xlink:href='" + (item.kssList[t].ico == undefined ? '#icon-mulumoshi' : item.kssList[t].ico) + "'></use></svg></div><div class='card-footer'><span class='link'><i class='iconfont icon-banyuanxuankuang' style='color:#3399ff'></i> " + item.kssList[t].knowledge_Name + "</span><span class='link'><i class='iconfont icon-listtable'></i> </span></div></div></a></div>";
                }
            }
            block += "  </div>";
            $("#content_xq").append(block);
        }
    });

    if (isWeiXin()) {
        $("title").html(renwuObj.name);
    } else {
        if (renwuObj.name.length > 12) {
            $(".title").html(renwuObj.name.substr(0, 10) + "...");
        } else {
            $(".title").html(renwuObj.name);
        }
    }


    if (isWeiXin) {
        $("#content_xq").find(".content-block-title").css("margin", "0.75rem .75rem .5rem !important");
    }
});
//重新统计任务进度
function reloadProgress() {
    var obj = strToJson(GetlocalStorage("renwuobj"));

    if (obj == null) {
        return;
    }
    //遍历参数
    //遍历任务里有的属性
    //type		类型 0.都没有 1.任务中有试卷  2.有题库 3.两个都有
    var a = "";
    var arrange = [];
    if (typeof (obj.arragetype) == "string") {
        arrange = JSON.parse(obj.arragetype);
    } else if (typeof (obj.arragetype) == "object") {
        arrange = obj.arragetype;
    }
    var arrange = JSON.parse(obj.arragetype);
    var haspaper = false;
    var hastk = false;
    arrange.forEach(function (data, index) {
        //试卷
        if (data.hasOwnProperty("kseList") && data.kseList.length > 0) {
            haspaper = true;
        }
        //知识架构
        if (data.hasOwnProperty("kssList") && data.kssList.length > 0) {
            data.kscList.forEach(function (data1, index1) {
                if (data1.hasOwnProperty("know_select_que") && data1.know_select_que) {
                    hastk = true;
                }
            })
        }
    });
    //都有
    if (hastk && haspaper) {
        a = "3";
        //只有试卷
    } else if (haspaper && !hastk) {
        a = "1";
        //只有题库
    } else if (!haspaper && hastk) {
        a = "2";
        //都没有
    } else {
        a = "0";
    }
    //请求
    getAjax(javaserver + "/coursetime/modifyTime", {
        type: a,
        arrangeid: obj.id,
        userid: getUserInfo().user_ID
    }, function (data) {
        if (data.errorcode == 0) {
            $.toast('刷新成功！');
        }
    }, "", "json");
}

//**********************************************************************
//打开分类详情界面触发0----进入分类
//**********************************************************************
$(document).on("pageInit", "#renwu_know", function (e, id, $page) {
    sysoUserInfo = getUserInfo(); //用户信息
    var arrangeId=GetlocalStorage("studyArrangeId");
    var item = strToJson(GetlocalStorage("knowobj"));
    if(item==null){
        return;
    }
    var block="";
    //有课程1
    if(item.know_select_course!=undefined&&item.know_select_course){
                block = "  <div class='content-block-title'>包含课程</div><div class='list' id='index_course'> 加载中。。。</div>";
                $("#content_kn").append(block);
                findInKnow(item,"1");
     }
     //有试卷2
    if(item.know_select_exam!=undefined&&item.know_select_exam){
                block = "  <div class='content-block-title'>包含试卷</div><div class='list' id='index_paper'>加载中。。。 </div>";
                $("#content_kn").append(block);
                findInKnow(item,"2");
    }
     //有题库
    if(item.know_select_que!=undefined&&item.know_select_que){
        block = "  <div class='content-block-title'>包含题库</div><div class='list'> </div>";
        //把知识架构放入对象  前端拼接
        if (item.completeStr != null && item.completeStr != "" && (item.completeStr.indexOf(item.knowledge_Id) != -1 || item.completeStr == item.knowledge_Id)) {
            block += "<a href='#' onClick='openTi(" + JSON.stringify(item) + ")'><div class='card color-default'><div class='shuqian-down'><span class='shuqian end'></span><span class='shuqiantext'>已完成</span></div><div style='' valign='bottom' class='card-header color-white no-border no-padding'><img class='card-cover' src='../..//images/train/quenull.png' alt='' onerror='javascript:this.src=\"../../images/train/quenull.png\"'></div><div class='card-content'><div class='card-content-inner'><p>" + item.knowledge_Name + "</p></div></div><div class='card-footer'><span class='link'><i class='iconfont icon-shenhetongguo' style='color:#339966'></i> 题库练习</span><span class='link'><i class='iconfont icon-listtable'></i> </span></div></div></a>";
        }else{
            block += "<a href='#' onClick='openTi(" + JSON.stringify(item) + ")'><div class='card color-default'><div style='' valign='bottom' class='card-header color-white no-border no-padding'><img class='card-cover' src='../../images/train/quenull.png' alt='' onerror='javascript:this.src=\"../../images/train/quenull.png\"'></div><div class='card-content'><div class='card-content-inner'><p>" + item.knowledge_Name + "</p></div></div><div class='card-footer'><span class='link'><i class='iconfont icon-kecheng'></i> 题库练习</span><span class='link'><i class='iconfont icon-listtable'></i> </span></div></div></a>";
        }
         block += "</div>";
         $("#content_kn").append(block);
    }
    if(item.knowledge_Name.length>12){
        $(".title").html(item.knowledge_Name.substr(0,12)+"...");
    }else{
        $(".title").html(item.knowledge_Name);
    }
    //查询知识架构下的课程，试卷，题库
    function findInKnow(item, state) {
        $.showIndicator(); //loading
        getAjax(javaserver + "/stage/findArrangeStage", { knowledgeids: item.knowledge_Id, state: state }, function (data) {
            data = strToJson(data);
            if (data.errorcode == 0) {
                //追加课程
                if(state=="1"){
                    var knowblock = "";
                        //课程
                        for (var i= 0; i < data.datas.length; i++) {
                                if(data.datas[i].courseImg.indexOf("http")==-1){
                                  data.datas[i].courseImg=staticimgserver+data.datas[i].courseImg;
                                }
                                    //已完成
                                    if (item.completeStr != null && item.completeStr != "" && (item.completeStr.indexOf(data.datas[i].courseId) != -1 || item.completeStr == data.datas[i].courseId)) {
                                        knowblock += "<a href='#' onClick='openKe_collection("  + JSON.stringify(data.datas[i].courseId)+","+null+","+ JSON.stringify(arrangeId)+ ")'><div class='card color-default'><div class='shuqian-down'><span class='shuqian end'></span><span class='shuqiantext'>已完成</span></div><div style='' valign='bottom' class='card-header color-white no-border no-padding'><img class='card-cover' src='" + data.datas[i].courseImg + "' alt='' onerror='javascript:this.src=\"../../res/img/fengmian001.gif\"' height=200></div><div class='card-content'><div class='card-content-inner'><p>" + data.datas[i].courseName + "</p></div></div><div class='card-footer'><span class='link'><i class='iconfont icon-shenhetongguo' style='color:#339966'></i> 课程</span><span class='link'><i class='iconfont icon-listtable'>" + data.datas[i].courseSum + "章</i> </span></div></div></a>";
                                    } else {
                                        knowblock += "<a href='#' onClick='openKe_collection("  + JSON.stringify(data.datas[i].courseId)+","+null+","+ JSON.stringify(arrangeId)+ ")'><div class='card color-default'><div style='' valign='bottom' class='card-header color-white no-border no-padding'><img class='card-cover' src='" + data.datas[i].courseImg + "' alt='' onerror='javascript:this.src=\"../../res/img/fengmian001.gif\"' height=200></div><div class='card-content'><div class='card-content-inner'><p>" + data.datas[i].courseName + "</p></div></div><div class='card-footer'><span class='link'><i class='iconfont icon-kecheng'></i> 课程</span><span class='link'><i class='iconfont icon-listtable'>" + data.datas[i].courseSum + "章</i> </span></div></div></a>";
                                    }
                        }
                        if(knowblock.length>0){
                            $("#index_course").html(knowblock);
                        }else{
                            $("#index_course").html("<center>无课程</center>");
                        }
                }else{
                     var knowblock = "";
                     //试卷
                        for (var s = 0; s < data.datas.length; s++) {
                                if (item.completeStr != null && item.completeStr != "" && (item.completeStr.indexOf(data.datas[s].paperId) != -1 || item.completeStr == data.datas[s].paperId)) {
                                        knowblock += "<a href='#' onClick='openSj(" + JSON.stringify(data.datas[s]) + ",\"" + arrangeId + "\")'><div class='card color-default'><div class='shuqian-down'><span class='shuqian end'></span><span class='shuqiantext'>已完成</span></div><div style='' valign='bottom' class='card-header color-white no-border no-padding'><img class='card-cover' src='"+staticimgserver+"/images/train/examnull.png'  alt='' ></div><div class='card-content'><div class='card-content-inner'><p>" + data.datas[s].paperName + "</p></div></div><div class='card-footer' style='display:none;'><span class='link'><i class='iconfont icon-shenhetongguo' style='color:#339966'></i> 已学</span><span class='link'><i class='iconfont icon-listtable'></i> </span></div></div></a>";
                                } else {
                                        knowblock += "<a href='#' onClick='openSj(" + JSON.stringify(data.datas[s]) + ",\"" + arrangeId + "\")'><div class='card color-default'><div style='' valign='bottom' class='card-header color-white no-border no-padding'><img class='card-cover' src='"+staticimgserver+"/images/train/examnull.png'  alt='' ></div><div class='card-content'><div class='card-content-inner'><p>" + data.datas[s].paperName + "</p></div></div><div class='card-footer' style='display:none;'><span class='link'><i class='iconfont icon-kecheng'></i> 已学</span><span class='link'><i class='iconfont icon-listtable'></i> </span></div></div></a>";
                                }
                        }
                        if(knowblock.length>0){
                            $("#index_paper").html(knowblock);
                        }else{
                            $("#index_paper").html("<center>无试卷</center>");
                        }
                }
            }
            $.hideIndicator();
        });
    }
});

 //后退
function renwu_info_black(){
    $.showIndicator(); //loading
    $.router.back("../../home.html#renwu");
    $(".title").html("任务");
}
