#!/bin/bash

if [ -z "$1" ]; then
    printf "* Error: missing stage, try: bash deploy.sh *\n"
    exit 1
fi

source "../backend/resources.sh" $1 #STAGE

STAGE=$1
REGION=$(getResourceByName REGION)
STACK_NAME="cs-$STAGE-cognito"
CAPABILITIES=("CAPABILITY_AUTO_EXPAND" "CAPABILITY_NAMED_IAM" "CAPABILITY_IAM")
SES_EMAIL=$(getResourceByName SES_EMAIL)
METADATA_URL=$(getResourceByName METADATA_URL)
INBOUND_ACCOUNT=$(getResourceByName CLOUDFRONT_PROFILE)
PROFILE=$(getResourceByName PROFILE)




printf "################## ${GREEN} PROCESSING ${STACK_NAME^^} ${NC} ###################"
# # Cambio de profile para deployar en la otra cuenta
export AWS_PROFILE=$INBOUND_ACCOUNT

ALLOWED_ORIGINS_URL="cs-$STAGE-cloudfront-CloudFrontDomain"
ALLOWED_ORIGINS_URL_FOR_INJECTION="$(aws cloudformation list-exports --query 'Exports[?Name==`'$ALLOWED_ORIGINS_URL'`].Value')"
ALLOWED_ORIGINS_URL_FOR_INJECTION=$(echo "$ALLOWED_ORIGINS_URL_FOR_INJECTION" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')
ALLOWED_ORIGINS_URL_FOR_INJECTION="https://$ALLOWED_ORIGINS_URL_FOR_INJECTION/loginAD"

# Vuelvo al profile anterior.
export AWS_PROFILE=$PROFILE
#https://devportal.consorcio.cl
#ALLOWED_ORIGINS_URL_FOR_INJECTION=$(getResourceByName ALLOWED_ORIGINS_URL)"/loginAD"

IFS=','
read -a url_arr <<< "$ALLOWED_ORIGINS_URL_FOR_INJECTION"
${url_arr[1]}

PARAMS="\
 SesEmail=$SES_EMAIL \
 Stage=$STAGE \
 Urls=${url_arr[1]} \
"

if [ "$METADATA_URL" != "" ]; then
    PARAMS+="
      MetadataURL=$METADATA_URL \
    "
fi


TEMPLATE_FILE="$2/cognito-user-pool.yaml"
VERSION_COGNITO=$(sed -nE 's/^\s*"version": "(.*?)",$/\1/p' ../backend/package.json)
STACK_CREATION_RESPONSE=$(aws --region "$REGION" cloudformation deploy --stack-name "$STACK_NAME" --template-file "$TEMPLATE_FILE" --parameter-overrides ${PARAMS[@]} --capabilities "$CAPABILITIES" --no-fail-on-empty-changeset || echo "1")
echo "$STACK_CREATION_RESPONSE"
if [ "$STACK_CREATION_RESPONSE" == "1" ]; then
    printf "${RED}Failed to create/update stack!${NC}\n\n"
    exit 1
fi

hashcognito=$(find ../backend/resources/cognito-deployment -type f -exec md5sum {} \; | sort -k 2 | md5sum)
echo $hashcognito
result=$(aws s3 cp s3://cs-portal-stack-$REGION-$STAGE/rds/version-hashing/$STAGE/hashcognito ./hashcognito --acl private  --sse aws:kms || touch ./hashcognito)
LASThashcognito="`head -1 ./hashcognito`"
echo $LASThashcognito

if [ "$LASThashcognito" != "$hashcognito" ]; then
  echo "$hashcognito" > ./hashcognito
  aws s3 cp ./hashcognito s3://cs-portal-stack-$REGION-$STAGE/rds/version-hashing/$STAGE/hashcognito --acl private  --sse aws:kms
  echo ',{"type": "COGNITO", "version": "'${VERSION_COGNITO}'", "change": true}' >> ./changes
else
  echo ',{"type": "COGNITO", "version": "'${VERSION_COGNITO}'", "change": false}' >> ./changes
fi

rm ./hashcognito

echo -e "\n##################  ${GREEN}     END  ${NC}    #########################\n\n"
exit 0