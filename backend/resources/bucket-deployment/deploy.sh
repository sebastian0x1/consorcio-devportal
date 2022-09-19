if [ -z "$1" ]; then
    printf "* Error: missing stage, try: bash deploy.sh *\n"
    exit 1
fi

source "../backend/resources.sh" $1

STAGE=$1
REGION=$(getResourceByName REGION)
STACK_NAME="cs-$STAGE-deployment"
SERVICE_NAME=$(getResourceByName SERVICE_NAME)
S3_FRONT_BUCKET="$SERVICE_NAME-fronts3-"$STAGE"-"$REGION
S3_STACK_BUCKET="$SERVICE_NAME-stack-$REGION-$STAGE"
S3_KEY_ARN=$(getResourceByName S3_KEY_ARN)
EVPC_ARN=$(getResourceByName EVPC_ARN)
printf "################## ${GREEN} PROCESSING ${STACK_NAME^^} ${NC} ###################"

PARAMS="\
BucketFront="$S3_FRONT_BUCKET" \
EVPCARN="$EVPC_ARN" \
BucketStack="$S3_STACK_BUCKET" \
BucketKey="$S3_KEY_ARN" \
"

TEMPLATE_FILE="$2/SourceBucket.yaml"

STACK_CREATION_RESPONSE=$(aws --region "$REGION" cloudformation deploy --stack-name "$STACK_NAME" --template-file "$TEMPLATE_FILE" --parameter-overrides ${PARAMS[@]} --capabilities "CAPABILITY_IAM" --no-fail-on-empty-changeset || echo "1")
echo "$STACK_CREATION_RESPONSE"
if [ "$STACK_CREATION_RESPONSE" == "1" ]; then
    printf "${RED}Failed to create/update stack!${NC}\n\n"
    exit 1
fi

hashbuckets=$(find ../backend/resources/bucket-deployment -type f -exec md5sum {} \; | sort -k 2 | md5sum)
echo $hashbuckets
result=$(aws s3 cp s3://cs-portal-stack-$REGION-$STAGE/rds/version-hashing/$STAGE/hashbuckets ./hashbuckets --sse aws:kms --acl private || touch ./hashbuckets)
LASThashbuckets="`head -1 ./hashbuckets`"
echo $LASThashbuckets

if [ "$LASThashbuckets" != "$hashbuckets" ]; then
  echo "$hashbuckets" > ./hashbuckets
  aws s3 cp ./hashbuckets s3://cs-portal-stack-$REGION-$STAGE/rds/version-hashing/$STAGE/hashbuckets --sse aws:kms --acl private
  echo '{"type": "BUCKETS", "version": "'${VERSION_BUCKETS}'", "change": true}' >> ./changes
else
  echo '{"type": "BUCKETS", "version": "'${VERSION_BUCKETS}'", "change": false}' >> ./changes
fi

rm ./hashbuckets

echo -e "\n##################  ${GREEN}   END    ${NC}   #########################\n\n"
exit 0