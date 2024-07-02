const Task = require('../../models/tasksAndSubtasks/taskSchema');
const SubTask = require('../../models/tasksAndSubtasks/subtaskSchema')
const mongoose = require('mongoose');
const createError = require('http-errors');

const taskResolvers = {
  Query: {
    hello: (_, __, context) => {
      console.log(context);
      return context.user.role;
    },
  },

  Mutation: {
    createTask: async (_, input, context) => {
      try {
        // Check if user is authenticated and role is admin or project_manager
        if (!context.user || (context.user.role !== "admin" && context.user.role !== "project manager")) {
          throw createError(403, `Unauthorized! Only admins and project managers can create tasks. Your role is ${context.user.role}`);
        }

        // Destructure fields from input
        const { title, description, status, assignedTo } = input;

        // Create a new Task instance
        const newTask = new Task({
          title,
          description,
          status,
          assignedTo: assignedTo ? new mongoose.Types.ObjectId(assignedTo) : null, 
          assignedBy: assignedTo ? new mongoose.Types.ObjectId(context.user.userId) : null,
          subTasks: [], // Initialize subTasks array
          createdBy: new mongoose.Types.ObjectId(context.user.userId),
        });

        // Save the Task to MongoDB
        const savedTask = await newTask.save();

        // Log audit trail for creation
        await logAuditTrail('create', 'task', savedTask._id, null, null, context.user.userId);

        return savedTask;
      } catch (error) {
        throw createError(500, `Failed to create task: ${error.message}`);
      }
    },

    updateTask: async (_, input, context) => {
      try {
        // Check if user is authenticated and role is admin or project_manager
        if (!context.user || (context.user.role !== "admin" && context.user.role !== "project manager")) {
          throw createError(403, `Unauthorized! Only admins and project managers can update tasks. Your role is ${context.user.role}`);
        }

        // Destructure fields from input
        const { taskId, title, description, status, assignedTo } = input;

        // Find the existing task by ID
        const existingTask = await Task.findById(taskId);

        if (!existingTask) {
          throw createError(404, `Task not found with ID: ${taskId}`);
        }

        // Update task fields
        existingTask.title = title || existingTask.title;
        existingTask.description = description || existingTask.description;
        existingTask.status = status || existingTask.status;
        existingTask.assignedTo = assignedTo || existingTask.assignedTo;
        existingTask.assignedBy = assignedTo ? new mongoose.Types.ObjectId(context.user.userId) : null;

        // Save updated task to MongoDB
        const savedTask = await existingTask.save();
        return savedTask;

      } catch (error) {
        throw createError(500, `Failed to update task: ${error.message}`);
      }
    },

    deleteTask: async (_, { taskId }) => {
      try {
        // Find the task by ID
        const task = await Task.findById(taskId);

        if (!task) {
          throw createError(404, `Task not found with ID: ${taskId}`);
        }

        // Delete all subtasks associated with the task
        await SubTask.deleteMany({ _id: { $in: task.subTasks } });

        // Delete the task
        await Task.deleteOne({ _id: taskId})
        return { message: `Subtask with ID ${taskId} successfully deleted.` };

      } catch (error) {
        throw createError(500, `Failed to delete task: ${error.message}`);
      }
    },
  },
};

module.exports = taskResolvers;