import React, { Suspense, useState } from 'react';
import './App.css';

// Lazy load the remote component
const RemoteComponent = React.lazy(() => import('remoteMfe/RemoteComponent'));

function App() {
  const [showRemote, setShowRemote] = useState(false);
  const [mountCount, setMountCount] = useState(0);
  const [unmountCount, setUnmountCount] = useState(0);

  const handleMount = () => {
    setShowRemote(true);
    setMountCount(prev => prev + 1);
    console.log('🟢 [Host] Mounting remote component');
  };

  const handleUnmount = () => {
    setShowRemote(false);
    setUnmountCount(prev => prev + 1);
    console.log('🟢 [Host] Unmounting remote component');
  };

  return (
    <div className="App">
      <header style={{
        backgroundColor: '#282c34',
        padding: '20px',
        color: 'white',
        marginBottom: '20px'
      }}>
        <h1>MFE Event Listener Bug POC</h1>
        <p>Demonstrating event listener cleanup issues in Module Federation</p>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h2 style={{ marginTop: 0 }}>Control Panel</h2>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button
              onClick={handleMount}
              disabled={showRemote}
              style={{
                padding: '10px 20px',
                backgroundColor: showRemote ? '#ccc' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: showRemote ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              Mount Remote MFE
            </button>
            <button
              onClick={handleUnmount}
              disabled={!showRemote}
              style={{
                padding: '10px 20px',
                backgroundColor: !showRemote ? '#ccc' : '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: !showRemote ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              Unmount Remote MFE
            </button>
          </div>

          <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
            <div>
              <strong>Times Mounted:</strong> {mountCount}
            </div>
            <div>
              <strong>Times Unmounted:</strong> {unmountCount}
            </div>
            <div>
              <strong>Current Status:</strong>{' '}
              <span style={{ color: showRemote ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
                {showRemote ? 'MOUNTED' : 'UNMOUNTED'}
              </span>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff3e0',
          border: '2px solid #ff9800',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, color: '#e65100' }}>Testing Instructions</h3>
          <ol style={{ marginBottom: 0, paddingLeft: '20px' }}>
            <li>Open browser DevTools console (F12)</li>
            <li>Click "Mount Remote MFE" to load the remote component</li>
            <li>Observe console logs showing the event listener being added</li>
            <li>Click anywhere on the page and watch the click counter in the remote component</li>
            <li>Click "Unmount Remote MFE" to remove the component</li>
            <li><strong>Continue clicking anywhere on the page</strong></li>
            <li>
              <strong style={{ color: '#d32f2f' }}>
                If you see console logs from the remote component after unmounting,
                the event listener was NOT properly cleaned up
              </strong>
            </li>
          </ol>
        </div>

        {showRemote && (
          <Suspense fallback={
            <div style={{
              padding: '20px',
              textAlign: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px'
            }}>
              Loading Remote MFE...
            </div>
          }>
            <RemoteComponent />
          </Suspense>
        )}

        {!showRemote && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#fafafa',
            border: '2px dashed #ccc',
            borderRadius: '8px',
            color: '#666'
          }}>
            <p style={{ fontSize: '18px', margin: 0 }}>
              Remote MFE is currently unmounted. Click "Mount Remote MFE" to load it.
            </p>
          </div>
        )}

        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#e8f5e9',
          border: '1px solid #4caf50',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <h3 style={{ marginTop: 0, color: '#2e7d32' }}>Expected Behavior</h3>
          <p style={{ margin: '8px 0' }}>
            <strong>Correct (when fixed):</strong> After unmounting, clicking anywhere should NOT
            trigger any console logs from the remote component, and the click counter should not update.
          </p>
          <p style={{ margin: '8px 0 0 0' }}>
            <strong style={{ color: '#d32f2f' }}>Bug (current):</strong> Event listeners may persist
            after unmounting, causing memory leaks and unexpected behavior.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
