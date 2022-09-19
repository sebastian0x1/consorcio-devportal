RDS_ENDPOINT="cr17xiegwiinwl8.c2utkuxgry6c.us-east-1.rds.amazonaws.com"
EC2_BASTION="ec2-18-208-251-106.compute-1.amazonaws.com"
KEY="consorcio-produccion.pem"

#RDS_ENDPOINT="cr1of484pic1r6q.c2utkuxgry6c.us-east-1.rds.amazonaws.com"
#EC2_BASTION="54.226.75.187"
#KEY="consorcio-produccion.pem"

ssh -N -L 127.0.0.1:3306:${RDS_ENDPOINT}:3306 -i $KEY ec2-user@${EC2_BASTION}

# El .pem se encuentra por ejemplo en S3://cs-stack-us-west-2/rds
