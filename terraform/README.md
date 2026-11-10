# Terraform — AWS Infrastructure

Provisions AWS networking and an EC2 application instance for the Campus Notifier app:
- VPC with DNS hostnames enabled
- Public subnet with auto-assigned public IPs
- Internet Gateway + route table
- Security group allowing SSH (22) and the app port (8000)
- ECR repository for container images
- EC2 instance running the latest matching Amazon Linux 2023 image (`t3.micro` by default)

## Prerequisites

- [Terraform ≥ 1.5](https://developer.hashicorp.com/terraform/install)
- An AWS account with permissions to create VPC, EC2, security group, and ECR resources
- AWS credentials configured (`aws configure` or environment variables)

## Usage

Run these commands from this `terraform` directory:

```bash
# 1. Initialise Terraform and download the AWS provider
terraform init

# 2. Preview the infrastructure changes
terraform plan

# 3. Create the infrastructure
terraform apply

# 4. Remove the infrastructure when it is no longer needed
terraform destroy
```

Terraform prompts for confirmation before applying or destroying resources. The instance's public IP, private IP, instance ID, VPC ID, subnet ID, security group ID, and ECR repository URL are printed after apply. Retrieve them later with `terraform output`.

To enable SSH key-based access, create an EC2 key pair in the selected region and set `key_name` to its name. For example, add it to `terraform.tfvars`:

```hcl
key_name = "my-ec2-key"
```

Without `key_name`, the instance is created without an EC2 key pair.

## Variables

Override defaults by passing `-var` flags or creating a `terraform.tfvars` file:

| Variable        | Default        | Description                        |
|-----------------|----------------|------------------------------------|
| `aws_region`    | `us-east-1`    | AWS region                         |
| `vpc_cidr`      | `10.0.0.0/16`  | VPC CIDR block                     |
| `subnet_cidr`   | `10.0.1.0/24`  | Public subnet CIDR block           |
| `app_port`      | `8000`         | Application port opened in the SG  |
| `environment`   | `dev`          | Value for the `Environment` tag    |
| `instance_type` | `t3.micro`     | EC2 instance type                  |
| `key_name`      | `null`         | Optional existing EC2 key pair name |

Example `terraform.tfvars`:
```hcl
aws_region  = "eu-west-1"
environment = "staging"
```

> **Never commit `terraform.tfvars` if it contains sensitive values.** It is already listed in `.gitignore`.
