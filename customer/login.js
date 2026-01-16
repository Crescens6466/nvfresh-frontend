let otpSent = false;
let timer;
let timeLeft = 30;

/* =========================
   SEND OTP
========================= */
async function sendOTP() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!name) {
    alert("Please enter your name");
    return;
  }

  if (!/^[6-9]\d{9}$/.test(phone)) {
    alert("Enter valid 10-digit mobile number");
    return;
  }

  const res = await fetch("/api/customer/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone })
  });

  if (!res.ok) {
    alert("Failed to send OTP");
    return;
  }

  // ✅ SINGLE SOURCE OF TRUTH
  otpSent = true;
  document.getElementById("otpSection").style.display = "block";
  document.getElementById("otp").focus();

  startOTPTimer();
}

/* =========================
   VERIFY OTP
========================= */
async function verifyOTP() {
  const otp = document.getElementById("otp").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const name = document.getElementById("name").value.trim();

  if (otp.length !== 4) {
    alert("Enter valid 4-digit OTP");
    return;
  }

  const res = await fetch("/api/customer/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ phone, otp, name })
  });

  if (!res.ok) {
    alert("Invalid OTP");
    return;
  }

  const redirect = localStorage.getItem("redirectAfterLogin");
  localStorage.removeItem("redirectAfterLogin");

  window.location.href = redirect || "index.html";
}

/* =========================
   OTP TIMER
========================= */
function startOTPTimer() {
  clearInterval(timer);
  timeLeft = 30;

  const resend = document.getElementById("resendText");
  resend.classList.add("disabled");
  resend.innerText = `Resend OTP in ${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    resend.innerText = `Resend OTP in ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      resend.innerText = "Resend OTP";
      resend.classList.remove("disabled");
    }
  }, 1000);
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("loginForm");
  const resend = document.getElementById("resendText");

  /* RESEND OTP */
  resend.addEventListener("click", () => {
    if (!resend.classList.contains("disabled")) {
      sendOTP();
    }
  });

  /* FORM SUBMIT → ENTER + CLICK */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    otpSent ? verifyOTP() : sendOTP();
  });

});
