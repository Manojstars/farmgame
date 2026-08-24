FROM ubuntu:22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    wget \
    unzip \
    openjdk-17-jdk \
    openjdk-17-jdk-headless \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Set Java home
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Create working directory
WORKDIR /app

# Copy project
COPY . .

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Prebuild for Android
RUN npx expo prebuild --clean --platform android --yes

# Build debug APK
WORKDIR /app/android
RUN ./gradlew assembleDebug

# Copy APK to output location
RUN mkdir -p /app/output && \
    cp /app/android/app/build/outputs/apk/debug/app-debug.apk /app/output/game.apk

CMD ["echo", "Build complete. APK available at /app/output/game.apk"]
