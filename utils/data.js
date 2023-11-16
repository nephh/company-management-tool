import { select, input, confirm } from "@inquirer/prompts";
import init from "../index.js";
import chalk from "chalk";
import "console.table";
import "dotenv/config";
import {
  getEmployees,
  getDepartments,
  getManagers,
  getRoles,
  db,
} from "./queries.js";

export default async function sql(data) {
  const allDepartments = await getDepartments();
  const allEmployees = await getEmployees();
  const allRoles = await getRoles();
  const allManagers = await getManagers();

  // We pass in the users main menu answer, handle the sql queries, and display the data in a table
  switch (data) {
    case "View all departments":
      const names = allDepartments.map((department) => {
        return { ID: department.value, Department: department.name };
      });
      console.table(names);
      break;

    case "View all roles":
      db.query(
        "SELECT title, role.id, salary, name FROM role LEFT JOIN department ON role.department_key = department.id ORDER BY role.id",
        (err, results) => {
          const roles = results.map((role) => {
            return {
              ID: role.id,
              Role: role.title,
              Salary: role.salary,
              Department: role.name
                ? role.name
                : chalk.red("No Department found"),
            };
          });
          console.table(roles);
        }
      );
      break;

    case "View all employees":
      db.query(
        `SELECT first_name, last_name, employee.id, manager_id, name, title, salary FROM employee LEFT JOIN role ON employee.role_id = role.id 
        LEFT JOIN department ON role.department_key = department.id ORDER BY employee.id`,
        (err, results) => {
          const names = results.map((employee) => {
            let manager = "None";
            for (const result of results) {
              if (result.id === employee.manager_id) {
                manager = `${result.first_name} ${result.last_name}`;
              }
            }
            return {
              ID: employee.id,
              Name: `${employee.first_name} ${employee.last_name}`,
              Manager: manager,
              Role: employee.title
                ? employee.title
                : chalk.red("No role found"),
              Department: employee.name
                ? employee.name
                : chalk.red("No department found"),
              Salary: employee.salary
                ? employee.salary
                : chalk.red("No salary found"),
            };
          });
          console.table(names);
        }
      );
      break;

      // We are able to nest prompts to the user for a more interactive menu
    case "Add a department":
      const newDepartment = await input({
        message: chalk.bold.magenta(
          "Enter the name of the department you would like to add."
        ),
      });
      db.query(`INSERT INTO department (name) VALUES ('${newDepartment}');`);
      console.log(
        `${chalk.bold.yellow(newDepartment)} ${chalk.bold.magenta(
          "successfully added as a new department."
        )}`
      );
      break;

    case "Add a role":
      const newRole = {
        role: await input({
          message: chalk.bold.magenta(
            "Enter the title of the role you would like to add."
          ),
        }),
        salary: await input({
          message: chalk.bold.magenta(
            "Enter the yearly salary of the role you would like to add."
          ),
        }),
        department: await select({
          message: chalk.bold.magenta(
            "Enter the department this role belongs to."
          ),
          choices: allDepartments,
        }),
      };
      db.query(
        `INSERT INTO role (title, salary, department_key) VALUES ('${newRole.role}', '${newRole.salary}', '${newRole.department}');`
      );
      console.log(
        `${chalk.bold.yellow(newRole.role)} ${chalk.bold.magenta(
          "successfully added as a new role."
        )}`
      );
      break;

    case "Add an employee":
      allEmployees.push({ name: chalk.red("None"), value: 0 });
      const newEmployee = {
        firstName: await input({
          message: chalk.bold.magenta("Enter the employee's first name."),
        }),
        lastName: await input({
          message: chalk.bold.magenta("Enter the employee's last name."),
        }),
        role: await select({
          message: chalk.bold.magenta("Enter the role for this employee."),
          choices: allRoles,
        }),
        manager: await select({
          message: chalk.bold.magenta(
            "Select the manager of this employee if applicable."
          ),
          choices: allManagers,
          pageSize: allManagers.length,
        }),
      };

      console.log(
        `${chalk.bold.yellow(newEmployee.firstName)} ${chalk.bold.yellow(
          newEmployee.lastName
        )} ${chalk.bold.magenta("successfully added as a new employee.")}`
      );

      if (newEmployee.manager) {
        db.query(
          `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES 
          ('${newEmployee.firstName}', '${newEmployee.lastName}', '${newEmployee.role}', '${newEmployee.manager}');`
        );
        break;
      }
      db.query(
        `INSERT INTO employee (first_name, last_name, role_id) VALUES ('${newEmployee.firstName}', '${newEmployee.lastName}', '${newEmployee.role}');`
      );
      break;

    case "Update an employee role":
      const update = {
        employee: await select({
          message: chalk.bold.magenta("What employee would you like to edit?"),
          choices: allEmployees,
          pageSize: allEmployees.length,
        }),
        role: await select({
          message: chalk.bold.magenta(
            "What role would you like to change the employee to?"
          ),
          choices: allRoles,
        }),
      };
      db.query(
        `UPDATE employee SET role_id = ${update.role} WHERE id = ${update.employee};`
      );
      console.log(chalk.bold.yellow("Employee Role Updated"));
      break;

    case "Update an employee's manager":
      const newManager = {
        employee: await select({
          message: chalk.bold.magenta("What employee would you like to edit?"),
          choices: allEmployees,
          pageSize: allEmployees.length,
        }),
        manager: await select({
          message: chalk.bold.magenta(
            "What manager would you like to assign to the employee?"
          ),
          choices: allManagers,
          pageSize: allManagers.length,
        }),
      };
      db.query(
        `UPDATE employee SET manager_id = ${newManager.manager} WHERE id = ${newManager.employee}`
      );
      console.log(chalk.bold.yellow("Employee Manager Updated"));
      break;

    case "View employee's by manager":
      const managers = await select({
        message: chalk.bold.magenta("What manager would you like to view?"),
        choices: allManagers,
        pageSize: allManagers.length,
      });
      db.query(
        `SELECT first_name, last_name, employee.id, manager_id, name, title, salary FROM employee LEFT JOIN role ON employee.role_id = role.id 
        LEFT JOIN department ON role.department_key = department.id WHERE manager_id = ${managers} ORDER BY employee.id`,
        (err, results) => {
          const names = results.map((employee) => {
            return {
              ID: employee.id,
              Name: `${employee.first_name} ${employee.last_name}`,
              Role: employee.title
                ? employee.title
                : chalk.red("No role found"),
              Department: employee.name
                ? employee.name
                : chalk.red("No department found"),
              Salary: employee.salary
                ? employee.salary
                : chalk.red("No salary found"),
            };
          });
          console.table(names);
        }
      );
      break;

    case "View employee's by department":
      const departments = await select({
        message: chalk.bold.magenta("What department would you like to view?"),
        choices: allDepartments,
        pageSize: allDepartments.length,
      });

      db.query(
        `SELECT first_name, last_name, employee.id, manager_id, name, title, salary FROM employee LEFT JOIN role ON employee.role_id = role.id 
        LEFT JOIN department ON role.department_key = department.id WHERE department.id = ${departments} ORDER BY employee.id`,
        (err, results) => {
          const names = results.map((employee) => {
            const manager_id = employee.manager_id;
            const manager = allEmployees[manager_id - 1];

            return {
              ID: employee.id,
              Name: `${employee.first_name} ${employee.last_name}`,
              Manager: manager ? manager.name : "None",
              Role: employee.title,
              Salary: employee.salary,
            };
          });
          console.table(names);
        }
      );
      break;

    case "Remove a department, role, or employee from the database":
      const remove = await select({
        message: chalk.bold.magenta("What would you like to remove?"),
        choices: [
          { value: "Department" },
          { value: "Role" },
          { value: "Employee" },
        ],
      });

      switch (remove) {
        case "Department":
          const department = await select({
            message: chalk.bold.magenta(
              "What department would you like to remove?"
            ),
            choices: allDepartments,
            pageSize: allDepartments.length,
          });

          db.query(
            `DELETE FROM department WHERE id=${department}`,
            (err, results) => {
              console.log(chalk.red("Department successfully removed!"));
            }
          );
          break;
        case "Role":
          const role = await select({
            message: chalk.bold.magenta("What role would you like to remove?"),
            choices: allRoles,
            pageSize: allRoles.length,
          });
          db.query(`DELETE FROM role WHERE id=${role}`, (err, results) => {
            console.log(chalk.red("Role successfully removed!"));
          });
          break;
        case "Employee":
          const employee = await select({
            message: chalk.bold.magenta("What employee you like to remove?"),
            choices: allEmployees,
            pageSize: allEmployees.length,
          });
          db.query(
            `DELETE FROM employee WHERE id=${employee}`,
            (err, results) => {
              console.log(chalk.red("Employee successfully removed!"));
            }
          );
          break;
      }
      break;
    case "View total budget of department (Sum of salaries)":
      const department = await select({
        message: "What department would you like to see the budget of?",
        choices: allDepartments,
        pageSize: allDepartments.length,
      });

      db.query(
        `SELECT name as Department, Sum(salary) as "Total Budget", Count(employee.id) as "# of employees" FROM employee 
        JOIN department ON employee.role_id = department.id JOIN role ON employee.role_id = role.id WHERE department.id=${department};`,
        (err, results) => {
          console.table(results);
        }
      );
      break;
  }
  // Allow the data to render to the user, and then allow the user to continue or quit
  setTimeout(() => {
    exit();
  }, 400);
}

// Handle exit or go back to main menu
async function exit() {
  const exits = await confirm(
    {
      message: chalk.bold.blue("Want to do anything else?"),
      default: true,
    },
    { clearPromptOnDone: true }
  );

  if (exits) {
    return init();
  }
  process.exit();
}
