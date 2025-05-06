"use client"

// This script fixes issues with dropdown menus not appearing
export function fixDropdowns() {
  if (typeof window === "undefined") return

  // Function to run when the DOM is fully loaded
  const onDOMLoaded = () => {
    // Find all dropdown triggers
    const dropdownTriggers = document.querySelectorAll('[data-state="closed"], [data-state="open"]')

    // Add necessary styles to ensure dropdowns work
    dropdownTriggers.forEach((trigger) => {
      const parent = trigger.parentElement
      if (parent) {
        parent.style.position = "relative"
        parent.style.zIndex = "50"
      }
    })

    // Ensure all Radix popper content wrappers have the highest z-index
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              if (node.hasAttribute("data-radix-popper-content-wrapper")) {
                node.style.zIndex = "9999"
                node.style.position = "absolute"

                // Ensure the dropdown content is visible
                const content = node.querySelector('[role="menu"]')
                if (content instanceof HTMLElement) {
                  content.style.zIndex = "9999"
                  content.style.backgroundColor = "white"
                  content.style.visibility = "visible"
                  content.style.opacity = "1"
                }
              }
            }
          })
        }
      })
    })

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true })
  }

  // Run when the DOM is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onDOMLoaded)
  } else {
    onDOMLoaded()
  }

  // Also run when the window is fully loaded
  window.addEventListener("load", onDOMLoaded)
}
