
resource "aws_iam_role" "app" {
  name = "ikiminapay-app-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = "sts:AssumeRole"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })

  tags = {
    Environment = var.environment
  }
}

resource "aws_iam_role_policy" "app_ecr_read" {
  name = "ikiminapay-ecr-read"
  role = aws_iam_role.app.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ecr:GetAuthorizationToken"]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ]
        Resource = aws_ecr_repository.app.arn
      }
    ]
  })
}

resource "aws_iam_role_policy" "app_secrets_read" {
  name = "ikiminapay-secrets-read"
  role = aws_iam_role.app.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = aws_secretsmanager_secret.database.arn
      }
    ]
  })
}

resource "aws_iam_instance_profile" "app" {
  name = "ikiminapay-app-profile"
  role = aws_iam_role.app.name
}

resource "aws_iam_role" "bastion" {
  name = "ikiminapay-bastion-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = "sts:AssumeRole"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_instance_profile" "bastion" {
  name = "ikiminapay-bastion-profile"
  role = aws_iam_role.bastion.name
}

resource "aws_instance" "bastion" {
  #checkov:skip=CKV_AWS_88:The bastion is intentionally public so operators can SSH and users can reach the demo reverse proxy.
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = var.bastion_instance_type
  subnet_id                   = aws_subnet.public[0].id
  vpc_security_group_ids      = [aws_security_group.bastion.id]
  associate_public_ip_address = true
  key_name                    = var.key_name
  iam_instance_profile        = aws_iam_instance_profile.bastion.name
  monitoring                  = true
  ebs_optimized               = true

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  root_block_device {
    encrypted = true
  }

  tags = {
    Name        = "ikiminapay-bastion"
    Environment = var.environment
  }
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.app_instance_type
  subnet_id              = aws_subnet.private[0].id
  vpc_security_group_ids = [aws_security_group.app.id]
  key_name               = var.key_name
  iam_instance_profile   = aws_iam_instance_profile.app.name
  monitoring             = true
  ebs_optimized          = true

  depends_on = [
    aws_iam_role_policy.app_ecr_read,
    aws_iam_role_policy.app_secrets_read
  ]

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  root_block_device {
    encrypted = true
  }

  tags = {
    Name        = "ikiminapay-app"
    Environment = var.environment
  }
}
