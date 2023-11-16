import mysql from "mysql2";

export const db = mysql.createConnection({
  host: "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// We use sql2 with a promise to get the data and then format it in a way that allows us to use it for inquirer prompts
export async function getEmployees() {
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

export async function getRoles() {
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

export async function getManagers() {
  let managers;
  await db
    .promise()
    .query(
      "SELECT first_name, last_name, id, manager_id FROM employee WHERE manager_id IS NULL"
    )
    .then((results) => {
      managers = results[0].map((manager) => {
        const name = manager.first_name + " " + manager.last_name;
        return { name: name, value: manager.id };
      });
    });
  return managers;
}

export async function getDepartments() {
  let departments;
  await db
    .promise()
    .query("SELECT name, id FROM department")
    .then((results) => {
      departments = results[0].map((department) => {
        return { name: department.name, value: department.id };
      });
    });
  return departments;
}
