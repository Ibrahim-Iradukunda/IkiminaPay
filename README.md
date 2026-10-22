# IkiminaPay

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
