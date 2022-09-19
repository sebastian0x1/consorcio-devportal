if [ -z "$1" ]; then
    printf "* Error: missing stage, try: bash deploy.sh <stage> *\n"
    exit 1
fi

source "../backend/resources.sh" $1

ORANGE='\033[0;33m'
NC='\033[0m' # No Color

pipeline_deploy() {
    printf "\n#########################${ORANGE} Pipeline Deploy - Region $REGION ${NC}#############################\n"
    echo `date`

    STACK_NAME="cs-pipeline-$1-$REGION"
    CAPABILITIES="CAPABILITY_IAM"

    if [ "$1" == 'dev' ]; then
        current_environment="develop"
    else
        if [ "$STAGE" == "prod" ] || [ "$STAGE" == "cicd" ] || [ "$STAGE" == "cicdprod" ]; then
            current_environment="main"
        else
            if [ "$1" == 'qa' ]; then
                current_environment="qa"
            fi
        fi
    fi

    GITHUBOWNER="cloudhesive"
    GITHUBREPOSITORY="consorcio-seguros"
    GITHUBBRANCH="$current_environment"
    S3_KEY_ARN=$(getResourceByName S3_KEY_ARN)
    
    PARAMS="\
        GitHubOwner="$GITHUBOWNER" \
        GitHubRepository="$GITHUBREPOSITORY" \
        GitHubBranch="$GITHUBBRANCH" \
        Stage="$1" \
        BucketKey="$S3_KEY_ARN" \
    "

    echo "$PARAMS"

    TEMPLATE_FILE="pipeline.yml"

    echo "$REGION - $1"

    aws --region "$REGION" cloudformation deploy --stack-name "$STACK_NAME" --template-file "$TEMPLATE_FILE" --parameter-overrides ${PARAMS[@]} --capabilities "$CAPABILITIES" --no-fail-on-empty-changeset

    echo `date`
    printf "#########################${ORANGE} END Pipeline Deploy ${NC}#########################\n"
}

REGION=$(getResourceByName REGION)

##export AWS_PROFILE=sandbox_consorcio && export AWS_REGION=$REGION

pipeline_deploy $1 $REGION
