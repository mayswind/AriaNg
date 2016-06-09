(function () {
    'use strict';
    angular.module('ariaNg').constant('aria2AllOptions', {
        'dir': {
            type: 'string'
        },
        'log': {
            type: 'string'
        },
        'max-concurrent-downloads': {
            type: 'integer'
        },
        'check-integrity': {
            type: 'boolean'
        },
        'continue': {
            type: 'boolean'
        },
        'all-proxy': {
            type: 'string'
        },
        'all-proxy-user': {
            type: 'string'
        },
        'all-proxy-passwd': {
            type: 'string'
        },
        'connect-timeout': {
            type: 'integer',
            suffix: 'Seconds'
        },
        'dry-run': {
            type: 'boolean'
        },
        'lowest-speed-limit': {
            type: 'string',
            suffix: 'Bytes'
        },
        'max-connection-per-server': {
            type: 'integer'
        },
        'max-file-not-found': {
            type: 'integer'
        },
        'max-tries': {
            type: 'integer'
        },
        'min-split-size': {
            type: 'string',
            suffix: 'Bytes'
        },
        'netrc-path': {
            type: 'string',
            readonly: true
        },
        'no-netrc': {
            type: 'boolean'
        },
        'no-proxy': {
            type: 'string',
            split: ',',
            showCount: true
        },
        'proxy-method': {
            type: 'option',
            options: ['get', 'tunnel']
        },
        'remote-time': {
            type: 'boolean'
        },
        'reuse-uri': {
            type: 'boolean'
        },
        'retry-wait': {
            type: 'integer',
            suffix: 'Seconds'
        },
        'server-stat-of': {
            type: 'string'
        },
        'server-stat-timeout': {
            type: 'integer',
            suffix: 'Seconds',
            readonly: true
        },
        'split': {
            type: 'integer'
        },
        'stream-piece-selector': {
            type: 'option',
            options: ['default', 'inorder', 'random', 'geom']
        },
        'timeout': {
            type: 'integer',
            suffix: 'Seconds'
        },
        'uri-selector': {
            type: 'option',
            options: ['inorder', 'feedback', 'adaptive']
        },
        'check-certificate': {
            type: 'boolean',
            readonly: true
        },
        'http-accept-gzip': {
            type: 'boolean'
        },
        'http-auth-challenge': {
            type: 'boolean'
        },
        'http-no-cache': {
            type: 'boolean'
        },
        'http-user': {
            type: 'string'
        },
        'http-passwd': {
            type: 'string'
        },
        'http-proxy': {
            type: 'string'
        },
        'http-proxy-user': {
            type: 'string'
        },
        'http-proxy-passwd': {
            type: 'string'
        },
        'https-proxy': {
            type: 'string'
        },
        'https-proxy-user': {
            type: 'string'
        },
        'https-proxy-passwd': {
            type: 'string'
        },
        'referer': {
            type: 'string'
        },
        'enable-http-keep-alive': {
            type: 'boolean'
        },
        'enable-http-pipelining': {
            type: 'boolean'
        },
        'header': {
            type: 'string'
        },
        'save-cookies': {
            type: 'string'
        },
        'use-head': {
            type: 'boolean'
        },
        'user-agent': {
            type: 'string'
        },
        'ftp-user': {
            type: 'string'
        },
        'ftp-passwd': {
            type: 'string'
        },
        'ftp-pasv': {
            type: 'boolean'
        },
        'ftp-proxy': {
            type: 'string'
        },
        'ftp-proxy-user': {
            type: 'string'
        },
        'ftp-proxy-passwd': {
            type: 'string'
        },
        'ftp-type': {
            type: 'option',
            options: ['binary', 'ascii']
        },
        'ftp-reuse-connection': {
            type: 'boolean'
        },
        'ssh-host-key-md': {
            type: 'string'
        },
        'show-files': {
            type: 'boolean',
            readonly: true
        },
        'bt-detach-seed-only': {
            type: 'boolean',
            readonly: true
        },
        'bt-enable-hook-after-hash-check': {
            type: 'boolean'
        },
        'bt-enable-lpd': {
            type: 'boolean'
        },
        'bt-exclude-tracker': {
            type: 'text',
            split: ',',
            showCount: true
        },
        'bt-external-ip': {
            type: 'string'
        },
        'bt-force-encryption': {
            type: 'boolean'
        },
        'bt-hash-check-seed': {
            type: 'boolean'
        },
        'bt-max-open-files': {
            type: 'integer'
        },
        'bt-max-peers': {
            type: 'integer'
        },
        'bt-metadata-only': {
            type: 'boolean'
        },
        'bt-min-crypto-level': {
            type: 'option',
            options: ['plain', 'arc4']
        },
        'bt-prioritize-piece': {
            type: 'string'
        },
        'bt-remove-unselected-file': {
            type: 'boolean'
        },
        'bt-require-crypto': {
            type: 'boolean'
        },
        'bt-request-peer-speed-limit': {
            type: 'string',
            suffix: 'Bytes'
        },
        'bt-save-metadata': {
            type: 'boolean'
        },
        'bt-seed-unverified': {
            type: 'boolean'
        },
        'bt-stop-timeout': {
            type: 'integer',
            suffix: 'Seconds'
        },
        'bt-tracker': {
            type: 'text',
            split: ',',
            showCount: true
        },
        'bt-tracker-connect-timeout': {
            type: 'integer',
            suffix: 'Seconds'
        },
        'bt-tracker-interval': {
            type: 'integer',
            suffix: 'Seconds'
        },
        'bt-tracker-timeout': {
            type: 'integer',
            suffix: 'Seconds'
        },
        'dht-file-path': {
            type: 'string',
            readonly: true
        },
        'dht-file-path6': {
            type: 'string',
            readonly: true
        },
        'dht-listen-port': {
            type: 'integer',
            readonly: true
        },
        'dht-message-timeout': {
            type: 'integer',
            suffix: 'Seconds',
            readonly: true
        },
        'enable-dht': {
            type: 'boolean',
            readonly: true
        },
        'enable-dht6': {
            type: 'boolean',
            readonly: true
        },
        'enable-peer-exchange': {
            type: 'boolean'
        },
        'follow-torrent': {
            type: 'option',
            options: ['true', 'false', 'mem']
        },
        'listen-port': {
            type: 'integer',
            readonly: true
        },
        'max-overall-upload-limit': {
            type: 'string',
            suffix: 'Bytes'
        },
        'max-upload-limit': {
            type: 'string',
            suffix: 'Bytes'
        },
        'peer-id-prefix': {
            type: 'string',
            readonly: true
        },
        'seed-ratio': {
            type: 'float'
        },
        'seed-time': {
            type: 'integer',
            suffix: 'Minutes'
        },
        'follow-metalink': {
            type: 'option',
            options: ['true', 'false', 'mem']
        },
        'metalink-base-uri': {
            type: 'string'
        },
        'metalink-language': {
            type: 'string'
        },
        'metalink-location': {
            type: 'string'
        },
        'metalink-os': {
            type: 'string'
        },
        'metalink-version': {
            type: 'string'
        },
        'metalink-preferred-protocol': {
            type: 'option',
            options: ['http', 'https', 'ftp', 'none']
        },
        'metalink-enable-unique-protocol': {
            type: 'boolean'
        },
        'enable-rpc': {
            type: 'boolean',
            readonly: true
        },
        'pause-metadata': {
            type: 'boolean'
        },
        'rpc-allow-origin-all': {
            type: 'boolean',
            readonly: true
        },
        'rpc-listen-all': {
            type: 'boolean',
            readonly: true
        },
        'rpc-listen-port': {
            type: 'integer',
            readonly: true
        },
        'rpc-max-request-size': {
            type: 'string',
            suffix: 'Bytes',
            readonly: true
        },
        'rpc-save-upload-metadata': {
            type: 'boolean'
        },
        'rpc-secure': {
            type: 'boolean',
            readonly: true
        },
        'allow-overwrite': {
            type: 'boolean'
        },
        'allow-piece-length-change': {
            type: 'boolean'
        },
        'always-resume': {
            type: 'boolean'
        },
        'async-dns': {
            type: 'boolean'
        },
        'auto-file-renaming': {
            type: 'boolean'
        },
        'auto-save-interval': {
            type: 'integer',
            suffix: 'Seconds',
            readonly: true
        },
        'conditional-get': {
            type: 'boolean'
        },
        'conf-path': {
            type: 'string',
            readonly: true
        },
        'console-log-level': {
            type: 'option',
            options: ['debug', 'info', 'notice', 'warn', 'error'],
            readonly: true
        },
        'daemon': {
            type: 'boolean',
            readonly: true
        },
        'deferred-input': {
            type: 'boolean',
            readonly: true
        },
        'disable-ipv6': {
            type: 'boolean',
            readonly: true
        },
        'disk-cache': {
            type: 'string',
            suffix: 'Bytes',
            readonly: true
        },
        'download-result': {
            type: 'option',
            options: ['default', 'full', 'hide']
        },
        'dscp': {
            type: 'string',
            readonly: true
        },
        'rlimit-nofile': {
            type: 'string',
            readonly: true
        },
        'enable-color': {
            type: 'boolean',
            readonly: true
        },
        'enable-mmap': {
            type: 'boolean'
        },
        'event-poll': {
            type: 'option',
            options: ['epoll', 'kqueue', 'port', 'poll', 'select'],
            readonly: true
        },
        'file-allocation': {
            type: 'option',
            options: ['none', 'prealloc', 'trunc', 'falloc']
        },
        'force-save': {
            type: 'boolean'
        },
        'hash-check-only': {
            type: 'boolean'
        },
        'human-readable': {
            type: 'boolean',
            readonly: true
        },
        'max-download-result': {
            type: 'integer'
        },
        'max-mmap-limit': {
            type: 'string',
            suffix: 'Bytes'
        },
        'max-resume-failure-tries': {
            type: 'integer'
        },
        'min-tls-version': {
            type: 'option',
            options: ['SSLv3', 'TLSv1', 'TLSv1.1', 'TLSv1.2'],
            readonly: true
        },
        'log-level': {
            type: 'option',
            options: ['debug', 'info', 'notice', 'warn', 'error']
        },
        'optimize-concurrent-downloads': {
            type: 'string'
        },
        'piece-length': {
            type: 'integer'
        },
        'show-console-readout': {
            type: 'boolean',
            readonly: true
        },
        'summary-interval': {
            type: 'integer',
            suffix: 'Seconds',
            readonly: true
        },
        'max-overall-download-limit': {
            type: 'string',
            suffix: 'Bytes'
        },
        'max-download-limit': {
            type: 'string',
            suffix: 'Bytes'
        },
        'no-conf': {
            type: 'boolean',
            readonly: true
        },
        'no-file-allocation-limit': {
            type: 'string',
            suffix: 'Bytes'
        },
        'parameterized-uri': {
            type: 'boolean'
        },
        'quiet': {
            type: 'boolean',
            readonly: true
        },
        'realtime-chunk-checksum': {
            type: 'boolean'
        },
        'remove-control-file': {
            type: 'boolean'
        },
        'save-session': {
            type: 'string'
        },
        'save-session-interval': {
            type: 'integer',
            suffix: 'Seconds',
            readonly: true
        },
        'socket-recv-buffer-size': {
            type: 'string',
            suffix: 'Bytes',
            readonly: true
        },
        'stop': {
            type: 'integer',
            suffix: 'Seconds',
            readonly: true
        },
        'truncate-console-readout': {
            type: 'boolean',
            readonly: true
        }
    }).constant('aria2GlobalAvailableOptions', {
        basicOptions: ['dir', 'log', 'max-concurrent-downloads', 'check-integrity', 'continue'],
        httpFtpSFtpOptions: ['all-proxy', 'all-proxy-user', 'all-proxy-passwd', 'connect-timeout', 'dry-run', 'lowest-speed-limit', 'max-connection-per-server', 'max-file-not-found', 'max-tries', 'min-split-size', 'netrc-path', 'no-netrc', 'no-proxy', 'proxy-method', 'remote-time', 'reuse-uri', 'retry-wait', 'server-stat-of', 'server-stat-timeout', 'split', 'stream-piece-selector', 'timeout', 'uri-selector'],
        httpOptions: ['check-certificate', 'http-accept-gzip', 'http-auth-challenge', 'http-no-cache', 'http-user', 'http-passwd', 'http-proxy', 'http-proxy-user', 'http-proxy-passwd', 'https-proxy', 'https-proxy-user', 'https-proxy-passwd', 'referer', 'enable-http-keep-alive', 'enable-http-pipelining', 'header', 'save-cookies', 'use-head', 'user-agent'],
        ftpSFtpOptions: ['ftp-user', 'ftp-passwd', 'ftp-pasv', 'ftp-proxy', 'ftp-proxy-user', 'ftp-proxy-passwd', 'ftp-type', 'ftp-reuse-connection', 'ssh-host-key-md'],
        btOptions: ['bt-detach-seed-only', 'bt-enable-hook-after-hash-check', 'bt-enable-lpd', 'bt-exclude-tracker', 'bt-external-ip', 'bt-force-encryption', 'bt-hash-check-seed', 'bt-max-open-files', 'bt-max-peers', 'bt-metadata-only', 'bt-min-crypto-level', 'bt-prioritize-piece', 'bt-remove-unselected-file', 'bt-require-crypto', 'bt-request-peer-speed-limit', 'bt-save-metadata', 'bt-seed-unverified', 'bt-stop-timeout', 'bt-tracker', 'bt-tracker-connect-timeout', 'bt-tracker-interval', 'bt-tracker-timeout', 'dht-file-path', 'dht-file-path6', 'dht-listen-port', 'dht-message-timeout', 'enable-dht', 'enable-dht6', 'enable-peer-exchange', 'follow-torrent', 'listen-port', 'max-overall-upload-limit', 'max-upload-limit', 'peer-id-prefix', 'seed-ratio', 'seed-time'],
        metalinkOptions: ['follow-metalink', 'metalink-base-uri', 'metalink-language', 'metalink-location', 'metalink-os', 'metalink-version', 'metalink-preferred-protocol', 'metalink-enable-unique-protocol'],
        rpcOptions: ['enable-rpc', 'pause-metadata', 'rpc-allow-origin-all', 'rpc-listen-all', 'rpc-listen-port', 'rpc-max-request-size', 'rpc-save-upload-metadata', 'rpc-secure'],
        advancedOptions: ['allow-overwrite', 'allow-piece-length-change', 'always-resume', 'async-dns', 'auto-file-renaming', 'auto-save-interval', 'conditional-get', 'conf-path', 'console-log-level', 'daemon', 'deferred-input', 'disable-ipv6', 'disk-cache', 'download-result', 'dscp', 'rlimit-nofile', 'enable-color', 'enable-mmap', 'event-poll', 'file-allocation', 'force-save', 'hash-check-only', 'human-readable', 'max-download-result', 'max-mmap-limit', 'max-resume-failure-tries', 'min-tls-version', 'log-level', 'optimize-concurrent-downloads', 'piece-length', 'show-console-readout', 'summary-interval', 'max-overall-download-limit', 'max-download-limit', 'no-conf', 'no-file-allocation-limit', 'parameterized-uri', 'quiet', 'realtime-chunk-checksum', 'remove-control-file', 'save-session', 'save-session-interval', 'socket-recv-buffer-size', 'stop', 'truncate-console-readout']
    }).constant('aria2TaskAvailableOptions', {
        activeNormalTaskOptions: ['max-download-limit', 'max-upload-limit', 'force-save'],
        activeBtTaskOptions: ['max-download-limit', 'max-upload-limit', 'bt-max-peers', 'bt-request-peer-speed-limit', 'bt-remove-unselected-file', 'force-save'],
        inactiveNormalTaskOptions: ['max-download-limit', 'max-upload-limit', 'split', 'min-split-size', 'max-connection-per-server', 'force-save'],
        inactiveBtTaskOptions: ['max-download-limit', 'max-upload-limit', 'split', 'min-split-size', 'max-connection-per-server', 'bt-max-peers', 'bt-request-peer-speed-limit', 'bt-remove-unselected-file', 'force-save'],
        activeTaskReadonlyOptions: ['split', 'min-split-size', 'max-connection-per-server']
    });
})();
