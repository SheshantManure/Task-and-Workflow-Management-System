const Task = require('../../models/tasksAndSubtasks/taskSchema');
const SubTask = require('../../models/tasksAndSubtasks/subtaskSchema')
const User = require('../../models/user/userSchema')
const mongoose = require('mongoose');
const createError = require('http-errors');
const logger = require('../../config/taskAuditLogger');

const taskResolvers = {
  Query: {
      filterTasks: async (_, { status, assignee, dueDate }, context) => {
        try {
          let filters = {};
  
          if (status) {
            filters.status = status;
          }
          if (assignee) {
            filters.assignedTo = mongoose.Types.ObjectId(assignee);
          }
          if (dueDate) {
            filters.deadline = new Date(dueDate);
          }
  
          const tasks = await Task.find(filters);
          return tasks;
        } catch (error) {
          console.error('Error fetching tasks:', error);
          throw createError(500, `Failed to fetch tasks: ${error.message}`);
        }
      },
  
      findTaskById: async (_, { id }, context) => {
        try {
          const task = await Task.findById(id).populate('dependencies').populate('subTasks'); // Populate dependencies and subTasks array
          if (!task) {
            throw createError(404, `Task not found with ID: ${id}`);
          }
          return task;
        } catch (error) {
          console.error('Error fetching task details:', error);
          throw createError(500, `Failed to fetch task details: ${error.message}`);
        }
      },
  
      findUserAndTasks: async (_, { userId }, context) => {
        try {
          const user = await User.findById(userId);
          if (!user) {
            throw new Error(`User with ID ${userId} not found`);
          }
      
          const tasks = await Task.find({ assignedTo: userId });
          
          return {
            user,
            tasks
          };
        } catch (error) {
          throw createError(500, `Failed to create task: ${error.message}`);
        }
      }
  },

  Mutation: {
    createTask: async (_, input, context) => {
      try {
        // Check if user is authenticated and role is admin or project_manager
        if (!context.user || (context.user.role !== "admin" && context.user.role !== "project manager")) {
          throw createError(403, `Unauthorized! Only admins and project managers can create tasks. Your role is ${context.user.role}`);
        }

        // Destructure fields from input
        const { title, description, assignedTo, deadline } = input;

        // Create a new Task instance
        const newTask = new Task({
          title,
          description,
          status: 'todo',
          assignedTo: assignedTo ? new mongoose.Types.ObjectId(assignedTo) : null, 
          assignedBy: assignedTo ? new mongoose.Types.ObjectId(context.user.userId) : null,
          subTasks: [], // Initialize subTasks array
          createdBy: new mongoose.Types.ObjectId(context.user.userId),
          deadline: new Date(deadline)
        });

        // Save the Task to MongoDB
        const savedTask = await newTask.save();
        logger.info(`Task created: ${savedTask.id} by user ${context.user.userId}`);
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
        const { taskId, title, description, assignedTo, deadline } = input;

        // Find the existing task by ID
        const existingTask = await Task.findById(taskId);

        if (!existingTask) {
          throw createError(404, `Task not found with ID: ${taskId}`);
        }

        // Update task fields
        existingTask.title = title || existingTask.title;
        existingTask.description = description || existingTask.description;
        existingTask.assignedTo = assignedTo || existingTask.assignedTo;
        existingTask.assignedBy = assignedTo ? new mongoose.Types.ObjectId(context.user.userId) : null;
        existingTask.deadline = deadline ? new Date(deadline) : existingTask.deadline;

        // Save updated task to MongoDB
        const savedTask = await existingTask.save();
        logger.info(`Task updated: ${savedTask.id} by user ${context.user.userId}`);
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
        logger.info(`Task deleted: ${taskId} by user ${context.user.userId}`);
        return { message: `Subtask with ID ${taskId} successfully deleted.` };

      } catch (error) {
        throw createError(500, `Failed to delete task: ${error.message}`);
      }
    },

    assignTask: async (_, { userId, taskId }, context) => {
      try {
          // Check if user is authenticated and has required role
          if (!context.user || (context.user.role !== "admin" && context.user.role !== "project_manager" && context.user.role !== "team_lead")) {
              throw createError(403, `Unauthorized! Only admins, project managers, and team leads can assign tasks. Your role is ${context.user?.role}`);
          }

          // Validate user ID
          if (!mongoose.Types.ObjectId.isValid(userId)) {
              throw createError(400, 'Invalid userId.');
          }

          // Validate task ID
          if (!mongoose.Types.ObjectId.isValid(taskId)) {
              throw createError(400, 'Invalid taskId.');
          }

          // Find the task by ID
          let task = await Task.findById(taskId);

          // If task does not exist, throw 404 error
          if (!task) {
              throw createError(404, `Task with ID ${taskId} not found.`);
          }

          // Update the assignedTo and assignedBy fields
          task.assignedTo = new mongoose.Types.ObjectId(userId);
          task.assignedBy = new mongoose.Types.ObjectId(context.user.userId);

          // Save the updated task
          const updatedTask = await task.save();
          logger.info(`Task assigned to: ${updatedTask.assignedTo} by user ${context.user.userId} for task ${updatedTask.id}`);
          return updatedTask;
      } catch (error) {
          console.error('Error assigning task:', error);
          throw createError(500, `Failed to assign task: ${error.message}`);
      }
    },

    addTaskDependencies: async (_, { taskId, dependents }, context) => {
      try {
          // Check if user is authenticated and has required role
          if (!context.user || (context.user.role !== "admin" && context.user.role !== "project_manager")) {
              throw createError(403, `Unauthorized! Only admins and project managers can add task dependencies. Your role is ${context.user?.role}`);
          }

          // Validate user ID
          if (!context.user.userId) {
              throw createError(403, 'Unauthorized! User ID is missing.');
          }

          // Validate task ID
          if (!mongoose.Types.ObjectId.isValid(taskId)) {
              throw createError(400, 'Invalid taskId.');
          }

          // Validate dependents array
          if (!Array.isArray(dependents)) {
              throw createError(400, 'Dependents should be an array.');
          }

          // Find the task by ID
          let task = await Task.findById(taskId);

          // If task does not exist, throw 404 error
          if (!task) {
              throw createError(404, `Task with ID ${taskId} not found.`);
          }

          // Convert dependents to ObjectId and add them to task's dependencies array
          const dependentIds = dependents.map(depId => new mongoose.Types.ObjectId(depId));
          task.dependencies.push(...dependentIds);

          // Remove duplicates from dependencies array
          task.dependencies = [...new Set(task.dependencies)];

          // Save the updated task
          const updatedTask = await task.save();
          logger.info(`Dependencies updated for task: ${updatedTask.id} by user ${context.user.userId}`);
          return updatedTask;
      } catch (error) {
          console.error('Error adding task dependencies:', error);
          throw createError(500, `Failed to add task dependencies: ${error.message}`);
      }
    },

    updateTaskStatus: async (_, { taskId }, context) => {
      try {
          // Check if user is authenticated and has required role
          if (!context.user || (context.user.role !== "admin" && context.user.role !== "project_manager")) {
              throw createError(403, `Unauthorized! Only admins and project managers can update task status. Your role is ${context.user?.role}`);
          }

          // Validate user ID
          if (!context.user.userId) {
              throw createError(403, 'Unauthorized! User ID is missing.');
          }

          // Validate task ID
          if (!mongoose.Types.ObjectId.isValid(taskId)) {
              throw createError(400, 'Invalid taskId.');
          }

          // Find the task by ID
          let task = await Task.findById(taskId);

          // If task does not exist, throw 404 error
          if (!task) {
              throw createError(404, `Task with ID ${taskId} not found.`);
          }

          // Fetch all subtasks for the task
          const subtaskIds = task.subTasks.map(subtaskId => new mongoose.Types.ObjectId(subtaskId));
          const subtasks = await SubTask.find({ _id: { $in: subtaskIds } });

          // Retrieve dependency tasks
          const dependencyTasks = await Task.find({ _id: { $in: task.dependencies } });

          // Check statuses of subtasks
          const allSubTasksDone = subtasks.every(subtask => subtask.status === 'done');
          const allSubTasksTodo = subtasks.every(subtask => subtask.status === 'todo');
          const someSubTasksInProgress = subtasks.some(subtask => subtask.status === 'in progress');

          // Check statuses of dependency tasks
          const allDependenciesDone = dependencyTasks.every(depTask => depTask.status === 'done');
          const allDependenciesTodo = dependencyTasks.every(depTask => depTask.status === 'todo');
          const someDependenciesInProgress = dependencyTasks.some(depTask => depTask.status === 'in progress');

          // Determine new status based on both subtasks and dependencies
          let newStatus = 'todo'; // Default to 'todo'

          if (allSubTasksDone && allDependenciesDone) {
              newStatus = 'done';
          } else if (someSubTasksInProgress || someDependenciesInProgress) {
              newStatus = 'in progress';
          } else if (allSubTasksTodo && allDependenciesTodo) {
              newStatus = 'todo';
          }

          // Update the task's status
          task.status = newStatus;

          // Save the updated task
          const updatedTask = await task.save();
          logger.info(`Task updated: ${updatedTask.id} by user ${context.user.userId}`);
          return updatedTask;
      } catch (error) {
          console.error('Error updating task status:', error);
          throw createError(500, `Failed to update task status: ${error.message}`);
      }
    },
  },
};

module.exports = taskResolvers;