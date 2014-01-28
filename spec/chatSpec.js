describe('chatter constructor specs', function() {

    var id, chatter;

    beforeEach(function() {
        id = 'user';
        chatter = new Chatter(id);
    });

    it('has a client prop that is a DOM node with the id passed in init', function() {
        var elem = chatter.client;
        expect(elem.getAttribute('id')).toEqual(id);
    });

    it('has input and output properties', function() {
        expect(chatter.input).toBeDefined();
        expect(chatter.input.nodeName).toEqual('INPUT');
        expect(chatter.output).toBeDefined();
        expect(chatter.output.nodeName).toEqual('DIV');
    });

});

describe('socket.io specs', function() {

    var chatter, socket;

    beforeEach(function() {
        chatter = new Chatter('user');
        socket = {
            on: function(event, callback) {
                if (!this.events) {
                    this.events = {};
                }

                this.events[event] = callback;
            },

            emit: function() {},

            trigger: function(event, data) {
                if (this.events && this.events[event]) {
                    this.events[event].call(this, data);
                }
            }
        };

        spyOn(socket, 'on').andCallThrough();
        chatter.init(socket);
    });

    describe('initial setup', function() {

        it('sets the socket property', function() {
            expect(chatter.socket = socket);
        });

        it('triggers the error and connected events', function() {
            var alertCallback;

            window.alert = function(message) { alertCallback = message; };
            spyOn(chatter, 'setName')

            socket.trigger('error', { message: 'testing' });
            socket.trigger('connected');

            expect(alertCallback).toEqual('testing');
            expect(chatter.setName.calls.length).toEqual(1);
            expect(socket.on.calls.length).toEqual(2);
        });

        it('sets the username property', function() {
            window.prompt = function() { return 'bob' };
            spyOn(chatter, 'getFriends');

            chatter.setName();
            socket.trigger('name-set');

            expect(chatter.username).toEqual('bob');
            expect(chatter.getFriends.calls.length).toEqual(1);
            expect(chatter.client.getAttribute('data-username')).toEqual('bob');
            expect(chatter.output.textContent).toEqual('Hello bob');
        });

        it('gets friends and dispatches methods to set up the ui', function() {
            spyOn(chatter, '_addFriends');
            spyOn(chatter, '_makeStatusContainer');
            spyOn(chatter, 'setStatus');
            spyOn(chatter, 'clearStatus');

            chatter.getFriends();

            chatter.hasFriends = function() { return false; };
            socket.trigger('friends', [
                { id: 123, name: 'bob' },
                { id: 345, name: 'jane' }
            ]);
            chatter.status = true;

            chatter.hasFriends = function() { return true; };
            socket.trigger('friends', [
                { id: 123, name: 'bob' },
                { id: 345, name: 'jane' }
            ]);

            expect(chatter._addFriends.calls.length).toEqual(2);
            expect(chatter._makeStatusContainer.calls.length).toEqual(1);
            expect(chatter.setStatus.calls.length).toEqual(1);
            expect(chatter.clearStatus.calls.length).toEqual(1);
        });
    });

    describe('chat events', function() {

        beforeEach(function() {
            chatter.status = document.createElement('p');
            chatter._listenToChats();
        });

        it('listens for chat-started and sets the friend', function() {
            socket.trigger('chat-started', { id: 123, name: 'bob' });

            expect(chatter.status.textContent).toEqual('Chatting with bob');
            expect(chatter.friend).toEqual({ id: 123, name: 'bob' });
        });

        it('listens for chat-ended and unsets the friend', function() {

        });
    });
});

describe('status utilities specs', function() {

    var chatter;

    beforeEach(function() {
        chatter = new Chatter('user');
        chatter.status = document.createElement('p');
    });

    it('sets the textcontent of the status element', function() {
        chatter.setStatus('test');
        expect(chatter.status.textContent).toEqual('test');

        chatter.setStatus('retest');
        expect(chatter.status.textContent).toEqual('retest');

        chatter.setStatus('false');
        expect(chatter.status.textContent).toEqual('false');
    });

    it('clears the textcontent of the status element', function() {
        chatter.clearStatus();
        expect(chatter.status.textContent).toEqual('');

        chatter.setStatus('test');
        chatter.clearStatus();
        expect(chatter.status.textContent).toEqual('');
    });

    it('calls clearStatus if setStatus is passed a falsy value', function() {
        spyOn(chatter, 'clearStatus').andCallThrough();

        chatter.setStatus('test');
        chatter.setStatus(false);
        expect(chatter.status.textContent).toEqual('');

        chatter.setStatus(null);
        expect(chatter.status.textContent).toEqual('');

        chatter.setStatus(undefined);
        expect(chatter.status.textContent).toEqual('');

        chatter.setStatus();
        expect(chatter.status.textContent).toEqual('');

        expect(chatter.clearStatus.calls.length).toEqual(4);
    });

});
