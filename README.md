# AriaNg
## Introduction
A Better Frontend for [aria2](https://github.com/aria2/aria2) (a cross-platform download utility). AriaNg is written in pure html & javascript, so it does not need to be compiled and not need any runtime environment, and you can open it in your browser. By using responsive layout, you can open it on any desktop or mobile devices.

## Features
1. Pure Html & Javascript, no runtime required
2. Responsive design, supporting desktop and mobile devices
3. User-friendly interface
    * Sort tasks (name, size, progress, remain time, download speed, etc.), files, peers
    * Search tasks
    * Adjust download order by dragging task
    * More information of tasks (health percentage, torrent creation time, etc.)
    * Filter files of tasks in file types (videos, audios, pictures, documents, applications, archives, etc.)
    * Download/upload speed chart
    * Full support of aria2 settings
4. Download finished notification
4. Multi-languages support
5. Less bandwidth usage, only requesting incremental data

## Screenshots
#### Desktop
![AriaNg](https://raw.githubusercontent.com/mayswind/AriaNg/gh-pages/screenshots/desktop.png)
#### Mobile Device
![AriaNg](https://raw.githubusercontent.com/mayswind/AriaNg/gh-pages/screenshots/mobile.png)

## Build
Make sure you have [Node.js](https://nodejs.org/), [NPM](https://www.npmjs.com/) and [Bower](https://bower.io/) installed.

    $ npm install
    $ bower install
    $ gulp clean build

The builds will be placed in the dist directory.

## Demo
Please visit http://ariang.mayswind.net

## Download
Latest release: https://github.com/mayswind/AriaNg/releases

## License
[MIT](https://github.com/mayswind/AriaNg/blob/master/LICENSE)
