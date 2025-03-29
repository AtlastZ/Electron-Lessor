# Electron Lessor

A desktop application built with Electron for managing leasing operations.

## Prerequisites

- Node.js >= 18.0.0
- Yarn >= 4.8.0

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd electron-lessor
```

2. Install dependencies:
```bash
yarn install
```

## Database Setup

The application uses SQLite as its database. To set up the database:

1. Create the database:
```bash
yarn db:create
```

2. Run migrations:
```bash
yarn migrate
```

3. Seed the database with initial data:
```bash
yarn seed
```

To reset the database (if needed):
```bash
yarn db:reset
```

## Development

To run the application in development mode:
```bash
yarn start
```

## Building

To build the application for different platforms:

- Windows:
```bash
yarn build:win
```

- macOS:
```bash
yarn build:mac
```

- Linux:
```bash
yarn build:linux
```

- All platforms:
```bash
yarn build:all
```

The built applications will be available in the `dist` directory.

## Project Structure

- `src/` - Source code directory
- `main.js` - Main Electron process
- `preload.js` - Preload script for secure IPC communication
- `database.sqlite` - SQLite database file

## Available Scripts

- `yarn start` - Start the application in development mode
- `yarn build` - Build the application
- `yarn clean` - Clean build artifacts and node_modules
- `yarn migrate` - Run database migrations
- `yarn migrate:rollback` - Rollback database migrations
- `yarn seed` - Seed the database
- `yarn db:create` - Create the database
- `yarn db:reset` - Reset the database (migrate:rollback + migrate + seed)

## License

MIT 