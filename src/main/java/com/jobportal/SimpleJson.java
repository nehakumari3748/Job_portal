package com.jobportal;

import java.util.*;

/**
 * Lightweight, zero-dependency JSON helper for parsing and serializing JSON in pure Java.
 */
public class SimpleJson {

    public static String escape(String text) {
        if (text == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < ' ') {
                        String hex = Integer.toHexString(c);
                        sb.append("\\u");
                        for (int k = 0; k < 4 - hex.length(); k++) sb.append('0');
                        sb.append(hex);
                    } else {
                        sb.append(c);
                    }
            }
        }
        return sb.toString();
    }

    public static String extractString(String json, String key) {
        if (json == null || key == null) return null;
        String pattern = "\"" + key + "\"";
        int idx = json.indexOf(pattern);
        if (idx == -1) return null;
        int colon = json.indexOf(':', idx + pattern.length());
        if (colon == -1) return null;
        int quoteStart = json.indexOf('"', colon + 1);
        if (quoteStart == -1) return null;
        StringBuilder sb = new StringBuilder();
        boolean escaped = false;
        for (int i = quoteStart + 1; i < json.length(); i++) {
            char c = json.charAt(i);
            if (escaped) {
                if (c == 'n') sb.append('\n');
                else if (c == 'r') sb.append('\r');
                else if (c == 't') sb.append('\t');
                else sb.append(c);
                escaped = false;
            } else if (c == '\\') {
                escaped = true;
            } else if (c == '"') {
                return sb.toString();
            } else {
                sb.append(c);
            }
        }
        return sb.toString();
    }

    public static List<String> extractStringList(String json, String key) {
        List<String> list = new ArrayList<>();
        if (json == null || key == null) return list;
        String pattern = "\"" + key + "\"";
        int idx = json.indexOf(pattern);
        if (idx == -1) return list;
        int bracketStart = json.indexOf('[', idx + pattern.length());
        if (bracketStart == -1) return list;
        int bracketEnd = json.indexOf(']', bracketStart);
        if (bracketEnd == -1) return list;
        String inside = json.substring(bracketStart + 1, bracketEnd);
        boolean inQuote = false;
        StringBuilder current = new StringBuilder();
        for (int i = 0; i < inside.length(); i++) {
            char c = inside.charAt(i);
            if (c == '"') {
                if (inQuote) {
                    list.add(current.toString().trim());
                    current.setLength(0);
                    inQuote = false;
                } else {
                    inQuote = true;
                }
            } else if (inQuote) {
                current.append(c);
            }
        }
        return list;
    }
}
