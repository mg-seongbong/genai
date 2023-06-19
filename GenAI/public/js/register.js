const termsAgree = document.getElementById("terms-agree")
const privateAgree = document.getElementById("private-agree")
const registerForm = document.getElementById("register-form")
const username = document.getElementById("username")
const email = document.getElementById("email")
const password = document.getElementById("password")
const joinBtn = document.getElementById("join-btn")
const cancelBtn = document.getElementById("cancel-btn")


joinBtn.addEventListener("click", (event)=>{
    event.preventDefault()
    if(!termsAgree.checked || !privateAgree.checked) {
        alert("회원 가입 약관 및 개인정보 처리 내용에 동의하셔야 회원 가입 하실 수 있습니다")
        return
    }

    if(username.value === "") {
        alert("사용자명을 입력해 주세요")
        return
    }
    
    if(email.value === "") {
        alert("이메일 주소를 입력해 주세요")
        return
    }

    if(password.value === "") {
        alert("패스워드를 입력해 주세요")
        return
    }

    registerForm.submit()

})

cancelBtn.addEventListener("click", () =>{
    location.href="/"
})