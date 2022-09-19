if [ -z "$1" ]; then
    printf "* Error: missing stage, try: bash deploy.sh *\n"
    exit 1
fi

source "../backend/resources.sh" $1

STAGE=$1
REGION=$(getResourceByName REGION)
ACCOUNTID=$(getResourceByName AWS_ACCOUNT_ID)
STACK_NAME="cs-$STAGE-roletobeassume"
SHARED_ACCOUNT_ARN=$(getResourceByName SHARED_ACCOUNT_ARN)
PROFILE=$(getResourceByName PROFILE)
ROLE_TO_BE_ASSUME_PROFILE=$(getResourceByName ROLE_TO_BE_ASSUME_PROFILE)
CAPABILITIES="CAPABILITY_NAMED_IAM"

printf "################## PROCESSING ${STACK_NAME^^} ###################"

# Cambio de profile para deployar en la otra cuenta
export AWS_PROFILE=$ROLE_TO_BE_ASSUME_PROFILE
IsAlreadyDeployed=$(export AWS_PROFILE=shared_prod_cs && export AWS_REGION=us-east-1 && aws cloudformation list-stack-sets --status ACTIVE | grep StackSetName | grep "$STACK_NAME" || echo 1)


#CURRENTDIRECTORY=$(pwd)
cd $2
TEMPLATEDIRECTORY=$(pwd)

if [ "$IsAlreadyDeployed" == "1" ]; then

    printf "\nNo esta deployado, deployaremos por primera vez\n"

    TEMPLATE_FILE="file://$TEMPLATEDIRECTORY/role_to_be_assume_ec2.yml"
    STACK_CREATION_RESPONSE=$(aws --region "$REGION" cloudformation create-stack-set --stack-set-name "$STACK_NAME" --template-body "$TEMPLATE_FILE" --parameters ParameterKey=ACCOUNTID,ParameterValue="$ACCOUNTID" --administration-role-arn "$SHARED_ACCOUNT_ARN" --execution-role-name AWSCloudFormationStackSetExecutionRole --profile "$ROLE_TO_BE_ASSUME_PROFILE" --capabilities "$CAPABILITIES"|| echo "1")
    STACK_INSTANCE_RESPONSE=$(aws cloudformation create-stack-instances --stack-set-name "$STACK_NAME" --accounts 839093138397 115428099475 723589903925 938057256881 371428146907 655295353951 839609294763 121117846942 557381136923 344060186652 009011124986 --regions "$REGION" --profile "$ROLE_TO_BE_ASSUME_PROFILE"|| echo "1")

    if [ "$STACK_INSTANCE_RESPONSE" == "1" ]; then
        printf "Failed to create/update stack!\n\n"
        exit 1
    fi

else
    printf "\nDeployando los roles correctos a ser asumidos\n"

    TEMPLATE_FILE="file://$TEMPLATEDIRECTORY/role_to_be_assume.yml"
    STACK_CREATION_RESPONSE=$(aws --region "$REGION" cloudformation update-stack-set --stack-set-name "$STACK_NAME" --template-body "$TEMPLATE_FILE" --parameters ParameterKey=ACCOUNTID,ParameterValue="$ACCOUNTID" --administration-role-arn "$SHARED_ACCOUNT_ARN" --execution-role-name AWSCloudFormationStackSetExecutionRole --profile "$ROLE_TO_BE_ASSUME_PROFILE" --capabilities "$CAPABILITIES"|| echo "1")
    STACK_INSTANCE_RESPONSE=$(aws cloudformation update-stack-instances --stack-set-name "$STACK_NAME" --accounts 839093138397 115428099475 723589903925 938057256881 371428146907 655295353951 839609294763 121117846942 557381136923 344060186652 009011124986 --regions "$REGION" --profile "$ROLE_TO_BE_ASSUME_PROFILE"|| echo "1")
fi

#cd $CURRENTDIRECTORY
#pwd

if [ "$STACK_CREATION_RESPONSE" == "1" ]; then
    printf "Failed to create/update stack!\n\n"
    exit 1
fi


# Vuelvo al profile anterior.
export AWS_PROFILE=$PROFILE

roletobeassume=$(find ../backend/resources/roletobeassume-deployment -type f -exec md5sum {} \; | sort -k 2 | md5sum)
echo $roletobeassume
result=$(aws s3 cp s3://cs-portal-stack-$REGION-$STAGE/rds/version-hashing/$STAGE/roletobeassume ./roletobeassume --sse aws:kms --acl private || touch ./roletobeassume)
LASTroletobeassume="`head -1 ./roletobeassume`"
echo $LASTroletobeassume

if [ "$LASTroletobeassume" != "$roletobeassume" ]; then
  echo "$roletobeassume" > ./roletobeassume
  aws s3 cp ./roletobeassume s3://cs-portal-stack-$REGION-$STAGE/rds/version-hashing/$STAGE/roletobeassume --sse aws:kms --acl private
  echo '{"type": "ROLETOBEASSUME", "version": "'${VERSION_ROLETOBEASSUME}'", "change": true}' >> ./changes
else
  echo '{"type": "ROLETOBEASSUME", "version": "'${VERSION_ROLETOBEASSUME}'", "change": false}' >> ./changes
fi

rm ./roletobeassume

echo -e "\n##################     END       #########################\n\n"
exit 0