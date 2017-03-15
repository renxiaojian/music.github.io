/**
 * Created by 小剑 on 2017/2/12.
 */
var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

var mysql = require('mysql');
var md5 = require('./md5');

var connection = mysql.createConnection({
    host:'127.0.0.1',
    port:'3306',
    user:'renxj',
    password:'renxj',
    database:'music'
});

//登陆账号

router.post('/doLogin',function (req,res,next) {
    var userName = req.body.username;
    var passWord = req.body.password;
    var encryptPassWord = md5(md5(passWord) + '2');
    //查询数据库中，是否有这个用户
    connection.query('SELECT * FROM `user` WHERE username ='+"'"+userName+"'",function(err, result){
        if(err){
            console.log('登陆账号，查询用户：'+err);
        }else{
            if(result.length == 0){
                res.send('-1');     //没有这个用户
                return;
            }else if(encryptPassWord==result[0].password){
                //有的话，进一步看看密码是否正确
                req.session.login = '1';
                req.session.username = userName;
                res.send('1');  //登陆成功
            }else{
                res.send('-2'); //密码错误
            }
        }
    });
});

//注册用户
router.post('/doRegister',function (req, res, next) {
    //创建一个用户对象
    var user = {};
    //得到账号和密码
    var userName = req.body.username;
    var passWord = req.body.password;
    //创建一个用户喜爱歌曲列表的JSON对象
    var musicJson = {
        username:userName,
        playlist:[]
    };
    //查询数据库中是否存在该用户
    connection.query('SELECT * FROM `user` WHERE username ='+"'"+userName+"'",function(err, result){
        if(err){
            console.log('查询数据库中是否存在该用户：'+err);
        }else{
            if(result.length!=0){
                res.send('-1');     //用户已经存在
                return;
            }
            //否则，用户名不存在，进行注册。

            //密码设置md5加密
            passWord = md5(md5(passWord) + '2');
            //用户名没有被占用，插入账号，密码和存储个人喜好音乐JSON文件的路径
            user.userName = userName;
            user.passWord = passWord;
            user.musicJson = path.join(__dirname,'../src/mjson/'+userName+'.json');

            //创建用户喜爱歌曲列表的空文件
            fs.writeFileSync(user.musicJson,JSON.stringify(musicJson));

            //将账号密码和文件路径插入到数据库的user表中
            connection.query('INSERT INTO `user` SET ?',user,function (err, result) {
                if(err){
                    console.log('插入数据库用户信息失败：'+err);
                }else{
                    req.session.login = '1';
                    req.session.username = userName;
                    res.send('1');      //注册成功,写入session
                }
            });
        }
    });
});
//判断session
router.get('/sessionCheck',function (req, res, next) {
    if(req.session.login){
        res.send(req.session.username);
    }else{
        res.send("没有成功登陆");
    }
});

//发现音乐，获取所有音乐
router.post('/getFindMusic',function (req, res, next) {
    connection.query('SELECT * FROM `music_list`',function(err, rows, fields){
        if(err){
            throw err;
        }else{
            res.send(rows);
        }
    });
});

//点击列表播放当前音乐
router.post('/playNowMusic',function (req, res, next) {
    var musicId = req.body.id;
    connection.query('SELECT * FROM `music_list` where id = '+ musicId,function(err, rows, fields){
        if(err){
            console.log('点击列表播放当前音乐：'+err);
        }else{
            res.send(rows);
        }
    });
});

//点击添加(删除)喜爱的音乐
router.post('/addMyMusic',function (req, res, next) {
    var userName = req.session.username;
    var musicId = req.body.id;
    //创建一个用户喜爱歌曲列表的JSON对象
    var musicJson = {
        username:userName,
        playlist:[]
    };
    var mjson = path.join(__dirname,'../src/mjson/'+userName+'.json');
    connection.query('SELECT * FROM `music_list` where id = '+ musicId,function(err, rows, fields){
        if(err){
            console.log('查询添加音乐的信息出错'+err);
        }else{
            //读用户的喜爱音乐文件
            fs.readFile(mjson,'utf-8',function (err,data) {
                if(err){
                    console.log('读用户的喜爱音乐文件出错：'+err);
                }else{
                    //判断此音乐列表中是否存在添加的音乐
                    var onOff = true;
                    var oldPlaylist = JSON.parse(data).playlist;
                    if(oldPlaylist == ''){
                        onOff = true;
                    }else{
                        for(var i=0;i<oldPlaylist.length;i++){
                            if(oldPlaylist[i].id==musicId){
                                onOff = false;
                                //删除我的音乐中已经存在的音乐
                                oldPlaylist.splice(i,1);
                            }
                        }
                    }
                    //不存在，添加此音乐
                    if(onOff){
                        oldPlaylist.push(rows[0]);
                        musicJson.username = userName;
                        musicJson.playlist = oldPlaylist;
                        //写入添加喜爱音乐的JSON文件
                        fs.writeFileSync(mjson,JSON.stringify(musicJson));
                    }else{
                        musicJson.username = userName;
                        musicJson.playlist = oldPlaylist;
                        fs.writeFileSync(mjson,JSON.stringify(musicJson));
                    }
                }
            });
            res.send(rows);
        }
    });
});

//获得我喜爱的音乐列表
router.post('/getFavoriteMusic',function (req, res, next) {
    var userName = req.session.username;
    var mjson = path.join(__dirname,'../src/mjson/'+userName+'.json');
    fs.readFile(mjson,'utf-8',function (err,data) {
        if(err){
            console.log('获得我喜爱的音乐列表出错:'+err);
        }else{
            var Playlist = JSON.parse(data).playlist;
            res.send(Playlist);
        }
    });
});

//添加我的喜爱歌曲标记
router.post('/update',function (req, res, next) {
    var musicId = req.body.id;
    var MarkNum = req.body.MarkNum;
    // console.log(musicId,MarkNum);
    connection.query('UPDATE `music_list` SET `love`='+MarkNum+' where id='+musicId,function (err, result) {
        if(err){
            console.log('更新数据库喜爱标记出错:'+err);
        }else{
            console.log('更新数据库喜爱标记成功！');
            connection.query('SELECT * FROM `music_list` where id = '+ musicId,function (err, result) {
                if(err){
                    console.log(err);
                }else{
                    res.send(result);
                }
            });
        }
    });
});

//重置数据库中的喜爱标记，并获取用户列表中的喜爱标记，添加到数据库中
router.post('/init',function (req, res, next) {
    var userName = req.session.username;
    var mjson = path.join(__dirname,'../src/mjson/'+userName+'.json');
    var Playlist;
    //重置喜爱标记为0
    connection.query('UPDATE `music_list` SET `love` = 0',function (err,result) {
        if(err){
            console.log('重置数据库中喜爱标记错误：'+err);
        }else{
            fs.readFile(mjson,'utf-8',function (err,data) {
                if(err){
                    console.log('读取我喜爱的音乐列表出错:'+err);
                }else{
                    Playlist = JSON.parse(data).playlist;
                     for(var i=0;i<Playlist.length;i++){
                         // console.log(Playlist[i].id,Playlist[i].love);
                         connection.query('UPDATE `music_list` SET `love` ='+Playlist[i].love+' where id='+Playlist[i].id,function (err,result) {
                             if(err){
                                 console.log('更新数据表中我喜爱的标记出错'+err);
                             }else{

                             }
                         });
                     }
                }
            });
        }
    });
});

module.exports = router;