var express = require('express');
var app = express();

var useragent = require('express-useragent');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var path=require('path');
var session = require('express-session');
var mobile = require('./routes/mobile');


//开启设备检测的中间件
app.use(useragent.express());

//设置静态目录
app.use(express.static(path.join(__dirname,'public')));

//设置网站favicon，将图标放置在目录中后解除注释，否则会报错导致退出
// app.use(favicon(path.join(__dirname, 'public','images', 'favicon.ico')));

//设置网页渲染引擎,本次不使用任何引擎
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

//为了解析req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//使用session
app.use(session({
    secret:'keyboard cat',
    resave:false,
    saveUninitialized:true
}));


app.use('/mobile', mobile);

//打开主页的请求，判断用户的客户端是什么？
app.get('/',function(req,res){
	// 客户端是桌面版，引导向index.html页面
	if(req.useragent.isDesktop){
		res.redirect('/desktop.html');
	}else if(req.useragent.isMobile){
	// 客户端是移动设备，应该引导向手机主页
		res.redirect('/mobile.html');
	}
});













app.listen(4000,function(){
    console.log('server is running at 4000 port');
});
