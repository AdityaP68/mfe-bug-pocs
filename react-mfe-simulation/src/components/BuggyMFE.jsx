import { useState, useRef, useLayoutEffect } from 'react'
import './MFEComponent.css'

function BuggyMFE({ addLog }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [popupData, setPopupData] = useState(null)
  const renderCount = useRef(0)
  const listenersAttached = useRef(0)
  const prevRenderCount = useRef(0)

  // Track render count
  renderCount.current++
  const currentRender = renderCount.current

  // Event handler with closure over current render
  const handleOpenPopup = (e) => {
    addLog(`❌ BUGGY Listener #${currentRender} received event`, 'execute')
    addLog(`   Render #${currentRender} captured in closure`, 'execute')

    // Stop other listeners from executing
    e.stopImmediatePropagation()
    addLog(`   🛑 stopImmediatePropagation() called - blocking other listeners`, 'block')

    setIsPopupOpen(true)
    setPopupData(e.detail)
  }

  // ❌ BUG: Attach listener on every render (outside useEffect)
  // This is the bug we're demonstrating!
  window.addEventListener('openPopup', handleOpenPopup)
  listenersAttached.current++

  // Use useLayoutEffect to log AFTER render (prevents infinite loop)
  useLayoutEffect(() => {
    if (prevRenderCount.current !== renderCount.current) {
      addLog(
        `🔴 BUGGY: Attached listener #${currentRender} (Total: ${listenersAttached.current})`,
        'attach'
      )
      prevRenderCount.current = renderCount.current
    }
  })

  // Note: NO cleanup! Listeners accumulate forever
  // This is the critical bug

  const closePopup = () => {
    setIsPopupOpen(false)
    setPopupData(null)
  }

  return (
    <div className="mfe-component buggy">
      <div className="mfe-header">
        <h3>❌ Buggy MFE</h3>
        <span className="badge badge-error">No Cleanup</span>
      </div>

      <div className="mfe-stats">
        <div className="stat">
          <span className="stat-label">Renders:</span>
          <span className="stat-value">{renderCount.current}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Listeners Attached:</span>
          <span className="stat-value stat-error">{listenersAttached.current}</span>
        </div>
      </div>

      <div className="code-example">
        <pre>{`// ❌ BUG: Outside useEffect
const handleEvent = (e) => {
  e.stopImmediatePropagation();
  // Handle event
};

// Attaches on EVERY render!
window.addEventListener(
  'openPopup',
  handleEvent
);

// ❌ NO CLEANUP!
// Listeners accumulate forever`}</pre>
      </div>

      {isPopupOpen && popupData && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h4>Popup Opened by Buggy MFE</h4>
            <p><strong>Handled by listener:</strong> #{currentRender}</p>
            <p><strong>Event ID:</strong> {popupData.id}</p>
            <p><strong>Message:</strong> {popupData.message}</p>
            <button className="btn-close" onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BuggyMFE
