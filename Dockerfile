# Build and runtime container for CareerNexus Java 21 Enterprise Job Portal
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy source code and directories
COPY src ./src
COPY data ./data
COPY web ./web

# Compile Java sources
RUN mkdir -p bin && \
    javac -encoding UTF-8 -d bin \
    src/main/java/com/jobportal/SimpleJson.java \
    src/main/java/com/jobportal/model/Job.java \
    src/main/java/com/jobportal/model/Application.java \
    src/main/java/com/jobportal/model/User.java \
    src/main/java/com/jobportal/service/DataStore.java \
    src/main/java/com/jobportal/JobPortalServer.java

# Final runtime image with lightweight JRE
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/bin ./bin
COPY --from=builder /app/data ./data
COPY --from=builder /app/web ./web

# Render, Railway, and Heroku inject PORT dynamically
ENV PORT=8080
EXPOSE 8080

CMD ["java", "-cp", "bin", "com.jobportal.JobPortalServer"]
