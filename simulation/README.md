# Microfrontend Event Listener Bug Simulation

A simple, interactive demonstration of how event listener accumulation causes race conditions in microfrontend applications.

## 🎯 What This Simulates

This project demonstrates a common bug in microfrontend architectures where:

1. **Components attach global event listeners** (e.g., on `window`)
2. **Components forget to clean up listeners** on unmount (missing `removeEventListener`)
3. **Listeners accumulate** over time as components mount/unmount/re-render
4. **First listener wins** due to `stopImmediatePropagation()`
5. **Stale closures cause bugs** when old listeners execute with outdated state

## 🚀 Quick Start

### Option 1: Open Directly in Browser

Simply open `index.html` in any modern web browser. No build tools or dependencies required!

```bash
# From the simulation directory
open index.html  # macOS
# or
xdg-open index.html  # Linux
# or just drag the file into your browser
```

### Option 2: Run with Local Server

```bash
# Using Python 3
python3 -m http.server 8080

# Or using npm script
npm start

# Then open http://localhost:8080
```

## 🧪 How to Reproduce the Bug

### Step 1: Add Components

1. Click **"Add Component"** 3 times
2. Observe: 3 components are created (MFE-1, MFE-2, MFE-3)
3. Check status: "Total Listeners Attached: 3"

### Step 2: Trigger Event

1. Click **"Trigger Global Event"**
2. Observe the log output:
   ```
   📡 Triggering global event #1
   🎯 MFE-1 received event
   🛑 MFE-1 called stopImmediatePropagation()
   ⚡ Remaining listeners will NOT execute!
   ```
3. **Result**: Only MFE-1's listener executed, even though all 3 components are listening!

### Step 3: Update State (Show Stale Closure Problem)

1. Click **"Update State"** on MFE-2 and MFE-3
2. Their state changes to new values
3. Click **"Trigger Global Event"** again
4. Observe: MFE-1 still executes (with OLD state), blocking others
5. **Result**: MFE-2 and MFE-3's updated handlers never run!

### Step 4: Remove Component (Show Listener Leak)

1. Click **"Remove Component"** to unmount MFE-3
2. Observe log: "MFE-3 unmounted (listener still active!)"
3. Check status: "Active Components: 2" but "Total Listeners: 3"
4. Click **"Trigger Event"**
5. **Result**: MFE-1 still executes, blocking everyone (including the ghost listener from unmounted MFE-3)

## 🐛 The Bug Explained

### What's Happening?

```javascript
class MicroFrontendComponent {
    constructor(id) {
        this.handleGlobalEvent = (event) => {
            // Process event with current state
            console.log(this.state.data);

            // Block other listeners
            event.stopImmediatePropagation();
        };

        // ❌ BUG: Attach listener
        window.addEventListener('globalMFEEvent', this.handleGlobalEvent);
    }

    unmount() {
        // ❌ BUG: Forgot to remove listener!
        // Should call: window.removeEventListener('globalMFEEvent', this.handleGlobalEvent);
    }
}
```

### Why It Breaks

1. **Listener Accumulation**: Each component adds a listener, but they're never removed
2. **FIFO Execution**: Event listeners execute in the order they were attached
3. **stopImmediatePropagation**: First listener blocks all subsequent listeners
4. **Stale Closures**: Old listeners have references to old state/props
5. **Race Condition**: Which component was mounted first? That one always wins!

### Real-World Impact

In a real microfrontend application:

- MFE-1 might have been mounted 3 days ago
- MFE-2 (current version) just mounted with new logic
- User triggers action → MFE-1's old handler executes with stale state
- MFE-2's handler never runs → **Feature doesn't work!**
- Intermittent failures depending on mount order

## ✅ The Fix

### Proper Cleanup with useEffect (React Example)

```javascript
useEffect(() => {
    const handleEvent = (event) => {
        // Handle event
        event.stopImmediatePropagation();
    };

    // Attach listener
    window.addEventListener('globalMFEEvent', handleEvent);

    // ✅ CLEANUP: Remove listener on unmount
    return () => {
        window.removeEventListener('globalMFEEvent', handleEvent);
    };
}, []); // Empty deps = attach once, cleanup on unmount
```

### Why This Works

1. **Listener attached once** when component mounts
2. **Listener removed** when component unmounts
3. **No accumulation** - only active components have listeners
4. **No stale closures** - unmounted components don't interfere

## 📊 Testing Scenarios

### Scenario 1: Basic Accumulation

1. Add 5 components
2. Trigger event
3. Expected: Only MFE-1 executes

### Scenario 2: Stale State

1. Add 3 components
2. Update state on MFE-2 and MFE-3
3. Trigger event
4. Expected: MFE-1 executes with old state, others blocked

### Scenario 3: Ghost Listeners

1. Add 4 components
2. Remove 2 components
3. Trigger event
4. Expected: First remaining listener executes, but listener count shows extras

### Scenario 4: Mount Order Race Condition

1. Reset simulation
2. Add MFE-1 with initial state
3. Add MFE-2 with updated logic
4. Trigger event
5. Expected: MFE-1 (old logic) always wins, regardless of MFE-2's improvements

## 🎓 Key Takeaways

1. **Always clean up event listeners** in React useEffect, Vue onUnmounted, etc.
2. **Be careful with global event buses** in microfrontend architectures
3. **stopImmediatePropagation creates race conditions** based on listener order
4. **Listener accumulation causes memory leaks** and unexpected behavior
5. **Test mount/unmount cycles** thoroughly in your components

## 🔍 Code Structure

```
simulation/
├── index.html        # UI and styling
├── simulation.js     # Bug simulation logic
├── package.json      # Project metadata
└── README.md         # This file
```

## 📝 Notes

- This is a **simplified simulation** of a real microfrontend architecture
- Real-world MFEs might use module federation, iframes, or web components
- The core bug pattern is the same across all approaches
- Always test component lifecycle methods for proper cleanup

## 🤝 Contributing

This is a demonstration project. Feel free to:
- Add more scenarios
- Create variations showing different bugs
- Add visualizations
- Improve documentation

## 📄 License

MIT
