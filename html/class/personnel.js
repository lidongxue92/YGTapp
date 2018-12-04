var paruserType=5;//用户类型 0.为全部工作人员 1.教师 2.班级管理员 3.工作人员 4.基地保障人员 5.学员
var parusergroupid = "";//分组ID
var parsearchText="";
var parshowhtmlid ="";
$(document).on("pageInit", "#personnel", function (e, id, $page) {
	// alert('x');
//	var groupid = QueryString("groupid");
//	if(groupid !=null && groupid !=undefined)
//	{
//		parusergroupid = groupid;
//	}
	parusergroupid =	localStorage.getItem("parusergroupid");
	if(parusergroupid == null)
	{
		parusergroupid = "";
	}
	else {
		$("#tab_teacherBTN").hide();
		localStorage.removeItem("parusergroupid");
	}


	getpersonnel("tab_tongxuelu","5",parusergroupid);

	$('#persearch').keydown(function(e){
	    var keywd = e.target.value;
	    if(event.keyCode == 13 && keywd) {
	        e.preventDefault();
					personnel_soso();
	    }
	});
})
//查询通讯录
function getpersonnel(htmlid,userType,groupType){
	paruserType = userType;
	parusergroupid = groupType;
	parshowhtmlid = htmlid;
	$(".tab-link").removeClass('active');
//	$(".tab").removeClass('active');

	$("#"+parshowhtmlid+"BTN").addClass('active');
	$.showPreloader();
	var classObj = GetlocalStorage("classObj");
	getAjax(javaserver + "/contacts/findContactsPage",{
		gradeid:classObj.gradeId,
		userType:userType,
		groupType:groupType,//小组序号
		searchText:parsearchText,
		pageIndex:1,
		pageSize:1000
	},function(rs){
			var data = strToJson(rs);
			if(data.errorcode == "0")
			{
					var html ="";
					if(data.datas.length >0)
					{
							for (var i = 0; i < data.datas.length; i++) {

								html+=("<a class=\"item-content item-link\" onclick=\"openperinfo('"+escape(JSON.stringify(data.datas[i]))+"')\" href=\"#\">");
								html+=("              <div class=\"item-media\"><img src=\""+data.datas[i].user_Img+"\" onerror='src=\"../../images/avatar.png\"' width=\"30\" /></div>");
								html+=("              <div class=\"item-inner\">");
								html+=("                <div class=\"item-title\">"+data.datas[i].user_Name+"</div>");
								var zuhao="";
								if(data.datas[i].powerLV == "5")//学员
								{
									//	if(data.datas[i].user_No != undefined && data.datas[i].user_No !="")
									//	{
										//		zuhao = "第"+data.datas[i].user_No+"组";
												if(data.datas[i].user_Pwd == "1"){
													zuhao += "组长";
												}
									//	}
								}
								else if(data.datas[i].powerLV == "4")
								{
									zuhao ="基地保障人员";
								}
								else if(data.datas[i].powerLV == "3")
								{
									zuhao ="工作人员";
								}
								else if(data.datas[i].powerLV == "2")
								{
									zuhao ="班级管理员";
								}
								else if(data.datas[i].powerLV == "1")
								{
									zuhao ="主持人/专家";
								}
								else {
									zuhao ="其它";
								}
								html+=("                <div class=\"item-after\">"+zuhao+"</div>");
								html+=("              </div>");
								html+=("            </a>");
							}
							$("#tab_tongxuelu").html(html);
					}
					else {
						html = "<center><br/><br/><img src=\"../../res/img/none.png\" style=\"width: 50%;\" /><br />暂无通讯录<br/><br/></center>";
						$("#tab_tongxuelu").html(html);
					}
			}
			else {
				alert('查询失败'+rs);
			}
			  $.hidePreloader();
	});
}
//查询关键词
function personnel_soso(){
	parsearchText = $("#persearch").val();
	getpersonnel(parshowhtmlid,paruserType,parusergroupid);
}
function openperinfo(obj){
	//alert(unescape(obj));
	SetlocalStorage("peruserinfo",unescape(obj));
	$.router.loadPage(api.wgtRootDir+"/html/class/personnel_info.html");
}
$(document).on("pageInit", "#personnel_info", function (e, id, $page) {
	// alert('x');
	var peruserinfo = GetlocalStorage("peruserinfo");
	var obj = peruserinfo;
	$("#perinfo_username").html(obj.user_Name);
	//$("#perinfo_orgname").html(obj.user_Name);
	$("#perinfo_img").attr("src",obj.user_Img);

	//alert(JSON.stringify(obj.organization_Name));
	if(obj.organization_Name != undefined && obj.organization_Name != "")
	{
		//企业组织架构
		$("#perinfo_orgname").text(obj.organization_Name);
	}
	else {
		$("#perinfo_orgname").text(getUserInfo().organization_Name);
	}

	if(obj.email != undefined && obj.email != "")
	{
		var ahtml ="";
		ahtml+=("<li class=\'item-content\'>");
		ahtml+=("        <div class=\'item-inner\'>");
		ahtml+=("          <div class=\'item-title\'>邮箱："+obj.email+"</div>");
		ahtml+=("          <div class=\'item-after\'><a href=\'#\' onclick=\"api.mail({recipients: \'["+obj.email+"]\'},function(ret, err){});\" class=\'button button-fill\'><i class=\'iconfont icon-youxiang\'></i></a></div>");
		ahtml+=("        </div>");
		ahtml+=("      </li>");
		$("#perinfo_qitashuxing").append(ahtml);
	}
	if(obj.phone != undefined && obj.phone != "")
	{
		var ahtml ="";
		ahtml+=("<li class=\'item-content\'>");
		ahtml+=("        <div class=\'item-inner\'>");
		ahtml+=("          <div class=\'item-title\'>手机："+obj.phone+"</div>");
		ahtml+=("          <div class=\'item-after\'><a href=\'#\' onclick=\"api.call({type: 'tel_prompt',number: '"+obj.phone+"'});\" class=\'button button-fill\'><i class=\'iconfont icon-dianhua1\'></i></a></div>");
		ahtml+=("        </div>");
		ahtml+=("      </li>");
		$("#perinfo_qitashuxing").append(ahtml);
	}
	if(obj.logText != undefined && obj.logText != "")
	{
		$("#perjianjie").html("<div class=\"item-title\">专家简介</div><div class=\"item-after\">"+obj.logText+"</div>")
	}

})
