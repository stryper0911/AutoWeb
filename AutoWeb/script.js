// DOM이 완전히 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    console.log('웹사이트가 로드되었습니다.');
    
    // 여기에 JavaScript 코드를 추가할 수 있습니다
    const content = document.getElementById('content');
    content.innerHTML = '<p>자동화된 웹사이트에 오신 것을 환영합니다!</p>';
}); 

// Todo 항목을 저장할 배열
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// DOM 요소들
const todoInput = document.getElementById('todoInput');
const todoDate = document.getElementById('todoDate');
const addTodoBtn = document.getElementById('addTodo');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');

// 현재 필터 상태
let currentFilter = 'all';
// 수정 모드 상태
let editingId = null;
// 정렬 상태 (기본값을 'desc'로 변경)
let sortOrder = 'desc'; // 'asc' 또는 'desc'

// Todo 항목 추가
function addTodo() {
    const text = todoInput.value.trim();
    const date = todoDate.value;
    
    if (text && date) {
        if (editingId !== null) {
            // 수정 모드인 경우
            todos = todos.map(todo => {
                if (todo.id === editingId) {
                    return { ...todo, text, date };
                }
                return todo;
            });
            editingId = null;
            addTodoBtn.textContent = '추가';
        } else {
            // 새로운 할 일 추가
            const todo = {
                id: Date.now(),
                text,
                date,
                completed: false
            };
            todos.push(todo);
        }
        
        saveTodos();
        renderTodos();
        
        todoInput.value = '';
        todoDate.value = '';
    }
}

// Todo 항목 수정 모드로 전환
function editTodo(id) {
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
        todoInput.value = todo.text;
        todoDate.value = todo.date;
        editingId = id;
        addTodoBtn.textContent = '수정';
        todoInput.focus();
    }
}

// Todo 항목 삭제
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

// Todo 항목 완료 상태 토글
function toggleTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    saveTodos();
    renderTodos();
}

// Todo 항목들을 로컬 스토리지에 저장
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// 정렬 상태 토글
function toggleSort() {
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    renderTodos();
}

// Todo 항목들을 화면에 렌더링
function renderTodos() {
    const filteredTodos = filterTodos();
    
    // 날짜별로 정렬
    const sortedTodos = [...filteredTodos].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    todoList.innerHTML = `
        <div class="sort-header">
            <button class="sort-btn" onclick="toggleSort()">
                날짜 ${sortOrder === 'asc' ? '↑' : '↓'} 정렬
            </button>
        </div>
        ${sortedTodos.map(todo => `
            <div class="todo-item">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                       onchange="toggleTodo(${todo.id})">
                <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
                <span class="todo-date">${formatDate(todo.date)}</span>
                <button class="edit-btn" onclick="editTodo(${todo.id})">수정</button>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">삭제</button>
            </div>
        `).join('')}
    `;
}

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 필터링된 Todo 항목 반환
function filterTodos() {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    switch (currentFilter) {
        case 'today':
            return todos.filter(todo => todo.date === today);
        case 'week':
            return todos.filter(todo => {
                const todoDate = new Date(todo.date);
                return todoDate >= weekStart && todoDate <= weekEnd;
            });
        default:
            return todos;
    }
}

// 필터 버튼 이벤트 리스너
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

// Todo 추가/수정 버튼 이벤트 리스너
addTodoBtn.addEventListener('click', addTodo);

// Enter 키로 Todo 추가/수정
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// 초기 렌더링
renderTodos(); 