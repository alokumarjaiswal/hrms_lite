#!/usr/bin/env python
"""
Deployment Environment Validation Script

This script validates that all required environment variables are set
before starting the Django application. It should be run during deployment
to catch configuration errors early.

Usage:
    python check_deployment.py

Exit Codes:
    0 - All required variables are present
    1 - One or more required variables are missing
"""

import os
import sys


def check_required_env_vars():
    """
    Check for required environment variables.
    Returns True if all are present, False otherwise.
    """
    required_vars = {
        "SECRET_KEY": "Django secret key for cryptographic signing",
        "DEBUG": "Debug mode flag (should be 'False' in production)",
        "ALLOWED_HOSTS": "Comma-separated list of allowed hostnames",
        "DATABASE_URL": "PostgreSQL connection string",
        "CORS_ALLOWED_ORIGINS": "Comma-separated list of allowed CORS origins",
        "CSRF_TRUSTED_ORIGINS": "Comma-separated list of trusted CSRF origins",
    }

    missing_vars = []
    warnings = []

    print("=" * 70)
    print("DEPLOYMENT ENVIRONMENT VALIDATION")
    print("=" * 70)
    print()

    for var_name, description in required_vars.items():
        value = os.environ.get(var_name)
        if not value:
            missing_vars.append((var_name, description))
            print(f"MISSING: {var_name}")
        else:
            # Show truncated value for security
            display_value = value[:20] + "..." if len(value) > 20 else value
            print(f"SET: {var_name} = {display_value}")

            # Additional validation for specific variables
            if var_name == "DEBUG" and value.lower() not in ["false", "0", ""]:
                warnings.append(
                    f"WARNING: DEBUG is set to '{value}'. "
                    "Should be 'False' in production!"
                )
            elif var_name == "SECRET_KEY" and len(value) < 50:
                warnings.append(
                    f"WARNING: SECRET_KEY is short ({len(value)} chars). "
                    "Use a longer key for production!"
                )

    print()
    print("=" * 70)

    # Print warnings
    if warnings:
        print()
        for warning in warnings:
            print(warning)
        print()

    # Print missing variables with descriptions
    if missing_vars:
        print()
        print("VALIDATION FAILED")
        print()
        print("Missing required environment variables:")
        print()
        for var_name, description in missing_vars:
            print(f"  • {var_name}")
            print(f"    {description}")
            print()
        print("=" * 70)
        print()
        print("Please set these environment variables before deployment.")
        print("See .env.production.example for reference.")
        print()
        return False

    print()
    print("ALL REQUIRED ENVIRONMENT VARIABLES ARE SET")
    print()
    print("=" * 70)
    return True


if __name__ == "__main__":
    if check_required_env_vars():
        sys.exit(0)
    else:
        sys.exit(1)
