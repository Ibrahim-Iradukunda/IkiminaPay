# Ansible deployment

`deploy.yml` configures the Amazon Linux 2023 app instance, authenticates to ECR using
the instance profile, pulls the requested image, starts it with Docker Compose, and
configures Nginx on the bastion to serve the app on port 80.

The app is reached over SSH through the bastion. The Terraform security groups do not
give the app instance a public IP; only the bastion can SSH to it or reach its app port.

## Manual deployment

1. Apply Terraform and copy the outputs into `inventory.ini`:

   ```powershell
   terraform -chdir=terraform output -raw app_private_ip
   terraform -chdir=terraform output -raw bastion_public_ip
   terraform -chdir=terraform output -raw ecr_repository_url
   ```

2. Replace the `REPLACE_WITH_...` inventory values and set the matching SSH private-key
   path. Keep the key outside the repository.
3. Ensure the image exists in ECR. The CD workflow publishes images tagged with the full
   commit SHA when a commit reaches `main`.
4. Run Ansible from the repository root, substituting the actual ECR URL and image tag:

   ```powershell
   ansible-playbook -i ansible/inventory.ini ansible/deploy.yml `
     --extra-vars "aws_region=us-east-1 app_image=ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/ikiminapay:COMMIT_SHA app_private_ip=APP_PRIVATE_IP app_port=3000"
   ```

The app EC2 instance profile grants ECR pull access. The Ansible task checks
`http://127.0.0.1:3000/health` after the container starts. Once the proxy play completes,
open `http://<bastion-public-ip>`.

## GitHub Actions deployment

The workflow in `.github/workflows/cd.yml` runs CI, builds and pushes an immutable image,
temporarily allows SSH from the GitHub-hosted runner's current public IP, and runs this
playbook through the bastion. It revokes that temporary SSH rule at the end of the job.
Configure the required GitHub variables, secrets, and AWS OIDC role in the root
[operations guide](../README.md#github-actions-deployment-setup).
