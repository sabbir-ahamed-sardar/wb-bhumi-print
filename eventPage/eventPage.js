
chrome.runtime.onMessage.addListener((req, sender, res) => {
  if (req.todo === "ShowSomthing") {
    // In Manifest V3, we don't need to explicitly show the action
    // The action is automatically available when the extension is active
    console.log("Extension action is available");
    
    // Optional: Send a response back to confirm
    if (res) {
      res({ success: true, message: "Extension action is ready" });
    }
  }
});

// No authentication checks needed - extension works without authentication

// No periodic checks needed

// Cleanup function to prevent memory leaks
function cleanup() {
    // Nothing to clean up
}

// Cleanup on extension shutdown
chrome.runtime.onSuspend.addListener(cleanup);
chrome.runtime.onStartup.addListener(() => {
    // Nothing to initialize
});