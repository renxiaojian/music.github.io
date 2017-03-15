# 简易版网易版云音乐

## 启动方式
```
$ npm install
$ bower install
$ gulp
$ npm start
```
----

## 项目目录结构

```
/
app.js      # 主入口
public/     # 静态文件
    images/
    style/
    javascript/
    music/
routes/     # 路由文件夹
modules/    # 模块文件夹
src/        # 前端源代码
    index.html
    less/
    javascript/
    images/
    music/
temp/       # 开发用服务器临时文件夹

```
-----

## 设计思路
1. 数据库保存用户信息表，信息表中包含播放列表的路径信息
2. 新用户保存在数据库中，同时建立配合用户播放列表信息的 json 文件
3. 通过设备检测决定用户访问的页面
4. 创建类似单页应用的效果，在屏幕外隐藏div
5. 移动端因为存在触屏效果 ，所以需要用zepto.js 的 touch




### 说明
1. zepto.js 是一个适用于移动端的库，比jquery精简很多，但是主要功能都在。
2. 用户设备检测需要使用的库为express-useragent ，可以从npm上找到 [快速访问](https://www.npmjs.com/package/express-useragent)
3. 切换用户的设计思路同网易新闻切换不同新闻类型的设计思路相同，登录触发ajax，发送不同的登录信息返回不同的json数据，更新播放列表内容
4. 更改播放器的src信息可以播放不同的音乐
6. 自动播放下一首的设计思路是在audio 的 ended 事件触发时修改src为新的歌曲，并且执行播放。参考audio标签的[事件列表](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events)
5. 如果考虑后端安全性保存用户登录状态需要用到的功能为session，相当于服务器端的cookie，需要用到的库为express-session，[快速访问](https://www.npmjs.com/package/express-session)
*这部分功能逻辑过于复杂，设置为选做，[参考资料](http://wiki.jikexueyuan.com/project/node-lessons/cookie-session.html)*



## 数据库设计
### 用户表
#### 范例
id | username | password | playlist
---| -------- | -------- | --------
1  | user1    | anyword  | ./playlist/1.json
2  | user2    | anyword  | ./playlist/2.json

#### 格式
item | 格式     | 备注
---  | ----    | ---
id   | int     | 主键，自增长
username | varchar(50) | 用户名
password | varchar(50) | 密码
playlist | varchar(256)| 用户播放列表的保存位置

### 乐曲表
#### 范例

id | musicname | musicimg | musicsrc
---| --------- | -------- | --------
1  | music1    | ./cover/1.png | ./music/xxxx.mp3
2  | music2    | ./cover/2.png | ./music/xxxx.mp3
3  | music3    | ./cover/3.png | ./music/xxxx.mp3

#### 格式

item | 格式     | 备注
---  | ----              | ---
id        | int          | 主键，自增长
musicname | varchar(128) | 歌曲名
album     | varchar(64)  | 专辑
author    | varchar(64)  | 作者
musicimg  | varchar(256) | 歌曲封面图路径
musicsrc  | varchar(256) | 歌曲文件保存路径


### 播放列表文件（playlist）

``` json
{
    "username": "user1",
    "playlist": [
                    {
                        "musicid": "1",
                    },
                    {
                        "musicid": "5",
                    },
                    {
                        "musicid": "6",
                    },
                    {
                        "musicid": "8",
                    }
                ]
}
```
