output "instance_id" {
  description = "ID of the application EC2 instance"
  value       = aws_instance.app.id
}

output "public_ip" {
  description = "Public IPv4 address of the application EC2 instance"
  value       = aws_instance.app.public_ip
}

output "private_ip" {
  description = "Private IPv4 address of the application EC2 instance"
  value       = aws_instance.app.private_ip
}

output "vpc_id" {
  description = "ID of the application VPC"
  value       = aws_vpc.main.id
}

output "subnet_id" {
  description = "ID of the public subnet"
  value       = aws_subnet.public.id
}

output "security_group_id" {
  description = "ID of the application security group"
  value       = aws_security_group.app.id
}

output "ecr_repository_url" {
  description = "URL of the ECR repository for application images"
  value       = aws_ecr_repository.devops_repo.repository_url
}
