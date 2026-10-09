package com.jobportal.model;

public class User {
    public String id;
    public String name;
    public String email;
    public String password;
    public String role; // "candidate" or "recruiter"
    public String headline;
    public String company;
    public String title;
    public String phone;

    public User() {}

    public User(String id, String name, String email, String password, String role,
                String headline, String company, String title, String phone) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.headline = headline;
        this.company = company;
        this.title = title;
        this.phone = phone;
    }

    public String toJson() {
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"id\":\"").append(escape(id)).append("\",");
        sb.append("\"name\":\"").append(escape(name)).append("\",");
        sb.append("\"email\":\"").append(escape(email)).append("\",");
        sb.append("\"role\":\"").append(escape(role)).append("\",");
        sb.append("\"headline\":\"").append(escape(headline)).append("\",");
        sb.append("\"company\":\"").append(escape(company)).append("\",");
        sb.append("\"title\":\"").append(escape(title)).append("\",");
        sb.append("\"phone\":\"").append(escape(phone)).append("\"");
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
