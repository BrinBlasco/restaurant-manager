# QuickServe - Real-Time Restaurant Order Management System

## Overview

QuickServe is a full-stack web application designed to streamline order management in a restaurant environment. It provides distinct interfaces for Waiters and Kitchen staff, enabling real-time creation, tracking, and updating of customer orders. The system leverages WebSockets for instant communication between different user views, ensuring all relevant parties are immediately informed of order changes.

The application features a React frontend for a dynamic user experience and a Node.js/Express.js backend with MongoDB for data persistence and business logic.

## Core Features

*   **User Roles:**
    *   **Waiter View:** Allows waiters to create new orders, view existing orders and their statuses, and manage orders (e.g., mark as delivered, delete).
    *   **Kitchen View:** Provides kitchen staff with a real-time display of incoming orders, allowing them to update order statuses (e.g., Pending -> Preparing -> Ready).
*   **Real-Time Updates:** Utilizes Socket.IO for instantaneous broadcasting of:
    *   New orders to the Kitchen and other Waiters.
    *   Order status updates from the Kitchen to Waiters.
    *   Order deletions to all relevant views.
*   **Persistent Order Storage:** Orders are saved and managed in a MongoDB database.
*   **API-Driven Architecture:**
    *   Client actions (creating orders, updating status) are performed via RESTful API calls to the backend.
    *   The server validates actions, interacts with the database, and then uses WebSockets to notify clients of confirmed changes.
*   **Authentication & Authorization:**
    *   JWT-based authentication (implied by `authenticateJWT` middleware).
    *   Role-based access control for different views and actions (implied by `currentPermissions` and `authorize` middleware).
*   **Dynamic Filtering:** Users can filter orders by status (Pending, Preparing, Ready, Delivered, All).
*   **Company-Specific Rooms:** WebSocket communication is scoped to specific company IDs, ensuring data isolation.
*   **Robust Connection Management:** The `SocketProvider` handles WebSocket connection lifecycles, including reconnections and joining appropriate company rooms.

## Tech Stack

**Frontend:**
*   React
*   Axios (for API communication)
*   Socket.IO-Client (for WebSocket communication)
*   JavaScript (ES6+)
*   CSS Modules (implied by `styles.module.css`)
*   React Context API (for Auth and Socket state management)

**Backend:**
*   Node.js
*   Express.js
*   Socket.IO (server-side)
*   Mongoose (ODM for MongoDB)
*   MongoDB (Database)
*   JSON Web Tokens (JWT) for authentication
*   Cookie-Parser

**Development Tools:**
*   Vite (implied by `import.meta.env` for frontend) or Create React App
*   Nodemon (for backend development)
*   dotenv (for environment variables)

## Prerequisites

Before you begin, ensure you have the following installed:
*   Node.js (LTS version recommended)
*   npm or yarn
*   MongoDB (running locally or accessible via a cloud service like MongoDB Atlas)

## Project Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/BrinBlasco/restaurant-manager.git
    cd restaurant-manager-<branch>
    ```

2.  **Backend Setup:**
    *   Navigate to the backend directory (e.g., `cd server` or your backend folder name).
    *   Install dependencies:
        ```bash
        npm install
        # or
        yarn install
        ```
    *   Create a `.env` file in the backend's root directory and add the following environment variables (see `.env.example` if provided):
        ```env
        MONGO_URI=your_mongodb_connection_string
        PORT=5000 # Or your preferred backend port
        JWT_SECRET=your_strong_jwt_secret_key
        # Add any other backend-specific variables
        ```

3.  **Frontend Setup:**
    *   Navigate to the frontend directory (e.g., `cd client` or your frontend folder name).
    *   Install dependencies:
        ```bash
        npm install
        # or
        yarn install
        ```
    *   Create a `.env` file in the frontend's root directory (if using Vite, it's usually `.env.local` or `.env` at the root):
        ```env
        # For Vite, prefix with VITE_
        VITE_SOCKET_SERVER_URL=http://localhost:5000 # URL of your backend Socket.IO server during development
        # For Create React App, prefix with REACT_APP_
        # REACT_APP_SOCKET_SERVER_URL=http://localhost:5000
        # Add any other frontend-specific variables
        ```
        *Note: In production, `VITE_SOCKET_SERVER_URL` might be `window.location.origin` if frontend and backend are served from the same domain.*

## Running the Application

1.  **Start MongoDB:** Ensure your MongoDB instance is running.

2.  **Start the Backend Development Server:**
    *   Navigate to the backend directory.
    *   Run:
        ```bash
        npm run dev # If you have a dev script (e.g., using nodemon)
        # or
        npm start # If you have a start script
        ```
    *   The backend server should typically start on `http://localhost:5000` (or the `PORT` specified in your `.env`).

3.  **Start the Frontend Development Server:**
    *   Navigate to the frontend directory.
    *   Run:
        ```bash
        npm run dev # For Vite
        # or
        npm start # For Create React App
        ```
    *   The frontend application should typically start on `http://localhost:9999` (or another port specified by your dev server). Open this URL in your browser.

## Key API Endpoints (Backend)

Base Path: `/api` (handled by your Axios config and backend routing)

*   **Authentication:**
    *   `POST /auth/login`
    *   `POST /auth/register`
    *   `POST /auth/logout`
    *   `GET /auth/me` (to check current user)
*   **Orders (scoped by company):**
    *   `GET /company/:companyId/orders` (Fetch orders, supports `?status=` query param)
    *   `POST /company/:companyId/orders` (Create a new order)
    *   `PUT /company/:companyId/orders/:orderId/status` (Update order status)
    *   `DELETE /company/:companyId/orders/:orderId` (Delete an order)
*   **Menu Items (scoped by company):**
    *   `GET /company/:companyId/menu-items`
*   **Roles & Employees (scoped by company):**
    *   Endpoints under `/company/:companyId/roles`
    *   Endpoints under `/company/:companyId/employees`
*   **Company & User:**
    *   Endpoints under `/company`
    *   Endpoints under `/user`

## Key WebSocket Events (Server -> Client)

*   **`joinCompanyRoom` (Client -> Server):** Client requests to join a room associated with a `companyId`.
*   **`joinedRoom` (Server -> Client):** Server confirms the client has successfully joined the room.
*   **`errorJoining` (Server -> Client):** Server indicates an error occurred while trying to join a room.
*   **`NEW_ORDER` (Server -> Client Room):** Broadcasts a newly created order object.
*   **`ORDER_UPDATE` (Server -> Client Room):** Broadcasts an updated order object (typically after a status change or delivery).
*   **`ORDER_DELETED` (Server -> Client Room):** Broadcasts the ID of an order that has been deleted (`{ orderId: '...' }`).

## Architectural Highlights

*   **Server as Single Source of Truth:** All order modifications are processed and validated by the backend API before changes are persisted and broadcast.
*   **API for Actions, WebSockets for Notifications:** Clients use standard HTTP requests for actions. The server then uses WebSockets to inform all relevant connected clients about these confirmed changes in real-time.
*   **Decoupled Client Updates:** Client components listen for specific WebSocket events (`NEW_ORDER`, `ORDER_UPDATE`, `ORDER_DELETED`) to update their local state, rather than relying on direct peer-to-peer messages.
*   **Robust Connection Handling:** The `SocketProvider` manages the WebSocket lifecycle, ensuring reconnection attempts and that pages fetch fresh data and attach listeners only when the socket is connected and has successfully joined the appropriate company room (`isSocketReadyForData` flag).


## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---
