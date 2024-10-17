# mmWave Dashboard

## Features

- The application displays a Google Map with a satellite view background.

- Multiple nodes are shown on the map, each with a label and RSSI value.

- Clicking on a node opens a drawer displaying detailed information about that node.

- Node data is automatically updated every second.

## Getting Started

### Prerequisites

- Node.js
- Bun
- Docker
- Prisma

### Installation

1. Rename `.env.example` to `.env.local`

2. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials) and create a new API key.

3. Add the API key to the `.env.local` file:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your_api_key_here>
   ```

4. Run `docker compose up -d` to start the database.

5. Run `bunx prisma db push` to create the database schema.

6. Run `bunx prisma generate` to generate the Prisma Client.

7. Run `bun dev` to start the development server.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
