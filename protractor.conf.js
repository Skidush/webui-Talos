// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

exports.config = {
  allScriptsTimeout: 11000,
  getPageTimeout: 60000,
  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
      'args': [
        '--start-maximized', // Uncomment to launch tests using the browser and comment the argument `properties` below
        //  '--headless',
        //  '--disable-gpu',
        //  '--window-size=1920,1080',
        //  '--no-sandbox',
        //  '--disable-dev-shm-usage'
      ]
    }
  },

  directConnect: true,
  baseUrl: 'http://localhost:4200',

  specs: [
    'project/features/*.feature'
  ],

  framework: 'custom',
  frameworkPath: require.resolve('protractor-cucumber-framework'),

  cucumberOpts: {
    require: [
      './e2e/classes/*.ts',
      './e2e/hooks/*.ts',
      'project/features/support/*.ts',
      './e2e/step_definitions/*.ts'
    ],
    tags: [],
    strict: true,
    format: [
      `json:reports/summary.json`,
    ],
    dryRun: false,
    compiler: []
  },

  params: {
    project: 'hmws',
    logLevel: 'all',
    agents: [
      { role: 'Admin',     username: 'hmws',      password: 'test' },
      { role: 'Inventory', username: 'inventory', password: 'test' }
    ],
    
    createdItemUUIDs: [],
    initializedItems: [],
    
    root: process.cwd(),
    originalTime: 0,
    currentScenario: '',
  },
  
  onPrepare() {
    require('ts-node').register({
      project: 'e2e/tsconfig.e2e.json'
    });
  },

  // ignoreUncaughtExceptions: true,
};