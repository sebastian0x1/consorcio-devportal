RDS_ENDPOINT="cr69y8mb38j2nm.cannx3lzzfai.us-east-1.rds.amazonaws.com" 
EC2_BASTION="ec2-3-239-248-6.compute-1.amazonaws.com"
KEY="cs-vpcrds--BastionKeyName.pem" 

#RDS_ENDPOINT="cr1of484pic1r6q.c2utkuxgry6c.us-east-1.rds.amazonaws.com" 
#EC2_BASTION="54.226.75.187" 
#KEY="consorcio-produccion.pem" 
ssh -N -L 127.0.0.1:3306:${RDS_ENDPOINT}:3306 -i $KEY ec2-user@${EC2_BASTION} 
# El .pem se encuentra por ejemplo en S3://cs-rds-db-utils-us-west-2 
