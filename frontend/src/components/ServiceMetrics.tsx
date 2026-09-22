import type { Service } from '../types';

interface Props {
  services: Service[];
}

export default function ServiceMetrics({ services }: Props) {
  // Calculated summary counters
  const total = services.length;
  const healthy = services.filter(s => s.status === 'HEALTHY').length;
  const degraded = services.filter(s => s.status === 'DEGRADED').length;
  const down = services.filter(s => s.status === 'DOWN').length;
  const unknown = services.filter(s => s.status === 'UNKNOWN').length;

  // Mock incidents data
  const mockIncidents = [
    { id: 1, service: 'Legacy Database API', status: 'Active', started: '10 mins ago', message: 'Connection timed out' },
    { id: 2, service: 'Payment Gateway', status: 'Resolved', duration: '14 mins', message: 'High latency detected (>300ms)' },
  ];

  return (
    <div style={{ color: 'white', marginBottom: '30px' }}>
      {/* 1. Status Counter Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div style={cardStyle('#374151')}>
          <div style={{ fontSize: '12px', color: '#aaa' }}>Total Services</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{total}</div>
        </div>
        <div style={cardStyle('#14532d')}>
          <div style={{ fontSize: '12px', color: '#86efac' }}>Healthy</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4ade80' }}>{healthy}</div>
        </div>
        <div style={cardStyle('#713f12')}>
          <div style={{ fontSize: '12px', color: '#fde047' }}>Degraded</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#facc15' }}>{degraded}</div>
        </div>
        <div style={cardStyle('#7f1d1d')}>
          <div style={{ fontSize: '12px', color: '#fca5a5' }}>Down</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f87171' }}>{down}</div>
        </div>
        <div style={cardStyle('#374151')}>
          <div style={{ fontSize: '12px', color: '#d1d5db' }}>Unknown</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9ca3af' }}>{unknown}</div>
        </div>
      </div>

      {/* 2. Response Time Visualizer & Incidents Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Simple CSS Bar Chart for Response Times */}
        <div style={{ ...cardStyle('#1e1e1e'), border: '1px solid #444' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Response Time Metrics (ms)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={barLabelStyle}><span>Main Website</span><span>120 ms</span></div>
              <div style={barBgStyle}><div style={{ width: '24%', height: '100%', backgroundColor: '#4ade80', borderRadius: '4px' }}></div></div>
            </div>
            <div>
              <div style={barLabelStyle}><span>Payment Gateway</span><span>340 ms</span></div>
              <div style={barBgStyle}><div style={{ width: '68%', height: '100%', backgroundColor: '#facc15', borderRadius: '4px' }}></div></div>
            </div>
            <div>
              <div style={barLabelStyle}><span>Legacy Database API</span><span>0 ms (Timeout)</span></div>
              <div style={barBgStyle}><div style={{ width: '0%', height: '100%', backgroundColor: '#f87171', borderRadius: '4px' }}></div></div>
            </div>
          </div>
        </div>

        {/* Recent & Active Incidents */}
        <div style={{ ...cardStyle('#1e1e1e'), border: '1px solid #444' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Incidents</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {mockIncidents.map(incident => (
              <div key={incident.id} style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#2a2a2a', borderLeft: incident.status === 'Active' ? '4px solid #f87171' : '4px solid #4ade80' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold' }}>
                  <span>{incident.service}</span>
                  <span style={{ color: incident.status === 'Active' ? '#f87171' : '#4ade80', fontSize: '12px' }}>{incident.status}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>{incident.message}</div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                  {incident.status === 'Active' ? `Started: ${incident.started}` : `Downtime Duration: ${incident.duration}`}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
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