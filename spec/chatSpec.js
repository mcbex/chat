describe('a spec for the chat client', function() {

    it('has a client prop that is a DOM node with the id passed in init', function() {
        var id = 'user',
            chatter = new Chatter(id),
            elem = chatter.client;

        expect(elem.getAttribute('id')).toEqual(id);
    });

});
