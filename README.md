# ⬡ KubeVision

> A production-grade Kubernetes infrastructure management platform designed for real-time cluster observability, deployment orchestration, and modern DevOps workflows.

KubeVision provides engineers with a centralized dashboard to monitor Kubernetes resources, visualize infrastructure health, manage deployments, inspect logs, and simulate enterprise deployment strategies such as Blue-Green deployments.

Built as an extension of the Blue-Green Deployment challenge from roadmap.sh, the project evolved into a full-stack platform that combines Kubernetes operations, observability, and deployment automation within a modern web application.

---

## Overview

Modern cloud-native environments generate large amounts of operational data spread across clusters, deployments, services, and monitoring systems. KubeVision brings these insights together into a single interface, enabling teams to understand infrastructure health and deployment status in real time.

The platform focuses on three core areas:

* Kubernetes resource visibility
* Infrastructure observability
* Deployment lifecycle management

---

## Key Features

### Real-Time Cluster Monitoring

Monitor Kubernetes resources through a unified dashboard with visibility into:

* Clusters
* Nodes
* Pods
* Deployments
* Resource utilization
* Workload health

### Infrastructure Observability

Visualize live infrastructure metrics through integrated monitoring dashboards, including:

* CPU utilization
* Memory consumption
* Pod health
* Cluster performance trends
* Historical metric analysis

### Blue-Green Deployment Workflows

Simulate enterprise deployment strategies with:

* Progressive release management
* Traffic switching workflows
* Health validation checks
* Rollback capabilities
* Deployment history tracking

### Deployment Management

Manage application lifecycles directly from the platform:

* Create deployments
* Scale workloads
* Restart services
* Track release versions
* Review deployment activity

### Log Exploration

Inspect application behavior through a real-time log viewer featuring:

* Live log streaming
* Pod-based filtering
* Severity filtering
* Searchable logs
* Terminal-style viewing experience

### Modern User Experience

Built with a responsive dashboard experience that includes:

* Interactive visualizations
* Animated workflows
* Real-time updates
* Dark-themed infrastructure UI
* Optimized developer experience

---

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* TanStack Query
* React Router
* Zustand
* Recharts
* Framer Motion
* Lucide Icons

### Backend

* Node.js
* Express
* TypeScript
* Kubernetes Client SDK
* Prisma ORM
* PostgreSQL
* Zod
* Prometheus Client

### Infrastructure & DevOps

* Kubernetes
* Docker
* Helm
* Prometheus
* Grafana
* Nginx
* GitHub Actions

---

## Architecture

KubeVision follows a modern full-stack architecture:

* React frontend for visualization and user interaction
* Node.js backend for orchestration and data aggregation
* Kubernetes integration for resource management
* Prometheus-powered metrics collection
* PostgreSQL persistence layer for deployment and audit records
* CI/CD workflows for automated validation and deployment

---

## What This Project Demonstrates

This project showcases practical experience with:

* Kubernetes administration and resource management
* Infrastructure monitoring and observability
* Blue-Green deployment strategies
* CI/CD automation
* Containerized application development
* Full-stack TypeScript applications
* Metrics collection and visualization
* Production-inspired system design

---

## Learning Outcomes

Through building KubeVision, I gained hands-on experience with:

* Kubernetes APIs and cluster operations
* Infrastructure observability patterns
* Prometheus metrics collection and querying
* Deployment automation workflows
* Release management strategies
* Scalable frontend architecture
* Backend service orchestration
* Monitoring dashboard development

---

## Project Goal

The primary objective of KubeVision is to bridge the gap between application development and infrastructure operations by providing a practical platform for exploring modern DevOps and cloud-native concepts in a real-world environment.

---

## License

MIT License

---

Built as a DevOps and Platform Engineering portfolio project inspired by the https://roadmap.sh/projects/blue-green-deployment and https://roadmap.sh/projects/monitoring.
