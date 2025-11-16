// Simulation State
let components = [];
let totalListeners = 0;
let eventCount = 0;
let componentIdCounter = 0;

// Simulate a Microfrontend Component
class MicroFrontendComponent {
    constructor(id) {
        this.id = id;
        this.name = `MFE-${id}`;
        this.state = {
            mounted: true,
            data: `Initial data from ${this.name}`
        };

        // Create the event handler (closure captures current state)
        this.handleGlobalEvent = (event) => {
            log(`🎯 ${this.name} received event`, 'execute');
            log(`   State: "${this.state.data}"`, 'execute');

            // Simulate processing
            console.log(`${this.name} processing event:`, event.detail);
            console.log(`${this.name} has state:`, this.state.data);

            // ⚠️ THE BUG: stopImmediatePropagation prevents other listeners from executing
            event.stopImmediatePropagation();
            log(`   🛑 ${this.name} called stopImmediatePropagation()`, 'block');
            log(`   ⚡ Remaining listeners will NOT execute!`, 'block');
        };

        // ❌ BUG: Attach listener but never remove it (missing cleanup)
        this.attachListener();
    }

    attachListener() {
        window.addEventListener('globalMFEEvent', this.handleGlobalEvent);
        totalListeners++;
        updateStatus();
        log(`🔴 ${this.name} attached listener (Total: ${totalListeners})`, 'attach');
    }

    // This should be called on unmount, but we'll simulate the bug where it's NOT called
    detachListener() {
        window.removeEventListener('globalMFEEvent', this.handleGlobalEvent);
        totalListeners--;
        updateStatus();
        log(`🟢 ${this.name} removed listener (Total: ${totalListeners})`, 'remove');
    }

    // Simulate state updates (to show stale closure problem)
    updateState(newData) {
        this.state.data = newData;
        log(`📝 ${this.name} state updated: "${newData}"`, 'info');
    }

    unmount() {
        this.state.mounted = false;
        // ❌ BUG SIMULATION: We DON'T call detachListener() here
        // In real code, this would be missing cleanup in useEffect
        log(`🔻 ${this.name} unmounted (listener still active!)`, 'info');
    }
}

// Add a new component
function addComponent() {
    const id = ++componentIdCounter;
    const component = new MicroFrontendComponent(id);
    components.push(component);

    renderComponents();
    log(`➕ Component ${component.name} mounted`, 'info');
}

// Remove the last component
function removeComponent() {
    if (components.length === 0) {
        log(`⚠️  No components to remove`, 'info');
        return;
    }

    const component = components.pop();
    component.unmount();

    renderComponents();
    updateStatus();
}

// Trigger the global event
function triggerEvent() {
    eventCount++;
    updateStatus();

    log(`\n📡 Triggering global event #${eventCount}`, 'trigger');
    log(`   Active components: ${components.filter(c => c.state.mounted).length}`, 'trigger');
    log(`   Total listeners attached: ${totalListeners}`, 'trigger');
    log(`   Expected: First listener will execute and block others`, 'trigger');

    const event = new CustomEvent('globalMFEEvent', {
        detail: {
            id: eventCount,
            timestamp: new Date().toISOString(),
            message: `Event #${eventCount} data`
        }
    });

    window.dispatchEvent(event);

    log(`✅ Event dispatched\n`, 'trigger');
}

// Reset the simulation
function resetSimulation() {
    // Remove all listeners properly
    components.forEach(component => {
        component.detachListener();
    });

    components = [];
    totalListeners = 0;
    eventCount = 0;
    componentIdCounter = 0;

    renderComponents();
    updateStatus();

    const logElement = document.getElementById('log');
    logElement.innerHTML = '';

    log(`🔄 Simulation reset`, 'info');
}

// Render the components UI
function renderComponents() {
    const container = document.getElementById('components-container');

    if (components.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: white; padding: 40px; font-size: 18px;">No components yet. Click "Add Component" to start!</div>';
        updateStatus();
        return;
    }

    container.innerHTML = components.map((component, index) => {
        const isMounted = component.state.mounted;
        const statusColor = isMounted ? '#4CAF50' : '#f44336';
        const statusText = isMounted ? 'Mounted' : 'Unmounted';

        return `
            <div class="component" style="border-left: 4px solid ${statusColor}">
                <h3>${component.name}</h3>
                <div class="component-info">
                    <strong>Status:</strong> ${statusText}<br>
                    <strong>Index:</strong> ${index}<br>
                    <strong>State:</strong> ${component.state.data}
                </div>
                <button
                    class="btn-trigger"
                    style="width: 100%; margin-top: 10px; padding: 8px; font-size: 12px;"
                    onclick="updateComponentState(${index})">
                    Update State
                </button>
            </div>
        `;
    }).join('');

    updateStatus();
}

// Update component state
function updateComponentState(index) {
    if (index >= 0 && index < components.length) {
        const component = components[index];
        const newData = `Updated data ${Date.now()}`;
        component.updateState(newData);
        renderComponents();
    }
}

// Update status display
function updateStatus() {
    document.getElementById('component-count').textContent = components.filter(c => c.state.mounted).length;
    document.getElementById('listener-count').textContent = totalListeners;
    document.getElementById('event-count').textContent = eventCount;
}

// Log messages
function log(message, type = 'info') {
    const logElement = document.getElementById('log');
    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.innerHTML = `<span class="log-time">[${time}]</span>${message}`;
    logElement.appendChild(entry);

    // Auto-scroll to bottom
    logElement.scrollTop = logElement.scrollHeight;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderComponents();
    updateStatus();
    log('🚀 Simulation initialized', 'info');
    log('💡 Click "Add Component" to add microfrontend components', 'info');
    log('💡 Click "Trigger Event" to see the bug in action', 'info');
});
