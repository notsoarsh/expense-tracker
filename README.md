# Expensify – Local-first Expense & Group Split Tracker

A lightweight, client-side expense tracker you can deploy on GitHub Pages. It supports personal transactions with charts and group expense splitting between members — all stored locally in the browser (localStorage + cookies). No backend required.

> Important: This project is designed for learning and demos. Because it stores data in the browser, it’s not suitable for production or multi-device sync scenarios.


## Features

- Personal finance tracking
  - Add, edit, and delete transactions (income/expense)
  - Category-wise expense breakdown (pie chart)
  - Monthly income vs expense (bar chart)
  - Live balance, total income, total expenses
- Group expense splitting
  - Create groups, add members, track shared expenses
  - Automatic equal-split balance calculation per member
  - Invite flow (pending invites stored per user)
  - Safe labels ("You" vs email) and clear owes/owed copy
- UX & system helpers
  - Toast notifications (success/error/warning/info + confirm dialogs)
  - Page-level loader overlay
  - Cookie helpers for login session persistence (SameSite=Lax + Secure on HTTPS)
- Deployed as a static site (GitHub Pages ready)


## Tech stack

- HTML5, CSS3, Vanilla JavaScript
- Chart.js via CDN (dashboard charts)
- Bootstrap via CDN (navbar + utilities)
- Local storage (localStorage) and cookies for persistence


## Directory structure

```
expense-tracker/
├─ index.html              # Login page
├─ signup.html             # Signup page
├─ dashboard.html          # Personal transactions + charts
├─ groups.html             # Group management and expense splitting
├─ assets/
│  └─ logo.jpg            # App logo
├─ css/
│  ├─ styles.css          # Login/Signup styles + loader
│  ├─ dashboard_style.css # Dashboard/Groups styles (Bootstrap navbar, cards, lists)
│  └─ toast.css           # Toast notifications + confirm dialog
├─ js/
│  ├─ utils.js            # Cookie helpers (set/get/delete)
│  ├─ loader.js           # Show/hide page loader (#app-loader)
│  ├─ toast.js            # Toast API + confirm dialog
│  ├─ transaction.js      # Transaction class (encapsulated amount)
│  ├─ dashboard.js        # Dashboard logic, charts, table events
│  ├─ login.js            # Login flow (localStorage users + cookie)
│  ├─ signup.js           # Signup flow (localStorage users)
│  ├─ groups.js           # Group & Expense classes and core logic
│  └─ groupsPage.js       # Groups page UI, invites, syncing among members
└─ README.md
```


## Pages overview

- index.html (Login)
  - Email + password, optional "Remember Me" cookie lifetime
  - On success, sets `loggedInUser` cookie and redirects to `dashboard.html`
- signup.html (Signup)
  - Validates email/password, prevents duplicates, persists to `localStorage.users`
- dashboard.html (Dashboard)
  - Displays summary cards, transaction table, and charts
  - Uses `transaction.js` model and `Chart.js` (CDN)
- groups.html (Groups)
  - Create groups, add expenses, invite members, accept/reject invites
  - Navbar matches dashboard’s Bootstrap look for consistency


## Data model & persistence

All data is stored in the browser’s localStorage and cookies (per browser, per device).

- Cookies
  - `loggedInUser`: current logged-in user’s email
  - Cookie attributes: `SameSite=Lax`, `Secure` is set automatically on HTTPS (e.g., GitHub Pages)
- Local Storage Keys
  - `users` → `[{ email, password }, ...]`
  - `transactions_<email>` → `[{ desc, amount, type, category, date }, ...]`
  - `groups_<email>` → `[{ id, name, createdBy, members[], expenses[] }, ...]`
  - `pendingInvites_<email>` → `[{ groupId, groupName, from, to, date }, ...]`

Classes
- `Transaction`: encapsulates `amount` with getter/setter; provides `toJSON()` and `fromJSON()`
- `Expense`: simple POJO for `{ description, amount, paidBy }` (serialized via Group)
- `Group`: manages members & expenses, calculates balances, serializes via `toJSON()`/`fromJSON()`


## Notable modules

- `js/utils.js`
  - setCookie/getCookie/deleteCookie with correct `Secure` handling on HTTPS
- `js/loader.js`
  - Controls the `#app-loader` overlay shown across pages
- `js/toast.js` & `css/toast.css`
  - Lightweight toast and confirmation dialog API
- `js/dashboard.js`
  - Renders charts (pie, bar), manages transaction CRUD, calculates summaries
- `js/groups.js`
  - `Group.addExpense()` validates payer membership; `calculateBalances()` returns Map of balances
- `js/groupsPage.js`
  - Syncs group changes across all members’ `groups_<email>` stores
  - Invite handling (create/view/accept/reject), updates `inviteIndicator`


## Setup & run locally

No build step needed; it’s a static site.

- Option 1: Open `index.html` directly in a modern browser
- Option 2: Use a local static server (recommended for consistent behavior)
  - VS Code “Live Server” extension works great

Login/test data
- Create an account through `signup.html` first.
- Use the same browser/profile so localStorage & cookies persist.


## Deploying to GitHub Pages

- Ensure the repo is public or the Pages source is enabled.
- Push to `main` (or chosen branch), then in GitHub:
  - Settings → Pages → Build and deployment → Source: Deploy from a branch
  - Branch: `main`, Folder: `/ (root)`
- All asset paths are relative, so it will work under `https://<user>.github.io/<repo>/`.


## Code hygiene & conventions

- Static, frontend-only; keep dependencies via CDN where possible
- Use relative paths for assets to keep GitHub Pages compatible
- Avoid PII in localStorage; this app is for demo/learning
- Console logs:
  - Debug logs removed/commented for cleaner user experience
- CSS organization:
  - Shared components: loader (styles.css) and toast (toast.css)
  - Dashboard/Groups visuals: dashboard_style.css
  - Some legacy/unused selectors are commented with `UNUSED:` for clarity


## Contributing

1. Fork the repo and create a feature branch:
   - Branch naming: `feat/*`, `fix/*`, or `chore/*`
2. Keep changes scoped and incremental; prefer small PRs
3. For UI:
   - Keep navbars consistent (Bootstrap)
   - Prefer semantic HTML and accessible labels/roles
4. For JS:
   - Keep `id` hooks stable (`#userEmail`, `#inviteIndicator`, `#logoutBtn`, `#app-loader`)
   - Validate input; don’t trust DOM values blindly
   - Favor small, pure functions where possible
5. Test locally (login, dashboard charts, groups creation, invite flow)
6. Open a Pull Request with a clear description, screenshots for UI changes


## Roadmap / ideas

- Per-group settlement suggestions
- CSV import/export for transactions
- Basic authentication backend (optional) with cloud storage
- Theming and dark mode
- Unit tests with a small harness for core models (Transaction/Group)


## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for full details.

You're free to use, modify, and distribute this software for personal and commercial purposes. Attribution is appreciated but not required.
