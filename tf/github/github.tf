terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 4.0"
    }
  }
}

variable "url" {
  type = string
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
