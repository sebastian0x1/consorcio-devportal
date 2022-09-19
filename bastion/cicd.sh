#RDS_ENDPOINT="tv1lp67lsdta8p3.cannx3lzzfai.us-east-1.rds.amazonaws.com"
RDS_ENDPOINT="cr1hn3m6ovq3w2.capuxohjxkji.us-east-1.rds.amazonaws.com"
EC2_BASTION="10.0.141.42"
KEY="cs-rds-BastionKeyName.pem"


ssh -N -L 127.0.0.1:3306:${RDS_ENDPOINT}:3306 -i $KEY ec2-user@${EC2_BASTION}

# El .pem se encuentra por ejemplo en S3://cs-stack-us-west-2/rds
