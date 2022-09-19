if [ -z "$1" ]; then
    printf "* Error: missing stage, try: bash deploy.sh <stage> *\n"
    exit 1
fi
pwd
source "../backend/resources.sh" $1

ORANGE='\033[0;33m'
NC='\033[0m' # No Color

stack_deploy() {
    printf "\n#########################${ORANGE} Stack Deploy - Region $REGION ${NC}#############################\n"
    echo `date`
    
    touch ./changes

    bash deployBack.sh $1
    echo "DeployBack response: $?"
    [ $? -eq 0 ] || exit 1
    bash deployFront.sh $1 $2
    [ $? -eq 0 ] || exit 1
    if [ "$STAGE" == "dev" ] || [ "$STAGE" == "qa" ]; then
        if [[ $ISLOCAL == "local" ]]; then
            bash deployPipeline.sh $1
        fi
    fi

    echo `date`
    printf "#########################${ORANGE} END stack Deploy ${NC}#########################\n"
}

REGION=$(getResourceByName REGION)
PROFILE=$(getResourceByName PROFILE)

STAGE=$1
ISLOCAL=$2

if [[ $ISLOCAL == "local" ]]; then
    printf "${YELLOW}Launched locally${NC}\n"
    export AWS_PROFILE=$PROFILE && export AWS_REGION=$REGION
else
    export AWS_REGION=$REGION
fi

#stack_deploy $1 > ../logs/deploy.log 2>&1 &
stack_deploy $STAGE $REGION