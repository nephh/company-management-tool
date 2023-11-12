import { select, input, confirm } from "@inquirer/prompts";
import mysql from "mysql2";
import "console.table";
import "dotenv/config";
import {
  getEmployees,
  getDepartments,
  getManagers,
  getRoles,
} from "./queries.js";
import init from "../index.js";

const db = mysql.createConnection({
  host: "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

export default async function sql(data) {
  const allDepartments = await getDepartments();
  const allEmployees = await getEmployees();
  const allRoles = await getRoles();
  const allManagers = await getManagers();

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
              Department: role.name ? role.name : "No Department found",
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
            const manager_id = employee.manager_id;
            const manager = results[manager_id - 1];

            return {
              ID: employee.id,
              Name: `${employee.first_name} ${employee.last_name}`,
              Manager: manager
                ? `${manager.first_name} ${manager.last_name}`
                : "None",
              Role: employee.title ? employee.title : "No role found",
              Department: employee.name ? employee.name : "No department found",
              Salary: employee.salary ? employee.salary : "No salary found",
            };
          });
          console.table(names);
        }
      );
      break;

    case "Add a department":
      const newDepartment = await input({
        message: "Enter the name of the department you would like to add.",
      });
      db.query(`INSERT INTO department (name) VALUES ('${newDepartment}');`);
      break;

    case "Add a role":
      const newRole = {
        role: await input({
          message: "Enter the title of the role you would like to add.",
        }),
        salary: await input({
          message: "Enter the yearly salary of the role you would like to add.",
        }),
        department: await select({
          message: "Enter the department this role belongs to.",
          choices: allDepartments,
        }),
      };
      db.query(
        `INSERT INTO role (title, salary, department_key) VALUES ('${newRole.role}', '${newRole.salary}', '${newRole.department}');`
      );
      break;

    case "Add an employee":
      allEmployees.push({ name: "None", value: 0 });
      const newEmployee = {
        firstName: await input({
          message: "Enter the employee's first name.",
        }),
        lastName: await input({
          message: "Enter the employee's last name.",
        }),
        role: await select({
          message: "Enter the role for this employee.",
          choices: allRoles,
        }),
        manager: await select({
          message: "Select the manager of this employee if applicable.",
          choices: allEmployees,
        }),
      };
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
          message: "What employee would you like to edit?",
          choices: allEmployees,
        }),
        role: await select({
          message: "What role would you like to change the employee to?",
          choices: allRoles,
        }),
      };
      db.query(
        `UPDATE employee SET role_id = ${update.role} WHERE id = ${update.employee};`
      );
      break;

    case "Update an employee's manager":
      const newManager = {
        employee: await select({
          message: "What employee would you like to edit?",
          choices: allEmployees,
        }),
        manager: await select({
          message: "What manager would you like to assign to the employee?",
          choices: allEmployees,
        }),
      };

      db.query(
        `UPDATE employee SET manager_id = ${newManager.manager} WHERE id = ${newManager.employee}`
      );
      break;

    case "View employee's by manager":
      const managers = await select({
        message: "What manager would you like to view?",
        choices: allManagers,
      });
      db.query(
        `SELECT first_name, last_name, employee.id, manager_id, name, title, salary FROM employee LEFT JOIN role ON employee.role_id = role.id 
        LEFT JOIN department ON role.department_key = department.id WHERE manager_id = ${managers} ORDER BY employee.id`,
        (err, results) => {
          const names = results.map((employee) => {
            return {
              ID: employee.id,
              Name: `${employee.first_name} ${employee.last_name}`,
              Role: employee.title,
              Department: employee.name,
              Salary: employee.salary,
            };
          });
          console.table(names);
        }
      );
      break;

    case "View employee's by department":
      const departments = await select({
        message: "What department would you like to view?",
        choices: allDepartments,
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
        message: "What would you like to remove?",
        choices: [
          { value: "Department" },
          { value: "Role" },
          { value: "Employee" },
        ],
      });

      switch (remove) {
        case "Department":
          const department = await select({
            message: "What department would you like to remove?",
            choices: allDepartments,
          });

          db.query(
            `DELETE FROM department WHERE id=${department}`,
            (err, results) => {
              console.log("Department successfully removed!");
            }
          );
          break;
        case "Role":
          const role = await select({
            message: "What role would you like to remove?",
            choices: allRoles,
          });
          db.query(`DELETE FROM role WHERE id=${role}`, (err, results) => {
            console.log("Role successfully removed!");
          });
          break;
        case "Employee":
          const employee = await select({
            message: "What employee you like to remove?",
            choices: allEmployees,
          });
          db.query(
            `DELETE FROM employee WHERE id=${employee}`,
            (err, results) => {
              console.log("Employee successfully removed!");
            }
          );
          break;
      }
    case "View total budget of department (Sum of salaries)":
      const department = await select({
        message: "What department would you like to see the budget of?",
        choices: allDepartments,
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
  setTimeout(() => {
    exit();
  }, 400);
}

async function exit() {
  const exits = await confirm(
    {
      message: "Want to do anything else?",
      default: true,
    },
    { clearPromptOnDone: true }
  );

  if (exits) {
    return init();
  }
  process.exit();
}
