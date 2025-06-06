const ora = require('ora');
const chalk = require('chalk');
const { ProviderFactory } = require('./providers/factory');
const { Analyzer } = require('./analyzers/analyzer');
const { ReportingService } = require('./reporting/reporting-service');

class TunerOrchestrator {
  constructor(config) {
    this.config = config;
    this.provider = ProviderFactory.create(config.provider, config);
    this.analyzer = new Analyzer(config);
    this.reportingService = new ReportingService(config);
    this.results = {
      baseline: null,
      tuningResults: [],
      optimizationApplied: null,
      validation: null,
      metadata: {
        startTime: new Date(),
        config: config
      }
    };
  }

  async runWithReporting() {
    const spinner = ora('Initializing performance tuner...').start();
    
    try {
      // Step 1: Validate function
      spinner.text = 'Validating function configuration...';
      await this.provider.validateFunction(this.config.functionName);
      
      // Step 2: Capture baseline performance
      if (!this.config.skipBaseline) {
        spinner.text = 'Measuring baseline performance...';
        this.results.baseline = await this.measureBaseline();
        console.log(chalk.yellow(`\n📊 Baseline: ${this.results.baseline.avgDuration}ms avg, ${this.results.baseline.currentMemory}MB memory`));
      }
      
      // Step 3: Run optimization tests
      spinner.text = 'Running optimization tests...';
      const tuningResults = await this.runOptimizationTests();
      this.results.tuningResults = tuningResults;
      
      // Step 4: Analyze results
      spinner.text = 'Analyzing performance data...';
      const analysis = this.analyzer.analyzeWithBaseline(tuningResults, this.results.baseline);
      this.results.analysis = analysis;
      
      // Step 5: Generate comprehensive reports
      spinner.text = 'Generating performance reports...';
      const reportPaths = await this.reportingService.generateComprehensiveReports(this.results);
      
      spinner.succeed('Performance analysis completed!');
      
      // Display summary
      this.displayComparisonSummary();
      
      return {
        ...this.results,
        recommendation: analysis.recommendation,
        reportPaths
      };
      
    } catch (error) {
      spinner.fail('Performance tuning failed');
      throw error;
    }
  }

  async measureBaseline() {
    const currentConfig = await this.provider.getFunctionConfig(this.config.functionName);
    const currentMemory = currentConfig.memorySize;
    
    console.log(`\n📏 Measuring baseline performance (${currentMemory}MB memory)...`);
    console.log(`   Running ${this.config.baselineSamples} sample invocations`);
    
    const invocations = [];
    
    for (let i = 0; i < this.config.baselineSamples; i++) {
      const result = await this.invokeFunction();
      invocations.push(result);
      
      if ((i + 1) % 5 === 0) {
        process.stdout.write(`   Progress: ${i + 1}/${this.config.baselineSamples}\r`);
      }
    }
    
    const metrics = this.calculateMetrics(invocations, currentMemory, 0);
    
    return {
      ...metrics,
      currentMemory,
      timestamp: new Date(),
      invocations: invocations.length
    };
  }

  async runOptimizationTests() {
    const memoryConfigs = this.config.memoryValues.map(m => parseInt(m));
    const results = [];
    
    console.log(`\n🔧 Testing memory configurations: ${memoryConfigs.join(', ')} MB`);
    console.log(`   Invocations per configuration: ${this.config.invocations}`);
    console.log(`   Strategy: ${this.config.strategy}\n`);
    
    for (const memory of memoryConfigs) {
      console.log(`⚡ Testing ${memory} MB configuration...`);
      
      const configResults = await this.testMemoryConfiguration(memory);
      results.push({
        memory,
        ...configResults
      });
      
      console.log(`   ✓ ${memory} MB: ${configResults.avgDuration}ms avg, ${configResults.avgCost.toFixed(8)} cost, ${configResults.successRate.toFixed(1)}% success`);
    }
    
    return results;
  }

  async testMemoryConfiguration(memory) {
    await this.provider.updateMemory(this.config.functionName, memory);
    await this.sleep(2000);
    
    const invocations = [];
    
    if (this.config.parallel) {
      const promises = Array(this.config.invocations).fill().map(async () => {
        return await this.invokeFunction();
      });
      
      const results = await Promise.allSettled(promises);
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          invocations.push(result.value);
        }
      });
    } else {
      for (let i = 0; i < this.config.invocations; i++) {
        const result = await this.invokeFunction();
        invocations.push(result);
      }
    }
    
    return this.calculateMetrics(invocations, memory, 0);
  }

  async invokeFunction() {
    const startTime = Date.now();
    
    try {
      const result = await this.provider.invoke(
        this.config.functionName,
        this.config.payload
      );
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        duration,
        cost: this.calculateInvocationCost(duration, result.memoryUsed || 0),
        memoryUsed: result.memoryUsed,
        logs: result.logs
      };
    } catch (error) {
      return {
        success: false,
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }

  calculateMetrics(invocations, memory, totalTime) {
    const successful = invocations.filter(i => i.success);
    const successRate = (successful.length / invocations.length) * 100;
    
    if (successful.length === 0) {
      return {
        avgDuration: 0,
        avgCost: 0,
        successRate: 0,
        totalTime,
        error: 'All invocations failed'
      };
    }
    
    const durations = successful.map(i => i.duration).sort((a, b) => a - b);
    const costs = successful.map(i => i.cost).sort((a, b) => a - b);
    
    const trimCount = Math.floor(durations.length * 0.1);
    const trimmedDurations = durations.slice(trimCount, -trimCount || undefined);
    const trimmedCosts = costs.slice(trimCount, -trimCount || undefined);
    
    const avgDuration = trimmedDurations.reduce((a, b) => a + b, 0) / trimmedDurations.length;
    const avgCost = trimmedCosts.reduce((a, b) => a + b, 0) / trimmedCosts.length;
    
    return {
      avgDuration: Math.round(avgDuration),
      avgCost: parseFloat(avgCost.toFixed(8)),
      successRate,
      totalTime,
      memoryUsed: memory,
      rawData: successful,
      p50Duration: durations[Math.floor(durations.length * 0.5)],
      p95Duration: durations[Math.floor(durations.length * 0.95)],
      p99Duration: durations[Math.floor(durations.length * 0.99)]
    };
  }

  calculateInvocationCost(duration, memoryUsed) {
    const pricing = this.config.costCalculation[this.config.provider];
    const gbSeconds = (memoryUsed / 1024) * (duration / 1000);
    return (gbSeconds * pricing.pricePerGbSecond) + pricing.requestPrice;
  }

  async applyOptimization(recommendation) {
    console.log(`\n🔧 Applying optimization: ${recommendation.memory} MB`);
    
    await this.provider.updateMemory(this.config.functionName, recommendation.memory);
    await this.sleep(5000);
    
    this.results.optimizationApplied = {
      memory: recommendation.memory,
      appliedAt: new Date(),
      previousMemory: this.results.baseline?.currentMemory
    };
  }

  async validateOptimization() {
    if (!this.results.optimizationApplied) {
      throw new Error('No optimization has been applied yet');
    }
    
    console.log(`\n✅ Validating optimization with ${this.config.validationSamples} samples...`);
    
    const validationInvocations = [];
    
    for (let i = 0; i < this.config.validationSamples; i++) {
      const result = await this.invokeFunction();
      validationInvocations.push(result);
      
      if ((i + 1) % 5 === 0) {
        process.stdout.write(`   Validation progress: ${i + 1}/${this.config.validationSamples}\r`);
      }
    }
    
    const validationMetrics = this.calculateMetrics(
      validationInvocations, 
      this.results.optimizationApplied.memory, 
      0
    );
    
    this.results.validation = {
      ...validationMetrics,
      timestamp: new Date(),
      samples: this.config.validationSamples
    };
    
    const reportPath = await this.reportingService.generateValidationReport(this.results);
    
    return { reportPath };
  }

  displayComparisonSummary() {
    const Table = require('cli-table3');
    
    if (!this.results.baseline || !this.results.analysis?.recommendation) {
      return;
    }
    
    const baseline = this.results.baseline;
    const recommended = this.results.analysis.recommendation;
    
    console.log('\n' + chalk.bold('📊 PERFORMANCE COMPARISON SUMMARY'));
    console.log('=====================================');
    
    const table = new Table({
      head: ['Metric', 'Before (Baseline)', 'After (Recommended)', 'Improvement'],
      colWidths: [20, 20, 20, 20]
    });
    
    const durationImprovement = ((baseline.avgDuration - recommended.avgDuration) / baseline.avgDuration * 100);
    const costChange = ((recommended.avgCost - baseline.avgCost) / baseline.avgCost * 100);
    
    table.push(
      ['Memory', `${baseline.currentMemory} MB`, `${recommended.memory} MB`, `${((recommended.memory - baseline.currentMemory) / baseline.currentMemory * 100).toFixed(1)}%`],
      ['Avg Duration', `${baseline.avgDuration}ms`, `${recommended.avgDuration}ms`, `${durationImprovement > 0 ? '+' : ''}${durationImprovement.toFixed(1)}%`],
      ['Avg Cost', `$${baseline.avgCost.toFixed(8)}`, `$${recommended.avgCost.toFixed(8)}`, `${costChange > 0 ? '+' : ''}${costChange.toFixed(1)}%`],
      ['Success Rate', `${baseline.successRate.toFixed(1)}%`, `${recommended.successRate.toFixed(1)}%`, `${(recommended.successRate - baseline.successRate).toFixed(1)}%`]
    );
    
    console.log(table.toString());
    
    if (durationImprovement > 10) {
      console.log(chalk.green(`🚀 Significant speed improvement: ${durationImprovement.toFixed(1)}% faster!`));
    }
    
    if (costChange < -5) {
      console.log(chalk.green(`💰 Cost reduction: ${Math.abs(costChange).toFixed(1)}% cheaper!`));
    } else if (costChange > 5 && durationImprovement > 20) {
      console.log(chalk.yellow(`⚡ Performance boost worth the cost: ${durationImprovement.toFixed(1)}% faster for ${costChange.toFixed(1)}% more`));
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { TunerOrchestrator };