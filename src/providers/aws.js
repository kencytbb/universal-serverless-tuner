const AWS = require('aws-sdk');

class AWSProvider {
  constructor(config) {
    this.config = config;
    this.lambda = new AWS.Lambda({ region: config.region });
  }

  async validateFunction(functionName) {
    try {
      await this.lambda.getFunction({ FunctionName: functionName }).promise();
      return true;
    } catch (error) {
      throw new Error(`Function ${functionName} not found: ${error.message}`);
    }
  }

  async getFunctionConfig(functionName) {
    try {
      const result = await this.lambda.getFunctionConfiguration({
        FunctionName: functionName
      }).promise();
      
      return {
        memorySize: result.MemorySize,
        timeout: result.Timeout,
        runtime: result.Runtime
      };
    } catch (error) {
      throw new Error(`Failed to get function configuration: ${error.message}`);
    }
  }

  async updateMemory(functionName, memorySize) {
    try {
      await this.lambda.updateFunctionConfiguration({
        FunctionName: functionName,
        MemorySize: memorySize
      }).promise();
      
      await this.lambda.waitFor('functionUpdated', {
        FunctionName: functionName
      }).promise();
      
    } catch (error) {
      throw new Error(`Failed to update memory: ${error.message}`);
    }
  }

  async invoke(functionName, payload) {
    try {
      const params = {
        FunctionName: functionName,
        Payload: JSON.stringify(payload),
        LogType: 'Tail'
      };
      
      const result = await this.lambda.invoke(params).promise();
      
      if (result.FunctionError) {
        throw new Error(`Function error: ${result.FunctionError}`);
      }
      
      const logs = result.LogResult ? 
        Buffer.from(result.LogResult, 'base64').toString() : '';
      
      const memoryMatch = logs.match(/Max Memory Used: (\d+) MB/);
      const memoryUsed = memoryMatch ? parseInt(memoryMatch[1]) : 0;
      
      return {
        statusCode: result.StatusCode,
        payload: JSON.parse(result.Payload),
        logs,
        memoryUsed
      };
      
    } catch (error) {
      throw new Error(`Invocation failed: ${error.message}`);
    }
  }
}

module.exports = { AWSProvider };