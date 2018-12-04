var ids = [];
var courses = [];
var curindex = 0;
var isenter = '';
var limitend = '';
var starttime = '';
var now = '';
var leftTime =  '';
var leftsecond = '';
var is_limitpay ='';
var audioElm = $api.byId("audioplay");
var sharetitle ='';
var shareurl = '';
var shareicon = '';

$api.addEvt($api.byId("audioplay"), 'canplaythrough', function() {
    var speend = $api.html($api.byId('speed'));
    audioElm.playbackRate = speend;
　　$api.attr($api.byId('play'),'src','../img/pause.png');
　　audioElm.play();
},
false);


// 控制播放
function togglePlay() {
    var audioElmurl = $api.attr(audioElm,'src')
    if (audioElmurl == '' || audioElmurl == '/' || audioElmurl == undefined) {
        $api.attr($api.byId('play'),'src','../img/play.png');
    }else{
        if(audioElm != null ){
          //检测播放是否已暂停.audio.paused 在播放器播放时返回false.
              if(audioElm.paused){
                  var speend = $api.html($api.byId('speed'));
                  audioElm.playbackRate = speend;
                  audioElm.play();//播放
                  $api.attr($api.byId('play'),'src','../img/pause.png');
              }else{
                  audioElm.pause();//暂停
                  $api.attr($api.byId('play'),'src','../img/play.png');
              }
          }
    }
}

function control(obj) {
    $(".choosespeed li").removeClass('active');
    $api.addCls(obj, 'active');
    var one = $api.dom(obj, 'span');
    var speend = $api.html(one);
    $api.html($api.byId('speed'),speend);
    audioElm.playbackRate = speend;
    $api.css($api.byId('bg'),'display:none');
    $api.css($api.byId('choosespeed'),'display:none');
}
//关闭
function clos() {
    $api.css($api.byId('bg'),'display:none');
    $api.css($api.byId('choosespeed'),'display:none')
}
function speed() {
    $api.css($api.byId('bg'),'display:block');
    $api.css($api.byId('choosespeed'),'display:block');
}
function category() {
    $api.css($api.byId('bg'),'display:block');
    $api.css($api.byId('classlist'),'display:block');
}
// 选择倍速
function control(obj) {
    var audioElm = $api.byId("audioplay");
    $(".choosespeed li").removeClass('active');
    $api.addCls(obj, 'active');
    var one = $api.dom(obj, 'span');
    var speend = $api.html(one);
    $api.html($api.byId('speed'),speend);
    audioElm.playbackRate = speend;
    $api.css($api.byId('bg'),'display:none');
    $api.css($api.byId('choosespeed'),'display:none');
}
// 选择课程
function contr(obj) {
    $(".classlist li").removeClass('active');
    $api.addCls(obj, 'active');
}
//关闭
function clos() {
    $api.css($api.byId('bg'),'display:none');
    $api.css($api.byId('choosespeed'),'display:none')
    $api.css($api.byId('classlist'),'display:none')
}
//收藏
function dofavorite() {
    //var classroomid = api.pageParam.id;
    api.ajax({
        url: apihost + '/api/wtk/classroom/dofavorite',
        method: 'post',
        headers:{
            'TOKEN':ygtuserinfo.token
        },
        data: {
            values: {
                'objectid':api.pageParam.specialid,
                'type':4,
                objecttype:2,
                uid:ygtuserinfo.id
            }
        }
    },function(ret, err){
        if (ret) {
            $api.toast('提示',ret.msg,'2000');
            $api.attr($api.byId('dofavorite'),'src','../img/Collectionend.png');
            $(".dofavorite b").html('已收藏')
        } else {
            alert('收藏失败');
            console.log( JSON.stringify( err ) );
        }
    });
}

//PPT数据
function loadData() {
    $(".loading").show();
    var classroomid = api.pageParam.specialid;
    $api.setStorage('audioid', classroomid);
    $api.rmStorage('classtitle')
    $api.rmStorage('listtitle')
    $api.rmStorage('bakcimg')
    $api.rmStorage('audiosta')
    console.log('这是视频id' + classroomid);
    api.ajax({
            url: apihost + '/api/wtk/special/getinfo',
            method: 'post',
            headers: {
                'TOKEN':ygtuserinfo.token
            },
            data: {
                values: {
                    id: classroomid,
                    uid:ygtuserinfo.id
                }
            }
        },
        function(ret, err) {
            console.log(JSON.stringify(ret)+'直播的数据');
            console.log(JSON.stringify(err));
            $(".loading").hide();
            if (ret) {
                if (ret.code == 1) {
                    var len = ret.data.info.detailJSON;
                    var couseaudio = []
                    $api.setStorage('audiokey', '1');
                    limitend = ret.data.info.limitend;
                    starttime = ret.data.info.limitstart;
                    now = ret.time;
                    leftTime =  parseInt(starttime)-parseInt(now);
                    leftsecond = parseInt(limitend)-parseInt(now);
                    is_limitpay = ret.data.info.is_limitpay;
                    if (ret.data.titles == undefined || ret.data.titles == '') {
                        sharetitle = ret.data.info.name;
                        shareicon = ret.data.info.smeta;
                        shareurl = 'http://trade.ygt.cm/index/special/guide?id='+specialid;
                    }else {
                        sharetitle = ret.data.titles.title;
                        shareurl = ret.data.titles.shareurl;
                        shareicon = ret.data.titles.description;
                    }
                    $api.setStorage('shareurl', shareurl);
                    $api.setStorage('sharetitle', sharetitle);
                    if (len.length > 0) {
                        var audiohtml = '';
                        var activeid = 0;
                        var index = api.pageParam.index;
                        isenter = ret.data.info.isenter;
                        if (ret.data.info['isfavorite'] > 0) {
                            $api.attr($api.byId('dofavorite'),'src','../img/Collectionend.png');
                            $(".dofavorite b").html('已收藏');
                        } else {
                            $api.attr($api.byId('dofavorite'),'src','../img/Collection.png');
                            $(".dofavorite b").html('收藏');
                        }
                        for (var i = 0; i < len.length; i++) {
                            audiohtml += '<h5 class="title">'+len[i].name+'</h5><ul class="clalist">';
                            var classdetail = len[i].content;

                            for (var q = 0; q < classdetail.length; q++) {
                                if (i==0 && q == 0) {
                                    curcourse = classdetail[q].courses;
                                }
                                if (activeid == index) {
                                    curindex = index;
                                    curcourse = classdetail[q].courses;
                                }
                                if (classdetail[q].courses['id'] == undefined || classdetail[q].courses == '') {
                                    continue;
                                }
                                audiohtml +='<li class="sex section'+activeid+'"  onclick="changeclass('+activeid+ ');"><img src="../img/playaudio.png" /><span>'+(activeid+1)+'</span>'+classdetail[q].courses['name']+'</li>'
                                activeid++;
                                ids.push(classdetail[q].courses['id']);
                                courses.push(classdetail[q].courses);
                            }
                        }
                        // alert(JSON.stringify(ids));
                        audiohtml +='<h5 class="close" onclick="clos();">关闭</h5></ul>'
                        $("#classlist").append(audiohtml);

                        if (curcourse.type ==1) {
                            // ppt

                        }else if (curcourse.type == 2 ) {

                        }else if (curcourse.type == 3 ) {

                        }else if (curcourse.type == 4 ) {
                            console.log(JSON.stringify(curcourse));
                            var coursename = curcourse.name;
                            var courseid = curcourse.id;
                            var thumb = curcourse.thumb;
                            var content = curcourse.content;
                            var coursevideourl = curcourse.videourl;

                            $("#title").html(coursename);
                            $api.attr($api.dom('#header .bgimg'), 'src', thumb);
                            $("#audioplay").attr('src',coursevideourl);
                            //togglePlay();
                            $(".backimg").attr('src',thumb);
                            $('.sex').removeClass('active');
                            //var index = ids.indexOf(courseid);
                            if (ids[index+1] == undefined) {
                                // 没有下一个
                                $api.removeCls($api.byId('next'), 'fullopciaty');
                            }else {
                                $api.addCls($api.byId('next'), 'fullopciaty');
                            }
                            if (index < 1 || ids[index-1] == undefined) {
                                // 没有上一个
                                $api.removeCls($api.byId('prev'), 'fullopciaty');
                            }else {
                                $api.addCls($api.byId('prev'), 'fullopciaty');
                            }
                            $('.sex img').hide();
                            $('.section'+index).addClass('active');
                            $('.section'+index+' img').show();
                            $api.setStorage('classtitle',coursename);
                            $api.setStorage('bakcimg',thumb);
                            $api.setStorage('listtitle',ret.data.listinfo.title);
                        }
                    }
                }
            }
        });
}


function over(){
    if (courses[curindex+1] == undefined) {
        audioElm.pause();//暂停
        $api.attr($api.byId('play'),'src','../img/play.png');
    }else {
        next();
    }
}

function next() {
    if (courses[curindex+1] == undefined) {

    }else {
        var is_try = courses[curindex+1]['istry'];
        if (isenter == 0 && is_try == 0) {
            if (is_limitpay ==1  && (leftsecond >0 && leftTime< 0)){
                // 限免
            }else {
                api.confirm({
                    title: '提示',
                    msg: '请购买系列课程',
                    buttons: ['确定', '取消']
                }, function(ret, err){
                    if( ret ){
                        if(ret.buttonIndex == 1){
                            var classroomid1 = api.pageParam.specialid;
                            api.closeWin();
                        }else{
                            audioElm.pause();//暂停
                            $api.attr($api.byId('play'),'src','../img/play.png');
                        }
                    }else{
                         alert( JSON.stringify( err ) );
                    }
                });
                return
            }
        }
        curcourse = courses[curindex+1];
        curindex = curindex+1;
        var coursename = curcourse.name;
        var courseid = curcourse.id;
        var thumb = curcourse.thumb;
        var content = curcourse.content;
        var coursevideourl = curcourse.videourl;
        $("#title").html(coursename);
        $api.attr($api.dom('#header .bgimg'), 'src', thumb);
        $(".backimg").attr('src',thumb);
        $("#audioplay").attr('src',coursevideourl);
        $api.addCls($api.byId('next'), 'fullopciaty');
        $api.addCls($api.byId('prev'), 'fullopciaty');
        if (ids[curindex+1] == undefined) {
            $api.removeCls($api.byId('next'), 'fullopciaty');
        }else {
            $api.addCls($api.byId('prev'), 'fullopciaty');
        }
        $('.sex').removeClass('active');
        $('.sex img').hide();
        $('.section'+curindex).addClass('active');
        $('.section'+curindex+' img').show();
        $api.setStorage('classtitle',coursename);
        $api.setStorage('bakcimg',thumb);
        var offline = $api.getStorage('offline');
        if (offline == undefined) {
            //togglePlay();
        }else{
            audioElm.pause();//暂停
            $api.attr($api.byId('play'),'src','../img/play.png');
        }
    }
}

function prev() {
    if (courses[curindex-1] == undefined) {

    }else {
        var is_try = courses[curindex-1]['istry'];
        if (isenter == 0 && is_try == 0) {
            if (is_limitpay ==1  && (leftsecond >0 && leftTime< 0)){
                // 限免
            }else {
                api.confirm({
                    title: '提示',
                    msg: '请购买系列课程',
                    buttons: ['确定', '取消']
                }, function(ret, err){
                    if( ret ){
                        if(ret.buttonIndex == 1){
                            var classroomid1 = api.pageParam.specialid;
                            api.closeWin();
                        }else{
                            audioElm.pause();//暂停
                            $api.attr($api.byId('play'),'src','../img/play.png');
                        }
                    }else{
                         alert( JSON.stringify( err ) );
                    }
                });
                return
            }
        }
        curcourse = courses[curindex-1];
        curindex = curindex-1;
        var coursename = curcourse.name;
        var courseid = curcourse.id;
        var thumb = curcourse.thumb;
        var content = curcourse.content;
        var coursevideourl = curcourse.videourl;
        is_try = curcourse.istry;
        $("#title").html(coursename);
        $api.attr($api.dom('#header .bgimg'), 'src', thumb);
        $(".backimg").attr('src',thumb);
        $("#audioplay").attr('src',coursevideourl);
        $api.addCls($api.byId('next'), 'fullopciaty');
        $api.addCls($api.byId('prev'), 'fullopciaty');
        if (ids[curindex-1] == undefined) {
            // 没有上一个
            $api.removeCls($api.byId('prev'), 'fullopciaty');
        }else {
            $api.addCls($api.byId('next'), 'fullopciaty');
        }
        $('.sex').removeClass('active');
        $('.sex img').hide();
        $('.section'+curindex).addClass('active');
        $('.section'+curindex+' img').show();
        $api.setStorage('classtitle',coursename);
        $api.setStorage('bakcimg',thumb);
        var offline = $api.getStorage('offline');
        if (offline == undefined) {
            //togglePlay();
        }else{
            audioElm.pause();//暂停
            $api.attr($api.byId('play'),'src','../img/play.png');
        }
    }
}

//切换
function changeclass(index) {
    if (ids[index] == undefined) {

    }else {
        var is_try = courses[index]['istry'];
        if (isenter == 0 && is_try == 0) {
            if (is_limitpay ==1  && (leftsecond >0 && leftTime< 0)){
                // 限免
            }else {
                api.confirm({
                    title: '提示',
                    msg: '请购买系列课程',
                    buttons: ['确定', '取消']
                }, function(ret, err){
                    if( ret ){
                        if(ret.buttonIndex == 1){
                            var classroomid1 = api.pageParam.specialid;
                            api.closeWin();
                        }else{
                            audioElm.pause();//暂停
                            $api.attr($api.byId('play'),'src','../img/play.png');
                        }
                    }else{
                         alert( JSON.stringify( err ) );
                    }
                });
                return
            }
        }
        curcourse = courses[index];
        var coursename = curcourse.name;
        var courseid = curcourse.id;
        var thumb = curcourse.thumb;
        var content = curcourse.content;
        var coursevideourl = curcourse.videourl;
        is_try = curcourse.istry;
        $("#title").html(coursename);
        $api.attr($api.dom('#header .bgimg'), 'src', thumb);
        $(".backimg").attr('src',thumb);
        $("#audioplay").attr('src',coursevideourl);
        $api.addCls($api.byId('next'), 'fullopciaty');
        $api.addCls($api.byId('prev'), 'fullopciaty');
        if (ids[index+1] == undefined) {
            $api.removeCls($api.byId('next'), 'fullopciaty');
        }else if (ids[index-1] == undefined) {
            $api.removeCls($api.byId('prev'), 'fullopciaty');
        }


        $('.sex').removeClass('active');
        $('.sex img').hide();
        $('.section'+index).addClass('active');
        $('.section'+index+' img').show();
        $api.setStorage('classtitle',coursename);
        $api.setStorage('bakcimg',thumb);
        var offline = $api.getStorage('offline');
        if (offline == undefined) {
            //togglePlay();
        }else{
            audioElm.pause();//暂停
            $api.attr($api.byId('play'),'src','../img/play.png');
        }
    }
    curindex = index;

    clos();
}
//返回上一页
function goback() {
    api.historyBack();
}
//跳转页面
function  classroom() {
  var id =api.pageParam.id;
  $api.attr($api.byId('play'),'src','../img/play.png');
  api.openWin({
    name: 'classroom',
    url: './classroom.html',
    pageParam: {id:id}
  })
};
//分享
function share() {
  $('#bg').show();
  $(".sharetoast").addClass('sh');
}
//分享关闭
function opentool() {
    $('#bg').hide();
    $(".sharetoast").removeClass('sh');
}


$('#bg').bind('click',function(e){
$('#bg').hide();
$(".sharetoast").removeClass('sh');
$('#bg').hide();
clos()
});

//分享朋友
function sharefriend() {
    var wx = api.require('wx');
    wx.shareWebpage({
        apiKey: '',
        scene: 'session',
        title: sharetitle,
        description: shareicon,
        thumb: 'widget://img/shareicon.png',//http://img1.wtk.so/2016/08/19/57b6dbc29e7cc.png
        contentUrl:shareurl
    }, function(ret, err) {
        if (ret.status) {
            alert('分享成功');
            $('#bg').hide();
            $(".sharetoast").removeClass('sh')
        } else {
            alert('分享失败');
            console.log(JSON.stringify(err));
        }
    });
}

//分享朋友圈
function sharefriends() {

    var wx = api.require('wx');
    wx.shareWebpage({
        apiKey: '',
        scene: 'timeline',
        title: sharetitle,
        description:shareicon,
        thumb: 'widget://img/shareicon.png',
        contentUrl: shareurl
    }, function(ret, err) {
        if (ret.status) {
            alert('分享成功');
            $('#bg').hide();
            $(".sharetoast").removeClass('sh')
        } else {
            alert('分享失败');
            console.log(JSON.stringify(err));
        }
    });
}
