# Security Policy

SATURN is currently an experimental local application. It has not yet been hardened for public internet deployment or for storing highly sensitive client information on a shared server.

## Secrets

Never commit any of the following:

- `.env` files
- OpenAI, Anthropic, Gemini, Adobe, Shopify, Notion, or other API credentials
- Shopify Admin API access tokens
- Client passwords
- Database files containing client or project records

Use `saturn-ai/.env.example` as the template and keep the completed `saturn-ai/.env` file only on the machine running SATURN.

If a credential is committed accidentally, deleting the visible file is not enough. Revoke or rotate the credential immediately because it may remain in Git history.

## Local data

SATURN uses SQLite for local persistence. Database files may contain project names, notes, proposals, document content, or other studio information. They are excluded from Git and should be backed up only to an approved private location.

## Deployment warning

Before exposing SATURN outside a trusted local environment, the project needs:

- Authentication and session review
- User authorization and role boundaries
- CSRF and rate-limit protection
- Secure secret storage
- Input and upload validation
- Database backup and migration procedures
- Dependency and vulnerability scanning
- Logging that does not expose sensitive content
- HTTPS and secure production configuration

## Reporting a problem

For security concerns related to this repository, contact:

**Christopher Edwards / New Era Designs**  
chris@neweradesigns.co

Do not open a public GitHub issue containing an API key, password, private client record, or exploit details.
