function updateClock() {
  const clock = document.querySelector("#clock");
  const now = new Date();

  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const ampm = hours >= 12 ? 'PM' : 'AM';

  //  12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // hour 0 should be 12

  // Add leading zeros
  const formattedTime = [
    hours < 10 ? '0' + hours : hours,
    minutes < 10 ? '0' + minutes : minutes,
    seconds < 10 ? '0' + seconds : seconds
  ].join(':') + ' ' + ampm;

  clock.textContent = formattedTime;
}

setInterval(updateClock, 1000);
updateClock();