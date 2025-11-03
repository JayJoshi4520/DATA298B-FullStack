# ============================================
# adk_service.py — Fixed Async Session Creation (Generic ADK Pipeline)
# ============================================

import json
from multiprocessing import process
import sys
import asyncio
from google.adk.agents.llm_agent import LlmAgent
from google.adk.agents.sequential_agent import SequentialAgent
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types as genai_types
from google.adk.agents import Agent, LoopAgent, LlmAgent, SequentialAgent
from google.adk.tools.mcp_tool.mcp_toolset import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
from google.adk.code_executors import BuiltInCodeExecutor
from mcp import StdioServerParameters
import os
import subprocess
from typing import Any, Dict


# ============================================================================
# CONFIGURATION
# ============================================================================
LLM_MODEL = os.getenv("LLM_MODEL")
TARGET_FOLDER_PATH = os.getenv("TARGET_FOLDER_PATH", "/home/coder/project/")
SCRIPT = os.path.join(TARGET_FOLDER_PATH, "output.py")

# Ensure target directory exists
os.makedirs(TARGET_FOLDER_PATH, exist_ok=True)

# ============================================================================
# MCP TOOLSETS
# ============================================================================
# Filesystem operations
filesystem_toolset = McpToolset(
    connection_params=StdioConnectionParams(
        server_params=StdioServerParameters(
            command="npx",
            args=[
                "-y",
                "@modelcontextprotocol/server-filesystem",
                os.path.abspath(TARGET_FOLDER_PATH),
            ],
        )
    )
)

MODEL = "gemini-2.0-flash"

# ============================================================================
# EVENT EMITTER FOR STREAMING
# ============================================================================
def emit_event(event_type: str, data: Dict[str, Any]):
    """Emit structured JSON event to stderr for streaming to frontend."""
    event_data = {"event": event_type, **data}
    print(json.dumps(event_data), file=sys.stderr, flush=True)



async def run_pipeline_async(user_message: str):

    # Create async in-memory session
    session_service = InMemorySessionService()
    # Debug to stderr to avoid corrupting JSON stdout
    print(f"Current PATH is: {TARGET_FOLDER_PATH}", file=sys.stderr, flush=True)

    # ✅ Await session creation (fixes coroutine warning + missing session)
    await session_service.create_session(
        app_name="node_adk_bridge",
        user_id="node_user",
        session_id="adk_session",
    )

    # ============================================================================
    # AGENT 1: CODE WRITER (No tools - just generates code as text)
    # ============================================================================
    code_writer_agent = LlmAgent(
        name="CodeWriterAgent",
        model=LLM_MODEL,
        instruction=f"""You are a senior software engineer specializing in project scaffolding and code generation.

    **Your Task:**
    Generate a complete, runnable Python script that fulfills the user's request by programmatically creating files and folders.

    **Target Directory:** {TARGET_FOLDER_PATH}

    **IMPORTANT: Start your response with a detailed analysis section:**
    
    ## 📋 Problem Analysis
    [Provide detailed reasoning about what the user wants to build, key requirements, and technical considerations]
    
    ## 🎯 Approach
    [Explain your step-by-step approach to solve this problem, including:
    - Project structure design
    - Technology choices and why
    - Key components and their purposes
    - Implementation strategy]
    
    ## 💡 Key Code Snippets
    [Highlight 2-3 important code patterns or configurations that make this solution work]
    
    ## 🚀 How to Run
    [Provide clear, step-by-step instructions on how to run the generated project:
    1. Navigate to the project directory
    2. Install dependencies (with exact commands)
    3. Run the application (with exact commands)
    4. Access the application (URLs, ports, etc.)]
    
    ---
    
    **Then, generate the complete Python script:**

    **Guidelines:**
    1. **Understand the Request:** Carefully analyze what the user wants to build

    2. **Generate Complete Code:** Create a fully working Python script with:
    - Proper imports (os, subprocess, pathlib, json, etc.)
    - Clear variable definitions
    - Step-by-step logic to create project structure
    - File creation with appropriate content
    - Comprehensive error handling with try-except blocks
    - Progress logging with descriptive print statements
    
    3. **Project Structure Best Practices:**
    - For React apps: Create manual structure (don't rely on create-react-app in generated code)
    - For Python projects: Create proper package structure with __init__.py files
    - Include README.md, .gitignore, package.json, and other standard files
    - Generate actual working code content, not placeholders or TODOs
    
    4. **File Operations:**
    - Use absolute paths: `os.path.join("{TARGET_FOLDER_PATH}", ...)`
    - Create directories: `os.makedirs(path, exist_ok=True)`
    - Write files with: `with open(path, 'w', encoding='utf-8') as f:`
    - Wrap all file operations in try-except blocks
    
    5. **Code Structure Requirements:**
    ```python
    #!/usr/bin/env python3
    \"\"\"
    Script to create [project description]
    Generated by CodeWriterAgent
    \"\"\"
    import os
    import json
    from pathlib import Path
    
    def main():
        base_path = "{TARGET_FOLDER_PATH}"
        project_name = "your-project-name"
        project_path = os.path.join(base_path, project_name)
        
        try:
            # Create directories
            print(f"Creating project at: project_path")
            os.makedirs(project_path, exist_ok=True)
            
            # Create files with actual content
            # ... your code here
            
            print("✓ Project created successfully!")
            return True
        except Exception as e:
            print(f"✗ Error creating project: e")
            return False
    
    if __name__ == "__main__":
        main()
    ```

    6. **For React Projects - Manual Setup:**
    Create the following structure manually:
    - package.json with dependencies (react, react-dom, react-scripts)
    - public/index.html
    - src/index.js, src/App.js, src/App.css
    - .gitignore
    - README.md

    **Output Format:**
    First provide the analysis sections (Problem Analysis, Approach, Key Code Snippets, How to Run), then output the complete Python code.
    """,
        description="Generates complete Python code for project creation with detailed reasoning",
        output_key="generated_code"
    )

    # ============================================================================
    # AGENT 2: CODE REVIEWER (No tools needed - just reviews text)
    # ============================================================================
    code_reviewer_agent = LlmAgent(
        name="CodeReviewerAgent",
        model=LLM_MODEL,
        instruction="""You are an expert code reviewer specializing in Python automation scripts.

    **Your Task:**
    Review the generated Python code for quality, correctness, and safety.

    **Code to Review:**
    {generated_code}

    **Review Checklist:**

    1. **Correctness:**
    - Does it fulfill the original user request?
    - Are all file paths constructed correctly using os.path.join()?
    - Will it create the intended project structure?
    - Are all necessary imports present?

    2. **Error Handling:**
    - Are all file operations wrapped in try-except blocks?
    - Are meaningful error messages provided?
    - Does it have proper error recovery?

    3. **Safety:**
    - Does it avoid destructive operations?
    - Are paths properly validated?
    - Does it use exist_ok=True to avoid conflicts?

    4. **Completeness:**
    - Are there any placeholder comments (TODO, "add more", etc.)?
    - Does package.json have all required dependencies?
    - Are all component files fully implemented?
    - Is there a proper main() function with if __name__ guard?

    5. **Code Quality:**
    - Clear variable names?
    - Proper logging/print statements?
    - Well-organized and readable?
    - Has docstring at the top?

    6. **Content Quality:**
    - For React: Are components functional with proper JSX?
    - For HTML: Is it valid HTML5?
    - For CSS: Are styles appropriate?
    - No empty files or placeholder content?

    **Output Format:**
    - If code is production-ready: "APPROVED: Code is complete and ready to save."
    - If issues exist:
    ```
    ISSUES FOUND:
    - Missing error handling in file creation (lines X-Y)
    - package.json missing dependency: [name]
    - App.js contains placeholder TODO comments
    - No main() function or if __name__ guard
    [Continue listing all specific issues]
    ```

    Be specific about what needs fixing. Output ONLY the review result.
    """,
        description="Reviews generated code for completeness and correctness",
        output_key="review_comments"
    )

    # ============================================================================
    # AGENT 3: CODE REFACTORER (No tools - just refactors text)
    # ============================================================================
    code_refactorer_agent = LlmAgent(
        name="CodeRefactorerAgent",
        model=LLM_MODEL,
        instruction=f"""You are a Python refactoring expert.

    **Your Task:**
    Refactor the code based on reviewer feedback to make it production-ready.

    **Original Code:**
    {{generated_code}}

    **Reviewer Feedback:**
    {{review_comments}}

    **Instructions:**

    1. **If Approved (starts with "APPROVED"):** 
    - Keep the code exactly as-is, no changes needed
    
    2. **If Issues Found:**
    - Address EVERY specific issue mentioned
    - Remove ALL placeholder comments and TODOs
    - Add comprehensive error handling
    - Ensure all files have actual, working content
    - Add docstrings and helpful comments
    - Improve code structure and organization
    
    3. **Refactoring Checklist:**
    - ✓ Add module-level docstring
    - ✓ Create main() function
    - ✓ Add if __name__ == "__main__": guard
    - ✓ Wrap all file operations in try-except
    - ✓ Use descriptive variable names
    - ✓ Add progress logging (print statements)
    - ✓ Ensure all content is complete (no placeholders)
    - ✓ For React: Full working components with JSX
    - ✓ For configs: Complete, valid JSON/YAML
    
    4. **Quality Standards:**
    - Every file created must have real, working content
    - No "// Add your code here" comments
    - No "TODO" items left in the code
    - All dependencies in package.json must be specified
    - All imports must be at the top
    
    **Output Format:**
    Output ONLY the complete, refactored Python code. No explanations, no markdown, just the raw Python code ready to be saved.

    The code should be immediately executable and create a fully functional project.
    """,
        description="Refactors code based on feedback to ensure production quality",
        output_key="refactored_code"
    )

    # ============================================================================
    # AGENT 4: FILE SAVER (Uses MCP tools to save the file)
    # ============================================================================
    file_saver_agent = LlmAgent(
        name="FileSaverAgent",
        model=LLM_MODEL,
        tools=[filesystem_toolset],
        instruction=f"""You are a file management specialist with access to filesystem tools.

    **Your Task:**
    Save the final Python script to disk using the write_file tool.

    **Final Code to Save:**
    {{refactored_code}}

    **Instructions:**
    1. Extract ONLY the Python code section (everything after the analysis sections)
    2. Use the `write_file` tool to save the code
    3. Filename: `output.py`
    4. Full path: `{TARGET_FOLDER_PATH}output.py`
    5. Content: The complete refactored Python code (without the markdown analysis sections)

    **CRITICAL:**
    - You MUST call the write_file tool
    - Save ONLY the Python code, not the analysis sections
    - Verify the save was successful

    **After saving:**
    Report: "✓ Successfully saved output.py to {TARGET_FOLDER_PATH}"

    If there's an error saving, report: "✗ Error saving file: [error details]
    """,
        description="Saves the final Python script to output.py using filesystem tools",
        output_key="save_status"
    )

    # ============================================================================
    # AGENT 5: PYTHON CODE EXECUTOR (Uses BuiltInCodeExecutor + filesystem)
    # ============================================================================
    # code_executor_agent = LlmAgent(
    #     name="CodeExecutorAgent",
    #     model=LLM_MODEL,
    #     code_executor=BuiltInCodeExecutor(),
    #     tools=[filesystem_toolset],
    #     instruction=f"""You are a Python code execution specialist with access to code execution and filesystem tools.

    # **Your Task:**
    # Execute the saved Python script (output.py) to actually create the project structure.

    # **File Location:** {TARGET_FOLDER_PATH}output.py

    # **Step-by-Step Process:**

    # 1. **Read the Script:**
    #    - Use the filesystem tool to read the content of `output.py`
    #    - Verify the file exists and contains valid Python code
    #    - Display the first few lines to confirm it loaded correctly

    # 2. **Execute the Code:**
    #    - Use the code executor to run the Python script
    #    - The script will create the actual project files and folders
    #    - Capture all print output and error messages

    # 3. **Verify Results:**
    #    - After execution, use filesystem tools to check if files were created
    #    - List the contents of the target directory
    #    - Confirm the project structure matches expectations

    # 4. **Report Results:**
    #    Provide a structured report:
    #    ```
    #    ═══════════════════════════════════════════════════════════
    #    📋 EXECUTION REPORT
    #    ═══════════════════════════════════════════════════════════
    
    #    📂 Script Location: {TARGET_FOLDER_PATH}output.py
    
    #    ▶️  EXECUTION OUTPUT:
    #    ───────────────────────────────────────────────────────────
    #    [All output from the script execution]
    #    ───────────────────────────────────────────────────────────
    
    #    📊 EXECUTION STATUS: [✅ SUCCESS / ❌ ERROR / ⚠️ PARTIAL]
    
    #    📁 Project Location: {TARGET_FOLDER_PATH}[project-name]/
    
    #    📝 Files/Folders Created:
    #    - [List all created items]
    
    #    [If errors: show error details and suggestions]
    #    ═══════════════════════════════════════════════════════════
    #    ```

    # **Error Handling:**
    # If execution fails, analyze and report:
    # - **Syntax Error:** Code has Python syntax issues
    # - **Permission Error:** Cannot write to target directory
    # - **Import Error:** Missing required Python packages
    # - **Path Error:** Invalid or inaccessible paths
    # - **Runtime Error:** Error during execution

    # For each error type, provide specific remediation steps.

    # **CRITICAL REQUIREMENTS:**
    # - You MUST actually execute the code, not just describe what would happen
    # - Use code_executor to run the Python script
    # - Capture and display ALL output (stdout and stderr)
    # - Verify the project was created by checking the filesystem
    # - Provide actionable feedback if anything fails
    # """,
    #     description="Executes the generated output.py script using BuiltInCodeExecutor",
    #     output_key="execution_result"
    # )

    # ============================================================================
    # COMPOSITE AGENTS
    # ============================================================================

    # Loop for iterative improvement (Review -> Refactor)
    code_improvement_loop = LoopAgent(
        name="CodeImprovementLoop",
        sub_agents=[code_reviewer_agent, code_refactorer_agent],
        max_iterations=1,
        description="Iteratively reviews and refactors code until approved or max iterations"
    )

    # Pipeline WITHOUT execution: Write -> Improve -> Save
    # code_pipeline_agent = SequentialAgent(
    #     name="CodePipelineAgent",
    #     sub_agents=[code_writer_agent, file_saver_agent],
    #     description="Pipeline: generates code and saves to output.py"
    # )

    # FULL pipeline WITH execution: Write -> Improve -> Save -> Execute
        
    code_pipeline_agent = SequentialAgent(
        name="FullPipelineAgent",
        sub_agents=[
            code_writer_agent,
            code_improvement_loop,  
            file_saver_agent,
        ],
        description="Complete pipeline: generates, improves, saves, and EXECUTES the code to build the project",
    )

    # ============================================================================
    # ROOT AGENT
    # ============================================================================
    # Choose one:

    # Option 1: Just generate and save (no execution)
    # root_agent = code_pipeline_agent

    # Option 2 (disabled for speed): Generate, save, AND execute
    # root_agent = full_pipeline_agent

    # Use the faster pipeline to avoid timeouts
    root_agent = code_pipeline_agent

    runner = Runner(
        agent=root_agent,
        app_name="node_adk_bridge",
        session_service=session_service,
    )

    # Prepare user message
    message = genai_types.Content(
        role="user",
        parts=[genai_types.Part(text=user_message)],
    )

    outputs = []
    current_agent = None

    # Emit initial pipeline start
    emit_event("pipeline.start", {"message": "Starting ADK pipeline"})
    
    # Emit agent sequence
    agents_sequence = [
        {"name": "CodeWriterAgent", "description": "Analyzing problem and generating code"},
        {"name": "CodeReviewerAgent", "description": "Reviewing code quality"},
        {"name": "CodeRefactorerAgent", "description": "Refactoring code"},
        {"name": "FileSaverAgent", "description": "Saving project files"},
    ]
    
    agent_index = 0

    # Run the pipeline
    try:
        async for event in runner.run_async(
            user_id="node_user",
            session_id="adk_session",
            new_message=message,
        ):
            # Detect agent transitions by checking event type and content
            event_type = type(event).__name__
            
            # Emit agent start for each step
            if event_type in ["AgentStartEvent", "AgentThinkingEvent"] or (hasattr(event, 'content') and event.content):
                if agent_index < len(agents_sequence):
                    agent_info = agents_sequence[agent_index]
                    if current_agent != agent_info["name"]:
                        current_agent = agent_info["name"]
                        emit_event("agent.start", {
                            "agent": agent_info["name"],
                            "description": agent_info["description"],
                            "timestamp": None
                        })
            
            # Detect tool usage from function calls in event
            if hasattr(event, 'function_calls') and event.function_calls:
                for func_call in event.function_calls:
                    tool_name = getattr(func_call, 'name', 'unknown_tool')
                    emit_event("tool.use", {
                        "agent": current_agent or "Unknown",
                        "tool": tool_name,
                        "timestamp": None
                    })
            
            # Check for tool calls in content parts
            if hasattr(event, 'content') and hasattr(event.content, 'parts'):
                for part in event.content.parts:
                    if hasattr(part, 'function_call'):
                        tool_name = getattr(part.function_call, 'name', 'unknown_tool')
                        emit_event("tool.use", {
                            "agent": current_agent or "Unknown",
                            "tool": tool_name,
                            "timestamp": None
                        })
            
            # Collect final outputs
            if event.is_final_response() and hasattr(event.content, "parts"):
                for part in event.content.parts:
                    if hasattr(part, "text"):
                        outputs.append(part.text)
                        agent_index += 1  # Move to next agent after response
    except Exception as e:
        # Return a single-element outputs array with a readable error
        err_msg = str(e)
        emit_event("pipeline.error", {"error": err_msg})
        return [f"ADK error: {err_msg}"]

    # Process outputs to extract only the analysis sections (not the Python code)
    processed_outputs = []
    for output in outputs:
        # Split by common code markers
        if "```python" in output:
            # Extract only the part before the Python code block
            parts = output.split("```python")
            analysis_section = parts[0].strip()
            if analysis_section:
                processed_outputs.append(analysis_section)
        elif "#!/usr/bin/env python" in output:
            # Extract only the part before the shebang
            parts = output.split("#!/usr/bin/env python")
            analysis_section = parts[0].strip()
            if analysis_section:
                processed_outputs.append(analysis_section)
        else:
            # If no code detected, include the whole output
            processed_outputs.append(output)
    
    emit_event("pipeline.complete", {"message": "ADK pipeline completed successfully"})
    return processed_outputs if processed_outputs else outputs


def run_pipeline(user_message: str):
    """Entry point that runs the async ADK pipeline synchronously."""
    return asyncio.run(run_pipeline_async(user_message))


if __name__ == "__main__":
    msg = sys.argv[1] if len(sys.argv) > 1 else "Help me create something new"
    result = run_pipeline(msg)
    # Ensure clean JSON array string to stdout only
    sys.stdout.write(json.dumps(result))
    sys.stdout.flush()
