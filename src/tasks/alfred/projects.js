'use strict';

const task = {
  command: 'alfred:projects [project-name-filter]',
  describe: 'Output Alfred-Friendly Response',
};

module.exports = lando => {
  task.run = ({projectNameFilter = undefined} = {}) => {
    const COMMAND_LIST = 'list';
    const taskList = lando.tasks.tasks;
    let listTask;

    taskList.forEach(function(task) {
      const commandId = task.command.split(' ', 1)[0];
      if (commandId !== COMMAND_LIST) {
        return;
      }
      listTask = task;
    });

    if (typeof listTask === 'undefined') {
      return {};
    }

    return lando.app.list()
        .filter(app => {
          const hasProjectFilter = (typeof projectNameFilter !== 'undefined');
          return !hasProjectFilter || app.name.includes(projectNameFilter);
        })
        .map(app => {
          const running = app.running ? 'Running' : 'Stopped';

          return {
            'name': app.name,
            'title': app.name,
            'location': app.dir,
            'subtitle': `${running} | ${app.dir}`,
            'autocomplete': app.name,
            'arg': '',
            'variables': {'ALFRED_SELECTION_PROJECT': app.name},
            'text': {'copy': app.dir},
          };
        })
        .then(alfredItems => {
          return {'items': alfredItems};
        })
        .then(alfredResponse => {
          console.log(JSON.stringify(alfredResponse, null, 2));
        });
  };

  return task;
};
