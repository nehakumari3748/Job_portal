package com.jobportal;

import com.jobportal.model.Application;
import com.jobportal.model.Job;
import com.jobportal.model.User;
import com.jobportal.service.DataStore;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;

public class JobPortalServer {
    private static final int DEFAULT_PORT = 8080;
    private static final String WEB_ROOT = "web";
    private static final DataStore dataStore = new DataStore();

    public static void main(String[] args) {
        int port = DEFAULT_PORT;
        String envPort = System.getenv("PORT");
        if (envPort != null && !envPort.trim().isEmpty()) {
            try {
                port = Integer.parseInt(envPort.trim());
            } catch (Exception ignored) {}
        } else if (args.length > 0) {
            try {
                port = Integer.parseInt(args[0]);
            } catch (Exception ignored) {}
        }

        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
            server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());

            // API handlers
            server.createContext("/api/jobs", new JobsHandler());
            server.createContext("/api/applications", new ApplicationsHandler());
            server.createContext("/api/auth", new AuthHandler());
            server.createContext("/api/health", new HealthHandler());

            // Static Web UI handler (serves web/index.html, css, js, assets)
            server.createContext("/", new StaticFileHandler());

            server.start();
            System.out.println("==================================================");
            System.out.println("   CAREERNEXUS JOB PORTAL - JAVA 21 SERVER RUNNING");
            System.out.println("==================================================");
            System.out.println(" Web Portal URL : http://localhost:" + port);
            System.out.println(" API Endpoint   : http://localhost:" + port + "/api/jobs");
            System.out.println(" Candidate Demo : candidate@nexus.com / password123");
            System.out.println(" Recruiter Demo : recruiter@nexus.com / admin123");
            System.out.println(" Press Ctrl+C in terminal to stop server.");
            System.out.println("==================================================");

        } catch (IOException e) {
            System.err.println("Failed to start server on port " + port + ": " + e.getMessage());
        }
    }

    // ================= STATIC FILE HANDLER =================
    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String path = exchange.getRequestURI().getPath();
            if (path == null || path.equals("/") || path.isEmpty()) {
                path = "/index.html";
            }

            // Normalize path inside web root
            if (path.startsWith("/web/")) {
                path = path.substring(4);
            }

            Path filePath = Paths.get(WEB_ROOT, path.replace('/', File.separatorChar));

            // If path doesn't exist, check index.html for SPA fallback
            if (!Files.exists(filePath) || Files.isDirectory(filePath)) {
                filePath = Paths.get(WEB_ROOT, "index.html");
            }

            if (Files.exists(filePath) && !Files.isDirectory(filePath)) {
                String mimeType = getMimeType(filePath.toString());
                byte[] bytes = Files.readAllBytes(filePath);
                exchange.getResponseHeaders().set("Content-Type", mimeType);
                exchange.getResponseHeaders().set("Cache-Control", "no-cache, must-revalidate");
                exchange.sendResponseHeaders(200, bytes.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(bytes);
                }
            } else {
                String notFound = "<h1>404 - File Not Found</h1><p>Path: " + path + "</p>";
                byte[] bytes = notFound.getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
                exchange.sendResponseHeaders(404, bytes.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(bytes);
                }
            }
        }
    }

    // ================= JOBS HANDLER =================
    static class JobsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            String method = exchange.getRequestMethod();

            if ("OPTIONS".equalsIgnoreCase(method)) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String path = exchange.getRequestURI().getPath();
            String[] segments = path.split("/");
            String jobId = (segments.length >= 4) ? segments[3] : null;

            if ("GET".equalsIgnoreCase(method)) {
                if (jobId != null && !jobId.isEmpty()) {
                    Job job = dataStore.getJobById(jobId);
                    if (job != null) {
                        sendJsonResponse(exchange, 200, job.toJson());
                    } else {
                        sendJsonResponse(exchange, 404, "{\"error\":\"Job not found\"}");
                    }
                } else {
                    sendJsonResponse(exchange, 200, dataStore.getAllJobsJson());
                }
            } else if ("POST".equalsIgnoreCase(method)) {
                String body = readBody(exchange);
                Job created = dataStore.addJob(body);
                sendJsonResponse(exchange, 201, created.toJson());
            } else if ("PUT".equalsIgnoreCase(method)) {
                if (jobId == null || jobId.isEmpty()) {
                    sendJsonResponse(exchange, 400, "{\"error\":\"Job ID required for update\"}");
                    return;
                }
                String body = readBody(exchange);
                Job updated = dataStore.updateJob(jobId, body);
                if (updated != null) {
                    sendJsonResponse(exchange, 200, updated.toJson());
                } else {
                    sendJsonResponse(exchange, 404, "{\"error\":\"Job not found to update\"}");
                }
            } else if ("DELETE".equalsIgnoreCase(method)) {
                if (jobId == null || jobId.isEmpty()) {
                    sendJsonResponse(exchange, 400, "{\"error\":\"Job ID required for deletion\"}");
                    return;
                }
                boolean deleted = dataStore.deleteJob(jobId);
                if (deleted) {
                    sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Job deleted successfully\"}");
                } else {
                    sendJsonResponse(exchange, 404, "{\"error\":\"Job not found\"}");
                }
            } else {
                exchange.sendResponseHeaders(405, -1);
            }
        }
    }

    // ================= APPLICATIONS HANDLER =================
    static class ApplicationsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            String method = exchange.getRequestMethod();

            if ("OPTIONS".equalsIgnoreCase(method)) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String path = exchange.getRequestURI().getPath();
            String[] segments = path.split("/");
            // /api/applications or /api/applications/{id}/status
            String appId = (segments.length >= 4) ? segments[3] : null;
            boolean isStatusUpdate = segments.length >= 5 && "status".equalsIgnoreCase(segments[4]);

            if ("GET".equalsIgnoreCase(method)) {
                Map<String, String> query = parseQuery(exchange.getRequestURI().getQuery());
                String email = query.get("email");
                String jobId = query.get("jobId");
                sendJsonResponse(exchange, 200, dataStore.getAllApplicationsJson(email, jobId));
            } else if ("POST".equalsIgnoreCase(method)) {
                String body = readBody(exchange);
                Application created = dataStore.addApplication(body);
                sendJsonResponse(exchange, 201, created.toJson());
            } else if (("PATCH".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method)) && isStatusUpdate) {
                String body = readBody(exchange);
                String newStatus = SimpleJson.extractString(body, "status");
                String notes = SimpleJson.extractString(body, "notes");
                Application updated = dataStore.updateApplicationStatus(appId, newStatus, notes);
                if (updated != null) {
                    sendJsonResponse(exchange, 200, updated.toJson());
                } else {
                    sendJsonResponse(exchange, 404, "{\"error\":\"Application not found\"}");
                }
            } else {
                exchange.sendResponseHeaders(405, -1);
            }
        }
    }

    // ================= AUTH HANDLER =================
    static class AuthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            String method = exchange.getRequestMethod();

            if ("OPTIONS".equalsIgnoreCase(method)) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String path = exchange.getRequestURI().getPath();
            if ("POST".equalsIgnoreCase(method) && path.endsWith("/login")) {
                String body = readBody(exchange);
                String email = SimpleJson.extractString(body, "email");
                String password = SimpleJson.extractString(body, "password");
                String role = SimpleJson.extractString(body, "role");

                User user = dataStore.authenticate(email, password, role);
                if (user != null) {
                    sendJsonResponse(exchange, 200, "{\"success\":true,\"user\":" + user.toJson() + "}");
                } else {
                    sendJsonResponse(exchange, 401, "{\"success\":false,\"error\":\"Invalid credentials or role mismatch\"}");
                }
            } else if ("POST".equalsIgnoreCase(method) && path.endsWith("/register")) {
                String body = readBody(exchange);
                User registered = dataStore.registerUser(body);
                if (registered != null) {
                    sendJsonResponse(exchange, 201, "{\"success\":true,\"user\":" + registered.toJson() + "}");
                } else {
                    sendJsonResponse(exchange, 400, "{\"success\":false,\"error\":\"Email is already registered\"}");
                }
            } else {
                exchange.sendResponseHeaders(404, -1);
            }
        }
    }

    // ================= HEALTH HANDLER =================
    static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            String resp = "{\"status\":\"healthy\",\"server\":\"Java 21 HTTPServer\",\"time\":" + System.currentTimeMillis() + "}";
            sendJsonResponse(exchange, 200, resp);
        }
    }

    // ================= HELPERS =================
    private static void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static String readBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody();
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
            return sb.toString().trim();
        }
    }

    private static Map<String, String> parseQuery(String query) {
        Map<String, String> map = new HashMap<>();
        if (query == null || query.isEmpty()) return map;
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf("=");
            try {
                if (idx > 0) {
                    String key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
                    String val = URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8);
                    map.put(key, val);
                } else if (!pair.isEmpty()) {
                    map.put(URLDecoder.decode(pair, StandardCharsets.UTF_8), "");
                }
            } catch (Exception ignored) {}
        }
        return map;
    }

    private static String getMimeType(String path) {
        String lower = path.toLowerCase();
        if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html; charset=UTF-8";
        if (lower.endsWith(".css")) return "text/css; charset=UTF-8";
        if (lower.endsWith(".js")) return "application/javascript; charset=UTF-8";
        if (lower.endsWith(".json")) return "application/json; charset=UTF-8";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".ico")) return "image/x-icon";
        if (lower.endsWith(".pdf")) return "application/pdf";
        if (lower.endsWith(".woff2")) return "font/woff2";
        if (lower.endsWith(".woff")) return "font/woff";
        return "application/octet-stream";
    }
}
