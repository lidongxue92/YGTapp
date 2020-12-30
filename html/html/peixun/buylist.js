//当前访问的状态
var state = 2;

/**********************************************我的课程列表初始化start **********************************************/

$(document).on("pageInit", "#mybuylist", function (e, id, $page) {
    $.showIndicator();
    sysUserInfo = getUserInfo();
    GetMyBjList(2, "", 1, 10, 2);


    //班级列表的分页
    $("#classLoadMore").click(function () {
        $.showIndicator(); //loading
        var pageIndex = parseInt($("#classPageIndex").html());
        $("#classPageIndex").html(pageIndex+1);
        GetMyBjList(state, "", pageIndex+1, 10, 1);

    });

    //最新班级
    $("#mybuylist_wgq").click(function () {
        $.showIndicator();
        state = 1;
        GetMyBjList(1, "", 1, 10, 2);
        $("#classPageIndex").html("1");
        $("#mybuylist_wgq").addClass("active");
        $("#mybuylist_ygq").removeClass("active");
    });
    //我的班级
    $("#mybuylist_ygq").click(function () {
        $.showIndicator();
        state = 2;
        GetMyBjList(2, "", 1, 10, 2);
        $("#classPageIndex").html("1");
        $("#mybuylist_wgq").removeClass("active");
        $("#mybuylist_ygq").addClass("active");
    });

    //名称筛选
    $('#searchClass').keypress(function (e) { //这里给function一个事件参数命名为e，叫event也行，随意的，e就是IE窗口发生的事件。
        var key = e.which; //e.which是按键的值
        if (key == 13) {
            e.preventDefault();
            $.showIndicator();
            GetMyBjList(state, $("#searchClass").val(), 1, 20, 2);
        }
    });
});

//打开班级报名
function openClassObj(data){
  //console.log('obj:'+JSON.stringify(data));
	SetlocalStorage("classObj", JSON.stringify(data));
//  window.location = api.wgtRootDir+"/html/class/index.html";
  api.openWin({
      name: 'class',
      url:api.wgtRootDir+'/html/class/index.html'
  });
}


$(document).on('refresh', '.mybuylist', function (e) {
    //下拉刷新处理(重新查询绑定)
  //  setTimeout(function () {
        // 加载完毕需要重置
        $.showIndicator();
        GetMyBjList(state, "", 1, 20, 2);
        $.pullToRefreshDone('.mybuylist');
        //$.toast('刷新成功！');
  //  }, 1000);
});
/*state状态 1.未过期 2.已过期
* optype  1追加  2替换
*查询内容(班级名称)
*/
function GetMyBjList(state,searchText,pageIndex,pageSize,optype){
//  alert(pageIndex);
  sysUserInfo = getUserInfo();
  if(state==1){
    var xid=(sysUserInfo.allorgid.length>0?sysUserInfo.allorgid+",":"")+(sysUserInfo.allroleid.length>0?sysUserInfo.allroleid+",":"")+(sysUserInfo.allgroupid.length>0?sysUserInfo.allgroupid+",":"")+sysUserInfo.user_ID;
    getAjax(javaserver + "/grade/findGradeInfoAll",{
					userid: sysUserInfo.user_ID,
					searchText: searchText, //搜索内容
					searchType: "2", //筛选类型 班级名称
					pageIndex:pageIndex,
					pageSize:pageSize,
					screenType:"2",
					type:"1",
					powerLV:sysUserInfo.powerLV,//用户身份
					orgid: sysUserInfo.organization_ID,   // 企业id
					powerLV: sysUserInfo.powerLV,//登录人的系统角色
					orderby:"desc",//排序
					xid:xid
				}, function(rs){
			var datas = strToJson(rs);
			$.hideIndicator();
			courseListStr="";
			if(datas.errorcode =="0"){

			  for(var i = 0; i < datas.datas.length; i++){
          var coverImg = datas.datas[i].gradeCover;
          if(coverImg == undefined){
            coverImg = "../../res/img/fengmian001.gif";
          }
          if(coverImg.indexOf("http") < 0){
            coverImg = staticimgserver + coverImg;
          }

          courseListStr += '<div class="col-50">' +
                       '  <div class="card color-default" style="margin: .5rem 0">' +
                      '      <a href="#" onClick=\'openClassObj('+JSON.stringify(datas.datas[i])+')\'>' +
                      '          <div  style="background: #efeff4;" valign="bottom" class="card-header color-white no-border no-padding" >' +

                      '              <img class="card-cover" src="' +coverImg + '" alt="" style="width: 100%;margin: 0 auto;width:auto;">' +
                      '          </div>' +
                      '           <div class="card-content">' +
                      '                <div class="card-content-inner" style=\'height:4.5em\'>' +
                      '                   ' +datas.datas[i].gradeName + ''+
                      '                   <p class="color-gray">';
                      if(datas.datas[i].enrollStartDate!=undefined)
                      {
                           courseListStr += ("报名开始："+datas.datas[i].enrollStartDate.split(' ')[0]+' ');
                      }
                      else {
                         courseListStr += ("报名开始：不限");
                      }
                      if(datas.datas[i].enrollEndDate!=undefined)
                      {
                           courseListStr += ("<br /> 报名截至："+datas.datas[i].enrollEndDate.split(' ')[0]+'');
                      }
                      else {
                         courseListStr += ("<br /> 报名截至：不限");
                      }
          //           '                           <i class="iconfont">&#xe6ce;</i>包含' + response.datas[i].sectionSum + '节课' +
                   courseListStr +=    '                   </p>' +
                      '               </div>' +
                      '           </div>' +
                      '       </a>' +
                    //  '       <div class="card-footer">' +
                    //  '           <span class="link"><i class="iconfont">&#xe91b;</i>' + response.datas[i].viewCount + '</span> ' +
                  //    '           <span class="link" onClick=\'collCourse(' + JSON.stringify(response.datas[i]).replace(/<\/?[^>]*>/g, '') + ',this)\'>' + (response.datas[i].collections ? '<i class="iconfont">&#xe72f;</i>' : '<i class="iconfont">&#xe748;</i>') +
                //      '<span>' + (isNull(response.datas[i].collectionCount) || response.datas[i].collectionCount < 0 ? 0 : response.datas[i].collectionCount) + '</span></span>' +
                  //    '       </div>' +
                      '   </div>' +
                      '</div>';


			  }

			  $("#classPageIndex").html(pageIndex);
			  //总页数小于请求页数
			  if(datas.pageCount<=pageIndex){
					$("#classLoadMore").hide();
			  }else{
					$("#classLoadMore").show();
			  }
			  if(optype==2){
				if(datas.datas.length<=0){
					courseListStr="<dl style='height:100%;width:100%;position: absolute;margin-top: 25%;color:#cecece;'><dd style='text-align:center;margin:0'><img src='../../res/img/none.png' style='width: 50%;'></dd><dt style='text-align: center;'>暂无数据</dt></dl>";
				}
				$(".mybuylistul").html("<div class=\"row\" style='background:#efeff4'>"+courseListStr+"</div>");
			  }else{
				$(".mybuylistul").append("<div class=\"row\" style='background:#efeff4'>"+courseListStr+"</div>");
			  }

			}
		  },function(){$.hideIndicator();});
  }
  else {
		    getAjax(javaserver + "/grade/findStudentGradePage", {
          userid:sysUserInfo.user_ID,
          searchText: searchText, //搜索内容
        //  state:state,searchName:searchText,
          pageIndex:pageIndex,
          pageSize:pageSize,
        //  searchName:$("#searchClass").val(),
          orgid:sysUserInfo.organization_ID
       }, function(rs){
        var datas = strToJson(rs);
        $.hideIndicator();
        courseListStr="";
        if(datas.errorcode =="0"){
          for(var i = 0; i < datas.datas.length; i++){
            //  if(datas.datas[i].gradeInfo != "undefined" && datas.datas[i].gradeInfo != undefined){ //不包含课程信息的班级，不显示

                  var coverImg = datas.datas[i].gradeCover;
                  if(coverImg.indexOf("http") < 0){
                    coverImg = staticimgserver + coverImg;
                  }

                  courseListStr += '<div class="col-50">' +
                               '  <div class="card color-default" style="margin: .5rem 0">' +
                              '      <a href="#" onClick=\'openClassObj('+JSON.stringify(datas.datas[i])+')\'>' +
                              '          <div  style="background: #efeff4;" valign="bottom" class="card-header color-white no-border no-padding" >' +

                              '              <img class="card-cover" src="' +coverImg + '" alt="" style="width: 100%;margin: 0 auto;width:auto;">' +
                              '          </div>' +
                              '           <div class="card-content">' +
                              '               <div ><div style=\'height:3em;line-height:1.5em;overflow: hidden;\'>' +
                              '                   ' +datas.datas[i].gradeName + '</div>'+
                              '                   <p class="color-gray">';
                              if(datas.datas[i].lineStartDate != undefined)
                              {
                                   courseListStr += ("上课时间："+datas.datas[i].lineStartDate.split(' ')[0]+' ');
                              }
                              else {
                                 courseListStr += ("上课时间：待定");
                              }
                  //           '                           <i class="iconfont">&#xe6ce;</i>包含' + response.datas[i].sectionSum + '节课' +
                           courseListStr +=    '                   </p>' +
                              '               </div>' +
                              '           </div>' +
                              '       </a>' +
                              '       <div class="card-footer" style="padding:0">' +
                              '           <span class="link">'+datas.datas[i].departmentName+'</span> ' +
                              '           <span class="link") '+
                              '<span><i class="iconfont">&#xe91b;</i>' + datas.datas[i].hadEnrolment + '</span></span>' +
                              '       </div>' +
                              '   </div>' +
                              '</div>';




            //  }
          }

          $("#classPageIndex").html(pageIndex);
          //总页数小于请求页数
          if(datas.pageCount<=pageIndex){
                $("#classLoadMore").hide();
          }else{
                $("#classLoadMore").show();
          }
          if(optype==2){
            if(datas.datas.length<=0){
                courseListStr="<dl style='height:100%;width:100%;position: absolute;margin-top: 25%;color:#cecece;'><dd style='text-align:center;margin:0'><img src='../../res/img/none.png' style='width: 50%;'></dd><dt style='text-align: center;'>暂无数据</dt></dl>";
            }
            $(".mybuylistul").html("<div class=\"row\" style='background:#eee'>"+courseListStr+"</div>");
          }else{
            $(".mybuylistul").append("<div class=\"row\" style='background:#eee'>"+courseListStr+"</div>");
          }

        }
      },function(){$.hideIndicator();});
  }
}

//打开班级
function openClass(id) {
    $.showIndicator();
    //  $.router.loadPage(api.wgtRootDir+"/html/peixun/classdetail.html");
    api.openWin({
        name: 'class',
        url:api.wgtRootDir+'/html/class/index.html'
    });
    SetlocalStorage("classid", id);
    loadClass(id);
}
//加载班级的课程
$(document).on("pageInit", "#class_detail", function (e, id, $page) {
    $.showIndicator();
    var id = GetlocalStorage("classid");
    if (!isNull(id)) {
        loadClass(id);
    }
});
function loadClass(id) {
    getAjax(javaserver + "/grade/findGradeDetails", { gradeid: id }, function (response) {
        var response = strToJson(response);
        var block = "";
        if (response.errorcode == "0") {
            for (var i = 0; i < response.datas.length; i++) {
                //课程
                if (response.datas[i].xtype == 2) {
                    block += "<div class='col-50'><a href='#' onClick='openKe_collection(" + JSON.stringify(response.datas[i].courseinfo.course_Id) + "," + null + ",2)'><div class='card color-default'><div style='' valign='bottom' class='card-header color-white no-border no-padding'><img class='card-cover' src='" + response.datas[i].courseinfo.course_img + "' alt='' onerror='javascript:this.src=\"/app/framework/img/fengmian001.gif\"' height=105></div><div class='card-content'><div class='card-content-inner'><p>" + response.datas[i].courseinfo.course_Name + "</p></div></div><div class='card-footer'><span class='link'><i class='iconfont icon-shenhetongguo' style='color:#339966'></i> 课程</span><span class='link'><i class='iconfont icon-listtable'>" + response.datas[i].courseinfo.course_Sum + "章</i> </span></div></div></a></div>";
                    //试卷
                } else if (response.datas[i].xtype == 3) {
                    block += "<div class='col-50'><a href='#' onClick='openSj(" + JSON.stringify(response.datas[i].exampaper) + ",2)'><div class='card color-default'><div style='' valign='bottom' class='card-header color-white no-border no-padding'><img class='card-cover' src='/app/framework/img/examnull.png'  alt='' ></div><div class='card-content'><div class='card-content-inner'><p>" + response.datas[i].exampaper.paperName + "</p></div></div><div class='card-footer' style='display:none;'><span class='link'><i class='iconfont icon-shenhetongguo' style='color:#339966'></i> 已学</span><span class='link'><i class='iconfont icon-listtable'></i> </span></div></div></a></div>";
                    //分类
                } else if (response.datas[i].xtype == 1) {
                    block += "<div class='col-50'><a href='#' onClick='openRenwuKnow(" + JSON.stringify(response.datas[i].knowledgeinfo) + ",2)'><div class='card color-default'><div style='' valign='bottom' class='card-header color-white no-border no-padding'> <svg class='icon' aria-hidden='true'  style='margin:0rem auto;width: 5rem'><use xmlns:xlink='http://www.w3.org/1999/xlink' xlink:href='" + (response.datas[i].knowledgeinfo.ico == undefined ? '#icon-mulumoshi' : response.datas[i].knowledgeinfo.ico) + "'></use></svg></div><div class='card-footer'><span class='link'><i class='iconfont icon-shenhetongguo' style='color:#339966'></i> " + response.datas[i].knowledgeinfo.knowledge_Name + "</span><span class='link'><i class='iconfont icon-listtable'></i> </span></div></div></a></div>";
                }
            }
            $("#content_class .row").html(block);
        }
        $.hideIndicator();
    }, function () { $.hideIndicator(); });
}
/**我的课程列表初始化end ***/
