# Full-Stack Todo App

A full-stack Todo application built with Go, Fiber, MongoDB, React, TypeScript, and Chakra UI. The Go server exposes a REST API and serves the production React build from the same process.

## Features

- Create, view, edit, complete, and delete tasks
- Prevent completed tasks from being reopened
- Inline editing with save, cancel, Enter, and Escape controls
- Per-task loading states and API error feedback
- Responsive Chakra UI interface
- Light and dark color modes
- TanStack Query for server-state management
- MongoDB persistence with ObjectID identifiers
- Backend business-rule and handler tests
- Multi-stage Docker production build
- Health-check endpoint for deployment platforms

## Tech Stack

### Backend

- Go 1.26
- Fiber v2
- MongoDB Go Driver v2
- godotenv

### Frontend

- React 19
- TypeScript 6
- Vite 8
- Chakra UI 3
- TanStack Query 5
- React Icons

## Project Structure

```text
.
├── frontend/
│   ├── public/                 # Static frontend assets
│   └── src/
│       ├── api/                # REST API client
│       ├── components/         # Todo and UI components
│       ├── features/todos/     # TanStack Query hooks and query keys
│       └── types/              # Frontend TypeScript types
├── internal/
│   ├── config/                 # Environment configuration
│   ├── database/               # MongoDB connection
│   └── todo/                   # Todo handlers, service, rules, and repository
├── .air.toml                   # Go live-reload configuration
├── .env.example                # Environment variable template
├── Dockerfile                  # Production container build
├── go.mod
└── main.go                     # Application entry point and route setup
```

The request flow for an update is:

```text
React UI → REST API → Fiber Handler → Todo Service → Repository → MongoDB
```

## Prerequisites

- Go 1.26 or later
- Node.js 22 or later
- npm
- MongoDB Community Server or a MongoDB Atlas cluster
- Docker (optional)
- Air (optional, for backend live reload)

## Environment Variables

Copy the example file:

```bash
cp .env.example .env
```

Configure these values:

```dotenv
PORT=5000
MONGODB_DATABASE=todo_app
MONGODB_URI=mongodb+srv://username:password@cluster.example.mongodb.net/
```

| Variable | Required | Default | Description |
|---|---:|---|---|
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `MONGODB_DATABASE` | No | `todo_app` | Database containing the `todos` collection |
| `PORT` | No | `5000` | HTTP server port |

`MONGODB_USERNAME` and `MONGODB_PASSWORD` in `.env.example` are optional reference values. The application reads the credentials from `MONGODB_URI`.

Do not commit `.env`. If a username or password contains reserved URI characters, percent-encode those characters in `MONGODB_URI`.

## Installation

Install backend dependencies:

```bash
go mod download
```

Install frontend dependencies:

```bash
npm --prefix frontend ci
```

## Local Development

Start the Go API in the first terminal:

```bash
go run .
```

If Air is installed, live reload can be used instead:

```bash
air
```

Start the Vite development server in a second terminal:

```bash
npm --prefix frontend run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` requests to the Go server at `http://127.0.0.1:5000`.

## Production Build

Build the frontend:

```bash
npm --prefix frontend run build
```

Start the Go server:

```bash
go run .
```

Open [http://localhost:5000](http://localhost:5000). In production mode, Fiber serves the files generated in `frontend/dist`.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Check application health |
| `GET` | `/api/todos` | Get all todos |
| `GET` | `/api/todos/:id` | Get one todo |
| `POST` | `/api/todos` | Create a todo |
| `PATCH` | `/api/todos/:id` | Update a todo title or completion state |
| `DELETE` | `/api/todos/:id` | Delete a todo |

Create a todo:

```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"body":"Learn Go","completed":false}'
```

Edit a title:

```bash
curl -X PATCH http://localhost:5000/api/todos/TODO_ID \
  -H "Content-Type: application/json" \
  -d '{"body":"Learn Fiber"}'
```

Complete a task:

```bash
curl -X PATCH http://localhost:5000/api/todos/TODO_ID \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

Completed tasks cannot transition back to `completed: false`.

## Quality Checks

Run backend tests without scanning frontend dependencies:

```bash
go test . ./internal/... -v
```

Check and build the frontend:

```bash
npm --prefix frontend run lint
npm --prefix frontend run build
```

Generate backend test coverage:

```bash
go test ./internal/todo -coverprofile=coverage.out
go tool cover -func=coverage.out
```

## Docker

Build the production image:

```bash
docker build -t go-todo-app .
```

Run it locally:

```bash
docker run --rm \
  --name go-todo-app \
  --env-file .env \
  -e PORT=10000 \
  -p 10000:10000 \
  go-todo-app
```

Open [http://localhost:10000](http://localhost:10000), or check [http://localhost:10000/health](http://localhost:10000/health).

## Deploying to Render

1. Push the repository to GitHub.
2. Create a new Render Web Service from the repository.
3. Select the Docker runtime. Render will build the included `Dockerfile`.
4. Add `MONGODB_URI` and `MONGODB_DATABASE` as environment variables.
5. Set the health-check path to `/health`.
6. Add the service's outbound CIDR ranges to the MongoDB Atlas IP Access List.
7. Deploy the latest commit and verify `/health` before testing the Todo UI.

Render supplies `PORT` automatically, and the Go server reads it at startup.

## Business Rules

- A todo title must contain at least one non-whitespace character.
- A partial update must contain `body`, `completed`, or both.
- An in-progress todo can be marked as completed.
- A completed todo cannot be reopened.
- Editing the title of a completed todo is allowed.

## Current Roadmap

- Status filters and task counters
- Task search
- Priority and due dates
- Sorting and pagination
- Expanded backend and frontend automated tests
- CI checks for tests, linting, and production builds
