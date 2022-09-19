#!/bin/bash
set -e

RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

STAGE=$1

# setup
declare -A resources
resources["STAGE"]=STAGE

if [[ "$1" != "" ]]; then
    env_file="../backend/.env.$1"
else
    env_file="../backend/.env"
fi

env=$(cat < $env_file)

for allElements in "$env"; do
    for element in $(echo $allElements); do
        arrEnv=(${element//=/ })
        resources[${arrEnv[0]}]=${arrEnv[1]}
    done
done

# Check if key exist in dictionary
function existInDictionary(){
    target="$1"

    for key in "${!resources[@]}";do
        if [[ "$key" == "$target" ]];then
            echo "ok"
            return 
        fi
    done
    echo "bad"
    return 
}

## Retrieve variable (argument: key of env file)
getResourceByName () {

    targetValue="$(existInDictionary $1)"
    if [ $targetValue == "bad" ];then
        echo "key=$1 does not exists in a dictionary"
    else
        resourceName=${resources["$1"]}
        echo $resourceName
    fi

}
# Just get region in dictionary
getRegion () {
    echo REGION=$resources["REGION"]
    resources["REGION"]
}
