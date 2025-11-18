# MFE Event Listener Bug POC - Verification Results

## Summary

This repository contains multiple demonstrations of the microfrontend event listener accumulation bug:

1. **React Application** - Full React project with proper structure (Recommended)
2. **React POC (HTML)** - Single-file React demo with side-by-side comparison
3. **Interactive Simulation** - Vanilla JS simulation showing the bug in action

## Repository Structure

### 1. React Application (Proper Project)
**react-mfe-simulation/** - Production-ready React application
- **Vite + React 18** setup with modern build tooling
- **Separate JSX components** for each microfrontend
- **Component-based architecture** with proper organization
- **Real-time event logging** and interactive controls
- [See react-mfe-simulation/README.md for full documentation](react-mfe-simulation/README.md)

### 2. React POC Files (Single HTML File)
1. **event-listener-poc.html** - Original POC (saved for reference)
2. **event-listener-poc-FIXED.html** - Corrected version that works properly
3. **VERIFICATION_REPORT.md** - Detailed technical verification report

### 3. Interactive Simulation (Vanilla JS)
**simulation/** - Self-contained browser-based simulation
- **index.html** - Interactive UI for demonstrating the bug
- **simulation.js** - Core simulation logic
- **README.md** - Detailed usage instructions
- **package.json** - Project metadata

## 🚀 Quick Start

### Option 1: React Application (Recommended for Production)
```bash
cd react-mfe-simulation
npm install
npm run dev
# Open http://localhost:5173
```
[Full setup instructions →](react-mfe-simulation/README.md)

**Features:**
- ✅ Proper React project structure with separate JSX files
- ✅ Side-by-side comparison of buggy vs. fixed components
- ✅ Interactive mount/unmount controls
- ✅ Real-time event logging with color coding
- ✅ Live statistics and code examples

### Option 2: Interactive Simulation (No Installation Required)
```bash
cd simulation
open index.html  # or just drag into browser
```
[Full usage guide →](simulation/README.md)

**Features:**
- ✅ No build tools or dependencies required
- ✅ Runs directly in any modern browser
- ✅ Add/remove components dynamically
- ✅ Visualize listener accumulation in real-time

### Option 3: React POC HTML (Quick Demo)
```bash
open event-listener-poc-FIXED.html  # or drag into browser
```

**Features:**
- ✅ Single HTML file with React via CDN
- ✅ Side-by-side buggy and fixed components
- ✅ Quick demonstration without installation

---

## ✅ What's CORRECT

Your POC correctly demonstrates:

1. **✅ Standard Browser APIs** - Uses `window.addEventListener`, `window.dispatchEvent`, `new CustomEvent` (not custom EventTarget)
2. **✅ Buggy Pattern** - Listener attached in component body, outside useEffect
3. **✅ No Cleanup** - No `removeEventListener` in buggy version
4. **✅ Fixed Pattern** - Listener in useEffect with proper cleanup and empty deps `[]`
5. **✅ stopImmediatePropagation** - Both handlers call it correctly
6. **✅ Listener Tracking** - Counter increments showing accumulation
7. **✅ Evidence Logging** - Comprehensive, timestamped, color-coded logs
8. **✅ UI/UX** - Excellent design, clear instructions, side-by-side comparison

---

## ❌ Critical Issue Found

### Problem: Infinite Render Loop

**Location:** BuggyMFE2 component, line 178

```javascript
const BuggyMFE2 = ({ addLog }) => {
  // ... component logic ...

  // ❌ PROBLEM: This runs during render phase
  window.addEventListener('openPopup', handleOpenPopup);
  listenersAttached.current++;
  addLog(`🔴 BUGGY: Attached listener...`, 'attach');  // ← Calls setLogs in parent!

  return <div>...</div>;
};
```

### Why This Breaks

1. BuggyMFE2 renders
2. `addLog` called **during render** → updates App state (logs array)
3. App re-renders with new logs
4. BuggyMFE2 re-renders
5. `addLog` called again → updates App state
6. **→ INFINITE LOOP** 🔄

### React Rule Violated

> **Never update state during the render phase.**
>
> State updates during render cause the component to re-render immediately. If the same update happens again, it creates an infinite loop.

### Impact

- Browser may freeze/become unresponsive
- React may throw error: "Cannot update during an existing state transition"
- POC won't function

---

## ✅ The Fix

The corrected version (**event-listener-poc-FIXED.html**) uses `useLayoutEffect` for logging:

```javascript
const BuggyMFE2 = ({ addLog }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const renderCount = useRef(0);
  const listenersAttached = useRef(0);
  const prevRenderCount = useRef(0);

  renderCount.current++;
  const currentRender = renderCount.current;

  const handleOpenPopup = (e) => {
    addLog(`❌ BUGGY Listener #${currentRender} received event`, 'block');
    e.stopImmediatePropagation();
    setIsPopupOpen(true);
    setPopupData(e.detail);
  };

  // ❌ BUG STILL PRESENT: Attach listener on every render (this is the bug we're demonstrating!)
  window.addEventListener('openPopup', handleOpenPopup);
  listenersAttached.current++;

  // ✅ FIX FOR INFINITE LOOP: Log AFTER render
  useLayoutEffect(() => {
    if (prevRenderCount.current !== renderCount.current) {
      addLog(`🔴 BUGGY: Attached listener #${currentRender} (Total: ${listenersAttached.current})`, 'attach');
      prevRenderCount.current = renderCount.current;
    }
  });

  return (/* ... */);
};
```

### Why This Works

- **Listener still attached in component body** (demonstrates the bug ✓)
- **No cleanup** (demonstrates the bug ✓)
- **Logging happens in useLayoutEffect** (runs after render, prevents infinite loop ✓)
- **Doesn't change the bug being demonstrated** ✓

---

## 🧪 Testing the Fixed Version

### Expected Behavior

1. **Open event-listener-poc-FIXED.html in browser**
   - Should load without freezing
   - Should show both components with 1 render, appropriate listener counts
   - No console errors

2. **Click "Force Re-render" on BUGGY 5 times**
   - Render count: 6
   - Listener count: 6 (accumulating!)
   - Log shows: "🔴 BUGGY: Attached listener #1", "#2", "#3"... etc.

3. **Click "Force Re-render" on FIXED 5 times**
   - Render count: 6
   - Listener count: 1 (stays constant!)
   - Log shows: "🟢 FIXED: Attached listener", "🧹 Removed listener" alternating

4. **Click "Dispatch Event"**
   - Log shows: "📡 MFE1: Dispatching event #1"
   - Log shows: "❌ BUGGY Listener #1 received event" (NOT #6!)
   - **This proves first-listener-wins!**
   - Popup opens

5. **Verify First-Listener-Wins Mechanism**
   - Even though buggy version has 6 listeners
   - Listener #1 (oldest) executes first
   - Calls `stopImmediatePropagation()`
   - Listeners #2-6 are blocked and never execute
   - This is the core of the bug!

---

## 📊 Verification Checklist

| Criterion | Original POC | Fixed POC |
|-----------|--------------|-----------|
| Uses window.addEventListener | ✅ | ✅ |
| Buggy: No useEffect | ✅ | ✅ |
| Buggy: No cleanup | ✅ | ✅ |
| Fixed: useEffect with cleanup | ✅ | ✅ |
| stopImmediatePropagation | ✅ | ✅ |
| Listener tracking | ✅ | ✅ |
| Evidence logging | ✅ | ✅ |
| **No infinite loops** | ❌ | ✅ |
| **Works in browser** | ❌ | ✅ |

---

## 🎯 Recommendation

**Use event-listener-poc-FIXED.html** for your demonstration.

The original POC had the right idea and excellent implementation, but needs the infinite loop fix to actually work.

---

## 📝 What the POC Proves

When this fixed POC runs, it proves:

1. **Listener Accumulation**: Without useEffect, each render attaches a new listener
2. **No Cleanup**: Old listeners are never removed
3. **FIFO Execution**: Listeners execute in attachment order (oldest first)
4. **stopImmediatePropagation Blocking**: First listener blocks all others
5. **The Real-World Bug**: If oldest listener has stale closure/state, popup won't open correctly
6. **The Fix Works**: useEffect with cleanup prevents accumulation

This matches your real-world microfrontend issue perfectly!

---

## 🔍 Next Steps

1. ✅ Review the fixed POC (event-listener-poc-FIXED.html)
2. ✅ Test it in your browser
3. ✅ Follow the reproduction steps
4. ✅ Observe the first-listener-wins behavior
5. ✅ Use it to educate your team about the bug

---

## Questions?

See **VERIFICATION_REPORT.md** for detailed technical analysis, including:
- Line-by-line code review
- React lifecycle explanation
- Alternative fix approaches
- Comprehensive testing recommendations

**Your POC concept is excellent!** Just needed a small fix to prevent the infinite loop.
