const users = [
    { id: 1, name: "shaid", age: 25, place: "jadcherla" },
    { id: 2, name: "shaid2", age: 26 },
    { id: 3, name: "shaid3", age: 27 },
    { id: 4, name: "shaid4", age: 29 },
    { id: 5, name: "shaid5", age: 20 },
];

const resolvers = {
    Query: {
        hello: () => "Hello A Project for Heumn Interactions PVT LTD.",
        greeting: (_, { name }) => `${name} helllo greetings message`,
        users: () => users,
        user: (_, { id }) => users.find(user => user.id === id)
    },
    Mutation: {
        addUser: (_, { id, name, age }) => {
            const newUser = { id, name, age };
            users.push(newUser);
            return {
                addedUserDetail: newUser,
                users
            };
        }
    }
};

module.exports = resolvers;