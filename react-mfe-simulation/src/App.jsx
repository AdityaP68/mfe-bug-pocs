import { useState } from 'react'
import BuggyMFE from './components/BuggyMFE'
import FixedMFE from './components/FixedMFE'
import EventDispatcher from './components/EventDispatcher'
import EventLog from './components/EventLog'
import './App.css'

function App() {
  const [logs, setLogs] = useState([])
  const [buggyMounted, setBuggyMounted] = useState(true)
  const [fixedMounted, setFixedMounted] = useState(true)
  const [buggyRerenderKey, setBuggyRerenderKey] = useState(0)
  const [fixedRerenderKey, setFixedRerenderKey] = useState(0)

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { timestamp, message, type, id: Date.now() + Math.random() }])
  }

  const clearLogs = () => {
    setLogs([])
  }

  const forceRerender = (component) => {
    if (component === 'buggy') {
      setBuggyRerenderKey(prev => prev + 1)
      addLog('🔄 Forcing re-render of Buggy MFE', 'info')
    } else {
      setFixedRerenderKey(prev => prev + 1)
      addLog('🔄 Forcing re-render of Fixed MFE', 'info')
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🧩 Microfrontend Event Listener Bug Simulation</h1>
        <p className="subtitle">React-based demonstration of event listener accumulation</p>
      </header>

      <div className="warning-box">
        <h3>⚠️ The Bug</h3>
        <p><strong>Problem:</strong> Buggy component attaches listener on every render without cleanup</p>
        <p><strong>Result:</strong> Listeners accumulate. First listener executes and blocks others with stopImmediatePropagation()</p>
        <p><strong>Impact:</strong> If first listener has stale state/closure, events may fail or behave incorrectly</p>
      </div>

      <EventDispatcher addLog={addLog} />

      <div className="controls-panel">
        <h2>Component Controls</h2>
        <div className="controls-grid">
          <div className="control-section">
            <h3>Buggy MFE</h3>
            <div className="button-group">
              <button
                className="btn-toggle"
                onClick={() => {
                  setBuggyMounted(!buggyMounted)
                  addLog(`${!buggyMounted ? '🟢 Mounting' : '🔴 Unmounting'} Buggy MFE`, 'info')
                }}
              >
                {buggyMounted ? '⏹️ Unmount' : '▶️ Mount'}
              </button>
              <button
                className="btn-rerender"
                onClick={() => forceRerender('buggy')}
                disabled={!buggyMounted}
              >
                🔄 Force Re-render
              </button>
            </div>
          </div>
          <div className="control-section">
            <h3>Fixed MFE</h3>
            <div className="button-group">
              <button
                className="btn-toggle"
                onClick={() => {
                  setFixedMounted(!fixedMounted)
                  addLog(`${!fixedMounted ? '🟢 Mounting' : '🔴 Unmounting'} Fixed MFE`, 'info')
                }}
              >
                {fixedMounted ? '⏹️ Unmount' : '▶️ Mount'}
              </button>
              <button
                className="btn-rerender"
                onClick={() => forceRerender('fixed')}
                disabled={!fixedMounted}
              >
                🔄 Force Re-render
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="components-grid">
        <div className="component-wrapper">
          {buggyMounted && (
            <BuggyMFE key={buggyRerenderKey} addLog={addLog} />
          )}
          {!buggyMounted && (
            <div className="component-placeholder">
              <p>Buggy MFE Unmounted</p>
              <p className="warning">⚠️ Listener still active (not cleaned up!)</p>
            </div>
          )}
        </div>
        <div className="component-wrapper">
          {fixedMounted && (
            <FixedMFE key={fixedRerenderKey} addLog={addLog} />
          )}
          {!fixedMounted && (
            <div className="component-placeholder">
              <p>Fixed MFE Unmounted</p>
              <p className="success">✅ Listener properly removed</p>
            </div>
          )}
        </div>
      </div>

      <EventLog logs={logs} onClear={clearLogs} />
    </div>
  )
}

export default App
