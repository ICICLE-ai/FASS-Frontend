import React, { useEffect, useState } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { fetchAllStats } from '../shared/reporting_api.js';
import { getSimulationInstanceId, getSimulationStep } from '../App.jsx';

// ---------------------------------------------------------------------------
// Stat row configuration — controls display order and grouping
// ---------------------------------------------------------------------------

const STAT_SECTIONS = [
  {
    heading: 'Food Access',
    rows: [
      { key: 'mean_food_score',     label: 'Mean Food Access Score',      unit: 'score' },
      { key: 'stddev_food_score',   label: 'Std Dev — Food Access Score', unit: 'score' },
      { key: 'pct_low_food_access', label: '% Low Food Access Households', unit: '%'   },
    ],
  },
  {
    heading: 'Store Proximity',
    rows: [
      { key: 'mean_distance_to_nearest_supermarket',   label: 'Mean Distance to Supermarket',  unit: 'miles' },
      { key: 'stddev_distance_to_nearest_supermarket', label: 'Std Dev — Distance',             unit: 'miles' },
    ],
  },
  {
    heading: 'Travel Time',
    rows: [
      { key: 'mean_travel_time_to_nearest_supermarket',   label: 'Mean Drive Time to Supermarket', unit: 'min' },
      { key: 'stddev_travel_time_to_nearest_supermarket', label: 'Std Dev — Drive Time',            unit: 'min' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatValue(value, unit) {
  if (value === null || value === undefined) return '—';
  if (unit === '%') return `${value.toFixed(1)}%`;
  return `${value} ${unit}`;
}

function getAccentColor(key, value) {
  if (value === null || value === undefined) return '#90b4d4';

  if (key === 'mean_food_score' || key === 'stddev_food_score') {
    if (value >= 75) return '#2e7d32';   
    if (value >= 50) return '#f59e0b';  
    return '#c0392b';                    
  }

  if (key === 'pct_low_food_access') {
    // Inverse — high % is bad
    if (value === 0)  return '#2e7d32';
    if (value < 20)   return '#f59e0b';
    return '#c0392b';
  }

  return '#1a6bbf'; // default blue for distance/travel time stats
}
// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ReportModal = ({ show, handleClose }) => {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!show) return;

    const simulationInstanceId = getSimulationInstanceId();
    const simulationStep       = getSimulationStep();

    if (!simulationInstanceId) {
      setError('No simulation selected. Please select a simulation instance first.');
      return;
    }

    setLoading(true);
    setError(null);
    setStats(null);

    fetchAllStats({ simulationInstanceId, simulationStep })
      .then(data => {
        setStats(data.stats);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load report. Please try again.');
        setLoading(false);
        console.error('ReportModal fetch error:', err);
      });
  }, [show]);

  return (
    <>
      <style>{`
        .report-modal .modal-content {
          background: #dbeafe;
          border: none;
          border-radius: 12px;
          color: #1e3a5f;
          font-family: 'Segoe UI', sans-serif;
          box-shadow: 0 8px 32px rgba(30, 58, 95, 0.18);
        }
        .report-modal .modal-header {
          background: #bfdbfe;
          border-bottom: 1px solid #93c5fd;
          border-radius: 12px 12px 0 0;
          padding: 1rem 1.5rem;
        }
        .report-modal .modal-title {
          font-weight: 700;
          font-size: 1.1rem;
          color: #000000;
          letter-spacing: 0.02em;
        }
        .report-modal .modal-footer {
          background: #bfdbfe;
          border-top: 1px solid #93c5fd;
          border-radius: 0 0 12px 12px;
        }
        .report-modal .btn-close {
          filter: brightness(0.4);
        }
        .report-subtitle {
          font-size: 0.72rem;
          color: #000000;
          letter-spacing: 0.06em;
          margin-top: 2px;
          font-weight: 500;
        }
        .report-section-heading {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #000000;
          margin: 12px 0 6px 2px;
        }
        .report-stat-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 6px;
        }
        .report-stat-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #eff6ff;
          border-radius: 8px;
          padding: 9px 14px;
          border-left: 4px solid #3b82f6;
          transition: background 0.15s;
        }
        .report-stat-row:hover {
          background: #e0f0ff;
        }
        .report-stat-label {
          font-size: 0.82rem;
          color: #374151;
          font-weight: 500;
        }
        .report-stat-value {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1a6bbf;
        }
        .report-stat-null {
          font-size: 0.9rem;
          color: #93c5fd;
        }
        .report-divider {
          border: none;
          border-top: 1px solid #93c5fd;
          margin: 10px 0 4px;
        }
        .report-close-btn {
          background: #1a6bbf;
          border: none;
          color: #fff;
          font-weight: 600;
          font-size: 0.85rem;
          padding: 8px 22px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
          letter-spacing: 0.02em;
        }
        .report-close-btn:hover {
          background: #1558a0;
        }
      `}</style>

      <Modal show={show} onHide={handleClose} centered dialogClassName="report-modal">
        <Modal.Header closeButton>
          <div>
            <Modal.Title>Simulation Report</Modal.Title>
            <div className="report-subtitle">
              Step {getSimulationStep()} &nbsp;·&nbsp; {getSimulationInstanceId() ?? 'No instance selected'}
            </div>
          </div>
        </Modal.Header>

        <Modal.Body style={{ padding: '1rem 1.5rem' }}>

          {/* Loading */}
          {loading && (
            <div className="d-flex align-items-center gap-2" style={{ color: '#3b82f6', fontSize: '0.85rem' }}>
              <Spinner animation="border" size="sm" style={{ color: '#1a6bbf' }} />
              <span>Loading stats…</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ color: '#c0392b', fontSize: '0.85rem', padding: '8px 0' }}>
              {error}
            </div>
          )}

          {/* Stats */}
          {stats && STAT_SECTIONS.map((section, si) => (
            <div key={section.heading}>
              {si > 0 && <hr className="report-divider" />}
              <p className="report-section-heading">{section.heading}</p>
              <div className="report-stat-grid">
                {section.rows.map(row => {
                  const stat  = stats[row.key];
                  const value = stat?.value ?? null;
                  const accent = getAccentColor(row.key, value);
                  return (
                    <div
                      className="report-stat-row"
                      key={row.key}
                      style={{ borderLeftColor: accent }}
                    >
                      <span className="report-stat-label">{row.label}</span>
                      {value !== null
                        ? <span className="report-stat-value" style={{ color: accent }}>
                            {formatValue(value, row.unit)}
                          </span>
                        : <span className="report-stat-null">—</span>
                      }
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </Modal.Body>

        <Modal.Footer>
          <button className="report-close-btn" onClick={handleClose}>Close</button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ReportModal;