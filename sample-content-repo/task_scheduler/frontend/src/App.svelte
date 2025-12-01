<script>
  import { onMount } from 'svelte';
  import axios from 'axios';

  // State variables
  let tasks = [];
  let newTask = {
    title: '',
    date: '',
    priority: 'Medium'
  };
  let loading = false;
  let error = null;

  // API Base URL (assumes localhost:8000 for local dev)
  const API_URL = 'http://localhost:8000/tasks';

  // Fetch tasks on component mount
  onMount(async () => {
    await fetchTasks();
  });

  async function fetchTasks() {
    try {
      loading = true;
      const response = await axios.get(API_URL);
      tasks = response.data;
      error = null;
    } catch (err) {
      console.error(err);
      error = "Failed to connect to backend. Is it running?";
    } finally {
      loading = false;
    }
  }

  async function addTask() {
    if (!newTask.title || !newTask.date) {
      alert("Please fill in Title and Date");
      return;
    }

    try {
      await axios.post(API_URL, newTask);
      // Reset form
      newTask = { title: '', date: '', priority: 'Medium' };
      // Refresh list
      await fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Error adding task");
    }
  }

  async function deleteTask(id) {
    if(!confirm("Are you sure you want to delete this task?")) return;
    
    try {
      await axios.delete(`${API_URL}/${id}`);
      await fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Error deleting task");
    }
  }
</script>

<main>
  <h1>Task Scheduler</h1>

  <div class="card">
    <h2>Add New Task</h2>
    <div class="input-group">
      <input 
        type="text" 
        placeholder="Task Title" 
        bind:value={newTask.title} 
      />
      <input 
        type="date" 
        bind:value={newTask.date} 
      />
      <select bind:value={newTask.priority}>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
        <option value="Critical">Critical</option>
      </select>
      <button on:click={addTask}>Add Task</button>
    </div>
  </div>

  {#if error}
    <div style="color: #ff4646; margin: 1rem;">{error}</div>
  {/if}

  {#if loading}
    <p>Loading tasks...</p>
  {:else if tasks.length === 0}
    <p>No tasks scheduled. Add one above!</p>
  {:else}
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Date</th>
          <th>Priority</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {#each tasks as task (task.id)}
          <tr>
            <td>{task.title}</td>
            <td>{task.date}</td>
            <td>
              <span style="
                color: {task.priority === 'High' || task.priority === 'Critical' ? '#ff4646' : 'inherit'};
                font-weight: {task.priority === 'High' || task.priority === 'Critical' ? 'bold' : 'normal'}
              ">
                {task.priority}
              </span>
            </td>
            <td>
              <button class="delete-btn" on:click={() => deleteTask(task.id)}>Delete</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</main>
