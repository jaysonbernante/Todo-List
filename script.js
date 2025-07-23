let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let currentSection = 'inbox';

const addTaskBtn = document.getElementById('addTaskBtn');
const taskModal = document.getElementById('taskModal');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const taskTitleInput = document.getElementById('taskTitle');
const taskDateInput = document.getElementById('taskDate');
const taskDescriptionInput = document.getElementById('taskDescription');
const taskList = document.getElementById('taskList');
const sectionTitle = document.getElementById('sectionTitle');
const sidebarItems = document.querySelectorAll('.sidebar ul li');
const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
const sidebar = document.getElementById('sidebar');

const editModal = document.getElementById('editModal');
const editTitle = document.getElementById('editTitle');
const editDescription = document.getElementById('editDescription');
const editDate = document.getElementById('editDate');
const updateTaskBtn = document.getElementById('updateTaskBtn');

let taskBeingEdited = null;

addTaskBtn.onclick = () => {
  taskTitleInput.value = '';
  taskDescriptionInput.value = '';
  taskDateInput.value = '';
  taskModal.style.display = 'flex';
};

taskModal.onclick = e => {
  if (e.target === taskModal) taskModal.style.display = 'none';
};

editModal.onclick = e => {
  if (e.target === editModal) editModal.style.display = 'none';
};

saveTaskBtn.onclick = () => {
  const title = taskTitleInput.value.trim();
  const description = taskDescriptionInput.value.trim();
  const date = taskDateInput.value;
  if (!title) return;
  tasks.push({
    id: Date.now(),
    title,
    description,
    date,
    completed: false,
    deleted: false,
    created: new Date().toISOString().slice(0, 10),
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
  taskModal.style.display = 'none';
  renderTasks();
};

updateTaskBtn.onclick = () => {
  if (!editTitle.value.trim()) return;
  taskBeingEdited.title = editTitle.value.trim();
  taskBeingEdited.description = editDescription.value.trim();
  taskBeingEdited.date = editDate.value;
  localStorage.setItem('tasks', JSON.stringify(tasks));
  editModal.style.display = 'none';
  renderTasks();
};

function openEditModal(task) {
  taskBeingEdited = task;
  editTitle.value = task.title;
  editDescription.value = task.description || '';
  editDate.value = task.date || '';
  editModal.style.display = 'flex';
}

sidebarItems.forEach(item => {
  item.onclick = () => {
    sidebarItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    currentSection = item.getAttribute('data-section');
    sectionTitle.textContent = item.textContent;
    sidebar.classList.remove('show');
    renderTasks();
  };
});

toggleSidebarBtn.onclick = () => {
  sidebar.classList.toggle('show');
};

function renderTasks() {
  taskList.innerHTML = '';
  const todayDate = new Date().toISOString().slice(0, 10);
  let filtered = [];

  if (currentSection === 'inbox') {
    filtered = tasks.filter(t => !t.completed && !t.deleted).reverse();
  } else if (currentSection === 'today') {
    filtered = tasks.filter(t => t.date === todayDate && !t.completed && !t.deleted).reverse();
  } else if (currentSection === 'upcoming') {
    filtered = tasks.filter(t => t.date > todayDate && !t.completed && !t.deleted).reverse();
  } else if (currentSection === 'completed') {
    filtered = tasks.filter(t => t.completed && !t.deleted).reverse();
  } else if (currentSection === 'recycle') {
    filtered = tasks.filter(t => t.deleted).reverse();
  }

  if (filtered.length === 0) {
    taskList.innerHTML = '<p>No tasks found.</p>';
    return;
  }

  filtered.forEach(task => {
    const div = document.createElement('div');
    div.className = 'task' + (task.completed ? ' completed' : '');

    div.innerHTML = `
      <label class="task-check">
        <input type="checkbox" ${task.completed ? 'checked' : ''}>
        <span class="checkmark"></span>
      </label>
      <div class="task-content">
        <strong>${task.title}</strong>
        ${task.date ? `<small style="color:#888;"> (${task.date})</small>` : ''}
        ${task.description ? `<p style="margin: 5px 0 0; color:#555;">${task.description}</p>` : ''}
      </div>
      <div class="menu">
        <button class="menu-btn">⋮</button>
        <div class="menu-content">
          <button class="edit">Edit</button>
          <button class="delete">${task.deleted ? 'Restore' : 'Delete'}</button>
        </div>
      </div>
    `;

    const checkbox = div.querySelector('input[type="checkbox"]');
    checkbox.onchange = () => {
      task.completed = checkbox.checked;
      localStorage.setItem('tasks', JSON.stringify(tasks));
      renderTasks();
    };

    div.querySelector('.delete').onclick = () => {
      task.deleted = !task.deleted;
      localStorage.setItem('tasks', JSON.stringify(tasks));
      renderTasks();
    };

    div.querySelector('.edit').onclick = () => {
      openEditModal(task);
    };

    taskList.appendChild(div);
  });
}

renderTasks();
