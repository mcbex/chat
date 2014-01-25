describe('a spec for the chat client', function() {

    var id, chatter, elem;

    beforeEach(function() {
        id = 'user';
        chatter = new Chatter(id);
        elem = chatter.client;
    });

    it('has a client prop that is a DOM node with the id passed in init', function() {
        expect(elem.getAttribute('id')).toEqual(id);
    });

    it('has input and output properties', function() {
        expect(chatter.input).toBeDefined();
        expect(chatter.input.nodeName).toEqual('INPUT');
        expect(chatter.output).toBeDefined();
        expect(chatter.output.nodeName).toEqual('DIV');
    });

    it('is designed to fail', function() {
        expect(false).toEqual(true);
    });

});
