# addrepo

Minimal CLI wrapper for [node-gitlab] package to easy creating new repositories on a GitLab server and clone it localy, all in a single command.

```
addrepo my-new-repository
```

>**IMPORTANT**: You need to have a SSH key propertly configured in your local machine and on GitLab server to be able to clone the repository after is created.


## Options


  Usage: addrepo <repo name> [options]


  Options:

    -i, --initialize                Initialize the configuration file.
    -s, --output-ssh-url            Output SSH URL.
    -w, --output-html-url           Output HTTP URL.
    -n, --clone-no                  Dont clone the repository.
    -a, --assign-to-team <team_id>  Assign repository to a user group. Need admin permissions.
    -h, --help                      output usage information


## Install

```
npm install addrepo -g
```
>**Note**: You must install this package globally to be able to use it anywhere from the CLI.


## Configuration

Use this command to initialize the configurtation process:
```
addrepo -i
``` 

The configuration process will ask you:
1. Your GitLab server domain name. Ex.: http://gitlab.com
2. Your Private Token number.

>A JSON configuration file named **addrepo.json** will be saved on the package install folder at ```%APPDATA%\npm\node_modules\addrepo```.

## How to use

### Initialize the configuration file
```
addrepo -i
```

### Create a new repository
```
addrepo my-new-repository
```
>**Note**: If there is already a repository with the same name for the current user, the action will fail. 

### Create a repository, dont clone it, and output the HTTP url
```
addrepo my-new-repository -n -w
```

### Create a repository, and assign it to a user group by ID number
This option require admin permissions in the configured user.

```
addrepo my-new-repository -a 67
```

>**Note**: If the current user dont have permisions to assign a project to a uer group, the project will be created on the current user.


[node-gitlab]: https://github.com/node-gitlab/node-gitlab

