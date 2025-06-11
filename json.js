class ShoppingCart {
  init() {
    this.loadFromStorage();
    
    if (this.items.length === 0) {
      this.addItem('Помідори', 2);
      this.addItem('Печиво', 2);
      this.addItem('Сир', 100000);
    }
    this.setupEventListeners();
    this.render();
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('shoppingCart');
      if (saved) {
        const data = JSON.parse(saved);
        this.items = data.items || [];
        this.nextId = data.nextId || 1;
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('shoppingCart', JSON.stringify({
        items: this.items,
        nextId: this.nextId
      }));
    } catch (e) {
      console.error('Помилка:', e);
    }
  }

  setupEventListeners() {
    const addBtn = document.getElementById('addItemBtn');
    const input = document.getElementById('newItemInput');
    addBtn.addEventListener('click', () => this.handleAddItem());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleAddItem();
      }
    });
  }

  handleAddItem() {
    const input = document.getElementById('newItemInput');
    const name = input.value.trim();
    if (name) {
      this.addItem(name, 1);
      input.value = '';
      input.focus();
      this.render();
    }
  }

  addItem(name, quantity = 1) {
    this.items.push({
      id: this.nextId++,
      name: name,
      quantity: quantity,
      purchased: false
    });
    this.saveToStorage();
  }

  deleteItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.saveToStorage();
    this.render();
  }

  togglePurchased(id) {
    const item = this.items.find(item => item.id === id);
    if (item) {
      item.purchased = !item.purchased;
      this.saveToStorage();
      this.render();
    }
  }

  updateQuantity(id, delta) {
    const item = this.items.find(item => item.id === id);
    if (item) {
      item.quantity = Math.max(1, item.quantity + delta);
      this.saveToStorage();
      this.render();
    }
  }

  updateName(id, newName) {
    const item = this.items.find(item => item.id === id);
    if (item && newName.trim()) {
      item.name = newName.trim();
      this.saveToStorage();
      this.render();
    }
  }

  render() {
    this.renderItems();
    this.renderSummary();
  }

  renderItems() {
    const container = document.getElementById('itemsList');
    container.innerHTML = '';
    this.items.forEach(item => {
      const itemElement = this.createItemElement(item);
      container.appendChild(itemElement);
    });
  }

  createItemElement(item) {
    const div = document.createElement('div');
    div.className = `list-item ${item.purchased ? 'crossedlist' : ''}`;
    const nameDiv = document.createElement('div');
    nameDiv.className = 'item-name';
    nameDiv.onclick = () => this.startEditing(item.id);
    const nameSpan = document.createElement('span');
    nameSpan.className = item.purchased ? 'item-name-crossed' : '';
    nameSpan.id = `name-${item.id}`;
    nameSpan.textContent = item.name;
    nameSpan.title = item.name; 
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'hidden';
    editInput.id = `edit-${item.id}`;
    editInput.value = item.name;
    nameDiv.appendChild(nameSpan);
    nameDiv.appendChild(editInput);
    const qtyDiv = document.createElement('div');
    qtyDiv.className = 'qty';
    const minusBtn = document.createElement('button');
    minusBtn.className = `tooltip btn minus ${item.quantity <= 1 ? 'btnon' : ''}`;
    minusBtn.setAttribute('data-tooltip', '-');
    minusBtn.textContent = '−';
    minusBtn.disabled = item.quantity <= 1;
    minusBtn.onclick = () => this.updateQuantity(item.id, -1);
    const counterSpan = document.createElement('span');
    counterSpan.className = 'counter';
    counterSpan.textContent = item.quantity;
    const plusBtn = document.createElement('button');
    plusBtn.className = 'tooltip btn plus';
    plusBtn.setAttribute('data-tooltip', '+');
    plusBtn.textContent = '+';
    plusBtn.onclick = () => this.updateQuantity(item.id, 1);
    qtyDiv.appendChild(minusBtn);
    qtyDiv.appendChild(counterSpan);
    qtyDiv.appendChild(plusBtn);
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'actions';
    const statusBtn = document.createElement('button');
    statusBtn.className = 'tooltip status';
    statusBtn.setAttribute('data-tooltip', 'status');
    statusBtn.textContent = item.purchased ? 'Куплено' : 'Не куплено';
    statusBtn.onclick = () => this.togglePurchased(item.id);
    actionsDiv.appendChild(statusBtn);
    if (!item.purchased) {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'tooltip btnn delete';
      deleteBtn.setAttribute('data-tooltip', 'delete');
      deleteBtn.textContent = '×';
      deleteBtn.onclick = () => this.deleteItem(item.id);
      actionsDiv.appendChild(deleteBtn);
    }
    div.appendChild(nameDiv);
    div.appendChild(qtyDiv);
    div.appendChild(actionsDiv);
    return div;
  }

  startEditing(id) {
    const item = this.items.find(item => item.id === id);
    if (!item || item.purchased) return;
    const nameSpan = document.getElementById(`name-${id}`);
    const editInput = document.getElementById(`edit-${id}`);
    nameSpan.classList.add('hidden');
    editInput.classList.remove('hidden');
    editInput.focus();
    editInput.select();
    const finishEditing = () => {
      const newName = editInput.value.trim();
      if (newName) {
        this.updateName(id, newName);
      } else {
        this.render();
      }
    };
    editInput.onblur = finishEditing;
    editInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        finishEditing();
      }
    };
  }

  renderSummary() {
    const remainingContainer = document.getElementById('remainingItems');
    const purchasedContainer = document.getElementById('purchasedItems'); 
    remainingContainer.innerHTML = '';
    purchasedContainer.innerHTML = '';
    const remaining = this.items.filter(item => !item.purchased);
    const purchased = this.items.filter(item => item.purchased);
    
    remaining.forEach(item => {
      const span = document.createElement('span');
      span.className = 'counter';
      span.innerHTML = `${item.name}<span class="tag">${item.quantity}</span>`;
      remainingContainer.appendChild(span);
    });
    
    purchased.forEach(item => {
      const span = document.createElement('span');
      span.className = 'crossed';
      span.innerHTML = `${item.name}<span class="tagg">${item.quantity}</span>`;
      purchasedContainer.appendChild(span);
    });
  }

  constructor() {
    this.items = [];
    this.nextId = 1;
    this.init();
  }
}
const cart = new ShoppingCart();
