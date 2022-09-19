#!/bin/bash
set -e

if [ -z "$1" ]; then
    printf "* Error: missing stage, try: bash deploy.sh <stage> *\n"
    exit 1
fi

source "../backend/resources.sh" $1 #STAGE

# Variables
STAGE=$1
REGION=$(getResourceByName REGION)
SERVICE_NAME=$(getResourceByName SERVICE_NAME)
SES_EMAIL=$(getResourceByName SES_EMAIL)
S3_BUCKET_NAME=$(getResourceByName SERVICE_NAME)"-stack-"$REGION"-"$STAGE
PROFILE=$(getResourceByName PROFILE)
CLOUDFRONT_PROFILE=$(getResourceByName CLOUDFRONT_PROFILE)
AWS_ACCOUNT_ID=$(getResourceByName AWS_ACCOUNT_ID)
echo "PROFILE: $PROFILE"
#### VERIFICATION - START

VERIFICATION_RESPONSE=$(aws ses get-identity-verification-attributes --identities $SES_EMAIL)
echo -e "\n"
if echo "$VERIFICATION_RESPONSE" | grep -q "Success"; then
  printf "${GREEN}Email verificado!${NC}";
else
  printf "${RED}Email NO VERIFICADO => Se enviará un email a $SES_EMAIL, por favor revisar la casilla y confirmar.${NC}\n";
  echo $(aws ses verify-email-identity --email-address $SES_EMAIL)
  exit 1
fi
echo -e "\n"
##### VERIFICATION - END


##### DEPLOY EACH RESOURCE - START

declare -a LISTA_RECURSOS=( "../backend/resources/bucket-deployment" \
          "../backend/resources/cloudfront-deployment" \
          "../backend/resources/cognito-deployment" \
          "../backend/resources/rds-deployment" \
          "../backend/resources/role-to-be-assume-deployment" \
          "../backend/resources/main-eventbus-deployment" \
          "../backend/resources/member-eventbus-deployment" \
)

for key in "${!LISTA_RECURSOS[@]}"; do
    RESOURCE2DEPLOY=${LISTA_RECURSOS[$key]}
    echo -e "\nDEPLOYING $RESOURCE2DEPLOY"
    
    bash $RESOURCE2DEPLOY/deploy.sh $STAGE $RESOURCE2DEPLOY
    
    [ $? -eq 0 ] || exit 1
done

##### DEPLOY EACH RESOURCE - END


##### GET EXPORT VARIABLES FROM RESOURCES - START

S3_IDENTITYPROVIDER="cs-$REGION-$STAGE-ssos3-s3adsso"
COGNITOUSERPOOL="cs-$STAGE-cognito-CognitoUserPool"
COGNITOUSERPOOLCLIENT="cs-$STAGE-cognito-CognitoUserPoolClient"
COGNITOUSERPOOLCLIENTSSO="cs-$STAGE-cognito-CognitoUserPoolClientSSO"
COGNITOUSERPOOLDOMAIN="cs-$STAGE-cognito-UserPoolDomain"
SG="cs-rds-SGRDS"
RDSINSTANCE="cs-rds-EndPoint"
if [ "$STAGE" == "prod" ] || [ "$STAGE" == "cicd" ] || [ "$STAGE" == "cicdprod" ]; then
    VPC="cs-rds-VPC"
    PUBLICSUBNET="cs-rds-PublicSubnet"
    PRIVATESUBNET1="cs-rds-PrivateSubnet1"
    PRIVATESUBNET2="cs-rds-PrivateSubnet2"
    PRIVATESUBNET3="cs-rds-PrivateSubnet3"
fi

# Cambio de cuenta para obtener el export hecho previamente
export AWS_PROFILE=$CLOUDFRONT_PROFILE

ALLOWED_ORIGINS_URL="cs-$STAGE-cloudfront-CloudFrontDomain"
ALLOWED_ORIGINS_URL_FOR_INJECTION="$(aws cloudformation list-exports --query 'Exports[?Name==`'$ALLOWED_ORIGINS_URL'`].Value')"
ALLOWED_ORIGINS_URL_FOR_INJECTION=$(echo "$ALLOWED_ORIGINS_URL_FOR_INJECTION" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')
ALLOWED_ORIGINS_URL_FOR_INJECTION="https://$ALLOWED_ORIGINS_URL_FOR_INJECTION"

# Vuelvo a la cuenta principal
export AWS_PROFILE=$PROFILE

ALLOWED_ORIGINS_URL_ROUTE53=$(getResourceByName ALLOWED_ORIGINS_URL)
ALLOWED_ORIGINS_URL_FOR_INJECTION+=",$ALLOWED_ORIGINS_URL_ROUTE53"

# GETS SOME EXPORTS VARIABLES FROM AWS CLOUDFORMATION

S3_IDENTITYPROVIDER_FOR_INJECTION="$(aws cloudformation list-exports --query 'Exports[?Name==`'$S3_IDENTITYPROVIDER'`].Value')"
COGNITOUSERPOOL_FOR_INJECTION="$(aws cloudformation list-exports --query 'Exports[?Name==`'$COGNITOUSERPOOL'`].Value')"
COGNITOUSERPOOLCLIENT_FOR_INJECTION="$(aws cloudformation list-exports --query 'Exports[?Name==`'$COGNITOUSERPOOLCLIENT'`].Value')"
COGNITOUSERPOOLCLIENTSSO_FOR_INJECTION="$(aws cloudformation list-exports --query 'Exports[?Name==`'$COGNITOUSERPOOLCLIENTSSO'`].Value')"
COGNITOUSERPOOLDOMAIN_FOR_INJECTION="$(aws cloudformation list-exports --query 'Exports[?Name==`'$COGNITOUSERPOOLDOMAIN'`].Value')"
RDSINSTANCE_FOR_INJECTION="$(aws cloudformation list-exports --query 'Exports[?Name==`'$RDSINSTANCE'`].Value')"
SG_FOR_INJECTION="$(aws cloudformation list-exports --query 'Exports[?Name==`'$SG'`].Value')"
if [ "$STAGE" == "prod" ] || [ "$STAGE" == "cicd" ] || [ "$STAGE" == "cicdprod" ]; then
    VPC_FOR_INJECTION="$(aws cloudformation list-exports --query 'Exports[?Name==`'$VPC'`].Value')"
    PUBLICSUBNET_FOR_INJECTION="$(aws cloudformation list-exports --query 'Exports[?Name==`'$PUBLICSUBNET'`].Value')"
    PRIVATESUBNET1_FOR_INJECTION="$(aws cloudformation list-exports --query 'Exports[?Name==`'$PRIVATESUBNET1'`].Value')"
    PRIVATESUBNET2_FOR_INJECTION="$(aws cloudformation list-exports --query 'Exports[?Name==`'$PRIVATESUBNET2'`].Value')"
    PRIVATESUBNET3_FOR_INJECTION="$(aws cloudformation list-exports --query 'Exports[?Name==`'$PRIVATESUBNET3'`].Value')"
fi


CONFIG_RECORDER_EXISTS_FOR_INJECTION="$(aws configservice describe-configuration-recorders --query 'ConfigurationRecorders[].name')"
DELIVERY_CHANNEL_EXISTS_FOR_INJECTION="$(aws configservice describe-delivery-channels --query 'DeliveryChannels[].name')"

# REMOVES SOME CHARACTERS TO HAVE A CLEAN VALUE
S3_IDENTITYPROVIDER_FOR_INJECTION=$(echo "$S3_IDENTITYPROVIDER_FOR_INJECTION" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')
COGNITOUSERPOOL_FOR_INJECTION=$(echo "$COGNITOUSERPOOL_FOR_INJECTION" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')
COGNITOUSERPOOLCLIENT_FOR_INJECTION=$(echo "$COGNITOUSERPOOLCLIENT_FOR_INJECTION" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')
COGNITOUSERPOOLCLIENTSSO_FOR_INJECTION=$(echo "$COGNITOUSERPOOLCLIENTSSO_FOR_INJECTION" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')
COGNITOUSERPOOLDOMAIN_FOR_INJECTION=$(echo "$COGNITOUSERPOOLDOMAIN_FOR_INJECTION" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')
RDSINSTANCE_FOR_INJECTION=$(echo "$RDSINSTANCE_FOR_INJECTION" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')
SG_FOR_INJECTION=$(echo "$SG_FOR_INJECTION" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')
if [ "$STAGE" == "prod" ] || [ "$STAGE" == "cicd" ] || [ "$STAGE" == "cicdprod" ]; then
    VPC_FOR_INJECTION=$(echo "$VPC_FOR_INJECTION" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')
    PUBLICSUBNET_FOR_INJECTION=$(echo "$PUBLICSUBNET_FOR_INJECTION" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')
    PRIVATESUBNET1_FOR_INJECTION=$(echo "$PRIVATESUBNET1_FOR_INJECTION" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')
    PRIVATESUBNET2_FOR_INJECTION=$(echo "$PRIVATESUBNET2_FOR_INJECTION" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')
    PRIVATESUBNET3_FOR_INJECTION=$(echo "$PRIVATESUBNET3_FOR_INJECTION" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')
fi
CLOUD_FRONT_DID_FOR_INJECTION=$(echo "$CLOUD_FRONT_DID_FOR_INJECTION" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')


COGNITOUSERPOOLSECRETSSO_FOR_INJECTION="$(aws cognito-idp describe-user-pool-client --user-pool-id "$COGNITOUSERPOOL_FOR_INJECTION" --region "$REGION" --client-id "$COGNITOUSERPOOLCLIENTSSO_FOR_INJECTION" --query 'UserPoolClient.ClientSecret' --output text)"
COGNITOUSERPOOLSECRETSSO_FOR_INJECTION="$(aws cognito-idp describe-user-pool-client --user-pool-id "$COGNITOUSERPOOL_FOR_INJECTION" --region "$REGION" --client-id "$COGNITOUSERPOOLCLIENTSSO_FOR_INJECTION" --query 'UserPoolClient.ClientSecret' --output text)"
COGNITOUSERPOOLSECRETSSO_FOR_INJECTION=$(echo "$COGNITOUSERPOOLSECRETSSO_FOR_INJECTION" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')


CONFIG_RECORDER_EXISTS_FOR_INJECTION=$(echo "$CONFIG_RECORDER_EXISTS_FOR_INJECTION" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')
echo "CONFIG_RECORDER_EXISTS_FOR_INJECTION: $CONFIG_RECORDER_EXISTS_FOR_INJECTION"
#if [ "$CONFIG_RECORDER_EXISTS_FOR_INJECTION" == '[]' ] || [ $PROFILE == 'sandbox' ]; then
if [ "$CONFIG_RECORDER_EXISTS_FOR_INJECTION" == '[]' ]; then
  CONFIG_RECORDER_EXISTS_FOR_INJECTION=false
else
  CONFIG_RECORDER_EXISTS_FOR_INJECTION=true
fi
echo "CONFIG_RECORDER_EXISTS_FOR_INJECTION: $CONFIG_RECORDER_EXISTS_FOR_INJECTION"


DELIVERY_CHANNEL_EXISTS_FOR_INJECTION=$(echo "$DELIVERY_CHANNEL_EXISTS_FOR_INJECTION" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')
echo "DELIVERY_CHANNEL_EXISTS_FOR_INJECTION: $DELIVERY_CHANNEL_EXISTS_FOR_INJECTION"
#if [ "$DELIVERY_CHANNEL_EXISTS_FOR_INJECTION" == '[]' ] || [ $PROFILE == 'sandbox' ]; then
if [ "$DELIVERY_CHANNEL_EXISTS_FOR_INJECTION" == '[]' ]; then
  DELIVERY_CHANNEL_EXISTS_FOR_INJECTION=false
else
  DELIVERY_CHANNEL_EXISTS_FOR_INJECTION=true
fi
echo "DELIVERY_CHANNEL_EXISTS_FOR_INJECTION: $DELIVERY_CHANNEL_EXISTS_FOR_INJECTION"

##### GET EXPORT VARIABLES FROM RESOURCES - END


##### REPLACE EXPORT VARIABLES IN .env FILE - START

# ENVIRONMENT ARRAY COLLECTS ALL THE ENVIRONMENTAL VARIABLES TO BE PUT IN THE .env FILE THEN
declare -A back_environment
declare -A front_environment

# DECIDES WHICH .ENV USES, DEPENDS ON THE STAGE
if [[ "$1" != "" ]]; then
    back_env_file="../backend/.env.$1.temp"
    front_env_file="../frontend/.env.$1.temp"
else
    back_env_file="../backend/.env.temp"
    front_env_file="../frontend/.env.temp"
fi

echo -e "\nBackend file env: $back_env_file"
echo -e "Frontend file env: $front_env_file\n"

# COPIES EITHER .env.[stage] OR .env FILE TO .env.[stage].temp OR .env.temp
cp ../backend/.env.$1 $back_env_file
cp ../frontend/.env.$1 $front_env_file

echo $'\r' >> $back_env_file
echo $'\r' >> $front_env_file

# THIS FUNCTION INJECTS SPECIFIC VARIABLES (FROM ARRAY) INTO ENVIRONMENT ARRAY
inject_into_array() {
    ARRAY=( "MYSQL_HOST=$RDSINSTANCE_FOR_INJECTION"
        "USERPOOLID=$COGNITOUSERPOOL_FOR_INJECTION"
        "CLIENTID=$COGNITOUSERPOOLCLIENT_FOR_INJECTION"
        "CLIENTID_SSO=$COGNITOUSERPOOLCLIENTSSO_FOR_INJECTION"
        "SECRETID_SSO=$COGNITOUSERPOOLSECRETSSO_FOR_INJECTION"
        "AWS_DOMAIN=$COGNITOUSERPOOLDOMAIN_FOR_INJECTION"
        "S3_BUCKET_NAME=$S3_BUCKET_NAME"  
        "ALLOWED_ORIGINS_URL"=$ALLOWED_ORIGINS_URL_FOR_INJECTION 
        "CONFIG_RECORDER_EXISTS"=$CONFIG_RECORDER_EXISTS_FOR_INJECTION
        "DELIVERY_CHANNEL_EXISTS"=$DELIVERY_CHANNEL_EXISTS_FOR_INJECTION
        "S3_IDENTITY_PROVIDER"=$S3_IDENTITYPROVIDER_FOR_INJECTION
        "SG"=$SG_FOR_INJECTION)

    if [ "$STAGE" == "prod" ] || [ "$STAGE" == "cicd" ] || [ "$STAGE" == "cicdprod" ]; then
        ARRAY+=( "VPC=$VPC_FOR_INJECTION"
        "PUBLICSUBNET=$PUBLICSUBNET_FOR_INJECTION"
        "PRIVATESUBNET1=$PRIVATESUBNET1_FOR_INJECTION"
        "PRIVATESUBNET2=$PRIVATESUBNET2_FOR_INJECTION"
        "PRIVATESUBNET3=$PRIVATESUBNET3_FOR_INJECTION" )
    fi

    for variable in "${ARRAY[@]}" ; do
        KEY="${variable%%=*}"
        VALUE="${variable##*=}"
        
        if [[ "$1" == $KEY ]]; then
            FLAG_MODIFIED=1
            back_environment[$1]="$VALUE"
            printf "${YELLOW}Updating KEY: $1 - VALUE: $VALUE ${NC}\n"
        fi
    done
}


FLAG_MODIFIED=0
while IFS= read -r line
do
    if [[ "$line" != "" ]]; then
        # LIKE SPLIT FUNCTION, = IS THE SEPARATOR. GENERATES THE ARRAY => [KEY,VALUE]
        key=$(echo $line | cut -d'=' -f1)
        value=$(echo $line | cut -d'=' -f2)
        
        # CALL inject_into_array FUNCTION
        inject_into_array $key

        # IF THE VARIABLE SHOULD NOT BE REPLACED THEN COPY IT DIRECTLY
        if [[ $FLAG_MODIFIED == 0 && "$line" != $'\r' ]]; then
            back_environment[$key]=$value
        fi
        FLAG_MODIFIED=0
    fi
done < "$back_env_file"

echo -e "\n"

# DELETES FILE CONTENT
> $back_env_file

# TRANSFERS EACH KEY VALUE PAIR FROM ENVIRONMENT ARRAY TO .env FILE
for key in "${!back_environment[@]}"; do
    echo "$key=${back_environment[$key]}" >> $back_env_file
done

##### REPLACE EXPORT VARIABLES IN .env FILE - END

back_deploy() {
    printf "######################### ${GREEN} BACKEND SERVERLESS DEPLOY ${NC} #############################\n"
    echo `date`
    cp $back_env_file ../backend/.env
    cat ../backend/.env
    pwd
    cd ..

    VERSION_BACKEND=$(sed -nE 's/^\s*"version": "(.*?)",$/\1/p' backend/package.json)
    hashbackend=$(find ./backend -type f -exec md5sum {} \; | sort -k 2 | md5sum)
    echo $hashbackend
    result=$(aws s3 cp s3://cs-portal-stack-$REGION-$STAGE/rds/version-hashing/$STAGE/hashbackend ./hashbackend --acl private --sse aws:kms || touch ./hashbackend)
    LASThashbackend="`head -1 ./hashbackend`"
    echo $LASThashbackend

    cd backend
    if [ "$LASThashbackend" != "$hashbackend" ]; then
        if [ -d "node_modules" ]; then
            rm -Rf "node_modules"
        fi
        npm i
        pwd
        
        sls deploy --stage "$1" --env "env"

        sls invoke -f first-user --stage "$1" --env "env"
        sls invoke -f create-tables --stage "$1" --env "env"
        sleep 5
        sls invoke -f triggeredFromEventBridge --stage "$1" --env "env" --data '{ "paramsLimit": "20" }'
        sls invoke -f create-realms --stage "$1" --env "env"
        ################################################################
        # Buscando SQS's para agregarlas como target del Main EventBus

        ARN_EVENTBUS="arn:aws:events:$REGION:$AWS_ACCOUNT_ID:event-bus/cs-portal-main-eventbus"

        rawQueueList=$(aws sqs list-queues --queue-name-prefix $SERVICE_NAME)

        intermediateQueueList=$(echo "$rawQueueList" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')

        replace=""
        substringToReplace="QueueUrls:"
        intermediateQueueList=$(echo "${intermediateQueueList/QueueUrls:/"$replace"}")
        intermediateQueueList=$(echo $intermediateQueueList | sed -r 's/[{}]+//g')

        queues+=$(echo $intermediateQueueList | tr "," "\n")

        for queue in ${queues[@]}; do
            if [[ "$queue" == *"eventbus-notification-queue"* ]]; then
                # Agregamos al MAIN EVENT-BUS !!
                echo $queue
                stringQueue=(`echo $queue | sed 's/\//\n/g'`)
                queueName=${stringQueue[3]}
                arnSqs="arn:aws:sqs:$REGION:$AWS_ACCOUNT_ID:$queueName"
                if [[ "$queueName" == *"-dev-"* ]]; then
                    id="1"
                else
                    if [[ "$queueName" == *"-qa-"* || "$queueName" == *"-test-"* ]]; then
                        id="2"
                    else
                        if [[ "$queueName" == *"-prod-"* ]]; then
                            id="3"
                        fi
                        if [[ "$queueName" == *"-cicd-"* ]]; then
                            id="3"
                        fi
                        if [[ "$queueName" == *"-cicdprod-"* ]]; then
                            id="3"
                        fi
                    fi
                fi
                aws events put-targets --rule trigger-to-sqs --event-bus-name $ARN_EVENTBUS --targets "Id"="$id","Arn"="$arnSqs"
            fi
        done
        ###############################################################

        echo "$hashbackend" > ./hashbackend
        aws s3 cp ./hashbackend s3://cs-portal-stack-$REGION-$STAGE/rds/version-hashing/$STAGE/hashbackend --acl private --sse aws:kms
        echo ',{"type": "BACKEND", "version": "'${VERSION_BACKEND}'", "change": true}' >> ../deployment/changes
    else
        echo "Nothing to do"
        echo ',{"type": "BACKEND", "version": "'${VERSION_BACKEND}'", "change": false}' >> ../deployment/changes
    fi
    
    rm ../hashbackend

    echo `date`
    printf "######################### ${GREEN} END BACKEND SERVERLESS DEPLOY ${NC} ##########################\n"
}

replace_api_url(){
    
    pwd
    echo "front: $front_env_file"

    while IFS= read -r line
    do
        if [[ "$line" != "" ]]; then
            # LIKE SPLIT FUNCTION, = IS THE SEPARATOR. GENERATES THE ARRAY => [KEY,VALUE]
            key=$(echo $line | cut -d'=' -f1)
            value=$(echo $line | cut -d'=' -f2)

            # IF THE VARIABLE SHOULD NOT BE REPLACED THEN COPY IT DIRECTLY
            if [[ "$line" != $'\r' ]]; then
                if [[ "$key" == "REACT_APP_APIURL" ]]; then
                    front_environment[$key]=$REACT_APP_APIURL_FOR_INJECTION
                    echo "Injecting ApiGateway Domain in REACT_APP_APIURL_FOR_INJECTION"
                elif [[ "$key" == "REACT_APP_CLIENT_ID" ]]; then
                    front_environment[$key]=$COGNITOUSERPOOLCLIENTSSO_FOR_INJECTION
                    echo "Injecting ApiGateway Domain in COGNITOUSERPOOLCLIENTSSO_FOR_INJECTION"
                elif [[ "$key" == "REACT_APP_DOMAIN_NAME" ]]; then
                    front_environment[$key]=$COGNITOUSERPOOLDOMAIN_FOR_INJECTION
                    echo "Injecting ApiGateway Domain in COGNITOUSERPOOLDOMAIN_FOR_INJECTION"
                elif [[ "$key" == "REACT_APP_REGION" ]]; then
                    front_environment[$key]=$REGION
                    echo "Injecting ApiGateway Domain in REGION"
                elif [[ "$key" == "REACT_APP_REDIRECT_URL" ]]; then
                    IFS=','
                    read -a url_arr <<< "$ALLOWED_ORIGINS_URL_FOR_INJECTION"
                    front_environment[$key]=${url_arr[1]}
                    echo "Injecting ApiGateway Domain in ALLOWED_ORIGINS_URL_FOR_INJECTION"                
                else
                    front_environment[$key]=$value
                fi
            fi
        fi
    done < "$front_env_file"

    # DELETES FILE CONTENT
    > $front_env_file

    # TRANSFERS EACH KEY VALUE PAIR FROM ENVIRONMENT ARRAY TO .env FILE
    for key in "${!front_environment[@]}"; do
        echo "$key=${front_environment[$key]}" >> $front_env_file
    done
}

mkdir -p ../backend/logs

back_deploy $1 $REGION #> ../backend/logs/deploy.log 2>&1 &

SERVICEENDPOINT="sls-$SERVICE_NAME-$STAGE-ServiceEndpoint"
REACT_APP_APIURL_FOR_INJECTION="$(aws cloudformation list-exports --query 'Exports[?Name==`'$SERVICEENDPOINT'`].Value')"
REACT_APP_APIURL_FOR_INJECTION=$(echo "$REACT_APP_APIURL_FOR_INJECTION" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')

replace_api_url
