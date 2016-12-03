# AriaNg
[![License](https://img.shields.io/github/license/mayswind/AriaNg.svg?style=flat)](https://github.com/mayswind/AriaNg/blob/master/LICENSE)
[![Lastest Build](https://img.shields.io/circleci/project/mayswind/AriaNg.svg?style=flat)](https://circleci.com/gh/mayswind/AriaNg/tree/master)
[![Lastest Release](https://img.shields.io/github/release/mayswind/AriaNg.svg?style=flat)](https://github.com/mayswind/AriaNg/releases)

[简体中文说明 (Simplified Chinese)](https://github.com/mayswind/AriaNg/blob/master/README-CHS.md)

## Introduction
A Better Frontend for [aria2](https://github.com/aria2/aria2) (a cross-platform download utility). AriaNg is written in pure html & javascript, so it does not need to be compiled and not need any runtime environment, and you just need to open it in your browser. By using responsive layout, you can open it on any desktop or mobile devices.

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
4. Add new download task by requesting url (http://AriaNgUrl/#/new/url_base64)
5. Download finished notification
6. Multi-languages support
7. Less bandwidth usage, only requesting incremental data

## Screenshots
#### Desktop
![AriaNg](https://raw.githubusercontent.com/mayswind/AriaNg/gh-pages/screenshots/desktop.png)
#### Mobile Device
![AriaNg](https://raw.githubusercontent.com/mayswind/AriaNg/gh-pages/screenshots/mobile.png)

## Installation
#### Prebuilt release
Latest Release: https://github.com/mayswind/AriaNg/releases

Latest Daily Build: https://raw.githubusercontent.com/mayswind/AriaNg/gh-pages/downloads/latest_daily_build.zip

#### Building from source
Make sure you have [Node.js](https://nodejs.org/), [NPM](https://www.npmjs.com/) and [Bower](https://bower.io/) installed. Then download the source code, and follow these steps.

    $ npm install
    $ bower install
    $ gulp clean build

The builds will be placed in the dist directory.

## Demo
Please visit http://ariang.mayswind.net

## License
[MIT](https://github.com/mayswind/AriaNg/blob/master/LICENSE)
