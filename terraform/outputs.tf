output "bastion_public_ip" {
  description = "Public IPv4 address for the bastion SSH endpoint and HTTP demo proxy"
  value       = aws_instance.bastion.public_ip
}

output "app_private_ip" {
  description = "Private IPv4 address of the application instance"
  value       = aws_instance.app.private_ip
}

output "app_instance_id" {
  description = "ID of the private application EC2 instance"
  value       = aws_instance.app.id
}

output "bastion_security_group_id" {
  description = "Security group ID used by the CD workflow to temporarily allow its SSH connection"
  value       = aws_security_group.bastion.id
}

output "app_security_group_id" {
  description = "Security group ID attached to the application instance"
  value       = aws_security_group.app.id
}

output "vpc_id" {
  description = "ID of the IkiminaPay VPC"
  value       = aws_vpc.main.id
}

output "ecr_repository_url" {
  description = "Private ECR repository URL for application images"
  value       = aws_ecr_repository.app.repository_url
}

output "database_endpoint" {
  description = "Private PostgreSQL endpoint; the current app still stores data in JSON"
  value       = aws_db_instance.main.endpoint
}

output "database_name" {
  description = "Name of the provisioned PostgreSQL database"
  value       = aws_db_instance.main.db_name
}

output "database_secret_id" {
  description = "Secrets Manager name containing the application database credentials"
  value       = aws_secretsmanager_secret.database.name
}
