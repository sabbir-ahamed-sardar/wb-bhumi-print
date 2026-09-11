
document.addEventListener("DOMContentLoaded",
  function () {
    const mainContent = document.getElementById("mainContent");
    const printTableButton = document.getElementById("printTableButton");
    const printPlotButton = document.getElementById("printPlotButton");
    const subscriptionMessage = document.getElementById("subscriptionMessage");

    function safeSetDisplay(element, displayValue) {
      if (element && element.style) {
        element.style.display = displayValue;
      }
    }

    safeSetDisplay(mainContent, "block");
    safeSetDisplay(subscriptionMessage, "none");

    // Function to save login details to local storage
    // Function to auto-login if details are saved in local storage
    async function autoLogin() {
      // Authentication is removed, do nothing
    }

    // Call autoLogin on page load
    autoLogin();

    //  print Khatian Information
    function printTable() {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: () => {
            const TableToPrint = document.getElementById("khdetails");
            // Extract district, block, and mouza values from the page
            let districtText = 'N/A';
            let blockText = 'N/A';
            let mouzaText = 'N/A';

            try {
              // Helper function to get selected text from dropdown
              function getSelectedText(selectId) {
                const select = document.getElementById(selectId);
                if (select && select.selectedIndex >= 0 && select.options[select.selectedIndex]) {
                  return select.options[select.selectedIndex].text.trim();
                }
                return null;
              }

              // Helper function to get input value
              function getInputValue(inputId) {
                const input = document.getElementById(inputId);
                if (input && input.value) {
                  return input.value.trim();
                }
                return null;
              }

              // Try common district dropdown IDs
              const districtIds = ['lstDistrictCode1', 'lstDistrictCode11', 'districtname'];
              for (const id of districtIds) {
                const value = getSelectedText(id) || getInputValue(id);
                if (value && value !== 'Select District' && value !== 'N/A') {
                  districtText = value;
                  break;
                }
              }

              // Try common block dropdown IDs
              const blockIds = ['lstBlockCode1', 'blockname'];
              for (const id of blockIds) {
                const value = getSelectedText(id) || getInputValue(id);
                if (value && value !== 'Select Block' && value !== 'N/A') {
                  blockText = value;
                  break;
                }
              }

              // Try common mouza dropdown IDs
              const mouzaIds = ['lstMouzaCode', 'lstMouzaList', 'mauzaname'];
              for (const id of mouzaIds) {
                const value = getSelectedText(id) || getInputValue(id);
                if (value && value !== 'Select Mouza' && value !== 'N/A') {
                  mouzaText = value;
                  break;
                }
              }

              // If still not found, try to extract from Chrome storage (extension data)
              if (districtText === 'N/A' || blockText === 'N/A' || mouzaText === 'N/A') {
                // Try to get from extension storage if available
                if (typeof chrome !== 'undefined' && chrome.storage) {
                  chrome.storage.sync.get(['districtName', 'blockName', 'mouzaName'], (data) => {
                    if (data.districtName && districtText === 'N/A') districtText = data.districtName;
                    if (data.blockName && blockText === 'N/A') blockText = data.blockName;
                    if (data.mouzaName && mouzaText === 'N/A') mouzaText = data.mouzaName;
                  });
                }
              }

              console.log('Final extracted values:', {
                district: districtText.replace(/\n/g, '\\n').replace(/\r/g, '\\r'),
                block: blockText.replace(/\n/g, '\\n').replace(/\r/g, '\\r'),
                mouza: mouzaText.replace(/\n/g, '\\n').replace(/\r/g, '\\r')
              });

            } catch (error) {
              console.error('Error extracting location data:', error);
            }

            if (TableToPrint) {
              // Clean up unwanted spans and elements
              function cleanTableContent(tableElement) {
                if (!tableElement) return tableElement;
                
                // Clone the table to avoid modifying the original
                const cleanedTable = tableElement.cloneNode(true);
                
                // Remove unwanted spans and empty elements
                const unwantedSelectors = [
                  'span[style*="display: none"]',
                  'span[style*="visibility: hidden"]',
                  'span:empty',
                  'div:empty',
                  'td:empty',
                  'th:empty',
                  'span[class*="hidden"]',
                  'span[class*="invisible"]'
                ];
                
                unwantedSelectors.forEach(selector => {
                  const elements = cleanedTable.querySelectorAll(selector);
                  elements.forEach(el => {
                    if (el.parentNode) {
                      el.parentNode.removeChild(el);
                    }
                  });
                });
                
                // Clean up text content in cells
                const cells = cleanedTable.querySelectorAll('td, th');
                cells.forEach(cell => {
                  // Remove empty spans
                  const emptySpans = cell.querySelectorAll('span:empty');
                  emptySpans.forEach(span => {
                    if (span.parentNode) {
                      span.parentNode.removeChild(span);
                    }
                  });
                  
                  // Clean up text content and force center alignment
                  cell.innerHTML = cell.innerHTML
                    .replace(/<span[^>]*><\/span>/g, '') // Remove empty spans
                    .replace(/<span[^>]*style="[^"]*display:\s*none[^"]*"[^>]*>.*?<\/span>/g, '') // Remove hidden spans
                    .replace(/<span[^>]*style="[^"]*visibility:\s*hidden[^"]*"[^>]*>.*?<\/span>/g, '') // Remove invisible spans
                    .replace(/\s+/g, ' ') // Clean up multiple spaces
                    .trim();
                  
                  // Force center alignment and bold font with inline styles
                  cell.style.textAlign = 'center';
                  cell.style.fontWeight = 'bold';
                });
                
                // Also force center alignment and bold font on all spans and divs inside the table
                const allElements = cleanedTable.querySelectorAll('*');
                allElements.forEach(el => {
                  if (el.tagName === 'SPAN' || el.tagName === 'DIV' || el.tagName === 'P') {
                    el.style.textAlign = 'center';
                    el.style.fontWeight = 'bold';
                  }
                });
                
                return cleanedTable;
              }
              
              // Clean the table content
              const cleanedTable = cleanTableContent(TableToPrint);
              
              // Extract Khatian number for filename
              let khatianNumber = 'Unknown';
              try {
                // Method 1: Try to find from form inputs
                const khatianInputSelectors = [
                  'input[name="khatianno"]',
                  'input[name="txtKhatianNo"]',
                  'input[id="txtKhatianNo"]',
                  'input[id="khatianno"]',
                  'input[placeholder*="Khatian"]',
                  'input[placeholder*="খতিয়ান"]',
                  'input[placeholder*="Khatiyan"]'
                ];

                for (const selector of khatianInputSelectors) {
                  const element = document.querySelector(selector);
                  if (element && element.value && element.value.trim()) {
                    khatianNumber = element.value.trim();
                    console.log('Found Khatian number from input:', encodeURIComponent(khatianNumber));
                    break;
                  }
                }

                // Method 2: Extract from the table content itself
                if (khatianNumber === 'Unknown' && TableToPrint) {
                  // Look for Khatian number in table headers and cells
                  const allCells = TableToPrint.querySelectorAll('th, td, div, span');
                  for (const cell of allCells) {
                    const text = cell.textContent.trim();
                    // Look for patterns like "খতিয়ান নং: 123" or "Khatian No: 123"
                    const khatianPatterns = [
                      /খতিয়ান\s*নং?\s*:?\s*(\d+)/i,
                      /khatian\s*no?\.?\s*:?\s*(\d+)/i,
                      /khatiyan\s*no?\.?\s*:?\s*(\d+)/i,
                      /খতিয়ান\s*(\d+)/i,
                      /khatian\s*(\d+)/i
                    ];

                    for (const pattern of khatianPatterns) {
                      const match = text.match(pattern);
                      if (match && match[1]) {
                        khatianNumber = match[1];
                        console.log('Found Khatian number from table content:', khatianNumber);
                        break;
                      }
                    }
                    if (khatianNumber !== 'Unknown') break;
                  }
                }

                // Method 3: Try to extract from page title or headers
                if (khatianNumber === 'Unknown') {
                  const pageTitle = document.title;
                  const match = pageTitle.match(/khatian\s*no?\.?\s*:?\s*(\d+)/i);
                  if (match && match[1]) {
                    khatianNumber = match[1];
                    console.log('Found Khatian number from page title:', khatianNumber);
                  }
                }

                // Method 4: Try URL parameters
                if (khatianNumber === 'Unknown') {
                  const urlParams = new URLSearchParams(window.location.search);
                  const possibleParams = ['khatianno', 'kh', 'txtKhatianNo', 'khatiyan'];
                  for (const param of possibleParams) {
                    const value = urlParams.get(param);
                    if (value && value.trim()) {
                      khatianNumber = value.trim();
                      console.log('Found Khatian number from URL params:', khatianNumber);
                      break;
                    }
                  }
                }

                // Method 5: Try to extract from any element containing khatian info
                if (khatianNumber === 'Unknown') {
                  const allElements = document.querySelectorAll('*');
                  for (const element of allElements) {
                    if (element.textContent && element.textContent.includes('খতিয়ান')) {
                      const match = element.textContent.match(/(\d+)/);
                      if (match && match[1] && match[1].length >= 1) {
                        khatianNumber = match[1];
                        console.log('Found Khatian number from general search:', khatianNumber);
                        break;
                      }
                    }
                  }
                }

                console.log('Final Khatian number extracted:', khatianNumber);

              } catch (error) {
                console.error('Error extracting Khatian number:', error);
              }

              // Calculate totals for columns 4 and 5 (index 3 and 4)
              let totalPortion = 0;
              let totalPortionAmount = 0;
              const rows = TableToPrint.querySelectorAll("table tbody tr");
              rows.forEach(row => {
                if (row.cells[3] && row.cells[4]) {
                  const portion = parseFloat(row.cells[3].innerText.trim()) || 0;
                  const portionAmount = parseFloat(row.cells[4].innerText.trim()) || 0;
                  totalPortion += portion;
                  totalPortionAmount += portionAmount;
                }
              });
              // Format total values with simple one-line awesome design
              const totalPortionValue = totalPortion.toFixed(4);
              const totalPortionAmountValue = totalPortionAmount.toFixed(4);

              // Create simple one-line totals box with highlighted values
              const totalsHTML = `
                <div style="
                  margin-top: 15px;
                  padding: 12px 20px;
                  background: linear-gradient(90deg, #f8f9fa 0%, #ffffff 50%, #f8f9fa 100%);
                  border: 2px solid #000;
                  border-radius: 8px;
                  text-align: center;
                  font-family: Arial, sans-serif;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                ">
                  <span style="color: #000; font-weight: bold; font-size: 14px;">Total অংশ: </span>
                  <span style="color: #e74c3c; font-weight: bold; font-size: 16px; background: #fff; padding: 2px 8px; border-radius: 4px; border: 1px solid #ddd;">${totalPortionValue}</span>
                  <span style="color: #000; font-weight: bold; margin: 0 15px;">|</span>
                  <span style="color: #000; font-weight: bold; font-size: 14px;">Total অংশ পরিমাণ(একর): </span>
                  <span style="color: #27ae60; font-weight: bold; font-size: 16px; background: #fff; padding: 2px 8px; border-radius: 4px; border: 1px solid #ddd;">${totalPortionAmountValue}</span>
                </div>
              `;

              // Generate filename for PDF
              function sanitizeFilename(text) {
                return text.replace(/[^a-zA-Z0-9\u0980-\u09FF\s-]/g, '').replace(/\s+/g, ' ').trim();
              }

              const cleanBlockName = sanitizeFilename(blockText);
              const cleanMouzaName = sanitizeFilename(mouzaText);
              const cleanKhatianNumber = sanitizeFilename(khatianNumber);

              const pdfFilename = `WB BHUMI PRINT - ${cleanBlockName} - ${cleanMouzaName} - KH ${cleanKhatianNumber}`;

              console.log('Generated PDF filename:', pdfFilename);

              const newWin = window.open("", "_blank");
              newWin.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <title>${pdfFilename}</title>
                <style>
                  @page {
                    margin: 10mm 8mm 8mm 8mm;
                    size: A4;
                  }
                  @media print {
                    * {
                      margin: 0;
                      padding: 0;
                      box-sizing: border-box;
                    }
                    body { 
                      margin: 0; 
                      padding: 5px; 
                      font-family: 'SolaimanLipi', 'Kalpurush', 'Mukti', Arial, sans-serif; 
                      text-align: left;
                      direction: ltr;
                      line-height: 1.2;
                    }
                    img { 
                      max-width: 100%; 
                      height: auto;
                      margin: 0;
                      padding: 0;
                    }
                    .watermark {
                      position: fixed;
                      bottom: 2px;
                      left: 0;
                      right: 0;
                      text-align: center;
                      font-size: 7px;
                      color: #FF0000;
                      padding: 1px;
                      margin: 0;
                    }
                    .content-wrapper {
                      margin: 0;
                      padding: 0;
                      text-align: center;
                    }
                    p {
                      text-align: center;
                      margin: 3px 0;
                      padding: 0;
                      line-height: 1.1;
                    }
                    hr {
                      margin: 2px 0;
                      border: 0.5px solid #000;
                    }
                    table {
                      text-align: left;
                      border-collapse: collapse;
                      width: 100%;
                      margin: 5px 0;
                      padding: 0;
                      border-left: 2px solid #000;
                    }
                    table, th, td {
                      border: 1px solid #000;
                    }
                    th, td {
                      padding: 3px 2px;
                      text-align: center !important;
                      line-height: 1.1;
                      font-size: 12px;
                      font-weight: bold !important;
                    }
                    th {
                      font-weight: bold;
                      background-color: #f8f9fa;
                    }
                    /* Force center alignment for all content */
                    table th, table td {
                      text-align: center !important;
                      font-weight: bold !important;
                    }
                    table * {
                      text-align: center !important;
                      font-weight: bold !important;
                    }
                    /* Hide unwanted spans in print */
                    span[style*="display: none"],
                    span[style*="visibility: hidden"],
                    span:empty,
                    div:empty,
                    span[class*="hidden"],
                    span[class*="invisible"] {
                      display: none !important;
                      visibility: hidden !important;
                    }
                    .table-container {
                      border-left: 2px solid #000;
                      padding: 0;
                      margin: 0;
                    }
                    .logo-container {
                      text-align: center;
                      margin: 0 0 8px 0;
                      padding: 0;
                      width: 100%;
                    }
                    .logo-container img {
                      width: 100%;
                      max-width: 100%;
                      height: auto;
                      min-height: 80px;
                      max-height: 120px;
                      object-fit: contain;
                      display: block;
                      margin: 0 auto;
                    }
                    body {
                      position: relative;
                    }
                    body img[src*="bgext.png"] {
                      position: fixed;
                      top: 50%;
                      left: 50%;
                      transform: translate(-50%, -50%);
                      width: 60%;
                      height: 60%;
                      object-fit: contain;
                      opacity: 0.40;
                      z-index: 0;
                      pointer-events: none;
                    }
                    @media print {
                      body img[src*="bgext.png"] {
                        position: fixed !important;
                        top: 50% !important;
                        left: 50% !important;
                        transform: translate(-50%, -50%) !important;
                        width: 60% !important;
                        height: 60% !important;
                        object-fit: contain !important;
                        opacity: 0.4 !important;
                        z-index: 0 !important;
                        pointer-events: none !important;
                        display: block !important;
                        visibility: visible !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                      }
                    }
                  }
                </style>
              </head>
              <body style="position: relative;">
                <div class="content-wrapper" style="position: relative; z-index: 2;">
                  <div class="logo-container">
                    <img src="https://banglarbhumi.gov.in/BanglarBhumi/images/bl.png" alt="Logo">
                  </div>
                  <hr>
                  <p style="color: black; font-weight: bold; font-size: 14px;">জেলা: ${districtText}, ব্লক: ${blockText}, মৌজা: ${mouzaText}</p>
                  <hr>
                  <div class="table-container">
                    ${cleanedTable.outerHTML}
                    ${totalsHTML}
                  </div>
                </div>
                <div class="watermark">Encroaching of Govt. land is punishable Offence & In case of any factual error(s) in the content, advised to contact the concerned BL&LRO office.</div>
              </body>
            </html>
          `);
              newWin.document.close();
              newWin.onload = function () {
                newWin.focus();
                newWin.print();
              };
            } else {
              console.log("Table not found.");
            }
          },
        });
      });
    }

    // Function to print Plot Information
    function printPlot() {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: () => {
            const PlotToPrint = document.getElementById("plotdetails");

            // Extract district, block, and mouza values from the page
            let districtText = 'N/A';
            let blockText = 'N/A';
            let mouzaText = 'N/A';

            try {
              // Helper function to get selected text from dropdown
              function getSelectedText(selectId) {
                const select = document.getElementById(selectId);
                if (select && select.selectedIndex >= 0 && select.options[select.selectedIndex]) {
                  return select.options[select.selectedIndex].text.trim();
                }
                return null;
              }

              // Helper function to get input value
              function getInputValue(inputId) {
                const input = document.getElementById(inputId);
                if (input && input.value) {
                  return input.value.trim();
                }
                return null;
              }

              // Try common district dropdown IDs
              const districtIds = ['lstDistrictCode1', 'lstDistrictCode11', 'districtname'];
              for (const id of districtIds) {
                const value = getSelectedText(id) || getInputValue(id);
                if (value && value !== 'Select District' && value !== 'N/A') {
                  districtText = value;
                  break;
                }
              }

              // Try common block dropdown IDs
              const blockIds = ['lstBlockCode1', 'blockname'];
              for (const id of blockIds) {
                const value = getSelectedText(id) || getInputValue(id);
                if (value && value !== 'Select Block' && value !== 'N/A') {
                  blockText = value;
                  break;
                }
              }

              // Try common mouza dropdown IDs
              const mouzaIds = ['lstMouzaCode', 'lstMouzaList', 'mauzaname'];
              for (const id of mouzaIds) {
                const value = getSelectedText(id) || getInputValue(id);
                if (value && value !== 'Select Mouza' && value !== 'N/A') {
                  mouzaText = value;
                  break;
                }
              }

              // If still not found, try to extract from Chrome storage (extension data)
              if (districtText === 'N/A' || blockText === 'N/A' || mouzaText === 'N/A') {
                // Try to get from extension storage if available
                if (typeof chrome !== 'undefined' && chrome.storage) {
                  chrome.storage.sync.get(['districtName', 'blockName', 'mouzaName'], (data) => {
                    if (data.districtName && districtText === 'N/A') districtText = data.districtName;
                    if (data.blockName && blockText === 'N/A') blockText = data.blockName;
                    if (data.mouzaName && mouzaText === 'N/A') mouzaText = data.mouzaName;
                  });
                }
              }

              console.log('Final extracted values for plot:', {
                district: districtText.replace(/\n/g, '\\n').replace(/\r/g, '\\r'),
                block: blockText.replace(/\n/g, '\\n').replace(/\r/g, '\\r'),
                mouza: mouzaText.replace(/\n/g, '\\n').replace(/\r/g, '\\r')
              });

            } catch (error) {
              console.error('Error extracting location data for plot:', error);
            }

            if (PlotToPrint) {
              // Extract Plot number for filename
              let plotNumber = 'Unknown';
              try {
                // Method 1: Try to find from form inputs
                const plotInputSelectors = [
                  'input[name="plotno"]',
                  'input[name="txtPlotNo"]',
                  'input[id="txtPlotNo"]',
                  'input[id="plotno"]',
                  'input[name="dagno"]',
                  'input[name="txtDagNo"]',
                  'input[id="txtDagNo"]',
                  'input[id="dagno"]',
                  'input[placeholder*="Plot"]',
                  'input[placeholder*="প্লট"]',
                  'input[placeholder*="Dag"]',
                  'input[placeholder*="দাগ"]'
                ];

                for (const selector of plotInputSelectors) {
                  const element = document.querySelector(selector);
                  if (element && element.value && element.value.trim()) {
                    plotNumber = element.value.trim();
                    console.log('Found Plot number from input:', plotNumber);
                    break;
                  }
                }

                // Method 2: Extract from the table content itself
                if (plotNumber === 'Unknown' && PlotToPrint) {
                  // Look for Plot/Dag number in table headers and cells
                  const allCells = PlotToPrint.querySelectorAll('th, td, div, span');
                  for (const cell of allCells) {
                    const text = cell.textContent.trim();
                    // Look for patterns like "দাগ নং: 123", "Plot No: 123", "প্লট: 123"
                    const plotPatterns = [
                      /দাগ\s*নং?\s*:?\s*(\d+)/i,
                      /plot\s*no?\.?\s*:?\s*(\d+)/i,
                      /dag\s*no?\.?\s*:?\s*(\d+)/i,
                      /প্লট\s*নং?\s*:?\s*(\d+)/i,
                      /দাগ\s*(\d+)/i,
                      /plot\s*(\d+)/i,
                      /প্লট\s*(\d+)/i
                    ];

                    for (const pattern of plotPatterns) {
                      const match = text.match(pattern);
                      if (match && match[1]) {
                        plotNumber = match[1];
                        console.log('Found Plot number from table content:', plotNumber);
                        break;
                      }
                    }
                    if (plotNumber !== 'Unknown') break;
                  }
                }

                // Method 3: Try XPath extraction (improved)
                if (plotNumber === 'Unknown') {
                  try {
                    const xpathQueries = [
                      '//*[@id="plotdetails"]//th[contains(text(),"দাগ") or contains(text(),"Plot") or contains(text(),"প্লট")]/following-sibling::*[1]',
                      '//*[@id="plotdetails"]//td[contains(text(),"দাগ") or contains(text(),"Plot") or contains(text(),"প্লট")]/following-sibling::*[1]',
                      '//*[contains(text(),"দাগ নং") or contains(text(),"Plot No") or contains(text(),"প্লট নং")]/following-sibling::*[1]'
                    ];

                    for (const query of xpathQueries) {
                      const plotElement = document.evaluate(query, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                      if (plotElement && plotElement.textContent.trim()) {
                        const match = plotElement.textContent.trim().match(/(\d+)/);
                        if (match && match[1]) {
                          plotNumber = match[1];
                          console.log('Found Plot number from XPath:', plotNumber);
                          break;
                        }
                      }
                    }
                  } catch (xpathError) {
                    console.log('XPath extraction failed:', xpathError);
                  }
                }

                // Method 4: Try to extract from page title or headers
                if (plotNumber === 'Unknown') {
                  const pageTitle = document.title;
                  const match = pageTitle.match(/plot\s*no?\.?\s*:?\s*(\d+)|dag\s*no?\.?\s*:?\s*(\d+)/i);
                  if (match && (match[1] || match[2])) {
                    plotNumber = match[1] || match[2];
                    console.log('Found Plot number from page title:', plotNumber);
                  }
                }

                // Method 5: Try URL parameters
                if (plotNumber === 'Unknown') {
                  const urlParams = new URLSearchParams(window.location.search);
                  const possibleParams = ['plotno', 'dagno', 'plot', 'dag', 'txtPlotNo', 'txtDagNo'];
                  for (const param of possibleParams) {
                    const value = urlParams.get(param);
                    if (value && value.trim()) {
                      plotNumber = value.trim();
                      console.log('Found Plot number from URL params:', plotNumber);
                      break;
                    }
                  }
                }

                // Method 6: Try to extract from any element containing plot/dag info
                if (plotNumber === 'Unknown') {
                  const allElements = document.querySelectorAll('*');
                  for (const element of allElements) {
                    if (element.textContent && (element.textContent.includes('দাগ') || element.textContent.includes('প্লট'))) {
                      const match = element.textContent.match(/(\d+)/);
                      if (match && match[1] && match[1].length >= 1) {
                        plotNumber = match[1];
                        console.log('Found Plot number from general search:', plotNumber);
                        break;
                      }
                    }
                  }
                }

                console.log('Final Plot number extracted:', plotNumber);

              } catch (error) {
                console.error('Error extracting Plot number:', error);
              }

              // Calculate totals for columns 4 and 5 (index 3 and 4)
              let totalPortion = 0;
              let totalPortionAmount = 0;
              const rows = PlotToPrint.querySelectorAll("table tbody tr");
              rows.forEach(row => {
                if (row.cells[3] && row.cells[4]) {
                  const portion = parseFloat(row.cells[3].innerText.trim()) || 0;
                  const portionAmount = parseFloat(row.cells[4].innerText.trim()) || 0;
                  totalPortion += portion;
                  totalPortionAmount += portionAmount;
                }
              });
              // Format total values with simple one-line awesome design
              const totalPortionValue = totalPortion.toFixed(4);
              const totalPortionAmountValue = totalPortionAmount.toFixed(4);

              // Create simple one-line totals box with highlighted values
              const totalsHTML = `
                <div style="
                  margin-top: 15px;
                  padding: 12px 20px;
                  background: linear-gradient(90deg, #f8f9fa 0%, #ffffff 50%, #f8f9fa 100%);
                  border: 2px solid #000;
                  border-radius: 8px;
                  text-align: center;
                  font-family: Arial, sans-serif;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                ">
                  <span style="color: #000; font-weight: bold; font-size: 14px;">Total অংশ: </span>
                  <span style="color: #e74c3c; font-weight: bold; font-size: 16px; background: #fff; padding: 2px 8px; border-radius: 4px; border: 1px solid #ddd;">${totalPortionValue}</span>
                  <span style="color: #000; font-weight: bold; margin: 0 15px;">|</span>
                  <span style="color: #000; font-weight: bold; font-size: 14px;">Total অংশ পরিমাণ(একর): </span>
                  <span style="color: #27ae60; font-weight: bold; font-size: 16px; background: #fff; padding: 2px 8px; border-radius: 4px; border: 1px solid #ddd;">${totalPortionAmountValue}</span>
                </div>
              `;

              // Generate filename for PDF
              function sanitizeFilename(text) {
                return text.replace(/[^a-zA-Z0-9\u0980-\u09FF\s-]/g, '').replace(/\s+/g, ' ').trim();
              }

              const cleanBlockName = sanitizeFilename(blockText);
              const cleanMouzaName = sanitizeFilename(mouzaText);
              const cleanPlotNumber = sanitizeFilename(plotNumber);

              const pdfFilename = `WB BHUMI PRINT - ${cleanBlockName} - ${cleanMouzaName} - Plot ${cleanPlotNumber}`;

              console.log('Generated PDF filename for plot:', pdfFilename);

              const newWin = window.open("", "_blank");
              newWin.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <title>${pdfFilename}</title>
                <style>
                  @page {
                    margin: 10mm 8mm 8mm 8mm;
                    size: A4;
                  }
                  @media print {
                    * {
                      margin: 0;
                      padding: 0;
                      box-sizing: border-box;
                    }
                    body { 
                      margin: 0; 
                      padding: 5px; 
                      font-family: 'SolaimanLipi', 'Kalpurush', 'Mukti', Arial, sans-serif; 
                      text-align: left;
                      direction: ltr;
                      line-height: 1.2;
                    }
                    img { 
                      max-width: 100%; 
                      height: auto;
                      margin: 0;
                      padding: 0;
                    }
                    .watermark {
                      position: fixed;
                      bottom: 2px;
                      left: 0;
                      right: 0;
                      text-align: center;
                      font-size: 7px;
                      color: #FF0000;
                      padding: 1px;
                      margin: 0;
                    }
                    .content-wrapper {
                      margin: 0;
                      padding: 0;
                      text-align: center;
                    }
                    p {
                      text-align: center;
                      margin: 3px 0;
                      padding: 0;
                      line-height: 1.1;
                    }
                    hr {
                      margin: 2px 0;
                      border: 0.5px solid #000;
                    }
                    table {
                      text-align: left;
                      border-collapse: collapse;
                      width: 100%;
                      margin: 5px 0;
                      padding: 0;
                      border-left: 2px solid #000;
                    }
                    table, th, td {
                      border: 1px solid #000;
                    }
                    th, td {
                      padding: 3px 2px;
                      text-align: left;
                      line-height: 1.1;
                      font-size: 12px;
                    }
                    th {
                      font-weight: bold;
                      background-color: #f8f9fa;
                    }
                    .table-container {
                      border-left: 2px solid #000;
                      padding: 0;
                      margin: 0;
                    }
                    .logo-container {
                      text-align: center;
                      margin: 0 0 8px 0;
                      padding: 0;
                      width: 100%;
                    }
                    .logo-container img {
                      width: 100%;
                      max-width: 100%;
                      height: auto;
                      min-height: 80px;
                      max-height: 120px;
                      object-fit: contain;
                      display: block;
                      margin: 0 auto;
                    }
                    body {
                      position: relative;
                    }
                    body img[src*="bgext.png"] {
                      position: fixed;
                      top: 50%;
                      left: 50%;
                      transform: translate(-50%, -50%);
                      width: 60%;
                      height: 60%;
                      object-fit: contain;
                      opacity: 0.40;
                      z-index: 0;
                      pointer-events: none;
                    }
                    @media print {
                      body img[src*="bgext.png"] {
                        position: fixed !important;
                        top: 50% !important;
                        left: 50% !important;
                        transform: translate(-50%, -50%) !important;
                        width: 60% !important;
                        height: 60% !important;
                        object-fit: contain !important;
                        opacity: 0.4 !important;
                        z-index: 0 !important;
                        pointer-events: none !important;
                        display: block !important;
                        visibility: visible !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                      }
                    }
                  }
                </style>
              </head>
              <body style="position: relative;">
                <div class="content-wrapper" style="position: relative; z-index: 2;">
                  <div class="logo-container">
                    <img src="https://banglarbhumi.gov.in/BanglarBhumi/images/bl.png" alt="Logo">
                  </div>
                  <hr>
                  <p style="color: black; font-weight: bold; font-size: 14px;">জেলা: ${districtText}, ব্লক: ${blockText}, মৌজা: ${mouzaText}</p>
                  <hr>
                  <div class="table-container">
                    ${PlotToPrint.outerHTML}
                    ${totalsHTML}
                  </div>
                </div>
                <div class="watermark">Encroaching of Govt. land is punishable Offence & In case of any factual error(s) in the content, advised to contact the concerned BL&LRO office</div>
              </body>
            </html>
          `);
              newWin.document.close();
              newWin.onload = function () {
                newWin.focus();
                newWin.print();
              };
            } else {
              console.log("Plot not found.");
            }
          },
        });
      });
    }

    printTableButton.addEventListener("click", printTable);
    printPlotButton.addEventListener("click", printPlot);
  }); // Close DOMContentLoaded
