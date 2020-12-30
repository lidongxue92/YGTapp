var photos=[];//相册集合
var myPhotoBrowserCaptions;
var tupianleixing = "12";//12为相册，暂时填1，正式发布后改下
$(document).on("pageInit", "#classPicture", function (e, id, $page) {
    $.showPreloader();
    //alert('scheduling');
    getAjax(javaserver + "/Kapi/findGradeAlbum",
      {gradeid: GetlocalStorage("classObj").gradeId,
      org_id:getUserInfo().organization_ID,
      userid:getUserInfo().user_ID,isMy:"no",pageIndex:1, pageSize:50}
      , function(rs){
       console.log('获得相册列表：'+getUserInfo().user_ID+'xxxxxx'+rs);
        var data = strToJson(rs);
        if(data.errorcode == "0"){
          if(data.datas.length > 0){
            var html ="";
            photos = [];
            for(var i=0;i<data.datas.length;i++){
              //alert(JSON.stringify(data.datas[i]));
              html +=("<div class=\'card\' id=\"card_"+data.datas[i].relationId+"\" style='border:1px #ddd solid; margin-top:0; width:48%; margin:5px 1%!important;float: left; ' >");
              html +=(" <div valign=\"bottom\" style='text-align:center'><img src=\'"+data.datas[i].filePath+"\' index=\'"+i+"\' class='card-cover' style='margin:0 auto;height:100px' /></div>");
              html += ("<div  class=\"card-footer\" style=\'height:20px;line-height:20px;\'>");
              if(data.datas[i].userId == getUserInfo().user_ID)
              {
                //alert("x");
                html +=("<a href='#' onclick=\"delphotos('"+data.datas[i].relationId+"')\" class=\"link\"><i class='iconfont icon-shanchu'>删除</i></a>");
              }
              html +=("<a href='#' onclick=\"downphotos('"+data.datas[i].filePath+"')\" class=\"link\"><i class='iconfont icon-xiazai'>保存</i></a>");
              html +=("</div></div>");
              photos.push(data.datas[i].filePath);
            }
          //  alert(html);
            $("#xiangcelist").html(html);
            myPhotoBrowserCaptions = $.photoBrowser({
                photos:photos,
                theme: 'dark'
                ,type: 'popup'
            });
            $("#xiangcelist .card img").on('click',function (e) {

                var index = $(this).attr("index");
                myPhotoBrowserCaptions.open(index);
            });
          }
          else {
            var nonehtml = "";
            $("#xiangcelist").html(nonehtml);
          }
        }
        else {
          console.log("相册获取失败："+JSON.stringify(data));
        }
        $.hidePreloader();
    });

    var input  = document.getElementById("localpic1");   // input file
    input.onchange = function(){
        if (this.files.length == 0) {
            return false;
        }
       var file = this.files[0];
      imgupChange(file);
    }
});
//上传文件
function imgupChange(file){
  var reader = new FileReader();
  reader.readAsDataURL(file);//读取本地文件
  reader.onload = function (e) {//读取完成后
    var size = file.size;
    if(size > 5*1024*1024)
    {
      alert("图片过大，只能上传小于5M的照片");
      return false;
    }
    if (size > 1024 * 1024) {//判断文件大于1M，绝对是否压缩
      var img = new Image();
      img.src = this.result;
      img.onload = function () {
            IMGcompress(img, 92, 1024, 1024);//压缩图片并上传
      }
    }
    else { //文件尺寸小的时候，直接上传
      var img = new Image();
      img.src = this.result;
      img.onload = function () {
        var targetWidth = img.width;
        var targetHeight = img.height;

        var fd = new FormData();
        fd.append("file", file);
        fd.append("userid", getUserInfo().user_ID);
        fd.append("state", tupianleixing);


        // 图片ajax上传
        var xhr = new XMLHttpRequest();


        // 文件上传成功
        xhr.onreadystatechange = function () {
          if (xhr.readyState == 4 && xhr.status == 200) {
            //alert(xhr.responseText);
            $("#uploadprogress").hide();
            var jg = JSON.parse(xhr.responseText);
            if(jg.errorcode =="0" && jg.errormsg != "")
            {
                upimgover(jg.errormsg);
                //alert("上传成功"+xhr.responseText);
            }
            else {
              alert("上传失败"+jg.errormsg);
            }

          }
          else if (xhr.readyState == 4){
            //alert("上传错误：["+xhr.readyState+"|"+xhr.status+"]"+xhr.responseText);
            $("#uploadprogress").hide();
          }

        }
        //侦查当前附件上传情况
        xhr.upload.onprogress = function (evt) {
          var loaded = evt.loaded;
          var tot = evt.total;
          var per = Math.floor(100 * loaded / tot);  //已经上传的百分比
          if(per == 100)
          {
              $("#uploadprogress").hide();
          }
          else {
              $("#uploadprogress").text('上传进度：'+per+'%');
          }

        }
        // 开始上传
        xhr.open("POST", javafile + '/file/uploadCover', true);
        //增加token
        var token = "userinfo_token is none";
        token = strToJson(GetlocalStorage("userinfo_token"),token);
        xhr.setRequestHeader("X-Session-Token", token);

        xhr.send(fd);

        $("#uploadprogress").show();
      }
    }
  }
}
//图片压缩(图片对象，清晰度0-100，可选参数，最大尺寸，格式)
function IMGcompress(source_img_obj, quality, maxWidth, maxHeight, output_format) {
      var mime_type = "image/jpeg";
      if (output_format != undefined && output_format == "png") {
          mime_type = "image/png";
      }
      // 图片原始尺寸
      var originWidth = source_img_obj.naturalWidth;
      var originHeight = source_img_obj.naturalHeight;
      // 目标尺寸
      var targetWidth = originWidth,
      targetHeight = originHeight;

      if (maxWidth != undefined && maxHeight != undefined) {
                  // 根据源图比例和最大尺寸，重新计算转换后的尺寸（保持原比例）
                  if (originWidth > maxWidth || originHeight > maxHeight) {
                      if (originWidth >= originHeight && maxWidth < originWidth) {
                          //console.log(targetWidth,targetHeight,maxWidth,maxHeight);
                          // 更宽，按照宽度限定尺寸
                          targetWidth = maxWidth;
                          targetHeight = Math.round(maxWidth * (originHeight / originWidth));
                      }
                      else if (originWidth < originHeight && maxHeight < originHeight) {
                          //console.log(targetWidth,targetHeight,maxWidth,maxHeight);
                          targetWidth = Math.round(maxHeight * (originWidth / originHeight));
                          targetHeight = maxHeight;

                      }
                      else {
                          //console.log(targetWidth,targetHeight,maxWidth,maxHeight);
                          targetWidth = originWidth;
                          targetHeight = originHeight;
                      }


                  }
      }
      //
      var cvs = document.createElement('canvas');
      cvs.width = targetWidth;
      cvs.height = targetHeight;

      var ctx = cvs.getContext("2d").drawImage(source_img_obj, 0, 0, targetWidth, targetHeight);
      cvs.toBlob(function (blob) {
          var fd = new FormData();
          fd.append("file",  blob, "image.jpg");
          fd.append("userid", getUserInfo().user_ID);
          fd.append("state", tupianleixing);
          // 图片ajax上传
          var xhr = new XMLHttpRequest();
          // 文件上传成功
          xhr.onreadystatechange = function () {
              if (xhr.readyState == 4 && xhr.status == 200) {
                $("#uploadprogress").hide();
                var jg = JSON.parse(xhr.responseText);
                //alert(xhr.responseText);
                if(jg.errorcode == "0")
                {
                  upimgover(jg.errormsg);
                }
                else {
                  alert('上传失败！');
                }

              }
          }
          //侦查当前附件上传情况
          xhr.upload.onprogress = function (evt) {
            var loaded = evt.loaded;
            var tot = evt.total;
            var per = Math.floor(100 * loaded / tot);  //已经上传的百分比
            $("#uploadprogress").text(''+per+'%');
            if(per == 100)
            {
              $("#uploadprogress").hide();
            }
          }
          // 开始上传
          xhr.open("POST", javafile + '/file/uploadCover', true);

          //增加token
          var token = "userinfo_token is none";
          token = strToJson(GetlocalStorage("userinfo_token"),token);
          xhr.setRequestHeader("X-Session-Token", token);

          xhr.send(fd);
      }, mime_type);


}
//上传成功后
function upimgover(urlpath){
  //alert(urlpath);
  getAjax(javaserver + "/Kapi/uploadGradeAlbum",{
    filePath:urlpath,
    userid:getUserInfo().user_ID,
    gradeid:GetlocalStorage("classObj").gradeId
  },function(rs){

     var mdata = strToJson(rs);
     if(mdata.errorcode == "0" || mdata.errorcode == 0){
       var html = "";
       html +=("<div class=\'card\' style='border:1px #ddd solid; margin-top:0; width:48%; margin:5px 1%!important;     float: left; ' >");
       html +=("<center><img src=\'"+urlpath+"\' index=\'"+$('.card').length+"\' onclick=\"myPhotoBrowserCaptions.open("+$('.card').length+");\" class='card-cover' style='margin:0 auto;height:100px' /></center>");
       if(mdata.data.userId == getUserInfo().user_ID)
       {
         //alert("x");
         html +=("<div class=\"card-footer\" style=\'height:20px;line-height:20px;\'><a href='#' onclick=\"delphotos('"+mdata.data.relationId+"')\"><i class='iconfont icon-shanchu'>删除</i></a></div>");
       }
       html +=("</div>");
       $("#xiangcelist").append(html);
       photos.push({
           url: urlpath,
           caption: ''
       });
       myPhotoBrowserCaptions = $.photoBrowser({
           photos:photos,
           theme: 'dark',
           type: 'popup'
       });
     }
     else {
       alert("相册新增失败！"+rs);
     }

  });
  //alert(xhr.responseText);

}
//删除相册
function delphotos(fid){
  //alert(fid);
  getAjax(javaserver+"/Kapi/deletGradeAlbum",{
    userId: getUserInfo().user_ID,
    gradeId:GetlocalStorage("classObj").gradeId,
    relationId:fid},
    function(rs){
      var data = strToJson(rs);
        if(data.errorcode == "0")
        {
          $("#card_"+fid).remove();
          $.router.reloadPage();
          alert("删除成功");
        }
        else {
          alert("删除失败"+rs);
        }
  });
}

function downphotos(imgurl){
  var newname =  'fs://'+imgurl.split('/')[imgurl.split('/').length-1];
  api.download({
      url: imgurl,
      savePath:newname,
      report: true,
      cache: true,
      allowResume: true
  }, function(ret, err) {
      if (ret.state == 1) {
          //下载成功
          api.saveMediaToAlbum({
              path: newname,
              groupName:systemTitle
          }, function(ret, err) {
              if (ret && ret.status) {
                  alert('已成功保存到您的手机相册！');
                //  api.clearCache(function() {
                      //  api.toast({
                    //        msg: '清除完成'
                    //    });
                //  });
              } else {
                  alert('保存失败'+JSON.stringify(ret));
              }
          });
      } else {

      }
  });





}
