if [ -z "$1" ]; then
    printf "* Error: missing stage, try: bash deploy.sh *\n"
    exit 1
fi

source "../backend/resources.sh" $1 #STAGE

STAGE=$1
STACK_NAME="cs-eventbus"
REGION=$(getResourceByName REGION)
SERVICE_NAME=$(getResourceByName SERVICE_NAME)
PRINCIPAL_ORG_ID=$(getResourceByName PRINCIPAL_ORG_ID)
echo $REGION
echo $SERVICE_NAME
echo $PRINCIPAL_ORG_ID
CAPABILITIES="CAPABILITY_IAM"

printf "################## ${GREEN}PROCESSING ${STACK_NAME^^} ${NC} ###################"

PARAMS="\
 PrincipalOrgId=$PRINCIPAL_ORG_ID \
 Stage=$STAGE \
"

TEMPLATE_FILE="$2/main-event-bus.yaml"

#VERSION_EVENTBUS=$(sed -nE 's/^\s*"version": "(.*?)",$/\1/p' ../backend/package.json)

STACK_CREATION_RESPONSE=$(aws --region "$REGION" cloudformation deploy --stack-name "$STACK_NAME" --template-file "$TEMPLATE_FILE" --parameter-overrides ${PARAMS[@]} --capabilities "$CAPABILITIES" --no-fail-on-empty-changeset || echo "1")

echo "$STACK_CREATION_RESPONSE"
if [ "$STACK_CREATION_RESPONSE" == "1" ]; then
    printf "${RED}Failed to create/update stack!${NC}\n\n"
    exit 1
fi

#aws events put-permission --cli-input-yaml file://eventpolicy.yaml

echo -e "\n##################  ${GREEN}     END   ${NC}   #########################\n\n"
exit 0

# export AWS_PROFILE=sandbox_consorcio && export AWS_REGION=us-east-1 && bash deploy.sh "dev" "../backend/resources/main-eventbus-deployment"