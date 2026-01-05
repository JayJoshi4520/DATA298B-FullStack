import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';

const storage = new Storage();
const BUCKET_NAME = process.env.GCS_BUCKET_NAME; // Default or env var

export async function uploadFile(filePath, destination) {
    try {
        await storage.bucket(BUCKET_NAME).upload(filePath, {
            destination: destination,
        });
        console.log(`${filePath} uploaded to ${BUCKET_NAME}/${destination}`);
        return `https://storage.googleapis.com/${BUCKET_NAME}/${destination}`;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

export async function uploadDirectory(dirPath, destinationPrefix) {
    const files = await getFiles(dirPath);
    const uploadPromises = files.map(file => {
        const relativePath = path.relative(dirPath, file);
        const destination = path.join(destinationPrefix, relativePath);
        return uploadFile(file, destination);
    });
    return Promise.all(uploadPromises);
}

async function getFiles(dir) {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
    }));
    return Array.prototype.concat(...files);
}

export default {
    uploadFile,
    uploadDirectory
};
