var fs = require('fs');
var request = require('request');
var util = require('util');
var path = require('path');


URL = {
    "gaode": "http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
    "gaode.image": "http://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
    "tianditu": "http://t2.tianditu.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}",
    "googlesat": "http://khm0.googleapis.com/kh?v=203&hl=zh-CN&&x={x}&y={y}&z={z}",
    "tianditusat": "http://t2.tianditu.cn/DataServer?T=img_w&X={x}&Y={y}&L={z}",
    "esrisat": "http://server.arcgisonline.com/arcgis/rest/services/world_imagery/mapserver/tile/{z}/{y}/{x}",
    "gaode.road": "http://webst02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8",
    "default": "http://61.144.226.124:9001/map/GISDATA/WORKNET/{z}/{y}/{x}.png"
}

var procesLatlng = function(north, west, south, east, zoom, output, maptype){
    output = output || 'mosaic';
    maptype = maptype || "default";

    var left_top = latlng2tilenum(north, west, zoom)
    var right_bottom = latlng2tilenum(south, east, zoom)
    processTilenum(left_top[0], right_bottom[0], left_top[1], right_bottom[1], zoom, output, maptype)
}


var processTilenum = function (left, right, top, bottom, zoom, output, maptype) {
    output = output || 'mosaic';
    maptype = maptype || "default";
    download(left, right, top, bottom, zoom, output, maptype);
}

var download = function (left, right, top, bottom, z, filename, maptype) {
    maptype = maptype || "default";
    for (var x = left; x < right + 1; x++) {
        for (var y = top; y < bottom + 1; y++) {
            var path = 'tiles/{filename}/{z}/{x}/{y}.png'.format({ x: x, y: y, z: z, filename: filename });
                _download(x, y, z, path, maptype);
        }
    }
}

var _download = function (x, y, z, filename, maptype) {
    var url = URL[maptype].format({ x: x, y: y, z: z , s:random(1,4)});
    var pathname = path.dirname(filename);
    mkdirsSync(pathname);
    if (!fs.existsSync(filename)) {
        request.head(url, function (err, res, body) {
            if (err) {
                console.log('get:' + err);
                return;
            }
            request(url).on('error', function(err) {console.log(err)})
            .pipe(fs.createWriteStream(filename));
            console.log('downloaded: '+ filename);
        });
    }
};

var latlng2tilenum = function(lat_deg, lng_deg, zoom){
    var n = Math.pow(2, zoom)
    var xtile = ((lng_deg + 180) / 360) * n
    var lat_rad = lat_deg / 180 * Math.PI
    var ytile = (1 - (Math.log(Math.tan(lat_rad) + 1 / Math.cos(lat_rad)) / Math.PI)) / 2 * n
    return [Math.floor(xtile), Math.floor(ytile)]
}

var random = function(start, end){
    return Math.floor(Math.random()*(end-start+1))+start
}

String.prototype.format = function (json) {
    var temp = this;
    for (var key in json) {
        temp = temp.replace("{" + key + "}", json[key]);
    }
    return temp;
}

function mkdirsSync(dirpath, mode) { 
    if (!fs.existsSync(dirpath)) {
        var pathtmp;
        dirpath.split("/").forEach(function(dirname) {
            if (pathtmp) {
                pathtmp = path.join(pathtmp, dirname);
            }
            else {
                pathtmp = dirname;
            }
            if (!fs.existsSync(pathtmp)) {
                if (!fs.mkdirSync(pathtmp, mode)) {
                    return false;
                }
            }
        });
    }
    return true; 
}

// _download();
//  processTilenum(803,857,984,1061,8,'WORKNET')
procesLatlng(23.3488500800,112.4821141700,21.6283230000,115.0540240000,13,'gaode','gaode')


