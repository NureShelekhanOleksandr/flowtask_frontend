# Task Manager Frontend

A modern React frontend for the Task Manager application. Built with React, TypeScript, Material-UI, and React Query.

## Features

- View all tasks in a responsive grid layout
- Create new tasks
- Edit existing tasks
- Delete tasks
- Update task status
- Modern and clean UI with Material Design
- Real-time updates using React Query

## Prerequisites

- Node.js 16.x or later
- npm 7.x or later
- Backend API running on http://localhost:8000

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to http://localhost:5173

## Development

The project uses:
- Vite for fast development and building
- TypeScript for type safety
- Material-UI for components and styling
- React Query for data fetching and caching
- Axios for API communication

## Project Structure

```
src/
  ├── api/          # API client and endpoints
  ├── components/   # React components
  ├── types/        # TypeScript type definitions
  ├── App.tsx       # Main application component
  └── main.tsx      # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking 