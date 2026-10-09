/**
 * CareerNexus API Client & Data Layer
 * Handles communication with Java REST API with automatic LocalStorage sync fallback.
 */

const API_BASE = window.location.origin.startsWith('http') ? window.location.origin : 'http://localhost:8080';

const Api = {
  isServerAvailable: null,

  async checkServer() {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${API_BASE}/api/health`, { signal: controller.signal });
      clearTimeout(id);
      this.isServerAvailable = res.ok;
      return res.ok;
    } catch (e) {
      this.isServerAvailable = false;
      return false;
    }
  },

  // ===== JOBS =====
  async getJobs() {
    if (this.isServerAvailable === null) await this.checkServer();

    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${API_BASE}/api/jobs`);
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('cn_jobs_cache', JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('API error fetching jobs, falling back to local cache:', err);
      }
    }

    // Local fallback
    const cached = localStorage.getItem('cn_jobs_cache');
    if (cached) return JSON.parse(cached);
    return window.INITIAL_SEED_JOBS || [];
  },

  async getJobById(id) {
    const jobs = await this.getJobs();
    return jobs.find(j => j.id === id) || null;
  },

  async createJob(jobData) {
    if (this.isServerAvailable === null) await this.checkServer();

    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${API_BASE}/api/jobs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobData)
        });
        if (res.ok) {
          const created = await res.json();
          // Update local cache
          const jobs = await this.getJobs();
          jobs.unshift(created);
          localStorage.setItem('cn_jobs_cache', JSON.stringify(jobs));
          return created;
        }
      } catch (err) {
        console.warn('API error creating job, saving locally:', err);
      }
    }

    // Local fallback
    const jobs = await this.getJobs();
    const newJob = {
      ...jobData,
      id: 'job-' + Date.now(),
      postedDate: new Date().toISOString().split('T')[0]
    };
    jobs.unshift(newJob);
    localStorage.setItem('cn_jobs_cache', JSON.stringify(jobs));
    return newJob;
  },

  async updateJob(id, jobData) {
    if (this.isServerAvailable === null) await this.checkServer();

    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${API_BASE}/api/jobs/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobData)
        });
        if (res.ok) {
          const updated = await res.json();
          const jobs = await this.getJobs();
          const idx = jobs.findIndex(j => j.id === id);
          if (idx !== -1) jobs[idx] = updated;
          localStorage.setItem('cn_jobs_cache', JSON.stringify(jobs));
          return updated;
        }
      } catch (err) {
        console.warn('API error updating job, updating locally:', err);
      }
    }

    // Local fallback
    const jobs = await this.getJobs();
    const idx = jobs.findIndex(j => j.id === id);
    if (idx !== -1) {
      jobs[idx] = { ...jobs[idx], ...jobData, id };
      localStorage.setItem('cn_jobs_cache', JSON.stringify(jobs));
      return jobs[idx];
    }
    return null;
  },

  async deleteJob(id) {
    if (this.isServerAvailable === null) await this.checkServer();

    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${API_BASE}/api/jobs/${id}`, { method: 'DELETE' });
        if (res.ok) {
          const jobs = (await this.getJobs()).filter(j => j.id !== id);
          localStorage.setItem('cn_jobs_cache', JSON.stringify(jobs));
          return true;
        }
      } catch (err) {
        console.warn('API error deleting job:', err);
      }
    }

    const jobs = (await this.getJobs()).filter(j => j.id !== id);
    localStorage.setItem('cn_jobs_cache', JSON.stringify(jobs));
    return true;
  },

  // ===== APPLICATIONS =====
  async getApplications(filterEmail = null, filterJobId = null) {
    if (this.isServerAvailable === null) await this.checkServer();

    if (this.isServerAvailable) {
      try {
        let url = `${API_BASE}/api/applications`;
        const params = new URLSearchParams();
        if (filterEmail) params.append('email', filterEmail);
        if (filterJobId) params.append('jobId', filterJobId);
        if (params.toString()) url += `?${params.toString()}`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('cn_apps_cache', JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('API error fetching apps:', err);
      }
    }

    let apps = JSON.parse(localStorage.getItem('cn_apps_cache') || 'null');
    if (!apps) {
      apps = window.INITIAL_SEED_APPLICATIONS || [];
      localStorage.setItem('cn_apps_cache', JSON.stringify(apps));
    }

    if (filterEmail) {
      apps = apps.filter(a => a.candidateEmail && a.candidateEmail.toLowerCase() === filterEmail.toLowerCase());
    }
    if (filterJobId) {
      apps = apps.filter(a => a.jobId === filterJobId);
    }
    return apps;
  },

  async submitApplication(appData) {
    if (this.isServerAvailable === null) await this.checkServer();

    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${API_BASE}/api/applications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appData)
        });
        if (res.ok) {
          const created = await res.json();
          const apps = await this.getApplications();
          apps.unshift(created);
          localStorage.setItem('cn_apps_cache', JSON.stringify(apps));
          return created;
        }
      } catch (err) {
        console.warn('API error submitting application:', err);
      }
    }

    const apps = await this.getApplications();
    const newApp = {
      ...appData,
      id: 'app-' + Date.now(),
      status: 'Applied',
      appliedDate: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      notes: ''
    };
    apps.unshift(newApp);
    localStorage.setItem('cn_apps_cache', JSON.stringify(apps));
    return newApp;
  },

  async updateApplicationStatus(id, newStatus, notes = '') {
    if (this.isServerAvailable === null) await this.checkServer();

    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${API_BASE}/api/applications/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus, notes })
        });
        if (res.ok) {
          const updated = await res.json();
          const apps = await this.getApplications();
          const idx = apps.findIndex(a => a.id === id);
          if (idx !== -1) apps[idx] = updated;
          localStorage.setItem('cn_apps_cache', JSON.stringify(apps));
          return updated;
        }
      } catch (err) {
        console.warn('API error updating application status:', err);
      }
    }

    const apps = await this.getApplications();
    const idx = apps.findIndex(a => a.id === id);
    if (idx !== -1) {
      apps[idx].status = newStatus;
      if (notes) apps[idx].notes = notes;
      localStorage.setItem('cn_apps_cache', JSON.stringify(apps));
      return apps[idx];
    }
    return null;
  },

  // ===== AUTHENTICATION =====
  async login(email, password, role) {
    if (this.isServerAvailable === null) await this.checkServer();

    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          return { success: true, user: data.user };
        } else {
          return { success: false, error: data.error || 'Invalid credentials' };
        }
      } catch (err) {
        console.warn('Server auth failed, checking local credentials:', err);
      }
    }

    // Local authentication fallback
    const users = JSON.parse(localStorage.getItem('cn_users_cache') || 'null') || window.INITIAL_SEED_USERS || [];
    const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (matched) {
      if (role && matched.role !== role) {
        return { success: false, error: `Account exists but role is ${matched.role}` };
      }
      return { success: true, user: matched };
    }
    return { success: false, error: 'Invalid email or password' };
  },

  async register(userData) {
    if (this.isServerAvailable === null) await this.checkServer();

    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        const data = await res.json();
        if (res.ok && data.success) {
          return { success: true, user: data.user };
        } else {
          return { success: false, error: data.error || 'Registration failed' };
        }
      } catch (err) {
        console.warn('Server registration error:', err);
      }
    }

    const users = JSON.parse(localStorage.getItem('cn_users_cache') || 'null') || window.INITIAL_SEED_USERS || [];
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      return { success: false, error: 'Email already registered' };
    }
    const newUser = {
      ...userData,
      id: 'usr-' + Date.now()
    };
    users.push(newUser);
    localStorage.setItem('cn_users_cache', JSON.stringify(users));
    return { success: true, user: newUser };
  }
};
