# Terraform — Network Infrastructure

Provisions the AWS network layer for the Campus Notifier app:
- VPC with DNS hostnames enabled
- Public subnet with auto-assigned public IPs
- Internet Gateway + route table
- Security group allowing SSH (22) and the app port (8000)
- ECR repository for container images

## Prerequisites

- [Terraform ≥ 1.5](https://developer.hashicorp.com/terraform/install)
- AWS credentials configured (`aws configure` or environment variables)

## Usage

```bash
# 1. Initialise providers
terraform init

# 2. Preview changes
terraform plan

# 3. Apply
terraform apply

# 4. Tear down
terraform destroy
```

## Variables

Override defaults by passing `-var` flags or creating a `terraform.tfvars` file:

| Variable      | Default        | Description                        |
|---------------|----------------|------------------------------------|
| `aws_region`  | `us-east-1`    | AWS region                         |
| `vpc_cidr`    | `10.0.0.0/16`  | VPC CIDR block                     |
| `subnet_cidr` | `10.0.1.0/24`  | Public subnet CIDR block           |
| `app_port`    | `8000`         | Application port opened in the SG  |
| `environment` | `dev`          | Value for the `Environment` tag    |

Example `terraform.tfvars`:
```hcl
aws_region  = "eu-west-1"
environment = "staging"
```

> **Never commit `terraform.tfvars` if it contains sensitive values.** It is already listed in `.gitignore`.
