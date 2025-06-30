let store = "";

let dis = (value) =>{
    let screen = document.querySelector("#display")
    
    if(value=="+" || value=="-" || value=="/" || value=="*" || value=="%" ){
        let val = store.slice(0,-1);
            if(val==value){
                 store = store.slice(0,-1);
            }
            else{
                store = store+value
            }
        
        
    }
    else
    {
         store = store+value
    }
    
    
    screen.innerHTML = store;
}

let res=()=>{
    let screen = document.querySelector("#display")
    store = eval(store).toString();
    screen.innerHTML = store;

}

let del=()=>{
     let screen = document.querySelector("#display")
     store = store.slice(0,-1);
     screen.innerHTML = store;
};
let cler=()=>{
    let screen = document.querySelector("#display")
    store = store.value = '';
    screen.innerHTML = store;
}

