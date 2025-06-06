#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const { TunerOrchestrator } = require('../src/orchestrator');
const { ReportingService } = require('../src/reporting/reporting-service');
const { loadConfig } = require('../src/utils/config');

program
  .name('universal-serverless-tuner')
  .description('Cloud-agnostic serverless function performance tuner')
  .version('1.0.0');

program
  .command('tune')
  .description('Tune a serverless function for optimal performance')
  .requiredOption('-p, --provider <provider>', 'Cloud provider (aws|azure|gcp)')
  .requiredOption('-f, --function-name <n>', 'Function name to tune')
  .option('-r, --region <region>', 'Cloud region')
  .option('-m, --memory-values <values>', 'Comma-separated memory values in MB', '128,256,512,1024')
  .option('-n, --invocations <number>', 'Number of invocations per memory config', '10')
  .option('-s, --strategy <strategy>', 'Optimization strategy (cost|speed|balanced)', 'balanced')
  .option('--payload <json>', 'Test payload as JSON string', '{}')
  .option('--parallel', 'Run invocations in parallel', false)
  .option('--timeout <seconds>', 'Timeout in seconds', '300')
  .option('--auto-apply', 'Automatically apply optimal configuration', false)
  .option('--output-dir <dir>', 'Output directory for reports', './reports')
  .option('--baseline-samples <number>', 'Number of baseline samples before tuning', '20')
  .option('--validation-samples <number>', 'Number of validation samples after optimization', '20')
  .option('--report-format <format>', 'Report format: basic|detailed|executive|all', 'detailed')
  .option('--include-charts', 'Generate performance charts', true)
  .option('--skip-baseline', 'Skip baseline measurement (use for re-runs)', false)
  .action(async (options) => {
    try {
      console.log(chalk.blue('🚀 Universal Serverless Function Performance Tuner'));
      console.log('================================================\n');

      const config = await loadConfig(options);
      const orchestrator = new TunerOrchestrator(config);
      
      const results = await orchestrator.runWithReporting();
      
      console.log(chalk.green('\n✅ Performance tuning completed successfully!'));
      console.log(`📊 Reports generated:`);
      results.reportPaths.forEach(path => {
        console.log(`   • ${path}`);
      });
      
      if (options.autoApply && results.recommendation) {
        console.log(chalk.yellow('\n🔧 Applying optimal configuration...'));
        await orchestrator.applyOptimization(results.recommendation);
        
        const validationResults = await orchestrator.validateOptimization();
        console.log(chalk.green('✅ Optimization applied and validated!'));
        console.log(`📈 Final validation report: ${validationResults.reportPath}`);
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('report')
  .description('Generate additional reports from previous tuning data')
  .requiredOption('-d, --data-file <file>', 'Path to tuning data JSON file')
  .option('-f, --format <format>', 'Report format: executive|detailed|comparison|all', 'comparison')
  .option('-o, --output-dir <dir>', 'Output directory', './reports')
  .option('--include-recommendations', 'Include optimization recommendations', true)
  .action(async (options) => {
    try {
      const reportingService = new ReportingService(options);
      const reportPaths = await reportingService.generateFromData(options.dataFile);
      
      console.log(chalk.green('📊 Additional reports generated:'));
      reportPaths.forEach(path => {
        console.log(`   • ${path}`);
      });
    } catch (error) {
      console.error(chalk.red('❌ Error generating reports:'), error.message);
      process.exit(1);
    }
  });

program.parse();