if [ -z "$1" ]; then
    printf "* Error: missing stage, try: bash deploy.sh *\n"
    exit 1
fi

source "../backend/resources.sh" $1

STAGE=$1
REGION=$(getResourceByName REGION)
STACK_NAME="cs-$STAGE-cloudfront"
CLOUDFRONT_PROFILE=$(getResourceByName CLOUDFRONT_PROFILE)
PROFILE=$(getResourceByName PROFILE)
BUCKETEXPORTNAME="cs-$STAGE-deployment-CSPortalFrontendS3Bucket"
BUCKET="$(aws cloudformation list-exports --query 'Exports[?Name==`'$BUCKETEXPORTNAME'`].Value')"
BUCKET_FOR_INJECTION=$(echo "$BUCKET" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')

printf "################## ${GREEN} PROCESSING ${STACK_NAME^^} ${NC} ###################"

PARAMS="\
BUCKET="$BUCKET_FOR_INJECTION" \
"

TEMPLATE_FILE="$2/cloudfront.yaml"

# Cambio de profile para deployar en la otra cuenta
export AWS_PROFILE=$CLOUDFRONT_PROFILE

STACK_CREATION_RESPONSE=$(aws --region "$REGION" cloudformation deploy --stack-name "$STACK_NAME" --template-file "$TEMPLATE_FILE" --parameter-overrides ${PARAMS[@]} --capabilities "CAPABILITY_IAM" --no-fail-on-empty-changeset || echo "1")
echo "$STACK_CREATION_RESPONSE"
if [ "$STACK_CREATION_RESPONSE" == "1" ]; then
    printf "${RED}Failed to create/update stack!${NC}\n\n"
    exit 1
fi

echo -e "\n##################  ${GREEN}   END    ${NC}   #########################\n\n"

OAIEXPORTNAME="cs-$STAGE-cloudfront-OAI"
OAI="$(aws cloudformation list-exports --query 'Exports[?Name==`'$OAIEXPORTNAME'`].Value')"
OAI_FOR_INJECTION=$(echo "$OAI" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')

# Vuelvo al profile anterior.
export AWS_PROFILE=$PROFILE

# Se atacha la poliza al s3 apuntando al cloudfront
STACK_NAME="cs-$STAGE-bucketPolicyCloudfront"
printf "################## ${GREEN} PROCESSING ${STACK_NAME^^} ${NC} ###################"

PARAMS="\
BUCKET="$BUCKET_FOR_INJECTION" \
OAI="$OAI_FOR_INJECTION" \
"

TEMPLATE_FILE="$2/bucketPolicy.yaml"
STACK_CREATION_RESPONSE=$(aws --region "$REGION" cloudformation deploy --stack-name "$STACK_NAME" --template-file "$TEMPLATE_FILE" --parameter-overrides ${PARAMS[@]} --capabilities "CAPABILITY_IAM" --no-fail-on-empty-changeset || echo "1")
echo "$STACK_CREATION_RESPONSE"
if [ "$STACK_CREATION_RESPONSE" == "1" ]; then
    printf "${RED}Failed to create/update stack!${NC}\n\n"
    exit 1
fi

hashcloudfront=$(find ../backend/resources/cloudfront-deployment -type f -exec md5sum {} \; | sort -k 2 | md5sum)
echo $hashcloudfront
result=$(aws s3 cp s3://cs-portal-stack-$REGION-$STAGE/rds/version-hashing/$STAGE/hashcloudfront ./hashcloudfront --sse aws:kms --acl private || touch ./hashcloudfront)
LASThashcloudfront="`head -1 ./hashcloudfront`"
echo $LASThashcloudfront

if [ "$LASThashcloudfront" != "$hashcloudfront" ]; then
  echo "$hashcloudfront" > ./hashcloudfront
  aws s3 cp ./hashcloudfront s3://cs-portal-stack-$REGION-$STAGE/rds/version-hashing/$STAGE/hashcloudfront --sse aws:kms --acl private
  echo '{"type": "CLOUDFRONT", "version": "'${VERSION_CLOUDFRONT}'", "change": true}' >> ./changes
else
  echo '{"type": "CLOUDFRONT", "version": "'${VERSION_CLOUDFRONT}'", "change": false}' >> ./changes
fi

rm ./hashcloudfront

echo -e "\n##################  ${GREEN}   END    ${NC}   #########################\n\n"
exit 0