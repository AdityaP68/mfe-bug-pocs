import { useEffect, useRef } from 'react'
import './EventLog.css'

function EventLog({ logs, onClear }) {
  const logEndRef = useRef(null)

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div className="event-log-container">
      <div className="log-header">
        <h2>📋 Event Log</h2>
        <button className="btn-clear" onClick={onClear}>
          🗑️ Clear Log
        </button>
      </div>

      <div className="log-content">
        {logs.length === 0 ? (
          <div className="log-empty">
            <p>No events yet. Click "Dispatch Global Event" to start!</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`log-entry log-${log.type}`}>
              <span className="log-time">[{log.timestamp}]</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  )
}

export default EventLog
