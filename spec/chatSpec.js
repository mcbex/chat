describe('dom specs', function() {

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

    var id, chatter, spy;

    beforeEach(function() {
        id = 'user';
        chatter = new Chatter(id);
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

    it('sets the socket', function() {
        expect(chatter.socket = socket);
    });

    it('triggers the error and connected events', function() {
        var alertCallback;

        window.alert = function(message) { alertCallback = message; };
        spyOn(chatter, 'setName');

        socket.trigger('error', { message: 'testing' });
        socket.trigger('connected');

        expect(alertCallback).toEqual('testing');
        expect(chatter.setName.calls.length).toEqual(1);
        expect(socket.on.calls.length).toEqual(2);
    });

    it('sets a username', function() {
        window.prompt = function() { return 'bob' };
        spyOn(chatter, 'getFriends');

        chatter.setName();
        socket.trigger('name-set');

        expect(chatter.username).toEqual('bob');
        expect(chatter.getFriends.calls.length).toEqual(1);
        expect(chatter.client.getAttribute('data-username')).toEqual('bob');
        expect(chatter.output.textContent).toEqual('Hello bob');
    });

});
