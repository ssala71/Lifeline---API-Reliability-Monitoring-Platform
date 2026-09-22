import { useEffect, useState } from 'react';
import { api } from '../services/api';
import AddServiceForm from '../components/AddServiceForm';
import ServiceMetrics from '../components/ServiceMetrics';
import type { Service } from '../types';

// ---------------------------------------------------------------------------
// Design tokens
// A monitoring tool lives on a screen someone glances at, not reads — status
// needs to register in the periphery. Colors are quieter than typical
// "alert red / success green" defaults so a grid of healthy services doesn't
// compete for attention, and DOWN stays the loudest thing on the page.
// ---------------------------------------------------------------------------
const colors = {
  bg: '#12161C',
  surface: '#1B212B',
  surfaceRaised: '#212836',
  border: '#2A3240',
  borderSubtle: '#232A36',
  text: '#E4E7EC',
  textMuted: '#8891A1',
  textFaint: '#5B6474',
  accent: '#4FB8D9',
  healthy: '#3ED598',
  degraded: '#E8B347',
  down: '#EF6461',
  unknown: '#5B6474',
};

const statusMeta: Record<string, { color: string; label: string }> = {
  HEALTHY: { color: colors.healthy, label: 'Healthy' },
  DEGRADED: { color: colors.degraded, label: 'Degraded' },
  DOWN: { color: colors.down, label: 'Down' },
};

const fontSans =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif";
const fontMono =
  "'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace";

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: colors.bg,
    color: colors.text,
    fontFamily: fontSans,
    padding: '32px 24px 64px',
  },
  container: {
    maxWidth: 1080,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 28,
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  subtitle: {
    margin: '4px 0 0',
    fontSize: 14,
    color: colors.textMuted,
  },
  pulseWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: colors.textMuted,
  },
  errorBanner: {
    padding: '12px 16px',
    backgroundColor: 'rgba(239, 100, 97, 0.1)',
    border: `1px solid rgba(239, 100, 97, 0.35)`,
    borderRadius: 8,
    marginBottom: 24,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    fontSize: 14,
  },
  retryButton: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: colors.down,
    border: `1px solid rgba(239, 100, 97, 0.5)`,
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    flexShrink: 0,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '36px 0 14px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: colors.text,
  },
  addToggle: {
    padding: '7px 14px',
    backgroundColor: 'transparent',
    color: colors.accent,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
  },
  addFormWrap: {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
  },
  stateBlock: {
    textAlign: 'center',
    padding: '56px 20px',
    color: colors.textMuted,
    fontSize: 14,
  },
  emptyBlock: {
    textAlign: 'center',
    padding: '48px 20px',
    border: `1px dashed ${colors.border}`,
    borderRadius: 10,
    color: colors.textMuted,
  },
  grid: {
    display: 'grid',
    gap: 14,
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  },
  card: {
    position: 'relative',
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: '16px 16px 16px 18px',
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardName: {
    margin: 0,
    fontSize: 15,
    fontWeight: 600,
  },
  cardUrl: {
    margin: '4px 0 0',
    fontSize: 12.5,
    fontFamily: fontMono,
    color: colors.textFaint,
    wordBreak: 'break-all',
    lineHeight: 1.5,
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    marginTop: 14,
    fontSize: 13,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
  },
  disabledTag: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.textFaint,
    border: `1px solid ${colors.border}`,
    borderRadius: 4,
    padding: '2px 6px',
    flexShrink: 0,
  },
  actions: {
    display: 'flex',
    gap: 8,
    marginTop: 16,
  },
  toggleBtn: {
    flex: 1,
    padding: '7px 12px',
    borderRadius: 6,
    border: `1px solid ${colors.border}`,
    backgroundColor: 'transparent',
    color: colors.text,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
  },
  deleteBtn: {
    padding: '7px 12px',
    borderRadius: 6,
    border: `1px solid ${colors.border}`,
    backgroundColor: 'transparent',
    color: colors.textMuted,
    cursor: 'pointer',
    fontSize: 13,
  },
};

export default function Dashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getServices();
      setServices(data);
    } catch (err: any) {
      setError(err.message || 'Could not connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddNewService = async (newServiceData: Omit<Service, 'id' | 'status'>) => {
    try {
      const created = await api.addService(newServiceData);
      setServices(prev => [created, ...prev]);
      setShowAddForm(false);
    } catch (err: any) {
      alert(`Error adding service: ${err.message}`);
    }
  };

  const handleToggleEnable = async (id: number, currentStatus: boolean) => {
    try {
      const updated = await api.toggleService(id, !currentStatus);
      setServices(services.map(s => (s.id === id ? updated : s)));
    } catch (err: any) {
      alert(`Error toggling service: ${err.message}`);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.deleteService(id);
      setServices(services.filter(s => s.id !== id));
    } catch (err: any) {
      alert(`Error deleting service: ${err.message}`);
    }
  };

  const anyDown = services.some(s => s.enabled && s.status === 'DOWN');

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Lifeline</h1>
            <p style={styles.subtitle}>Watching {services.length} service{services.length === 1 ? '' : 's'}</p>
          </div>
          {!loading && !error && (
            <div style={styles.pulseWrap}>
              <span
                style={{
                  ...styles.statusDot,
                  backgroundColor: anyDown ? colors.down : colors.healthy,
                  animation: anyDown ? 'lifeline-pulse 1.6s ease-in-out infinite' : 'none',
                }}
              />
              {anyDown ? 'Attention needed' : 'All systems normal'}
            </div>
          )}
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <span>{error}</span>
            <button
              onClick={fetchServices}
              style={styles.retryButton}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(239, 100, 97, 0.12)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Retry
            </button>
          </div>
        )}

        <ServiceMetrics services={services} />

        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Monitored services</h2>
          <button
            style={styles.addToggle}
            onClick={() => setShowAddForm(v => !v)}
            onMouseEnter={e => (e.currentTarget.style.borderColor = colors.accent)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = colors.border)}
          >
            {showAddForm ? 'Cancel' : '+ Add service'}
          </button>
        </div>

        {showAddForm && (
          <div style={styles.addFormWrap}>
            <AddServiceForm onAddService={handleAddNewService} />
          </div>
        )}

        {loading ? (
          <div style={styles.stateBlock}>Loading services…</div>
        ) : services.length === 0 ? (
          <div style={styles.emptyBlock}>
            <p style={{ margin: '0 0 4px', color: colors.text, fontWeight: 600, fontSize: 15 }}>
              No services yet
            </p>
            <p style={{ margin: 0 }}>Add a URL above to start watching it.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {services.map(service => {
              const meta = statusMeta[service.status] ?? { color: colors.unknown, label: service.status };
              return (
                <div key={service.id} style={{ ...styles.card, opacity: service.enabled ? 1 : 0.55 }}>
                  <span style={{ ...styles.cardAccent, backgroundColor: meta.color }} />
                  <div style={styles.cardTop}>
                    <div>
                      <h3 style={styles.cardName}>{service.name}</h3>
                      <p style={styles.cardUrl}>{service.url}</p>
                    </div>
                    {!service.enabled && <span style={styles.disabledTag}>Disabled</span>}
                  </div>

                  <div style={styles.statusRow}>
                    <span style={{ ...styles.statusDot, backgroundColor: meta.color }} />
                    <span style={{ color: meta.color, fontWeight: 600 }}>{meta.label}</span>
                  </div>

                  <div style={styles.actions}>
                    <button
                      onClick={() => handleToggleEnable(service.id, service.enabled)}
                      style={styles.toggleBtn}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = colors.accent)}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = colors.border)}
                    >
                      {service.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      style={styles.deleteBtn}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = colors.down;
                        e.currentTarget.style.color = colors.down;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = colors.border;
                        e.currentTarget.style.color = colors.textMuted;
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes lifeline-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}