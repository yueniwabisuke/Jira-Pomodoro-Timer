# Jira Pomodoro Timer

This is a minimal web application that connects to your Jira instance, fetches your assigned issues, and allows you to track the time you spend on them using a Pomodoro timer. When the timer stops, the elapsed time is automatically logged to the corresponding Jira issue.

## 1. Project Architecture

The application consists of two main parts:

-   **Backend**: A Node.js/Express server that acts as a proxy to the Jira REST API. It securely handles authentication and provides simple endpoints for the frontend.
-   **Frontend**: A React/Vite single-page application that provides the user interface for listing issues and managing the timer.

```
[Browser: React App] <==> [Server: Node.js] <==> [Jira Cloud REST API]
```

## 2. Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [npm](https://www.npmjs.com/) (comes with Node.js)
-   A Jira Cloud account with API token access.

## 3. Setup Instructions

### Step 1: Clone the Repository

First, clone this repository to your local machine.

### Step 2: Configure the Backend

The backend server requires credentials to connect to the Jira API.

1.  **Navigate to the `server` directory:**
    ```sh
    cd server
    ```

2.  **Create an environment file:**
    Copy the example environment file `.env.example` to a new file named `.env`.
    ```sh
    cp .env.example .env
    ```

3.  **Edit the `.env` file:**
    Open `.env` in a text editor and fill in your Jira details:
    -   `JIRA_DOMAIN`: Your Jira site URL (e.g., `your-company.atlassian.net`).
    -   `JIRA_USER_EMAIL`: The email address you use to log in to Jira.
    -   `JIRA_API_TOKEN`: Your Jira API token. You can create one [here](https://id.atlassian.com/manage-profile/security/api-tokens).

4.  **Install backend dependencies:**
    ```sh
    npm install
    ```

### Step 3: Configure the Frontend

1.  **Navigate to the `client` directory from the project root:**
    ```sh
    cd ../client
    ```

2.  **Install frontend dependencies:**
    ```sh
    npm install
    ```

## 4. Running the Application

You need to run both the backend and frontend servers simultaneously in two separate terminal windows.

**Terminal 1: Start the Backend Server**

```sh
# Make sure you are in the /server directory
cd path/to/your/project/server

# Start the server in development mode (with auto-reload)
npm run dev
```
The backend server will start on `http://localhost:3001`.

**Terminal 2: Start the Frontend Application**

```sh
# Make sure you are in the /client directory
cd path/to/your/project/client

# Start the Vite dev server
npm run dev
```
The frontend application will be available at `http://localhost:5173`. Open this URL in your browser to use the app.

---

The application will automatically fetch your assigned Jira issues. Click "Start Pomodoro" on an issue to begin tracking your work.
