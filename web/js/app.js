/**
 * CareerNexus - Main Application Coordinator
 * State management, authentication, role switching, modals, and notifications.
 */

// Initial Seed Data for immediate offline/standalone execution
window.INITIAL_SEED_USERS = [
  {
    id: "usr-1",
    name: "Neha Kumari",
    email: "candidate@nexus.com",
    password: "password123",
    role: "candidate",
    headline: "Full Stack Java Developer",
    phone: "+91 98765 43210"
  },
  {
    id: "usr-2",
    name: "Vikram Malhotra",
    email: "recruiter@nexus.com",
    password: "admin123",
    role: "recruiter",
    company: "Nexus Innovations",
    title: "Head of Technical Recruitment"
  }
];

window.INITIAL_SEED_JOBS = [
  {
    id: "job-101",
    title: "Senior Full Stack Java Engineer",
    company: "Nexus Innovations",
    role: "Engineering",
    location: "Bangalore, India (Hybrid)",
    type: "Full-time",
    experience: "4-7 years",
    salary: "₹28,00,000 - ₹38,00,000 / yr",
    postedDate: "2026-10-01",
    deadline: "2026-11-15",
    description: "Nexus Innovations is looking for an experienced Senior Full Stack Java Engineer to lead the architecture and development of our next-generation cloud-native financial intelligence platform.",
    responsibilities: [
      "Architect and implement scalable RESTful and event-driven microservices using Java 21 and Spring Boot.",
      "Build dynamic, high-performance web interfaces with modern JavaScript and design systems.",
      "Optimize database queries, indices, and caching strategies across PostgreSQL and Redis.",
      "Collaborate with DevOps engineers to establish robust CI/CD pipelines on AWS / Docker."
    ],
    requirements: [
      "4+ years of professional software engineering experience with Java ecosystem.",
      "Deep understanding of multithreading, concurrent programming, and JVM internals.",
      "Proficiency with modern web frontend technologies (HTML5, modern CSS, ES6+ JavaScript).",
      "Hands-on experience with SQL databases and REST architectural standards."
    ],
    benefits: [
      "Flexible hybrid working model with modern home office allowance.",
      "Comprehensive medical, dental, and health coverage for you and dependents.",
      "Annual learning stipend of ₹1,00,000 for certifications and conferences."
    ],
    tags: ["Java", "Spring Boot", "Microservices", "REST API", "Full-time"],
    recruiterEmail: "recruiter@nexus.com"
  },
  {
    id: "job-102",
    title: "Frontend React & UI/UX Architect",
    company: "Luminary Design Systems",
    role: "Frontend",
    location: "Remote",
    type: "Remote",
    experience: "3-6 years",
    salary: "$115,000 - $145,000 / yr",
    postedDate: "2026-10-03",
    deadline: "2026-11-20",
    description: "Luminary is seeking an exceptional Frontend Architect who obsesses over visual aesthetics, fluid micro-interactions, and accessible web standards.",
    responsibilities: [
      "Develop modular, themeable UI component libraries conforming to WCAG 2.1 AA standards.",
      "Optimize browser rendering performance, bundle sizes, and Core Web Vitals.",
      "Partner with product designers in Figma to transform design visions into pixel-perfect web reality."
    ],
    requirements: [
      "Proven track record building modern, high-polish web applications.",
      "Mastery of modern CSS (CSS Grid, Flexbox, CSS Variables, fluid animations).",
      "Deep understanding of state management, browser internals, and TypeScript / JavaScript."
    ],
    benefits: [
      "100% remote flexibility worldwide.",
      "Latest M3 Max MacBook Pro + 4K dual monitor home office setup.",
      "Unlimited paid time off (minimum 25 days encouraged)."
    ],
    tags: ["Frontend", "React", "CSS3", "Design Systems", "UI/UX", "Remote"],
    recruiterEmail: "talent@luminary.design"
  },
  {
    id: "job-103",
    title: "Backend Distributed Systems Engineer",
    company: "HyperScale Cloud",
    role: "Backend",
    location: "San Francisco, CA (On-site)",
    type: "Full-time",
    experience: "5-8 years",
    salary: "$160,000 - $195,000 / yr",
    postedDate: "2026-10-04",
    deadline: "2026-11-10",
    description: "HyperScale Cloud is engineering the future of real-time stream processing. We process billions of events per second with low latency.",
    responsibilities: [
      "Build high-throughput streaming pipelines processing 500k+ messages/sec.",
      "Design fault-tolerant storage engines and distributed caches.",
      "Benchmark, profile, and eliminate latency bottlenecks in production."
    ],
    requirements: [
      "Strong command of Java, Go, or C++ with knowledge of memory management.",
      "Experience with Apache Kafka, Raft/Paxos consensus, or distributed datastores.",
      "Solid foundation in data structures, algorithms, and networking protocols."
    ],
    benefits: [
      "Top-tier competitive base salary + lucrative equity grants.",
      "Daily gourmet catered meals and barista in our SF downtown office.",
      "Full 401(k) matching up to 6% and premium health coverage."
    ],
    tags: ["Backend", "Java", "Kafka", "Distributed Systems", "gRPC"],
    recruiterEmail: "recruiting@hyperscale.io"
  },
  {
    id: "job-104",
    title: "AI/ML Solutions Engineer",
    company: "CognitiveFlow Labs",
    role: "Data / AI",
    location: "New York, NY (Hybrid)",
    type: "Full-time",
    experience: "2-5 years",
    salary: "$135,000 - $170,000 / yr",
    postedDate: "2026-10-05",
    deadline: "2026-11-25",
    description: "CognitiveFlow Labs builds intelligent enterprise workflow agents. Join our engineering crew to bridge LLM models and enterprise application software.",
    responsibilities: [
      "Deploy and fine-tune large language model workflows using RAG and vector databases.",
      "Integrate AI services into backend microservices with rigorous latency budgets.",
      "Develop evaluation benchmarks and guardrail telemetry to ensure AI output safety."
    ],
    requirements: [
      "Strong software engineering background with Python and Java or TypeScript.",
      "Working knowledge of Vector Search and LLM orchestration frameworks."
    ],
    benefits: [
      "Subsidized commuter benefits and hybrid working policy.",
      "Access to bleeding-edge compute clusters and AI research hardware."
    ],
    tags: ["AI/ML", "Python", "LLMs", "Vector DB", "Hybrid"],
    recruiterEmail: "jobs@cognitiveflow.ai"
  },
  {
    id: "job-105",
    title: "Lead DevOps & Cloud Infrastructure Engineer",
    company: "Skyline Technologies",
    role: "DevOps",
    location: "Hyderabad, India (Hybrid)",
    type: "Full-time",
    experience: "5+ years",
    salary: "₹32,00,000 - ₹45,00,000 / yr",
    postedDate: "2026-10-06",
    deadline: "2026-11-30",
    description: "Skyline Technologies is looking for a Lead DevOps Engineer to automate and scale our multi-region Kubernetes clusters across AWS and GCP.",
    responsibilities: [
      "Build and maintain Infrastructure-as-Code utilizing Terraform and Helm.",
      "Oversee Kubernetes cluster operations, security baselines, and disaster recovery drills."
    ],
    requirements: [
      "Extensive experience with Kubernetes, Docker, and AWS / GCP services.",
      "Deep proficiency in Terraform, GitHub Actions, and Prometheus/Grafana."
    ],
    benefits: [
      "Hybrid work arrangement (2 days office, 3 days remote).",
      "Annual health insurance coverage of ₹10,00,000."
    ],
    tags: ["DevOps", "Kubernetes", "AWS", "Terraform", "CI/CD"],
    recruiterEmail: "careers@skylinetech.com"
  },
  {
    id: "job-106",
    title: "Junior Java & Web Developer (Graduate / Fresher)",
    company: "Apex Software Solutions",
    role: "Engineering",
    location: "Bangalore, India (On-site)",
    type: "Full-time",
    experience: "0-2 years",
    salary: "₹6,00,000 - ₹10,00,000 / yr",
    postedDate: "2026-10-07",
    deadline: "2026-12-01",
    description: "Kickstart your software engineering career at Apex! We are welcoming energetic junior engineers with a passion for Java, clean code, and responsive frontends.",
    responsibilities: [
      "Write clean, readable Java code following object-oriented design principles.",
      "Assist in building responsive web UI interfaces using HTML, CSS, and JavaScript."
    ],
    requirements: [
      "Degree in Computer Science or related field.",
      "Solid understanding of Core Java (OOPs, Collections, Exception Handling).",
      "Familiarity with HTML, CSS, JavaScript, and relational databases."
    ],
    benefits: [
      "Dedicated 6-month mentorship and structured training curriculum.",
      "Relocation allowance and cafeteria lunches."
    ],
    tags: ["Java", "Fresher", "Junior", "Web Development", "On-site"],
    recruiterEmail: "campus@apexsolutions.in"
  }
];

window.INITIAL_SEED_APPLICATIONS = [
  {
    id: "app-501",
    jobId: "job-101",
    jobTitle: "Senior Full Stack Java Engineer",
    company: "Nexus Innovations",
    candidateName: "Neha Kumari",
    candidateEmail: "candidate@nexus.com",
    candidatePhone: "+91 98765 43210",
    experienceYears: "5",
    portfolioUrl: "https://github.com/nehakumari",
    coverLetter: "I have 5 years of extensive experience building scalable Java microservices and modern responsive frontends.",
    status: "Shortlisted",
    appliedDate: "Oct 2, 2026, 11:30 AM",
    notes: "Strong background in Java concurrency and Spring Boot. Scheduled for technical round 1."
  },
  {
    id: "app-502",
    jobId: "job-102",
    jobTitle: "Frontend React & UI/UX Architect",
    company: "Luminary Design Systems",
    candidateName: "Neha Kumari",
    candidateEmail: "candidate@nexus.com",
    candidatePhone: "+91 98765 43210",
    experienceYears: "4",
    portfolioUrl: "https://nehaportfolio.dev",
    coverLetter: "Passionate about building fluid, accessible, and high-performance design systems.",
    status: "Under Review",
    appliedDate: "Oct 4, 2026, 3:15 PM",
    notes: "Portfolio shows strong eye for micro-interactions and layout precision."
  },
  {
    id: "app-503",
    jobId: "job-101",
    jobTitle: "Senior Full Stack Java Engineer",
    company: "Nexus Innovations",
    candidateName: "Aarav Sharma",
    candidateEmail: "aarav.sharma@example.com",
    candidatePhone: "+91 91234 56789",
    experienceYears: "6",
    portfolioUrl: "https://linkedin.com/in/aaravsharma",
    coverLetter: "Experienced in distributed architectures, Kafka, and Spring Cloud.",
    status: "Interview Scheduled",
    appliedDate: "Oct 3, 2026, 9:45 AM",
    notes: "System design interview scheduled for Friday 2:00 PM."
  }
];

const App = {
  currentRole: 'candidate', // 'candidate' | 'recruiter'
  currentUser: null,
  activeNavTab: 'jobs',

  async init() {
    this.bindGlobalEvents();
    this.restoreSession();
    this.updateUserUI();

    // Check server status in background
    const isOnline = await Api.checkServer();
    this.updateServerIndicator(isOnline);

    // Initialize modules
    await Candidate.init();
    await Recruiter.init();

    this.applyRoleView();
  },

  bindGlobalEvents() {
    // Role switcher pills in header
    document.getElementById('btnSwitchCandidate')?.addEventListener('click', () => {
      this.switchRole('candidate');
    });

    document.getElementById('btnSwitchRecruiter')?.addEventListener('click', () => {
      this.switchRole('recruiter');
    });

    // Auth forms
    document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
    document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));

    // Nav tabs click
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        if (tab) this.switchNavTab(tab);
      });
    });

    // Close modal on clicking outside or ESC
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => {
          this.closeModal(m.id);
        });
      }
    });
  },

  restoreSession() {
    const savedUser = localStorage.getItem('cn_current_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        this.currentRole = this.currentUser.role || 'candidate';
      } catch (e) {
        this.currentUser = null;
      }
    } else {
      // Default to logged in as demo Candidate for seamless first-click experience
      this.currentUser = window.INITIAL_SEED_USERS[0];
      this.currentRole = 'candidate';
    }
  },

  updateServerIndicator(isOnline) {
    const dot = document.getElementById('serverStatusDot');
    const label = document.getElementById('serverStatusText');
    if (dot && label) {
      if (isOnline) {
        dot.style.background = 'var(--accent-emerald)';
        label.textContent = 'Java 21 Server: Online (REST API Active)';
      } else {
        dot.style.background = 'var(--accent-sky)';
        label.textContent = 'Local Mode (Standalone / Client Cache)';
      }
    }
  },

  switchRole(role) {
    this.currentRole = role;

    // If user role doesn't match active view, prompt or adjust
    if (role === 'recruiter' && (!this.currentUser || this.currentUser.role !== 'recruiter')) {
      // Suggest logging in as recruiter demo or switch demo account
      this.currentUser = window.INITIAL_SEED_USERS[1];
      localStorage.setItem('cn_current_user', JSON.stringify(this.currentUser));
      this.showToast('Switched to Recruiter Mode (Logged in as Vikram Malhotra)', 'info');
    } else if (role === 'candidate' && (!this.currentUser || this.currentUser.role !== 'candidate')) {
      this.currentUser = window.INITIAL_SEED_USERS[0];
      localStorage.setItem('cn_current_user', JSON.stringify(this.currentUser));
      this.showToast('Switched to Candidate Mode (Logged in as Neha Kumari)', 'info');
    }

    this.updateUserUI();
    this.applyRoleView();
  },

  applyRoleView() {
    const btnCandidate = document.getElementById('btnSwitchCandidate');
    const btnRecruiter = document.getElementById('btnSwitchRecruiter');

    const candidateSection = document.getElementById('candidatePortalView');
    const recruiterSection = document.getElementById('recruiterPortalView');

    if (this.currentRole === 'candidate') {
      btnCandidate?.classList.add('active');
      btnRecruiter?.classList.remove('active');
      if (candidateSection) candidateSection.style.display = 'block';
      if (recruiterSection) recruiterSection.style.display = 'none';

      // default tab: jobs
      this.switchNavTab('jobs');
    } else {
      btnRecruiter?.classList.add('active');
      btnCandidate?.classList.remove('active');
      if (candidateSection) candidateSection.style.display = 'none';
      if (recruiterSection) recruiterSection.style.display = 'block';

      // default tab: jobs-mgmt
      this.switchNavTab('jobs-mgmt');
      Recruiter.refresh();
    }
  },

  switchNavTab(tabName) {
    this.activeNavTab = tabName;

    // Update active tab buttons
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Toggle tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      if (panel.id === `tab-panel-${tabName}`) {
        panel.style.display = 'block';
      } else {
        panel.style.display = 'none';
      }
    });
  },

  updateUserUI() {
    const avatar = document.getElementById('userAvatarInitials');
    const nameEl = document.getElementById('userDisplayName');
    const roleEl = document.getElementById('userRoleLabel');
    const authBtn = document.getElementById('btnAuthTrigger');

    if (this.currentUser) {
      const initials = (this.currentUser.name || 'User')
        .split(' ')
        .map(n => n.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);

      if (avatar) avatar.textContent = initials;
      if (nameEl) nameEl.textContent = this.currentUser.name;
      if (roleEl) roleEl.textContent = this.currentUser.role === 'recruiter' ? 'Recruiter' : 'Candidate';

      if (authBtn) {
        authBtn.textContent = 'Logout';
        authBtn.onclick = () => this.handleLogout();
      }
    } else {
      if (avatar) avatar.textContent = 'G';
      if (nameEl) nameEl.textContent = 'Guest';
      if (roleEl) roleEl.textContent = 'Sign In';

      if (authBtn) {
        authBtn.textContent = 'Sign In';
        authBtn.onclick = () => this.openLoginModal();
      }
    }
  },

  openLoginModal(defaultRole = 'candidate') {
    this.switchAuthTab(defaultRole);
    this.openModal('authModal');
  },

  openRegisterModal() {
    this.openModal('registerModal');
  },

  switchAuthTab(role) {
    document.querySelectorAll('.auth-role-tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-role') === role);
    });
    document.getElementById('loginSelectedRole').value = role;

    const roleHelp = document.getElementById('authRoleNotice');
    if (roleHelp) {
      if (role === 'candidate') {
        roleHelp.textContent = 'Sign in as a Job Seeker to apply for jobs and track your status.';
      } else {
        roleHelp.textContent = 'Sign in as a Recruiter to post jobs, manage listings, and review applicants.';
      }
    }
  },

  quickFillDemo(role) {
    const emailInput = document.getElementById('loginEmail');
    const passInput = document.getElementById('loginPassword');

    if (role === 'candidate') {
      this.switchAuthTab('candidate');
      if (emailInput) emailInput.value = 'candidate@nexus.com';
      if (passInput) passInput.value = 'password123';
      this.showToast('Candidate demo credentials filled!', 'info');
    } else {
      this.switchAuthTab('recruiter');
      if (emailInput) emailInput.value = 'recruiter@nexus.com';
      if (passInput) passInput.value = 'admin123';
      this.showToast('Recruiter demo credentials filled!', 'info');
    }
  },

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const role = document.getElementById('loginSelectedRole').value;

    const res = await Api.login(email, password, role);
    if (res.success) {
      this.currentUser = res.user;
      localStorage.setItem('cn_current_user', JSON.stringify(this.currentUser));
      this.currentRole = res.user.role;
      this.closeModal('authModal');
      this.updateUserUI();
      this.applyRoleView();
      this.showToast(`Welcome back, ${res.user.name}!`, 'success');
    } else {
      this.showToast(res.error || 'Login failed. Check credentials.', 'error');
    }
  },

  async handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const role = document.getElementById('regRoleSelect').value;

    const res = await Api.register({ name, email, password, phone, role });
    if (res.success) {
      this.currentUser = res.user;
      localStorage.setItem('cn_current_user', JSON.stringify(this.currentUser));
      this.currentRole = res.user.role;
      this.closeModal('registerModal');
      this.updateUserUI();
      this.applyRoleView();
      this.showToast(`Account created! Welcome, ${res.user.name}`, 'success');
    } else {
      this.showToast(res.error || 'Registration failed', 'error');
    }
  },

  handleLogout() {
    this.currentUser = null;
    localStorage.removeItem('cn_current_user');
    this.updateUserUI();
    this.showToast('You have been logged out.', 'info');
    this.openLoginModal();
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = '&bull;';
    if (type === 'success') icon = '&#10003;';
    else if (type === 'error') icon = '&#10007;';
    else if (type === 'info') icon = '&#9432;';

    toast.innerHTML = `
      <span style="font-size: 1.1rem; line-height: 1;">${icon}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }
};

// Start application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
