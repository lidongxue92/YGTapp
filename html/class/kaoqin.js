
$(document).on("pageInit", "#kaoqinqiandao", function (e, id, $page) {

  var user = getUserInfo();
  var cid = sessionStorage.getItem('cid');
  jisuchatroom_setUser(user.user_ID,user.user_Name,user.user_Img,'QD_'+cid);

/**
  var lon=0,lat=0;//定位坐标
  bmap.open({
    rect: {
        x: 0,
        y: 100,
        w: api.winWidth,
        h: 300
    },
    center: {
        lon: 116.4021310000,
        lat: 39.9994480000
    },
    zoomLevel: 18,
    showUserLocation: true,
}, function(ret) {
    if (ret.status) {
      //  alert('地图打开成功');
    }
});

  bmap.getLocationServices(function(ret, err) {
      if (ret.enable) {
          //alert(JSON.stringify(ret));
          bmap.getLocation({
              accuracy: '100m',
              autoStop: true,
              filter: 1
          }, function(ret, err) {
              if (ret.status) {
                  console.log(JSON.stringify(ret));
                  lon = ret.lon;
                  lat = ret.lat;

              } else {
                  //alert(err.code);
              }
          });
      } else {
          alert("未开启定位功能！");
      }
  });
**/
})
