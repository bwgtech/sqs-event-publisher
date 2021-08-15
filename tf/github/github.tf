/**
 *  github.tf
 *
 *    This configuration performs the following GitHub operations:
 *      1. Add webhook to repository specified below, which calls the 
 *           endpoint URL that is input into this module
 *
 *    NOTE: GitHub credentials should already be configured at this point, 
 *          see ../main.tf for further instructions.
 *
 */

terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 4.0"
    }
  }
}

/**
 *  Configurable Values
 *
 *    Please see the following for details on GitHub authentication options: 
 *      https://registry.terraform.io/providers/integrations/github/latest/docs
 */
locals {
  GitHubOwner = "bwgtech"
  RepoName    = "sqs-event-publisher"
}

variable "url" {
  type = string
}

provider "github" {
  owner = local.GitHubOwner
}

resource "github_repository_webhook" "sqs-event-publisher" {
  repository = local.RepoName
  active     = false
  events     = ["pull_request", "push"]

  configuration {
    url          = var.url
    content_type = "json"
    insecure_ssl = false
  }
}
