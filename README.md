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

## Complete Quick Start Guide (Zero to Kubernetes)
Follow these sequential steps to run the entire project from scratch up to a fully orchestrated Kubernetes cluster.

### 1. Preparation
Clone the repository and create the required environment variables for the backend.
```bash
git clone <your-repo-link>
cd SkillSwap
echo "PORT=5000" > server/.env
echo "JWT_SECRET=your_super_secret_key" >> server/.env
```

### 2. Build the Docker Images
Kubernetes needs the container images built locally before it can deploy the pods.
```bash
# Build Backend Image
cd server
docker build -t skillswap-server:latest .
cd ..

# Build Frontend Image
cd client
docker build -t skillswap-client:latest .
cd ..
```

### 3. Deploy to Kubernetes
Spin up the database, persistent storage, frontend, backend, and autoscaler all at once.
```bash
# Apply all YAML components in the k8s directory securely
kubectl apply -f k8s/
```

### 4. Verify & Access
Ensure all 7 integrated pods are fully initialized and the autoscaler is monitoring them.
```bash
# View all running resources
kubectl get pods
kubectl get hpa
```
*Your application is now fully live and scaling dynamically inside Kubernetes!*

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