# IkiminaPay

> Digital savings groups (ikimina) made simple, transparent, and mobile-money ready.

## African Context

In Rwanda and across Africa, millions of people save through community savings groups, known in Rwanda as **ikimina**. Members contribute a fixed amount regularly, and the pooled money supports members when they need it.

Most groups still track contributions in paper notebooks or WhatsApp messages. Records get lost or miscalculated, members cannot easily check who has paid, which leads to disputes, and the treasurer does all the totals by hand. Most members already pay with mobile money (MoMo), but their savings records are not connected to it.

IkiminaPay gives savings groups one shared digital record of members, contributions and balances, so everyone can see where the group stands.

## Team Members

- Frida Kayiranga - Team Lead, core backend feature, project board - [f.kayiranga@alustudent.com]
- Karabo Divine - README, setup steps, user stories - [k.divine@alustudent.com]
- Noel Ishimwe - Frontend, extra feature - [n.ishimwe4@alustudent.com]
- IRADUKUNDA Ibrahim - .gitignore, branch protection, unit tests - [i.ibrahim@alustudent.com]

## Project Overview

IkiminaPay is a small web application for managing savings groups. A treasurer creates a group, adds members and records each contribution. Members can then see their own total and the group's balance.

The first version is intentionally small. It runs on an Express REST API with in-memory storage, and includes a simulated MoMo payment that returns success or failure. The backend and frontend are kept separate, so later versions can add a real database, a real mobile money integration and other features as their own services.

Payments in this version are simulated. No real money is moved.

## Target Users

- Treasurers who create and manage savings groups.
- Group members who pay contributions and check their savings and the group balance.
- Community savings groups in Rwanda and across Africa, including members with little technical experience.

## Core Features

- **Create a group:** a treasurer creates a savings group.
- **Add members:** the treasurer adds members to the group.
- **Record contributions:** each member's payment is saved to the group's records.
- **View balances:** members see their own total and the group balance.
- **MoMo payment simulation:** simulates a mobile money payment and returns success or failure.
- **Planned:** a real database and a real mobile money integration.

## Technology Stack

| Area | Details |
|------|---------|
| Backend | Node.js 18+, Express |
| Frontend | HTML, CSS, JavaScript |
| Database | In-memory storage for now (data resets on restart); a real database is planned |
| Testing | Jest |
| Other | dotenv, Git and GitHub (Projects, branch protection, pull requests) |

## Getting Started

### Prerequisites

- Node.js 18 or newer (includes npm)
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/Ibrahim-Iradukunda/IkiminaPay.git
cd IkiminaPay/backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `backend` folder:

```
PORT=3000
```

### Run the Application

```bash
npm start
```

For development with auto-restart, use `npm run dev`. The API runs at http://localhost:3000.

Frontend setup steps will be added once the frontend is merged.

## Usage

With the backend running, call the API with curl or a tool like Postman:

```bash
curl http://localhost:3000/groups
```

## Running the Tests

```bash
cd backend
npm test
```

## Project Structure

```
.
├── backend/              # Express REST API
│   ├── server.js         # Entry point
│   └── package.json      # Dependencies and scripts
├── frontend/             # Web page for users
├── .gitignore
├── LICENSE
└── README.md
```

## Collaboration and Repository Security

**Branch protection on `main`:** a pull request is required, with at least 1 approval from someone other than the author. Stale approvals are dismissed when new commits are pushed, branches must be up to date before merging, conversations must be resolved, and the rules apply to administrators too.

**Required status checks:** not enabled yet, because there is no CI pipeline. They will be added once GitHub Actions runs the tests.

**Secrets:** `.gitignore` excludes `.env` files and `node_modules`, so credentials are never committed.

**Workflow:** every change is made on its own branch, opened as a pull request, and reviewed by a teammate before merging.

## Links

- [Project Board](https://github.com/users/Karab-o/projects/2/views/1)

## License

MIT License. See [LICENSE](LICENSE).