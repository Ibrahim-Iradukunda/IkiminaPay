# IkiminaPay

> Digital savings groups (ikimina) made simple, transparent, and mobile-money ready.

## African Context

In Rwanda and across Africa, millions of people save through community savings groups, known in Rwanda as **ikimina**. Members contribute a fixed amount regularly, and the pooled money supports members when they need it.

Most groups still track contributions in paper notebooks or WhatsApp messages. Records get lost or miscalculated, members cannot easily check who has paid, which leads to disputes, and the treasurer does all the totals by hand. Most members already pay with mobile money (MoMo), but their savings records are not connected to it.

IkiminaPay gives savings groups one shared digital record of members, contributions and balances, so everyone can see where the group stands.

## Team Members

- Frida Kayiranga - Team Lead, core backend, project board, CI pipeline - f.kayiranga@alustudent.com
- Karabo Divine - README, setup steps, user stories, Docker Compose - k.divine@alustudent.com
- Noel Ishimwe - Frontend, Dockerfile and .dockerignore - n.ishimwe4@alustudent.com
- IRADUKUNDA Ibrahim - .gitignore, linting and unit tests, branch protection - i.ibrahim@alustudent.com

## Project Overview

IkiminaPay is a simple savings group tracker. A treasurer creates a group, adds members and records each contribution. Members can then see their own total and the group's balance.

The app is intentionally small. One Express app serves both the web page and the REST API, and group data is saved to a JSON file. The mobile money action is a local simulation: a successful attempt is saved as a contribution, and a failed attempt does not change the balance.

The app is containerized with Docker and runs with a single `docker compose up` command. Every push and pull request is checked by a GitHub Actions pipeline that lints the code, runs the tests and builds the Docker image. This is a demo: there is no login, and no real money is moved.

## Target Users

- Treasurers who create and manage savings groups.
- Group members who pay contributions and check their savings and the group balance.
- Community savings groups in Rwanda and across Africa, including members with little technical experience.

## Core Features

- **Create a group:** a treasurer creates a savings group.
- **Add members:** the treasurer adds members to the group.
- **Record contributions:** each member's payment is saved to the group's records.
- **View balances:** members see their own total and the group balance.
- **MoMo payment simulation:** a successful simulated payment is saved as a contribution; a failed one changes nothing.
- **Planned:** a real database, user accounts and a real mobile money integration.

## Technology Stack

| Area | Details |
|------|---------|
| Backend | Node.js, Express |
| Frontend | HTML, CSS, JavaScript (served by the same Express app) |
| Database | JSON file (a real database is planned) |
| Testing and linting | Jest, ESLint |
| Containers | Docker (`node:22-bookworm-slim`, non-root user), Docker Compose |
| CI | GitHub Actions |
| Other | dotenv, Git and GitHub (Projects, branch protection, pull requests) |

## Getting Started

You can run IkiminaPay with Docker Compose (recommended) or directly with Node.js.

### Prerequisites

- Git
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose), for running with Docker
- Node.js 20 or newer (includes npm), for running without Docker, linting and tests

### Installation

Clone the repository:

```bash
git clone https://github.com/Ibrahim-Iradukunda/IkiminaPay.git
cd IkiminaPay
```

Create your environment file from the example:

```bash
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env`.

### Run with Docker Compose (recommended)

Build the image and start the app:

```bash
docker compose up --build
```

Open http://localhost:3000.

- **Stop the app:** press `Ctrl + C`, or run `docker compose down`.
- **Check its health:** `docker compose ps` shows the container as `healthy` once the app responds.
- **Delete saved data:** `docker compose down -v` also removes the data volume.

What the Compose setup does:

| Setting | Purpose |
|---------|---------|
| One `app` service | Built from the `Dockerfile`. IkiminaPay stores data in a JSON file, so it needs no database service. |
| `ikiminapay-data` volume | Mounted at `/app/storage`, so groups are kept when the container is restarted or recreated |
| `ikiminapay-net` network | A private bridge network, ready for more services (such as a database) later |
| `env_file: .env` | Passes your settings into the container. `.env` is never copied into the image. |
| Health check | Calls `http://localhost:3000/` inside the container every 30 seconds |
| `restart: unless-stopped` | Restarts the app if it crashes, but not after you stop it |

### Run without Docker

```bash
npm install
npm start
```

Open http://localhost:3000. Data is saved to `data/groups.json`, which Git ignores.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port the app listens on (inside the container and on your computer) | `3000` |
| `DATA_FILE` | Where group data is saved. Docker Compose sets it to `/app/storage/groups.json`. | `data/groups.json` |

Never commit your `.env` file. It is listed in `.gitignore` and `.dockerignore`.

## Usage

Use the web page at http://localhost:3000 to create a group, add members, record contributions and view balances. The browser remembers the active group, so you can reopen it on the same device.

You can also call the API directly:

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/groups` | `{ "name": "..." }` | Create a group, returns its id |
| POST | `/groups/:id/members` | `{ "name": "..." }` | Add a member, returns their id |
| POST | `/groups/:id/contributions` | `{ "memberId": "...", "amount": 5000, "date": "YYYY-MM-DD" }` | Record a contribution (`amount` must be a number) |
| GET | `/groups/:id/summary` | none | Each member's total and the group balance |

Example:

```bash
curl -X POST http://localhost:3000/groups -H "Content-Type: application/json" -d '{"name": "Abishyize Hamwe"}'
curl http://localhost:3000/groups/<groupId>/summary
```

Errors are returned as `{ "error": "..." }`.

## Linting and Tests

Install dependencies first with `npm install`, then:

```bash
npm run lint
npm test
```

ESLint checks code style and errors. Jest tests are in the `tests/` folder and cover the API, the group service and the data store.

## Continuous Integration

The pipeline in `.github/workflows/ci.yml` runs on GitHub Actions:

- **Triggers:** pushes to any branch except `main`, and pull requests targeting `main`
- **Steps:** check out the code, set up Node.js 20, install dependencies (`npm ci`), run ESLint, run Jest, and build the Docker image

The pipeline fails if linting fails, if any test fails, or if the Docker image does not build. A failed check blocks the pull request from being merged.

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── ci.yml              # CI pipeline: lint, test, Docker build
├── controllers/
│   └── groupController.js      # Handles requests for group endpoints
├── data/
│   └── store.js                # Reads and writes group data (JSON file)
├── public/                     # Web page served by Express
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── routes/
│   └── groups.js               # Group endpoints (/groups)
├── services/
│   └── groupService.js         # Group logic: members, contributions, balances
├── tests/                      # Jest unit tests
│   ├── api.test.js
│   ├── groupService.test.js
│   └── store.test.js
├── app.js                      # Express app: JSON parsing, routes, static files, errors
├── server.js                   # Entry point: loads .env and starts the server
├── Dockerfile                  # Container image (non-root, Node 22 slim)
├── .dockerignore               # Files kept out of the Docker image
├── docker-compose.yml          # Runs the app with a volume, network and health check
├── eslint.config.js            # Lint rules
├── .env.example                # Example environment variables
├── .gitignore
├── package.json
├── package-lock.json
├── LICENSE
└── README.md
```

## Collaboration and Repository Security

**Branch protection on `main`:** a pull request is required, with at least 1 approval from someone other than the author. Stale approvals are dismissed when new commits are pushed, branches must be up to date before merging, conversations must be resolved, and the rules apply to administrators too.

**Required status checks:** the CI job `build-and-test` must pass before a pull request can be merged into `main`.

**Secrets:** `.gitignore` and `.dockerignore` exclude `.env` files, `node_modules` and local data, so credentials and personal data never reach the repository or the Docker image.

**Workflow:** every change is made on its own branch, opened as a pull request, checked by CI, and reviewed by a teammate before merging. Work is tracked on the project board.

## Links

- [Project Board](https://github.com/users/Karab-o/projects/2/views/1)

## License

MIT License. See [LICENSE](LICENSE).