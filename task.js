document.addEventListener('DOMContentLoaded', () => {
    const addTaskButton = document.getElementById('add-task');
    const taskTitleInput = document.getElementById('task-title');
    const userNameInput = document.getElementById('user-name');
    const deadlineInput = document.getElementById('deadline');
    const commentsInput = document.getElementById('comments');
    const taskList = document.getElementById('task-list');
    const archiveList = document.getElementById('archive-list');

    // Load tasks from localStorage
    const loadTasks = () => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            if (task.completed) {
                renderTask(task, archiveList);
            } else {
                renderTask(task, taskList);
            }
        });
    };

    // Save tasks to localStorage
    const saveTasks = () => {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(taskItem => {
            tasks.push(getTaskData(taskItem, false));
        });
        archiveList.querySelectorAll('li').forEach(taskItem => {
            tasks.push(getTaskData(taskItem, true));
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Get task data from DOM
    const getTaskData = (taskItem, isArchived) => {
        const taskTitle = taskItem.querySelector('.task-details strong').textContent;
        const userName = taskItem.querySelector('.task-details span').textContent.replace('Assigned to: ', '');
        const deadline = taskItem.querySelector('.task-deadline').textContent.replace('Due: ', '');
        const comments = [];
        taskItem.querySelectorAll('.existing-comments p').forEach(comment => {
            comments.push({
                text: comment.textContent.split(' (Posted on: ')[0],
                date: comment.getAttribute('data-date')
            });
        });
        return { taskTitle, userName, deadline, comments, completed: isArchived };
    };

    // Render a task
    const renderTask = (task, list) => {
        const taskItem = document.createElement('li');

        const taskInfo = document.createElement('div');
        taskInfo.classList.add('task-info');

        const taskDetails = document.createElement('div');
        taskDetails.classList.add('task-details');
        taskDetails.innerHTML = `<strong>${task.taskTitle}</strong> <br> Assigned to: <span>${task.userName}</span>`;

        const taskDeadline = document.createElement('div');
        taskDeadline.classList.add('task-deadline');
        taskDeadline.textContent = `Due: ${task.deadline}`;

        taskInfo.appendChild(taskDetails);
        taskInfo.appendChild(taskDeadline);

        // Comments Section
        const taskCommentsSection = document.createElement('div');
        taskCommentsSection.classList.add('task-comments-section');

        const existingComments = document.createElement('div');
        existingComments.classList.add('existing-comments');
        if (task.comments.length === 0) {
            existingComments.innerHTML = `<p>No comments yet</p>`;
        } else {
            task.comments.forEach(comment => {
                const commentElement = document.createElement('p');
                commentElement.textContent = `${comment.text} (Posted on: ${comment.date})`;
                commentElement.setAttribute('data-date', comment.date);
                existingComments.appendChild(commentElement);
            });
        }

        const addCommentDiv = document.createElement('div');
        addCommentDiv.classList.add('add-comment');

        const commentInput = document.createElement('input');
        commentInput.setAttribute('type', 'text');
        commentInput.setAttribute('placeholder', 'Add a comment...');

        const addCommentButton = document.createElement('button');
        addCommentButton.textContent = 'Add Comment';
        addCommentButton.addEventListener('click', () => {
            if (commentInput.value.trim() !== '') {
                const currentDate = new Date().toLocaleString();
                const newComment = document.createElement('p');
                newComment.textContent = `${commentInput.value.trim()} (Posted on: ${currentDate})`;
                newComment.setAttribute('data-date', currentDate);
                existingComments.appendChild(newComment);
                commentInput.value = '';
                saveTasks();
            }
        });

        addCommentDiv.appendChild(commentInput);
        addCommentDiv.appendChild(addCommentButton);

        taskCommentsSection.appendChild(existingComments);
        taskCommentsSection.appendChild(addCommentDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('actions');

        const completeButton = document.createElement('button');
        completeButton.textContent = 'Complete';
        completeButton.classList.add('complete-btn');
        completeButton.addEventListener('click', () => {
            taskItem.classList.toggle('completed');
            if (taskItem.classList.contains('completed')) {
                archiveTask(taskItem);
            } else {
                unarchiveTask(taskItem);
            }
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            if (taskItem.classList.contains('completed')) {
                archiveList.removeChild(taskItem);
            } else {
                taskList.removeChild(taskItem);
            }
            saveTasks();
        });

        actionsDiv.appendChild(completeButton);
        actionsDiv.appendChild(deleteButton);

        taskItem.appendChild(taskInfo);
        taskItem.appendChild(taskCommentsSection);
        taskItem.appendChild(actionsDiv);

        list.appendChild(taskItem);
    };

    // Archive a task
    const archiveTask = (taskItem) => {
        taskList.removeChild(taskItem);
        archiveList.appendChild(taskItem);
        saveTasks();
    };

    // Unarchive a task
    const unarchiveTask = (taskItem) => {
        archiveList.removeChild(taskItem);
        taskList.appendChild(taskItem);
        saveTasks();
    };

    // Add a new task
    const addTask = () => {
        const taskTitle = taskTitleInput.value.trim();
        const userName = userNameInput.value.trim();
        const deadline = deadlineInput.value;
        const comments = commentsInput.value.trim() ? [{ text: commentsInput.value.trim(), date: new Date().toLocaleString() }] : [];

        if (!taskTitle || !userName || !deadline) {
            alert('Please fill in all fields.');
            return;
        }

        const newTask = { taskTitle, userName, deadline, comments, completed: false };
        renderTask(newTask, taskList);
        saveTasks();

        taskTitleInput.value = '';
        userNameInput.value = '';
        deadlineInput.value = '';
        commentsInput.value = '';
    };

    addTaskButton.addEventListener('click', addTask);

    [taskTitleInput, userNameInput, deadlineInput, commentsInput].forEach(input => {
        input.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                addTask();
            }
        });
    });

    // Load existing tasks on page load
    loadTasks();
});
