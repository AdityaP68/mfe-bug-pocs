# React Microfrontend Event Listener Bug Simulation

A proper React project demonstrating how event listener accumulation causes race conditions in microfrontend applications.

## 🎯 What This Demonstrates

This React application shows a critical bug pattern in microfrontend architectures:

1. **Missing Cleanup** - Components attach global event listeners but forget to clean them up
2. **Listener Accumulation** - Each render/mount adds a new listener without removing old ones
3. **FIFO Execution** - Event listeners execute in the order they were attached (oldest first)
4. **stopImmediatePropagation** - First listener blocks all subsequent listeners
5. **Stale Closures** - Old listeners have references to outdated state/props

## 📁 Project Structure

```
react-mfe-simulation/
├── index.html                      # Entry point
├── vite.config.js                  # Vite configuration
├── package.json                    # Dependencies
├── src/
│   ├── main.jsx                    # React app entry
│   ├── App.jsx                     # Main application component
│   ├── App.css                     # App styles
│   ├── index.css                   # Global styles
│   └── components/
│       ├── BuggyMFE.jsx            # Component with bug (no cleanup)
│       ├── FixedMFE.jsx            # Component with proper cleanup
│       ├── EventDispatcher.jsx     # Dispatches global events
│       ├── EventLog.jsx            # Displays event log
│       ├── MFEComponent.css        # MFE component styles
│       ├── EventDispatcher.css     # Dispatcher styles
│       └── EventLog.css            # Log styles
└── README.md                       # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Navigate to project directory
cd react-mfe-simulation

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173` (or another port if 5173 is busy).

### Build for Production

```bash
npm run build
npm run preview
```

## 🧪 How to Reproduce the Bug

### Scenario 1: Basic Listener Accumulation

1. **Initial State**: Both components are mounted
   - Buggy MFE: 1 render, 1 listener
   - Fixed MFE: 1 render, 1 active listener

2. **Force Re-render Buggy MFE** (click 5 times)
   - Buggy MFE: 6 renders, **6 listeners** ⚠️
   - Fixed MFE: 1 render, 1 active listener ✅

3. **Dispatch Event**
   - Log shows: "BUGGY Listener #1 received event"
   - Only listener #1 executes (not #6!)
   - Proof: First listener wins, blocks others

### Scenario 2: Stale Closure Problem

1. **Force Re-render Buggy MFE** multiple times
2. Each re-render creates a new listener with a new closure
3. **Dispatch Event**
4. Observe: Listener from render #1 executes (stale closure)
5. Later renders' listeners are blocked

### Scenario 3: Ghost Listeners After Unmount

1. **Unmount Buggy MFE**
2. Log shows: "Unmounting Buggy MFE"
3. **WARNING**: Listeners are still attached to window!
4. **Dispatch Event**
5. Observe: Unmounted component's listener still executes!
6. This is a **memory leak** and can cause errors

### Scenario 4: Fixed vs Buggy Comparison

1. **Force Re-render Both** components multiple times
2. **Buggy MFE**:
   - Listeners: 6, 7, 8... (keeps growing) ⚠️
   - Same listener #1 always executes
3. **Fixed MFE**:
   - Active listeners: Always 1 ✅
   - Cleanup happens on every re-render
   - Most recent listener executes

## 🐛 The Bug Explained

### Buggy Pattern (BuggyMFE.jsx)

```jsx
function BuggyMFE({ addLog }) {
  const renderCount = useRef(0)
  renderCount.current++

  const handleOpenPopup = (e) => {
    // Handler captures render count in closure
    console.log(`Listener #${renderCount.current} received event`)
    e.stopImmediatePropagation()
    // Handle event...
  }

  // ❌ BUG: Listener attached on every render (outside useEffect)
  window.addEventListener('openPopup', handleOpenPopup)

  // ❌ NO CLEANUP!
  // Listeners accumulate forever

  return <div>...</div>
}
```

**Why this breaks:**
- `addEventListener` runs on **every render**
- Each render creates a **new** `handleOpenPopup` function with a **new closure**
- Old listeners are **never removed**
- Listeners accumulate: 1, 2, 3, 4... infinitely
- First listener (oldest) always executes first
- `stopImmediatePropagation()` blocks all other listeners

### Fixed Pattern (FixedMFE.jsx)

```jsx
function FixedMFE({ addLog }) {
  useEffect(() => {
    const handleOpenPopup = (e) => {
      console.log('Fixed listener received event')
      e.stopImmediatePropagation()
      // Handle event...
    }

    // ✅ Attach listener once
    window.addEventListener('openPopup', handleOpenPopup)

    // ✅ CLEANUP: Remove listener on unmount/re-render
    return () => {
      window.removeEventListener('openPopup', handleOpenPopup)
    }
  }, []) // Empty deps = runs once on mount, cleanup on unmount

  return <div>...</div>
}
```

**Why this works:**
- `useEffect` with empty `[]` deps runs **once** on mount
- Cleanup function runs on **unmount**
- Only **one listener** is ever attached
- Old listener is **removed** before component unmounts
- No accumulation, no stale closures

## 🎓 Key Concepts

### 1. Event Listener Lifecycle

| Phase | Buggy MFE | Fixed MFE |
|-------|-----------|-----------|
| Mount | ✅ Attach listener #1 | ✅ Attach listener #1 |
| Re-render | ❌ Attach listener #2 (accumulates!) | ✅ Nothing (useEffect doesn't run) |
| Unmount | ❌ Listener still active! | ✅ Cleanup removes listener |

### 2. stopImmediatePropagation()

```javascript
// 3 listeners attached to same event
window.addEventListener('openPopup', listener1) // Attached first
window.addEventListener('openPopup', listener2)
window.addEventListener('openPopup', listener3)

window.dispatchEvent(new CustomEvent('openPopup'))

// Execution order:
// 1. listener1 executes
// 2. listener1 calls stopImmediatePropagation()
// 3. listener2 BLOCKED (never executes)
// 4. listener3 BLOCKED (never executes)
```

### 3. Closure Capture

```javascript
function BuggyMFE() {
  let renderCount = 0

  // Render 1: renderCount = 1
  renderCount = 1
  const handler1 = () => console.log(renderCount) // Captures 1

  // Render 2: renderCount = 2
  renderCount = 2
  const handler2 = () => console.log(renderCount) // Captures 2

  // Both handlers attached, but handler1 executes first
  // Output: 1 (not 2!)
}
```

## 💡 Real-World Impact

### In a Microfrontend Application:

- **MFE-1** (Shopping Cart) mounts on page load
- **MFE-2** (Product Details) mounts when user views product
- **MFE-3** (Checkout) mounts when user clicks checkout

All three listen to `openPaymentModal` event.

**Without proper cleanup:**
1. User opens 5 different products (MFE-2 mounts/unmounts 5 times)
2. User proceeds to checkout
3. User clicks "Pay Now" → `openPaymentModal` dispatched
4. **Bug**: MFE-2's first (unmounted) listener executes
5. **Bug**: MFE-2 calls `stopImmediatePropagation()`
6. **Bug**: MFE-3 (Checkout) never receives event
7. **Result**: Payment modal doesn't open! 💥

## 📊 Component Comparison

| Feature | Buggy MFE | Fixed MFE |
|---------|-----------|-----------|
| Listener location | Component body ❌ | useEffect ✅ |
| Cleanup | None ❌ | return () => ... ✅ |
| Dependencies | N/A | Empty [] ✅ |
| Listeners after 5 renders | 5 ❌ | 1 ✅ |
| Listeners after unmount | 5 (leaked!) ❌ | 0 ✅ |
| Memory leak | Yes ❌ | No ✅ |
| Stale closures | Yes ❌ | No ✅ |

## 🔍 Debugging Tips

### Check Active Listeners

```javascript
// In browser console
getEventListeners(window)['openPopup']
// Shows all attached listeners for 'openPopup' event
```

### Monitor Memory Leaks

1. Open Chrome DevTools → Performance tab
2. Record session while mounting/unmounting components
3. Look for increasing memory usage
4. Buggy version will show memory growth

### React DevTools

Use React DevTools Profiler to see:
- How many times components re-render
- Why components re-render
- Performance impact

## ✅ Best Practices

### 1. Always Clean Up Side Effects

```javascript
useEffect(() => {
  // Setup
  const handler = () => {}
  window.addEventListener('event', handler)

  // Cleanup
  return () => {
    window.removeEventListener('event', handler)
  }
}, [])
```

### 2. Use Empty Dependency Array for Global Listeners

```javascript
// ✅ Good: Attach once, cleanup on unmount
useEffect(() => {
  // ...
}, [])

// ❌ Bad: No cleanup
window.addEventListener('event', handler)

// ❌ Bad: Runs on every render
useEffect(() => {
  window.addEventListener('event', handler)
})
```

### 3. Consider Custom Hooks

```javascript
function useGlobalEvent(eventName, handler) {
  useEffect(() => {
    window.addEventListener(eventName, handler)
    return () => window.removeEventListener(eventName, handler)
  }, [eventName, handler])
}

// Usage
function MyComponent() {
  useGlobalEvent('openPopup', handleOpenPopup)
}
```

## 🛠 Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **JavaScript (JSX)** - Component syntax
- **CSS Modules** - Component styling

## 📚 Learn More

- [React useEffect Hook](https://react.dev/reference/react/useEffect)
- [Cleaning up Effects](https://react.dev/learn/synchronizing-with-effects#step-3-add-cleanup-if-needed)
- [Event.stopImmediatePropagation()](https://developer.mozilla.org/en-US/docs/Web/API/Event/stopImmediatePropagation)
- [Microfrontend Architecture](https://martinfowler.com/articles/micro-frontends.html)

## 🤝 Contributing

This is a demonstration project. Suggestions for improvements are welcome!

## 📄 License

MIT
