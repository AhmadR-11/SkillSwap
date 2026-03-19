# SkillSwap

SkillSwap is a MERN stack-based freelancing and project bidding marketplace platform (similar to Upwork or Fiverr). It connects clients who have projects with freelancers looking for work. The application supports multiple user roles: Clients, Freelancers, and Admins.

## Project Overview
SkillSwap features a complete Project Bidding System, real-time messaging via Socket.io, dedicated project management workspaces, analytics dashboards, and role-based authentication using Google OAuth and JWT.

## Tools and Technologies Used
- **Frontend**: React (v19), Tailwind CSS, Framer Motion, Three.js, Chart.js, Socket.io-client.
- **Backend**: Node.js, Express.js, Socket.io, JWT, Passport.js, Multer.
- **Database**: MongoDB (Mongoose).
- **DevOps**: Docker, Docker Compose, Kubernetes, Horizontal Pod Autoscaler (HPA).

## Application Architecture
The application follows a standard containerized architecture for modern cloud deployment:
1. **Frontend Tier (Client)**: A React Single Page Application (SPA) built using a multi-stage Dockerfile and served via Nginx.
2. **Backend/API Tier (Server)**: A Node.js/Express REST API exposing endpoints and handling bidirectional WebSocket connections.
3. **Data Tier (Database)**: A containerized MongoDB instance utilizing Kubernetes Persistent Volumes (PV/PVC) for stateful data retention across pod restarts.

---

## Docker Build and Run Instructions

### 1. Build & Run the Backend
```bash
cd server
docker build -t skillswap-server .
docker run -p 5000:5000 --env-file .env -e MONGO_URI="mongodb://host.docker.internal:27017/skillswap" skillswap-server
```

### 2. Build & Run the Frontend
```bash
cd client
docker build -t skillswap-client .
docker run -p 3000:80 skillswap-client
```

---

## Docker Compose Setup
To spin up the entire application stack (Frontend, Backend, and MongoDB) simultaneously using a single command:
```bash
# Run from the root directory
docker-compose up --build
```
This automatically handles container networking (`mern_net`), maps the required host ports (`3000`, `5000`, `27018`), and binds the `MONGO_URI` safely to the internal Compose database instance.

---

## Kubernetes Deployment Steps
The application is fully orchestrated using Kubernetes manifests located in the `/k8s` directory.

### 1. Provision Persistent Storage (Database)
Create the Persistent Volume and Claim to ensure database data outlives ephemeral containers:
```bash
kubectl apply -f k8s/mongo-storage.yaml
kubectl apply -f k8s/mongo-deployment.yaml
```

### 2. Deploy the Applications
Deploy the backend and frontend services (Configured for exactly 3 replicas each):
```bash
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```
*To verify your deployment: `kubectl get pods`*

### 3. Graceful Teardown
To cleanly shut down and completely remove the entire cluster environment:
```bash
kubectl delete -f k8s/
```

---

## Scaling Configuration (HPA)
To ensure high availability and cost-efficiency, the system is configured with a Horizontal Pod Autoscaler (HPA) to dynamically adjust pod counts based on incoming traffic loads.

**Rules defined in `k8s/hpa.yaml`:**
- **Minimum Pods:** 2
- **Maximum Pods:** 5
- **CPU Utilization Target:** 70%

**To deploy the autoscaler:**
```bash
kubectl apply -f k8s/hpa.yaml
```
*To monitor your autoscaler telemetry: `kubectl get hpa`*