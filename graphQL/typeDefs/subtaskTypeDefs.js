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
        deadline: String
    }

    type Delete {
        message: String!
    }

    type Mutation {
        createSubtask(task_id: ID!, title: String!, description: String!, status: String, assignedTo: ID, assignedBy: ID, deadline: String): SubTask!
        updateSubtask(subtask_id: ID!, title: String, description: String, status: String, assignedTo: ID, assignedBy: ID, deadline: String): SubTask!
        deleteSubtask(subtask_id: ID!): Delete!
        updateSubtaskStatus( subtask_id: ID!, status: String! ): SubTask!
    }
`;

module.exports = subtaskTypeDefs;
