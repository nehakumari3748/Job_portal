package com.jobportal.model;

import java.util.ArrayList;
import java.util.List;

public class Job {
    public String id;
    public String title;
    public String company;
    public String role;
    public String location;
    public String type;
    public String experience;
    public String salary;
    public String postedDate;
    public String deadline;
    public String description;
    public List<String> responsibilities = new ArrayList<>();
    public List<String> requirements = new ArrayList<>();
    public List<String> benefits = new ArrayList<>();
    public List<String> tags = new ArrayList<>();
    public String recruiterEmail;

    public Job() {}

    public Job(String id, String title, String company, String role, String location, String type,
               String experience, String salary, String postedDate, String deadline,
               String description, List<String> responsibilities, List<String> requirements,
               List<String> benefits, List<String> tags, String recruiterEmail) {
        this.id = id;
        this.title = title;
        this.company = company;
        this.role = role;
        this.location = location;
        this.type = type;
        this.experience = experience;
        this.salary = salary;
        this.postedDate = postedDate;
        this.deadline = deadline;
        this.description = description;
        if (responsibilities != null) this.responsibilities = responsibilities;
        if (requirements != null) this.requirements = requirements;
        if (benefits != null) this.benefits = benefits;
        if (tags != null) this.tags = tags;
        this.recruiterEmail = recruiterEmail;
    }

    public String toJson() {
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"id\":\"").append(escape(id)).append("\",");
        sb.append("\"title\":\"").append(escape(title)).append("\",");
        sb.append("\"company\":\"").append(escape(company)).append("\",");
        sb.append("\"role\":\"").append(escape(role)).append("\",");
        sb.append("\"location\":\"").append(escape(location)).append("\",");
        sb.append("\"type\":\"").append(escape(type)).append("\",");
        sb.append("\"experience\":\"").append(escape(experience)).append("\",");
        sb.append("\"salary\":\"").append(escape(salary)).append("\",");
        sb.append("\"postedDate\":\"").append(escape(postedDate)).append("\",");
        sb.append("\"deadline\":\"").append(escape(deadline)).append("\",");
        sb.append("\"description\":\"").append(escape(description)).append("\",");
        sb.append("\"responsibilities\":").append(listToJson(responsibilities)).append(",");
        sb.append("\"requirements\":").append(listToJson(requirements)).append(",");
        sb.append("\"benefits\":").append(listToJson(benefits)).append(",");
        sb.append("\"tags\":").append(listToJson(tags)).append(",");
        sb.append("\"recruiterEmail\":\"").append(escape(recruiterEmail)).append("\"");
        sb.append("}");
        return sb.toString();
    }

    private static String listToJson(List<String> items) {
        if (items == null || items.isEmpty()) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < items.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("\"").append(escape(items.get(i))).append("\"");
        }
        sb.append("]");
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
