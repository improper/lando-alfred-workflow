<?php
/**
 * Provide the Workflow classes.
 *
 * PHP version 7.2
 *
 * Entry file for Alfred Workflow
 *
 * @category Alfred_Workflow_Application
 *
 * @author   Tyler Mills <tylerssn@gmail.com>
 *
 * @license  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 *
 * @see     https://docs.devwithlando.io/installation/installing.html
 */
require_once 'vendor/autoload.php';

if (PHP_SAPI !== 'cli') {
    echo '<h1>Lando Alfred Workflow</h1>';
    echo 'Hey, take a look at the readme. Nothing to see here.';
}
