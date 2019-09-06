// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

exports.config = {
  allScriptsTimeout: 11000,
  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
      'args': [
        '--start-maximized', // Uncomment to launch tests in the browser and comment the `args` below
        //  '--headless',
        //  '--disable-gpu',
        //  '--window-size=1920,1080',
        //  '--no-sandbox',
        //  '--disable-dev-shm-usage'
      ]
    }
  },

  directConnect: true,
  // baseUrl: 'http://localhost:4200', // Local URL
  baseUrl: 'http://192.168.88.75:4200',

  specs: [
    './e2e/features/*.feature',
  ],

  framework: 'custom',
  frameworkPath: require.resolve('protractor-cucumber-framework'),

  cucumberOpts: {
    require: [
      './e2e/utils/*.ts',
      './e2e/hooks/*.ts',
      './e2e/features/support/*.ts',
      './e2e/step_definitions/*.ts'
    ],
    tags: '@Capability',
    strict: true,
    format: [
      `json:reports/summary.json`,
    ],
    dryRun: false,
    compiler: []
  },

  params: {
    agents: [
      { role: 'Admin', username: 'hmws', password: 'test' }
    ],

    createdItemDetails: {},
    createdItemUUIDs: [],
    editedItemDetails: {},

    testsPath: process.cwd(),

    originalTime: 0,
    
    logLevel: 'info',
    currentScenario: '',
  },
  
  onPrepare() {
    require('ts-node').register({
      project: 'e2e/tsconfig.e2e.json'
    });
  },

  ignoreUncaughtExceptions: true,
};