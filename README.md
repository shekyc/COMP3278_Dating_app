# Chemistry · COMP3278

Chemistry is a local dating app backed by MySQL. Discover ranks fictional profiles using reciprocal preferences and shared interests. Two users who like each other can match and exchange messages.

## Install and run with Docker

Install Docker with the Compose plugin. From the repository root, run:

```sh
docker compose up --build
```

Open [Chemistry](http://127.0.0.1:3000) once the app starts. Compose builds the frontend and API, starts MySQL 8.4, and creates and populates the ten tables on first launch. The database connection and local credentials are configured in [docker-compose.yml](docker-compose.yml). Data persists across restarts. Stop the app with `docker compose down`.

## Install and run with a local MySQL server

Use Node.js 24, pnpm 11.25.0 and MySQL 8.0.16 or later. Start MySQL and run the following SQL as a MySQL administrator:

```sql
CREATE DATABASE chemistry CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'chemistry'@'localhost' IDENTIFIED BY 'change-me-local-only';
GRANT ALL PRIVILEGES ON chemistry.* TO 'chemistry'@'localhost';
```

From the repository root:

```sh
npm install --global pnpm@11.25.0
cp .env.example .env
pnpm install --frozen-lockfile
```

The example configuration matches the SQL above. If your server uses different settings, edit `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` and `DB_PASSWORD` in `.env`. Keep `DEMO_MODE=true` for account switching and database initialization.

**Use a dedicated demo database.** The setup command replaces existing Chemistry tables and their contents with the initial dataset.

```sh
pnpm db:setup
pnpm dev
```

Open [Chemistry](http://127.0.0.1:3000). On subsequent runs, use `pnpm dev`. To run the compiled frontend, use `pnpm build` followed by `NODE_ENV=production pnpm start` on macOS or Linux.

## Verify the installation and initial data

Open **Local Demo** and inspect the database counts. A fresh database contains **64 users, 220 likes, 20 matches, 80 messages and 90 saved profiles**. To repeat the walkthrough, select **Reset demo** and confirm. This discards changes made during the demo.

| Action | Expected result |
| --- | --- |
| Select Alice and open Discover. Inspect Ben’s compatibility details. | Ben scores 100% and Chris scores 43%. The breakdown shows how interests and preferences contribute. |
| In Your preferences, select exactly Coffee, Gaming, Cooking, Cinema and Board games. Set the desired weekend to Cozy and social energy to Quiet. Save. | Chris now scores 100% and Ben scores 43%. |
| Find Ben and send a like. | His seeded like for Alice completes a match. The match count increases from 20 to 21. |
| Send a message, then reload the conversation. | The saved message is still visible. |
| Unmatch Ben and confirm. | The match count returns to 20. The conversation and both directional likes are removed. |

## Source and assessment materials

| Material | Location |
| --- | --- |
| React frontend and Express API | [src](src/) |
| MySQL table definitions, keys and constraints | [schema.sql](database/schema.sql) |
| Initial dataset and deterministic generator | [seed.sql](database/seed.sql) · [seed-generator.ts](database/seed-generator.ts) |
| Recommendation query and executable SQL examples | [discovery.sql](database/queries/discovery.sql) · [presentation SQL](presentation/sql/) |
| Presentation and supporting materials | [presentation](presentation/) |
| Integration tests | [tests](tests/) |

Run `pnpm build` to type-check and compile the application and `pnpm test:assets` to verify the bundled portraits. With a dedicated demo database configured, `pnpm test` runs the integration tests and resets that database.
