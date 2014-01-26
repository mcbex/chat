window.onload = function() {
    // onloads need to be separate from the test runner
    // since jasmine boot depends on the load event
    var input = document.getElementById('chatter'),
        button = document.getElementsByTagName('button')[0],
        client = new Chatter('user');

    input.addEventListener('input', function(e) {
        client.typing();
    });

    button.addEventListener('click', function(e) {
        client.submit();
    });

    client.init(io.connect('http://localhost:999');
}
