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
  AssignedBy: ID
  createdBy: ID!
  subTasks: [ID!]
  createdAt: String!
  updatedAt: String!
}

type SubTask {
  id: ID!
  task_id: ID!
  title: String!
  description: String!
  status: String!
  assignedTo: ID
  createdAt: String!
  updatedAt: String!
}

type Mutation {
  createTask( title: String!, description: String!, status: String, assignedTo: ID, assignedBy: ID, createdBy: ID ): Task!
  createSubtask( task_id: ID!, title: String!, description: String!, status: String!, assignedTo: ID, assignedBy: ID ): SubTask!
}
`;
  
module.exports = taskTypeDefs;