# IkiminaPay

> Digital savings groups (ikimina) made simple, transparent, and mobile-money ready.

## African Context

In Rwanda and across Africa, millions of people save through community savings groups, known in Rwanda as **ikimina**. Members contribute a fixed amount regularly, and the pooled money supports members when they need it.

Most groups still track contributions in paper notebooks or WhatsApp messages. Records get lost or miscalculated, members cannot easily check who has paid, which leads to disputes, and the treasurer does all the totals by hand. Most members already pay with mobile money (MoMo), but their savings records are not connected to it.

IkiminaPay gives savings groups one shared digital record of members, contributions and balances, so everyone can see where the group stands.

## Team Members

- Frida Kayiranga - Team Lead, core backend feature, project board - f.kayiranga@alustudent.com
- Karabo Divine - README, setup steps, user stories - k.divine@alustudent.com
- Noel Ishimwe - Frontend, extra feature - n.ishimwe4@alustudent.com
- IRADUKUNDA Ibrahim - .gitignore, branch protection, unit tests - i.ibrahim@alustudent.com

## Project Overview

IkiminaPay is a simple savings group tracker. A treasurer creates a group, adds members and records each contribution. Members can then see their own total and the group's balance.

The first version is intentionally small. One Express app serves both the web page and the REST API, and group data is saved to a local JSON file. The mobile money action is a local simulation: a successful attempt is saved as a contribution, and a failed attempt does not change the balance. Later versions can add a real database, authentication and a real mobile money integration.

This is a demo: there is no login, and no real money is moved.

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
| Backend | Node.js 18+, Express |
| Frontend | HTML, CSS, JavaScript (served by the same Express app) |
| Database | Local JSON file (`data/groups.json`, ignored by Git); a real database is planned |
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
cd IkiminaPay
```

Install dependencies:

```bash
npm install
```

Optionally, create a `.env` file to change the port (default 3000):

```
PORT=3000
```

### Run the Application

```bash
npm start
```

Open http://localhost:3000. The web page and the API run together.

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

## Running the Tests

```bash
npm test
```

## Project Structure

```
.
├── backend/              # Express app
│   ├── routes/
│   │   └── groups.js     # Group endpoints (/groups)
│   ├── app.js            # Express app: JSON parsing, routes, error handling
│   ├── server.js         # Entry point: loads .env and starts the server
│   └── package.json      # Dependencies and scripts
├── frontend/             # Web page for users
├── .gitignore
├── LICENSE
└── README.md
```

## Collaboration and Repository Security

**Branch protection on `main`:** a pull request is required, with at least 1 approval from someone other than the author. Stale approvals are dismissed when new commits are pushed, branches must be up to date before merging, conversations must be resolved, and the rules apply to administrators too.

**Required status checks:** not enabled yet, because there is no CI pipeline. They will be added once GitHub Actions runs the tests.

**Secrets:** `.gitignore` excludes `.env` files, `node_modules` and local data, so credentials and personal data are never committed.

**Workflow:** every change is made on its own branch, opened as a pull request, and reviewed by a teammate before merging.

## Links

- [Project Board](https://github.com/users/Karab-o/projects/2/views/1)

## License

MIT License. See [LICENSE](LICENSE).