variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "subnet_cidr" {
  description = "CIDR block for the public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "app_port" {
  description = "Port the application listens on"
  type        = number
  default     = 8000
}

variable "environment" {
  description = "Deployment environment tag"
  type        = string
  default     = "dev"
}

variable "instance_type" {
  description = "EC2 instance type for the application instance"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "Optional name of an existing EC2 key pair for SSH access"
  type        = string
  default     = null
}

variable "ssh_allowed_cidr" {
  description = "IP allowed to SSH"
  type        = string
}