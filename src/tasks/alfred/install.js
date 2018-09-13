'use strict';

const task = {
  command: 'alfred',
  describe: 'Install Lando Workflow for Alfred',
};

module.exports = lando => {
  const path = require('path');
  const fs = require('fs');
  const os = require('os');
  const https = require('follow-redirects').https;
  const exec = require('child_process').exec;

  /**
   * Trigger install by opening file
   *
   * @param {string} workflowPath
   */
  const install = workflowPath => {
    console.log(`Installing workflow...`);
    lando.log.info(`Launching: "open ${workflowPath}"`);

    // Open file
    exec(`open ${workflowPath}`, function(err, data) {
      if (err) {
        lando.log.error(err);
        return;
      }

      lando.log.warn('If Alfred did not launch, please ensure that `.alfredworkflow` files' +
        ' are associated with your Alfred application.');
    });
  };

  /**
   * Download file and trigger install
   *
   * @param {string} url
   * @param {string} workflowPath
   * @param {Object} file
   *
   * @return {*}
   */
  const processInstall = (url, workflowPath, file) => {
    console.log(`Downloading: ${url}`);

    // Download Workflow from URL
    return https.get(url, response => {
      if (response.statusCode !== 200 ) {
        const version = lando.alfredWorkflow.version;
        lando.log.error(`Attempted to download Lando Workflow version "${version}" @ ${url} but `
          + `received a ${response.statusCode} error.`);
        return;
      }
      lando.log.info(`Downloaded: ${url} to ${workflowPath}`);
      console.log(`Saving to temp: ${workflowPath}`);

      // Write URL contents to file
      const saveWorkflow = response.pipe(file);

      // Execute install command once file is written
      saveWorkflow.on('finish', () => {
        lando.log.info(`Saved ${workflowPath}`);
        install(workflowPath);
      });
    }).on('error', lando.log.error);
  };

  /**
   * Run command when requested
   *
   * @return {*}
   */
  task.run = () => {
    const workflowPath = path.join(os.tmpdir(), 'Lando.alfredworkflow');
    const file = fs.createWriteStream(workflowPath);
    const repo = 'https://github.com/improper/lando-alfred-workflow';
    const url = `${repo}/releases/download/${lando.alfredWorkflow.version}/Lando.alfredworkflow`;

    return processInstall(url, workflowPath, file);
  };

  return task;
};
