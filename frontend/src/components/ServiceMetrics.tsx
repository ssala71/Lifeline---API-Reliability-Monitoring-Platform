import type { HealthCheck, Incident, Service } from '../types';
import { countStatuses } from '../utils/dashboard';

interface Props {
  services: Service[];
  incidents: Incident[];
  latestChecks: Record<number, HealthCheck>;
}

const cardStyle = (bg: string) => ({
  backgroundColor: bg,
  padding: '15px',
  borderRadius: '8px',
});

const barLabelStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '13px',
  marginBottom: '4px',
  color: '#ccc',
};

const barBgStyle = {
  width: '100%',
  height: '8px',
  backgroundColor: '#333',
  borderRadius: '4px',
  overflow: 'hidden' as const,
};

function formatDuration(seconds: number | null) {
  if (seconds === null) return 'Ongoing';
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60);
  return minutes ? `${minutes} mins ${remaining} secs` : `${remaining} secs`;
}

export default function ServiceMetrics({ services, incidents, latestChecks }: Props) {
  const { total, HEALTHY: healthy, DEGRADED: degraded, DOWN: down, UNKNOWN: unknown } = countStatuses(services);
  const serviceNames = new Map(services.map(service => [service.id, service.name]));
  const measured = services
    .map(service => ({ service, check: latestChecks[service.id] }))
    .filter(item => item.check?.response_time_ms !== null && item.check?.response_time_ms !== undefined);
  const maxResponse = Math.max(...measured.map(item => item.check.response_time_ms ?? 0), 1);

  return (
    <div style={{ color: 'white', marginBottom: '30px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div style={cardStyle('#374151')}><div style={{ fontSize: '12px', color: '#aaa' }}>Total Services</div><div style={{ fontSize: '24px', fontWeight: 'bold' }}>{total}</div></div>
        <div style={cardStyle('#14532d')}><div style={{ fontSize: '12px', color: '#86efac' }}>Healthy</div><div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4ade80' }}>{healthy}</div></div>
        <div style={cardStyle('#713f12')}><div style={{ fontSize: '12px', color: '#fde047' }}>Degraded</div><div style={{ fontSize: '24px', fontWeight: 'bold', color: '#facc15' }}>{degraded}</div></div>
        <div style={cardStyle('#7f1d1d')}><div style={{ fontSize: '12px', color: '#fca5a5' }}>Down</div><div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f87171' }}>{down}</div></div>
        <div style={cardStyle('#374151')}><div style={{ fontSize: '12px', color: '#d1d5db' }}>Unknown</div><div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9ca3af' }}>{unknown}</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div style={{ ...cardStyle('#1e1e1e'), border: '1px solid #444' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Response Time Metrics (ms)</h3>
          {measured.length === 0 ? (
            <p style={{ color: '#aaa', fontSize: '13px' }}>No health checks recorded yet.</p>
          ) : measured.map(({ service, check }) => (
            <div key={service.id} style={{ marginBottom: '12px' }}>
              <div style={barLabelStyle}><span>{service.name}</span><span>{check.response_time_ms} ms</span></div>
              <div style={barBgStyle}><div style={{ width: `${Math.max(4, ((check.response_time_ms ?? 0) / maxResponse) * 100)}%`, height: '100%', backgroundColor: check.status === 'DEGRADED' ? '#facc15' : check.status === 'DOWN' ? '#f87171' : '#4ade80', borderRadius: '4px' }} /></div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>HTTP {check.status_code ?? '—'} · {new Date(check.checked_at).toLocaleString()}</div>
            </div>
          ))}
        </div>

        <div style={{ ...cardStyle('#1e1e1e'), border: '1px solid #444' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Incidents</h3>
          {incidents.length === 0 ? (
            <p style={{ color: '#aaa', fontSize: '13px' }}>No incidents recorded.</p>
          ) : incidents.slice(0, 5).map(incident => (
            <div key={incident.id} style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#2a2a2a', borderLeft: incident.resolved_at ? '4px solid #4ade80' : '4px solid #f87171', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold' }}>
                <span>{serviceNames.get(incident.service_id) ?? `Service #${incident.service_id}`}</span>
                <span style={{ color: incident.resolved_at ? '#4ade80' : '#f87171', fontSize: '12px' }}>{incident.resolved_at ? 'Resolved' : 'Active'}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>{incident.reason ?? 'Health check failed'}</div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Downtime: {formatDuration(incident.downtime_seconds)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
