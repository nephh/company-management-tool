import { select, input } from "@inquirer/prompts";
import mysql from "mysql2";
import "console.table";
import 'dotenv/config'

const db = mysql.createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

export default async function sql(data) {
  let departments;
  const allEmployees = await getEmployees();
  const allRoles = await getRoles();

  switch (data) {
    case "View all departments":
      db.query("SELECT name, id FROM department", (err, results) => {
        const names = results.map((department) => {
          return { ID: department.id, Department: department.name};
        });
        console.table(names);
      });
      break;

    case "View all roles":
      db.query(
        "SELECT title, role.id, salary, name FROM role JOIN department ON role.department_key = department.id",
        (err, results) => {
          const roles = results.map((role) => {
            return {
              ID: role.id,
              Role: role.title,
              Salary: role.salary,
              Department: role.name,
            };
          });
          console.table(roles);
        }
      );
      break;

    case "View all employees":
      db.query(
        `SELECT first_name, last_name, employee.id, manager_id, name, title, salary FROM employee JOIN role ON employee.role_id = role.id 
        JOIN department ON role.department_key = department.id ORDER BY employee.id`,
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
              Role: employee.title,
              Department: employee.name,
              Salary: employee.salary,
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
      db.query("SELECT name, id FROM department", (err, results) => {
        departments = results.map((name) => {
          return { name: name.name, value: name.id };
        });
      });
      const newRole = {
        role: await input({
          message: "Enter the title of the role you would like to add.",
        }),
        salary: await input({
          message: "Enter the yearly salary of the role you would like to add.",
        }),
        department: await select({
          message: "Enter the department this role belongs to.",
          choices: departments,
        }),
      };
      db.query(
        `INSERT INTO role (title, salary, department_key) VALUES ('${newRole.role}', '${newRole.salary}', '${newRole.department}');`
      );
      break;

    case "Add an employee":
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
          message: "Select the manager of this employee.",
          choices: allEmployees,
        }),
      };
      if (newEmployee.manager) {
        console.log("manager true");
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
      await Promise.all([
        new Promise((resolve, reject) => {
          db.query(
            "SELECT manager_id, COUNT(id) AS Employees FROM employee GROUP BY manager_id",
            (err, results) => {
              if (err) reject(err);
              employees = results.map((employee) => {
                const name = employee.first_name + " " + employee.last_name;
                return { name: name, value: employee.id };
              });
              resolve();
            }
          );
        }),
      ]);
      break;
  }
}

async function getEmployees() {
  let employees;
  await db
    .promise()
    .query("SELECT first_name, last_name, id FROM employee")
    .then((results) => {
      employees = results[0].map((employee) => {
        const name = employee.first_name + " " + employee.last_name;
        return { name: name, value: employee.id };
      });
    });
  return employees;
}

async function getRoles() {
  let roles;
  await db
    .promise()
    .query("SELECT title, id FROM role")
    .then((results) => {
      roles = results[0].map((role) => {
        return { name: role.title, value: role.id };
      });
    });
  return roles;
}
