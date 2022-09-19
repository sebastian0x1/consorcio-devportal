RDS_ENDPOINT="cr18jo92a8rme76.cnmciyemu8cm.us-east-1.rds.amazonaws.com"
EC2_BASTION="ec2-3-94-163-223.compute-1.amazonaws.com"
KEY="keydbportaldb.pem"

ssh -N -L 127.0.0.1:3306:${RDS_ENDPOINT}:3306 -i $KEY ec2-user@${EC2_BASTION}
