# Changelog

## Summative — infrastructure, security, and deployment

- Added AWS Terraform for a VPC with public/private subnets, a restricted bastion,
  private app EC2 instance, NAT gateway, private PostgreSQL RDS, ECR, and least-privilege
  app-instance ECR pull access.
- Added Ansible configuration for Docker, Docker Compose, ECR image deployment, and
  Nginx reverse proxy setup on the bastion.
- Extended CI with Trivy container and Terraform scans and supplemental Checkov
  reporting; added a `main`-branch CD workflow that deploys an immutable commit-tagged
  image using a dedicated AWS deployment user's credentials.
- Added `/health` readiness response, operator setup instructions, and this changelog.
- Connected the app's group, member, and contribution workflows to PostgreSQL and
  provisioned the database credentials in AWS Secrets Manager for Ansible deployment.
- Live cloud resources and a production URL must be created/configured by the operator;
  they are not provisioned by this repository change.

## Formative 2 — containerization and CI

- Added a non-root Node.js Docker image and Docker Compose configuration with persistent
  JSON storage and a container health check.
- Added GitHub Actions checks for linting, tests, dependency auditing, and Docker image
  builds.
- Added repository collaboration and security guidance.

## Formative 1 — project foundation

- Established the IkiminaPay savings-group tracker, project documentation, contribution
  and balance workflows, and a GitHub collaboration workflow.
- Added the initial Express application, JSON-backed data store, API, and tests.
