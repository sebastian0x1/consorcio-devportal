######################### STACK DEPLOY #############################

En caso de querer ejecutar back y front, se debe realizar mediante "deployStack.sh" ejectando la siguiente linea:

bash deployStack.sh [Stage]

####################################################################

#########################BACKEND SERVERLESS DEPLOY#############################

Se debe realizar la ejecucion de "deployback.sh" con el siguiente comando:

AWS_PROFILE= [Profile] AWS_REGION=[Region] bash deployStack.sh [Stage] [Region]

En la ejecucion realiza el create or update de recursos en los siguentes pasos:

---

## 1 - bucket-deployment

PATH => backend/resources/bucket-deployment

EJECUCION =>
Se ejecuta deploy.sh el cual realiza un deploy del template "SourceBuket.yaml".
En el se crea un bucket S3 el cual almacenará el .pem y además los archivos del deployment.

Params de deploy.sh:
STAGE => ambiente en el cual se realizara el deploy.
PATH => path donde encontrará el .yaml

---

---

## 2 - cognito-deployment

PATH => backend/resources/cognito-deployment

EJECUCION =>
Se ejecuta deploy.sh el cual realiza un deploy del template "cognito-user-pool.yaml".
Se realiza un deploy de CognitoUserPool junto con CognitoUserPoolClient.

Params de deploy.sh:
STAGE => ambiente en el cual se realizara el deploy.
PATH => path donde encontrará el .yaml

---

---

## 3 - rds-deployment

PATH => backend/resources/rds-deployment

EJECUCION =>
Se ejecuta deploy.sh el cual realiza un deploy del template "rds.yaml".
Se realiza el deploy del RDS(Relational Database Service), el bastion, una VPC y sus respectivas subnets.

Params de deploy.sh:
STAGE => ambiente en el cual se realizara el deploy.
PATH => path donde encontrará el .yaml

---

---

## 4 - Stack serverless

EJECUCION =>
Se realiza el deploy del template serverless.yaml.
En él se realiza el deploy de Api Gateway, Lambdas, bucket S3 para hostear el frontend, bucket S3 para el almacenamiento de los
archivos swagger, Config y sus particularidades, Cloudfront.

---

###################################################################################

######################### FrontEnd ###################################

En caso de querer ejecutar front, se debe realizar mediante "deployfront.sh" ejectando la siguiente linea:

bash deployfront.sh [Stage] [Region]
