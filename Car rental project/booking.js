document.getElementById('bookingForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const carType = document.getElementById('carType').value;
  const pickup = document.getElementById('pickupDate').value;
  const drop = document.getElementById('returnDate').value;

  const confirmation = `
    Thank you, ${name}!<br />
    Your ${carType} has been booked from ${pickup} to ${drop}.<br />
    We will contact you shortly with further details.
  `;

  const confirmationDiv = document.getElementById('confirmation');
  confirmationDiv.innerHTML = confirmation;
  confirmationDiv.style.display = 'block';

  // Optionally reset form
  document.getElementById('bookingForm').reset();
});


