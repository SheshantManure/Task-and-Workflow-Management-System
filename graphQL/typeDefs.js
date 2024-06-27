const typeDefs = `
    type Query {
        hello: String
        greeting(name: String!): String
        users: [User]
        user(id: Int!): User 
    }

    type Mutation {
        addUser(id: Int!, name: String!, age: Int!): AddUsersResponse
    }

    type User {
        id: Int
        name: String
        age: Int
    }

    type AddUsersResponse {
        addedUserDetail: User
        users: [User]
    }
`;

module.exports = typeDefs;
