(function () {
    'use strict';

    angular.module('ariaNg').constant('aria2Errors', {
        //'0': { }, //All downloads were successful.
        '1': {
            descriptionKey: 'error.unknown'
        },
        '2': {
            descriptionKey: 'error.operation.timeout'
        },
        '3': {
            descriptionKey: 'error.resource.notfound'
        },
        '4': {
            descriptionKey: 'error.resource.notfound.max-file-not-found'
        },
        '5': {
            descriptionKey: 'error.download.aborted.lowest-speed-limit'
        },
        '6': {
            descriptionKey: 'error.network.problem'
        },
        //'7': { },//If there were unfinished downloads. This error is only reported if all finished downloads were successful and there were unfinished downloads in a queue when aria2 exited by pressing Ctrl-C by an user or sending TERM or INT signal.
        '8': {
            descriptionKey: 'error.resume.notsupported'
        },
        '9': {
            descriptionKey: 'error.space.notenough'
        },
        '10': {
            descriptionKey: 'error.piece.length.different'
        },
        '11': {
            descriptionKey: 'error.download.sametime'
        },
        '12': {
            descriptionKey: 'error.download.torrent.sametime'
        },
        '13': {
            descriptionKey: 'error.file.exists'
        },
        '14': {
            descriptionKey: 'error.file.rename.failed'
        },
        '15': {
            descriptionKey: 'error.file.open.failed'
        },
        '16': {
            descriptionKey: 'error.file.create.failed'
        },
        '17': {
            descriptionKey: 'error.io.error'
        },
        '18': {
            descriptionKey: 'error.directory.create.failed'
        },
        '19': {
            descriptionKey: 'error.name.resolution.failed'
        },
        '20': {
            descriptionKey: 'error.metalink.file.parse.failed'
        },
        '21': {
            descriptionKey: 'error.ftp.command.failed'
        },
        '22': {
            descriptionKey: 'error.http.response.header.bad'
        },
        '23': {
            descriptionKey: 'error.redirects.toomany'
        },
        '24': {
            descriptionKey: 'error.http.authorization.failed'
        },
        '25': {
            descriptionKey: 'error.bencoded.file.parse.failed'
        },
        '26': {
            descriptionKey: 'error.torrent.file.corrupted'
        },
        '27': {
            descriptionKey: 'error.magnet.uri.bad'
        },
        '28': {
            descriptionKey: 'error.option.bad'
        },
        '29': {
            descriptionKey: 'error.server.overload'
        },
        '30': {
            descriptionKey: 'error.rpc.request.parse.failed'
        },
        //'31': { }, //Reserved. Not used.
        '32': {
            descriptionKey: 'error.checksum.failed'
        }
    });
}());
