# Opentrons Desktop Shell

[![JavaScript Style Guide][style-guide-badge]][style-guide]

> Desktop application wrapper for the [Opentrons App](../app) using Electron

## overview

This directory contains the code for the [Electron main process][electron-main] that runs the Opentrons application.

### configuration

The app uses [`electron-store`][electron-store] to store its configuration in a JSON file located at:

* `%APPDATA%\Opentrons\config.json` on Windows
* `~/.config/Opentrons/config.json` on Linux
* `~/Library/Application Support/Opentrons/config.json` on macOS

Configuration values will be determined by:

1.  Checking for a CLI argument
2.  If no CLI argument, checking for an environment variable
3.  If no environment variable, checking the `config.json` file
4.  If no value in `config.json`, default value from code will be used
    * Default value will also be written to `config.json`

**If overriding boolean values**:

* For CLI arguments, use `--value` for true, and `--disable_value` for false
* For environment variables, use `OT_APP_VALUE=1` for true, and `OT_APP_VALUE=0` for false

<!-- TODO(mc, 2018-05-16): generate this section from lib/config.js -->

#### settings

##### devtools

* CLI argument: `--devtools` or `--disable_devtools`
* Environment variable: `OT_APP_DEVTOOLS`
* JSON path: `devtools`
* Default: `false`

Enables and opens the Chrome devtools.

##### log.level.file

* CLI argument: `--log.level.file`
* Environment variable: `OT_APP_LOG__LEVEL__FILE`
* JSON path: `log.level.file`
* Default: `"debug"`

Default log level of the `combined.log` log file. See logging section below.

##### log.level.console

* CLI argument: `--log.level.console`
* Environment variable: `OT_APP_LOG__LEVEL__CONSOLE`
* JSON path: `log.level.console`
* Default: `"info"`

Default log level of the console log. See logging section below.

##### ui.webPreferences.webSecurity

* CLI argument: `--ui.webPreferences.webSecurity` or `--disable_ui.webPreferences.webSecurity`
* Environment variable: `OT_APP_UI__WEB_PREFERENCES__WEB_SECURITY`
* JSON path: `ui.webPreferences.webSecurity`
* Default: `true`

Sets the `webPreferences.webSecurity` option of the Electron [BrowserWindow][electron-docs-browser-window] created for the UI. When disabled, the browsers same-origin policy will be disabled. This should only be disabled in development / testing environments.

##### ui.width

* CLI argument: `--ui.width`
* Environment variable: `OT_APP_UI__WIDTH`
* JSON path: `ui.width`
* Default: `1024`

[BrowserWindow][electron-docs-browser-window] width at launch.

##### ui.height

* CLI argument: `--ui.height`
* Environment variable: `OT_APP_UI__HEIGHT`
* JSON path: `ui.height`
* Default: `768`

[BrowserWindow][electron-docs-browser-window] height at launch.

##### ui.url.protocol

* CLI argument: `--ui.url.protocol`
* Environment variable: `OT_APP_UI__URL__PROTOCOL`
* JSON path: `ui.url.protocol`
* Default: `"file:"`

Protocol used to fetch the UI's `index.html`. If you want to fetch the UI from the dev server in [`app`](../app), set this to `http:`.

##### ui.url.path

* CLI argument: `--ui.url.path`
* Environment variable: `OT_APP_UI__URL__PATH`
* JSON path: `ui.url.path`
* Default: `"ui/index.html"`

Path to `index.html`. If `ui.url.protocol` is `file:`, this path is relative to the [application directory][electron-docs-get-app-path]. This path will be combined with the protocol to get the full path to `index.html`. If you want to fetch the UI from the dev server in [`app`](../app), set this to `localhost:8090`.

### logging

Logs from both the main and renderer processes are logged to rolling files as well as the terminal by [winston][winston]. The logs are stored in a `logs` directory at:

* `%APPDATA%\Opentrons\logs` on Windows
* `~/.config/Opentrons/logs` on Linux
* `~/Library/Application Support/Opentrons/logs` on macOS

#### available log levels

* error
* warn
* info
* http
* verbose
* debug
* silly

#### logs written

* `logs/combined.log` - JSON logs at level `log.level.file` and above
* `logs/error.log` - JSON logs at level `error` and above
* Console - Human-readable logs at level `log.level.console` and above

## developing

To get started: clone the Opentrons/opentrons repository, set up your computer for development as specified in the [project readme][project-readme-setup], and then:

```shell
# prerequisite: install dependencies as specified in project setup
make install
# change into the app-shell directory
cd app-shell
# install dependencies
make install
# launch the electron app in dev mode
make dev
```

You probably want to be developing from the [app directory](../app) instead. Its `make dev` task will automatically call `make dev` here in `app-shell`.

### stack and structure

The desktop application shell uses:

* [Electron][]
* [Electron Builder][electron-builder]

### testing

The desktop shell has no tests at this time.

## building

This section details production build instructions for the desktop application.

### build dependencies

`electron-builder` requires some native dependencies to build and package the app (see [the electron-builder docs][electron-builder-platforms]).

* macOS - None
* Windows - None
* Linux - icnsutils, graphicsmagick, and xz-utils

  ```shell
  sudo apt-get install --no-install-recommends -y icnsutils graphicsmagick xz-utils
  ```

### build tasks

* `make` - Default target is "clean package"
* `make clean` - Delete the dist folder
* `make package` - Creates a production package of the app for running and inspection (does not create a distributable)

#### production builds

All packages and/or distributables will be placed in `app-shell/dist`. After running `make package`, you can launch the production app with:

* macOS: `./dist/mac/Opentrons.app/Contents/MacOS/Opentrons`
* Linux: `./dist/linux-unpacked/opentrons`
* Windows: `./dist/win-unpacked/Opentrons.exe`

To run the production app in debug mode, set the `DEBUG` environment variable. For example, on macOS:

```shell
DEBUG=1 ./dist/mac/Opentrons.app/Contents/MacOS/Opentrons
```

#### ci

There are a series of tasks designed to be run in CI to create distributable versions of the app.

```shell
# Create a macOS distributable of the app
make dist-osx OT_BUCKET_APP=opentrons-app OT_FOLDER_APP=builds

# Create a Linux distributable of the app
make dist-linux OT_BUCKET_APP=opentrons-app OT_FOLDER_APP=builds

# Create macOS and Linux apps simultaneously
make dist-posix OT_BUCKET_APP=opentrons-app OT_FOLDER_APP=builds

# Create a Windows distributable of the app
make dist-win OT_BUCKET_APP=opentrons-app OT_FOLDER_APP=builds
```

These tasks use the following environment variables defined:

<!-- TODO(mc, 2018-05-16): update bucket / folder vars to use config prefix -->
| name          | description   | required | description                            |
| ------------- | ------------- | -------- | -------------------------------------- |
| OT_BUCKET_APP | AWS S3 bucket | yes      | Artifact deploy bucket                 |
| OT_FOLDER_APP | AWS S3 folder | yes      | Artifact deploy folder in bucket       |
| OT_BRANCH     | Branch name   | no       | Sometimes added to the artifact name   |
| OT_BUILD      | Build number  | no       | Appended to the artifact name          |
| OT_TAG        | Tag name      | no       | Flags autoupdate files to be published |

The release channel is set according to the version string:

* `vM.m.p-alpha.x` - "alpha" channel
* `vM.m.p-beta.x` - "beta" channel
* `vM.m.p` - "latest" channel

The `electron-updater` autoupdate files (e.g. `beta-mac.yml`) will only be copied to the publish directory if `OT_TAG` is set.

[style-guide]: https://standardjs.com
[style-guide-badge]: https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square&maxAge=3600
[project-readme-setup]: ../README.md#set-up-your-development-environment
[electron]: https://electron.atom.io/
[electron-main]: https://electronjs.org/docs/tutorial/quick-start#main-process
[electron-builder]: https://www.electron.build/
[electron-builder-platforms]: https://www.electron.build/multi-platform-build
[electron-store]: https://github.com/sindresorhus/electron-store
[electron-docs-browser-window]: https://electronjs.org/docs/api/browser-window#new-browserwindowoptions
[electron-docs-get-app-path]: https://electronjs.org/docs/api/app#appgetapppath
[winston]: https://github.com/winstonjs/winston
