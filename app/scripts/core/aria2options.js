(function () {
    'use strict';

    angular.module('ariaNg').constant('aria2AvailableOptions', {
        basicOptions: [
            {
                key: 'dir',
                name: 'Download Path',
                type: 'string',
                description: 'The directory to store the downloaded file.'
            },
            {
                key: 'log',
                name: 'Log File',
                type: 'string',
                description: 'The file name of the log file. If - is specified, log is written to stdout. If empty string("") is specified, or this option is omitted, no log is written to disk at all.'
            },
            {
                key: 'max-concurrent-downloads',
                name: 'Max Concurrent Downloads',
                type: 'integer',
                description: 'Set the maximum number of parallel downloads for every queue item.'
            },
            {
                key: 'check-integrity',
                name: 'Check Integrity',
                type: 'boolean',
                description: 'Check file integrity by validating piece hashes or a hash of entire file. This option has effect only in BitTorrent, Metalink downloads with checksums or HTTP(S)/FTP downloads with --checksum option.'
            },
            {
                key: 'continue',
                name: 'Resume Download',
                type: 'boolean',
                description: 'Continue downloading a partially downloaded file. Use this option to resume a download started by a web browser or another program which downloads files sequentially from the beginning. Currently this option is only applicable to HTTP(S)/FTP downloads.'
            }
        ],
        httpFtpSFtpOptions: [
            {
                key: 'all-proxy',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'all-proxy-user',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'all-proxy-passwd',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'connect-timeout',
                name: '',
                type: 'integer',
                suffix: 'Seconds',
                description: ''
            },
            {
                key: 'dry-run',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'lowest-speed-limit',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'max-connection-per-server',
                name: '',
                type: 'integer',
                description: ''
            },
            {
                key: 'max-file-not-found',
                name: '',
                type: 'integer',
                description: ''
            },
            {
                key: 'max-tries',
                name: '',
                type: 'integer',
                description: ''
            },
            {
                key: 'min-split-size',
                name: '',
                type: 'string',
                suffix: 'Bytes',
                description: ''
            },
            {
                key: 'netrc-path',
                name: '',
                type: 'string',
                description: '',
                readonly: true
            },
            {
                key: 'no-netrc',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'no-proxy',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'proxy-method',
                name: '',
                type: 'option',
                options: ['get', 'tunnel'],
                description: ''
            },
            {
                key: 'remote-time',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'reuse-uri',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'retry-wait',
                name: '',
                type: 'integer',
                suffix: 'Seconds',
                description: ''
            },
            {
                key: 'server-stat-of',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'server-stat-timeout',
                name: '',
                type: 'integer',
                suffix: 'Seconds',
                description: '',
                readonly: true
            },
            {
                key: 'split',
                name: '',
                type: 'integer',
                description: ''
            },
            {
                key: 'stream-piece-selector',
                name: '',
                type: 'option',
                options: ['default', 'inorder', 'random', 'geom'],
                description: ''
            },
            {
                key: 'timeout',
                name: '',
                type: 'integer',
                suffix: 'Seconds',
                description: ''
            },
            {
                key: 'uri-selector',
                name: '',
                type: 'option',
                options: ['inorder', 'feedback', 'adaptive'],
                description: ''
            }
        ],
        httpOptions: [
            {
                key: 'check-certificate',
                name: '',
                type: 'boolean',
                description: '',
                readonly: true
            },
            {
                key: 'http-accept-gzip',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'http-auth-challenge',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'http-no-cache',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'http-user',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'http-passwd',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'http-proxy',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'http-proxy-user',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'http-proxy-passwd',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'https-proxy',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'https-proxy-user',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'https-proxy-passwd',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'referer',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'enable-http-keep-alive',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'enable-http-pipelining',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'header',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'save-cookies',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'use-head',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'user-agent',
                name: '',
                type: 'string',
                description: ''
            }
        ],
        ftpSFtpOptions: [
            {
                key: 'ftp-user',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'ftp-passwd',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'ftp-pasv',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'ftp-proxy',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'ftp-proxy-user',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'ftp-proxy-passwd',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'ftp-type',
                name: '',
                type: 'option',
                options: ['binary', 'ascii'],
                description: ''
            },
            {
                key: 'ftp-reuse-connection',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'ssh-host-key-md',
                name: '',
                type: 'string',
                description: ''
            }
        ],
        btMetalinkOptions: [
            {
                key: 'show-files',
                name: '',
                type: 'boolean',
                description: '',
                readonly: true
            }
        ],
        btOptions: [
            {
                key: 'bt-detach-seed-only',
                name: '',
                type: 'boolean',
                description: '',
                readonly: true
            },
            {
                key: 'bt-enable-hook-after-hash-check',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'bt-enable-lpd',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'bt-exclude-tracker',
                name: '',
                type: 'text',
                description: ''
            },
            {
                key: 'bt-external-ip',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'bt-force-encryption',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'bt-hash-check-seed',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'bt-max-open-files',
                name: '',
                type: 'integer',
                description: ''
            },
            {
                key: 'bt-max-peers',
                name: '',
                type: 'integer',
                description: ''
            },
            {
                key: 'bt-metadata-only',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'bt-min-crypto-level',
                name: '',
                type: 'option',
                options: ['plain', 'arc4'],
                description: ''
            },
            {
                key: 'bt-prioritize-piece',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'bt-remove-unselected-file',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'bt-require-crypto',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'bt-request-peer-speed-limit',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'bt-save-metadata',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'bt-seed-unverified',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'bt-stop-timeout',
                name: '',
                type: 'integer',
                suffix: 'Seconds',
                description: ''
            },
            {
                key: 'bt-tracker',
                name: '',
                type: 'text',
                description: ''
            },
            {
                key: 'bt-tracker-connect-timeout',
                name: '',
                type: 'integer',
                suffix: 'Seconds',
                description: ''
            },
            {
                key: 'bt-tracker-interval',
                name: '',
                type: 'integer',
                suffix: 'Seconds',
                description: ''
            },
            {
                key: 'bt-tracker-timeout',
                name: '',
                type: 'integer',
                suffix: 'Seconds',
                description: ''
            },
            {
                key: 'dht-file-path',
                name: '',
                type: 'string',
                description: '',
                readonly: true
            },
            {
                key: 'dht-file-path6',
                name: '',
                type: 'string',
                description: '',
                readonly: true
            },
            {
                key: 'dht-listen-port',
                name: '',
                type: 'integer',
                description: '',
                readonly: true
            },
            {
                key: 'dht-message-timeout',
                name: '',
                type: 'integer',
                suffix: 'Seconds',
                description: '',
                readonly: true
            },
            {
                key: 'enable-dht',
                name: '',
                type: 'boolean',
                description: '',
                readonly: true
            },
            {
                key: 'enable-dht6',
                name: '',
                type: 'boolean',
                description: '',
                readonly: true
            },
            {
                key: 'enable-peer-exchange',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'follow-torrent',
                name: '',
                type: 'option',
                options: ['true', 'false', 'mem'],
                description: ''
            },
            {
                key: 'listen-port',
                name: '',
                type: 'integer',
                description: '',
                readonly: true
            },
            {
                key: 'max-overall-upload-limit',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'max-upload-limit',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'peer-id-prefix',
                name: '',
                type: 'string',
                description: '',
                readonly: true
            },
            {
                key: 'seed-ratio',
                name: '',
                type: 'float',
                description: ''
            },
            {
                key: 'seed-time',
                name: '',
                type: 'integer',
                suffix: 'Minutes',
                description: ''
            }
        ],
        metalinkOptions: [
            {
                key: 'follow-metalink',
                name: '',
                type: 'option',
                options: ['true', 'false', 'mem'],
                description: ''
            },
            {
                key: 'metalink-base-uri',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'metalink-language',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'metalink-location',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'metalink-os',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'metalink-version',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'metalink-preferred-protocol',
                name: '',
                type: 'option',
                options: ['http', 'https', 'ftp', 'none'],
                description: ''
            },
            {
                key: 'metalink-enable-unique-protocol',
                name: '',
                type: 'boolean',
                description: ''
            }
        ],
        rpcOptions: [
            {
                key: 'enable-rpc',
                name: 'Enable JSON-RPC/XML-RPC Server',
                type: 'boolean',
                description: 'Enable JSON-RPC/XML-RPC server.',
                readonly: true
            },
            {
                key: 'pause-metadata',
                name: 'Pause After Metadata Downloaded',
                type: 'boolean',
                description: 'Pause downloads created as a result of metadata download. There are 3 types of metadata downloads in aria2: (1) downloading .torrent file. (2) downloading torrent metadata using magnet link. (3) downloading metalink file. These metadata downloads will generate downloads using their metadata. This option pauses these subsequent downloads. This option is effective only when --enable-rpc=true is given.'
            },
            {
                key: 'rpc-allow-origin-all',
                name: 'Allow All Origin Request',
                type: 'boolean',
                description: 'Add Access-Control-Allow-Origin header field with value * to the RPC response.',
                readonly: true
            },
            {
                key: 'rpc-listen-all',
                name: 'Listen on All Network Interfaces',
                type: 'boolean',
                description: 'Listen incoming JSON-RPC/XML-RPC requests on all network interfaces. If false is given, listen only on local loopback interface.',
                readonly: true
            },
            {
                key: 'rpc-listen-port',
                name: 'Listen Port',
                type: 'integer',
                description: 'Specify a port number for JSON-RPC/XML-RPC server to listen to.',
                readonly: true
            },
            {
                key: 'rpc-max-request-size',
                name: 'Max Request Size',
                type: 'string',
                suffix: 'Bytes',
                description: 'Set max size of JSON-RPC/XML-RPC request. If aria2 detects the request is more than SIZE bytes, it drops connection.',
                readonly: true
            },
            {
                key: 'rpc-save-upload-metadata',
                name: 'Save Upload Metadata',
                type: 'boolean',
                description: 'Save the uploaded torrent or metalink meta data in the directory specified by --dir option. The file name consists of SHA-1 hash hex string of meta data plus extension. For torrent, the extension is \'.torrent\'. For metalink, it is \'.meta4\'. If false is given to this option, the downloads added by aria2.addTorrent() or aria2.addMetalink() will not be saved by --save-session option.'
            },
            {
                key: 'rpc-secure',
                name: 'Enable SSL/TLS',
                type: 'boolean',
                description: 'RPC transport will be encrypted by SSL/TLS. The RPC clients must use https scheme to access the server. For WebSocket client, use wss scheme. Use --rpc-certificate and --rpc-private-key options to specify the server certificate and private key.',
                readonly: true
            }
        ],
        advancedOptions: [
            {
                key: 'allow-overwrite',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'allow-piece-length-change',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'always-resume',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'async-dns',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'auto-file-renaming',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'auto-save-interval',
                name: '',
                type: 'integer',
                suffix: 'Seconds',
                description: '',
                readonly: true
            },
            {
                key: 'conditional-get',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'conf-path',
                name: '',
                type: 'string',
                description: '',
                readonly: true
            },
            {
                key: 'console-log-level',
                name: '',
                type: 'option',
                options: ['debug', 'info', 'notice', 'warn', 'error'],
                description: '',
                readonly: true
            },
            {
                key: 'daemon',
                name: '',
                type: 'boolean',
                description: '',
                readonly: true
            },
            {
                key: 'deferred-input',
                name: '',
                type: 'boolean',
                description: '',
                readonly: true
            },
            {
                key: 'disable-ipv6',
                name: '',
                type: 'boolean',
                description: '',
                readonly: true
            },
            {
                key: 'disk-cache',
                name: '',
                type: 'string',
                suffix: 'Bytes',
                description: '',
                readonly: true
            },
            {
                key: 'download-result',
                name: '',
                type: 'option',
                options: ['default', 'full', 'hide'],
                description: ''
            },
            {
                key: 'dscp',
                name: '',
                type: 'string',
                description: '',
                readonly: true
            },
            {
                key: 'rlimit-nofile',
                name: '',
                type: 'string',
                description: '',
                readonly: true
            },
            {
                key: 'enable-color',
                name: '',
                type: 'boolean',
                description: '',
                readonly: true
            },
            {
                key: 'enable-mmap',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'event-poll',
                name: '',
                type: 'option',
                options: ['epoll', 'kqueue', 'port', 'poll', 'select'],
                description: '',
                readonly: true
            },
            {
                key: 'file-allocation',
                name: '',
                type: 'option',
                options: ['none', 'prealloc', 'trunc', 'falloc'],
                description: ''
            },
            {
                key: 'force-save',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'hash-check-only',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'human-readable',
                name: '',
                type: 'boolean',
                description: '',
                readonly: true
            },
            {
                key: 'max-download-result',
                name: '',
                type: 'integer',
                description: ''
            },
            {
                key: 'max-mmap-limit',
                name: '',
                type: 'string',
                suffix: 'Bytes',
                description: ''
            },
            {
                key: 'max-resume-failure-tries',
                name: '',
                type: 'integer',
                description: ''
            },
            {
                key: 'min-tls-version',
                name: '',
                type: 'option',
                options: ['SSLv3', 'TLSv1', 'TLSv1.1', 'TLSv1.2'],
                description: '',
                readonly: true
            },
            {
                key: 'log-level',
                name: '',
                type: 'option',
                options: ['debug', 'info', 'notice', 'warn', 'error'],
                description: ''
            },
            {
                key: 'piece-length',
                name: '',
                type: 'integer',
                description: ''
            },
            {
                key: 'optimize-concurrent-downloads',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'show-console-readout',
                name: '',
                type: 'boolean',
                description: '',
                readonly: true
            },
            {
                key: 'summary-interval',
                name: '',
                type: 'integer',
                suffix: 'Seconds',
                description: '',
                readonly: true
            },
            {
                key: 'max-overall-download-limit',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'max-download-limit',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'no-conf',
                name: '',
                type: 'boolean',
                description: '',
                readonly: true
            },
            {
                key: 'no-file-allocation-limit',
                name: '',
                type: 'string',
                suffix: 'Bytes',
                description: ''
            },
            {
                key: 'parameterized-uri',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'quiet',
                name: '',
                type: 'boolean',
                description: '',
                readonly: true
            },
            {
                key: 'realtime-chunk-checksum',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'remove-control-file',
                name: '',
                type: 'boolean',
                description: ''
            },
            {
                key: 'save-session',
                name: '',
                type: 'string',
                description: ''
            },
            {
                key: 'save-session-interval',
                name: '',
                type: 'integer',
                suffix: 'Seconds',
                description: '',
                readonly: true
            },
            {
                key: 'socket-recv-buffer-size',
                name: '',
                type: 'string',
                suffix: 'Bytes',
                description: '',
                readonly: true
            },
            {
                key: 'stop',
                name: '',
                type: 'integer',
                suffix: 'Seconds',
                description: '',
                readonly: true
            },
            {
                key: 'truncate-console-readout',
                name: '',
                type: 'boolean',
                description: '',
                readonly: true
            }
        ]
    });
})();
