window.onload = function() {
    var input = document.getElementById('chatter'),
        button = document.getElementsByTagName('button')[0],
        client = new Chatter('user');

    input.addEventListener('input', function(e) {
        client.typing();
    });

    button.addEventListener('click', function(e) {
        client.submit();
    });

    client.init();
}
