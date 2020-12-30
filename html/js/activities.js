///////////////////////活动详情////////////////////////
////////////////////////Allan(770363999)2017/03////////////////////////

$(function() {
    //滚动固定模块
    var cf = $('#conditionFixed');
    if(!cf.html()){
        return false;
    } else {
        var cfTop = cf.offset().top;
        var cfLeft = cf.offset().left;
        $(window).scroll(function(){
            var sT = $(window).scrollTop();//滚动条当前位置
            if( sT >= cfTop){
                cf.addClass('scrollFixed');
                cf.css({
                    left:cfLeft,
                });
            }else{
                cf.removeClass('scrollFixed');
            }
        });
    }
});

//开课倒计时
var interval = 1000;
function ShowCountDown(starttime, endtime, divname) {
    var now = new Date().getTime();
    var endDate = new Date(starttime.substring(0, 4), parseInt(starttime.substring(5, 7)) - 1, starttime.substring(8, 10), starttime.substring(11, 13), starttime.substring(14, 16), starttime.substring(17, 19)).getTime();
    var leftTime = endDate - now;
    var leftsecond = parseInt(leftTime / 1000);
    var day1 = Math.floor(leftsecond / (60 * 60 * 24));
    var hour = Math.floor((leftsecond - day1 * 24 * 60 * 60) / 3600);
    var minute = Math.floor((leftsecond - day1 * 24 * 60 * 60 - hour * 3600) / 60);
    var second = Math.floor(leftsecond - day1 * 24 * 60 * 60 - hour * 3600 - minute * 60);
    var cc = document.getElementById(divname);

    var jsendtime = new Date(endtime.substring(0, 4), parseInt(endtime.substring(5, 7)) - 1, endtime.substring(8, 10), endtime.substring(11, 13), endtime.substring(14, 16), endtime.substring(17, 19)).getTime();

    cc.innerHTML = "活动倒计时：<em>" + day1 + "</em>天<em>" + hour + "</em>时<em>" + minute + "</em>分<em>" + second + "</em>秒";

    if(now > jsendtime) {
        cc.innerHTML = "活动已结束";
        clearInterval(seti);
    } else if(day1 < 0) {
        cc.innerHTML = "活动已开始";
        clearInterval(seti);
    };
};

// 获取验证码
var InterValObj; //timer变量，控制时间
var count = 60; //间隔函数，1秒执行
var curCount; //当前剩余秒数
function sendMessage() {
    if(!checkmobile()){

        return false;
    } else {
        curCount = count;
        //设置button效果，开始计时
        $("#getCodes").attr("disabled", "true");
        $("#getCodes").addClass('buttstyle');
        $("#getCodes").val(curCount + "S");
        //向后台发送处理数据
        // alert(msgurl);
        console.log(JSON.stringify({'mobile': $('#bmmobile').val(), 'event':'bmyzm'}));
        api.ajax({
            url: msgurl,
            method: 'post',
            data: {
                values: {
                    'mobile': $('#bmmobile').val(),
                    'event':'bmyzm'
                }
            }
        },function(ret, err){
            console.log(JSON.stringify(ret)+'ssss');
            console.log(JSON.stringify(err));
            if (ret) {

                // alert( JSON.stringify( ret ) );

                curCount = count;
                //设置button效果，开始计时
                $("#getCodes").attr("disabled", "true");
                $("#getCodes").addClass('buttstyle');
                $("#getCodes").val(curCount + "S");
                InterValObj = window.setInterval(SetRemainTime, 1000); //启动计时器，1秒执行一次

            } else {
                alert( JSON.stringify( err ) );
            }
        });

        // $.post(msgurl, {'mobile': $('#bmmobile').val(), 'event':'bmyzm'},function(data){
        //     console.log(data);
        //     if (data.code != 1) {
        //         $('#errormsg').show().find('em').html(data.info);
        //         return false;
        //     }else {
        //         curCount = count;
        //         //设置button效果，开始计时
        //         $("#getCodes").attr("disabled", "true");
        //         $("#getCodes").addClass('buttstyle');
        //         $("#getCodes").val(curCount + "S");
        //         InterValObj = window.setInterval(SetRemainTime, 1000); //启动计时器，1秒执行一次
        //     }
        // });

    }
}
//timer处理函数
function SetRemainTime() {
    if(curCount <= 1) {
        window.clearInterval(InterValObj); //停止计时器
        $("#getCodes").removeAttr("disabled"); //启用按钮
        $("#getCodes").removeClass('buttstyle');
        $("#getCodes").val("获取验证码");
    } else {
        curCount--;
        $("#getCodes").val(curCount + "S");
    }
}
// ////////////////////表单验证/提交数据//////////////
// 检查姓名
function checkusername() {
    var v = $('#bmusername').val();
    if(v == '') {
        api.toast({
            msg: '姓名不能为空',
            duration: 2000,
            location: 'middle'
        });

        // $('#errormsg').show().find('em').html('姓名不能为空');
        return false;
    } else {
        v = v.replace(/[^\x00-\xff]/g, 'xx');
        if(v.length >= 3 && v.length <= 15) {
            $('#errormsg').hide().find('em').html('');
            return true;
        }
        api.toast({
            msg: '姓名格式不对',
            duration: 2000,
            location: 'middle'
        });
        // $('#errormsg').show().find('em').html('姓名格式不对');
        return false;
    }
}
// 检查手机
function checkmobile() {
    var v = $('#bmmobile').val();
    if(v == '') {
        api.toast({
            msg: '手机号码不能为空！',
            duration: 2000,
            location: 'middle'
        });
        // $('#errormsg').show().find('em').html('手机不能为空');
        return false;
    } else {
        var reg = /^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|17[0-9]{9}$|18[0-9]{9}|19[0-9]{9}$/;
        if(reg.test(v)) {
            $('#errormsg').hide().find('em').html('');
            return true;
        }
        api.toast({
            msg: '手机格式不对',
            duration: 2000,
            location: 'middle'
        });
        // $('#errormsg').show().find('em').html('手机格式不对');
        return false;
    }
}
// 检查手机验证码是否为空
function checksmsnull() {
    var v = $('#bmsms').val();
    if(v == '') {
        api.toast({
            msg: '验证码不能为空',
            duration: 2000,
            location: 'middle'
        });
        // $('#errormsg').show().find('em').html('验证码不能为空');
        return false;
    } else {
        return true;
    }
}
// 检查手机验证码
function checksms() {
    var v = $('#bmsms').val();
    if(v == '') {
        api.toast({
            msg: '验证码不能为空',
            duration: 2000,
            location: 'middle'
        });
        // $('#errormsg').show().find('em').html('验证码不能为空');
        return false;
    } else {
        $.post(checksmsurl, { 'mobilecaptcha': $('#bmsms').val(), 'mobile':$('#bmmobile').val(), 'event': 'bmyzm'},
            function(data) {
                if(data.code == 1) {
                    $('#errormsg').hide().find('em').html('');
                    return true;
                } else {
                    api.toast({
                        msg: '短信验证码错误',
                        duration: 2000,
                        location: 'middle'
                    });
                    // $('#errormsg').show().find('em').html('短信验证码错误');
                    return false;
                }
            });
    }
}
// 检查邮箱
function checkemail() {
    var v = $('#bmemail').val();
    if(v == '') {
        api.toast({
            msg: '邮箱不能为空',
            duration: 2000,
            location: 'middle'
        });
        // $('#errormsg').show().find('em').html('邮箱不能为空');
        return false;
    } else {
        var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        if(reg.test(v)) {
            $('#errormsg').hide().find('em').html('');
            return true;
        }
        api.toast({
            msg: '邮箱格式不对',
            duration: 2000,
            location: 'middle'
        });
        //$('#errormsg').show().find('em').html('邮箱格式不对');
        return false;
    }
}
// 检查机构
function checkcompany() {
    var v = $('#bmcompany').val();
    if(v == '') {
        api.toast({
            msg: '工作单位不能为空',
            duration: 2000,
            location: 'middle'
        });
        //$('#errormsg').show().find('em').html('工作单位不能为空');
        return false;
    } else {
        v = v.replace(/[^\x00-\xff]/g, 'xx');
        if(v.length >= 3 && v.length <= 40) {
            $('#errormsg').hide().find('em').html('');
            return true;
        }
        api.toast({
            msg: '工作单位格式不对',
            duration: 2000,
            location: 'middle'
        });

        //$('#errormsg').show().find('em').html('工作单位格式不对');
        return false;
    }
}
// 检查职务
function checkjob() {
    var v = $('#bmjob').val();
    if(v == '') {
        $('#errormsg').show().find('em').html('职务不能为空');
        return false;
    } else {
        $('#errormsg').hide().find('em').html('');
        return true;
    }
}
// 报名提交
$(function() {
    $('#successModal').on('show.bs.modal', function (e) {
        setTimeout(function(){
            $('#successModal').modal('hide');
            window.location.reload();
        }, 3000);
    });
    // 检测关闭
    // 点击立即报名
    $('#bmformsubmit_old').click(function() {
        var form = $('#baomingform');
        var turl = form.attr('action');
        if(!checkmobile() || !checksmsnull() || !checkusername() || !checkcompany() || !checkemail()) {
            return false;
        }
        var $signupModal = $('#signupModal');
        if ($signupModal.html() != undefined) {
            $('#signupModal').one('hidden.bs.modal', function (e) {
                $('#signupTipModal').modal({
                    backdrop:'static'
                });
            });
            $('#signupModal').modal('hide');
        }else {
            $('#signupTipModal').modal({
                backdrop:'static'
            });
        }
    });
    // 报名表单确认
    //$('#submitsignbtn').click(function(){
    $('#bmformsubmit').click(function(){
        //$('#signupModal').unbind('hidden.bs.modal');
        if(!checkmobile() || !checksmsnull() || !checkusername() || !checkcompany() || !checkemail()) {
            return false;
        }

        var mobile = $('#bmmobile').val();
        var username = $('#bmusername').val();
        var company = $('#bmcompany').val();
        var email = $('#bmemail').val();
        var courseid = $('#bmcourseid').val();
        var page_title = $('#bmpagetitle').val();
        var url_from = $('#bmurlfrom').val();
        console.log('报名'+mobile+username+company+email+courseid+page_title+url_from);

        var userinfo  = $api.getStorage('userinfo');
        api.ajax({
            url: wwwurl +'course/enrol',
            method: 'post',
            headers: {
              'TOKEN':ygtuserinfo.token
            },
            data: {
                values: {
                  'mobile':mobile,
                  'username':username,
                  'company':company,
                  'email':email,
                  'courseid':courseid,
                  'page_title':page_title,
                  'url_from':url_from,
                  'uid':ygtuserinfo.id
                },
            }
        },function(ret, err){
          // console.log('存储接口信息')
          console.log(JSON.stringify(ret));
          console.log(JSON.stringify(err));
            if (ret) {
                console.log( JSON.stringify( ret ) +'提交报名接口');
                if (ret.data == null) {
                    api.toast({
                        msg: ret.msg,
                        duration: 2000,
                        location: 'middle'
                    });
                } else {
                    var userinfo = ret.data.userinfo;
                    console.log(JSON.stringify(userinfo));
                    $api.setStorage('userinfo', userinfo);

                };
                api.toast({
                    msg: '提交成功',
                    duration: 2000,
                    location: 'middle'
                });
                checkvip();
                //window.location.reload();
                // api.toast(ret.msg)
            } else {
                console.log( JSON.stringify( err ) +'提交报名接口错误信息');
            }
        });
    });
})
