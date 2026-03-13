const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const activeCountEl = document.getElementById('active-count');
const clearCompletedBtn = document.getElementById('clear-completed');

let todos = JSON.parse(localStorage.getItem('todos')) || [];

init();

function init() {
    renderTodos();
    updateActiveCount();
    bindEvents();
}

function bindEvents() {
    // 添加待办（按钮 + 回车）
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    // 筛选按钮
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTodos(btn.dataset.filter);
        });
    });

    // 清空已完成
    clearCompletedBtn.addEventListener('click', clearCompleted);
}

// 添加待办
function addTodo() {
    const text = todoInput.value.trim();
    if (!text) {
        // 输入为空时的反馈（适配新样式）
        todoInput.classList.add('border-red-500');
        todoInput.style.borderColor = '#ef4444';
        setTimeout(() => {
            todoInput.style.borderColor = '#e5e7eb';
        }, 1000);
        return;
    }

    // 创建新待办
    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false
    };

    // 添加到数组头部（最新的在最前面）
    todos.unshift(newTodo);
    // 保存到本地存储
    saveToLocalStorage();
    // 重新渲染
    renderTodos();
    updateActiveCount();
    // 清空输入框
    todoInput.value = '';
    todoInput.focus();
}

// 渲染待办列表
function renderTodos(filter = 'all') {
    // 清空列表
    todoList.innerHTML = '';

    // 筛选数据
    let filteredTodos = [];
    switch (filter) {
        case 'all':
            filteredTodos = todos;
            break;
        case 'active':
            filteredTodos = todos.filter(todo => !todo.completed);
            break;
        case 'completed':
            filteredTodos = todos.filter(todo => todo.completed);
            break;
    }

    // 空列表提示
    if (filteredTodos.length === 0) {
        todoList.innerHTML = `
            <li class="empty-tip">
                <i class="bi bi-list-task"></i>
                <p>暂无待办事项</p>
            </li>
        `;
        return;
    }

    // 渲染列表项
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${todo.text}</span>
            <button class="delete-btn"><i class="bi bi-trash"></i> 删除</button>
        `;

        // 绑定复选框事件（切换状态）
        const checkbox = li.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => {
            toggleTodoStatus(todo.id);
        });

        // 绑定删除按钮事件
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            deleteTodo(todo.id);
        });

        todoList.appendChild(li);
    });
}

// 切换待办状态
function toggleTodoStatus(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            todo.completed = !todo.completed;
        }
        return todo;
    });
    saveToLocalStorage();
    renderTodos(getCurrentFilter());
    updateActiveCount();
}

// 删除待办
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveToLocalStorage();
    renderTodos(getCurrentFilter());
    updateActiveCount();
}

// 清空已完成
function clearCompleted() {
    const completedCount = todos.filter(todo => todo.completed).length;
    if (completedCount === 0) return;
    
    if (confirm('确定要清空已完成的待办吗？')) {
        todos = todos.filter(todo => !todo.completed);
        saveToLocalStorage();
        renderTodos(getCurrentFilter());
        updateActiveCount();
    }
}


function getCurrentFilter() {
    return document.querySelector('.filter-btn.active').dataset.filter;
}

function updateActiveCount() {
    const activeCount = todos.filter(todo => !todo.completed).length;
    activeCountEl.textContent = activeCount;
}

function saveToLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
}