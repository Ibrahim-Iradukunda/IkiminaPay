# Security

## Automated scans (CI)
Every pull request to `main` runs:
- `npm audit` (fails on high severity)
- Trivy scan of the Docker image (fails on HIGH/CRITICAL)
- Terraform scan with Checkov (strict: no soft-fail; accepted findings are
  skipped on the resource with a written reason)

Branch protection on `main` requires a pull request and the
`build-and-test` and `terraform-scan` checks to pass.

## Network and secrets
- The app VM and the RDS database are in private subnets.
- SSH to the app VM goes only through the bastion host.
- The database accepts connections only from the app security group.
- The CD pipeline authenticates to AWS with OIDC (no stored AWS keys).
- Secrets live in GitHub Secrets and AWS Secrets Manager. Nothing is committed.

## CI evidence
- Failing CI run (strict Terraform scan caught findings):
  https://github.com/Ibrahim-Iradukunda/IkiminaPay/actions/runs/45187435607
- Passing strict Terraform scan (after fixes and justified skips):
  https://github.com/Ibrahim-Iradukunda/IkiminaPay/actions/runs/45194503674

## Finding and fix
- Finding: CKV_AWS_382 (security group egress open to all ports).
- Fix: egress restricted in commit afdc16f.

## Accepted risks
| Finding | Reason |
|---|---|
| Bastion has a public IP | It is the public entry point and SSH jump host |
| No Multi-AZ RDS | Doubles the cost, not needed for a student project |
| No RDS deletion protection | Needed so `terraform destroy` works |
| HTTP only, no TLS | Demo scope; add a domain and TLS before production |

## Reporting a vulnerability
Contact the team lead at f.kayiranga@alustudent.com.