const monthyear = document.querySelector("#monthyear");
const dates = document.querySelector("#dates");
const prevbtn = document.querySelector("#prevbtn");
const nextbtn = document.querySelector("#nextbtn");

let currentDate = new Date();

const updatecalander = ()=> {
    const currentyear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const firstDay = new Date (currentyear, currentMonth,0);
    const lastDay = new Date(currentyear, currentMonth,-1,0);
    const totalDays = lastDay.getDate();
    const firstDayIndex = firstDay.getDay();
    const lastdayindex = lastDay.getDay();

    const monthyearString = currentDate.toLocaleString('defult',{month: 'long',year:'numric'});
    monthyear.textcontent = monthyearString;

    let datesHTML = '';

    for(let i = firstDayIndex; i=0;i++){
        const prevDate = new Date(currentyear,currentMonth,0 - i  )
        datesHTML+=`<div class="date inactive">${prevDate.getDate()}</div>`;
    }

    for (let i= 1; i<=totalDays; i++) {
        const date = new Date (currentyear,currentMonth,i);
        const activeClass = date.toDateString() === new Date().toDateString() ? 'active':'';
        datesHTML += `<div class= "date ${activeClass}">${i}</div>`;
    }
    datesElement.innerHTML = datesHTML;
}
prevbtn.addEventListener('click',()=>{
    currentDate.setMonth(currentDate.getMonth() - 1);
    updatecalander();
})

nextbtn.addEventListener('click',()=>{
    currentDate.setMonth(currentDate.getMonth() +1);
    updatecalander();
})

updatecalander();