const input = document.getElementById("upload")
const filewrapper = document.getElementById("filewrapper")
const uploadMessage = document.querySelector(".upload-message")
const uploadedImages = document.querySelector(".uploaded-images")

const formData = new FormData();

input.addEventListener("change", (e)=> {
    let fileName = e.target.files[0].name
    let fileType = e.target.value.split(".").pop();
    // console.log(e.target.files[0])
    formData.append('files', e.target.files[0])
    uploadMessage.innerHTML = "학습에 필요한 이미지를 업로드 해주세요"
    fileshow(fileName, fileType)
})

const createLeftElem = (fileName, fileType) => {
    //div left 클래스 노드 생성. 
    const leftElem = document.createElement("div")
    leftElem.classList.add("left")
    // filetype Element를 자식으로 생성. 
    const fileTypeElem = document.createElement("span")
    fileTypeElem.classList.add("filetype")
    fileTypeElem.innerHTML = fileType
    leftElem.append(fileTypeElem)

    //filename element를 자식으로 생성. 
    const filetitleElem = document.createElement("h3")
    filetitleElem.innerHTML = fileName;
    leftElem.append(filetitleElem)
    
    return leftElem
}

const createRightElem = (fileName, fileType) => {
    const rightElem = document.createElement("div");
    rightElem.classList.add("right");
   
    return rightElem
}

const fileshow = (fileName, fileType) => {
    // console.log(fileName, fileType)
    const showfileboxElem = document.createElement("div")
    showfileboxElem.classList.add("showfilebox")
    // 파일 타입을 표시해주는 left element 생성. 
    const leftElem = createLeftElem(fileName, fileType)
    showfileboxElem.append(leftElem);

    //파일명을 표시해주는 right element 생성. 
    const rightElem = createRightElem(fileName, fileType)
    showfileboxElem.append(rightElem)

    // x 표시를 right element에 할당. 
    const crossElem = document.createElement("span");
    crossElem.innerHTML = "&#215;"
    rightElem.append(crossElem)

    filewrapper.append(showfileboxElem)
    
    crossElem.addEventListener("click", () => {
        filewrapper.removeChild(showfileboxElem)
    })
}


const form = document.getElementById("form");

form.addEventListener("submit", submitForm);

async function submitForm(e) {
    e.preventDefault();
    try {
        //기존에 보여준 upload image는 모두 삭제후 upload
        uploadedImages.replaceChildren()

        uploadMessage.innerHTML = "...업로드 중..."
        //아래는 서버 URL로 변경. 
        const response = await fetch("http://34.64.89.81:5000/service/imageUpload", {
            method: 'POST',
            // headers: {
            //     'Content-Type': 'application/x-www-form-urlencoded'
            //   },
            body: formData
        })
        // const response = await fetch("http://localhost:5000/service/imageUpload", {
        //     method: 'POST',
        //     body: formData
        // })
        data = await response.json();
        uploadMessage.innerHTML = "이미지를 업로드 했습니다"
        //upload UI의 첨부 이미지 표시 삭제 및 formData 초기화 
        filewrapper.replaceChildren()
        formData.delete("files")
        console.log(data)
        await showUploadImages(data.contentId)
    } catch(error) {
        console.log(`Upload Error: ${error.message}`)
    }
  }

  const showUploadImages = async (contentId) => {
    try {
        const response = await fetch(`http://34.64.89.81:5000/service/showImages/${contentId}`, {
            method: 'GET'
        })
        // const response = await fetch(`http://localhost:5000/service/showImages/${contentId}`, {
        //     method: 'GET'
        // })
        data = await response.json();
        data.forEach((pathObj) => {
            createImageElements(pathObj) 
        })
    } catch(error) {
        console.log(`fetch Error: ${error.message}`)
    }
  }

  const createImageElements = ( pathObj ) => {
    const temp = document.createElement("div")
    temp.classList.add("m-2")
    // 이미지의 절대경로를 image URL로 변경. 
    const imageURL = pathObj.path.split('/').slice(6).join('/')
    //console.log("imageURL:", imageURL)
    //console.log('imageURL:', imageURL)
    temp.innerHTML = `<img src=/${imageURL} width="300" alt="">`
    uploadedImages.append(temp)
  }