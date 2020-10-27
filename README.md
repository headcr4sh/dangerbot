DangerBot
=========

Development
-----------

### Getting started

* Install [Node.js](https://nodejs.org/)
* Install [Visual Studio Code](https://code.visualstudio.com/)
* Clone the source code:
  ```
  git clone git@github.com:/headcr4sh/dangerbot
  ```
* Initially run `npm install` in the project folder to install/update dependencies and compile the project.


### Build

In Visual Studio Code press *Ctrl-Shift-B* to start the compiler in watch mode. This compiles the TypeScript sources in the `src` folder to JavaScript in the `lib` folder. It also watches the `src` folder for changes so changed files are compiled on-save.

Alternatively you can run `npm run compile` to compile the project once or run `npm run watch` to compile with watch mode on command line. `npm run clean` removes the compiled files from the project. `npm install` also does a clean and compile after updating dependencies.


### Run

Before starting the bot you have to put your development Discord Bot token into the environment variable `DANGERBOT_DISCORD_TOKEN`.

Now start the Bot with `npm start`. This also watches the `lib` directory for changes and automatically restarts the server when a change has been detected.
