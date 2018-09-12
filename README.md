# Alfred Workflow for Lando

An Alfred Workflow for quickly executing Lando commands within project scope.

> This workflow implements PHP

## Install

1. Prepare Package

   - Clone Repository
   - `lando composer install`
   
2. Install Workflow

   - Open `Lando.alfredworkflow`
   
3. Click "Configure workflow and Variables"

   - Set `WORKFLOW_HOME` to the full path to this `index.php`

## Examples

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
