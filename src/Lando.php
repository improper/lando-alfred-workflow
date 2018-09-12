<?php

/**
 * Lando class file
 *
 * PHP Version 5.7
 *
 * @package    Nope
 *
 * @subpackage Aint_One
 *
 * @author     Tyler Mills <tylerssn@gmail.com>
 *
 * @copyright  2018 Tyler Mills
 *
 * @category   Meh
 *
 * @license    http://opensource.org/licenses/gpl-license.php GNU Public License
 *
 * @link       http://github.com/lando/lando
 */

namespace Workflow;

/**
 * Lando class
 *
 * The class holding the root Recipe class definition
 */
class Lando
{
    const USR_LOCAL_BIN_LANDO_OSX             = '/usr/local/bin/lando';
    const CACHE_KEY_CLI_LOCATION              = 'cli_local';
    const CACHE_KEY_CLI_PROJECT_LIST_RESPONSE = 'CLI_PROJECT_LIST_RESPONSE';
    const CACHE_CLI_PROJECT_COMMANDS          = 'CACHE_CLI_PROJECT_COMMANDS_';

    /**
     * @var bool Lando client path.
     */
    protected $cli;

    /**
     * @var Cache WorkFlow cache.
     */
    protected $cache;


    /**
     * Lando constructor.
     */
    public function __construct()
    {
        $this->cache = new Cache();
        $this->cli   = $this->getCliLocation();
    }//end __construct()


    /**
     * List Lando Projects
     *
     * @param string $filter Filter string passed from Alfred.
     *
     * @return false|string
     */
    public function listProjects(string $filter)
    {
        $alfredResponse = [];
        $filter         = trim($filter);

        $landoProjects = $this->getProjects();

        foreach ($landoProjects as $index => $info) {
            $landoProjects[$index]['title']        = $info['name'];
            $landoProjects[$index]['subtitle']     = $info['location'];
            $landoProjects[$index]['autocomplete'] = $info['name'];
            $landoProjects[$index]['arg']          = '';
            $landoProjects[$index]['variables']['ALFRED_SELECTION_PROJECT'] = $info['name'];
            $landoProjects[$index]['text']['copy'] = $info['location'];
        }

        if (false === empty($filter)) {
            $listResults = array_filter(
                $landoProjects,
                function ($project) use ($filter) {
                    return strpos($project['name'], $filter) !== false;
                }
            );
        } else {
            $listResults = $landoProjects;
        }

        $alfredResponse['items'] = (array) array_values($listResults);

        return json_encode($alfredResponse);
    }//end listProjects()


    /**
     * Returns Alfred Response with Command to Execute.
     *
     * @param string $command Command to execute.
     *
     * @return string
     */
    public function runCommand(string $command)
    {
        $project         = getenv('ALFRED_SELECTION_PROJECT');
        $projectLocation = getenv('ALFRED_SELECTION_PROJECT_LOCATION');

        $alfredItems = [[
            'title'    => 'Lando: '.$project,
            'subtitle' => sprintf('Execute: "lando %s" on %s', $command, $project),
            'arg'      => sprintf('(cd %s && %s %s)', $projectLocation, $this->cli, $command),
        ],
        ];

        $alfredResponse = ['items' => $alfredItems];

        return json_encode($alfredResponse);
    }//end runCommand()


    /**
     * Fetch a list of Lando Commands
     *
     * @param string $commandFilter Alfred Workflow input.
     *
     * @return false|string
     */
    public function listCommands(string $commandFilter)
    {
        $project = getenv('ALFRED_SELECTION_PROJECT');

        $projectData = $this->getProject($project);

        $defaultDir = getcwd();

        $projectCommands = $this->getCache($this->getProjectCacheCommandKey($project));

        if (false === $projectCommands) {
            chdir($projectData['location']);
            $this->exec('', $projectCommands);
            chdir($defaultDir);

            $this->cache->store($this->getProjectCacheCommandKey($project), $projectCommands);
        }

        $re = '/^(?:\ {2})\K(?:[a-zA-Z].*?(?=\s{2}))/m';
        preg_match_all($re, $projectCommands, $commands, PREG_SET_ORDER, 0);

        $commands = array_map(
            function ($command) {
                return trim($command[0]);
            },
            $commands
        );

        if (false === empty($commandFilter)) {
            $commands = array_filter(
                $commands,
                function ($command) use ($commandFilter) {
                    return strpos($command, $commandFilter) !== false;
                }
            );
        }

        sort($commands);

        $alfredItems = array_map(
            function ($command) use ($project, $projectData) {
                $realCommand = explode(' ', $command, 2)[0];

                return [
                    'title'        => $command,
                    'subtitle'     => 'Press tab or enter to add parameters or CMD+C to copy command.',
                    'autocomplete' => $command,
                    'arg'          => preg_replace('/\[(.*)\]/', '', $command),
                    'variables'    => [
                        'ALFRED_SELECTION_PROJECT'          => $projectData['name'],
                        'ALFRED_SELECTION_PROJECT_LOCATION' => $projectData['location'],
                        'ALFRED_SELECTION_COMMAND'          => $command,
                    ],
                    'text'         => [
                        'copy' => sprintf(
                            '(cd %s && %s %s %s)',
                            $projectData['location'],
                            $this->cli,
                            $realCommand,
                            $project
                        ),
                    ],
                ];
            },
            $commands
        );

        $alfredResponse = ['items' => $alfredItems];

        return json_encode($alfredResponse);
    }//end listCommands()


    /**
     * Execute Lando command.
     *
     * @param string $command  Command to execute.
     * @param string $response Command output.
     *
     * @return void
     */
    public function exec(string $command, string &$response = '')
    {
        $preserveErrorOutput = ' 2>&1';
        $response            = shell_exec($this->cli.' '.$command.$preserveErrorOutput);
    }//end exec()


    /**
     * Get file path of Lando client
     *
     * @return boolean
     */
    public function getCliLocation()
    {
        $key = self::CACHE_KEY_CLI_LOCATION;

        $location = $this->getCache($key);

        if (null === $location || false === $location) {
            $location = shell_exec('which lando');
        }

        if (null === $location) {
            $location = self::USR_LOCAL_BIN_LANDO_OSX;
        }

        $this->cache->store($key, $location);

        return trim($location);
    }//end getCliLocation()


    /**
     * Fetch cached data by key.
     *
     * @param string $key Cache key.
     *
     * @return mixed|string|false
     */
    public function getCache(string $key)
    {
        $cacheCliLocation = $this->cache->retrieve($key);
        if (false !== empty($cacheCliLocation) || null !== $cacheCliLocation) {
            return $cacheCliLocation;
        }

        return false;
    }//end getCache()


    /**
     * Get all Lando projects.
     *
     * @return mixed
     */
    public function getProjects(): array
    {
        $landoProjects = $this->getCache(self::CACHE_KEY_CLI_PROJECT_LIST_RESPONSE);

        if (false === $landoProjects) {
            $this->exec('list', $landoProjects);
            $landoProjects = json_decode($landoProjects, true);
        }

        $this->cache->store(self::CACHE_KEY_CLI_PROJECT_LIST_RESPONSE, $landoProjects);

        return $landoProjects;
    }//end getProjects()


    /**
     * Get project data.
     *
     * @param string $project Get project data.
     *
     * @return array
     */
    public function getProject(string $project)
    {
        $projects = $this->getProjects();
        $project  = array_filter(
            $projects,
            function ($projectInfo) use ($project) {
                return $projectInfo['name'] === $project;
            }
        );

        // Get first element of multidimensional array.
        return $project[array_keys($project)[0]];
    }//end getProject()


    /**
     * Get project command cache key.
     *
     * @param string $project Unique identifier to fetch cache for project command.
     *
     * @return string
     */
    public function getProjectCacheCommandKey(string $project): string
    {
        return self::CACHE_CLI_PROJECT_COMMANDS.$project;
    }//end getProjectCacheCommandKey()
}//end class
