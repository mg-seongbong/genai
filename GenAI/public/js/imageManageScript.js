const contentSelect = document.getElementById("content-selector")
//아직 generated image가 만들어지지 않아 upload image로 대체함. 
const uploadedImages = document.querySelector(".uploaded-images")

//console.log(contentSelect)

contentSelect.addEventListener("change", (e) => {
    //이미지를 보여주기 전에 이전 이미지는 모두 삭제.
    uploadedImages.replaceChildren()
    const selectedId = contentSelect.options[contentSelect.selectedIndex].value
    //console.log('selectedId:', selectedId)
    showUploadImages(selectedId)
})


const showUploadImages = async (contentId) => {
    try {
        const response = await fetch(`http://34.64.89.81:5000/service/showGenImages/${contentId}`, {
            method: 'GET'
        })
        data = await response.json();
        //image-box div 생성하고 자식으로 image-select와 img 생성. 
        data.forEach((pathObj) => {
            createImageElements(pathObj) 
        })
        //생성된 image-box 들에 click event listener 설정하여 click 시 active로 class변경. 
        const imgSelectList = document.querySelectorAll('.image-box');
        doActiveToggle(imgSelectList)

    } catch(error) {
        console.log(`fetch Error: ${error.message}`)
    }
}

const createImageElements = ( pathObj ) => {
const temp = document.createElement("div")
temp.classList.add("m-2")
temp.classList.add("image-box")
// 저장 이미지 파일 절대경로를 image URL로 변경. 
const imageURL = pathObj.path.split('/').slice(6).join('/')
console.log('imageURL:', imageURL)
temp.innerHTML = `<div class="image-select">
                        <i class="fa-solid fa-bookmark fa-2x"></i>
                    </div>
                    <img src=/${imageURL} width="300" alt="">`
uploadedImages.append(temp)
}

//image-box div들에 active 클래스 설정. 
function doActiveToggle(componentList) {
    componentList.forEach(component => {
        component.addEventListener('click', ()=> {
            component.classList.toggle('active')
            //console.log(component.classList)
        })
    });
}
