/**
 * This adds proxy settings to our config
 *
 * @name plugin-alfred-workflow
 */
'use strict';

module.exports = lando => {
  lando.incrementMaxListeners = () => {
    lando.events.setMaxListeners(lando.events.getMaxListeners() + 1);
    return lando;
  };

  lando.validateLandoVersion = () => {
    const LANDO_NODE_VERSION = parseFloat(process.version.replace('v', ''));
    const NODE_VERSION = 8;

    if (LANDO_NODE_VERSION < NODE_VERSION) {
      lando.log.error('The Alfred Workflow module expects the Lando Node version to be' +
        ` ${NODE_VERSION} but instead got ${LANDO_NODE_VERSION}.`
        + '\n\nTry installing Lando 3.0.0-rc1 or disabling the Alfred Workflow for Lando plugin.');

      process.exit();
    }
  };

  lando.validateLandoVersion();
  lando.alfredWorkflow = require('./package.json');

  const allowWorkflowTasks = [
    // Production workflow
    (process.env.alfred_workflow_bundleid === 'com.landoflow.workflow').toString(),
    // Development workflow for new features
    // Prevents lost work when installing production updates
    (process.env.alfred_workflow_bundleid === 'com.landoflow.workflow-dev').toString(),
    // Allow commands from terminal
    (process.env.NODE_ENV === 'development').toString(),
  ];

  const allowWorkflowCommands = () => {
    return allowWorkflowTasks.includes('true');
  };

  // Add in our app tasks
  lando.incrementMaxListeners().events.on('post-bootstrap', 5, lando => {
    lando.tasks.add('alfred', require('./src/tasks/alfred/install')(lando));

    if (!allowWorkflowCommands()) {
      return;
    }

    /**
     * Minimize error output. Alfred will break if anything other than JSON is returned
     *
     * @todo Let's make this error reducer a little more intelligent.
     * @todo Make errors output in Alfred-Item friendly format? :)
     */
    lando.log.transports.console.level = 'error';
    lando.tasks.add('alfred:projects', require('./src/tasks/alfred/projects')(lando));
    lando.tasks.add('alfred:commands',
        require('./src/tasks/alfred/commands')(lando));
    lando.tasks.add('alfred:command:run',
        require('./src/tasks/alfred/command-run')(lando));
  });
};
