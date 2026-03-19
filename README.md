# SkillSwap

SkillSwap is a MERN stack-based freelancing and project bidding marketplace platform (similar to Upwork or Fiverr). It connects clients who have projects with freelancers looking for work. The application supports multiple user roles: Clients, Freelancers, and Admins.

## Key Features
- **Project Bidding System**: Freelancers can place bids on projects posted by clients.
- **Real-Time Communication**: Integrated real-time messaging using Socket.io.
- **Project Management**: Project tracking and dedicated timelines for tasks.
- **Ratings & Reviews**: A system for clients and freelancers to review one another.
- **Analytics Dashboard**: For users and administrators to view platform or personal statistics.
- **Notifications**: Real-time notifications for interactions.
- **Security & Authentication**: Google OAuth and JWT-based authentication.

## Tech Stack
- **Frontend**: React (v19), Tailwind CSS, Framer Motion, Three.js, Chart.js, Recharts, Axios, Socket.io-client.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io, JWT, Passport.js, Multer, Nodemailer, Twilio, Node-cron.

## How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- A running [MongoDB](https://www.mongodb.com/) database (either a local instance or a cloud database like MongoDB Atlas).

### 1. Clone the repository
```bash
git clone "https://github.com/AhmadR-11/SkillSwap.git"
cd SkillSwap
```

### 2. Setup the Backend (Server)

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install all required dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory. The file should include your environment secrets (adjust as per your project configurations):
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/skillswap # or your Atlas URI
   JWT_SECRET=your_super_secret_jwt_key
   GOOGLE_CLIENT_ID=your_google_client_id
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server should now be running on `http://localhost:5000`.*

### 3. Setup the Frontend (Client)

1. Open a **new** terminal window and navigate to the `client` directory from the root of the project:
   ```bash
   cd client
   ```
2. Install all required dependencies:
   ```bash
   npm install
   ```
3. Run the React development server:
   ```bash
   npm start
   ```
   *The frontend should open automatically on `http://localhost:3000`.*

### Important Note
Make sure the frontend is configured to target the correct backend endpoints (i.e. `http://localhost:5000/api` for API requests and `ws://localhost:5000` for Socket.io).