# Changelog

All notable changes to IkiminaPay are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Each section is one stage of the course project.

## [Summative] - Unreleased

### Added
- PostgreSQL storage on Amazon RDS (private, encrypted, not publicly accessible).
- Database connection from environment variables only (`DB_HOST`, `DB_PORT`, `DB_NAME`,
  `DB_USER`, `DB_PASSWORD`), with optional SSL (`DB_SSL`, `DB_SSL_CA`) for RDS.
- Tables are created automatically at startup from `data/schema.sql`
  (`CREATE TABLE IF NOT EXISTS`), with retries while the database starts.
- Bastion host in the public subnet: the only SSH entry point and the Nginx reverse proxy
  for the public URL.
- App EC2 instance moved to a private subnet (no public IP), with a NAT gateway for
  outbound traffic only.
- Security groups: HTTP to the bastion, SSH only from a trusted IP to the bastion and only
  from the bastion to the app, PostgreSQL only from the app.
- Private Amazon ECR repository (immutable tags, scan on push) and an IAM instance role
  so the app VM can pull images without AWS keys.
- CD pipeline (`cd.yml`): on every merge to `main` it runs CI, pushes a commit-tagged image
  to ECR using AWS OIDC, and deploys it with Ansible through the bastion.
- `/health` checks the database with `SELECT 1`: HTTP 200 when it is up, 503 when it is down.
- Jest tests for both `/health` cases and for the database configuration helpers.
- Live deployment at http://13.48.177.237 (bastion public IP, Nginx to the private app).
- Database credentials read by Ansible from AWS Secrets Manager into a root-only `.env`
  on the app VM; RDS enforces SSL (`rds.force_ssl = 1`).

### Changed
- Group, member and contribution data moved from a JSON file to PostgreSQL.
- Docker Compose now runs the app with a local PostgreSQL 16 service (healthcheck with
  `pg_isready`, app waits until the database is healthy, app healthcheck on `/health`).
- Dockerfile no longer creates the old `/app/storage` folder for the JSON file.
- `.env.example` now lists every database variable with fake placeholder values.
- README rewritten as an operations manual with an architecture diagram.

### Removed
- Old JSON file store (`data/store.js`) and its test, replaced by PostgreSQL.

## [Formative 3] - 2026-11-13

### Added
- Terraform configuration for AWS infrastructure: VPC, subnet, security group, EC2 app
  instance and ECR repository.
- Ansible inventory and playbook to install Docker and deploy the app container on EC2,
  with a documented idempotence check.
- Ansible server hardening: firewall and SSH settings (no root login, key-only login).
- Security scans in CI: `npm audit`, Trivy image scan, Trivy and Checkov Terraform scans.
- `SECURITY.md` documenting every finding, its fix, and the accepted risks.

### Fixed
- HIGH `body-parser` vulnerability (updated in `package-lock.json`).
- HIGH Trivy findings from npm bundled in the base image (removed npm from the runtime image).
- Checkov findings: SSH restricted to one IP, egress rule descriptions, EC2 detailed
  monitoring and EBS optimization, locked-down default security group.

## [Formative 2] - 2026-10-30

### Added
- Dockerfile using `node:22-bookworm-slim`, running as the non-root user `node`.
- `.dockerignore` to keep secrets and local files out of the image.
- Docker Compose setup with a named volume, a private network and a container health check.
- ESLint configuration and Jest tests for the API, group service and data store.
- GitHub Actions CI: install, lint (ESLint), tests (Jest) and Docker image build.
- CI verified by a deliberate failing commit ("Test: break lint") that was caught and reverted.

### Removed
- Generated local data file from the repository.

## [Formative 1] - 2026-10-23

### Added
- Project plan, user stories and a GitHub Projects board to track work.
- Branch protection on `main`: pull requests with an approval before merging.
- First version of the app: Express API and web page to create groups, add members,
  record contributions and view balances, with a MoMo payment simulation.
- README with setup instructions and API documentation, `.gitignore` and MIT license.
