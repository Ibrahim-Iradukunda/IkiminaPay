variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "eu-north-1"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for the public subnets in two availability zones"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]

  validation {
    condition     = length(var.public_subnet_cidrs) == 2
    error_message = "Exactly two public subnet CIDRs are required."
  }
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for the private subnets in two availability zones"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24"]

  validation {
    condition     = length(var.private_subnet_cidrs) == 2
    error_message = "Exactly two private subnet CIDRs are required."
  }
}

variable "availability_zone_ids" {
  description = "Pinned AWS Availability Zone IDs for the two subnet pairs; override when changing regions"
  type        = list(string)
  default     = ["eun1-az1", "eun1-az2"]

  validation {
    condition     = length(var.availability_zone_ids) == 2 && var.availability_zone_ids[0] != var.availability_zone_ids[1]
    error_message = "Provide exactly two distinct Availability Zone IDs that exist in aws_region."
  }
}

variable "app_port" {
  description = "Port the application listens on"
  type        = number
  default     = 3000
}

variable "environment" {
  description = "Deployment environment tag"
  type        = string
  default     = "dev"
}

variable "app_instance_type" {
  description = "EC2 instance type for the private application instance"
  type        = string
  default     = "t3.micro"
}

variable "bastion_instance_type" {
  description = "EC2 instance type for the public bastion and HTTP proxy"
  type        = string
  default     = "t3.micro"
}

variable "database_instance_type" {
  description = "RDS instance class for the private PostgreSQL database"
  type        = string
  default     = "db.t3.micro"
}

variable "database_name" {
  description = "Name of the PostgreSQL database"
  type        = string
  default     = "ikiminapay"
}

variable "database_username" {
  description = "Master username for the PostgreSQL database"
  type        = string
  default     = "ikiminapay_admin"
}

variable "database_password" {
  description = "Master password for PostgreSQL; set via TF_VAR_database_password"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.database_password) >= 16
    error_message = "The database password must be at least 16 characters long."
  }
}

variable "key_name" {
  description = "Name of an existing EC2 key pair used by Ansible to access both instances"
  type        = string
  default     = null
}

variable "ssh_allowed_cidr" {
  description = "Trusted public IPv4 CIDR allowed to SSH to the bastion"
  type        = string
  default     = "127.0.0.1/32"

  validation {
    condition = (
      can(regex("^[0-9.]+/[0-9]+$", var.ssh_allowed_cidr)) &&
      can(cidrhost(var.ssh_allowed_cidr, 0)) &&
      var.ssh_allowed_cidr != "0.0.0.0/0"
    )
    error_message = "Set a valid, restricted IPv4 CIDR for SSH; 0.0.0.0/0 is not allowed."
  }
}
