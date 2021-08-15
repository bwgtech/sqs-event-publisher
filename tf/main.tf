/**
 *  main.tf
 *
 *    USAGE: The following must be configured in your environment in order to apply 
 *    infrastructure operations:
 *      1) AWS Credentials
 *          Method A: Configure CLI
 *                    $ aws configure --profile dev
 *
 *          Method B: Environment variables (AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY)
 * https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html#envvars-set
 *
 *      2) GitHub Credentials (optional)
 *          Provide if you wish to add a webhook that sends events for repo operations.
 *
 *          Method A: OAuth / PAT
 *
 *          Method B: GitHub App / pem File
 *
 *  NOTE: .tfstate is ignored in this repo to enforce that it is not 
 *        committed to VC, but it is strongly recommended to store it in a 
 *        centralized location that is appropriately and redundantly backed up.
 */

module "aws" {
  source = "./aws"
}

// Uncomment below module to add a github webhook pointing to Lambda endpoint

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
 