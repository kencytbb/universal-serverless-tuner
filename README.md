# Universal Lambda Power Tuner

A simplified, universal Lambda power tuning service that helps you optimize AWS Lambda functions for cost and performance. This tool automatically tests different memory configurations and provides detailed performance reports to help you make data-driven decisions.

## 🚀 Features

- **Universal Lambda Support**: Works with any Lambda function regardless of runtime or language
- **Cost & Performance Optimization**: Find the optimal balance between execution time and cost
- **Automated Testing**: Run multiple iterations with different memory configurations
- **Detailed Reports**: Get comprehensive performance analytics after each tuning session
- **24/7 Scheduled Tuning**: Set up automated tuning schedules or run on-demand
- **Visual Reports**: Generate charts and graphs to visualize performance trends
- **Export Results**: Save tuning results in JSON, CSV, or PDF formats

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage](#usage)
- [Performance Reports](#performance-reports)
- [Scheduling](#scheduling)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## 🛠 Installation

### Prerequisites

- Node.js 18+ 
- AWS CLI configured with appropriate permissions
- AWS CDK (optional, for infrastructure deployment)

### Install Dependencies

```bash
npm install
```

### AWS Permissions Required

Your AWS credentials need the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeFunction",
        "lambda:GetFunction",
        "lambda:UpdateFunctionConfiguration",
        "lambda:ListVersionsByFunction",
        "lambda:PublishVersion",
        "lambda:CreateAlias",
        "lambda:UpdateAlias",
        "lambda:DeleteAlias",
        "logs:FilterLogEvents",
        "logs:GetLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🚀 Quick Start

### 1. Basic Tuning

```bash
# Tune a single Lambda function
node src/tuner.js --function-arn arn:aws:lambda:us-east-1:123456789012:function:my-function

# Tune with custom memory values
node src/tuner.js --function-arn arn:aws:lambda:us-east-1:123456789012:function:my-function --memory-sizes 256,512,1024,2048

# Tune with custom payload
node src/tuner.js --function-arn arn:aws:lambda:us-east-1:123456789012:function:my-function --payload '{"key": "value"}'
```

### 2. Generate Configuration File

```bash
# Generate a sample configuration
node src/tuner.js --init
```

This creates a `tuner.config.json` file:

```json
{
  "functionArn": "arn:aws:lambda:us-east-1:123456789012:function:my-function",
  "memorySizes": [128, 256, 512, 1024, 1536, 2048, 3008],
  "iterations": 10,
  "payload": {},
  "strategy": "balanced",
  "parallelInvocations": true,
  "autoOptimize": false,
  "reports": {
    "format": ["json", "html"],
    "outputDir": "./reports"
  },
  "schedule": {
    "enabled": false,
    "cron": "0 2 * * 0"
  }
}
```

### 3. Run with Configuration

```bash
node src/tuner.js --config tuner.config.json
```

## ⚙️ Configuration

### Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--function-arn` | AWS Lambda function ARN | Required |
| `--memory-sizes` | Comma-separated memory sizes (MB) | `128,256,512,1024,1536,2048,3008` |
| `--iterations` | Number of invocations per memory size | `10` |
| `--payload` | JSON payload for function invocation | `{}` |
| `--strategy` | Optimization strategy: cost, speed, balanced | `balanced` |
| `--parallel` | Enable parallel invocations | `true` |
| `--auto-optimize` | Automatically update function memory | `false` |
| `--config` | Path to configuration file | None |
| `--output-dir` | Directory for reports