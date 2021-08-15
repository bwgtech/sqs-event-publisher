/**
 *  main.tf
 *
 *    Main Terraform Configuration
 *
 *    USAGE:  The following must be configured in your environment in order to 
 *            apply infrastructure operations:
 *
 *      1) AWS Credentials
 *           (further info in README.md at package root)
 *
 *          Method A: Configure CLI
 *                    $ aws configure --profile dev
 *
 *          Method B: Environment variables
 *                    AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
 *
 *      2) GitHub Configuration (optional)
 *
 *           If you wish to automatically add a webhook that sends events for 
 *           repo operations to the AWS endpoint, uncomment the github module 
 *           below and set credentials as described here:
 *
 *      https://registry.terraform.io/providers/integrations/github/latest/docs#authentication
 *
 *
 *    NOTE: .tfstate is ignored in this repo to enforce that it is not committed 
 *          to VC, but it is strongly recommended to store it in a centralized 
 *          location that is redundantly backed up.
 *
 */

module "aws" {
  source = "./aws"
}

// Uncomment below module to add a github webhook pointing to the Lambda endpoint

/*
module "github" {
  source = "./github"
  url    = module.aws.url
}
*/

/**
 *  Please refer to the tf config files in folders below the current directory 
 *  (e.g. aws/aws.tf and github/github.tf) for a detailed explanation of each 
 *  module's functionality.
 *
 */
 