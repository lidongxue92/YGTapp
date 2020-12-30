/***************************************************************************/
// 公开课加载事件
/**************************************************************************/
// 筛选类型
var publicType = [{ name: '视频', flag: false, value: 1 },
        { name: '文件', flag: false, value: 2 },
        { name: '试卷', flag: false, value: 3 },
        { name: '线下', flag: false, value: 4 },
        { name: '题库', flag: false, value: 5 },
        { name: '直播', flag: false, value: 6 },
        { name: '图文', flag: false, value: 8}];
var publicCourseParams = {
    orgid: "",
    knowledgeids: "",
    searchText: "",
    searchType: 3,
    cstype: "",
    pageIndex: 1,
    pageSize: 10
}
$(document).on("pageInit", "#course", function (e, id, $page)
{
  publicCourseParams.knowledgeids="";
  publicCourseParams.cstype="";
  $('#knowList').html("");
    // 当前页
    var pageIndex = 1;
    // 每页显示的条数
    var pageSize = 10;

    // 登录用户
    sysUserInfo = getUserInfo();
    //alert(JS);
    getKnowledgeList(publicCourseParams.knowledgeids,0);

    $('#publicCourseNameParams').keypress(function (e) { //这里给function一个事件参数命名为e，叫event也行，随意的，e就是IE窗口发生的事件。
        var key = e.which; //e.which是按键的值
        if (key == 13) {
            e.preventDefault();
          getPublicCourse(true);
        }
    });
});
// 公开课总数
var publicCourseCount = 0;
// 公开课完整html
var courseHtml = "";
// 公开课内容更html
var courseContext = "";
// loading
var publicCourseLoading = false;
// 获取公开课
function getPublicCourse(flag) {
    //    var typeid = GetlocalStorage("courseTypeid");
    //    if(typeid != ""){
    //        publicCourseParams.knowledgeids = typeid;
    //        //getPublicCourse(true);
    //        SetlocalStorage("courseTypeid", "");
    //    }

    sysUserInfo = getUserInfo();
    publicCourseParams.orgid = sysUserInfo.organization_ID;
    publicCourseParams.userid = sysUserInfo.user_ID;
    var txtName ="";
    if($('#publicCourseNameParams')[0]!=null){
      txtName = $('#publicCourseNameParams')[0].value;
    }
    if (publicCourseParams.pageIndex == 1) {
        $("#courseContent").html("");
        publicCourseLoading = true;
    }
    if (!isNull(txtName)) {
        // 公开课完整html
        courseHtml = "";
        // 公开课内容更html
        courseContext = "";
        publicCourseParams.searchText = txtName;
    } else {
        publicCourseParams.searchText = "";
    }
    if (publicCourseLoading) {
        $.showPreloader()
    }
    //alert(JSON.stringify(publicCourseParams));
    getAjax(javaserver + "/course/findOpen", publicCourseParams, function (response) {
       $.hidePreloader("");
        publicCourseLoading = false;
        $('#courseContent').html("");
        if (response.errorcode == "0") {
            if (flag) {
                // 公开课完整html
                courseHtml = "";
                // 公开课内容更html
                courseContext = "";
            }
            if(response.datas != undefined)
            {
              for (var i = 0; i < response.datas.length; i++) {
              //  console.log(response.datas[i].course_img);
                if(response.datas[i].course_img.indexOf('http')!=0)
                {
                  response.datas[i].course_img = staticimgserver+ response.datas[i].course_img;
                }
                courseContext += '<div class="col-50">' +
                             '  <div class="card color-default" style="margin: .5rem 0">' +
                            '      <a href="#" onClick=\'openKe_collection("' + response.datas[i].course_Id + '")\'>' +
                            '          <div  style="background: #eee;height: 120px;" valign="bottom" class="card-header color-white no-border no-padding" >' +

                            '              <img class="card-cover" src="' +response.datas[i].course_img + '" alt="" style="max-width: 100%;margin: 0 auto;width:auto;height: 120px;">' +
                            '          </div>' +
                            '           <div class="card-content">' +
                            '               <div class="card-content-inner">' +
                            '                   ' +
                            response.datas[i].course_Name.replace(/<\/?[^>]*>/g, '') + '' +
                            '                ' +
                            '                           (含' + response.datas[i].sectionSum + '节课)' +
                            '                   ' +
                            '               </div>' +
                            '           </div>' +
                            '       </a>' +
                            '       <div class="card-footer">' +
                            '           <span class="link"><i class="iconfont">&#xe91b;</i>' + response.datas[i].viewCount + '</span> ' +
                //收藏
                            '           <span class="link" onClick=\'collCourse(' + JSON.stringify(response.datas[i]).replace(/<\/?[^>]*>/g, '') + ',this)\'>' + (response.datas[i].collections ? '<i class="iconfont">&#xe72f;</i>' : '<i class="iconfont">&#xe748;</i>') +
                            '<span>' + (isNull(response.datas[i].collectionCount) || response.datas[i].collectionCount < 0 ? 0 : response.datas[i].collectionCount) + '</span></span>' +
                            '       </div>' +
                            '   </div>' +
                            '</div>';
            }
            }
            // 没有任何数据
            if (courseContext == "") {
                courseHtml = '<div style="text-align:center;"><img src="../../res/img/none.png" style="width: 50%;margin-top: 20%;"><div>暂无数据</div></div>';
            } else {
                courseHtml = '<div class="row">' + courseContext + '</div>';
            }
            $('#courseContent').append(courseHtml);
            // 获取展现出来的个数
            var contextNum = $('#courseContent>div').find('.col-50').length;
            if (contextNum < response.numCount) {
                // 判断加载更多是否存在
                if (!document.getElementById('moreHis')) {
                    $('#courseContent').append('<div style="margin: 1rem auto;padding-bottom: 2.5rem;" id="moreHis" onClick=\'nextPublicCourse(' + JSON.stringify(publicCourseParams) + ')\'><center>点击加载更多(' + contextNum + '/' + response.numCount + ')</center></div>');
                }
            } else { // 没有更多了
                $('#moreHis').remove();
            }
            publicCourseCount = response.numCount;
        } else {
            $.toast('公开课信息获取失败！');
        }
    }, "", "json");

    shaixuanhide();
}
// 下一页
function nextPublicCourse(params) {
    params.pageIndex++;
    publicCourseParams = params;
    getPublicCourse()
}
// 排序
function publicCourseSort(int, text) {
    // 关闭层
    $.closeModal('.corseSort');
    // 排序文字
    $('#publicCourseText').html(text);
    publicCourseParams.searchType = int;
    publicCourseParams.pageIndex = 1;

    // 清空课程名称搜索
    $('#publicCourseNameParams')[0].value = "";
    publicCourseParams.searchText = "";
    // 知识分类清空
    $("#" + publicCourseParams.knowledgeids).removeClass('active');
    publicCourseParams.knowledgeids = "";
    getPublicCourse(true);
}
// 选择类型
function publicCourseType(item, obj) {

    if (item.flag) {
        item.flag = false;
        $(obj).removeClass('active');
    } else {
        item.flag = true;
        $(obj).addClass('active');
    }

    $(obj).attr('onClick', 'publicCourseType(' + JSON.stringify(item) + ',this)');
    var paramsText = "";
    for (var i = 0; i < publicType.length; i++) {
        if (publicType[i].value == item.value) {
            publicType[i].flag = item.flag;
            if (item.flag) {
                paramsText +=(paramsText.length>0?",":"")+ item.value;
            }
        } else {
            if (publicType[i].flag) {
                paramsText += (paramsText.length>0?",":"")+ publicType[i].value;
            }
        }
    }
    // 筛选类型
    publicCourseParams.cstype = paramsText;
    publicCourseParams.pageIndex = 1;
    // 发送请求
    getPublicCourse(true);
}
// 获取知识分类
var knowledgeList = [];
var knowHtml = $('#knowList');
knowHtml.html('');
// 知识库id  索引
function getKnowledgeList(know, index) {
  //alert('xxxxx');
    sysUserInfo = getUserInfo();
    var knowledgeParams = {
        userId: sysUserInfo.user_ID,
        startDate: "",    // 起始时间
        endDate: "", // 结束时间
        searchName: "", //搜索内容
        knowledge_Id: know, // 子集搜索
        orgId: sysUserInfo.organization_ID,   // 企业id
        org_Name: sysUserInfo.organization_Name,   // 企业id
        powerLV: 2 //登录人的系统角色
    }
    // 遍历数据
    for (var i = knowledgeList.length; i > index; i--) {
        $('#P' + i).remove();
    }
    // 清除
    if (isNull(know)) {
        publicCourseParams.knowledgeids = "";
    } else {
        if (know == "111") {
            knowledgeParams.knowledge_Id = "";
        } else {
            $("#" + publicCourseParams.knowledgeids).removeClass('active');
            if (publicCourseParams.knowledgeids == know) {
                publicCourseParams.knowledgeids = "";
            } else {
                publicCourseParams.knowledgeids = know;
                $("#" + publicCourseParams.knowledgeids).addClass('active');
            }
        }
    }
    getPublicCourse(true);
    // 删除数据
    knowledgeList.splice(index, knowledgeList.length - index);
    getAjax(javaserver + "/knowledge/findKnowledgeList", knowledgeParams, function (response) {
        if (response.errorcode == 0) {
            var knowObj = response.datas;
            if (!isNull(knowObj) && knowObj.length > 0) {
                knowledgeList.push(knowObj);
                var itemHtml = "<p id='P" + knowledgeList.length + "'>第" + knowledgeList.length + "分类:</br>";
                for (var knowItem = 0; knowItem < knowObj.length; knowItem++) {
                    itemHtml += '<span class="shaixuan" id="' + knowObj[knowItem].knowledge_Id + '" onClick="getKnowledgeList(\'' + knowObj[knowItem].knowledge_Id + '\',' + knowledgeList.length + ',this)">' + knowObj[knowItem].knowledge_Name + '</span>'
                }
                itemHtml += "</p>";
                $('#knowList').append(itemHtml);

            }
        } else {
            $.toast('请求失败');
        }
    }, "", "json");

  //  $.closeModal('.panel-right-shaixuan');
}

function openshaixuan(){
  var publicTypeHtml = "";
  for (var i = 0; i < publicType.length; i++) {
      publicTypeHtml += "<span class=\"shaixuan\" onClick='publicCourseType(" + JSON.stringify(publicType[i]) + ",this)'>" + publicType[i].name + "</span>";
  }
  $("#publicType").html(publicTypeHtml);

  $("#panel-right-shaixuan").css("top","0%");
}
function shaixuanhide(){
  $("#panel-right-shaixuan").css("top","105%");
}
// 收藏/取消
function collCourse(item, obj) {
    if (publicCourseLoading) {
        $.toast('正在提交');
        return;
    }
    sysUserInfo = getUserInfo();
    var collParams = {
        collectionsId: "",
        courseName: item.course_Name,
        userId: sysUserInfo.user_ID,
        courseId: item.course_Id
    };
    if (item.hasOwnProperty('collections')) { // 存在说明取消收藏
        collParams.collectionsId = item.collections.id;
    }
    publicCourseLoading = true;
    getAjax(javaserver + "/course/modifyCollectionCourse", collParams, function (response) {
        publicCourseLoading = false;
        if (response.errorcode == 0) {
            if (item.hasOwnProperty('collections')) { // 存在说明取消收藏
                delete item.collections;
                if (isNull(item.collectionCount) || item.collectionCount <= 0) {
                    item.collectionCount = 0;
                } else {
                    item.collectionCount--;
                }
                obj.innerHTML = '<i class="iconfont">&#xe748;</i>' + item.collectionCount;
                  $.toast('已取消收藏');

            } else { // 取消收藏
                item.collections = { id: response.data }
                if (isNull(item.collectionCount) || item.collectionCount <= 0) {
                    item.collectionCount = 1;
                } else {
                    item.collectionCount++;
                }
                obj.innerHTML = '<i class="iconfont" style="color:#efd002">&#xe72f;</i>' + item.collectionCount;
                $.toast('收藏成功');
            }
            console.log(item, obj.childNodes[1].innerText);
            // 赋值
            $(obj).attr('onClick', "collCourse(" + JSON.stringify(item) + ",this)");
            obj.childNodes[1].innerText = item.collectionCount;
        } else {
            $.toast('提交失败！');
        }
    }, '', 'json');
}
// 公开课判空事件
function isNull(text) {
    if (text == null || text == undefined || text == "") {
        return true;
    } else {
        return false;
    }

}
