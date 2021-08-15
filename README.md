# sqs-event-publisher

Currently this project utilizes a Node.js AWS Lambda function with API Gateway 
trigger to accept HTTP requests containing a json message.  The function inspects 
the headers and payload contents in order to route the messages to AWS SQS queues.

## Contents

- [Quick Start](#quick-start)
- [Package Structure] (#package-structure)
- [Unit Tests](#unit-tests)
- [License](#license)

Package structure:

  |--/js            : JavaScript source code
     |--__tests__   : Unit tests
  |--/tf            : Main Terraform configuration
     |--/aws        : AWS specific Terraform config
     |--/github     : GitHub specific Terraform config
  
Terraform is used to provision and maintain all necessary cloud infrastructure.


## Quick Start

  1) Configure AWS CLI credentials
  
```sh
      $ aws configure --profile dev
```
      (or see tf/main.tf for further details)
  
  2) Deploy Application (including Infrastructure & Code)
```sh
$ cd tf
$ terraform init
$ terraform plan
$ terraform apply
```

## Tests

```sh
$ jest
```

## License

The Unlicense