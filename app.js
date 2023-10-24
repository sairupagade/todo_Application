var format = require("date-fns/format");
var isValid = require("date-fns/isValid");

const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");

app.use(express.json());
let db = null;

const initializeAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeAndServer();

const ispresentStatus = ["TO DO", "IN PROGRESS", "DONE"];
const ispresentPriority = ["HIGH", "MEDIUM", "LOW"];
const ispresentCategory = ["WORK", "HOME", "LEARNING"];

const isValidStatus = (status) => {
  return ispresentStatus.includes(status);
};
const isValidPriority = (priority) => {
  return ispresentPriority.includes(priority);
};
const isValidCategory = (category) => {
  return ispresentCategory.includes(category);
};

// root
const TodoStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const TodoPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const TodoCategory = (requestQuery) => {
  return requestQuery.category !== undefined;
};
const TodoDate = (requestQuery) => {
  return requestQuery.dueDate !== undefined;
};
const TodoPriorityAndStatus = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};
const TodoCategoryAndStatus = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};
const TodoCategoryAndPriorty = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

///////////////

app.get("/todos/", async (request, response) => {
  const { search_q, category, priority, status, due_date } = request.query;
  switch (true) {
    case TodoStatus(request.query):
      if (isValidStatus(status)) {
        const getSearchQuery = `
                SELECT
                    id,todo,priority,status,category,due_date AS dueDate
                FROM
                    todo
                WHERE 
                    status = '${status}';`;
        const dbUser = await db.all(getSearchQuery);
        response.send(dbUser);
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case TodoPriority(request.query):
      if (isValidPriority(priority)) {
        const getPriorityQuery = `
                            SELECT
                                 id,todo,priority,status,category,due_date AS dueDate
                            FROM
                                todo
                            WHERE
                                priority = '${priority}';`;
        const Priority = await db.all(getPriorityQuery);
        response.send(Priority);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case TodoPriorityAndStatus(request.query):
      if (isValidPriority(priority) && isValidStatus(status)) {
        const getPriAndStatusQuery = `
            SELECT
                id,todo,priority,status,category,due_date AS dueDate
            FROM
                todo
            WHERE 
                priority = '${priority}' AND
                status = '${status}';`;
        const PriAndStatus = await db.all(getPriAndStatusQuery);
        response.send(PriAndStatus);
      } else if (ispresentPriority.includes(priority) === false) {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else if (ispresentStatus.includes(status) === false) {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case TodoCategoryAndStatus(request.query):
      if (isValidCategory(category) && isValidStatus(status)) {
        const getcatAndStatusQuery = `
            SELECT
                id,todo,priority,status,category,due_date AS dueDate
            FROM
                todo
            WHERE 
                (category = '${category}' AND
                status = '${status}');`;
        const catAndStatus = await db.all(getcatAndStatusQuery);
        response.send(catAndStatus);
      } else if (isValidCategory(category) === false) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else if (isValidStatus(status) === false) {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case TodoCategory(request.query):
      if (isValidCategory(category)) {
        const getCategoryQuery = `
                            SELECT
                                 id,todo,priority,status,category,due_date AS dueDate
                            FROM
                                todo
                            WHERE 
                                category = '${category}';`;
        const Category = await db.all(getCategoryQuery);
        response.send(Category);
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case TodoCategoryAndPriorty(request.query):
      if (isValidCategory(category) && isValidPriority(priority)) {
        const getcatAndPriorityQuery = `
            SELECT
                id,todo,priority,status,category,due_date AS dueDate
            FROM
                todo
            WHERE 
                category = '${category}' AND
                priority = '${priority}';`;
        const catAndPriority = await db.all(getcatAndPriorityQuery);
        response.send(catAndPriority);
      } else if (isValidPriority(priority) === false) {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else if (isValidCategory(category) === false) {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    default:
      const getSearchqQuery = `
      SELECT
         id,todo,priority,status,category,due_date AS dueDate
      FROM
        todo
      WHERE 
        todo LIKE '%${search_q}%';`;
      const Search_q = await db.all(getSearchqQuery);
      response.send(Search_q);
      break;
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getSearchQuery = `
        SELECT
            id,todo,priority,status,category,due_date AS dueDate
        FROM
            todo
        WHERE 
            id = '${todoId}';`;
  const dbUser = await db.get(getSearchQuery);
  response.send(dbUser);
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  let result = await isValid(new Date(date));
  console.log(result);
  if (result) {
    const Day = format(new Date(date), "yyyy-MM-dd");
    const getAgendaQuery = `
    SELECT 
        id,todo,priority,status,category,due_date AS dueDate
    FROM
        todo
    WHERE 
        due_date = '${Day}';`;
    const Query = await db.all(getAgendaQuery);
    response.send(Query);
  } else if (result === false) {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (isValidPriority(priority) === false) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (isValidCategory(category) === false) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (isValid(new Date(dueDate)) === false) {
    response.status(400);
    response.send("Invalid Due Date");
  } else if (isValidStatus(status) === false) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else {
    const addSelectQuery = `
    INSERT INTO
        todo(id,todo, priority, status, category, due_date)
    VALUES(
         ${id},  
        '${todo}',
        '${priority}',
        '${status}',
        '${category}',
        '${dueDate}'
        );`;
    const addQuery = await db.run(addSelectQuery);
    response.send("Todo Successfully Added");
  }
});

///////PUT PUT
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { search_q, category, priority, status, dueDate } = request.body;
  switch (true) {
    case TodoStatus(request.body):
      if (isValidStatus(status)) {
        const getSearchQuery = `
                            UPDATE
                                todo
                            SET
                               status = '${status}'
                            WHERE
                                id = '${todoId}';`;
        const dbUser = await db.run(getSearchQuery);
        response.send("Status Updated");
      } else if (isValidStatus(status) === false) {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case TodoPriority(request.body):
      if (isValidPriority(priority)) {
        const getPriorityQuery = `
                            UPDATE
                                todo
                            SET 
                                priority = '${priority}'
                            WHERE
                                id = '${todoId}';`;
        const Priority = await db.run(getPriorityQuery);
        response.send("Priority Updated");
      } else if (isValidPriority(priority) === false) {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case TodoCategory(request.body):
      if (isValidCategory(category)) {
        const getCategoryQuery = `
                            UPDATE
                                todo
                            SET
                                category = '${category}'
                            WHERE
                                id = '${todoId}';`;
        const Category = await db.run(getCategoryQuery);
        response.send("Category Updated");
      } else if (isValidCategory(category) === false) {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case TodoDate(request.body):
      let result = await isValid(new Date(dueDate));
      if (result) {
        const Day = format(new Date(dueDate), "yyyy-MM-dd");
        const getAgendaQuery = `
         UPDATE 
             todo
         SET
            due_date =  '${Day}'
         WHERE
            id = '${todoId}';`;
        const Query = await db.run(getAgendaQuery);
        response.send("Due Date Updated");
      } else if (result === false) {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;

    default:
      const getSearchqQuery = `
      UPDATE
            todo
      SET
        todo = '${search_q}'
      WHERE
        id = '${todoId}';`;
      await db.run(getSearchqQuery);
      response.send("Todo Updated");
      break;
  }
});
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    DELETE FROM
        todo
    WHERE
       id = '${todoId}';`;
  const query = await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
