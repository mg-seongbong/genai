
const loginForm = document.getElementById("login-form")
const email = document.getElementById("email")
const password = document.getElementById("password")
const loginBtn = document.getElementById("login-btn")


loginBtn.addEventListener("click", (event)=>{
    event.preventDefault()

    if(email.value === "") {
        alert("이메일 주소를 입력해 주세요")
        return
    }

    if(password.value === "") {
        alert("패스워드를 입력해 주세요")
        return
    }

    loginForm.submit()

})

cancelBtn.addEventListener("click", () =>{
    location.href="/"
})