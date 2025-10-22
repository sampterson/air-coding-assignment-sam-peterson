# Air Coding Submission

## Summary

I focused on the backend API first, building functionality to support the board/folder operations. I chose an adjacency list as the primary datastructure to represent the boards. With this, each board is a node in a tree that can have many children and a single parent. This made creating a new board and moving a board to a new parent simple, because all that needed to be done is updating a parent ID value. Deletes are handled in the API by a recursive function at the database level, given a boardId, the delete method is called on all child boards until there are no more child boards.

I chose a controller/service/repository structure to organize the different needs. In the service layer, there are additional checks to validate create and move operations by recursively checking depths before the create or move parent operation is ran.

I focused my integration testing on my controller layer, since that is the contract enforced for the UI. Using SQlite as a db simplified development for this assignment and also allows for simple in-memory persistence when running tests, which was very helpful.

I focused on the UI second and built some of the features requested. There is an overall shape to the page and the ability to create named folders, delete, and move them. 

I took some additional time, however there are improvements to be made yet. One thing I would do next is introduce state management at a global level. I'm recursively rendering BoardNodes which works fine, but what is missing is the entire tree in memory. The BoardTree maintains some nodes, and each BoardNode maintains its children, but no where is the entire tree in memory. Tracking this in redux or react-query would make moving parents much easier as all nodes could easily be retrieved. Similarily, overall rendering would be easier since each create, delete, or move operation would update the overall tree state, which can then be re-rendered.

## Running

I made sure to continue to leverage the 'docker-compose up' functionality in the starter. That should be the only step required to run my solution.
























# ORIGINAL README BELOW

# Express Next.js WebSocket Demo with TypeScript

This is a full-stack TypeScript application demonstrating the integration of Express.js backend with Next.js frontend, featuring REST API and WebSocket communication.

## Features

- Express.js backend with TypeScript
  - Typed REST API endpoints
  - WebSocket server with typed events
  - Clean architecture with proper interfaces
- Next.js frontend with TypeScript
  - Server-side rendering capabilities
  - Client-side WebSocket integration
  - Type-safe components and hooks
  - Tailwind CSS for modern UI
  - API route handling and proxying
- Docker configuration for production-ready deployment

## Running the Application

You can run both the frontend and backend services using Docker Compose:

```bash
docker-compose up
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Architecture

### Backend (Express.js + TypeScript)

- REST API endpoint at `/api/hello`
- WebSocket server broadcasting notifications every minute
- Running on port 3001
- Type-safe request/response handling
- CORS configured for frontend communication

### Frontend (Next.js + TypeScript)

- Modern React application with server-side rendering
- Custom WebSocket hook for real-time communication
- Displays messages from `/api/hello` endpoint
- Shows real-time notifications from WebSocket
- Running on port 3000
- Type-safe components and API integration
- Tailwind CSS for responsive design

## Development

### Development with Docker

```bash
# Start the development environment
docker compose -f docker-compose.dev.yml up --build

# Stop the development environment
docker compose -f docker-compose.dev.yml down
```

The development environment includes:

- Hot reloading for both frontend and backend
- Volume mounts for real-time code changes
- Development-specific configurations
- Isolated node_modules for each service

**Note about Package Management:** When adding new packages to either frontend or backend, you'll need to rebuild the Docker containers:

```bash
# 1. Stop the containers
docker compose -f docker-compose.dev.yml down

# 2. Rebuild and start the containers
docker compose -f docker-compose.dev.yml up --build
```

### Backend Development

```bash
cd backend
npm install
npm run dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── index.ts    # Express server with WebSocket setup
│   │   └── types/      # TypeScript interfaces
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/        # Next.js pages
│   │   ├── components/ # React components
│   │   └── hooks/      # Custom hooks (WebSocket)
│   └── package.json
└── docker-compose.yml  # Development and production setup
```

## Environment Variables

### Backend

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment mode

### Frontend

- `NEXT_PUBLIC_BACKEND_URL`: Backend API URL
- `PORT`: Frontend port (default: 3000)

## Features in Detail

1. **Real-time Communication**

   - Server sends notifications every minute
   - WebSocket connection with automatic reconnection
   - Connection status monitoring

2. **Type Safety**

   - Full TypeScript support
   - Typed WebSocket events
   - Type-safe API responses

3. **Modern UI**

   - Responsive design with Tailwind CSS
   - Clean and intuitive interface
   - Real-time updates without page refresh

4. **Production Ready**
   - Docker configuration for both services
   - Environment variable management
   - API proxying through Next.js
