import { useState, useRef, useEffect } from 'react'
import './MFEComponent.css'

function FixedMFE({ addLog }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [popupData, setPopupData] = useState(null)
  const renderCount = useRef(0)
  const listenersActive = useRef(0)

  // Track render count
  renderCount.current++

  // ✅ PROPER: Listener in useEffect with cleanup
  useEffect(() => {
    const handleOpenPopup = (e) => {
      addLog(`✅ FIXED Listener received event`, 'execute')
      addLog(`   Only ONE listener active`, 'execute')

      // Stop other listeners from executing
      e.stopImmediatePropagation()
      addLog(`   🛑 stopImmediatePropagation() called`, 'block')

      setIsPopupOpen(true)
      setPopupData(e.detail)
    }

    // Attach listener ONCE
    window.addEventListener('openPopup', handleOpenPopup)
    listenersActive.current = 1
    addLog('🟢 FIXED: Attached listener (with cleanup)', 'attach')

    // ✅ CLEANUP: Remove listener on unmount
    return () => {
      window.removeEventListener('openPopup', handleOpenPopup)
      listenersActive.current = 0
      addLog('🧹 FIXED: Removed listener (cleanup)', 'remove')
    }
  }, []) // Empty deps = attach once, cleanup on unmount

  const closePopup = () => {
    setIsPopupOpen(false)
    setPopupData(null)
  }

  return (
    <div className="mfe-component fixed">
      <div className="mfe-header">
        <h3>✅ Fixed MFE</h3>
        <span className="badge badge-success">With Cleanup</span>
      </div>

      <div className="mfe-stats">
        <div className="stat">
          <span className="stat-label">Renders:</span>
          <span className="stat-value">{renderCount.current}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Active Listeners:</span>
          <span className="stat-value stat-success">{listenersActive.current}</span>
        </div>
      </div>

      <div className="code-example">
        <pre>{`// ✅ PROPER: Inside useEffect
useEffect(() => {
  const handleEvent = (e) => {
    e.stopImmediatePropagation();
    // Handle event
  };

  // Attach once
  window.addEventListener(
    'openPopup',
    handleEvent
  );

  // ✅ CLEANUP on unmount
  return () => {
    window.removeEventListener(
      'openPopup',
      handleEvent
    );
  };
}, []); // Empty deps array`}</pre>
      </div>

      {isPopupOpen && popupData && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h4>Popup Opened by Fixed MFE</h4>
            <p><strong>Event ID:</strong> {popupData.id}</p>
            <p><strong>Message:</strong> {popupData.message}</p>
            <button className="btn-close" onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FixedMFE
