# AWS Infrastructure

This Terraform configuration provisions the AWS environment for IkiminaPay:

- A VPC with two public and two private subnets in separate availability zones.
- A public bastion host (also the HTTP reverse proxy for the demo URL).
- A private EC2 application instance with no public IP.
- A NAT gateway for private-instance package and ECR access.
- A private, encrypted PostgreSQL RDS instance.
- Security groups that restrict SSH, app, and database traffic to their required sources.
- A private ECR repository and an EC2 instance role limited to pulling its images.
- The VPC default security group has no ingress or egress rules, and subnets use pinned
  Availability Zone IDs so adding a new AWS zone cannot silently move resources.
- PostgreSQL enforces SSL, logs DDL statements and queries taking at least one second.
  The VPC flow-log group is encrypted with a customer-managed KMS key. The demo uses
  single-AZ RDS, no deletion protection, and no enhanced monitoring to keep costs down;
  these exceptions are documented inline for Checkov. Enable Multi-AZ, deletion
  protection, and enhanced monitoring for a production availability and operations target.

The application currently stores group data in a JSON file. RDS is provisioned to satisfy
the infrastructure requirement, but the application does not connect to it yet.

## Prerequisites

- Terraform 1.5 or newer.
- AWS CLI configured with credentials authorized to provision VPC, EC2, RDS, ECR, IAM,
  NAT gateway, and Elastic IP resources.
- An EC2 key pair created in the target region.
- A stable public IPv4 address/CIDR for restricting SSH to the bastion.

## Configure and preview

From the repository root, create `terraform/terraform.tfvars` (this file is git-ignored):

```hcl
aws_region            = "us-east-1"
availability_zone_ids = ["use1-az1", "use1-az2"]
environment         = "dev"
key_name            = "YOUR_EXISTING_EC2_KEY_PAIR_NAME"
ssh_allowed_cidr    = "YOUR_PUBLIC_IP/32"
database_password   = "REPLACE_WITH_A_RANDOM_PASSWORD_OF_16_OR_MORE_CHARACTERS"
```

Replace every placeholder before applying. Do not commit `terraform.tfvars` or paste the
database password into a tracked file. Terraform state also contains the database password;
use an encrypted, access-controlled remote state backend before sharing this environment.

```powershell
terraform -chdir=terraform init
terraform -chdir=terraform validate
terraform -chdir=terraform plan
```

Review the plan and the estimated AWS charges before creating resources:

```powershell
terraform -chdir=terraform apply
```

This stack includes a NAT gateway and RDS, which incur ongoing charges while running.
Destroy the environment when it is no longer needed:

```powershell
terraform -chdir=terraform destroy
```

Destroying the stack deletes the database without a final snapshot. Back up anything you
need first. The VPC, NAT gateway, RDS instance, and customer-managed KMS key incur
ongoing charges while the stack is running.

The default `availability_zone_ids` are for `eu-north-1`; when changing regions, set two
valid AZ IDs for that region. AWS documents AZ IDs as stable physical zone identifiers
shared across accounts.

## Outputs

```powershell
terraform -chdir=terraform output
terraform -chdir=terraform output -raw bastion_public_ip
terraform -chdir=terraform output -raw app_private_ip
terraform -chdir=terraform output -raw ecr_repository_url
terraform -chdir=terraform output -raw bastion_security_group_id
```

The public demo URL is `http://<bastion_public_ip>` after Ansible configures Nginx.

## Resources

Terraform resources are grouped by concern in `network.tf`, `security.tf`, `compute.tf`,
`registry.tf`, and `database.tf`. `main.tf` contains shared AWS data sources;
`variables.tf`, `outputs.tf`, and `provider.tf` define the root configuration interface.
