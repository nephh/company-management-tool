INSERT INTO department (name) VALUES
    ('HR'),
    ('Engineering'),
    ('Marketing'),
    ('Finance'),
    ('Sales');

INSERT INTO role (title, salary, department_key) VALUES
    ('HR Manager', 100000.00, 1),
    ('Software Engineer', 90000.00, 2),
    ('Marketing Specialist', 65000.00, 3),
    ('Financial Analyst', 70000.00, 4),
    ('Sales Representative', 50000.00, 5);

INSERT INTO employee (first_name, last_name, role_id) VALUES
    ('Bob', 'Johnson', 1),
    ('Eva', 'Davis', 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
    ('John', 'Doe', 4, 1),
    ('Alice', 'Smith', 5, 1),
    ('Mike', 'Wilson', 3, 2);
