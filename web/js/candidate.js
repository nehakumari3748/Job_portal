/**
 * CareerNexus - Candidate Experience Controller
 * Handles: Browse jobs, live search, multi-filter, view details, apply for jobs, track status.
 */

const Candidate = {
  allJobs: [],
  filteredJobs: [],
  candidateApplications: [],
  currentViewingJob: null,

  async init() {
    this.bindEvents();
    await this.loadJobs();
    await this.loadApplications();
  },

  bindEvents() {
    // Live Search
    const searchInput = document.getElementById('candidateSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.applyFilters());
    }

    // Filters
    const roleFilter = document.getElementById('candidateRoleFilter');
    const locationFilter = document.getElementById('candidateLocationFilter');
    const typeFilter = document.getElementById('candidateTypeFilter');

    if (roleFilter) roleFilter.addEventListener('change', () => this.applyFilters());
    if (locationFilter) locationFilter.addEventListener('change', () => this.applyFilters());
    if (typeFilter) typeFilter.addEventListener('change', () => this.applyFilters());

    const clearBtn = document.getElementById('btnClearFilters');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (roleFilter) roleFilter.value = '';
        if (locationFilter) locationFilter.value = '';
        if (typeFilter) typeFilter.value = '';
        this.applyFilters();
      });
    }

    // Application Form Submission
    const applyForm = document.getElementById('jobApplicationForm');
    if (applyForm) {
      applyForm.addEventListener('submit', (e) => this.handleApplicationSubmit(e));
    }
  },

  async loadJobs() {
    this.allJobs = await Api.getJobs();
    this.populateFilterDropdowns();
    this.applyFilters();
  },

  populateFilterDropdowns() {
    const locationSelect = document.getElementById('candidateLocationFilter');
    const roleSelect = document.getElementById('candidateRoleFilter');

    if (!locationSelect || !roleSelect) return;

    // Collect unique locations & roles
    const locations = new Set();
    const roles = new Set();

    this.allJobs.forEach(j => {
      if (j.location) {
        // extract broad location
        const loc = j.location.split('(')[0].trim();
        locations.add(loc);
      }
      if (j.role) roles.add(j.role);
    });

    // Populate Location dropdown
    const currentLoc = locationSelect.value;
    locationSelect.innerHTML = '<option value="">All Locations</option>';
    Array.from(locations).sort().forEach(loc => {
      const opt = document.createElement('option');
      opt.value = loc;
      opt.textContent = loc;
      if (loc === currentLoc) opt.selected = true;
      locationSelect.appendChild(opt);
    });

    // Populate Role dropdown
    const currentRole = roleSelect.value;
    roleSelect.innerHTML = '<option value="">All Roles</option>';
    Array.from(roles).sort().forEach(r => {
      const opt = document.createElement('option');
      opt.value = r;
      opt.textContent = r;
      if (r === currentRole) opt.selected = true;
      roleSelect.appendChild(opt);
    });
  },

  applyFilters() {
    const query = (document.getElementById('candidateSearchInput')?.value || '').trim().toLowerCase();
    const selectedRole = document.getElementById('candidateRoleFilter')?.value || '';
    const selectedLoc = document.getElementById('candidateLocationFilter')?.value || '';
    const selectedType = document.getElementById('candidateTypeFilter')?.value || '';

    this.filteredJobs = this.allJobs.filter(job => {
      // Search matching
      const matchesSearch = !query ||
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        (job.tags && job.tags.some(t => t.toLowerCase().includes(query)));

      // Role filter
      const matchesRole = !selectedRole || job.role.toLowerCase() === selectedRole.toLowerCase();

      // Location filter
      const matchesLoc = !selectedLoc || job.location.toLowerCase().includes(selectedLoc.toLowerCase());

      // Type filter
      const matchesType = !selectedType || job.type.toLowerCase().includes(selectedType.toLowerCase());

      return matchesSearch && matchesRole && matchesLoc && matchesType;
    });

    this.renderJobs();
  },

  renderJobs() {
    const container = document.getElementById('jobsGridContainer');
    const countLabel = document.getElementById('jobResultsCount');

    if (countLabel) {
      countLabel.textContent = `${this.filteredJobs.length} job${this.filteredJobs.length === 1 ? '' : 's'} available`;
    }

    if (!container) return;

    if (this.filteredJobs.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <div class="empty-state-title">No Matching Jobs Found</div>
          <p>Try refining your search keyword or clearing location and role filters.</p>
          <button class="btn btn-secondary btn-sm" style="margin-top: 1rem;" onclick="document.getElementById('btnClearFilters').click()">Reset Filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = this.filteredJobs.map(job => {
      const companyInitial = (job.company || 'C').charAt(0).toUpperCase();
      const tagsHtml = (job.tags || []).slice(0, 4).map(t => `<span class="skill-tag">${t}</span>`).join('');

      return `
        <article class="job-card" id="card-${job.id}">
          <div class="job-card-header">
            <div class="company-logo-avatar">${companyInitial}</div>
            <div class="job-title-group">
              <h3 class="job-title" onclick="Candidate.viewJobDetails('${job.id}')">${job.title}</h3>
              <div class="company-name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                ${job.company}
              </div>
            </div>
          </div>

          <div class="job-card-pills">
            <span class="pill pill-role">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              ${job.role || 'Tech'}
            </span>
            <span class="pill pill-location">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              ${job.location || 'Remote'}
            </span>
            <span class="pill pill-type">
              ${job.type || 'Full-time'}
            </span>
          </div>

          <p class="job-card-desc">${job.description || ''}</p>

          <div class="job-card-skills">
            ${tagsHtml}
          </div>

          <div class="job-card-footer">
            <div class="job-salary-tag">${job.salary || 'Competitive'}</div>
            <div class="card-actions">
              <button class="btn btn-secondary btn-sm" onclick="Candidate.viewJobDetails('${job.id}')">
                Details
              </button>
              <button class="btn btn-primary btn-sm" onclick="Candidate.openApplyModal('${job.id}')">
                Apply Now
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  },

  async viewJobDetails(jobId) {
    const job = await Api.getJobById(jobId);
    if (!job) return;
    this.currentViewingJob = job;

    document.getElementById('detailJobTitle').textContent = job.title;
    document.getElementById('detailJobCompany').textContent = job.company;
    document.getElementById('detailJobLocation').textContent = job.location;
    document.getElementById('detailJobType').textContent = job.type;
    document.getElementById('detailJobSalary').textContent = job.salary;
    document.getElementById('detailJobExperience').textContent = job.experience || 'Not specified';
    document.getElementById('detailJobDeadline').textContent = job.deadline || 'Rolling basis';
    document.getElementById('detailJobDescription').textContent = job.description;

    // Responsibilities
    const respContainer = document.getElementById('detailJobResponsibilities');
    if (respContainer) {
      if (job.responsibilities && job.responsibilities.length) {
        respContainer.innerHTML = job.responsibilities.map(r => `<li>${r}</li>`).join('');
        document.getElementById('detailRespSection').style.display = 'block';
      } else {
        document.getElementById('detailRespSection').style.display = 'none';
      }
    }

    // Requirements
    const reqContainer = document.getElementById('detailJobRequirements');
    if (reqContainer) {
      if (job.requirements && job.requirements.length) {
        reqContainer.innerHTML = job.requirements.map(r => `<li>${r}</li>`).join('');
        document.getElementById('detailReqSection').style.display = 'block';
      } else {
        document.getElementById('detailReqSection').style.display = 'none';
      }
    }

    // Benefits
    const benContainer = document.getElementById('detailJobBenefits');
    if (benContainer) {
      if (job.benefits && job.benefits.length) {
        benContainer.innerHTML = job.benefits.map(b => `<li>${b}</li>`).join('');
        document.getElementById('detailBenSection').style.display = 'block';
      } else {
        document.getElementById('detailBenSection').style.display = 'none';
      }
    }

    // Tags
    const tagsContainer = document.getElementById('detailJobTags');
    if (tagsContainer) {
      tagsContainer.innerHTML = (job.tags || []).map(t => `<span class="skill-tag">${t}</span>`).join('');
    }

    // Apply button inside modal
    const applyModalBtn = document.getElementById('btnDetailApplyNow');
    if (applyModalBtn) {
      applyModalBtn.onclick = () => {
        App.closeModal('jobDetailsModal');
        this.openApplyModal(job.id);
      };
    }

    App.openModal('jobDetailsModal');
  },

  async openApplyModal(jobId) {
    const job = await Api.getJobById(jobId);
    if (!job) return;

    this.currentViewingJob = job;
    document.getElementById('applyModalJobTitle').textContent = job.title;
    document.getElementById('applyModalCompanyName').textContent = job.company;
    document.getElementById('applyJobIdInput').value = job.id;

    // Prefill with logged in user if candidate
    if (App.currentUser && App.currentUser.role === 'candidate') {
      document.getElementById('applyFullName').value = App.currentUser.name || '';
      document.getElementById('applyEmail').value = App.currentUser.email || '';
      if (App.currentUser.phone) document.getElementById('applyPhone').value = App.currentUser.phone;
    }

    App.openModal('applyJobModal');
  },

  async handleApplicationSubmit(e) {
    e.preventDefault();

    const jobId = document.getElementById('applyJobIdInput').value;
    const candidateName = document.getElementById('applyFullName').value.trim();
    const candidateEmail = document.getElementById('applyEmail').value.trim();
    const candidatePhone = document.getElementById('applyPhone').value.trim();
    const experienceYears = document.getElementById('applyExperience').value;
    const portfolioUrl = document.getElementById('applyPortfolio').value.trim();
    const coverLetter = document.getElementById('applyCoverLetter').value.trim();

    if (!candidateName || !candidateEmail) {
      App.showToast('Please fill in required fields (Name & Email)', 'error');
      return;
    }

    const job = await Api.getJobById(jobId);

    const appPayload = {
      jobId,
      jobTitle: job ? job.title : 'Software Engineer',
      company: job ? job.company : 'Company',
      candidateName,
      candidateEmail,
      candidatePhone,
      experienceYears,
      portfolioUrl,
      coverLetter
    };

    const submitBtn = document.getElementById('btnSubmitApplication');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
    }

    try {
      const created = await Api.submitApplication(appPayload);
      App.closeModal('applyJobModal');
      document.getElementById('jobApplicationForm').reset();
      App.showToast('Application submitted successfully! Track your status under "My Applications".', 'success');

      // Reload applications
      await this.loadApplications();

      // Switch to applications tab if requested
      App.switchNavTab('applications');
    } catch (err) {
      App.showToast('Failed to submit application: ' + err.message, 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application';
      }
    }
  },

  async loadApplications() {
    let emailFilter = null;
    if (App.currentUser && App.currentUser.role === 'candidate') {
      emailFilter = App.currentUser.email;
    }

    this.candidateApplications = await Api.getApplications(emailFilter);
    this.renderApplications();
  },

  renderApplications() {
    const container = document.getElementById('candidateApplicationsContainer');
    const badgeCount = document.getElementById('candidateAppsCountBadge');

    if (badgeCount) {
      badgeCount.textContent = this.candidateApplications.length;
    }

    if (!container) return;

    if (this.candidateApplications.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div class="empty-state-title">No Applications Submitted Yet</div>
          <p>Browse open job listings and submit your first application to track its progress here.</p>
          <button class="btn btn-primary btn-sm" style="margin-top: 1rem;" onclick="App.switchNavTab('jobs')">Browse Jobs</button>
        </div>
      `;
      return;
    }

    container.innerHTML = this.candidateApplications.map(app => {
      const statusClass = 'status-' + (app.status || 'Applied').toLowerCase().replace(/\s+/g, '-');
      const progressSteps = this.getStepperHtml(app.status);

      return `
        <div class="my-app-card" id="app-${app.id}">
          <div class="my-app-header">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.25rem;">${app.jobTitle}</h3>
              <div style="font-size: 0.875rem; color: var(--text-secondary); font-weight: 600;">
                ${app.company} &bull; <span style="color: var(--text-muted); font-weight: 400;">Applied on ${app.appliedDate || 'Recently'}</span>
              </div>
            </div>
            <span class="status-badge ${statusClass}">
              <span class="status-dot"></span>
              ${app.status || 'Applied'}
            </span>
          </div>

          <!-- Application Status Timeline Tracker -->
          ${progressSteps}

          ${app.notes ? `
            <div style="background: var(--bg-main); border-radius: var(--radius-md); padding: 0.85rem 1rem; border-left: 3px solid var(--primary); margin-top: 1rem; font-size: 0.85rem;">
              <strong>Recruiter Feedback / Note:</strong> ${app.notes}
            </div>
          ` : ''}

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 0.85rem; border-top: 1px solid var(--border-light); font-size: 0.825rem; color: var(--text-muted);">
            <span>Application ID: <code>${app.id}</code></span>
            <span>Candidate: <strong>${app.candidateName}</strong> (${app.candidateEmail})</span>
          </div>
        </div>
      `;
    }).join('');
  },

  getStepperHtml(currentStatus) {
    const stages = [
      { key: 'Applied', label: 'Applied' },
      { key: 'Under Review', label: 'In Review' },
      { key: 'Shortlisted', label: 'Shortlisted' },
      { key: 'Interview Scheduled', label: 'Interview' },
      { key: 'Accepted', label: 'Decision' }
    ];

    const statusMap = {
      'Applied': 0,
      'Under Review': 1,
      'Reviewing': 1,
      'Shortlisted': 2,
      'Interview Scheduled': 3,
      'Accepted': 4,
      'Offered': 4,
      'Rejected': 1
    };

    const activeIndex = statusMap[currentStatus] !== undefined ? statusMap[currentStatus] : 0;
    const isRejected = currentStatus === 'Rejected';

    return `
      <div class="application-tracker-stepper">
        ${stages.map((st, idx) => {
          let nodeClass = '';
          if (idx < activeIndex) nodeClass = 'completed';
          else if (idx === activeIndex) nodeClass = isRejected ? 'rejected active' : 'active';

          return `
            <div class="step-node ${nodeClass}">
              <div class="step-indicator">${idx < activeIndex ? '&#10003;' : (idx + 1)}</div>
              <span class="step-label">${isRejected && idx === activeIndex ? 'Rejected' : st.label}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
};
