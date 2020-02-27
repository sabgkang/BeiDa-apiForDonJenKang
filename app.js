// 提供給動健康查詢的 API
// 北大 uGym 團課系統查詢 API 使用說明文件 https://docs.google.com/document/d/1mW94YuHyvYX0qhB57pkYefEhUa-wElTbyyEskkdqiwI/edit#

var version ="V0.2";

var express = require('express');
var request = require("request");
var app     = express();
var port    = process.env.PORT || 5000

var response;
var inputParam;
var memberData    = [];
var courseMember  = [];
var courseData    = [];
var courseHistory = [];

console.log("Version:", version);

// express 設定
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next()
});

//   API:00 ?API=00 
//          Echo for keep alove
//          成功回應 "API00: OK" 
//          失敗回應 "API00: Failed"
//
//   API:01 ?API=01 
//          查詢所有課程資料
//          成功回應 returnObj: { 
//            報名課程: [
//              {課程編號: "UXXX", 繳費狀態: true, 簽到狀態: true },
//              {課程編號: "UXXX", 繳費狀態: true, 簽到狀態: true },
//            ],
//            到期課程: [
//              {課程編號: "UXXX", 繳費狀態: true, 簽到狀態: true },
//              {課程編號: "UXXX", 繳費狀態: true, 簽到狀態: true },
//            ],
//          }
//          失敗回應 returnObj: {
//            報名課程: [],
//            到期課程: [],
//          }
//
//   API:02 ?API=02 
//          查詢所有優惠券資料
//          成功回應 returnObj: { 
//            現在優惠券: [
//              {優惠券編號: "UXXX", 使用狀態: true, 核銷狀態: true },
//              {優惠券編號: "UXXX", 使用狀態: true, 核銷狀態: true },
//            ],
//            到期優惠券: [
//              {優惠券編號: "UXXX", 使用狀態: true, 核銷狀態: true },
//              {優惠券編號: "UXXX", 使用狀態: true, 核銷狀態: true },
//            ],
//          }
//          失敗回應 returnObj: {
//            報名課程: [],
//            到期課程: [],
//          }
//
//   API:10 ?API=10&ID=Axxx..xxx 
//          查詢該身分證號的完整會員資料
//          成功回應 returnObj: { 
//            會員資料: [姓名，性別，生日，電話，身分證號，住址，LINE_ID，LINE_頭像，身高，體重，緊急聯絡人，緊急聯絡人電話],
//          }
//          失敗回應 returnObj: {
//            會員資料: [],
//            報名課程: [],
//          }
//
//   API:11 ?API=11&ID=Axxx..xxx 
//          查詢該身分證號參加過的所有團課 
//          成功回應 returnObj: { 
//            會員資料: [姓名，性別，生日，電話，身分證號，住址，LINE_ID，LINE_頭像，身高，體重，緊急聯絡人，緊急聯絡人電話],
//            報名課程: [
//              {課程編號: "UXXX", 繳費狀態: true, 簽到狀態: true },
//              {課程編號: "UXXX", 繳費狀態: true, 簽到狀態: true },
//            ],
//            到期課程: [
//              {課程編號: "UXXX", 繳費狀態: true, 簽到狀態: true },
//              {課程編號: "UXXX", 繳費狀態: true, 簽到狀態: true },
//            ],
//          }
//          失敗回應 returnObj: {
//            會員資料: [],
//            報名課程: [],
//            到期課程: [],
//          }
//
//   API:12 ?API=00&ID=Axxx..xxx 
//          查詢該身分證號使用過的所有優惠券 
//          成功回應 returnObj: { 
//            會員資料: [姓名，性別，生日，電話，身分證號，住址，LINE_ID，LINE_頭像，身高，體重，緊急聯絡人，緊急聯絡人電話],
//            現在優惠券: [
//              {優惠券編號: "UXXX", 使用狀態: true, 核銷狀態: true },
//              {優惠券編號: "UXXX", 使用狀態: true, 核銷狀態: true },
//            ],
//            到期優惠券: [
//              {優惠券編號: "UXXX", 使用狀態: true, 核銷狀態: true },
//              {優惠券編號: "UXXX", 使用狀態: true, 核銷狀態: true },
//            ],
//          }
//          失敗回應 returnObj: {
//            會員資料: [],
//            報名課程: [],
//            到期課程: [],
//          }

app.get('/', function (req, res) {
  //console.log(req.query);
  inputParam = req.query;
  response = res;

  // 若無 API 參數，無效退出
  if (typeof inputParam.API == "undefined") {
    console.log("Error: No API");
    response.send("Error: No API");
    return 0;
  }    
  
  //console.log("API is ", inputParam.API);
  
  switch(inputParam.API) {
    case "00":
      console.log("呼叫 API:00 Echo for Keep alive");
      echo();  
      break;
    case "01":
      console.log("呼叫 API:01 查詢所有課程資料");
      取得課程資料();  
      break;      
    case "02":
      console.log("呼叫 API:02 查詢所有優惠券資料");
      取得優惠券資料();  
      break;    
    case "10":
      console.log("呼叫 API:10 查詢該身分證號的完整會員資料");
      取得會員詳細資訊();  
      break;       
    case "11":
      console.log("呼叫 API:11 查詢該身分證號參加過的所有團課");
      取得會員報名課程(); 
      break;      
    case "12":
      console.log("呼叫 API:12 查詢該身分證號使用過所有優惠券");
      取得會員使用過優惠券(); 
      break;      
    default:
      console.log("呼叫 未知API:"+inputParam.API);
      response.send("呼叫 未知API:"+inputParam.API);
  }

});



app.listen(port, function () {
  console.log('App listening on port: ', port);
});
// express 設定結束

// Firebase 設定 ===============================
var admin = require("firebase-admin");

var serviceAccount = require("./ugym-beida-firebase-adminsdk-2zjl2-d22d02bcc3.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ugym-beida.firebaseio.com"
});


var database = admin.database(); // 初始資料庫
// Firebase 設定結束 ===========================


// Express call back functions

 
async function echo(){
  try {
    await database.ref("users/三峽運動中心/團課課程").once("value", snapshot => {
      //console.log(snapshot.val());
      var result = snapshot.val();
      courseData = JSON.parse(result.現在課程);
      courseHistory = JSON.parse(result.過去課程);
    }); 
  } catch(err) {
    console.log("API00: Failed");   
    response.send("API00: Failed");     
  }
    console.log("API00: OK");   
    response.send("API00: OK");  ;  
}


async function 取得課程資料(){
  var userName;
  var userLineId;
  var userPhoneNumber;
  var userID;
  
  //  return { 
  //    報名課程: [
  //      [課程 ...],  
  //      [課程 n],
  //      [課程 n+1],
  //    ],
  //    到期課程: [
  //      [課程 1],
  //      [課程 2],
  //      [課程 ...], 
  //    ],
  //  }  
  var returnObj = {
    報名課程: [],
    到期課程: [],
  }  
  
  //console.log(userName, userLineId, userPhoneNumber, userID);  
    
  await database.ref("users/三峽運動中心/團課課程").once("value", snapshot => {
    //console.log(snapshot.val());
    var result = snapshot.val();
    courseData = JSON.parse(result.現在課程);
    courseHistory = JSON.parse(result.過去課程);
  }); 
  
  //console.log(courseData, courseHistory);
  console.log("取得課程資料");   
  

  courseData.forEach(function(nowCourse, nowIndex, nowArray){
    returnObj.報名課程.push(nowCourse);
  });
 
    
  courseHistory.forEach(function(nowCourse, nowIndex, nowArray){
    returnObj.到期課程.push(nowCourse);
  });
 
  //console.log(returnObj);
  response.send(JSON.stringify(returnObj));  
}  

async function 取得優惠券資料() { 
  console.log("取得優惠券資料");
  response.send("取得優惠券資料 API 還沒開放");
}

async function 取得會員詳細資訊(){
//  var userName;
//  var userLineId;
//  var userPhoneNumber;
//  var userID;
  
  //  return { 
  //    會員資料: [姓名，性別，生日，電話，身分證號，住址，LINE_ID，LINE_頭像，身高，體重，緊急聯絡人，緊急聯絡人電話],
  //  }  
  var returnObj = {
    會員資料: [],
  }  
  
  // 從身分證號取得 名字，LineId 和 phoneNumber  
  await database.ref("users/三峽運動中心/客戶管理").once("value", snapshot => {
    //console.log(snapshot.val());
    var result = snapshot.val();
    memberData = JSON.parse(result.會員資料);
  });

  //console.log(memberData);
  console.log("取得會員資料");  
  
  memberData.forEach(function(member, index, array){
    if (member[4]==inputParam.ID) {
      //console.log("matched", member[4]);
//      userName   = member[0];
//      userLineId = member[6];
//      userPhoneNumber = member[3];
//      userID = member[4];
      
      returnObj.會員資料 = (member);
    }
  });
  
  console.log(returnObj);
  response.send(JSON.stringify(returnObj));  
}  

async function 取得會員報名課程(){
  var userName;
  var userLineId;
  var userPhoneNumber;
  var userID;
  
  //  若每個人都傳回完整課程資料，會造成重複資料及浪費頻寬，先只提供課程編號。
  //  另外提供 API:02 來提供一份課程完整資料，動健康可以用查表方式來對應
  //  return { 
  //    會員資料: [姓名，性別，生日，電話，身分證號，住址，LINE_ID，LINE_頭像，身高，體重，緊急聯絡人，緊急聯絡人電話],
  //    報名課程: [
  //      {課程編號: "UXXX", 繳費狀態: true, 簽到狀態: true },
  //      {課程編號: "UXXX", 繳費狀態: true, 簽到狀態: true },
  //    ],
  //    到期課程: [
  //      {課程編號: "UXXX", 繳費狀態: true, 簽到狀態: true },
  //      {課程編號: "UXXX", 繳費狀態: true, 簽到狀態: true },
  //    ],
  //  }  
  var returnObj = {
    會員資料: [],
    報名課程: [],
    到期課程: [],
  }  
  
  // 從身分證號取得 名字，LineId 和 phoneNumber
  //console.log(inputParam.ID);
  //console.log(userName, userLineId, userPhoneNumber, userID);
  
  await database.ref("users/三峽運動中心/客戶管理").once("value", snapshot => {
    //console.log(snapshot.val());
    var result = snapshot.val();
    memberData = JSON.parse(result.會員資料);
  });

  //console.log(memberData);
  console.log("取得會員資料");  
  
  memberData.forEach(function(member, index, array){
    if (member[4]==inputParam.ID) {
      //console.log("matched", member[4]);
      userName   = member[0];
      userLineId = member[6];
      userPhoneNumber = member[3];
      userID = member[4];
      
      returnObj.會員資料 = (member);
    }
  });
  
  //console.log(userName, userLineId, userPhoneNumber, userID);  
    
  await database.ref("users/三峽運動中心/團課課程").once("value", snapshot => {
    //console.log(snapshot.val());
    var result = snapshot.val();
    courseData = JSON.parse(result.現在課程);
    courseHistory = JSON.parse(result.過去課程);
  }); 
  
  //console.log(courseData, courseHistory);
  console.log("取得課程資料");   
  
  await database.ref("users/三峽運動中心/課程管理").once("value", snapshot => {
    //console.log(snapshot.val());
    var result = snapshot.val();
    courseMember = JSON.parse(result.課程會員);
  });  
 
  //console.log(courseData, courseHistory, courseMember);
  console.log("取得會員管理資料");  


  var inNowCourse     = false;
  var inHistoryCourse = false;
  courseMember.forEach(function(course, index, array){
    // 先檢查是否現在課程
    //console.log(course[0]);
    courseData.forEach(function(nowCourse, nowIndex, nowArray){
      if (course[0] == nowCourse[0]) {
        inNowCourse = true;
        for (var i=1; i<course.length; i++) {
          if (course[i][3] == userLineId) {
            //console.log(course[i]);   
            var dataToAdd = {
              "課程編號": course[0],
              "繳費狀態": course[i][1]=="已繳費",
              "簽到狀態": course[i][2]=="已簽到",
            } 
            returnObj.報名課程.push(dataToAdd);
          }
        }
      }    
    });
    
    courseHistory.forEach(function(nowCourse, nowIndex, nowArray){
      if (course[0] == nowCourse[0]) {
        inNowCourse = true;
        for (var i=1; i<course.length; i++) {
          if (course[i][3] == userLineId) {
            //console.log(course[i]); 
            
            var 繳費狀態 = false;
            var 簽到狀態 = false;      
            var dataToAdd = {
              "課程編號": course[0],
              "繳費狀態": course[i][1],
              "簽到狀態": course[i][2],
            } 
            returnObj.到期課程.push(dataToAdd);
          }
        }
      }    
    });    
                
  });
  
  console.log(returnObj);
  response.send(JSON.stringify(returnObj));  
} 

async function 取得會員使用過優惠券() {
  console.log("取得會員使用過優惠券");
  response.send("取得會員使用過優惠券 API 還沒開放");  
}