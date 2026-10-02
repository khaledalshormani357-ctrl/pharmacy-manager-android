---
Run the following to start the full professional stack locally using Docker Compose:

1) Build and start services:
   docker compose up --build

2) Wait for Postgres to be ready. The backend will seed the database automatically.

3) Start the mobile app (open a new terminal):
   npm --workspace mobile install
   npm --workspace mobile run start

4) In the Expo dev tools press 'a' to run on Android emulator/device. Ensure the backend host is reachable (use 10.0.2.2 for Android emulator to access host machine's localhost).
