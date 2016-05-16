(function () {
    'use strict';

    angular.module('ariaNg').config(['$translateProvider', function ($translateProvider) {
        $translateProvider.translations('zh-CN', {
            'Simplified Chinese': '简体中文',
            'New': '新建',
            'Start': '开始下载任务',
            'Pause': '暂停下载任务',
            'Delete': '删除下载任务',
            'Display Order': '显示顺序',
            'Default': '默认',
            'By File Name': '按文件名',
            'By File Size': '按文件大小',
            'By Completed Percent': '按完成度',
            'By Remain Time': '按剩余时间',
            'Download': '下载',
            'Downloading': '正在下载',
            'Waiting': '正在等待',
            'Stopped': '已停止',
            'Settings': '系统设置',
            'AriaNg Settings': 'AriaNg 设置',
            'Language': '语言',
            'Aria2 RPC Host': 'Aria2 RPC 主机',
            'Aria2 RPC Port': 'Aria2 RPC 端口',
            'Aria2 RPC Protocol': 'Aria2 RPC 协议',
            'Toggle Navigation': '切换导航',
            'Loading': '正在加载...',
            'More Than One Day': '超过1天',
            'Unknown': '未知',
            'Changes to the settings take effect after refreshing page.': '设置将在刷新页面后生效.'
        });
    }])
})();
