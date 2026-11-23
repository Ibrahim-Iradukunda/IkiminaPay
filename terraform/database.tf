resource "aws_db_subnet_group" "main" {
  name       = "ikiminapay-db-subnets"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name        = "ikiminapay-db-subnets"
    Environment = var.environment
  }
}

resource "aws_kms_key" "database" {
  description         = "IkiminaPay RDS encryption"
  enable_key_rotation = true
}

resource "aws_iam_role" "rds_monitoring" {
  name = "ikiminapay-rds-monitoring"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = "sts:AssumeRole"
      Principal = {
        Service = "monitoring.rds.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

resource "aws_db_parameter_group" "postgres" {
  name   = "ikiminapay-postgres"
  family = "postgres16"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
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
  auto_minor_version_upgrade   = true
  backup_retention_period      = 7
  deletion_protection           = true
  skip_final_snapshot          = true
  apply_immediately            = true
  performance_insights_enabled = true
  performance_insights_kms_key_id = aws_kms_key.database.arn
  copy_tags_to_snapshot         = true
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  monitoring_interval           = 60
  monitoring_role_arn           = aws_iam_role.rds_monitoring.arn
  multi_az                      = true
  iam_database_authentication_enabled = true
  deletion_protection           = true
  parameter_group_name          = aws_db_parameter_group.postgres.name

  tags = {
    Name        = "ikiminapay-database"
    Environment = var.environment
  }
}

