// app.js
const cloud = require('wx-server-sdk'); // 引入 CloudBase SDK

App({
  onLaunch() {
    // 初始化 CloudBase
    cloud.init({
      env: 'willswu-d1gttwhxle25af194', // 你的环境 ID
      traceUser: true, // 可选：记录用户访问日志
    });
    console.log('CloudBase 初始化完成');
  }
});