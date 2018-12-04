/**
 * 版本：2018年4月4日19:24:49
 */
$(function(){


    //------------------------消息输入模式下消息列表置底-------------
    $('#list').scrollTop( $('#list')[0].scrollHeight );

    /*
    * 调用
    */
////////////语音文字切换////////////
    var txt = $('#text'),
        voice = $('#voice');
    //var tools = $('#tools');
    $(document).on("click", "#voice .switchbut", function() {
        if(txt.is(":hidden") == true) {
            txt.removeAttr('hidden');
            voice.attr('hidden', true);
            $(tools).attr('hidden', true);
            $('#opentools').removeClass('in');
            $('#txtContent').focus();
        }
    });
    $(document).on("click", "#text .switchbut", function() {
        if(voice.is(":hidden") == true) {
            voice.removeAttr('hidden');
            txt.attr('hidden', true);
            $('#txtContent').focusout();
            $(tools).attr('hidden', true);
            $('#opentools').removeClass('in');
        }
    });
    /*$("#voiceselect").touchwipe({
       wipeLeft:function(){
           $('#voiceselect').animate({
               left:-100+'%'
           },300);
           $('#voice-name > span').eq(1).addClass('index').siblings('span').removeClass('index');
       },
       wipeRight:function(){
           $('#voiceselect').animate({
               left:0
           },300);;
           $('#voice-name > span').eq(0).addClass('index').siblings('span').removeClass('index');
       },
    });
    $('#voice-name > span').eq(0).on('mouseup touchstart',function(){
       $(this).addClass('index').siblings('span').removeClass('index');
       $('#voiceselect').animate({
           left:0
       },300);
    });
    $('#voice-name > span').eq(1).on('mouseup touchstart',function(){
       $(this).addClass('index').siblings('span').removeClass('index');
       $('#voiceselect').animate({
           left:-100+'%'
       },300);
    });*/

});

function refresh() {
    var page = parseInt($('#page').val()) + 1;
    var isall = $('#isall').val();
    var classroomid = api.pageParam.id
    $.showLoading();
    api.ajax({
        url: 'http://member.ygt.cm/api/wtk/classroom/getchatlist',
        method: 'post',
        data: {
            values: {
                classroomid: '315',
                time: '1534486194',
                posarg: '1',
                page: page,
                isall: isall
            },
        }
    }, function(data, err) {
        if (data) {
            // $.hideLoading();
            console.log(JSON.stringify(data) + '接口信息');
            if (data.code == 1) {
                var html = '';
                var source = data.data;
                var len = source.length;
                var hasbigin = false;
                for (var i = 0; i < len; i++) {
                    // 前面三种消息不需要获取发送者头像
                    if (source[i].object_name == 'beginreward') {
                        html += '<li>' +
                            '<p class="redtip" >' + source[i].content.content +
                            '</p>' +
                            '</li>';
                        if (infotype != 3) {
                            html += '<li id="countdownparentsli">' +
                                '<div class="countdown">' +
                                '<p class="oh w100 tc">直播倒计时</p>' +
                                '<span id="countdown">' +
                                '<i>88</i>天<i>88</i>时<i>88</i>分<i>88</i>秒' +
                                '</span>' +
                                '</div>' +
                                '</li>';
                        }
                        if (hasinvite) {
                            html += '<li>' +
                                '<div class="invite oh">' +
                                '<dl>' +
                                '<dt><img src="http://www.wtk.so/Public/img/setup07.png"></dt>' +
                                '<dd><h2>邀请讲师</h2></dd>' +
                                '<dd>此消息仅创建者和管理员可见</dd>' +
                                '<dd>点击【立即邀请】按钮邀请讲师入场</dd>' +
                                '</dl>' +
                                '<p class="w100 mt15"><a href="' + inviteurl + '" class="invitebut">立即邀请</a></p>' +
                                '</div>' +
                                '</li>';
                        }
                        if (isend) {
                            html += '<li>' +
                                '<div class="invite oh">' +
                                '<dl>' +
                                '<dt><i class="iconfont">&#xe614;</i></dt>' +
                                '<dd><h2>邀请朋友一起学习</h2></dd>' +
                                '<dd>每位同学都有专属的邀请卡</dd>' +
                                '<dd>点击【我的专属邀请卡】邀请朋友一起学习！</dd>' +
                                '</dl>' +
                                '<p class="w100 mt15"><a href="' + publicinviteurl + '" class="invitebut">我的专属邀请卡</a></p>' +
                                '</div>' +
                                '</li>';
                        }
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
                            html += '<li  data-id="' + source[i].id + '" >' +
                                '<div class="user-head"><img src="' + source[i].pic + '" />';
                            if (source[i].pos == '讲师') {
                                html += '<a href="javascript:void(0);" class="reward open-popup" data-target="#zsred">赏</a>';
                            }
                            html += '</div>' +
                                '<div class="user-msgw" >' +
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
                                '<dt><img src="http://www.wtk.so/Public/img/redicon.png"></dt>' +
                                '<dd>老师讲得太赞啦~</dd>' +
                                '<dd>我忍不住赞赏了一个红包</dd>' +
                                '<input type="hidden" value="' + source[i].content.sendusername + '" class="sendusername" />' +
                                '<input type="hidden" value="' + source[i].content.receivename + '" class="receivename" />' +
                                '<input type="hidden" value="' + source[i].content.extra + '" class="total_fee" />' +
                                '<input type="hidden" value="' + source[i].pic + '" class="pic" />' +
                                '</dl>' +
                                '<p><em>微信红包</em><i class="iconfont">&#xe617;</i></p>' +
                                '</div>'

                            +
                            '</div>' +
                            '</li>';

                        } else if (source[i].object_name == 'RC:TxtMsg') {
                            html += '<div class="user-msg"><i class="ico"></i>' + source[i].content.content + '</div>';
                        } else if (source[i].object_name == 'RC:ImgMsg') {
                            html += '<div class="user-msg msgimage"><i class="ico"></i><img src="' + replace_oss_upload_path(source[i].content.content) + '"></div>';
                        } else {
                            if (source[i].isself) {
                                if (source[i].object_name == 'RC:VcMsg') {
                                    html += '<div class="user-msg msgvoice" data-id="' + source[i].id + '" data-src="' + source[i].content.content + '" data-img="' + source[i].imgpage + '">' +
                                        '<i class="ico"></i>' +
                                        source[i].content.duration + '＂' +
                                        '<i class="iconfont">&#xe60c;</i>' +
                                        '</div>';
                                } else if (source[i].object_name == 's:answer') {
                                    html += '<div class="user-msg" >' +
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
                var oldtop = $('#list')[0].scrollHeight;
                $('#list li').eq(0).before(html);

                $('#list').scrollTop(oldtop);

                $('#list img').last().load(function() {
                    var newtop = $('#list')[0].scrollHeight;
                    $('#list').scrollTop(parseInt(newtop));
                });

                $('#page').val(page);
                if (hasbigin || infotype == 3) {
                    inter = setInterval(function() {
                        ShowCountDown(leftsecond, 'countdown');
                        leftsecond--;
                    }, 1000);
                }
            }
            $('#list').pullToRefreshDone();

        } else {
            console.log(JSON.stringify(err) + '接口错误信息');
        }
    });
}
// 众聊
function ptmessagelist() {
    $.post(
        getchaturl,
        {'classroomid':classroomid,'time':time,'posarg':0, 'page':1,'isall':1},
        function (data) {
            if (data.code == 1) {
                console.log(data);
                var html = '';
                var source = data.data;
                var len = source.length;
                if (len > 0) {
                    for (var i=0; i<len;i++) {
                        html += '<li>' +
                            '<img src="'+source[i].pic+'" />' +
                            '<p class="name"><em>'+source[i].username+'</em>说</p>' +
                            '<p>'+source[i].content.content+'</p>' +
                            '</li>';
                    }
                    $('#PTmessage').html(html);
                    $('#PTmessage').scrollTop( $('#PTmessage')[0].scrollHeight );

                    PTmessage.show();
                    openlist.hide();
                    closelist.show();
                }else {
                    PTmessage.hide();
                    openlist.show();
                    closelist.hide();
                }

            }
        },
        'json'
    );
}

function refreshalllist() {
    $.showLoading();
    $.post(
            getchaturl,
            {'classroomid':classroomid,'time':time,'posarg':1, 'page':1,'isall':1},
            function(data) {
                $.hideLoading();
                if (data.code == 1) {

                    var html = '';
                    var source = data.data;
                    var len = source.length;
                    var hasbigin = false;
                    for (var i=0;i<len;i++) {
                        // 前面三种消息不需要获取发送者头像
                        if (source[i].object_name == 'beginreward') {
                            html += '<li>'
                                    +'<p class="redtip" >'+source[i].content.content
                                    +'</p>'
                                +'</li>';
                            if (infotype != 3) {
                            html += '<li id="countdownparentsli">'
                                        +'<div class="countdown">'
                                            +'<p class="oh w100 tc">直播倒计时</p>'
                                            +'<span id="countdown">'
                                                +'<i>88</i>天<i>88</i>时<i>88</i>分<i>88</i>秒'
                                            +'</span>'
                                        +'</div>'
                                +'</li>';
                            }
                            if (hasinvite) {
                                html += '<li>'
                                    +'<div class="invite oh">'
                                        +'<dl>'
                                            +'<dt><img src="http://www.wtk.so/Public/img/setup07.png"></dt>'
                                            +'<dd><h2>邀请讲师</h2></dd>'
                                            +'<dd>此消息仅创建者和管理员可见</dd>'
                                            +'<dd>点击【立即邀请】按钮邀请讲师入场</dd>'
                                        +'</dl>'
                                        +'<p class="w100 mt15"><a href="'+inviteurl+'" class="invitebut">立即邀请</a></p>'
                                    +'</div>'
                                +'</li>';
                            }
                            hasbigin = true;
                        }else if (source[i].object_name == 's:question') {
                            html += '<li>'
                                    +'<p class="systemtip" ><em>系统消息：'+source[i].username+'向讲师问了一个问题</em></p>'
                                +'</li>';
                        }else if (source[i].object_name == 's:system') {
                            html += '<li>'
                                +'<p class="systemtip" ><em>系统消息：'+source[i].content.content+'</em></p>'
                            +'</li>';
                        }
                        else{

                            if (source[i].isself ) {
                                html += '<li class="my">'
                                    +'<div class="user-head"><img src="'+source[i].pic+'" /></div>'
                                    +'<div class="user-msgw">';

                            }else {
                                html += '<li data-id="'+source[i].id+'">'
                                    +'<div class="user-head"><img src="'+source[i].pic+'" />';
                                if (source[i].pos == '讲师') {
                                    html += '<a href="javascript:void(0);" class="reward open-popup" data-target="#zsred">赏</a>';
                                }
                                html += '</div>'
                                    +'<div class="user-msgw">'
                                    +'<div class="user-name">'+source[i].username;
                                if (source[i].pos != '') {
                                    html += '<em>'+source[i].pos+'</em>';
                                }
                                html += '</div>';
                            }


                            if(source[i].object_name == 's:reward'){

                                html += '<div class="user-msg red">'
                                            +'<i class="ico"></i>'
                                            +'<dl class="redtip">'
                                                +'<dt><img src="http://www.wtk.so/Public/img/redicon.png"></dt>'
                                                +'<dd>老师讲得太赞啦~</dd>'
                                                +'<dd>我忍不住赞赏了一个红包</dd>'
                                                +'<input type="hidden" value="'+source[i].content.sendusername+'" class="sendusername" />'
                                                +'<input type="hidden" value="'+source[i].content.receivename+'" class="receivename" />'
                                                +'<input type="hidden" value="'+source[i].content.extra+'" class="total_fee" />'
                                                +'<input type="hidden" value="'+source[i].pic+'" class="pic" />'
                                            +'</dl>'
                                            +'<p><em>微信红包</em><i class="iconfont">&#xe617;</i></p>'
                                        +'</div>'

                                    +'</div>'
                                +'</li>';

                            }else if (source[i].object_name == 'RC:TxtMsg') {
                                html += '<div class="user-msg"><i class="ico"></i>'+source[i].content.content+'</div>';
                            }else if (source[i].object_name == 'RC:ImgMsg') {
                                html += '<div class="user-msg msgimage"><i class="ico"></i><img src="'+replace_oss_upload_path(source[i].content.content)+'"></div>';
                            }else {
                                if (source[i].isself) {
                                    if (source[i].object_name == 'RC:VcMsg') {
                                        html += '<div class="user-msg msgvoice" data-id="'+source[i].id+'" data-src="'+source[i].content.content+'" data-img="'+source[i].imgpage+'">'
                                                    +'<i class="ico"></i>'
                                                    +source[i].content.duration+'＂'
                                                    +'<i class="iconfont">&#xe60c;</i>'
                                                +'</div>';
                                    }else if (source[i].object_name == 's:answer') {
                                        html += '<div class="user-msg">'
                                            +'<i class="ico"></i>'
                                            +'<span>回答<em>'+source[i].content.questionusername+'</em>问：</span>'
                                            +source[i].content.content
                                            +'<p class="w100"></p>'
                                            +'</div>'
                                            +'<div class="user-msg msgvoice clear" data-id="'+source[i].id+'" data-src="'+source[i].content.voicesrc+'" >'
                                            +source[i].content.duration+'＂<i class="iconfont">&#xe60c;</i>'
                                            +'</div>';
                                    }
                                }else {
                                    if (source[i].object_name == 'RC:VcMsg') {
                                    html += '<div class="user-msg msgvoice othermsgvoice" data-id="'+source[i].id+'" data-src="'+source[i].content.content+'" data-img="'+source[i].imgpage+'">'
                                                +'<i class="ico"></i>'
                                                +'<i class="iconfont">&#xe609;</i>'
                                                +source[i].content.duration+'＂'
                                                +'<i class="unread"></i>'
                                            +'</div>';
                                    }else if (source[i].object_name == 's:answer') {
                                        html += '<div class="user-msg" >'
                                            +'<i class="ico"></i>'
                                            +'<span>回答<em>'+source[i].content.questionusername+'</em>问：</span>'
                                            +source[i].content.content
                                            +'<p class="w100"></p>'
                                            +'</div>'
                                            +'<div class="user-msg msgvoice othermsgvoice clear" data-id="'+source[i].id+'" data-src="'+source[i].content.voicesrc+'" >'
                                            +'<i class="iconfont">&#xe609;</i>'
                                            +source[i].content.duration+'＂<i class="unread"></i>'
                                            +'</div>';
                                    }
                                }
                            }
                            html += '</div></li>';
                        }
                    }
                    //var oldtop = $('#list')[0].scrollHeight;
                    $('#list li').remove();//
                    $('#list').append(html);

                    $('#list').scrollTop( 0 );
                    $('#list img').last().load(function(){
                        $('#list').scrollTop( 0 );
                    });

                    $('#page').val(Math.ceil(len/20));
                    if (hasbigin || infotype == 3) {
                        inter = setInterval(function(){
                            ShowCountDown(leftsecond,'countdown');
                            leftsecond--;
                        }, 1000);
                    }

                }
                $('#endadmitip').hide();
                //$('#list').pullToRefreshDone();
            },
            'json'
            );
}
//------------------------文字消息编辑框效果----------------
// 最小高度
var minRows = 1;
// 最大高度，超过则出现滚动条
var maxRows = 5;
function ResizeTextarea(){
    var t = document.getElementById('txtContent');
    if (t.scrollTop == 0) t.scrollTop=1;
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
    if(t.value.length > 0) {
        $('#txtsendbtn').removeAttr('hidden');
    } else {
        $('#txtsendbtn').attr('hidden', true)
    }
};
//------------------------语音消息录音方式切换----------------
(function(a){




    a.fn.touchwipe=function(c){
        var b={
            drag:false,
            min_move_x:20,
            min_move_y:20,
            wipeLeft:function(){}, // 向左滑动
            wipeRight:function(){},/*向右滑动*/
            wipeUp:function(){},/*向上滑动*/
            wipeDown:function(){},/*向下滑动*/
            wipe:function(){},/*点击*/
            wipehold:function(){},/*触摸保持*/
            wipeDrag:function(x,y){},/*拖动*/
            preventDefaultEvents:true
        };
        if(c){a.extend(b,c)};
        this.each(function(){
            var h,g,j=false,i=false,e;
            var supportTouch = "ontouchstart" in document.documentElement;
            var moveEvent = supportTouch ? "touchmove" : "mousemove",
            startEvent = supportTouch ? "touchstart" : "mousedown",
            endEvent = supportTouch ? "touchend" : "mouseup";


            /* 移除 touchmove 监听 */
            function m(){
                this.removeEventListener(moveEvent,d);
                h=null;
                j=false;
                clearTimeout(e)
            };

            /* 事件处理方法 */
            function d(q){
                if(b.preventDefaultEvents){
                    q.preventDefault()
                };
                if(j){
                    var n = supportTouch ? q.touches[0].pageX : q.pageX;
                    var r = supportTouch ? q.touches[0].pageY : q.pageY;
                    var p = h-n;
                    var o = g-r;
                    if(b.drag){
                        h = n;
                        g = r;
                        clearTimeout(e);
                        b.wipeDrag(p,o);
                    }
                    else{
                        if(Math.abs(p)>=b.min_move_x){
                            m();
                            if(p>0){b.wipeLeft()}
                            else{b.wipeRight()}
                        }
                        else{
                            if(Math.abs(o)>=b.min_move_y){
                                m();
                                if(o>0){b.wipeUp()}
                                else{b.wipeDown()}
                            }
                        }
                    }
                }
            };

            /*wipe 处理方法*/
            function k(){clearTimeout(e);if(!i&&j){b.wipe()};i=false;j=false;};
            /*wipehold 处理方法*/
            function l(){i=true;b.wipehold()};

            function f(n){
                //if(n.touches.length==1){
                    h = supportTouch ? n.touches[0].pageX : n.pageX;
                    g = supportTouch ? n.touches[0].pageY : n.pageY;
                    j=true;
                    this.addEventListener(moveEvent,d,false);
                    e=setTimeout(l,750)
                //}
            };

            //if("ontouchstart"in document.documentElement){
                this.addEventListener(startEvent,f,false);
                this.addEventListener(endEvent,k,false)
            //}
        });
        return this
    };
})(jQuery);
$(function(){

var myswiper =  new Swiper('.swiper-container', {
    pagination: '.swiper-pagination',
    paginationType: 'fraction',
    lazyLoading : true
});
// 下面是播放录音
var audiop = document.getElementById("audioPlayer");
var jqaudio = $('#audioPlayer'),
Y=0,
srcstr='',
C = null,Ja=0;
//
var readarr = {};
localStorage.getItem("voiceReaded") && (readarr = JSON.parse(localStorage.voiceReaded));

$(".othermsgvoice").each(function() {
    readvoice($(this).attr("data-id"));
});
// 判断是否阅读过
function readvoice(id) {
    readarr[id] && $(".msgvoice[data-id=" + id + "]").addClass('readed').find('.unread').remove();
}

function over() {
    0 < $(".isPlaying").length && $(".isPlaying").removeClass("audioloading").removeClass("isPlaying");
}
// 播放语音
function playaudio(obj) {
    srcstr = $(obj).attr('data-src');
    if (srcstr.length > 100) {
        RongIMLib.RongIMVoice.preLoaded(srcstr);
        //srcstr = base64decode(srcstr);
        RongIMLib.RongIMVoice.play(srcstr);
        return false;
    }
    if ($(obj).hasClass("isPlaying")) {
        audiop.pause();
        over();
        return false;
    }
    v && v.pause();
    over();

    $(obj).addClass('isPlaying').addClass('audioloading');
    // 轮播图跳到
    var imgpage = parseInt($(obj).attr('data-img'));
    if (imgpage > 0) {
        myswiper.slideTo((imgpage-1),1000,false);
    }

    $(obj).addClass('readed').find('.unread').remove();
    var id = $(obj).attr("data-id");
    readarr[id] || (readarr[id] = (new Date).getTime(), localStorage.setItem("voiceReaded", JSON.stringify(readarr)));

    //if (!isAndroid()) {
        srcstr = srcstr.slice(0, -4)+'.aac';
    //}
    jqaudio.attr('src', srcstr);
    audiop.volume = 1;
    audiop.play();
}


// 开始播放录音
$('#list').on('click', '.msgvoice',function(){
    playaudio($(this));
});

// 监听音频播放完了 不需要循环
audiop.addEventListener("ended", function() {
    //$.toast('ended', 'text');
    var playing = $(".isPlaying");
    playing.removeClass("audioloading");
    clearInterval(C);
    playing.removeClass('isPlaying');
    // 循环语音
    var i = $(".msgvoice").index(playing);
    if (i < ($(".msgvoice").length - 1)) {
        i++;
        var nextvideo = $('.msgvoice').eq(i);
        while(!$(nextvideo).hasClass('othermsgvoice')) {
            i++;
            if (i >= ($(".msgvoice").length - 1)) {
                break;
            }
            nextvideo = $('.msgvoice').eq(i);
        }
        if ($(nextvideo).hasClass('readed')) {
            over();
        }else {
            playaudio(nextvideo);
        }
    }else {
        over();
    }
    //a < $(".msgvoice").length - 1 ? ea($("#speakBubbles .recordingMsg").eq(a + 1)) : E()
}, false);
// 暂停
audiop.addEventListener("pause", function() {
    //$.toast('pause', 'text');
    if (!jqaudio.hasClass("isSpecialPause")) {
        var a = $(".isPlaying");
        clearInterval(C);
        setTimeout(function() {
            a.hasClass("isPlaying") && $(".isPlaying").removeClass("audioloading");
        }, 1000);
    }
}, !1);
// 加载完成
audiop.addEventListener("canplaythrough", function(a) {
    //$.toast('canplaythrough', 'text');
    $(".isPlaying").removeClass("audioloading");
    C && clearInterval(C);
    var ct = 0;
    C = setInterval(function() {
        jqaudio.removeClass("isSpecialPause");
        if (Ja == audiop.currentTime) {
            $(".isPlaying").addClass("audioloading");
            Y++;
            if (2<Y && isiOS()) {
                jqaudio.addClass("isSpecialPause");
                audiop.pause();
                audiop.currentTime += .1;
                Y = 0;
                audiop.play();
            }
        }else {
            Y = 0;
            $(".isPlaying").removeClass("audioloading");

        }
        Ja = audiop.currentTime;
    }, 1100);
}, !1);
audiop.addEventListener("stalled", function(a) {
    //$.toast('stalled=='+audiop.currentTime+'=='+srcstr, 'text');
    if (0 < $(".audioloading").length && 1 > audiop.currentTime) {
        jqaudio.attr("src", srcstr);
        audiop.play();
    }
}, !1);
audiop.addEventListener("error", function(e) {
    var cursrc = e.target.currentSrc;
    if (cursrc != '' && cursrc.slice(-4) == '.aac') {
        $.toast('音频加载失败', 'text');
    }else if (cursrc != '') {
        srcstr = cursrc.slice(0, -4)+'.aac';
        jqaudio.attr("src", srcstr);
        audiop.play();
    }
}, !1);





    $('#list').on('click','.msgimage', function(){
        var img = $(this).find('img');
        var src = $(img).attr('src');

    });

   // 选择打赏金额
      $('#list').on('click', '.reward', function(e){
          // 进行打赏的处理 选择几元
          e.stopPropagation();
          e.preventDefault();

          var imgsrc = $(this).prev().attr('src'),
              username = $(this).parents('li').find('.user-name').html();
          var len = imgsrc.length;
          $('#redselect').find('img').attr('src', imgsrc.substr(0, len-2)+'0');
          $('#redselect').find('.redcont-name').html(username.replace(/<em>.*?<\/em>/, ''));
          $('#tochid').val($(this).parents('li').attr('data-id'));
          $('#redselect').show();
      });
      // 进行打赏
      $('#redselect').on('click', 'li', function(){
      //$('.btn_ilike2').on('click', function(){
          // 进行打赏的处理 选择几元
          // total_fee 赏的金额，userid 被赏的用户id,
          var chid = $('#tochid').val();
          var fee = $(this).find('em').html();
          // 判断是否是微信内置浏览器
          var ua = navigator.userAgent.toLowerCase();
          var isWeixin = ua.indexOf('micromessenger') != -1;
          var trade_type = '';
          if (isWeixin) {
              trade_type = 'JSAPI';
          }else{
              trade_type = 'MWEB';
          }
          $.ajax({
              type: "POST",
              url:getpayparents,
              data: {'total_fee':fee,'chid': chid,'trade_type':trade_type},
              beforeSend:function(XHR) {
                  $('#redselect').hide();
                  $.showLoading();
              },
              success:function(data) {
                  $.hideLoading();
                if (data.code != 1) {
                    alert(JSON.stringify(data.data));
                }else if (isWeixin){
                  if ("undefined" == typeof WeixinJSBridge) {
                      if (document.addEventListener) {
                          document.addEventListener("WeixinJSBridgeReady", reward, !1);
                      }else {
                          document.attachEvent && (document.attachEvent("WeixinJSBridgeReady", reward), document.attachEvent("onWeixinJSBridgeReady", reward));
                      }
                  }else {
                      reward(data.data);
                  }
                }else {
                    window.location.href = data.data.mweb_url;
                }
              },
              datatype: 'json'
          });
      });
   // 进行打赏
      $('#redselecttolive').on('click', 'li', function(){
      //$('.btn_ilike2').on('click', function(){
          // 进行打赏的处理 选择几元
          // total_fee 赏的金额，userid 被赏的用户id,
          var chid = $('#tolivechid').val();
          var fee = $(this).find('em').html();
          // 判断是否是微信内置浏览器
          var ua = navigator.userAgent.toLowerCase();
          var isWeixin = ua.indexOf('micromessenger') != -1;
          var trade_type = '';
          if (isWeixin) {
              trade_type = 'JSAPI';
          }else{
              trade_type = 'MWEB';
          }
          $.ajax({
              type: "POST",
              url:getpayparents,
              data: {'total_fee':fee,'chid': chid,'istolive':1,'classroomid':classroomid},
              beforeSend:function(XHR) {
                  $('#redselect').hide();
                  $.showLoading();
              },
              success:function(data) {
                  $.hideLoading();
                if (data.status != 1) {
                    alert(JSON.stringify(data.data));
                }else {
                  if ("undefined" == typeof WeixinJSBridge) {
                      if (document.addEventListener) {
                          document.addEventListener("WeixinJSBridgeReady", reward, !1);
                      }else {
                          document.attachEvent && (document.attachEvent("WeixinJSBridgeReady", reward), document.attachEvent("onWeixinJSBridgeReady", reward));
                      }
                  }else {
                      reward(data.data);
                  }
                }
              },
              datatype: 'json'
          });
      });




// 打赏
function reward(a) {
    WeixinJSBridge.invoke("getBrandWCPayRequest", {
        appId: a.appId,
        timeStamp: a.timeStamp,
        nonceStr: a.nonceStr,
        "package": a.package,
        signType: a.signType,
        paySign: a.paySign
    }, function(b) {
        // 付款成功
        if ("get_brand_wcpay_request:ok" == b.err_msg) {

            // 发送红包消息
            $.post(
                    sendrewardurl,
                    {
                        'out_trade_no':a.out_trade_no,
                        'objectName':'s:reward',
                        'groupid':groupid,
                        'classroomid':classroomid,
                    },
                    function(postres){
                        if (postres.status == 1) {

                            html = '<li class="my">'
                                        +'<div class="user-head"><img src="'+postres.data.pic+'"></div>'
                                        +'<div class="user-msgw">'
                                        +'<div class="user-msg red">'
                                        +'<i class="ico"></i>'
                                        +'<dl class="redtip">'
                                            +'<dt><img src="http://www.wtk.so/Public/img/redicon.png"></dt>'
                                            +'<dd>老师讲得太赞啦~</dd>'
                                            +'<dd>我忍不住赞赏了一个红包</dd>'
                                            +'<input type="hidden" value="'+postres.data.sendusername+'" class="sendusername" />'
                                            +'<input type="hidden" value="'+postres.data.receivename+'" class="receivename" />'
                                            +'<input type="hidden" value="'+postres.data.extra+'" class="total_fee" />'
                                            +'<input type="hidden" value="'+postres.data.pic+'" class="pic" />'
                                        +'</dl>'
                                        +'<p><em>微信红包</em><i class="iconfont">&#xe617;</i></p>'
                                    +'</div>'

                                +'</div>'
                            +'</li>';
                            $('#list').append(html);
                            $('#list').scrollTop( $('#list')[0].scrollHeight );
                            $.toast('赞赏成功');
                        }
                    },
                    'json'
            );
            $('#redselect').find('img').attr('src', '');
            $('#redselect').find('.redcont-name').html('');
            $('#tochid').val('');
            $('#redselect').hide();
            $('#redselecttolive').hide();

        }else if("get_brand_wcpay_request:cancel" == b.err_msg){
            // 取消付款
            $.toast('已取消付款', 'cancel');
            $('#redselect').find('img').attr('src', '');
            $('#redselect').find('.redcont-name').html('');
            $('#tochid').val('');
            $('#redselect').hide();
            $('#redselecttolive').hide();
        }else if("get_brand_wcpay_request:fail" == b.err_msg) {
            // 付款出错
            $.toast('付款错误', 'forbidden');
            $('#redselect').find('img').attr('src', '');
            $('#redselect').find('.redcont-name').html('');
            $('#tochid').val('');
            $('#redselect').hide();
            $('#redselecttolive').hide();
        }
    })
}
/**
 * 获取付款结果
 */
function selectPayresult(out_trade_no) {
    selectpayresulttimeout = setTimeout(function(){
        $.ajax({
            type:"POST",
            url : '',
            data:{},
            success:function(payresult){
                if (payresult.status == 'success') {
                    // 请求成功
                    $.toast('确认成功付款');
                    clearTimeout(selectpayresulttimeout);
                }else {
                    // 继续请求
                    selectPayresult(out_trade_no);
                }

            },
            datatype:'json'
        });
    }, 3000);
}
});
