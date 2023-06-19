const authHandler = (req, res, next) => {
    if(req.session.userInfo) {
        next()
    }
    //반드시 else를 해줘야 함. 그렇지 않으면 res.redirect()로 next()가 같이 사용되어서 아래와 같은 오류 발생 가능.  
    //[ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
    else {
        res.redirect('/')
    }
  }

module.exports = authHandler