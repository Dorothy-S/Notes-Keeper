// Note Management System
class NotesManager {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('studynotes')) || [];
        this.currentEditId = null;
        this.init();
    }

    init() {
        // Initialize based on current page
        const currentPage = window.location.pathname.split('/').pop();
        
        if (currentPage === 'index.html' || currentPage === '') {
            this.displayNotes();
        } else if (currentPage === 'create.html') {
            this.setupCreateForm();
        } else if (currentPage === 'edit.html') {
            this.setupEditForm();
        }
    }

    // Save notes to localStorage
    saveNotes() {
        localStorage.setItem('studynotes', JSON.stringify(this.notes));
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Create new note
    createNote(title, course, content) {
        const newNote = {
            id: this.generateId(),
            title: title,
            course: course,
            content: content,
            createdAt: new Date().toISOString()
        };
        
        this.notes.unshift(newNote); // Add to beginning of array
        this.saveNotes();
        return newNote;
    }

    // Get all notes
    getAllNotes() {
        return this.notes;
    }

    // Get note by ID
    getNoteById(id) {
        return this.notes.find(note => note.id === id);
    }

    // Update note
    updateNote(id, title, course, content) {
        const noteIndex = this.notes.findIndex(note => note.id === id);
        if (noteIndex !== -1) {
            this.notes[noteIndex] = {
                ...this.notes[noteIndex],
                title: title,
                course: course,
                content: content,
                updatedAt: new Date().toISOString()
            };
            this.saveNotes();
            return true;
        }
        return false;
    }

    // Delete note
    deleteNote(id) {
        const noteIndex = this.notes.findIndex(note => note.id === id);
        if (noteIndex !== -1) {
            this.notes.splice(noteIndex, 1);
            this.saveNotes();
            return true;
        }
        return false;
    }

    // Display notes on dashboard
    displayNotes() {
        const tableBody = document.getElementById('notesTableBody');
        const emptyMessage = document.getElementById('emptyMessage');
        
        if (!tableBody) return;

        const notes = this.getAllNotes();
        
        if (notes.length === 0) {
            tableBody.innerHTML = '';
            if (emptyMessage) emptyMessage.style.display = 'block';
            return;
        }

        if (emptyMessage) emptyMessage.style.display = 'none';

        tableBody.innerHTML = notes.map(note => `
            <tr>
                <td>${this.escapeHtml(note.title)}</td>
                <td>${this.escapeHtml(note.course)}</td>
                <td>${this.escapeHtml(note.content.substring(0, 50))}${note.content.length > 50 ? '...' : ''}</td>
                <td>${new Date(note.createdAt).toLocaleDateString()}</td>
                <td>
                    <a href="edit.html?id=${note.id}" class="btn-edit">Edit</a>
                    <button class="btn-delete" onclick="notesManager.confirmDelete('${note.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    // Setup create form
    setupCreateForm() {
        const form = document.getElementById('noteForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const title = document.getElementById('noteTitle').value.trim();
                const course = document.getElementById('noteCourse').value;
                const content = document.getElementById('noteContent').value.trim();
                
                if (title && course && content) {
                    this.createNote(title, course, content);
                    alert('Note created successfully!');
                    window.location.href = 'index.html';
                } else {
                    alert('Please fill in all fields.');
                }
            });
        }
    }

    // Setup edit form
    setupEditForm() {
        // Get note ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const noteId = urlParams.get('id');
        
        if (!noteId) {
            alert('No note specified for editing.');
            window.location.href = 'index.html';
            return;
        }

        const note = this.getNoteById(noteId);
        if (!note) {
            alert('Note not found.');
            window.location.href = 'index.html';
            return;
        }

        // Populate form with note data
        document.getElementById('editNoteId').value = note.id;
        document.getElementById('editNoteTitle').value = note.title;
        document.getElementById('editNoteCourse').value = note.course;
        document.getElementById('editNoteContent').value = note.content;

        // Setup form submission
        const form = document.getElementById('editNoteForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const title = document.getElementById('editNoteTitle').value.trim();
                const course = document.getElementById('editNoteCourse').value;
                const content = document.getElementById('editNoteContent').value.trim();
                
                if (title && course && content) {
                    const success = this.updateNote(noteId, title, course, content);
                    if (success) {
                        alert('Note updated successfully!');
                        window.location.href = 'index.html';
                    } else {
                        alert('Error updating note.');
                    }
                } else {
                    alert('Please fill in all fields.');
                }
            });
        }
    }

    // Confirm and delete note
    confirmDelete(noteId) {
        if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
            const success = this.deleteNote(noteId);
            if (success) {
                alert('Note deleted successfully!');
                this.displayNotes(); // Refresh the display
            } else {
                alert('Error deleting note.');
            }
        }
    }

    // Utility function to escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the notes manager when the page loads
const notesManager = new NotesManager();

// Add some sample data if no notes exist (for demonstration)
if (notesManager.getAllNotes().length === 0) {
    notesManager.createNote(
        'HTML5 Semantic Elements', 
        'INFR3120', 
        'Semantic elements clearly describe their meaning to both the browser and developer. Examples: <header>, <footer>, <article>, <section>.'
    );
    notesManager.createNote(
        'CSS Flexbox Layout', 
        'INFR3120', 
        'Flexbox is a one-dimensional layout method for arranging items in rows or columns. Items flex to fill additional space or shrink to fit into smaller spaces.'
    );
}
