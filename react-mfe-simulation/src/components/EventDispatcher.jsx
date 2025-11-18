import { useState } from 'react'
import './EventDispatcher.css'

function EventDispatcher({ addLog }) {
  const [eventCount, setEventCount] = useState(0)

  const dispatchEvent = () => {
    const newCount = eventCount + 1
    setEventCount(newCount)

    addLog(`\n📡 MFE1: Dispatching global event #${newCount}`, 'trigger')
    addLog(`   Event type: "openPopup"`, 'trigger')

    const event = new CustomEvent('openPopup', {
      detail: {
        id: newCount,
        timestamp: new Date().toISOString(),
        message: `Event #${newCount} data`,
      }
    })

    window.dispatchEvent(event)

    addLog(`   Event dispatched to all listeners`, 'trigger')
    addLog(`   First listener will execute and block others\n`, 'trigger')
  }

  return (
    <div className="event-dispatcher">
      <div className="dispatcher-header">
        <h2>📡 Event Dispatcher (MFE1)</h2>
        <p>Simulates a microfrontend dispatching a global event</p>
      </div>

      <div className="dispatcher-content">
        <div className="dispatcher-stats">
          <div className="stat-card">
            <span className="stat-label">Events Dispatched:</span>
            <span className="stat-value">{eventCount}</span>
          </div>
        </div>

        <button className="btn-dispatch" onClick={dispatchEvent}>
          📡 Dispatch Global Event
        </button>

        <div className="info-box">
          <p><strong>What happens:</strong></p>
          <ul>
            <li>Event is dispatched to window with CustomEvent</li>
            <li>ALL attached listeners receive the event</li>
            <li>Listeners execute in FIFO order (first attached = first to run)</li>
            <li>First listener calls stopImmediatePropagation()</li>
            <li>Remaining listeners are blocked and never execute</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default EventDispatcher
