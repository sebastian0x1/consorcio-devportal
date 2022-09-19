#!/bin/bash
if [ -z "$1" ]; then
    printf "* Error: missing stage, try: bash deploy.sh *\n"
    exit 1
fi

source "../backend/resources.sh" $1 #STAGE

STAGE=$1
STACK_NAME="cs-rds"
REGION=$(getResourceByName REGION)

S3_BUCKET="cs-portal-stack-$REGION-$STAGE"
SERVICE_NAME=$(getResourceByName SERVICE_NAME)
MYSQL_DATABASE=$(getResourceByName MYSQL_DATABASE)
resourceName="cs-$STAGE-deployment-DeploySourceRDS"
RDS_INSTANCE=$(aws cloudformation list-exports --query 'Exports[?Name==`'$resourceName'`].Value' --output text)
DB_ARN_SECRET=$(getResourceByName DB_ARN_SECRET)

CAPABILITIES="CAPABILITY_IAM"

printf "################## ${GREEN}PROCESSING ${STACK_NAME^^} ${NC} ###################"

###################################### KEY VALUE
key=$STACK_NAME-BastionKeyName
if [ "$STAGE" == "dev" ] || [ "$STAGE" == "qa" ]; then
  
  Available_key=`aws ec2 describe-key-pairs --key-name $key | grep KeyName | awk -F\" '{print $4}'`

  if [ "$key" = "$Available_key" ]; then
      echo -e "\nKey is available."
  else
      echo -e "\nKey is not available: Creating new key"

      aws ec2 create-key-pair --key-name $key --region $REGION > $key.pem
      aws s3 cp $key.pem s3://$S3_BUCKET/rds/$key.pem --acl private
      rm $key.pem
  fi
fi
#######################################

PARAMS="\
 BastionKeyName="$key" \
 ServiceName="$SERVICE_NAME" \
 DBName="$MYSQL_DATABASE" \
 DbArnSecret="$DB_ARN_SECRET" \
"

if [ "$STAGE" == "prod" ] || [ "$STAGE" == "cicd" ] || [ "$STAGE" == "cicdprod" ]; then
  VPC=$(getResourceByName VPC)
  PrivateSubnet1=$(getResourceByName PRIVATESUBNET1)
  PrivateSubnet2=$(getResourceByName PRIVATESUBNET2)
  PrivateSubnet3=$(getResourceByName PRIVATESUBNET3)
  PARAMS+="VPC="$VPC" \
    PrivateSubnet1="$PrivateSubnet1" \
    PrivateSubnet2="$PrivateSubnet2"
    PrivateSubnet3="$PrivateSubnet3" \
    "
fi

echo "$PARAMS"



if [ "$STAGE" == "prod" ] || [ "$STAGE" == "cicd" ] || [ "$STAGE" == "cicdprod" ]; then
  TEMPLATE_FILE="$2/rds-prod.yaml"
else
  TEMPLATE_FILE="$2/rds.yaml"
fi

echo "$TEMPLATE_FILE"

VERSION_RDS=$(sed -nE 's/^\s*"version": "(.*?)",$/\1/p' ../backend/package.json)
STACK_CREATION_RESPONSE=$(aws --region "$REGION" cloudformation deploy --stack-name "$STACK_NAME" --template-file "$TEMPLATE_FILE" --parameter-overrides ${PARAMS[@]} --capabilities "$CAPABILITIES" --no-fail-on-empty-changeset || echo "1")
echo "$STACK_CREATION_RESPONSE"
if [ "$STACK_CREATION_RESPONSE" == "1" ]; then
    printf "${RED}Failed to create/update stack!${NC}\n\n"
    exit 1
fi

hashrds=$(find ../backend/resources/bucket-deployment -type f -exec md5sum {} \; | sort -k 2 | md5sum)
echo $hashrds
result=$(aws s3 cp s3://cs-portal-stack-$REGION-$STAGE/rds/version-hashing/$STAGE/hashrds ./hashrds --sse aws:kms --acl private || touch ./hashrds)
LASThashrds="`head -1 ./hashrds`"
echo $LASThashrds

if [ "$LASThashrds" != "$hashrds" ]; then
  echo "$hashrds" > ./hashrds
  aws s3 cp ./hashrds s3://cs-portal-stack-$REGION-$STAGE/rds/version-hashing/$STAGE/hashrds --sse aws:kms --acl private
  echo ',{"type": "RDS", "version": "'${VERSION_RDS}'", "change": true}' >> ./changes
else
  echo ',{"type": "RDS", "version": "'${VERSION_RDS}'", "change": false}' >> ./changes
fi

rm ./hashrds

echo -e "\n##################  ${GREEN}     END   ${NC}   #########################\n\n"
exit 0