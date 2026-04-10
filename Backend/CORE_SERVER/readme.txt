---

## 🏗️ Architecture Overview

This backend uses a **Layered (N-Tier) Architecture** to ensure clean code and easy testing. The data flows in a single direction:

🌐 **Client** ➡️ 🚪 **Routes** ➡️ 🚦 **Controllers** ➡️ ⚙️ **Services** ➡️ 🗄️ **Models (DB)**

* **Routes:** Define the URLs and check authentication.
* **Controllers:** Extract data from the HTTP request (`req.body`, `req.params`) and send HTTP responses.
* **Services:** The "Brain." All business logic, algorithms, and rules live here.
* **Models:** Strict MongoDB schemas that enforce data structure before saving.

---

## 📂 Low-Level Directory Map

```text
📦 civic-platform-backend
 ┣ 📂 src
 ┃ ┣ 📂 config            # System configurations
 ┃ ┣ 📂 middlewares       # Request interceptors (Security & Errors)
 ┃ ┣ 📂 models            # Database Schemas (Mongoose)
 ┃ ┣ 📂 controllers       # Request/Response handlers
 ┃ ┣ 📂 services          # Core Business Logic (The heavy lifting)
 ┃ ┣ 📂 routes            # URL Endpoint definitions
 ┃ ┗ 📂 sockets           # Real-time WebSocket handlers
 ┣ 📜 server.js           # Application Entry Point
 ┗ 📜 .env                # Environment Variables (Secrets)
🔍 Deep Dive: What's Inside Each File?
1. 🗄️ Models (The Database Layer)
These files define what our database looks like. They are the only files allowed to talk directly to MongoDB.

📜 User.js: Stores username, email, and a hashed password. Contains a pre-save hook to automatically encrypt passwords using bcrypt before they hit the database.

📜 Problem.js: The core entity. Stores the issue title, description, importance, and GeoJSON location (Longitude/Latitude). It also holds two Arrays (upvotes and downvotes) referencing User IDs to prevent duplicate voting.

📜 Comment.js: Links a text string to a specific Problem ID and the authorId.

📜 Message.js: Tracks 1-to-1 chat. Stores senderId, receiverId, the content, and a crucial isRead boolean used to save offline messages.

2. ⚙️ Services (The Business Logic Layer)
These classes contain the actual rules of the application. They are called by the Controllers and the Socket Handlers.

📜 authService.js: Handles checking passwords against hashes and generating JSON Web Tokens (JWT) for secure sessions.

📜 problemService.js: Formats the incoming GPS coordinates into strict GeoJSON format before asking the Problem model to save it. Also handles fetching problems and populating author names.

📜 voteService.js: Enforces the "No Duplicate Votes" rule. It checks if a user is already in the upvotes array. If yes, it removes them (undo). If no, it adds them and removes them from downvotes.

📜 chatService.js: Acts as the memory for the WebSocket. If a user receives a message while offline, this service saves it to the Message model with isRead: false.

3. 🚦 Controllers (The HTTP Layer)
These files act as traffic cops. They take the user's web request, pass the data to a Service, and return a JSON response.

📜 authController.js: Passes email/password from req.body to authService. Returns 200 OK with the Token, or 401 Unauthorized.

📜 problemController.js: Handles creating problems and upvoting. Connects req.user.id (from the Auth Middleware) to the problemService.

📜 commentController.js: Extracts the problemId from the URL params and passes it to the service to create a comment. (Notice: No delete function exists, enforcing the platform rules).

4. 🚪 Routes (The Entry Points)
These map the URLs to the Controllers.

📜 authRoutes.js:

POST /api/auth/register

POST /api/auth/login

📜 problemRoutes.js:

GET /api/problems (Public)

POST /api/problems (Protected)

POST /api/problems/:id/upvote (Protected)

POST /api/problems/:id/comments (Protected)

5. 🔌 Sockets (The Real-Time Layer)
Handles persistent connections for live chat.

📜 index.js: The main Socket.io server. Keeps an active Map() of userId => socketId to track exactly who is online right now.

📜 chatHandler.js: Listens for the send_private_message event. Checks the Map to see if the receiver is online. If online, it blasts the message to them directly. If offline, it delegates the data to chatService.js to store in MongoDB for later.

6. 🛡️ Middlewares (The Gatekeepers)
📜 authMiddleware.js: Intercepts secure routes. Checks the Authorization header for a valid JWT. If valid, it unpacks the user's ID and attaches it to req.user for the Controllers to use.

📜 errorMiddleware.js: The global safety net. Catches any crashed requests and sends a clean JSON error response instead of taking the whole server offline.

🔗 Data Flow Example: How a Private Message is Sent
Frontend emits send_private_message over WebSocket.

sockets/chatHandler.js catches the event. It checks the in-memory Map to see if the receiver is online.

The handler passes the message text to services/chatService.js.

The service formats the data and tells models/Message.js to save it to MongoDB (marking isRead based on online status).

The handler then uses io.to(receiverSocketId).emit() to push the live message to the recipient's screen