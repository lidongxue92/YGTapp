
//**********************************************************************
//打开课程播放界面
//基础功能
//目前还有细节未优化，包括：
//1、当一个课程学习完成后，自动系一个章节
//2、视频暂停，计时器自动停止
//**********************************************************************
var csm = {}; //播放记忆存储容器
csm.list = [];
var Tstate = 1; // 计时器，0暂停，1正常
var pedding = false;
var timer1 = null; //计时器
var newStudyDetailsJson = { timeStart: "", timeEnd: "", cousreid: "", csid: "", sectionName: "", courseType: "", dateLearn: "" };
//初始视频的开始时间
function initStartTime() {
    newStudyDetailsJson = { timeStart: "", timeEnd: "", cousreid: "", csid: "", sectionName: "", courseType: "", dateLearn: "" };
    newStudyDetailsJson.timeStart = new Date().format("yyyy-MM-dd hh:mm:ss");
    newStudyDetailsJson.dateLearn = newStudyDetailsJson.timeStart;
}
$(document).on("pageInit", "#renwu_detail", function (e, id, $page) {
  api.addEventListener({
      name: 'keyback'
  }, function(ret, err) {
        renwu_detail_black();
  });
  //alert('pageInit');
    //初始logo
    $("#kecheng_play_mian_top_play").html("<div class='shanguang'>" + getLogo() + "<div class='baiguang'></div></div>");

    initStartTime();
    //单独的计时器，每隔10分钟，提交一次进度
    timer1 = window.setInterval(function automatic() {
        if (Tstate == "1") {
            tongbu("aaa");
        }
    }, 1000 * 60 * goTime);

    //隐藏返回
    if (QueryString("courseId")) {
        $("#renwu_detail header a span").hide();
    }
    var PlayCourse = GetlocalStorage("PlayCourse"); //获得课程对象

    var studyArrangeId = QueryString("arrangeId"); //当前播放页的任务id
    SetlocalStorage("studyArrangeId", studyArrangeId);
    //    //浏览器刷新
    //    window.onbeforeunload =function(){
    //          if(csm==""){
    //            return;
    //          }
    //        csm.datetime=new Date();
    //        var PlayCourse = GetlocalStorage("PlayCourse"); //获得课程对象
    //        SetlocalStorage("C_"+PlayCourse.courseId,JSON.stringify(csm));
    //        csm="";
    //        PlayCourse="";
    //    }
    // //判断是否收藏  修改样式
    function collectionStatusJudge(id) {
        if (id != null && id != undefined && id != "") {
            $("#collectionbutton").css("color", "#39f");
            $("#collectionbutton span").html("已收藏");
        } else {
            $("#collectionbutton").css("color", "#000");
            $("#collectionbutton span").html("收藏");
        }
    }
    //后腿事件
    $(window).on('popstate', function () {
        window.clearInterval(timer1); //清除自动提交的计时器
        renwu_detail_black();
    });
    csm = {}; //播放记忆存储容器
    csm.list = [];
    // $.showPreloader();//显示Loading
    var PlayCourse = GetlocalStorage("PlayCourse"); //获得课程对象
    //如果从微信跳转，只有课程id
    //需要从新获取课程信息
    if ((PlayCourse == "" || PlayCourse == null || PlayCourse == undefined || PlayCourse.courseId != QueryString("courseId")) && QueryString("courseId")) {
        openKe_collection(QueryString("courseId"), "微信学课");
        PlayCourse = sysUserInfo;
        SetlocalStorage("PlayCourse", JSON.stringify(PlayCourse));
    }
    //*****************************
    //1、绑定界面中显示的内容
    //*****************************
    csm.key = PlayCourse.courseId;
    var courseCollectionsId = "";
    if (!QueryString("courseId")) {
        //是否收藏课程
        getAjax(javaserver + "/course/findCourseProperties", {
            courseId: PlayCourse.courseId,
            arrangeId: QueryString("arrangeId"),
            userId: getUserInfo().user_ID
        }, function (data) {
            var courseInfoJson = data.data;
            if (courseInfoJson != undefined) {
                courseCollectionsId = courseInfoJson.collections_id;
                  $("#liulanliang").text(courseInfoJson.view_count);
                // 判断是否有收藏该课程
                collectionStatusJudge(courseCollectionsId);
            }
        }, "", "json");
        $("#collectionbutton").click(function () {
            getAjax(javaserver + "/course/modifyCollectionCourse", {
                userId: getUserInfo().user_ID,
                arrangeId: QueryString("arrangeId"),
                collectionsId: courseCollectionsId,
                courseId: PlayCourse.courseId,
                courseName: PlayCourse.courseName
            }, function (data) {
                var collectionsJson = data;
                if (collectionsJson.data == undefined) {  //取消收藏
                    courseCollectionsId = undefined;
                } else {
                    courseCollectionsId = collectionsJson.data.id;
                }
                collectionStatusJudge(courseCollectionsId);
            }, "", "json");
        })
    } else {
        $("#collectionbutton").hide();
    }

    //课程名称
    var coursename = PlayCourse.courseName.replace(/<\/?[^>]*>/g, '');

    if (isWeiXin()) {
        $("title").html(coursename);
    }
    $("#cname").text(coursename.length > 15 ? coursename.substring(0, 12) + "..." : coursename)

    $("#lecturer").text(PlayCourse.lecturer);
    if (PlayCourse.style == 1) {
        PlayCourse.detailedJSON = jisuDecode(PlayCourse.detailedJSON);
    }
    var detailedJSON = JSON.parse(PlayCourse.detailedJSON); //课程章节目录
    var zjhtml = ""; //章节转HTML
    for (var i = 0; i < detailedJSON.length; i++) {
        zjhtml += "<div class=\"content-block-title\">" + detailedJSON[i].chapter + "</div>";
        var kelist = detailedJSON[i].content; //课程章节目录
        zjhtml += "<div class=\"list-block\"><ul>";
        if (kelist.length > 0) {
            for (var j = 0; j < kelist.length; j++) {
                var csobj = kelist[j];
                if (csobj.CSTYPE == 8) {
                    csobj.fileTxt = jisuEncode(csobj.fileTxt);
                    csobj.CSTITLE = jisuEncode(csobj.CSTITLE);
                }
                //.replace(/<\/?[^>]*>/g,'')
                zjhtml += "<li class=\"item-content\" id='kecheng_" + csobj.CSID + "' onClick='bofang(" + JSON.stringify(csobj) + ")'><div class=\"item-inner\"><div class=\"item-title\" style=\"min-width:75%;\">" + csobj.CSNAME.replace(/<\/?[^>]*>/g, '') + "</div>";
                if (csobj.CSTYPE == "1" || csobj.CSTYPE == 1 || csobj.CSTYPE == "2" || csobj.CSTYPE == 2) {
                    zjhtml += "<div style=\"font-size:0.5rem;\"><span id='kecheng_" + csobj.CSID + "_learnTime'>0</span>/<span id='kecheng_" + csobj.CSID + "_cstime'>" + csobj.CSTIME + ":00</span> </div>";
                }
                zjhtml += "<div class=\"item-after\"></div></div></li>";
                //if(j == 0)
                //zjhtml += "<script type=\"text/javascript\">bofang("+JSON.stringify(csobj)+") </script>";
            }
        }
        else {
            zjhtml += "暂未设置课程";
        }
        zjhtml += "</ul></div>";
        // console.log(detailedJSON[i]);
    }
    $("#kechengmingxi").html(zjhtml);
    if (PlayCourse.courseDetailed == "") {
        PlayCourse.courseDetailed = "<center>暂未填写课程简介</center>";
    }
    $("#courseDetailed").html(PlayCourse.courseDetailed);

    if (!QueryString("courseId")) {
        $("#gongsi").html(getUserInfo().organization_Name);
    }
    //*****************************
    //2、读取课程记忆
    //*****************************
    if (!QueryString("courseId")) {
        getAjax(javaserver + "/course/findCourseStudyRecord",
       {
           courseId: PlayCourse.courseId,
           userId: getUserInfo().user_ID,
           arrangeId: QueryString("arrangeId")
       },
            function (data) {
                var dataobj =JSON.parse(data);

                //console.log('播放记忆：'+JSON.stringify(data));
                if (dataobj.errorcode != "0") {
                    $.toast('播放记忆读取异常！');
                    return;
                }
                var studyDetailsJson = dataobj.data; //确定是否有学习记录
                if (studyDetailsJson == undefined) {
                    studyDetailsJson = {};
                }

                if (studyDetailsJson.hasOwnProperty("id")) //有ID，说明有记录，无ID创建一个ID，已被下次记录
                {
                    jiluid = studyDetailsJson.id;
                }
                else {
                    jiluid = (((1 + Math.random()) * 0x10000) | 0).toString(16) + (((1 + Math.random()) * 0x10000) | 0).toString(16); //随机产生个10位字符串
                }


                // console.log(dataobj);


                var studyJsonDetailsJson = eval('(' + studyDetailsJson.json_details + ')'); //解析记忆内容

                if (studyJsonDetailsJson == undefined) {
                    studyJsonDetailsJson = null;
                }
                // 读取本地缓存，替换原来的
                var localmemary = GetlocalStorage("C_" + PlayCourse.courseId + "_" + QueryString("arrangeId"));
                if (localmemary == null || localmemary == undefined) {
                    localmemary = GetlocalStorage("C_" + PlayCourse.courseId);
                }
                //判断日期

                if (localmemary != null && localmemary != "" && localmemary != undefined && localmemary.list != undefined && localmemary.list.length > 0) {
                    if (studyJsonDetailsJson == null || studyJsonDetailsJson == undefined || studyJsonDetailsJson == "" || new Date(studyJsonDetailsJson.date_time) < new Date(localmemary.datetime)) {
                        studyJsonDetailsJson = localmemary;
                    }
                }
                console.log(studyJsonDetailsJson); //这里才是真正有用的东西
                if (studyJsonDetailsJson != null) {
                    // 异步读取书签正常
                    if (studyDetailsJson != undefined && studyDetailsJson != null
                                        && studyDetailsJson.json_details != ""
                                        && studyDetailsJson.json_details != "null") {
                        //console.log("读取学习记录");
                        csm = studyJsonDetailsJson;
                        //进入，如果已学习提交进度（防止不同任务同一课程不提交进度）
                        //isConfirmTongbu("aaa");
                        //console.log("已同步学习时间");
                    }
                    for (var i = 0; i < studyJsonDetailsJson.list.length; i++) { //遍历记录修改状态图标
                        // 学过的小节编号
                        var sectionId = studyJsonDetailsJson.list[i].pid;
                        // 是否完成该小节
                        var sectionLearnState = studyJsonDetailsJson.list[i].pstate;
                        // 小节学习了多长时间
                        var sectionTime_m = parseInt(studyJsonDetailsJson.list[i].learnTime / 60);
                        var sectionTime_s = studyJsonDetailsJson.list[i].learnTime % 60 < 10 ? "0" + studyJsonDetailsJson.list[i].learnTime % 60 : studyJsonDetailsJson.list[i].learnTime % 60;
                        $("#kecheng_" + sectionId + "_learnTime").html(sectionTime_m + ":" + sectionTime_s);
                        if (sectionLearnState == "1") { //状态为1代表学习完成
                            $("#kecheng_" + sectionId).find(".item-after").html("<i class=\"iconfont icon-shenhetongguo\" title=\"已学完\" style=\"color:#339966\"></i>");
                        }
                        else //有学习记录，但没完成，改为学习中
                        {
                            $("#kecheng_" + sectionId).find(".item-after").html("<i class=\"iconfont icon-icon27\" title=\"学习中\" style=\"color:#39f\"></i>");
                        }
                    }
                }

                //$.hidePreloader();//隐藏Loading
                //*****************************
                //3、正是开始播放课程内容
                //*****************************
                //alert('xxx');
                var isPaper = false;
                if (csm.playpid) {
                  //alert(csm.playpid);
                    //下拉刷新处理(重新查询绑定)
                    for (var i = 0; i < csm.list.length; i++) {
                        //有播放的小节id有对应的学习记录，小节是试卷，已完成

                        if (csm.playpid == csm.list[i].pid) {//&& csm.list[i].ptype == 3 && csm.list[i].pstate == 1
                          //alert('x');
                            isPaper = true;
                            break;
                        }
                    }
                    //当前小结是试卷，并且试卷已完成
                    if (isPaper) {
                    //  alert($("#kecheng_" + csm.playpid).html());
                        if ($("#kecheng_" + csm.playpid)) {
                            $("#kecheng_" + csm.playpid).click();
                          //  $("#kecheng_" + csm.playpid).click();
                        } else {
                            $("#kechengmingxi .item-content").eq(0).click();
                            $("#kechengmingxi .item-content").eq(0).click();
                        }
                    }
                } else { // 发现记忆的课程小节不存在的时候，跳到第一小节
                //  alert($("#kechengmingxi .item-content").eq(0).html());
                    // 找不到播放记忆，默认播放第一个
                    if ($("#kechengmingxi .item-content").length > 0) {

                        $("#kechengmingxi .item-content").eq(0).click();
                        $("#kechengmingxi .item-content").eq(0).click();

                    } else {
                        $.toast('课程还未增加内容哦！');
                    }
                }

                //$.hidePreloader();//隐藏Loading
            });
    } else {
        // 没有记忆，默认播放第一个
        if ($("#kechengmingxi .item-content").length > 0) {
            $("#kechengmingxi .item-content").eq(0).click();
            $("#kechengmingxi .item-content").eq(0).click();

        } else {
            $.toast('课程还未增加内容哦！');
        }
    }
});
//播放不同清晰度的视频
function switchVideo(okayUrl, title) {

    //关闭层
    $.closeModal('.popover-qingxidu');
    //判断清晰度
    $(".qingxidu").text(title); //清晰度

    //视频播放
    $("#kecheng_play_mian_top_play").show();
    $("#playText").hide();
    $("#kechengContent").css("top", "12rem");
    mainplayer("kecheng_play_mian_top_play", 634, okayUrl);

}
//开始播放记忆课程
function bofang(xiaojie) {
    //停止上一个课程的计时器
    //if(jisuJSQ != null){
    //       clearInterval(jisuJSQ);
    //        jisuJSQ = null;
    // }
    //切换小节时，提交该小节的进度
    if (csm.playpid != undefined && csm.playpid != null && csm.playpid.length > 0 && csm.playpid != xiaojie.CSID) {
        tongbu("aaa"); //同步上一小节的学习记录
    }

    $(".qingxidu").hide();
    //更新播放记录（本地）
    csm.playpid = xiaojie.CSID;

    // console.log(xiaojie);
    var sectionUrl = ""; //文件地址
    // 判断非ckt 的文件
    if (xiaojie.hasOwnProperty("CSFILEID") && (xiaojie.CSTYPE == 1 || xiaojie.CSTYPE == '1') && xiaojie.CSURLNAME.substr(xiaojie.CSURLNAME.lastIndexOf('.')).indexOf('.html') == -1) { //有多版本的情况下
        // console.log("xxxxxxxxxx");
        //获取清晰度
        getAjax(javaserver + "/course/findDefinition", {
            upid: xiaojie.CSFILEID
        }, function (data) {
            $(".qingxidu").show();
            var jsonlist = data;
            if (jsonlist.errorcode == "0" && jsonlist.datas.length >0) {
                //console.log(jsonlist.datas);
                var BDvideoList = new Array();
                var QNvideoList = new Array();
                var ServerVideoList = new Array();
                $.each(jsonlist.datas, function (i, item) {
                    var videoType = item.Name.split('_')[0];  //获取视频的清晰度  LG 蓝关  GQ 高清 CQ 超清  BQ 标清
                    if (item.Name.indexOf('enc') > 0) {  //名称中含有encryption，视频则为加密视频
                        console.log(item.Name + "因版权原因,本视频仅对APP或PC端进行播放！");
                        return true;
                    }
                    var videoYuan = item.Yuan;
                    var videodesc = 1;  //默认标清
                    var videoQXD = "标清(420P)";  //默认标清
                    if (videoType == "LG") {
                        videodesc = 4;
                        videoQXD = "蓝光";
                        videosite = "LG";
                    } else if (videoType == "GQ") {
                        videodesc = 2;
                        videoQXD = "高清(720P)";
                        videosite = "GQ";
                    } else if (videoType == "CQ") {
                        videodesc = 3;
                        videoQXD = "超高清(1080P)";
                        videosite = "CQ";
                    } else if (videoType == "BQ") {
                        videodesc = 1;
                        videoQXD = "标清";
                        videosite = "BQ";
                    } else {
                        videodesc = 5;
                        videoQXD = "原清";
                        videosite = "BQ";
                    }
                    if (videoYuan == "1") { //百度云
                        BDvideoList.push({
                            file: item.filepreview,
                            desc: videodesc,
                            qxd: videoQXD,
                            site: videosite
                        });
                    } else if (videoYuan == "2") { //七牛云
                        QNvideoList.push({
                            file: item.filepreview,
                            desc: videodesc,
                            qxd: videoQXD,
                            site: videosite
                        });
                    } else {  //本地服务器
                        ServerVideoList.push({
                            file: item.filepreview,
                            desc: videodesc,
                            qxd: videoQXD,
                            site: videosite
                        });
                    }
                });
                for (var i = 0; i < BDvideoList.length; i++) {
                    for (var j = i; j < BDvideoList.length - 1; j++) {
                        if (BDvideoList[i].desc > BDvideoList[j].desc) {
                            var temp = BDvideoList[i];
                            BDvideoList[i] = BDvideoList[j];
                            BDvideoList[j] = temp;
                        }
                    }
                }
                for (var i = 0; i < QNvideoList.length; i++) {
                    for (var j = i; j < QNvideoList.length - 1; j++) {
                        if (QNvideoList[i].desc > QNvideoList[j].desc) {
                            var temp = QNvideoList[i];
                            QNvideoList[i] = QNvideoList[j];
                            QNvideoList[j] = temp;
                        }
                    }
                }
                for (var i = 0; i < ServerVideoList.length; i++) {
                    for (var j = i; j < ServerVideoList.length - 1; j++) {
                        if (ServerVideoList[i].desc > ServerVideoList[j].desc) {
                            var temp = ServerVideoList[i];
                            ServerVideoList[i] = ServerVideoList[j];
                            ServerVideoList[j] = temp;
                        }
                    }
                }
                var videoHtml = "";
                if (BDvideoList != null && BDvideoList.length > 0) {
                    videoHtml += "<li><a class='list-button item-link' style=\"border-bottom: 1px #ddd solid; cursor: default;color:#999\">百度云</a></li>";
                    $.each(BDvideoList, function (i, item) {
                        videoHtml += "<li class=\"" + item.site + "\" data=\"" + item.file + "\" ><a href='#' class='list-button item-link'  onclick='switchVideo(\"" + item.file + "\",\"" + item.qxd + "\")'>" + item.qxd + "</a></li>";
                    });
                }
                if (QNvideoList != null && QNvideoList.length > 0) {
                    videoHtml += "<li><a class='list-button item-link' style=\"border-bottom: 1px #ddd solid; cursor: default;color:#999\">七牛云</a></li>";
                    $.each(QNvideoList, function (i, item) {
                        videoHtml += "<li class=\"" + item.site + "\" data=\"" + item.file + "\" ><a class='list-button item-link' href='#' onclick='switchVideo(\"" + item.file + "\",\"" + item.qxd + "\")'>" + item.qxd + "</a></li>";
                    });
                }

                if (ServerVideoList != null && ServerVideoList.length > 0) {
                    videoHtml += "<li><a class='list-button item-link' style=\"border-bottom: 1px #ddd solid; cursor: default;color:#999\">本地</a></li>";
                    $.each(ServerVideoList, function (i, item) {
                        videoHtml += "<li class=\"" + item.site + "\" data=\"" + item.file + "\" ><a class='list-button item-link' href='#' onclick='switchVideo(\"" + item.file + "\",\"" + item.qxd + "\")'>" + item.qxd + "</a></li>";
                    });
                }

                if (videoHtml != "") {
                    $(".videotypelist").html(videoHtml);
                    var okayUrl = "";
                    var qxd = "";

                    var editionData = {}; //主版本
                    jsonlist.datas.forEach(function (data, index) {
                        if (index == 0) {
                            editionData = data;
                        } else {
                            var d1 = new Date(editionData.UploadDate.replace(/\-/g, "\/")); //当前获得的最大日期
                            var d2 = new Date(data.UploadDate.replace(/\-/g, "\/")); //比对的日期
                            if (d2 > d1) {
                                editionData = data;
                            }
                        }
                    });

                    //找到最新的播放地址，清晰度
                    if (editionData != null) {
                        okayUrl = editionData.filepreview;
                        var videoType = editionData.Name.split('_')[0];  //获取视频的清晰度  LG 蓝关  GQ 高清 CQ 超清  BQ 标清
                        if (editionData.Name.indexOf('enc') > 0) {  //名称中含有encryption，视频则为加密视频
                            console.log(editionData.Name + "因版权原因,本视频仅对APP或PC端进行播放！");
                            return true;
                        }
                        if (videoType == "LG") {
                            qxd = "蓝光";
                        } else if (videoType == "GQ") {
                            qxd = "高清(720P)";
                        } else if (videoType == "CQ") {
                            qxd = "超高清(1080P)";
                        } else if (videoType == "BQ") {
                            qxd = "标清";
                        } else {
                            qxd = "原清";
                        }
                        //没找到，按清晰度播放
                    } else {
                        //寻找多版本视频中，默认播放的地址（优先级与PC端有所区别）
                        if ($(".videotypelist li[class='BQ']").eq(0).length > 0) {
                            okayUrl = $(".videotypelist li[class='BQ']").eq(0).attr("data");
                            qxd = $(".videotypelist li[class='BQ']").eq(0).text();
                        } else if ($(".videotypelist li[class='GQ']").eq(0).length > 0) {
                            okayUrl = $(".videotypelist li[class='GQ']").eq(0).attr("data");
                            if (qxd == "") {
                                qxd = $(".videotypelist li[class='BQ']").eq(0).text();
                            }
                        } else if ($(".videotypelist li[class='CQ']").eq(0).length > 0) {
                            okayUrl = $(".videotypelist li[class='CQ']").eq(0).attr("data");
                            if (qxd == "") {
                                qxd = $(".videotypelist li[class='BQ']").eq(0).text();
                            }
                        } else if ($(".videotypelist li[class='LG']").eq(0).length > 0) {
                            okayUrl = $(".videotypelist li[class='LG']").eq(0).attr("data");
                            if (qxd == "") {
                                qxd = $(".videotypelist li[class='BQ']").eq(0).text();
                            }
                        } else if ($(".videotypelist li[class='bendi']").eq(0).length > 0) {
                            okayUrl = $(".videotypelist li[class='bendi']").eq(0).attr("data");
                            if (qxd == "") {
                                qxd = $(".videotypelist li[class='BQ']").eq(0).text();
                            }
                        }
                        else {
                            qxd = "临时";
                            //文件转化中或转化出错了！(先播放转化前的版本)
                            okayUrl = jsonlist.datas[0].URL;
                        }
                    }
                    switchVideo(okayUrl, qxd);
                    //console.log("xxx"+okayUrl);

                } else {

                    qxd = "普清";
                    //文件转化中或转化出错了！(先播放转化前的版本)
                    okayUrl = xiaojie.CSURL;
                    if (okayUrl != "") {
                        switchVideo(okayUrl, qxd);
                    } else {
                        $.toast('无法解析到课程播放视频！');
                        $(".qingxidu").removeClass("qingxidu");
                    }
                }
            } else {
                //$.toast('课程视频解析错误！');
                sectionUrl = xiaojie.CSURL;//文件地址
                mainplayer("kecheng_play_mian_top_play", 634, sectionUrl);
                $(".qingxidu").removeClass("qingxidu");
            }
        });
        // 清除计时器
        clearInterval(jisuJSQ);
        jisuJSQ = null;
        jsqkq = false;
        // 防止暂停时值被更新
        setTimeout(function () { Tstate = 1; }, 500);
        //判断是否需要播放计时，如果需要启动计时器
        learningJSQ(xiaojie);
        //修改播放课程图标显示
        $("#kechengmingxi .item-content").removeClass("active");
        $("#kecheng_" + xiaojie.CSID).addClass("active");
        try {
            if (csm.list.length > 0) {
                for (var i = 0; i < csm.list.length; i++) {
                    if (csm.list[i].pid == xiaojie.CSID) { //说明记忆缓存中有数据
                        console.log(csm.list[i].learnTime);
                        CkSeek(csm.list[i].learnTime);
                        break;
                    }
                }
            }
        } catch (e) {

        }
        return;
    }
    else { //v1.0录入的数据
        sectionUrl = xiaojie.CSURL; //文件地址
    }

    var CSTIME = xiaojie.CSTIME; //要求学习时间

    // 根据小节判断接下来的动作
    switch (xiaojie.CSTYPE) {
        case '1':
        case 1:
            // 视频类型

            $("#kecheng_play_mian_top_play").show();
            $("#playText").hide();
            $("#kechengContent").css("top", "12rem");
            mainplayer("kecheng_play_mian_top_play", 634, sectionUrl);
            break;
        case '2':
        case 2:
            // 文档类型
            $("#kechengContent").css("top", "1.7rem");
            $("#kecheng_play_mian_top_play").hide();
            $("#playText").show();
            if (CKobject && CKobject.getObjectById('ckplayer_a1')) {
                CKobject.getObjectById('ckplayer_a1').videoPause();
            }
            mainplayer("playText", 634, sectionUrl);
            break;
        case '3':
        case 3:
            // 考试类型
            $("#kecheng_play_mian_top_play").show();
            $("#playText").hide();
            $("#kechengContent").css("top", "12rem");
            $("#kecheng_play_mian_top_play").html("<div class='shanguang'>" + getLogo() + "<div class='baiguang'></div></div>");
            playSectionalExamination(xiaojie);

            break;
        case '4':
        case 4:
            $("#kecheng_play_mian_top_play").hide();
            $("#playText").show();
            $("#kechengContent").css("top", "1.7rem");
            if (CKobject.getObjectById('ckplayer_a1')) {
                CKobject.getObjectById('ckplayer_a1').videoPause();
                //mainplayer("playText", 634, sectionUrl);
            }
            // 线下授课类型
            playTeachingOffline("playText", xiaojie);
            break;
        case '6':
        case 6:
            $("#kecheng_play_mian_top_play").show();
            $("#playText").hide();
            $("#kechengContent").css("top", "12rem");
            $("#kecheng_play_mian_top_play").html("<div class='shanguang'>" + getLogo() + "<div class='baiguang'></div></div>");
            if (CKobject.getObjectById('ckplayer_a1')) {
                CKobject.getObjectById('ckplayer_a1').videoPause();
                //mainplayer("playText", 634, sectionUrl);
            }
            //直播
            playLive(xiaojie);
            break;
        case '8':
        case 8:
            $("#kecheng_play_mian_top_play").hide();
            $("#playText").show();
            // 图文类型
            $("#kechengContent").css("top", "1.7rem");
            if (CKobject.getObjectById('ckplayer_a1')) {
                CKobject.getObjectById('ckplayer_a1').videoPause();
                //mainplayer("playText", 634, sectionUrl);
            }
            xiaojie.fileTxt = jisuDecode(xiaojie.fileTxt);
            xiaojie.CSTITLE = jisuDecode(xiaojie.CSTITLE);
            playImageText("playText", xiaojie);
            break;
        default:
            $("#kecheng_play_mian_top_play").show();
            $("#playText").hide();
            $("#kechengContent").css("top", "12rem");
            $("#kecheng_play_mian_top_play").html("<div class='shanguang'>" + getLogo() + "<div class='baiguang'></div></div>");
            $.toast("此课程暂未开放");
            break;
    }

    // 清除计时器
    clearInterval(jisuJSQ);
    jisuJSQ = null;
    jsqkq = false;
    //CKobject.getObjectById('ckplayer_a1').videoPause();
    // 防止暂停时值被更新
    setTimeout(function () { Tstate = 1; }, 500);
    //判断是否需要播放计时，如果需要启动计时器
    learningJSQ(xiaojie);


    //修改播放课程图标显示
    $("#kechengmingxi .item-content").removeClass("active");
    $("#kecheng_" + xiaojie.CSID).addClass("active");

}
//考试功能
var playSectionalExamination = function (courseDetailedJson) {
    if (!QueryString("courseId")) {
        var userid = getUserInfo().user_ID;
        var playid = courseDetailedJson.CSID;

        var arrId = GetlocalStorage("studyArrangeId");
        if (QueryString("arrangeId") != undefined && QueryString("arrangeId") != null) {
            arrId = QueryString("arrangeId");
        }
        if (arrId == null || arrId == undefined || arrId == "undefined" || arrId == "null") {
            $.toast("参数错误！");
            return;
        }
        $.confirm("本章节为在线考试，是否确认打开试卷？", function () {
            //tongbu("aaa");
            if (courseDetailedJson.CRANDIM == 0) {
                var num = Math.floor(Math.random() * courseDetailedJson.CSPCOUNT + 1);
                window.location = javafile + "/resources/exam/" + courseDetailedJson.CSPID + "," + courseDetailedJson.CSPCOUNT + "/" + num + ".html?cid=" + csm.key + "&playid=" + playid + "&userid=" + userid + "&arrangeId=" + arrId + "&token=" + strToJson(GetlocalStorage("userinfo_token"));
            } else {
                window.location = javafile + "/resources/exam/" + courseDetailedJson.CSPID
                    + "/" + courseDetailedJson.CSPID + ".html?cid="
                    + csm.key + "&playid=" + playid + "&userid=" + userid + "&arrangeId=" + arrId + "&token=" + strToJson(GetlocalStorage("userinfo_token"));
            }
        });
    } else {
        goLogin();
    }
}
//直播
var playLive = function (xiaojie) {
    sysUserInfo = strToJson(GetlocalStorage("userinfo"))
    // 直播类型
    var myDate = new Date(); //获取系统当前时间
    var usersysdate = myDate.getFullYear() + "-" + parseInt(myDate.getMonth() + 1) + "-" + myDate.getDate() + " " + myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds();
    var livetimeout = GetDateDiff(xiaojie.CSSTIME, usersysdate, "hour");
    console.log(livetimeout);
    if (livetimeout >= 4) {
        $.confirm("直播已经结束，前往观看回放？", function () {
            // tongbu("aaa");
            getAjax(javaserver + "/live/getTiket", { orgId: sysUserInfo.organization_ID, userId: sysUserInfo.user_ID, username: sysUserInfo.user_Name }, function (data) {
                if (data.errorcode == "0") {
                    var data = JSON.parse(data.data);
                    if (data.state == "101") {
                        window.location = xiaojie.liveObj.record_htm + "?ticket=" + data.ticket + "&uid=" + sysUserInfo.user_ID + "&uname=" + encodeURI(encodeURI(sysUserInfo.user_Name)) + "&img=" + encodeURI(encodeURI(systemTitle + "/resources/logo/" + sysUserInfo.organization_ID + "_1.png"));
                    }
                }
            });
        });
    } else {
        $.confirm("该章节是直播课程，点击确定立即前往观看？", function () {
            //  tongbu("aaa");
            getAjax(javaserver + "/live/getTiket", { orgId: sysUserInfo.organization_ID, userId: sysUserInfo.user_ID, username: sysUserInfo.user_Name }, function (data) {
                if (data.errorcode == "0") {
                    var data = JSON.parse(data.data);
                    if (data.state == "101") {
                        window.location = xiaojie.liveObj.stu_htm + "?ticket=" + data.ticket + "&uid=" + sysUserInfo.user_ID + "&uname=" + encodeURI(encodeURI(sysUserInfo.user_Name)) + "&img=" + encodeURI(encodeURI(systemTitle + "/resources/logo/" + sysUserInfo.organization_ID + "_1.png"));
                    }
                }
            });
        });
    }
}
//跳转登录页
function goLogin() {
    $("#kecheng_play_mian_top_play").show();
    $("#playText").hide();
    $("#kechengContent").css("top", "12rem");
    $("#kecheng_play_mian_top_play").html("<div class='shanguang'>" + getLogo() + "<div class='baiguang'></div></div>");
    $.confirm("查看该小节需要用户登录，是否前往登录？", function () {
        //需要记录当前地址
        $.router.back("../ypylogin.html");
    });
}
// 线下授课
this.playTeachingOffline = function (divid, courseDetailedJson) {
    //是否只拿到地址进入
    if (!QueryString("courseId")) {
        //放入对象中
        var xxobj = { pid: courseDetailedJson.CSID, ptype: 4, pstate: 1 };


        var days = null;
        var nowDate = new Date();
        if (courseDetailedJson.CSSTIME == undefined || courseDetailedJson.CSSTIME == "")
            days = "999";
        else {

            var datereplace = startTime = courseDetailedJson.CSSTIME.replace(/\-/g, "/");
            console.log(datereplace);
            var startDate = new Date(datereplace);

            var nowDateTime = nowDate.getTime();
            var startDateTime = startDate.getTime();

            // 计算相差天数
            if (nowDateTime >= startDateTime)
                days = 0;
            else
                days = -(Math.floor((nowDateTime - startDateTime)
                        / (24 * 3600 * 1000)));


        }

        // 线下授课
        // html 内容
        var enrolHtml = "<div class='content-padded'>"
                + "         <h2>" + courseDetailedJson.CSNAME + "</h2>"
                + "                 <ul>"
                + "                     <li><i class='iconfont icon-dizhi'></i> 报名地址："
                + courseDetailedJson.CSURL
                + "</li>"
                + "                     <li><i class='iconfont icon-44'></i> 报名人数：<span class='enrol_prople_num' id=\"enrol_prople_num\">0</span> / "
                + (courseDetailedJson.CSPNUM == null ? "无限制"
                        : courseDetailedJson.CSPNUM)
                + "</li>"
                + "                     <li><i class='iconfont icon-riqi2'></i> 截止时间："
                + (courseDetailedJson.CSSTIME == undefined ? "无限制"
                        : courseDetailedJson.CSSTIME)
                + "</li>"
                + "                     <li><i class='iconfont icon-jilu'></i> 课程简介：</li>"
                + "                     <li class='enrol_content_li_indent'>"
                + "                         <span>"
                + (courseDetailedJson.hasOwnProperty("CSDESCRIBE") ? courseDetailedJson.CSDESCRIBE
                        : "该线下授课课程暂时没有课程简介")
                + "</span></li>"
                + "                 </ul>"
                + "             <div class='enrol_course_info_btn'>"
                + "                 <div class='enrol_course_info_btn_content'>"
                + "                     <div class='enrol_course_info_btn_content_header'>距离开始时间<span class='enrol_course_info_overplus_day'><span class='enrol_course_info_overplus_day_num'>"
                + days
                + "</span>"
                + (courseDetailedJson.CSSTIME == undefined ? "" : "天")
                + "</span></div>"
                + "                 <div class='enrol_course_info_btn_bottom'><button disabled='disabled' id='enrol_course_info_bottom_button' class='enrol_course_info_btn_bottom_closed' type='button'></button></div>"
                + "             </div>";


        $("#" + divid).html(enrolHtml);
        // 查看当前用户是否报名小节

        getAjax(javaserver + "/courseSectionEnrol/findSectionEnrolStatus", { //查询报名记录
            sectionId: courseDetailedJson.CSID,
            userId: getUserInfo().user_ID
        }, function (json) {
            //console.log(json)
            // 成功
            var enrolJson = json;
            // 判断后台是否出现异常
            if (enrolJson.errorcode != "0") {
                $.toast("获得报名信息")
                return;
            }
            if (days <= 0) {
                // 截止
                return;
            }
            var enrolButtonTag = $(".enrol_course_info_btn_bottom_noenrol,.enrol_course_info_btn_bottom_closed");
            // 报名过了
            if (enrolJson.datas.length > 0) {
                enrolButtonTag
                            .removeClass("enrol_course_info_btn_bottom_noenrol enrol_course_info_btn_bottom_closed")
                            .addClass("enrol_course_info_btn_bottom_info");
                return;
            }
            enrolButtonTag.removeClass("enrol_course_info_btn_bottom_closed")
                        .addClass("enrol_course_info_btn_bottom_noenrol").removeAttr(
                                "disabled");
            // 监听按钮的 click 事件
            enrolButtonTag.click(
                      function () {
                          if (courseDetailedJson.CSSTIME != undefined) {
                              var nowDateTime = nowDate.getTime();
                              // 防止用户在点击报名时
                              // 客户端时间(刚进页面时相同,但是在页面挂机挂了好几天，已经过了截止日期什么的)和本地时间不相同
                              if (nowDateTime >= startDateTime) {
                                  $("#enrol_course_info_bottom_button").removeClass(
                                "enrol_course_info_btn_bottom_noenrol").addClass(
                                        "enrol_course_info_btn_bottom_closed");
                                  showAlert("info", "alert", "课程播放提示", "已过报名时间!", 200);
                                  return;
                              }
                          }

                          // 进行报名小节(section)
                          getAjax(javaserver + "/courseSectionEnrol/enrolSection", {
                              userInfoJson: JSON.stringify(getUserInfo()),
                              courseId: csm.key,
                              sectionId: courseDetailedJson.CSID,
                              //线下结束时间
                              //用于向消息提醒表添加数据
                              //展示于学员段未来七天结束的任务或线下
                              endDate: courseDetailedJson.CSSTIME,
                              address: courseDetailedJson.CSURL//线下报名地址
                          }, function (data) {
                              var json = data;
                              // 报名完毕后
                              // alert(json.errorcode + ":" + json.errormsg);
                              // 小节 id
                              var svgTag = $("svg[class$='" + courseDetailedJson.pid
                                    + "']")
                              svgTag.parent().removeClass("svg-icon-jyx")
                                    .addClass("svg-icon-ywc");
                              svgTag.children("use").attr("xlink:href",
                                    "#icon-chenggong1");
                              $("#enrol_prople_num").html(
                                    parseInt($("#enrol_prople_num").html()) + 1);
                              $("#enrol_course_info_bottom_button").removeClass(
                            "enrol_course_info_btn_bottom_noenrol").addClass(
                            "enrol_course_info_btn_bottom_info");
                          })
                      })
        })

        // 获取报名人数
        getAjax(javaserver + "/courseSectionEnrol/findSectionEnrolPeopleNum", {
            sectionId: courseDetailedJson.CSID
        }, function (json) {
            var enrolJson = json;
            // 判断后台是否出现异常
            if (enrolJson.errorcode != "0") {
                $.toast("获得报名信息");
                return;
            }
            $("#enrol_prople_num").html(enrolJson.data);
            //已达到最大人数
            if (courseDetailedJson.CSPNUM != null && courseDetailedJson.CSPNUM <= enrolJson.data) {
                $("#enrol_course_info_bottom_button").attr("disabled", "disabled");
                $("#enrol_course_info_bottom_button").removeClass(
                            "enrol_course_info_btn_bottom_noenrol").addClass(
                            "enrol_course_info_btn_bottom_closed");
            }
        });

        //检查是否已存在
        var isHavexx = false;
        for (var i = csm.list.length - 1; i >= 0; i--) {
            if (courseDetailedJson.CSID == csm.list[i].pid) {
                isHavexx = true;
            }
        }
        //已存在就不需要再提交了
        if (!isHavexx) {
            csm.list.push(xxobj);
            courseDetailedJson.pstate = 1; // 修改当前小节的完成状态
            //更新数据
            xuewan(courseDetailedJson);
        }
    } else {

        goLogin();
    }
}
// 图文类型
this.playImageText = function (divid, courseDetailedJson) {
    var enrolHtml = "<div class='content-padded'>"
            + "<h2>"
            + courseDetailedJson.CSNAME + "</h2>"
            + courseDetailedJson.fileTxt + "</div>";

    $("#" + divid).html(enrolHtml);
    //检查是否已存在
    var isHavetw = false;
    for (var i = csm.list.length - 1; i >= 0; i--) {
        if (courseDetailedJson.CSID == csm.list[i].pid) {
            isHavetw = true;
        }
    }
    //已存在就不需要再提交了
    if (!isHavetw) {
        var twobj = { pid: courseDetailedJson.CSID, ptype: 8, pstate: 1 };
        csm.list.push(twobj);
        xuewan(courseDetailedJson); //点完就学完
    }
}
//小节学完，更新数据
this.xuewan = function (courseDetailedJson) {
    //     //更新本地数据
    //    for (var i = csm.list.length - 1; i >= 0; i--) {
    //         if(csm.list[i].pid == courseDetailedJson.CSID)//找到这个记录
    //         {
    //            csm.list.splice(i,1);//清除原有记录

    //            csm.list[i].push(courseDetailedJson);//更新新数据

    //            break;//找到合适的了，就要跳出循环，性能！
    //          }
    //    }
    //更新服务器信息
    isConfirmTongbu();
    //更新界面样式
    $("#kecheng_" + courseDetailedJson.CSID).find(".item-after").html("<i class=\"iconfont icon-shenhetongguo\" title=\"已学完\" style=\"color:#339966\"></i>");
}
//计时器，分析课程是否需要计时，如果需要进行统计
function learningJSQ(xiaojie) {
    //只有在指定要求学习时间不为0，并且学习时间未满时启动计时器
    //console.log(xiaojie);
    if (xiaojie.hasOwnProperty("CSTIME"))//需要计时才有这个属性
    {

        //获得课程记录，判断是否已经学完
        var newjilu = 0;
        if (csm.hasOwnProperty("list")) {
            for (var i = csm.list.length - 1; i >= 0; i--) {
                if (csm.list[i].pid == xiaojie.CSID)//找到这个记录
                {

                    //csm.list[i].learnTime 学习时间
                    //csm.list[i].pstate 1为完成
                    if (csm.list[i].pstate != 1) {
                        csm.list[i].cstime = xiaojie.CSTIME; //为了解决如果课程要求学习变化这种情况
                        //启动计时器开始计时
                        jishiqi(csm.list[i]);
                    }
                    else {
                        console.log("本课程已经达到指定学时，不进行计时业务");
                    }
                    newjilu = 1; //找到了
                    break; //找到合适的了，就要跳出循环，性能！
                }
            }
        }
        else {
            csm.list = [];
        }

        //如果没有找到学习记录，则创建新纪录
        if (newjilu == 0) {
            var newcms = {};
            newcms.pid = xiaojie.CSID; //记录小节DI
            newcms.ptype = xiaojie.CSTYPE; //课程类型
            newcms.cstime = xiaojie.CSTIME; //要求学习时间
            newcms.playTime = 0; //视频播放时长
            newcms.learnTime = 0; //已经学习时长
            newcms.pstate = 0; //完成状态
            csm.list.push(newcms);
            jishiqi(newcms);
        }


    }
    //学够制定的学时后，更新学习记录，同步记录到服务器
    //tongbu();
}
var jisuJSQ = null, //声明个计时器容器
jsqkq = false; //是否开启计时
function jishiqi(jilu) {
    var jsdw = 1; //计时器执行间隔时间，单位（秒）
    //console.log("计时器走秒："+jilu.learnTime);
    //console.log(new Date().getSeconds());//测试执行情况
    jilu.learnTime = jilu.learnTime + jsdw; //叠加学时
    var m = parseInt(jilu.learnTime / 60); // 分钟
    var s = jilu.learnTime % 60 < 10 ? "0" + jilu.learnTime % 60 : jilu.learnTime % 60;
    var isplayer = false;
    try {
        isplayer = CKobject.getObjectById('ckplayer_a1').getStatus().play; //获取播放器当前的播放状态,主要是解决ios手机端，视频不会播放，当时下面会自己走计时的问题
    } catch (e) {
        isplayer = false;
    }

    if (parseInt(jilu.learnTime) >= parseInt(jilu.cstime) * 60)//已经达标，更新完成状态
    {
        jilu.pstate = 1;
        $("#kecheng_" + jilu.pid + "_learnTime").html(jilu.cstime); // 更新页面时间
        $("#kecheng_" + jilu.pid).find(".item-after").html("<i class=\"iconfont icon-shenhetongguo\" title=\"已学完\" style=\"color:#339966\"></i>");
    } else {
        //if(isplayer || isplayer == "true"){
        $("#kecheng_" + jilu.pid + "_learnTime").html(m + ":" + s); // 更新页面时间
        //        }else{  //未播放不走下面的业务
        //            return;
        //        }
    }
    //更新总体学习记录
    for (var i = csm.list.length - 1; i >= 0; i--) {
        if (csm.list[i].pid == jilu.pid)//找到这个记录
        {
            csm.list.splice(i, 1); //清除原有记录
            csm.list.push(jilu); //更新新数据
            //找到记录更新本地缓存
            csm.datetime = new Date();
            SetlocalStorage("C_" + csm.key + "_" + QueryString("arrangeId"), JSON.stringify(csm));
            break; //找到合适的了，就要跳出循环，性能！
        }
    }
    if (parseInt(jilu.learnTime) >= parseInt(jilu.cstime) * 60)//已经达标，学完了
    {
        console.log("课程已完成");
        if (jsqkq == true) {
            clearInterval(jisuJSQ);
            jisuJSQ = null;
            jsqkq = false;
        }
        isConfirmTongbu("aaa"); //学完了同步下数据
    }
    else {
        if (jsqkq == false) {
            //alert("axc");
            jsqkq = true;
            jisuJSQ = setInterval(function () { if (Tstate == 1) jishiqi(jilu) }, jsdw * 1000);
        }
    }
}
//将学习记录与服务器同步
var jiluid = "";
function tongbu(msg, istongbu) {
    // console.log("xxx");
    //从微信过来会有courseId
    //将数据同步到服务器
    // {timeStart:"",timeEnd:"",cousreid:"",csid:"",sectionName:"",courseType:"",dateLearn:""};
    var newjson = "";
    if (newStudyDetailsJson != null && newStudyDetailsJson != "") {
        newStudyDetailsJson.timeEnd = new Date().format("yyyy-MM-dd hh:mm:ss"); //结束时间
        newStudyDetailsJson.cousreid = csm.key; //课程id
        newStudyDetailsJson.csid = csm.playpid; //播放的小节id
        newStudyDetailsJson.sectionName = $("#kecheng_" + csm.playpid + " .item-title").html(); //播放小节的名称

        for (var i = 0; i < csm.list.length; i++) {
            if (csm.list[i].pid == csm.playpid) {
                newStudyDetailsJson.courseType = csm.list[i].ptype; //播放小节的类型
                if (csm.list[i].ptype != 1 && csm.list[i].ptype != "1" && csm.list[i].ptype != "2" && csm.list[i].ptype != 2) {
                    newStudyDetailsJson = null;
                }
                break;
            }
        }
        if (newStudyDetailsJson != null && (newStudyDetailsJson.courseType == 1 || newStudyDetailsJson.courseType == "1" || newStudyDetailsJson.courseType == 2 || newStudyDetailsJson.courseType == "2")) {
            newjson = "[" + JSON.stringify(newStudyDetailsJson) + "]"
        }
    }
    //提交的json
    var smallJson = {};
    $.extend(smallJson, csm);
    smallJson.list = [];
    //当前播放的json
    var smallObj = null;
    for (var i = 0; i < csm.list.length; i++) {
        if (csm.list[i].pid == csm.playpid) {
            smallObj = csm.list[i];
            break;
        }
    }
    if (smallObj == null || smallObj == "") {
        return;
    }
    smallJson.list.push(smallObj);

    var arrId = GetlocalStorage("studyArrangeId");

    if (QueryString("arrangeId") != undefined && QueryString("arrangeId") != null) {
        arrId = QueryString("arrangeId");
    }

    if (csm.key == null || csm.key == undefined || arrId == undefined || arrId == null) {
        $.toast("参数错误！");
        return;
    }
    var canshu = {
        jsonDetails: JSON.stringify(smallJson), //课程学习记录
        studyDetailsId: jiluid, //存档ID
        courseId: csm.key, //课程ID
        dateTime: "[]", //暂无用处
        arrangeId: arrId, //培训任务ID
        orgId: getUserInfo().organization_ID, //组织架构ID
        newStudyDetailsJson: newjson, //学习时段
        userId: getUserInfo().user_ID //学习人员ID
    };
    //console.log(canshu);
    getAjax(javaserver +
        "/coursedetailed/Uploadprogress",
        canshu,
        function (data) {
            if (data != "") {
                //  jiluid = data;//返回值为记录ID
            }
            if (msg == undefined)
                $.toast("学习记录同步成功！");
            localStorage.removeItem("C_" + csm.key);
            //重新开始计时
            initStartTime();
        }, function (e) {
            console.log(e);
            if (errorTBCont == 0) {
                tongbuCS = canshu;
                errorTongbu(canshu, "123");
            }
        }, '', '', istongbu);

    //        //如果没有公开课模块，但是任务id为1，提交一下日志
    //        if(!showCourse&&(arrId==undefined||arrId==null||arrId==""||arrId=="undefined"||arrId==1||arrId=="1")){
    //             getAjax(javaserver+"/coursetime/addLogs",
    //                {userid:getUserInfo().user_ID,content:"任务id异常，提交参数："+JSON.stringify(canshu)+"，页面地址："+window.location.href},
    //                function(data){
    //                    if(data.errorcode!="0"){
    //                        console.log("提交异常日志失败");
    //                    }
    //                });
    //        }

}

var errorTBCont = 0; //错误提交的次数,只提交三次
var tongbuCS = {}; //错误提交参数
//进度未提交上
function errorTongbu(canshu, msg) {
    errorTBCont = errorTBCont + 1;

    if (errorTBCont > 3) {
        $.toast("记录提交失败，请检查网络！");
        return;
    }
    $.toast("正在重新提交，第" + errorTBCont + "次重试");
    getAjax(javaserver +
        "/coursedetailed/Uploadprogress",
        canshu,
        function (data) {

            setTimeout(function () {
                $.toast("学习记录同步成功！");
            }, 1000);
            localStorage.removeItem("C_" + csm.key);
            errorTBCont = 0; //错误提交的次数
            tongbuCS = {}; //错误提交参数
            //重新开始计时
            initStartTime();
        }, function (e) {
            setTimeout(function () {
                console.log(e);
                tongbuCS = canshu;
                errorTongbu(canshu, "123");
            }, 5000);

        });

}
function isConfirmTongbu(msg) {
    if (!QueryString("courseId")) {
        if (msg == undefined) {
            tongbu();
        } else {
            tongbu(msg);
        }
    }
}
// 内容加载器
var mainplayer = function (Cantent, Height, mima) {
    sysUserInfo = getUserInfo();
    if (mima.indexOf("?") != -1) {
        mima = mima + "&"
    } else {
        mima = mima + "?"
    }
    mima = mima + "userid=" + sysUserInfo.user_ID + "&orgid=" + sysUserInfo.organization_ID;
    // / <summary>
    // / 总内容加载器，可装载各类内容
    // / </summary>
    // 设置外框架
    $("#" + Cantent).height("10rem");
    // 设置课程列表
    $("#kechengContent").css("top", "12rem");
    this.AddHtml = function (Cantent, Height, mima) {
        // / <summary>
        // / 静态类内容
        // / </summary>
        $("#" + Cantent).html("");
        $("#" + Cantent).append(
                "<iframe class=\"embed-responsive-item\" style=\"height:16rem\" src='" + mima
                        + "'></iframe>");
        // 设置外框架
        $("#" + Cantent).height("16rem");
        // 设置课程列表
        $("#kechengContent").css("top", "18.2rem");
    }
    this.AddVideo = function (Cantent, Height, mima) {
        // / <summary>
        // / 增加视频组件
        // / </summary>
        videoplayer.play(Cantent, Height, mima);
    }
    this.ADDflash = function (Cantent, Height, mima) {
        // / <summary>
        // / 增加FLASH组件
        // / </summary>
        $("#" + Cantent).html("<div id='a1' style='height:100%'></div>");
        var params = {
            bgcolor: '#000',
            allowFullScreen: true,
            allowScriptAccess: 'always',
            wmode: 'opaque'
        };
        var flashvars = {};
        var attributes = {
            id: 'game_ring',
            name: 'game_ring'
        };
        swfobject.embedSWF(mima, "a1", "100%", Height, "10.2.0",
                "expressInstall.swf", flashvars, params, attributes); //这个swf是flash安装包

    }
    this.AddSanFang = function (Cantent, Height, mima) {
        // / <summary>
        // / 暂时不支持的后缀名格式，提供下载
        // / </summary>
        $("#" + Cantent)
         .html(
         "<div class=\"jumbotron\"><center><a class=\"btn btn-info btn-lg\" href=\""
         + mima + "\" target=\"_blank\" role=\"button\"><i class=\"glyphicon glyphicon-download\"></i> 点击下载</a></center></div>");

    }
    this.AddOffice = function (Cantent, Height, mima) {
        // 设置外框架
        $("#" + Cantent).height("auto");
        // 设置课程列表
        $("#kechengContent").css("top", "2.2rem");
        // / <summary>
        // / 增加文档播放组件
        // / </summary>
        $("#" + Cantent).html("<iframe class=\"embed-responsive-item\" src='"
         + javafile + "/resources/pdf2/officeshow/web/viewer.html?file=" +
          base64encode(encodeURI(mima)) + "'></iframe>");
    }

    var houzhui = mima.substring(mima.lastIndexOf(".") + 1).toLowerCase(); // 获得主视频后缀名(转小写)
    if (houzhui.indexOf("?") >= 0) {
        houzhui = mima.substring(mima.lastIndexOf(".") + 1, mima
                .lastIndexOf("?"));
    }
    houzhui = houzhui.toLocaleLowerCase();
    if (houzhui == "htm" || houzhui == "html" || houzhui == "shtml") {
        // 静态类内容
        AddHtml(Cantent, Height, mima);
    } else if (houzhui == "flv" || houzhui == "mp4" || houzhui == "mp3" || houzhui == "f4v"
            || houzhui == "m3u8" || houzhui == "webm" || houzhui == "ogg") {
        // 网络视频类内容
        AddVideo(Cantent, Height, mima);
    } else if (houzhui == "pdf") {
        AddOffice(Cantent, Height, mima);
    } else if (houzhui == "doc" || houzhui == "docx" || houzhui == "xls"
            || houzhui == "xlsx" || houzhui == "ppt" || houzhui == "pptx") {
        $.toast("文档格式需要转成PDF格式");

        return false;
    } else if (houzhui == "swf") {
        // flash动画或播放器格式
        ADDflash(Cantent, Height, mima);
    } else if (houzhui == "jpg" || houzhui == "png" || houzhui == "gif") {
        $("#" + Cantent)
                .append(
                        "<img src=\""
                                + mima
                                + "\" class=\"img-responsive\" alt=\"Responsive image\">");
    } else {
        // 其他乱七八糟视频格式
        AddSanFang(Cantent, Height, mima);
        return false;
    }
}

// 封装一个flash+HTML5播放器
var videoplayer = new function () {

    // / <summary>
    // / 播放器操作类（FLASH+HTML5）
    // / </summary>
    this.play = function (Cantent, Height, mima) {
        // / <summary>
        // / 播放方法
        // / </summary>
        // / <param>
        // / Cantent容器ID，Height显示高度，mima密文
        // / </param>
        $("#" + Cantent).html("<div id='a1' style='height:100%'></div>");
        var params = {
            bgcolor: '#fff',
            allowFullScreen: true,
            allowScriptAccess: 'always',
            wmode: 'opaque'
        };
        var video = [mima + '->video/mp4'];
        var flashvars = {
            f: mima.replace('\\', '/'),
            c: 0,
            p: 1,
            b: 0,
            h: 3,
            my_url: encodeURIComponent(window.location.href),
            loaded: 'loadedHandler'
        }; // 还要增加其他参数
        // 本处预留课程脚本加载
        // 为flashvars补充k参数，n参数
        var curWwwPath = window.document.location.href;
        var pathName = window.document.location.pathname;
        var pos = curWwwPath.indexOf(pathName);
        var host = curWwwPath.substring(0, pos);
        var support = ['iPad', 'iPhone', 'ios', 'android+false', 'msie10+false'];
        CKobject.embed('/resources/ckplayer/ckplayer.swf', 'a1', 'ckplayer_a1', '100%', '100%', false, flashvars, video, params);
        //$("#" + Cantent).html("<video style=\" width:100%; height:100%;\" controls=\"controls\" autoplay><source src=\""+mima+"\" type=\"video/mp4\"></video>");
        // CKobject.embedHTML5('a1','ckplayer_a1','100%','100%',video,flashvars,support);
    }
    window.zantingdian = -1; // 上一次暂停点记录（防止重复暂停）
    window.loadedHandler = function () {
        CKobject.getObjectById('ckplayer_a1').videoPlay();
        // / <summary>
        // / 播放器加载完成监听
        // / </summary>
        Tstate = 1;
        if (CKobject.getObjectById('ckplayer_a1').getType()) {    // html5
            // 播放与暂停监听
            CKobject.getObjectById('ckplayer_a1').addListener('play', Ckplay);
            CKobject.getObjectById('ckplayer_a1').addListener('pause', Ckpause);

            // 增加播放时间监听
            CKobject.getObjectById('ckplayer_a1').addListener('time', timego);

            // 增加播放完成的监听,延时是因为需要等播放器加载完成
            CKobject.getObjectById('ckplayer_a1').addListener('ended',
                    VideoPlayEndedHandler);
        } else {
            // 播放与暂停监听
            CKobject.getObjectById('ckplayer_a1').addListener('play', 'Ckplay');
            CKobject.getObjectById('ckplayer_a1').addListener('pause', 'Ckpause');

            // 增加播放时间监听
            CKobject.getObjectById('ckplayer_a1').addListener('time', 'timego');

            // 增加播放完成的监听,延时是因为需要等播放器加载完成
            CKobject.getObjectById('ckplayer_a1').addListener('ended',
                    'VideoPlayEndedHandler');
        }

    }
    window.Ckplay = function () {
        // / <summary>
        // / 播放器开始播放触发
        // / </summary>
        Tstate = 1;
        // CKobject.getObjectById('ckplayer_a1').videoPlay();
    }
    window.Ckpause = function () {
        // / <summary>
        // / 播放器暂停时触发
        // / </summary>
        Tstate = 0;
        // CKobject.getObjectById('ckplayer_a1').videoPause();
    }
    window.timego = function (times) {
        // / <summary>
        // / 监听视频播放时间
        // / </summary>
        courseMemoryObj.playTime = times;

        // 时间脚本事件在这里运行
    }
    window.CkSeek = function (jytime) {
        //指定时间条状
        try {
            // 延迟加载，播放器肯能还为加载完成
            setTimeout(function () {
                try {
                    CKobject.getObjectById('ckplayer_a1').videoSeek(jytime);
                } catch (e) {
                }
            }, 1000)
        } catch (e) {
        }
    }
    window.VideoPlayEndedHandler = function () {
        mainplayerStop();
    }
}
//播放时间监控
function ckplayer_status(str) {
    //console.log(str);
}
//课程播放完成后触发
function mainplayerStop() {
    // body...
    $.alert("课程播放完成！");
}
function mainplayerSeek() {
    // / <summary>
    // / 讲播放内容跳转到制定位置
    // / </summary>
    if (courseMemoryObj.ptype == 1) {// 当视频情况下
        CkSeek(courseMemoryObj.playTime);
    } else if (courseMemoryObj.ptype == 2) {// 文档自动翻页
        // &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&//
        // &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&//
    }
}
