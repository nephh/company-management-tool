# Company Management Tool (Module 12 Challenge)

[![License Badge](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A simple CLI tool utilizing mySQL to store and keep track of employee records and info.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [A Note and Improvements](#a-note-and-improvements)
- [Credits](#credits)
- [License](#license)
- [Questions and Contact](#questions-and-contact)

## Installation

1. Clone the repository containing the SVG generator app to your local machine.

   ```bash
   git clone <repository_url>
   cd <project_directory>
   ```

2. Install the project's dependencies by running:
   ```bash
   npm install
   ```

## Usage

This is a simple CLI tool that will allow you to store your employee's information in a mySQL database, and allow you to view and edit that information.

1. Run the program with node using

   ```bash
   node index.js
   ```

2. Follow the onscreen prompts to view and manipulate the data as you see fit :)

## A Note and Improvements

I decided to use the latest version of Inquirer which is an ES6 module, so this program uses the ES6 syntax to import the dependencies. This allows me to use inquirer prompts as async/await functions and really helps clean up the code. It is also what allowed me to easily create nested "list" prompts that use choices based off the mySQL queries, and create custom titles for the table columns. The inquirer documentation was great and overall it was a simple implementation that I think improves the readability quite a bit.

There are a few things I would change/add to this project. 

1. I would have implemented an "isManager" boolean on the employees, which would make getting the managers to list super easy and not dependant on having a manager_id or not. 

2. I would then add a prompt to change an employee to a manager, this would improve the tool if the user needed to delete or change the actual managers of the company. As of right now, we rely on assuming the user knows the schema of our database.

3. I did however decide to add AUTO INCREMENT to the ids of each table, as this just made grabbing and making new IDs super easy. If this an actual tool in production I would add UUIDs. Simple to implement but would have muddied up the code a bit so I decided against it. Using sequelize would make this trivial.

I didn't implement these changes because we were given the schema to use and I did not want to change more than I did, but those were my ideas!

## Credits

N/A

## License

This project is licensed under the terms of the [MIT License](https://opensource.org/licenses/MIT).

You can find the full license text in the [LICENSE](LICENSE) file.

## Questions and Contact

Thank you for checking out the project!

If you have any questions or need further assistance with this project, feel free to reach out. You can contact me through the following methods:

- **GitHub Issues**: Please use the Github Issue Tracker for bug reports, feature requests, or general questions related to the project. You can find my Github profile @[nephh](https://github.com/nephh)
