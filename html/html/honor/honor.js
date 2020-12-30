var totleHonor = {};

//查询用户的参数
var params = {
    honorfid: totleHonor.honorId,
    orgid: "",
    userid: "",
    honorid: "",
    honorRank: "",
    states: "1",
    pageIndex: 1,
    pageSize: 10
};
var hadLevel = null; //当前拥有的等级
var nowLevel = null; //当前选中的等级(默认是父级)
//**********************************************************************
//打开荣誉详情触发
//**********************************************************************
$(document).on("pageInit", "#honor_detail", function (e, id, $page) {

    sysoUserInfo = getUserInfo(); //用户信息
    params.orgid = sysoUserInfo.organization_ID;
    params.userid = sysoUserInfo.user_ID;
    //这是最大级的荣誉，里面包含所有子集荣誉
    totleHonor = GetlocalStorage("honorDetail");
    if (totleHonor == undefined || totleHonor == null || totleHonor.length <= 0) {
        return;
    }
    totleHonor = strToJson(totleHonor);
    nowLevel = totleHonor;
    //先获取登录人有获取那个等级的荣誉
    //在查询当前等级的获得人群
    //绑定当前等级的获取条件
    getAjax(javaserver + "/honor/findHonorDetails",
            { honorid: totleHonor.honorId, userid: sysoUserInfo.user_ID },
            function (data) {
              console.log(data);
                data = strToJson(data);
                hadLevel = data.datas[0];

                $("#honorname").html(hadLevel.honorName);
                if (hadLevel == undefined) {
                    totleHonor.levelList.forEach(function (data, index) {
                        if (data.honorRank == 1) {
                            params.honorid = data.honorId;
                            params.honorRank = 1;
                            nowLevel.hcList = data.hcList;
                            hadLevel = nowLevel;
                            findCondition(1);
                        }
                    });
                    //绑定用户获取荣誉信息
                    $("#showUser>span").html(sysoUserInfo.user_Name + "，未获取荣誉");
                } else {
                    totleHonor.levelList.forEach(function (data, index) {
                        if (data.honorRank == hadLevel.honorRank) {
                            nowLevel = data;
                        }
                    });
                    params.honorid = nowLevel.honorId;
                    params.honorRank = nowLevel.honorRank;
                    findCondition(nowLevel.honorRank);
                    //绑定用户获取荣誉信息
                    $("#showUser img").attr("src", sysoUserInfo.user_Img);
                    $("#showUser>span").html(sysoUserInfo.user_Name + "，已获得V" + hadLevel.honorRank + "级 <strong>" + hadLevel.honorName + "</strong> 荣誉");
                }
                nowLevel = parseJSON(nowLevel);
                //getUserList(1);

                //先绑定第一块（图标，限制人数，时间）
                if(nowLevel.honorIcon.indexOf('http') < 0)
                {
                  nowLevel.honorIcon = staticimgserver+  nowLevel.honorIcon;
                }
                $("#content_honor .card-cover").attr("src", nowLevel.honorIcon);
                $("#content_honor .xianzhi").html((nowLevel.existingNumbers == undefined ? 0 : nowLevel.existingNumbers) + "人 /" + (nowLevel.totalNumber == 0 ? '不限制' : nowLevel.totalNumber + '人'));
                $("#content_honor .date").html(totleHonor.effectiveDays == -1 ? '不限制' : totleHonor.effectiveDays + '天');


                // getCompleteCont();
                bindLevel();
            });
});


//查询当前等级已获得的人员
function getUserList(optype) {
    getAjax(javaserver + "/honor/findHonorUser", params,
            function (data) {
                data = strToJson(data);
                var block = "";
                for (i = 0; i < data.datas.length; i++) {
                    block += "<span style=' width:2.5rem; margin:0.4rem; float:left;'> <img src='" + data.datas[i].avatar + "' class='touxiang'>"
                    block += "<br/>" + data.datas[i].userName
                    block += "</span>"
                }
                if (data.datas == undefined || data.datas.length <= 0) {
                    block = "<center class='color-gray'>无人获取当前荣誉</center>";
                    $("#userLoadMore").hide();
                }
                //                  else if(data.datas.pageCount<=params.pageIndex){
                //                    $("#userLoadMore").hide();
                //                  }else{
                //                    $("#userLoadMore").show();
                //                  }
                if (optype == 1) {
                    $("#content_honor #hadUserlist").html(block);
                } else {
                    $("#content_honor #hadUserlist").append(block);
                }
            });
}
//查询当前等级的合格条件
function getCompleteCont() {
    $.showIndicator(); //loading
    getAjax(javaserver + "/honor/findHonorCompletion", { honorid: params.honorid, honorRank: params.honorRank, userid: params.userid },
            function (data) {
                data = strToJson(data);
                var conditionList = data.datas;
                //获取以后，比对完成情况
                if (nowLevel.hcList.length > 0 && conditionList.length > 0) {
                    conditionList.forEach(function (data, index) {
                        nowLevel.hcList.forEach(function (data1, index1) {
                            if (data.conditionId == data1.conditionId) {
                                //学习记录
                                if (data1.xtype == 1) {
                                    data1.isComplete = data.isComplete;
                                } else {
                                    //已完成的id
                                    var ids = (data.complete == undefined ? 0 : data.complete.split(",").length); //已完成的数量
                                    data1.hadCount = data1.xid.split(",").length; //需要完成的数量
                                    data1.completeCount = ids;
                                }

                            }
                        });
                    });
                } else {
                    nowLevel.hcList.forEach(function (data1, index1) {
                        //学习记录
                        if (data1.xtype == 1) {
                            data1.isComplete = false;
                        } else {
                            //已完成的id
                            data1.completeCount = 0; //已完成的数量
                            data1.hadCount = data1.xid.split(",").length; //需要完成的数量
                        }
                    });
                }
                var block = "";
                //开始拼接页面
                nowLevel.hcList.forEach(function (condition, index) {
                    block += "<tr><td style='width: 65%;'>"
                    condition.learnType = parseInt(condition.learnType);
                    if (condition.xtype == 1) {
                        block += "【学习记录】" + (condition.learnType == 1) ? '登录次数' : ((condition.learnType) == 2 ? '学习总时长' : ((condition.learnType == 3) ? '考试次数' : ((condition.learnType) == 4 ? '任务完成数' : ((condition.learnType == 5) ? '收藏课程数' : ((condition.learnType == 6) ? '积分' : ((condition.learnType == 7) ? '提问数' : ((condition.learnType == 8) ? '回答数' : '回答率')))))));
                        block += ((condition.judge == 1) ? '大于' : (condition.judge == 2 ? '等于' : '小于')) + condition.xnum;
                    } else if (condition.xtype == 2) {
                        block += "【任务】";
                        for (i = 0; i < condition.detailJson.length; i++) {
                            block += "《" + condition.detailJson[i].name + "》";
                        }
                    } else if (condition.xtype == 3) {
                        block += "【课程】";
                        for (i = 0; i < condition.detailJson.length; i++) {
                            block += "《" + condition.detailJson[i].course_Name + "》";
                        }
                    }
                    block += "</td>"
                    block += "<td></td>"
                    if (condition.xtype == 1) {
                        block += "<td class='" + (condition.isComplete ? 'over' : 'active') + "'><i class='iconfont'>" + (condition.isComplete ? '&#xe6c5;' : '&#xe680;') + "</i>" + (condition.isComplete ? '满足条件' : '进行中') + "</td>"
                    } else {
                        block += "<td class='" + (condition.completeCount >= condition.hadCount ? 'over' : 'active') + "'><i class='iconfont'>" + (condition.completeCount >= condition.hadCount ? '&#xe6c5;' : '&#xe680;') + "</i>" + (condition.completeCount >= condition.hadCount ? '满足条件' : '进行中') + "</td>"
                    }
                    block += "</tr>";
                });
                $("#content_honor .content-block-title").html("V" + nowLevel.honorRank + nowLevel.honorName + "  荣誉获得条件");
                $("#content_honor .tab>tbody").html(block);
            });
}
//排序
var compare = function (prop) {
    return function (obj1, obj2) {
        var val1 = obj1[prop];
        var val2 = obj2[prop];
        if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
            val1 = Number(val1);
            val2 = Number(val2);
        }
        if (val1 < val2) {
            return -1;
        } else if (val1 > val2) {
            return 1;
        } else {
            return 0;
        }
    }
}
//绑定等级的样式
function bindLevel() {
    totleHonor.levelList.sort(compare("honorRank"));
    var block = "";
    for (i = 0; i < totleHonor.levelList.length; i++) {
        var level = totleHonor.levelList[i];
        block += "                 <span>"
        if (level.honorRank == hadLevel.honorRank + 1) {
            block += " <span class='rongyu_level_num active' onclick='findCondition(" + level.honorRank + ")'>V" + level.honorRank + " </span> "
        } else if (level.honorRank <= hadLevel.honorRank && hadLevel.honorRank != 0) {
            block += " <span class='rongyu_level_num over' onclick='findCondition(" + level.honorRank + ")'>V" + level.honorRank + " </span> "
        } else {
            block += " <span class='rongyu_level_num' onclick='findCondition(" + level.honorRank + ")'>V" + level.honorRank + " </span> "
        }

        if (level.honorRank < totleHonor.levelList.length) {
            if (level.honorRank < hadLevel.honorRank) {
                block += "<span class='rongyu_level_line over' ></span>"
            } else {
                block += "<span class='rongyu_level_line' ></span>"
            }
        }
        block += "</span> "
    }
    $("#content_honor .rongyu_level").html(block);
}
//切换等级
function findCondition(num) {
    var obj = {};
    totleHonor.levelList.forEach(function (data, index) {
        if (data.honorRank == num) {
            obj = data;
        }
    });
    obj = parseJSON(obj);
    nowLevel = obj;
    params.honorid = nowLevel.honorId;
    params.honorRank = nowLevel.honorRank;
    getUserList(1); //查询当前荣誉的获得用户
    getCompleteCont(); //获取条件的完成情况
}

//转换荣誉里的string
function parseJSON(obj) {
    obj.hcList.forEach(function (data, index) {
        if (typeof (data.detailJson) == 'string') {
            data.detailJson = JSON.parse(data.detailJson);
        }
    });
    return obj;
}
//**********************************************************************
//打开荣誉列表触发
//**********************************************************************
$(document).on("pageInit", "#honor", function (e, id, $page) {
    loadHonor(1);
});
/*********************************分页查询**************************************/
$(document).on('click', '#honorLoadMore', function () {
    $.showIndicator(); //loading
    loadHonor(2);
});
//跳转荣誉详情
function goHonorDetail(honor) {
    SetlocalStorage("honorDetail", JSON.stringify(honor));
    $.router.loadPage("honordetail.html");
}
//查询荣誉列表的方法
function loadHonor(optype) {
    $.showIndicator(); //loading
    var pageIndex = parseInt($("#honorIndex").html());
    sysoUserInfo = getUserInfo(); //用户信息
    sysUserInfo = getUserInfo();
    //默认登录进来就请求任务列表
    //请求所有任务
    getAjax(javaserver + "/honor/findHonorPage",
            { order: 1,
                sort: 1,
                type: 1,
                orgid: sysUserInfo.organization_ID,
                userid: sysUserInfo.user_ID,
                pageSize: 10,
                pageIndex: pageIndex
            },
            function (data) {
              console.log(data);
                data = strToJson(data);
                if (data.errorcode == 0 && data.numCount > 0 && data.datas.length > 0) {

                    //荣誉列表
                    var renwu = "";
                    for (var i = 0; i < data.datas.length; i++) {
                        //遍历出荣誉的总限制人数和总获得人数
                        data.datas[i].totalNumber = 0;
                        data.datas[i].existingNumbers = 0;
                        if (data.datas[i].levelList.length > 0) {
                            data.datas[i].totalNumber = data.datas[i].levelList[0].totalNumber;
                            data.datas[i].existingNumbers = data.datas[i].levelList[0].existingNumbers;
                        }
                        renwu += "    <div class='card facebook-card' onclick='goHonorDetail(" + JSON.stringify(data.datas[i]) + ")'>"
                        if(data.datas[i].honorIcon.indexOf('http') < 0)
                        {
                          data.datas[i].honorIcon = staticimgserver+  data.datas[i].honorIcon;
                        }
                        renwu += "     <div class='card-content' style='padding: 20px;'><img src='" + data.datas[i].honorIcon + "' style='margin:0 auto;height: 92px;width: auto;'><div class='jibie ng-binding' >共" + data.datas[i].levelList.length + "级</div></div>"
                        renwu += "      <div class='card-footer no-border'>"
                        renwu += "          <a class='link'>" + data.datas[i].honorName + "</a>"
                        renwu += "            <a class='link'></a>"
                        renwu += "           <a class='link'><i class='iconfont' style='color:#39f; margin-right:5px;'>&#xe76a;</i> 获得者：" + data.datas[i].existingNumbers + "人";
                        if (data.datas[i].totalNumber > 0) {
                            renwu += "            /" + data.datas[i].totalNumber + "人";
                        }
                        renwu += "            </a>"
                        renwu += "      </div>"
                        renwu += "     </div>"
                    }
                    //给页面附上列表
                    if (optype == 1) {
                        $(".honorlist").html(renwu);
                    } else {
                        $(".honorlist").append(renwu);
                    }
                    if (pageIndex >= data.pageCount) {
                        $("#honorLoadMore").hide();
                    } else {
                        $("#honorLoadMore").show();
                    }
                } else if (data.errorcode == 0 && (data.numCount == 0 || data.datas.length <= 0)) {
                    if (pageIndex == 1) {
                        $(".honorlist").html("<center style='color:#999;font-size:16px;'><i class='iconfont' style='font-size: 6rem;color:#ccc;'>&#xe731;</i><br/>暂无数据</center>");
                    }
                    $("#honorLoadMore").hide();
                }
                $("#honorIndex").html(pageIndex);
                $.hideIndicator();
            });
}
