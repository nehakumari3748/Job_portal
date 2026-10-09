package com.jobportal.model;

public class Application {
    public String id;
    public String jobId;
    public String jobTitle;
    public String company;
    public String candidateName;
    public String candidateEmail;
    public String candidatePhone;
    public String experienceYears;
    public String portfolioUrl;
    public String coverLetter;
    public String status; // "Applied", "Under Review", "Shortlisted", "Interview Scheduled", "Accepted", "Rejected"
    public String appliedDate;
    public String notes;

    public Application() {}

    public Application(String id, String jobId, String jobTitle, String company, String candidateName,
                       String candidateEmail, String candidatePhone, String experienceYears,
                       String portfolioUrl, String coverLetter, String status, String appliedDate, String notes) {
        this.id = id;
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.company = company;
        this.candidateName = candidateName;
        this.candidateEmail = candidateEmail;
        this.candidatePhone = candidatePhone;
        this.experienceYears = experienceYears;
        this.portfolioUrl = portfolioUrl;
        this.coverLetter = coverLetter;
        this.status = (status != null && !status.isEmpty()) ? status : "Applied";
        this.appliedDate = appliedDate;
        this.notes = notes != null ? notes : "";
    }

    public String toJson() {
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"id\":\"").append(escape(id)).append("\",");
        sb.append("\"jobId\":\"").append(escape(jobId)).append("\",");
        sb.append("\"jobTitle\":\"").append(escape(jobTitle)).append("\",");
        sb.append("\"company\":\"").append(escape(company)).append("\",");
        sb.append("\"candidateName\":\"").append(escape(candidateName)).append("\",");
        sb.append("\"candidateEmail\":\"").append(escape(candidateEmail)).append("\",");
        sb.append("\"candidatePhone\":\"").append(escape(candidatePhone)).append("\",");
        sb.append("\"experienceYears\":\"").append(escape(experienceYears)).append("\",");
        sb.append("\"portfolioUrl\":\"").append(escape(portfolioUrl)).append("\",");
        sb.append("\"coverLetter\":\"").append(escape(coverLetter)).append("\",");
        sb.append("\"status\":\"").append(escape(status)).append("\",");
        sb.append("\"appliedDate\":\"").append(escape(appliedDate)).append("\",");
        sb.append("\"notes\":\"").append(escape(notes)).append("\"");
        sb.append("}");
        return sb.toString();
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
