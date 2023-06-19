const express = require('express');
const app = express();
//ejs 및 method override 
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override')
//session과 flash
const session = require('express-session');
const flash = require('connect-flash');
//utility 용도
const path = require('path');
const cors = require('cors')
const multer = require('multer')
const fs = require('fs')
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


const makeFolder = (dir) => {
  if(!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true}, err => {console.log(err)})
  }
}
// routes 설정. 
const { isValidUserByEmail, createNewUser, getUserByEmail } = require('./db/userHandler')
const { insertUploadFiles, getUploadFilesById, getUploadListByUser,
        getGenImagesByContentId } = require('./db/serviceHandler')
// route home home
app.get('/', (req, res) => {
  res.render('home', {sessUserInfo: req.session.userInfo});
});

app.get('/register', (req, res) => {
  res.render('register')
})

app.post('/register', async (req, res) => {
  const {username, email, password} = req.body
  await createNewUser(username, email, password)
  req.flash('success', 'welcome');
  res.redirect('/');

})

app.get('/login', (req, res)=> {
  res.render('login')
})

app.post('/login', async (req, res) => {

  const {email, password} = req.body
  const result = await getUserByEmail(email)
  // console.log(result[0], result[0].password)
  if(password === result[0].password) 
  {
    console.log('login success')
    req.session.userInfo = {userId: result[0].user_id, userName: result[0].username}
    
    req.flash('success', 'welcome back');
    return res.redirect('/');
  } else {
    return res.redirect('/login')
  }
  
})

// app.post('/login', async (req, res) => {

//   const {email, password} = req.body
//   const result = await isValidUserByEmail(email, password)

//   req.flash('success', 'welcome back');
//   res.redirect('/');

// })


app.get('/imageUpload', async (req, res) => {
  res.render('imageUpload', {sessUserInfo: req.session.userInfo})
})

const upload = multer({
  storage: multer.diskStorage({
    // set a localstorage destination
    //   어떤이름으로 저장할지가 들어있다.

    //위치 지정
    destination: (req, file, done) => {
      console.log(req.session.userInfo)
      const uploadDir = path.join(__dirname,`public/uploads/${req.session.userInfo.userId}/${Date.now()}/`)
      makeFolder(uploadDir)
      done(null, uploadDir);
    },
    //지정
    // convert a file name
    filename: (req, file, done) => {
      console.log(req.session.userInfo)
      const ext = path.extname(file.originalname);
      done(null, path.basename(file.originalname, ext) + Date.now() + ext);
      // cb(null, new Date().valueOf() + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.post("/imageUpload", upload.array("files"), async (req, res) => {
  
  const contentId = await insertUploadFiles(req.session.userInfo.userId, req.files)
  res.status(201).send({uploadMessage: "성공적으로 업로드 하였습니다", uploadCode: 201, contentId: contentId})
});

app.get("/showImages/:id",async (req, res) => {
  const contentId = req.params.id;
  const results = await getUploadFilesById(contentId)
  console.log(results)
  res.status(200).json(results)
});

app.get('/imageManage', async (req, res) => {
  const userId = req.session.userInfo.userId
  console.log("userId:", userId)
  const results = await getUploadListByUser(userId)
  console.log('results:', results)
  res.render('imageManage', {sessUserInfo: req.session.userInfo, 
                            imageList: results})
})

app.get("/showGenImages/:id",async (req, res) => {
  const contentId = req.params.id;
  const results = await getGenImagesByContentId(contentId)
  console.log('result from show gen:', results)
  res.status(200).json(results)
});

// not found 미들웨어 설정. 
app.use(notFound);
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
