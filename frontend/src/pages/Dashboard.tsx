import { useEffect, useState } from 'react';
import { api } from '../services/api';
import AddServiceForm from '../components/AddServiceForm';
import ServiceMetrics from '../components/ServiceMetrics';
import type { Service } from '../types';

export default function Dashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getServices();
      setServices(data);
    } catch (err: any) {
      setError(err.message || 'Could not connect to the FastAPI backend server.');
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
    } catch (err: any) {
      alert(`Error adding service: ${err.message}`);
    }
  };

  const handleToggleEnable = async (id: number, currentStatus: boolean) => {
    try {
      const updated = await api.toggleService(id, !currentStatus);
      setServices(services.map(s => s.id === id ? updated : s));
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

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#121212', minHeight: '100vh', color: 'white' }}>
      <h1 style={{ marginTop: 0 }}>Lifeline Dashboard</h1>
      
      {/* Backend Connection Error Banner */}
      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#7f1d1d', border: '1px solid #f87171', borderRadius: '6px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ {error}</span>
          <button onClick={fetchServices} style={{ padding: '4px 8px', backgroundColor: '#f87171', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Retry
          </button>
        </div>
      )}

      {/* Overview Charts & Counters */}
      <ServiceMetrics services={services} />

      <h2>Monitored Services</h2>
      <AddServiceForm onAddService={handleAddNewService} />
      
      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>
          <p>Loading services from backend...</p>
        </div>
      ) : services.length === 0 ? (
        /* Empty State Message */
        <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed #444', borderRadius: '8px', color: '#aaa' }}>
          <h3>No services monitored yet</h3>
          <p>Use the form above to register your first service URL.</p>
        </div>
      ) : (
        /* Responsive Grid Display */
        <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {services.map((service) => (
            <div 
              key={service.id} 
              style={{ 
                border: '1px solid #444', 
                padding: '15px', 
                borderRadius: '8px',
                backgroundColor: '#1e1e1e',
                opacity: service.enabled ? 1 : 0.6
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{service.name}</h3>
                <span style={{ fontSize: '12px', padding: '2px 6px', borderRadius: '4px', backgroundColor: service.enabled ? '#15803d' : '#374151' }}>
                  {service.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p style={{ margin: '5px 0', fontSize: '14px', color: '#aaa', wordBreak: 'break-all' }}>{service.url}</p>
              
              <div style={{ margin: '12px 0', padding: '10px', backgroundColor: '#262626', borderRadius: '6px', fontSize: '13px' }}>
                <p style={{ margin: '0 0 6px 0' }}>
                  Status: <strong style={{ 
                    color: service.status === 'HEALTHY' ? '#4ade80' : 
                           service.status === 'DEGRADED' ? '#facc15' : 
                           service.status === 'DOWN' ? '#f87171' : '#9ca3af' 
                  }}>
                    {service.status}
                  </strong>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  onClick={() => handleToggleEnable(service.id, service.enabled)}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    backgroundColor: service.enabled ? '#d97706' : '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {service.enabled ? 'Disable' : 'Enable'}
                </button>

                <button 
                  onClick={() => handleDeleteService(service.id)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}