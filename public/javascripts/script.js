$(function(){

    var url = 'http://mabosbross-m2:1337';

    var doc = $(document),
        win = $(window),
        canvas = $('#paper'),
        ctx = canvas[0].getContext('2d'),
        instructions = $('#instructions');

    // Generate an unique ID
    var id = Math.round($.now()*Math.random());

    // A flag for drawing activity
    var drawing = false;

    var clients = {};
    var cursors = {};

    var socket = io.connect(url);

    socket.on('moving', function (data) {

        if(!(data.id in clients)){
            cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
        }

        cursors[data.id].css({
            'left' : data.x,
            'top' : data.y
        });

        if(data.drawing && clients[data.id]){
            drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
        }

        clients[data.id] = data;
        clients[data.id].updated = $.now();

    });

    var prev = {};

    canvas.on('mousedown',function(e){
        e.preventDefault();
        drawing = true;
        prev.x = e.pageX;
        prev.y = e.pageY;

        instructions.fadeOut();
    });

    doc.bind('mouseup mouseleave',function(){
        drawing = false;
    });

    var lastEmit = $.now();

    doc.on('mousemove',function(e){
        if($.now() - lastEmit > 30){
            socket.emit('mousemove',{
                'x': e.pageX,
                'y': e.pageY,
                'drawing': drawing,
                'id': id
            });
            lastEmit = $.now();
        }

        if(drawing){

            drawLine(prev.x, prev.y, e.pageX, e.pageY);

            prev.x = e.pageX;
            prev.y = e.pageY;
        }
    });

    setInterval(function(){

        for(ident in clients){
            if($.now() - clients[ident].updated > 10000){
                cursors[ident].remove();
                delete clients[ident];
                delete cursors[ident];
            }
        }

    },10000);

    function drawLine(fromx, fromy, tox, toy){
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.stroke();
    }

});