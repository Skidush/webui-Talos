const reporter = require('cucumber-html-reporter');
const protractorConfig = require('../../protractor.conf');
const config = protractorConfig.config;

const browserName = config.capabilities.browserName;
const tagsRan = config.cucumberOpts.tags;
const nav = process.platform;
const reportsFolder = `${process.cwd()}/reports/`;

const options = {
        theme: 'bootstrap',
        jsonDir: reportsFolder,
        output: `${reportsFolder}/cucumber_report.html`,
        reportSuiteAsScenarios: true,
        launchReport: false,
        ignoreBadJsonFile: true,
        storeScreenshots: true,
        name: 'HMWS AUTOMATED TESTS',
        brandTitle: 'Automated Tests Report',
        metadata: {
            "Test Environment": "192.168.88.60 - Vagrant - Test Environment Jenkins Build",
            "Browser": browserName,
            "Platform": nav,
            "Tags": tagsRan
        },
    };
 
reporter.generate(options);