/**********************************************************************
사용자 정보 DB 데이터 제공. userController에서 호출
1. 신규 사용자 생성
2. user_id 및 email로 사용자 정보 조회
2. email과 password 일치 확인
***********************************************************************/

const {getConnection, releaseConnection} = require('./dbConn')
const {AlreadyRegisteredError} = require('../errors/userError')

//모든 사용자 정보 조회
const getAllUsers = async () => {
    const query = "Select * from users"
    let conn = null
    try {
        conn = await getConnection();
        const [rows] = await conn.execute(query)
        await releaseConnection()
        return rows
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
user_id별 사용자 정보 조회
*/
const getUserById = async (userId) => {
    const query = "Select * from users where user_id = ?"
    let conn = null
    try {
        conn = await getConnection();
        const [rows] = await conn.query(query, [userId])
        await releaseConnection(conn)
        return rows
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
email에 따른 사용자 정보 조회
*/
const getUserByEmail = async (email) => {
    const query = "Select * from users where email = ?"
    let conn = null
    try {
        conn = await getConnection();
        const [rows] = await conn.query(query, [email])
        await releaseConnection(conn)
        return rows
    } catch(err){
        //console.error("error:", err)
        // console.log(err.Error)
        
        throw err
    } finally {
        if (conn) {
            await releaseConnection(conn)
        }
    }
}

/* DB에서 email과 password를 바로 비교하지 않고, 
bcrypt로 controller에서 비교하는 로직으로 변경하여 더이상 사용하지 않음. 
*/
/*
const isValidUserByEmail = async (email, password) => {
    const query = "Select email, password from users where email = ?"
    let conn = null
    try {
        conn = await getConnection();
        const [rows] = await conn.execute(query, [email])
        await releaseConnection(conn)
        if (!rows[0]) {
            return {isValid: false, message: '해당 이메일이 존재하지 않습니다'}
        }
        else {
            const isValidPassword = rows[0].password === password
            const validMessage = isValidPassword ? '로그인 성공' : '패스워드가 잘못되었습니다'
            console.log('validMessage:', validMessage)
            return {isValid: isValidPassword, message: validMessage}
        }
        
    } catch(err){
    console.error("error:", err)
    throw err
    } finally {
        if (conn) {
            await releaseConnection(conn)
        }
    }
}
*/

/*
신규 사용자 DB등록 insert 수행
- 만약 insert 시 기존 동일한 email이 있을 경우 email은 unique index 처리되어 있으므로 
  mysql errno 1062 출력. 해당 오류 발생 시 
*/
const createNewUser = async (username, email, password) => {
    const query = "insert into users (username, email, password, created_dt) " + 
                   "values (?, ?, ?, now())"
    let conn = null
    try {
        conn = await getConnection();
        const createdDate = new Date()
        const [rows] = await conn.execute(query, [username, email, password])
        console.log('rows:', rows)
        await releaseConnection(conn)
        
    } catch(err){
    console.error(err)
    if (err.errno === 1062) {
        throw new AlreadyRegisteredError(401, 
            '해당 email로 이미 등록된 사용자가 있습니다', err)
    }
    else {
        throw err
    }
    // throw err
    } finally {
        if (conn) {
            await releaseConnection(conn)
        }
    }
}


module.exports = {
    getAllUsers,
    getUserById,
    // isValidUserByEmail,
    createNewUser,
    getUserByEmail
}


