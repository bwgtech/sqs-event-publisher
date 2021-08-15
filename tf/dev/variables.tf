/**
 *  tf/dev/variables.tf
 *
 *    Terraform Variables for Environment: dev
 *
 */

variable "app_name" {
  type    = string
  default = "SQSEventPublisher"
}

variable "env" {
  type    = string
  default = "dev"
}

