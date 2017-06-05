# AriaNg
[![License](https://img.shields.io/github/license/mayswind/AriaNg.svg?style=flat)](https://github.com/mayswind/AriaNg/blob/master/LICENSE)
[![Lastest Build](https://img.shields.io/circleci/project/mayswind/AriaNg.svg?style=flat)](https://circleci.com/gh/mayswind/AriaNg/tree/master)
[![Lastest Release](https://img.shields.io/github/release/mayswind/AriaNg.svg?style=flat)](https://github.com/mayswind/AriaNg/releases)

## Introduction
AriaNg is a web frontend making [aria2](https://github.com/aria2/aria2) better. AriaNg is written in pure html & javascript, thus it does not need any compilers or runtime environment. You can just put AriaNg in your web server and open it in your browser. AriaNg uses responsive layout, and supports any desktop or mobile devices.

## Features
1. Pure Html & Javascript, no runtime required
2. Responsive design, supporting desktop and mobile devices
3. User-friendly interface
    * Sort tasks (by name, size, progress, remain time, download speed, etc.), files, peers
    * Search tasks
    * Adjust download order by dragging task
    * More information of tasks (health percentage, client infomation of bt peers, etc.)
    * Filter files of tasks in file types (by videos, audios, pictures, documents, applications, archives, etc.)
    * Download/upload history chart of global or task
    * Full support of aria2 settings
4. Url command line api support
5. Download finished notification
6. Multi-languages support
7. Multi aria2 RPC host support
8. Less bandwidth usage, only requesting incremental data

## Screenshots
#### Desktop
![AriaNg](https://raw.githubusercontent.com/mayswind/AriaNg-WebSite/master/screenshots/desktop.png)
#### Mobile Device
![AriaNg](https://raw.githubusercontent.com/mayswind/AriaNg-WebSite/master/screenshots/mobile.png)

## Installation
#### Prebuilt release
Latest Release: [https://github.com/mayswind/AriaNg/releases](https://github.com/mayswind/AriaNg/releases)

Latest Daily Build: [https://github.com/mayswind/AriaNg-DailyBuild/archive/master.zip](https://github.com/mayswind/AriaNg-DailyBuild/archive/master.zip)

#### Building from source
Make sure you have [Node.js](https://nodejs.org/), [NPM](https://www.npmjs.com/) and [Bower](https://bower.io/) installed. Then download the source code, and follow these steps.

    $ npm install
    $ bower install
    $ gulp clean build

The builds will be placed in the dist directory.

## Documents
1. [English](http://ariang.mayswind.net)
2. [Simplified Chinese (简体中文)](http://ariang.mayswind.net/zh_Hans)

## Demo
Please visit [http://ariang.mayswind.net/latest](http://ariang.mayswind.net/latest)

## License
[MIT](https://github.com/mayswind/AriaNg/blob/master/LICENSE)
