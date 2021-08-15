# sqs-event-publisher

Currently this project utilizes a Node.js AWS Lambda function with API Gateway 
trigger to accept HTTP requests containing any json message.  The function 
inspects the headers and payload contents in order to route the messages to the 
desired AWS SQS queues.

Terraform is used to provision and maintain all necessary cloud infrastructure.  
AWS was chosen initially based on the requirements, but the package structure 
is intended to facilitate the addition or substitution of cloud providers.

## Contents

- [Quick Start](#quick-start)
- [Package Structure] (#package-structure)
- [Unit Tests](#unit-tests)
- [License](#license)

## Quick Start

  1. Configure AWS CLI credentials
```sh
$ aws configure --profile dev
```

*see [Amazon CLI Docs](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html) 
for further details*
  
  2. Deploy Application (including Infrastructure & Code)
```sh
$ cd tf
$ terraform init
$ terraform plan
$ terraform apply
```

## Package structure:

```
sqs-event-publisher
|-- js/                   : JavaScript source code
    |-- __tests__         : JavaScript unit tests
|--/tf                    : Main Terraform configuration
    |-- aws/              : AWS specific Terraform config
    |-- github/           : GitHub specific Terraform config
```

## Unit Tests

```sh
$ jest
```

## License

The Unlicense