# Alfred Workflow for Lando

Quickly execute Lando commands within project scope via ALfred with this Lando plugin.

- [How It Works](#how-it-works)
- [Install Instructions](#install)

## How it Works

1. List Projects

   ![Lando Workflow Keyword](https://github.com/improper/lando-alfred-workflow/blob/master/docs/images/Screen%20Shot%202018-09-14%20at%202.41.34%20PM.png)

2. Autocomplete & a Project

   ![Project Selection](https://github.com/improper/lando-alfred-workflow/blob/master/docs/images/Screen%20Shot%202018-09-14%20at%202.41.57%20PM.png)

3. List Project-scope commands 

   ![](https://github.com/improper/lando-alfred-workflow/blob/master/docs/images/Screen%20Shot%202018-09-14%20at%202.42.09%20PM.png)

4. Select a project command and add arguments

   ![](https://github.com/improper/lando-alfred-workflow/blob/master/docs/images/Screen%20Shot%202018-09-14%20at%202.42.31%20PM.png)

5. Copy the command with CMD+C or Press Return to Execute

   ![](https://github.com/improper/lando-alfred-workflow/blob/master/docs/images/Screen%20Shot%202018-09-14%20at%202.49.15%20PM.png)

## Install

Alfred can only implement this plugin if it is installed as a global Lando plugin in `~/.lando/`

1. Download to global plugin directory
   
   `git clone https://github.com/improper/lando-alfred-workflow ~/.lando/plugins/lando-plugin-alfred-workflow`

2. Create `~/.lando/config.yml` and append:

   ```yaml
   plugins:
     - lando-plugin-alfred-workflow
   ```
3. Install by running: `lando alfred`

## Alfred Workflow Examples

Keyword: lando
 - Result: List Projects
 - Select Project
    - Action: CMD+C - Copies Project to Clipboard
    - Actions TAB/RETURN: Triggers "lando {project-name}" keyword
    
Keyword: lando {project-name}
 - Result: List Project Tooling (Including custom tools)
 - Select Tooling Command
    - Action: CMD+C - Copies project-scope command to Clipboard
    - Actions RETURN: Triggers Lando Command Execution Mode
    
Lando Command Execution Mode
 - Result: Locks into command. Anything typed into Alfred at this point will be executed in the Lando cli within project scope.
   - Example: `ssh -u root -c 'apt update'` followed by RETURN key will execute: `(cd /user/project-path && /usr/local/bin/lando ssh -u root -c 'apt update')`
   - Example: `ssh -u root -c 'apt update'` followed by CMD+X key will copy: `(cd /user/project-path && /usr/local/bin/lando ssh -u root -c 'apt update')`


## To Do

1. Implement tests
