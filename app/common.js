const fs = require('fs')
const path = require('path')

const config = require('../config')


function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

function GuidCreate() {
    return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
}

function uploadFile(file, filename) {
    download = GuidCreate() + path.extname(filename);
    filepath = path.join(config.filepath, download)
    console.log(`Uploading ${filename} to ${filepath}`);
    fstream = fs.createWriteStream(filepath);
    file.pipe(fstream);
    fstream.on('close', function () {
        console.log(`Uploaded ${filename}`);
    });
}

module.exports = {
  GuidCreate, uploadFile
}
