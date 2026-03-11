# DataSniffer AI - Product Overview

DataSniffer AI is a web security analysis platform that combines proxy interception, browser automation, and AI-powered vulnerability detection.

## Core Capabilities

- **Proxy Interceptor**: Captures and analyzes HTTP/HTTPS traffic in real-time using mitmproxy
- **Deep Analysis**: Browser-based inspection using Playwright for JavaScript-heavy applications
- **AI Integration**: Vulnerability explanations via OpenRouter API
- **Intelligent Crawling**: Automatic endpoint discovery and route validation
- **Fuzzing**: Automated parameter and payload testing
- **False Positive Management**: Rule-based filtering system (regex, wildcards, JSON patterns)

## Security Features Detected

- SQL Injection
- XSS (Cross-Site Scripting)
- IDOR (Insecure Direct Object Reference)
- Sensitive Data Exposure
- Security Misconfiguration
- CSRF, Open Redirects, Path Traversal

## Multi-Tenant Architecture

- Row Level Security (RLS) for complete data isolation between users
- Role-based access control (admin/user)
- JWT authentication with 24h expiration
- Audit logging for compliance
