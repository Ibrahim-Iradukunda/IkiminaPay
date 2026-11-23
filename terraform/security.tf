
resource "aws_security_group" "bastion" {
  #checkov:skip=CKV_AWS_260:Public HTTP on the demo Nginx bastion is required for browser access.
  name        = "ikiminapay-bastion-sg"
  description = "Restricted SSH and public HTTP reverse proxy"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH from trusted operator network"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_allowed_cidr]
  }

  ingress {
    description = "Public demo website through Nginx"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "SSH to private application subnet"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.private_subnet_cidrs
  }

  egress {
    description = "Nginx proxy traffic to private application subnet"
    from_port   = var.app_port
    to_port     = var.app_port
    protocol    = "tcp"
    cidr_blocks = var.private_subnet_cidrs
  }

  tags = {
    Name        = "ikiminapay-bastion-sg"
    Environment = var.environment
  }
}

resource "aws_security_group" "app" {
  name        = "ikiminapay-app-sg"
  description = "App traffic only from the bastion and SSH only from the bastion"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "SSH from the bastion"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }

  ingress {
    description     = "Application traffic from the Nginx reverse proxy"
    from_port       = var.app_port
    to_port         = var.app_port
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }

  egress {
    description = "HTTPS for ECR, Secrets Manager, and package downloads"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "PostgreSQL traffic to private subnet"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = var.private_subnet_cidrs
  }

  tags = {
    Name        = "ikiminapay-app-sg"
    Environment = var.environment
  }
}

resource "aws_security_group" "database" {
  name        = "ikiminapay-database-sg"
  description = "PostgreSQL access from the application instance only"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from the application instance"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress = []

  tags = {
    Name        = "ikiminapay-database-sg"
    Environment = var.environment
  }
}
