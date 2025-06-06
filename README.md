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

## 📊 Example Reports

Here's what you can expect from the tuning reports:

### 📈 Interactive HTML Report

The HTML reports include beautiful, interactive charts and comprehensive analysis:

**[🔗 View Live Example Report](https://raw.githubusercontent.com/kencytbb/universal-serverless-tuner/main/examples/sample-report.html)**

**Key Features:**
- 📊 Interactive charts showing performance vs memory
- 💰 Cost analysis with potential savings
- 🎯 Clear optimization recommendations
- 📈 Efficiency scoring across memory configurations
- 📋 Detailed performance metrics table
- 💡 Actionable insights and next steps

### 📋 Sample Report Results

Here's an example of what the tuning analysis reveals:

| Memory (MB) | Avg Duration (ms) | Avg Cost ($) | Efficiency Score | Recommendation |
|------------|------------------|--------------|------------------|----------------|
| 256        | 2,456           | $0.000052    | 2.51             | Too slow |
| **512**    | 1,234           | $0.000056    | 1.29             | **Current** |
| **1024** ⭐ | **678**         | **$0.000063** | **0.74**         | **🎯 Optimal** |
| 2048       | 456             | $0.000089    | 0.54             | Diminishing returns |
| 3008       | 398             | $0.000134    | 0.53             | Cost inefficient |

**🎯 Recommendation:** Increase memory from 512MB to 1024MB
- **⚡ Performance:** 45% faster execution
- **💰 Cost Impact:** 12% increase (acceptable trade-off)
- **🎯 Efficiency:** Best overall balance for API functions

### 📄 JSON Report Structure

```json
{
  "metadata": {
    "functionArn": "arn:aws:lambda:us-east-1:123456789012:function:api-handler",
    "timestamp": "2025-06-06T14:30:00Z",
    "strategy": "balanced",
    "iterations": 10
  },
  "recommendation": {
    "optimalMemorySize": 1024,
    "currentMemorySize": 512,
    "potentialSavings": {
      "cost": "-12.5%",
      "duration": "+45.1%"
    },
    "reasoning": "Increasing memory to 1024MB reduces execution time by 45% while increasing cost by only 12.5%"
  },
  "insights": [
    {
      "type": "performance",
      "title": "Significant Performance Gain",
      "impact": "high"
    }
  ]
}
```

**[📄 View Complete JSON Example](examples/sample-report.json)**

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
| `--output-dir` | Directory for reports | `./reports` |
| `--format` | Report format: json, html, csv, pdf | `json,html` |

### Configuration File Schema

```javascript
{
  // Required: Lambda function to tune
  "functionArn": "string",
  
  // Memory sizes to test (MB)
  "memorySizes": [128, 256, 512, 1024, 1536, 2048, 3008],
  
  // Number of invocations per memory configuration
  "iterations": 10,
  
  // Payload for function invocation
  "payload": {},
  
  // Optimization strategy
  "strategy": "balanced", // "cost" | "speed" | "balanced"
  
  // Run invocations in parallel
  "parallelInvocations": true,
  
  // Automatically update function memory to optimal value
  "autoOptimize": false,
  
  // Report configuration
  "reports": {
    "format": ["json", "html", "csv", "pdf"],
    "outputDir": "./reports",
    "includeCharts": true,
    "includeRawData": false
  },
  
  // Scheduling configuration
  "schedule": {
    "enabled": false,
    "cron": "0 2 * * 0", // Weekly at 2 AM
    "timezone": "UTC"
  },
  
  // Advanced options
  "advanced": {
    "warmupInvocations": 2,
    "timeout": 300,
    "discardOutliers": 0.2,
    "costPerGbSecond": 0.0000166667,
    "costPerRequest": 0.0000002
  }
}
```

## 📊 Performance Reports

After each tuning session, detailed reports are generated in the specified format(s):

### Report Sections

1. **Executive Summary**: Key findings and recommendations
2. **Performance Analysis**: Detailed metrics for each memory configuration
3. **Cost Analysis**: Cost breakdown and potential savings
4. **Charts & Visualizations**: Interactive graphs showing trends
5. **Raw Data**: Complete invocation logs (optional)
6. **Historical Comparison**: Trends over time (if applicable)

### HTML Report Features

- Interactive charts (powered by Chart.js)
- Cost and performance comparison tables
- Optimization recommendations
- Historical trend analysis (if multiple runs)
- Export options for sharing

## ⏰ Scheduling

### On-Demand Tuning

```bash
# Run immediately
node src/tuner.js --config tuner.config.json

# Run with specific schedule
node src/scheduler.js --function-arn arn:aws:lambda:us-east-1:123456789012:function:my-function --schedule "0 2 * * 0"
```

### 24/7 Scheduled Tuning

Enable continuous monitoring and optimization:

```json
{
  "schedule": {
    "enabled": true,
    "cron": "0 2 * * 0", // Every Sunday at 2 AM
    "timezone": "UTC",
    "notifications": {
      "email": "admin@company.com",
      "slack": "https://hooks.slack.com/...",
      "webhook": "https://api.company.com/webhooks/tuning"
    }
  }
}
```

### Deployment Options

#### 1. Local Cron Job

```bash
# Add to crontab
0 2 * * 0 cd /path/to/universal-serverless-tuner && node src/tuner.js --config production.config.json
```

#### 2. AWS Lambda Scheduler

Deploy the tuner itself as a Lambda function with EventBridge scheduling:

```bash
npm run deploy:scheduler
```

#### 3. GitHub Actions

Use the provided GitHub Actions workflow:

```yaml
# .github/workflows/lambda-tuning.yml
name: Lambda Power Tuning
on:
  schedule:
    - cron: '0 2 * * 0'
  workflow_dispatch:

jobs:
  tune:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: node src/tuner.js --config .github/tuning-config.json
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## 🔧 API Reference

### Programmatic Usage

```javascript
const { LambdaTuner } = require('./src/tuner');

const tuner = new LambdaTuner({
  functionArn: 'arn:aws:lambda:us-east-1:123456789012:function:my-function',
  memorySizes: [256, 512, 1024, 2048],
  iterations: 10,
  strategy: 'balanced'
});

// Run tuning
const results = await tuner.run();

// Get recommendations
const recommendation = tuner.getRecommendation(results);

// Apply optimization (optional)
if (recommendation.shouldOptimize) {
  await tuner.applyOptimization(recommendation.optimalMemorySize);
}

// Generate report
await tuner.generateReport(results, 'html', './reports');
```

### Events and Hooks

```javascript
tuner.on('start', (config) => {
  console.log('Tuning started:', config);
});

tuner.on('progress', (progress) => {
  console.log(`Progress: ${progress.completed}/${progress.total}`);
});

tuner.on('memoryTested', (result) => {
  console.log(`Tested ${result.memorySize}MB: ${result.avgDuration}ms`);
});

tuner.on('complete', (results) => {
  console.log('Tuning completed:', results.recommendation);
});

tuner.on('error', (error) => {
  console.error('Tuning failed:', error);
});
```

## 📋 Examples

### Example 1: Basic HTTP API Function

```bash
node src/tuner.js \
  --function-arn arn:aws:lambda:us-east-1:123456789012:function:api-handler \
  --payload '{"httpMethod": "GET", "path": "/users"}' \
  --memory-sizes 256,512,1024 \
  --iterations 20 \
  --strategy speed
```

### Example 2: Data Processing Function

```json
{
  "functionArn": "arn:aws:lambda:us-east-1:123456789012:function:data-processor",
  "memorySizes": [1024, 2048, 3008, 4096, 5120],
  "iterations": 5,
  "payload": {
    "Records": [
      {
        "s3": {
          "bucket": {"name": "my-bucket"},
          "object": {"key": "data/large-file.csv"}
        }
      }
    ]
  },
  "strategy": "balanced",
  "advanced": {
    "timeout": 900,
    "warmupInvocations": 1
  }
}
```

### Example 3: Scheduled Optimization

```json
{
  "functionArn": "arn:aws:lambda:us-east-1:123456789012:function:report-generator",
  "memorySizes": [512, 1024, 2048, 3008],
  "iterations": 15,
  "payload": {"reportType": "daily"},
  "strategy": "cost",
  "autoOptimize": true,
  "schedule": {
    "enabled": true,
    "cron": "0 3 * * 1",
    "timezone": "America/New_York"
  },
  "reports": {
    "format": ["html", "json"],
    "outputDir": "./reports",
    "includeCharts": true
  }
}
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Permission Errors

```
Error: AccessDenied: User is not authorized to perform lambda:InvokeFunction
```

**Solution**: Ensure your AWS credentials have the required Lambda permissions.

#### 2. Function Timeout

```
Error: Task timed out after 300.00 seconds
```

**Solution**: Increase the timeout in advanced configuration or reduce iterations.

#### 3. Memory Limit Exceeded

```
Error: Process exited with code 137 (out of memory)
```

**Solution**: The function may require more memory than the maximum tested. Try higher memory values.

#### 4. Rate Limiting

```
Error: TooManyRequestsException: Rate exceeded
```

**Solution**: Reduce iterations or disable parallel invocations.

### Debug Mode

Enable verbose logging:

```bash
DEBUG=lambda-tuner:* node src/tuner.js --config tuner.config.json
```

### Logging Configuration

```json
{
  "logging": {
    "level": "info", // "debug", "info", "warn", "error"
    "file": "./logs/tuner.log",
    "maxFiles": 10,
    "maxSize": "10MB"
  }
}
```

## 📈 Performance Optimization Tips

1. **Start with Defaults**: Use the default memory sizes for initial testing
2. **Use Parallel Invocations**: Enable for faster results (if function supports concurrent execution)
3. **Warm-up Invocations**: Include warm-up calls to get accurate performance metrics
4. **Test with Realistic Payloads**: Use production-like data for accurate results
5. **Monitor Long-term Trends**: Schedule regular tuning to catch performance drift
6. **Consider Cost vs Speed Trade-offs**: Use the "balanced" strategy for most use cases

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [AWS Lambda Power Tuning](https://github.com/alexcasalboni/aws-lambda-power-tuning) by Alex Casalboni
- Built with ❤️ for the serverless community

## 📞 Support

- 🐛 [Report bugs](https://github.com/kencytbb/universal-serverless-tuner/issues)
- 💡 [Request features](https://github.com/kencytbb/universal-serverless-tuner/issues)
- 📖 [Documentation](https://github.com/kencytbb/universal-serverless-tuner/wiki)
- 💬 [Discussions](https://github.com/kencytbb/universal-serverless-tuner/discussions)