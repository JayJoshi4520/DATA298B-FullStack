# Express REST API

This is a simple boilerplate for a RESTful API built with Node.js and Express.js.

## Features

-   **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
-   **CORS**: Enabled for cross-origin requests.
-   **dotenv**: Manages environment variables.
-   **nodemon**: Monitors for any changes in your source and automatically restarts your server.
-   **Structured**: Clear separation of concerns with routes and controllers.

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v14 or later recommended)
-   [npm](https://www.npmjs.com/)

### Installation

1.  **Clone the repository (or use the generated code):**
    ```sh
    cd express-api
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

### Running the Application

1.  **Start the development server:**
    This will start the server with `nodemon`, which automatically restarts on file changes.
    ```sh
    npm run dev
    ```

2.  **Start the production server:**
    ```sh
    npm start
    ```

The API will be available at `http://localhost:3001`.

## API Endpoints

The following endpoints are available for the `/tasks` resource:

-   `GET /api/tasks`: Get all tasks.
-   `GET /api/tasks/:id`: Get a single task by its ID.
-   `POST /api/tasks`: Create a new task.
    -   Body: `{ "title": "Your new task" }`
-   `PUT /api/tasks/:id`: Update an existing task.
    -   Body: `{ "title": "Updated title", "completed": true }`
-   `DELETE /api/tasks/:id`: Delete a task.