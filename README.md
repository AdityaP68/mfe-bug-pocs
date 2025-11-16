# MFE Event Listener Bug POC - React Project

This repository contains a **React-based Proof of Concept (POC)** demonstrating event listener cleanup issues in Webpack Module Federation microfrontends.

## 🏗️ Project Structure

This project consists of two React applications using Webpack Module Federation:

```
mfe-bug-pocs/
├── host-app/          # Container application (runs on port 3000)
│   ├── src/
│   │   └── App.js    # Main app that loads remote MFE
│   └── craco.config.js
│
├── remote-mfe/        # Remote microfrontend (runs on port 3001)
│   ├── src/
│   │   └── RemoteComponent.jsx  # Component with event listeners
│   └── craco.config.js
│
└── README.md
```

## 🐛 What This POC Demonstrates

This POC demonstrates a critical bug in microfrontend applications:

**When a remote MFE component is unmounted, event listeners attached to the document/window may not be properly cleaned up, leading to:**

1. ❌ Memory leaks
2. ❌ Event handlers executing on unmounted components
3. ❌ Stale closures accessing outdated state
4. ❌ Unexpected application behavior

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation & Running

You need to run **both applications simultaneously** in separate terminal windows.

#### Terminal 1 - Remote MFE (Port 3001)

```bash
cd remote-mfe
npm install
npm start
```

This will start the remote microfrontend on http://localhost:3001

#### Terminal 2 - Host App (Port 3000)

```bash
cd host-app
npm install
npm start
```

This will start the host application on http://localhost:3000

### Opening the Application

Once both servers are running, open your browser to:

```
http://localhost:3000
```

## 🧪 How to Test the Bug

1. **Open the application** at http://localhost:3000
2. **Open browser DevTools console** (F12 or right-click → Inspect → Console)
3. **Click "Mount Remote MFE"** to load the remote component
   - Observe console logs showing event listener being added
4. **Click anywhere on the page**
   - Watch the click counter increment in the remote component
   - See console logs from the remote component
5. **Click "Unmount Remote MFE"** to remove the component
   - Observe console log showing cleanup being called
6. **Continue clicking anywhere on the page**
7. **Observe the bug:**
   - If event listeners were NOT properly cleaned up, you'll continue seeing console logs from the remote component even after it's unmounted
   - This proves the event listener is still attached even though the component is gone

## 📊 Expected vs Actual Behavior

### ✅ Expected (Correct Behavior)

After unmounting the remote component:
- **No console logs** from the remote component should appear
- **No event handlers** from the unmounted component should execute
- **Memory should be freed** properly

### ❌ Actual (Bug Behavior)

After unmounting the remote component:
- Console logs may still appear from the remote component
- Event handlers continue to execute
- Memory leak occurs as listeners persist

## 🔧 Technical Details

### Module Federation Configuration

Both applications use Webpack Module Federation configured via CRACO (Create React App Configuration Override):

**Host App (host-app/craco.config.js)**
```javascript
remotes: {
  remoteMfe: "remoteMfe@http://localhost:3001/remoteEntry.js",
}
```

**Remote MFE (remote-mfe/craco.config.js)**
```javascript
exposes: {
  "./RemoteComponent": "./src/RemoteComponent",
}
```

### Event Listener Pattern

The remote component uses React's `useEffect` hook to manage event listeners:

```javascript
useEffect(() => {
  const handleClick = () => {
    console.log('Click event fired');
    setClicks(prev => prev + 1);
  };

  document.addEventListener('click', handleClick);

  return () => {
    document.removeEventListener('click', handleClick);
  };
}, []);
```

## 🐞 Understanding the Bug

The bug occurs when:

1. A remote MFE component attaches event listeners to `document` or `window`
2. The component's cleanup function (return from useEffect) is not called properly
3. When the remote component unmounts, the event listener persists
4. The listener still holds references to the component's state and functions
5. This creates a memory leak and causes unexpected behavior

## 🔍 Debugging Tips

When testing, watch for:

- **Console logs** prefixed with `🔵 [Remote MFE]` appearing after unmount
- **Click counter** continuing to increment after component is gone
- **Multiple event listeners** accumulating with each mount/unmount cycle
- **Memory usage** increasing in browser DevTools Performance tab

## 📝 Common Scenarios Where This Bug Appears

1. **Window resize listeners** - Components listening to window resize events
2. **Scroll listeners** - Components tracking scroll position
3. **Custom events** - Inter-MFE communication via custom events
4. **Keyboard shortcuts** - Global keyboard event handlers
5. **WebSocket/SSE connections** - Real-time data connections

## ✅ How to Fix

The fix depends on ensuring cleanup functions are properly called:

1. **Always use useEffect** for side effects like event listeners
2. **Always return a cleanup function** that removes listeners
3. **Test unmount behavior** thoroughly in development
4. **Use React DevTools** to verify component unmounting
5. **Consider using refs** to avoid stale closures

## 🤝 Contributing

If you find issues or have improvements, please feel free to:

1. Open an issue
2. Submit a pull request
3. Share your findings

## 📚 Additional Resources

- [React useEffect Hook](https://react.dev/reference/react/useEffect)
- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)
- [Memory Leaks in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management)

## 📄 License

This is a proof of concept for educational and debugging purposes.

---

## Previous Documentation

For information about the HTML-based POC that was previously in this repository, see `VERIFICATION_REPORT.md`.
