const express = require("express");
const {ApolloServer} = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");

const app = express();


async function Init(){

    const users = [
        {id:1,name:"shaid",age:25,place:"jadcherla"},
        {id:2,name:"shaid2",age:26},
        {id:3,name:"shaid3",age:27},
        {id:4,name:"shaid4",age:29},
        {id:5,name:"shaid5",age:20},
    ]

    app.use(express.json());

    const gqlServer = new ApolloServer({
        typeDefs : `
        type Query{
            hello:String
            greeting(name:String!):String
            users :[User]
            user(id:Int!):User 
        }

        type Mutation{
            addUser(id:Int!,name:String!,age:Int!):addUsersResponse
        }

        type User {
            id:Int
            name :String
            age :Int
        }

        type addUsersResponse{
            addedUserDetail : User
            users :[User]
        }
    `,
        resolvers :{
            Query:{
                hello: () => "Hello A Project for Heumn Interactions PVT LTD.",
                greeting:(_,{name})=> name+"helllo greeeitngs message",
                users:()=>users,
                user: (_, { id }) => users.find(singleuser=>singleuser.id ===id) 
            },
            Mutation :{
                addUser: (_,details)=>{
                    users.push(details);
                    return {
                        addedUserDetail :details,
                        users
                    };
                }
            }
        }
    });

    await gqlServer.start();
    
    
    app.get("/",(req,res)=>{
        res.status(200).json({
            success:true,
        })
    })


  app.use("/gqlserver", expressMiddleware(gqlServer));

    app.listen(9000,()=>{
        console.log("server is runnning on 8000");
    })
}

Init();
