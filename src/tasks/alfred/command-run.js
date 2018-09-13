'use strict';

const task = {
  command: 'alfred:command:run [project-name]',
  describe: 'Execute command from within project root',
  options: {
    command: {
      describe: 'Run a command on the Lando app',
      alias: ['c'],
    },
  },
};

module.exports = lando => {
  task.run = ({projectName = undefined, command = undefined} = {}) => {
    if (typeof projectName !== 'string') {
      throw new Error('Project name is required');
    }

    if (typeof command !== 'string') {
      throw new Error('Command is required');
    }

    return lando.app.get(projectName)
        .then(app => {
          if (typeof app !== 'object') {
            throw new Error('The project name you provided could not be loaded');
          }

          const landoExe = process.env._;
          const realCommand = `(cd ${app.root} && ${landoExe} ${command} )`;
          return {
            'title': `Lando: ${app.config.name}`,
            'subtitle': `Execute: "lando ${command}" on ${app.config.name}'`,
            'arg': realCommand,
            'text': {
              'copy': realCommand,
            },
          };
        })
        .then(alfredItems => {
          console.log(JSON.stringify({'items': [alfredItems]}));
        });
  };

  return task;
};
