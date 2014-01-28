var Chatter = function(id) {
    this.client = document.getElementById(id);
    this.input = this.client.getElementsByTagName('input')[0];
    this.output = this.client.getElementsByTagName('div')[0];
};

// TODO what data types should status be able to accept?
Chatter.prototype.setStatus = function(status) {
    if (!status) {
        this.clearStatus();
        return;
    }

    this.status.textContent = status;
};

Chatter.prototype.clearStatus = function() {
    this.status.textContent = '';
};

Chatter.prototype.hasFriends = function() {
    return this.availableFriends && this.availableFriends.length;
};

Chatter.prototype.submit = function(inputType, inputValue) {
    var elem;

    this.socket.emit('submit', {
        message: this.value
    });

    elem = document.createElement('p');
    elem.textContent = 'me: ' + this.value;
    this.output.appendChild(elem);
};

Chatter.prototype.typing = function() {
    this.value = this.input.value;

    if (this.value) {
        this.socket.emit('typing');
    } else {
        this.socket.emit('deleted');
    }
};

Chatter.prototype.chatsWith = function(friend) {
    var self = this;

    this.socket.emit('start-chat', {
        friendId: friend
    });
};

Chatter.prototype._listenToChats = function() {
    var self = this,
        elem;

    this.socket.on('chat-started', function(data) {
        self.setStatus('Chatting with ' + data.name);
        self.friend = data;
    });

    // TODO need to allow for multiple friends and chats
    this.socket.on('chat-ended', function() {
        document.getElementById('friends').innerHTML = '';
        self.setStatus('no friends online');
        delete self.friend;
    });

    this.socket.on('chat-input', function(data) {
        self.setStatus(data);
    });

    this.socket.on('chat-deleted', function() {
        self.clearStatus();
    });

    this.socket.on('chat-recieved', function(data) {
        elem = document.createElement('p');
        elem.textContent = data.user + ': ' + data.message;
        self.output.appendChild(elem);
        // TODO need to also set the current friend or support multiple chats
        self.setStatus('Chatting with ' + data.user);
    });

    // TODO dont delete all the friends when one disconnects
    this.socket.on('friend-disconnected', function(data) {
        document.getElementById('friends').innerHTML = '';
        self.setStatus('no friends online');
    });
};

Chatter.prototype._makeFriendsContainer = function() {
    var friends = document.getElementById('friends');

    if (friends) {
        friends.innerHTML = '';
    } else {
        friends = document.createElement('div');
        friends.setAttribute('id', 'friends');
        this.client.appendChild(friends);
    }

    return friends;
};

Chatter.prototype._makeButton = function(data) {
    var button, self = this;

    button = document.createElement('button');
    button.setAttribute('id', data.id);
    button.setAttribute('data-name', data.name);
    button.textContent = 'Chat with ' + data.name;
    // TODO make button end chat on click again
    button.addEventListener('click', function() {
        self.chatsWith(button.id);
        self.setStatus('Chatting with ' + button['data-name']);
    });

    return button;
};

Chatter.prototype._addFriends = function(data) {
    var wrapper, button;

    wrapper = this._makeFriendsContainer();
    this.availableFriends = [];

    for (var i = 0, l = data.length; i < l; i++) {

        if (data[i].name != this.username) {
            button = this._makeButton(data[i]);
            wrapper.appendChild(button);
            this.availableFriends.push(data[i]);
        }
    }
};

Chatter.prototype._makeStatusContainer = function() {
    var status = document.createElement('p');

    status.setAttribute('id', 'status');
    this.status = status;
    this.client.appendChild(status);
};

Chatter.prototype.getFriends = function() {
    var self = this;

    self.socket.on('friends', function(data) {
        self._addFriends(data);

        if (!self.status) {
            self._makeStatusContainer();
        }

        if (!self.hasFriends()) {
           self.setStatus('no friends online');
        } else {
            // TODO don't clear the status if its not set to the default
            self.clearStatus();
        }
    });

    this._listenToChats();
};

Chatter.prototype.setName = function() {
    var self = this;

    // TODO better ui for setting the name
    this.username = window.prompt('Enter a username');

    if (this.username) {
        this.socket.emit('set-name', this.username);
        this.getFriends();

        this.socket.on('name-set', function() {
            self.client.setAttribute('data-username', self.username);
            self.output.textContent = 'Hello ' + self.username;
        });
    }
};

Chatter.prototype.init = function(socket) {
    var self = this;

    this.socket = socket;

    // TODO nicer error handling
    this.socket.on('error', function(data) {
        window.alert(data.message);
    });

    this.socket.on('connected', function() {
        self.setName();
    });
};
