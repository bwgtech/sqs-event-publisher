/**
 *  tf/modules/github/github.tf
 *
 *    Terraform Main for Module: github
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

variable "app_name" {
  type = string
}

variable "env" {
  type = string
}

variable "endpointUrl" {
  type = string
}

resource "github_repository_webhook" "sqs-event-publisher" {
  repository = var.repoName
  active     = true
  events     = ["pull_request", "push"]

  configuration {
    url          = var.endpointUrl
    content_type = "json"
    insecure_ssl = false
  }
}
