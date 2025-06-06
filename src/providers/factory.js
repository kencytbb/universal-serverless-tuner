const { AWSProvider } = require('./aws');
const { AzureProvider } = require('./azure');
const { GCPProvider } = require('./gcp');

class ProviderFactory {
  static create(providerName, config) {
    switch (providerName.toLowerCase()) {
      case 'aws':
        return new AWSProvider(config);
      case 'azure':
        return new AzureProvider(config);
      case 'gcp':
        return new GCPProvider(config);
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  }
}

module.exports = { ProviderFactory };