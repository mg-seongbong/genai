/**********************************************************************
이미지 업로드 및 생성한 AI 이미지를 보여주는 주요 서비스에 관련된 controller
1. AI 요청 이미지 업로드 수행. 업로드된 이미지 파일의 저장 및 이미지 파일 정보를 DB 저장. 
2. 요청 이미지로 작업이 완료된 AI 생성 이미지 조회
***********************************************************************/

const {
    insertUploadFiles,
    getUploadFilesById,
    getUploadListByUser, 
    getGenImagesByContentId
} = require('../db/serviceHandler');

const asyncWrapper = require('../middleware/async');

/*
image upload 화면 view render
- 개별 사용자의 user정보를 view에 전달하고 image 업로드 화면 render  
*/
const renderImageUpload = (req, res) => {
    res.render('imageUpload', {sessUserInfo: req.session.userInfo})
}

/*
사용자가 요청한 image upload 수행. 
- 요청시마다 고유 content_id를 생성하고, 여러 image들의 정보(저장 경로등을)를 DB에 저장. 
- 이미지의 저장 경로는 req.files에 저장된 multer에서 설정된 파일 경로를 이용
*/
const createImageUpload = asyncWrapper(async (req, res) => {
    const contentId = await insertUploadFiles(req.session.userInfo.userId, req.files)
    res.status(201).send({uploadMessage: "성공적으로 업로드 하였습니다", uploadCode: 201, contentId: contentId})
})

/*
사용자의 요청 contentId 별로 image의 저장 경로를 반환 
- 사용자가 그동한 요청한 리스트에서 특정 요청명을 선택하면 해당하는 이미지를 
  View에서 보여줄 수 image 저장 경로 반환
*/
const showImagesByContentId = asyncWrapper(async (req, res) => {
    const contentId = req.params.id;
    const results = await getUploadFilesById(contentId)
    res.status(200).json(results)
})

/*
 사용자가 그동안 요청한 모든 요청리스트를 반환
 - 사용자가 특정 요청을 선택할 수 있도록 사용자가 요청한 모든 요청 리스트를 조회하여 반환
 - 해당 리스트는 View에서 사용할 수 있도록 전달됨.
 */
const showUploadListByUserId = asyncWrapper(async (req, res) => {
    const userId = req.session.userInfo.userId
    const results = await getUploadListByUser(userId)
    res.render('imageManage', {sessUserInfo: req.session.userInfo, 
                              imageList: results})
})

const showGenImagesByContentId = asyncWrapper(async (req, res) => {
    const contentId = req.params.id;
    const results = await getGenImagesByContentId(contentId)
    res.status(200).json(results)
})

module.exports = {
    renderImageUpload,
    createImageUpload,
    showImagesByContentId,
    showUploadListByUserId,
    showGenImagesByContentId
}