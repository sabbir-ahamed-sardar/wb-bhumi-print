# WB Bhumi Receipt 📄🌾

[![Version](https://img.shields.io/badge/version-1.1.4-blue.svg)](manifest.json)
[![Manifest](https://img.shields.io/badge/manifest-v3-green.svg)](manifest.json)
[![Platform](https://img.shields.io/badge/platform-Google%20Chrome%20%7C%20Edge%20%7C%20Brave-orange.svg)](#)
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)](LICENSE)

**WB Bhumi Receipt** is a fast, powerful, and lightweight browser extension designed for West Bengal citizens, CSC/Tathya Mitra Kendra operators, and land revenue professionals. It enables one-click, perfectly formatted printing of **Khatian (খতিয়ান)** and **Plot / Daag (দাগ)** records directly from the official **Banglarbhumi** portal ([banglarbhumi.gov.in](https://banglarbhumi.gov.in)).

---

## 🌟 Key Features

- 📑 **Instant Khatian Print (খতিয়ান প্রিন্ট)**:
  - Generates clean, printer-friendly A4 receipts of Khatian details with a single click.
  - Automatically parses District, Block, and Mouza details from dropdown selections and page context.
  
- 🗺️ **Instant Plot Details Print (দাগ প্রিন্ট)**:
  - Formats plot information into a clean document structure.
  - Automatically calculates and sums up total portions (**মোট অংশ**) and total area (**মোট পরিমাণ / একর**).

- ⚡ **Auto-Captcha Assistant**:
  - Automatically synchronizes generated captcha codes to the verification input field (`#captchaText` ➔ `#drawText1`), eliminating manual typing delays.

- 🖨️ **Print Layout Optimization & Border Management**:
  - Fixes default table styling issues, removes clunky fixed-overflow limitations (`tables-fixed`), and ensures tables scale cleanly to 100% width on paper/PDF.
  - Optimizes margins and page breaks for standard portrait/landscape printing.

- 🎨 **Modern Glassmorphism UI**:
  - Interactive popup featuring live update ticker, user status, instant print triggers, notices, and quick links.

- 🔒 **Manifest V3 Compliant & Secure**:
  - Built on Google Chrome's Manifest V3 architecture with background service workers and least-privilege scoped permissions.
  - Input sanitization and client-side protection against XSS vulnerabilities.

---

## 📸 Overview & Interface

| Feature | Description |
| :--- | :--- |
| **Khatian Details** | Extracts and prints owner information, share, mutation status, and rayat details. |
| **Plot Information** | Formats co-sharer details, land classification, share ratios, and computes acre totals. |
| **Portal Support** | Seamless integration with both HTTP and HTTPS Banglarbhumi endpoints. |

---

## 📂 Project Structure

```text
├── api-config.js          # Secure configuration, rate limiter, and input sanitizer
├── congrats-animation.js  # Visual celebration / confirmation effects
├── popup.html             # Extension action popup interface
├── popup-animation.css    # Animations and visual transitions
├── manifest.json          # Chrome Extension Manifest V3 configuration
├── package.json           # Node.js project metadata and test scripts
├── content/
│   └── content.js         # Content script: auto-captcha loading and DOM observer
├── eventPage/
│   └── eventPage.js       # Background service worker and lifecycle manager
├── main/
│   └── mainone.js         # Core print formatting engine & table manipulator
├── popup/
│   └── popup.js           # Popup logic, action buttons, and modal controllers
├── js/
│   └── slider.js          # Carousel and slider UI components
├── css/
│   └── header.css         # Header styling and layout rules
└── icons/
    ├── icon16.png         # Extension toolbar icon (16x16)
    ├── icon32.png         # Extension icon (32x32)
    ├── icon48.png         # Chrome management icon (48x48)
    └── icon.png           # Detail icon (128x128)
```

---

## 🚀 Installation Guide

### Load Unpacked (Developer Mode)

1. Clone or download this repository to your local machine:
   ```bash
   git clone https://github.com/sabbir-ahamed-sardar/wb-bhumi-print.git
   ```
2. Open Google Chrome (or any Chromium-based browser like Brave, Edge, Opera).
3. Navigate to `chrome://extensions/` in the address bar.
4. Enable **Developer mode** using the toggle in the top-right corner.
5. Click the **Load unpacked** button in the top-left corner.
6. Select the folder containing `manifest.json`.
7. The **WB Bhumi Receipt** icon will now appear in your browser toolbar!

---

## 📖 How to Use

1. **Visit Banglarbhumi**:
   - Go to [banglarbhumi.gov.in](https://banglarbhumi.gov.in) and log in to your account.
2. **Search Records**:
   - Navigate to **Know Your Property** (আপনার সম্পত্তি জানুন).
   - Select your **District**, **Block**, and **Mouza**.
   - Search by **Khatian No.** or **Plot No.**.
3. **Print Record**:
   - Click the **WB Bhumi Receipt** icon in your browser toolbar.
   - Click **Khatian Print** (for Khatian details) or **Plot Print** (for Plot details).
   - The extension will automatically format the data, compute totals, and open your browser's Print Dialog.
   - Select **Save as PDF** or send directly to your connected printer.

---

## 🔐 Permissions & Privacy

This extension requests minimal permissions required for its functionality:

| Permission | Purpose |
| :--- | :--- |
| `activeTab` | Accesses the currently active tab when you click the extension popup to read land record tables. |
| `scripting` | Dynamically injects the print formatting logic into the active Banglarbhumi tab. |
| `notifications` | Displays status updates and notifications regarding extension features. |
| `host_permissions` | Scoped strictly to `banglarbhumi.gov.in`. |

> **Privacy Guarantee**: All record parsing and print formatting take place locally inside your browser. No personal property data or land records are collected or shared.

---

## 🛠️ Development & Testing

### Prerequisites
- Node.js (v16.0 or higher recommended)
- Chromium browser (Chrome / Brave / Edge)

### Running Tests
To run unit tests:
```bash
npm test
```

For test coverage reports:
```bash
npm run test:coverage
```

---

## 📝 Release Notes

### Version 1.1.4 (Latest Release)
- ✨ **Auto Captcha Sync**: Real-time auto-filling of captcha verification code on the Banglarbhumi portal.
- ⚡ **Enhanced Print Engine**: Faster execution and cleaner table border rendering.
- 📊 **Dynamic Plot Totals**: Automatic summation of share portions and acre measurements.
- 🎨 **Modernized UI**: Enhanced popup interface with responsive notifications and live news ticker.
- 🛡️ **Manifest V3 Stabilization**: Fully optimized background worker lifecycle and memory management.

---

## 🤝 Support & Feedback

If you encounter any issues or have feature suggestions:
- **Issues**: Submit an issue via the [GitHub Issues](https://github.com/sabbir-ahamed-sardar/wb-bhumi-print/issues) tab.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
