class Todo {
  constructor() {
    this.tasks = [];
    this.term = '';
  }

  add(text, date) {
    this.tasks.push({ text, date });
  }

  getFilteredTasks() {
    if (this.term.length < 2) {
      return this.tasks;
    }
    return this.tasks.filter(task => task.text.toLowerCase().includes(this.term.toLowerCase()));
  }

  highlight(text, term) {
    if (!term || term.length < 2) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  draw() {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';

    for (const [index, task] of this.getFilteredTasks().entries()) {
      const li = document.createElement('li');
      li.className = 'todo-item';
      li.dataset.index = index;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'todo-checkbox';
      checkbox.dataset.index = index;

      const span = document.createElement('span');
      span.className = 'todo-text';
      span.innerHTML = this.highlight(task.text, this.term);

      const dueDate = document.createElement('span');
      dueDate.className = 'due-date';
      dueDate.textContent = task.date;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.dataset.index = index;

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(dueDate);
      li.appendChild(deleteBtn);

      todoList.appendChild(li);
    }
  }

  delete(index) {
    this.tasks.splice(index, 1);
  }

  edit(index, newText) {
    this.tasks[index].text = newText;
  }

  editDate(index, newDate) {
    this.tasks[index].date = newDate;
  }

  save() {
    localStorage.setItem('todo-tasks', JSON.stringify(this.tasks));
  }

  load() {
    const saved = localStorage.getItem('todo-tasks');
    if (saved) {
      this.tasks = JSON.parse(saved);
    }
  }
}

const todo = new Todo();

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const dueDateInput = document.getElementById('due-date-input');
  const todoList = document.getElementById('todo-list');
  const searchButton = document.querySelector('#site-search + button');
  const searchInput = document.getElementById('site-search');

  todo.load();
  todo.draw();

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const text = todoInput.value.trim();
    const date = dueDateInput.value;

    if (text && date) {
      todo.add(text, date);
      todo.draw();
      todo.save();

      todoInput.value = '';
      dueDateInput.value = '';

      todoInput.focus();
    }
  });

  todoList.addEventListener('click', function(e) {
    const index = parseInt(e.target.dataset.index);

    if (e.target.classList.contains('delete-btn')) {
      todo.delete(index);
      todo.draw();
      todo.save();
    }

    if (e.target.classList.contains('todo-checkbox')) {
      const li = e.target.parentElement;
      li.classList.toggle('completed');
    }

    if (e.target.classList.contains('todo-text')) {
      const li = e.target.parentElement;
      const span = e.target;
      const index = parseInt(li.dataset.index);
      const currentText = span.textContent;

      const input = document.createElement('input');
      input.type = 'text';
      input.value = currentText;
      input.className = 'todo-edit-input';

      li.replaceChild(input, span);
      input.focus();
      input.select();

      const saveEdit = function() {
        const newText = input.value.trim();
        if (newText && newText !== currentText) {
          todo.edit(index, newText);
        }
        todo.draw();
        todo.save();
      };

      input.addEventListener('blur', saveEdit);

      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          saveEdit();
        }
      });

      input.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    }

    if (e.target.classList.contains('due-date')) {
      const span = e.target;
      const li = span.parentElement;
      const index = parseInt(li.dataset.index);
      const currentDate = span.textContent;

      const input = document.createElement('input');
      input.type = 'date';
      input.value = currentDate;
      input.className = 'todo-edit-date-input';

      li.replaceChild(input, span);
      input.focus();

      const saveEdit = function() {
        const newDate = input.value;
        if (newDate && newDate !== currentDate) {
          todo.editDate(index, newDate);
        }
        todo.draw();
        todo.save();
      };

      input.addEventListener('blur', saveEdit);

      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          saveEdit();
        }
      });

      input.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    }
  });

  searchButton.addEventListener('click', function(e) {
    e.preventDefault();
    todo.term = searchInput.value.toLowerCase().trim();
    todo.draw();
  });

  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      searchButton.click();
    }
  });
});
