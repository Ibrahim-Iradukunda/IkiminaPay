resource "aws_security_group" "bastion" {
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
    description = "Outbound package, registry, and proxy traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
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
    description = "Outbound package and ECR traffic through NAT"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
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

  egress {
    description = "Outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "ikiminapay-database-sg"
    Environment = var.environment
  }
}
