# AriaNg
[![许可协议](https://img.shields.io/github/license/mayswind/AriaNg.svg?style=flat)](https://github.com/mayswind/AriaNg/blob/master/LICENSE)
[![最后构建](https://img.shields.io/circleci/project/mayswind/AriaNg.svg?style=flat)](https://circleci.com/gh/mayswind/AriaNg/tree/master)
[![最新版本](https://img.shields.io/github/release/mayswind/AriaNg.svg?style=flat)](https://github.com/mayswind/AriaNg/releases)

## 介绍
面向 [aria2](https://github.com/aria2/aria2) (跨平台的下载工具) 的更好用的前端. AriaNg 使用纯 html & javascript 开发, 所以既不需要编译也不依赖于任何运行环境, 您只需要打开您的游览器就可以使用. 通过借助响应式布局设计, 您可以在任何计算机或移动设备上使用.

## 特性
1. 纯 Html & Javascript 实现, 不依赖任何运行时
2. 响应式布局设计, 兼容计算机与移动设备
3. 友好的界面交互
    * 任务排序 (按文件名, 文件大小, 进度, 剩余时间, 下载速度等.), 文件排序, 连接节点排序
    * 任务搜索
    * 拖拽调整下载顺序
    * 更详细的任务信息 (健康度, 连接节点客户端信息等.)
    * 根据文件类型过滤任务中的文件 (按视频, 音频, 图片, 文档, 应用程序, 存档文件等.)
    * 全局以及单任务的上传/下载图表
    * 完整支持 aria2 设置选项
4. 支持通过请求地址添加任务 (http://AriaNgUrl/#/new/url_base64)
5. 下载完成消息通知
6. 多语言支持
7. 节省带宽, 仅请求增量数据

## 截图
#### 计算机
![AriaNg](https://raw.githubusercontent.com/mayswind/AriaNg/gh-pages/screenshots/desktop.png)
#### 移动设备
![AriaNg](https://raw.githubusercontent.com/mayswind/AriaNg/gh-pages/screenshots/mobile.png)

## 安装
#### 下载即用
最新发布版本: https://github.com/mayswind/AriaNg/releases

最新每日构建: https://raw.githubusercontent.com/mayswind/AriaNg/gh-pages/downloads/latest_daily_build.zip

#### 从源代码中构建
首先请确保您已经安装 [Node.js](https://nodejs.org/), [NPM](https://www.npmjs.com/) 和 [Bower](https://bower.io/). 然后下载源代码并执行以下步骤.

    $ npm install
    $ bower install
    $ gulp clean build

构建后的内容将放置在 dist 目录中.

## Demo
请访问 http://ariang.mayswind.net

## 协议
[MIT](https://github.com/mayswind/AriaNg/blob/master/LICENSE)
