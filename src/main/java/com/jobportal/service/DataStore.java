package com.jobportal.service;

import com.jobportal.SimpleJson;
import com.jobportal.model.Application;
import com.jobportal.model.Job;
import com.jobportal.model.User;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.text.SimpleDateFormat;
import java.util.*;

public class DataStore {
    private static final String DATA_DIR = "data";
    private static final String JOBS_FILE = "data/jobs.json";
    private static final String APPS_FILE = "data/applications.json";
    private static final String USERS_FILE = "data/users.json";

    private final List<Job> jobs = new ArrayList<>();
    private final List<Application> applications = new ArrayList<>();
    private final List<User> users = new ArrayList<>();

    public DataStore() {
        init();
    }

    public synchronized void init() {
        try {
            Files.createDirectories(Paths.get(DATA_DIR));
            loadJobs();
            loadApplications();
            loadUsers();
        } catch (Exception e) {
            System.err.println("Error initializing DataStore: " + e.getMessage());
        }
    }

    private void loadJobs() {
        jobs.clear();
        String json = readFile(JOBS_FILE);
        if (json != null && !json.trim().isEmpty()) {
            List<String> items = splitJsonArray(json);
            for (String item : items) {
                Job j = parseJob(item);
                if (j != null && j.id != null) {
                    jobs.add(j);
                }
            }
        }
    }

    private void loadApplications() {
        applications.clear();
        String json = readFile(APPS_FILE);
        if (json != null && !json.trim().isEmpty()) {
            List<String> items = splitJsonArray(json);
            for (String item : items) {
                Application a = parseApplication(item);
                if (a != null && a.id != null) {
                    applications.add(a);
                }
            }
        }
    }

    private void loadUsers() {
        users.clear();
        String json = readFile(USERS_FILE);
        if (json != null && !json.trim().isEmpty()) {
            List<String> items = splitJsonArray(json);
            for (String item : items) {
                User u = parseUser(item);
                if (u != null && u.id != null) {
                    users.add(u);
                }
            }
        }
    }

    public synchronized String getAllJobsJson() {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < jobs.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(jobs.get(i).toJson());
        }
        sb.append("]");
        return sb.toString();
    }

    public synchronized Job getJobById(String id) {
        for (Job j : jobs) {
            if (j.id.equalsIgnoreCase(id)) return j;
        }
        return null;
    }

    public synchronized Job addJob(String jsonBody) {
        Job j = parseJob(jsonBody);
        if (j.id == null || j.id.trim().isEmpty()) {
            j.id = "job-" + System.currentTimeMillis();
        }
        if (j.postedDate == null || j.postedDate.trim().isEmpty()) {
            j.postedDate = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
        }
        jobs.add(0, j); // newest first
        saveJobs();
        return j;
    }

    public synchronized Job updateJob(String id, String jsonBody) {
        for (int i = 0; i < jobs.size(); i++) {
            Job existing = jobs.get(i);
            if (existing.id.equalsIgnoreCase(id)) {
                Job updated = parseJob(jsonBody);
                updated.id = existing.id; // preserve id
                if (updated.postedDate == null || updated.postedDate.isEmpty()) {
                    updated.postedDate = existing.postedDate;
                }
                jobs.set(i, updated);
                saveJobs();
                return updated;
            }
        }
        return null;
    }

    public synchronized boolean deleteJob(String id) {
        boolean removed = jobs.removeIf(j -> j.id.equalsIgnoreCase(id));
        if (removed) {
            saveJobs();
        }
        return removed;
    }

    public synchronized String getAllApplicationsJson(String filterEmail, String filterJobId) {
        StringBuilder sb = new StringBuilder("[");
        boolean first = true;
        for (Application a : applications) {
            if (filterEmail != null && !filterEmail.isEmpty() && !a.candidateEmail.equalsIgnoreCase(filterEmail)) {
                continue;
            }
            if (filterJobId != null && !filterJobId.isEmpty() && !a.jobId.equalsIgnoreCase(filterJobId)) {
                continue;
            }
            if (!first) sb.append(",");
            sb.append(a.toJson());
            first = false;
        }
        sb.append("]");
        return sb.toString();
    }

    public synchronized Application addApplication(String jsonBody) {
        Application a = parseApplication(jsonBody);
        if (a.id == null || a.id.trim().isEmpty()) {
            a.id = "app-" + System.currentTimeMillis();
        }
        if (a.appliedDate == null || a.appliedDate.trim().isEmpty()) {
            a.appliedDate = new SimpleDateFormat("yyyy-MM-dd hh:mm a").format(new Date());
        }
        if (a.status == null || a.status.trim().isEmpty()) {
            a.status = "Applied";
        }
        // Link job details if missing
        if (a.jobTitle == null || a.jobTitle.isEmpty()) {
            Job j = getJobById(a.jobId);
            if (j != null) {
                a.jobTitle = j.title;
                a.company = j.company;
            }
        }
        applications.add(0, a);
        saveApplications();
        return a;
    }

    public synchronized Application updateApplicationStatus(String id, String newStatus, String notes) {
        for (Application a : applications) {
            if (a.id.equalsIgnoreCase(id)) {
                if (newStatus != null && !newStatus.trim().isEmpty()) {
                    a.status = newStatus.trim();
                }
                if (notes != null && !notes.trim().isEmpty()) {
                    a.notes = notes.trim();
                }
                saveApplications();
                return a;
            }
        }
        return null;
    }

    public synchronized User authenticate(String email, String password, String expectedRole) {
        for (User u : users) {
            if (u.email.equalsIgnoreCase(email) && u.password.equals(password)) {
                if (expectedRole == null || expectedRole.isEmpty() || u.role.equalsIgnoreCase(expectedRole)) {
                    return u;
                }
            }
        }
        return null;
    }

    public synchronized User registerUser(String jsonBody) {
        User u = parseUser(jsonBody);
        for (User existing : users) {
            if (existing.email.equalsIgnoreCase(u.email)) {
                return null; // Email already in use
            }
        }
        if (u.id == null || u.id.trim().isEmpty()) {
            u.id = "usr-" + System.currentTimeMillis();
        }
        if (u.role == null || u.role.isEmpty()) {
            u.role = "candidate";
        }
        users.add(u);
        saveUsers();
        return u;
    }

    private synchronized void saveJobs() {
        StringBuilder sb = new StringBuilder("[\n");
        for (int i = 0; i < jobs.size(); i++) {
            if (i > 0) sb.append(",\n");
            sb.append("  ").append(jobs.get(i).toJson());
        }
        sb.append("\n]");
        writeFile(JOBS_FILE, sb.toString());
    }

    private synchronized void saveApplications() {
        StringBuilder sb = new StringBuilder("[\n");
        for (int i = 0; i < applications.size(); i++) {
            if (i > 0) sb.append(",\n");
            sb.append("  ").append(applications.get(i).toJson());
        }
        sb.append("\n]");
        writeFile(APPS_FILE, sb.toString());
    }

    private synchronized void saveUsers() {
        StringBuilder sb = new StringBuilder("[\n");
        for (int i = 0; i < users.size(); i++) {
            if (i > 0) sb.append(",\n");
            User u = users.get(i);
            sb.append("  {");
            sb.append("\"id\":\"").append(SimpleJson.escape(u.id)).append("\",");
            sb.append("\"name\":\"").append(SimpleJson.escape(u.name)).append("\",");
            sb.append("\"email\":\"").append(SimpleJson.escape(u.email)).append("\",");
            sb.append("\"password\":\"").append(SimpleJson.escape(u.password)).append("\",");
            sb.append("\"role\":\"").append(SimpleJson.escape(u.role)).append("\",");
            sb.append("\"headline\":\"").append(SimpleJson.escape(u.headline)).append("\",");
            sb.append("\"company\":\"").append(SimpleJson.escape(u.company)).append("\",");
            sb.append("\"title\":\"").append(SimpleJson.escape(u.title)).append("\",");
            sb.append("\"phone\":\"").append(SimpleJson.escape(u.phone)).append("\"");
            sb.append("}");
        }
        sb.append("\n]");
        writeFile(USERS_FILE, sb.toString());
    }

    private Job parseJob(String json) {
        Job j = new Job();
        j.id = SimpleJson.extractString(json, "id");
        j.title = SimpleJson.extractString(json, "title");
        j.company = SimpleJson.extractString(json, "company");
        j.role = SimpleJson.extractString(json, "role");
        j.location = SimpleJson.extractString(json, "location");
        j.type = SimpleJson.extractString(json, "type");
        j.experience = SimpleJson.extractString(json, "experience");
        j.salary = SimpleJson.extractString(json, "salary");
        j.postedDate = SimpleJson.extractString(json, "postedDate");
        j.deadline = SimpleJson.extractString(json, "deadline");
        j.description = SimpleJson.extractString(json, "description");
        j.recruiterEmail = SimpleJson.extractString(json, "recruiterEmail");
        j.responsibilities = SimpleJson.extractStringList(json, "responsibilities");
        j.requirements = SimpleJson.extractStringList(json, "requirements");
        j.benefits = SimpleJson.extractStringList(json, "benefits");
        j.tags = SimpleJson.extractStringList(json, "tags");
        return j;
    }

    private Application parseApplication(String json) {
        Application a = new Application();
        a.id = SimpleJson.extractString(json, "id");
        a.jobId = SimpleJson.extractString(json, "jobId");
        a.jobTitle = SimpleJson.extractString(json, "jobTitle");
        a.company = SimpleJson.extractString(json, "company");
        a.candidateName = SimpleJson.extractString(json, "candidateName");
        a.candidateEmail = SimpleJson.extractString(json, "candidateEmail");
        a.candidatePhone = SimpleJson.extractString(json, "candidatePhone");
        a.experienceYears = SimpleJson.extractString(json, "experienceYears");
        a.portfolioUrl = SimpleJson.extractString(json, "portfolioUrl");
        a.coverLetter = SimpleJson.extractString(json, "coverLetter");
        a.status = SimpleJson.extractString(json, "status");
        a.appliedDate = SimpleJson.extractString(json, "appliedDate");
        a.notes = SimpleJson.extractString(json, "notes");
        return a;
    }

    private User parseUser(String json) {
        User u = new User();
        u.id = SimpleJson.extractString(json, "id");
        u.name = SimpleJson.extractString(json, "name");
        u.email = SimpleJson.extractString(json, "email");
        u.password = SimpleJson.extractString(json, "password");
        u.role = SimpleJson.extractString(json, "role");
        u.headline = SimpleJson.extractString(json, "headline");
        u.company = SimpleJson.extractString(json, "company");
        u.title = SimpleJson.extractString(json, "title");
        u.phone = SimpleJson.extractString(json, "phone");
        return u;
    }

    private List<String> splitJsonArray(String json) {
        List<String> list = new ArrayList<>();
        if (json == null) return list;
        int start = json.indexOf('[');
        int end = json.lastIndexOf(']');
        if (start == -1 || end == -1 || end <= start) return list;
        String content = json.substring(start + 1, end).trim();

        int braceCount = 0;
        boolean inQuote = false;
        StringBuilder current = new StringBuilder();

        for (int i = 0; i < content.length(); i++) {
            char c = content.charAt(i);
            if (c == '"' && (i == 0 || content.charAt(i - 1) != '\\')) {
                inQuote = !inQuote;
            }
            if (!inQuote) {
                if (c == '{') braceCount++;
                else if (c == '}') braceCount--;
            }
            current.append(c);
            if (!inQuote && braceCount == 0 && c == '}') {
                list.add(current.toString().trim());
                current.setLength(0);
                // skip comma
                while (i + 1 < content.length() && (content.charAt(i + 1) == ',' || Character.isWhitespace(content.charAt(i + 1)))) {
                    i++;
                }
            }
        }
        return list;
    }

    private String readFile(String path) {
        try {
            Path p = Paths.get(path);
            if (!Files.exists(p)) return null;
            return Files.readString(p, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return null;
        }
    }

    private void writeFile(String path, String content) {
        try {
            Files.writeString(Paths.get(path), content, StandardCharsets.UTF_8);
        } catch (Exception e) {
            System.err.println("Failed to write " + path + ": " + e.getMessage());
        }
    }
}
