/**********************************************************************
사용자에 관련된 주요 로직을 다루는 controller
1. 신규 사용자 생성
2. 로그인, 로그아웃 수행(로그인/아웃 관련은 추후에 authController.js 로 변경할 지 고려)
***********************************************************************/

const bcrypt = require('bcrypt')

/* 
db에서 createNewUser로 신규 사용자 생성
getUserByEmail로 사용자가 입력한 email 주소로 기존 사용자 정보 추출
*/
const {
  createNewUser, getUserByEmail
  } = require('../db/userHandler')

const asyncWrapper = require('../middleware/async')

/* 신규 사용자 등록 화면 rendering */
const renderRegister = (req, res) => {
  res.render('register')
}

/* 
신규 사용자 생성/등록
- 사용자가 입력한 사용자명, 이메일, 패스워드를 post 방식으로 입력 받아 DB 저장
- password는 bcrypt로 암호화 하여 저장. 
- DB 저장이 완료 된 후 actionLogin()을 호출하여 자동 로그인 수행
*/
const createNewUserRegister = asyncWrapper(async (req, res) => {
  const {username, email, password} = req.body
  const hashPassword = await bcrypt.hash(password, 12)
  await createNewUser(username, email, hashPassword)
  await actionLogin(req, res)
  // req.flash('success', 'welcome');
  // res.redirect('/');
})

/* 
로그인 화면 rendering 
- 재로그인 여부를 확인하기 위해 로그인 실패시 req session에 loginStatus=Fail 정보를 할당. 
- view에서는 loginStatus가 'Fail'이면 '입력하신 이메일 주소와 패스워드가 일치하지 않습니다' 출력
*/
const renderLogin = (req, res) => {
  //첫번째 로그인 시도시 실패하면 req.session에 loginStatus정보를 가짐. 
  //첫번째 로그인 시도시에는 req.session.loginStatus는 undefined임. 
  const loginStatus = req.session.loginStatus
  res.render('login', {loginStatus})
}

/* 
로그인 화면에서 email과 password를 post로 입력 받아 로그인 수행
- getUserByEmail()로 해당 email을 가진 user가 있는지 먼저 확인
- user가 존재시 패스워드 비교
- 패스워드 일치하면 user_id와 username을 session으로 저장 후 home 페이지로 redirect 하고 welcome flash 메시지 출력
- user가 존재하지 않거나 패스워드가 일치하지 않으면 login 페이지 재로딩 및 loginStatus를 Fail로 session에 설정
*/
const actionLogin = asyncWrapper(async (req, res) => {
  const {email, password} = req.body
  const result = await getUserByEmail(email) //result는 array로 값을 가짐. 
  
  if(result.length > 0) { // 만약 email로 데이터가 존재할 경우
    const validPassword = await bcrypt.compare(password, result[0].password)
    if(validPassword) // email로 데이터가 존재하고 패스워드 일치할 경우
    {
        req.session.userInfo = {userId: result[0].user_id, userName: result[0].username}
        
        req.flash('success', 'welcome back')
        return res.redirect('/')
    } else {
        //이메일 주소와 패스워드가 일치하지 않으면 loginStatus에 Fail 저장. 
        //session에 loginStatus 정보 저장. 재 로그인시 session 정보 확인. 
        req.session.loginStatus = "Fail"
        return res.render('login', {loginStatus: req.session.loginStatus})
    }
  } else { //해당 email이 존재하지 않을 경우
    req.session.loginStatus = "Fail"
    return res.render('login', {loginStatus: req.session.loginStatus})
  }
})

/*
로그 아웃 수행
- session의 모든 정보 삭제 및 home page redirect
*/
const actionLogout = asyncWrapper(async (req, res) => {
  if(req.session.userInfo) {
    await req.session.destroy()
    return res.redirect('/')
  }
})

module.exports = {
  renderRegister,
  createNewUserRegister,
  renderLogin,
  actionLogin,
  actionLogout
}




