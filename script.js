 // Task storage
        let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        let currentSection = 'inbox';

        // Elements
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskModal = document.getElementById('taskModal');
        const saveTaskBtn = document.getElementById('saveTaskBtn');
        const taskTitleInput = document.getElementById('taskTitle');
        const taskDateInput = document.getElementById('taskDate');
        const taskList = document.getElementById('taskList');
        const sectionTitle = document.getElementById('sectionTitle');
        const sidebarItems = document.querySelectorAll('.sidebar ul li');

        // Show modal
        addTaskBtn.onclick = () => {
            taskTitleInput.value = '';
            taskDateInput.value = '';
            taskModal.style.display = 'flex';
        };

        // Hide modal on outside click
        taskModal.onclick = (e) => {
            if (e.target === taskModal) taskModal.style.display = 'none';
        };

        // Save task
        saveTaskBtn.onclick = () => {
            const title = taskTitleInput.value.trim();
            const date = taskDateInput.value;
            if (!title) return;
            tasks.push({
                id: Date.now(),
                title,
                date,
                completed: false,
                created: new Date().toISOString().slice(0,10)
            });
            localStorage.setItem('tasks', JSON.stringify(tasks));
            taskModal.style.display = 'none';
            renderTasks();
        };

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

        // Render tasks
        function renderTasks() {
            taskList.innerHTML = '';
            let filtered = [];
            const todayDate = new Date().toISOString().slice(0,10);

            if (currentSection === 'inbox') {
                filtered = tasks.slice().reverse();
            } else if (currentSection === 'today') {
                filtered = tasks.filter(t => t.date === todayDate && !t.completed).reverse();
            } else if (currentSection === 'upcoming') {
                filtered = tasks.filter(t => t.date > todayDate && !t.completed).reverse();
            } else if (currentSection === 'completed') {
                filtered = tasks.filter(t => t.completed).reverse();
            }

            if (filtered.length === 0) {
                taskList.innerHTML = '<p>No tasks found.</p>';
                return;
            }

            filtered.forEach(task => {
                const div = document.createElement('div');
                div.className = 'task' + (task.completed ? ' completed' : '');
                div.innerHTML = `
                    <span>
                        ${task.title}
                        ${task.date ? `<small style="color:#888;"> (${task.date})</small>` : ''}
                    </span>
                    <span class="actions">
                        ${!task.completed ? `<button class="complete">Complete</button>` : ''}
                        <button class="delete">Delete</button>
                    </span>
                `;
                // Complete button
                if (!task.completed) {
                    div.querySelector('.complete').onclick = () => {
                        task.completed = true;
                        localStorage.setItem('tasks', JSON.stringify(tasks));
                        renderTasks();
                    };
                }
                // Delete button
                div.querySelector('.delete').onclick = () => {
                    tasks = tasks.filter(t => t.id !== task.id);
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                    renderTasks();
                };
                taskList.appendChild(div);
            });
        }

        // Initial render
        renderTasks();