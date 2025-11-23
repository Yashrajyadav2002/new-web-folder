let qr;

document.getElementById("generate").addEventListener("click", function () {
  let text = document.getElementById("text").value;

  if (text.trim() === "") {
    alert("Please enter text or URL");
    return;
  }

  document.getElementById("qrcode").innerHTML = "";

  qr = new QRCode(document.getElementById("qrcode"), {
    text: text,
    width: 250,
    height: 250,
    colorDark: "#000000",
    colorLight: "#ffffff",
  });
});

document.getElementById("download").addEventListener("click", function () {
  let img = document.querySelector("#qrcode img");

  if (!img) {
    alert("Please generate QR first");
    return;
  }

  let link = document.createElement("a");
  link.href = img.src;
  link.download = "qrcode.png";
  link.click();
});
