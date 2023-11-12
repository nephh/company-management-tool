import sql from "./utils/data.js";
import { select } from "@inquirer/prompts";

const choices = [
  { value: "View all departments" },
  { value: "View all roles" },
  { value: "View all employees" },
  { value: "Add a department" },
  { value: "Add a role" },
  { value: "Add an employee" },
  { value: "Update an employee role" },
  { value: "Update an employee's manager" },
  { value: "View employee's by manager" },
  { value: "View employee's by department" },
  { value: "Remove a department, role, or employee from the database" },
  { value: "View total budget of department (Sum of salaries)" },
  { value: "Quit" },
];

export default async function init() {
  const answer = await select({
    message: "Select an option",
    choices: choices,
  });

  if (answer === "Quit") process.exit();

  sql(answer);
}

init();
