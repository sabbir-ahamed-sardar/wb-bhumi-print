//copyright by https://wbbhumiprint.com
//owner by Mr.gani 
//

// Auto Captcha Loading ---------------------
let captchaInterval = null;

function initCaptchaAutoFill() {
  if (captchaInterval) {
    clearInterval(captchaInterval);
  }
  
  captchaInterval = setInterval(() => {
    try {
      const captchaValue = document.getElementById("captchaText");
      const captchaInput = document.getElementById("drawText1");
      
      if (captchaValue && captchaInput && captchaValue.value) {
        captchaInput.value = captchaValue.value;
      }
    } catch (error) {
      console.error('Captcha auto-fill error:', error);
    }
  }, 1500);
}

// Initialize captcha auto-fill
initCaptchaAutoFill();
// Cache DOM elements for performance
const cachedElements = {
  khdetails: null,
  khdetailsTable: null,
  plotDetails: null
};

// Printing Page Measurement - Optimized
let measurementInterval = null;

function initPageMeasurement() {
  if (measurementInterval) {
    clearInterval(measurementInterval);
  }
  
  measurementInterval = setInterval(() => {
    try {
      // Only query if not cached or elements changed
      if (!cachedElements.khdetails) {
        cachedElements.khdetails = document.querySelector("#khdetails table tbody tr td");
      }
      if (!cachedElements.khdetailsTable) {
        const tables = document.querySelectorAll("#khdetails table");
        cachedElements.khdetailsTable = tables[2];
      }
      if (!cachedElements.plotDetails) {
        const divs = document.querySelectorAll("#plotdetails div");
        cachedElements.plotDetails = divs[3];
      }
      
      if (cachedElements.plotDetails && cachedElements.plotDetails.firstChild) {
        cachedElements.plotDetails.firstChild.classList.remove("tables-fixed");
      }
      if (cachedElements.khdetailsTable && cachedElements.khdetails) {
        cachedElements.khdetails.setAttribute("width", "100%");
        cachedElements.khdetailsTable.classList.remove("table-fixed");
      }
    } catch (error) {
      console.error('Page measurement error:', error);
    }
  }, 3000); // Reduced frequency from 1.5s to 3s
}

// Initialize page measurement
initPageMeasurement();
// Calculate totals for 'অংশ' and 'অংশ পরিমাণ(একর)'
const rows = document.querySelectorAll("#plotdetails table tbody tr");
let totalPortion = 0;
let totalPortionAmount = 0;

rows.forEach(row => {
    if (row.cells[3] && row.cells[4]) {
        const portion = parseFloat(row.cells[3].innerText.trim()) || 0;
        const portionAmount = parseFloat(row.cells[4].innerText.trim()) || 0;
        totalPortion += portion;
        totalPortionAmount += portionAmount;
    }
});

// Listen for messages from the event page - No authentication checks
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkAuthStatus") {
    // Always return authenticated since there's no authentication
    sendResponse({ authenticated: true });
    return true; // Keep the message channel open for async response
  }
});

chrome.runtime.sendMessage({ todo: "ShowSomthing" }, (response) => {
  if (chrome.runtime.lastError) {
    console.log("Extension action message sent:", chrome.runtime.lastError.message);
  } else if (response) {
    console.log("Extension action response:", response.message);
  }
});

// Cleanup function to prevent memory leaks
function cleanup() {
    if (captchaInterval) {
        clearInterval(captchaInterval);
        captchaInterval = null;
    }
    if (measurementInterval) {
        clearInterval(measurementInterval);
        measurementInterval = null;
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);
window.addEventListener('unload', cleanup);