import { select, Separator } from "@inquirer/prompts";
import sql from "./utils/data.js";
import chalk from "chalk";

// The main menu
const choices = [
  new Separator(chalk.grey("-- View --")),
  { value: "View all departments" },
  { value: "View all roles" },
  { value: "View all employees" },
  { value: "View employee's by manager" },
  { value: "View employee's by department" },
  { value: "View total budget of department (Sum of salaries)" },
  new Separator(chalk.grey("-- Add --")),
  { value: "Add a department" },
  { value: "Add a role" },
  { value: "Add an employee" },
  new Separator(chalk.grey("-- Update --")),
  { value: "Update an employee role" },
  { value: "Update an employee's manager" },
  { value: "Remove a department, role, or employee from the database" },
  { name: chalk.italic.red("Quit"), value: "quit" },
];

// Initialize and handle quit
export default async function init() {
  const answer = await select({
    message: `${chalk.bold.blue("Welcome!")} \n  ${chalk.bold.blue(
      "What would you like to do?"
    )}`,
    choices: choices,
    pageSize: choices.length,
  });

  if (answer === "quit") process.exit();

  sql(answer);
}

init();
