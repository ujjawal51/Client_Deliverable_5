import React from 'react';
import { Wifi, AlertTriangle } from 'lucide-react';

export default function NetworkSimulator({ isSlowNetwork, onToggleSlowNetwork, isGenerating }) {
  return (
    <section className="simulator-panel" aria-label="Network Simulation Panel">
      <div className="simulator-controls">
        <label className="toggle-label" htmlFor="slow-network-toggle">
          <input
            id="slow-network-toggle"
            type="checkbox"
            checked={isSlowNetwork}
            onChange={(e) => onToggleSlowNetwork(e.target.checked)}
            aria-label="Simulate Slow 2G Network"
          />
          <span>Simulate Slow 2G Network (2.5s Latency)</span>
        </label>

        <span
          className={`badge ${isSlowNetwork ? 'badge-simulated' : ''}`}
          aria-live="polite"
        >
          {isSlowNetwork ? (
            <>
              <AlertTriangle size={12} aria-hidden="true" />
              <span>Simulated 2G Active</span>
            </>
          ) : (
            <>
              <Wifi size={12} aria-hidden="true" />
              <span>High Speed (Local Cache)</span>
            </>
          )}
        </span>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
        Floor Worker Offline-First Resilience Enabled
      </div>
    </section>
  );
}
