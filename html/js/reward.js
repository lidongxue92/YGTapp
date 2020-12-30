$(function(){
    // 选择打赏金额
    $('#list').on('click', '.reward', function(e){
        // 进行打赏的处理 选择几元
        e.stopPropagation();
        e.preventDefault();
        if (is_reward < 1) {
            return false;
        }
        var imgsrc = $(this).prev().attr('src'),
            username = $(this).parents('li').find('.user-name').html();
        var len = imgsrc.length;
        $('#redselect').find('img').attr('src', imgsrc.substr(0, len-2)+'0');
        $('#redselect').find('.redcont-name').html(username.replace(/<em>.*?<\/em>/, ''));
        $('#tochid').val($(this).parents('li').attr('data-id'));
        $('#redselect').show();
    });

    // 选择金额进行打赏
    $('#redselect').on('click', 'li', function(e){
        e.stopPropagation();
        e.preventDefault();

        var chid = $('#tochid').val();
        var fee = $(this).find('em').html();
        $('#redselect').hide();
        $.showLoading();
        var wx = api.require("wx");
        var wxPay = api.require("wxPay");
        wx.isInstalled(function(ret, err){
            if(ret.installed){
                api.ajax({
                    url: getpayparents,
                    method: 'post',
                    headers:{
                        'TOKEN':ygtuserinfo.token
                    },
                    data: {
                        values: {
                            'total_fee':fee,
                            'chid': chid,
                            'trade_type':'APP',
                            'systemType':api.systemType,
                             uid:ygtuserinfo.id
                        }
                    }
                },function(ret, err){
                    console.log('getpayparents  ret:'+api.systemType);
                    console.log(JSON.stringify(ret));
                    console.log(JSON.stringify(err));
                    $.hideLoading();
                    if (ret) {
                        if (ret.code != 1) {
                            alert(JSON.stringify(ret.data));
                        }else {

                            var wxPay = api.require('wxPay');
                            wxPay.payOrder({
                                apiKey: ret.data.appid,
                                orderId: ret.data.prepayid,
                                mchId: ret.data.partnerid,
                                nonceStr: ret.data.noncestr,
                                timeStamp: ret.data.timestamp,
                                package: ret.data.package,
                                sign: ret.data.sign
                            }, function(payret, payerr){
                                console.log(JSON.stringify(payret));
                                console.log(JSON.stringify(payerr));
                                 if (payret.status) {
                                     //api.toast({msg:payret.msg, duration:5000} );

                                     api.ajax({
                                         url: wtkurl +'classroom/sendRewardMsg',
                                         method: 'post',
                                         headers :{
                                             'TOKEN':ygtuserinfo.token
                                         },
                                         data: {
                                             values: {
                                                 groupid: ret.data.groupid,
                                                 out_trade_no:ret.data.out_trade_no,
                                                 classroomid:ret.data.classroomid,
                                                 objectName:'s:reward',
                                                 uid:ygtuserinfo.id
                                             }
                                         }
                                     },function(postres, posterr){
                                         console.log(JSON.stringify(postres));
                                         if (postres) {
                                             var html = '<li class="my">'
                                                        +'<div class="user-head"><img src="'+postres.data.pic+'"></div>'
                                                        +'<div class="user-msgw">'
                                                        +'<div class="user-msg red">'
                                                        +'<i class="ico"></i>'
                                                        +'<dl class="redtip">'
                                                            +'<dt><img src="../img/redicon.png"></dt>'
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
                                             //alert( JSON.stringify( ret ) );
                                         } else {
                                             console.log(JSON.stringify(posterr));
                                             console.log( JSON.stringify( posterr)+'微信 接口 不正确  ');
                                         }
                                     });


                                 }else{
                                     if (payerr.code == -2) {
                                         alert('用户取消支付');
                                     }else{
                                         alert('支付失败');
                                     }
                                     //  alert(payerr.msg);
                                    //  console.log(JSON.stringify(payerr));
                                 }
                            });
                              //reward(ret.data);

                        }
                        console.log( JSON.stringify( ret ) );
                    } else {
                        console.log( JSON.stringify( err ) );
                    }
                });

                //alert("当前设备已安装微信客户端");
            }else{
                //alert('当前设备未安装微信客户端');
            }
        });

    });

    $('#list').on('click', '.redtip', function(e){
        e.preventDefault();
        e.stopPropagation();

        var src = $(this).find('.pic').val(),
            sendname = $(this).find('.sendusername').val(),
            receivename = $(this).find('.receivename').val(),
            total_fee = $(this).find('.total_fee').val();
            console.log(src);
            console.log(sendname);
            console.log(receivename);
            console.log(total_fee);
        if (undefined == src) {
            return false;
        }
        var len = src.length;
        var indexlen = src.lastIndexOf('/');
        $('#redmsg').find('img').attr('src', src.substr(0, indexlen)+'/0');
        $('#redmsg').find('.redcont-tip').html(sendname+'赞赏了'+receivename);
        $('#redmsg').find('.redcont-name em').html(parseInt(total_fee)/100);
        $('#redmsg').show();
    });

});
