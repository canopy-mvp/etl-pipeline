# Copilot Instructions — etl-pipeline

## Context
NovaPay ETL pipeline for processing transaction data, generating reports,
and feeding the analytics dashboard. Python-based with Apache Airflow DAGs.

## Conventions
- All DAGs must have `owner`, `retries`, and `retry_delay` set
- Use the `NovapayBaseOperator` for custom operators
- SQL queries go in `dags/sql/` directory, never inline
- All data transformations must be idempotent
- Use structured logging via `loguru` — never `print()`
- Secrets from AWS Secrets Manager via `get_secret()` helper

## Data handling
- PII columns must be masked in staging tables
- Financial amounts stored as integers (cents), never floats
- All timestamps in UTC, ISO 8601 format
- Partition large tables by date for query performance

## Testing
- Unit tests for all transformations in `tests/`
- Integration tests use the test database (never prod)
- DAG validation tests ensure no import errors
