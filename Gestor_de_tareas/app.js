document.addEventListener('DOMContentLoaded', loadTasks);
document.querySelector('#task-form').addEventListener('submit', addTask);
document.querySelector('#task-list').addEventListener('click', modifyTask);

function addTask(e) {
    e.preventDefault();

    const taskName = document.querySelector('#task-name').value;
    const startDate = document.querySelector('#start-date').value;
    const endDate = document.querySelector('#end-date').value;
    const taskOwner = document.querySelector('#task-owner').value;

    if (new Date(startDate) > new Date(endDate)) {
        alert('La fecha de fin no puede ser menor que la fecha de inicio.');
        return;
    }

    const task = {
        name: taskName,
        start: startDate,
        end: endDate,
        owner: taskOwner,
        resolved: false
    };

    const taskList = document.querySelector('#task-list');
    const li = createTaskElement(task);
    taskList.appendChild(li);

    storeTaskInLocalStorage(task);

    document.querySelector('#task-form').reset();
}

function modifyTask(e) {
    if (e.target.classList.contains('resolve')) {
        const li = e.target.parentElement;
        const endDate = new Date(li.getAttribute('data-end'));
        const today = new Date();

        if (today <= endDate) {
            li.classList.remove('pending', 'overdue');
            li.classList.add('resolved');
            li.querySelector('.unresolve').classList.remove('d-none');
            e.target.classList.add('d-none');
            updateTaskInLocalStorage(li.getAttribute('data-id'), { resolved: true });
        } else {
            alert('La tarea ya venció y no puede ser marcada como resuelta.');
        }
    } else if (e.target.classList.contains('unresolve')) {
        const li = e.target.parentElement;
        li.classList.remove('resolved');
        li.classList.add('pending');
        li.querySelector('.resolve').classList.remove('d-none');
        e.target.classList.add('d-none');
        updateTaskInLocalStorage(li.getAttribute('data-id'), { resolved: false });
    } else if (e.target.classList.contains('delete')) {
        if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
            e.target.parentElement.remove();
            removeTaskFromLocalStorage(e.target.parentElement.getAttribute('data-id'));
        }
    }
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.setAttribute('data-id', task.name);
    li.setAttribute('data-end', task.end);
    li.appendChild(document.createTextNode(`${task.name} (Inicio: ${task.start} - Fin: ${task.end} - Responsable: ${task.owner})`));

    const today = new Date();
    const endDate = new Date(task.end);

    if (task.resolved) {
        li.classList.add('resolved');
    } else if (today > endDate) {
        li.classList.add('overdue');
    } else {
        li.classList.add('pending');
    }

    const resolveBtn = document.createElement('button');
    resolveBtn.className = 'btn btn-success btn-sm ml-2 resolve';
    resolveBtn.appendChild(document.createTextNode('✔'));
    if (task.resolved || today > endDate) {
        resolveBtn.classList.add('d-none');
    }
    li.appendChild(resolveBtn);

    const unresolveBtn = document.createElement('button');
    unresolveBtn.className = 'btn btn-warning btn-sm ml-2 unresolve';
    unresolveBtn.appendChild(document.createTextNode('↺'));
    if (!task.resolved) {
        unresolveBtn.classList.add('d-none');
    }
    li.appendChild(unresolveBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-sm ml-2 delete';
    deleteBtn.appendChild(document.createTextNode('✖'));
    li.appendChild(deleteBtn);

    return li;
}

function storeTaskInLocalStorage(task) {
    let tasks;
    if (localStorage.getItem('tasks') === null) {
        tasks = [];
    } else {
        tasks = JSON.parse(localStorage.getItem('tasks'));
    }
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    let tasks;
    if (localStorage.getItem('tasks') === null) {
        tasks = [];
    } else {
        tasks = JSON.parse(localStorage.getItem('tasks'));
    }

    tasks.forEach(function(task) {
        const taskList = document.querySelector('#task-list');
        const li = createTaskElement(task);
        taskList.appendChild(li);
    });
}

function updateTaskInLocalStorage(taskId, updates) {
    let tasks = JSON.parse(localStorage.getItem('tasks'));

    tasks = tasks.map(task => {
        if (task.name === taskId) {
            return { ...task, ...updates };
        }
        return task;
    });

    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function removeTaskFromLocalStorage(taskId) {
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    tasks = tasks.filter(task => task.name !== taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}
