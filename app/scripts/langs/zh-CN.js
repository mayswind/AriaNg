(function () {
    'use strict';

    angular.module('ariaNg').config(['$translateProvider', function ($translateProvider) {
        $translateProvider.translations('zh-CN', {
            'New': '新建',
            'Start': '开始下载任务',
            'Pause': '暂停下载任务',
            'Delete': '删除下载任务',
            'Display Order': '显示顺序',
            'Default': '默认',
            'File Name': '文件名',
            'Completed Percent': '完成度',
            'Remain Time': '剩余时间',
            'Settings': '系统设置',
            'Download': '下载',
            'Downloading': '正在下载',
            'Scheduling': '正在排队',
            'Stopped': '已停止',
            'Toggle Navigation': '切换导航',
            'Loading': '正在加载...',
            'More Than One Day': '超过1天',
            'Unknown': '未知'
        });
    }])
})();
