resource "aws_db_subnet_group" "main" {
  name       = "ikiminapay-db-subnets"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name        = "ikiminapay-db-subnets"
    Environment = var.environment
  }
}

resource "aws_db_parameter_group" "main" {
  name   = "ikiminapay-${var.environment}-postgres16"
  family = "postgres16"

  parameter {
    name  = "log_statement"
    value = "ddl"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }

  parameter {
    name  = "rds.force_ssl"
    value = "1"
  }

  tags = {
    Name        = "ikiminapay-postgres-parameters"
    Environment = var.environment
  }
}

resource "aws_kms_key" "rds_performance_insights" {
  description             = "Encrypt IkiminaPay RDS Performance Insights data"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "EnableAccountIAMPermissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "AllowCloudWatchLogsForVPCFlowLogGroup"
        Effect = "Allow"
        Principal = {
          Service = "logs.${var.aws_region}.amazonaws.com"
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:Describe*"
        ]
        Resource = "*"
        Condition = {
          ArnEquals = {
            "kms:EncryptionContext:aws:logs:arn" = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/vpc/ikiminapay-flow-logs"
          }
        }
      }
    ]
  })

  tags = {
    Name        = "ikiminapay-rds-performance-insights"
    Environment = var.environment
  }
}

resource "aws_db_instance" "main" {
  #checkov:skip=CKV_AWS_157:Single-AZ is the low-cost student demo default; use Multi-AZ for a production availability target.
  #checkov:skip=CKV_AWS_293:Deletion protection stays off so the disposable coursework database can be destroyed; back up required data first.
  #checkov:skip=CKV_AWS_118:Enhanced monitoring is disabled to avoid added monitoring charges in the student demo.
  identifier                          = "ikiminapay-${var.environment}"
  engine                              = "postgres"
  engine_version                      = "16.15"
  instance_class                      = var.database_instance_type
  allocated_storage                   = 20
  max_allocated_storage               = 100
  storage_encrypted                   = true
  db_name                             = var.database_name
  username                            = var.database_username
  password                            = var.database_password
  port                                = 5432
  db_subnet_group_name                = aws_db_subnet_group.main.name
  parameter_group_name                = aws_db_parameter_group.main.name
  vpc_security_group_ids              = [aws_security_group.database.id]
  publicly_accessible                 = false
  multi_az                            = false
  auto_minor_version_upgrade          = true
  backup_retention_period             = 7
  deletion_protection                 = false
  skip_final_snapshot                 = true
  apply_immediately                   = true
  performance_insights_enabled        = true
  performance_insights_kms_key_id     = aws_kms_key.rds_performance_insights.arn
  iam_database_authentication_enabled = true
  copy_tags_to_snapshot               = true
  enabled_cloudwatch_logs_exports     = ["postgresql", "upgrade"]

  tags = {
    Name        = "ikiminapay-database"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret" "database" {
  #checkov:skip=CKV2_AWS_57:Rotation Lambda is not included in the low-cost coursework demo; enable automatic rotation before production use.
  name                    = "ikiminapay/${var.environment}/database"
  description             = "PostgreSQL credentials for the IkiminaPay ${var.environment} application"
  recovery_window_in_days = 7
  kms_key_id              = aws_kms_key.rds_performance_insights.arn

  tags = {
    Name        = "ikiminapay-database-credentials"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "database" {
  secret_id = aws_secretsmanager_secret.database.id
  secret_string = jsonencode({
    host     = aws_db_instance.main.address
    port     = aws_db_instance.main.port
    dbname   = var.database_name
    username = var.database_username
    password = var.database_password
  })
}

