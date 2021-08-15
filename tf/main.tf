/**
 *  Main Terraform Configuration
 *
 *    The following must be configured in your environment in order to apply infrastructure operations:
 *
 *      1) AWS Credentials
 *
 *          Method A: Configure CLI
 *                    $ aws configure --profile dev
 *
 *          Method B: Environment variables (AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY)
 *                    See https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html#envvars-set
 *
 *      2) GitHub Credentials (optional)
 *
 *          Provide if you wish to add a webhook that sends events for repo operations.
 *
 *          Method A: OAuth / PAT
 *
 *          Method B: GitHub App / pem File
 *
 */

module "aws" {
  source = "./aws"
}

/**
 *  Uncomment below module to add github webhook
 */

/*
module "github" {
  source = "./github"
  url    = module.aws.url
}
*/

/**
 *  Please refer to the config files associated with each module above (e.g. aws/aws.tf and github/github.tf) 
 *  for a detailed explanation of each module's functionality.
 */