import type { HealthCheck, Incident, Service } from '../types';
import { countStatuses } from '../utils/dashboard';

interface Props {
  services: Service[];
  incidents: Incident[];
  latestChecks: Record<number, HealthCheck>;
}

const colors = {
  surface: '#1B212B',
  border: '#2A3240',
  text: '#E4E7EC',
  muted: '#8891A1',
  healthy: '#3ED598',
  degraded: '#E8B347',
  down: '#EF6461',
  unknown: '#5B6474',
};

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function formatDuration(seconds: number | null) {
  if (seconds === null) return 'Ongoing';
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60);
  return minutes ? `${minutes}m ${remaining}s` : `${remaining}s`;
}

export default function ServiceMetrics({ services, incidents, latestChecks }: Props) {
  const { total, HEALTHY: healthy, DEGRADED: degraded, DOWN: down, UNKNOWN: unknown } = countStatuses(services);
  const names = new Map(services.map(service => [service.id, service.name]));
  const measured = services
    .map(service => ({ service, check: latestChecks[service.id] }))
    .filter(item => item.check?.response_time_ms !== null && item.check?.response_time_ms !== undefined);
  const maxResponse = Math.max(...measured.map(item => item.check.response_time_ms ?? 0), 1);

  const card = (label: string, value: number, color: string) => (
    <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 8, padding: 14 }}>
      <div style={{ color: colors.muted, fontSize: 12 }}>{label}</div>
      <div style={{ color, fontSize: 24, fontWeight: 600, marginTop: 4 }}>{value}</div>
    </div>
  );

  return (
    <section style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
        {card('Total', total, colors.text)}
        {card('Healthy', healthy, colors.healthy)}
        {card('Degraded', degraded, colors.degraded)}
        {card('Down', down, colors.down)}
        {card('Unknown', unknown, colors.unknown)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 8, padding: 16 }}>
          <h3 style={{ color: colors.text, fontSize: 15, margin: '0 0 16px' }}>Latest response times</h3>
          {measured.length === 0 ? (
            <p style={{ color: colors.muted, fontSize: 13, margin: 0 }}>No health checks recorded yet.</p>
          ) : measured.map(({ service, check }) => (
            <div key={service.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.muted, fontSize: 12, marginBottom: 5 }}>
                <span>{service.name}</span>
                <span>{check.response_time_ms} ms</span>
              </div>
              <div style={{ backgroundColor: '#2A3240', borderRadius: 4, height: 7 }}>
                <div style={{ backgroundColor: check.status === 'DEGRADED' ? colors.degraded : check.status === 'DOWN' ? colors.down : colors.healthy, borderRadius: 4, height: '100%', width: `${Math.max(4, ((check.response_time_ms ?? 0) / maxResponse) * 100)}%` }} />
              </div>
              <div style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>
                HTTP {check.status_code ?? '—'} · checked {formatDate(check.checked_at)}
              </div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 8, padding: 16 }}>
          <h3 style={{ color: colors.text, fontSize: 15, margin: '0 0 16px' }}>Recent incidents</h3>
          {incidents.length === 0 ? (
            <p style={{ color: colors.muted, fontSize: 13, margin: 0 }}>No incidents recorded.</p>
          ) : incidents.slice(0, 5).map(incident => (
            <div key={incident.id} style={{ borderLeft: `3px solid ${incident.resolved_at ? colors.healthy : colors.down}`, backgroundColor: '#212836', borderRadius: 5, padding: '9px 10px', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.text, fontSize: 13, fontWeight: 600 }}>
                <span>{names.get(incident.service_id) ?? `Service #${incident.service_id}`}</span>
                <span style={{ color: incident.resolved_at ? colors.healthy : colors.down, fontSize: 11 }}>{incident.resolved_at ? 'Resolved' : 'Active'}</span>
              </div>
              <div style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{incident.reason ?? 'Health check failed'}</div>
              <div style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>Downtime: {formatDuration(incident.downtime_seconds)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
