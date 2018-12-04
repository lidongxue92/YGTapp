// 获取视频图片
function loadData() {
    $(".loading").show();
    $("#classmid").html(classroomid);
    console.log('这是视频id' + classroomid);
    console.log(JSON.stringify(ygtuserinfo));
    api.ajax({
            url: apihost + '/api/wtk/classroom/getinfo',
            method: 'post',
            headers: {
                'TOKEN':ygtuserinfo.token
            },
            data: {
                values: {
                    classroomid: classroomid,
                    uid:ygtuserinfo.id
                }
            }
        },
        function(data, err) {
            console.log(JSON.stringify(data)+'直播的数据');
            if (data) {
                $(".loading").hide();
                if (data.code == 1) {
                    userlist = data.data.userlist;
                    listid = data.data.info.listid;
                    groupid = data.data.info.groupid;
                    starttime = data.data.info.begintime;
                    is_reward = data.data.info.is_reward;
                    $api.setStorage('groupid', groupid);
                    // 自己信息
                    selfpic = data.data.wtkuser.avatar;
                    selfname = data.data.wtkuser.nickname;

                    $api.setStorage('selfname', selfname);
                    selfpos = userlist[data.data.wtkuser.id]['pos'];
                    time = data.time;
                    // 判断时间
                    if (data.data.info.endtime == 0 || data.data.info.endtime > time) {
                        isend = true;
                        $api.css($api.byId('section'),'bottom:50px;');
                    } else {
                        $("#footer").hide();
                        $("#questionbut").hide()
                        $api.css($api.byId('section'),'bottom:0px;');
                        isend = false;
                    }

                    infotype = data.data.info.type;

                    //是否有课程名称
                    if(data.data.info.name != ''){
                      $("#header .title").html(data.data.info.name)
                    }else{
                      $("#header .title").html('直播间')
                    }
                    // 分享信息
                    sharetitle = data.data.titles.title;
                    sharedesc = data.data.titles.description;
                    shareurl = data.data.titles.shareurl;
                    var shareimg = data.data.titles.shareimg;
                    img = shareimg.split('?')[0];
                    shareicon = img;

                    // 是否有邀请
                    if (data.data.wtkuser.id == data.data.info.uid) {
                        hasinvite = 1;
                    }
                    // 邀请地址
                    if (data.data.info['listid'] == 5 || data.data.info['listid'] == 1) {
                        publicinviteurl = 'http://www.wtk.so/public/schoolinvite?id=' + classroomid + '&uid=' + data.data.wtkuser.id;
                    } else {
                        publicinviteurl = 'http://www.wtk.so/public/invite?id=' + classroomid + '&uid=' + data.data.wtkuser.id;
                    }

                    //红包设置
                    if(data.data.info.reward_intro != ''){
                      $("#redselect").find('.redcont-tip').html(data.data.info.reward_intro);
                    }
                    //红包金额
                    if(data.data.info.reward_amount != ''){
                        var reward_amount = data.data.info.reward_amount;
                        var amounts = reward_amount.split(',');
                        var amountlen = amounts.length;
                          var amounthtml = '';
                        for (var i=0; i<amountlen; i++) {
                          if (amounts[i] == '' || amounts[i] == 0) {
                              continue;
                          }
                          amounthtml += '<li><button><em>'+amounts[i]+'</em></button></li>';
                        }
                        $("#redselect").find('.redcont-num').html(amounthtml);
                    }
                    // 处理广告
                    // if (data.data.info.noticevalue != '' && data.data.info.noticevalue != null) {
                    //     var headerhtml = '<div class="bulletin">';
                    //     if (data.data.info.noticeurl == '') {
                    //         headerhtml += '<a href="#" >';
                    //     } else {
                    //         headerhtml += '<a href="' + data.data.info.noticeurl + '" >';
                    //     }
                    //     headerhtml += '<i class="iconfont">&#xe6df;</i>' +
                    //         '<span id="bulletin">' + data.data.info.noticevalue + '</span>' +
                    //         '</a>' +
                    //         '</div>';
                    //         //alert(headerhtml)
                    //     $('#swiper-wrapper').before(headerhtml);
                    //     $('#bulletin').liMarquee({
                    //         hoverstop: false,
                    //         scrollamount:20
                    //     });
                    // }

                    // 处理swip图片
                    var photos = data.data.photos;
                    var plen = photos.length;
                    var phtml = '';
                    if (plen > 0) {
                        for (var i = 0; i < plen; i++) {
                            phtml += '<div class="swiper-slide">' +
                                '<img data-src="' + photos[i]['photo'] + '?imageView2/2/h/380" alt="" class="swiper-lazy" />' +
                                '<div class="swiper-lazy-preloader"></div>' +
                                '</div>';
                        }
                        $('#swiper-wrapper').html(phtml);

                    } else if (data.data.info.thumb != '') {
                        phtml += '<div class="swiper-slide"><img src="'+data.data.info.thumb+'" alt=""></div>';
                        $('#swiper-wrapper').html(phtml);
                    }else {
                        phtml += '<div class="swiper-slide"><img src="../img/classroom.jpg" alt=""></div>';
                        $('#swiper-wrapper').html(phtml);
                    }
                    myswiper =  new Swiper('.swiper-container', {
                        pagination: '.swiper-pagination',
                        paginationType: 'fraction',
                        lazyLoading : true
                    });

                    // 自己的图标
                    setTimeout(function () {
                        $(".users").show();
                        $('.users-item img').attr('src', selfpic);
                        var ulen = Object.getOwnPropertyNames(userlist).length;
                        if (ulen > 300 || selfpos == 2) {
                            $('.users-item').append(ulen + '人参与');
                        }
                    }, 1000);



                    // // 是否关注
                    // if (data.data.isfollow == 1) {
                    //     // 已关注
                    //     $api.attr($api.byId('see'),'src','../img/heart-full.png');
                    //     $('#dofollow p').html('已关注');
                    // } else {
                    //     $api.attr($api.byId('see'),'src','../img/heart.png');
                    //     $('#dofollow p').html('关注直播间');
                    // }
                    // 处理buckets
                    bucketsarr = data.data.bucketarr;
                    console.log('图片地址' + JSON.stringify(bucketsarr));

                    refreshlist();
                    getrytoken(); // 页面内容渲染
                    ptmessagelist();
                } else {
                    //alert(thisurl);
                    api.alert({
                        title: '提示',
                        msg: data.msg,
                    }, function(ret, err){
                        if( ret ){
                             api.closeWin({
                                 name: 'classroom'
                             });

                        }else{
                             alert( JSON.stringify( err ) );
                        }
                    });
                }
            } else {
                console.log(JSON.stringify(err) + 'getUserInfo接口错误信息');
                if (err.statusCode == 401) {
                    //  alert('no login');

                    api.openWin({
                        name: 'login',
                        url: '../login.html',
                        animation: {
                            type: 'none'
                        }
                    });

                }
            }
        });

}

//直播下拉刷新
$(function() {
    // 主框架内容
    $('#page').val(0);
    $('#list').pullToRefresh();
    $('#list').on("pull-to-refresh", function(e) {
        refreshlist();
    });
    //众聊
    //ptmessagelist()//聊天
});
// 直播详细内容
function refreshlist() {
    //var time = Math.round(new Date().getTime()/1000).toString();
    // alert(time+'这是时间戳');

    var page = parseInt($('#page').val()) + 1;
    var isall = $('#isall').val();
    //var classroomid =api.pageParam.id
    $.showLoading();
    api.ajax({
        url: apihost + '/api/wtk/classroom/getchatlist',
        method: 'post',
        headers: {
            'TOKEN':ygtuserinfo.token
        },
        data: {
            values: {
                classroomid: classroomid,
                time: time,
                posarg: '1',
                page: page,
                isall: isall,
                uid:ygtuserinfo.id
            },
        }
    }, function(data, err) {
        if (data) {
            $.hideLoading();
            if (data.code == 1) {
                var html = '';
                var source = data.data;
                var len = source.length;
                var hasbigin = false;
                for (var i = 0; i < len; i++) {
                    // 前面三种消息不需要获取发送者头像
                    if (source[i].object_name == 'beginreward') {
                        // html += '<li>' +
                        //     '<p class="redtip" >' + source[i].content.content +
                        //     '</p>' +
                        //     '</li>';
                        if (infotype != 3) {
                            html += '<li id="countdownparentsli">' +
                                '<div class="countdown">' +
                                '<p class="oh w100 tc">直播倒计时</p>' +
                                '<span id="countdown">' +
                                '<i>88</i>天<i>88</i>时<i>88</i>分<i>88</i>秒'+
                                '</span>' +
                                '</div>' +
                                '</li>';
                        }
                        // if (hasinvite) {
                        //     html += '<li>' +
                        //         '<div class="invite oh">' +
                        //         '<dl>' +
                        //         '<dt><img src="http://www.wtk.so/Public/img/setup07.png"></dt>' +
                        //         '<dd><h2>邀请讲师</h2></dd>' +
                        //         '<dd>此消息仅创建者和管理员可见</dd>' +
                        //         '<dd>点击【立即邀请】按钮邀请讲师入场</dd>' +
                        //         '</dl>' +
                        //         '<p class="w100 mt15"><a href="' + inviteurl + '" class="invitebut">立即邀请</a></p>' +
                        //         '</div>' +
                        //         '</li>';
                        // }
                        // if (isend) {
                        //     html += '<li>' +
                        //         '<div class="invite oh">' +
                        //         '<dl>' +
                        //         '<dt><i class="iconfont">&#xe614;</i></dt>' +
                        //         '<dd><h2>邀请朋友一起学习</h2></dd>' +
                        //         '<dd>每位同学都有专属的邀请卡</dd>' +
                        //         '<dd>点击【我的专属邀请卡】邀请朋友一起学习！</dd>' +
                        //         '</dl>' +
                        //         '<p class="w100 mt15"><a href="' + publicinviteurl + '" class="invitebut">我的专属邀请卡</a></p>' +
                        //         '</div>' +
                        //         '</li>';
                        // }
                        hasbigin = true;
                    } else if (source[i].object_name == 's:question') {
                        html += '<li>' +
                            '<p class="systemtip" ><em>系统消息：' + source[i].username + '向讲师问了一个问题</em></p>' +
                            '</li>';
                    } else if (source[i].object_name == 's:system') {
                        html += '<li>' +
                            '<p class="systemtip" ><em>系统消息：' + source[i].content.content + '</em></p>' +
                            '</li>';
                    } else {

                        if (source[i].isself) {
                            html += '<li class="my">' +
                                '<div class="user-head"><img src="' + source[i].pic + '" /></div>' +
                                '<div class="user-msgw">';

                        } else {
                            html += '<li data-id="' + source[i].id + '">' +
                                '<div class="user-head"><img src="' + source[i].pic + '" />';
                            if (source[i].pos == '讲师') {
                                html += '<a href="javascript:void(0);" class="reward open-popup" data-target="#zsred">赏</a>';
                            }
                            html += '</div>' +
                                '<div class="user-msgw">' +
                                '<div class="user-name">' + source[i].username;
                            if (source[i].pos != '') {
                                html += '<em>' + source[i].pos + '</em>';
                            }
                            html += '</div>';
                        }


                        if (source[i].object_name == 's:reward') {

                            html += '<div class="user-msg red">' +
                                '<i class="ico"></i>' +
                                '<dl class="redtip">' +
                                '<dt><img src="../img/redicon.png"></dt>' +
                                '<dd>老师讲得太赞啦~</dd>' +
                                '<dd>我忍不住赞赏了一个红包</dd>' +
                                '<input type="hidden" value="' + source[i].content.sendusername + '" class="sendusername" />' +
                                '<input type="hidden" value="' + source[i].content.receivename + '" class="receivename" />' +
                                '<input type="hidden" value="' + source[i].content.extra + '" class="total_fee" />' +
                                '<input type="hidden" value="' + source[i].pic + '" class="pic" />' +
                                '</dl>' +
                                '<p><em>微信红包</em><i class="iconfont">&#xe617;</i></p>' +
                                '</div>' +
                            '</div>' +
                            '</li>';

                        } else if (source[i].object_name == 'RC:TxtMsg') {
                            html += '<div class="user-msg"><i class="ico"></i>' + source[i].content.content + '</div>';
                        } else if (source[i].object_name == 'RC:ImgMsg') {
                            html += '<div class="user-msg msgimage"><i class="ico"></i><img src="' + source[i].content.content + '"></div>';
                        } else {

                            if (source[i].isself) {
                                if (source[i].object_name == 'RC:VcMsg') {
                                    html += '<div class="user-msg msgvoice" data-id="' + source[i].id + '" data-src="' + source[i].content.content + '" data-img="' + source[i].imgpage + '">' +
                                        '<i class="ico"></i>' +
                                        source[i].content.duration + '＂' +
                                        '<i class="iconfont">&#xe60c;</i>' +
                                        '</div>';
                                } else if (source[i].object_name == 's:answer') {
                                    html += '<div class="user-msg">' +
                                        '<i class="ico"></i>' +
                                        '<span>回答<em>' + source[i].content.questionusername + '</em>问：</span>' +
                                        source[i].content.content +
                                        '<p class="w100"></p>' +
                                        '</div>' +
                                        '<div class="user-msg msgvoice clear" data-id="' + source[i].id + '" data-src="' + source[i].content.voicesrc + '" >' +
                                        source[i].content.duration + '＂<i class="iconfont">&#xe60c;</i>' +
                                        '</div>';
                                }
                            } else {
                                if (source[i].object_name == 'RC:VcMsg') {
                                      //html += '<audio class="user-msg msgvoice othermsgvoice" data-id="' + source[i].id + '"  src="' + source[i].content.content + '" data-img="' + source[i].imgpage + '">'+'</audio>'
                                      html += '<div class="user-msg msgvoice othermsgvoice" data-id="' + source[i].id + '" data-src="' + source[i].content.content + '" data-img="' + source[i].imgpage + '">' +
                                        '<i class="ico"></i>' +
                                        '<i class="iconfont">&#xe609;</i>' +
                                        source[i].content.duration + '＂' +
                                        '<i class="unread"></i>' +
                                        '</div>';
                                } else if (source[i].object_name == 's:answer') {
                                    html += '<div class="user-msg">' +
                                        '<i class="ico"></i>' +
                                        '<span>回答<em>' + source[i].content.questionusername + '</em>问：</span>' +
                                        source[i].content.content +
                                        '<p class="w100"></p>' +
                                        '</div>' +
                                        '<div class="user-msg msgvoice othermsgvoice clear" data-id="' + source[i].id + '" data-src="' + source[i].content.voicesrc + '" >' +
                                        '<i class="iconfont">&#xe609;</i>' +
                                        source[i].content.duration + '＂<i class="unread"></i>' +
                                        '</div>';
                                }
                            }
                        }
                        html += '</div></li>';
                    }
                }
                // alert('for end');
                var oldtop = $('#list')[0].scrollHeight;
                //alert(oldtop)
              $('#list li').eq(0).before(html);

              $('#list').scrollTop(0);

              $('#list img').last().load(function(){
                  var newtop = $('#list')[0].scrollHeight;
                  $('#list').scrollTop( parseInt(newtop) );
              });

              $('#page').val(page);
              if (hasbigin || infotype == 3) {
                  // clearInterval(inter);
                // ShowCountDown(leftsecond,'countdown');
                var now = new Date();
                var leftsecond = parseInt(starttime) - parseInt(now.getTime()/1000);
                  inter = setInterval(function(){
                      ShowCountDown(leftsecond,'countdown');
                      leftsecond--;
                  }, 1000);
              }
          }
          $('#list').pullToRefreshDone();
          //ptmessagelist() // 聊天信息

        } else {
            console.log('接口错误信息getchatlist：');
            console.log(JSON.stringify(err));
        }
    });
}


// 众聊
function ptmessagelist() {
    //var classroomid = api.pageParam.id;
    //var time = Math.round(new Date().getTime()/1000).toString();
    api.ajax({
        url: apihost + '/api/wtk/classroom/getchatlist',
        method: 'post',
        headers:{
            'TOKEN':ygtuserinfo.token
        },
        data: {
            values: {
                classroomid:classroomid,
                time:time,
                posarg:0,
                page:1,
                isall:1,
                uid:ygtuserinfo.id
            }
        }
    },function(ret, err){
        if (ret) {
            // alert( JSON.stringify( ret ) );
            var html = '';
                var source = ret.data;
                var len = source.length;
                if (len > 0) {
                    for (var i=0; i<len;i++) {
                        html += '<li>' +
                            '<img src="'+source[i].pic+'" />' +
                            '<p class="name"><em>'+source[i].username+'</em>说</p>' +
                            '<p>'+source[i].content.content+'</p>' +
                            '</li>';
                    }
                    // alert(html)
                    $('#PTmessage').html(html);
                    $('#PTmessage').scrollTop( $('#PTmessage')[0].scrollHeight );

                    $('#PTmessage').show();
                    $('#openlist').hide();
                    $('#closelist').show();
                }else {
                    $('#PTmessage').hide();
                    $('#openlist').show();
                    $('#closelist').hide();
                }
        } else {
            console.log('getchatlist 错误信息：');
            console.log(JSON.stringify(err));
        }
    });

    // $api.post(
    //   'http://member.ygt.cm/api/wtk/classroom/getchatlist',
    //   {
    //   values: {
    //     classroomid:classroomid,
    //     time:time,
    //     posarg:0,
    //     page:1,
    //     isall:1
    //   }
    // },function(data){
    //   // console.log(data+'这是聊天信息');
    //   // alert(data.code)
    //   if(data.code == 1){
    //     // alert(data+'这是聊天信息')
    //     var html = '';
    //         var source = data.data;
    //         var len = source.length;
    //
    //         if (len > 0) {
    //             for (var i=0; i<len;i++) {
    //                 html += '<li>' +
    //                     '<img src="'+source[i].pic+'" />' +
    //                     '<p class="name"><em>'+source[i].username+'</em>说</p>' +
    //                     '<p>'+source[i].content.content+'</p>' +
    //                     '</li>';
    //             }
    //             // alert(html)
    //             $('#PTmessage').html(html);
    //             $('#PTmessage').scrollTop( $('#PTmessage')[0].scrollHeight );
    //
    //             $('#PTmessage').show();
    //             $('#openlist').hide();
    //             $('#closelist').show();
    //         }else {
    //             $('#PTmessage').hide();
    //             $('#openlist').show();
    //             $('#closelist').hide();
    //         }
    //   }
    // },'json');
}

// 最小高度
var minRows = 1;
// 最大高度，超过则出现滚动条
var maxRows = 5;
function ResizeTextarea(){
    var t = document.getElementById('txtContent');
    if (t.scrollTop == 0)
    t.scrollTop=1;
    while (t.scrollTop == 0){
        if (t.rows > minRows)
        t.rows--;
        else
        break;
        t.scrollTop = 1;
        if (t.rows < maxRows)
        t.style.overflowY = "hidden";
        if (t.scrollTop > 0){
            t.rows++;
            break;
        }
    }
    while(t.scrollTop > 0){
        if (t.rows < maxRows){
            t.rows++;
            if (t.scrollTop == 0) t.scrollTop=1;
        }
        else{
            t.style.overflowY = "auto";
            break;
        }
    }
};

// 富文本发送
$('#txtsendbtn').on('click',function(){
    var txt = $('#txtContent').val();
    var groupid = $api.getStorage('groupid')
    var selfname = $api.getStorage('selfname')
    var classroomid = api.pageParam.id;
    if (txt != '') {
        if (selfpos == '0') {
            html = '<li>'
                    +'<img src="'+selfpic+'"/>'
                    +'<p class="name"><em>'+selfname+'</em>说</p>'
                    +'<p class="con"><i class="icon"></i>'+txt+'</p>'
                +'</li>';
            $('#PTmessage').append(html);
            $('#PTmessage').scrollTop($('#PTmessage')[0].scrollHeight);
        }else {
            var html = '<li class="my">'
            +'<div class="user-head"><img src="'+selfpic+'"></div>'
            +'<div class="user-msgw">'
            +'<div class="user-msg"><i class="ico"></i>'+txt+'</div>'
            +'</div>'
            +'</li>';
            $('#list').append(html);
            $('#list').scrollTop( $('#list')[0].scrollHeight );
            $('#listdiv').scrollTop( $('#listdiv')[0].scrollHeight );
        }
        api.ajax({
            url: apihost + '/api/wtk/classroom/sendMsg',
            method: 'post',
            headers: {
                'TOKEN':ygtuserinfo.token
            },
            data: {
                values: {
                  content:txt,
                  objectName:'RC:TxtMsg',
                  groupid:groupid,
                  classroomid:classroomid,
                  uid:ygtuserinfo.id
                }
            }
        },function(data, err) {
            if (data.code == 1) {

              $.toast("提交成功!",'text');
            }else {
              $.toast("提交失败！",'text');
            }
          }
      );
    }
    $('#txtContent').val('');
    ResizeTextarea();
});

//提问回答通道
  var Qb = $('#questionbut'),
      Qf = $('#Qform,#return,#return .iconfont'),
      pop = $('#qpop'),
      inu = $('#indexnum'),
      subbtn = $('#qsubmit'),
      qlist = $('#qlist');
// 提问或者回答按钮
Qb.bind('click',function(e){
    e.preventDefault();
    e.stopPropagation();
    Qf.fadeIn();
    pop.find('textarea').eq(0).focus();
    setTimeout(function () {
        pop.slideDown(200,function(){
            var returntop =parseInt(document.body.clientHeight - pop.height()-50);
            $("#return").animate({marginTop:returntop},100);
        });
    }, 500);


});
// 表单点击触发隐藏
Qf.bind('click',function(e){
    if(e.target==this){
        e.preventDefault();
        e.stopPropagation();
        pop.hide();
        Qf.hide();
    };
});
// 提问的框字数变多
pop.find('textarea').bind('input propertychange',function(){
    var v = $(this).val();
    v=v.replace(/[^\x00-\xff]/g, 'xx');

    inu.html(v.length);
    if(v.length>200){
        inu.siblings('em').html('问题字数超出!');
    }else{
        inu.siblings('em').html('');
    }
});
// 提问提交
subbtn.bind('click',function(e){
    e.preventDefault();
    e.stopPropagation();
    var v = pop.find('textarea').val();
    v=v.replace(/[^\x00-\xff]/g, 'xx');
    if(v.length==0){
        inu.siblings('em').html('请输入问题内容!');
        return false;
    }else if(v.length>200){
        inu.siblings('em').html('问题字数超出!');
        return false;
    }else{
        inu.siblings('em').html('');
        //执行提交
        var txt = pop.find('textarea').val();
         if (txt != '') {
             var html = '<li>'
                 +'<p class="systemtip" >'
                 +'<em>系统消息：'+selfname+'向讲师问了一个问题</em>'
                 //+ sub(txt, 26)
                 +'</p>'
                 +'</li>';
             $('#list').append(html);
             $('#list').scrollTop( $('#list')[0].scrollHeight );
             $('#listdiv').scrollTop( $('#listdiv')[0].scrollHeight );
             pop.find('textarea').val('');
             if (pop.attr('class') == 'qpop') {
                 pop.hide();
                 Qf.hide();
             }
             api.ajax({
                 url: apihost + '/api/wtk/classroom/sendMsg',
                 method: 'post',
                 headers: {
                     'TOKEN':ygtuserinfo.token
                 },
                 data: {
                     values: {
                       content:txt,
                       objectName:'s:question',
                       groupid:groupid,
                       classroomid:classroomid,
                       uid:uygtuserinfo.id
                     }
                 }
             },function(data, err) {
                 if (data.code == 1) {
                   //$.toast("提交成功!",'text');
                 }else {
                   $.toast("提交失败！",'text');
                 }
               }
           );
         }

    }
});
