const express = require('express');
const app = express();
//ejs 및 method override 
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override')
//session과 flash
const session = require('express-session');
const flash = require('connect-flash');
//bcrypt와 passport
const bcrypt = require('bcrypt')
const passport = require('passport')

//utility 용도
const path = require('path');
const cors = require('cors')
const multer = require('multer')
const fs = require('fs')
//router
const userRouter = require('./routes/userRouter')
const serviceRouter = require('./routes/serviceRouter')

//Data Handler 추후 삭제
const userHandler = require('./db/userHandler')

//custom 미들웨어 
const notFound = require('./middleware/not-found');
require('dotenv').config();


//ejs setting
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

/* 미들웨어 설정 */
//post method의 request 전달을 위한 urlencoding 적용. 
app.use(express.urlencoded({extended:true}))
//method override for put/delete/patch
app.use(methodOverride('_method'));
//static 디렉토리 적용
app.use(express.static(path.join(__dirname,'public')));
//cors 접근제약 해소 
app.use(cors());

//session 적용. 
const sessionConfig = {
  secret: "thishouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
app.use(session(sessionConfig));
//flash 적용
app.use(flash());



// routes 설정. 
app.use('/user', userRouter)
app.use('/service', serviceRouter)

// route home
app.get('/', (req, res) => {
  res.render('home', {sessUserInfo: req.session.userInfo});
});

// not found 미들웨어 설정. 
app.use(notFound);

// Error Handler 설정
app.use((err, req, res, next) => {
  const {statusCode=500} = err
  if(!err.message) {
    err.message = "내부 오류가 발생했습니다."
    err.description = "잠시만 기다려 주십시요"
    err.actionTag = ""
  }
  res.status(statusCode).render('error', {err})
})

const port = process.env.PORT || 5000;


const start = async () => {
  try {
    
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
