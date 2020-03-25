import { PubSub } from 'apollo-server-express';
import { getCurrentUser } from './getCurrentUser';

enum FileStatus {
    CREATED = 'CREATED',
    UPLOADED = 'UPLOADED',
    STORED = 'STORED',
    CANCELLED = 'CANCELLED',
}

enum FileType {
    MANUSCRIPT_SOURCE_PENDING = 'MANUSCRIPT_SOURCE_PENDING',
    MANUSCRIPT_SOURCE = 'MANUSCRIPT_SOURCE',
    SUPPORTING_FILE = 'SUPPORTING_FILE',
}

type File = {
    id: string;
    type: string;
    filename: string;
    url: string;
    mimeType: string;
    size: number;
    status: string;
};

type Submission = {
    id: string;
    title: string;
    updated: Date;
    articleType: string;
    status: string;
    createdBy: string;
    files: {
        manuscriptFile?: File;
    };
};

async function wait(timeout): Promise<void> {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, timeout);
    });
}

export const uploadManuscript = (
    submissions,
    pubsub: PubSub = new PubSub(), // set default so it won't break existing code
): ((_, { id, file, fileSize }) => Promise<Submission>) => async (_, { id, file }): Promise<Submission> => {
    const submissionIndex = submissions.findIndex(submission => submission.id === id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user: any = getCurrentUser();

    // file = { path: '...' } only
    if (submissionIndex !== -1) {
        const submission = submissions[submissionIndex];
        const manuscriptFile: File = {
            id: '0ee77f61-b89d-40cd-893e-88089359eb6b',
            type: FileType.MANUSCRIPT_SOURCE,
            filename: file.path,
            url: 'http://localhost/bucket/name.pdf',
            mimeType: 'application/pdf',
            size: 1000,
            status: FileStatus.UPLOADED,
        };
        submission.files ? (submission.files.manuscriptFile = manuscriptFile) : (submission.files = { manuscriptFile });
        for await (const percentage of [0, 25, 50, 75, 100]) {
            await wait(100);
            await pubsub.publish('UPLOAD_STATUS', {
                manuscriptUploadProgress: {
                    userId: user.id,
                    filename: manuscriptFile.filename,
                    fileId: manuscriptFile.id,
                    percentage,
                },
            });
        }
        return submissions[submissionIndex];
    }

    throw new Error("can't find submission: " + id);
};
