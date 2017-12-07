#!/usr/bin/env node


var program = require('commander'),
    inquirer = require('inquirer'),
    fs      = require('fs'),
    path      = require('path'),
    git_lab = require('gitlab');

var sep = path.sep;
var config = {};
var options = {};
var repo_data = {};


function readConfigFile(){
	var filepath = __dirname + '/addrepo.json';
	try {
	  fileContents = fs.readFileSync(filepath);
	} catch (err) {
	  return false;
	}
	var obj = JSON.parse(fileContents, 'utf8');
	return obj;
}

function writeConfigFile(data){
	var json = JSON.stringify(data);
	fs.writeFileSync(__dirname+'/addrepo.json', json, 'utf8');	
	console.log('Config file successfully written.');
}

function gitClone(ssh_url_to_repo){
    var exec = require('child_process').exec;
    if(exec('cmd /c "git clone ' + ssh_url_to_repo + '"')){
        console.log('Repository cloned on folder "'+process.cwd()+sep+repo_data.path+'".');
    }
}

function outpuRepoUrl(){
    if( options.output_ssh){
        console.log(repo_data.ssh_url_to_repo);
    } 
    if( options.output_http){
        console.log(repo_data.http_url_to_repo);
    }
    if(!options.noclone){
        gitClone(repo_data.ssh_url_to_repo);
    }
}

function getRepoUrl(){
    gitlab.projects.show(repo_data.id, function (project) {

        if( options.assign != project.owner.id){
            console.log('Unable to assign project to group "'+options.assign+'".\n\nType "addrepo --help" for help.');
        }

        repo_data = project;

        if( options.output_ssh || options.output_http){
            outpuRepoUrl();
        }else{
            gitClone(repo_data.ssh_url_to_repo);
        }
    });
}

function assignToGroup() {
    gitlab.groups.addProject(options.assign, repo_data.id, function (response) {
        getRepoUrl();
    });
}

function createProject(callback) {
    gitlab.projects.create({
        "name": options.repo_name
    }, function (project) {

        if(project === true){
            console.log('The repository "'+options.repo_name+'" already exist.');
            return;
        }
       
        repo_data = project;
        
        console.log('New project id: '+repo_data.id);

        if(options.assign){
            assignToGroup(); //assignToGroup
        }else{
            outpuRepoUrl();
        }
    });
}

function init() {
    
    config = readConfigFile();

    program
        .usage('<repo name> [options]')
        .arguments('<reponame>')
        .option('-i, --initialize', 'Initialize the configuration file.')
        .option('-s, --output-ssh-url', 'Output SSH URL.')
        .option('-w, --output-html-url', 'Output HTTP URL.')
        .option('-n, --clone-no', 'Dont clone the repository.')
        .option('-a, --assign-to-team <team_id>', 'Assign repository to a user group. Need admin permissions.')
        .action(function(reponame) {
            options.repo_name = reponame.trim().replace(/[ ]/g, '-').replace(/(?:[^a-z0-9-]|^-|-$)/ig, '').toLowerCase();
        })
        .parse(process.argv);

        if(program.initialize || !config){

            if(!config){
                console.log('Configuration file missing. Initializing...\n');
            }

            var questions = [
                {
                  type: 'input',
                  name: 'gitlab_url',
                  default: config.gitlab_url||'https://gitlab.com/',
                  message: 'Input your GitLab URL:',
                  validate: function (value) {
                    if (value) {
                      return true;
                    } else {
                      return 'Please enter a valid GitLab URL.';
                    }
                  }
                },
                {
                  type: 'input',
                  name: 'gitlab_token',
                  message: 'Enter your GitLab Private Token:',
                  validate: function (value) {
                    if (value) {
                      return true;
                    } else {
                      return 'Please enter a valid GitLab Private Token.';
                    }
                  }
                }
              ];

              if(config){
                  questions[1].default = config.gitlab_token;
              }
            
              inquirer.prompt(questions).then(function (answers) {
                writeConfigFile(answers);
              });
        }else{

            gitlab = new git_lab({
                url: config.gitlab_url,
                token: config.gitlab_token
            });
            
            if(program.args[0]){
                options = {
                    repo_name: program.args[0],
                    assign: program.assignToTeam || false,
                    output_ssh: program.outputSshUrl || false,
                    output_http: program.outputHtmlUrl || false,
                    noclone: program.cloneNo || false
                };
                createProject();
            }else{
                console.log('Repository name is missing.\n\nType "addrepo --help" for help.');
            }
        }
}

init();