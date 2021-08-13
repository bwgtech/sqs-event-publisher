terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "3.53.0"
    }
    /*
    github = {
      source  = "integrations/github"
      version = "4.13.0"
    }
	*/
  }
}

variable "appname" {
  type = string
  default = "event-publisher-1"
}

provider "aws" {
  profile = "default"
  region  = "us-east-1"
  // TODO: Credentials provider as needed
}

variable "iam" {
  type = string
  default = "${var.appname}-iam-role"
}

resource "aws_iam_role" ${var.iam} {
  name               = var.iam
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "../app/index.js"
  output_path = "./lambda_zip.zip"
}

resource "aws_lambda_function" "sqs-event-publisher-1" {
  filename      = "lambda_zip.zip"
  function_name = "sqs-event-publisher-1"
  role          = aws_iam_role.var.iam.arn
  handler       = "index.js"

  source_code_hash = "${data.archive_file.lambda_zip.output_base64sha256}"

  runtime = "nodejs14.x"

  environment {
    variables = {
      foo = "bar"
    }
  }
}

//provider "github" { }