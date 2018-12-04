api.addEventListener({
    name:'viewappear'
}, function(ret, err){
    api.addEventListener({
         name:'offline'
     }, function(ret, err){
         alert('断网了');
     });
});
