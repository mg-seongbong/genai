const navButtonEle = document.querySelector('.nav-button')
const galleryListEles = document.querySelectorAll('.gallery-list-item')
const navbarEle = document.querySelector('.nav-menu')
const cameraImg = document.querySelector('.camera-img')
const missionText = document.querySelector('.mission-text')
const card1Ele = document.querySelector('.card-1')
const card2Ele = document.querySelector('.card-2')
const card3Ele = document.querySelector('.card-3')

navButtonEle.addEventListener('click', () => {
    navButtonEle.classList.toggle('change')
})

document.addEventListener('scroll', ()=> {
    let position = document.documentElement.scrollTop;
    if(position >= 200) {
        navbarEle.classList.add('custom-navbar')
    }
    else {
        navbarEle.classList.remove('custom-navbar')        
    }
    if (position >= 650) {
        cameraImg.classList.add('fromLeft')
        missionText.classList.add('fromRight')
    }
    else {
        cameraImg.classList.remove('fromLeft')
        missionText.classList.remove('fromRight')
    }
    if(position >= 4300) {
        card1Ele.classList.add('moveFromLeft')
        card2Ele.classList.add('moveFromBottom')
        card3Ele.classList.add('moveFromRight')

    }
    else {
        card1Ele.classList.remove('moveFromLeft')
        card2Ele.classList.remove('moveFromBottom')
        card3Ele.classList.remove('moveFromRight')
 
    }
})

galleryListEles.forEach((galleryListEle) => {
    galleryListEle.addEventListener('click', ()=> {
        document.querySelector('.active-item').classList.remove('active-item')
        galleryListEle.classList.add('active-item')

        let value = galleryListEle.getAttribute('data-filter')
        if (value === 'all') {
            document.querySelectorAll('.filter').forEach(el => {
                el.style.display = 'block'
            }) 
        } 
        else {
            document.querySelectorAll(`.filter:not(.${value}`).forEach(el => {
                el.style.display = 'none'
            })
            document.querySelectorAll(`.filter.${value}`).forEach(el => {
                el.style.display = 'block'
            })
        }
    })
    
})


































