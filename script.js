document.addEventListener("DOMContentLoaded", function () {
  const hamburgerMenu = document.getElementById("hamburger-menu");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const body = document.body;

  const allPages = document.querySelectorAll(".full-page");
  const messCouponPage = document.getElementById("mess-coupon-page");
  const backFromMess = document.getElementById("back-to-dashboard-from-mess");
  const backFromPass = document.getElementById("back-to-dashboard-from-pass");

  const notificationIcon = document.querySelector(".notification-icon");
  const sidebarProfileLink = document.getElementById("sidebar-profile-link");
  const messScannerLink = document.getElementById("mess-scanner-link");
  const messScannerTile = document.getElementById("mess-scanner-tile");
  document
    .querySelectorAll(".page-header .bx-arrow-back, .page-header .bx-x")
    .forEach((btn) => {
      btn.addEventListener("click", hideAllPages);
    });
  document
    .querySelectorAll(
      ".mess-coupon-header .bx-arrow-back, .mess-coupon-header .bx-x"
    )
    .forEach((btn) => btn.addEventListener("click", hideAllPages));

  if (backFromMess) backFromMess.addEventListener("click", hideAllPages);
  if (backFromPass) backFromPass.addEventListener("click", hideAllPages);

  const sidebarSearchInput = document.getElementById("sidebar-search");
  const sidebarMenuItems = document.querySelectorAll(".sidebar-menu a");

  const alertModal = document.getElementById("alert-modal");
  const alertModalMessage = document.getElementById("alert-modal-message");
  const alertModalOkBtn = document.getElementById("alert-modal-ok-btn");

  let countdownInterval;
  let codeReader = null;
  let videoStream = null;

  // Fix video loop lag on mobile browsers by manually looping before the end
  const globalAcceptedVideo = document.getElementById("accepted-video");
  if (globalAcceptedVideo) {
    globalAcceptedVideo.addEventListener("timeupdate", function () {
      if (this.duration && this.currentTime >= this.duration - 0.15) {
        this.currentTime = 0.05; // skip the very first black/frozen frame if any
        this.play();
      }
    });
  }

  // Color picker modal
  const colorPickerModal = document.getElementById("color-picker-modal");
  const colorPickerInput = document.getElementById("accepted-color-picker");
  const colorPickerSaveBtn = document.getElementById("color-picker-save-btn");
  const announcementTile = document.getElementById("announcement-tile");

  if (announcementTile) {
    announcementTile.addEventListener("click", (e) => {
      e.preventDefault();
      // Load saved color into picker
      const savedColor = localStorage.getItem("acceptedBorderColor") || "#4ade80";
      if (colorPickerInput) colorPickerInput.value = savedColor;
      colorPickerModal.classList.remove("hidden");
    });
  }

  if (colorPickerSaveBtn) {
    colorPickerSaveBtn.addEventListener("click", () => {
      if (colorPickerInput) {
        localStorage.setItem("acceptedBorderColor", colorPickerInput.value);
        // Apply to accepted section if currently visible
        const acceptedSection = document.getElementById("mpass-accepted-section");
        if (acceptedSection) acceptedSection.style.backgroundColor = colorPickerInput.value;
      }
      colorPickerModal.classList.add("hidden");
    });
  }

  // Close color picker modal on backdrop click
  if (colorPickerModal) {
    colorPickerModal.addEventListener("click", (e) => {
      if (e.target === colorPickerModal) colorPickerModal.classList.add("hidden");
    });
  }

  hamburgerMenu.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("active");
    body.classList.toggle("sidebar-open");
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
    body.classList.remove("sidebar-open");
  });

  sidebarSearchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    sidebarMenuItems.forEach((item) => {
      const itemText = item.textContent.toLowerCase();
      if (itemText.includes(searchTerm)) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  });

  function showCustomAlert(message) {
    alertModalMessage.textContent = message;
    alertModal.classList.remove("hidden");
  }

  function hideCustomAlert() {
    alertModal.classList.add("hidden");
  }

  alertModalOkBtn.addEventListener("click", hideCustomAlert);
  alertModal.addEventListener("click", (e) => {
    if (e.target === alertModal) {
      hideCustomAlert();
    }
  });

  function showPage(pageToShow) {
    if (sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
      overlay.classList.remove("active");
      body.classList.remove("sidebar-open");
    }
    allPages.forEach((p) => p.classList.add("hidden"));
    document.querySelector(".main-header").classList.add("hidden");
    document.querySelector(".main-content").classList.add("hidden");
    document.querySelector(".bottom-nav").classList.add("hidden");

    pageToShow.classList.remove("hidden");
  }

  function hideAllPages() {
    stopCamera();
    clearInterval(countdownInterval);

    const acceptedVideo = document.getElementById("accepted-video");
    if (acceptedVideo) {
      acceptedVideo.pause();
      acceptedVideo.currentTime = 0;
    }

    allPages.forEach((p) => p.classList.add("hidden"));
    document.querySelector(".main-header").classList.remove("hidden");
    document.querySelector(".main-content").classList.remove("hidden");
    document.querySelector(".bottom-nav").classList.remove("hidden");
  }

  notificationIcon.addEventListener("click", () =>
    showPage(document.getElementById("messages-page"))
  );
  sidebarProfileLink.addEventListener("click", () =>
    showPage(document.getElementById("profile-page"))
  );

  async function requestCameraPermission() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("mediaDevices API not supported. Are you on HTTPS?");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      // Permission granted — stop the stream immediately (ZXing will open its own)
      stream.getTracks().forEach((t) => t.stop());
      return true;
    } catch (err) {
      const msg =
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera permission was denied. Please allow camera access in your browser settings and try again."
          : `Camera Error: ${err.name || "Unknown"} - ${err.message || err}`;
      showCustomAlert(msg);
      return false;
    }
  }

  async function handleMessScannerClick(e) {
    e.preventDefault();
    const granted = await requestCameraPermission();
    if (granted) showPage(messCouponPage);
  }

  messScannerLink.addEventListener("click", handleMessScannerClick);
  messScannerTile.addEventListener("click", handleMessScannerClick);

  function stopCamera() {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      videoStream = null;
    }
    codeReader = null;
  }

  const cancelScanBtn = document.getElementById("cancel-scan");
  if (cancelScanBtn) cancelScanBtn.addEventListener("click", hideAllPages);

  const backFromMessBtn = document.getElementById("back-to-dashboard-from-mess");
  if (backFromMessBtn) backFromMessBtn.addEventListener("click", hideAllPages);

  const backFromPassBtn = document.getElementById("back-to-dashboard-from-pass");
  if (backFromPassBtn) backFromPassBtn.addEventListener("click", hideAllPages);

  document.querySelectorAll(".meal-button").forEach((button) => {
    button.addEventListener("click", () => {
      // Unlock the accepted-video element for iOS/Android by playing it in a direct user gesture
      const acceptedVideo = document.getElementById("accepted-video");
      if (acceptedVideo) {
        acceptedVideo.muted = true;
        const playPromise = acceptedVideo.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            acceptedVideo.pause();
          }).catch(error => {
            console.log("Video unlock failed (expected on some browsers):", error);
          });
        }
      }

      const mealType = button.querySelector("span").textContent;
      startScanFlow(mealType);
    });
  });

  function startScanFlow(mealType) {
    showPage(document.getElementById("camera-scanner-page"));
    codeReader = new ZXingBrowser.BrowserMultiFormatReader();

    codeReader
      .decodeOnceFromVideoDevice(undefined, "video-stream")
      .then((result) => {
        if (result) {
          // Capture the active stream from the video element
          const videoEl = document.getElementById("video-stream");
          if (videoEl && videoEl.srcObject) {
            videoStream = videoEl.srcObject;
          }
          console.log("Barcode detected:", result.getText());
          showLoadingAnimation(mealType);
        }
      })
      .catch((err) => {
        console.error("Camera or Scan Error:", err);
        if (err && err.name !== "NotFoundException") {
          const msg =
            err.name === "NotAllowedError"
              ? "Camera permission denied. Please allow camera access and try again."
              : "Could not start camera. Please check permissions and try again.";
          showCustomAlert(msg);
          hideAllPages();
        }
      });
  }

  function showLoadingAnimation(mealType) {
    stopCamera();
    document.getElementById("camera-scanner-page").classList.add("hidden");
    messCouponPage.classList.remove("hidden");
    messCouponPage.classList.add("content-blurred");
    document.getElementById("loading-page").classList.remove("hidden");

    setTimeout(() => {
      document.getElementById("loading-page").classList.add("hidden");
      messCouponPage.classList.remove("content-blurred");
      messCouponPage.classList.add("hidden");
      populateAndShowMessPass(mealType);
    }, 1000);
  }

  function populateAndShowMessPass(mealType) {
    document.getElementById("pass-meal-type").textContent = mealType;
    const now = new Date();
    const dateOptions = { month: "short", day: "2-digit", year: "numeric" };
    document.getElementById("pass-date").textContent = now
      .toLocaleString("en-US", dateOptions);
    const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true };
    document.getElementById("pass-time").textContent = now.toLocaleTimeString(
      "en-US",
      timeOptions
    );

    showPage(document.getElementById("mess-pass-page"));

    // Apply saved border color
    const savedColor = localStorage.getItem("acceptedBorderColor") || "#4ade80";
    const acceptedSection = document.getElementById("mpass-accepted-section");
    const colorPicker = document.getElementById("accepted-color-picker");
    if (acceptedSection) acceptedSection.style.backgroundColor = savedColor;
    if (colorPicker) colorPicker.value = savedColor;

    // Play video – will be stopped when countdown hits 0
    const acceptedVideo = document.getElementById("accepted-video");
    if (acceptedVideo) {
      acceptedVideo.loop = true;
      acceptedVideo.muted = true;
      acceptedVideo.currentTime = 0;
      acceptedVideo.play().catch((error) => {
        console.warn("Video Autoplay Failed:", error);
      });
    }

    startCountdown();
  }

  function startCountdown() {
    clearInterval(countdownInterval);
    let seconds = 25;
    const countdownElement = document.getElementById("pass-countdown");
    countdownElement.textContent = seconds;
    countdownInterval = setInterval(() => {
      seconds--;
      countdownElement.textContent = seconds;
      if (seconds <= 0) {
        clearInterval(countdownInterval);
        countdownElement.textContent = "0";
        // Stop the video when timer runs out
        const acceptedVideo = document.getElementById("accepted-video");
        if (acceptedVideo) {
          acceptedVideo.loop = false;
          acceptedVideo.pause();
          acceptedVideo.currentTime = 0;
        }
        // Redirect to the mess coupon (scanner) page
        showPage(messCouponPage);
      }
    }, 1000);
  }




  (function tilesGridScrollElevate() {
    const tilesGrid = document.querySelector(".tiles-grid");
    if (!tilesGrid) return;
    let ticking = false;

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const rect = tilesGrid.getBoundingClientRect();
          const threshold = 20;
          if (
            rect.top < window.innerHeight &&
            rect.bottom > 0 &&
            window.scrollY > threshold
          ) {
            tilesGrid.classList.add("tiles-elevated");
          } else {
            tilesGrid.classList.remove("tiles-elevated");
          }
          ticking = false;
        });
      },
      { passive: true }
    );
  })();

  // Unregister Service Worker and clear caches to fix live reload issues
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }

  if ('caches' in window) {
    caches.keys().then((names) => {
      for (const name of names) {
        caches.delete(name);
      }
    });
  }
});
