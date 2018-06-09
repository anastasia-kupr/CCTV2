var express = require('express');
var router = express.Router();
const models = require('../models');
const authenticate = require('../middleware/authenticate');
const errors = require('../errors');
const moment = require('moment');
const filesize = require('filesize');

let fs = require('fs');
let path = require('path');

let time = '';
let framesFolder = '';
let videoFolder = '';
let camera = undefined;
let videoList = [];
let dates = [];

let setVideoList = function() {
    let i = 0;
    videoList = [];
    dates = [];
    if (fs.existsSync(__dirname + '/../public/assets/video')) {
        fs.readdirSync(__dirname + '/../public/assets/video/').forEach(file => {
            let stat = fs.statSync(__dirname + '/../public/assets/video/' + file);
            let day = moment(stat.mtimeMs).format('LL');
            let time = moment(stat.mtimeMs).format('LTS');
            videoList.push({
                id: i++,
                name: file,
                date: stat.mtimeMs,
                day: day,
                time: time,
                size: filesize(stat.size)
            });
            if (dates.findIndex(item => item.day===day)===-1)  dates.push({day: day, videos: []});
        });
        dates.forEach(elem => {
            videoList.forEach(item => {
                if (item.day === elem.day){
                    elem.videos.push(item);
                }
            })
        });
    }
}

router.get('/list',
    authenticate(),
    errors.wrap(async (req, res) => {
        setVideoList();
        res.send(dates);
    })
);


router.get('/record/:id',
    errors.wrap(async (req, res) => {

        let id = +req.params.id;
        if (!videoList.length) setVideoList();

        let index = videoList.findIndex(function (item) {
            return item.id === id;
        });

        let name = videoList[index].name;

        let path = __dirname + '/../public/assets/video/' + name;
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
        if (!fs.existsSync(__dirname + '/../public/assets/video')) return;
        fs.unlink(__dirname + '/../public/assets/video/' + req.params.name, (err) => {
            if (err) throw err;
        });
        res.sendStatus(204);
    })
);


router.get('/start-record',
    // authenticate(['admin']),
    errors.wrap(async (req, res) => {
        console.log('start recording');
        let MjpegCamera = require('mjpeg-camera');
        let FileOnWrite = require('file-on-write');

        let number = 0;
        time = '' + Date.now();
        if (!fs.existsSync('./public/assets/frames')) fs.mkdirSync('./public/assets/frames');
        framesFolder = __dirname + '/../public/assets/frames/';
        fs.mkdirSync(framesFolder + time);
        if (!fs.existsSync(__dirname + '/../public/assets/video')) fs.mkdirSync(__dirname + '/../public/assets/video');
        videoFolder = __dirname + '/../public/assets/video/';
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
            name: 'myCamera',
            user: 'admin',
            password: 'admin',
            url: process.env.CAMERA_URL,
            motion: true
        });

        camera.pipe(fileWriter);

        camera.start();
        res.send({});
    })
);

router.get('/stop-record',
    // authenticate(['admin']),
    errors.wrap(async (req, res) => {
        console.log('stop recording');

        camera.stop();

        let frames = [];

        fs.readdirSync(framesFolder + time).forEach(file => {
            frames.push(framesFolder + time + '/' + file);
        });

        let ffmpeg = require('ffmpeg-stream').ffmpeg;

        const conv = ffmpeg();
        const input = conv.input({f: 'image2pipe', r: 17});
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
