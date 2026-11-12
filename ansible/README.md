# Ansible deployment

This playbook configures the Amazon Linux 2023 EC2 instance created by `terraform/`. It installs Docker, checks out the app source, builds an image tagged with that source commit, and runs the container with persistent JSON storage.

The Terraform security group publishes host port `8000`; the app listens on port `3000` inside the container. The playbook intentionally does not configure firewall or SSH hardening, which is Person 4's task.

## Prerequisites

- Terraform has been applied and the EC2 instance has finished starting.
- The Terraform `key_name` points to an EC2 key pair you have locally.
- Ansible 2.16 or newer and Python 3 are installed on your control machine.
- The repository is reachable from the EC2 instance so it can clone the app and download the base image and packages.

## Configure the inventory

From the repository root, get the instance's public IP:

```sh
terraform -chdir=terraform output -raw public_ip
```

Edit `ansible/inventory.ini` and replace `REPLACE_WITH_TERRAFORM_PUBLIC_IP` and `REPLACE_WITH_KEY.pem` with the returned IP and the local path to the matching private key. Do not commit the private key. The inventory uses the Amazon Linux default SSH account, `ec2-user`.

The inventory defaults to deploying the `main` branch. Change `app_version` to a branch, tag, or commit SHA to deploy a different version. Each checked-out commit gets its own image tag, so a new source revision builds a new image while repeated runs for the same revision reuse the existing image.

## Install the Ansible collection

From the repository root:

```sh
ansible-galaxy collection install -r ansible/requirements.yml
```

## Deploy and check idempotence

Test SSH connectivity:

```sh
ansible app_servers -i ansible/inventory.ini -m ansible.builtin.ping
```

Deploy the application:

```sh
ansible-playbook -i ansible/inventory.ini ansible/deploy.yml
```

Run the same playbook a second time. When the source revision and server state have not changed, the recap should show `changed=0`. Open `http://<instance-public-ip>:8000` to view the app.

The Docker volume `ikiminapay-data` keeps `groups.json` when the app container is recreated. Run `terraform -chdir=terraform destroy` when you are done with the infrastructure.
