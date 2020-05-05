import { PubSub } from 'apollo-server-express';

import {
    getSubmissions,
    startSubmission,
    getCurrentUser,
    getSubmission,
    deleteSubmission,
    saveAuthorPage,
    saveDetailsPage,
    saveFilesPage,
    uploadManuscript,
    fileUploadProgress,
    uploadSupportingFile,
    deleteSupportingFile,
    saveEditorPage,
} from '../use-cases';

const submissions = [];
const pubsub = new PubSub();

export const resolvers = {
    Query: {
        getCurrentUser,
        getSubmissions: getSubmissions(submissions),
        getSubmission: getSubmission(submissions),
    },
    Mutation: {
        startSubmission: startSubmission(submissions),
        deleteSubmission: deleteSubmission(submissions),
        saveAuthorPage: saveAuthorPage(submissions),
        saveFilesPage: saveFilesPage(submissions),
        saveDetailsPage: saveDetailsPage(submissions),
        uploadManuscript: uploadManuscript(submissions, pubsub),
        uploadSupportingFile: uploadSupportingFile(submissions, pubsub),
        deleteSupportingFile: deleteSupportingFile(submissions),
        saveEditorPage: saveEditorPage(submissions),
    },
    Subscription: {
        fileUploadProgress: fileUploadProgress(pubsub),
    },
};
