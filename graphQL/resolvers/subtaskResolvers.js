const SubTask = require('../../models/tasksAndSubtasks/subtaskSchema');
const Task = require('../../models/tasksAndSubtasks/taskSchema');
const createError = require('http-errors');
const mongoose = require('mongoose');

const subtaskResolvers = {
    Mutation: {
        createSubtask: async (_, { task_id, title, description, status, assignedTo, deadline }, context) => {
            try {
                // Check if user is authenticated and role is admin or project_manager
                if (!context.user || (context.user.role !== "admin" && context.user.role !== "project_manager")) {
                    throw createError(403, `Unauthorized! Only admins and project managers can create subtasks. Your role is ${context.user.role}`);
                }

                // Ensure context.user.userId is valid
                if (!context.user.userId) {
                    throw createError(403, 'Unauthorized! User ID is missing.');
                }

                // Create a new SubTask instance
                const newSubTask = new SubTask({
                    task_id: new mongoose.Types.ObjectId(task_id),
                    title,
                    description,
                    status: status || 'todo', // Default to 'todo' if status is not provided
                    assignedTo: assignedTo || null,
                    assignedBy: assignedTo ? new mongoose.Types.ObjectId(context.user.userId) : null,
                    createdBy: new mongoose.Types.ObjectId(context.user.userId),
                    deadline: new Date(deadline)
                });

                // Save the SubTask to MongoDB
                const savedSubTask = await newSubTask.save();

                // Update the corresponding Task document's subTasks array
                await Task.updateOne(
                    { _id: task_id },
                    { $push: { subTasks: savedSubTask._id } }
                );

                return savedSubTask;
            } catch (error) {
                console.error('Error creating subtask:', error);
                throw createError(500, `Failed to create subtask: ${error.message}`);
            }
        },

        updateSubtask: async (_, input, context) => {
            try {
                // Check if user is authenticated and role is admin or project_manager
                if (!context.user || (context.user.role !== "admin" && context.user.role !== "project_manager")) {
                    throw createError(403, `Unauthorized! Only admins and project managers can update subtasks. Your role is ${context.user.role}`);
                }

                // Ensure context.user.userId is valid
                if (!context.user.userId) {
                    throw createError(403, 'Unauthorized! User ID is missing.');
                }

                const { subtask_id, title, description, assignedTo, deadline } = input;

                // Find the subtask by ID
                let subtask = await SubTask.findById(subtask_id);

                if (!subtask) {
                    throw createError(404, `Subtask with ID ${subtask_id} not found.`);
                }

                // Update fields if provided
                if (title) subtask.title = title;
                if (description) subtask.description = description;
                if (assignedTo) {
                    subtask.assignedTo = new mongoose.Types.ObjectId(assignedTo);
                    subtask.assignedBy = new mongoose.Types.ObjectId(context.user.userId);
                }
                if (deadline) subtask.deadline = new Date(deadline)
                // Save the updated subtask
                const updatedSubtask = await subtask.save();
                return updatedSubtask;
            } catch (error) {
                console.error('Error updating subtask:', error);
                throw createError(500, `Failed to update subtask: ${error.message}`);
            }
        },

        deleteSubtask: async (_, { subtask_id: subtaskId }, context) => {
            try {
                // Check if user is authenticated and role is admin or project_manager
                if (!context.user || (context.user.role !== "admin" && context.user.role !== "project_manager")) {
                    throw createError(403, `Unauthorized! Only admins and project managers can delete subtasks. Your role is ${context.user.role}`);
                }

                // Ensure context.user.userId is valid
                if (!context.user.userId) {
                    throw createError(403, 'Unauthorized! User ID is missing.');
                }

                // Find the subtask by ID
                const subtask = await SubTask.findById(subtaskId);

                if (!subtask) {
                    throw createError(404, `Subtask with ID ${subtaskId} not found.`);
                }

                // Delete the subtask using deleteOne
                await SubTask.deleteOne({ _id: subtaskId });

                // Remove the subtask ID from the corresponding Task's subTasks array
                await Task.updateOne(
                    { _id: subtask.task_id },
                    { $pull: { subTasks: subtaskId } }
                );

                return { message: `Subtask with ID ${subtaskId} successfully deleted.` };
            } catch (error) {
                console.error('Error deleting subtask:', error);
                throw createError(500, `Failed to delete subtask: ${error.message}`);
            }
        },

        updateSubtaskStatus: async (_, { subtask_id, status }, context) => {
            try {
                // Ensure context.user.userId is valid
                if (!context.user || !context.user.userId) {
                    throw createError(403, 'Unauthorized! User ID is missing.');
                }

                // Find the subtask by ID
                let subtask = await SubTask.findById(subtask_id);

                // If subtask does not exist, throw 404 error
                if (!subtask) {
                    throw createError(404, `Subtask with ID ${subtask_id} not found.`);
                }

                // Update the status field if provided
                if (status) {
                    subtask.status = status;
                }

                // Save the updated subtask
                const updatedSubtask = await subtask.save();

                return updatedSubtask;
            } catch (error) {
                console.error('Error updating subtask status:', error);
                throw createError(500, `Failed to update subtask status: ${error.message}`);
            }
        }
    }
};

module.exports = subtaskResolvers;