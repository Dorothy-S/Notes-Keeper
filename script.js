// Notes System
class NotesManager {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem("studynotes")) || [];
        this.init();
    }

    init() {
        const page = window.location.pathname.split("/").pop();
        if (page === "index.html" || page === "") {
            this.showNotes();
        } else if (page === "create.html") {
            this.handleCreateForm();
        } else if (page === "edit.html") {
            this.handleEditForm();
        }
    }

    save() {
        localStorage.setItem("studynotes", JSON.stringify(this.notes));
    }

    makeId() {
        return Date.now().toString(36);
    }

    addNote(title, course, content) {
        this.notes.unshift({
            id: this.makeId(),
            title,
            course,
            content,
            createdAt: new Date().toISOString()
        });
        this.save();
    }

    getNote(id) {
        return this.notes.find(n => n.id === id);
    }

    updateNote(id, title, course, content) {
        const index = this.notes.findIndex(n => n.id === id);
        if (index !== -1) {
            this.notes[index] = {
                ...this.notes[index],
                title,
                course,
                content,
                updatedAt: new Date().toISOString()
            };
            this.save();
        }
    }

    deleteNote(id) {
        this.notes = this.notes.filter(n => n.id !== id);
        this.save();
        this.showNotes();
    }

    showNotes() {
        const body = document.getElementById("notesTableBody");
        const empty = document.getElementById("emptyMessage");
        if (!body) return;

        if (this.notes.length === 0) {
            body.innerHTML = "";
            empty.style.display = "block";
            return;
        }

        empty.style.display = "none";

        body.innerHTML = this.notes.map(n => `
            <tr>
                <td>${this.clean(n.title)}</td>
                <td>${this.clean(n.course)}</td>
                <td>${this.clean(n.content.substring(0, 50))}${n.content.length > 50 ? "..." : ""}</td>
                <td>${new Date(n.createdAt).toLocaleDateString()}</td>
                <td>
                    <a href="edit.html?id=${n.id}" class="btn-edit">Edit</a>
                    <button class="btn-delete" onclick="notesManager.deleteNote('${n.id}')">Delete</button>
                </td>
            </tr>
        `).join("");
    }

    handleCreateForm() {
        const form = document.getElementById("noteForm");
        if (!form) return;

        form.addEventListener("submit", e => {
            e.preventDefault();
            const title = document.getElementById("noteTitle").value.trim();
            const course = document.getElementById("noteCourse").value;
            const content = document.getElementById("noteContent").value.trim();

            if (!title || !course || !content) return;

            this.addNote(title, course, content);
            window.location.href = "index.html";
        });
    }

    handleEditForm() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        const note = this.getNote(id);

        if (!note) {
            window.location.href = "index.html";
            return;
        }

        document.getElementById("editNoteId").value = note.id;
        document.getElementById("editNoteTitle").value = note.title;
        document.getElementById("editNoteCourse").value = note.course;
        document.getElementById("editNoteContent").value = note.content;

        const form = document.getElementById("editNoteForm");
        form.addEventListener("submit", e => {
            e.preventDefault();
            const title = document.getElementById("editNoteTitle").value.trim();
            const course = document.getElementById("editNoteCourse").value;
            const content = document.getElementById("editNoteContent").value.trim();

            if (!title || !course || !content) return;

            this.updateNote(id, title, course, content);
            window.location.href = "index.html";
        });
    }

    clean(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
}

const notesManager = new NotesManager();
