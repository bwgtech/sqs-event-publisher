module "aws" {
  source = "./aws"
}

module "github" {
  source = "./github"
  url = module.aws.url
}
