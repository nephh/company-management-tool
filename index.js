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
];

const answer = await select({
  message: "Select an option",
  choices: choices,
});

export default async function init() {
  sql(answer);
}

init();
