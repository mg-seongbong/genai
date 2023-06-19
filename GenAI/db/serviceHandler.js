const {getConnection, releaseConnection} = require('./dbConn');
//javascript time format 용. 
const moment = require('moment')
/*
사용자가 AI 생성을 요청한 Image를 Upload 시 contents, contents_image 테이블에 정보 저장
- 사용자는 한번 요청시에 여러개의 Image를 Upload할 수 있음. 
- 요청시마다 contents 테이블에는 고유 content 번호를 PK로 생성하고 content명(name), 사용자명등의 정보를 저장
- 요청시의 여러개 Image들은 contents에 생성된 고유 content번호를 FK로, 개별 image들을 seq로 하여 
  contents_image 테이블에  정보 저장. 
- contents와 contents_image 테이블 정보 저장은 transaction으로 관리. 
*/
const insertUploadFiles = async (userId, uploadedFiles) => {
    let imageArray = []
    const insContentsQuery = "insert into contents (name, user_id, created_dt) " + 
                   "values (?, ?, now())"
    const getLastPkQuery = "select last_insert_id() as content_id"
    const insImagesQuery = "insert into contents_images " +
            " (content_id, image_seq, original_name, destination, filename, path, size) " +
                   " values ?"
    let conn = null
    try {
        conn = await getConnection()
        /* transaction 시작 */
        await conn.beginTransaction()
        //contents 테이블에 요청 정보입력. created_dt는 현재 시각 입력 
        // const insContentResult = await conn.execute(insContentsQuery, 
        //                           [new Date().toISOString().slice(0,19), userId])

        //new Date().toISOString()가 UTC를 반환하여 moment 라이브러를 이용하여 KST Date 문자열 생성. 
        const insContentResult = await conn.execute(insContentsQuery, 
                                  [moment().format('YYYY-MM-DD HH:mm:ss'), userId])
        //contents 테이블의 pk인 content_id는 auto increment 이므로 
        // last_insert_id()로 입력된 PK 조회
        const getResult = await conn.execute(getLastPkQuery)
        const contentId = getResult[0][0].content_id
        
        //uploadedFiles를 array로 여러 image들의 정보를 가짐. 
        //별도의 imageArray에 content_id PK값을 포함하여 저장. 
        uploadedFiles.forEach((file, seq) => {
            imageArray.push([contentId, seq, file.originalname, file.destination,
                             file.filename, file.path, file.size])
        })
        //conn.execute()를 multi record insert에 적용하면 오류 발생. conn.query()로 변경.
        //https://stackoverflow.com/questions/67672322/bulk-insert-with-mysql2-and-nodejs-throws-500 
        //contents_image 테이블에 image들에 대한 insert 수행. 
        const insImageResult = await conn.query(insImagesQuery, [imageArray])

        //transaction 종료 
        await conn.commit()
        
        await releaseConnection(conn)
        // 추후에 javascript client에서 upload된 이미지를 불러오기 위해서 content_id 반환 필요. 
        return contentId
    } catch(err){
    console.error("error:", err)
    if (conn) {
        await conn.rollback()
    }
    throw err
    } finally {
        if (conn) {
            await releaseConnection(conn)
        }
    }
}

/*
content_id 별로 upload된 image 파일의 저장 경로를 반환
- 현재는 upload 시 로컬 스토리지에 image 파일을 저장
- 추후 upload 파일은 오브젝트 스토리지에 저장 예정. 
- 사용자가 요청한 이미지 파일들을 View에서 보여주기 위해 사용 
*/
const getUploadFilesById = async (contentId) => {
    const query = "Select path from contents_images where content_id = ?"
    let conn = null
    try {
        conn = await getConnection()
        const [results] = await conn.execute(query, [contentId])
        
        await releaseConnection(conn)
        
        return results
    } catch(err){
    console.error("error:", err)
    throw err
    } finally {
        if (conn) {
            await releaseConnection(conn)
        }
    }
}
/*
사용자가 upload한 모든 content_id, content명 정보를 조회
*/
const getUploadListByUser = async (userId) => {
    const query = "Select content_id, name from contents where user_id = ?"
    let conn = null
    try {
        conn = await getConnection()
        const [results] = await conn.execute(query, [userId])
        
        await releaseConnection(conn)
        
        return results
    } catch(err){
    console.error("error:", err)
    throw err
    } finally {
        if (conn) {
            await releaseConnection(conn)
        }
    }
}

/* 
요청한 content별로 AI 생성된 Image 파일의 저장 경로를 반환
- Content별로 AI 생성된 image 파일의 정보는 contents_images에 저장. 
- AI 생성된 image 파일의 저장 경로를 반환하여 View에서 생성 이미지를 나타내게 함
*/
const getGenImagesByContentId = async (contentId) => {
    //현재 generated image를 담는 content_gen_images에 데이터가 없으므로 contents_images를 사용. 
    const query = "Select path from contents_images where content_id = ?"
    let conn = null
    try {
        conn = await getConnection()
        const [results] = await conn.execute(query, [contentId])
        
        await releaseConnection(conn)
        
        return results
    } catch(err){
    console.error("error:", err)
    throw err
    } finally {
        if (conn) {
            await releaseConnection(conn)
        }
    }
}

module.exports = {
    insertUploadFiles,
    getUploadFilesById,
    getUploadListByUser, 
    getGenImagesByContentId
}


