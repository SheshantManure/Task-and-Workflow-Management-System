const taskTypeDefs = `
type Query {
  hello: String!
}

type Task {
  id: ID!
  title: String!
  description: String!
  status: String!
  assignedTo: ID
  assignedBy: ID
  createdBy: ID!
  subTasks: [ID!]!
  createdAt: String!
  updatedAt: String!
}

type Delete {
  message: String!
}

type Mutation {
  createTask( title: String!, description: String!, status: String, assignedTo: ID ): Task!
  updateTask( taskId: ID!, title: String, description: String, status: String, assignedTo: ID ): Task!
  deleteTask(taskId: ID!): Delete!
}
`;
  
module.exports = taskTypeDefs;