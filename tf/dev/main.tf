/**
 *  main.tf
 *
 *    Main Terraform Config for Environment: dev
 *
 *    The following must be set in your environment in order to apply infrastructure operations:
 *
 *    1)AWS Credentials
 *
 *       Method A: Configure CLI
 *                 $ aws configure --profile dev
 *
 *       Method B: Environment variables
 *                 AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
 *      
 *       https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html
 *
 *    2)GitHub Configuration (optional)
 *
 *       If you wish to automatically add a webhook that sends events for repo operations 
 *       to the AWS endpoint, uncomment the github module below and set the GITHUB_OWNER 
 *       and GITHUB_TOKEN environment variables.
 *
 *       https://registry.terraform.io/providers/integrations/github/latest/docs#authentication
 *
 *    NOTE: .tfstate is git-ignored in this repo to enforce that it is not committed to VC, 
 *          but it is strongly recommended to store it in a centralized location that is 
 *          redundantly backed up.
 *
 */

module "aws" {
  source   = "../modules/aws"
  app_name = var.app_name
  env      = var.env
}

/*
module "github" {
  source      = "../modules/github"
  app_name = var.app_name
  env = var.env
  endpointUrl = module.aws.url
}
*/
 