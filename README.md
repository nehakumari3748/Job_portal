# CareerNexus &mdash; Java 21 Enterprise Job Portal

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-blue?style=for-the-badge&logo=github)](https://nehakumari3748.github.io/Job_portal/)
[![Deploy Pages](https://github.com/nehakumari3748/Job_portal/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/nehakumari3748/Job_portal/actions/workflows/deploy-pages.yml)

🌐 **Live Website Link:** [https://nehakumari3748.github.io/Job_portal/](https://nehakumari3748.github.io/Job_portal/)

A modern, high-performance **Job Portal Web Application** powered by a pure **Java 21 embedded HTTP Server** and a responsive web frontend.

---

## 🚀 Key Features

### 👤 Candidate Portal (Job Seeker)
- **Candidate Register & Login:** Sign up as a new candidate or log in with demo credentials.
- **Browse Available Jobs:** Explore curated job openings with rich company badges, salary estimates, experience tags, and locations.
- **Live Search:** Instant, real-time search across job titles, company names, skills, and descriptions.
- **Multi-Factor Filtering:** Filter by **Job Location** (e.g., Bangalore, Remote, San Francisco, New York) and **Department / Role** (Engineering, Frontend, Backend, AI/ML, DevOps, Design, Internship) plus Job Type.
- **Comprehensive Job Details:** View full job requirements, key responsibilities, perks & benefits, and application deadlines in a high-fidelity modal.
- **Easy Job Application:** Multi-step application submission with contact information, experience level, portfolio/LinkedIn link, resume file attachment, and custom cover note.
- **Application Status Tracker:** Real-time visual timeline stepper tracking the hiring lifecycle (`Applied` &rarr; `In Review` &rarr; `Shortlisted` &rarr; `Interview Scheduled` &rarr; `Decision`) along with direct recruiter feedback notes.

### 🏢 Recruiter Portal (Hiring Manager)
- **Recruiter Login:** Dedicated recruiter sign-in with instant demo credentials quick-fill.
- **Recruiter Analytics Dashboard:** Real-time metrics counters for *Active Listings*, *Total Applications*, *In Review*, and *Shortlisted / Interviews*.
- **Add New Job:** Comprehensive form to publish new openings with salary, requirements, responsibilities, and skill tags.
- **Edit Existing Job:** Live pre-filled modal to update job specifications, deadlines, and compensation.
- **Delete Job:** Confirmation modal to remove closed or expired listings.
- **Applicant Pipeline & Review:** Filter applicants by job or status, inspect candidate contact details, read cover letters, view portfolio links, and advance application stages with custom notes.

---

## 🛠️ Technology Stack
- **Backend:** Java 21 (`com.sun.net.httpserver.HttpServer`, Virtual Threads, zero external JAR dependencies needed)
- **Data Persistence:** JSON File Store (`data/jobs.json`, `data/applications.json`, `data/users.json`)
- **Frontend:** Semantic HTML5, Vanilla CSS3 (Custom design system, glassmorphism, responsive grid), Modern ES6+ JavaScript
- **API Architecture:** RESTful JSON endpoints (`/api/jobs`, `/api/applications`, `/api/auth`, `/api/health`)

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Pre-configured Data |
| :--- | :--- | :--- | :--- |
| **Candidate** | `candidate@nexus.com` | `password123` | Pre-loaded applications & status |
| **Recruiter** | `recruiter@nexus.com` | `admin123` | Access to manage jobs & applicants |

*(Or click the **Quick Demo Sign-In** buttons inside the sign-in modal)*

---

## ⚡ How to Run

### Method 1: One-Click Windows Batch (Recommended)
Double-click [`run.bat`](file:///c:/Users/nk766/OneDrive/Desktop/job_portal/run.bat) or run from terminal:
```cmd
run.bat
```

### Method 2: Command Line (PowerShell / Command Prompt)
1. **Compile Java sources:**
   ```powershell
   javac -encoding UTF-8 -d bin src\main\java\com\jobportal\SimpleJson.java src\main\java\com\jobportal\model\Job.java src\main\java\com\jobportal\model\Application.java src\main\java\com\jobportal\model\User.java src\main\java\com\jobportal\service\DataStore.java src\main\java\com\jobportal\JobPortalServer.java
   ```
2. **Start the server:**
   ```powershell
   java -cp bin com.jobportal.JobPortalServer 8080
   ```
3. Open your browser at: **`http://localhost:8080`**

### Method 3: Standalone Frontend
You can also directly double-click or open [`web/index.html`](file:///c:/Users/nk766/OneDrive/Desktop/job_portal/web/index.html) in any web browser (Chrome, Edge, Firefox). The frontend features automatic LocalStorage fallback and pre-seeded mock data for 100% offline functionality.

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/jobs` | Retrieve all job listings |
| `GET` | `/api/jobs/{id}` | Retrieve specific job details |
| `POST` | `/api/jobs` | Create a new job listing (Recruiter) |
| `PUT` | `/api/jobs/{id}` | Update an existing job listing (Recruiter) |
| `DELETE` | `/api/jobs/{id}` | Delete a job listing (Recruiter) |
| `GET` | `/api/applications` | Retrieve applications (supports `?email=...&jobId=...`) |
| `POST` | `/api/applications` | Submit a candidate application |
| `PATCH` | `/api/applications/{id}/status` | Update applicant hiring stage & notes |
| `POST` | `/api/auth/login` | Authenticate candidate or recruiter |
| `POST` | `/api/auth/register` | Register new candidate account |
| `GET` | `/api/health` | Server health check |

---

## 🌐 Deployment Guide

### Option 1: Instant GitHub Pages (Free)
1. Push this repository to GitHub.
2. In your GitHub repository, navigate to **Settings** &rarr; **Pages**.
3. Under **Build and deployment** &rarr; **Source**, select **GitHub Actions**.
4. The included [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) will automatically build and publish your site at `https://<your-username>.github.io/<repo-name>/`.

### Option 2: Full-Stack Cloud Deployment (Render / Railway / Docker)
Deploy the full Java 21 embedded server with REST APIs:
- **Render.com:**
  1. Click **New +** &rarr; **Blueprint** (or **Web Service**).
  2. Connect your GitHub repository.
  3. Render will automatically detect [`render.yaml`](render.yaml) or [`Dockerfile`](Dockerfile) and deploy your live URL.
- **Railway.app / Fly.io / Self-Hosted Docker:**
  ```bash
  docker build -t careernexus:latest .
  docker run -p 8080:8080 careernexus:latest
  ```

