/**
 *  aws.tf
 *
 *    This configuration performs the following AWS operations:
 *      1. Retrieve Account Id for the caller
 *      2. Configure IAM Role for Lambda
 *      2. Configure CloudWatch Log Access Policy & assign to the Lambda Role
 *      3. Configure SQS Access Policy & assign to the Lambda Role
 *      5. Configure Zip Archive of source (JavaScript)
 *      6. Configure Lambda Function
 *      7. Configure API Gateway
 *      8. Configure API Gateway Logging
 *      9. Configure a Stage for API Gateway
 *      8. Link and Permission API Gateway as Lambda Function Trigger
 *      9. Export endpoint url to be used for other Infra operations
 *
 *    NOTE: AWS credentials should already be configured at this point, 
 *          see ../main.tf for further instructions.
 *
 */

terraform {
  required_providers {
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.2.0"
    }
	aws = {
      source  = "hashicorp/aws"
      version = "3.53.0"
    }
  }
}

data "aws_caller_identity" "current" {}

/**
 *  Configurable Values
 */

locals {
  AppName       = "SQSEventPublisher"
  AwsAccountId  = data.aws_caller_identity.current.account_id
  AwsProfile    = "dev"
  AwsRegion     = "us-east-1"
  JsCodeDir     = "${path.module}/../../app"
  LambdaPkgName = "lambda_pkg.zip"
}

provider "aws" {
  profile = local.AwsProfile
  region  = local.AwsRegion
}

/**
 *  Lambda Function
 */

resource "aws_iam_role" "lambda_iam_role" {
  name               = "${local.AppName}-IAMRole"
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

resource "aws_iam_policy" "lambda_iam_log_policy" {
  name = "${local.AppName}-LogAccessPolicy"
  path = "/"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:${local.AwsAccountId}:*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_log_access" {
  role       = aws_iam_role.lambda_iam_role.name
  policy_arn = aws_iam_policy.lambda_iam_log_policy.arn
}

resource "aws_iam_policy" "lambda_iam_sqs_policy" {
  name = "${local.AppName}-SQSAccessPolicy"
  path = "/"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
	{
      "Action": [
        "sqs:GetQueueUrl",
        "sqs:SendMessage",
        "sqs:CreateQueue"
      ],
      "Resource": "arn:aws:sqs:*:${local.AwsAccountId}:*",
	  "Effect": "Allow"
	}
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_sqs_access" {
  role       = aws_iam_role.lambda_iam_role.name
  policy_arn = aws_iam_policy.lambda_iam_sqs_policy.arn
}

data "archive_file" "sqs-event-publisher" {
  type        = "zip"
  //source_dir  = local.JsCodeDir
  source_file = "${local.JsCodeDir}/index.js"
  output_path = "./${local.LambdaPkgName}"
}

resource "aws_lambda_function" "sqs-event-publisher" {
  function_name    = local.AppName
  role             = aws_iam_role.lambda_iam_role.arn
  runtime          = "nodejs14.x"
  handler          = "index.js"
  filename         = local.LambdaPkgName
  source_code_hash = data.archive_file.sqs-event-publisher.output_base64sha256
}

/**
 *  API Gateway Trigger for Lambda Function
 */

resource "aws_apigatewayv2_api" "sqs-event-publisher" {
  name          = "${local.AppName}-APIGateway"
  protocol_type = "HTTP"
}

resource "aws_cloudwatch_log_group" "sqs-event-publisher" {
  name              = "/aws/api_gw/${aws_apigatewayv2_api.sqs-event-publisher.name}"
  retention_in_days = 30
}

resource "aws_apigatewayv2_stage" "dev" {
  api_id      = aws_apigatewayv2_api.sqs-event-publisher.id
  name        = "dev"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.sqs-event-publisher.arn

    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      }
    )
  }
  
// Potential workaround to Terraform bug detecting state changes
//  lifecycle {
//    ignore_changes = [
//      deployment_id,
//      default_route_settings
//    ]
//  }
}

resource "aws_apigatewayv2_integration" "sqs-event-publisher" {
  api_id = aws_apigatewayv2_api.sqs-event-publisher.id

  integration_uri    = aws_lambda_function.sqs-event-publisher.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "sqs-event-publisher" {
  api_id    = aws_apigatewayv2_api.sqs-event-publisher.id
  
  route_key = "POST /${aws_lambda_function.sqs-event-publisher.function_name}"
  target    = "integrations/${aws_apigatewayv2_integration.sqs-event-publisher.id}"
}

resource "aws_lambda_permission" "sqs-event-publisher" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  
  function_name = aws_lambda_function.sqs-event-publisher.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.sqs-event-publisher.execution_arn}/*/*"
}

/**
 *  Outputs
 */
 
output "url" {
  value = aws_apigatewayv2_stage.dev.invoke_url
}
