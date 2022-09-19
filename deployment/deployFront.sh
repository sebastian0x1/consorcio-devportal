source "../backend/resources.sh" ""

SERVICE_NAME=$(getResourceByName SERVICE_NAME)
STAGE=$1
REGION=$(getResourceByName REGION)
S3_FRONT="$SERVICE_NAME-fronts3-$1-$2"
INBOUND_ACCOUNT_PROFILE=$(getResourceByName CLOUDFRONT_PROFILE)
PROFILE=$(getResourceByName PROFILE)

frontend_deploy() {
    printf "######################### ${GREEN} FRONTEND DEPLOY ${NC} #############################\n"
    echo `date`
    
    pwd
    cd ..
    
    VERSION_FRONTEND=$(sed -nE 's/^\s*"version": "(.*?)",$/\1/p' frontend/package.json)
    hashfrontend=$(find ./frontend -type f -exec md5sum {} \; | sort -k 2 | md5sum)
    echo $hashfrontend
    result=$(aws s3 cp s3://cs-portal-stack-$REGION-$STAGE/rds/version-hashing/$STAGE/hashfrontend ./hashfrontend --acl private --sse aws:kms || touch ./hashfrontend)
    LASThashfrontend="`head -1 ./hashfrontend`"
    echo $LASThashfrontend

    cd frontend
    if [ "$LASThashfrontend" != "$hashfrontend" ]; then
        npm i
        cp .env.$1.temp .env
    
        #npm run build .env && npm run-script upload-$1 && npm run-script cdn-$1
        npm run build .env && aws s3 sync ./build s3://"$S3_FRONT" --acl private --delete 
        printf "Creating Cloudfront Invalidation\n"
        #Move to inbound account to get export name, and create invalidation in cloudfront.
        export AWS_PROFILE=$INBOUND_ACCOUNT_PROFILE
        CLOUDFRONT_EXPORT_NAME="cs-$STAGE-cloudfront-CloudFrontDistributionID"
        CLOUDFRONT_DISTRIBUTION_ID="$(aws cloudformation list-exports --query 'Exports[?Name==`'$CLOUDFRONT_EXPORT_NAME'`].Value')"
        CLOUDFRONT_DISTRIBUTION_ID=$(echo "$CLOUDFRONT_DISTRIBUTION_ID" | sed ':a;N;$!ba;s/\n//g; s/[][ "\\]//g')
        
        aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths '/*' --region $REGION --output text
        # Move to default account (ci/cd)
        export AWS_PROFILE=$PROFILE

        echo "$hashfrontend" > ./hashfrontend
        
        aws s3 cp ./hashfrontend s3://cs-portal-stack-$REGION-$STAGE/rds/version-hashing/$STAGE/hashfrontend --acl private --sse aws:kms
        echo ',{"type": "FRONTEND", "version": "'${VERSION_FRONTEND}'", "change": true}' >> ../deployment/changes
    else
        echo "Nothing to do"
        echo ',{"type": "FRONTEND", "version": "'${VERSION_FRONTEND}'", "change": false}' >> ../deployment/changes
    fi
    
    rm ../hashfrontend
    
    printf "######################### ${GREEN} END FRONTEND DEPLOY ${NC} #########################\n"
}

#frontend_deploy $1 > logs/front.log 2>&1 &
frontend_deploy $1