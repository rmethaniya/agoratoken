var express = require('express');
require('dotenv').config();
const { RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole } = require('agora-access-token')

var PORT = process.env.PORT || 8888;

if (!(process.env.APP_ID && process.env.APP_CERTIFICATE)) {
    throw new Error('You must define an APP_ID and APP_CERTIFICATE');
}
var APP_ID = process.env.APP_ID;
var APP_CERTIFICATE = process.env.APP_CERTIFICATE;

var app = express();

function nocache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}

var generateAccessToken = function (req, resp) {
    resp.header('Access-Control-Allow-Origin', "*")
    var channel = req.query.channel;
    if (!channel) {
        return resp.status(500).json({ 'error': 'channel name is required' });
    }
    var uid = req.query.uid;
    if (!uid) {
        uid = 0;
    }
    var expiredTs = req.query.expiredTs;
    if (!expiredTs) {
        expiredTs = 0;
    }
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

    const rtcToken = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channel, uid, role, privilegeExpiredTs);
    console.log("Token With Integer Number Uid: " + rtcToken);
    const rtmToken = RtmTokenBuilder.buildToken(APP_ID, APP_CERTIFICATE, uid, RtmRole, privilegeExpiredTs);
    console.log("Rtm Token: " + rtmToken);
    return resp.json({ 'rtc': rtcToken, 'rtm': rtmToken });
};

app.get('/access_token', nocache, generateAccessToken);

app.listen(PORT, function () {
    console.log('Service URL http://127.0.0.1:' + PORT + "/");
    console.log('Channel Key request, /access_token?uid=[user id]&channel=[channel name]');
    console.log('Channel Key with expiring time request, /access_token?uid=[user id]&channel=[channel name]&expiredTs=[expire ts]');
});
