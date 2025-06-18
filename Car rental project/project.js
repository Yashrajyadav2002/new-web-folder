
let signuppage=()=>{
    let name = document.querySelector("#name").value.trim();
    let email = document.querySelector("#email").value.trim();
    let num = document.querySelector("#number").value.trim();
    let pass = document.querySelector("#pass").value.trim();
    let copass = document.querySelector("#copass").value.trim();


    let errorname = document.querySelector("#errorname");
    let erroremail = document.querySelector("#erroremail");
    let errornumber = document.querySelector("#errornumber");
    let errorpass = document.querySelector("#errorpass");
    let errorcopass = document.querySelector("#errorcopass");

    if(name==""){
        errorname.innerHTML="plese enter your Name here";
        document.querySelector("#name").focus()
        errorname.style.color="white";
        return false;
    }

    else if(email==""){
        erroremail.innerHTML = "please enter your email here"
        document.querySelector("#email").focus()
        erroremail.style.color = "white"
        return false;
    }
    
    else if(!(email.includes("@") && email.includes(".com"))){
          erroremail.innerHTML="please enter a valid email"
          document.querySelector("#email").focus()
          erroremail.style.color="white"
        return false;
    }
    else if (num==""){
        errornumber.innerHTML = "please enter your number here"
        document.querySelector("#num").focus()
        errornumber.style.color = "white"
        return false;
    }

    else if(num.length!==10){
        errornumber.innerHTML="Plese enter 10 digits numbers";
        document.querySelector("#num").focus()
        errornumber.style.color="white";
        return false;
    }

    else if(isNaN(num)){
        errornumber.innerHTML="please enter number only";
        document.querySelector("#num").focus()
        errornumber.stye.color="white";
        return false;
    }

    else if (pass==""){
        errorpass.innerHTML = "please enter your password here"
        document.querySelector("#pass").focus()
        errorpass.style.color = "white"
        return false ;
    }
    

    else if (pass!=copass){
        errorcopass.innerHTML="please enter same password"
        document.querySelector("#copass").value="";
        errorcopass.style.color = "white"
        return false;
    }

    else if (! (pass.match(/[1234567890]/)) &&
            pass.match(/[!@#$%^&*()_]/) &&
            pass.match(/[a-z]/) &&
            pass.match(/[A-Z]/)
)
{
    errorpass.innerHTML="Plase enter the strog password"
    return false;
}


localStorage.setItem("name",name)
localStorage.setItem("email",email)
localStorage.setItem("num",num)
localStorage.setItem("pass",pass)

location.href='login.html'

return false;

};

let Login=()=>{
    let inptname = document.querySelector("#loginname").value
    let inptpass = document.querySelector("#loginpass").value

    location.href='homepage.html'
    return false;

};

