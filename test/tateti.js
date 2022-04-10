const chai = require("chai");
const chaiHttp = require("chai-http");
const res = require("express/lib/response");
const server = require("../app");
const should = chai.should();

chai.use(chaiHttp);

// - Cuando se inicia un juego nuevo le toca al primer jugador y el tablero esta vacio.
// - Cuando el primer jugador hace su movimiento le toca al otro jugador y la casilla 
// elegida por el primer jugardor esta ocupada.
// - Cuando el segundo jugador hace su movimiento le toca de nuevo al primer jugador y 
// las dos casillas elegidar por el primer y segundo jugador estan ocupadas con 
// marcas diferentes
// - Cuando un jugador marca tres casillas de la misma fila entonces gana
// - Cuando un jugador marca tres casillas de la misma columna entonces gana
// - Cuando un jugador marca tres casillas de las diagonales entonces gana
// - Si un jugador mueve cuando no es su turno entonces se devuelve un error y el tablero
// no cambia.
// - Cuando no quedan casillas vacias y no hay un ganador entonces hay un empate.

describe("Juego de TaTeTi", () => {
    let juego = {
        jugadores: ['Juan', 'Pedro']
    }
    // ['o', 'o', ' '],
    // ['x', 'x', 'x'],
    // [' ', ' ', ' '],
    let movimientosGanadorFila = [
        { jugador: 'Juan', columna: 0, fila: 1 },
        { jugador: 'Pedro', columna: 0, fila: 0 },
        { jugador: 'Juan', columna: 1, fila: 1 },
        { jugador: 'Pedro', columna: 1, fila: 0 },
        { jugador: 'Juan', columna: 2, fila: 1 },
    ]
    // ['x', 'o', ' '],
    // ['x', 'o', ' '],
    // ['x', ' ', ' '],
    let movimientosGanadorColumna = [
        { jugador: 'Juan', columna: 0, fila: 0 },
        { jugador: 'Pedro', columna: 1, fila: 0 },
        { jugador: 'Juan', columna: 0, fila: 1 },
        { jugador: 'Pedro', columna: 1, fila: 1 },
        { jugador: 'Juan', columna: 0, fila: 2 },
    ]
    // [' ', 'o', 'x'],
    // ['o', 'x', ' '],
    // ['x', ' ', ' '],
    let movimientosGanadorDiagonal = [
        { jugador: 'Juan', columna: 0, fila: 2 },
        { jugador: 'Pedro', columna: 0, fila: 1 },
        { jugador: 'Juan', columna: 1, fila: 1 },
        { jugador: 'Pedro', columna: 1, fila: 0 },
        { jugador: 'Juan', columna: 2, fila: 0 },
    ]
    // ['x', 'o', 'x'],
    // ['o', 'x', 'o'],
    // ['o', 'x', 'o'],
    let movimientosEmpate = [
        { jugador: 'Juan', columna: 0, fila: 0 },
        { jugador: 'Pedro', columna: 1, fila: 0 },
        { jugador: 'Juan', columna: 2, fila: 0 },

        { jugador: 'Pedro', columna: 1, fila: 1 },
        { jugador: 'Juan', columna: 0, fila: 1 },
        { jugador: 'Pedro', columna: 2, fila: 1 },

        { jugador: 'Juan', columna: 0, fila: 2 },
        { jugador: 'Pedro', columna: 1, fila: 2 },
        { jugador: 'Juan', columna: 2, fila: 2 },
    ]
    describe("Se empieza un juego nuevo", () => {
        it("Todos los casilleros estan vacios y le toca mover al primer jugador", (done) => {
            chai.request(server)
                .put("/empezar")
                .send(juego)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.to.be.json;
                    res.body.should.be.a('object');
                    // Le toca mover al primer jugador
                    res.body.should.have.property('turno').eql('Juan');
                    // Todos los casilleros estan vacios
                    res.body.should.have.property('tablero').eql([
                        [' ', ' ', ' '],
                        [' ', ' ', ' '],
                        [' ', ' ', ' '],
                    ]);
                    done();
                })
        });
    });
    describe("El primer jugador hace su primer movimiento", () => {
        it("El casillero queda ocupado y le toca al otro jugador", (done) => {
            chai.request(server).put("/empezar").send(juego).end();
            chai.request(server)
                .put("/movimiento")
                .send(movimientosGanadorColumna[0])
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.to.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('turno').eql('Pedro');
                    res.body.should.have.property('tablero').eql([
                        ['x', ' ', ' '],
                        [' ', ' ', ' '],
                        [' ', ' ', ' '],
                    ]);
                    done()
                })
        });
    });
    describe("El segundo jugador hace su primer movimiento", () => {
        it("El casillero queda ocupado y le toca al otro jugador", (done) => {
            chai.request(server).put("/empezar").send(juego).end();
            chai.request(server).put("/movimiento").send(movimientosGanadorColumna[0]).end();
            chai.request(server)
                .put("/movimiento")
                .send(movimientosGanadorColumna[1])
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.to.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('turno').eql('Juan');
                    res.body.should.have.property('tablero').eql([
                        ['x', 'o', ' '],
                        [' ', ' ', ' '],
                        [' ', ' ', ' '],
                    ]);
                    done()
                });
        });
    });
    describe("Movimientos prohibidos", () => {
        it("Jugador intenta ocupar un casillero ocupado ", (done) => {
            chai.request(server).put("/empezar").send(juego).end();
            chai.request(server).put("/movimiento").send(movimientosGanadorColumna[0]).end();
            chai.request(server)
                .put("/movimiento")
                .send({ jugador: 'Pedro', columna: 0, fila: 0 })
                .end((err, res) => {
                    res.should.have.status(403);
                    res.should.to.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('error').eql('Casillero Ocupado');
                    res.body.should.have.property('turno').eql('Pedro');
                    res.body.should.have.property('tablero').eql([
                        ['x', ' ', ' '],
                        [' ', ' ', ' '],
                        [' ', ' ', ' '],
                    ]);
                    done()
                });
        });

        it("Jugador intenta ocupar un casillero fuera del tablero ", (done) => {
            chai.request(server).put("/empezar").send(juego).end();
            chai.request(server).put("/movimiento").send(movimientosGanadorColumna[0]).end();
            chai.request(server)
                .put("/movimiento")
                .send({ jugador: 'Pedro', columna: 3, fila: 3 })
                .end((err, res) => {
                    res.should.have.status(403);
                    res.should.to.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('error').eql('Casillero incorrecto');
                    res.body.should.have.property('turno').eql('Pedro');
                    res.body.should.have.property('tablero').eql([
                        ['x', ' ', ' '],
                        [' ', ' ', ' '],
                        [' ', ' ', ' '],
                    ]);
                    done()
                });
        });


        it("Jugador intenta ocupar un casillero cuando no es su turno ", (done) => {
            chai.request(server).put("/empezar").send(juego).end();
            chai.request(server).put("/movimiento").send(movimientosGanadorColumna[0]).end();
            chai.request(server).put("/movimiento").send(movimientosGanadorColumna[0]).end((err, res) => {
                res.should.have.status(403);
                res.should.to.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('turno').eql('Pedro');
                res.body.should.have.property('error').eql('Turno incorrecto');
                res.body.should.have.property('tablero').eql([
                    ['x', ' ', ' '],
                    [' ', ' ', ' '],
                    [' ', ' ', ' '],
                ]);
                done()
            });
        });
    });
    describe("Juego terminado", () => {
        it("Cuando un jugador tiene una columna completa", (done) => {
            chai.request(server).put("/empezar").send(juego).end();
            let index = 0
            for (; index < movimientosGanadorColumna.length - 1; index++) {
                chai.request(server).put("/movimiento").send(movimientosGanadorColumna[index]).end();

            }
            chai.request(server).put("/movimiento").send(movimientosGanadorColumna[index]).end((err, res) => {
                res.should.have.status(200);
                res.should.to.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('turno').eql('Pedro');
                res.body.should.have.property('estado').eql('Terminado');
                res.body.should.have.property('ganador').eql('Juan');
                res.body.should.have.property('tablero').eql([
                    ['x', 'o', ' '],
                    ['x', 'o', ' '],
                    ['x', ' ', ' '],
                ]);
                done()
            })

        });
        it("Cuando un jugador tiene una fila completa", (done) => {
            chai.request(server).put("/empezar").send(juego).end();
            let index = 0
            for (; index < movimientosGanadorFila.length - 1; index++) {
                chai.request(server).put("/movimiento").send(movimientosGanadorFila[index]).end();

            }
            chai.request(server).put("/movimiento").send(movimientosGanadorFila[index]).end((err, res) => {
                res.should.have.status(200);
                res.should.to.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('turno').eql('Pedro');
                res.body.should.have.property('estado').eql('Terminado');
                res.body.should.have.property('ganador').eql('Juan');
                res.body.should.have.property('tablero').eql([
                    ['o', 'o', ' '],
                    ['x', 'x', 'x'],
                    [' ', ' ', ' '],
                ]);
                done()
            })
        });
        it("Cuando un jugador tiene una diagonal completa", (done) => {
            chai.request(server).put("/empezar").send(juego).end();
            let index = 0
            for (; index < movimientosGanadorDiagonal.length - 1; index++) {
                chai.request(server).put("/movimiento").send(movimientosGanadorDiagonal[index]).end();

            }
            chai.request(server).put("/movimiento").send(movimientosGanadorDiagonal[index]).end((err, res) => {
                res.should.have.status(200);
                res.should.to.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('turno').eql('Pedro');
                res.body.should.have.property('estado').eql('Terminado');
                res.body.should.have.property('ganador').eql('Juan');
                res.body.should.have.property('tablero').eql([
                    [' ', 'o', 'x'],
                    ['o', 'x', ' '],
                    ['x', ' ', ' '],
                ]);
                done()
            })
        });
    });
});
