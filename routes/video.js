var express = require('express');
var router = express.Router();
const models = require('../models');
const authenticate = require('../middleware/authenticate');
const errors = require('../errors');

let fs = require('fs');
let path = require('path');

let time = '';
let framesFolder = '';
let videoFolder = '';
let camera = undefined;
let videoList = [];

router.get('/list',
    authenticate(),
    errors.wrap(async (req, res) => {
        let i = 0;
        videoList = [];
        if (fs.existsSync(__dirname + '/../assets/video'))
            fs.readdirSync(__dirname + '/../assets/video/').forEach(file => {
                let date = new Date(+file.substr(6, 13))
                videoList.push({
                    id: i++,
                    name: file,
                    date: date
                });
            });
        res.send(videoList);
    })
);


router.get('/record/:id',
    errors.wrap(async (req, res) => {

        let id = +req.params.id;
        if (!videoList.length) {
            let i = 0;
            videoList = [];
            if (fs.existsSync(__dirname + '/../assets/video')) 
                fs.readdirSync(__dirname + '/../assets/video/').forEach(file => {
                    let date = new Date(+file.substr(6, 13));
                    videoList.push({
                        id: i++,
                        name: file,
                        date: date
                    });
                });
        }

        let index = videoList.findIndex(function (item) {
            return item.id === id;
        });

        let name = videoList[index].name;

        let path = __dirname + '/../assets/video/' + name;
        let stat = fs.statSync(path);
        let fileSize = stat.size;
        let range = req.headers.range;

        if (range) {
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

            res.writeHead(206, head);
            file.pipe(res);
        } else {
            let head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(200, head);
            fs.createReadStream(path).pipe(res)
        }
    })
);


router.delete('/record/:name',
    authenticate(['admin']),
    errors.wrap(async (req, res) => {
        if (!fs.existsSync(__dirname + '/../assets/video')) return;
        fs.unlink(__dirname + '/../assets/video/' + req.params.name, (err) => {
            if (err) throw err;
            console.log(__dirname + '/../assets/video/' + req.params.name + ' was deleted');
        });
        res.send({});
    })
);


router.get('/start-record',
    authenticate(['admin']),
    errors.wrap(async (req, res) => {
        console.log('start recording');
        let MjpegCamera = require('mjpeg-camera');
        let FileOnWrite = require('file-on-write');

        let number = 0;
        time = '' + Date.now();
        if (!fs.existsSync('./assets/frames')) fs.mkdirSync('./assets/frames');
        framesFolder = __dirname + '/../assets/frames/';
        fs.mkdirSync(framesFolder + time);
        if (!fs.existsSync(__dirname + '/../assets/video')) fs.mkdirSync(__dirname + '/../assets/video');
        videoFolder = __dirname + '/../assets/video/';
        let fileWriter = new FileOnWrite({
            path: framesFolder + time,
            ext: '.jpeg',
            filename: function (frame) {
                number++;
                let name = "" + number;
                if (name.length < 8) name = ((new Array(8)).join('0') + name).slice(-8);
                return frame.name + '-' + name;
            },
            transform: function (frame) {
                return frame.data;
            }
        });

        camera = new MjpegCamera({
            name: 'backdoor',
            user: 'admin',
            password: 'wordup',
            url: 'http://192.168.1.133:8080/video',
            motion: true
        });

        camera.pipe(fileWriter);

        camera.start();
        res.send({});
    })
);

router.get('/stop-record',
    authenticate(['admin']),
    errors.wrap(async (req, res) => {
        console.log('stop recording');

        camera.stop();

        let frames = [];

        fs.readdirSync(framesFolder + time).forEach(file => {
            frames.push(framesFolder + time + '/' + file);
        });

        let ffmpeg = require('ffmpeg-stream').ffmpeg;

        const conv = ffmpeg();
        const input = conv.input({f: 'image2pipe', r: 20});
        conv.output(videoFolder + '/video-' + time + '.mp4', {vcodec: 'libx264', pix_fmt: 'yuv420p'});

        frames.map(filename => () => {
            return new Promise((fulfill, reject) =>
                fs.createReadStream(filename)
                    .on('end', fulfill)
                    .on('error', reject)
                    .pipe(input, {end: false})
            )
        })
            .reduce((prev, next) => prev.then(next), Promise.resolve())
            .then(() => input.end())

        conv.run();
        res.send({});

    })
);


module.exports = router;
