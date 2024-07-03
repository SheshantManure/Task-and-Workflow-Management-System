const taskTypeDefs = `
type Query {
  filterTasks(status: String, assignee: ID, dueDate: String): [Task!]!
  findTaskById(id: ID!): Task!
  findUserAndTasks(userId: ID!): UserTasksResult!
}

type UserTasksResult {
  user: User!
  tasks: [Task!]!
}

type Task {
  id: ID!
  title: String!
  description: String!
  status: String!
  assignedTo: ID
  assignedBy: ID
  createdBy: ID!
  subTasks: [SubTask!]!
  dependencies: [Task!]!
  createdAt: String!
  updatedAt: String!
  deadline: String
}

type SubTask {
  id: ID!
  title: String!
  description: String!
  status: String!
  assignedTo: ID
  assignedBy: ID
  createdBy: ID!
  createdAt: String!
  updatedAt: String!
  deadline: String
}

type User {
  id: ID!
  username: String!
  email: String!
  role: String!
  assignedTasks: [Task!]!
}

type Delete {
  message: String!
}

type Mutation {
  createTask(title: String!, description: String!, assignedTo: ID, deadline: String): Task!
  updateTask(taskId: ID!, title: String, description: String, status: String, assignedTo: ID, deadline: String): Task!
  deleteTask(taskId: ID!): Delete!
  addTaskDependencies(taskId: ID!, dependents: [ID!]!): Task! # Changed return type to Task
  updateTaskStatus(taskId: ID!): Task!
  assignTask(taskId: ID!, userId: ID!): Task!
}`;

module.exports = taskTypeDefs;