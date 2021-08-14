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

/*
 *  Configurable Values
 *
 *  Regarding GitHubToken: The below secret is specifically for user bwgtech's repo 
 *                         named sqs-event-publisher.  It has permission ONLY to create webhooks.
 *	  
 *	                       When using this terraform config to create a webhook on a different 
 *                         GitHub repository, please replace the token or see 
 *                         https://registry.terraform.io/providers/integrations/github/latest/docs
 */
locals {
  GitHubOwner = "bwgtech"
  GitHubToken = "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"
  RepoName    = "sqs-event-publisher"
}

provider "github" {
  owner = local.GitHubOwner
  token = local.GitHubToken
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
