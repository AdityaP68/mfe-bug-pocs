import React, { useEffect, useState } from 'react';

const RemoteComponent = () => {
  const [clicks, setClicks] = useState(0);
  const [listenerCount, setListenerCount] = useState(0);

  useEffect(() => {
    console.log('🔵 [Remote MFE] Component mounted');

    const handleClick = () => {
      console.log('🔵 [Remote MFE] Click event fired');
      setClicks(prev => prev + 1);
    };

    // Add event listener to document
    document.addEventListener('click', handleClick);
    setListenerCount(prev => prev + 1);
    console.log(`🔵 [Remote MFE] Event listener added (total: ${listenerCount + 1})`);

    return () => {
      console.log('🔵 [Remote MFE] Cleanup function called');
      document.removeEventListener('click', handleClick);
      console.log('🔵 [Remote MFE] Event listener removed');
    };
  }, []); // Empty dependency array - should only run once

  return (
    <div style={{
      padding: '20px',
      margin: '20px 0',
      backgroundColor: '#e3f2fd',
      border: '2px solid #2196f3',
      borderRadius: '8px'
    }}>
      <h2 style={{ color: '#1976d2', margin: '0 0 16px 0' }}>
        Remote MFE Component
      </h2>
      <div style={{ marginBottom: '12px' }}>
        <strong>Clicks detected by this component:</strong> {clicks}
      </div>
      <div style={{ marginBottom: '12px' }}>
        <strong>Times listener was added:</strong> {listenerCount}
      </div>
      <div style={{
        padding: '12px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <strong>⚠️ Bug Demonstration:</strong>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>This component adds a document click listener in useEffect</li>
          <li>When this component unmounts, the cleanup should remove the listener</li>
          <li>If you see "Clicks detected" incrementing after unmounting, the listener wasn't removed properly</li>
          <li>Check the console to see if cleanup is being called</li>
        </ul>
      </div>
      <button
        onClick={() => console.log('🔵 [Remote MFE] Button clicked directly')}
        style={{
          marginTop: '16px',
          padding: '8px 16px',
          backgroundColor: '#2196f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Button (Click Me)
      </button>
    </div>
  );
};

export default RemoteComponent;
