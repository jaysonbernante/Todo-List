// Load tasks and recycleBin from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let recycleBin = JSON.parse(localStorage.getItem('recycleBin') || '[]');
let currentSection = 'inbox';

// Elements
const addTaskBtn = document.getElementById('addTaskBtn');
const taskModal = document.getElementById('taskModal');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const taskTitleInput = document.getElementById('taskTitle');
const taskDescriptionInput = document.getElementById('taskDescription');
const taskDateInput = document.getElementById('taskDate');
const taskList = document.getElementById('taskList');
const sectionTitle = document.getElementById('sectionTitle');
const sidebarItems = document.querySelectorAll('.sidebar ul li');

const editModal = document.getElementById('editModal');
const editTitle = document.getElementById('editTitle');
const editDescription = document.getElementById('editDescription');
const editDate = document.getElementById('editDate');
const updateTaskBtn = document.getElementById('updateTaskBtn');

let taskBeingEdited = null;

// Show Add Task modal
addTaskBtn.onclick = () => {
  taskTitleInput.value = '';
  taskDescriptionInput.value = '';
  taskDateInput.value = '';
  taskModal.style.display = 'flex';
};

// Hide modals on outside click
taskModal.onclick = e => {
  if (e.target === taskModal) taskModal.style.display = 'none';
};
editModal.onclick = e => {
  if (e.target === editModal) editModal.style.display = 'none';
};

// Save new task
saveTaskBtn.onclick = () => {
  const title = taskTitleInput.value.trim();
  const description = taskDescriptionInput.value.trim();
  const date = taskDateInput.value;
  if (!title) return alert('Task title is required');
  tasks.push({
    id: Date.now(),
    title,
    description,
    date,
    completed: false,
    created: new Date().toISOString().slice(0, 10),
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
  taskModal.style.display = 'none';
  renderTasks();
};

// Update edited task
updateTaskBtn.onclick = () => {
  if (!editTitle.value.trim()) return alert('Task title is required');
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

// Sidebar navigation
sidebarItems.forEach(item => {
  item.onclick = () => {
    sidebarItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    currentSection = item.getAttribute('data-section');
    sectionTitle.textContent = item.textContent;
    renderTasks();
  };
});

// Render tasks or recycle bin based on currentSection
function renderTasks() {
  taskList.innerHTML = '';
  const todayDate = new Date().toISOString().slice(0, 10);

  let filtered = [];

  if (currentSection === 'inbox') {
    filtered = tasks.filter(t => !t.completed).reverse();
  } else if (currentSection === 'today') {
    filtered = tasks.filter(t => t.date === todayDate && !t.completed).reverse();
  } else if (currentSection === 'upcoming') {
    filtered = tasks.filter(t => t.date > todayDate && !t.completed).reverse();
  } else if (currentSection === 'completed') {
    filtered = tasks.filter(t => t.completed).reverse();
  } else if (currentSection === 'recycle') {
    filtered = recycleBin.slice().reverse();
  }

  if (filtered.length === 0) {
    taskList.innerHTML = '<p>No tasks found.</p>';
    return;
  }

  filtered.forEach(task => {
    const div = document.createElement('div');
    div.className = 'task' + (task.completed ? ' completed' : '');

    if (currentSection === 'recycle') {
      // Recycle bin layout
      div.innerHTML = `
        <div class="task-content">
          <strong>${task.title}</strong>
          ${task.date ? `<small style="color:#888;"> (${task.date})</small>` : ''}
          ${task.description ? `<p style="margin: 5px 0 0; color:#555;">${task.description}</p>` : ''}
        </div>
        <div class="menu">
          <button class="menu-btn">⋮</button>
          <div class="menu-content">
            <button class="restore">Restore</button>
            <button class="delete-permanent">Delete Permanently</button>
          </div>
        </div>
      `;

      // Restore task
      div.querySelector('.restore').onclick = () => {
        recycleBin = recycleBin.filter(t => t.id !== task.id);
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('recycleBin', JSON.stringify(recycleBin));
        renderTasks();
      };

      // Delete permanently
      div.querySelector('.delete-permanent').onclick = () => {
        recycleBin = recycleBin.filter(t => t.id !== task.id);
        localStorage.setItem('recycleBin', JSON.stringify(recycleBin));
        renderTasks();
      };

    } else {
      // Normal task layout
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
            <button class="delete">Delete</button>
          </div>
        </div>
      `;

      // Checkbox completion handler
      const checkbox = div.querySelector('input[type="checkbox"]');
      checkbox.onchange = () => {
        if (checkbox.checked) {
          task.completed = true;
          localStorage.setItem('tasks', JSON.stringify(tasks));
          currentSection = 'completed';
          sidebarItems.forEach(i => i.classList.remove('active'));
          document.querySelector('[data-section="completed"]').classList.add('active');
          sectionTitle.textContent = 'Completed';
          renderTasks();
        }
      };

      // Delete moves task to recycle bin
      div.querySelector('.delete').onclick = () => {
        tasks = tasks.filter(t => t.id !== task.id);
        recycleBin.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('recycleBin', JSON.stringify(recycleBin));
        renderTasks();
      };

      // Edit opens edit modal
      div.querySelector('.edit').onclick = () => {
        openEditModal(task);
      };
    }

    taskList.appendChild(div);
  });
}

// Initial render
renderTasks();
