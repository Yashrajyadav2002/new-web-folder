function updateClock(){
    const clock = document.querySelector("#clock");
    const now = new Date ();

    let hours = now.getHours();
    let minutes= now.getMinutes();
    let seconds= now.getSeconds();
    let milliseconds= now.getMilliseconds();

    const ampm = hours >= 12 ? 'PM' :'AM';

    hours = hours % 12 ;
    hours = hours ? hours : 12 ;

    const formattedTime =[
        hours <10 ? '0' + hours : hours ,
        minutes < 10 ? '0' + minutes : minutes,
        seconds < 10 ? '0' + seconds : seconds,
        milliseconds < 10 ? '00' + milliseconds : milliseconds <100 ? '0' + milliseconds: milliseconds

    ].join(':') + ' ' +ampm;

    clock.textContent = formattedTime;

}

setInterval(updateClock,1000);
updateClock();