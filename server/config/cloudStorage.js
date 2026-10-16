// Shared Cloud Storage Bridge for real-time synchronization across devices
// Used automatically when MONGODB_URI is not set in environment

const CLOUD_BIN_URL = 'https://extendsclass.com/api/json-storage/bin/fecfccb';
const CLOUD_BIN_KEY = 'leadspro_secret_key_9981';

const DEFAULT_STATE = {
  version: '1.0',
  customers: [],
  agents: [],
  leads: [],
  admin: {
    email: 'admin@leadspro.com',
    username: 'admin',
    password: 'admin',
    name: 'Admin'
  }
};

export async function getCloudData() {
  try {
    const res = await fetch(`${CLOUD_BIN_URL}?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      const data = await res.json();
      return {
        customers: Array.isArray(data.customers) ? data.customers : [],
        agents: Array.isArray(data.agents) ? data.agents : [],
        leads: Array.isArray(data.leads) ? data.leads : [],
        admin: data.admin || DEFAULT_STATE.admin
      };
    }
  } catch (err) {
    console.error('Cloud storage fetch error:', err.message);
  }
  return DEFAULT_STATE;
}

export async function saveCloudData(data) {
  try {
    const payload = {
      version: '1.0',
      customers: data.customers || [],
      agents: data.agents || [],
      leads: data.leads || [],
      admin: data.admin || DEFAULT_STATE.admin,
      updatedAt: new Date().toISOString()
    };

    const res = await fetch(CLOUD_BIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Security-key': CLOUD_BIN_KEY
      },
      body: JSON.stringify(payload)
    });

    return res.ok;
  } catch (err) {
    console.error('Cloud storage save error:', err.message);
    return false;
  }
}
