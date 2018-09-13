'use strict';

const task = {
  command: 'alfred:commands [project-name] [command-filter]',
  describe: 'Output Alfred-Friendly Response',
};

module.exports = lando => {
  task.run = ({projectName = undefined, commandFilter = undefined} = {}) => {
    if (typeof projectName !== 'string') {
      throw new Error('Proect name is required');
    }

    const path = require('path');

    return lando.app.get(projectName)
        .then(app => {
          if (typeof app !== 'object') {
            throw new Error('The project name you provided could not be loaded');
          }

          return app;
        })
        .then(app => {
          return {
            app, tasks: app.tasks.map(task => {
              const realCommand = task.command.split(' ', 1)[0];

              return {
                'title': task.command,
                'subtitle': 'Press Return to modify command or CMD+C to copy command.',
                'autocomplete': task.command,
                'arg': realCommand,
                'variables': {
                  'ALFRED_SELECTION_PROJECT': app.config.name,
                  'ALFRED_SELECTION_PROJECT_LOCATION': app.root,
                  'ALFRED_SELECTION_COMMAND': realCommand,
                },
                'text': {
                  'copy': `(cd ${app.root} && ${path.join(process.cwd(), 'lando')} ${realCommand} )`,
                },
              };
            }),
          };
        })
        .then(({app, tasks}) => {
          const tooling = [];

          if (typeof app.config.tooling === 'undefined') {
            return tasks;
          }

          Object.keys(app.config.tooling).forEach(function(command) {
            tooling.push({
              'title': command,
              'subtitle': 'Press Return to modify command or CMD+C to copy command.',
              'autocomplete': command,
              'arg': command,
              'variables': {
                'ALFRED_SELECTION_PROJECT': app.config.name,
                'ALFRED_SELECTION_PROJECT_LOCATION': app.root,
                'ALFRED_SELECTION_COMMAND': command,
              },
              'text': {
                'copy': `(cd ${app.root} && ${path.join(process.cwd(), 'lando')} ${command} )`,
              },
            });
          });

          return lando.node._.merge(tasks, tooling);
        })
        .then(alfredItems => {
          return alfredItems.filter(commandData => {
            const hasCommandFilter = (typeof commandFilter !== 'undefined');
            return !hasCommandFilter || commandData.title.includes(commandFilter);
          });
        })
        .then(alfredItems => {
          console.log(JSON.stringify({'items': alfredItems}));
        });
  };

  return task;
};
