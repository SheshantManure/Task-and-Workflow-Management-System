const Task = require('../../models/tasksAndSubtasks/taskSchema');
const SubTask = require('../../models/tasksAndSubtasks/subtaskSchema');
const User = require('../../models/user/userSchema');
const mongoose = require('mongoose');

const taskSubtaskResolvers = {
  Mutation: {
    createTask: async (_, input) => {
      try {
        // Destructure fields from input
        const { title, description, status, assignedTo, assignedBy, subTasks, createdBy } = input;

        // Create a new Task instance
        const newTask = new Task({
          title,
          description,
          status,
          assignedTo,
          assignedBy,
          subTasks: [], // Initialize subTasks array
          createdBy: new mongoose.Types.ObjectId(createdBy),
        });

        // Save the task to MongoDB
        const savedTask = await newTask.save();

        // If subTasks are provided, create each subtask
        if (subTasks && subTasks.length > 0) {
          for (let subTaskInput of subTasks) {
            const { title, description, status, assignedTo } = subTaskInput;

            // Create a new SubTask instance associated with the savedTask
            const newSubTask = new SubTask({
              task_id: savedTask._id, // Link subtask to the savedTask
              title,
              description,
              status,
              assignedTo,
            });

            // Save the subtask to MongoDB
            await newSubTask.save();

            // Push the subtask's ID to the savedTask's subTasks array
            savedTask.subTasks.push(newSubTask._id);
          }

          // Save the updated task with subTasks array populated
          await savedTask.save();
        }

        // Return the created task
        return savedTask;
      } catch (error) {
        throw new Error(`Failed to create task: ${error.message}`);
      }
    },
  },
};

module.exports = taskSubtaskResolvers;
