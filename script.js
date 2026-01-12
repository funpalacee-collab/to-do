const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const progressBar = document.getElementById('progress');
const progressNumber = document.getElementById('numbers');
const confettiCanvas = document.getElementById('confetti-canvas');
const ctx = confettiCanvas.getContext('2d');

const resizeCanvas = () => {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
};

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let confettiPieces = [];
let confettiFired = false;

const colors = ['#ff0a54', '#ff477e', '#ff7096', '#ffd166', '#06d6a0', '#118ab2'];

const createConfetti = (count = 150) => {
    confettiPieces = [];

    for (let i = 0; i < count; i++) {
        confettiPieces.push({
            x: Math.random() * confettiCanvas.width,
            y: -Math.random() * confettiCanvas.height,
            size: Math.random() * 6 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 4 + 3,
            speedX: Math.random() * 2 - 1,
            rotation: Math.random() * 360
        });
    }
};

const animateConfetti = () => {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confettiPieces.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();

        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += 6;
    });

    confettiPieces = confettiPieces.filter(p => p.y < confettiCanvas.height + 20);

    if (confettiPieces.length > 0) {
        requestAnimationFrame(animateConfetti);
    }
};

const celebration = document.getElementById('celebration');

const updateProgress = () => {
    const totalTask = taskList.children.length;
    const completedTask = taskList.querySelectorAll('.checkbox:checked').length;

    progressBar.style.width = totalTask
        ? `${(completedTask / totalTask) * 100}%`
        : '0%';

    progressNumber.textContent = `${completedTask} / ${totalTask}`;

    // 🎉 Celebration logic
    if (totalTask > 0 && completedTask === totalTask) {
        celebration.classList.add('show');
        setTimeout(() => celebration.classList.remove('show'), 3000);
    }

    if (totalTask > 0 && completedTask === totalTask && !confettiFired) {
        confettiFired = true;
        createConfetti(200);
        animateConfetti();
    }

    if (completedTask < totalTask) {
        confettiFired = false;
    }
};


const addTask = (event, checkCompletion = true) => {
    if (event) event.preventDefault();

    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const li = document.createElement('li');
    li.innerHTML = `
        <input type="checkbox" class="checkbox">
        <span>${taskText}</span>
        <div class="task-btn">
            <button class="edit-btn">
                <i class="fa-solid fa-pen"></i>
            </button>
            <button class="delete-btn">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;

    li.classList.add("animate");

    const checkbox = li.querySelector('.checkbox');

    checkbox.addEventListener('change', function () {
        const textSpan = li.querySelector('span');
        if (checkbox.checked) {
            textSpan.classList.add('completed');
        } else {
            textSpan.classList.remove('completed');
        }
    });

    const editBtn = li.querySelector('.edit-btn');
    const deleteBtn = li.querySelector('.delete-btn');
    const textSpan = li.querySelector('span');

    // Checkbox change - toggle completed & disable/enable edit
    checkbox.addEventListener('change', function () {
        if (checkbox.checked) {
            textSpan.classList.add('completed');
            editBtn.disabled = true;
            editBtn.style.opacity = 0.5; // visually show disabled
            editBtn.style.cursor = 'not-allowed';
        } else {
            textSpan.classList.remove('completed');
            editBtn.disabled = false;
            editBtn.style.opacity = 1;
            editBtn.style.cursor = 'pointer';
        }
        updateProgress();
    });

    //DELETE
    deleteBtn.addEventListener('click', function () {

        li.style.animation = 'rotateOutDown 0.5s forwards';
        li.addEventListener('animationend', function () {
            li.remove();
            updateProgress();
        });
    });

    //EDIT & SAVE
    editBtn.addEventListener('click', function () {
        const textSpan = li.querySelector('span');
        const oldText = textSpan.textContent;

        const input = document.createElement('input');
        input.setAttribute('class', 'edit-input');
        input.type = 'text';
        input.value = oldText;

        li.replaceChild(input, textSpan);

        setTimeout(() => input.classList.add('show'), 10);
        input.focus();

        // Change icon from pen to save
        editBtn.innerHTML = '<i class="fa fa-save"></i>';

        const saveEdit = () => {
            input.classList.remove('show');
            setTimeout(() => {
                textSpan.textContent = input.value || oldText;
                li.replaceChild(textSpan, input);
                editBtn.innerHTML = '<i class="fa fa-pen"></i>';
            }, 300);
        };

        input.addEventListener('blur', saveEdit);

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                saveEdit();
            }
        });
    });

    taskList.appendChild(li);
    taskInput.value = "";
    updateProgress();
};

addTaskBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        addTask(e);
    }
});
