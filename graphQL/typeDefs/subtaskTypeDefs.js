const subtaskTypeDefs = `
    type Query {
        hello: String!
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
        createdBy: ID!
        assignedBy: ID
    }

    type Delete {
        message: String!
    }

    type Mutation {
        createSubtask(task_id: ID!, title: String!, description: String!, status: String, assignedTo: ID, assignedBy: ID): SubTask!
        updateSubtask(subtask_id: ID!, title: String, description: String, status: String, assignedTo: ID, assignedBy: ID): SubTask!
        deleteSubtask(subtask_id: ID!): Delete!
    }
`;

module.exports = subtaskTypeDefs;
