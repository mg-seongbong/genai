class AlreadyRegisteredError extends Error {
    constructor(statusCode, message, err) {
        super()
        this.statusCode = statusCode
        this.message = message
        this.code = err.code
        this.errno = err.errno
        this.sql = err.sql
        this.sqlMessage = err.sqlMessage
        this.description = `기존 사용자와 동일한 email 주소를 입력하였습니다.
                            다른 email 주소를 입력해 주십시요`
        this.actionTag = `<a class="text-align-center" href="/user/register">회원 등록 </a>`
    }
}

module.exports = {
    AlreadyRegisteredError
}