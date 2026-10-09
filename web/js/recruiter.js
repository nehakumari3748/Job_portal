/**
 * CareerNexus - Recruiter Dashboard Controller
 * Handles: Post job, edit job, delete job, view applications, update applicant pipeline statuses.
 */

const Recruiter = {
  jobs: [],
  applications: [],
  editingJobId: null,

  async init() {
    this.bindEvents();
    await this.refresh();
  },

  bindEvents() {
    // Add/Edit Job Form Submission
    const jobForm = document.getElementById('manageJobForm');
    if (jobForm) {
      jobForm.addEventListener('submit', (e) => this.handleSaveJob(e));
    }

    // Filter applications by job
    const filterJobSelect = document.getElementById('recruiterAppJobFilter');
    if (filterJobSelect) {
      filterJobSelect.addEventListener('change', () => this.renderApplicationsTable());
    }

    // Filter applications by status
    const filterStatusSelect = document.getElementById('recruiterAppStatusFilter');
    if (filterStatusSelect) {
      filterStatusSelect.addEventListener('change', () => this.renderApplicationsTable());
    }
  },

  async refresh() {
    await this.loadJobs();
    await this.loadApplications();
    this.updateMetrics();
  },

  async loadJobs() {
    this.jobs = await Api.getJobs();
    this.renderJobsTable();
    this.populateRecruiterFilters();
  },

  async loadApplications() {
    this.applications = await Api.getApplications();
    this.renderApplicationsTable();
  },

  updateMetrics() {
    const totalJobsEl = document.getElementById('metricTotalJobs');
    const totalAppsEl = document.getElementById('metricTotalApps');
    const inReviewEl = document.getElementById('metricInReview');
    const shortlistedEl = document.getElementById('metricShortlisted');

    if (totalJobsEl) totalJobsEl.textContent = this.jobs.length;
    if (totalAppsEl) totalAppsEl.textContent = this.applications.length;

    const inReviewCount = this.applications.filter(a => a.status === 'Under Review' || a.status === 'Reviewing').length;
    if (inReviewEl) inReviewEl.textContent = inReviewCount;

    const shortlistedCount = this.applications.filter(a => a.status === 'Shortlisted' || a.status === 'Interview Scheduled').length;
    if (shortlistedEl) shortlistedEl.textContent = shortlistedCount;
  },

  populateRecruiterFilters() {
    const filterJobSelect = document.getElementById('recruiterAppJobFilter');
    if (!filterJobSelect) return;

    const currentVal = filterJobSelect.value;
    filterJobSelect.innerHTML = '<option value="">All Jobs</option>';
    this.jobs.forEach(j => {
      const opt = document.createElement('option');
      opt.value = j.id;
      opt.textContent = `${j.title} (${j.company})`;
      if (j.id === currentVal) opt.selected = true;
      filterJobSelect.appendChild(opt);
    });
  },

  renderJobsTable() {
    const tbody = document.getElementById('recruiterJobsTableBody');
    if (!tbody) return;

    if (this.jobs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
            No jobs posted yet. Click "+ Post New Job" to create your first listing.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.jobs.map(j => {
      const appCount = this.applications.filter(a => a.jobId === j.id).length;

      return `
        <tr id="recruiter-job-row-${j.id}">
          <td>
            <div style="font-weight: 700; color: var(--text-primary);">${j.title}</div>
            <div style="font-size: 0.775rem; color: var(--text-muted);">${j.id} &bull; ${j.company}</div>
          </td>
          <td><span class="pill pill-role">${j.role || 'Tech'}</span></td>
          <td>${j.location}</td>
          <td><strong>${j.salary || '-'}</strong></td>
          <td>
            <span class="pill pill-type" style="cursor: pointer;" onclick="Recruiter.filterByJobId('${j.id}')">
              ${appCount} Applicant${appCount === 1 ? '' : 's'}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 0.4rem;">
              <button class="btn btn-secondary btn-sm" onclick="Recruiter.openEditJobModal('${j.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                Edit
              </button>
              <button class="btn btn-danger btn-sm" onclick="Recruiter.confirmDeleteJob('${j.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderApplicationsTable() {
    const tbody = document.getElementById('recruiterApplicationsTableBody');
    const countBadge = document.getElementById('recruiterAppsCountBadge');

    if (!tbody) return;

    const selectedJobId = document.getElementById('recruiterAppJobFilter')?.value || '';
    const selectedStatus = document.getElementById('recruiterAppStatusFilter')?.value || '';

    const filtered = this.applications.filter(a => {
      const matchJob = !selectedJobId || a.jobId === selectedJobId;
      const matchStatus = !selectedStatus || a.status.toLowerCase() === selectedStatus.toLowerCase();
      return matchJob && matchStatus;
    });

    if (countBadge) countBadge.textContent = filtered.length;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            No candidate applications found for the selected filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(app => {
      const statusClass = 'status-' + (app.status || 'Applied').toLowerCase().replace(/\s+/g, '-');

      return `
        <tr id="app-row-${app.id}">
          <td>
            <div style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">${app.candidateName}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">
              ${app.candidateEmail} &bull; ${app.candidatePhone || 'No Phone'}
            </div>
            ${app.portfolioUrl ? `<a href="${app.portfolioUrl}" target="_blank" style="font-size: 0.775rem; text-decoration: underline;">Portfolio / Profile &rarr;</a>` : ''}
          </td>
          <td>
            <div style="font-weight: 600;">${app.jobTitle}</div>
            <div style="font-size: 0.775rem; color: var(--text-muted);">${app.company}</div>
          </td>
          <td>${app.experienceYears ? app.experienceYears + ' yrs' : '-'}</td>
          <td>
            <span class="status-badge ${statusClass}">
              ${app.status}
            </span>
          </td>
          <td style="font-size: 0.8rem; color: var(--text-secondary); max-width: 200px;">
            <div style="font-style: italic; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${app.coverLetter || 'No cover note'}
            </div>
            ${app.notes ? `<div style="color: var(--primary); font-weight: 600; margin-top: 2px;">Note: ${app.notes}</div>` : ''}
          </td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="Recruiter.openReviewModal('${app.id}')">
              Review &amp; Status
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  filterByJobId(jobId) {
    const jobFilter = document.getElementById('recruiterAppJobFilter');
    if (jobFilter) {
      jobFilter.value = jobId;
      this.renderApplicationsTable();
    }
    // Switch to applicant pipeline tab
    App.switchNavTab('applicants');
  },

  openAddJobModal() {
    this.editingJobId = null;
    document.getElementById('manageJobModalTitle').textContent = 'Post a New Job Opening';
    document.getElementById('manageJobForm').reset();
    document.getElementById('jobIdHiddenInput').value = '';

    // Defaults
    if (App.currentUser && App.currentUser.role === 'recruiter') {
      document.getElementById('inputJobCompany').value = App.currentUser.company || 'Nexus Innovations';
      document.getElementById('inputJobRecruiterEmail').value = App.currentUser.email || '';
    }

    App.openModal('manageJobModal');
  },

  async openEditJobModal(jobId) {
    const job = await Api.getJobById(jobId);
    if (!job) return;

    this.editingJobId = jobId;
    document.getElementById('manageJobModalTitle').textContent = 'Edit Job Opening';
    document.getElementById('jobIdHiddenInput').value = job.id;
    document.getElementById('inputJobTitle').value = job.title;
    document.getElementById('inputJobCompany').value = job.company;
    document.getElementById('inputJobRole').value = job.role || 'Engineering';
    document.getElementById('inputJobLocation').value = job.location;
    document.getElementById('inputJobType').value = job.type || 'Full-time';
    document.getElementById('inputJobExperience').value = job.experience || '';
    document.getElementById('inputJobSalary').value = job.salary || '';
    document.getElementById('inputJobDeadline').value = job.deadline || '';
    document.getElementById('inputJobRecruiterEmail').value = job.recruiterEmail || '';
    document.getElementById('inputJobDescription').value = job.description || '';
    document.getElementById('inputJobResponsibilities').value = (job.responsibilities || []).join('\n');
    document.getElementById('inputJobRequirements').value = (job.requirements || []).join('\n');
    document.getElementById('inputJobBenefits').value = (job.benefits || []).join('\n');
    document.getElementById('inputJobTags').value = (job.tags || []).join(', ');

    App.openModal('manageJobModal');
  },

  async handleSaveJob(e) {
    e.preventDefault();

    const title = document.getElementById('inputJobTitle').value.trim();
    const company = document.getElementById('inputJobCompany').value.trim();
    const role = document.getElementById('inputJobRole').value;
    const location = document.getElementById('inputJobLocation').value.trim();
    const type = document.getElementById('inputJobType').value;
    const experience = document.getElementById('inputJobExperience').value.trim();
    const salary = document.getElementById('inputJobSalary').value.trim();
    const deadline = document.getElementById('inputJobDeadline').value;
    const recruiterEmail = document.getElementById('inputJobRecruiterEmail').value.trim();
    const description = document.getElementById('inputJobDescription').value.trim();

    const responsibilities = document.getElementById('inputJobResponsibilities').value
      .split('\n').map(s => s.trim()).filter(Boolean);
    const requirements = document.getElementById('inputJobRequirements').value
      .split('\n').map(s => s.trim()).filter(Boolean);
    const benefits = document.getElementById('inputJobBenefits').value
      .split('\n').map(s => s.trim()).filter(Boolean);
    const tags = document.getElementById('inputJobTags').value
      .split(',').map(s => s.trim()).filter(Boolean);

    const jobPayload = {
      title,
      company,
      role,
      location,
      type,
      experience,
      salary,
      deadline,
      recruiterEmail,
      description,
      responsibilities,
      requirements,
      benefits,
      tags
    };

    const submitBtn = document.getElementById('btnSubmitJobForm');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
    }

    try {
      if (this.editingJobId) {
        await Api.updateJob(this.editingJobId, jobPayload);
        App.showToast('Job listing updated successfully!', 'success');
      } else {
        await Api.createJob(jobPayload);
        App.showToast('New job posted successfully!', 'success');
      }

      App.closeModal('manageJobModal');
      await this.refresh();
      // Also refresh candidate jobs
      await Candidate.loadJobs();
    } catch (err) {
      App.showToast('Failed to save job: ' + err.message, 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Job';
      }
    }
  },

  async confirmDeleteJob(jobId) {
    const job = await Api.getJobById(jobId);
    if (!job) return;

    if (confirm(`Are you sure you want to delete "${job.title}" at ${job.company}? This cannot be undone.`)) {
      try {
        await Api.deleteJob(jobId);
        App.showToast('Job deleted successfully', 'info');
        await this.refresh();
        await Candidate.loadJobs();
      } catch (err) {
        App.showToast('Failed to delete job: ' + err.message, 'error');
      }
    }
  },

  openReviewModal(appId) {
    const app = this.applications.find(a => a.id === appId);
    if (!app) return;

    document.getElementById('reviewAppId').value = app.id;
    document.getElementById('reviewModalCandidateName').textContent = app.candidateName;
    document.getElementById('reviewModalCandidateEmail').textContent = app.candidateEmail;
    document.getElementById('reviewModalCandidatePhone').textContent = app.candidatePhone || 'N/A';
    document.getElementById('reviewModalJobTitle').textContent = `${app.jobTitle} (${app.company})`;
    document.getElementById('reviewModalExperience').textContent = app.experienceYears ? `${app.experienceYears} Years` : 'Not specified';
    document.getElementById('reviewModalDate').textContent = app.appliedDate || '-';
    document.getElementById('reviewModalCoverLetter').textContent = app.coverLetter || 'No cover letter provided.';

    // Portfolio link
    const linkEl = document.getElementById('reviewModalPortfolioLink');
    if (linkEl) {
      if (app.portfolioUrl) {
        linkEl.href = app.portfolioUrl;
        linkEl.textContent = app.portfolioUrl;
        linkEl.style.display = 'inline';
      } else {
        linkEl.textContent = 'None provided';
        linkEl.removeAttribute('href');
      }
    }

    // Status select
    document.getElementById('reviewStatusSelect').value = app.status || 'Applied';
    document.getElementById('reviewNotesInput').value = app.notes || '';

    App.openModal('reviewApplicationModal');
  },

  async handleSaveApplicantStatus() {
    const appId = document.getElementById('reviewAppId').value;
    const newStatus = document.getElementById('reviewStatusSelect').value;
    const notes = document.getElementById('reviewNotesInput').value.trim();

    try {
      await Api.updateApplicationStatus(appId, newStatus, notes);
      App.closeModal('reviewApplicationModal');
      App.showToast(`Status updated to "${newStatus}"!`, 'success');
      await this.refresh();
      // Also update candidate application view if candidate was viewing
      await Candidate.loadApplications();
    } catch (err) {
      App.showToast('Failed to update status: ' + err.message, 'error');
    }
  }
};
