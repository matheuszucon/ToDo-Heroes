// O evento 'DOMContentLoaded' garante que o script só será executado 
// depois que toda a estrutura HTML da página for carregada.
document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES DO DOM ---
    const taskInput = document.getElementById('task-input');
    const addTaskButton = document.getElementById('add-task-button');
    const taskList = document.getElementById('task-list');
    const filterButtonsContainer = document.getElementById('filter-buttons');

    // --- ESTADO DA APLICAÇÃO ---
    let tasks = getTasksFromStorage();
    let currentFilter = 'all';

    // --- FUNÇÕES DE PERSISTÊNCIA (LocalStorage) ---
    function getTasksFromStorage() {
        const tasks = localStorage.getItem('tasks');
        return tasks ? JSON.parse(tasks) : [];
    };

    function saveTasksToStorage(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // --- FUNÇÕES DE MANIPULAÇÃO DAS TAREFAS (CRUD E RENDERIZAÇÃO) ---

    const renderTasks = () => {
        taskList.innerHTML = '';
        updateFilterButtonsUI();

        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'pending') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `flex items-center justify-between bg-gray-800/90 backdrop-blur-sm p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700/50 hover:border-blue-400/50 text-gray-100 ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.className = 'form-checkbox h-6 w-6 text-purple-600 rounded-lg cursor-pointer transition-all duration-300 hover:scale-110 focus:ring-2 focus:ring-purple-500';
            checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

            const taskTextSpan = document.createElement('span');
            taskTextSpan.textContent = task.text;
            taskTextSpan.className = 'flex-grow mx-4';

            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'flex items-center gap-2';

            const editButton = document.createElement('button');
            editButton.textContent = '✏️ Editar';
            editButton.className = 'text-sm bg-amber-600 text-amber-100 hover:bg-amber-700 font-medium transition-all duration-300 px-3 py-1 rounded-full hover:scale-105';
            editButton.addEventListener('click', () => enableEditing(li, taskTextSpan, task));

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '🗑️ Excluir';
            deleteButton.className = 'text-sm bg-red-600 text-red-100 hover:bg-red-700 font-medium transition-all duration-300 px-3 py-1 rounded-full hover:scale-105';
            deleteButton.addEventListener('click', () => deleteTask(task.id));

            li.appendChild(checkbox);
            li.appendChild(taskTextSpan);
            buttonsDiv.appendChild(editButton);
            buttonsDiv.appendChild(deleteButton);
            li.appendChild(buttonsDiv);

            taskList.appendChild(li);
        });
    };

    const addTask = () => {
        const taskText = taskInput.value.trim();
        if (taskText === '') {
            taskInput.classList.add('border-red-500', 'ring-red-500');
            taskInput.placeholder = 'O campo não pode estar vazio!';
            setTimeout(() => {
                taskInput.classList.remove('border-red-500', 'ring-red-500');
                taskInput.placeholder = 'Digite uma nova tarefa...';
            }, 2000);
            return;
        }
        const newTask = { id: Date.now(), text: taskText, completed: false };
        tasks.unshift(newTask);
        saveTasksToStorage(tasks);
        renderTasks();
        taskInput.value = '';
        taskInput.focus();
    };

    const toggleTaskCompletion = (id) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasksToStorage(tasks);
            renderTasks();
        }
    };

    /**
     * Exclui uma tarefa da lista com uma animação de saída.
     * @param {number} id - O ID da tarefa a ser excluída.
     */
    const deleteTask = (id) => {
        // 1. Encontra o elemento LI na página para aplicar a animação.
        const taskElement = taskList.querySelector(`[data-id="${id}"]`);

        if (taskElement) {
            // 2. Adiciona a classe CSS que aciona a transição de saída.
            taskElement.classList.add('task-exit');

            // 3. Aguarda a animação terminar (300ms, igual à duração da transição no CSS).
            setTimeout(() => {
                // 4. Após a animação, remove os dados e renderiza a lista novamente.
                tasks = tasks.filter(t => t.id !== id);
                saveTasksToStorage(tasks);
                renderTasks();
            }, 300);
        }
    };

    const enableEditing = (li, span, task) => {
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = task.text;
        editInput.className = 'flex-grow mx-4 editing-input bg-gray-700 text-gray-100 p-1 rounded border border-gray-600';
        li.replaceChild(editInput, span);
        editInput.focus();

        const saveEdit = () => {
            const newText = editInput.value.trim();
            if (newText) {
                task.text = newText;
            }
            saveTasksToStorage(tasks);
            renderTasks();
        };

        editInput.addEventListener('blur', saveEdit);
        editInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') saveEdit();
            if (e.key === 'Escape') renderTasks();
        });
    };

    const updateFilterButtonsUI = () => {
        const buttons = filterButtonsContainer.querySelectorAll('.filter-btn');
        buttons.forEach(button => {
            if (button.dataset.filter === currentFilter) {
                button.classList.add('bg-blue-600', 'text-white');
                button.classList.remove('bg-white', 'text-gray-600');
            } else {
                button.classList.add('bg-gray-700', 'text-gray-300');
                button.classList.remove('bg-blue-600', 'text-white');
            }
        });
    };

    // --- EVENT LISTENERS ---
    addTaskButton.addEventListener('click', addTask);
    taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addTask();
    });

    filterButtonsContainer.addEventListener('click', (e) => {
        if (e.target.matches('.filter-btn')) {
            currentFilter = e.target.dataset.filter;
            renderTasks();
        }
    });

    // --- INICIALIZAÇÃO ---
    renderTasks();
});
