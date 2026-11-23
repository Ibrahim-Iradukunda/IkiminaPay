resource "aws_db_subnet_group" "main" {
  name       = "ikiminapay-db-subnets"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name        = "ikiminapay-db-subnets"
    Environment = var.environment
  }
}

resource "aws_db_instance" "main" {
  identifier                   = "ikiminapay-${var.environment}"
  engine                       = "postgres"
  instance_class               = var.database_instance_type
  allocated_storage            = 20
  max_allocated_storage        = 100
  storage_encrypted            = true
  db_name                      = var.database_name
  username                     = var.database_username
  password                     = var.database_password
  port                         = 5432
  db_subnet_group_name         = aws_db_subnet_group.main.name
  vpc_security_group_ids       = [aws_security_group.database.id]
  publicly_accessible          = false
  multi_az                     = false
  auto_minor_version_upgrade   = true
  backup_retention_period      = 7
  deletion_protection          = false
  skip_final_snapshot          = true
  apply_immediately            = true
  performance_insights_enabled = true
  copy_tags_to_snapshot         = true
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  tags = {
    Name        = "ikiminapay-database"
    Environment = var.environment
  }
}

