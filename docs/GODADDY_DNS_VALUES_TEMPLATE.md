# GoDaddy DNS Values Template

Fill in the live endpoint values for the deployment target you actually use.

## Docker On One Public Server

- Type: `A`
- Name: `@`
- Value: `<YOUR_PUBLIC_SERVER_IPV4>`
- TTL: `1 hour`

- Type: `CNAME`
- Name: `www`
- Value: `peopalawan.com`
- TTL: `1 hour`

## Kubernetes

- Type: `A`
- Name: `@`
- Value: `<YOUR_INGRESS_PUBLIC_IPV4>`
- TTL: `1 hour`

- Type: `A`
- Name: `www`
- Value: `<YOUR_INGRESS_PUBLIC_IPV4>`
- TTL: `1 hour`

## AWS ECS / ALB

- Type: `CNAME`
- Name: `www`
- Value: `<YOUR_ALB_DNS_NAME>`
- TTL: `1 hour`

For root `@`, use one of these:

- GoDaddy forwarding from `peopalawan.com` to `https://www.peopalawan.com`
- DNS hosting that supports apex alias records
