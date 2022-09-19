if [ -z "$1" ]; then
    printf "* Error: missing stage, try: bash deploy.sh *\n"
    exit 1
fi

source "../backend/resources.sh" $1

STAGE=$1
REGION=$(getResourceByName REGION)
STACK_NAME="cs-$STAGE-membereventbus"
SHARED_ACCOUNT_ARN=$(getResourceByName SHARED_ACCOUNT_ARN)
PROFILE=$(getResourceByName PROFILE)
ROLE_TO_BE_ASSUME_PROFILE=$(getResourceByName ROLE_TO_BE_ASSUME_PROFILE)
CAPABILITIES="CAPABILITY_NAMED_IAM"

ARNROLENAME="cs-eventbus-MainEventBus"
ARNROLE_INJECTION="$(aws cloudformation list-exports --query 'Exports[?Name==`'$ARNROLENAME'`].Value')"
ARNROLE_INJECTION=$(echo "$ARNROLE_INJECTION" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')

printf "################## PROCESSING ${STACK_NAME^^} ###################"

# Cambio de profile para deployar en la otra cuenta
export AWS_PROFILE=$ROLE_TO_BE_ASSUME_PROFILE
IsAlreadyDeployed=$(export AWS_PROFILE=shared_prod_cs && export AWS_REGION=us-east-1 && aws cloudformation list-stack-sets --status ACTIVE | grep StackSetName | grep "$STACK_NAME" || echo 1)


#CURRENTDIRECTORY=$(pwd)
cd $2
TEMPLATEDIRECTORY=$(pwd)

TEMPLATE_FILE="file://$TEMPLATEDIRECTORY/member_eventbus.yml"

if [ "$IsAlreadyDeployed" == "1" ]; then

    printf "\nNo esta deployado, deployaremos por primera vez\n"
    STACK_CREATION_RESPONSE=$(aws --region "$REGION" cloudformation create-stack-set --stack-set-name "$STACK_NAME" --template-body "$TEMPLATE_FILE" --parameters ParameterKey=ARNROLE,ParameterValue="$ARNROLE_INJECTION" --administration-role-arn "$SHARED_ACCOUNT_ARN" --execution-role-name AWSCloudFormationStackSetExecutionRole --profile "$ROLE_TO_BE_ASSUME_PROFILE" --capabilities "$CAPABILITIES"|| echo "1")
    STACK_INSTANCE_RESPONSE=$(aws cloudformation create-stack-instances --stack-set-name "$STACK_NAME" --accounts 839093138397 115428099475 723589903925 938057256881 371428146907 655295353951 839609294763 121117846942 557381136923 344060186652 009011124986 --regions "$REGION" --profile "$ROLE_TO_BE_ASSUME_PROFILE"|| echo "1")

    if [ "$STACK_INSTANCE_RESPONSE" == "1" ]; then
        printf "Failed to create/update stack!\n\n"
        exit 1
    fi

else
    printf "\nDeployando la rule correcta\n"
    STACK_CREATION_RESPONSE=$(aws --region "$REGION" cloudformation update-stack-set --stack-set-name "$STACK_NAME" --template-body "$TEMPLATE_FILE" --parameters ParameterKey=ARNROLE,ParameterValue="$ARNROLE_INJECTION" --administration-role-arn "$SHARED_ACCOUNT_ARN" --execution-role-name AWSCloudFormationStackSetExecutionRole --profile "$ROLE_TO_BE_ASSUME_PROFILE" --capabilities "$CAPABILITIES"|| echo "1")
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

membereventbus=$(find ../backend/resources/membereventbus-deployment -type f -exec md5sum {} \; | sort -k 2 | md5sum)
echo $membereventbus
result=$(aws s3 cp s3://cs-portal-stack-$REGION-$STAGE/rds/version-hashing/$STAGE/membereventbus ./membereventbus --sse aws:kms --acl private || touch ./membereventbus)
LASTmembereventbus="`head -1 ./membereventbus`"
echo $LASTmembereventbus

if [ "$LASTmembereventbus" != "$membereventbus" ]; then
  echo "$membereventbus" > ./membereventbus
  aws s3 cp ./membereventbus s3://cs-portal-stack-$REGION-$STAGE/rds/version-hashing/$STAGE/membereventbus --sse aws:kms --acl private
  echo '{"type": "MEMBEREVENTBUS", "version": "'${VERSION_MEMBEREVENTBUS}'", "change": true}' >> ./changes
else
  echo '{"type": "MEMBEREVENTBUS", "version": "'${VERSION_MEMBEREVENTBUS}'", "change": false}' >> ./changes
fi

rm ./membereventbus

echo -e "\n##################     END       #########################\n\n"
exit 0