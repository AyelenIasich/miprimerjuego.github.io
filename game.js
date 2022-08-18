kaboom({
    global: true,
    fullscreen: true,
    scale: 2,
    debug: true,
    clearColor: [0, 0, 0, 1],
});

const playerMoveSpeed = 120;
const jumpForce = 360;
let currentJumpForce = jumpForce;
const bigJumpForce = 550;
let isJumping = true;
const fallDeath = 400;
let isBig = false


// here we have all the sprites that we need. the url is on the same carpet. 
loadRoot('https://i.ibb.co/');
loadSprite('moneda', 'GCYz5BQ/moneda.png');
loadSprite('evil-shroom', '6BmMswg/evil-shroom.png');
loadSprite('brick', 'QDqwHLp/brick.png');
loadSprite('flower', 'BVPBJpN/flower.png');
loadSprite('mario', '8drjLQ7/mario.png');
loadSprite('marioIzq','3RFMK2L/mario-izq.png');
loadSprite('mushroom', 'n1Vnwvb/mushrrom.png');
loadSprite('surprise', '9t8wYhV/surprise.png');
loadSprite('unboxed', '3RcY7xK/block1.png');
loadSprite('pipe-top-left', '6DbBP8M/pipe-top-left.png');
loadSprite('pipe-top-right', '7QY3fhM/pipe-top-right.png');
loadSprite('pipe-bottom-left', 'XLMPsJX/pipe-bottom-left.png');
loadSprite('pipe-bottom-right', 'RC8mt1g/pipe-bottom-right.png');
loadSprite('blue-unboxed', 'mG0CvnJ/undefined-Imgur-16.png');
loadSprite('blue-brick', 'sFCvz11/undefined-Imgur-14.png');
loadSprite('blue-evil-shroom', 'WngrC4S/undefined-Imgur-15.png');
loadSprite('blue-surprise', 'gFcWfKZ/undefined-Imgur-17.png');
loadSprite('blue-block', 'RYZGnLv/undefined-Imgur-19.png');


scene('game', ({ level, score }) => {
    layers(['bg', 'obj', 'ui'], 'obj')

    //coleciones de mapas
    const maps = [
        [

            '                                                                                                            =  =    ',
            '                                                                                                                  ',
            '                                                                                                          =        ',
            '                                                                                                             =    ',
            '                                                  $       $  $$$$$  $ $ $   $$$$$  $$$$$  $    $   $$$$$          ',
            '===                                               $ $   $ $  $   $  $    $  $   $  $      $    $   $   $  =       ',
            '                                                  $   $   $  $$$$$  $ $ $   $$$$$  $      $$$$$$   $$$$$         ',
            '        %   =*=%=                     =*          $       $  $   $  $    $  $   $  $$$$$  $    $   $   $    =*    ',
            '                           -+                                                                                     ',
            '                     ^   ^ ()                                                                                     ',
            '==============================     ===============================================================================',
        ],
        [
            '&                                        & ',
            '&                                        & ',
            '&                                        & ',
            '&                                        & ',
            '&                                        & ',
            '&&&                                      &',
            '&                           x x          & ',
            '&        @@@@@@             x x          & ',
            '&                         x x x x     -+ & ',
            '&              z   z    x x x x x x   () & ',
            '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
        ]
    ]
    // every sprite in my board is going to have a width/height
    const levelCfg = {
        width: 20,
        height: 20,
        '=': [sprite('brick'), solid(), 'brick'],
        '$': [sprite('moneda'), solid(), 'moneda'],
        '%': [sprite('surprise'), solid(), 'coin-surprise'],
        '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
        '}': [sprite('unboxed'), solid()],
        '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
        ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
        '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
        '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],// bajamos la escala porque era muy grande
        '^': [sprite('evil-shroom'), solid(), 'dangerous', body()],
        '#': [sprite('mushroom'), solid(), 'mushroom', body()],
        '!': [sprite('blue-block'), solid(), scale(0.5)],
        '&': [sprite('blue-brick'), solid(), scale(0.5)],
        'z': [sprite('blue-evil-shroom'), solid(), 'dangerous', scale(0.5)],
        '@': [sprite('blue-surprise'), solid(), 'coin-surprise', scale(0.5)],
        'x': [sprite('blue-unboxed'), solid(), scale(0.5)],

    };
    // add to the game level
    const gameLevel = addLevel(maps[level], levelCfg);
    // con add podemos agregar texto y con pos la posicion en x y y 

    const scoreLabel = add([
        text(score),
        pos(30, 6),
        layer('ui'),
        {
            value: score,
        }

    ])

    add([
        text('level ' + parseInt(level + 1)), pos(40, 6)
    ])

    function big() {
        let timer = 0
        
        return {
            update() {
                if (isBig) {
                    timer -= dt()
                    if (timer <= 0) {
                        this.smallify()
                    }
                }
            },
            isBig() {
                return isBig
            },
            smallify() {
                this.scale = vec2(1)
                timer = 0
                isBig = false
                currentJumpForce = jumpForce
            },
            biggify(time) {
                this.scale = vec2(2)
                currentJumpForce = bigJumpForce
                timer = time
                isBig = true
            }
        }
    }

    const player = add([
       
        sprite('mario'), solid(),
        pos(30, 0),
        body(),
        big(),
        origin('bot')
    ])
    // con esta funcion el mushroom es mueve hacia la derecha 10px
    action('mushroom', (m) => {
        m.move(20, 0)
    })
    const enemySpeed = 20
    action('dangerous', (d) => {
        d.move(-enemySpeed, 0)
    })
    // si el jugador golpea un objeto y el objeto es un bloque con sorpresa de moneda, entonces suelta una moneda
    player.on('headbump', (obj) => {
        if (obj.is('coin-surprise')) {
            gameLevel.spawn('$', obj.gridPos.sub(0, 1)) // hacemos que salga la moneda $
            destroy(obj) // destruimos el brick original
            gameLevel.spawn('}', obj.gridPos.sub(0, 0)) // aca posicionamos el brick unboxed vacio sin la moneda, la moneda queda arriba
        }
        if (obj.is('mushroom-surprise')) {
            gameLevel.spawn('#', obj.gridPos.sub(0, 1)) // hacemos que salga la moneda mushrrom
            destroy(obj) // destruimos el brick original
            gameLevel.spawn('}', obj.gridPos.sub(0, 0)) // aca posicionamos el brick unboxed vacio sin la moneda, la moneda queda arriba
        }
        if (obj.is('brick')) {
            destroy(obj);
        }
    })
    //cuando el jugador colisiona con el hongo, el hongo se rompe
    player.collides('mushroom', (m) => {
        destroy(m)
        player.biggify(6)// hacemos que jugamos crezca con la funcion biggify que es escribimos antes y le pasamos el tiempo entre parametros
    })

    player.collides('moneda', (c) => {
        destroy(c)
        scoreLabel.value++
        scoreLabel.text = scoreLabel.value
    })


// funcion original
    /*  player.collides('dangerous', (d) => {
          if (isJumping) {
              destroy(d)
          } else {
              go('lose', { score: scoreLabel.value })
          }
      }) */
// this function make the player smaller when it collides with a dangerous creature, only if is it big. 
    player.collides('dangerous', (d) => {
        if (isBig == true) {
            player.smallify();{
                if (isJumping) {
                    destroy(d)}
            }
        } else if (isJumping) {
            destroy(d)
        } else {
            go('lose', { score: scoreLabel.value })
        }
    })

    player.action(() => {
        camPos(player.pos)// si la posicion del jugador en y es mayor a la declarada en la variable falldeath vamos a la scene muerte
        if (player.pos.y >= fallDeath) {
            go('lose', { score: scoreLabel.value }) // vamos a la escena muerte y llevamos el objeto score 
        }
    })

    // con la funcion camPos() la camara sigue al personaje

    player.collides('pipe', () => {
        keyPress('down', () => {
            go('game', {
                level: (level + 1) % maps.length, //cualquier nivel que este paso al siguiente +1
                score: scoreLabel.value
            })
        })
    })


    // ponemos -120 o -move_speed porque nos movemos hacia la izquierda, resta al eje x

    keyDown('left', () => {
        player.move(-playerMoveSpeed, 0)
    })
    keyDown('right', () => {
        player.move(playerMoveSpeed, 0)
    
    })

    player.action(() => {
        if (player.grounded()) {
            isJumping = false
        }
    })
    // usamos el condicional porque si el personaje esta en la tierra, solo pueda saltar. porque usamos la funcion body para que el 
    //personaje tenga peso y gravedad. se queda en brick porque es solido. solid()
    keyPress('space', () => {
        if (player.grounded()) {
            isJumping = true
            player.jump(currentJumpForce)
        }
    })
});

scene('lose', ({ score }) => {
    add([text('Game Over ' + score, 32), origin('center'), pos(width() / 2, height() / 2)])
})
start('game', { level: 0, score: 0 });