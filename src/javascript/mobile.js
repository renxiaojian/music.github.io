
var currentIndex = null;    //当前播放音乐的index
var musicListLen = null;    //发现音乐播放列表的歌曲总数
// var dataInfo = null;     //播放列表类型（哪个）
var playListsObj = null;    //播放列表对象
var playstate = false;       //循环播放状态

$(document).ready(function(){
    //底部状态切换
    $('.footer li').on('tap',function () {
        $(this).siblings().find('a').removeClass('active');
        $(this).find('a').addClass('active');
    });

    //我的音乐按钮
    $('#myMusic').on('tap',function () {
        getFavoriteMusic();
    });

    //登陆注册页面之间的切换
    $('.touchchange').on({
        touchstart:function () {
            $(this).addClass('touch_btn');
        },
        touchend:function () {
            $(this).removeClass('touch_btn');
        }
    });

    //登录
    $('#login').on('tap',function () {
        $('.index_main').hide();
        $('.login_page').show();
    });
    //注册
    $('#sign').on('tap',function () {
        $('.index_main').hide();
        $('.sign_page').show();
    });
    //返回
    $('.back_indexpage').on('tap',function () {
        $('.index_main').show();
        $(this).parent().parent().hide();
    });
    //游客登录
    $('.visitor').on('tap',function () {
        $('.main').hide();
    });

    //页面刷新时，请求session
    sessionCheck();

    //账号登陆发ajax请求
    $('#login_btn').on('tap',function () {
        $.ajax({
            url:'/mobile/doLogin',
            type:'post',
            dataType:'json',
            data:{
                'username':$('#username').val(),
                'password':$('#password').val()
            },
            success:function (data) {
                console.log('登陆请求发送成功：'+data);
                if(data=='1'){
                    console.log('登陆成功！');
                    sessionCheck();
                    init();
                    getFindMusic();
                    getFavoriteMusic();
                    $('.main').hide();
                }else if(data=='-1'){
                    //用户名被占用，请重新输入
                    $('.wraning_login').show().html('账号不存在，请重新输入');
                }else if(data=='-2'){
                    $('.wraning_login').show().html('密码错误，请重新输入');
                }
            },
            err:function (err) {
                console.log('账号登陆失败：'+err);
            }
        });
    });

    //注册账号发ajax请求
    $('#sign_btn').on('tap',function () {
        $.ajax({
            url:'/mobile/doRegister',
            type:'post',
            dataType:'json',
            data:{
                'username':$('#signname').val(),
                'password':$('#signpassword').val()
            },
            success:function (data) {
                if(data=='1'){
                    console.log('注册成功！');
                    $('.main').hide();
                    $('.wraning').hide();
                    sessionCheck();
                    init();
                    getFindMusic();
                    getFavoriteMusic();
                }else if(data=='-1'){
                    //用户名被占用，请重新输入
                    $('.wraning').show().html('账号已经被注册，请重新输入');
                }
            },
            err:function (err) {
                console.log('注册账号请求错误：'+err);
            }
        })
    });

    //判断session
    function sessionCheck() {
        $.ajax({
            url:'/mobile/sessionCheck',
            type:'get',
            success:function (data) {
                console.log('session成功获取！'+data);
                $('.my_info span').html(data);
                $('#user_name').html(data);
            },
            err:function (err) {
                console.log('判断session出错'+err);
            }
        });
    }

    //发现音乐，获取所有音乐
    function getFindMusic() {
        $.ajax({
            url:'/mobile/getFindMusic',
            type:'post',
            dataType:'json',
            success:function (data) {
                console.log('发现音乐请求数据成功：'+data);
                var html = '';
                var list = $('#findMusic_list');
                $('#allMusic_num').html(data.length);
                list.empty();
                for(var i = 0; i < data.length; i++){
                    html +=  '<li data-id="'+data[i].id+'">' +
                                '<img src ="'+data[i].musicimg+'">'+
                                '<section class="findMusic_info">' +
                                    '<div class="findMusic_name">'+data[i].musicname+'</div>'+
                                    '<div class="findMusic_singer"><span>'+data[i].singer+'</span><span>专辑:<span>'+data[i].alblum+'</span></span></div>'+
                                '</section>'+
                            '</li>';
                }
                list.html(html);
            },
            error:function(err){
                console.log('发现音乐请求数据失败：'+err);
            }
        });
    }


    //点击发现音乐列表————播放当前音乐
    $('#findMusic_list').on('click','li',function () {

        currentIndex=$(this).index();
        musicListLen=$(this).parent().find('li').length;

        // dataInfo = $(this).parent().attr('data-info');
        playListsObj = $('.findMusic_list li');
        var musicId = $(this).attr('data-id');
        $('#player_audio').attr('data-num',musicId);
        playNowMusic(musicId);
    });

    //点击我的音乐列表————播放当前音乐
    $('#myMusic_list').on('click','li',function () {

        currentIndex=$(this).index();
        musicListLen=$(this).parent().find('li').length;

        // dataInfo = $(this).parent().attr('data-info');
        playListsObj = $('.myMusic_list li');
        var musicId = $(this).attr('data-id');
        $('#player_audio').attr('data-num',musicId);
        getFavoriteMInfo(currentIndex);
    });

    //获取我的音乐列表的歌曲信息
    function getFavoriteMInfo(currentIndex) {
        $.ajax({
            url:'/mobile/getFavoriteMusic',
            type:'post',
            success:function (data) {
                console.log('获取喜爱的音乐信息成功'+data);
                var musicId = $('#myMusic_list li').eq(currentIndex).attr('data-id');
                playNowMusic(musicId);
            },
            err:function (err) {
                console.log('获取喜爱的音乐信息失败'+err);
            }
        });
    }


    //点击添加喜爱的音乐
    $('#favorite').on('click',function () {
        var dataNum = $('#player_audio').attr('data-num');
        var loveMark = $('#favorite').attr('data-love');
        if(loveMark =='0'){
            var MarkNum1 = 1;
            update(dataNum,MarkNum1);
        }else if(loveMark =='1'){
            var MarkNum2 = 0;
            update(dataNum,MarkNum2);
        }
        addMyMusic(dataNum);
    });

    //重置数据库中的喜爱标记，并获取用户列表中的喜爱标记，添加到数据库中
    function init() {
        $.ajax({
            url:'/mobile/init',
            type:'post',
            success:function (data) {
                console.log('我的音乐列表获取成功'+ data);
            },
            err:function (err) {
                console.log(err);
            }
        });
    }

    //添加我喜爱的标记
    function update(dataNum,MarkNum) {
        $.ajax({
            url:'/mobile/update',
            type:'post',
            data:{
                id:dataNum,
                MarkNum:MarkNum
            },
            success:function (data) {
                // console.log('更新喜爱标记成功'+data[0].love);
                $('#favorite').attr('data-love',data[0].love);
                if(data[0].love=='0'){
                    $('#favorite').html('&#xe678;').css('color','#ffffff');
                }else if(data[0].love=='1'){
                    $('#favorite').html('&#xe604;').css('color','red');
                }
            },
            err:function (err) {
                console.log('更新喜爱标记失败：'+err);
            }
        });
    }


    function addMyMusic(dataNum) {
        $.ajax({
            url:'/mobile/addMyMusic',
            type:'post',
            data:{
                id:dataNum
            },
            success:function (data) {
                getFavoriteMusic();
                console.log('添加喜爱的音乐成功'+data);
            },
            err:function (err) {
                console.log('添加喜爱的音乐出错'+err);
            }
        });
    }

    //获得我喜爱的音乐列表
    function getFavoriteMusic() {
        $.ajax({
            url:'/mobile/getFavoriteMusic',
            type:'post',
            success:function (data) {
                var html = '';
                var list = $('#myMusic_list');
                $('#allmusicnum').html(data.length);
                list.empty();
                for(var i = 0; i < data.length; i++){
                    html += '<li data-id="'+data[i].id+'">' +
                                '<div class="list_num">'+(i+1)+'</div>' +
                                    '<div class="list_info"> ' +
                                        '<div class="music_title">'+data[i].musicname+'</div> ' +
                                        '<div class="music_singer">'+data[i].singer+'</div> ' +
                                    '</div> ' +
                                '<div class="music_point_box"> ' +
                                    '<div class="music_point"> ' +
                                        '<i class="iconfont">&#xe60b;</i> ' +
                                    '</div> ' +
                                '</div> ' +
                            '</li>';
                }
                list.html(html);
            },
            err:function (err) {
                console.log('获取我喜爱的音乐列表失败：'+err);
            }
        });
    }

    //点击下一首按钮
    $('.player_next').on('click',function () {
        if(playstate){
            playRandomMusic(playListsObj);
        }else{
            playMusic(playListsObj);
        }
    });

    //点击上一首按钮
    $('.player_prev').on('click',function () {
        if(playstate){
            playRandomMusic(playListsObj);
        }else{
            playPreMusic(playListsObj);
        }
    });

    //点击切换播放状态（循环/随机）
    $('.player_ctrl').on('click',function () {
        if(playstate){
            //循环状态
            $(this).html('&#xe605;');
            playstate = false;
        }else{
            //随机状态
            $(this).html('&#xe67c;');
            playstate = true;
        }
    });

    //夜间模式
    $('#ye').on('click',function () {
        $('.dark').css({
           'background':'#1d1d1d',
            'color':'#ffffff'
        });
    });

});

//通过音乐ID播放当前的音乐
function playNowMusic(musicId) {
    $.ajax({
        url:'/mobile/playNowMusic',
        type:'post',
        data:{
            id:musicId
        },
        dataType:'json',
        success:function (data) {
            console.log('================'+data[0].love);
            $('#player_musicname').text(data[0].musicname);
            $('#player_singer').text(data[0].singer);
            $('#p_CD img').attr('src',data[0].musicimg);
            $('#player_audio').attr({
                src:data[0].musicsrc,
                autoplay:'autoplay'
            });
            $('#play_pause').html('&#xe61e;');
            $('#player_pointer').addClass('transPointer');
            $('#p_CD').removeClass('pauseCD');
            $('#player').css({
                'background':'url(".'+data[0].musicimg+'") no-repeat center',
                'background-size':'cover'
            });
            //我喜爱的红心标记
            $('#favorite').attr('data-love',data[0].love);
            if(data[0].love=='0'){
                $('#favorite').html('&#xe678;').css('color','#ffffff');
            }else if(data[0].love=='1'){
                $('#favorite').html('&#xe604;').css('color','red');
            }
        },
        err:function (err) {
            console.log('点击列表播放当前音乐失败:'+err);
        }
    });
}


//自动播放下一首歌曲
function playMusic(obj) {
    var musicId;
    currentIndex+=1;
    if(currentIndex<musicListLen){
        musicId = obj.eq(currentIndex).attr('data-id');
        playNowMusic(musicId);
    }else{
        currentIndex = 0;
        musicId = obj.eq(currentIndex).attr('data-id');
        playNowMusic(musicId);
    }
}

//播放上一首歌曲
function playPreMusic(obj) {
    var musicId;
    currentIndex-=1;
    if(currentIndex<0){
        currentIndex = musicListLen-1;
        musicId = obj.eq(currentIndex).attr('data-id');
        playNowMusic(musicId);
    }else{
        musicId = obj.eq(currentIndex).attr('data-id');
        playNowMusic(musicId);
    }
}

//随机播放歌曲
function playRandomMusic(obj) {
    //产生一个歌曲列表长度内的随机数字
    var RandomIndex = parseInt(Math.random()*musicListLen);
    console.log(RandomIndex);
    musicId = obj.eq(RandomIndex).attr('data-id');
    playNowMusic(musicId);
}
