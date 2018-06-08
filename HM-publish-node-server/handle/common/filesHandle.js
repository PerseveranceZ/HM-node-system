/**
 * Created by tangsicheng on 2018/3/24.
 */
let fs = require('fs');
let logger = require('../../config/log4js').logger;
let config = require('../../config/config').ENVIROMENT_INFO;
let moment = require('moment');
let path = require('path');
let mime = require('mime');
let JSZip = require("jszip");
let formidable = require('formidable');

class FilesHandle {
    // 递归创建目录 异步方法
    static mkdirs(dirname, callback) {
        fs.exists(dirname, function (exists) {
            if (exists) {
                callback();
            } else {
                this.mkdirs(path.dirname(dirname), function () {
                    fs.mkdir(dirname, callback);
                    logger.info('在' + path.dirname(dirname) + '目录创建好' + dirname + '目录');
                });
            }
        });
    }

// 递归创建目录 同步方法
    static mkdirsSync(dirname) {
        if (fs.existsSync(dirname)) {
            return true;
        } else {
            if (FilesHandle.mkdirsSync(path.dirname(dirname))) {
                fs.mkdirSync(dirname);
                return true;
            }
        }
    }

    uploadFile(type, file, appName) {
        return new Promise(function (resolve, reject) {
            let fileName = file.name;
            let oldpath = file.path;
            if (!fileName || !oldpath) {
                let err = new Error('文件读取失败');
                reject(err);
            }
            //注意，这里的appPackagePath 的路径是你最后觉得apk或ipa放在哪里的路径

            let newpath = `${config.appPackagePath}/${appName}/${type}/${moment().format('YYYYMMDDHHmm')}`;
            if (FilesHandle.mkdirsSync(newpath)) {
                logger.info(newpath + '路径已可用');
                try {
                    logger.info('文件上传中');
                    fs.rename(oldpath, `${newpath}/${fileName}`, function (err) {
                        if (err) {
                            logger.error(err.message);
                            throw err;
                        } else {
                            logger.info(newpath + '/' + fileName + '上传成功！');
                            resolve(newpath + '/' + fileName);
                        }
                    })
                } catch (err) {
                    logger.error('------------------------')
                    logger.error(err);
                    logger.error('------------------------')
                }
            } else {
                logger.error(newpath + '路径已不可用');
                let err = new Error('上传文件失败');
                err.status = 500;
                reject(err);
            }
        })

    }
    downloadFile(res,file){
        fs.exists(file, (isExist) => {
            "use strict";
            if (isExist) {
                let filename = path.basename(file);
                let mimetype = mime.lookup(file);        //匹配文件格式
                let stats = fs.statSync(file);
                res.setHeader('Content-disposition', 'attachment; filename=' + filename);
                res.setHeader('Content-type', mimetype);
                res.setHeader('Content-Length', stats.size);
                let filestream = fs.createReadStream(file)

                filestream.on('data', function (chunk) {
                    res.write(chunk);
                });
                filestream.on('end', function () {
                    res.end();
                });
            } else {
                throw new Error('未找到js包');
            }
        })
    }
    downloadFileWithJSZip({res,files,tempPath}){
        /**
         * jsZip 压缩多文件，http://stuk.github.io/jszip/documentation/examples.html
         * @type {JSZip}
         */
        let zip = new JSZip();
        for(let index in files){
            zip.file(path.basename(files[index]), fs.readFileSync(files[index]));
        }

        zip.generateNodeStream({type: 'nodebuffer', streamFiles: true})
            .pipe(fs.createWriteStream(tempPath))
            .on('finish', function (err) {
                if (err) {
                    throw err;
                }
                logger.info(`${tempPath} has written.`);
                let filename = path.basename(tempPath);
                let mimetype = mime.lookup(tempPath);        //匹配文件格式
                res.setHeader('Content-disposition', 'attachment; filename=' + filename);
                res.setHeader('Content-type', mimetype);
                let filestream = fs.createReadStream(tempPath)

                filestream.on('data', function (chunk) {
                    res.write(chunk);
                });
                filestream.on('end', function () {
                    res.end();
                });
            });
    }

    getUploadFromFormData(req){
        let form = new formidable.IncomingForm()
        //文件保留后缀名
        form.keepExtensions = true;
        //设置上传文件的大小
        form.maxFileSize = 200 * 1024 * 1024;
        form.uploadDir = path.resolve(__dirname, '../../temp');
        let files = [];
        form.on('file', function (filed, file) {
            files.push(file);
        });//whenever a file is received, this will add the file info to the array

        return new Promise(function (resolve, reject) {
            form.parse(req, function (err, fields,file) {
                if (err) {
                    logger.error(err);
                    reject(err);
                    return;
                }

                if (files.length>0) {
                    logger.info("file exist");
                    resolve({files,fields});
                } else {
                    let err = new Error('文件获取失败');
                    reject(err);
                }
            })
        })
    }
}
module.exports = FilesHandle ;
