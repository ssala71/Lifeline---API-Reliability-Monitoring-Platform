import { useState } from 'react';
import type { ServiceInput } from '../types';

interface Props {
  onAddService: (service: ServiceInput) => void;
}

export default function AddServiceForm({ onAddService }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    check_interval: 60,
    timeout: 10,
    slow_threshold: 500,
    failure_threshold: 3,
    enabled: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation checks
    if (!formData.name.trim() || !formData.url.trim()) {
      alert('Service Name and URL are required.');
      return;
    }

    if (formData.check_interval < 10 || formData.timeout < 1 || formData.slow_threshold < 1 || formData.failure_threshold < 1) {
      alert('Interval must be at least 10 seconds; all other numeric values must be greater than 0.');
      return;
    }

    onAddService(formData);
    setFormData(prev => ({ ...prev, name: '', url: '' }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Math.max(0, Number(value)) : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} style={{ backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '8px', marginBottom: '30px', color: 'white', border: '1px solid #444' }}>
      <h3 style={{ marginTop: 0 }}>Add New Service</h3>
      
      <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Service Name</label>
          <input required type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '90%', padding: '8px' }} placeholder="e.g. User API" />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>URL</label>
          <input required type="url" name="url" value={formData.url} onChange={handleChange} style={{ width: '90%', padding: '8px' }} placeholder="https://..." />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Check Interval (sec)</label>
          <input required min="10" type="number" name="check_interval" value={formData.check_interval} onChange={handleChange} style={{ width: '90%', padding: '8px' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Timeout (sec)</label>
          <input required min="1" type="number" name="timeout" value={formData.timeout} onChange={handleChange} style={{ width: '90%', padding: '8px' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Slow Threshold (ms)</label>
          <input required min="1" type="number" name="slow_threshold" value={formData.slow_threshold} onChange={handleChange} style={{ width: '90%', padding: '8px' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Failure Threshold</label>
          <input required min="1" type="number" name="failure_threshold" value={formData.failure_threshold} onChange={handleChange} style={{ width: '90%', padding: '8px' }} />
        </div>
      </div>

      <button type="submit" style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
        Add Service
      </button>
    </form>
  );
}
