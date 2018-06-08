/**
 * Created by tangsicheng on 2018/1/30.
 */
var express = require('express');
var router = express.Router();
var appCont = require('../controllers/application');
const passport = require('passport');

require('../passport')(passport);
//
/* GET users listing. */
/**
 * 下载差分包的接口,这个接口的url是由checkJsVersion 判断后返回的
 */
router.get('/downloadIncrementZip/:appName/:isDiff/:zipName', appCont.downloadIncrementZip);

/**
 * 这个接口是用来给eros-cli 用来发布js bundle的 所以不能由权限校验
 */
router.post('/jsBundleInfo',appCont.addJsBundleInfo);


/**
 * 修改jsbundle包状态的。
 */
router.post('/updateJsBundleStatus/:id/:status',passport.authenticate('bearer', { session: false }), appCont.updateJsBundleStatus);

router.get('/jsBundleInfo',passport.authenticate('bearer', { session: false }), appCont.getJsBundleInfo);

/**
 * 这个接口是为了给客户端校验js版本信息，用来热更新的。
 */
router.get('/checkJsVersion', appCont.checkJsVersion);

/**
 * 获取发布的客户端信息
 */
router.get('/releaseInfos',passport.authenticate('bearer', { session: false }), appCont.getReleaseInfos);

/**
 * 根据type判断客户端类型，上传客户端包和信息
 */
router.post('/releaseInfos/:type',passport.authenticate('bearer', { session: false }),appCont.addReleaseInfos);

router.put('/releaseInfos',passport.authenticate('bearer', { session: false }),appCont.updateReleaseInfos);




router.get('/validateAppPackageName',passport.authenticate('bearer', { session: false }), appCont.validateAppPackageName);

router.get('/validateDisplayName',passport.authenticate('bearer', { session: false }), appCont.validateDisplayName);

router.get('/checkReleaseVersion',passport.authenticate('bearer', { session: false }),appCont.checkReleaseVersion);

router.post('/clientInfo',passport.authenticate('bearer', { session: false }),appCont.addClientInfo);

router.get('/clientInfo',passport.authenticate('bearer', { session: false }),appCont.getClientInfo);

router.put('/clientInfo',passport.authenticate('bearer', { session: false }),appCont.updateClientInfo);

router.post('/uploadToPgyer',passport.authenticate('bearer', { session: false }),appCont.uploadToPgyer);


/**
 * 注意，所有删除只做逻辑删除，update isDelete = 1,不做物理删除！！
 * 删除不太好做处理.
 */
// router.delete('/clientInfo',passport.authenticate('bearer', { session: false }),appCont.deleteClientInfo);


/**
 * 注意，暂时下载的连接不能有token校验，因为vue的axios如果要下载的话，是需要通过iframe 打开一个url来下载的，所以如果要传参数就在url里面传吧，尽量都用get请求
 * 参考：https://www.zhihu.com/question/263323250/answer/267842980
 */
router.get('/downloadBundle/:appName',appCont.downloadBundle);

/**
 * 安装客户端时下载更新包，会根据app的名称和客户端类型来判断
 */
router.get('/downloadClient/:appName/:clientType',appCont.downloadClient);


/**
 * 用于给客户端校验版本信息时用的，需要的参数为客户端的版本，app工程名，客户端的平台
 */
router.get('/checkClientVersion',appCont.checkClientVersion);

router.get('/downloadPList',appCont.downloadPList);




module.exports = router;
