import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { LLMManager } from '../llmManager.js';
import { uploadDirectory } from '../storageService.js';
import { v4 as uuidv4 } from 'uuid';

export class ProjectAgent {
    constructor() {
        this.llm = new LLMManager();
        // Initialize with default config or env vars
        this.llm.initialize({
            providers: {
                openai: { enabled: !!process.env.OPENAI_API_KEY, apiKey: process.env.OPENAI_API_KEY },
                anthropic: { enabled: !!process.env.ANTHROPIC_API_KEY, apiKey: process.env.ANTHROPIC_API_KEY },
                vertexai: { enabled: !!process.env.GOOGLE_APPLICATION_CREDENTIALS, projectId: process.env.GCP_PROJECT_ID, location: 'us-central1' }
            },
            primary: process.env.LLM_PROVIDER
        }).catch(console.error);
    }

    async generateProject(prompt, userId) {
        const projectId = uuidv4();
        const projectDir = path.join(process.cwd(), 'generated', projectId);

        // Ensure generated dir exists
        fs.mkdirSync(projectDir, { recursive: true });

        console.log(`Generating project ${projectId} for prompt: ${prompt}`);

        try {
            // 1. Generate Project Structure
            const structure = await this.generateStructure(prompt);

            // 2. Generate Code for each file
            for (const file of structure.files) {
                const content = await this.generateFileContent(prompt, file.path, file.description);
                const filePath = path.join(projectDir, file.path);
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
                fs.writeFileSync(filePath, content);
            }

            // 3. Test the project
            const testResult = await this.testProject(projectDir);

            if (!testResult.success) {
                console.log("Tests failed, attempting to fix...");
                await this.fixProject(projectDir, testResult.error, prompt);
                // Re-test? For now, just one fix attempt.
            }

            // 4. Upload to GCS
            const gcsUrl = await uploadDirectory(projectDir, `projects/${userId}/${projectId}`);

            return {
                projectId,
                gcsUrl,
                status: 'completed',
                localPath: projectDir
            };

        } catch (error) {
            console.error("Project generation failed:", error);
            throw error;
        }
    }

    async generateStructure(prompt) {
        const response = await this.llm.generateResponse([
            { role: 'system', content: 'You are a senior software architect. Output a JSON object containing a list of files needed for the requested project. Format: { "files": [ { "path": "index.js", "description": "Main entry point" } ] }' },
            { role: 'user', content: prompt }
        ], null, { jsonMode: true });

        // Parse JSON from response (handle potential markdown blocks)
        let content = response.content;
        if (content.includes('```json')) {
            content = content.split('```json')[1].split('```')[0];
        }
        return JSON.parse(content);
    }

    async generateFileContent(prompt, filePath, description) {
        const response = await this.llm.generateResponse([
            { role: 'system', content: `You are an expert developer. Write the full code for the file ${filePath}. Description: ${description}. Return ONLY the code, no markdown formatting.` },
            { role: 'user', content: `Project Prompt: ${prompt}\n\nFile: ${filePath}` }
        ]);

        let content = response.content;
        // Strip markdown if present
        if (content.startsWith('```')) {
            content = content.split('\n').slice(1).join('\n').replace(/```$/, '');
        }
        return content;
    }

    async testProject(projectDir) {
        // Determine how to test based on files (e.g., package.json exists?)
        const hasPackageJson = fs.existsSync(path.join(projectDir, 'package.json'));

        if (hasPackageJson) {
            try {
                // Install deps
                console.log("Installing dependencies...");
                await this.runCommand('npm install', projectDir);

                // Run test if script exists, otherwise just try to run node index.js
                const packageJson = JSON.parse(fs.readFileSync(path.join(projectDir, 'package.json'), 'utf8'));
                if (packageJson.scripts && packageJson.scripts.test) {
                    await this.runCommand('npm test', projectDir);
                } else if (packageJson.main) {
                    // Try to run the main file briefly
                    // This is tricky as it might be a long running server.
                    // For now, assume success if install works.
                }
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }

        return { success: true }; // No obvious way to test
    }

    async fixProject(projectDir, error, prompt) {
        // Ask LLM to fix based on error
        // This is a simplified fix loop
        console.log("Fixing project...");
        // In a real implementation, we'd identify which file caused the error and update it.
        // For this MVP, we'll just log it.
    }

    runCommand(command, cwd) {
        return new Promise((resolve, reject) => {
            const [cmd, ...args] = command.split(' ');
            const child = spawn(cmd, args, { cwd, stdio: 'inherit' });
            child.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Command ${command} failed with code ${code}`));
            });
            child.on('error', reject);
        });
    }
}
