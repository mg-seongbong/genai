/**********************************************************************
이미지 업로드 및 생성한 AI 이미지를 보여주는 주요 서비스에 관련된 router
1. AI 요청 이미지 업로드, 조회. 
2. 요청 이미지로 작업이 완료된 AI 생성 이미지 조회
***********************************************************************/
const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
//미 로그인시 home directory로 redirect middleware
const authHandler = require('../middleware/authHandler')
const multer = require("multer");
const {Storage} = require('@google-cloud/storage')
const {
  renderImageUpload, createImageUpload,
  showGenImagesByContentId, showImagesByContentId,
  showUploadListByUserId
} = require('../controllers/serviceController')

//upload 파일이 저장될 folder 생성. 
const makeFolder = (dir) => {
  if(!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true}, err => {console.log(err)})
  }
}

// *** 아래는 Local Storage에 Upload하는 multer 설정임. 
// //multer 미들웨어 설정. 
const upload = multer({
  storage: multer.diskStorage({
    // set a localstorage destination
    //   어떤이름으로 저장할지가 들어있다.

    //위치 지정
    destination: (req, file, done) => {
      //현재는 로컬 스토리지이지만, 추후 google object storage로 변경. 
      const uploadDir = `/home/dooleyz/mustg/GenAI/public/uploads/${req.session.userInfo.userId}/`
      //console.log('uploadDir:',__dirname, uploadDir)
      makeFolder(uploadDir)
      done(null, uploadDir);
    },
    //지정
    // convert a file name
    filename: (req, file, done) => {
      console.log(req.session.userInfo)
      const ext = path.extname(file.originalname);
      done(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  //filesize 10MB 제한. 
  limits: { fileSize: 10 * 1024 * 1024 },
});


// //아래는 Google Object Storage에 Upload하는 multer 설정임. 아래 참조함.
// //https://medium.com/awesome-node/upload-images-to-google-cloud-storage-using-multer-in-node-js-in-10-minutes-41eb44ee385d
// const multerGoogleStorage = require("multer-google-storage")
// //multer 미들웨어 설정. 
// const upload = multer({
//   storage: multerGoogleStorage.storageEngine({
//     autoRetry: true,
//     bucket: "bucket--must-diffusion-386113",
//     projectId: "must-diffusion-386113",
//     keyFilename: "/home/dooleyz/mustg/GenAI/must-diffusion-386113-1de3bab9e3eb.json",
//     //지정
//     // convert a file name
//     filename: (req, file, done) => {
//       console.log("######### in the filename")
//       console.log(req.session.userInfo)
//       const ext = path.extname(file.originalname);
//       done(null, '/ai_images/'+path.basename(file.originalname, ext) + Date.now() + ext);
//       console.log("after done")
//     },
//   }),
//   //filesize 10MB 제한. 
//   limits: { fileSize: 10 * 1024 * 1024 },
// });


//imageUpload 조회 페이지 이동. 
router.get('/imageUpload', authHandler, renderImageUpload)
/* 
imageUpload 수행(Post) 
- multer 파일 업로드를 middleware로 설정하여 파일 upload 수행 및 upload 관련 정보 DB 저장 호출 
*/
router.post('/imageUpload', upload.array("files"), createImageUpload)

//:id는 content_id임. contentId별 요청 이미지 조회 수행. 
router.get('/showImages/:id', authHandler, showImagesByContentId)

//사용자가 요청 리스트 조회 수행. 특정 요청별 이미지 보여주기는 javascript fetch로 수행.  
router.get('/imageManage',authHandler, showUploadListByUserId)

//개별 요청별 작업된 AI 이미지 보여주기. 
router.get('/showGenImages/:id', authHandler, showGenImagesByContentId)

module.exports = router