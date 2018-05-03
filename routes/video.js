var express = require('express');
var router = express.Router();

let fs = require('fs');
let path = require('path');

// router.get('/', function (req, res, next) {
//     let path = 'assets/sample.mp4';
//     let stat = fs.statSync(path);
//     let fileSize = stat.size;
//     let range = req.headers.range;

//     if (range) {
//         console.log('range');
//         let parts = range.replace(/bytes=/, "").split("-");
//         let start = parseInt(parts[0], 10);
//         let end = parts[1]
//             ? parseInt(parts[1], 10)
//             : fileSize - 1;

//         let chunksize = (end - start) + 1;
//         let file = fs.createReadStream(path, {start, end});
//         let head = {
//             'Content-Range': `bytes ${start}-${end}/${fileSize}`,
//             'Accept-Ranges': 'bytes',
//             'Content-Length': chunksize,
//             'Content-Type': 'video/mp4',
//         };

//         res.writeHead(206, head);
//         file.pipe(res);
//     } else {
//         console.log('else');
//         let head = {
//             'Content-Length': fileSize,
//             'Content-Type': 'video/mp4',
//         }
//         res.writeHead(200, head);
//         fs.createReadStream(path).pipe(res)
//     }
// });

let vileList = [
    {
        id: '01',
        name: 'record_2018-05-03_211024.mp4',
        date: '2018-05-03_211407'
    },
    {
        id: '02',
        name: 'record_2018-05-03_211236.mp4',
        date: '2018-05-03_211407'
    },
    {
        id: '03',
        name: 'record_2018-05-03_211407.mp4',
        date: '2018-05-03_211407'
    },
]

router.get('/list', function (req, res, next) {
    res.send(vileList);
})


router.get('/:id', function (req, res, next) {
    console.log('req.params.uuid=', req.params.id);

    let id = req.params.id;

    let index = vileList.findIndex(function (item) {
        return item.id === id;
    });

    let name = vileList[index].name;

    console.log('name=', name);
    let path = 'assets/' + name;
    console.log('path=', path);
    let stat = fs.statSync(path);
    console.log('stat=', stat);
    let fileSize = stat.size;
    console.log('fileSize=', fileSize);
    let range = req.headers.range;
    console.log('range=', range);


    console.log('2=');

    if (range) {
        console.log('range');
        let parts = range.replace(/bytes=/, "").split("-");
        let start = parseInt(parts[0], 10);
        let end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize - 1;

        let chunksize = (end - start) + 1;
        let file = fs.createReadStream(path, {start, end});
        let head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };


        console.log('3=');
        res.writeHead(206, head);
        file.pipe(res);
    } else {

        console.log('else=');
        console.log('else');
        let head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(200, head);
        fs.createReadStream(path).pipe(res)
    }
})



router.get('/2', function (req, res, next) {

    // Create a writable stream to generate files
    var fileWriter = new FileOnWrite({
        path: './assets/frames',
        ext: '.jpeg',
        filename: function (frame) {
            return frame.name + '-' + frame.time;
        },
        transform: function (frame) {
            return frame.data;
        }
    });

    // Create an MjpegCamera instance
    var camera = new MjpegCamera({
        name: 'backdoor',
        user: 'admin',
        password: 'wordup',
        url: 'http://192.168.1.133:8080/video',
        motion: true
    });

    // Pipe frames to our fileWriter so we gather jpeg frames into the /frames folder
    camera.pipe(fileWriter);

    // Start streaming
    console.log('start');
    camera.start();

    // Stop recording after an hour
    setTimeout(function () {

        console.log('stop');
        // Stahp
        camera.stop();

        // Get one last frame
        // Will open a connection long enough to get a single frame and then
        // immediately close the connection
        camera.getScreenshot(function (err, frame) {
            fs.writeFile('final.jpeg', frame, process.exit);
        });
        res.send('ok');

    }, 5 * 1000);
});

router.get('/3', function (req, res, next) {
    // Live video stream management for HTML5 video. Uses FFMPEG to connect to H.264 camera stream, 
    // Camera stream is remuxed to a MP4 stream for HTML5 video compatibility and segments are recorded for later playback
    // For live streaming, create a fragmented MP4 file with empty moov (no seeking possible).

    var url = require('url');
    var reqUrl = url.parse(req.url, true);
    var cameraName = typeof reqUrl.pathname === "string" ? reqUrl.pathname.substring(1) : undefined;
    if (cameraName) {
        try {
            cameraName = decodeURIComponent(cameraName);
        } catch (exception) {
            console.log("Live Camera Streamer bad request received - " + reqUrl);         // Can throw URI malformed exception.
            return false;
        }
    } else {
        console.log("Live Camera Streamer - incorrect camera requested " + cameraName);         // Can throw URI malformed exception.
        return false;
    }

    console.log("Client connection made to live Camera Streamer requesting camera: " + cameraName)

    console.log('1');
    res.writeHead(200, {
        //'Transfer-Encoding': 'binary'
        "Connection": "keep-alive"
        , "Content-Type": "video/mp4"
        //, 'Content-Length': chunksize            // ends after all bytes delivered
        , "Accept-Ranges": "bytes"                 // Helps Chrome
    });
    console.log('2');

    for (var cam in cameras) {
        if (cameraName.toLowerCase() === cameras[cam].name.toLowerCase()) {
            if (!cameras[cam].liveStarted) {
                cameras[cam].liveffmpeg = child_process.spawn("ffmpeg", [
                    "-rtsp_transport", "tcp", "-i", cameras[cam].rtsp, "-vcodec", "copy", "-f", "mp4", "-movflags", "frag_keyframe+empty_moov",
                    "-reset_timestamps", "1", "-vsync", "1", "-flags", "global_header", "-bsf:v", "dump_extra", "-y", "-"   // output to stdout
                ], {detached: false});

                cameras[cam].liveStarted = true;
                console.log('3');
                cameras[cam].liveffmpeg.stdout.pipe(res);
                console.log('4');
                cameras[cam].liveffmpeg.stdout.on("data", function (data) {
                });

                cameras[cam].liveffmpeg.stderr.on("data", function (data) {
                    console.log(cameras[cam].name + " -> " + data);
                });

                cameras[cam].liveffmpeg.on("exit", function (code) {
                    console.log(cameras[cam].name + " live FFMPEG terminated with code " + code);
                });

                cameras[cam].liveffmpeg.on("error", function (e) {
                    console.log(cameras[cam].name + " live FFMPEG system error: " + e);
                });
            }
            break;                       // Keep cam variable active with the selected cam number
        }
    }
    if (cameras[cam].liveStarted === false) {
        // Didn't select a camera
    }

    req.on("close", function () {
        shutStream("closed");
    })

    req.on("end", function () {
        shutStream("ended");
    });

    function shutStream(event) {
        //TODO: Stream is only shut when the browser has exited, so switching screens in the client app does not kill the session
        console.log("Live streaming connection to client has " + event)
        if (typeof cameras[cam].liveffmpeg !== "undefined") {
            cameras[cam].liveffmpeg.kill();
            cameras[cam].liveStarted = false;
        }
    }
    return true
})

module.exports = router;
