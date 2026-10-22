# IkiminaPay

> Digital savings groups (ikimina) made simple, transparent, and mobile-money ready.

## Table of Contents

- [Problem Statement](#problem-statement)
- [Target Users](#target-users)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [Branch Protection](#branch-protection)
- [Contributing](#contributing)
- [Team](#team)
- [Links](#links)
- [License](#license)

## Problem Statement

In Rwanda and across Africa, millions of people save money through community savings groups, known in Rwanda as **ikimina**. Members contribute a fixed amount regularly, and the pooled money is used to support members when they need it.

Most groups still track contributions in **paper notebooks or WhatsApp messages**. This leads to:

- **Lost or incorrect records** when notebooks are damaged or totals are miscalculated
- **Disputes and mistrust** because members cannot easily check who has paid
- **Heavy manual work for the treasurer**, who records and totals everything by hand
- **No connection to mobile money**, even though most members already pay with MoMo

**IkiminaPay** gives savings groups a simple digital record of members, contributions and balances, so that every member can see where the group stands, and payments can be made through mobile money.

## Target Users

- **Treasurers** who create and manage savings groups and keep track of contributions
- **Group members** who want to pay their contributions and check their own savings and the group balance
- **Community savings groups in Rwanda and other African countries**, including members with little technical experience

## Core Features

1. **Create a savings group**: a treasurer creates a group to track its contributions
2. **Add members**: the treasurer adds members so everyone knows who takes part
3. **Record contributions**: each member's payment is saved to the group's records
4. **View balances**: members see their own total and the full group balance
5. **Mobile money payment simulation**: simulates a MoMo payment and returns success or failure

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Backend  | Node.js + Express |
| Frontend | HTML, CSS, JavaScript |
| Storage  | In-memory storage (a database will be added in a later phase) |
| Testing  | Jest |
| Config   | dotenv (environment variables) |
| Tools    | Git, GitHub, GitHub Projects |

## Project Structure

    IkiminaPay/
    ├── backend/          # REST API: groups, members, contributions, payments
    │   ├── server.js     # Entry point: starts the Express server
    │   └── package.json  # Dependencies and npm scripts
    ├── frontend/         # Simple web page for users
    ├── .gitignore        # Files Git must never track (node_modules, .env, logs...)
    ├── LICENSE
    └── README.md

The backend and frontend are kept separate, so each can be containerized and deployed as its own service. Inside the backend, the logic is split by responsibility (groups, contributions, payments), which allows the project to grow into separate microservices as it scales.

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) v18 or later (includes npm)

### 1. Clone the repository

    git clone https://github.com/Ibrahim-Iradukunda/IkiminaPay.git
    cd IkiminaPay

### 2. Install backend dependencies

    cd backend
    npm install

### 3. Set up environment variables

Create a file named `.env` inside the `backend` folder and add:

    PORT=3000

See [Environment Variables](#environment-variables) for details.

### 4. Start the backend

    npm start

For development, use auto-restart whenever a file changes:

    npm run dev

The API is now running at **http://localhost:3000**.

To stop the server, press `Ctrl + C` in the terminal.

### 5. Run the frontend

Frontend setup steps will be added once the frontend is merged.

## Environment Variables

The backend reads its settings from a `.env` file in the `backend` folder.

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT`   | Port the API server listens on | `3000` |

> **Security:** never commit your `.env` file. It is listed in `.gitignore` so that secrets stay out of the repository.

## Running Tests

Unit tests are written with Jest:

    cd backend
    npm test

## Branch Protection

The `main` branch is protected so that no one can push to it directly. These rules keep `main` stable and make sure every change is reviewed:

| Rule | Why it matters |
|------|----------------|
| Require a pull request before merging | All changes are visible and discussed before they reach `main` |
| Require 1 approval | A teammate must review every change |
| Dismiss stale approvals on new commits | Code changed after approval must be reviewed again |
| Require status checks to pass | Broken or failing code cannot be merged |
| Require branches to be up to date | Changes are tested against the latest `main` |
| Require conversation resolution | Review comments must be addressed before merging |
| Include administrators | The rules apply to everyone, including repository admins |

## Contributing

1. Pull the latest `main`: `git pull origin main`
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes with a clear message, e.g. `feat: add member endpoint`
4. Push your branch: `git push -u origin feature/your-feature`
5. Open a pull request and ask a teammate to review it

Track all work on the [project board](https://github.com/users/code2811/projects/1).

## Team

| Name | GitHub | Role |
|------|--------|------|
| Frida Kayiranga | [@code2811](https://github.com/code2811) | Team lead, core backend feature, project board |
| Karabo Divine | [@Karab-o](https://github.com/Karab-o) | README, setup steps, user stories |
| Noel Ishimwe | [@Igornoel](https://github.com/Igornoel) | Frontend, extra feature |
| IRADUKUNDA Ibrahim | [@Ibrahim-Iradukunda](https://github.com/Ibrahim-Iradukunda) | .gitignore, branch protection, unit tests |

## Links

- Project Board: https://github.com/users/code2811/projects/1

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
IkiminaPay is a simple savings group tracker. Create a group, add members, record contributions and view each member's total and the group balance. The mobile money action is a local simulation: successful attempts are saved as contributions, and failed attempts do not change the balance.

## Run locally

1. Install Node.js 18 or newer.
2. From the project directory, install dependencies:

   ```sh
   npm install
   ```

3. Start the app:

   ```sh
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000).

The UI and API are served by the same Express app. Group data is stored in `data/groups.json` on the local machine and is ignored by Git. Set `PORT` to use a different port.

## API contract

- `POST /groups` with `{ "name": "..." }` creates a group and returns its `id`.
- `POST /groups/:id/members` with `{ "name": "..." }` adds a member and returns their `id`.
- `POST /groups/:id/contributions` with `{ "memberId": "...", "amount": 5000, "date": "YYYY-MM-DD" }` records a contribution. Amount must be a JSON number.
- `GET /groups/:id/summary` returns `{ "groupId", "groupName", "members": [{ "memberId", "name", "total" }], "balance" }`.

The browser keeps the active group ID in local storage so the group can be reopened on that device. There is no authentication or real payment processing in this demo.
