# AriaNg
[![License](https://img.shields.io/github/license/mayswind/AriaNg.svg?style=flat)](https://github.com/mayswind/AriaNg/blob/master/LICENSE)
[![Lastest Build](https://img.shields.io/circleci/project/github/mayswind/AriaNg.svg?style=flat)](https://circleci.com/gh/mayswind/AriaNg/tree/master)
[![Lastest Release](https://img.shields.io/github/release/mayswind/AriaNg.svg?style=flat)](https://github.com/mayswind/AriaNg/releases)

# #的介绍
AriaNg是一个现代的web前端，使[aria2](https://github.com/aria2/aria2)更容易使用。AriaNg是用纯html和javascript编写的，因此它不需要任何编译器或运行时环境。你可以把AriaNg放在你的网络服务器上，然后在浏览器中打开它。AriaNg使用响应式布局，支持任何桌面或移动设备。

# #特性
1. 纯Html和Javascript，不需要运行时
2. 响应式设计，支持桌面和移动设备
3. 友好的用户界面
*排序任务(按名称，大小，进度，剩余时间，下载速度等)，文件，bittorrent同行
*搜索任务
*重试任务
*通过拖动调整任务顺序
*任务的更多信息(运行状况百分比、bt对等体的客户端信息等)
*按指定的文件类型(视频、音频、图片、文档、应用程序、档案等)或文件扩展名过滤文件
*多目录任务树视图
*下载/上传aria2或单个任务的速度表
*完全支持aria2设置
4. 黑暗的主题
5. Url命令行api支持
6. 下载完成通知
7. 多语言支持
8. 多aria2 RPC主机支持
9. 导出和导入设置支持
10. 更少的带宽使用，只请求增量数据

# #截图
# # # #桌面
! [AriaNg] (https://raw.githubusercontent.com/mayswind/AriaNg-WebSite/master/screenshots/desktop.png)
####移动设备
! [AriaNg] (https://raw.githubusercontent.com/mayswind/AriaNg-WebSite/master/screenshots/mobile.png)

# #安装
AriaNg现在提供三个版本，标准版、一体化版和[AriaNg Native](https://github.com/mayswind/AriaNg-Native)。标准版本适合部署在web服务器中，并提供按需加载。All-In-One版本适合本地使用，您可以下载并在浏览器中打开唯一的html文件。【AriaNg Native】(https://github.com/mayswind/AriaNg-Native)也适合本地使用，不需要浏览器。

####预构建版本
最新版本:[https://github.com/mayswind/AriaNg/releases](https://github.com/mayswind/AriaNg/releases]

最新每日构建(标准版本):[https://github.com/mayswind/AriaNg-DailyBuild/archive/master.zip](https://github.com/mayswind/AriaNg-DailyBuild/archive/master.zip]

####从源代码构建
确保你已经安装了[Node.js](https://nodejs.org/)， [NPM](https://www.npmjs.com/)和[Gulp](https://gulpjs.com/)。然后下载源代码，并按照以下步骤操作。

#####标准版本

$ NPM install
$ gulp clean build

#####一体化版本

$ NPM install
$ gulp清理build-bundle

构建将放在dist目录中。

####使用说明
由于AriaNg标准版本是异步加载语言资源的，所以你不能直接在本地文件系统上打开index.html来运行AriaNg。建议您使用一体化版本或将AriaNg部署在web容器中，或下载[AriaNg Native](https://github.com/mayswind/AriaNg-Native)，不需要浏览器运行。

# #翻译

欢迎每个人贡献翻译。所有的翻译文件都放在' /src/langs/ '中。你可以修改并提交一个新的拉取请求。

如果你想将AriaNg翻译成一种新的语言，你可以将语言配置添加到' /src/scripts/config/languages.js '中，然后将' /i18n/en.sample.txt '复制到' /src/langs/ '并将其重命名为要翻译的语言代码，然后你就可以开始翻译工作了。

# #文件
1. (英语)(http://ariang.mayswind.net)
2. [简体中文(简体中文)](http://ariang.mayswind.net/zh_Hans)

# #演示
请访问[http://ariang.mayswind.net/latest](http://ariang.mayswind.net/latest]

第三方扩展
有一些基于AriaNg的第三方应用程序，所以你可以在更多的场景或设备中使用AriaNg。请访问[第三方扩展](http://ariang.mayswind.net/3rd-extensions.html)了解更多信息。

# #许可证
(MIT)(https://github.com/mayswind/AriaNg/blob/master/LICENSE)
