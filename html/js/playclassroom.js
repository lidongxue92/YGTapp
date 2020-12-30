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

    if ($(obj).hasClass("isPlaying")) {
        audiop.pause();
        over();
        return false;
    }

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

    srcstr = srcstr.slice(0, -4)+'.aac';
    // alert(srcstr)
    jqaudio.attr('src', srcstr);
    audiop.volume = 1;
    
    playPromise = audiop.play();

      if (playPromise) {
          playPromise.then(() => {
              // 音频加载成功
              // 音频的播放需要耗时
              setTimeout(() => {
                  // 后续操作
                  console.log("done");
              }, audiop.duration * 10000); // audio.duration 为音频的时长单位为秒


          }).catch((e) => {
              console.log("Operation is too fast, audio play fails");
          });
      }


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
                playPromise = audiop.play();

                  if (playPromise) {
                      playPromise.then(() => {
                          // 音频加载成功
                          // 音频的播放需要耗时
                          setTimeout(() => {
                              // 后续操作
                              console.log("done");
                          }, audiop.duration * 1000); // audio.duration 为音频的时长单位为秒


                      }).catch((e) => {
                          console.log("Operation is too fast, audio play fails");
                      });
                  }
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
    // alert('error:'+cursrc);
    if (cursrc != '' && cursrc.slice(-4) == '.aac') {
        $.toast('音频加载失败', 'text');
    }else if (cursrc != '') {
        srcstr = cursrc.slice(0, -4)+'.aac';
        jqaudio.attr("src", srcstr);
             audiop.play();

    }
}, !1);
