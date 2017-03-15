$(function () {

    var audio       = $('#player_audio')[0],   //音乐
        playerBtn   = $('#play_pause'),        //播放暂停按钮
        nowTime     = $('#now_time'),          //歌曲当前播放时间
        maxTime     = $('#max_time'),          //歌曲时间

        playerPro   = $('.player_pro'),        //进度条
        proCon      = $('.pro_con'),           //进度条的容器
        proCircle = $('.pro_slide_btn');     //进度条上的小圆点


    //播放暂停功能
    playerBtn.on('click',function () {
        if(audio.paused){
            audio.play();
            playstate();
        }else{
            audio.pause();
            pausestate();
        }
    });


    function playstate() {
        playerBtn.html('&#xe61e;');
        $('#player_pointer').addClass('transPointer');
        $('#p_CD').removeClass('pauseCD');
    }

    function pausestate() {
        playerBtn.html('&#xe602;');
        $('#player_pointer').removeClass('transPointer');
        $('#p_CD').addClass('pauseCD');
    }


    //当前播放的时间
    audio.addEventListener('timeupdate',function () {
        playerPro.attr('value',audio.currentTime);
        nowTime.html(calcTime(audio.currentTime));
        proCircle.css('left',((audio.currentTime/audio.duration) - 0.02) * 100 + '%');
    },false);

    //歌曲的时间长度
    audio.addEventListener('loadedmetadata',function () {
        playerPro.attr('max',audio.duration);
        maxTime.html(calcTime(audio.duration));
    },false);

    //拖动进度条
    proCircle[0].addEventListener('touchstart',function (e) {
        e.stopPropagation();
        document.addEventListener('touchmove',proCircleMove,false);
        document.addEventListener('touchend',removeCircleMove,false);
    },false);

    function proCircleMove(e){
        var procurrW = e.touches[0].pageX - proCon[0].offsetLeft;
        var proW = parseFloat(proCon.css('width'));
        audio.currentTime = (procurrW/proW) * audio.duration;
    }

    function removeCircleMove(){
        document.removeEventListener('touchmove',proCircleMove,false);
    }

    audio.addEventListener('ended',function () {
        if(playstate){
            playRandomMusic(playListsObj);
        }else{
            playMusic(playListsObj);
        }
    },false);

    //时间换算
    function calcTime(time) {
        var minute = parseInt(time / 60);
        var second = parseInt(time % 60);
        return toTow(minute)+":"+toTow(second);
    }
    function toTow(t) {
        return t<10?'0'+t:''+t;
    }

});



